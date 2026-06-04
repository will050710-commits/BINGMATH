# backend/main.py  —  DuoMath FastAPI Backend (v4 — async upgrade)
# ─────────────────────────────────────────────────────────────────────────────
# Full async port of server.py (Flask v3) → FastAPI + httpx
# Run with:  uvicorn main:app --host 0.0.0.0 --port $PORT
# ─────────────────────────────────────────────────────────────────────────────

import os, sqlite3, json, uuid, time, asyncio, base64, io
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from contextlib import asynccontextmanager

import httpx # pyright: ignore[reportMissingImports]
import orjson
from fastapi import FastAPI, Request, HTTPException, Depends # pyright: ignore[reportMissingImports]
from fastapi.responses import JSONResponse, StreamingResponse # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from fastapi.middleware.gzip import GZipMiddleware # pyright: ignore[reportMissingImports]

from werkzeug.security import generate_password_hash, check_password_hash # pyright: ignore[reportMissingImports]

# ── JWT (lightweight PyJWT) ───────────────────────────────────────────────────
import jwt as pyjwt # pyright: ignore[reportMissingImports]

JWT_SECRET    = os.environ.get("JWT_SECRET", "duomath-dev-secret-CHANGE-IN-PROD")
JWT_ALGORITHM = "HS256"
ACCESS_EXP    = timedelta(hours=12)
REFRESH_EXP   = timedelta(days=30)

