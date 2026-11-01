"""
backend/db/schema.py
====================
Phase 1 (WP-1.1): Modular schema migrations & user role normalization.
Prepares the database for Admin->Teacher role appointment and Classroom management (WP-A1).
"""
from __future__ import annotations

import sqlite3
from typing import Any, Dict

CLASSROOM_DDL = """
CREATE TABLE IF NOT EXISTS classrooms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id  INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    grade       TEXT    DEFAULT '',
    description TEXT    DEFAULT '',
    invite_code TEXT    UNIQUE NOT NULL,
    archived    INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS classroom_members (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    student_id   INTEGER NOT NULL,
    status       TEXT    DEFAULT 'active',
    invited_by   INTEGER,
    joined_at    TEXT    DEFAULT (datetime('now')),
    UNIQUE(classroom_id, student_id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id)   REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_assignments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id    INTEGER NOT NULL,
    teacher_id      INTEGER NOT NULL,
    title           TEXT    NOT NULL,
    instructions    TEXT    DEFAULT '',
    source_type     TEXT    NOT NULL DEFAULT 'custom_quiz',
    source_ref      TEXT    NOT NULL DEFAULT '{}',
    due_at          TEXT,
    time_limit_min  INTEGER DEFAULT 45,
    max_attempts    INTEGER DEFAULT 1,
    allow_ai_hint   INTEGER DEFAULT 1,
    created_at      TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id   INTEGER NOT NULL,
    student_id      INTEGER NOT NULL,
    attempt_no      INTEGER DEFAULT 1,
    score           REAL    NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    answers_json    TEXT    DEFAULT '{}',
    wrong_topics    TEXT    DEFAULT '[]',
    duration_sec    INTEGER DEFAULT 0,
    submitted_at    TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (assignment_id) REFERENCES class_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id, archived);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student ON classroom_members(student_id, status);
CREATE INDEX IF NOT EXISTS idx_class_assignments_class ON class_assignments(classroom_id, due_at);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_lookup ON assignment_submissions(assignment_id, student_id);
"""

CLASSROOM_SCHEMA_SQL = CLASSROOM_DDL

ROLE_MIGRATIONS = (
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'",
    "ALTER TABLE users ADD COLUMN is_teacher INTEGER DEFAULT 0",
)


def ensure_role_and_classroom_schema(conn: sqlite3.Connection) -> None:
    """Idempotently migrate users role columns and classroom tables."""
    for sql in ROLE_MIGRATIONS:
        try:
            conn.execute(sql)
            conn.commit()
        except Exception:
            pass
    conn.executescript(CLASSROOM_DDL)
    # Keep role column consistent with existing is_admin / is_teacher flags
    try:
        conn.execute(
            "UPDATE users SET role='admin', is_teacher=1 WHERE COALESCE(is_admin, 0)=1"
        )
        conn.execute(
            "UPDATE users SET role='teacher' WHERE COALESCE(is_admin, 0)=0 AND COALESCE(is_teacher, 0)=1 AND COALESCE(role, 'student')='student'"
        )
        conn.commit()
    except Exception:
        pass


def normalize_user_role(row: Any) -> Dict[str, Any]:
    """Extract normalized role ('student' | 'teacher' | 'admin'), is_admin, and is_teacher from a user row."""
    keys = row.keys() if hasattr(row, "keys") else (row.keys() if isinstance(row, dict) else [])
    is_admin = int(row["is_admin"]) if "is_admin" in keys and row["is_admin"] is not None else 0
    is_teacher = int(row["is_teacher"]) if "is_teacher" in keys and row["is_teacher"] is not None else 0
    raw_role = str(row["role"] or "").strip().lower() if "role" in keys and row["role"] else ""
    if is_admin == 1 or raw_role == "admin":
        role = "admin"
        is_admin = 1
        is_teacher = 1
    elif is_teacher == 1 or raw_role == "teacher":
        role = "teacher"
        is_teacher = 1
    else:
        role = "student"
    return {
        "role": role,
        "is_admin": is_admin,
        "is_teacher": is_teacher,
    }
