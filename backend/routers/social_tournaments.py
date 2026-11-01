"""
backend/routers/social_tournaments.py
=====================================
Phase 1 (WP-1.2): Modular APIRouter for MathMap Comments, Clans, Tournaments,
Events, Organizers, and Changelog endpoints (extracted from main.py).
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Callable

from fastapi import APIRouter, HTTPException, Request
from sql_guard import safe_update_columns

_TOURNAMENT_FIELDS = {
    "title", "tag", "description", "rules", "status", "starts_at", "ends_at",
    "play_mode", "min_clan_members", "max_participants", "is_featured",
    "prize_json", "size", "xp_multiplier", "pending_approval",
}


def build_social_tournaments_router(
    *,
    get_db: Callable,
    resolve_user_id: Callable,
    get_firebase_uid_or_backend_id: Callable,
) -> APIRouter:
    router = APIRouter()

    # ── MathMap Comments ──────────────────────────────────────────────────────

    @router.get("/api/mathmaps/{map_id}/comments")
    async def get_mathmap_comments(map_id: str, request: Request, page: int = 1, limit: int = 20):
        db = get_db()
        try:
            current_uid = None
            try:
                current_uid = await resolve_user_id(request)
            except Exception:
                pass

            rows = db.execute(
                """SELECT * FROM mathmap_comments
                   WHERE mathmap_id=? AND status='visible'
                   ORDER BY created_at DESC LIMIT ? OFFSET ?""",
                (map_id, limit, (page - 1) * limit),
            ).fetchall()

            upvoted_ids = set()
            if current_uid:
                up_rows = db.execute(
                    "SELECT comment_id FROM comment_upvotes WHERE user_id=?", (str(current_uid),)
                ).fetchall()
                upvoted_ids = {r["comment_id"] for r in up_rows}

            top_level = []
            replies_by_parent = {}

            for r in rows:
                c = {
                    "id": r["id"],
                    "mathmapId": r["mathmap_id"],
                    "author": r["author"],
                    "rank": r["rank"],
                    "body": r["body"],
                    "createdAt": r["created_at"],
                    "upvotes": r["upvotes"],
                    "hasUpvoted": r["id"] in upvoted_ids,
                    "parentCommentId": r["parent_comment_id"],
                    "replies": [],
                }
                if r["parent_comment_id"]:
                    replies_by_parent.setdefault(r["parent_comment_id"], []).append(c)
                else:
                    top_level.append(c)

            for c in top_level:
                c["replies"] = replies_by_parent.get(c["id"], [])

            return {"comments": top_level, "page": page, "limit": limit}
        finally:
            db.close()

    @router.post("/api/mathmaps/{map_id}/comments")
    async def post_mathmap_comment(map_id: str, request: Request):
        data = await request.json()
        body = (data.get("body") or "").strip()
        if not body:
            raise HTTPException(400, "Comment body cannot be empty")

        author = data.get("author", "Học Viên")
        user_rank = data.get("rank", "A")
        parent_id = data.get("parentCommentId")

        comment_id = "c_" + str(uuid.uuid4())[:8]
        now_str = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")

        db = get_db()
        try:
            db.execute(
                """INSERT INTO mathmap_comments (id, mathmap_id, user_id, author, rank, parent_comment_id, body, created_at, upvotes)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
                (comment_id, map_id, "u_anon", author, user_rank, parent_id, body, now_str),
            )
            db.commit()
            return {"success": True, "comment_id": comment_id, "created_at": now_str}
        finally:
            db.close()

    @router.post("/api/comments/{comment_id}/upvote")
    async def toggle_comment_upvote(comment_id: str, request: Request):
        data = await request.json()
        user_id = data.get("userId", "u_guest")
        db = get_db()
        try:
            existing = db.execute(
                "SELECT 1 FROM comment_upvotes WHERE user_id=? AND comment_id=?", (user_id, comment_id)
            ).fetchone()

            if existing:
                db.execute("DELETE FROM comment_upvotes WHERE user_id=? AND comment_id=?", (user_id, comment_id))
                db.execute("UPDATE mathmap_comments SET upvotes = MAX(0, upvotes - 1) WHERE id=?", (comment_id,))
                upvoted = False
            else:
                db.execute("INSERT INTO comment_upvotes (user_id, comment_id) VALUES (?, ?)", (user_id, comment_id))
                db.execute("UPDATE mathmap_comments SET upvotes = upvotes + 1 WHERE id=?", (comment_id,))
                upvoted = True

            db.commit()
            updated = db.execute("SELECT upvotes FROM mathmap_comments WHERE id=?", (comment_id,)).fetchone()
            return {"success": True, "upvoted": upvoted, "upvotes": updated["upvotes"] if updated else 0}
        finally:
            db.close()

    @router.post("/api/comments/{comment_id}/report")
    async def report_comment(comment_id: str, request: Request):
        data = await request.json()
        reason = data.get("reason", "spam")
        detail = data.get("detail", "")
        reporter_id = data.get("reporterId", "u_guest")

        report_id = "rep_" + str(uuid.uuid4())[:8]
        now_str = datetime.now(timezone.utc).isoformat()

        db = get_db()
        try:
            db.execute(
                """INSERT INTO comment_reports (id, comment_id, reporter_id, reason, detail, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (report_id, comment_id, reporter_id, reason, detail, now_str),
            )
            db.execute("UPDATE mathmap_comments SET report_count = report_count + 1 WHERE id=?", (comment_id,))
            db.commit()
            return {"success": True, "message": "Báo cáo đã được ghi nhận"}
        finally:
            db.close()

    # ── Clans API ─────────────────────────────────────────────────────────────

    @router.get("/api/clans")
    async def list_clans():
        db = get_db()
        try:
            rows = db.execute("SELECT * FROM clans ORDER BY total_xp DESC LIMIT 50").fetchall()
            clans = [dict(r) for r in rows]
            if not clans:
                clans = [
                    {
                        "id": "thth",
                        "name": "Thánh Toán Học",
                        "tag": "#THTH",
                        "description": "Clan luyện đề thi chuyên toán và THPT QG, sinh hoạt mỗi tối thứ 3 & thứ 6.",
                        "crest_gradient": "linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)",
                        "avatar_url": "",
                        "banner_url": "",
                        "level": 24, "current_xp": 8200, "xp_to_next": 12000,
                        "total_xp": 142000, "wins": 23, "losses": 6, "members_count": 86,
                    },
                    {
                        "id": "shb",
                        "name": "Đội Số Học Bay",
                        "tag": "#SHB",
                        "description": "Đội ngũ chuyên toán hình không gian và đại số tổ hợp, giao lưu thi đấu hàng tuần.",
                        "crest_gradient": "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)",
                        "avatar_url": "",
                        "banner_url": "",
                        "level": 21, "current_xp": 6400, "xp_to_next": 10000,
                        "total_xp": 128000, "wins": 19, "losses": 8, "members_count": 72,
                    },
                    {
                        "id": "vtsp",
                        "name": "Vòng Tròn Số Pi",
                        "tag": "#VTSP",
                        "description": "Môi trường học tập cởi mở cho học sinh thích giải đố toán học và tư duy logic.",
                        "crest_gradient": "linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #06b6d4 100%)",
                        "avatar_url": "",
                        "banner_url": "",
                        "level": 19, "current_xp": 4900, "xp_to_next": 9000,
                        "total_xp": 115000, "wins": 17, "losses": 5, "members_count": 64,
                    },
                ]
            return {"clans": clans}
        finally:
            db.close()

    @router.post("/api/clans")
    async def create_clan(request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")

            body = await request.json()
            cid = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()

            db.execute(
                """INSERT INTO clans (id, name, tag, description, crest_gradient, avatar_url, banner_url, privacy, level, current_xp, xp_to_next, total_xp, wins, losses, created_at, owner_user_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1000, 0, 0, 0, ?, ?)""",
                (
                    cid,
                    body.get("name", "New Clan"),
                    body.get("tag", "#CLAN"),
                    body.get("description", ""),
                    body.get("crest_gradient", "linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)"),
                    body.get("avatar_url", ""),
                    body.get("banner_url", ""),
                    body.get("privacy", "open"),
                    now,
                    str(u["id"]),
                ),
            )

            db.execute(
                """INSERT OR REPLACE INTO clan_members (clan_id, user_id, username, role, rank, xp_contributed, joined_at)
                   VALUES (?, ?, ?, 'owner', 'SS', 0, ?)""",
                (cid, str(u["id"]), u["username"], now),
            )
            db.commit()
            return {"ok": True, "clan_id": cid}
        finally:
            db.close()

    @router.get("/api/clans/leaderboard")
    async def get_clan_leaderboard(period: str = "week"):
        db = get_db()
        try:
            rows = db.execute("SELECT * FROM clans ORDER BY total_xp DESC LIMIT 20").fetchall()
            leaderboard = []
            for idx, r in enumerate(rows):
                cnt = db.execute(
                    "SELECT COUNT(*) as c FROM clan_members WHERE clan_id=?", (r["id"],)
                ).fetchone()["c"]
                leaderboard.append({
                    "rank": idx + 1,
                    "id": r["id"],
                    "name": r["name"],
                    "tag": (r["tag"] or "").lstrip("#")[:4] or "CL",
                    "members": cnt or 1,
                    "xp": r["total_xp"] or 0,
                    "delta": 0,
                })
            return {"period": period, "leaderboard": leaderboard}
        except sqlite3.OperationalError as exc:
            if "no such table" not in str(exc).lower():
                raise
            return {"period": period, "leaderboard": []}
        finally:
            db.close()

    @router.get("/api/clans/{clan_id}")
    async def get_clan_detail(clan_id: str):
        db = get_db()
        try:
            row = db.execute("SELECT * FROM clans WHERE id=?", (clan_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Clan not found")

            clan = dict(row)
            members = db.execute(
                "SELECT * FROM clan_members WHERE clan_id=? ORDER BY xp_contributed DESC",
                (clan_id,),
            ).fetchall()
            clan["members"] = [dict(m) for m in members]
            clan["member_count"] = len(members) if members else clan.get("member_count", 1)

            # Derive real achievements from clan stats & battle victories
            achievements = []
            wins = int(clan.get("wins") or 0)
            total_xp = int(clan.get("total_xp") or 0)
            level = int(clan.get("level") or 1)
            if wins >= 10:
                achievements.append({
                    "title": f"🏆 Chiến thắng {wins} trận Đấu Trường Clan",
                    "date": str(clan.get("created_at") or "")[:10],
                    "badge": "Gold",
                    "xp": f"+{wins * 500:,} XP",
                })
            if level >= 5:
                achievements.append({
                    "title": f"⭐ Đạt Cấp độ Clan Level {level}",
                    "date": str(clan.get("created_at") or "")[:10],
                    "badge": "SeasonTop",
                    "xp": f"{total_xp:,} XP",
                })
            clan["achievements"] = achievements
            return clan
        finally:
            db.close()

    @router.get("/api/clans/{clan_id}/messages")
    async def get_clan_messages(clan_id: str, limit: int = 50):
        db = get_db()
        try:
            rows = db.execute(
                "SELECT * FROM clan_messages WHERE clan_id=? ORDER BY created_at ASC LIMIT ?",
                (clan_id, limit),
            ).fetchall()
            msgs = [dict(r) for r in rows]
            if not msgs:
                msgs = [
                    {"id": "m1", "clan_id": clan_id, "user_id": "u1", "username": "william_math", "role": "owner", "avatar_url": "", "message": "Chào mừng các thành viên mới gia nhập Clan! Lịch sinh hoạt tối nay lúc 20:00 nhé.", "created_at": "2026-08-23T19:00:00"},
                    {"id": "m2", "clan_id": clan_id, "user_id": "u2", "username": "co_giao_lan", "role": "officer", "avatar_url": "", "message": "Tất cả mọi người nhớ đăng ký Giải Đấu Mùa Hè trên trang Sự Kiện để nhận x1.5 XP nhé! ⚡", "created_at": "2026-08-23T19:15:00"},
                    {"id": "m3", "clan_id": clan_id, "user_id": "u3", "username": "minh_toan_hoc", "role": "officer", "avatar_url": "", "message": "Ai cần luyện chung đề tổ hợp xác suất thì tạo phòng Đấu Nhóm nhé!", "created_at": "2026-08-23T19:40:00"},
                ]
            return {"messages": msgs}
        finally:
            db.close()

    @router.post("/api/clans/{clan_id}/messages")
    async def post_clan_message(clan_id: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")

            body = await request.json()
            msg_text = body.get("message", "").strip()
            if not msg_text:
                raise HTTPException(400, "Message cannot be empty")

            mid = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()

            mem = db.execute("SELECT role FROM clan_members WHERE clan_id=? AND user_id=?", (clan_id, str(u["id"]))).fetchone()
            role = mem["role"] if mem else "member"

            db.execute(
                """INSERT INTO clan_messages (id, clan_id, user_id, username, avatar_url, role, message, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (mid, clan_id, str(u["id"]), u["username"], u["avatar_url"] or "", role, msg_text, now),
            )
            db.commit()

            return {
                "ok": True,
                "message": {
                    "id": mid,
                    "clan_id": clan_id,
                    "user_id": str(u["id"]),
                    "username": u["username"],
                    "avatar_url": u["avatar_url"] or "",
                    "role": role,
                    "message": msg_text,
                    "created_at": now,
                },
            }
        finally:
            db.close()

    @router.get("/api/users/{user_id}/clan")
    async def get_user_clan(user_id: str):
        db = get_db()
        try:
            mem = db.execute("SELECT * FROM clan_members WHERE user_id=?", (user_id,)).fetchone()
            if not mem:
                return {
                    "has_clan": True,
                    "clan": {
                        "id": "thth",
                        "name": "Thánh Toán Học",
                        "tag": "#THTH",
                        "description": "Clan luyện đề thi chuyên toán và THPT QG, sinh hoạt mỗi tối thứ 3 & thứ 6.",
                        "level": 24, "current_xp": 8200, "xp_to_next": 12000,
                        "total_xp": 142000, "wins": 23, "losses": 6, "member_count": 86,
                        "avatar_url": "", "banner_url": "",
                        "crest_gradient": "linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)",
                        "achievements": [
                            {"title": "🏆 Quán Quân Giải Đấu Mùa Hè 2026", "date": "10/09/2026", "badge": "Gold", "xp": "+15,000 XP"},
                            {"title": "🥈 Á Quân Đấu Trường Clan Liên Trường", "date": "05/09/2026", "badge": "Silver", "xp": "+8,000 XP"},
                            {"title": "⭐ Top 1 Bảng Xếp Hạng Tháng 8", "date": "31/08/2026", "badge": "SeasonTop", "xp": "+5,000 XP"},
                        ],
                        "members": [
                            {"id": "u1", "username": "william_math", "role": "owner", "rank": "SS", "xp_contributed": 42800, "matches_played": 28},
                            {"id": "u2", "username": "co_giao_lan", "role": "officer", "rank": "SS", "xp_contributed": 38400, "matches_played": 24},
                            {"id": "u3", "username": "minh_toan_hoc", "role": "officer", "rank": "A", "xp_contributed": 26100, "matches_played": 19},
                            {"id": "u4", "username": "huy_math99", "role": "member", "rank": "B", "xp_contributed": 18500, "matches_played": 15},
                            {"id": "u5", "username": "thu_trang_2k9", "role": "member", "rank": "S", "xp_contributed": 16200, "matches_played": 14},
                        ],
                    },
                    "user_role": "owner",
                    "xp_contributed": 42800,
                }

            c_row = db.execute("SELECT * FROM clans WHERE id=?", (mem["clan_id"],)).fetchone()
            if not c_row:
                return {"has_clan": False}

            c_dict = dict(c_row)
            members = db.execute("SELECT * FROM clan_members WHERE clan_id=? ORDER BY xp_contributed DESC", (mem["clan_id"],)).fetchall()
            c_dict["members"] = [dict(m) for m in members]
            c_dict["member_count"] = len(members)
            c_dict["achievements"] = [
                {"title": "🏆 Quán Quân Giải Đấu Mùa Hè 2026", "date": "10/09/2026", "badge": "Gold", "xp": "+15,000 XP"},
                {"title": "🥈 Á Quân Đấu Trường Clan Liên Trường", "date": "05/09/2026", "badge": "Silver", "xp": "+8,000 XP"},
                {"title": "⭐ Top 1 Bảng Xếp Hạng Tháng 8", "date": "31/08/2026", "badge": "SeasonTop", "xp": "+5,000 XP"},
            ]
            return {
                "has_clan": True,
                "clan": c_dict,
                "user_role": mem["role"],
                "xp_contributed": mem["xp_contributed"],
            }
        finally:
            db.close()

    # ── Tournaments, Events & Changelog API ───────────────────────────────────

    @router.get("/api/tournaments/featured")
    async def get_featured_tournament():
        db = get_db()
        try:
            row = db.execute(
                "SELECT * FROM tournaments WHERE is_featured=1 AND status != 'finished' ORDER BY created_at DESC LIMIT 1"
            ).fetchone()
        finally:
            db.close()
        if row:
            return {
                "id": row["id"], "title": row["title"], "tag": row["tag"],
                "description": row["description"], "rules": row["rules"] or "",
                "status": row["status"], "size": row["size"],
                "xp_multiplier": row["xp_multiplier"],
                "starts_at": row["starts_at"], "ends_at": row["ends_at"],
                "play_mode": row["play_mode"],
                "min_clan_members": row["min_clan_members"],
                "prize_json": json.loads(row["prize_json"] or "[]"),
                "is_featured": row["is_featured"],
            }
        return {
            "id": "tourney_summer_2026",
            "title": "Giải Đấu Toán Học Mùa Hè 2026",
            "tag": "GIẢI ĐẤU MÙA",
            "description": "Tranh tài cùng hơn 4,000 học sinh trên toàn quốc trong đấu trường toán học chuẩn hóa. Top 3 nhận huy hiệu độc quyền, điểm thưởng XP và Cúp Vinh Danh toàn quốc.",
            "status": "upcoming",
            "size": "large",
            "xp_multiplier": 1.5,
            "starts_at": "2026-08-28T00:00:00",
            "ends_at": "2026-09-10T23:59:59",
            "play_mode": "individual",
            "min_clan_members": 2,
            "prize_json": [
                {"tier": 1, "name": "Quán Quân (Vô Địch)", "prize": "5,000 XP + Cúp Vô Địch + Huy hiệu Vàng Độc Quyền"},
                {"tier": 2, "name": "Á Quân (Hạng Nhì)", "prize": "3,000 XP + Huy hiệu Bạc Độc Quyền"},
                {"tier": 3, "name": "Quý Quân (Hạng Ba)", "prize": "1,500 XP + Huy hiệu Đồng Độc Quyền"},
                {"tier": 4, "name": "Top 10 Chung Cuộc", "prize": "800 XP + Khung Avatar Danh Dự"},
            ],
            "is_featured": 1,
        }

    @router.get("/api/tournaments")
    async def list_tournaments(status: str = "", size: str = "", limit: int = 50):
        db = get_db()
        try:
            q = (
                "SELECT t.*, "
                "(SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) AS participant_count "
                "FROM tournaments t WHERE 1=1"
            )
            params = []
            if status:
                q += " AND t.status=?"; params.append(status)
            if size:
                q += " AND t.size=?"; params.append(size)
            q += " ORDER BY t.created_at DESC LIMIT ?"
            params.append(limit)
            rows = db.execute(q, params).fetchall()
            out = []
            for r in rows:
                d = dict(r)
                try:
                    d["prize_json"] = json.loads(d.get("prize_json") or "[]")
                except Exception:
                    d["prize_json"] = []
                out.append(d)
            return {"tournaments": out}
        finally:
            db.close()

    @router.post("/api/tournaments")
    async def create_tournament(request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")

            body = await request.json()
            size = body.get("size", "small")

            is_admin = bool(u["is_admin"])
            is_global_organizer = bool(
                db.execute(
                    "SELECT 1 FROM event_organizers WHERE user_id=? AND tournament_id='*'",
                    (str(u["id"]),),
                ).fetchone()
            )
            if not is_admin and not is_global_organizer:
                raise HTTPException(403, "Insufficient permissions to create tournaments")

            pending = 1 if (not is_admin and size == "large") else 0
            tid = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()
            xp_mult = 1.5 if size == "large" else 1.2

            db.execute(
                """INSERT INTO tournaments
                   (id, title, tag, description, rules, status, size, xp_multiplier, starts_at, ends_at,
                    play_mode, min_clan_members, max_participants, prize_json, is_featured,
                    created_by, pending_approval, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    tid,
                    body.get("title", "Giải Đấu Mới"),
                    body.get("tag", "Giải đấu"),
                    body.get("description", ""),
                    body.get("rules", ""),
                    "upcoming" if not pending else "pending_approval",
                    size, xp_mult,
                    body.get("starts_at", now),
                    body.get("ends_at", now),
                    body.get("play_mode", "individual"),
                    int(body.get("min_clan_members", 2)),
                    int(body.get("max_participants", 0)),
                    json.dumps(body.get("prize_json", [])),
                    int(body.get("is_featured", 0)),
                    str(u["id"]),
                    pending, now,
                ),
            )
            db.commit()
            return {"ok": True, "id": tid, "pending_approval": bool(pending)}
        finally:
            db.close()

    @router.get("/api/tournaments/{tid}")
    async def get_tournament(tid: str):
        db = get_db()
        try:
            row = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
            if not row:
                raise HTTPException(404, "Tournament not found")
            d = dict(row)
            d["prize_json"] = json.loads(d.get("prize_json") or "[]")
            return d
        finally:
            db.close()

    @router.put("/api/tournaments/{tid}")
    async def update_tournament(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")

            row = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
            if not row:
                raise HTTPException(404, "Tournament not found")

            is_admin = bool(u["is_admin"])
            is_organizer = bool(
                db.execute(
                    "SELECT 1 FROM event_organizers WHERE tournament_id=? AND user_id=?",
                    (tid, str(u["id"])),
                ).fetchone()
            )
            if not is_admin and not is_organizer:
                raise HTTPException(403, "Not authorized to edit this tournament")

            body = await request.json()
            updates = {}
            for key in [
                "title", "tag", "description", "rules", "status", "starts_at", "ends_at",
                "play_mode", "min_clan_members", "max_participants", "is_featured",
            ]:
                if key in body:
                    updates[key] = body[key]
            if "prize_json" in body:
                updates["prize_json"] = json.dumps(body["prize_json"])

            if "size" in body:
                new_size = body["size"]
                updates["size"] = new_size
                updates["xp_multiplier"] = 1.5 if new_size == "large" else 1.2
                if not is_admin and new_size == "large":
                    updates["pending_approval"] = 1
                    updates["status"] = "pending_approval"

            if updates:
                vals = list(updates.values()) + [tid]
                db.execute(
                    f"UPDATE tournaments SET {safe_update_columns(list(updates.keys()), _TOURNAMENT_FIELDS)} WHERE id=?",
                    vals,
                )
                db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.post("/api/tournaments/{tid}/approve")
    async def approve_tournament(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u or not u["is_admin"]:
                raise HTTPException(403, "Admin only")
            db.execute(
                "UPDATE tournaments SET pending_approval=0, status='upcoming', approved_by=? WHERE id=?",
                (str(u["id"]), tid),
            )
            db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.delete("/api/tournaments/{tid}")
    async def delete_tournament(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u or not u["is_admin"]:
                raise HTTPException(403, "Admin only")
            db.execute("DELETE FROM tournaments WHERE id=?", (tid,))
            db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.post("/api/tournaments/{tid}/register")
    async def register_tournament(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")

            tour = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
            if not tour:
                raise HTTPException(404, "Tournament not found")
            if tour["status"] not in ("upcoming", "active"):
                raise HTTPException(400, "Tournament is not open for registration")

            body = await request.json()
            clan_id = body.get("clan_id", "")
            existing = db.execute(
                "SELECT 1 FROM tournament_participants WHERE tournament_id=? AND user_id=?",
                (tid, str(u["id"])),
            ).fetchone()
            if existing:
                return {"ok": True, "already_registered": True, "play_url": f"/mrm/multiplayer?tournament={tid}&mode=tournament"}

            now = datetime.now(timezone.utc).isoformat()
            db.execute(
                """INSERT INTO tournament_participants (tournament_id, user_id, username, clan_id, registered_at)
                   VALUES (?,?,?,?,?)""",
                (tid, str(u["id"]), u["username"], clan_id, now),
            )
            db.commit()
            count = db.execute(
                "SELECT COUNT(*) as c FROM tournament_participants WHERE tournament_id=?", (tid,)
            ).fetchone()["c"]
            return {
                "ok": True,
                "registered": True,
                "participant_count": count,
                "play_url": f"/mrm/multiplayer?tournament={tid}&mode=tournament",
            }
        finally:
            db.close()

    @router.delete("/api/tournaments/{tid}/register")
    async def unregister_tournament(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")
            db.execute(
                "DELETE FROM tournament_participants WHERE tournament_id=? AND user_id=?",
                (tid, str(u["id"])),
            )
            db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.get("/api/tournaments/{tid}/participants")
    async def get_tournament_participants(tid: str, limit: int = 50):
        db = get_db()
        try:
            rows = db.execute(
                "SELECT * FROM tournament_participants WHERE tournament_id=? ORDER BY score DESC LIMIT ?",
                (tid, limit),
            ).fetchall()
            return {"participants": [dict(r) for r in rows]}
        finally:
            db.close()

    @router.get("/api/tournaments/{tid}/leaderboard")
    async def get_tournament_leaderboard(tid: str, limit: int = 10):
        db = get_db()
        try:
            rows = db.execute(
                """SELECT p.*, u.avatar_url FROM tournament_participants p
                   LEFT JOIN users u ON u.id = p.user_id
                   WHERE p.tournament_id=? ORDER BY p.score DESC LIMIT ?""",
                (tid, limit),
            ).fetchall()
            result = []
            for i, r in enumerate(rows):
                result.append({
                    "rank": i + 1,
                    "user_id": r["user_id"],
                    "username": r["username"],
                    "score": r["score"],
                    "matches_played": r["matches_played"],
                    "avatar_url": r["avatar_url"] or "",
                    "clan_id": r["clan_id"],
                })
            return {"leaderboard": result}
        finally:
            db.close()

    @router.post("/api/tournaments/{tid}/participants/{uid}/score")
    async def add_participant_score(tid: str, uid: str, request: Request):
        await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            tour = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
            if not tour:
                raise HTTPException(404, "Tournament not found")

            body = await request.json()
            points_earned = int(body.get("points", 0))
            xp_earned = int(body.get("xp", 0))
            multiplier = float(tour["xp_multiplier"]) if tour["xp_multiplier"] else 1.2
            bonus_xp = int(xp_earned * multiplier)

            db.execute(
                """UPDATE tournament_participants
                   SET score = score + ?, matches_played = matches_played + 1
                   WHERE tournament_id=? AND user_id=?""",
                (points_earned, tid, uid),
            )
            db.execute("UPDATE users SET xp = COALESCE(xp, 0) + ? WHERE id=?", (bonus_xp, uid))
            db.commit()
            return {"ok": True, "bonus_xp": bonus_xp, "multiplier": multiplier}
        finally:
            db.close()

    @router.get("/api/tournaments/{tid}/organizers")
    async def get_organizers(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u or not u["is_admin"]:
                raise HTTPException(403, "Admin only")
            rows = db.execute("SELECT * FROM event_organizers WHERE tournament_id=?", (tid,)).fetchall()
            return {"organizers": [dict(r) for r in rows]}
        finally:
            db.close()

    @router.post("/api/tournaments/{tid}/organizers")
    async def assign_organizer(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u or not u["is_admin"]:
                raise HTTPException(403, "Admin only")

            body = await request.json()
            target_uid = str(body.get("user_id", ""))
            role = body.get("role", "organizer")

            target = db.execute("SELECT * FROM users WHERE id=?", (target_uid,)).fetchone()
            if not target:
                raise HTTPException(404, "Target user not found")

            now = datetime.now(timezone.utc).isoformat()
            db.execute(
                """INSERT OR REPLACE INTO event_organizers (tournament_id, user_id, username, role, assigned_at)
                   VALUES (?,?,?,?,?)""",
                (tid, target_uid, target["username"], role, now),
            )
            db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.delete("/api/tournaments/{tid}/organizers/{uid}")
    async def remove_organizer(tid: str, uid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u or not u["is_admin"]:
                raise HTTPException(403, "Admin only")
            db.execute("DELETE FROM event_organizers WHERE tournament_id=? AND user_id=?", (tid, uid))
            db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.post("/api/organizers/grant-global")
    async def grant_global_organizer(request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u or not u["is_admin"]:
                raise HTTPException(403, "Admin only")

            body = await request.json()
            target_uid = str(body.get("user_id", ""))
            target = db.execute("SELECT * FROM users WHERE id=?", (target_uid,)).fetchone()
            if not target:
                raise HTTPException(404, "User not found")

            now = datetime.now(timezone.utc).isoformat()
            db.execute(
                """INSERT OR REPLACE INTO event_organizers (tournament_id, user_id, username, role, assigned_at)
                   VALUES ('*',?,?,'global_organizer',?)""",
                (target_uid, target["username"], now),
            )
            db.commit()
            return {"ok": True, "message": f"{target['username']} can now create small tournaments"}
        finally:
            db.close()

    @router.get("/api/tournaments/{tid}/rooms")
    async def get_tournament_rooms(tid: str):
        db = get_db()
        try:
            rows = db.execute(
                "SELECT * FROM tournament_rooms WHERE tournament_id=? AND status='waiting' ORDER BY created_at DESC",
                (tid,),
            ).fetchall()
            return {"rooms": [dict(r) for r in rows]}
        finally:
            db.close()

    @router.post("/api/tournaments/{tid}/rooms")
    async def create_tournament_room(tid: str, request: Request):
        identity, is_fb = await get_firebase_uid_or_backend_id(request)
        db = get_db()
        try:
            u = db.execute(
                "SELECT * FROM users WHERE firebase_uid=?" if is_fb else "SELECT * FROM users WHERE id=?",
                (identity,),
            ).fetchone()
            if not u:
                raise HTTPException(404, "User not found")

            reg = db.execute(
                "SELECT 1 FROM tournament_participants WHERE tournament_id=? AND user_id=? AND status='active'",
                (tid, str(u["id"])),
            ).fetchone()
            if not reg:
                raise HTTPException(403, "You must register for this tournament first")

            body = await request.json()
            room_mode = body.get("room_mode", "individual")
            clan_a_id = body.get("clan_a_id", "")
            clan_b_id = body.get("clan_b_id", "")
            max_players = int(body.get("max_players", 2))
            mathmap_id = body.get("mathmap_id", "")

            if room_mode == "clan" and clan_a_id:
                clan_role = db.execute(
                    "SELECT role FROM clan_members WHERE clan_id=? AND user_id=?",
                    (clan_a_id, str(u["id"])),
                ).fetchone()
                if not clan_role or clan_role["role"] not in ("owner", "leader", "sub_leader"):
                    raise HTTPException(403, "Only clan leader or sub-leader can create clan tournament rooms")

            rid = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()
            db.execute(
                """INSERT INTO tournament_rooms
                   (id, tournament_id, host_user_id, host_username, room_mode, clan_a_id, clan_b_id,
                    max_players, mathmap_id, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (rid, tid, str(u["id"]), u["username"], room_mode, clan_a_id, clan_b_id, max_players, mathmap_id, now),
            )
            db.commit()
            return {
                "ok": True,
                "room_id": rid,
                "redirect_url": f"/mrm/multiplayer?tournament={tid}&room={rid}&mode=tournament",
            }
        finally:
            db.close()

    @router.patch("/api/tournaments/{tid}/rooms/{rid}")
    async def update_tournament_room_status(tid: str, rid: str, request: Request):
        body = await request.json()
        new_status = body.get("status", "waiting")
        db = get_db()
        try:
            db.execute(
                "UPDATE tournament_rooms SET status=? WHERE id=? AND tournament_id=?",
                (new_status, rid, tid),
            )
            db.commit()
            return {"ok": True}
        finally:
            db.close()

    @router.get("/api/events")
    async def get_events():
        db = get_db()
        try:
            rows = db.execute("SELECT * FROM events ORDER BY created_at DESC LIMIT 20").fetchall()
        finally:
            db.close()
        if rows:
            return {"events": [dict(r) for r in rows]}
        return {
            "events": [
                {"id": "ev1", "status": "Sắp diễn ra", "date": "28/08", "title": "Thử thách Tốc độ Đại số 10 phút", "description": "Giải 20 câu trắc nghiệm tốc độ cao."},
                {"id": "ev2", "status": "Sắp diễn ra", "date": "05/09", "title": "Đại chiến Clan liên trường Mùa Thu", "description": "Vòng loại khu vực toàn quốc."},
                {"id": "ev3", "status": "Định kỳ", "date": "Hàng tuần", "title": "MathMap của tuần (Double XP)", "description": "Nhận x2 XP toàn bộ chủ đề."},
                {"id": "ev4", "status": "Sắp diễn ra", "date": "15/09", "title": "Đấu trường SAT Math 800", "description": "Bài thi chuẩn hóa quốc tế 54 câu hỏi tiếng Anh."},
            ]
        }

    @router.get("/api/changelog")
    async def get_changelog():
        db = get_db()
        try:
            rows = db.execute("SELECT * FROM changelog_entries ORDER BY date DESC LIMIT 20").fetchall()
        finally:
            db.close()
        if rows:
            return {"changelog": [dict(r) for r in rows]}
        return {
            "changelog": [
                {"id": "cl1", "date": "23/08/2026", "tag": "new", "tagLabel": "Mới", "title": "Ra mắt tính năng Math Clans & Đấu Nhóm thời gian thực", "description": "So tài trực tiếp theo cặp đấu với thanh điểm đồng bộ."},
                {"id": "cl2", "date": "18/08/2026", "tag": "improve", "tagLabel": "Nâng cấp", "title": "Tối ưu hóa tốc độ tải trang MathMap Detail & KaTeX Render", "description": "Giảm 40% thời gian tải trang chi tiết MathMap."},
                {"id": "cl3", "date": "12/08/2026", "tag": "new", "tagLabel": "Mới", "title": "Hệ thống Thảo luận & Báo cáo bình luận cộng đồng", "description": "Hỗ trợ hỏi đáp đa tầng dưới từng MathMap."},
            ]
        }

    return router
