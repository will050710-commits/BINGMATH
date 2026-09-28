// frontend/src/lib/imageDownscale.js
//
// Đợt 4H-2 — shrink the photo BEFORE it goes over the wire.
//
// The production incident (2026-09-28) was a POST /api/chat from the Vercel
// origin that never produced a response: the pipeline's silent window (image
// decode + CLAHE + 1-2 vision readers + a text model + a critic) outlived the
// platform proxy. The single biggest, cheapest lever on that window is the
// payload itself — a 4-5 MB phone photo of a page is ~16x smaller as a 1600 px
// JPEG at q85, which is still more resolution than any of the vision models
// consume, and it keeps us under backend/security_limits.py's
// MAX_IMAGE_B64_CHARS = 7,000,000 (the cap that answers HTTP 413).
//
// Deliberately DOM-only inside functions and free of top-level side effects, so
// scripts/check-image-downscale.mjs can import it under plain node.
"use client";

/** Mirror of backend/security_limits.py::MAX_IMAGE_B64_CHARS (~5 MB binary). */
export const MAX_IMAGE_B64_CHARS = 7_000_000;
/** Longest edge after downscale: plenty for a page of maths, small on the wire. */
export const MAX_IMAGE_EDGE = 1600;
/** JPEG quality — high enough that digits and subscripts stay legible. */
export const JPEG_QUALITY = 0.85;
/** Below this we keep the original bytes: re-encoding a small image only loses. */
export const SKIP_DOWNSCALE_BYTES = 400 * 1024;

export const TOO_LARGE_MESSAGE =
  "📷 Ảnh này vẫn quá lớn để gửi (giới hạn ~5 MB sau khi nén). " +
  "Em thử chụp gần hơn, cắt bớt phần thừa, hoặc gõ lại đề bằng chữ nhé.";

/** Longest edge clamped to `maxEdge`, aspect ratio preserved, never upscaled. */
export function targetSize(width, height, maxEdge = MAX_IMAGE_EDGE) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (w <= 0 || h <= 0) return { width: 0, height: 0 };
  const edge = Math.max(w, h);
  if (edge <= maxEdge) return { width: Math.round(w), height: Math.round(h) };
  const scale = maxEdge / edge;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/** Characters of the base64 payload alone (a `data:` prefix is not payload). */
export function base64PayloadChars(value) {
  const text = String(value || "");
  const comma = text.indexOf(",");
  const isDataUrl = /^data:/i.test(text);
  return (isDataUrl && comma > -1 ? text.slice(comma + 1) : text).length;
}

/** Approximate decoded size of `chars` base64 characters. */
export function base64Bytes(chars) {
  return Math.floor((Number(chars) || 0) * 3 / 4);
}

export function formatBytes(bytes) {
  const n = Math.max(0, Number(bytes) || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Vietnamese one-liner for the UI, empty when nothing was saved. */
export function describeCompression(originalBytes, newBytes) {
  const before = Number(originalBytes) || 0;
  const after = Number(newBytes) || 0;
  if (!before || !after || after >= before) return "";
  return `Đã nén ảnh ${formatBytes(before)} → ${formatBytes(after)} để gửi nhanh hơn`;
}

// ── DOM plumbing (browser only) ──────────────────────────────────────────────

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(String((ev.target && ev.target.result) || ""));
    reader.onerror = () => reject(reader.error || new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

// Loaded from the data URL we already read: no blob: URL, so the app's CSP
// (`img-src 'self' data: blob: https:`) is satisfied exactly as the existing
// preview is.
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined" || typeof Image === "undefined") {
      reject(new Error("no-dom"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-decode-failed"));
    img.src = dataUrl;
  });
}

function finish(dataUrl, meta) {
  const chars = base64PayloadChars(dataUrl);
  const bytes = base64Bytes(chars);
  const tooLarge = chars > (meta.limit || MAX_IMAGE_B64_CHARS);
  return {
    ok: !tooLarge,
    reason: meta.reason,
    dataUrl,
    payloadChars: chars,
    bytes,
    originalBytes: Number(meta.originalBytes) || 0,
    width: meta.width || 0,
    height: meta.height || 0,
    downscaled: !!meta.downscaled,
    label: describeCompression(meta.originalBytes, bytes),
    message: tooLarge ? TOO_LARGE_MESSAGE : "",
  };
}

/**
 * Prepare a picked/dropped/pasted image for POST /api/chat.
 *
 * Returns { ok, dataUrl, bytes, originalBytes, downscaled, reason, label, message }.
 * Never throws and never loses the image for a cosmetic reason: every failure
 * path (no canvas, undecodable file, encoder produced something bigger) falls
 * back to the original bytes, and only an image that is over the server's cap
 * even after downscaling comes back with ok:false.
 */
export async function prepareImageForUpload(file, options = {}) {
  const {
    maxEdge = MAX_IMAGE_EDGE,
    quality = JPEG_QUALITY,
    limit = MAX_IMAGE_B64_CHARS,
    skipBelowBytes = SKIP_DOWNSCALE_BYTES,
  } = options;

  if (!file) return finish("", { reason: "empty", limit });

  const originalBytes = Number(file.size) || 0;
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  // Vector graphics and animation must not go through a canvas: rasterising an
  // SVG can blur it, and a GIF would lose every frame but the first.
  const keepAsIs = type.includes("svg") || type === "image/gif" || /\.(svg|gif)$/.test(name);

  let dataUrl;
  try {
    dataUrl = await readAsDataUrl(file);
  } catch (err) {
    return finish("", { reason: "read-failed", limit, originalBytes });
  }
  if (!dataUrl) return finish("", { reason: "empty", limit, originalBytes });
  if (keepAsIs) return finish(dataUrl, { reason: "vector_or_animated", limit, originalBytes });

  const fits = base64PayloadChars(dataUrl) <= limit;
  if (fits && originalBytes && originalBytes <= skipBelowBytes) {
    return finish(dataUrl, { reason: "small_enough", limit, originalBytes });
  }

  let img = null;
  try {
    img = await loadImage(dataUrl);
    const naturalW = img.naturalWidth || img.width || 0;
    const naturalH = img.naturalHeight || img.height || 0;
    const { width, height } = targetSize(naturalW, naturalH, maxEdge);
    if (!width || !height) return finish(dataUrl, { reason: "unknown_size", limit, originalBytes });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return finish(dataUrl, { reason: "no-canvas", limit, originalBytes });
    // JPEG has no alpha channel: without this, transparency turns black and the
    // vision readers see a black page.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const output = canvas.toDataURL("image/jpeg", quality);
    if (!output || output.length < 64) {
      return finish(dataUrl, { reason: "encode-failed", limit, originalBytes });
    }
    // A re-encode that does not actually help is discarded, so we never send
    // something bigger (or worse) than the file the student picked.
    if (output.length >= dataUrl.length && fits) {
      return finish(dataUrl, { reason: "no-gain", limit, originalBytes });
    }
    return finish(output, {
      reason: width === naturalW && height === naturalH ? "recompressed" : "resized",
      limit,
      originalBytes,
      width,
      height,
      downscaled: true,
    });
  } catch (err) {
    return finish(dataUrl, { reason: "decode-failed", limit, originalBytes });
  } finally {
    if (img && typeof img.close === "function") img.close();
  }
}
