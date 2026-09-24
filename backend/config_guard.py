"""Phase 0 security hardening — fail-closed configuration guards.

Centralises the checks that force the backend to refuse to boot with an
insecure configuration (weak/missing JWT secret, ...). Kept in a tiny
dependency-free module so it can be unit-tested without importing the full
FastAPI app or touching the SQLite database.

Contract:
  * Production (Render) → raise RuntimeError when a secret is missing/short.
  * Local dev          → generate an EPHEMERAL random secret (never a
                         hard-coded fallback string) and report a warning.
"""
from __future__ import annotations

import os
import secrets
from typing import Optional, Tuple

MIN_SECRET_LEN = 32


def is_production() -> bool:
    """True when running on Render (Render injects RENDER=true)."""
    return bool(
        os.environ.get("RENDER")
        or os.environ.get("RENDER_SERVICE_ID")
        or os.environ.get("DUOMATH_ENV", "").lower() == "production"
    )


def require_secret(
    name: str,
    min_len: int = MIN_SECRET_LEN,
    *,
    dev_generate: bool = True,
) -> Tuple[str, Optional[str]]:
    """Return ``(value, warning)`` for the secret ``name``.

    Raises RuntimeError in production when the value is missing or weaker than
    ``min_len`` characters. In local development a random ephemeral value is
    generated instead (so no insecure default ever ships in the source code).
    """
    value = (os.environ.get(name) or "").strip()
    if len(value) >= min_len:
        return value, None

    if is_production():
        raise RuntimeError(
            f"FATAL: {name} must be set to a strong value (>= {min_len} chars) "
            "via the environment. Refusing to start in production."
        )
    if not dev_generate:
        raise RuntimeError(
            f"FATAL: {name} is not configured (>= {min_len} chars required)."
        )

    generated = secrets.token_urlsafe(48)
    warning = (
        f"{name} is not set — generated an ephemeral development secret. "
        "Backend-JWT sessions will reset on restart; put it in backend/.env."
    )
    return generated, warning


def env_list(name: str, default: str = "") -> list:
    """Parse a comma-separated environment variable into a clean list."""
    raw = os.environ.get(name, default) or ""
    return [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]
