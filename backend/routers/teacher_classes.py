"""
backend/routers/teacher_classes.py
==================================
Phase 2 (WP-A1): Teacher Dashboard, Classroom Management, Invitations,
Homework Assignments, Analytics & Student Homework Submission.
"""
from __future__ import annotations

import json
import secrets
import string
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

import fsrs_scheduler
from db.schema import normalize_user_role
from grading import answers_equivalent

_INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _safe_int(
    val: Any,
    default: Optional[int] = 0,
    *,
    min_val: Optional[int] = None,
    max_val: Optional[int] = None,
    field_name: str = "Giá trị số nguyên",
) -> int:
    if val is None or val == "":
        if default is None:
            raise HTTPException(400, f"{field_name} không hợp lệ.")
        res = int(default)
    elif isinstance(val, bool):
        raise HTTPException(400, f"{field_name} không hợp lệ.")
    else:
        try:
            res = int(val)
        except (TypeError, ValueError):
            raise HTTPException(400, f"{field_name} phải là số nguyên hợp lệ.")
    if min_val is not None and res < min_val:
        res = min_val
    if max_val is not None and res > max_val:
        res = max_val
    return res


def _safe_float(
    val: Any,
    default: float = 0.0,
    *,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None,
    field_name: str = "Giá trị số",
) -> float:
    if val is None or val == "":
        res = float(default)
    elif isinstance(val, bool):
        raise HTTPException(400, f"{field_name} không hợp lệ.")
    else:
        try:
            res = float(val)
        except (TypeError, ValueError):
            raise HTTPException(400, f"{field_name} phải là số hợp lệ.")
    if min_val is not None and res < min_val:
        res = min_val
    if max_val is not None and res > max_val:
        res = max_val
    return res


def _parse_utc_timestamp(raw: Any) -> Optional[datetime]:
    """Parse SQLite ('YYYY-MM-DD HH:MM:SS') or ISO-8601 ('...T...Z' / '+07:00') into UTC datetime."""
    if not raw:
        return None
    s = str(raw).strip()
    if not s:
        return None
    if s.endswith("Z") or s.endswith("z"):
        s = s[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(s, fmt)
                break
            except ValueError:
                continue
        else:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt


def _is_submission_late(submitted_at: Any, due_at: Any) -> bool:
    """Compare submitted_at vs due_at as UTC timestamps (fixes space vs 'T' string bug)."""
    sub_dt = _parse_utc_timestamp(submitted_at)
    due_dt = _parse_utc_timestamp(due_at)
    if sub_dt is None or due_dt is None:
        return False
    return sub_dt > due_dt


def _generate_invite_code(db, length: int = 6) -> str:
    """Generate a unique 6-character alphanumeric invite code (no ambiguous 0/O/1/I)."""
    for _ in range(25):
        code = "DM" + "".join(secrets.choice(_INVITE_ALPHABET) for _ in range(max(4, length - 2)))
        exists = db.execute("SELECT 1 FROM classrooms WHERE invite_code=?", (code,)).fetchone()
        if not exists:
            return code
    return "DM" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


def _parse_source_ref(raw: Any) -> Dict[str, Any]:
    """Normalize assignment source_ref into a dict with optional 'questions' list."""
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, list):
        return {"questions": raw}
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return {"questions": []}
        try:
            parsed = json.loads(s)
            if isinstance(parsed, dict):
                return parsed
            if isinstance(parsed, list):
                return {"questions": parsed}
        except Exception:
            return {"ref": s, "questions": []}
    return {"questions": []}


