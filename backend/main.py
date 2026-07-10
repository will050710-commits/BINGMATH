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

async def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token using Google's public keys via HTTP."""
    project_id = os.environ.get("FIREBASE_PROJECT_ID", "duosteam-be693")
    try:
        header = pyjwt.get_unverified_header(id_token)
        kid = header.get("kid")
        if not kid:
            raise ValueError("No kid in JWT header")

        cert_str = await _get_google_public_key(kid)
        if not cert_str:
            raise ValueError(f"Public key not found for kid: {kid}")

        # Decode without verification first to check for project_id mismatch
        try:
            unverified_payload = pyjwt.decode(id_token, options={"verify_signature": False})
            token_aud = unverified_payload.get("aud")
            token_iss = unverified_payload.get("iss")
            
            if token_aud != project_id:
                raise HTTPException(
                    401,
                    f"Firebase token verification failed: Audience mismatch. Backend expects project ID '{project_id}' but token belongs to '{token_aud}'. Please update your FIREBASE_PROJECT_ID environment variable on Render."
                )
            
            expected_iss = f"https://securetoken.google.com/{project_id}"
            if token_iss != expected_iss:
                raise HTTPException(
                    401,
                    f"Firebase token verification failed: Issuer mismatch. Expected '{expected_iss}' but token has '{token_iss}'."
                )
        except HTTPException:
            raise
        except Exception as decode_err:
            print(f"[WARN] Pre-decode check failed: {decode_err}")

        from cryptography import x509
        from cryptography.hazmat.backends import default_backend

        cert_bytes = cert_str.encode("utf-8")
        cert = x509.load_pem_x509_certificate(cert_bytes, default_backend())
        public_key = cert.public_key()

        payload = pyjwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=project_id,
            issuer=f"https://securetoken.google.com/{project_id}",
            options={"verify_exp": True, "verify_iat": False, "verify_nbf": False},
            leeway=3600,
        )
        return payload
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] verify_firebase_token failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(401, f"Invalid Firebase token: {e}")


_google_certs: dict = {}
_google_certs_expire: float = 0.0

async def _get_google_public_key(kid: str) -> str | None:
    global _google_certs, _google_certs_expire
    now = time.time()
    if not _google_certs or now > _google_certs_expire:
        async with httpx.AsyncClient(timeout=5) as client:
            for url in (
                "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
                "https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com",
            ):
                r = await client.get(url)
                if r.status_code == 200:
                    _google_certs = r.json()
                    break
            else:
                raise ValueError("Could not fetch Google public keys")
        cc = r.headers.get("Cache-Control", "")
        max_age = 3600
        for part in cc.split(","):
            if "max-age" in part:
                max_age = int(part.split("=")[1])
        _google_certs_expire = now + max_age
    return _google_certs.get(kid)


def get_identity_sync(request: Request) -> str:
    """Sync version — only works for backend JWT tokens."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    return decode_token(auth_header[7:])


async def get_firebase_uid_or_backend_id(request: Request) -> tuple[str, bool]:
    """
    Returns (identifier, is_firebase) where:
    - is_firebase=True  → identifier is a Firebase UID string
    - is_firebase=False → identifier is a backend integer user id (as string)
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = auth_header[7:]
    
    # Try backend JWT first (fast path)
    try:
        identity = decode_token(token)
        return (identity, False)
    except HTTPException:
        pass
    
    # Try Firebase ID token
    payload = await verify_firebase_token(token)
    return (payload["sub"], True)  # sub = firebase UID


async def resolve_user_id(request: Request) -> int:
    """Always returns the backend integer user ID, regardless of token type."""
    identity, is_firebase = await get_firebase_uid_or_backend_id(request)
    if not is_firebase:
        uid = int(identity)
    else:
        # Look up by firebase_uid
        db = get_db()
        try:
            row = db.execute("SELECT id FROM users WHERE firebase_uid=?", (identity,)).fetchone()
            if not row:
                raise HTTPException(404, "User not found. Please sync first via /api/firebase-sync")
            uid = row["id"]
        finally:
            db.close()

    # Check if user is banned
    db = get_db()
    try:
        row = db.execute("SELECT banned, ban_reason FROM users WHERE id=?", (uid,)).fetchone()
        if row and row["banned"] == 1:
            reason = row["ban_reason"] or "Không rõ lý do"
            raise HTTPException(403, f"Tài khoản của bạn đã bị khóa. Lý do: {reason}")
        return uid
    finally:
        db.close()


async def verify_admin(request: Request) -> int:
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        row = db.execute("SELECT is_admin, email FROM users WHERE id=?", (uid,)).fetchone()
        if not row or (row["is_admin"] != 1 and row["email"].lower() != "will050710@gmail.com"):
            raise HTTPException(403, "Forbidden: Admin access required.")
        return uid
    finally:
        db.close()


