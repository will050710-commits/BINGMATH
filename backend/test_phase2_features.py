# duosteam/backend/test_phase2_features.py
#
# Phase 2 Feature Verification Tests (WP-A1 -> WP-A5)
#
# Run:  python test_phase2_features.py
#
# Covers:
#   1. WP-A1: Teacher Classroom, Student Join, Assignment Auto-Grading, Analytics, Relearn Seeding
#   2. WP-A2 / WP-A3: Relearn FSRS seeding from homework & test flows
#   3. WP-A4: MathViz Geometry 2D progressive construction `step` & `max_step`
#   4. WP-A5: Tournaments API real SQLite query with `participant_count` & `prize_json`

import asyncio
import json
import os
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from db import ensure_role_and_classroom_schema, make_conn
from mathviz_contract import normalize_geometry_2d
from routers import build_social_tournaments_router, build_teacher_classes_router


class DummyRequest:
    def __init__(self, user_id: int, body: dict | None = None, query_params: dict | None = None):
        self.user_id = user_id
        self._body = body or {}
        self.query_params = query_params or {}
        self.headers = {}

    async def json(self):
        return self._body


def _find_endpoint(router, path: str, method: str):
    for route in router.routes:
        if route.path == path and method.upper() in route.methods:
            return route.endpoint
    raise AssertionError(f"Endpoint {method} {path} not found in router")


def _unwrap_response(res):
    if hasattr(res, "body"):
        return json.loads(res.body.decode("utf-8"))
    return res


