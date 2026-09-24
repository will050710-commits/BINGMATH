"""Phase 0 security hardening — API rate limiting (slowapi).

Keeps the limiter (and the per-endpoint budgets) in one place so the numbers
can be tuned without hunting through main.py. Keys on the real client IP,
which requires uvicorn to run with ``--proxy-headers`` behind Render.
"""
from __future__ import annotations

from fastapi import Request
from slowapi import Limiter


def client_key(request: Request) -> str:
    """Real client IP (Render terminates TLS, so trust the first XFF hop)."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=client_key, storage_uri="memory://")

# ── Per-endpoint budgets (Phase 0) ──────────────────────────────────────────
CHAT_LIMIT = "12/minute"          # anonymous-friendly DuoMCB chat
SESSION_LIMIT = "30/minute"       # session create/reset/history
TRANSLATE_LIMIT = "20/minute"     # DuoTranslate
ANALYZE_LIMIT = "5/minute"        # AI Test Studio: document analysis
GRADING_LIMIT = "30/minute"       # AI Test Studio: start/submit/review
GEOMETRY_LIMIT = "10/minute"      # geometry extraction endpoints
PARSE_FILE_LIMIT = "10/minute"    # mathmap file parsing
VIDEO_LIMIT = "3/hour"            # heavy matplotlib/ffmpeg render jobs
ENHANCE_LIMIT = "2/hour"          # video enhancement pipeline
TYPESAFE_LIMIT = "20/minute"      # TypeSafe validation calls

# ── Payload caps (characters of raw request body) ───────────────────────────
MAX_CHAT_MESSAGE_CHARS = 4000
MAX_IMAGE_B64_CHARS = 7_000_000      # ~5 MB binary
MAX_DOCUMENT_B64_CHARS = 11_000_000  # ~8 MB binary
MAX_INSTRUCTIONS = 200
