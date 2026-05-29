import os, sqlite3, json, uuid, time, threading, base64
from functools import lru_cache

# pyrefly: ignore [untyped-import]
import requests as req_lib # pyright: ignore[reportMissingModuleSource]
import orjson # pyright: ignore[reportMissingImports]
from flask import Flask, request, jsonify, g, Response, stream_with_context
# pyrefly: ignore [untyped-import]
from flask_cors import CORS

# ── Firebase Admin SDK ────────────────────────────────────────────────────────
try:
    import firebase_admin
    from firebase_admin import credentials, auth as firebase_auth
    _fb_cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "")
    if _fb_cred_path and os.path.exists(_fb_cred_path):
        _fb_cred = credentials.Certificate(_fb_cred_path)
    else:
        # Fall back to Application Default Credentials (works with GOOGLE_APPLICATION_CREDENTIALS env var)
        _fb_cred = credentials.ApplicationDefault()
    if not firebase_admin._apps:
        firebase_admin.initialize_app(_fb_cred)
    _firebase_available = True
except Exception as _fb_init_err:
    print(f"[WARN] Firebase Admin SDK not initialised: {_fb_init_err}")
    _firebase_available = False
    firebase_auth = None

try:
    from flask_compress import Compress  # type: ignore
    _compress = True
except ImportError:
    _compress = False

# ── App ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
if _compress:
    # pyrefly: ignore [unbound-name]
    Compress(app)

CORS(app, resources={r"/api/*": {
    "origins": "*",
    "max_age": 3600,
}})

DB_PATH   = os.path.join(os.path.dirname(__file__), "duomath.db")
GROQ_BASE = "https://api.groq.com/openai/v1"
GROQ_KEY  = os.environ.get("GROQ_API_KEY", "")
SELF_URL  = os.environ.get("SELF_URL", "")


# ── Firebase token verification ───────────────────────────────────────────────
import jwt  # PyJWT

_google_certs = {}
_google_certs_expire = 0

def get_google_public_key(kid):
    global _google_certs, _google_certs_expire
    now = time.time()
    if not _google_certs or now > _google_certs_expire:
        try:
            res = req_lib.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com", timeout=5)
            if res.status_code == 200:
                _google_certs = res.json()
                cc = res.headers.get("Cache-Control", "")
                max_age = 3600
                for part in cc.split(","):
                    if "max-age" in part:
                        max_age = int(part.split("=")[1])
                _google_certs_expire = now + max_age
        except Exception as e:
            print(f"[WARN] Failed to fetch Google public keys: {e}")
    return _google_certs.get(kid)

def verify_firebase_token_manually(id_token):
    project_id = os.environ.get("FIREBASE_PROJECT_ID", "duosteam-be693")
    try:
        header = jwt.get_unverified_header(id_token)
        kid = header.get("kid")
        if not kid:
            raise Exception("No kid in JWT header")
        
        cert_str = get_google_public_key(kid)
        if not cert_str:
            raise Exception(f"Public key not found for kid: {kid}")
            
        decoded = jwt.decode(
            id_token,
            cert_str,
            algorithms=["RS256"],
            audience=project_id,
            issuer=f"https://securetoken.google.com/{project_id}"
        )
        return decoded
    except Exception as e:
        raise Exception(f"Manual token verification failed: {e}")


def get_firebase_uid():
    """Verify Firebase ID token from Authorization header, return uid or abort 401."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header."}), 401
    id_token = auth_header[7:]
    
    # Try Firebase Admin SDK if available
    if _firebase_available and firebase_auth is not None:
        try:
            decoded = firebase_auth.verify_id_token(id_token)
            return decoded["uid"]
        except Exception as sdk_err:
            print(f"[INFO] SDK token verification failed: {sdk_err}. Falling back to manual verification...")
            
    # Fallback to manual verification using PyJWT
    try:
        decoded = verify_firebase_token_manually(id_token)
        return decoded["sub"]  # Firebase UID is in the 'sub' claim
    except Exception as e:
        return jsonify({"error": f"Token verification failed: {e}"}), 401


def firebase_protected(fn):
    """Decorator: verify Firebase token, inject uid as first argument."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        result = get_firebase_uid()
        if isinstance(result, tuple):
            return result  # error response
        return fn(result, *args, **kwargs)
    return wrapper