def _create_token(identity: str, expires: timedelta) -> str:
    payload = {
        "sub": identity,
        "exp": datetime.now(timezone.utc) + expires,
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_access_token(identity: str) -> str:
    return _create_token(identity, ACCESS_EXP)

def create_refresh_token(identity: str) -> str:
    return _create_token(identity, REFRESH_EXP)

def decode_token(token: str) -> str:
    """Return the 'sub' (user id string) or raise HTTPException 401."""
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

def get_identity(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    return decode_token(auth[7:])

# ── OCR (optional) ───────────────────────────────────────────────────────────
try:
    # pyrefly: ignore [missing-import]
    import easyocr # pyright: ignore[reportMissingImports]
    ocr_reader = easyocr.Reader(['vi', 'en'], gpu=False)
    _ocr_available = True
except ImportError:
    ocr_reader = None
    _ocr_available = False

# ── Config ────────────────────────────────────────────────────────────────────
DB_PATH   = os.path.join(os.path.dirname(__file__), "duomath.db")
GROQ_BASE = "https://api.groq.com/openai/v1"
GROQ_KEY  = os.environ.get("GROQ_API_KEY", "")
SELF_URL  = os.environ.get("SELF_URL", "")

# ── Cached prompts ───────────────────────────────────────────────────────────
@lru_cache(maxsize=4)
def cached_system_prompt(variant: str = "text") -> str:
    math_formatting_guide = (
        "\nIMPORTANT MATH FORMATTING RULES:\n"
        "- Write ALL mathematical formulas, variables, and equations using LaTeX.\n"
        "- Use double dollar signs '$$ ... $$' for block/display formulas (always on a separate line).\n"
        "- Use single dollar signs '$ ... $' for inline formulas (e.g., $x = 2$, $y = ax^2$).\n"
        "- Never use plain text for variables (write $x$ instead of x, $a$ instead of a).\n"
        "- Keep explanations in brief, bulleted step-by-step format."
    )
    if variant == "image":
        return (
            "You are a Vietnamese math tutor for grades 10-12. "
            "Solve math problems briefly step-by-step."
            + math_formatting_guide
        )
    return (
        "You are a concise Vietnamese math tutor for grades 10-12. "
        "Explain briefly step-by-step."
        + math_formatting_guide
    )

# ── LightRAG-style Mathematical Knowledge Graph & Retriever ────────────────
MATH_CONCEPT_GRAPH = {
    "nodes": {
        "phuong_trinh_bac_hai": {
            "id": "phuong_trinh_bac_hai",
            "name": "Phương trình bậc hai",
            "english_name": "Quadratic Equation",
            "keywords": ["phương trình bậc 2", "phương trình bậc hai", "quadratic equation", "quadratic"],
            "definition": "Phương trình có dạng ax^2 + bx + c = 0 (với a khác 0).",
            "formulas": "ax^2 + bx + c = 0 (a \\neq 0)\nNghiệm: x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}",
            "examples": "Giải x^2 - 5x + 6 = 0. Ta có a=1, b=-5, c=6. Delta = 25 - 24 = 1 > 0. Nghiệm x1=3, x2=2."
        },
        "biet_thuc_delta": {
            "id": "biet_thuc_delta",
            "name": "Biệt thức Delta",
            "english_name": "Discriminant Delta",
            "keywords": ["delta", "biệt thức", "discriminant"],
            "definition": "Giá trị đại số dùng để xác định số lượng và tính chất nghiệm của phương trình bậc hai.",
            "formulas": "\\Delta = b^2 - 4ac\n- \\Delta > 0: 2 nghiệm phân biệt.\n- \\Delta = 0: 1 nghiệm kép.\n- \\Delta < 0: vô nghiệm thực.",
            "examples": "Với x^2 + x + 1 = 0, Delta = 1^2 - 4(1)(1) = -3 < 0 -> Phương trình vô nghiệm."
        },
        "he_thuc_vi_et": {
            "id": "he_thuc_vi_et",
            "name": "Hệ thức Vi-ét",
            "english_name": "Vieta's Formulas",
            "keywords": ["vi-ét", "viet", "viét", "vieta"],
            "definition": "Mối quan hệ giữa các nghiệm của phương trình đa thức và các hệ số của nó.",
            "formulas": "Với phương trình bậc hai ax^2 + bx + c = 0:\n- Tổng nghiệm: S = x_1 + x_2 = -\\frac{b}{a}\n- Tích nghiệm: P = x_1 \\cdot x_2 = \\frac{c}{a}",
            "examples": "Nhẩm nghiệm x^2 - 7x + 12 = 0. Có S = 7, P = 12. Hai nghiệm là x1=3, x2=4."
        },
        "dao_ham": {
            "id": "dao_ham",
            "name": "Đạo hàm",
            "english_name": "Derivative",
            "keywords": ["đạo hàm", "derivative", "tính đạo hàm", "đạo hàm cấp"],
            "definition": "Tỉ số giữa số gia của hàm số và số gia của đối số tại một điểm khi số gia của đối số tiến dần về 0. Đại diện cho tốc độ biến thiên.",
            "formulas": "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}\nCông thức cơ bản: (x^n)' = n x^{n-1}, (\\sin x)' = \\cos x, (e^x)' = e^x",
            "examples": "Đạo hàm của f(x) = 3x^2 - 5x là f'(x) = 6x - 5."
        },
        "cuc_tri": {
            "id": "cuc_tri",
            "name": "Cực trị hàm số",
            "english_name": "Extrema of Functions",
            "keywords": ["cực trị", "cực đại", "cực tiểu", "extrema", "local maximum", "local minimum"],
            "definition": "Các điểm mà tại đó giá trị hàm số lớn nhất hoặc nhỏ nhất trong một khoảng lân cận. Điểm cực trị là nghiệm của f'(x) = 0 hoặc làm f'(x) không xác định và đạo hàm đổi dấu khi qua điểm đó.",
            "formulas": "Quy tắc 1: Nếu f'(x) đổi dấu từ dương sang âm khi qua x0 -> x0 là điểm cực đại.\nQuy tắc 2: Nếu f'(x0) = 0 và f''(x0) > 0 -> x0 là điểm cực tiểu.",
            "examples": "Tìm cực trị y = x^2 - 4x. y' = 2x - 4. y' = 0 <=> x = 2. Vì y'' = 2 > 0 nên x = 2 là điểm cực tiểu."
        },
        "tiem_can": {
            "id": "tiem_can",
            "name": "Đường tiệm cận",
            "english_name": "Asymptote",
            "keywords": ["tiệm cận", "tiệm cận ngang", "tiệm cận đứng", "tiệm cận xiên", "asymptote"],
            "definition": "Đường thẳng mà đồ thị hàm số tiến gần vô hạn nhưng không bao giờ cắt (hoặc chỉ cắt ở vô cực) khi biến số tiến ra vô cùng hoặc điểm gián đoạn.",
            "formulas": "- Tiệm cận đứng: x = x0 nếu \\lim_{x \\to x0} f(x) = \\pm\\infty\n- Tiệm cận ngang: y = y0 nếu \\lim_{x \\to \\pm\\infty} f(x) = y0",
            "examples": "Hàm số y = (2x+1)/(x-1) có tiệm cận đứng x=1 và tiệm cận ngang y=2."
        },
        "tich_phan": {
            "id": "tich_phan",
            "name": "Tích phân",
            "english_name": "Integral",
            "keywords": ["tích phân", "nguyên hàm", "integral", "integration", "antiderivative"],
            "definition": "Phép toán ngược của đạo hàm (nguyên hàm), đại diện cho diện tích hình phẳng giới hạn bởi đồ thị hàm số.",
            "formulas": "Công thức Newton-Leibniz: \\int_a^b f(x) dx = F(b) - F(a)\nCông thức tích phân từng phần: \\int u dv = uv - \\int v du",
            "examples": "Tính \\int_0^1 x dx = [x^2 / 2]_0^1 = 1/2."
        },
        "gioi_han": {
            "id": "gioi_han",
            "name": "Giới hạn",
            "english_name": "Limit",
            "keywords": ["giới hạn", "limit", "lim", "tiến tới"],
            "definition": "Giá trị mà một hàm số hoặc một dãy số tiến gần đến khi biến số hoặc chỉ số tiến đến một giá trị nào đó.",
            "formulas": "\\lim_{x \\to x_0} f(x) = L\nMột số giới hạn đặc biệt: \\lim_{x \\to 0} \\frac{\\sin x}{x} = 1, \\lim_{n \\to \\infty} (1 + \\frac{1}{n})^n = e",
            "examples": "Tính lim (x->2) (x^2 - 4)/(x - 2) = lim (x->2) (x+2) = 4."
        }
    },
    "edges": [
        {"source": "phuong_trinh_bac_hai", "target": "biet_thuc_delta", "relation": "sử dụng để xác định số lượng và tính chất nghiệm"},
        {"source": "phuong_trinh_bac_hai", "target": "he_thuc_vi_et", "relation": "áp dụng hệ thức để tìm nhanh tổng và tích hai nghiệm"},
        {"source": "biet_thuc_delta", "target": "he_thuc_vi_et", "relation": "được kiểm tra trước để đảm bảo phương trình có nghiệm trước khi áp dụng hệ thức"},
        {"source": "dao_ham", "target": "cuc_tri", "relation": "được lập bảng xét dấu và tìm nghiệm f'(x)=0 để xác định điểm cực trị"},
        {"source": "dao_ham", "target": "tich_phan", "relation": "tích phân là phép toán ngược của đạo hàm (nguyên hàm)"},
        {"source": "gioi_han", "target": "tiem_can", "relation": "dùng giới hạn ra vô cực hoặc giới hạn một bên để tìm đường tiệm cận"},
        {"source": "gioi_han", "target": "dao_ham", "relation": "định nghĩa đạo hàm được xây dựng dựa trên giới hạn tỉ số số gia"}
    ]
}

def extract_graph_entities(query: str) -> list:
    matched_ids = []
    query_lower = query.lower()
    for node_id, node_data in MATH_CONCEPT_GRAPH["nodes"].items():
        if node_id in query_lower:
            matched_ids.append(node_id)
            continue
        if node_data["name"].lower() in query_lower:
            matched_ids.append(node_id)
            continue
        if node_data["english_name"].lower() in query_lower:
            matched_ids.append(node_id)
            continue
        for kw in node_data["keywords"]:
            if kw in query_lower:
                matched_ids.append(node_id)
                break
    return matched_ids

def retrieve_math_context(query: str) -> str:
    matched_ids = extract_graph_entities(query)
    local_contexts = []
    seen_neighbors = set()
    
    for node_id in matched_ids:
        node = MATH_CONCEPT_GRAPH["nodes"][node_id]
        node_ctx = (
            f"### Khái niệm: {node['name']} ({node['english_name']})\n"
            f"- Định nghĩa: {node['definition']}\n"
            f"- Công thức quan trọng:\n{node['formulas']}\n"
            f"- Ví dụ áp dụng: {node['examples']}\n"
        )
        local_contexts.append(node_ctx)
        
        relations = []
        for edge in MATH_CONCEPT_GRAPH["edges"]:
            if edge["source"] == node_id:
                target_node = MATH_CONCEPT_GRAPH["nodes"][edge["target"]]
                relations.append(f"  * Có liên quan đến '{target_node['name']}' qua mối quan hệ: {edge['relation']}.")
                if edge["target"] not in matched_ids and edge["target"] not in seen_neighbors:
                    seen_neighbors.add(edge["target"])
            elif edge["target"] == node_id:
                source_node = MATH_CONCEPT_GRAPH["nodes"][edge["source"]]
                relations.append(f"  * Được liên kết từ '{source_node['name']}' qua mối quan hệ: {edge['relation']}.")
                if edge["source"] not in matched_ids and edge["source"] not in seen_neighbors:
                    seen_neighbors.add(edge["source"])
                    
        if relations:
            local_contexts.append("- Mối quan hệ trong hệ thống:\n" + "\n".join(relations) + "\n")
            
    if seen_neighbors:
        neighbor_ctxs = []
        for n_id in seen_neighbors:
            n_node = MATH_CONCEPT_GRAPH["nodes"][n_id]
            neighbor_ctxs.append(f"  * {n_node['name']}: {n_node['definition']} (Công thức: {n_node['formulas'].splitlines()[0] if n_node['formulas'] else ''})")
        local_contexts.append("### Khái niệm liên quan lân cận:\n" + "\n".join(neighbor_ctxs) + "\n")
        
    global_context = (
        "### Hướng dẫn gia sư toán bậc trung học (Lớp 10-12):\n"
        "- Trình bày giải thích toán học ngắn gọn, rõ ràng theo từng bước (Step-by-step).\n"
        "- BẮT BUỘC sử dụng ký hiệu LaTeX cho các công thức toán:\n"
        "  * Dùng $$ ... $$ cho phương trình độc lập (block math, ví dụ: $$ax^2 + bx + c = 0$$).\n"
        "  * Dùng $ ... $ cho biến số, công thức nằm trong dòng (inline math, ví dụ: $x$, $y = ax^2$).\n"
        "- Luôn đối chiếu kỹ các công thức toán học và biệt thức Delta, hệ thức Vi-ét khi học sinh hỏi về phương trình bậc hai hoặc cực trị.\n"
        "- Giải thích bằng tiếng Việt một cách tự nhiên và ngắn gọn."
    )
    
    if matched_ids:
        joined_local = "\n".join(local_contexts)
        hybrid_context = (
            f"=== BẢN ĐỒ TRI THỨC TOÁN HỌC (Retrieved Concept Graph - Local Mode) ===\n"
            f"{joined_local}\n"
            f"=== HƯỚNG DẪN HỆ THỐNG TOÀN CỤC (Global Mode) ===\n"
            f"{global_context}\n"
            f"========================================================================\n"
        )
    else:
        hybrid_context = (
            f"=== HƯỚNG DẪN HỆ THỐNG TOÀN CỤC (Global Mode) ===\n"
            f"{global_context}\n"
            f"========================================================================\n"
        )
        
    return hybrid_context

def extract_text_from_image(image_bytes: bytes) -> str:
    if not _ocr_available or ocr_reader is None:
        return ""
    try:
        from PIL import Image # pyright: ignore[reportMissingImports]
        img = Image.open(io.BytesIO(image_bytes))
        result = ocr_reader.readtext(img, detail=0)
        return "\n".join(result)
    except Exception:
        return ""

# ── Database (sync — sqlite3 doesn't need async driver) ──────────────────────
def _make_conn():
    conn = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES,
                           check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=-8000")
    conn.execute("PRAGMA temp_store=MEMORY")
    return conn

def init_db():
    conn = _make_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            email       TEXT    UNIQUE NOT NULL COLLATE NOCASE,
            username    TEXT    NOT NULL,
            password    TEXT    NOT NULL,
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
    conn.commit()
    conn.close()

def get_db():
    return _make_conn()

# ── Helpers ───────────────────────────────────────────────────────────────────
def user_dict(row):
    return {
        "id": row["id"], "email": row["email"],
        "username": row["username"], "name": row["username"],
        "phone": row["phone"], "school": row["school"],
        "grade": row["grade"], "avatar_url": row["avatar_url"],
        "created_at": row["created_at"],
    }

def test_dict(row):
    return {
        "id": row["id"], "test_key": row["test_key"],
        "section": row["section"], "score": row["score"],
        "total": row["total"], "accuracy": row["accuracy"],
        "time_spent": row["time_spent"],
        "answers": json.loads(row["answers"] or "{}"),
        "taken_at": row["taken_at"],
    }

def game_dict(row):
    return {
        "id": row["id"], "lesson_slug": row["lesson_slug"],
        "mode": row["mode"], "score": row["score"],
        "total": row["total"], "played_at": row["played_at"],
    }

def _fetch_scores(db, uid: int):
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
    db = get_db()
    try:
        row = db.execute("SELECT history FROM sessions WHERE session_id=?", (sid,)).fetchone()
        if row:
            return json.loads(row["history"] or "[]")
        db.execute("INSERT INTO sessions (session_id, history) VALUES (?,?)", (sid, "[]"))
        db.commit()
        return []
    finally:
        db.close()

def save_history(sid: str, history: list):
    db = get_db()
    try:
        db.execute("UPDATE sessions SET history=? WHERE session_id=?",
                   (json.dumps(history[-40:]), sid))
        db.commit()
    finally:
        db.close()

# ── Keep-alive background task ────────────────────────────────────────────────
async def _keep_alive():
    if not SELF_URL:
        return
    async with httpx.AsyncClient() as client:
        while True:
            await asyncio.sleep(14 * 60)
            try:
                await client.get(f"{SELF_URL}/api/health", timeout=10)
            except Exception:
                pass

# ── App lifecycle ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(application):
    init_db()
    task = asyncio.create_task(_keep_alive())
    yield
    task.cancel()

app = FastAPI(title="DuoMath API v4", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# ── Shared httpx client ──────────────────────────────────────────────────────
_http_client: httpx.AsyncClient | None = None

async def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(connect=3, read=15, write=5, pool=5))
    return _http_client


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/signup")
async def signup(request: Request):
    d = await request.json()
    email    = (d.get("email")    or "").strip().lower()
    username = (d.get("username") or "").strip()
    password = (d.get("password") or "").strip()
    phone    = (d.get("phone")    or "").strip()
    school   = (d.get("school")   or "").strip()
    grade    = (d.get("grade")    or "").strip()

    if not email or not username or not password:
        raise HTTPException(400, "Email, username and password are required.")
    if len(password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    if len(username) < 2:
        raise HTTPException(400, "Username must be at least 2 characters.")

    db = get_db()
    try:
        if db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone():
            raise HTTPException(409, "An account with this email already exists.")

        cur = db.execute(
            "INSERT INTO users (email, username, password, phone, school, grade)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (email, username, generate_password_hash(password), phone, school, grade),
        )
        db.commit()
        new_id = cur.lastrowid
        row = db.execute("SELECT * FROM users WHERE id=?", (new_id,)).fetchone()

        return JSONResponse({
            "access_token":  create_access_token(str(new_id)),
            "refresh_token": create_refresh_token(str(new_id)),
            "user":          user_dict(row),
            "test_results":  [],
            "game_results":  [],
        }, status_code=201)
    finally:
        db.close()


@app.post("/api/login")
async def login(request: Request):
    d = await request.json()
    email    = (d.get("email")    or "").strip().lower()
    password = (d.get("password") or "").strip()

    if not email or not password:
        raise HTTPException(400, "Email and password are required.")

    db = get_db()
    try:
        row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not row or not check_password_hash(row["password"], password):
            raise HTTPException(401, "Invalid email or password.")

        uid = row["id"]
        test_results, game_results = _fetch_scores(db, uid)
        return JSONResponse({
            "access_token":  create_access_token(str(uid)),
            "refresh_token": create_refresh_token(str(uid)),
            "user":          user_dict(row),
            "test_results":  test_results,
            "game_results":  game_results,
        })
    finally:
        db.close()


@app.post("/api/refresh")
async def refresh_token(request: Request):
    identity = get_identity(request)
    return JSONResponse({"access_token": create_access_token(identity)})


@app.get("/api/me")
async def me(request: Request):
    uid = int(get_identity(request))
    db = get_db()
    try:
        row = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
        if not row:
            raise HTTPException(404, "User not found.")
        test_results, game_results = _fetch_scores(db, uid)
        return JSONResponse({
            "user": user_dict(row),
            "test_results": test_results,
            "game_results": game_results,
        })
    finally:
        db.close()


@app.patch("/api/me")
async def update_me(request: Request):
    uid = int(get_identity(request))
    d = await request.json()
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
        raise HTTPException(400, " ".join(errors))
    if not sets:
        raise HTTPException(400, "Nothing to update.")

    db = get_db()
    try:
        vals.append(uid)
        db.execute(f"UPDATE users SET {', '.join(sets)} WHERE id=?", vals)
        db.commit()
        row = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
        return JSONResponse({"user": user_dict(row)})
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  SCORES
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/test-result")
async def save_test(request: Request):
    uid = int(get_identity(request))
    d = await request.json()
    test_key   = d.get("test_key", "")
    section    = d.get("section", "")
    score      = int(d.get("score", 0))
    total      = int(d.get("total", 0))
    accuracy   = round((score / total * 100) if total else 0, 1)
    time_spent = int(d.get("time_spent", 0))
    answers    = json.dumps(d.get("answers", {}))

    if not test_key or not section:
        raise HTTPException(400, "test_key and section are required.")

    db = get_db()
    try:
        db.execute(
            "INSERT INTO test_results"
            " (user_id, test_key, section, score, total, accuracy, time_spent, answers)"
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (uid, test_key, section, score, total, accuracy, time_spent, answers),
        )
        db.commit()
        return JSONResponse({"saved": True, "accuracy": accuracy}, status_code=201)
    finally:
        db.close()


@app.get("/api/test-results")
async def get_tests(request: Request):
    uid = int(get_identity(request))
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM test_results WHERE user_id=? ORDER BY taken_at DESC", (uid,)
        ).fetchall()
        return JSONResponse([test_dict(r) for r in rows])
    finally:
        db.close()


@app.post("/api/minigame-result")
async def save_game(request: Request):
    uid = int(get_identity(request))
    d = await request.json()
    slug  = d.get("lesson_slug", "")
    mode  = d.get("mode", "mc")
    score = int(d.get("score", 0))
    total = int(d.get("total", 0))

    if not slug:
        raise HTTPException(400, "lesson_slug is required.")

    db = get_db()
    try:
        db.execute(
            "INSERT INTO minigame_results (user_id, lesson_slug, mode, score, total)"
            " VALUES (?, ?, ?, ?, ?)",
            (uid, slug, mode, score, total),
        )
        db.commit()
        return JSONResponse({"saved": True}, status_code=201)
    finally:
        db.close()


@app.get("/api/minigame-results")
async def get_games(request: Request):
    uid = int(get_identity(request))
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM minigame_results WHERE user_id=? ORDER BY played_at DESC", (uid,)
        ).fetchall()
        return JSONResponse([game_dict(r) for r in rows])
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  SESSIONS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/session/new")
async def new_session():
    sid = str(uuid.uuid4())
    db = get_db()
    try:
        db.execute("INSERT INTO sessions (session_id, history) VALUES (?,?)", (sid, "[]"))
        db.commit()
        return JSONResponse({"session_id": sid, "message": "Session created."})
    finally:
        db.close()


@app.post("/api/session/{session_id}/reset")
async def reset_session(session_id: str):
    db = get_db()
    try:
        row = db.execute("SELECT session_id FROM sessions WHERE session_id=?", (session_id,)).fetchone()
        if row:
            db.execute("UPDATE sessions SET history=? WHERE session_id=?", ("[]", session_id))
            db.commit()
            return JSONResponse({"message": "Session reset."})
        raise HTTPException(404, "Session not found.")
    finally:
        db.close()


@app.get("/api/session/{session_id}/history")
async def get_history(session_id: str):
    db = get_db()
    try:
        row = db.execute("SELECT history FROM sessions WHERE session_id=?", (session_id,)).fetchone()
        if row:
            return JSONResponse({"history": json.loads(row["history"] or "[]")})
        raise HTTPException(404, "Session not found.")
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  CHAT  (async httpx)
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/chat")
async def chat(request: Request):
    d = await request.json()
    session_id   = d.get("session_id") or str(uuid.uuid4())
    user_message = (d.get("message") or "").strip()
    image_data   = d.get("image")
    use_stream   = d.get("stream", False)

    if not user_message:
        raise HTTPException(400, "message is required.")

    history = ensure_session(session_id)

    if image_data:
        if "," in image_data:
            header, b64 = image_data.split(",", 1)
            media_type  = header.split(":")[1].split(";")[0]
        else:
            b64, media_type = image_data, "image/jpeg"

        extracted_text = ""
        if _ocr_available:
            try:
                img_bytes = base64.b64decode(b64)
                extracted_text = extract_text_from_image(img_bytes)
            except Exception:
                extracted_text = ""

        if extracted_text.strip():
            user_content = f"OCR TEXT:\n{extracted_text}\n\nQUESTION:\n{user_message}"
            model         = "llama-3.1-8b-instant"
            system_prompt = cached_system_prompt("image")
        else:
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

    # Retrieve mathematical context using LightRAG-style retriever
    retrieved_kb = retrieve_math_context(user_message)
    full_system_prompt = f"{system_prompt}\n\n{retrieved_kb}"

    # Build messages without mutating history dicts (slicing shares dict refs in Python)
    context_history = history[-5:-1]  # previous turns, excluding the just-appended user turn
    messages = (
        [{"role": "system", "content": full_system_prompt}]
        + context_history
        + [{"role": "user", "content": user_content}]
    )

    payload = {
        "model": model, "messages": messages,
        "max_tokens": 1024, "temperature": 0.3,
        "stream": use_stream,
    }

    client = await get_http_client()

    if use_stream:
        async def generate():
            full_reply = []
            try:
                async with client.stream(
                    "POST", f"{GROQ_BASE}/chat/completions",
                    headers=groq_headers(), json=payload,
                ) as resp:
                    resp.raise_for_status()
                    async for raw_line in resp.aiter_lines():
                        if not raw_line:
                            continue
                        line = raw_line
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

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*",
            },
        )

    # Non-streaming
    try:
        resp = await client.post(
            f"{GROQ_BASE}/chat/completions",
            headers=groq_headers(),
            json={**payload, "stream": False},
        )
        resp.raise_for_status()
        reply = resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return JSONResponse({"error": True, "reply": f"AI unavailable: {e}"}, status_code=502)

    history.append({"role": "assistant", "content": reply})
    save_history(session_id, history)
    return JSONResponse({"reply": reply, "session_id": session_id, "history_length": len(history)})