def _sanitize_questions_for_student(questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Strip correct_answer and solution fields before sending questions to a student."""
    safe_list: List[Dict[str, Any]] = []
    for idx, q in enumerate(questions or []):
        if not isinstance(q, dict):
            continue
        item = {
            "id": str(q.get("id") or f"q-{idx + 1}"),
            "order": int(q.get("order") or (idx + 1)),
            "topic": str(q.get("topic") or "Toán tổng hợp"),
            "question": str(q.get("question") or q.get("content_vi") or q.get("text") or ""),
            "options": q.get("options") or [],
            "hint": str(q.get("hint") or ""),
            "points": float(q.get("points") or 1.0),
        }
        safe_list.append(item)
    return safe_list


def _assert_class_teacher_or_admin(db, class_id: int, uid: int) -> Dict[str, Any]:
    """Return classroom row if uid is the owning teacher or an admin; raise 403/404 otherwise."""
    cls = db.execute("SELECT * FROM classrooms WHERE id=?", (class_id,)).fetchone()
    if not cls:
        raise HTTPException(404, "Không tìm thấy lớp học.")
    user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    role_info = normalize_user_role(user) if user else {"is_admin": 0}
    if int(cls["teacher_id"]) != int(uid) and not role_info.get("is_admin"):
        raise HTTPException(403, "Bạn không có quyền quản lý lớp học này.")
    return dict(cls)


def build_teacher_classes_router(
    *,
    get_db: Callable[[], Any],
    resolve_user_id: Callable[[Request], Awaitable[int]],
    verify_teacher: Callable[[Request], Awaitable[int]],
    relearn_upsert: Optional[Callable[[int, list], dict]] = None,
) -> APIRouter:
    router = APIRouter()

    # ═══════════════════════════════════════════════════════════════════════════
    #  TEACHER ENDPOINTS (Require role = 'teacher' | 'admin')
    # ═══════════════════════════════════════════════════════════════════════════

    @router.post("/api/teacher/classes")
    async def create_classroom(request: Request):
        teacher_id = await verify_teacher(request)
        body = await request.json()
        name = str(body.get("name") or "").strip()
        grade = str(body.get("grade") or "Lớp 12").strip()
        description = str(body.get("description") or "").strip()
        if not name or len(name) < 2:
            raise HTTPException(400, "Tên lớp học phải có ít nhất 2 ký tự.")
        if len(name) > 120:
            raise HTTPException(400, "Tên lớp học tối đa 120 ký tự.")

        db = get_db()
        try:
            invite_code = _generate_invite_code(db)
            cur = db.execute(
                "INSERT INTO classrooms (teacher_id, name, grade, description, invite_code) VALUES (?, ?, ?, ?, ?)",
                (teacher_id, name, grade[:32], description[:500], invite_code),
            )
            db.commit()
            class_id = cur.lastrowid
            row = db.execute("SELECT * FROM classrooms WHERE id=?", (class_id,)).fetchone()
            return JSONResponse({
                "status": "created",
                "classroom": {
                    **dict(row),
                    "member_count": 0,
                    "invited_count": 0,
                    "assignment_count": 0,
                },
            }, status_code=201)
        finally:
            db.close()

    @router.get("/api/teacher/classes")
    async def list_teacher_classes(request: Request):
        teacher_id = await verify_teacher(request)
        include_all = request.query_params.get("all") == "1"
        db = get_db()
        try:
            user = db.execute("SELECT * FROM users WHERE id=?", (teacher_id,)).fetchone()
            is_admin = normalize_user_role(user).get("is_admin") == 1 if user else False
            if include_all and is_admin:
                rows = db.execute(
                    """SELECT c.*, u.display_name AS teacher_name, u.username AS teacher_username
                       FROM classrooms c
                       LEFT JOIN users u ON u.id = c.teacher_id
                       WHERE c.archived = 0
                       ORDER BY c.created_at DESC"""
                ).fetchall()
            else:
                rows = db.execute(
                    """SELECT c.*, u.display_name AS teacher_name, u.username AS teacher_username
                       FROM classrooms c
                       LEFT JOIN users u ON u.id = c.teacher_id
                       WHERE c.teacher_id = ? AND c.archived = 0
                       ORDER BY c.created_at DESC""",
                    (teacher_id,),
                ).fetchall()

            classes = []
            for r in rows:
                cid = r["id"]
                m_active = db.execute(
                    "SELECT COUNT(*) AS cnt FROM classroom_members WHERE classroom_id=? AND status='active'",
                    (cid,),
                ).fetchone()["cnt"]
                m_invited = db.execute(
                    "SELECT COUNT(*) AS cnt FROM classroom_members WHERE classroom_id=? AND status='invited'",
                    (cid,),
                ).fetchone()["cnt"]
                a_cnt = db.execute(
                    "SELECT COUNT(*) AS cnt FROM class_assignments WHERE classroom_id=?",
                    (cid,),
                ).fetchone()["cnt"]
                s_cnt = db.execute(
                    """SELECT COUNT(*) AS cnt FROM assignment_submissions s
                       JOIN class_assignments a ON a.id = s.assignment_id
                       WHERE a.classroom_id = ?""",
                    (cid,),
                ).fetchone()["cnt"]
                classes.append({
                    **dict(r),
                    "member_count": m_active or 0,
                    "invited_count": m_invited or 0,
                    "assignment_count": a_cnt or 0,
                    "submission_count": s_cnt or 0,
                })
            return JSONResponse({"classes": classes})
        finally:
            db.close()

    @router.patch("/api/teacher/classes/{class_id}")
    async def update_classroom(class_id: int, request: Request):
        uid = await verify_teacher(request)
        body = await request.json()
        db = get_db()
        try:
            cls = _assert_class_teacher_or_admin(db, class_id, uid)
            name = str(body.get("name") if body.get("name") is not None else cls["name"]).strip()
            grade = str(body.get("grade") if body.get("grade") is not None else cls["grade"]).strip()
            description = str(body.get("description") if body.get("description") is not None else cls["description"]).strip()
            archived = int(bool(body.get("archived", cls["archived"])))
            db.execute(
                "UPDATE classrooms SET name=?, grade=?, description=?, archived=? WHERE id=?",
                (name[:120], grade[:32], description[:500], archived, class_id),
            )
            db.commit()
            updated = db.execute("SELECT * FROM classrooms WHERE id=?", (class_id,)).fetchone()
            return JSONResponse({"status": "updated", "classroom": dict(updated)})
        finally:
            db.close()

    @router.post("/api/teacher/classes/{class_id}/invite")
    async def invite_students_to_class(class_id: int, request: Request):
        uid = await verify_teacher(request)
        body = await request.json()
        db = get_db()
        try:
            cls = _assert_class_teacher_or_admin(db, class_id, uid)
            if body.get("regenerate_code"):
                new_code = _generate_invite_code(db)
                db.execute("UPDATE classrooms SET invite_code=? WHERE id=?", (new_code, class_id))
                db.commit()
                cls["invite_code"] = new_code

            raw_identifiers: List[str] = []
            for key in ("identifiers", "emails", "usernames"):
                val = body.get(key)
                if isinstance(val, list):
                    raw_identifiers.extend(str(x).strip() for x in val if str(x).strip())
                elif isinstance(val, str) and val.strip():
                    raw_identifiers.extend(
                        part.strip() for part in val.replace(";", ",").split(",") if part.strip()
                    )

            invited = []
            already_members = []
            not_found = []

            for ident in raw_identifiers:
                ident_low = ident.lower()
                student = db.execute(
                    "SELECT id, username, email, display_name, grade FROM users WHERE LOWER(email)=? OR LOWER(username)=?",
                    (ident_low, ident_low),
                ).fetchone()
                if not student:
                    not_found.append(ident)
                    continue
                sid = int(student["id"])
                existing = db.execute(
                    "SELECT id, status FROM classroom_members WHERE classroom_id=? AND student_id=?",
                    (class_id, sid),
                ).fetchone()
                if existing:
                    if existing["status"] == "active":
                        already_members.append(student["username"] or student["email"])
                    else:
                        invited.append({
                            "id": sid,
                            "username": student["username"],
                            "email": student["email"],
                            "display_name": student["display_name"],
                            "status": existing["status"],
                        })
                    continue

                status_to_set = "active" if body.get("auto_activate") else "invited"
                db.execute(
                    "INSERT INTO classroom_members (classroom_id, student_id, status, invited_by) VALUES (?, ?, ?, ?)",
                    (class_id, sid, status_to_set, uid),
                )
                invited.append({
                    "id": sid,
                    "username": student["username"],
                    "email": student["email"],
                    "display_name": student["display_name"],
                    "status": status_to_set,
                })

            db.commit()
            return JSONResponse({
                "classroom_id": class_id,
                "invite_code": cls["invite_code"],
                "invited": invited,
                "already_members": already_members,
                "not_found": not_found,
            })
        finally:
            db.close()

    @router.get("/api/teacher/classes/{class_id}/members")
    async def list_classroom_members(class_id: int, request: Request):
        uid = await verify_teacher(request)
        db = get_db()
        try:
            _assert_class_teacher_or_admin(db, class_id, uid)
            rows = db.execute(
                """SELECT cm.id AS membership_id, cm.student_id, cm.status, cm.joined_at,
                          u.username, u.email, u.display_name, u.grade, u.school,
                          (SELECT COUNT(DISTINCT s.assignment_id)
                           FROM assignment_submissions s
                           JOIN class_assignments a ON a.id = s.assignment_id
                           WHERE a.classroom_id = cm.classroom_id AND s.student_id = cm.student_id) AS submitted_count,
                          (SELECT ROUND(AVG(s.score), 2)
                           FROM assignment_submissions s
                           JOIN class_assignments a ON a.id = s.assignment_id
                           WHERE a.classroom_id = cm.classroom_id AND s.student_id = cm.student_id) AS avg_score
                   FROM classroom_members cm
                   JOIN users u ON u.id = cm.student_id
                   WHERE cm.classroom_id = ?
                   ORDER BY cm.status ASC, u.display_name ASC""",
                (class_id,),
            ).fetchall()
            return JSONResponse({"members": [dict(r) for r in rows]})
        finally:
            db.close()

    @router.delete("/api/teacher/classes/{class_id}/members/{student_id}")
    async def remove_classroom_member(class_id: int, student_id: int, request: Request):
        uid = await verify_teacher(request)
        db = get_db()
        try:
            _assert_class_teacher_or_admin(db, class_id, uid)
            db.execute(
                "DELETE FROM classroom_members WHERE classroom_id=? AND student_id=?",
                (class_id, student_id),
            )
            db.commit()
            return JSONResponse({"status": "removed", "classroom_id": class_id, "student_id": student_id})
        finally:
            db.close()

    @router.post("/api/teacher/classes/{class_id}/assignments")
    async def create_class_assignment(class_id: int, request: Request):
        uid = await verify_teacher(request)
        body = await request.json()
        title = str(body.get("title") or "").strip()
        if not title:
            raise HTTPException(400, "Tiêu đề bài tập không được để trống.")
        instructions = str(body.get("instructions") or "").strip()
        source_type = str(body.get("source_type") or "custom_quiz").strip()
        if source_type not in ("thcs_test", "thpt_test", "vnhsge", "ai_test", "custom_quiz"):
            source_type = "custom_quiz"

        raw_ref = body.get("source_ref")
        if raw_ref is None and isinstance(body.get("questions"), list):
            raw_ref = {"questions": body["questions"]}
        source_ref_dict = _parse_source_ref(raw_ref)
        source_ref_json = json.dumps(source_ref_dict, ensure_ascii=False)

        due_at = str(body.get("due_at") or "").strip() or None
        time_limit_min = _safe_int(
            body.get("time_limit_min"), 45, min_val=5, max_val=300, field_name="Thời gian làm bài"
        )
        max_attempts = _safe_int(
            body.get("max_attempts"), 1, min_val=1, max_val=20, field_name="Số lượt làm bài tối đa"
        )
        allow_ai_hint = 1 if body.get("allow_ai_hint", True) else 0

        db = get_db()
        try:
            _assert_class_teacher_or_admin(db, class_id, uid)
            cur = db.execute(
                """INSERT INTO class_assignments
                   (classroom_id, teacher_id, title, instructions, source_type, source_ref,
                    due_at, time_limit_min, max_attempts, allow_ai_hint)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    class_id,
                    uid,
                    title[:200],
                    instructions[:2000],
                    source_type,
                    source_ref_json,
                    due_at,
                    time_limit_min,
                    max_attempts,
                    allow_ai_hint,
                ),
            )
            db.commit()
            aid = cur.lastrowid
            row = db.execute("SELECT * FROM class_assignments WHERE id=?", (aid,)).fetchone()
            return JSONResponse({
                "status": "created",
                "assignment": {
                    **dict(row),
                    "question_count": len(source_ref_dict.get("questions") or []),
                },
            }, status_code=201)
        finally:
            db.close()

    @router.get("/api/teacher/classes/{class_id}/assignments")
    async def list_class_assignments(class_id: int, request: Request):
        uid = await verify_teacher(request)
        db = get_db()
        try:
            _assert_class_teacher_or_admin(db, class_id, uid)
            rows = db.execute(
                """SELECT a.*,
                          (SELECT COUNT(DISTINCT s.student_id)
                           FROM assignment_submissions s
                           WHERE s.assignment_id = a.id) AS submitted_students,
                          (SELECT ROUND(AVG(s.score), 2)
                           FROM assignment_submissions s
                           WHERE s.assignment_id = a.id) AS avg_score
                   FROM class_assignments a
                   WHERE a.classroom_id = ?
                   ORDER BY a.created_at DESC""",
                (class_id,),
            ).fetchall()
            out = []
            for r in rows:
                d = dict(r)
                parsed_ref = _parse_source_ref(d.get("source_ref"))
                d["question_count"] = len(parsed_ref.get("questions") or [])
                out.append(d)
            return JSONResponse({"assignments": out})
        finally:
            db.close()

    @router.delete("/api/teacher/classes/{class_id}/assignments/{assignment_id}")
    async def delete_class_assignment(class_id: int, assignment_id: int, request: Request):
        uid = await verify_teacher(request)
        db = get_db()
        try:
            _assert_class_teacher_or_admin(db, class_id, uid)
            db.execute(
                "DELETE FROM class_assignments WHERE id=? AND classroom_id=?",
                (assignment_id, class_id),
            )
            db.commit()
            return JSONResponse({"status": "deleted", "assignment_id": assignment_id})
        finally:
            db.close()

    @router.get("/api/teacher/classes/{class_id}/analytics")
    async def get_classroom_analytics(class_id: int, request: Request):
        uid = await verify_teacher(request)
        db = get_db()
        try:
            cls = _assert_class_teacher_or_admin(db, class_id, uid)
            assignments = db.execute(
                "SELECT id, title, due_at, created_at FROM class_assignments WHERE classroom_id=? ORDER BY created_at DESC",
                (class_id,),
            ).fetchall()
            total_assignments = len(assignments)
            due_map = {a["id"]: a["due_at"] for a in assignments}

            members = db.execute(
                """SELECT cm.student_id, cm.status AS member_status, cm.joined_at,
                          u.username, u.display_name, u.email, u.grade
                   FROM classroom_members cm
                   JOIN users u ON u.id = cm.student_id
                   WHERE cm.classroom_id = ? AND cm.status = 'active'
                   ORDER BY u.display_name ASC""",
                (class_id,),
            ).fetchall()

            submissions = db.execute(
                """SELECT s.*
                   FROM assignment_submissions s
                   JOIN class_assignments a ON a.id = s.assignment_id
                   WHERE a.classroom_id = ?
                   ORDER BY s.submitted_at DESC""",
                (class_id,),
            ).fetchall()

            # Score distribution buckets (scale 0-10)
            buckets = {"0_4": 0, "4_65": 0, "65_8": 0, "8_10": 0}
            topic_counter: Dict[str, int] = {}
            by_student: Dict[int, List[Dict[str, Any]]] = {}

            for s in submissions:
                sd = dict(s)
                sid = int(sd["student_id"])
                by_student.setdefault(sid, []).append(sd)
                sc = float(sd.get("score") or 0.0)
                if sc < 4.0:
                    buckets["0_4"] += 1
                elif sc < 6.5:
                    buckets["4_65"] += 1
                elif sc < 8.0:
                    buckets["65_8"] += 1
                else:
                    buckets["8_10"] += 1

                try:
                    w_topics = json.loads(sd.get("wrong_topics") or "[]")
                    if isinstance(w_topics, list):
                        for t in w_topics:
                            t_str = str(t).strip()
                            if t_str:
                                topic_counter[t_str] = topic_counter.get(t_str, 0) + 1
                except Exception:
                    pass

            gradebook = []
            on_time_count = 0
            late_count = 0
            missing_count = 0

            for m in members:
                sid = int(m["student_id"])
                stu_subs = by_student.get(sid, [])
                distinct_assigned_done = len({x["assignment_id"] for x in stu_subs})
                avg_score = (
                    round(sum(float(x["score"]) for x in stu_subs) / len(stu_subs), 2)
                    if stu_subs
                    else None
                )
                last_sub = stu_subs[0]["submitted_at"] if stu_subs else None

                # Determine submission status using UTC timestamp comparison (fixes ' ' vs 'T' string bug)
                is_late = False
                for x in stu_subs:
                    due = due_map.get(x["assignment_id"])
                    if _is_submission_late(x.get("submitted_at"), due):
                        is_late = True
                        break

                if distinct_assigned_done == 0 and total_assignments > 0:
                    status_label = "missing"
                    missing_count += 1
                elif is_late:
                    status_label = "late"
                    late_count += 1
                else:
                    status_label = "submitted"
                    if total_assignments > 0:
                        on_time_count += 1

                gradebook.append({
                    "student_id": sid,
                    "username": m["username"],
                    "display_name": m["display_name"] or m["username"],
                    "email": m["email"],
                    "grade": m["grade"],
                    "submitted_count": distinct_assigned_done,
                    "total_assignments": total_assignments,
                    "avg_score": avg_score,
                    "status": status_label,
                    "last_submitted_at": last_sub,
                })

            top_wrong_topics = [
                {"topic": k, "wrong_count": v}
                for k, v in sorted(topic_counter.items(), key=lambda item: item[1], reverse=True)[:5]
            ]

            return JSONResponse({
                "classroom": cls,
                "summary": {
                    "active_students": len(members),
                    "total_assignments": total_assignments,
                    "total_submissions": len(submissions),
                    "on_time_students": on_time_count,
                    "late_students": late_count,
                    "missing_students": missing_count,
                },
                "score_distribution": buckets,
                "top_wrong_topics": top_wrong_topics,
                "gradebook": gradebook,
            })
        finally:
            db.close()

    # ═══════════════════════════════════════════════════════════════════════════
    #  STUDENT ENDPOINTS (Classroom & Homework Participation)
    # ═══════════════════════════════════════════════════════════════════════════

    @router.get("/api/student/classes")
    async def list_student_classes_and_homework(request: Request):
        uid = await resolve_user_id(request)
        db = get_db()
        try:
            memberships = db.execute(
                """SELECT cm.id AS membership_id, cm.classroom_id, cm.status, cm.joined_at,
                          c.name, c.grade, c.description, c.invite_code, c.teacher_id,
                          u.display_name AS teacher_name, u.username AS teacher_username
                   FROM classroom_members cm
                   JOIN classrooms c ON c.id = cm.classroom_id
                   LEFT JOIN users u ON u.id = c.teacher_id
                   WHERE cm.student_id = ? AND c.archived = 0
                   ORDER BY cm.joined_at DESC""",
                (uid,),
            ).fetchall()

            active_classes = []
            pending_invites = []
            active_class_ids = []

            for m in memberships:
                md = dict(m)
                if md["status"] == "invited":
                    pending_invites.append(md)
                else:
                    active_classes.append(md)
                    active_class_ids.append(int(md["classroom_id"]))

            upcoming_assignments = []
            if active_class_ids:
                placeholders = ",".join("?" for _ in active_class_ids)
                assign_rows = db.execute(
                    f"""SELECT a.*, c.name AS classroom_name, c.grade AS classroom_grade
                        FROM class_assignments a
                        JOIN classrooms c ON c.id = a.classroom_id
                        WHERE a.classroom_id IN ({placeholders})
                        ORDER BY a.due_at IS NULL, a.due_at ASC, a.created_at DESC""",
                    tuple(active_class_ids),
                ).fetchall()

                for a in assign_rows:
                    ad = dict(a)
                    parsed_ref = _parse_source_ref(ad.get("source_ref"))
                    ad["question_count"] = len(parsed_ref.get("questions") or [])
                    # Do not expose full raw source_ref with answers in list view
                    ad.pop("source_ref", None)

                    subs = db.execute(
                        """SELECT COUNT(*) AS attempts, MAX(score) AS best_score, MAX(submitted_at) AS last_submitted_at
                           FROM assignment_submissions
                           WHERE assignment_id=? AND student_id=?""",
                        (ad["id"], uid),
                    ).fetchone()
                    ad["attempts_used"] = subs["attempts"] or 0
                    ad["best_score"] = subs["best_score"]
                    ad["last_submitted_at"] = subs["last_submitted_at"]
                    ad["is_completed"] = (subs["attempts"] or 0) > 0
                    upcoming_assignments.append(ad)

            return JSONResponse({
                "active_classes": active_classes,
                "pending_invites": pending_invites,
                "upcoming_assignments": upcoming_assignments,
            })
        finally:
            db.close()

    @router.post("/api/student/classes/join")
    async def student_join_classroom(request: Request):
        uid = await resolve_user_id(request)
        body = await request.json()
        invite_code = str(body.get("invite_code") or "").strip().upper()
        classroom_id = body.get("classroom_id")

        db = get_db()
        try:
            cls = None
            if invite_code:
                cls = db.execute(
                    "SELECT * FROM classrooms WHERE UPPER(invite_code)=? AND archived=0",
                    (invite_code,),
                ).fetchone()
                if not cls:
                    raise HTTPException(404, "Mã lớp học không hợp lệ hoặc lớp đã đóng.")
            elif classroom_id is not None:
                cid_val = _safe_int(classroom_id, None, min_val=1, field_name="Mã lớp học (classroom_id)")
                cls = db.execute(
                    "SELECT * FROM classrooms WHERE id=? AND archived=0",
                    (cid_val,),
                ).fetchone()
                if not cls:
                    raise HTTPException(404, "Không tìm thấy lớp học.")
            else:
                raise HTTPException(400, "Vui lòng nhập mã lớp (invite_code) hoặc chọn lời mời.")

            cid = int(cls["id"])
            existing = db.execute(
                "SELECT id, status FROM classroom_members WHERE classroom_id=? AND student_id=?",
                (cid, uid),
            ).fetchone()

            if existing:
                if existing["status"] != "active":
                    db.execute(
                        "UPDATE classroom_members SET status='active', joined_at=datetime('now') WHERE id=?",
                        (existing["id"],),
                    )
                    db.commit()
            else:
                # If joining by classroom_id without an invite_code, require an existing invite
                if not invite_code:
                    raise HTTPException(403, "Bạn cần mã mời để tham gia lớp học này.")
                db.execute(
                    "INSERT INTO classroom_members (classroom_id, student_id, status) VALUES (?, ?, 'active')",
                    (cid, uid),
                )
                db.commit()

            return JSONResponse({
                "status": "joined",
                "classroom": {
                    "id": cid,
                    "name": cls["name"],
                    "grade": cls["grade"],
                    "description": cls["description"],
                    "invite_code": cls["invite_code"],
                },
            })
        finally:
            db.close()

    @router.get("/api/student/assignments/{assignment_id}")
    async def get_student_assignment_detail(assignment_id: int, request: Request):
        uid = await resolve_user_id(request)
        db = get_db()
        try:
            assign = db.execute(
                """SELECT a.*, c.name AS classroom_name, c.grade AS classroom_grade
                   FROM class_assignments a
                   JOIN classrooms c ON c.id = a.classroom_id
                   WHERE a.id = ?""",
                (assignment_id,),
            ).fetchone()
            if not assign:
                raise HTTPException(404, "Không tìm thấy bài tập.")

            # Verify student belongs to the classroom or is the teacher/admin
            member = db.execute(
                "SELECT status FROM classroom_members WHERE classroom_id=? AND student_id=? AND status='active'",
                (assign["classroom_id"], uid),
            ).fetchone()
            if not member and int(assign["teacher_id"]) != int(uid):
                user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
                if not (user and normalize_user_role(user).get("is_admin")):
                    raise HTTPException(403, "Bạn chưa tham gia lớp học của bài tập này.")

            parsed_ref = _parse_source_ref(assign["source_ref"])
            questions = _sanitize_questions_for_student(parsed_ref.get("questions") or [])

            subs = db.execute(
                "SELECT id, attempt_no, score, total_questions, submitted_at FROM assignment_submissions WHERE assignment_id=? AND student_id=? ORDER BY attempt_no DESC",
                (assignment_id, uid),
            ).fetchall()

            ad = dict(assign)
            ad.pop("source_ref", None)
            ad["questions"] = questions
            ad["source_meta"] = {k: v for k, v in parsed_ref.items() if k != "questions"}
            ad["submissions"] = [dict(s) for s in subs]
            return JSONResponse(ad)
        finally:
            db.close()

    @router.post("/api/student/assignments/{assignment_id}/submit")
    async def submit_student_assignment(assignment_id: int, request: Request):
        uid = await resolve_user_id(request)
        body = await request.json()
        answers = body.get("answers") if isinstance(body.get("answers"), dict) else {}
        duration_sec = _safe_int(
            body.get("duration_sec"), 0, min_val=0, max_val=86400, field_name="Thời gian làm bài (duration_sec)"
        )

        db = get_db()
        try:
            db.execute("BEGIN IMMEDIATE")
            assign = db.execute(
                """SELECT a.*, c.archived AS classroom_archived
                   FROM class_assignments a
                   JOIN classrooms c ON c.id = a.classroom_id
                   WHERE a.id = ?""",
                (assignment_id,),
            ).fetchone()
            if not assign:
                raise HTTPException(404, "Không tìm thấy bài tập.")
            if int(assign["classroom_archived"] or 0) == 1:
                raise HTTPException(403, "Lớp học này đã được lưu trữ, không thể nộp bài.")

            member = db.execute(
                "SELECT id FROM classroom_members WHERE classroom_id=? AND student_id=? AND status='active'",
                (assign["classroom_id"], uid),
            ).fetchone()
            if not member and int(assign["teacher_id"]) != int(uid):
                raise HTTPException(403, "Bạn không thuộc lớp học được giao bài tập này.")

            prev_count = db.execute(
                "SELECT COUNT(*) AS cnt FROM assignment_submissions WHERE assignment_id=? AND student_id=?",
                (assignment_id, uid),
            ).fetchone()["cnt"] or 0

            max_attempts = _safe_int(assign["max_attempts"], 1, min_val=1, max_val=20)
            if prev_count >= max_attempts:
                raise HTTPException(409, f"Bạn đã hết số lượt làm bài ({max_attempts} lượt).")

            attempt_no = prev_count + 1
            reveal_answers = attempt_no >= max_attempts

            parsed_ref = _parse_source_ref(assign["source_ref"])
            questions = parsed_ref.get("questions") or []

            wrong_topics: List[str] = []
            relearn_entries: List[Dict[str, Any]] = []
            graded_details: List[Dict[str, Any]] = []

            if questions:
                correct_count = 0
                total_q = len(questions)
                for idx, q in enumerate(questions):
                    if not isinstance(q, dict):
                        continue
                    qid = str(q.get("id") or f"q-{idx + 1}")
                    topic = str(q.get("topic") or assign["title"] or "Toán tổng hợp").strip()
                    q_text = str(q.get("question") or q.get("content_vi") or q.get("text") or f"Câu {idx + 1}").strip()
                    expected = str(q.get("correct_answer") or q.get("answer") or "").strip()
                    given = str(answers.get(qid, answers.get(str(idx), "")) or "").strip()
                    is_correct = bool(expected and given and answers_equivalent(given, expected))
                    if is_correct:
                        correct_count += 1
                    else:
                        wrong_topics.append(topic)
                        relearn_entries.append({
                            "topic": topic,
                            "skill": q_text[:100],
                            "correct": 0,
                            "total": 1,
                            "level": "weak",
                        })
                    graded_details.append({
                        "id": qid,
                        "topic": topic,
                        "user_answer": given,
                        "correct_answer": expected if (is_correct or reveal_answers) else None,
                        "is_correct": is_correct,
                        "explanation": (
                            str(q.get("explanation") or q.get("explanation_vi") or "")
                            if (is_correct or reveal_answers)
                            else ""
                        ),
                    })
                score_10 = round((correct_count / max(1, total_q)) * 10.0, 2)
            else:
                # External test reference (e.g. thcs_test / thpt_test / vnhsge) where score & wrong_topics can be passed
                total_q = _safe_int(body.get("total_questions"), 10, min_val=1, max_val=200, field_name="Tổng số câu")
                raw_score = _safe_float(body.get("score"), 0.0, min_val=0.0, max_val=10.0, field_name="Điểm số")
                score_10 = round(raw_score, 2)
                for wt in (body.get("wrong_topics") or []):
                    wt_str = str(wt).strip()
                    if wt_str:
                        wrong_topics.append(wt_str)
                        relearn_entries.append({
                            "topic": wt_str,
                            "skill": f"{assign['title']} — {wt_str}"[:100],
                            "correct": 0,
                            "total": 1,
                            "level": "weak",
                        })

            cur = db.execute(
                """INSERT INTO assignment_submissions
                   (assignment_id, student_id, attempt_no, score, total_questions, answers_json, wrong_topics, duration_sec)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    assignment_id,
                    uid,
                    attempt_no,
                    score_10,
                    total_q,
                    json.dumps(answers, ensure_ascii=False),
                    json.dumps(wrong_topics, ensure_ascii=False),
                    duration_sec,
                ),
            )
            db.commit()
            sub_id = cur.lastrowid
        except Exception:
            try:
                db.rollback()
            except Exception:
                pass
            raise
        finally:
            db.close()

        # WP-A3 integration: automatically push wrong answers into FSRS relearn_cards
        relearn_stats = {"created": 0, "refreshed": 0}
        if relearn_entries and relearn_upsert is not None:
            try:
                seeds = fsrs_scheduler.entries_to_cards(relearn_entries)
                relearn_stats = relearn_upsert(uid, seeds)
            except Exception:
                pass

        return JSONResponse({
            "status": "submitted",
            "submission_id": sub_id,
            "attempt_no": attempt_no,
            "max_attempts": max_attempts,
            "answers_revealed": reveal_answers,
            "score": score_10,
            "total_questions": total_q,
            "wrong_topics": wrong_topics,
            "details": graded_details,
            "relearn_seeded": relearn_stats,
        }, status_code=201)

    return router
