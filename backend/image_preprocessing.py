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

from PIL import Image, ImageOps

TARGET_SIZE = 1024          # standard square canvas fed to every downstream consumer
PAD_COLOR = (255, 255, 255)  # neutral fill — won't be mistaken for drawn geometry
JPEG_QUALITY = 90


def _decode_b64(raw_b64: str) -> bytes:
    # Tolerate a stray data URL prefix if one slipped through.
    if raw_b64.startswith("data:"):
        raw_b64 = raw_b64.split(",", 1)[1]
    return base64.b64decode(raw_b64)


def preprocess_image_b64(
    raw_b64: str,
    target_size: int = TARGET_SIZE,
) -> Tuple[str, Dict[str, Any]]:
    """
    Decode -> EXIF-correct orientation -> uniform-scale resize -> letterbox
    pad to `target_size` x `target_size` -> re-encode as JPEG base64.

    Returns (new_b64, meta) where meta carries everything needed to map a
    coordinate detected on the padded image back to the original image, or
    forward from original-image coordinates onto the padded canvas:
        {
          "target_size": 1024,
          "orig_width": ..., "orig_height": ...,
          "scale": ...,            # uniform scale factor applied
          "pad_x": ..., "pad_y": ...,  # top-left offset of the pasted image
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