# ═══════════════════════════════════════════════════════════════════════════════
#  TRANSLATE
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/translate")
async def translate(request: Request):
    d = await request.json()
    text = (d.get("text") or "").strip()[:500]
    if not text:
        raise HTTPException(400, "text is required.")

    prompt = (
        "Translate this English math text to Vietnamese. "
        "Reply ONLY with JSON (no markdown): "
        '{"translation":"...","summary":"...","words":['
        '{"word":"...","type":"...","pronunciation":"...","vietnamese":"...","example":"..."}]}\n\n'
        f"Text: {text}"
    )
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a JSON-only translation API. Output only the JSON object."},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens": 400, "temperature": 0.2,
    }

    client = await get_http_client()
    try:
        resp = await client.post(
            f"{GROQ_BASE}/chat/completions",
            headers=groq_headers(), json=payload,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"]
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return JSONResponse(json.loads(clean))
    except json.JSONDecodeError:
        # pyrefly: ignore [unbound-name]
        return JSONResponse({"error": True, "raw": raw})
    except Exception as e:
        return JSONResponse({"error": True, "raw": str(e)}, status_code=502)


# ═══════════════════════════════════════════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
async def health():
    t0 = time.perf_counter()
    try:
        db = get_db()
        db.execute("SELECT 1").fetchone()
        db.close()
        db_ms, db_ok = round((time.perf_counter() - t0) * 1000, 2), True
    except Exception:
        db_ms, db_ok = -1, False
    return JSONResponse({
        "status":        "ok" if db_ok else "degraded",
        "service":       "DuoMath API v4 (FastAPI)",
        "db_latency_ms": db_ms,
        "keep_alive":    bool(SELF_URL),
        "text_model":    "llama-3.1-8b-instant",
        "vision_model":  "meta-llama/llama-4-scout-17b-16e-instruct",
        "ocr_available": _ocr_available,
    })


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn # pyright: ignore[reportMissingImports]
    port = int(os.environ.get("PORT", 5000))
    print(f"DuoMath API v4 (FastAPI) -> http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