# ── Cached system prompts ─────────────────────────────────────────────────────
@lru_cache(maxsize=4)
def cached_system_prompt(variant: str = "text") -> str:
    if variant == "image":
        return (
            "You are a Vietnamese math tutor for grades 10-12. "
            "Solve math problems briefly step-by-step."
        )
    return (
        "You are a concise Vietnamese math tutor for grades 10-12. "
        "Explain briefly step-by-step."
    )


# ── Keep-alive ────────────────────────────────────────────────────────────────
def _keep_alive():
    if not SELF_URL:
        return
    while True:
        time.sleep(14 * 60)
        try:
            req_lib.get(f"{SELF_URL}/api/health", timeout=10)
        except Exception:
            pass

threading.Thread(target=_keep_alive, daemon=True).start()


# ── Database ──────────────────────────────────────────────────────────────────
def _make_conn():
    conn = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES,
                           check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=-8000")
    conn.execute("PRAGMA temp_store=MEMORY")
    return conn

def get_db():
    if "db" not in g:
        g.db = _make_conn()
    return g.db

@app.teardown_appcontext
def close_db(_=None):
    db = g.pop("db", None)
    if db:
        db.close()

def init_db():
    conn = _make_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid TEXT   UNIQUE,
            email       TEXT    UNIQUE NOT NULL COLLATE NOCASE,
            username    TEXT    NOT NULL,
            password    TEXT    DEFAULT '',
            phone       TEXT    DEFAULT '',
            school      TEXT    DEFAULT '',
            grade       TEXT    DEFAULT '',
            avatar_url  TEXT    DEFAULT '',
            created_at  TEXT    DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS test_results (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            test_key    TEXT    NOT NULL,
            section     TEXT    NOT NULL,
            score       INTEGER NOT NULL,
            total       INTEGER NOT NULL,
            accuracy    REAL    DEFAULT 0,
            time_spent  INTEGER DEFAULT 0,
            answers     TEXT    NOT NULL DEFAULT '{}',
            taken_at    TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS minigame_results (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            lesson_slug TEXT    NOT NULL,
            mode        TEXT    NOT NULL,
            score       INTEGER NOT NULL,
            total       INTEGER NOT NULL,
            played_at   TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS sessions (
            session_id  TEXT    PRIMARY KEY,
            user_id     INTEGER,
            history     TEXT    DEFAULT '[]',
            created_at  TEXT    DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_test_user  ON test_results(user_id, taken_at DESC);
        CREATE INDEX IF NOT EXISTS idx_game_user  ON minigame_results(user_id, played_at DESC);
        CREATE INDEX IF NOT EXISTS idx_session_id ON sessions(session_id);
    """)
    # Migration: add firebase_uid column if it doesn't exist
    try:
        conn.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE")
        conn.commit()
    except Exception:
        pass  # Column already exists
    conn.close()

init_db()


# ── Helpers ───────────────────────────────────────────────────────────────────
def user_dict(row):
    return {
        "id":           row["id"],
        "firebase_uid": row["firebase_uid"] if "firebase_uid" in row.keys() else None,
        "email":        row["email"],
        "username":     row["username"],
        "name":         row["username"],
        "phone":        row["phone"],
        "school":       row["school"],
        "grade":        row["grade"],
        "avatar_url":   row["avatar_url"],
        "created_at":   row["created_at"],
    }

def test_dict(row):
    return {
        "id":         row["id"],
        "test_key":   row["test_key"],
        "section":    row["section"],
        "score":      row["score"],
        "total":      row["total"],
        "accuracy":   row["accuracy"],
        "time_spent": row["time_spent"],
        "answers":    json.loads(row["answers"] or "{}"),
        "taken_at":   row["taken_at"],
    }

def game_dict(row):
    return {
        "id":          row["id"],
        "lesson_slug": row["lesson_slug"],
        "mode":        row["mode"],
        "score":       row["score"],
        "total":       row["total"],
        "played_at":   row["played_at"],
    }

def _fetch_scores(db, uid: int) -> tuple:
    tests = db.execute(
        "SELECT * FROM test_results WHERE user_id=? ORDER BY taken_at DESC LIMIT 20", (uid,)
    ).fetchall()
    games = db.execute(
        "SELECT * FROM minigame_results WHERE user_id=? ORDER BY played_at DESC LIMIT 20", (uid,)
    ).fetchall()
    return [test_dict(t) for t in tests], [game_dict(g) for g in games]

def groq_headers():
    return {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}

def ensure_session(sid: str) -> list:
    conn = _make_conn()
    try:
        row = conn.execute("SELECT history FROM sessions WHERE session_id=?", (sid,)).fetchone()
        if row:
            return json.loads(row["history"] or "[]")
        conn.execute("INSERT INTO sessions (session_id, history) VALUES (?,?)", (sid, "[]"))
        conn.commit()
        return []
    finally:
        conn.close()

def save_history(sid: str, history: list):
    conn = _make_conn()
    try:
        conn.execute("UPDATE sessions SET history=? WHERE session_id=?",
                     (json.dumps(history[-40:]), sid))
        conn.commit()
    finally:
        conn.close()


# ── XP & Streak Calculation ───────────────────────────────────────────────────
def calculate_xp(score: int, total: int, accuracy: float) -> int:
    """
    Calculate XP points from test performance.
    Base XP = (score / total) * 100
    Bonus XP = accuracy > 80% ? +20 : accuracy > 60% ? +10 : 0
    """
    base_xp = max(10, int((score / max(total, 1)) * 100))
    bonus = 20 if accuracy >= 80 else (10 if accuracy >= 60 else 0)
    return base_xp + bonus

def get_user_xp(db, uid: int) -> int:
    """Calculate total XP from all test results."""
    rows = db.execute(
        "SELECT score, total, accuracy FROM test_results WHERE user_id=?", (uid,)
    ).fetchall()
    return sum(calculate_xp(r["score"], r["total"], r["accuracy"] or 0) for r in rows)

def get_user_streak(db, uid: int) -> tuple:
    """
    Return (current_streak, longest_streak) in days.
    current_streak: consecutive days with at least 1 test taken
    """
    rows = db.execute(
        "SELECT DATE(taken_at) as day FROM test_results WHERE user_id=? ORDER BY taken_at DESC",
        (uid,)
    ).fetchall()
    
    if not rows:
        return 0, 0

    from datetime import datetime, timedelta
    dates = [row["day"] for row in rows]
    unique_days = sorted(set(dates), reverse=True)

    if not unique_days:
        return 0, 0

    today = datetime.now().date()
    current_streak = 0
    check_date = today

    for day_str in unique_days:
        day = datetime.strptime(day_str, "%Y-%m-%d").date()
        if day == check_date or day == check_date - timedelta(days=1):
            current_streak += 1
            check_date = day
        else:
            break

    longest_streak = 1
    streak_count = 1
    for i in range(1, len(unique_days)):
        prev_day = datetime.strptime(unique_days[i-1], "%Y-%m-%d").date()
        curr_day = datetime.strptime(unique_days[i], "%Y-%m-%d").date()
        if (prev_day - curr_day).days == 1:
            streak_count += 1
            longest_streak = max(longest_streak, streak_count)
        else:
            streak_count = 1

    return current_streak, longest_streak


# ── Auth ───────────────────────────────────────────────────────────────────────

@app.route("/api/firebase-sync", methods=["POST"])
@firebase_protected
def firebase_sync(fb_uid):
    """Create or fetch a user row keyed by Firebase UID.
    Called by the frontend after Firebase signup/login."""
    d        = request.get_json(force=True) or {}
    email    = (d.get("email")    or "").strip().lower()
    username = (d.get("username") or "").strip() or email.split("@")[0]
    phone    = (d.get("phone")    or "").strip()
    school   = (d.get("school")   or "").strip()
    grade    = (d.get("grade")    or "").strip()

    if not email:
        return jsonify({"error": "email is required."}), 400

    db = get_db()
    row = db.execute("SELECT * FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if row:
        # User already exists - return their data
        test_results, game_results = _fetch_scores(db, row["id"])
        return jsonify({"user": user_dict(row), "test_results": test_results, "game_results": game_results})

    # Check if email already exists (e.g. legacy account) - link it
    row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if row:
        db.execute("UPDATE users SET firebase_uid=? WHERE id=?", (fb_uid, row["id"]))
        db.commit()
        test_results, game_results = _fetch_scores(db, row["id"])
        return jsonify({"user": user_dict(row), "test_results": test_results, "game_results": game_results})

    # New user
    cur = db.execute(
        "INSERT INTO users (firebase_uid, email, username, phone, school, grade)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        (fb_uid, email, username, phone, school, grade),
    )
    db.commit()
    row = db.execute("SELECT * FROM users WHERE id=?", (cur.lastrowid,)).fetchone()
    return jsonify({"user": user_dict(row), "test_results": [], "game_results": []}), 201


@app.route("/api/me", methods=["GET"])
@firebase_protected
def me(fb_uid):
    db  = get_db()
    row = db.execute("SELECT * FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify({"error": "User not found."}), 404
    test_results, game_results = _fetch_scores(db, row["id"])
    return jsonify({"user": user_dict(row), "test_results": test_results, "game_results": game_results})


@app.route("/api/me", methods=["PATCH"])
@firebase_protected
def update_me(fb_uid):
    d   = request.get_json(force=True) or {}
    db  = get_db()
    row = db.execute("SELECT * FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify({"error": "User not found."}), 404
    uid = row["id"]

    REQUIRED_NON_EMPTY = {"username"}
    ALLOWED = ["username", "phone", "school", "grade", "avatar_url"]
    sets, vals, errors = [], [], []

    for f in ALLOWED:
        if f not in d:
            continue
        val = str(d[f]).strip()
        if f in REQUIRED_NON_EMPTY and not val:
            errors.append(f"'{f}' cannot be empty.")
            continue
        if f == "username" and len(val) < 2:
            errors.append("Username must be at least 2 characters.")
            continue
        sets.append(f"{f}=?")
        vals.append(val)

    if errors:
        return jsonify({"error": " ".join(errors)}), 400
    if not sets:
        return jsonify({"error": "Nothing to update."}), 400

    vals.append(uid)
    db.execute(f"UPDATE users SET {', '.join(sets)} WHERE id=?", vals)
    db.commit()
    row = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    return jsonify({"user": user_dict(row)})


@app.route("/api/competitive-stats", methods=["GET"])
@firebase_protected
def get_competitive_stats(fb_uid):
    """Get user's XP, streaks, and ranking stats."""
    db  = get_db()
    row = db.execute("SELECT * FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify({"xp": 0, "current_streak": 0, "longest_streak": 0, "global_rank": 0})
    uid = row["id"]

    xp = get_user_xp(db, uid)
    current_streak, longest_streak = get_user_streak(db, uid)

    # Get user's global rank
    rank_rows = db.execute("""
        SELECT u.id FROM users u
        LEFT JOIN test_results tr ON u.id = tr.user_id
        GROUP BY u.id
        ORDER BY SUM(CASE WHEN tr.score IS NOT NULL THEN tr.score ELSE 0 END) DESC
    """).fetchall()

    rank = 1
    for i, r in enumerate(rank_rows):
        if r["id"] == uid:
            rank = i + 1
            break

    return jsonify({
        "xp": xp,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "global_rank": rank,
    })


# ── Scores ───────────────────────────────────────────────────────────────────────
@app.route("/api/test-result", methods=["POST"])
@firebase_protected
def save_test(fb_uid):
    db  = get_db()
    row = db.execute("SELECT id FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify({"error": "User not found."}), 404
    uid = row["id"]
    d   = request.get_json(force=True) or {}
    test_key   = d.get("test_key",  "")
    section    = d.get("section",   "")
    score      = int(d.get("score",  0))
    total      = int(d.get("total",  0))
    accuracy   = round((score / total * 100) if total else 0, 1)
    time_spent = int(d.get("time_spent", 0))
    answers    = json.dumps(d.get("answers", {}))

    if not test_key or not section:
        return jsonify({"error": "test_key and section are required."}), 400

    db.execute(
        "INSERT INTO test_results"
        " (user_id, test_key, section, score, total, accuracy, time_spent, answers)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (uid, test_key, section, score, total, accuracy, time_spent, answers),
    )
    db.commit()
    return jsonify({"saved": True, "accuracy": accuracy}), 201


@app.route("/api/test-results", methods=["GET"])
@firebase_protected
def get_tests(fb_uid):
    db  = get_db()
    row = db.execute("SELECT id FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify([]), 200
    rows = db.execute(
        "SELECT * FROM test_results WHERE user_id=? ORDER BY taken_at DESC", (row["id"],)
    ).fetchall()
    return jsonify([test_dict(r) for r in rows])


@app.route("/api/minigame-result", methods=["POST"])
@firebase_protected
def save_game(fb_uid):
    db  = get_db()
    row = db.execute("SELECT id FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify({"error": "User not found."}), 404
    uid = row["id"]
    d   = request.get_json(force=True) or {}
    slug  = d.get("lesson_slug", "")
    mode  = d.get("mode",  "mc")
    score = int(d.get("score", 0))
    total = int(d.get("total", 0))

    if not slug:
        return jsonify({"error": "lesson_slug is required."}), 400

    db.execute(
        "INSERT INTO minigame_results (user_id, lesson_slug, mode, score, total)"
        " VALUES (?, ?, ?, ?, ?)",
        (uid, slug, mode, score, total),
    )
    db.commit()
    return jsonify({"saved": True}), 201


@app.route("/api/minigame-results", methods=["GET"])
@firebase_protected
def get_games(fb_uid):
    db  = get_db()
    row = db.execute("SELECT id FROM users WHERE firebase_uid=?", (fb_uid,)).fetchone()
    if not row:
        return jsonify([]), 200
    rows = db.execute(
        "SELECT * FROM minigame_results WHERE user_id=? ORDER BY played_at DESC", (row["id"],)
    ).fetchall()
    return jsonify([game_dict(r) for r in rows])


# ── Leaderboard ───────────────────────────────────────────────────────────────
@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    """
    Public endpoint — no JWT required.
    For every user, take their BEST score on each (test_key, section) pair,
    then SUM those bests → total_points. Calculate XP and streaks. Return top 20.
    """
    db   = get_db()
    rows = db.execute("""
        SELECT
            u.id           AS user_id,
            u.username,
            u.school,
            u.grade,
            SUM(best.best_score) AS total_points,
            SUM(best.best_total) AS total_possible,
            COUNT(*)             AS sections_done
        FROM users u
        JOIN (
            SELECT
                user_id,
                test_key,
                section,
                MAX(score) AS best_score,
                total      AS best_total
            FROM test_results
            GROUP BY user_id, test_key, section
        ) AS best ON best.user_id = u.id
        GROUP BY u.id
        ORDER BY total_points DESC, sections_done DESC
        LIMIT 20
    """).fetchall()

    result = []
    for i, r in enumerate(rows):
        tp  = r["total_points"]  or 0
        tpo = r["total_possible"] or 1
        user_id = r["user_id"]
        xp = get_user_xp(db, user_id)
        current_streak, longest_streak = get_user_streak(db, user_id)
        
        result.append({
            "rank":           i + 1,
            "user_id":        user_id,
            "username":       r["username"],
            "school":         r["school"] or "",
            "grade":          r["grade"]  or "",
            "total_points":   tp,
            "total_possible": tpo,
            "sections_done":  r["sections_done"],
            "accuracy":       round(tp / tpo * 100, 1),
            "xp":             xp,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
        })
    return jsonify(result)


# ── Sessions ──────────────────────────────────────────────────────────────────
@app.route("/api/session/new", methods=["POST"])
def new_session():
    sid = str(uuid.uuid4())
    db  = get_db()
    db.execute("INSERT INTO sessions (session_id, history) VALUES (?,?)", (sid, "[]"))
    db.commit()
    return jsonify({"session_id": sid, "message": "Session created."})


@app.route("/api/session/<session_id>/reset", methods=["POST"])
def reset_session(session_id):
    db  = get_db()
    row = db.execute("SELECT session_id FROM sessions WHERE session_id=?", (session_id,)).fetchone()
    if row:
        db.execute("UPDATE sessions SET history=? WHERE session_id=?", ("[]", session_id))
        db.commit()
        return jsonify({"message": "Session reset."})
    return jsonify({"error": "Session not found."}), 404


@app.route("/api/session/<session_id>/history", methods=["GET"])
def get_history(session_id):
    db  = get_db()
    row = db.execute("SELECT history FROM sessions WHERE session_id=?", (session_id,)).fetchone()
    if row:
        return jsonify({"history": json.loads(row["history"] or "[]")})
    return jsonify({"error": "Session not found."}), 404


# ── Chat ──────────────────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    d            = request.get_json(force=True) or {}
    session_id   = d.get("session_id") or str(uuid.uuid4())
    user_message = (d.get("message") or "").strip()
    image_data   = d.get("image")
    use_stream   = d.get("stream", False)

    if not user_message:
        return jsonify({"error": "message is required."}), 400

    history = ensure_session(session_id)

    if image_data:
        if "," in image_data:
            header, b64 = image_data.split(",", 1)
            media_type  = header.split(":")[1].split(";")[0]
        else:
            b64, media_type = image_data, "image/jpeg"

        # Send directly to vision model (OCR removed — exceeds 512 MB free tier RAM)
        user_content = [
            {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
            {"type": "text",      "text": user_message},
        ]
        model         = "meta-llama/llama-4-scout-17b-16e-instruct"
        system_prompt = cached_system_prompt("image")
        history.append({"role": "user", "content": f"[Image] {user_message}"})
    else:
        user_content  = user_message
        model         = "llama-3.1-8b-instant"
        system_prompt = cached_system_prompt("text")
        history.append({"role": "user", "content": user_message})

    context_history = history[-5:-1]
    messages = (
        [{"role": "system", "content": system_prompt}]
        + context_history
        + [{"role": "user", "content": user_content}]
    )

    payload = {
        "model":       model,
        "messages":    messages,
        "max_tokens":  1024,
        "temperature": 0.3,
        "stream":      use_stream,
    }

    if use_stream:
        def generate():
            full_reply = []
            try:
                with req_lib.post(
                    f"{GROQ_BASE}/chat/completions",
                    headers=groq_headers(), json=payload,
                    stream=True, timeout=(3, 15),
                ) as resp:
                    resp.raise_for_status()
                    for raw_line in resp.iter_lines():
                        if not raw_line:
                            continue
                        line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
                        if line.startswith("data: "):
                            line = line[6:]
                        if line == "[DONE]":
                            break
                        try:
                            chunk = json.loads(line)
                            token = chunk["choices"][0]["delta"].get("content", "")
                            if token:
                                full_reply.append(token)
                                yield f"data: {orjson.dumps({'token': token, 'session_id': session_id}).decode()}\n\n"
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue
            except Exception as e:
                yield f"data: {orjson.dumps({'error': str(e)}).decode()}\n\n"
                return

            reply_text = "".join(full_reply)
            history.append({"role": "assistant", "content": reply_text})
            save_history(session_id, history)
            yield f"data: {orjson.dumps({'done': True, 'session_id': session_id}).decode()}\n\n"

        return Response(
            # pyrefly: ignore [no-matching-overload]
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control":               "no-cache",
                "X-Accel-Buffering":           "no",
                "Access-Control-Allow-Origin": "*",
            },
        )

    try:
        resp  = req_lib.post(f"{GROQ_BASE}/chat/completions",
                              headers=groq_headers(),
                              json={**payload, "stream": False},
                              timeout=(3, 15))
        resp.raise_for_status()
        reply = resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return jsonify({"error": True, "reply": f"AI unavailable: {e}"}), 502

    history.append({"role": "assistant", "content": reply})
    save_history(session_id, history)
    return jsonify({"reply": reply, "session_id": session_id, "history_length": len(history)})


# ── Translate ─────────────────────────────────────────────────────────────────
@app.route("/api/translate", methods=["POST"])
def translate():
    d    = request.get_json(force=True) or {}
    text = (d.get("text") or "").strip()[:500]
    if not text:
        return jsonify({"error": "text is required."}), 400

    prompt = (
        "Translate this English math text to Vietnamese. "
        "Reply ONLY with JSON (no markdown): "
        '{"translation":"...","summary":"...","words":['
        '{"word":"...","type":"...","pronunciation":"...","vietnamese":"...","example":"..."}]}\n\n'
        f"Text: {text}"
    )
    payload = {
        "model":       "llama-3.1-8b-instant",
        "messages":    [
            {"role": "system", "content": "You are a JSON-only translation API. Output only the JSON object."},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens":  400,
        "temperature": 0.2,
    }

    try:
        resp  = req_lib.post(f"{GROQ_BASE}/chat/completions",
                              headers=groq_headers(), json=payload, timeout=(3, 15))
        resp.raise_for_status()
        raw   = resp.json()["choices"][0]["message"]["content"]
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return jsonify(json.loads(clean))
    except json.JSONDecodeError:
        # pyrefly: ignore [unbound-name]
        return jsonify({"error": True, "raw": raw})
    except Exception as e:
        return jsonify({"error": True, "raw": str(e)}), 502


# ── Health ────────────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    t0 = time.perf_counter()
    try:
        get_db().execute("SELECT 1").fetchone()
        db_ms, db_ok = round((time.perf_counter() - t0) * 1000, 2), True
    except Exception:
        db_ms, db_ok = -1, False
    return jsonify({
        "status":        "ok" if db_ok else "degraded",
        "service":       "DuoMath API v3 (Flask)",
        "db_latency_ms": db_ms,
        "keep_alive":    bool(SELF_URL),
        "text_model":    "llama-3.1-8b-instant",
        "vision_model":  "meta-llama/llama-4-scout-17b-16e-instruct",
    })


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"DuoMath API v3 (Flask) -> http://localhost:{port}")
    app.run(host="0.0.0.0", port=port,
            debug=os.environ.get("FLASK_ENV") != "production",
            threaded=True)
