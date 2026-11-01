"""
backend/db/__init__.py
======================
Database access package for DuoMath.
"""
from .connection import (
    DEFAULT_DB_PATH,
    db_session,
    get_db_path,
    make_conn,
    override_db_path,
    set_db_path_override,
)
from .schema import (
    CLASSROOM_DDL,
    CLASSROOM_SCHEMA_SQL,
    ensure_role_and_classroom_schema,
    normalize_user_role,
)

__all__ = [
    "DEFAULT_DB_PATH",
    "CLASSROOM_DDL",
    "CLASSROOM_SCHEMA_SQL",
    "db_session",
    "ensure_role_and_classroom_schema",
    "get_db_path",
    "make_conn",
    "normalize_user_role",
    "override_db_path",
    "set_db_path_override",
]
