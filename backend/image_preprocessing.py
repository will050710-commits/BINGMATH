"""
image_preprocessing.py
========================
Risk 3 mitigation: aspect-preserving resize + letterbox padding, applied
before ANY image bytes reach OCR, the OpenRouter vision agent, or Gemini's
inlineData. Pillow only (already a transitive dep via easyocr; now explicit
in requirements.txt) — zero paid services, zero network calls.

Why this matters specifically for geometry: a plain `.resize((W, H))` to a
fixed target stretches non-uniformly whenever the source aspect ratio isn't
already square, which silently turns circles into ellipses and skews every
angle in the diagram. That corruption happens BEFORE the vision model ever
sees the image, so no amount of downstream snapping (geometry_snapping.py)
can fully undo it. Fix: scale uniformly, pad the leftover space.
"""

import io
import base64
import hashlib
from typing import Tuple, Dict, Any

try:
    from PIL import Image, ImageOps, ImageDraw
    _PIL_AVAILABLE = True
except ImportError:
    _PIL_AVAILABLE = False

TARGET_SIZE = 1024          # standard square canvas fed to every downstream consumer
PAD_COLOR = (255, 255, 255)  # neutral fill — won't be mistaken for drawn geometry
JPEG_QUALITY = 90
GRID_MAJOR_STEP = 100        # px between labeled gridlines
GRID_MINOR_STEP = 20         # px between unlabeled gridlines
GRID_COLOR = (255, 0, 180)   # high-contrast magenta — unlikely to match diagram ink
GRID_ALPHA_MINOR = 60        # 0-255, kept low so it never occludes the geometry
GRID_ALPHA_MAJOR = 130


def _decode_b64(raw_b64: str) -> bytes:
    # Tolerate a stray data URL prefix if one slipped through.
    if raw_b64.startswith("data:"):
        raw_b64 = raw_b64.split(",", 1)[1]
    return base64.b64decode(raw_b64)


def draw_coordinate_grid(
    img: Image.Image,
    major_step: int = GRID_MAJOR_STEP,
    minor_step: int = GRID_MINOR_STEP,
) -> Image.Image:
    """
    Overlay a labeled pixel-coordinate grid on an already-padded square
    image. Drawn on a separate RGBA layer and alpha-composited so the
    diagram underneath is never fully occluded, then flattened back to RGB.
    Origin (0,0) is top-left, matching both PIL's own pixel order and the
    0-1000 normalized coordinate convention Qwen-VL grounds against — so a
    coordinate read off the grid needs no axis flip before comparing it to
    what the vision model reports.
    """
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    minor_rgba = (*GRID_COLOR, GRID_ALPHA_MINOR)
    major_rgba = (*GRID_COLOR, GRID_ALPHA_MAJOR)

    for x in range(0, w + 1, minor_step):
        draw.line([(x, 0), (x, h)], fill=minor_rgba, width=1)
    for y in range(0, h + 1, minor_step):
        draw.line([(0, y), (w, y)], fill=minor_rgba, width=1)
    for x in range(0, w + 1, major_step):
        draw.line([(x, 0), (x, h)], fill=major_rgba, width=1)
        draw.text((min(x + 2, w - 22), 2), str(x), fill=major_rgba)
    for y in range(0, h + 1, major_step):
        draw.line([(0, y), (w, y)], fill=major_rgba, width=1)
        draw.text((2, min(y + 2, h - 12)), str(y), fill=major_rgba)

    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def preprocess_image_b64(
    raw_b64: str,
    target_size: int = TARGET_SIZE,
    with_grid: bool = False,
) -> Tuple[str, Dict[str, Any]]:
    """
    Decode -> EXIF-correct orientation -> uniform-scale resize -> letterbox
    pad to `target_size` x `target_size` -> optional grid overlay -> re-encode
    as JPEG base64.

    `with_grid=False` by default: the model's own grounding already returns
    normalized coordinates without needing a visible grid, and burning grid
    lines into every image sent to the vision model risks adding visual
    clutter on top of the actual diagram. Pass `with_grid=True` for cases
    where reading exact pixel coordinates off the image matters more than a
    perfectly clean image — e.g. manual debugging, or a model/prompt that
    explicitly asks to read coordinates off an overlaid grid.

    Returns (new_b64, meta) where meta carries everything needed to map a
    coordinate detected on the padded image back to the original image, or
    forward from original-image coordinates onto the padded canvas:
        {
          "target_size": 1024,
          "orig_width": ..., "orig_height": ...,
          "scale": ...,            # uniform scale factor applied
          "pad_x": ..., "pad_y": ...,  # top-left offset of the pasted image
          "grid": True|False,
          "sha256": "...",         # hash of the STANDARDIZED bytes — feed this to vision_cache
        }

    Safe to call more than once on its own output (idempotent: re-encoding an
    already target_size x target_size image is a cheap no-op pass-through).
    Never raises on a decodable image; malformed input propagates the
    original exception so the caller's existing try/except handles it exactly
    as it does today.
    """
    raw_bytes = _decode_b64(raw_b64)
    img = Image.open(io.BytesIO(raw_bytes))
    img = ImageOps.exif_transpose(img)  # normalize phone-camera rotation before measuring aspect ratio
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    orig_w, orig_h = img.size
    scale = min(target_size / orig_w, target_size / orig_h)
    new_w, new_h = max(1, round(orig_w * scale)), max(1, round(orig_h * scale))
    resample = Image.LANCZOS if scale < 1.0 else Image.BICUBIC
    resized = img.resize((new_w, new_h), resample)

    canvas = Image.new("RGB", (target_size, target_size), PAD_COLOR)
    pad_x, pad_y = (target_size - new_w) // 2, (target_size - new_h) // 2
    canvas.paste(resized, (pad_x, pad_y))

    if with_grid:
        canvas = draw_coordinate_grid(canvas)

    buf = io.BytesIO()
    canvas.save(buf, format="JPEG", quality=JPEG_QUALITY)
    out_bytes = buf.getvalue()
    new_b64 = base64.b64encode(out_bytes).decode("ascii")

    meta = {
        "target_size": target_size,
        "orig_width": orig_w,
        "orig_height": orig_h,
        "scale": round(scale, 6),
        "pad_x": pad_x,
        "pad_y": pad_y,
        "grid": with_grid,
        "sha256": hashlib.sha256(out_bytes).hexdigest(),
    }
    return new_b64, meta