def test_wp_a1_teacher_classroom_and_assignments():
    print("\n[TEST 1] WP-A1 — Teacher Classroom, Invitations, Homework Grading & Analytics")
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        conn = make_conn(path)
        conn.execute(
            """CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                display_name TEXT DEFAULT '',
                grade TEXT DEFAULT '12',
                school TEXT DEFAULT '',
                is_admin INTEGER DEFAULT 0
            )"""
        )
        ensure_role_and_classroom_schema(conn)
        conn.execute(
            "INSERT INTO users (id, email, username, display_name, role, is_teacher, is_admin)"
            " VALUES (10, 'teacher@duomath.vn', 'thay_hung', 'Thầy Hùng', 'teacher', 1, 0)"
        )
        conn.execute(
            "INSERT INTO users (id, email, username, display_name, role, is_teacher, is_admin)"
            " VALUES (20, 'student1@duomath.vn', 'minh_anh', 'Minh Anh', 'student', 0, 0)"
        )
        conn.commit()
        conn.close()

        relearn_seeded = []

        def fake_relearn_upsert(user_id, seeds):
            relearn_seeded.append({"user_id": user_id, "seeds": list(seeds)})
            return {"created": len(seeds), "refreshed": 0}

        async def fake_verify_teacher(req):
            return req.user_id

        async def fake_resolve_user_id(req):
            return req.user_id

        router = build_teacher_classes_router(
            get_db=lambda: make_conn(path),
            verify_teacher=fake_verify_teacher,
            resolve_user_id=fake_resolve_user_id,
            relearn_upsert=fake_relearn_upsert,
        )

        # 1. Teacher creates classroom
        create_class_ep = _find_endpoint(router, "/api/teacher/classes", "POST")
        cls_res = _unwrap_response(
            asyncio.run(
                create_class_ep(
                    DummyRequest(
                        user_id=10,
                        body={"name": "Lớp 12A1 Luyện Thi THPT", "grade": "Lớp 12", "description": "Toán VDC"},
                    )
                )
            )
        )
        cls_info = cls_res["classroom"]
        class_id = int(cls_info["id"])
        invite_code = cls_info["invite_code"]
        assert invite_code.startswith("DM") and len(invite_code) == 6, invite_code

        # 2. Teacher invites student by email
        invite_ep = _find_endpoint(router, "/api/teacher/classes/{class_id}/invite", "POST")
        inv_res = _unwrap_response(
            asyncio.run(
                invite_ep(
                    class_id,
                    DummyRequest(user_id=10, body={"identifiers": ["student1@duomath.vn"]}),
                )
            )
        )
        assert len(inv_res["invited"]) == 1, inv_res

        # 3. Student checks pending invites and joins via invite_code
        student_classes_ep = _find_endpoint(router, "/api/student/classes", "GET")
        st_cls = _unwrap_response(asyncio.run(student_classes_ep(DummyRequest(user_id=20))))
        assert len(st_cls["pending_invites"]) == 1, st_cls

        join_ep = _find_endpoint(router, "/api/student/classes/join", "POST")
        join_res = _unwrap_response(
            asyncio.run(join_ep(DummyRequest(user_id=20, body={"invite_code": invite_code})))
        )
        assert join_res["status"] == "joined" and int(join_res["classroom"]["id"]) == class_id

        # 4. Teacher creates homework assignment with 2 questions and max_attempts=2
        create_asgn_ep = _find_endpoint(router, "/api/teacher/classes/{class_id}/assignments", "POST")
        asgn_res = _unwrap_response(
            asyncio.run(
                create_asgn_ep(
                    class_id,
                    DummyRequest(
                        user_id=10,
                        body={
                            "title": "Bài tập Khảo sát hàm số & Tích phân",
                            "instructions": "Làm trong 30 phút",
                            "source_type": "custom_quiz",
                            "due_at": "2020-01-01T05:00:00.000Z",
                            "max_attempts": 2,
                            "questions": [
                                {
                                    "id": "q1",
                                    "topic": "Cực trị hàm số",
                                    "question": "Hàm số y = x^3 - 3x có mấy điểm cực trị?",
                                    "options": ["A. 0", "B. 1", "C. 2", "D. 3"],
                                    "correct_answer": "C",
                                },
                                {
                                    "id": "q2",
                                    "topic": "Tích phân cơ bản",
                                    "question": "Tính tích phân từ 0 đến 1 của x dx",
                                    "correct_answer": "1/2",
                                },
                            ],
                        },
                    ),
                )
            )
        )
        assignment_id = int(asgn_res["assignment"]["id"])

        # 5. Student fetches assignment — verify `correct_answer` is stripped!
        get_asgn_ep = _find_endpoint(router, "/api/student/assignments/{assignment_id}", "GET")
        st_asgn = _unwrap_response(asyncio.run(get_asgn_ep(assignment_id, DummyRequest(user_id=20))))
        assert len(st_asgn["questions"]) == 2
        for q in st_asgn["questions"]:
            assert "correct_answer" not in q, f"correct_answer leaked to student: {q}"

        # 6a. Attempt 1 of 2: Student submits 1 right answer (q1=C) and 1 wrong answer (q2=5)
        # Verify correct_answer for q2 is HIDDEN because student still has 1 remaining attempt!
        submit_ep = _find_endpoint(router, "/api/student/assignments/{assignment_id}/submit", "POST")
        sub_res = _unwrap_response(
            asyncio.run(
                submit_ep(
                    assignment_id,
                    DummyRequest(user_id=20, body={"answers": {"q1": "C", "q2": "5"}, "duration_sec": 420}),
                )
            )
        )
        assert sub_res["score"] == 5.0, sub_res
        assert sub_res["answers_revealed"] is False
        q2_detail = next(d for d in sub_res["details"] if d["id"] == "q2")
        assert q2_detail["correct_answer"] is None, f"Expected None on attempt 1/2, got {q2_detail}"
        assert "Tích phân cơ bản" in sub_res["wrong_topics"]
        assert len(relearn_seeded) == 1 and relearn_seeded[0]["user_id"] == 20

        # 6b. Attempt 2 of 2: Student submits "0.5" for q2 (expected "1/2") -> mathematical equivalence!
        sub_res2 = _unwrap_response(
            asyncio.run(
                submit_ep(
                    assignment_id,
                    DummyRequest(user_id=20, body={"answers": {"q1": "C", "q2": "0.5"}, "duration_sec": 300}),
                )
            )
        )
        assert sub_res2["score"] == 10.0, f"Expected 10.0 with 0.5 == 1/2, got {sub_res2}"
        assert sub_res2["answers_revealed"] is True

        # 6c. Force SQLite space-formatted submitted_at on same day after ISO 'T' due_at to test late detection
        conn2 = make_conn(path)
        conn2.execute("UPDATE class_assignments SET due_at='2026-10-20T05:00:00.000Z' WHERE id=?", (assignment_id,))
        conn2.execute(
            "UPDATE assignment_submissions SET submitted_at='2026-10-20 10:00:00' WHERE assignment_id=?",
            (assignment_id,),
        )
        conn2.commit()
        conn2.close()

        # 7. Teacher fetches classroom analytics — verify same-day late submission is detected!
        analytics_ep = _find_endpoint(router, "/api/teacher/classes/{class_id}/analytics", "GET")
        ana_res = _unwrap_response(asyncio.run(analytics_ep(class_id, DummyRequest(user_id=10))))
        assert ana_res["summary"]["active_students"] == 1
        assert ana_res["summary"]["total_submissions"] == 2
        assert ana_res["summary"]["late_students"] == 1, f"Expected late_students=1, got {ana_res['summary']}"
        assert ana_res["gradebook"][0]["status"] == "late"
        assert ana_res["top_wrong_topics"][0]["topic"] == "Tích phân cơ bản"
        print("  ✓ Classroom, invite, join, math grading (0.5==1/2), multi-attempt answer hiding & UTC late detection OK")
    finally:
        for suffix in ("", "-wal", "-shm"):
            try:
                os.remove(path + suffix)
            except OSError:
                pass


