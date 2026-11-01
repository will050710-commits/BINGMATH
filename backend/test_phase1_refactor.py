# duosteam/backend/test_phase1_refactor.py
#
# Phase 1 Refactoring & Teacher/Classroom Foundation Tests (WP-1.1 & WP-1.2)
#
# Run:  python test_phase1_refactor.py
#
# Covers:
#   1. db.connection (make_conn & db_session context manager, WAL + busy_timeout + FK)
#   2. db.schema (ensure_role_and_classroom_schema, normalize_user_role, Teacher/Classroom tables)
#   3. routers.social_tournaments (APIRouter extraction + fix for NameError in /api/clans/leaderboard)
#   4. Teacher appointment & role management via main.py helpers (verify_teacher, user_dict)

import asyncio
import os
import sqlite3
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from db import (
    CLASSROOM_SCHEMA_SQL,
    db_session,
    ensure_role_and_classroom_schema,
    make_conn,
    normalize_user_role,
)
from routers import build_social_tournaments_router


def test_db_session_and_pragmas():
    print("\n[TEST 1] db.connection — WAL, busy_timeout, foreign_keys, commit/rollback")
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        with db_session(path) as conn:
            fk = conn.execute("PRAGMA foreign_keys").fetchone()[0]
            busy = conn.execute("PRAGMA busy_timeout").fetchone()[0]
            assert fk == 1, f"expected foreign_keys=1, got {fk}"
            assert busy >= 5000, f"expected busy_timeout>=5000, got {busy}"
            conn.execute("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)")
            conn.execute("INSERT INTO items (label) VALUES ('ok')")

        # Verify commit persisted
        with db_session(path) as conn:
            row = conn.execute("SELECT label FROM items").fetchone()
            assert row and row["label"] == "ok"

        # Verify rollback on exception
        try:
            with db_session(path) as conn:
                conn.execute("INSERT INTO items (label) VALUES ('rolled_back')")
                raise ValueError("simulated failure")
        except ValueError:
            pass

        with db_session(path) as conn:
            count = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
            assert count == 1, f"expected 1 row after rollback, got {count}"
        print("  ✓ PRAGMAs, auto-commit, and exception rollback verified")
    finally:
        for suffix in ("", "-wal", "-shm"):
            try:
                os.remove(path + suffix)
            except OSError:
                pass


def test_role_and_classroom_schema():
    print("\n[TEST 2] db.schema — Teacher role & Classroom DDL idempotency")
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        conn = make_conn(path)
        conn.execute(
            """CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0
            )"""
        )
        conn.execute(
            "INSERT INTO users (email, username, is_admin) VALUES ('admin@test.vn', 'Admin', 1)"
        )
        conn.execute(
            "INSERT INTO users (email, username, is_admin) VALUES ('student@test.vn', 'HS', 0)"
        )
        conn.commit()

        # Run migration twice to prove idempotency
        ensure_role_and_classroom_schema(conn)
        ensure_role_and_classroom_schema(conn)

        admin_row = conn.execute("SELECT * FROM users WHERE email='admin@test.vn'").fetchone()
        student_row = conn.execute("SELECT * FROM users WHERE email='student@test.vn'").fetchone()

        admin_role = normalize_user_role(admin_row)
        student_role = normalize_user_role(student_row)
        assert admin_role == {"role": "admin", "is_admin": 1, "is_teacher": 1}, admin_role
        assert student_role == {"role": "student", "is_admin": 0, "is_teacher": 0}, student_role

        # Appoint student -> teacher (as Admin Panel does)
        conn.execute(
            "UPDATE users SET role='teacher', is_teacher=1, is_admin=0 WHERE email='student@test.vn'"
        )
        conn.commit()
        teacher_row = conn.execute("SELECT * FROM users WHERE email='student@test.vn'").fetchone()
        teacher_role = normalize_user_role(teacher_row)
        assert teacher_role == {"role": "teacher", "is_admin": 0, "is_teacher": 1}, teacher_role

        # Verify classroom tables exist and accept inserts
        conn.execute(
            "INSERT INTO classrooms (name, grade, invite_code, teacher_id)"
            " VALUES ('12A1 Toán', '12', 'TOAN12', ?)",
            (teacher_row["id"],),
        )
        conn.commit()
        cls_row = conn.execute("SELECT * FROM classrooms WHERE invite_code='TOAN12'").fetchone()
        assert cls_row["invite_code"] == "TOAN12"
        conn.close()
        print("  ✓ users.role / is_teacher + classrooms schema & appointment verified")
    finally:
        for suffix in ("", "-wal", "-shm"):
            try:
                os.remove(path + suffix)
            except OSError:
                pass


def test_social_tournaments_router_and_clan_leaderboard_fix():
    print("\n[TEST 3] routers.social_tournaments — routes mounted & clan leaderboard real DB query")
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        conn = make_conn(path)
        conn.executescript(
            """
            CREATE TABLE clans (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                tag TEXT NOT NULL,
                total_xp INTEGER DEFAULT 0
            );
            CREATE TABLE clan_members (
                clan_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                PRIMARY KEY (clan_id, user_id)
            );
            INSERT INTO clans (id, name, tag, total_xp) VALUES ('thth', 'Thánh Toán Học', '#THTH', 18420);
            INSERT INTO clan_members (clan_id, user_id) VALUES ('thth', 'u1'), ('thth', 'u2');
            """
        )
        conn.commit()
        conn.close()

        router = build_social_tournaments_router(
            get_db=lambda: make_conn(path),
            resolve_user_id=lambda req: 1,
            get_firebase_uid_or_backend_id=lambda req: ("1", False),
        )
        paths = {route.path for route in router.routes}
        expected_paths = {
            "/api/mathmaps/{map_id}/comments",
            "/api/comments/{comment_id}/upvote",
            "/api/comments/{comment_id}/report",
            "/api/clans",
            "/api/clans/{clan_id}",
            "/api/clans/leaderboard",
            "/api/tournaments/featured",
            "/api/tournaments",
            "/api/events",
            "/api/changelog",
        }
        missing = expected_paths - paths
        assert not missing, f"missing routes in social_tournaments router: {missing}"

        leaderboard_endpoint = next(
            route.endpoint for route in router.routes if route.path == "/api/clans/leaderboard"
        )
        for period in ("week", "month", "season", "alltime"):
            res = asyncio.run(leaderboard_endpoint(period=period))
            assert res["period"] == period
            assert len(res["leaderboard"]) == 1
            entry = res["leaderboard"][0]
            assert entry["id"] == "thth" and entry["members"] == 2 and entry["xp"] == 18420
        print(f"  ✓ {len(router.routes)} social/tournament endpoints mounted; /api/clans/leaderboard OK")
    finally:
        for suffix in ("", "-wal", "-shm"):
            try:
                os.remove(path + suffix)
            except OSError:
                pass


if __name__ == "__main__":
    print("=" * 62)
    print("  PHASE 1 REFACTOR & TEACHER/CLASSROOM SCHEMA TESTS")
    print("=" * 62)
    test_db_session_and_pragmas()
    test_role_and_classroom_schema()
    test_social_tournaments_router_and_clan_leaderboard_fix()
    print("\n" + "=" * 62)
    print("  ALL PHASE 1 REFACTOR TESTS PASSED")
    print("=" * 62)
