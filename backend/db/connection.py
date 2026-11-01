"""
backend/db/connection.py
========================
Phase 1 (WP-1.1) & P0 Test Isolation: Centralized SQLite WAL connection factory,
context manager, and explicit DB path override for isolated test suites.
"""
from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from typing import Generator, Optional

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_PATH = os.path.join(BACKEND_DIR, "duomath.db")

_OVERRIDE_DB_PATH: Optional[str] = None


def set_db_path_override(db_path: Optional[str]) -> None:
    """Explicitly override the database path for in-process tests."""
    global _OVERRIDE_DB_PATH
    _OVERRIDE_DB_PATH = db_path


def get_db_path() -> str:
    """Resolve the active SQLite database path, respecting test overrides and env."""
    if _OVERRIDE_DB_PATH:
        return _OVERRIDE_DB_PATH
    return os.environ.get("DUOMATH_DB_PATH") or DEFAULT_DB_PATH


@contextmanager
def override_db_path(db_path: str) -> Generator[str, None, None]:
    """Context manager that isolates all connections (main + routers) to `db_path`."""
    global _OVERRIDE_DB_PATH
    prev_override = _OVERRIDE_DB_PATH
    prev_env = os.environ.get("DUOMATH_DB_PATH")
    _OVERRIDE_DB_PATH = db_path
    os.environ["DUOMATH_DB_PATH"] = db_path
    try:
        yield db_path
    finally:
        _OVERRIDE_DB_PATH = prev_override
        if prev_env is None:
            os.environ.pop("DUOMATH_DB_PATH", None)
        else:
            os.environ["DUOMATH_DB_PATH"] = prev_env


def make_conn(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Create a thread-safe SQLite connection configured with WAL and busy_timeout."""
    target = db_path or get_db_path()
    conn = sqlite3.connect(
        target,
        detect_types=sqlite3.PARSE_DECLTYPES,
        check_same_thread=False,
    )
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA cache_size=-8000")
    conn.execute("PRAGMA temp_store=MEMORY")
    return conn


@contextmanager
def db_session(db_path: Optional[str] = None) -> Generator[sqlite3.Connection, None, None]:
    """Context manager that commits on clean exit, rolls back on error, and guarantees connection closure."""
    conn = make_conn(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    finally:
        conn.close()
