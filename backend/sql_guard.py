"""Phase 1 — guard for dynamically built SQL (audit finding P2-12).

Several endpoints build `UPDATE ... SET <columns> WHERE id=?` with an f-string
while the values stay parameterised. Today every column list happens to come
from an explicit Python list, but the pattern breaks the moment someone passes
a request field through. `safe_update_columns` makes the allowlist mandatory
and testable.
"""
from __future__ import annotations

from typing import Iterable, List


class UnsafeSqlColumn(ValueError):
    """Raised when a column name is not part of the caller's allowlist."""


def safe_update_columns(columns: Iterable[str], allowed: Iterable[str]) -> str:
    """Return 'col1=?, col2=?' after checking every column against ``allowed``."""
    allowed_set = set(allowed)
    checked: List[str] = []
    for column in columns:
        if not isinstance(column, str) or column not in allowed_set:
            raise UnsafeSqlColumn(f"column not allowed: {column!r}")
        if column in checked:
            raise UnsafeSqlColumn(f"duplicate column: {column!r}")
        checked.append(column)
    if not checked:
        raise UnsafeSqlColumn("no columns to update")
    return ", ".join(f"{column}=?" for column in checked)


def safe_column(column: str, allowed: Iterable[str]) -> str:
    """Validate a single identifier (for statements that reuse the column)."""
    if not isinstance(column, str) or column not in set(allowed):
        raise UnsafeSqlColumn(f"column not allowed: {column!r}")
    return column
