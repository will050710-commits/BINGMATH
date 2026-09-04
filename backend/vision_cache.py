"""
vision_cache.py
=================
Risk 5 mitigation (caching half): a small, dependency-light cache for the
expensive step in the pipeline — the OpenRouter/Gemini vision extraction
call. A cache hit skips the network call entirely, which is the single
biggest lever against any free tier's daily/per-minute request cap.

Design choices, on purpose:
    - Plain stdlib `sqlite3` in its own small file (vision_cache.db),
      mirroring the exact connection pattern main.py already uses for
      duomath.db (`_make_conn`-style: WAL mode, row_factory=Row) — but a
      SEPARATE file, so this cache never competes for locks with the main
      app database or needs a schema migration there.
    - Perceptual hashing is a ~15-line difference hash (dHash) implemented
      here with Pillow only, instead of adding the `imagehash` package —
      one less dependency for the same result. Swap in `imagehash.dhash`
      later if preferred; the hex-string interface is the same idea.
    - Two-tier lookup: exact SHA-256 (of the STANDARDIZED image bytes from
      image_preprocessing.py) is checked first — O(1), always correct.
      Perceptual near-duplicate lookup is a fallback for "the same diagram,
      re-photographed/re-cropped/re-compressed" and is O(n) over the cache
      table, which is fine at the scale a single free-tier deployment
      actually sees; note the scaling caveat in `find_near_duplicate`.
"""

import os
import sqlite3
import time
from typing import Optional, Dict, Any
from io import BytesIO

from PIL import Image

CACHE_DB_PATH = os.environ.get("VISION_CACHE_DB_PATH", os.path.join(os.path.dirname(__file__), "vision_cache.db"))
DEFAULT_PHASH_MAX_DISTANCE = 6   # out of 64 bits; ~90%+ visually-similar images land within this
DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 days — geometry diagrams don't go stale


def _make_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(CACHE_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn


def init_cache_db() -> None:
    conn = _make_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS vision_cache (
            sha256       TEXT PRIMARY KEY,
            phash        TEXT NOT NULL,
            vision_text  TEXT NOT NULL,
            widget_hint  TEXT,
            model_used   TEXT,
            created_at   REAL NOT NULL,
            hit_count    INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_vision_cache_phash ON vision_cache(phash);
    """)
    conn.commit()
    conn.close()


# ── perceptual hashing (dHash — Pillow only, no `imagehash` dependency) ──────

def compute_phash(image_b64_or_bytes) -> str:
    """
    9x8 grayscale difference hash -> 64-bit hex string. Robust to resizing,
    mild recompression and small crops; NOT meant to be robust to rotation
    or heavy cropping (a re-photographed page usually isn't rotated more
    than a few degrees after image_preprocessing's EXIF normalization).
    """
    import base64
    data = image_b64_or_bytes
    if isinstance(data, str):
        if data.startswith("data:"):
            data = data.split(",", 1)[1]
        data = base64.b64decode(data)
    img = Image.open(BytesIO(data)).convert("L").resize((9, 8), Image.LANCZOS)
    pixels = list(img.getdata())
    bits = []
    for row in range(8):
        row_pixels = pixels[row * 9:(row + 1) * 9]
        for col in range(8):
            bits.append("1" if row_pixels[col] > row_pixels[col + 1] else "0")
    return f"{int(''.join(bits), 2):016x}"


def hamming_distance(hash_a: str, hash_b: str) -> int:
    return bin(int(hash_a, 16) ^ int(hash_b, 16)).count("1")


# ── cache read/write ──────────────────────────────────────────────────────────

def get_exact(sha256: str) -> Optional[Dict[str, Any]]:
    conn = _make_conn()
    try:
        row = conn.execute("SELECT * FROM vision_cache WHERE sha256 = ?", (sha256,)).fetchone()
        if row is None:
            return None
        conn.execute("UPDATE vision_cache SET hit_count = hit_count + 1 WHERE sha256 = ?", (sha256,))
        conn.commit()
        return dict(row)
    finally:
        conn.close()


def find_near_duplicate(phash: str, max_distance: int = DEFAULT_PHASH_MAX_DISTANCE) -> Optional[Dict[str, Any]]:
    """
    Scans the cache table for a perceptually-similar entry. O(n) in cache
    size — fine for a single-deployment free-tier cache (thousands of
    entries); if this table ever grows past ~50k rows, bucket by the first
    N hex chars of `phash` and index on that instead of a full scan.
    """
    conn = _make_conn()
    try:
        rows = conn.execute("SELECT * FROM vision_cache").fetchall()
    finally:
        conn.close()
    best, best_dist = None, max_distance + 1
    for row in rows:
        d = hamming_distance(phash, row["phash"])
        if d < best_dist:
            best, best_dist = row, d
    if best is not None and best_dist <= max_distance:
        result = dict(best)
        result["phash_distance"] = best_dist
        return result
    return None


def get_cached(sha256: str, phash: Optional[str] = None,
               phash_max_distance: int = DEFAULT_PHASH_MAX_DISTANCE,
               ttl_seconds: int = DEFAULT_TTL_SECONDS) -> Optional[Dict[str, Any]]:
    """Exact hash first, then perceptual near-duplicate. Respects a TTL so a
    widget schema change doesn't get stuck serving pre-migration text forever."""
    hit = get_exact(sha256)
    if hit is None and phash:
        hit = find_near_duplicate(phash, phash_max_distance)
    if hit is None:
        return None
    if time.time() - hit["created_at"] > ttl_seconds:
        return None
    return hit


def set_cached(sha256: str, phash: str, vision_text: str,
               widget_hint: Optional[str] = None, model_used: Optional[str] = None) -> None:
    conn = _make_conn()
    try:
        conn.execute(
            """INSERT INTO vision_cache (sha256, phash, vision_text, widget_hint, model_used, created_at, hit_count)
               VALUES (?, ?, ?, ?, ?, ?, 0)
               ON CONFLICT(sha256) DO UPDATE SET
                 vision_text=excluded.vision_text, widget_hint=excluded.widget_hint,
                 model_used=excluded.model_used, created_at=excluded.created_at""",
            (sha256, phash, vision_text, widget_hint, model_used, time.time()),
        )
        conn.commit()
    finally:
        conn.close()


init_cache_db()