def get_identity(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    return decode_token(auth[7:])

# ── OCR (optional) ───────────────────────────────────────────────────────────
try:
    import easyocr # pyright: ignore[reportMissingImports]
    # Lưu weights của mô hình ở ổ D để tránh tràn dung lượng ổ C
    ocr_reader = easyocr.Reader(['vi', 'en'], gpu=False, model_storage_directory="D:\\easyocr_models")
    _ocr_available = True
except ImportError:
    ocr_reader = None
    _ocr_available = False

# ── Config ────────────────────────────────────────────────────────────────────
DB_PATH   = os.path.join(os.path.dirname(__file__), "duomath.db")
GROQ_BASE = "https://api.groq.com/openai/v1"
GROQ_KEY  = os.environ.get("GROQ_API_KEY", "")
SELF_URL  = os.environ.get("SELF_URL", "")

# ── MathGPT Socratic System Prompts ──────────────────────────────────────────
_LATEX_RULES = (
    "\n\n## QUY TẮC ĐỊNH DẠNG TOÁN HỌC (BẮT BUỘC):\n"
    "- Bạn BẮT BUỘC phải bao quanh TẤT CẢ các công thức toán học, ký hiệu, phân số, góc, phương trình bằng dấu đô la ($...$ cho inline, $$...$$ cho block).\n"
    "- Ví dụ: viết $\\frac{AB}{\\sin 24^\\circ}$, TUYỆT ĐỐI KHÔNG viết \\frac{AB}{\\sin 24^\\circ} mà không có dấu $.\n"
    "- Dùng $...$ cho công thức inline: $f(x) = ax^2 + bx + c$, $x_1 + x_2 = -b/a$\n"
    "- Dùng $$...$$ trên dòng riêng cho công thức quan trọng: $$\\Delta = b^2 - 4ac$$\n"
    "- KHÔNG viết biến số hay ký hiệu dưới dạng plain text — luôn dùng $x$, $a$, $\\Delta$, không phải x, a, Delta\n"
    "- Đánh số bước giải: **Bước 1**, **Bước 2**, ...\n"
)

_SOCRATIC_BASE = """Bạn là **MathGPT** — Trợ lý Toán học AI chuyên biệt của nền tảng **DUOMATH**, hỗ trợ học sinh THPT (lớp 10-12) học Toán song ngữ Anh-Việt.

## NGUYÊN TẮC GIẢNG DẠY — PHƯƠNG PHÁP SOCRATIC

QUY TẮC VÀNG: **KHÔNG BAO GIỜ** đưa ra đáp án hoàn chỉnh ngay lập tức khi học sinh hỏi lần đầu.
Thay vào đó, dẫn dắt học sinh tự khám phá qua 3 giai đoạn:

**Giai đoạn 1 — NHẬN DIỆN (Identify):**
Đặt câu hỏi để học sinh xác định dạng bài:
- "Bài toán này em đã gặp dạng nào tương tự chưa?"
- "Điều kiện ràng buộc của bài là gì?"
- "Biến số / đại lượng cần tìm là gì?"

**Giai đoạn 2 — GỢI Ý TỪNG BƯỚC (Step Hints):**
Format mỗi gợi ý: `💡 Gợi ý {n}: [câu hỏi dẫn dắt hoặc công thức cần áp dụng]`
Ví dụ:
- "💡 Gợi ý 1: Tiệm cận đứng xuất hiện tại điểm nào làm mẫu số bằng 0?"
- "💡 Gợi ý 2: Hãy tính $\\Delta = b^2 - 4ac$ với $a$, $b$, $c$ bạn đã xác định."
Nếu học sinh vẫn bế tắc sau 2 gợi ý → đưa thêm 1 công thức cụ thể có dạng tổng quát.

**Giai đoạn 3 — CHỈ khi học sinh nói 'xem đáp án' / 'show solution' / 'giải hộ em':**
Chuyển sang chế độ giải đầy đủ (xem mode=solution bên dưới).

## PHONG CÁCH GIAO TIẾP:
- Thân thiện, khuyến khích: "Em đang đi đúng hướng rồi! 🎯 Hãy thử thêm bước tiếp theo."
- Khi sai: KHÔNG dùng "SAI" hay "KHÔNG ĐÚNG" → dùng: "Hướng này chưa chính xác, hãy xem lại..."
- Kết thúc mỗi câu trả lời bằng câu hỏi kiểm tra hoặc khuyến khích: "Em thử áp dụng vào bài xem sao nhé! 😊"
- Song ngữ: giải thích bằng tiếng Việt, kèm thuật ngữ tiếng Anh trong ngoặc đơn khi cần.

## CHUYÊN MÔN THPT:
Đại Số & Giải Tích: Hàm số (Functions), Đạo hàm (Derivatives), Tích phân (Integrals), Giới hạn (Limits), Phương trình (Equations), Tổ hợp & Xác suất (Combinatorics & Probability), Cấp số (Sequences).
Hình Học: Hình phẳng, Hình không gian (Solid Geometry), Tọa độ Oxyz."""

@lru_cache(maxsize=8)
def cached_system_prompt(variant: str = "text") -> str:
    """MathGPT system prompt — 5 variants: text (Socratic hint), image (Vision Socratic),
    solution (full step-by-step + bài phái sinh), raw_solution (non-Socratic step solver), translate (JSON-only)."""
    if variant == "solution":
        return (
            _SOCRATIC_BASE
            + "\n\n## CHẾ ĐỘ HIỆN TẠI: GIẢI ĐẦY ĐỦ (Full Solution Mode)"
            + "\nHọc sinh đã yêu cầu xem đáp án đầy đủ. Hãy:\n"
            + "1. Trình bày lời giải HOÀN CHỈNH theo từng bước rõ ràng với LaTeX.\n"
            + "2. Sau lời giải, LUÔN tạo ra 1 **Bài Tập Phái Sinh** tương tự (thay đổi số liệu hoặc biến thể nhỏ) dưới tiêu đề:\n"
            + "   ### 📝 Bài Tập Luyện Tập Ngay\n"
            + "   [Đề bài phái sinh]\n"
            + "   > 💡 *Em thử giải bài này trước khi hỏi đáp án nhé!*\n"
            + _LATEX_RULES
        )
    if variant == "raw_solution":
        return (
            "You are a professional math tutor.\n"
            "Analyze the problem and provide a highly accurate, step-by-step solution.\n"
            "Each step must be concise, logical, and clear.\n"
            "Use LaTeX for all math expressions (inline: $...$, block: $$...$$).\n"
            "Write the response in the language specified by the user's prompt (English or Vietnamese).\n"
            "Do NOT include any introduction, explanations, markdown code blocks, or extra text. Output ONLY the numbered steps (e.g., '1. ...', '2. ...')."
        )
    if variant == "image":
        return (
            _SOCRATIC_BASE
            + "\n\n## CHẾ ĐỘ HIỆN TẠI: NHẬN DIỆN ẢNH VÀ GỢI Ý ĐA GÓC NHÌN (Vision Socratic Mode)"
            + "\nBạn đang phân tích một bức ảnh đề toán. Hãy:\n"
            + "1. Mô tả ngắn gọn bài toán bạn nhận ra từ ảnh.\n"
            + "2. Xác định dạng toán (loại bài, chương trình lớp mấy).\n"
            + "3. BẮT BUỘC gợi ý lời giải dưới dạng **nhiều góc nhìn/hướng tiếp cận khác nhau** (đưa ra tối thiểu 2 hướng tiếp cận như Đại số, Hình học, hoặc Mẹo trắc nghiệm nhanh).\n"
            + "4. Với mỗi hướng tiếp cận, hãy đưa ra câu hỏi gợi mở hoặc công thức dẫn dắt (Socratic method) để học sinh tự làm, tuyệt đối không giải thẳng.\n"
            + "Ví dụ cấu trúc trình bày gợi ý:\n"
            + "  - **Hướng tiếp cận 1: Đại số (Algebraic)**: [nội dung gợi ý + câu hỏi]\n"
            + "  - **Hướng tiếp cận 2: Hình học/Đồ thị (Geometric)**: [nội dung gợi ý + câu hỏi]\n"
            + "Nếu ảnh không rõ hoặc không phải bài toán -> thông báo lịch sự và hỏi lại.\n"
            + _LATEX_RULES
        )
    # Default: "text" — Socratic hint mode
    return (
        _SOCRATIC_BASE
        + "\n\n## CHẾ ĐỘ HIỆN TẠI: GỢI Ý SOCRATIC ĐA GÓC NHÌN (Socratic Hint Mode)"
        + "\nBạn cần giúp học sinh giải bài toán bằng cách gợi ý hướng đi dưới dạng **nhiều góc nhìn/hướng tiếp cận khác nhau**:\n"
        + "1. Đưa ra tối thiểu 2 đến 3 hướng tiếp cận khác nhau để giải bài toán (Ví dụ: Đại số, Hình học, Đánh giá nhanh/Mẹo trắc nghiệm).\n"
        + "2. Với mỗi hướng đi, đặt câu hỏi gợi mở hoặc nhắc lại công thức cốt lõi để học sinh tự suy nghĩ tiếp. Tuyệt đối không cho đáp án thẳng.\n"
        + "Ví dụ cấu trúc trình bày gợi ý:\n"
        + "  - **Hướng tiếp cận 1: Đại số (Algebraic)**: [nội dung gợi ý + câu hỏi]\n"
        + "  - **Hướng tiếp cận 2: Hình học/Đồ thị (Geometric)**: [nội dung gợi ý + câu hỏi]\n"
        + _LATEX_RULES
    )

# ── LightRAG-style Mathematical Knowledge Graph & Retriever ────────────────
import re as _re_rag  # dùng riêng cho entity matching

MATH_CONCEPT_GRAPH = {
    "nodes": {
        "phuong_trinh_bac_hai": {
            "id": "phuong_trinh_bac_hai",
            "name": "Phương trình bậc hai",
            "english_name": "Quadratic Equation",
            "keywords": ["phương trình bậc 2", "phương trình bậc hai", "quadratic equation", "quadratic", "pt bậc 2"],
            "definition": "Phương trình có dạng $ax^2 + bx + c = 0$ (với $a \\neq 0$).",
            "formulas": "$$ax^2 + bx + c = 0 \\;(a \\neq 0)$$\nNghiệm: $$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$",
            "examples": "Giải $x^2 - 5x + 6 = 0$. Ta có $a=1, b=-5, c=6$. $\\Delta = 25 - 24 = 1 > 0$. Nghiệm $x_1=3, x_2=2$."
        },
        "biet_thuc_delta": {
            "id": "biet_thuc_delta",
            "name": "Biệt thức Delta",
            "english_name": "Discriminant",
            "keywords": ["delta", "biệt thức", "discriminant", "∆", "△"],
            "definition": "Giá trị đại số dùng để xác định số lượng và tính chất nghiệm của phương trình bậc hai.",
            "formulas": "$$\\Delta = b^2 - 4ac$$\n- $\\Delta > 0$: 2 nghiệm phân biệt.\n- $\\Delta = 0$: 1 nghiệm kép.\n- $\\Delta < 0$: vô nghiệm thực.",
            "examples": "Với $x^2 + x + 1 = 0$, $\\Delta = 1 - 4 = -3 < 0$ → Phương trình vô nghiệm thực."
        },
        "he_thuc_vi_et": {
            "id": "he_thuc_vi_et",
            "name": "Hệ thức Vi-ét",
            "english_name": "Vieta's Formulas",
            "keywords": ["vi-ét", "viet", "viét", "vieta", "tổng nghiệm", "tích nghiệm"],
            "definition": "Mối quan hệ giữa các nghiệm và các hệ số của phương trình bậc hai.",
            "formulas": "$$S = x_1 + x_2 = -\\frac{b}{a}, \\quad P = x_1 \\cdot x_2 = \\frac{c}{a}$$",
            "examples": "Nhẩm nghiệm $x^2 - 7x + 12 = 0$: $S = 7, P = 12$ → nghiệm $x_1=3, x_2=4$."
        },
        "dao_ham": {
            "id": "dao_ham",
            "name": "Đạo hàm",
            "english_name": "Derivative",
            "keywords": ["đạo hàm", "derivative", "tính đạo hàm", "vi phân", "f'", "y'"],
            "definition": "Tỉ số giới hạn của số gia hàm số và số gia đối số — đại diện cho tốc độ biến thiên tức thời.",
            "formulas": "$$f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}$$\nCông thức cơ bản: $(x^n)' = nx^{n-1}$, $(\\sin x)' = \\cos x$, $(e^x)' = e^x$, $(\\ln x)' = \\frac{1}{x}$",
            "examples": "$f(x) = 3x^2 - 5x \\Rightarrow f'(x) = 6x - 5$."
        },
        "cuc_tri": {
            "id": "cuc_tri",
            "name": "Cực trị hàm số",
            "english_name": "Extrema of Functions",
            "keywords": ["cực trị", "cực đại", "cực tiểu", "extrema", "max", "min", "gtln", "gtnn"],
            "definition": "Điểm cực đại/cực tiểu là nơi đạo hàm đổi dấu (từ + sang − hoặc ngược lại).",
            "formulas": "**Quy tắc 1 (xét dấu đạo hàm):** $f'(x_0)=0$ và $f'$ đổi dấu qua $x_0$.\n**Quy tắc 2 (đạo hàm cấp 2):** $f'(x_0)=0$:\n- $f''(x_0)>0$ → Cực tiểu\n- $f''(x_0)<0$ → Cực đại",
            "examples": "$y = x^2 - 4x$: $y' = 2x-4 = 0 \\Rightarrow x=2$. $y''=2>0$ → Cực tiểu tại $x=2$, $y_{\\min}=-4$."
        },
        "tiem_can": {
            "id": "tiem_can",
            "name": "Đường tiệm cận",
            "english_name": "Asymptote",
            "keywords": ["tiệm cận", "tiệm cận ngang", "tiệm cận đứng", "tiệm cận xiên", "asymptote"],
            "definition": "Đường thẳng mà đồ thị hàm số tiếp cận vô hạn mà không chạm tới.",
            "formulas": "- **Tiệm cận đứng** $x=x_0$: khi $\\lim_{x\\to x_0} f(x) = \\pm\\infty$\n- **Tiệm cận ngang** $y=L$: khi $\\lim_{x\\to\\pm\\infty} f(x) = L$\n- **Tiệm cận xiên** $y=ax+b$: khi $a = \\lim_{x\\to\\infty}\\frac{f(x)}{x}$",
            "examples": "$y = \\frac{2x+1}{x-1}$: TCĐ $x=1$, TCN $y=2$."
        },
        "tich_phan": {
            "id": "tich_phan",
            "name": "Tích phân",
            "english_name": "Integral",
            "keywords": ["tích phân", "nguyên hàm", "integral", "antiderivative", "diện tích", "∫"],
            "definition": "Phép toán ngược của đạo hàm. Tích phân xác định = diện tích hình phẳng dưới đồ thị.",
            "formulas": "**Newton-Leibniz:** $$\\int_a^b f(x)\\,dx = F(b) - F(a)$$\n**Tích phân từng phần:** $$\\int u\\,dv = uv - \\int v\\,du$$\n**Nguyên hàm cơ bản:** $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$",
            "examples": "$\\int_0^1 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3}$."
        },
        "gioi_han": {
            "id": "gioi_han",
            "name": "Giới hạn",
            "english_name": "Limit",
            "keywords": ["giới hạn", "limit", "lim", "tiến tới", "tiến đến"],
            "definition": "Giá trị mà hàm số hoặc dãy số tiếp cận khi biến số tiến đến một giá trị xác định.",
            "formulas": "$$\\lim_{x\\to x_0} f(x) = L$$\nGiới hạn đặc biệt: $\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$, $\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n = e$",
            "examples": "$\\lim_{x\\to 2}\\frac{x^2-4}{x-2} = \\lim_{x\\to 2}(x+2) = 4$."
        },
        # ── 5 node mới (mở rộng LightRAG) ─────────────────────────────────
        "xac_suat": {
            "id": "xac_suat",
            "name": "Xác suất",
            "english_name": "Probability",
            "keywords": ["xác suất", "probability", "biến cố", "không gian mẫu", "p(a)"],
            "definition": "Số đo mức độ khả năng xảy ra của một biến cố trong một thí nghiệm ngẫu nhiên.",
            "formulas": "$$P(A) = \\frac{|A|}{|\\Omega|}$$\n**Cộng xác suất:** $P(A\\cup B) = P(A)+P(B)-P(A\\cap B)$\n**Nhân xác suất (độc lập):** $P(A\\cap B) = P(A)\\cdot P(B)$",
            "examples": "Tung 1 con xúc xắc. $P(\\text{ra số chẵn}) = \\frac{3}{6} = \\frac{1}{2}$."
        },
        "to_hop_chinh_hop": {
            "id": "to_hop_chinh_hop",
            "name": "Tổ hợp & Chỉnh hợp",
            "english_name": "Combinations & Permutations",
            "keywords": ["tổ hợp", "chỉnh hợp", "hoán vị", "combination", "permutation", "c(n,k)", "cnk", "anp"],
            "definition": "Các phép đếm cách chọn hoặc sắp xếp các phần tử từ một tập hợp.",
            "formulas": "**Hoán vị:** $P_n = n!$\n**Chỉnh hợp:** $$A_n^k = \\frac{n!}{(n-k)!}$$\n**Tổ hợp:** $$C_n^k = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}$$",
            "examples": "Chọn 3 người từ 10 người: $C_{10}^3 = \\frac{10!}{3!7!} = 120$ cách."
        },
        "ham_so_luong_giac": {
            "id": "ham_so_luong_giac",
            "name": "Hàm số lượng giác",
            "english_name": "Trigonometric Functions",
            "keywords": ["lượng giác", "sin", "cos", "tan", "cot", "trigonometric", "sinx", "cosx", "tanx"],
            "definition": "Các hàm tuần hoàn liên quan đến góc và tam giác: sin, cos, tan, cot.",
            "formulas": "**Công thức cơ bản:** $\\sin^2 x + \\cos^2 x = 1$\n**Nhân đôi:** $\\sin 2x = 2\\sin x\\cos x$, $\\cos 2x = \\cos^2 x - \\sin^2 x$\n**Phương trình:** $\\sin x = a \\Rightarrow x = (-1)^k \\arcsin a + k\\pi$",
            "examples": "Giải $\\sin x = \\frac{\\sqrt{2}}{2}$: $x = \\frac{\\pi}{4} + 2k\\pi$ hoặc $x = \\pi - \\frac{\\pi}{4} + 2k\\pi$."
        },
        "so_phuc": {
            "id": "so_phuc",
            "name": "Số phức",
            "english_name": "Complex Numbers",
            "keywords": ["số phức", "complex", "số ảo", "phần thực", "phần ảo", "modulus", "|z|"],
            "definition": "Số có dạng $z = a + bi$ trong đó $a, b \\in \\mathbb{R}$ và $i = \\sqrt{-1}$.",
            "formulas": "$z = a + bi$, $\\bar{z} = a - bi$ (số phức liên hợp)\n$|z| = \\sqrt{a^2 + b^2}$ (môđun)\n$z_1 \\cdot z_2 = (a_1 a_2 - b_1 b_2) + (a_1 b_2 + a_2 b_1)i$",
            "examples": "$(3+2i)(1-i) = 3 - 3i + 2i - 2i^2 = 3 - i + 2 = 5 - i$."
        },
        "hinh_hoc_khong_gian": {
            "id": "hinh_hoc_khong_gian",
            "name": "Hình học không gian",
            "english_name": "Solid Geometry",
            "keywords": ["hình hộp", "hình cầu", "hình chóp", "khối lăng trụ", "solid geometry", "thể tích", "diện tích xung quanh", "đường thẳng vuông góc"],
            "definition": "Nghiên cứu các hình học trong không gian 3 chiều: hình cầu, hình chóp, hình hộp, lăng trụ...",
            "formulas": "**Hình cầu:** $V = \\frac{4}{3}\\pi R^3$, $S = 4\\pi R^2$\n**Hình chóp:** $V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h$\n**Lăng trụ:** $V = S_{\\text{đáy}} \\cdot h$",
            "examples": "Hình cầu bán kính $R=3$: $V = \\frac{4}{3}\\pi \\cdot 27 = 36\\pi$."
        },
    },
    "edges": [
        {"source": "phuong_trinh_bac_hai", "target": "biet_thuc_delta",    "relation": "dùng Delta để xác định số nghiệm"},
        {"source": "phuong_trinh_bac_hai", "target": "he_thuc_vi_et",      "relation": "áp dụng Vi-ét để nhẩm tổng và tích nghiệm"},
        {"source": "biet_thuc_delta",    "target": "he_thuc_vi_et",      "relation": "kiểm tra Delta > 0 trước khi áp dụng Vi-ét"},
        {"source": "dao_ham",            "target": "cuc_tri",            "relation": "dùng f'(x)=0 và xét dấu để tìm cực trị"},
        {"source": "dao_ham",            "target": "tich_phan",          "relation": "tích phân là phép toán ngược của đạo hàm"},
        {"source": "gioi_han",           "target": "tiem_can",           "relation": "dùng giới hạn vô cực để tìm tiệm cận"},
        {"source": "gioi_han",           "target": "dao_ham",            "relation": "định nghĩa đạo hàm dựa trên giới hạn tỉ số số gia"},
        {"source": "to_hop_chinh_hop",   "target": "xac_suat",          "relation": "tổ hợp/chỉnh hợp dùng để đếm không gian mẫu và biến cố"},
        {"source": "ham_so_luong_giac",  "target": "dao_ham",            "relation": "đạo hàm của sin/cos/tan áp dụng quy tắc đạo hàm"},
        {"source": "phuong_trinh_bac_hai","target": "so_phuc",          "relation": "khi Delta < 0 thì nghiệm là số phức"},
    ]
}

def extract_graph_entities(query: str) -> list:
    """Trích xuất node IDs phù hợp từ query — dùng regex để tránh false match."""
    matched_ids = []
    q = query.lower()
    for node_id, node_data in MATH_CONCEPT_GRAPH["nodes"].items():
        # Khớp node_id hoặc tên đầy đủ (word-boundary safe)
        if node_data["name"].lower() in q or node_data["english_name"].lower() in q:
            matched_ids.append(node_id)
            continue
        # Khớp keywords — dùng \b chỉ cho từ ASCII, fallback `in` cho tiếng Việt
        hit = False
        for kw in node_data["keywords"]:
            kw_l = kw.lower()
            # Từ ASCII ngắn (≤4 ký tự, như 'sin', 'lim'): yêu cầu word boundary
            if kw_l.isascii() and len(kw_l) <= 4:
                if _re_rag.search(r'\b' + _re_rag.escape(kw_l) + r'\b', q):
                    hit = True; break
            else:
                if kw_l in q:
                    hit = True; break
        if hit:
            matched_ids.append(node_id)
    return list(dict.fromkeys(matched_ids))  # dedup preserve order


@lru_cache(maxsize=128)
def retrieve_math_context(query: str) -> str:
    """LightRAG hybrid retriever: Local (node+edge graph) + Global (hướng dẫn chung).
    Kết quả được cache để tái dùng khi cùng query.
    """
    matched_ids = extract_graph_entities(query)
    local_contexts: list[str] = []
    seen_neighbors: set[str] = set()

    for node_id in matched_ids:
        node = MATH_CONCEPT_GRAPH["nodes"][node_id]
        local_contexts.append(
            f"### 📚 {node['name']} ({node['english_name']})\n"
            f"**Định nghĩa:** {node['definition']}\n"
            f"**Công thức:**\n{node['formulas']}\n"
            f"**Ví dụ:** {node['examples']}\n"
        )
        relations: list[str] = []
        for edge in MATH_CONCEPT_GRAPH["edges"]:
            if edge["source"] == node_id:
                t = MATH_CONCEPT_GRAPH["nodes"].get(edge["target"])
                if t:
                    relations.append(f"  ↳ Liên kết tới **{t['name']}**: {edge['relation']}")
                    if edge["target"] not in matched_ids:
                        seen_neighbors.add(edge["target"])
            elif edge["target"] == node_id:
                s = MATH_CONCEPT_GRAPH["nodes"].get(edge["source"])
                if s:
                    relations.append(f"  ↳ Liên kết từ **{s['name']}**: {edge['relation']}")
                    if edge["source"] not in matched_ids:
                        seen_neighbors.add(edge["source"])
        if relations:
            local_contexts.append("**Quan hệ trong Knowledge Graph:**\n" + "\n".join(relations) + "\n")

    if seen_neighbors:
        neighbor_lines = []
        for n_id in seen_neighbors:
            n = MATH_CONCEPT_GRAPH["nodes"].get(n_id)
            if n:
                first_formula = n["formulas"].splitlines()[0] if n["formulas"] else ""
                neighbor_lines.append(f"  • **{n['name']}**: {n['definition']} — `{first_formula}`")
        local_contexts.append("**Khái niệm lân cận liên quan:**\n" + "\n".join(neighbor_lines) + "\n")

    global_ctx = (
        "**Hướng dẫn hệ thống (Global Context):**\n"
        "- Giải thích bằng tiếng Việt, kèm thuật ngữ Anh trong ngoặc đơn.\n"
        "- Luôn dùng LaTeX: $inline$ và $$block$$ cho mọi công thức.\n"
        "- Áp dụng Socratic method: gợi ý từng bước, không giải thẳng trừ khi được yêu cầu.\n"
    )

    if matched_ids:
        return (
            "=== KNOWLEDGE GRAPH (Local Mode) ===\n"
            + "\n".join(local_contexts)
            + "\n=== GLOBAL CONTEXT ===\n"
            + global_ctx
            + "=" * 50 + "\n"
        )
    return (
        "=== GLOBAL CONTEXT ===\n"
        + global_ctx
        + "=" * 50 + "\n"
    )

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
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            email        TEXT    UNIQUE NOT NULL COLLATE NOCASE,
            username     TEXT    NOT NULL,
            password     TEXT    NOT NULL DEFAULT '',
            phone        TEXT    DEFAULT '',
            school       TEXT    DEFAULT '',
            grade        TEXT    DEFAULT '',
            avatar_url   TEXT    DEFAULT '',
            firebase_uid TEXT    UNIQUE,
            is_admin     INTEGER DEFAULT 0,
            banned       INTEGER DEFAULT 0,
            ban_reason   TEXT    DEFAULT '',
            created_at   TEXT    DEFAULT (datetime('now'))
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
        CREATE TABLE IF NOT EXISTS reports (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_id      INTEGER NOT NULL,
            reported_user_id INTEGER NOT NULL,
            reason           TEXT NOT NULL,
            status           TEXT DEFAULT 'pending',
            created_at       TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (reporter_id) REFERENCES users(id),
            FOREIGN KEY (reported_user_id) REFERENCES users(id)
        );
        CREATE INDEX IF NOT EXISTS idx_test_user  ON test_results(user_id, taken_at DESC);
        CREATE INDEX IF NOT EXISTS idx_game_user  ON minigame_results(user_id, played_at DESC);
        CREATE INDEX IF NOT EXISTS idx_session_id ON sessions(session_id);

        -- Gamification: streak, XP, level, league
        CREATE TABLE IF NOT EXISTS user_gamification (
            user_id          INTEGER PRIMARY KEY,
            current_streak   INTEGER DEFAULT 0,
            longest_streak   INTEGER DEFAULT 0,
            last_active_date TEXT,
            freeze_count     INTEGER DEFAULT 2,
            total_xp         INTEGER DEFAULT 0,
            level            INTEGER DEFAULT 1,
            elo_rating       INTEGER DEFAULT 1000,
            peak_elo         INTEGER DEFAULT 1000,
            league           TEXT    DEFAULT 'Bronze',
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Daily quests (sinh tự động mỗi ngày)
        CREATE TABLE IF NOT EXISTS daily_quests (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER NOT NULL,
            date           TEXT    NOT NULL,
            quest_type     TEXT    NOT NULL,
            quest_label_vi TEXT    NOT NULL,
            quest_label_en TEXT    NOT NULL,
            target_value   INTEGER NOT NULL,
            current_value  INTEGER DEFAULT 0,
            xp_reward      INTEGER NOT NULL,
            is_completed   INTEGER DEFAULT 0,
            completed_at   TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, date, quest_type)
        );

        -- Badges / achievements
        CREATE TABLE IF NOT EXISTS user_badges (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id   INTEGER NOT NULL,
            badge_id  TEXT    NOT NULL,
            earned_at TEXT    DEFAULT (datetime('now')),
            UNIQUE(user_id, badge_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Adaptive Learning: log từng câu hỏi
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER NOT NULL,
            question_id    TEXT    NOT NULL,
            topic          TEXT    NOT NULL,
            difficulty     TEXT    NOT NULL DEFAULT 'NB',
            is_correct     INTEGER NOT NULL,
            time_taken_sec INTEGER DEFAULT 0,
            attempted_at   TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Adaptive Learning: tổng hợp mastery theo chủ đề
        CREATE TABLE IF NOT EXISTS topic_mastery (
            user_id        INTEGER NOT NULL,
            topic          TEXT    NOT NULL,
            total_attempts INTEGER DEFAULT 0,
            correct_count  INTEGER DEFAULT 0,
            avg_accuracy   REAL    DEFAULT 0,
            current_level  TEXT    DEFAULT 'NB',
            last_practiced TEXT,
            PRIMARY KEY (user_id, topic),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_quiz_user_topic ON quiz_attempts(user_id, topic, attempted_at DESC);
        CREATE INDEX IF NOT EXISTS idx_quest_user_date ON daily_quests(user_id, date);

        -- user_cards for Gacha system
        CREATE TABLE IF NOT EXISTS user_cards (
            user_id INTEGER,
            card_id TEXT,
            owned_count INTEGER DEFAULT 1,
            unlocked_at TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (user_id, card_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- daily_progress for Mastery Rings
        CREATE TABLE IF NOT EXISTS daily_progress (
            user_id INTEGER PRIMARY KEY,
            last_reset TEXT,
            practice_count INTEGER DEFAULT 0,
            mastery_count INTEGER DEFAULT 0,
            socratic_count INTEGER DEFAULT 0,
            daily_xp_goal INTEGER DEFAULT 30,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    
    # ── Migrations: safely add columns that may not exist in older DB versions ──
    migrations = [
        ("ALTER TABLE users ADD COLUMN firebase_uid TEXT",           None),
        ("CREATE UNIQUE INDEX IF NOT EXISTS idx_firebase_uid ON users(firebase_uid)", None),
        ("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0",  None),
        ("ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0",    None),
        ("ALTER TABLE users ADD COLUMN ban_reason TEXT DEFAULT ''",  None),
        ("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''",       None),
        ("ALTER TABLE users ADD COLUMN school TEXT DEFAULT ''",      None),
        ("ALTER TABLE users ADD COLUMN grade TEXT DEFAULT ''",       None),
        ("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''",  None),
        # ── Gamification v2: Coins + Country ──
        ("ALTER TABLE user_gamification ADD COLUMN coins INTEGER DEFAULT 0", None),
        ("ALTER TABLE user_gamification ADD COLUMN lifetime_coins INTEGER DEFAULT 0", None),
        ("ALTER TABLE users ADD COLUMN country TEXT DEFAULT 'VN'", None),
        ("CREATE INDEX IF NOT EXISTS idx_user_country ON users(country)", None),
        # ── Profile borders shop ──
        ("""CREATE TABLE IF NOT EXISTS profile_borders (
            id          TEXT PRIMARY KEY,
            name_vi     TEXT NOT NULL,
            name_en     TEXT NOT NULL,
            description TEXT DEFAULT '',
            price_coins INTEGER NOT NULL,
            rarity      TEXT DEFAULT 'common',
            css_style   TEXT NOT NULL DEFAULT '{}',
            preview_emoji TEXT DEFAULT '',
            is_animated INTEGER DEFAULT 0,
            created_at  TEXT DEFAULT (datetime('now'))
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS user_borders (
            user_id   INTEGER NOT NULL,
            border_id TEXT NOT NULL,
            owned_at  TEXT DEFAULT (datetime('now')),
            is_active INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, border_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )""", None),
        # ── MRM Rank history ──
        ("""CREATE TABLE IF NOT EXISTS mrm_rank_history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            elo_rating  INTEGER NOT NULL,
            global_rank INTEGER,
            recorded_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )""", None),
        ("CREATE INDEX IF NOT EXISTS idx_mrm_rank_history ON mrm_rank_history(user_id, recorded_at DESC)", None),
    ]
    for sql, _ in migrations:
        try:
            conn.execute(sql)
            conn.commit()
        except Exception:
            pass  # Column/index already exists — safe to ignore

    # Automatically set will050710@gmail.com as admin
    conn.execute("UPDATE users SET is_admin=1 WHERE email='will050710@gmail.com'")
    conn.commit()
    conn.close()


def get_db():
    return _make_conn()

# ── Helpers ───────────────────────────────────────────────────────────────────
def user_dict(row):
    keys = row.keys() if hasattr(row, 'keys') else []
    return {
        "id": row["id"], "email": row["email"],
        "username": row["username"], "name": row["username"],
        "phone": row["phone"], "school": row["school"],
        "grade": row["grade"], "avatar_url": row["avatar_url"],
        "created_at": row["created_at"],
        "is_admin": row["is_admin"] if "is_admin" in keys else 0,
        "banned": row["banned"] if "banned" in keys else 0,
        "ban_reason": row["ban_reason"] if "ban_reason" in keys else "",
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

_groq_headers_cache: dict | None = None
def groq_headers() -> dict:
    """Cache header dict — tránh tạo lại mỗi request."""
    global _groq_headers_cache
    if _groq_headers_cache is None:
        _groq_headers_cache = {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}
    return _groq_headers_cache

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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://duomath.onrender.com",
        "https://duosteam.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.(vercel\.app|render\.com|netlify\.app)",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
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
    uid = await resolve_user_id(request)
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


@app.post("/api/firebase-sync")
async def firebase_sync(request: Request):
    """Upsert a user record keyed on Firebase UID. Called on first login."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    
    token = auth_header[7:]
    # Accept Firebase token OR backend JWT
    try:
        firebase_payload = await verify_firebase_token(token)
        firebase_uid = firebase_payload["sub"]
        token_email  = firebase_payload.get("email", "")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(401, f"Could not verify Firebase token: {e}")
    
    d = await request.json()
    email    = (d.get("email")    or token_email or "").strip().lower()
    username = (d.get("username") or email.split("@")[0]).strip()
    phone    = (d.get("phone")    or "").strip()
    school   = (d.get("school")   or "").strip()
    grade    = (d.get("grade")    or "").strip()
    
    if not email:
        raise HTTPException(400, "Email is required")
    
    db = get_db()
    try:
        # Try to add firebase_uid column if it doesn't exist (migration)
        try:
            db.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE")
            db.execute("CREATE INDEX IF NOT EXISTS idx_firebase_uid ON users(firebase_uid)")
            db.commit()
        except Exception:
            pass  # Column already exists
        
        # Check if user already exists by firebase_uid
        row = db.execute("SELECT * FROM users WHERE firebase_uid=?", (firebase_uid,)).fetchone()
        if row:
            # Update profile fields if provided
            updates = []
            vals = []
            if username: updates.append("username=?"); vals.append(username)
            if phone:    updates.append("phone=?");    vals.append(phone)
            if school:   updates.append("school=?");   vals.append(school)
            if grade:    updates.append("grade=?");    vals.append(grade)
            if updates:
                vals.append(row["id"])
                db.execute(f"UPDATE users SET {', '.join(updates)} WHERE id=?", vals)
                db.commit()
            row = db.execute("SELECT * FROM users WHERE id=?", (row["id"],)).fetchone()
            return JSONResponse({"synced": True, "user": user_dict(row)})
        
        # Check by email (user may have registered via email/password too)
        row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if row:
            # Link firebase_uid to existing account
            db.execute("UPDATE users SET firebase_uid=? WHERE id=?", (firebase_uid, row["id"]))
            db.commit()
            row = db.execute("SELECT * FROM users WHERE id=?", (row["id"],)).fetchone()
            return JSONResponse({"synced": True, "user": user_dict(row)})
        
        # Create new user
        cur = db.execute(
            "INSERT INTO users (email, username, password, phone, school, grade, firebase_uid)"
            " VALUES (?, ?, '', ?, ?, ?, ?)",
            (email, username, phone, school, grade, firebase_uid),
        )
        db.commit()
        row = db.execute("SELECT * FROM users WHERE id=?", (cur.lastrowid,)).fetchone()
        return JSONResponse({"synced": True, "created": True, "user": user_dict(row)}, status_code=201)
    finally:
        db.close()


@app.patch("/api/me")
async def update_me(request: Request):
    uid = await resolve_user_id(request)
    d = await request.json()
    REQUIRED_NON_EMPTY = {"username"}
    ALLOWED = ["username", "phone", "school", "grade", "avatar_url"]

    sets, vals, errors = [], [], []
    for f in ALLOWED:
        if f not in d:
            continue
        val = str(d[f]).strip() if d[f] is not None else ""
        
        # Validate each field
        if f in REQUIRED_NON_EMPTY and not val:
            errors.append(f"'{f}' cannot be empty.")
            continue
        if f == "username" and val and len(val) < 2:
            errors.append("Username must be at least 2 characters.")
            continue
        if f == "username" and val and len(val) > 100:
            errors.append("Username is too long (max 100 characters).")
            continue
        if f == "phone" and val and len(val) > 20:
            errors.append("Phone number is too long.")
            continue
        if f == "school" and val and len(val) > 100:
            errors.append("School name is too long.")
            continue
        if f == "avatar_url" and val:
            # Validate base64 data URL for avatar
            if not val.startswith("data:image/"):
                errors.append("Invalid avatar format. Must be a valid image data URL.")
                continue
            # Limit base64 size to ~500KB
            if len(val) > 600000:
                errors.append("Avatar image is too large. Please use a smaller image.")
                continue
        
        if val:  # Only add non-empty values
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
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to update user {uid}: {e}")
        raise HTTPException(500, "Failed to update profile. Please try again.")
    finally:
        db.close()


def _calculate_xp(score: int, total: int, accuracy: float, time_spent: int = 0) -> int:
    """Tính XP từ kết quả bài test. Thêm time_bonus nếu hoàn thành nhanh."""
    base_xp = score * 10
    acc_bonus = 20 if accuracy >= 80 else (10 if accuracy >= 60 else 0)
    # Bonus tốc độ: hoàn thành <30s/câu và accuracy >=70% → thêm 15 XP
    avg_time_per_q = (time_spent / total) if total > 0 else 999
    time_bonus = 15 if (avg_time_per_q < 30 and accuracy >= 70) else 0
    return base_xp + acc_bonus + time_bonus

def _get_user_xp(db, uid: int) -> int:
    rows = db.execute(
        "SELECT score, total, accuracy, time_spent FROM test_results WHERE user_id=?", (uid,)
    ).fetchall()
    return sum(_calculate_xp(r["score"], r["total"], r["accuracy"] or 0, r["time_spent"] or 0) for r in rows)

def _get_user_streak(db, uid: int) -> tuple[int, int]:
    rows = db.execute(
        "SELECT DATE(taken_at) as day FROM test_results WHERE user_id=? ORDER BY taken_at DESC",
        (uid,),
    ).fetchall()
    if not rows:
        return 0, 0

    unique_days = sorted({row["day"] for row in rows}, reverse=True)
    if len(unique_days) == 1:
        # Chỉ có 1 ngày duy nhất
        day = datetime.strptime(unique_days[0], "%Y-%m-%d").date()
        today = datetime.now().date()
        current = 1 if day >= today - timedelta(days=1) else 0
        return current, 1

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

    # Tính longest streak
    longest_streak = 1
    streak_count = 1
    for i in range(1, len(unique_days)):
        prev_day = datetime.strptime(unique_days[i - 1], "%Y-%m-%d").date()
        curr_day = datetime.strptime(unique_days[i], "%Y-%m-%d").date()
        if (prev_day - curr_day).days == 1:
            streak_count += 1
            longest_streak = max(longest_streak, streak_count)
        else:
            streak_count = 1

    return current_streak, longest_streak


@app.get("/api/competitive-stats")
async def competitive_stats(request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        xp = _get_user_xp(db, uid)
        current_streak, longest_streak = _get_user_streak(db, uid)

        rank_rows = db.execute("""
            SELECT u.id FROM users u
            LEFT JOIN test_results tr ON u.id = tr.user_id
            GROUP BY u.id
            ORDER BY SUM(CASE WHEN tr.score IS NOT NULL THEN tr.score ELSE 0 END) DESC
        """).fetchall()

        global_rank = 1
        for i, r in enumerate(rank_rows):
            if r["id"] == uid:
                global_rank = i + 1
                break

        return JSONResponse({
            "xp": xp,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "global_rank": global_rank,
        })
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  SCORES
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/test-result")
async def save_test(request: Request):
    uid = await resolve_user_id(request)
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
    uid = await resolve_user_id(request)
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
    uid = await resolve_user_id(request)
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
    uid = await resolve_user_id(request)
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
    # MathGPT mode: "hint" (Socratic default) | "solution" (full answer + bài phái sinh)
    chat_mode    = d.get("mode", "hint")

    if not user_message and not image_data:
        raise HTTPException(400, "message is required.")
    if not user_message:
        user_message = "Hãy giải bài toán trong ảnh này cho em."  # fallback khi chỉ có ảnh

    history = ensure_session(session_id)
    is_viz_request = "visualizer" in user_message or "viz" in user_message or "instructions" in user_message

    if image_data:
        if "," in image_data:
            header, b64 = image_data.split(",", 1)
            media_type  = header.split(":")[1].split(";")[0]
        else:
            b64, media_type = image_data, "image/jpeg"

        gemini_api_key = os.environ.get("GEMINI_API_KEY", "AQ.Ab8RN6J0P2bjKP175mWC2WefMm4hejW0sm-PmhEd0iGXt9W1Bg")
        
        # Build prompt variant according to mode
        img_prompt_variant = chat_mode if chat_mode in ("solution", "raw_solution") else "image"
        system_prompt = cached_system_prompt(img_prompt_variant)
        
        if is_viz_request:
            system_prompt = (
                "You are an expert mathematical visualizer and graph plotter.\n"
                "Your task is to analyze the math problem and output ONLY a valid JSON object matching the requested schema.\n"
                "You MUST ensure that the returned math steps ('stepsVI', 'stepsEN') wrap ALL math symbols, variables, fractions, and equations in dollar signs ($...$ for inline, $$...$$ for block).\n"
                "You MUST use vibrant neon colors for drawing instructions (lines, shapes, points) instead of plain white/black, label all vertices clearly, and highlight sub-regions.\n"
                "Do NOT include any extra text, preamble, or markdown code block wrappers (like ```json). Just output the raw JSON."
            )
            
        retrieved_kb = retrieve_math_context(user_message)
        full_system_prompt = (
            f"{system_prompt}\n\n"
            f"## REFERENCE MATHEMATICAL KNOWLEDGE (DO NOT COPY DIRECTLY):\n"
            f"The following context contains formulas and examples for reference. "
            f"You MUST only use it as a general conceptual reference. "
            f"NEVER solve or copy the example equations, functions, or numbers from this reference context. "
            f"Only solve the exact problem and numbers specified in the User Request.\n\n"
            f"{retrieved_kb}"
        )
        
        # Map conversation history to Gemini structure
        gemini_contents = []
        for h in history[-5:]:
            role = "model" if h["role"] == "assistant" else "user"
            content = h.get("content") or ""
            if content.startswith("[Image] "):
                content = content[8:]
            if content.strip():
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })
            
        # Add current user turn with the image
        gemini_contents.append({
            "role": "user",
            "parts": [
                {"text": user_message},
                {
                    "inlineData": {
                        "mimeType": media_type,
                        "data": b64
                    }
                }
            ]
        })
        
        history.append({"role": "user", "content": f"[Image] {user_message}"})
        client = await get_http_client()
        
        if use_stream:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?key={gemini_api_key}&alt=sse"
            payload = {
                "contents": gemini_contents,
                "systemInstruction": {
                    "parts": [{"text": full_system_prompt}]
                },
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2000 if chat_mode in ("solution", "raw_solution") else 1024
                }
            }
            
            async def generate():
                full_reply = []
                try:
                    async with client.stream("POST", url, json=payload, timeout=30) as resp:
                        resp.raise_for_status()
                        async for raw_line in resp.aiter_lines():
                            if not raw_line:
                                continue
                            line = raw_line
                            if line.startswith("data: "):
                                data_str = line[6:]
                                try:
                                    chunk = json.loads(data_str)
                                    token = chunk["candidates"][0]["content"]["parts"][0].get("text", "")
                                    if token:
                                        full_reply.append(token)
                                        yield f"data: {orjson.dumps({'token': token, 'session_id': session_id}).decode()}\n\n"
                                except Exception:
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
        else:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={gemini_api_key}"
            payload = {
                "contents": gemini_contents,
                "systemInstruction": {
                    "parts": [{"text": full_system_prompt}]
                },
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2000 if chat_mode in ("solution", "raw_solution") else 1024
                }
            }
            try:
                resp = await client.post(url, json=payload, timeout=30)
                resp.raise_for_status()
                reply = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as e:
                import traceback
                traceback.print_exc()
                if hasattr(e, "response") and e.response is not None:
                    print("[ERROR] Gemini API response text:", e.response.text)
                    return JSONResponse({"error": True, "reply": f"AI unavailable: {e} - {e.response.text}"}, status_code=502)
                return JSONResponse({"error": True, "reply": f"AI unavailable: {e}"}, status_code=502)

            history.append({"role": "assistant", "content": reply})
            save_history(session_id, history)
            return JSONResponse({"reply": reply, "session_id": session_id, "history_length": len(history)})
    else:
        user_content  = user_message
        
        if is_viz_request:
            model         = "llama-3.3-70b-versatile"
            system_prompt = (
                "You are an expert mathematical visualizer and graph plotter.\n"
                "Your task is to analyze the math problem and output ONLY a valid JSON object matching the requested schema.\n"
                "Do NOT include any extra text, preamble, or markdown code block wrappers (like ```json). Just output the raw JSON."
            )
        else:
            # mode="solution" → giải đầy đủ + bài phái sinh; mặc định → Socratic hint
            prompt_variant = chat_mode if chat_mode in ("solution", "raw_solution") else "text"
            model         = "llama-3.1-8b-instant"
            system_prompt = cached_system_prompt(prompt_variant)
        history.append({"role": "user", "content": user_message})

    # Retrieve mathematical context using LightRAG-style retriever
    retrieved_kb = retrieve_math_context(user_message)
    full_system_prompt = (
        f"{system_prompt}\n\n"
        f"## REFERENCE MATHEMATICAL KNOWLEDGE (DO NOT COPY DIRECTLY):\n"
        f"The following context contains formulas and examples for reference. "
        f"You MUST only use it as a general conceptual reference. "
        f"NEVER solve or copy the example equations, functions, or numbers from this reference context. "
        f"Only solve the exact problem and numbers specified in the User Request.\n\n"
        f"{retrieved_kb}"
    )

    # Build messages without mutating history dicts (slicing shares dict refs in Python)
    context_history = [] if is_viz_request else history[-5:-1]  # previous turns, excluding the just-appended user turn
    
    if "vision" in model and isinstance(user_content, list):
        # Merge system prompt into user_content text part
        new_user_content = []
        for item in user_content:
            if item.get("type") == "text":
                new_user_content.append({
                    "type": "text",
                    "text": f"{full_system_prompt}\n\nUser request:\n{item.get('text', '')}"
                })
            else:
                new_user_content.append(item)
        messages = context_history + [{"role": "user", "content": new_user_content}]
    else:
        messages = (
            [{"role": "system", "content": full_system_prompt}]
            + context_history
            + [{"role": "user", "content": user_content}]
        )

    # Solution mode cần nhiều token hơn để sinh cả lời giải + bài phái sinh
    max_tokens = 2000 if chat_mode in ("solution", "raw_solution") else 1024
    payload = {
        "model": model, "messages": messages,
        "max_tokens": max_tokens, "temperature": 0.3,
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
        import traceback
        traceback.print_exc()
        if hasattr(e, "response") and e.response is not None:
            print("[ERROR] Groq API response text:", e.response.text)
            return JSONResponse({"error": True, "reply": f"AI unavailable: {e} - {e.response.text}"}, status_code=502)
        return JSONResponse({"error": True, "reply": f"AI unavailable: {e}"}, status_code=502)

    history.append({"role": "assistant", "content": reply})
    save_history(session_id, history)
    return JSONResponse({"reply": reply, "session_id": session_id, "history_length": len(history)})


# ═══════════════════════════════════════════════════════════════════════════════
#  TRANSLATE
# ═══════════════════════════════════════════════════════════════════════════════

#  TRANSLATE
# ═══════════════════════════════════════════════════════════════════════════════

def get_mock_translation(text: str) -> dict:
    t = text.lower()
    if any(k in t for k in ["parabol", "quadratic", "hàm số bậc hai", "đỉnh"]):
        return {
            "translation": "Hàm số bậc hai (Parabola)",
            "summary": "Hàm số bậc hai có dạng y = ax² + bx + c (a ≠ 0), đồ thị là một parabol.",
            "source_lang": "en" if "quadratic" in t or "parabola" in t else "vi",
            "diagram_type": "parabola",
            "theory": {
                "vi": "Hàm số bậc hai $y = ax^2 + bx + c$ ($a \\neq 0$) có đỉnh là $I\\left(-\\frac{b}{2a}, -\\frac{\\Delta}{4a}\\right)$.\n\nTrục đối xứng là $x = -\\frac{b}{2a}$. Đồ thị mở lên nếu $a > 0$ và xuống nếu $a < 0$.",
                "en": "The quadratic function $y = ax^2 + bx + c$ ($a \\neq 0$) has its vertex at $I\\left(-\\frac{b}{2a}, -\\frac{\\Delta}{4a}\\right)$.\n\nThe axis of symmetry is $x = -\\frac{b}{2a}$. It opens upwards if $a > 0$ and downwards if $a < 0$."
            },
            "words": [
                {"word": "parabola", "type": "noun", "pronunciation": "/pəˈræb.əl.ə/", "vietnamese": "đường parabol", "example": "The graph of a quadratic function is a parabola."},
                {"word": "vertex", "type": "noun", "pronunciation": "/ˈvɜː.teks/", "vietnamese": "đỉnh", "example": "The vertex of the parabola is at (2, -1)."}
            ]
        }
    elif any(k in t for k in ["venn", "set", "tập hợp"]):
        return {
            "translation": "Biểu đồ Venn / Tập hợp",
            "summary": "Biểu đồ Venn dùng các vòng tròn để biểu diễn trực quan quan hệ giữa các tập hợp.",
            "source_lang": "en" if "set" in t or "venn" in t else "vi",
            "diagram_type": "venn",
            "theory": {
                "vi": "Biểu đồ Venn biểu diễn các tập hợp dưới dạng hình học.\n\n- Giao của 2 tập hợp $A \\cap B$ chứa các phần tử thuộc cả $A$ và $B$.\n- Hợp của 2 tập hợp $A \\cup B$ chứa các phần tử thuộc $A$, $B$ hoặc cả hai.",
                "en": "Venn diagrams represent sets geometrically using circles.\n\n- Intersection $A \\cap B$ contains elements in both $A$ and $B$.\n- Union $A \\cup B$ contains elements in $A$, $B$, or both."
            },
            "words": [
                {"word": "set", "type": "noun", "pronunciation": "/set/", "vietnamese": "tập hợp", "example": "Let A be the set of natural numbers."},
                {"word": "intersection", "type": "noun", "pronunciation": "/ˌɪn.təˈsek.ʃən/", "vietnamese": "phần giao", "example": "The intersection of sets A and B is denoted by A ∩ B."}
            ]
        }
    elif any(k in t for k in ["inequality", "bất đẳng thức", "bất phương trình"]):
        return {
            "translation": "Bất đẳng thức (Inequality)",
            "summary": "Bất đẳng thức so sánh giá trị của hai biểu thức toán học không bằng nhau.",
            "source_lang": "en" if "inequality" in t else "vi",
            "diagram_type": "inequality",
            "theory": {
                "vi": "Bất đẳng thức so sánh biểu thức dùng các dấu $<, \\le, >, \\ge$.\n\n- Bất đẳng thức Cauchy (AM-GM): Với các số không âm, trung bình cộng lớn hơn hoặc bằng trung bình nhân: $\\frac{a+b}{2} \\ge \\sqrt{ab}$.",
                "en": "Inequalities compare expressions using $<, \\le, >, \\ge$.\n\n- AM-GM Inequality: For non-negative numbers, the arithmetic mean is at least the geometric mean: $\\frac{a+b}{2} \\ge \\sqrt{ab}$."
            },
            "words": [
                {"word": "inequality", "type": "noun", "pronunciation": "/ˌɪn.ɪˈkwɒl.ə.ti/", "vietnamese": "bất đẳng thức", "example": "We need to prove the Cauchy inequality."},
                {"word": "greater than", "type": "phrase", "pronunciation": "/ɡreɪtə ðæn/", "vietnamese": "lớn hơn", "example": "5 is greater than 3."}
            ]
        }
    elif any(k in t for k in ["vector", "vectơ", "hướng"]):
        return {
            "translation": "Vectơ (Vector)",
            "summary": "Một đoạn thẳng có hướng xác định bởi điểm đầu và điểm cuối.",
            "source_lang": "en" if "vector" in t else "vi",
            "diagram_type": "vectors",
            "theory": {
                "vi": "Vectơ $\\vec{u}$ có độ dài và hướng xác định.\n\n- Quy tắc ba điểm: $\\vec{AB} + \\vec{BC} = \\vec{AC}$.\n- Phép cộng vectơ tuân theo quy tắc hình bình hành.",
                "en": "A vector $\\vec{u}$ is determined by its magnitude and direction.\n\n- Triangle rule: $\\vec{AB} + \\vec{BC} = \\vec{AC}$.\n- Vector addition follows the parallelogram rule."
            },
            "words": [
                {"word": "vector", "type": "noun", "pronunciation": "/ˈvek.tər/", "vietnamese": "vectơ", "example": "Force is a vector quantity."},
                {"word": "magnitude", "type": "noun", "pronunciation": "/ˈmæɡ.nɪ.tʃuːd/", "vietnamese": "độ lớn / độ dài", "example": "The magnitude of the vector is 5."}
            ]
        }
    elif any(k in t for k in ["ellipse", "elip", "tiêu điểm"]):
        return {
            "translation": "Đường Elip (Ellipse)",
            "summary": "Đường elip là tập hợp các điểm có tổng khoảng cách tới hai tiêu điểm F1 và F2 là hằng số 2a.",
            "source_lang": "en" if "ellipse" in t else "vi",
            "diagram_type": "ellipse",
            "theory": {
                "vi": "Phương trình chính tắc của Elip: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($a > b > 0$).\n\n- Tiêu cự: $2c$ với $c = \\sqrt{a^2 - b^2}$.\n- Tiêu điểm: $F_1(-c, 0)$, $F_2(c, 0)$.",
                "en": "Standard equation of an ellipse: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($a > b > 0$).\n\n- Focal length: $2c$ with $c = \\sqrt{a^2 - b^2}$.\n- Foci: $F_1(-c, 0)$, $F_2(c, 0)$."
            },
            "words": [
                {"word": "ellipse", "type": "noun", "pronunciation": "/iˈlɪps/", "vietnamese": "elip", "example": "Planets move around the Sun in elliptical orbits."},
                {"word": "foci", "type": "noun (plural)", "pronunciation": "/ˈfəʊ.saɪ/", "vietnamese": "các tiêu điểm", "example": "An ellipse has two foci."}
            ]
        }
    elif any(k in t for k in ["trig", "sin", "cos", "tan", "lượng giác"]):
        return {
            "translation": "Lượng giác (Trigonometry)",
            "summary": "Các hàm số lượng giác định nghĩa góc quay trên đường tròn lượng giác đơn vị.",
            "source_lang": "en" if "trig" in t or "sin" in t or "cos" in t or "tan" in t else "vi",
            "diagram_type": "trig",
            "theory": {
                "vi": "Đường tròn lượng giác có bán kính bằng $1$.\n\n- Công thức cơ bản: $\\sin^2 x + \\cos^2 x = 1$.\n- Trục hoành biểu thị giá trị của $\\cos x$, trục tung biểu thị $\\sin x$.",
                "en": "The unit circle has a radius of $1$.\n\n- Fundamental identity: $\\sin^2 x + \\cos^2 x = 1$.\n- The horizontal axis shows $\\cos x$, the vertical axis shows $\\sin x$."
            },
            "words": [
                {"word": "sine", "type": "noun", "pronunciation": "/saɪn/", "vietnamese": "sin", "example": "The sine of 90 degrees is 1."},
                {"word": "unit circle", "type": "noun", "pronunciation": "/ˈjuː.nɪt ˈsɜː.kəl/", "vietnamese": "đường tròn lượng giác", "example": "Trigonometric values are represented on the unit circle."}
            ]
        }
    else:
        return {
            "translation": f"Bản dịch tương đương của: '{text}'",
            "summary": f"Thuật ngữ toán học: {text}",
            "source_lang": "vi" if any(c in t for c in "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ") else "en",
            "diagram_type": "default",
            "theory": {
                "vi": f"Lý thuyết liên quan đến cụm từ **{text}**.\n\nCác công thức toán tương đương có thể biểu diễn qua hệ thống LaTeX: $a^2 + b^2 = c^2$.",
                "en": f"Theory related to the term **{text}**.\n\nMathematical formulas are represented via LaTeX: $a^2 + b^2 = c^2$."
            },
            "words": [
                {"word": text, "type": "term", "pronunciation": "/.../", "vietnamese": "Dịch nghĩa tương ứng", "example": "Example usage context."}
            ]
        }
@app.post("/api/video/generate")
async def generate_video(request: Request):
    try:
        data = await request.json()
        instructions = data.get("instructions") or []
        if not instructions:
            raise HTTPException(status_code=400, detail="Missing instructions")
            
        video_id = str(uuid.uuid4())
        
        # Prepare output directory in frontend public
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        frontend_public = os.path.abspath(os.path.join(backend_dir, "..", "frontend", "public"))
        videos_dir = os.path.join(frontend_public, "videos")
        os.makedirs(videos_dir, exist_ok=True)
        
        output_file = os.path.join(videos_dir, f"{video_id}.mp4")
        
        # Run python compilation in D:\duosteam_venv
        compiler_script = os.path.join(backend_dir, "canvas_to_video.py")
        json_str = json.dumps(instructions)
        
        # Subprocess call using the venv python interpreter on D: drive
        python_exe = r"D:\duosteam_venv\Scripts\python.exe"
        if not os.path.exists(python_exe):
            # Fallback to local venv python if D drive venv is not ready
            python_exe = os.path.abspath(os.path.join(backend_dir, "..", ".venv", "Scripts", "python.exe"))
            
        cmd = [python_exe, compiler_script, json_str, output_file]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            err_msg = stderr.decode()
            print("[ERROR] Video generation failed:", err_msg)
            raise HTTPException(status_code=500, detail=f"Video rendering failed: {err_msg}")
            
        return {"url": f"/videos/{video_id}.mp4"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate(request: Request):
    d = await request.json()
    text = (d.get("text") or "").strip()[:500]
    if not text:
        raise HTTPException(400, "text is required.")

    # Try resolving user id for daily progress tracking (optional)
    uid = None
    try:
        uid = await resolve_user_id(request)
    except Exception:
        pass

    if uid:
        db = get_db()
        try:
            _check_and_reset_daily_progress(db, uid)
            db.execute("UPDATE daily_progress SET socratic_count = socratic_count + 1 WHERE user_id=?", (uid,))
            db.commit()
        except Exception as e:
            print("[WARN] Failed to increment socratic progress:", e)
        finally:
            db.close()

    # FALLBACK if Groq Key is missing
    if not GROQ_KEY:
        return JSONResponse(get_mock_translation(text))

    prompt = (
        "You are a translation API. Analyze the input text. "
        "If it is in English, translate it to Vietnamese, and provide bilingual (English & Vietnamese) mathematical explanations. "
        "If it is in Vietnamese, translate it to English, and provide bilingual mathematical explanations.\n\n"
        "Also, determine if the mathematical concept matches or relates to one of these diagrams:\n"
        "- 'venn': for sets, logic, intersection, union, Venn diagram, etc.\n"
        "- 'inequality': for inequalities, bounds, regions, systems of inequalities, etc.\n"
        "- 'parabola': for quadratic functions, vertex, axis of symmetry, parabol, quadratic, etc.\n"
        "- 'vectors': for vectors, direction, velocity, vector sum, resultant vector, etc.\n"
        "- 'ellipse': for ellipse, foci, major axis, ellipse equation, etc.\n"
        "- 'trig': for trigonometric functions, angle, sin, cos, tan, unit circle, etc.\n"
        "- 'default': if it does not fit any of the above.\n\n"
        "Reply ONLY with a valid JSON object matching this exact schema (do not wrap in markdown, output only the raw JSON):\n"
        "{\n"
        '  "translation": "...", // The main translation (Vietnamese if input was English, English if input was Vietnamese)\n'
        '  "summary": "...", // A short conceptual summary of the term or phrase\n'
        '  "source_lang": "en" | "vi",\n'
        '  "diagram_type": "venn" | "inequality" | "parabola" | "vectors" | "ellipse" | "trig" | "default",\n'
        '  "theory": {\n'
        '    "vi": "...", // Detailed explanation of the mathematical concept in Vietnamese with KaTeX/LaTeX formulas like $formula$\n'
        '    "en": "..."  // Detailed explanation of the mathematical concept in English with KaTeX/LaTeX formulas like $formula$\n'
        '  },\n'
        '  "words": [\n'
        "    {\n"
        '      "word": "...", // Key vocabulary word in the source language\n'
        '      "type": "...", // noun, verb, adj, etc.\n'
        '      "pronunciation": "...",\n'
        '      "vietnamese": "...", // The translation in the target language (keep key as "vietnamese" for compatibility)\n'
        '      "example": "..." // Example sentence using this word in both languages or target language\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        f"Input text:\n{text}"
    )
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a JSON-only translation API. Output only the JSON object."},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens": 500, "temperature": 0.2,
    }

    import re as _re
    client = await get_http_client()
    try:
        resp = await client.post(
            f"{GROQ_BASE}/chat/completions",
            headers=groq_headers(), json=payload,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"]

        # Strip markdown fences first
        clean = raw.strip()
        clean = _re.sub(r'^```(?:json)?\s*', '', clean)
        clean = _re.sub(r'\s*```$', '', clean).strip()

        # Try direct parse
        try:
            return JSONResponse(json.loads(clean))
        except json.JSONDecodeError:
            pass

        # Fallback: extract first {...} block from the raw response
        m = _re.search(r'(\{[\s\S]*\})', clean)
        if m:
            try:
                return JSONResponse(json.loads(m.group(1)))
            except json.JSONDecodeError:
                pass

        # Last resort: return error with the raw text
        return JSONResponse({"error": True, "raw": raw})
    except Exception as e:
        # Fallback to local mock if Groq fails or returns 502/401/rate limits
        return JSONResponse(get_mock_translation(text))


# ═══════════════════════════════════════════════════════════════════════════════
#  AI MATHMAP PARSER
# ═══════════════════════════════════════════════════════════════════════════════

def parse_math_questions_local(text: str) -> dict:
    import re
    lines = [line.strip() for line in text.split("\n")]
    questions = []
    current_q = None
    title = "MathMap được chuyển hóa từ file"
    description = "Được tạo tự động từ tệp tin câu hỏi của bạn"
    grade = "Lớp 11"
    
    for line in lines:
        if not line:
            continue
        if line.startswith("Tiêu đề:") or line.startswith("Title:"):
            title = line.split(":", 1)[1].strip()
            continue
        if line.startswith("Mô tả:") or line.startswith("Description:"):
            description = line.split(":", 1)[1].strip()
            continue
        if line.startswith("Lớp:") or line.startswith("Grade:"):
            grade = line.split(":", 1)[1].strip()
            continue

        q_match = re.match(r'^(?:Câu|Question)\s+(\d+)\s*:\s*(.*)', line, re.IGNORECASE)
        if q_match:
            if current_q:
                questions.append(current_q)
            current_q = {
                "id": f"q-{len(questions) + 1}",
                "type": "multiple_choice",
                "order": len(questions) + 1,
                "content_vi": q_match.group(2).strip(),
                "content_en": "",
                "options": [],
                "correct_answer": "a",
                "explanation_vi": "",
                "points": 100,
                "time_seconds": 30
            }
            continue

        if current_q:
            opt_match = re.match(r'^([A-D])\.\s*(.*)', line, re.IGNORECASE)
            if opt_match:
                letter = opt_match.group(1).lower()
                text_val = opt_match.group(2).strip()
                current_q["options"].append({
                    "id": letter,
                    "text_vi": text_val,
                    "text_en": ""
                })
                continue
            
            ans_match = re.match(r'^(?:Đáp án|Answer)\s*:\s*([A-D])', line, re.IGNORECASE)
            if ans_match:
                current_q["correct_answer"] = ans_match.group(1).lower()
                continue
                
            exp_match = re.match(r'^(?:Giải thích|Explanation)\s*:\s*(.*)', line, re.IGNORECASE)
            if exp_match:
                current_q["explanation_vi"] = exp_match.group(1).strip()
                continue
            
            if not current_q["options"] and not current_q["explanation_vi"]:
                current_q["content_vi"] += "\n" + line

    if current_q:
        questions.append(current_q)
        
    return {
        "title": title,
        "title_en": title,
        "description": description,
        "grade": grade,
        "questions": questions
    }

@app.post("/api/mathmap/parse-file")
async def mathmap_parse_file(request: Request):
    d = await request.json()
    text = (d.get("text") or "").strip()
    if not text:
        raise HTTPException(400, "text is required.")

    # Try local template parser first
    local_parsed = parse_math_questions_local(text)
    if local_parsed["questions"]:
        return JSONResponse(local_parsed)

    # If local parser found nothing and GROQ key is empty, return local parsed (empty list) rather than failing
    if not GROQ_KEY:
        return JSONResponse(local_parsed)

    # Prompting Llama to parse raw questions into structured JSON
    prompt = (
        "You are an expert math curriculum AI. Your task is to parse a text file containing math questions "
        "and convert them into a structured JSON object representing a MathMap lesson or test.\n\n"
        "Here are the rules to recognize the questions:\n"
        "- Questions typically start with 'Câu [Số]:' or 'Question [No]:'\n"
        "- Options are listed with A., B., C., D. prefixes\n"
        "- The correct answer is indicated by 'Đáp án: [A/B/C/D]' or 'Answer: [A/B/C/D]'\n"
        "- Optional explanations might start with 'Giải thích:' or 'Explanation:'\n\n"
        "Identify the overall title and short description of this question set. Determine if each question is a "
        "multiple_choice or standard question. Map the choices (A, B, C, D) to options arrays containing "
        "id ('a', 'b', 'c', 'd') and text (both text_vi and text_en if translation is possible, or just text_vi).\n"
        "Map the correct answer letter to a single lowercase character ('a', 'b', 'c', or 'd').\n\n"
        "Return ONLY a valid JSON object matching this exact schema (no markdown formatting, no comments, no ellipses):\n"
        "{\n"
        '  "title": "...", // Overall title in Vietnamese\n'
        '  "title_en": "...", // Title in English\n'
        '  "description": "...", // Short description\n'
        '  "grade": "Lớp 10" | "Lớp 11" | "Lớp 12", // Determine if Lớp 10, 11 or 12\n'
        '  "questions": [\n'
        "    {\n"
        '      "id": "...", // unique id like q-1, q-2, etc.\n'
        '      "type": "multiple_choice",\n'
        '      "order": 1, // index starting from 1\n'
        '      "content_vi": "...", // Question text in Vietnamese\n'
        '      "content_en": "...", // Question text in English (translate if not present)\n'
        '      "options": [\n'
        '        {"id": "a", "text_vi": "...", "text_en": "..."},\n'
        '        {"id": "b", "text_vi": "...", "text_en": "..."},\n'
        '        {"id": "c", "text_vi": "...", "text_en": "..."},\n'
        '        {"id": "d", "text_vi": "...", "text_en": "..."}\n'
        "      ],\n"
        '      "correct_answer": "a" | "b" | "c" | "d",\n'
        '      "explanation_vi": "...", // Explanation in Vietnamese\n'
        '      "explanation_en": "...", // Explanation in English\n'
        '      "points": 100,\n'
        '      "time_seconds": 30\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        f"Input raw text:\n{text}"
    )

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a JSON-only math content parser. Output only the JSON object, do not wrap in markdown code blocks."},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens": 1200, "temperature": 0.1,
    }

    import re as _re
    client = await get_http_client()
    try:
        resp = await client.post(
            f"{GROQ_BASE}/chat/completions",
            headers=groq_headers(), json=payload,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"]

        clean = raw.strip()
        clean = _re.sub(r'^```(?:json)?\s*', '', clean)
        clean = _re.sub(r'\s*```$', '', clean).strip()

        try:
            return JSONResponse(json.loads(clean))
        except json.JSONDecodeError:
            pass

        m = _re.search(r'(\{[\s\S]*\})', clean)
        if m:
            try:
                return JSONResponse(json.loads(m.group(1)))
            except json.JSONDecodeError:
                pass

        return JSONResponse(local_parsed)
    except Exception as e:
        return JSONResponse(local_parsed)




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
        "status":           "ok" if db_ok else "degraded",
        "service":          "DuoMath API v4 (FastAPI) — MathGPT Edition",
        "db_latency_ms":    db_ms,
        "keep_alive":       bool(SELF_URL),
        "text_model":       "llama-3.1-8b-instant",
        "vision_model":     "llama-3.3-70b-versatile (via local EasyOCR)",
        "ocr_available":    _ocr_available,
        "mathgpt_mode":     "socratic",
        "lightrag_nodes":   len(MATH_CONCEPT_GRAPH["nodes"]),
        "lightrag_edges":   len(MATH_CONCEPT_GRAPH["edges"]),
        "chat_modes":       ["hint", "solution", "image"],
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  ADMIN & REPORTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/users")
async def admin_get_users(request: Request):
    await verify_admin(request)
    db = get_db()
    try:
        rows = db.execute("""
            SELECT u.*, 
                   (SELECT COUNT(*) FROM test_results WHERE user_id = u.id) as tests_count,
                   (SELECT COUNT(*) FROM minigame_results WHERE user_id = u.id) as games_count
            FROM users u
        """).fetchall()
        users_list = []
        for r in rows:
            d = user_dict(r)
            d["tests_count"] = r["tests_count"]
            d["games_count"] = r["games_count"]
            users_list.append(d)
        return JSONResponse(users_list)
    finally:
        db.close()


@app.patch("/api/admin/users/{user_id}/role")
async def admin_change_role(user_id: int, request: Request):
    await verify_admin(request)
    d = await request.json()
    is_admin = int(d.get("is_admin", 0))
    db = get_db()
    try:
        # Prevent demoting the super admin email
        row = db.execute("SELECT email FROM users WHERE id=?", (user_id,)).fetchone()
        if row and row["email"].lower() == "will050710@gmail.com":
            raise HTTPException(400, "Không thể thu hồi quyền Super Admin.")
        
        db.execute("UPDATE users SET is_admin=? WHERE id=?", (is_admin, user_id))
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()


@app.patch("/api/admin/users/{user_id}/ban")
async def admin_ban_user(user_id: int, request: Request):
    await verify_admin(request)
    d = await request.json()
    banned = int(d.get("banned", 1))
    reason = d.get("reason", "").strip()
    db = get_db()
    try:
        # Prevent banning the super admin email
        row = db.execute("SELECT email FROM users WHERE id=?", (user_id,)).fetchone()
        if row and row["email"].lower() == "will050710@gmail.com":
            raise HTTPException(400, "Không thể khóa tài khoản Super Admin.")
            
        db.execute("UPDATE users SET banned=?, ban_reason=? WHERE id=?", (banned, reason, user_id))
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()


@app.post("/api/reports")
async def create_report(request: Request):
    reporter_id = await resolve_user_id(request)
    d = await request.json()
    reported_user_id = d.get("reported_user_id")
    reported_username = d.get("reported_username")
    reason = d.get("reason", "").strip()
    if not reason:
        raise HTTPException(400, "Lý do báo cáo không được để trống.")
    db = get_db()
    try:
        target_uid = None
        if reported_user_id:
            target_uid = int(reported_user_id)
        elif reported_username:
            row = db.execute("SELECT id FROM users WHERE username=? COLLATE NOCASE", (reported_username.strip(),)).fetchone()
            if not row:
                raise HTTPException(404, f"Không tìm thấy người dùng có tên '{reported_username}'.")
            target_uid = row["id"]
        else:
            raise HTTPException(400, "reported_user_id hoặc reported_username là bắt buộc.")
            
        db.execute(
            "INSERT INTO reports (reporter_id, reported_user_id, reason) VALUES (?, ?, ?)",
            (reporter_id, target_uid, reason)
        )
        db.commit()
        return JSONResponse({"ok": True}, status_code=201)
    finally:
        db.close()


@app.get("/api/admin/reports")
async def admin_get_reports(request: Request):
    await verify_admin(request)
    db = get_db()
    try:
        rows = db.execute("""
            SELECT r.*, 
                   u1.username as reporter_name, u1.email as reporter_email,
                   u2.username as reported_name, u2.email as reported_email, u2.banned as reported_banned
            FROM reports r
            JOIN users u1 ON r.reporter_id = u1.id
            JOIN users u2 ON r.reported_user_id = u2.id
            ORDER BY r.created_at DESC
        """).fetchall()
        reports_list = []
        for r in rows:
            reports_list.append({
                "id": r["id"],
                "reporter_id": r["reporter_id"],
                "reporter_name": r["reporter_name"],
                "reporter_email": r["reporter_email"],
                "reported_user_id": r["reported_user_id"],
                "reported_name": r["reported_name"],
                "reported_email": r["reported_email"],
                "reported_banned": r["reported_banned"],
                "reason": r["reason"],
                "status": r["status"],
                "created_at": r["created_at"],
            })
        return JSONResponse(reports_list)
    finally:
        db.close()


@app.post("/api/admin/reports/{report_id}/resolve")
async def admin_resolve_report(report_id: int, request: Request):
    await verify_admin(request)
    d = await request.json()
    status = d.get("status", "resolved")
    db = get_db()
    try:
        db.execute("UPDATE reports SET status=? WHERE id=?", (status, report_id))
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()


@app.get("/api/admin/stats")
async def admin_get_stats(request: Request):
    await verify_admin(request)
    db = get_db()
    try:
        total_users = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_tests = db.execute("SELECT COUNT(*) FROM test_results").fetchone()[0]
        total_games = db.execute("SELECT COUNT(*) FROM minigame_results").fetchone()[0]
        total_reports = db.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
        pending_reports = db.execute("SELECT COUNT(*) FROM reports WHERE status='pending'").fetchone()[0]
        
        # Count mathmaps
        try:
            total_mathmaps = db.execute("SELECT COUNT(*) FROM mathmaps").fetchone()[0]
        except Exception:
            total_mathmaps = 0
            
        return JSONResponse({
            "total_users": total_users,
            "total_tests": total_tests,
            "total_games": total_games,
            "total_reports": total_reports,
            "pending_reports": pending_reports,
            "total_mathmaps": total_mathmaps,
        })
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  GAMIFICATION — ENGINE & ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

import random as _random
from datetime import date as _date

# ── Badge Catalog ──────────────────────────────────────────────────────────────
BADGE_CATALOG: dict[str, dict] = {
    "streak_3":       {"name_vi": "Nhất Quán",            "name_en": "Consistent",               "icon": "🔥", "tier": "bronze", "math_term": "Liên Tục / Continuity",       "desc_vi": "Duy trì streak 3 ngày liên tiếp"},
    "streak_7":       {"name_vi": "Đệ Quy Viên",          "name_en": "The Recursionist",         "icon": "🌀", "tier": "silver", "math_term": "Đệ Quy / Recursion",          "desc_vi": "7 ngày không gián đoạn"},
    "streak_30":      {"name_vi": "Bất Biến",             "name_en": "The Invariant",            "icon": "💎", "tier": "gold",   "math_term": "Bất Biến / Invariant",        "desc_vi": "30 ngày streak không gãy"},
    "streak_100":     {"name_vi": "Hàm Nhị Phân Sư",      "name_en": "Binary Legend",            "icon": "🌟", "tier": "gold",   "math_term": "Hàm Nhị Phân / Binary",      "desc_vi": "100 ngày streak huyền thoại"},
    "perfect_score":  {"name_vi": "Hàm Toàn Ánh",         "name_en": "The Surjection",          "icon": "🎯", "tier": "gold",   "math_term": "Toàn Ánh / Surjection",       "desc_vi": "Đạt 100% trong một bài kiểm tra"},
    "high_accuracy":  {"name_vi": "Tiệm Cận Hoàn Hảo",   "name_en": "Asymptotic Perfection",   "icon": "📈", "tier": "silver", "math_term": "Tiệm Cận / Asymptote",       "desc_vi": ">= 90% accuracy trong 5 bài liên tiếp"},
    "first_test":     {"name_vi": "Bài Toán Đầu Tiên",    "name_en": "First Equation",          "icon": "✏️", "tier": "bronze", "math_term": "Tập Hợp / Set",              "desc_vi": "Hoàn thành bài test đầu tiên"},
    "speed_demon":    {"name_vi": "Giới Hạn Tốc Độ",      "name_en": "The Speed Limit",         "icon": "⚡", "tier": "silver", "math_term": "Giới Hạn / Limit",           "desc_vi": "Hoàn thành bài test <2 phút và >=80%"},
    "calc_master":    {"name_vi": "Vi Phân Sư",           "name_en": "Lord of Derivatives",     "icon": "∂",  "tier": "gold",   "math_term": "Đạo Hàm / Derivative",       "desc_vi": "Accuracy >=85% trong chương Đạo Hàm"},
    "integral_hunter":{"name_vi": "Thợ Săn Nguyên Hàm",  "name_en": "Antiderivative Hunter",   "icon": "∫",  "tier": "silver", "math_term": "Tích Phân / Integral",        "desc_vi": "50 bài tích phân đúng"},
    "level_10":       {"name_vi": "Số Nguyên Tố Mười",    "name_en": "Prime 10",                "icon": "🔟", "tier": "silver", "math_term": "Số Nguyên Tố / Prime",       "desc_vi": "Đạt level 10"},
    "level_25":       {"name_vi": "Cấp Số Nhân Viên",     "name_en": "The Geometric Progressor","icon": "🏆", "tier": "gold",   "math_term": "Cấp Số Nhân / Geometric",   "desc_vi": "Đạt level 25"},
}

# XP thresholds — level n đạt được khi total_xp >= LEVEL_XP_THRESHOLDS[n-1]
LEVEL_XP_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,   # 1-10
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,  # 11-20
    26000, 30500, 35500, 41000, 47000, 54000,               # 21-26
]

def _xp_to_level(xp: int) -> int:
    for i, threshold in enumerate(LEVEL_XP_THRESHOLDS):
        if xp < threshold:
            return max(1, i)
    return len(LEVEL_XP_THRESHOLDS)

def _xp_to_league(xp: int) -> str:
    if xp < 500:   return "Bronze"
    if xp < 1500:  return "Silver"
    if xp < 4000:  return "Gold"
    if xp < 10000: return "Platinum"
    return "Diamond"

# ── Badge helper ───────────────────────────────────────────────────────────────
def _award_badge(db, user_id: int, badge_id: str) -> bool:
    """Trao badge nếu chưa có. Return True nếu vừa được trao."""
    try:
        db.execute(
            "INSERT INTO user_badges (user_id, badge_id) VALUES (?,?)",
            (user_id, badge_id)
        )
        db.commit()
        return True
    except Exception:
        return False  # UNIQUE constraint — đã có rồi

def _add_xp(db, user_id: int, xp: int):
    """Cộng XP, cập nhật level + league, kiểm tra badge level."""
    row = db.execute("SELECT total_xp FROM user_gamification WHERE user_id=?", (user_id,)).fetchone()
    if not row:
        db.execute(
            "INSERT INTO user_gamification (user_id, total_xp) VALUES (?,?)",
            (user_id, max(0, xp))
        )
        new_xp = max(0, xp)
    else:
        new_xp = max(0, row["total_xp"] + xp)
        db.execute("UPDATE user_gamification SET total_xp=? WHERE user_id=?", (new_xp, user_id))
    lvl    = _xp_to_level(new_xp)
    league = _xp_to_league(new_xp)
    db.execute(
        "UPDATE user_gamification SET level=?, league=? WHERE user_id=?",
        (lvl, league, user_id)
    )
    db.commit()
    if lvl >= 10: _award_badge(db, user_id, "level_10")
    if lvl >= 25: _award_badge(db, user_id, "level_25")

# ── Streak Engine ──────────────────────────────────────────────────────────────
_STREAK_XP: dict[int, int] = {3: 50, 7: 150, 14: 400, 30: 1000, 100: 5000}

def _streak_checkin(db, user_id: int) -> dict:
    """
    Ghi nhận activity hôm nay — idempotent (gọi nhiều lần/ngày = an toàn).
    Return dict với streak info và XP bonus.
    """
    today     = _date.today().isoformat()
    yesterday = (_date.today() - timedelta(days=1)).isoformat()

    row = db.execute(
        "SELECT * FROM user_gamification WHERE user_id=?", (user_id,)
    ).fetchone()

    if not row:
        db.execute(
            "INSERT INTO user_gamification (user_id, current_streak, longest_streak, last_active_date, total_xp) VALUES (?,1,1,?,10)",
            (user_id, today)
        )
        db.commit()
        _award_badge(db, user_id, "first_test")
        return {"new_streak": 1, "xp_bonus": 10, "freeze_used": False, "streak_reset": False}

    last      = row["last_active_date"]
    streak    = row["current_streak"]
    freezes   = row["freeze_count"]

    # Đã check-in hôm nay → idempotent
    if last == today:
        return {"new_streak": streak, "xp_bonus": 0, "freeze_used": False, "streak_reset": False}

    if last == yesterday:
        # Tiếp tục streak
        new_streak = streak + 1
        longest    = max(row["longest_streak"], new_streak)
        xp_bonus   = _STREAK_XP.get(new_streak, 20)
        db.execute(
            "UPDATE user_gamification SET current_streak=?, longest_streak=?, last_active_date=? WHERE user_id=?",
            (new_streak, longest, today, user_id)
        )
        db.commit()
        _add_xp(db, user_id, xp_bonus)
        for milestone, bid in [(3,"streak_3"),(7,"streak_7"),(30,"streak_30"),(100,"streak_100")]:
            if new_streak >= milestone:
                _award_badge(db, user_id, bid)
        return {"new_streak": new_streak, "xp_bonus": xp_bonus, "freeze_used": False, "streak_reset": False}

    # Streak bị gãy → thử dùng Freeze
    gap = (_date.today() - _date.fromisoformat(last)).days if last else 99
    if freezes > 0 and gap <= 2:
        db.execute(
            "UPDATE user_gamification SET freeze_count=freeze_count-1, last_active_date=? WHERE user_id=?",
            (today, user_id)
        )
        db.commit()
        return {"new_streak": streak, "xp_bonus": 5, "freeze_used": True, "streak_reset": False}

    # Reset streak
    db.execute(
        "UPDATE user_gamification SET current_streak=1, last_active_date=? WHERE user_id=?",
        (today, user_id)
    )
    db.commit()
    _add_xp(db, user_id, 10)
    return {"new_streak": 1, "xp_bonus": 10, "freeze_used": False, "streak_reset": True}

# ── Daily Quest Engine ─────────────────────────────────────────────────────────
_QUEST_TEMPLATES = [
    {"type": "solve_questions", "vi": "Giải {n} câu hỏi hôm nay",          "en": "Solve {n} questions today",            "targets": [5,10,15],  "xp": [30,60,100]},
    {"type": "accuracy_target",  "vi": "Đạt >={n}% accuracy trong bài test","en": "Achieve >={n}% accuracy in a test",   "targets": [70,80,90], "xp": [40,70,120]},
    {"type": "study_session",    "vi": "Hoàn thành {n} bài học",           "en": "Complete {n} lessons",                "targets": [1,2,3],    "xp": [25,50,80]},
    {"type": "topic_focus",      "vi": "Ôn {n} bài về chủ đề yếu nhất",   "en": "Practice {n} problems on weak topic", "targets": [3,5,8],    "xp": [35,65,110]},
    {"type": "speed_challenge",  "vi": "Giải {n} câu trong vòng 3 phút",  "en": "Solve {n} questions in 3 minutes",    "targets": [5,8,12],   "xp": [45,80,130]},
]

def _ensure_quests(db, user_id: int, count: int = 3) -> list:
    """Sinh daily quests nếu chưa có hôm nay. Return list dicts."""
    today    = _date.today().isoformat()
    existing = db.execute(
        "SELECT * FROM daily_quests WHERE user_id=? AND date=? ORDER BY id",
        (user_id, today)
    ).fetchall()
    if existing:
        return [dict(q) for q in existing]

    for tmpl in _random.sample(_QUEST_TEMPLATES, min(count, len(_QUEST_TEMPLATES))):
        idx = _random.randint(0, len(tmpl["targets"]) - 1)
        n   = tmpl["targets"][idx]
        db.execute(
            "INSERT OR IGNORE INTO daily_quests "
            "(user_id, date, quest_type, quest_label_vi, quest_label_en, target_value, xp_reward) "
            "VALUES (?,?,?,?,?,?,?)",
            (user_id, today, tmpl["type"],
             tmpl["vi"].format(n=n), tmpl["en"].format(n=n),
             n, tmpl["xp"][idx])
        )
    db.commit()
    rows = db.execute(
        "SELECT * FROM daily_quests WHERE user_id=? AND date=? ORDER BY id",
        (user_id, today)
    ).fetchall()
    return [dict(q) for q in rows]


# ── Gamification Endpoints ─────────────────────────────────────────────────────
@app.post("/api/streak/checkin")
async def api_streak_checkin(request: Request):
    """
    Gọi sau khi user hoàn thành bài test / minigame.
    Cập nhật streak, tính XP bonus, kiểm tra badges tự động.
    """
    uid = await resolve_user_id(request)
    db  = get_db()
    try:
        result = _streak_checkin(db, uid)
        gami   = db.execute("SELECT * FROM user_gamification WHERE user_id=?", (uid,)).fetchone()
        recent_badges = db.execute(
            "SELECT badge_id, earned_at FROM user_badges WHERE user_id=? ORDER BY earned_at DESC LIMIT 3",
            (uid,)
        ).fetchall()
        return JSONResponse({
            **result,
            "gamification": {
                "current_streak": gami["current_streak"]  if gami else 1,
                "longest_streak": gami["longest_streak"]  if gami else 1,
                "freeze_count":   gami["freeze_count"]    if gami else 2,
                "total_xp":       gami["total_xp"]        if gami else 10,
                "level":          gami["level"]           if gami else 1,
                "elo_rating":     gami["elo_rating"]      if gami else 1000,
                "league":         gami["league"]          if gami else "Bronze",
            },
            "recent_badges": [
                {"id": b["badge_id"], "earned_at": b["earned_at"],
                 **BADGE_CATALOG.get(b["badge_id"], {})}
                for b in recent_badges
            ],
        })
    finally:
        db.close()


@app.get("/api/quests/today")
async def api_get_quests(request: Request):
    """Lấy (và tự sinh nếu chưa có) daily quests của hôm nay."""
    uid = await resolve_user_id(request)
    db  = get_db()
    try:
        quests = _ensure_quests(db, uid)
        return JSONResponse({
            "date":   _date.today().isoformat(),
            "quests": quests,
            "completed": sum(1 for q in quests if q.get("is_completed")),
            "total":  len(quests),
        })
    finally:
        db.close()


@app.post("/api/quests/{quest_id}/progress")
async def api_quest_progress(quest_id: int, request: Request):
    """
    Cập nhật tiến độ quest (+delta units), tự đánh dấu hoàn thành và phát XP.
    Body: { "delta": 1 }
    """
    uid   = await resolve_user_id(request)
    body  = await request.json()
    delta = max(1, int(body.get("delta", 1)))
    db    = get_db()
    try:
        quest = db.execute(
            "SELECT * FROM daily_quests WHERE id=? AND user_id=?",
            (quest_id, uid)
        ).fetchone()
        if not quest:
            raise HTTPException(404, "Quest không tồn tại hoặc không thuộc về bạn.")
        if quest["is_completed"]:
            return JSONResponse({"already_completed": True, "quest_id": quest_id})

        new_val   = min(quest["current_value"] + delta, quest["target_value"])
        completed = new_val >= quest["target_value"]
        db.execute(
            "UPDATE daily_quests SET current_value=?, is_completed=?, completed_at=? WHERE id=?",
            (new_val, 1 if completed else 0,
             datetime.now(timezone.utc).isoformat() if completed else None,
             quest_id)
        )
        db.commit()
        xp_gained = 0
        if completed:
            xp_gained = quest["xp_reward"]
            _add_xp(db, uid, xp_gained)
        return JSONResponse({
            "quest_id":  quest_id,
            "new_value": new_val,
            "target":    quest["target_value"],
            "completed": completed,
            "xp_gained": xp_gained,
        })
    finally:
        db.close()


@app.get("/api/badges")
async def api_get_badges(request: Request):
    """Trả về tất cả badges (đã đạt + chưa đạt) kèm catalog metadata."""
    uid = await resolve_user_id(request)
    db  = get_db()
    try:
        earned_rows = db.execute(
            "SELECT badge_id, earned_at FROM user_badges WHERE user_id=? ORDER BY earned_at DESC",
            (uid,)
        ).fetchall()
        earned_map = {r["badge_id"]: r["earned_at"] for r in earned_rows}
        badges_out = []
        for bid, bdata in BADGE_CATALOG.items():
            badges_out.append({
                **bdata,
                "id":        bid,
                "earned":    bid in earned_map,
                "earned_at": earned_map.get(bid),
            })
        return JSONResponse({
            "earned_count": len(earned_map),
            "total_count":  len(BADGE_CATALOG),
            "badges":       badges_out,
        })
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  ADAPTIVE LEARNING — ENGINE & ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

_DIFFICULTY_LEVELS = ["NB", "TH", "VD", "VDC"]
_ACC_UP   = 0.80   # >= 80% → tăng độ khó
_ACC_DOWN = 0.50   # < 50%  → giảm độ khó
_WINDOW   = 10     # xét 10 câu gần nhất

def _next_difficulty(db, user_id: int, topic: str) -> str:
    """Phân tích lịch sử làm bài → trả về mức độ khó tiếp theo."""
    recent = db.execute(
        "SELECT is_correct, difficulty FROM quiz_attempts "
        "WHERE user_id=? AND topic=? ORDER BY attempted_at DESC LIMIT ?",
        (user_id, topic, _WINDOW)
    ).fetchall()
    if not recent:
        return "NB"
    avg_acc   = sum(r["is_correct"] for r in recent) / len(recent)
    cur_level = recent[0]["difficulty"]
    if cur_level not in _DIFFICULTY_LEVELS:
        cur_level = "NB"
    idx = _DIFFICULTY_LEVELS.index(cur_level)
    if avg_acc >= _ACC_UP:
        return _DIFFICULTY_LEVELS[min(idx + 1, len(_DIFFICULTY_LEVELS) - 1)]
    if avg_acc < _ACC_DOWN:
        return _DIFFICULTY_LEVELS[max(idx - 1, 0)]
    return cur_level

def _refresh_mastery(db, user_id: int, topic: str):
    """Tái tính và upsert bảng topic_mastery sau mỗi quiz attempt."""
    stats = db.execute(
        "SELECT COUNT(*) as total, SUM(is_correct) as correct "
        "FROM quiz_attempts WHERE user_id=? AND topic=?",
        (user_id, topic)
    ).fetchone()
    total   = stats["total"]   or 0
    correct = stats["correct"] or 0
    avg_acc = (correct / total) if total > 0 else 0.0
    nxt_lvl = _next_difficulty(db, user_id, topic)
    db.execute(
        """INSERT INTO topic_mastery
               (user_id, topic, total_attempts, correct_count, avg_accuracy, current_level, last_practiced)
           VALUES (?,?,?,?,?,?,datetime('now'))
           ON CONFLICT(user_id, topic) DO UPDATE SET
               total_attempts=excluded.total_attempts,
               correct_count=excluded.correct_count,
               avg_accuracy=excluded.avg_accuracy,
               current_level=excluded.current_level,
               last_practiced=excluded.last_practiced""",
        (user_id, topic, total, correct, avg_acc, nxt_lvl)
    )
    db.commit()


@app.post("/api/quiz/attempt")
async def api_log_attempt(request: Request):
    """
    Ghi nhận kết quả từng câu hỏi cho Adaptive Learning.
    Body: { question_id, topic, difficulty, is_correct, time_taken_sec }
    Tự động: cập nhật topic_mastery + streak check-in + cộng 5 XP nếu đúng.
    """
    uid  = await resolve_user_id(request)
    body = await request.json()

    q_id       = str(body.get("question_id", "")).strip() or "unknown"
    topic      = str(body.get("topic", "general")).strip()
    difficulty = str(body.get("difficulty", "NB")).strip().upper()
    is_correct = bool(body.get("is_correct", False))
    time_taken = max(0, int(body.get("time_taken_sec", 0)))

    if difficulty not in _DIFFICULTY_LEVELS:
        difficulty = "NB"

    db = get_db()
    try:
        db.execute(
            "INSERT INTO quiz_attempts (user_id, question_id, topic, difficulty, is_correct, time_taken_sec) "
            "VALUES (?,?,?,?,?,?)",
            (uid, q_id, topic, difficulty, 1 if is_correct else 0, time_taken)
        )
        
        # Increment daily progress practice_count
        _check_and_reset_daily_progress(db, uid)
        db.execute("UPDATE daily_progress SET practice_count = practice_count + 1 WHERE user_id=?", (uid,))
        
        # If correct and medium/hard/very hard, increment mastery_count
        if is_correct and difficulty in ["TH", "VD", "VDC"]:
            db.execute("UPDATE daily_progress SET mastery_count = mastery_count + 1 WHERE user_id=?", (uid,))
            
        db.commit()

        _refresh_mastery(db, uid, topic)
        streak_info    = _streak_checkin(db, uid)
        if is_correct:
            _add_xp(db, uid, 5)
        next_diff = _next_difficulty(db, uid, topic)

        # Kiểm tra badge perfect score nếu accuracy bài test = 100%
        accuracy_param = float(body.get("session_accuracy", 0))
        if accuracy_param >= 100:
            _award_badge(db, uid, "perfect_score")

        return JSONResponse({
            "logged":          True,
            "is_correct":      is_correct,
            "next_difficulty": next_diff,
            "xp_gained":       5 if is_correct else 0,
            "streak":          streak_info,
        }, status_code=201)
    finally:
        db.close()


@app.get("/api/adaptive/next-difficulty")
async def api_next_difficulty(request: Request):
    """Trả về mức độ khó nên gọi tiếp theo cho một topic cụ thể."""
    uid   = await resolve_user_id(request)
    topic = request.query_params.get("topic", "general")
    db    = get_db()
    try:
        lvl     = _next_difficulty(db, uid, topic)
        mastery = db.execute(
            "SELECT * FROM topic_mastery WHERE user_id=? AND topic=?",
            (uid, topic)
        ).fetchone()
        return JSONResponse({
            "topic":          topic,
            "next_level":     lvl,
            "avg_accuracy":   round((mastery["avg_accuracy"] * 100) if mastery else 0.0, 1),
            "total_attempts": mastery["total_attempts"] if mastery else 0,
            "current_level":  mastery["current_level"]  if mastery else "NB",
        })
    finally:
        db.close()


@app.get("/api/adaptive/weak-topics")
async def api_weak_topics(request: Request):
    """Danh sách chủ đề yếu (accuracy < 60%, >=3 lần thử) để nhắc ôn tập."""
    uid = await resolve_user_id(request)
    db  = get_db()
    try:
        rows = db.execute(
            """SELECT topic, ROUND(avg_accuracy*100,1) as pct,
                      current_level, total_attempts
               FROM topic_mastery
               WHERE user_id=? AND total_attempts >= 3 AND avg_accuracy < 0.60
               ORDER BY avg_accuracy ASC LIMIT 5""",
            (uid,)
        ).fetchall()
        return JSONResponse({
            "weak_topics": [
                {"topic": r["topic"], "accuracy_pct": r["pct"],
                 "level": r["current_level"], "attempts": r["total_attempts"]}
                for r in rows
            ]
        })
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  USER STATISTICS — Trang phân tích số liệu toàn diện (kiểu osu! profile)
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/stats")
async def api_user_stats(request: Request):
    """
    Tổng hợp toàn bộ số liệu của user để render trang Statistics.
    Bao gồm: gamification, test history 30d, topic mastery, badges, quests, hexagon chart.
    """
    uid = await resolve_user_id(request)
    db  = get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
        if not user:
            raise HTTPException(404, "User not found.")

        # Gamification
        gami         = db.execute("SELECT * FROM user_gamification WHERE user_id=?", (uid,)).fetchone()
        total_xp     = _get_user_xp(db, uid)
        cur_streak, longest = _get_user_streak(db, uid)

        # Test history 30 ngày
        test_hist = db.execute(
            """SELECT DATE(taken_at) as day,
                      ROUND(AVG(accuracy), 1)  as avg_acc,
                      COUNT(*)                 as cnt
               FROM test_results
               WHERE user_id=? AND taken_at >= datetime('now', '-30 days')
               GROUP BY DATE(taken_at)
               ORDER BY day ASC""",
            (uid,)
        ).fetchall()

        # Topic mastery
        topic_rows = db.execute(
            "SELECT topic, ROUND(avg_accuracy*100,1) as acc_pct, current_level, total_attempts "
            "FROM topic_mastery WHERE user_id=? ORDER BY avg_accuracy DESC",
            (uid,)
        ).fetchall()

        # Chủ đề yếu
        weak = db.execute(
            "SELECT topic, ROUND(avg_accuracy*100,1) as pct "
            "FROM topic_mastery WHERE user_id=? AND total_attempts>=3 AND avg_accuracy<0.60 "
            "ORDER BY avg_accuracy ASC LIMIT 5",
            (uid,)
        ).fetchall()

        # Test tổng kết
        t_sum = db.execute(
            "SELECT COUNT(*) as total, ROUND(AVG(accuracy),1) as avg_acc, MAX(accuracy) as best "
            "FROM test_results WHERE user_id=?",
            (uid,)
        ).fetchone()

        # Game tổng kết
        g_sum = db.execute(
            "SELECT COUNT(*) as total, ROUND(AVG(CAST(score AS REAL)/total*100),1) as avg_pct "
            "FROM minigame_results WHERE user_id=? AND total>0",
            (uid,)
        ).fetchone()

        # Badges
        badge_rows = db.execute(
            "SELECT badge_id, earned_at FROM user_badges WHERE user_id=? ORDER BY earned_at DESC",
            (uid,)
        ).fetchall()

        # Daily quests
        quests      = _ensure_quests(db, uid)
        quests_done = sum(1 for q in quests if q.get("is_completed"))

        # Hexagon chart (6 chiều, 0-100)
        overall_acc   = t_sum["avg_acc"] or 0.0
        avg_game_pct  = g_sum["avg_pct"] or 0.0
        elo_val       = gami["elo_rating"] if gami else 1000
        topic_count   = len(topic_rows)
        good_topics   = sum(1 for t in topic_rows if t["acc_pct"] >= 70)
        hexagon = [
            {"subject": "Chính Xác",  "value": min(100, round(overall_acc))},
            {"subject": "Bền Bỉ",     "value": min(100, cur_streak * 3)},
            {"subject": "Tốc Độ",     "value": min(100, round(avg_game_pct))},
            {"subject": "Hiểu Biết",  "value": min(100, round(good_topics / max(1, topic_count) * 100))},
            {"subject": "Thành Tích", "value": min(100, len(badge_rows) * 8)},
            {"subject": "Elo",        "value": min(100, max(0, round((elo_val - 800) / 12)))},
        ]

        return JSONResponse({
            "user": user_dict(user),
            "gamification": {
                "current_streak": cur_streak,
                "longest_streak": longest,
                "freeze_count":   gami["freeze_count"] if gami else 2,
                "total_xp":       total_xp,
                "level":          _xp_to_level(total_xp),
                "league":         _xp_to_league(total_xp),
                "elo_rating":     gami["elo_rating"] if gami else 1000,
                "peak_elo":       gami["peak_elo"]   if gami else 1000,
            },
            "test_history_30d": [
                {"date": r["day"], "accuracy": r["avg_acc"], "count": r["cnt"]}
                for r in test_hist
            ],
            "topic_mastery": [
                {"topic": r["topic"], "accuracy": r["acc_pct"],
                 "level": r["current_level"], "attempts": r["total_attempts"]}
                for r in topic_rows
            ],
            "weak_topics": [{"topic": r["topic"], "accuracy": r["pct"]} for r in weak],
            "test_summary": {
                "total_tests": t_sum["total"] or 0,
                "overall_acc": overall_acc,
                "best_acc":    t_sum["best"] or 0,
            },
            "game_summary": {
                "total_games":   g_sum["total"] or 0,
                "avg_score_pct": avg_game_pct,
            },
            "badges": [
                {"id": b["badge_id"], "earned_at": b["earned_at"],
                 **BADGE_CATALOG.get(b["badge_id"], {"name_vi": b["badge_id"], "icon": "🏅"})}
                for b in badge_rows
            ],
            "daily_quests": {
                "quests":    quests,
                "completed": quests_done,
                "total":     len(quests),
            },
            "hexagon_stats": hexagon,
        })
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  HUMANE GAMIFICATION & GACHA
# ═══════════════════════════════════════════════════════════════════════════════

MATH_CARDS = [
    {"id": "card_parabola_vertex", "name": "Đỉnh Parabol", "rarity": "Common", "formula": "I(-b/(2a), -\\Delta/(4a))", "description": "Tọa độ điểm cực trị của hàm số bậc hai y = ax^2 + bx + c."},
    {"id": "card_cos_rule", "name": "Định lý Cosin", "rarity": "Common", "formula": "a^2 = b^2 + c^2 - 2bc \\cdot \\cos A", "description": "Mối quan hệ giữa các cạnh và góc của một tam giác."},
    {"id": "card_sin_rule", "name": "Định lý Sin", "rarity": "Common", "formula": "a/\\sin A = b/\\sin B = c/\\sin C = 2R", "description": "Tỉ số giữa độ dài cạnh và sin của góc đối diện trong tam giác."},
    {"id": "card_vector_sum", "name": "Quy tắc 3 Điểm", "rarity": "Common", "formula": "\\vec{AB} + \\vec{BC} = \\vec{AC}", "description": "Phép cộng vectơ nối tiếp điểm đầu và điểm cuối."},
    {"id": "card_ellipse_eqn", "name": "Phương trình Elip", "rarity": "Rare", "formula": "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1", "description": "Phương trình chính tắc của đường elip với a > b > 0."},
    {"id": "card_am_gm", "name": "Bất đẳng thức Cauchy", "rarity": "Rare", "formula": "\\frac{a+b}{2} \\ge \\sqrt{ab}", "description": "Bất đẳng thức giữa trung bình cộng và trung bình nhân cho hai số không âm."},
    {"id": "card_trig_identity", "name": "Đồng nhất lượng giác", "rarity": "Common", "formula": "\\sin^2 x + \\cos^2 x = 1", "description": "Hằng đẳng thức lượng giác cơ bản nhất trên đường tròn đơn vị."},
    {"id": "card_derivative_x2", "name": "Đạo hàm x²", "rarity": "Common", "formula": "(x^2)' = 2x", "description": "Quy tắc cơ bản của đạo hàm hàm đa thức lũy thừa."},
    {"id": "card_limits", "name": "Định lý Kẹp", "rarity": "Legendary", "formula": "g(x) \\le f(x) \\le h(x) \\implies \\lim f(x) = L", "description": "Định lý kẹp dùng để tính giới hạn của các hàm số phức tạp."},
    {"id": "card_vieta_2", "name": "Hệ thức Vi-ét bậc hai", "rarity": "Rare", "formula": "x_1 + x_2 = -b/a, \\ x_1 \\cdot x_2 = c/a", "description": "Mối quan hệ giữa các nghiệm và các hệ số của phương trình bậc hai."}
]

def _check_and_reset_daily_progress(db, uid: int):
    # Lấy ngày hiện tại ở timezone Việt Nam (GMT+7)
    from datetime import datetime, timedelta, timezone as _timezone
    tz_vn = _timezone(timedelta(hours=7))
    today_str = datetime.now(tz_vn).strftime("%Y-%m-%d")

    row = db.execute("SELECT * FROM daily_progress WHERE user_id=?", (uid,)).fetchone()
    if not row:
        db.execute(
            "INSERT INTO daily_progress (user_id, last_reset, practice_count, mastery_count, socratic_count) VALUES (?, ?, 0, 0, 0)",
            (uid, today_str)
        )
        db.commit()
        return {"practice_count": 0, "mastery_count": 0, "socratic_count": 0, "daily_xp_goal": 30}
    
    if row["last_reset"] != today_str:
        db.execute(
            "UPDATE daily_progress SET last_reset=?, practice_count=0, mastery_count=0, socratic_count=0 WHERE user_id=?",
            (today_str, uid)
        )
        db.commit()
        return {"practice_count": 0, "mastery_count": 0, "socratic_count": 0, "daily_xp_goal": row["daily_xp_goal"] or 30}
    
    return {
        "practice_count": row["practice_count"],
        "mastery_count": row["mastery_count"],
        "socratic_count": row["socratic_count"],
        "daily_xp_goal": row["daily_xp_goal"] or 30
    }

@app.get("/api/gami/daily-progress")
async def get_daily_progress(request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        prog = _check_and_reset_daily_progress(db, uid)
        return JSONResponse(prog)
    finally:
        db.close()

@app.post("/api/gami/update-progress")
async def update_daily_progress(request: Request):
    uid = await resolve_user_id(request)
    body = await request.json()
    action_type = body.get("action_type") # "practice", "mastery", "socratic"
    increment = int(body.get("increment", 1))

    if action_type not in ["practice", "mastery", "socratic"]:
        raise HTTPException(400, "Invalid action_type")

    db = get_db()
    try:
        # Check and reset first
        _check_and_reset_daily_progress(db, uid)
        
        # Update
        column = f"{action_type}_count"
        db.execute(
            f"UPDATE daily_progress SET {column} = {column} + ? WHERE user_id=?",
            (increment, uid)
        )
        db.commit()
        
        # Retrieve updated
        prog = _check_and_reset_daily_progress(db, uid)
        return JSONResponse(prog)
    finally:
        db.close()

@app.post("/api/gami/buy-freeze")
async def buy_streak_freeze(request: Request):
    uid = await resolve_user_id(request)
    body = await request.json()
    cost = int(body.get("cost", 100))

    db = get_db()
    try:
        total_xp = _get_user_xp(db, uid)
        if total_xp < cost:
            raise HTTPException(400, "Không đủ XP để mua đóng băng!")

        # Deduct XP by adding a negative XP reward record (e.g. -100 XP)
        db.execute(
            "INSERT INTO test_results (user_id, test_key, section, score, total, accuracy, time_spent) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (uid, "freeze-purchase", "purchase", -cost, 0, 0, 0)
        )
        
        # Increment freeze count
        db.execute(
            "UPDATE user_gamification SET freeze_count = freeze_count + 1 WHERE user_id=?",
            (uid,)
        )
        db.commit()

        # Get updated info
        gami = db.execute("SELECT * FROM user_gamification WHERE user_id=?", (uid,)).fetchone()
        new_xp = _get_user_xp(db, uid)

        return JSONResponse({
            "success": True,
            "freeze_count": gami["freeze_count"] if gami else 0,
            "total_xp": new_xp,
            "level": _xp_to_level(new_xp),
        })
    finally:
        db.close()

@app.get("/api/gacha/collection")
async def get_gacha_collection(request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        rows = db.execute(
            "SELECT card_id, owned_count, unlocked_at FROM user_cards WHERE user_id=?",
            (uid,)
        ).fetchall()
        
        collection = []
        owned_ids = {r["card_id"]: r for r in rows}
        
        for card in MATH_CARDS:
            owned = card["id"] in owned_ids
            collection.append({
                **card,
                "owned": owned,
                "owned_count": owned_ids[card["id"]]["owned_count"] if owned else 0,
                "unlocked_at": owned_ids[card["id"]]["unlocked_at"] if owned else None
            })
            
        return JSONResponse(collection)
    finally:
        db.close()

@app.post("/api/gacha/open")
async def open_gacha_chest(request: Request):
    uid = await resolve_user_id(request)
    body = await request.json()
    cost = int(body.get("cost", 50)) # e.g. costs 50 XP to open, or 0 if milestone

    db = get_db()
    try:
        if cost > 0:
            total_xp = _get_user_xp(db, uid)
            if total_xp < cost:
                raise HTTPException(400, "Không đủ XP để mở rương!")
            
            # Deduct XP
            db.execute(
                "INSERT INTO test_results (user_id, test_key, section, score, total, accuracy, time_spent) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (uid, "gacha-open", "purchase", -cost, 0, 0, 0)
            )

        # Select a random card
        import random
        # Optional: weight by rarity (Common: 70%, Rare: 25%, Legendary: 5%)
        # For simplicity and equal fun:
        card = random.choice(MATH_CARDS)
        card_id = card["id"]

        # Insert or update
        row = db.execute("SELECT * FROM user_cards WHERE user_id=? AND card_id=?", (uid, card_id)).fetchone()
        if row:
            db.execute(
                "UPDATE user_cards SET owned_count = owned_count + 1 WHERE user_id=? AND card_id=?",
                (uid, card_id)
            )
        else:
            db.execute(
                "INSERT INTO user_cards (user_id, card_id, owned_count) VALUES (?, ?, 1)",
                (uid, card_id)
            )
        db.commit()

        new_xp = _get_user_xp(db, uid)
        return JSONResponse({
            "card": card,
            "total_xp": new_xp,
            "level": _xp_to_level(new_xp)
        })
    finally:
        db.close()


@app.get("/api/leaderboard")
async def get_leaderboard(request: Request):
    school = request.query_params.get("school")
    grade = request.query_params.get("grade")
    
    db = get_db()
    try:
        # Build query
        query = """
            SELECT
                u.id           AS user_id,
                u.username,
                u.school,
                u.grade,
                COALESCE(SUM(best.best_score), 0) AS total_points,
                COALESCE(SUM(best.best_total), 1) AS total_possible,
                COUNT(best.user_id)              AS sections_done
            FROM users u
            LEFT JOIN (
                SELECT
                    user_id,
                    test_key,
                    section,
                    MAX(score) AS best_score,
                    total      AS best_total
                FROM test_results
                GROUP BY user_id, test_key, section
            ) AS best ON best.user_id = u.id
        """
        
        params = []
        where_clauses = []
        if school:
            where_clauses.append("u.school = ?")
            params.append(school)
        if grade:
            where_clauses.append("u.grade = ?")
            params.append(grade)
            
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        query += """
            GROUP BY u.id
            ORDER BY total_points DESC, sections_done DESC
            LIMIT 50
        """
        
        rows = db.execute(query, params).fetchall()
        
        result = []
        for i, r in enumerate(rows):
            tp = r["total_points"] or 0
            tpo = r["total_possible"] or 1
            uid_val = r["user_id"]
            xp = _get_user_xp(db, uid_val)
            
            # Fetch streak
            streak_row = db.execute("SELECT current_streak, longest_streak FROM user_gamification WHERE user_id=?", (uid_val,)).fetchone()
            curr_str = streak_row["current_streak"] if streak_row else 0
            long_str = streak_row["longest_streak"] if streak_row else 0
            
            result.append({
                "rank": i + 1,
                "user_id": uid_val,
                "username": r["username"],
                "school": r["school"] or "",
                "grade": r["grade"] or "",
                "total_points": tp,
                "total_possible": tpo,
                "sections_done": r["sections_done"],
                "accuracy": round(tp / tpo * 100, 1) if tpo > 0 else 0,
                "xp": xp,
                "current_streak": curr_str,
                "longest_streak": long_str,
            })
            
        return JSONResponse(result)
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════════
#  GAMIFICATION v2 — COINS, BORDERS SHOP, MRM LEADERBOARD, RANK HISTORY, SSE
# ═══════════════════════════════════════════════════════════════════════════════

# ── Seed profile borders data ─────────────────────────────────────────────────
BORDER_SEEDS = [
    # Common
    {"id": "border_cyan", "name_vi": "Viền Xanh Lam", "name_en": "Cyan Frame",
     "description": "Viền đơn sắc xanh lam thanh lịch", "price_coins": 200,
     "rarity": "common", "preview_emoji": "🔵",
     "css_style": '{"border": "3px solid #22d3ee", "boxShadow": "0 0 8px #22d3ee66"}', "is_animated": 0},
    {"id": "border_purple", "name_vi": "Viền Tím", "name_en": "Purple Frame",
     "description": "Viền tím huyền bí", "price_coins": 200,
     "rarity": "common", "preview_emoji": "🟣",
     "css_style": '{"border": "3px solid #a78bfa", "boxShadow": "0 0 8px #a78bfa66"}', "is_animated": 0},
    {"id": "border_gold", "name_vi": "Viền Vàng", "name_en": "Gold Frame",
     "description": "Viền vàng sang trọng", "price_coins": 200,
     "rarity": "common", "preview_emoji": "🟡",
     "css_style": '{"border": "3px solid #fbbf24", "boxShadow": "0 0 8px #fbbf2466"}', "is_animated": 0},
    # Rare
    {"id": "border_ocean", "name_vi": "Đại Dương", "name_en": "Ocean Gradient",
     "description": "Gradient xanh dương gradient chảy mượt", "price_coins": 500,
     "rarity": "rare", "preview_emoji": "🌊",
     "css_style": '{"border": "3px solid transparent", "backgroundClip": "padding-box", "boxShadow": "0 0 0 3px #0ea5e9, 0 0 16px #0ea5e988"}', "is_animated": 0},
    {"id": "border_fire", "name_vi": "Lửa Rực", "name_en": "Fire Aura",
     "description": "Viền gradient lửa rực rỡ", "price_coins": 500,
     "rarity": "rare", "preview_emoji": "🔥",
     "css_style": '{"border": "3px solid transparent", "boxShadow": "0 0 0 3px #ef4444, 0 0 16px #f9731688"}', "is_animated": 0},
    {"id": "border_galaxy", "name_vi": "Thiên Hà", "name_en": "Galaxy",
     "description": "Gradient ngân hà tím xanh", "price_coins": 500,
     "rarity": "rare", "preview_emoji": "🌌",
     "css_style": '{"border": "3px solid transparent", "boxShadow": "0 0 0 3px #7c3aed, 0 0 20px #7c3aed88"}', "is_animated": 0},
    # Epic
    {"id": "border_math_sigma", "name_vi": "Sigma Master", "name_en": "Sigma Master",
     "description": "Viền in ký hiệu ∑ toán học nổi bật", "price_coins": 1200,
     "rarity": "epic", "preview_emoji": "∑",
     "css_style": '{"border": "3px solid #22d3ee", "boxShadow": "0 0 0 1px #a78bfa, 0 0 24px #22d3ee99", "outline": "2px dashed #a78bfa44"}', "is_animated": 0},
    {"id": "border_neon", "name_vi": "Neon Pulse", "name_en": "Neon Pulse",
     "description": "Viền neon nhấp nháy sáng rực", "price_coins": 1200,
     "rarity": "epic", "preview_emoji": "💡",
     "css_style": '{"border": "3px solid #4ade80", "boxShadow": "0 0 0 2px #4ade8033, 0 0 30px #4ade8099", "animation": "neonPulse 2s ease-in-out infinite"}', "is_animated": 1},
    {"id": "border_diamond", "name_vi": "Kim Cương", "name_en": "Diamond Aura",
     "description": "Viền kim cương lấp lánh", "price_coins": 1200,
     "rarity": "epic", "preview_emoji": "💎",
     "css_style": '{"border": "3px solid #93c5fd", "boxShadow": "0 0 0 2px #bfdbfe, 0 0 28px #93c5fd99, inset 0 0 8px #1e40af33"}', "is_animated": 0},
    # Legendary
    {"id": "border_rainbow", "name_vi": "Cầu Vồng Huyền Thoại", "name_en": "Legendary Rainbow",
     "description": "Viền cầu vồng xoay tròn — cực kỳ hiếm", "price_coins": 3000,
     "rarity": "legendary", "preview_emoji": "🌈",
     "css_style": '{"border": "3px solid transparent", "backgroundImage": "linear-gradient(white,white), conic-gradient(from 0deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)", "backgroundOrigin": "border-box", "backgroundClip": "padding-box, border-box", "animation": "rainbowSpin 3s linear infinite"}', "is_animated": 1},
    {"id": "border_god", "name_vi": "Thần Toán Học", "name_en": "Math God",
     "description": "Dành cho những ai đã chinh phục toán học — viền vàng huyền thoại", "price_coins": 3000,
     "rarity": "legendary", "preview_emoji": "👑",
     "css_style": '{"border": "4px solid #ffd700", "boxShadow": "0 0 0 2px #ffd70055, 0 0 40px #ffd70099, 0 0 80px #ffd70044", "animation": "godGlow 2s ease-in-out infinite"}', "is_animated": 1},
]


def _seed_borders(conn):
    """Seed profile_borders nếu chưa có."""
    for b in BORDER_SEEDS:
        conn.execute(
            """INSERT OR IGNORE INTO profile_borders
               (id, name_vi, name_en, description, price_coins, rarity, css_style, preview_emoji, is_animated)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (b["id"], b["name_vi"], b["name_en"], b["description"],
             b["price_coins"], b["rarity"], b["css_style"], b["preview_emoji"], b["is_animated"])
        )
    conn.commit()


# ── SSE state (in-memory — single process) ────────────────────────────────────
from fastapi.responses import StreamingResponse as _SSEStream
import asyncio as _asyncio

_sse_jackpot = 0          # tăng mỗi khi có game submit
_sse_online  = 0          # số SSE connections active
_sse_recent_wins: list    = []  # [{'username': ..., 'score': ..., 'at': ...}]
_sse_lock = _asyncio.Lock()

async def _sse_broadcast_gen():
    """Generator trả về SSE events mỗi 5 giây."""
    global _sse_online
    async with _sse_lock:
        _sse_online += 1
    try:
        while True:
            data = {
                "jackpot": _sse_jackpot,
                "online": _sse_online,
                "recent_wins": _sse_recent_wins[-5:],
            }
            yield f"data: {json.dumps(data)}\n\n"
            await _asyncio.sleep(5)
    finally:
        async with _sse_lock:
            _sse_online = max(0, _sse_online - 1)


@app.get("/api/sse/mrm-live")
async def sse_mrm_live():
    """Server-Sent Events — jackpot, online count, recent wins."""
    return _SSEStream(
        _sse_broadcast_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Helper: compute ELO-based ranks ──────────────────────────────────────────
def _compute_elo_rank(db, user_id: int, country: str | None = None, school: str | None = None) -> dict:
    """Return global_rank, country_rank, school_rank for user_id based on elo_rating."""
    elo_row = db.execute(
        "SELECT elo_rating FROM user_gamification WHERE user_id=?", (user_id,)
    ).fetchone()
    elo = elo_row["elo_rating"] if elo_row else 1000

    global_rank = db.execute(
        """SELECT COUNT(*)+1 as r FROM user_gamification g
           JOIN users u ON u.id = g.user_id
           WHERE g.elo_rating > ? AND u.banned = 0""",
        (elo,)
    ).fetchone()["r"]

    country_rank = None
    if country:
        country_rank = db.execute(
            """SELECT COUNT(*)+1 as r FROM user_gamification g
               JOIN users u ON u.id = g.user_id
               WHERE g.elo_rating > ? AND u.country = ? AND u.banned = 0""",
            (elo, country)
        ).fetchone()["r"]

    school_rank = None
    if school:
        school_rank = db.execute(
            """SELECT COUNT(*)+1 as r FROM user_gamification g
               JOIN users u ON u.id = g.user_id
               WHERE g.elo_rating > ? AND u.school = ? AND u.banned = 0""",
            (elo, school)
        ).fetchone()["r"]

    return {"global_rank": global_rank, "country_rank": country_rank, "school_rank": school_rank, "elo": elo}


# ── MRM Leaderboard ───────────────────────────────────────────────────────────
@app.get("/api/mrm/leaderboard")
async def mrm_leaderboard(request: Request,
                          type: str = "global",
                          country: str = "",
                          school: str = "",
                          page: int = 1,
                          limit: int = 50):
    """Leaderboard xếp hạng theo ELO. type: global | country | school."""
    offset = (page - 1) * limit
    db = get_db()
    try:
        base_q = """
            SELECT
                u.id, u.username, u.avatar_url, u.school, u.grade, u.country,
                COALESCE(g.elo_rating, 1000) AS elo_rating,
                COALESCE(g.peak_elo,   1000) AS peak_elo,
                COALESCE(g.league, 'Bronze') AS league,
                COALESCE(g.current_streak, 0) AS current_streak,
                COALESCE(g.total_xp, 0) AS total_xp,
                COALESCE(g.level, 1) AS level
            FROM users u
            LEFT JOIN user_gamification g ON g.user_id = u.id
            WHERE u.banned = 0
        """
        params: list = []
        if type == "country" and country:
            base_q += " AND u.country = ?"
            params.append(country)
        elif type == "school" and school:
            base_q += " AND u.school = ?"
            params.append(school)

        base_q += " ORDER BY elo_rating DESC, total_xp DESC LIMIT ? OFFSET ?"
        params += [limit, offset]

        rows = db.execute(base_q, params).fetchall()
        total_q = "SELECT COUNT(*) as c FROM users u LEFT JOIN user_gamification g ON g.user_id=u.id WHERE u.banned=0"
        total_params: list = []
        if type == "country" and country:
            total_q += " AND u.country=?"
            total_params.append(country)
        elif type == "school" and school:
            total_q += " AND u.school=?"
            total_params.append(school)

        total_count = db.execute(total_q, total_params).fetchone()["c"]

        # Fetch active border for each user
        result = []
        for i, r in enumerate(rows):
            border_row = db.execute(
                """SELECT b.id, b.name_vi, b.rarity, b.css_style, b.preview_emoji
                   FROM user_borders ub
                   JOIN profile_borders b ON b.id = ub.border_id
                   WHERE ub.user_id=? AND ub.is_active=1""",
                (r["id"],)
            ).fetchone()
            active_border = dict(border_row) if border_row else None

            result.append({
                "rank": offset + i + 1,
                "user_id": r["id"],
                "username": r["username"],
                "avatar_url": r["avatar_url"] or "",
                "school": r["school"] or "",
                "grade": r["grade"] or "",
                "country": r["country"] or "VN",
                "elo_rating": r["elo_rating"],
                "peak_elo": r["peak_elo"],
                "league": r["league"],
                "current_streak": r["current_streak"],
                "total_xp": r["total_xp"],
                "level": r["level"],
                "active_border": active_border,
            })

        return JSONResponse({"items": result, "total": total_count, "page": page, "limit": limit})
    finally:
        db.close()


# ── MRM Rank History ──────────────────────────────────────────────────────────
@app.get("/api/mrm/rank-history/{user_id}")
async def mrm_rank_history(user_id: int):
    """Lịch sử ELO + rank của user trong 90 ngày gần nhất."""
    db = get_db()
    try:
        rows = db.execute(
            """SELECT elo_rating, global_rank, recorded_at
               FROM mrm_rank_history
               WHERE user_id=?
               ORDER BY recorded_at ASC
               LIMIT 180""",
            (user_id,)
        ).fetchall()
        return JSONResponse([dict(r) for r in rows])
    finally:
        db.close()


@app.post("/api/mrm/rank-history/record")
async def mrm_record_rank(request: Request):
    """Ghi lại ELO snapshot sau khi hoàn thành game. Gọi từ frontend."""
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        g_row = db.execute(
            "SELECT elo_rating FROM user_gamification WHERE user_id=?", (uid,)
        ).fetchone()
        elo = g_row["elo_rating"] if g_row else 1000

        u_row = db.execute("SELECT country FROM users WHERE id=?", (uid,)).fetchone()
        country = u_row["country"] if u_row else "VN"

        global_rank = db.execute(
            """SELECT COUNT(*)+1 as r FROM user_gamification g
               JOIN users u ON u.id=g.user_id
               WHERE g.elo_rating > ? AND u.banned=0""",
            (elo,)
        ).fetchone()["r"]

        db.execute(
            "INSERT INTO mrm_rank_history (user_id, elo_rating, global_rank) VALUES (?,?,?)",
            (uid, elo, global_rank)
        )
        db.commit()
        return JSONResponse({"recorded": True, "elo": elo, "global_rank": global_rank})
    finally:
        db.close()


# ── Public Profile ────────────────────────────────────────────────────────────
@app.get("/api/profile/{user_id}")
async def get_profile(user_id: int):
    """Public profile: stats, rank (ELO-based), border, badges."""
    db = get_db()
    try:
        u = db.execute(
            "SELECT id, username, avatar_url, school, grade, country, created_at FROM users WHERE id=? AND banned=0",
            (user_id,)
        ).fetchone()
        if not u:
            raise HTTPException(404, "User not found")

        g = db.execute(
            "SELECT * FROM user_gamification WHERE user_id=?", (user_id,)
        ).fetchone()

        # ELO-based ranks
        elo = g["elo_rating"] if g else 1000
        country = u["country"] or "VN"
        school  = u["school"]  or ""

        global_rank = db.execute(
            """SELECT COUNT(*)+1 as r FROM user_gamification g2
               JOIN users u2 ON u2.id=g2.user_id
               WHERE g2.elo_rating > ? AND u2.banned=0""", (elo,)
        ).fetchone()["r"]

        country_rank = db.execute(
            """SELECT COUNT(*)+1 as r FROM user_gamification g2
               JOIN users u2 ON u2.id=g2.user_id
               WHERE g2.elo_rating > ? AND u2.country=? AND u2.banned=0""", (elo, country)
        ).fetchone()["r"]

        school_rank = None
        if school:
            school_rank = db.execute(
                """SELECT COUNT(*)+1 as r FROM user_gamification g2
                   JOIN users u2 ON u2.id=g2.user_id
                   WHERE g2.elo_rating > ? AND u2.school=? AND u2.banned=0""", (elo, school)
            ).fetchone()["r"]

        # Badges
        badges = db.execute(
            "SELECT badge_id, earned_at FROM user_badges WHERE user_id=? ORDER BY earned_at DESC",
            (user_id,)
        ).fetchall()

        # Active border
        border_row = db.execute(
            """SELECT b.id, b.name_vi, b.rarity, b.css_style, b.preview_emoji
               FROM user_borders ub JOIN profile_borders b ON b.id=ub.border_id
               WHERE ub.user_id=? AND ub.is_active=1""",
            (user_id,)
        ).fetchone()

        # Recent MRM games (from rank history — last 10 ELO changes)
        recent = db.execute(
            """SELECT elo_rating, global_rank, recorded_at
               FROM mrm_rank_history WHERE user_id=?
               ORDER BY recorded_at DESC LIMIT 10""",
            (user_id,)
        ).fetchall()

        # Test stats
        test_stats = db.execute(
            """SELECT COUNT(*) as total_tests,
                      AVG(accuracy) as avg_accuracy,
                      MAX(score) as best_score
               FROM test_results WHERE user_id=?""",
            (user_id,)
        ).fetchone()

        return JSONResponse({
            "user": {
                "id": u["id"], "username": u["username"],
                "avatar_url": u["avatar_url"] or "",
                "school": u["school"] or "",
                "grade": u["grade"] or "",
                "country": u["country"] or "VN",
                "created_at": u["created_at"],
            },
            "gamification": {
                "elo_rating": elo,
                "peak_elo": g["peak_elo"] if g else 1000,
                "league": g["league"] if g else "Bronze",
                "current_streak": g["current_streak"] if g else 0,
                "longest_streak": g["longest_streak"] if g else 0,
                "total_xp": g["total_xp"] if g else 0,
                "level": g["level"] if g else 1,
                "coins": g["coins"] if g and "coins" in g.keys() else 0,
            },
            "ranks": {
                "global_rank": global_rank,
                "country_rank": country_rank,
                "school_rank": school_rank,
                "country": country,
            },
            "badges": [{"badge_id": b["badge_id"], "earned_at": b["earned_at"]} for b in badges],
            "active_border": dict(border_row) if border_row else None,
            "test_stats": {
                "total_tests": test_stats["total_tests"] if test_stats else 0,
                "avg_accuracy": round(test_stats["avg_accuracy"] or 0, 1),
                "best_score": test_stats["best_score"] or 0,
            },
            "recent_rank_history": [dict(r) for r in recent],
        })
    finally:
        db.close()


# ── Coins APIs ────────────────────────────────────────────────────────────────
@app.get("/api/coins")
async def get_coins(request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        row = db.execute(
            "SELECT coins, lifetime_coins FROM user_gamification WHERE user_id=?", (uid,)
        ).fetchone()
        coins = row["coins"] if row and "coins" in row.keys() else 0
        lifetime = row["lifetime_coins"] if row and "lifetime_coins" in row.keys() else 0
        return JSONResponse({"coins": coins, "lifetime_coins": lifetime})
    finally:
        db.close()


@app.post("/api/coins/earn")
async def earn_coins(request: Request):
    """Cộng xu sau khi hoàn thành bài / mở mystery chest."""
    uid = await resolve_user_id(request)
    d = await request.json()
    amount = max(0, int(d.get("amount", 0)))
    reason = str(d.get("reason", "game_complete"))[:64]

    if amount == 0:
        raise HTTPException(400, "amount must be > 0")

    db = get_db()
    try:
        db.execute(
            """INSERT INTO user_gamification (user_id, coins, lifetime_coins)
               VALUES (?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET
                 coins = coins + excluded.coins,
                 lifetime_coins = lifetime_coins + excluded.lifetime_coins""",
            (uid, amount, amount)
        )
        db.commit()

        # Update SSE jackpot counter
        global _sse_jackpot
        _sse_jackpot += 1

        row = db.execute(
            "SELECT coins FROM user_gamification WHERE user_id=?", (uid,)
        ).fetchone()
        return JSONResponse({"coins": row["coins"] if row else amount, "earned": amount, "reason": reason})
    finally:
        db.close()


# ── Shop: Borders ─────────────────────────────────────────────────────────────
@app.get("/api/shop/borders")
async def shop_borders():
    """Danh sách tất cả viền profile có thể mua."""
    db = get_db()
    try:
        _seed_borders(db)   # idempotent seed
        rows = db.execute(
            "SELECT * FROM profile_borders ORDER BY price_coins ASC"
        ).fetchall()
        return JSONResponse([dict(r) for r in rows])
    finally:
        db.close()


@app.get("/api/shop/borders/owned")
async def owned_borders(request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        rows = db.execute(
            """SELECT b.*, ub.is_active, ub.owned_at
               FROM user_borders ub
               JOIN profile_borders b ON b.id = ub.border_id
               WHERE ub.user_id=?""",
            (uid,)
        ).fetchall()
        return JSONResponse([dict(r) for r in rows])
    finally:
        db.close()


@app.post("/api/shop/borders/{border_id}/buy")
async def buy_border(border_id: str, request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        _seed_borders(db)
        border = db.execute(
            "SELECT * FROM profile_borders WHERE id=?", (border_id,)
        ).fetchone()
        if not border:
            raise HTTPException(404, "Border not found")

        already = db.execute(
            "SELECT 1 FROM user_borders WHERE user_id=? AND border_id=?", (uid, border_id)
        ).fetchone()
        if already:
            raise HTTPException(409, "Bạn đã sở hữu viền này rồi!")

        g = db.execute(
            "SELECT coins FROM user_gamification WHERE user_id=?", (uid,)
        ).fetchone()
        coins = g["coins"] if g and "coins" in g.keys() else 0

        if coins < border["price_coins"]:
            raise HTTPException(400, f"Không đủ xu! Cần {border['price_coins']}, bạn có {coins}.")

        # Deduct coins
        db.execute(
            "UPDATE user_gamification SET coins = coins - ? WHERE user_id=?",
            (border["price_coins"], uid)
        )
        # Grant border
        db.execute(
            "INSERT INTO user_borders (user_id, border_id) VALUES (?,?)",
            (uid, border_id)
        )
        db.commit()

        new_coins = db.execute(
            "SELECT coins FROM user_gamification WHERE user_id=?", (uid,)
        ).fetchone()["coins"]
        return JSONResponse({"success": True, "border_id": border_id, "coins_remaining": new_coins})
    finally:
        db.close()


@app.post("/api/shop/borders/{border_id}/equip")
async def equip_border(border_id: str, request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        owns = db.execute(
            "SELECT 1 FROM user_borders WHERE user_id=? AND border_id=?", (uid, border_id)
        ).fetchone()
        if not owns:
            raise HTTPException(403, "Bạn chưa sở hữu viền này!")

        # Unequip all, equip selected
        db.execute("UPDATE user_borders SET is_active=0 WHERE user_id=?", (uid,))
        db.execute(
            "UPDATE user_borders SET is_active=1 WHERE user_id=? AND border_id=?",
            (uid, border_id)
        )
        db.commit()
        return JSONResponse({"success": True, "equipped": border_id})
    finally:
        db.close()


@app.post("/api/shop/borders/unequip")
async def unequip_border(request: Request):
    uid = await resolve_user_id(request)
    db = get_db()
    try:
        db.execute("UPDATE user_borders SET is_active=0 WHERE user_id=?", (uid,))
        db.commit()
        return JSONResponse({"success": True})
    finally:
        db.close()


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn # pyright: ignore[reportMissingImports]
    port = int(os.environ.get("PORT", 5000))
    print(f"DuoMath API v4 (FastAPI + MathGPT) -> http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