def to_padded_coords(orig_xy: Tuple[float, float], meta: Dict[str, Any]) -> Tuple[float, float]:
    """Map an (x, y) in ORIGINAL image pixels onto the padded/standardized canvas."""
    x, y = orig_xy
    return (x * meta["scale"] + meta["pad_x"], y * meta["scale"] + meta["pad_y"])


def from_padded_coords(padded_xy: Tuple[float, float], meta: Dict[str, Any]) -> Tuple[float, float]:
    """Map an (x, y) detected on the padded/standardized canvas back to ORIGINAL image pixels."""
    x, y = padded_xy
    scale = meta["scale"] or 1.0
    return ((x - meta["pad_x"]) / scale, (y - meta["pad_y"]) / scale)


def preprocess_geometry_image(image_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
    """
    Clean a photographed/scanned geometry figure before sending it to Gemini,
    and return a lightweight structural hint Gemini can cross-check itself against.
    (From Section 3 of D:\\duomath-geometry-rendering-plan.md)

    1. Deskew: level the image using the largest contour's minimum-area rectangle.
    2. Normalize contrast / lighting (removes glare and shadows via CLAHE + adaptive threshold).
    3. Structural cross-check: HoughLinesP & HoughCircles estimate line and circle counts.

    Includes graceful fallback to PIL if cv2 is not available or encounters an error.
    """
    hints: Dict[str, Any] = {
        "line_count_estimate": 0,
        "circle_count_estimate": 0,
        "deskew_applied": False,
        "cv_processed": False,
    }

    try:
        import cv2
        import numpy as np

        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("cv2 failed to decode image bytes")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. Deskew: level the image using the largest contour's minimum-area rectangle
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest) > 500:
                angle = cv2.minAreaRect(largest)[-1]
                if angle < -45:
                    angle += 90
                if 0.5 < abs(angle) < 45:
                    h, w = gray.shape
                    rot_matrix = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
                    gray = cv2.warpAffine(gray, rot_matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    blurred = cv2.warpAffine(blurred, rot_matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    edges = cv2.warpAffine(edges, rot_matrix, (w, h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT)
                    hints["deskew_applied"] = True
                    hints["deskew_angle"] = round(float(angle), 2)

        # 2. Normalize contrast / lighting (phone photos: glare, shadows)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)
        clean = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 25, 10
        )

        # 3. Structural cross-check: how many lines/circles does classical CV see?
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=60, minLineLength=40, maxLineGap=8)
        circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=30, param1=100, param2=40)

        hints["line_count_estimate"] = 0 if lines is None else int(len(lines))
        hints["circle_count_estimate"] = 0 if circles is None else int(circles.shape[1])
        hints["cv_processed"] = True

        ok, buf = cv2.imencode(".png", clean)
        if ok:
            return buf.tobytes(), hints
    except Exception:
        pass

    # PIL Fallback
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        gray_pil = ImageOps.autocontrast(pil_img.convert("L"))
        buf = io.BytesIO()
        gray_pil.save(buf, format="PNG")
        return buf.getvalue(), hints
    except Exception:
        return image_bytes, hints