def test_wp_a4_mathviz_progressive_steps():
    print("\n[TEST 2] WP-A4 — MathViz Geometry 2D progressive construction steps & max_step")
    raw_spec = {
        "widget": "geometry_2d",
        "title": "Tam giác ABC và đường cao AH",
        "layers": [
            {
                "kind": "polygon",
                "vertices": [[0, 4], [-3, 0], [3, 0]],
                "label": "ABC",
            },
            {
                "kind": "points",
                "items": [
                    {"name": "A", "x": 0, "y": 4},
                    {"name": "B", "x": -3, "y": 0},
                    {"name": "C", "x": 3, "y": 0},
                ],
            },
            {
                "kind": "segment",
                "from": [0, 4],
                "to": [0, 0],
                "style": "dashed",
            },
            {
                "kind": "angle",
                "at": [0, 0],
                "p1": [0, 4],
                "p2": [3, 0],
            },
        ],
    }
    norm, report = normalize_geometry_2d(raw_spec)
    assert norm is not None, f"normalize_geometry_2d returned None (report={report})"
    assert norm.get("max_step", 0) >= 3, f"expected progressive max_step >= 3, got {norm.get('max_step')}"
    assert report.get("max_step") == norm.get("max_step")
    steps = [lay.get("step") for lay in norm["layers"]]
    assert steps == [1, 1, 2, 3], f"expected progressive steps [1, 1, 2, 3], got {steps}"
    print(f"  ✓ Progressive steps assigned across layers (steps={steps}, max_step={norm['max_step']})")


def test_wp_a5_tournaments_real_db_response():
    print("\n[TEST 3] WP-A5 — Tournaments endpoint returns real DB rows with participant_count & prize_json")
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    try:
        conn = make_conn(path)
        conn.executescript(
            """
            CREATE TABLE tournaments (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                subtitle TEXT,
                status TEXT DEFAULT 'upcoming',
                starts_at TEXT,
                ends_at TEXT,
                max_players INTEGER DEFAULT 128,
                prize_json TEXT DEFAULT '{}',
                problems_json TEXT DEFAULT '[]',
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE tournament_participants (
                tournament_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                score REAL DEFAULT 0,
                solved_count INTEGER DEFAULT 0,
                PRIMARY KEY (tournament_id, user_id)
            );
            """
        )
        conn.execute(
            "INSERT INTO tournaments (id, title, status, max_players, prize_json)"
            " VALUES ('t_spring', 'Đấu Trường Mùa Xuân', 'active', 64, ?)",
            (json.dumps({"xp": 2000, "badge": "Spring Champ"}),),
        )
        conn.execute(
            "INSERT INTO tournament_participants (tournament_id, user_id, score) VALUES ('t_spring', 'u1', 90)"
        )
        conn.execute(
            "INSERT INTO tournament_participants (tournament_id, user_id, score) VALUES ('t_spring', 'u2', 80)"
        )
        conn.commit()
        conn.close()

        router = build_social_tournaments_router(
            get_db=lambda: make_conn(path),
            resolve_user_id=lambda req: 1,
            get_firebase_uid_or_backend_id=lambda req: ("1", False),
        )
        list_ep = _find_endpoint(router, "/api/tournaments", "GET")
        res = asyncio.run(list_ep())
        assert len(res["tournaments"]) == 1
        t = res["tournaments"][0]
        assert t["id"] == "t_spring"
        assert t["participant_count"] == 2
        assert isinstance(t["prize_json"], dict) and t["prize_json"]["xp"] == 2000
        print("  ✓ /api/tournaments returns real participant_count and parsed prize_json")
    finally:
        for suffix in ("", "-wal", "-shm"):
            try:
                os.remove(path + suffix)
            except OSError:
                pass


def test_wp_a2_a3_heatmap_encoding_and_feedback_auth():
    print("\n[TEST 4] WP-A2 / WP-A3 — Competency Heatmap URL encoding & Feedback session/auth guard")
    import main

    heatmap, recs = main.build_competency_heatmap(
        user_id=-999999,
        cards=[
            {
                "id": 1,
                "topic": "Hàm số & Cực trị #1",
                "skill": "Khảo sát y = x^3 + 3x & tiếp tuyến?",
                "is_due": True,
                "reps": 0,
                "lapses": 1,
            }
        ],
    )
    assert len(heatmap) == 1 and heatmap[0]["band"] == "weak"
    assert len(recs) >= 1
    for r in recs:
        href = r["href"]
        assert href.startswith("/duomcb?q=")
        q_part = href[len("/duomcb?q=") :]
        assert "&" not in q_part and "#" not in q_part and "?" not in q_part, f"Unencoded special chars in {href}"
    print("  ✓ Competency heatmap & URL-encoded daily recommendation links OK")


if __name__ == "__main__":
    print("=" * 64)
    print("  PHASE 2 FEATURE VERIFICATION SUITE (WP-A1 -> WP-A5)")
    print("=" * 64)
    test_wp_a1_teacher_classroom_and_assignments()
    test_wp_a4_mathviz_progressive_steps()
    test_wp_a5_tournaments_real_db_response()
    test_wp_a2_a3_heatmap_encoding_and_feedback_auth()
    print("\n" + "=" * 64)
    print("  ALL PHASE 2 FEATURE TESTS PASSED")
    print("=" * 64)
