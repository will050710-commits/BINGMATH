# backend/main.py  —  DuoMath FastAPI Backend (v4 — async upgrade)
# ─────────────────────────────────────────────────────────────────────────────
# Full async port of server.py (Flask v3) → FastAPI + httpx
# Run with:  uvicorn main:app --host 0.0.0.0 --port $PORT
# ─────────────────────────────────────────────────────────────────────────────

import os, sys, sqlite3, json, uuid, time, asyncio, base64, io, logging
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

logger = logging.getLogger("duomath")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_handler)
logger.setLevel(logging.INFO)


# Manual .env loader (0-dependency)
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env_path):
    with open(_env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from contextlib import asynccontextmanager

import sympy
import httpx # pyright: ignore[reportMissingImports]
import orjson
from fastapi import FastAPI, Request, HTTPException, Depends # pyright: ignore[reportMissingImports]
from fastapi.responses import JSONResponse, StreamingResponse # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from fastapi.middleware.gzip import GZipMiddleware # pyright: ignore[reportMissingImports]

from werkzeug.security import generate_password_hash, check_password_hash # pyright: ignore[reportMissingImports]

# ── SymPy Arithmetic & Symbolic Solver Engine (Tool Calling) ──────────────────
def evaluate_math_expression(expression: str) -> dict:
    """
    Safely evaluates arithmetic and algebraic expressions symbolically and numerically using SymPy.
    Used by LLM tool-calling to prevent mental math hallucinations and fabricated calculation steps.
    """
    try:
        clean_expr = str(expression).strip()
        clean_expr = clean_expr.replace("^", "**")
        clean_expr = clean_expr.replace("×", "*").replace("÷", "/")
        
        # Sympy parse
        sym_obj = sympy.sympify(clean_expr, evaluate=True)
        exact_str = str(sym_obj)
        
        try:
            num_val = float(sym_obj.evalf())
            if abs(num_val - round(num_val)) < 1e-12:
                num_str = str(int(round(num_val)))
            else:
                num_str = f"{num_val:.6g}"
        except Exception:
            num_val = None
            num_str = None
            
        return {
            "success": True,
            "expression": expression,
            "exact": exact_str,
            "numeric": num_str,
            "numeric_raw": num_val,
            "latex": sympy.latex(sym_obj)
        }
    except Exception as e:
        return {
            "success": False,
            "expression": expression,
            "error": str(e)
        }

GEMINI_TOOLS = [
    {
        "functionDeclarations": [
            {
                "name": "evaluate_math",
                "description": "Tính toán chính xác một biểu thức số học hoặc đại số bằng SymPy. LUÔN gọi tool này cho mọi phép tính số học, phân số, đạo hàm, tích phân, căn bậc hai, lượng giác thay vì tự nhẩm.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "expression": {
                            "type": "STRING",
                            "description": "Biểu thức toán học dạng Python/SymPy, ví dụ: '-3*(2.5-2)**2+9', 'sqrt(3)/2 + sin(pi/6)', 'integrate(x**2, (x, 0, 1))'"
                        }
                    },
                    "required": ["expression"]
                }
            }
        ]
    }
]

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

# ── Vision Agent for Olympiad Geometry (Qwen2.5-VL-72B via OpenRouter) ───────
from vision_agent import GeometryVisionAgent
_vision_agent = GeometryVisionAgent()
from image_preprocessing import preprocess_image_b64  # Risk 3: aspect-preserving resize + pad


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

_ARITHMETIC_PRECISION_RULES = """
## QUY TẮC BẮT BUỘC VỀ ĐỘ CHÍNH XÁC TÍNH TOÁN & CHỐNG "BỊA SỐ":
1. TUYỆT ĐỐI KHÔNG tự ý nhẩm hay suy diễn số học phức tạp trong đầu mà không có căn cứ. Sử dụng công cụ `evaluate_math` để tính toán chính xác mọi biểu thức đại số, phân số, đạo hàm, tích phân, căn thức, lượng giác và số thập phân.
2. TUYỆT ĐỐI KHÔNG ĐƯỢC sửa đổi kết quả tính toán của chính mình hoặc chèn bước tính bịa đặt (ví dụ: bịa bước 'dùng máy tính x ≈ ...' không có căn cứ) chỉ để cố ép cho khớp với một phương án trắc nghiệm trong ảnh/đề bài.
3. Đối với bài toán trắc nghiệm (có các đáp án A, B, C, D):
   - BẮT BUỘC giải và tính toán độc lập hoàn toàn theo đúng các định lý và công thức chính xác.
   - Chỉ đối chiếu kết quả đã tính đúng với các lựa chọn A, B, C, D ở bước kết luận cuối cùng.
   - Nếu kết quả tính toán đúng không trùng với bất kỳ phương án nào cho sẵn (hoặc đề in sai), hãy chỉ rõ điều đó một cách trung thực và giải thích nguyên nhân, tuyệt đối không được 'bịa số' ép khớp đáp án."""

_SOCRATIC_BASE = f"""Bạn là **DuoMCB** (chú Cú Xanh Toán học thông thái 🦉) — Trợ lý & Bạn đồng hành Toán học AI chuyên sâu của nền tảng **DUOMATH / DUOSTEAM**, hỗ trợ học sinh THCS, THPT và Chuyên/Olympiad (lớp 6-12) chinh phục Toán học song ngữ Anh-Việt!

## NĂNG LỰC TOÁN HỌC & CHUYÊN MÔN CHUẨN XÁC:
- **Nắm vững toàn bộ các phân môn Toán học**: Hình học phẳng thuần túy & nâng cao (Tỉ số kép, Hàng điểm/Chùm điều hòa, Tứ giác điều hòa, Cực và đối cực, Bổ đề hình thang, Phương tích - Trục đẳng phương, Điểm Miquel, Định lý Ceva, Menelaus, Pascal, Desargues), Hình không gian & Tọa độ Oxyz, Đại số & Giải tích (Khảo sát hàm, Đạo hàm, Tích phân, Dãy số, Giới hạn), Lượng giác, Số phức, Tổ hợp & Xác suất.
- **Tính chính xác tuyệt đối về mặt toán học (Mathematical Soundness & Rigor)**:
  + Tuyệt đối KHÔNG phỏng đoán máy móc, không ghép nối từ khóa vô căn cứ.
  + Phải hiểu thấu đáo cấu hình hình học: Điểm đối xứng, giao điểm tiếp tuyến (cực của đường thẳng), phép chiếu chùm điều hòa lên đường tròn tạo tứ giác điều hòa, bổ đề hình thang về trung điểm của các đoạn thẳng song song...
  + Mọi khẳng định, gợi ý hay lời giải đều phải dựa trên các định lý, tính chất toán học chuẩn mực.
{_ARITHMETIC_PRECISION_RULES}

## PHONG CÁCH GIAO TIẾP:
- Thân thiện, tôn trọng, truyền cảm hứng học tập và tư duy phản biện. Xưng "DuoMCB" (hoặc "mình") và gọi học sinh là "bạn" hoặc "em".
- Sử dụng ngôn ngữ sư phạm chuẩn xác, mạch lạc, dễ hiểu, có chèn emoji hợp lý (🦉, 💡, 📐, ✨, 🎯).

## NGUYÊN TẮC GIẢNG DẠY (SOCRATIC METHOD):
- Ở chế độ Gợi ý: Hướng dẫn học sinh khám phá từng bước, chỉ ra các mắt xích lý thuyết và bổ đề then chốt để học sinh tự suy luận, không giải tắt làm mất đi cơ hội tư duy.
- Ở chế độ Giải Đầy Đủ: Trình bày bài giải bài bản, chứng minh chi tiết từng bước, nêu rõ căn cứ định lý và kết luận rõ ràng."""

@lru_cache(maxsize=64)
def cached_system_prompt(variant: str = "text", widget: str | None = None) -> str:
    """MathGPT system prompt — 5 variants: text (Socratic hint), image (Vision Socratic),
    solution (full step-by-step + bài phái sinh), raw_solution (non-Socratic step solver), translate (JSON-only).
    Optional `widget` injects the matching mathviz schema snippet at the end.
    Cache key is (variant, widget) — up to 64 slots = 5 variants × ~9 widgets + margin.
    """
    if variant == "solution":
        base = (
            _SOCRATIC_BASE
            + "\n\n## CHẾ ĐỘ HIỆN TẠI: GIẢI CHI TIẾT ĐẦY ĐỦ (Full Solution Mode)"
            + "\nHọc sinh yêu cầu xem lời giải chi tiết. Hãy:\n"
            + "1. Phân tích kỹ giả thiết và kết luận của đề bài (từ văn bản hoặc hình ảnh).\n"
            + "2. Trình bày lời giải HOÀN CHỈNH, CHẶT CHẼ theo từng bước logic rõ ràng (**Bước 1**, **Bước 2**...), nêu rõ căn cứ của từng suy luận (định lý, bổ đề, tính chất hình học/đại số).\n"
            + "3. Sau lời giải, tạo 1 **Bài Tập Luyện Tập** tương tự dưới tiêu đề:\n"
            + "   ### 📝 Bài Tập Luyện Tập Ngay\n"
            + "   [Đề bài phái sinh]\n"
            + "   > 💡 *Em thử áp dụng phương pháp trên để giải bài này nhé!*\n"
            + _LATEX_RULES
        )
    elif variant == "raw_solution":
        base = (
            "You are an expert mathematics professor and Olympiad tutor.\n"
            "Analyze the problem rigorously and provide a mathematically sound, step-by-step solution.\n"
            "Each step must be logically complete with full justifications (theorems, lemmas, geometric properties).\n"
            "Use LaTeX for all math expressions (inline: $...$, block: $$...$$).\n"
            "Write the response in the requested language (English or Vietnamese).\n"
            "Do NOT include conversational chatter or filler text. Output clear numbered steps."
        )
    elif variant == "visualizer":
        base = (
            "Bạn là chuyên gia trực quan hóa toán học và mô hình hóa hình học tương tác MathViz của DuoMath.\n\n"
            "## NHIỆM VỤ CHÍNH: TẬP TRUNG TẠO MÔ HÌNH HÌNH HỌC / ĐỒ THỊ TƯƠNG TÁC (MATHVIZ)\n"
            "Người dùng đã nhấn chọn chế độ 'Minh Họa Tương Tác'. Mục tiêu số 1 là XEM VÀ TƯƠNG TÁC VỚI HÌNH VẼ / MÔ HÌNH TRỰC QUAN.\n\n"
            "## QUY TẮC PHÂN LOẠI 2D VÀ 3D CỰC KỲ QUAN TRỌNG (BẮT BUỘC TUÂN THỦ):\n"
            "1. NẾU ẢNH HOẶC ĐỀ BÀI LÀ HÌNH HỌC PHẲNG 2D (ví dụ: bài toán chứng minh hình phẳng, tam giác ABC, đường tròn (O), tiếp tuyến, trực tâm H, cát tuyến, các điểm đồng phẳng, chùm điều hòa, tứ giác điều hòa, bổ đề hình thang, v.v.):\n"
            "   -> BẮT BUỘC DÙNG WIDGET \"geometry_2d\"!\n"
            "   -> Sử dụng cấu trúc \"layers\" để CHỒNG NHIỀU LỚP hình học phẳng lên nhau (đường tròn + tam giác/đa giác + các đoạn thẳng nối + các điểm tọa độ gắn nhãn A, B, C, H, E, T, O, L...).\n"
            "   -> TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý CHUYỂN THÀNH HÌNH CHÓP 3D (như S.ABC) hay hình không gian 3D!\n"
            "2. CHỈ DÙNG WIDGET \"geometry_3d\" KHI:\n"
            "   - Đề bài/ảnh thực sự là hình học không gian 3D (hình chóp S.ABCD, hình lăng trụ, hình trụ, hình nón, hình cầu, khối đa diện, dải Möbius 3D, bình Klein 3D).\n"
            "3. NẾU LÀ ĐỒ THỊ HÀM SỐ: Dùng widget \"function_plot\".\n\n"
            "## CẤU TRÚC PHẢN HỒI:\n"
            "1. BẮT BUỘC đính kèm ĐÚNG MỘT khối ```mathviz ... ``` ở cuối câu trả lời để tạo widget trực quan trên giao diện.\n"
            "2. TUYỆT ĐỐI KHÔNG viết bài giải chứng minh dài dòng, không viết lời giải từng bước như chế độ 'Giải Đầy Đủ'.\n"
            "3. Phần văn bản chỉ cần RẤT NGẮN GỌN (1-2 đoạn súc tích):\n"
            "   - Tên mô hình/khối hình học/đồ thị được minh họa.\n"
            "   - Các thông số/yếu tố hình học chính (tọa độ các điểm, bán kính đường tròn, các đoạn thẳng nối quan trọng).\n"
            "   - Hướng dẫn học sinh kéo các điểm trên hình vẽ để quan sát sự tương tác động.\n"
            + _LATEX_RULES
            + _VISUAL_RULES
            + "\n"
            + _WIDGET_PROMPT_SNIPPETS["geometry_2d"]
            + "\n"
            + _WIDGET_PROMPT_SNIPPETS["geometry_3d"]
            + "\n"
            + _WIDGET_PROMPT_SNIPPETS["function_plot"]
        )
        return base
    elif variant == "image_with_vision":
        base = (
            _SOCRATIC_BASE
            + "\n\n## CHẾ ĐỘ HIỆN TẠI: PHÂN TÍCH HÌNH HỌC TỪ VISION AI VÀ MÔ HÌNH HÓA MATHVIZ (Olympiad Geometry Mode)"
            + "\nBạn đã nhận được kết quả trích xuất cấu trúc hình học chi tiết từ mô hình thị giác AI (các điểm, đường tròn, tiếp tuyến, giao điểm, quan hệ vuông góc, đồng quy, đồng viên)."
            + "\nHãy thực hiện quy trình sau:\n"
            + "1. **Tóm tắt cấu hình & Nhận diện bài toán**: Dựa trên các đối tượng và quan hệ đã trích xuất từ ảnh, nêu bật mô hình hình học cốt lõi.\n"
            + "2. **Minh họa trực quan MathViz (Canvas) - QUY TẮC DỰNG TỌA ĐỘ CHUẨN XÁC**:\n"
            + "   - Bám sát CHÍNH XÁC các điểm và đối tượng hình học được trích xuất từ đề bài/hình ảnh (ví dụ: nếu đề bài cho tam giác IaIbIc, tứ giác, đường tròn tâm O... thì dựng đúng các đỉnh đó, KHÔNG tự ý thay bằng tam giác khác).\n"
            + "   - Tính toán hoặc ước lượng tọa độ giải tích cân đối, trực quan cho các đỉnh và điểm đặc biệt.\n"
            + "   - Sử dụng widget \"geometry_2d\" với cấu trúc \"layers\" đa tầng: định nghĩa đầy đủ polygon, lines, circle, points. Vẽ nét thanh mảnh (strokeWidth: 1.5 - 2), màu sắc rõ ràng (các đa giác/tam giác xanh neon #10b981 hoặc #3b82f6, đường tròn viền xanh/hồng mảnh, các đường phụ nét đứt màu vàng/đỏ).\n"
            + "3. **Gợi ý định hướng giải (Socratic Hints)**: Nêu 2-3 gợi ý sắc sảo dựa trên cấu hình (bổ đề hình thang, chùm điều hòa, phương tích, trục đẳng phương, góc nội tiếp, tam giác đồng dạng...).\n"
            + _LATEX_RULES
            + "\n" + _VISUAL_RULES
            + "\n" + _WIDGET_PROMPT_SNIPPETS["geometry_2d"]
        )
        return base
    elif variant == "image":


        base = (
            _SOCRATIC_BASE
            + "\n\n## CHẾ ĐỘ HIỆN TẠI: PHÂN TÍCH ẢNH VÀ GỢI Ý SOCRATIC (Vision Socratic Hint Mode)"
            + "\nBạn đang đọc đề bài toán từ hình ảnh. Hãy thực hiện quy trình sau:\n"
            + "1. **Tóm tắt cấu hình & dữ kiện chính**: Nêu rõ các đối tượng cốt lõi của đề bài (tam giác, đường tròn, các điểm, giao điểm, giả thiết quan trọng).\n"
            + "2. **Gợi ý định hướng giải (Socratic Hints)**:\n"
            + "   - Đưa ra 2-3 gợi ý sâu sắc và trúng bản chất toán học theo từng bước tiếp cận (sử dụng format `💡 Gợi ý 1:`, `💡 Gợi ý 2:`...).\n"
            + "   - Nêu tên các bổ đề, tính chất hoặc công cụ toán học then chốt cần dùng (ví dụ: Chùm điều hòa & Tứ giác điều hòa, Giao điểm tiếp tuyến, Bổ đề hình thang, v.v.).\n"
            + "   - Đặt câu hỏi dẫn dắt để người học tự kết nối các mắt xích logic.\n"
            + _LATEX_RULES
        )
    else:
        # Default: "text" — Socratic hint mode
        base = (
            _SOCRATIC_BASE
            + "\n\n## CHẾ ĐỘ HIỆN TẠI: GỢI Ý SOCRATIC (Socratic Hint Mode)"
            + "\nBạn đang đồng hành giải toán cùng học sinh bằng phương pháp gợi mở:\n"
            + "1. Nhận diện trọng tâm và bản chất của bài toán.\n"
            + "2. Cung cấp các gợi ý từng bước (`💡 Gợi ý 1:`, `💡 Gợi ý 2:`...) chỉ ra các bổ đề, công thức hoặc hướng suy luận then chốt.\n"
            + "3. Đặt câu hỏi dẫn dắt học sinh tự thực hiện phép biến đổi/chứng minh tiếp theo.\n"
            + _LATEX_RULES
        )
    # Append mathviz visual rules + per-widget schema snippet + golden few-shot demo when widget is known
    if widget and widget in _WIDGET_PROMPT_SNIPPETS:
        base += _VISUAL_RULES
        base += _WIDGET_PROMPT_SNIPPETS[widget]
        if widget in _WIDGET_FEW_SHOT_DEMOS:
            base += "\n\n## VÍ DỤ MẪU HOÀN CHỈNH (FEW-SHOT GOLDEN CALIBRATION - HỌC THEO ĐỊNH DẠNG NÀY):\n"
            base += _WIDGET_FEW_SHOT_DEMOS[widget]
    elif variant in ("image", "solution"):
        base += _VISUAL_RULES
        base += (
            "\n\n## QUY TẮC MINH HỌA TRỰC QUAN TOÁN HỌC (MathViz):\n"
            "Nếu người dùng yêu cầu minh họa, vẽ hình hoặc bài toán có yếu tố hình học / đồ thị, hãy đính kèm ĐÚNG MỘT khối ```mathviz ... ``` ở cuối câu trả lời:\n"
            "- Với hình phẳng (tam giác, tứ giác, đường tròn, elip, đa giác, các điểm tọa độ): Dùng widget \"geometry_2d\".\n"
            "- Với hình học không gian 3D (hình chóp, lăng trụ, elipsoid, nón, trụ, cầu, nón cụt, mặt 3D): Dùng widget \"geometry_3d\".\n"
            "- Với đồ thị hàm số / giải tích: Dùng widget \"function_plot\".\n\n"
            + _WIDGET_PROMPT_SNIPPETS["geometry_2d"]
            + "\n"
            + _WIDGET_PROMPT_SNIPPETS["geometry_3d"]
            + "\n"
            + _WIDGET_PROMPT_SNIPPETS["function_plot"]
        )
    return base



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

# ── MathViz Widget Routing ────────────────────────────────────────────────────
# Maps MATH_CONCEPT_GRAPH node IDs → widget type (priority 1: graph-based routing)
GRAPHABLE_CONCEPT_IDS: dict[str, str] = {
    "phuong_trinh_bac_hai": "function_plot",
    "dao_ham":              "function_plot",
    "tich_phan":            "function_plot",
    "gioi_han":             "function_plot",
    "cuc_tri":              "function_plot",
    "tiem_can":             "function_plot",
    "ham_so_luong_giac":    "unit_circle_wave",
    "so_phuc":              "complex_plane",
    "xac_suat":             "distribution",
    "to_hop_chinh_hop":     "distribution",
    "hinh_hoc_khong_gian":  "geometry_3d",
}

# Fallback keyword-based routing (priority 2: when no graph node matched)
_WIDGET_KEYWORDS: dict[str, list[str]] = {
    "geometry_2d":       [
        "tam giác", "tứ giác", "hình thang", "đường tròn", "tiếp tuyến", "cát tuyến",
        "đường cao", "trực tâm", "ngoại tiếp", "nội tiếp", "bàng tiếp", "chùm điều hòa",
        "tứ giác điều hòa", "mô hình phẳng", "hình học phẳng", "2d", "chứng minh rằng",
        "phép quay", "đối xứng trục", "tịnh tiến", "vị tự", "vectơ", "vector", "trung tuyến", "trọng tâm",
        "hình elip", "elip", "ellipse", "tiêu cự", "tiêu điểm", "tâm sai", "bán trục",
        "đa giác đều", "ngũ giác", "lục giác", "bát giác", "đa giác"
    ],
    "geometry_3d":       [
        "hình chóp", "hình hộp", "hình lăng trụ", "mặt cầu", "mặt nón", "mặt trụ",
        "hình trụ", "hình nón", "khối cầu", "oxyz", "thể tích khối",
        "khối đa diện", "hình không gian", "hình chóp tam giác", "tứ diện", "tứ diện đều",
        "lăng trụ tam giác", "lăng trụ đứng", "hình elipsoid", "hình chóp cụt", "hình nón cụt",
        "lăng trụ lục giác", "hình 3d", "không gian 3d", "3 chiều", "không gian 3 chiều",
        "solid geometry", "dải mobius", "chai klein", "bình klein", "klein bottle", "mobius",
        "tesseract", "4d", "4 chiều", "không gian 4 chiều", "siêu lập phương", "hypercube",
        "mặt boy", "boy's surface", "cross-cap", "nút trefoil", "trefoil knot", "hình xuyến", "torus", "mặt cong"
    ],
    "unit_circle_wave":  ["sin(", "cos(", "tan(", "lượng giác", "chu kỳ", "biên độ", "vòng tròn đơn vị", "vòng tròn lượng giác"],
    "inequality_region": ["hệ bất phương trình", "miền nghiệm", "quy hoạch tuyến tính", "bất phương trình bậc nhất"],
    "venn_sets":         ["tập hợp", "giao của hai tập", "hợp của hai tập", "phần bù", "tập con"],
    "sequence_series":   ["cấp số cộng", "cấp số nhân", "dãy số", "tổng riêng phần", "số hạng tổng quát"],
    "complex_plane":     ["số phức", "môđun", "acgumen", "mặt phẳng phức", "phần thực", "phần ảo"],
    "distribution":      ["phân phối", "xác suất", "kỳ vọng", "phương sai", "độ lệch chuẩn", "nhị thức", "biến ngẫu nhiên"],
    "function_plot":     ["đạo hàm", "tích phân", "khảo sát hàm số", "cực trị", "tiệm cận",
                          "parabol", "hàm số bậc", "đồng biến", "nghịch biến", "đồ thị hàm"],
}


def generate_mock_mathgpt_reply(user_message: str, widget: str | None = None, mode: str = "hint") -> str:
    """Generates a structured, mathematically sound MathGPT 3-layer reply when external LLM is offline."""
    if not widget:
        widget = detect_widget(user_message)
    
    msg_low = user_message.lower()

    if widget == "geometry_3d":
        if "tam giác" in msg_low or "tứ diện" in msg_low:
            return (
                "## 🔍 Hình Chóp Tam Giác Đều (Tứ Diện Đều)\n\n"
                "**1. Phân tích hình học & Công thức**\n"
                "Cho hình chóp tam giác đều $S.ABC$ có cạnh đáy $a = 4$, chiều cao $h = 5$.\n"
                "Diện tích đáy tam giác đều: $$S_{\\text{đáy}} = \\frac{a^2\\sqrt{3}}{4} = \\frac{16\\sqrt{3}}{4} = 4\\sqrt{3}$$\n"
                "Thể tích khối chóp:\n"
                "$$V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h = \\frac{1}{3} \\cdot 4\\sqrt{3} \\cdot 5 = \\frac{20\\sqrt{3}}{3} \\approx 11.55$$\n\n"
                "**2. Thiết diện & Quan sát 3D**\n"
                "Đoạn nối đỉnh $S$ tới tâm đường tròn ngoại tiếp đáy là trục đối xứng xoay.\n\n"
                "*Em có thể kéo xoay mô hình 3D và điều chỉnh tham số bên dưới! 😊*\n\n"
                "```mathviz\n"
                '{"type": "mathviz.v1", "widget": "geometry_3d", "title": "Hình chóp tam giác đều $S.ABC$, đáy $a=4$, cao $h=5$", "solid": "triangular_pyramid", "dims": {"a": 4, "h": 5}, "show_cross_section": true, "cross_section_height": 1.5}\n'
                "```"
            )
        elif "lăng trụ" in msg_low:
            return (
                "## 🔍 Lăng Trụ Tam Giác Đều\n\n"
                "**1. Công thức thể tích & diện tích toàn phần**\n"
                "Lăng trụ tam giác đều có đáy là tam giác đều cạnh $a=4$, chiều cao $h=5$.\n"
                "$$V = S_{\\text{đáy}} \\cdot h = \\frac{a^2\\sqrt{3}}{4} \\cdot h = \\frac{16\\sqrt{3}}{4} \\cdot 5 = 20\\sqrt{3} \\approx 34.64$$\n"
                "$$S_{tp} = 2 \\cdot S_{\\text{đáy}} + 3ah = 8\\sqrt{3} + 60$$\n\n"
                "```mathviz\n"
                '{"type": "mathviz.v1", "widget": "geometry_3d", "title": "Lăng trụ tam giác đều, $a=4$, $h=5$", "solid": "triangular_prism", "dims": {"a": 4, "h": 5}, "show_cross_section": false, "cross_section_height": 0}\n'
                "```"
            )
        elif "elipsoid" in msg_low:
            return (
                "## 🔍 Khối Elipsoid 3D $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1$\n\n"
                "**Thể tích khối elipsoid**: $$V = \\frac{4}{3}\\pi abc$$\n"
                "Với bán trục $a = 3, b = 2.2, c = 2$, ta có: $$V = \\frac{4}{3}\\pi \\cdot 3 \\cdot 2.2 \\cdot 2 = 17.6\\pi \\approx 55.29$$\n\n"
                "```mathviz\n"
                '{"type": "mathviz.v1", "widget": "geometry_3d", "title": "Khối Elipsoid 3D ($a=3, b=2.2, c=2$)", "solid": "ellipsoid", "dims": {"a": 3, "b": 2.2, "c": 2}, "show_cross_section": true, "cross_section_height": 0}\n'
                "```"
            )
        elif "chóp cụt" in msg_low or "nón cụt" in msg_low:
            return (
                "## 🔍 Hình Nón Cụt / Chóp Cụt\n\n"
                "**Thể tích hình nón cụt** với bán kính đáy trên $r_1=1.5$, đáy dưới $r_2=3$, chiều cao $h=4$:\n"
                "$$V = \\frac{1}{3}\\pi h (r_1^2 + r_1 r_2 + r_2^2) = \\frac{4}{3}\\pi (2.25 + 4.5 + 9) = 21\\pi \\approx 65.97$$\n\n"
                "```mathviz\n"
                '{"type": "mathviz.v1", "widget": "geometry_3d", "title": "Hình nón cụt ($r_1=1.5, r_2=3, h=4$)", "solid": "frustum", "dims": {"r1": 1.5, "r2": 3, "h": 4}, "show_cross_section": true, "cross_section_height": 1}\n'
                "```"
            )
        return (
            "## 🔍 Bài toán Hình Học Không Gian (Geometry 3D)\n\n"
            "**Hướng tiếp cận 1: Đại số & Tọa độ Oxyz (Coordinate Method)**\n"
            "Gắn hệ trục tọa độ $Oxyz$ với gốc tại tâm đáy hình chóp để xác định tọa độ các đỉnh và vector pháp tuyến.\n\n"
            "**Hướng tiếp cận 2: Hình học Không gian Tổng hợp (Synthetic 3D Geometry)**\n"
            "Sử dụng công thức thể tích khối chóp:\n"
            "$$V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h$$\n"
            "Với $S_{\\text{đáy}} = a^2 = 4^2 = 16$ và chiều cao $h = 6$, ta có $V = \\frac{1}{3} \\cdot 16 \\cdot 6 = 32$.\n\n"
            "**Hướng tiếp cận 3: Thiết diện & Mặt phẳng cắt (Cross-Section Analysis)**\n"
            "Khi cắt khối chóp bởi mặt phẳng song song với đáy ở độ cao $h' = 2$, thiết diện thu được là hình vuông đồng dạng.\n\n"
            "*Em thử kiểm tra lại kết quả và xoay khối 3D bên dưới nhé! 😊*\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "geometry_3d", "title": "Hình chóp tứ giác đều $S.ABCD$, đáy $a=4$, cao $h=6$", "solid": "square_pyramid", "dims": {"a": 4, "h": 6}, "show_cross_section": true, "cross_section_height": 2}\n'
            "```"
        )

    elif widget == "geometry_2d":
        if ("glk" in msg_low or "aml" in msg_low or "cevian" in msg_low) and "trực tâm" in msg_low:
            return (
                "## 🔍 Cấu Trúc Hình Học Phẳng Phức Tạp & Hệ Thống Đường Đồng Quy\n\n"
                "**1. Phân tích cấu trúc hình học**\n"
                "Cho tam giác nhọn $\\triangle ABC$ ($AB < AC$) nội tiếp đường tròn $(O)$, ba đường cao $AD, BE, CF$ đồng quy tại trực tâm $H$.\n"
                "- Đường tròn tâm $I$ đường kính $AH$ đi qua các điểm $A, F, H, E$ và cắt đoạn thẳng $GLK$ tại điểm $G$.\n"
                "- Cạnh $AB$ kéo dài về phía $B$ cắt đường thẳng $PD$ tại điểm $P$.\n"
                "- Qua $F$ kẻ đường thẳng song song với cạnh đáy $BC$, cắt $AD$ tại $J$, cắt $GLK$ tại $L$ và cắt $AC$ tại $Q$.\n"
                "- Đường cevian $AK$ (hoặc $AML$) xuất phát từ $A$, cắt $FE$ tại $M$ và cắt đường song song $FQ$ tại $L$.\n"
                "- Đoạn thẳng $GLK$ nối $G, L, K$ thẳng hàng, đoạn $DN$ nối chân đường cao $D$ với $N$ trên $AC$.\n\n"
                "**2. Hệ thống đường liên kết & Đo góc tương tác**\n"
                "Mô hình bên dưới tái hiện đầy đủ các đoạn thẳng liên kết, góc vuông $90^\\circ$ tại các chân đường cao và cho phép em kéo-nối các điểm để khám phá thêm các tính chất hình học!\n\n"
                "*Em có thể kéo-thả giữa 2 điểm bất kỳ để vẽ thêm đường nối và xem góc đo tự động! 🎯*\n\n"
                "```mathviz\n"
                "{\n"
                '  "type": "mathviz.v1",\n'
                '  "widget": "geometry_2d",\n'
                '  "title": "Cấu trúc hình học phẳng $\\\\triangle ABC$ với các đường đồng quy & trực tâm $H$",\n'
                '  "mode": "composite",\n'
                '  "layers": [\n'
                '    {\n'
                '      "kind": "polygon",\n'
                '      "points": [{"id": "A", "x": -0.8, "y": 3.5}, {"id": "B", "x": -2.5, "y": -1.8}, {"id": "C", "x": 3.0, "y": -1.8}],\n'
                '      "fill": "rgba(59, 130, 246, 0.05)",\n'
                '      "color": "#ffffff",\n'
                '      "strokeWidth": 2.0\n'
                '    },\n'
                '    {\n'
                '      "kind": "circle",\n'
                '      "center": {"x": 0.25, "y": 0.24},\n'
                '      "r": 3.42,\n'
                '      "color": "#3b82f6",\n'
                '      "label": "Đường tròn ngoại tiếp (O)",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "circle",\n'
                '      "center": {"x": -0.8, "y": 1.46},\n'
                '      "r": 2.04,\n'
                '      "color": "#ec4899",\n'
                '      "label": "Đường tròn đường kính AH (I)",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "circle",\n'
                '      "center": {"x": -0.28, "y": -0.17},\n'
                '      "r": 1.71,\n'
                '      "color": "#10b981",\n'
                '      "label": "Đường tròn Euler (9 điểm)",\n'
                '      "style": "dashed"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "A", "x": -0.8, "y": 3.5},\n'
                '      "to": {"id": "D", "x": -0.8, "y": -1.8},\n'
                '      "color": "#f43f5e",\n'
                '      "label": "Đường cao AD",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "B", "x": -2.5, "y": -1.8},\n'
                '      "to": {"id": "E", "x": 1.13, "y": 0.81},\n'
                '      "color": "#f43f5e",\n'
                '      "label": "Đường cao BE",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "C", "x": 3.0, "y": -1.8},\n'
                '      "to": {"id": "F", "x": -1.99, "y": -0.2},\n'
                '      "color": "#f43f5e",\n'
                '      "label": "Đường cao CF",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "B", "x": -2.5, "y": -1.8},\n'
                '      "to": {"id": "P", "x": -2.925, "y": -3.125},\n'
                '      "color": "#ffffff",\n'
                '      "label": "Kéo dài cạnh AB (BP)",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "P", "x": -2.925, "y": -3.125},\n'
                '      "to": {"id": "D", "x": -0.8, "y": -1.8},\n'
                '      "color": "#a855f7",\n'
                '      "label": "Đoạn thẳng PD",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "F", "x": -1.99, "y": -0.2},\n'
                '      "to": {"id": "Q", "x": 1.85, "y": -0.2},\n'
                '      "color": "#00E5FF",\n'
                '      "label": "Đường thẳng qua F song song BC (FQ)",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "F", "x": -1.99, "y": -0.2},\n'
                '      "to": {"id": "E", "x": 1.13, "y": 0.81},\n'
                '      "color": "#39FF14",\n'
                '      "label": "Đoạn FE",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "G", "x": 0.65, "y": 2.9},\n'
                '      "to": {"id": "K", "x": 0.6, "y": -1.8},\n'
                '      "color": "#FFD400",\n'
                '      "label": "Đường thẳng GLK",\n'
                '      "style": "solid"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "A", "x": -0.8, "y": 3.5},\n'
                '      "to": {"id": "L", "x": 0.62, "y": -0.2},\n'
                '      "color": "#ec4899",\n'
                '      "label": "Cevian AML",\n'
                '      "style": "dashed"\n'
                '    },\n'
                '    {\n'
                '      "kind": "line",\n'
                '      "from": {"id": "D", "x": -0.8, "y": -1.8},\n'
                '      "to": {"id": "N", "x": 2.42, "y": -0.99},\n'
                '      "color": "#64748b",\n'
                '      "label": "Đoạn DN",\n'
                '      "style": "dashed"\n'
                '    },\n'
                '    {\n'
                '      "kind": "points",\n'
                '      "data": [\n'
                '        {"id": "A", "x": -0.8, "y": 3.5, "color": "#f0f6fc"},\n'
                '        {"id": "B", "x": -2.5, "y": -1.8, "color": "#f0f6fc"},\n'
                '        {"id": "C", "x": 3.0, "y": -1.8, "color": "#f0f6fc"},\n'
                '        {"id": "D", "x": -0.8, "y": -1.8, "color": "#FFD400"},\n'
                '        {"id": "E", "x": 1.13, "y": 0.81, "color": "#FFD400"},\n'
                '        {"id": "F", "x": -1.99, "y": -0.2, "color": "#FFD400"},\n'
                '        {"id": "H", "x": -0.8, "y": -0.58, "color": "#f43f5e"},\n'
                '        {"id": "O", "x": 0.25, "y": 0.24, "color": "#3b82f6"},\n'
                '        {"id": "I", "x": -0.8, "y": 1.46, "color": "#ec4899"},\n'
                '        {"id": "P", "x": -2.925, "y": -3.125, "color": "#a855f7"},\n'
                '        {"id": "G", "x": 0.65, "y": 2.9, "color": "#FFD400"},\n'
                '        {"id": "Q", "x": 1.85, "y": -0.2, "color": "#00E5FF"},\n'
                '        {"id": "K", "x": 0.6, "y": -1.8, "color": "#FFD400"},\n'
                '        {"id": "L", "x": 0.62, "y": -0.2, "color": "#a855f7"},\n'
                '        {"id": "M", "x": 0.33, "y": 0.55, "color": "#39FF14"},\n'
                '        {"id": "J", "x": -0.8, "y": 0.19, "color": "#00E5FF"},\n'
                '        {"id": "N", "x": 2.42, "y": -0.99, "color": "#64748b"}\n'
                '      ]\n'
                '    }\n'
                '  ]\n'
                "}\n"
                "```"
            )
        elif "elip" in msg_low or "ellipse" in msg_low:
            return (
                "## 🔍 Hình Elip Chính Tắc $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$\n\n"
                "**1. Các thông số đặc trưng**\n"
                "- Độ dài bán trục lớn: $a = 4$\n"
                "- Độ dài bán trục bé: $b = 2.5$\n"
                "- Tiêu cự: $2c = 2\\sqrt{a^2 - b^2} = 2\\sqrt{16 - 6.25} = 2\\sqrt{9.75} \\approx 6.24$\n"
                "- Tọa độ 2 tiêu điểm: $F_1(-3.12, 0)$ và $F_2(3.12, 0)$\n"
                "- Tâm sai: $e = \\frac{c}{a} = \\frac{3.12}{4} = 0.78 < 1$\n\n"
                "**2. Diện tích hình Elip**\n"
                "$$S = \\pi \\cdot a \\cdot b = \\pi \\cdot 4 \\cdot 2.5 = 10\\pi \\approx 31.42$$\n\n"
                "*Em có thể kéo-thả tiêu điểm hoặc thanh trượt bán trục trên widget bên dưới! 🎯*\n\n"
                "```mathviz\n"
                '{"type": "mathviz.v1", "widget": "geometry_2d", "title": "Hình Elip $(E): \\\\frac{x^2}{16} + \\\\frac{y^2}{6.25} = 1$", "mode": "ellipse", "center": {"x": 0, "y": 0}, "a": 4, "b": 2.5}\n'
                "```"
            )
        elif "đa giác" in msg_low or "lục giác" in msg_low or "polygon" in msg_low:
            return (
                "## 🔍 Đa Giác Đều & Góc Trong\n\n"
                "**1. Tính chất đa giác đều $n = 6$ cạnh (Lục giác đều)**\n"
                "- Tổng các góc trong: $(n - 2) \\cdot 180^\\circ = 4 \\cdot 180^\\circ = 720^\\circ$\n"
                "- Mỗi góc trong: $\\alpha = \\frac{720^\\circ}{6} = 120^\\circ$\n"
                "- Diện tích đa giác đều bán kính $R = 3.5$:\n"
                "$$S = \\frac{1}{2} n R^2 \\sin\\left(\\frac{2\\pi}{n}\\right) = \\frac{1}{2} \\cdot 6 \\cdot 12.25 \\cdot \\sin(60^\\circ) = 36.75 \\cdot \\frac{\\sqrt{3}}{2} \\approx 31.83$$\n\n"
                "```mathviz\n"
                '{"type": "mathviz.v1", "widget": "geometry_2d", "title": "Lục giác đều $n=6, R=3.5$", "mode": "polygon", "center": {"x": 0, "y": 0}, "sides": 6, "radius": 3.5}\n'
                "```"
            )
        return (
            "## 🔍 Hình Học Phẳng & Vectơ\n\n"
            "**Hướng tiếp cận 1: Định lý Cosin & Sin (Trigonometric Laws)**\n"
            "Trong $\\triangle ABC$, ta có: $a^2 = b^2 + c^2 - 2bc\\cos A$ và $\\frac{a}{\\sin A} = 2R$.\n\n"
            "**Hướng tiếp cận 2: Tọa độ & Vectơ (Vector Geometry)**\n"
            "Trọng tâm $G = \\left(\\frac{x_A+x_B+x_C}{3}, \\frac{y_A+y_B+y_C}{3}\\right)$.\n\n"
            "*Em có thể kéo-thả các đỉnh của hình phẳng trên khung vẽ bên dưới! 📐*\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "geometry_2d", "title": "$\\\\triangle ABC$ và Trọng tâm $G$", "mode": "triangle", "points": [{"id": "A", "x": -3, "y": -2}, {"id": "B", "x": 3, "y": -2}, {"id": "C", "x": 0, "y": 3}], "measurements": {"show_side_lengths": true, "show_angles": true, "show_centroid_medians": true, "show_circumcircle": false}, "transform": {"kind": "rotate", "params": {"angle": 60}, "center": "centroid"}}\n'
            "```"
        )

    elif widget == "inequality_region":
        return (
            "## 🔍 Miền Nghiệm Hệ Bất Phương Trình Bậc Nhất 2 Ẩn\n\n"
            "**Hướng tiếp cận 1: Vẽ các đường thẳng biên (Boundary Lines)**\n"
            "Vẽ các đường thẳng $x + y = 4$, $x - y = -1$, $x = 0$, $y = 0$.\n\n"
            "**Hướng tiếp cận 2: Xác định nửa mặt phẳng nghiệm (Feasible Region)**\n"
            "Thử điểm gốc tọa độ $O(0, 0)$ để xác định miền nghiệm chung của hệ.\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "inequality_region", "title": "Miền nghiệm hệ bất phương trình", "inequalities": [{"expr": "x + y \\\\le 4", "color": "#39FF14"}, {"expr": "x - y \\\\ge -1", "color": "#00E5FF"}, {"expr": "x \\\\ge 0", "color": "#FFD400"}, {"expr": "y \\\\ge 0", "color": "#FF3CAC"}], "domain": {"x": [-2, 6], "y": [-2, 6]}, "highlight_feasible_region": true, "vertices_of_region": [[0, 0], [4, 0], [1.5, 2.5], [0, 4]]}\n'
            "```"
        )
    elif widget == "venn_sets":
        return (
            "## 🔍 Tập Hợp & Các Phép Toán Trên Tập Hợp\n\n"
            "**Giao của hai tập hợp**: $A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$.\n"
            "**Hợp của hai tập hợp**: $A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}$.\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "venn_sets", "title": "$A \\\\cap B$", "sets": [{"id": "A", "label": {"vi": "Tập A", "en": "Set A"}, "color": "#39FF14", "elements": [1, 2, 3, 4]}, {"id": "B", "label": {"vi": "Tập B", "en": "Set B"}, "color": "#00E5FF", "elements": [3, 4, 5, 6]}], "highlight_operation": "intersection"}\n'
            "```"
        )
    elif widget == "sequence_series":
        return (
            "## 🔍 Cấp Số Cộng & Cấp Số Nhân\n\n"
            "Số hạng tổng quát cấp số cộng: $u_n = u_1 + (n - 1)d$.\n"
            "Tổng $n$ số hạng đầu tiên: $S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n - 1)d]}{2}$.\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "sequence_series", "title": "Cấp số cộng $u_n = u_1 + (n-1)d$", "kind": "arithmetic", "params": {"u1": {"min": -10, "max": 10, "default": 2, "step": 1}, "d_or_q": {"min": -5, "max": 5, "default": 3, "step": 1}, "n_terms": {"min": 3, "max": 30, "default": 10, "step": 1}}, "show_partial_sum": true, "highlight_term": 5}\n'
            "```"
        )
    elif widget == "complex_plane":
        return (
            "## 🔍 Số Phức & Mặt Phẳng Phức\n\n"
            "Số phức $z = a + bi$ ($a, b \\in \\mathbb{R}$, $i^2 = -1$). Môđun: $|z| = \\sqrt{a^2 + b^2}$.\n"
            "Nhân số phức $z$ với $i$ tương đương với phép quay $90^\\circ$ quanh gốc tọa độ $O$.\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "complex_plane", "title": "$z = 3 + 4i,\\\\ |z| = 5$", "points": [{"re": 3, "im": 4, "label": {"vi": "z", "en": "z"}, "color": "#39FF14"}], "show_modulus_argument": true, "operation": {"kind": "multiply", "with": {"re": 0, "im": 1}}}\n'
            "```"
        )
    elif widget == "distribution":
        return (
            "## 🔍 Xác Suất & Phân Phối Nhị Thức $B(n, p)$\n\n"
            "Công thức xác suất Bernoulli: $P(X = k) = C_n^k p^k (1 - p)^{n - k}$.\n"
            "Kỳ vọng $E(X) = np$, phương sai $V(X) = np(1 - p)$.\n\n"
            "```mathviz\n"
            '{"type": "mathviz.v1", "widget": "distribution", "title": "Phân phối nhị thức $B(10,\\\\ 0.5)$", "kind": "binomial", "params": {"n": {"min": 1, "max": 40, "default": 10, "step": 1}, "p": {"min": 0, "max": 1, "default": 0.5, "step": 0.01}}, "highlight_k": 5}\n'
            "```"
        )

    return (
        "## 🔍 Hướng Dẫn Giải Toán Học DuoMCB\n\n"
        "**Bước 1: Phân tích giả thiết và mục tiêu**\n"
        "Xác định rõ các đại lượng đã cho và yêu cầu cần tìm.\n\n"
        "**Bước 2: Áp dụng công thức & định lý trọng tâm**\n"
        "Biến đổi phương trình từng bước theo quy tắc toán học.\n\n"
        "$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n\n"
        "**Bước 3: Kết luận**\n"
        "*Em hãy thử áp dụng vào bài toán cụ thể nhé! 😊*"
    )


def detect_widget(user_message: str, matched_node_ids: list | None = None) -> str | None:
    """Detect which mathviz widget to use for this message.
    Priority 1: graph node mapping (exact, fast).
    Priority 2: 3D solid keyword check (ensures 'hình chóp tứ giác' routes to geometry_3d rather than geometry_2d).
    Priority 3: other keyword scan on user message.
    Returns None if no widget detected — prompt will NOT include mathviz section.
    """
    # Priority 1: use graph-matched node IDs
    if matched_node_ids:
        for node_id in matched_node_ids:
            widget = GRAPHABLE_CONCEPT_IDS.get(node_id)
            if widget:
                return widget

    # Priority 2: keyword scan
    msg = user_message.lower()

    # Prioritize 3D solid keywords over 2D polygon keywords
    if any(kw in msg for kw in _WIDGET_KEYWORDS.get("geometry_3d", [])):
        return "geometry_3d"

    for widget, kws in _WIDGET_KEYWORDS.items():
        if widget == "geometry_3d":
            continue
        if any(kw in msg for kw in kws):
            return widget
    return None


# ── MathViz Visual Rules & Per-Widget Prompt Snippets ─────────────────────────
_VISUAL_RULES = (
    "\n\n## QUY TẮC TRỰC QUAN HÓA:\n"
    "- Nếu nội dung câu hỏi có hàm số/hình/số liệu CỤ THỂ để vẽ → kết thúc câu trả lời bằng "
    "ĐÚNG MỘT khối ```mathviz chứa JSON hợp lệ theo schema bên dưới.\n"
    "- Nếu câu hỏi thuần lý thuyết/định nghĩa, không có gì cụ thể để vẽ → KHÔNG thêm khối này.\n"
    "- Khối ```mathviz LUÔN là phần cuối cùng, không kèm lời dẫn, không xen giữa các đoạn giải thích.\n"
    "- Điền toàn bộ số liệu (default, points, dims, params...) khớp ĐÚNG với dữ liệu thật trong đề "
    "bài — TUYỆT ĐỐI không bịa số liệu mẫu khác với đề.\n"
    "- Bám sát đúng tên khóa (key) trong schema, không tự ý đổi tên hay thêm khóa lạ.\n"
)

_WIDGET_PROMPT_SNIPPETS: dict[str, str] = {

"function_plot": '''
## SCHEMA cho widget "function_plot":
{"type":"mathviz.v1","widget":"function_plot","title":"$...$","expr":"a*x^2+b*x+c",
 "params":{"a":{"min":...,"max":...,"default":...,"step":...},"b":{...},"c":{...}},
 "overlays":[{"kind":"tangent_at","x0":...}|{"kind":"shade_area","from":...,"to":...}|{"kind":"extrema"}|{"kind":"asymptote","x":...}],
 "x_domain":[min,max]}
Ví dụ: {"type":"mathviz.v1","widget":"function_plot","title":"$y=x^2-4x+3$",
 "expr":"a*x^2+b*x+c","params":{"a":{"min":-3,"max":3,"default":1,"step":0.1},
 "b":{"min":-6,"max":6,"default":-4,"step":0.1},"c":{"min":-6,"max":6,"default":3,"step":0.1}},
 "overlays":[{"kind":"extrema"}],"x_domain":[-2,6]}
''',

"unit_circle_wave": '''
## SCHEMA cho widget "unit_circle_wave":
{"type":"mathviz.v1","widget":"unit_circle_wave","title":"$...$",
 "function":{"preset":"sin(x)"|"cos(x)"|"custom","custom_expr":null},
 "params":{"amplitude":{...},"frequency":{...},"phase":{...},"vertical_shift":{...},"x_range":{...},"speed":{...}},
 "radius_expr":"1","display":{"show_sine_line":true,"show_cosine_line":true,"graph_color":"#e6533c"}}
Ví dụ: {"type":"mathviz.v1","widget":"unit_circle_wave","title":"$y=2\\\\sin(3x-\\\\pi/4)$",
 "function":{"preset":"sin(x)","custom_expr":null},
 "params":{"amplitude":{"min":0,"max":3,"default":2,"step":0.1},
 "frequency":{"min":0.1,"max":5,"default":3,"step":0.05},
 "phase":{"min":-3.14,"max":3.14,"default":-0.7854,"step":0.01},
 "vertical_shift":{"min":-3,"max":3,"default":0,"step":0.1},
 "x_range":{"min":1,"max":4,"default":2,"step":1},"speed":{"min":0,"max":3,"default":1,"step":0.1}},
 "radius_expr":"1","display":{"show_sine_line":true,"show_cosine_line":true,"graph_color":"#e6533c"}}
''',

"geometry_2d": '''
## SCHEMA cho widget "geometry_2d":
1. Cấu hình nhiều lớp chồng nhau (Được KHUYÊN DÙNG cho hình học phẳng Olympiad/hình vẽ phức tạp có đường tròn + tam giác + đường thẳng + điểm):
{"type":"mathviz.v1","widget":"geometry_2d","title":"$...$",
 "layers":[
   {"kind":"circle","center":{"x":0,"y":0},"r":3.5,"label":"(O)","color":"#3b82f6"},
   {"kind":"polygon","points":[{"id":"A","x":0,"y":3.5},{"id":"B","x":-3.03,"y":-1.75},{"id":"C","x":3.03,"y":-1.75}],"color":"#39FF14"},
   {"kind":"line","from":{"x":0,"y":3.5},"to":{"x":0,"y":-1.75},"label":"AH","style":"dashed","color":"#f43f5e"},
   {"kind":"line","from":{"x":-4.5,"y":-4},"to":{"x":3.03,"y":-1.75},"label":"BC","color":"#94a3b8"},
   {"kind":"points","data":[{"id":"H","x":0,"y":-1.75},{"id":"O","x":0,"y":0},{"id":"E","x":1.5,"y":0.8},{"id":"T","x":0,"y":-4.5}]}
 ]}

2. Cấu hình đơn hình (Tam giác, tứ giác, elip, đa giác đều):
{"type":"mathviz.v1","widget":"geometry_2d","title":"$...$",
 "mode":"triangle"|"quadrilateral"|"circle"|"ellipse"|"polygon",
 "points":[{"id":"A","x":...,"y":...},...], // bắt buộc khi mode là triangle, quadrilateral
 "measurements":{"show_side_lengths":true,"show_angles":true,"show_centroid_medians":false,"show_orthocenter":false,"show_circumcircle":false,"show_incenter":false,"show_excenters":false}}
Ví dụ Tam giác & 4 Tâm (Trọng tâm G, Trực tâm H, Tâm ngoại tiếp O, Tâm nội tiếp I):
{"type":"mathviz.v1","widget":"geometry_2d","title":"$\\\\triangle ABC$ và Các Tâm Hình Học",
 "mode":"triangle","points":[{"id":"A","x":-3,"y":-2},{"id":"B","x":3,"y":-2},{"id":"C","x":0,"y":3}],
 "measurements":{"show_side_lengths":true,"show_angles":true,"show_centroid_medians":true,"show_orthocenter":true,"show_circumcircle":true,"show_incenter":true}}

3. QUAN TRỌNG với hình phức tạp nhiều điểm dựng hình (>=6 điểm, ví dụ trực tâm, chân đường cao, tâm nội/ngoại tiếp, giao điểm, trung điểm, điểm đối xứng...): KHÔNG tự đoán tọa độ chính xác cho các điểm này (rất dễ sai/lệch khiến hình bị chồng chéo, điểm văng ra ngoài). Thay vào đó, LUÔN cho x,y ước lượng bình thường trong "layers" NHƯNG THÊM mảng "constructions" khai báo quan hệ dựng hình — hệ thống sẽ tự tính lại tọa độ CHÍNH XÁC bằng công thức giải tích, đè lên giá trị ước lượng, cho BẤT KỲ tên điểm hay số lượng điểm nào (không giới hạn ở A,B,C,H,O,D,E,F,I,P,K,Q,G):
{"type":"mathviz.v1","widget":"geometry_2d","title":"$...$",
 "layers":[...điểm/đường/tròn với x,y ước lượng như bình thường...],
 "constructions":[
   {"point":"H","type":"orthocenter","of":["A","B","C"]},
   {"point":"D","type":"foot","of":["A","B","C"]},
   {"point":"O","type":"circumcenter","of":["A","B","C"]},
   {"point":"I","type":"incenter","of":["A","B","C"]},
   {"point":"G","type":"centroid","of":["A","B","C"]},
   {"point":"M","type":"midpoint","of":["A","H"]},
   {"point":"K","type":"intersection","of":["E","F","B","C"]},
   {"point":"N","type":"reflection","of":["A","B","C"]},
   {"point":"Q","type":"ratio_point","of":["K","E"],"ratio":1.35}
 ]}
Quy tắc "of" theo từng "type": orthocenter/circumcenter/incenter/centroid → [3 đỉnh tam giác]; foot/reflection → [điểm cần chiếu, điểm1_của_đường, điểm2_của_đường]; midpoint/ratio_point → [điểm đầu, điểm cuối] (ratio_point cần thêm khóa "ratio", vd 0.5=trung điểm, >1=kéo dài quá điểm cuối); intersection → [điểm1_đường1, điểm2_đường1, điểm1_đường2, điểm2_đường2] (giao 2 đường thẳng). "of" có thể tham chiếu một điểm KHÁC cũng đang được dựng trong "constructions" (ví dụ M ở trên dùng H) — hệ thống tự giải theo đúng thứ tự phụ thuộc.
''',


"geometry_3d": '''
## SCHEMA cho widget "geometry_3d":
{"type":"mathviz.v1","widget":"geometry_3d","title":"$...$",
 "solid":"cuboid"|"square_pyramid"|"triangular_pyramid"|"triangular_prism"|"cone"|"cylinder"|"regular_polygon"|"sphere"|"ellipsoid"|"frustum"|"mobius_strip"|"klein_bottle"|"torus"|"tesseract_4d"|"boys_surface"|"cross_cap"|"trefoil_knot",
 "dims":{...chỉ các khóa liên quan: a,b,h cho cuboid / a,h cho square_pyramid,triangular_pyramid,triangular_prism / r,h cho cone,cylinder / r cho sphere / a,b,c cho ellipsoid / r1,r2,h cho frustum / r,h,n cho regular_polygon / w cho mobius_strip / r cho torus,klein_bottle,trefoil_knot / angle_4d cho tesseract_4d},
 "show_cross_section":false,"cross_section_height":0}
Ví dụ: {"type":"mathviz.v1","widget":"geometry_3d","title":"Hình chóp tứ giác đều $S.ABCD$, đáy $a=4$, cao $h=6$",
 "solid":"square_pyramid","dims":{"a":4,"h":6},"show_cross_section":true,"cross_section_height":2}
Ví dụ Bình Klein 3D: {"type":"mathviz.v1","widget":"geometry_3d","title":"Mặt topology Bình Klein 3D (Klein Bottle)",
 "solid":"klein_bottle","dims":{"r":2}}
Ví dụ Siêu Lập Phương 4D (Tesseract): {"type":"mathviz.v1","widget":"geometry_3d","title":"Siêu lập phương 4D (Tesseract / Hypercube)",
 "solid":"tesseract_4d","dims":{"r":2,"angle_4d":0}}
Ví dụ Mặt Boy (Boy's Surface): {"type":"mathviz.v1","widget":"geometry_3d","title":"Mặt Boy (Boy's Surface - Kỳ quan Topology)",
 "solid":"boys_surface","dims":{"r":2}}
Ví dụ Nút Trefoil: {"type":"mathviz.v1","widget":"geometry_3d","title":"Nút Trefoil Knot 3D",
 "solid":"trefoil_knot","dims":{"r":2}}
Ví dụ Dải Möbius 3D: {"type":"mathviz.v1","widget":"geometry_3d","title":"Dải Möbius 3D",
 "solid":"mobius_strip","dims":{"w":1.5}}
''',

"inequality_region": '''
## SCHEMA cho widget "inequality_region":
{"type":"mathviz.v1","widget":"inequality_region","title":"$...$",
 "inequalities":[{"expr":"x + y \\\\le 4","color":"#hex"},...],
 "domain":{"x":[min,max],"y":[min,max]},"highlight_feasible_region":true,
 "vertices_of_region":[[x1,y1],[x2,y2],...]}
Ví dụ: {"type":"mathviz.v1","widget":"inequality_region","title":"Miền nghiệm hệ bất phương trình",
 "inequalities":[{"expr":"x + y \\\\le 4","color":"#39FF14"},{"expr":"x - y \\\\ge -1","color":"#00E5FF"},
 {"expr":"x \\\\ge 0","color":"#FFD400"},{"expr":"y \\\\ge 0","color":"#FF3CAC"}],
 "domain":{"x":[-2,6],"y":[-2,6]},"highlight_feasible_region":true,
 "vertices_of_region":[[0,0],[4,0],[1.5,2.5],[0,4]]}
''',

"venn_sets": '''
## SCHEMA cho widget "venn_sets":
{"type":"mathviz.v1","widget":"venn_sets","title":"$...$",
 "sets":[{"id":"A","label":{"vi":"...","en":"..."},"color":"#hex","elements":[...]}, ...(2-3 tập)],
 "highlight_operation":"intersection"|"union"|"difference"|"complement"|"none"}
Ví dụ: {"type":"mathviz.v1","widget":"venn_sets","title":"$A \\\\cap B$",
 "sets":[{"id":"A","label":{"vi":"Tập A","en":"Set A"},"color":"#39FF14","elements":[1,2,3,4]},
 {"id":"B","label":{"vi":"Tập B","en":"Set B"},"color":"#00E5FF","elements":[3,4,5,6]}],
 "highlight_operation":"intersection"}
''',

"sequence_series": '''
## SCHEMA cho widget "sequence_series":
{"type":"mathviz.v1","widget":"sequence_series","title":"$...$","kind":"arithmetic"|"geometric",
 "params":{"u1":{...},"d_or_q":{...},"n_terms":{...}},"show_partial_sum":true,"highlight_term":null}
Ví dụ: {"type":"mathviz.v1","widget":"sequence_series","title":"Cấp số cộng $u_n=u_1+(n-1)d$",
 "kind":"arithmetic","params":{"u1":{"min":-10,"max":10,"default":2,"step":1},
 "d_or_q":{"min":-5,"max":5,"default":3,"step":1},"n_terms":{"min":3,"max":30,"default":10,"step":1}},
 "show_partial_sum":true,"highlight_term":5}
''',

"complex_plane": '''
## SCHEMA cho widget "complex_plane":
{"type":"mathviz.v1","widget":"complex_plane","title":"$...$",
 "points":[{"re":...,"im":...,"label":{"vi":"...","en":"..."},"color":"#hex"},...],
 "show_modulus_argument":true,"operation":{"kind":"add"|"multiply"|"conjugate","with":{"re":...,"im":...}}}
Ví dụ: {"type":"mathviz.v1","widget":"complex_plane","title":"$z=3+4i,\\\\ |z|=5$",
 "points":[{"re":3,"im":4,"label":{"vi":"z","en":"z"},"color":"#39FF14"}],
 "show_modulus_argument":true,"operation":{"kind":"multiply","with":{"re":0,"im":1}}}
''',

"distribution": '''
## SCHEMA cho widget "distribution":
{"type":"mathviz.v1","widget":"distribution","title":"$...$","kind":"binomial"|"normal"|"uniform"|"histogram",
 "params":{...tùy kind: n,p cho binomial / mean,stddev cho normal},"highlight_k":null}
Ví dụ: {"type":"mathviz.v1","widget":"distribution","title":"Phân phối nhị thức $B(10,\\\\ 0.5)$",
 "kind":"binomial","params":{"n":{"min":1,"max":40,"default":10,"step":1},
 "p":{"min":0,"max":1,"default":0.5,"step":0.01}},"highlight_k":5}
''',
}

# ── Dynamic Few-Shot Golden Calibration Demonstrations ────────────────────────
_WIDGET_FEW_SHOT_DEMOS: dict[str, str] = {
    "geometry_2d": '''
[HỌC SINH]: Cho tam giác $ABC$ vuông tại $A$, $AB = 3$, $AC = 4$. Dựng đường cao $AH$ và đường tròn ngoại tiếp tam giác.
[DUOMCB]:
Chào bạn! Dưới đây là phân tích hình học và mô hình tương tác trực quan:

**1. Phân tích cấu hình & Tọa độ giải tích:**
- Tam giác $ABC$ vuông tại $A(0, 3)$, đặt chân đường vuông góc trên trục tọa độ với $B(-4, 0)$ và $C(0, 0)$ hoặc chuẩn hóa tâm ngoại tiếp $O$ tại trung điểm cạnh huyền $BC$.
- Độ dài cạnh huyền $BC = \\sqrt{AB^2 + AC^2} = \\sqrt{3^2 + 4^2} = 5$.
- Đường cao $AH = \\frac{AB \\cdot AC}{BC} = \\frac{3 \\cdot 4}{5} = 2.4$.
- Tâm đường tròn ngoại tiếp $O$ là trung điểm cạnh huyền $BC$, bán kính $R = 2.5$.

**2. Mô hình trực quan tương tác (Canvas):**
Bạn có thể kéo thả các đỉnh trên hình để quan sát đường cao và đường tròn ngoại tiếp:

```mathviz
{
  "type": "mathviz.v1",
  "widget": "geometry_2d",
  "title": "$\\\\triangle ABC$ vuông tại $A$ và Đường cao $AH$",
  "layers": [
    {"kind": "circle", "center": {"x": 0, "y": 0}, "r": 2.5, "label": "(O)", "color": "#3b82f6"},
    {"kind": "polygon", "points": [{"id": "A", "x": 0.7, "y": 2.4}, {"id": "B", "x": -2.5, "y": 0}, {"id": "C", "x": 2.5, "y": 0}], "color": "#10b981"},
    {"kind": "line", "from": {"x": 0.7, "y": 2.4}, "to": {"x": 0.7, "y": 0}, "label": "AH", "style": "dashed", "color": "#ef4444"},
    {"kind": "points", "data": [{"id": "A", "x": 0.7, "y": 2.4}, {"id": "B", "x": -2.5, "y": 0}, {"id": "C", "x": 2.5, "y": 0}, {"id": "H", "x": 0.7, "y": 0}, {"id": "O", "x": 0, "y": 0}]}
  ]
}
```
''',

    "geometry_3d": '''
[HỌC SINH]: Cho hình chóp tam giác đều $S.ABC$ có cạnh đáy bằng $4$, chiều cao $h = 6$. Hãy mô hình hóa không gian.
[DUOMCB]:
Chào bạn! Dưới đây là mô hình không gian 3D tương tác của khối chóp tam giác đều:

**1. Đặc điểm hình học:**
- Đáy $ABC$ là tam giác đều cạnh $a = 4$.
- Đỉnh $S$ nằm trên trục đối xứng vuông góc với tâm đáy, chiều cao $h = 6$.

**2. Mô hình 3D tương tác:**
Bạn có thể xoay khối chóp 360° trên canvas Three.js để quan sát mọi góc nhìn:

```mathviz
{
  "type": "mathviz.v1",
  "widget": "geometry_3d",
  "title": "Hình chóp tam giác đều $S.ABC$ ($a=4, h=6$)",
  "solid": "triangular_pyramid",
  "dims": {"a": 4, "h": 6},
  "show_cross_section": false,
  "cross_section_height": 0
}
```
''',

    "function_plot": '''
[HỌC SINH]: Khảo sát sự biến thiên và vẽ đồ thị hàm số bậc ba $y = x^3 - 3x + 1$.
[DUOMCB]:
Chào bạn! Dưới đây là các bước khảo sát và đồ thị hàm số bậc ba:

**1. Khảo sát hàm số:**
- Tập xác định: $D = \\mathbb{R}$.
- Đạo hàm: $y' = 3x^2 - 3 = 3(x^2 - 1) = 0 \\Leftrightarrow x = \\pm 1$.
- Điểm cực đại: $A(-1, 3)$, Điểm cực tiểu: $B(1, -1)$.
- Đồ thị cắt trục tung tại $(0, 1)$.

**2. Đồ thị hàm số tương tác:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "function_plot",
  "title": "Đồ thị hàm số $y = x^3 - 3x + 1$",
  "expr": "x^3 - 3*x + 1",
  "params": {"a": {"min": -2, "max": 2, "default": 1, "step": 0.1}},
  "overlays": [
    {"kind": "extrema"},
    {"kind": "tangent_at", "x0": 0}
  ],
  "x_domain": [-3, 3]
}
```
''',

    "unit_circle_wave": '''
[HỌC SINH]: Vẽ vòng tròn lượng giác và đồ thị hàm số sóng $y = 2\\sin(3x)$.
[DUOMCB]:
Chào bạn! Dưới đây là mô hình liên hệ giữa chuyển động tròn lượng giác và sóng hình sin:

**1. Phân tích hàm số sóng:**
- Biên độ $A = 2$.
- Tần số góc $\\omega = 3$, chu kỳ $T = \\frac{2\\pi}{3}$.

**2. Mô hình sóng lượng giác:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "unit_circle_wave",
  "title": "Vòng tròn lượng giác & Đồ thị sóng $y = 2\\\\sin(3x)$",
  "function": {"preset": "sin(x)", "custom_expr": null},
  "params": {
    "amplitude": {"min": 0, "max": 4, "default": 2, "step": 0.1},
    "frequency": {"min": 0.1, "max": 5, "default": 3, "step": 0.1},
    "phase": {"min": -3.14, "max": 3.14, "default": 0, "step": 0.01},
    "vertical_shift": {"min": -3, "max": 3, "default": 0, "step": 0.1},
    "x_range": {"min": 1, "max": 4, "default": 2, "step": 1},
    "speed": {"min": 0, "max": 3, "default": 1, "step": 0.1}
  },
  "radius_expr": "1",
  "display": {"show_sine_line": true, "show_cosine_line": true, "graph_color": "#3b82f6"}
}
```
''',

    "inequality_region": '''
[HỌC SINH]: Biểu diễn miền nghiệm của hệ bất phương trình: $x + y \\le 4$, $x - y \\ge -1$, $x \\ge 0$, $y \\ge 0$.
[DUOMCB]:
Chào bạn! Dưới đây là miền nghiệm đa giác của hệ bất phương trình bậc nhất hai ẩn:

**1. Xác định các đường biên và đỉnh miền nghiệm:**
- Các đỉnh của miền tứ giác nghiệm: $O(0, 0)$, $A(4, 0)$, $B(1.5, 2.5)$, $C(0, 1)$.

**2. Miền nghiệm tương tác:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "inequality_region",
  "title": "Miền nghiệm hệ bất phương trình bậc nhất hai ẩn",
  "inequalities": [
    {"expr": "x + y <= 4", "color": "#10b981"},
    {"expr": "x - y >= -1", "color": "#3b82f6"},
    {"expr": "x >= 0", "color": "#f59e0b"},
    {"expr": "y >= 0", "color": "#ec4899"}
  ],
  "domain": {"x": [-1, 5], "y": [-1, 5]},
  "highlight_feasible_region": true,
  "vertices_of_region": [[0, 0], [4, 0], [1.5, 2.5], [0, 1]]
}
```
''',

    "venn_sets": '''
[HỌC SINH]: Cho tập $A = \\{1, 2, 3, 4\\}$ và tập $B = \\{3, 4, 5, 6\\}$. Minh họa biểu đồ Ven phần giao $A \\cap B$.
[DUOMCB]:
Chào bạn! Dưới đây là sơ đồ Ven trực quan:

**1. Phép toán tập hợp:**
- Giao của hai tập hợp: $A \\cap B = \\{3, 4\\}$.

**2. Biểu đồ Ven tương tác:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "venn_sets",
  "title": "Giao của hai tập hợp $A \\\\cap B = \\\\{3, 4\\\\}$",
  "sets": [
    {"id": "A", "label": {"vi": "Tập A", "en": "Set A"}, "color": "#10b981", "elements": [1, 2, 3, 4]},
    {"id": "B", "label": {"vi": "Tập B", "en": "Set B"}, "color": "#3b82f6", "elements": [3, 4, 5, 6]}
  ],
  "highlight_operation": "intersection"
}
```
''',

    "sequence_series": '''
[HỌC SINH]: Tìm số hạng thứ 10 và tổng 10 số hạng đầu của cấp số cộng với $u_1 = 2$, công sai $d = 3$.
[DUOMCB]:
Chào bạn! Dưới đây là công thức và bảng trực quan hóa dãy số:

**1. Tính toán lý thuyết:**
- Số hạng tổng quát: $u_n = u_1 + (n-1)d = 2 + (n-1)3$.
- Với $n = 10$: $u_{10} = 2 + 9 \\times 3 = 29$.
- Tổng $S_{10} = \\frac{10(u_1 + u_{10})}{2} = \\frac{10(2 + 29)}{2} = 155$.

**2. Mô hình trực quan dãy số:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "sequence_series",
  "title": "Cấp số cộng $u_n = 2 + 3(n-1)$",
  "kind": "arithmetic",
  "params": {
    "u1": {"min": -10, "max": 10, "default": 2, "step": 1},
    "d_or_q": {"min": -5, "max": 5, "default": 3, "step": 1},
    "n_terms": {"min": 3, "max": 30, "default": 10, "step": 1}
  },
  "show_partial_sum": true,
  "highlight_term": 10
}
```
''',

    "complex_plane": '''
[HỌC SINH]: Cho số phức $z = 3 + 4i$. Tính môđun của $z$ và biểu diễn trên mặt phẳng toạ độ phức.
[DUOMCB]:
Chào bạn! Dưới đây là biểu diễn hình học của số phức:

**1. Phân tích số phức:**
- Phần thực: $a = 3$, Phần ảo: $b = 4$.
- Môđun: $|z| = \\sqrt{3^2 + 4^2} = 5$.
- Số phức liên hợp: $\\bar{z} = 3 - 4i$.

**2. Mặt phẳng phức tương tác:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "complex_plane",
  "title": "Số phức $z = 3 + 4i$, $|z| = 5$",
  "points": [
    {"re": 3, "im": 4, "label": {"vi": "z (3+4i)", "en": "z"}, "color": "#10b981"}
  ],
  "show_modulus_argument": true,
  "operation": {"kind": "conjugate", "with": {"re": 3, "im": -4}}
}
```
''',

    "distribution": '''
[HỌC SINH]: Tính xác suất trong phân phối nhị thức $B(10, 0.5)$ và vẽ biểu đồ phân phối xác suất.
[DUOMCB]:
Chào bạn! Dưới đây là phân tích phân phối nhị thức:

**1. Công thức xác suất:**
- Công thức: $P(X = k) = C_{10}^k (0.5)^k (0.5)^{10-k}$.
- Kỳ vọng: $E(X) = n \\cdot p = 5$.

**2. Biểu đồ phân phối xác suất:**

```mathviz
{
  "type": "mathviz.v1",
  "widget": "distribution",
  "title": "Phân phối nhị thức $B(10, 0.5)$",
  "kind": "binomial",
  "params": {
    "n": {"min": 1, "max": 30, "default": 10, "step": 1},
    "p": {"min": 0, "max": 1, "default": 0.5, "step": 0.01}
  },
  "highlight_k": 5
}
```
'''
}


# ── MathViz Validation & Retry Helpers ───────────────────────────────────────
import re as _re_mathviz

_MATHVIZ_EXPR_RE = _re_mathviz.compile(r'^[0-9a-zA-Z\s\.\+\-\*\/\^\(\),πθ]*$')

# Risk 2 mitigation: best-effort JSON repair for near-valid mathviz blocks
# (trailing commas, unescaped quotes, truncated output). Defensive import —
# mirrors the _CV2_AVAILABLE / _TORCH_AVAILABLE pattern already used in
# video_enhancer.py — so a not-yet-deployed dependency degrades to the old
# behavior (drop the block) instead of crashing the whole endpoint.
try:
    from json_repair import repair_json as _repair_json
    _JSON_REPAIR_AVAILABLE = True
except ImportError:
    _JSON_REPAIR_AVAILABLE = False

_VALID_3D_SOLIDS = {
    "cuboid", "square_pyramid", "triangular_pyramid", "triangular_prism",
    "cone", "cylinder", "regular_polygon", "sphere", "ellipsoid", "frustum",
    "mobius_strip", "klein_bottle", "torus",
    "tesseract_4d", "boys_surface", "cross_cap", "trefoil_knot"
}
_VALID_2D_MODES = {"triangle", "quadrilateral", "circle", "ellipse", "polygon", "composite"}

_REQUIRED_KEYS: dict[str, set] = {
    "function_plot":     {"expr", "params"},
    "unit_circle_wave":  {"function", "params"},
    "geometry_2d":       {"mode"},
    "geometry_3d":       {"solid", "dims"},
    "inequality_region": {"inequalities", "domain"},
    "venn_sets":         {"sets"},
    "sequence_series":   {"kind", "params"},
    "complex_plane":     {"points"},
    "distribution":      {"kind", "params"},
}

def validate_mathviz(widget: str, data: dict) -> list[str]:
    """Returns a list of error strings (empty = valid)."""
    errors: list[str] = []
    if data.get("type") != "mathviz.v1":
        errors.append("thiếu hoặc sai 'type': phải là 'mathviz.v1'")
    if data.get("widget") != widget:
        errors.append(f"'widget' phải đúng bằng '{widget}'")
    
    # For geometry_2d, if layers is present, mode is optional
    if widget == "geometry_2d" and ("layers" in data or data.get("mode") == "composite"):
        pass
    else:
        missing = _REQUIRED_KEYS.get(widget, set()) - data.keys()
        if missing:
            errors.append(f"thiếu khóa bắt buộc: {sorted(missing)}")
            
    if widget == "geometry_3d" and data.get("solid") not in _VALID_3D_SOLIDS:
        errors.append(f"giá trị 'solid' không hợp lệ: '{data.get('solid')}'. Phải thuộc {_VALID_3D_SOLIDS}")
    if widget == "geometry_2d" and "mode" in data and data.get("mode") not in _VALID_2D_MODES:
        errors.append(f"giá trị 'mode' không hợp lệ: '{data.get('mode')}'. Phải thuộc {_VALID_2D_MODES}")

    return errors



def _extract_mathviz_block(raw: str) -> tuple[str, dict | None]:
    """
    Split raw LLM response into (text_part, mathviz_dict | None).

    Risk 2 mitigation: previously, any JSON error inside the fenced block
    (trailing comma, unescaped quote, a truncated response cut off mid-
    object) silently discarded the ENTIRE widget — the reply would fall
    back to plain text with no visual, with no attempt to fix it. Now a
    parse failure first tries json_repair before giving up, so a nearly-
    valid block still renders instead of vanishing.
    """
    import json as _json
    match = _re_mathviz.search(r'```mathviz\s*\n?([\s\S]*?)```', raw)
    if not match:
        return raw, None
    text = raw[:match.start()].rstrip() + raw[match.end():].lstrip()
    fenced = match.group(1).strip()
    try:
        data = _json.loads(fenced)
        return text, data
    except Exception:
        pass
    if _JSON_REPAIR_AVAILABLE:
        try:
            repaired = _repair_json(fenced, return_objects=True)
            if isinstance(repaired, str):
                repaired = _json.loads(repaired)
            if isinstance(repaired, dict) and repaired:
                logger.info("[MathViz] json_repair fixed a malformed mathviz block.")
                return text, repaired
        except Exception as e_repair:
            logger.debug(f"[MathViz] json_repair could not fix the block: {e_repair}")
    return raw, None


async def _repair_mathviz_with_free_openrouter(widget: str, broken_json: str, errors: list[str]) -> dict | None:
    """
    Risk 2 escalation tier: called only when the same-model Gemini retry in
    chat() still didn't produce a schema-valid mathviz block. Asks a FREE
    OpenRouter model for ONLY the corrected JSON object — a narrow repair
    task, not a full solution regeneration, so it stays cheap (low
    max_tokens, temperature=0) and works even if Gemini itself is the one
    that's rate-limited. Returns the corrected dict, or None if this tier
    also fails (caller keeps the original _viz_block and simply sends the
    reply without a visual, same graceful degradation as before this patch).
    """
    openrouter_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not openrouter_key:
        return None
    repair_model = os.environ.get("OPENROUTER_VISION_MODEL", "minimax/minimax-m3:free")
    prompt = (
        f"Sua loi JSON sau cho khoi mathviz widget '{widget}'. "
        f"Loi: {'; '.join(errors)}. "
        f"CHI tra ve dung 1 object JSON hop le, khong them chu, khong markdown fences.\n\n"
        f"JSON goc:\n{broken_json}"
    )
    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "HTTP-Referer": "https://duomath.local",
        "X-Title": "DuoMath MathViz Repair",
        "Content-Type": "application/json",
    }
    or_payload = {
        "model": repair_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": 1500,
    }
    raw = ""
    try:
        client = await get_http_client()
        resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=or_payload, timeout=30)
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"].strip()
        cleaned = _re_mathviz.sub(r'^```[a-zA-Z]*\n?|```\s*$', '', raw).strip()
        data = json.loads(cleaned)
        if not validate_mathviz(widget, data):
            logger.info(f"[MathViz] Free OpenRouter repair tier fixed widget '{widget}'.")
            return data
    except Exception as e:
        logger.debug(f"[MathViz] Free OpenRouter repair tier failed on first parse: {e}")
        if raw and _JSON_REPAIR_AVAILABLE:
            try:
                repaired = _repair_json(raw, return_objects=True)
                if isinstance(repaired, str):
                    repaired = json.loads(repaired)
                if isinstance(repaired, dict) and not validate_mathviz(widget, repaired):
                    logger.info(f"[MathViz] Free OpenRouter repair tier fixed widget '{widget}' via json_repair.")
                    return repaired
            except Exception as e2:
                logger.debug(f"[MathViz] json_repair also failed on the repair-tier response: {e2}")
    return None


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
        # ── AI Test Studio tables ──
        ("""CREATE TABLE IF NOT EXISTS ai_materials (
            id          TEXT PRIMARY KEY,
            session_id  TEXT NOT NULL DEFAULT '',
            filename    TEXT DEFAULT '',
            text_content TEXT DEFAULT '',
            mime_type   TEXT DEFAULT '',
            analysis    TEXT DEFAULT '{}',
            created_at  TEXT DEFAULT (datetime('now'))
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS ai_tests (
            id          TEXT PRIMARY KEY,
            material_id TEXT NOT NULL,
            title       TEXT DEFAULT '',
            questions   TEXT DEFAULT '[]',
            status      TEXT DEFAULT 'ready',
            created_at  TEXT DEFAULT (datetime('now'))
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS ai_attempts (
            id              TEXT PRIMARY KEY,
            test_id         TEXT NOT NULL,
            status          TEXT DEFAULT 'in_progress',
            total_score     REAL DEFAULT 0,
            max_score       REAL DEFAULT 0,
            review          TEXT DEFAULT '',
            created_at      TEXT DEFAULT (datetime('now')),
            completed_at    TEXT DEFAULT ''
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS ai_qa (
            id              TEXT PRIMARY KEY,
            attempt_id      TEXT NOT NULL,
            q_idx           INTEGER NOT NULL,
            served_at       TEXT NOT NULL,
            deadline_at     TEXT NOT NULL,
            submitted_at    TEXT DEFAULT '',
            answer_type     TEXT DEFAULT 'typed',
            answer_text     TEXT DEFAULT '',
            answer_b64      TEXT DEFAULT '',
            grading         TEXT DEFAULT '{}'
        )""", None),
        # ── MathMap Comments & Moderation ──
        ("""CREATE TABLE IF NOT EXISTS mathmap_comments (
            id                TEXT PRIMARY KEY,
            mathmap_id        TEXT NOT NULL,
            user_id           TEXT NOT NULL,
            author            TEXT NOT NULL,
            rank              TEXT DEFAULT 'A',
            parent_comment_id TEXT,
            body              TEXT NOT NULL,
            created_at        TEXT NOT NULL,
            upvotes           INTEGER DEFAULT 0,
            report_count      INTEGER DEFAULT 0,
            status            TEXT DEFAULT 'visible'
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS comment_upvotes (
            user_id    TEXT NOT NULL,
            comment_id TEXT NOT NULL,
            PRIMARY KEY (user_id, comment_id)
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS comment_reports (
            id          TEXT PRIMARY KEY,
            comment_id  TEXT NOT NULL,
            reporter_id TEXT NOT NULL,
            reason      TEXT NOT NULL,
            detail      TEXT DEFAULT '',
            created_at  TEXT NOT NULL
        )""", None),
        # ── Math Clans & Clan Battles ──
        ("""CREATE TABLE IF NOT EXISTS clans (
            id             TEXT PRIMARY KEY,
            name           TEXT NOT NULL UNIQUE,
            tag            TEXT NOT NULL,
            description    TEXT DEFAULT '',
            crest_gradient TEXT DEFAULT 'linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)',
            avatar_url     TEXT DEFAULT '',
            banner_url     TEXT DEFAULT '',
            privacy        TEXT DEFAULT 'open',
            level          INTEGER DEFAULT 1,
            current_xp     INTEGER DEFAULT 0,
            xp_to_next     INTEGER DEFAULT 1000,
            total_xp       INTEGER DEFAULT 0,
            wins           INTEGER DEFAULT 0,
            losses         INTEGER DEFAULT 0,
            created_at     TEXT NOT NULL,
            owner_user_id  TEXT NOT NULL
        )""", None),
        ("ALTER TABLE clans ADD COLUMN avatar_url TEXT DEFAULT ''", None),
        ("ALTER TABLE clans ADD COLUMN banner_url TEXT DEFAULT ''", None),
        ("""CREATE TABLE IF NOT EXISTS clan_members (
            clan_id        TEXT NOT NULL,
            user_id        TEXT NOT NULL,
            username       TEXT NOT NULL,
            role           TEXT DEFAULT 'member',
            rank           TEXT DEFAULT 'A',
            xp_contributed INTEGER DEFAULT 0,
            joined_at      TEXT NOT NULL,
            PRIMARY KEY (clan_id, user_id)
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS clan_battles (
            id             TEXT PRIMARY KEY,
            clan_a_id      TEXT NOT NULL,
            clan_b_id      TEXT NOT NULL,
            battle_type    TEXT NOT NULL DEFAULT 'realtime',
            status         TEXT DEFAULT 'active',
            clan_a_score   INTEGER DEFAULT 0,
            clan_b_score   INTEGER DEFAULT 0,
            winner_clan_id TEXT,
            starts_at      TEXT,
            ends_at        TEXT,
            created_at     TEXT NOT NULL
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS clan_messages (
            id         TEXT PRIMARY KEY,
            clan_id    TEXT NOT NULL,
            user_id    TEXT NOT NULL,
            username   TEXT NOT NULL,
            avatar_url TEXT DEFAULT '',
            role       TEXT DEFAULT 'member',
            message    TEXT NOT NULL,
            created_at TEXT NOT NULL
        )""", None),
        # ── Tournaments, Events & Changelog ──
        ("""CREATE TABLE IF NOT EXISTS tournaments (
            id               TEXT PRIMARY KEY,
            title            TEXT NOT NULL,
            tag              TEXT DEFAULT 'Giải đấu mùa',
            description      TEXT DEFAULT '',
            rules            TEXT DEFAULT '',
            status           TEXT DEFAULT 'upcoming',
            size             TEXT DEFAULT 'small',
            xp_multiplier    REAL DEFAULT 1.2,
            starts_at        TEXT NOT NULL,
            ends_at          TEXT NOT NULL,
            play_mode        TEXT DEFAULT 'individual',
            min_clan_members INTEGER DEFAULT 2,
            max_participants INTEGER DEFAULT 0,
            prize_json       TEXT DEFAULT '[]',
            is_featured      INTEGER DEFAULT 0,
            created_by       TEXT DEFAULT '',
            pending_approval INTEGER DEFAULT 0,
            approved_by      TEXT DEFAULT '',
            created_at       TEXT NOT NULL
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS tournament_participants (
            tournament_id  TEXT NOT NULL,
            user_id        TEXT NOT NULL,
            username       TEXT NOT NULL,
            clan_id        TEXT DEFAULT '',
            score          INTEGER DEFAULT 0,
            matches_played INTEGER DEFAULT 0,
            registered_at  TEXT NOT NULL,
            status         TEXT DEFAULT 'active',
            PRIMARY KEY (tournament_id, user_id)
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS event_organizers (
            tournament_id TEXT NOT NULL,
            user_id       TEXT NOT NULL,
            username      TEXT NOT NULL,
            role          TEXT DEFAULT 'organizer',
            assigned_at   TEXT NOT NULL,
            PRIMARY KEY (tournament_id, user_id)
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS tournament_rooms (
            id            TEXT PRIMARY KEY,
            tournament_id TEXT NOT NULL,
            host_user_id  TEXT NOT NULL,
            host_username TEXT NOT NULL,
            room_mode     TEXT DEFAULT 'individual',
            clan_a_id     TEXT DEFAULT '',
            clan_b_id     TEXT DEFAULT '',
            max_players   INTEGER DEFAULT 2,
            status        TEXT DEFAULT 'waiting',
            mathmap_id    TEXT DEFAULT '',
            created_at    TEXT NOT NULL
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS events (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT DEFAULT '',
            status      TEXT DEFAULT 'Sắp diễn ra',
            event_date  TEXT NOT NULL,
            link        TEXT DEFAULT '#rules',
            created_at  TEXT NOT NULL
        )""", None),
        ("""CREATE TABLE IF NOT EXISTS changelog_entries (
            id          TEXT PRIMARY KEY,
            date        TEXT NOT NULL,
            tag         TEXT NOT NULL,
            tag_label   TEXT NOT NULL,
            title       TEXT NOT NULL,
            description TEXT DEFAULT '',
            created_at  TEXT NOT NULL
        )""", None),
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
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(connect=10, read=90, write=15, pool=15))
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
        
        g_row = db.execute("SELECT elo_rating FROM user_gamification WHERE user_id=?", (uid,)).fetchone()
        elo = g_row["elo_rating"] if g_row else 1000
        
        test_results, game_results = _fetch_scores(db, uid)
        
        user_data = user_dict(row)
        user_data["elo_rating"] = elo
        
        return JSONResponse({
            "user": user_data,
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

    gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
    if not gemini_api_key:
        logger.warning("[Chat] GEMINI_API_KEY is not set — Gemini calls will fail over to the OpenRouter/local fallback tiers.")

    # Detect mathviz widget from graph nodes + keyword fallback
    _matched_node_ids = extract_graph_entities(user_message)
    _widget = detect_widget(user_message, _matched_node_ids)

    # Image pre-processing & Stage 1 Vision Agent (Qwen2.5-VL-72B via OpenRouter)
    raw_b64 = ""
    media_type = "image/jpeg"
    vision_description = None

    if image_data:
        if "," in image_data:
            header, raw_b64 = image_data.split(",", 1)
            media_type = header.split(":")[1].split(";")[0]
        else:
            raw_b64 = image_data

        # Risk 3 mitigation: aspect-preserving resize + letterbox pad BEFORE
        # the bytes reach OCR, the Gemini inlineData fallback below, or the
        # vision agent. A raw `.resize()` to a fixed box (what happened
        # implicitly downstream before this patch, via whatever the phone
        # camera/screenshot's native aspect ratio was) stretches circles into
        # ellipses and skews every angle; this keeps geometry undistorted and
        # also gives image/preprocessing.py's sha256 a stable cache key for
        # Risk 5. media_type is forced to JPEG since that's what comes out.
        try:
            _with_grid = os.environ.get("VISION_GRID_OVERLAY", "false").lower() in ("true", "1", "yes")
            raw_b64, _img_meta = preprocess_image_b64(raw_b64, with_grid=_with_grid)
            media_type = "image/jpeg"
        except Exception as e_prep:
            logger.debug(f"Image preprocessing skipped, using original bytes: {e_prep}")

        # Stage 1: Attempt specialized Olympiad geometry diagram extraction via OpenRouter
        if _vision_agent.is_configured():
            try:
                print("[Chat] Invoking Stage 1 Vision Agent (Qwen2.5-VL-72B via OpenRouter)...")
                vision_description, success = await _vision_agent.extract_with_fallback(
                    raw_b64, media_type=media_type, user_hint=user_message
                )
                if success and vision_description:
                    print("[Chat] Stage 1 Vision extraction succeeded! Passing structured geometry to Gemini Canvas Engine.")
                    if _widget is None:
                        _widget = "geometry_2d"
            except Exception as ex:
                print(f"[Chat] Stage 1 Vision Agent error: {ex}. Falling back to default Gemini vision.")

        # If widget not detected and vision agent not used, try local OCR fallback
        if not vision_description and _widget is None:
            try:
                img_bytes = base64.b64decode(raw_b64)
                if _ocr_available and ocr_reader:
                    ocr_text = extract_text_from_image(img_bytes)
                    if ocr_text:
                        ocr_nodes = extract_graph_entities(ocr_text)
                        _widget = detect_widget(ocr_text, ocr_nodes)
            except Exception as e:
                logger.debug(f"OCR widget pre-detection skipped: {e}")

    # Build prompt variant according to mode & widget
    if is_viz_request:
        system_prompt = (
            "You are an expert mathematical visualizer and graph plotter.\n"
            "Your task is to analyze the math problem and output ONLY a valid JSON object matching the requested schema.\n"
            "You MUST ensure that the returned math steps ('stepsVI', 'stepsEN') wrap ALL math symbols, variables, fractions, and equations in dollar signs ($...$ for inline, $$...$$ for block).\n"
            "You MUST use vibrant neon colors for drawing instructions (lines, shapes, points) instead of plain white/black, label all vertices clearly, and highlight sub-regions.\n"
            "Do NOT include any extra text, preamble, or markdown code block wrappers (like ```json). Just output the raw JSON."
        )
    else:
        if chat_mode in ("visualizer", "threeD"):
            prompt_variant = "visualizer"
        elif chat_mode in ("solution", "raw_solution"):
            prompt_variant = chat_mode
        elif vision_description:
            prompt_variant = "image_with_vision"
        elif image_data:
            prompt_variant = "image"
        else:
            prompt_variant = "text"
        system_prompt = cached_system_prompt(prompt_variant, _widget)


    retrieved_kb = retrieve_math_context(user_message)
    try:
        from math_problem_retrieval import retrieve_similar_problems
        retrieved_examples = retrieve_similar_problems(user_message, top_k=2)
    except Exception as e_retr:
        logger.debug(f"Problem-bank retrieval skipped: {e_retr}")
        retrieved_examples = ""
    if retrieved_examples:
        retrieved_kb = f"{retrieved_kb}\n\n{retrieved_examples}"
    full_system_prompt = (
        f"{system_prompt}\n\n"
        f"## REFERENCE MATHEMATICAL KNOWLEDGE (DO NOT COPY DIRECTLY):\n"
        f"The following context contains formulas and examples for reference. "
        f"You MUST only use it as a general conceptual reference. "
        f"NEVER solve or copy the example equations, functions, or numbers from this reference context. "
        f"Only solve the exact problem and numbers specified in the User Request.\n\n"
        f"{retrieved_kb}"
    )

    # Map conversation history to Gemini structure (keep last 12 for long proofs)
    gemini_contents = []
    for h in history[-12:]:
        role = "model" if h["role"] == "assistant" else "user"
        content = h.get("content") or ""
        if content.startswith("[Image] "):
            content = content[8:]
        if content.startswith("[Image + Vision AI] "):
            content = content[20:]
        if content.strip():
            gemini_contents.append({
                "role": role,
                "parts": [{"text": content}]
            })

    # Add current user turn with the image or structured vision text
    if image_data:
        if vision_description:
            # Stage 2 Handoff: Provide structured geometric primitives to Gemini for precision canvas generation
            enhanced_user_message = (
                f"{user_message}\n\n"
                f"## CẤU TRÚC HÌNH HỌC TỪ HÌNH ẢNH (Bóc tách chi tiết bởi Vision AI Qwen2.5-VL-72B):\n"
                f"{vision_description}\n\n"
                f"YÊU CẦU QUAN TRỌNG CHO CANVAS VÀ GIẢI TOÁN:\n"
                f"1. Dựa trên các điểm (points), đường tròn (circles), đoạn thẳng (lines) và quan hệ không gian ở trên, hãy đưa ra phân tích và gợi ý định hướng giải chuẩn xác.\n"
                f"2. BẮT BUỘC dựng khối ```mathviz ... ``` với widget \"geometry_2d\" (cấu trúc \"layers\" đa tầng) thể hiện đầy đủ, chính xác tất cả các điểm, đường tròn, tiếp tuyến, đoạn thẳng tương ứng."
            )
            gemini_contents.append({
                "role": "user",
                "parts": [{"text": enhanced_user_message}]
            })
            history.append({"role": "user", "content": f"[Image + Vision AI] {user_message}"})
        else:
            # Fallback: send raw image bytes to Gemini Vision directly
            gemini_contents.append({
                "role": "user",
                "parts": [
                    {"text": user_message},
                    {
                        "inlineData": {
                            "mimeType": media_type,
                            "data": raw_b64
                        }
                    }
                ]
            })
            history.append({"role": "user", "content": f"[Image] {user_message}"})
    else:
        gemini_contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })
        history.append({"role": "user", "content": user_message})

    # Token budget calculation — generous for image/solution to avoid truncation
    _has_widget = chat_mode not in ("solution", "raw_solution") and _widget is not None
    if image_data:
        max_tokens = 8192   # Complex geometry proofs from images need full output
    elif chat_mode in ("solution", "raw_solution"):
        max_tokens = 4096   # Full solutions need room for derivations
    elif _has_widget:
        max_tokens = 2048   # Widget-annotated responses (JSON + explanation)
    else:
        max_tokens = 1500   # Socratic hints — concise by design

    client = await get_http_client()

    gemini_model = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
    llm_provider = os.environ.get("LLM_PROVIDER", "gemini").lower()
    hf_model_name = os.environ.get("HF_MODEL_NAME", "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B")
    openai_base_url = os.environ.get("OPENAI_COMPATIBLE_BASE_URL", "").rstrip("/")
    openai_api_key = os.environ.get("OPENAI_COMPATIBLE_API_KEY", "") or os.environ.get("HF_API_KEY", "")

    # Build standard OpenAI/HuggingFace compatible messages
    openai_messages = [{"role": "system", "content": full_system_prompt}]
    for h in history[-12:]:
        h_role = "assistant" if h["role"] == "assistant" else "user"
        h_content = h.get("content") or ""
        if h_content.startswith("[Image] "):
            h_content = h_content[8:]
        if h_content.startswith("[Image + Vision AI] "):
            h_content = h_content[20:]
        if h_content.strip():
            openai_messages.append({"role": h_role, "content": h_content})
    if image_data and vision_description:
        openai_messages.append({"role": "user", "content": enhanced_user_message})
    else:
        openai_messages.append({"role": "user", "content": user_message})

    is_custom_provider = (llm_provider in ("openai_compatible", "huggingface") or bool(openai_base_url)) and llm_provider != "gemini"
    print(f"[Chat] provider={llm_provider if is_custom_provider else 'gemini'}, model={hf_model_name if is_custom_provider else gemini_model}, mode={chat_mode}, widget={_widget}, has_image={'yes' if image_data else 'no'}, max_tokens={max_tokens}")

    if use_stream:
        if is_custom_provider:
            endpoint_url = f"{openai_base_url}/chat/completions" if openai_base_url else "https://api-inference.huggingface.co/v1/chat/completions"
            hf_headers = {"Authorization": f"Bearer {openai_api_key}", "Content-Type": "application/json"} if openai_api_key else {"Content-Type": "application/json"}
            hf_payload = {
                "model": hf_model_name,
                "messages": openai_messages,
                "temperature": 0.3,
                "max_tokens": max_tokens,
                "stream": True
            }

            async def generate_custom_provider():
                full_reply = []
                try:
                    async with client.stream("POST", endpoint_url, headers=hf_headers, json=hf_payload, timeout=90) as resp:
                        resp.raise_for_status()
                        async for raw_line in resp.aiter_lines():
                            if not raw_line:
                                continue
                            line = raw_line.strip()
                            if line.startswith("data: "):
                                data_str = line[6:]
                                if data_str.strip() == "[DONE]":
                                    break
                                try:
                                    chunk = json.loads(data_str)
                                    choices = chunk.get("choices", [])
                                    if choices:
                                        delta = choices[0].get("delta", {})
                                        token = delta.get("content", "")
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
                generate_custom_provider(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                    "Access-Control-Allow-Origin": "*",
                },
            )
        else:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:streamGenerateContent?key={gemini_api_key}&alt=sse"
            payload = {
                "contents": gemini_contents,
                "systemInstruction": {
                    "parts": [{"text": full_system_prompt}]
                },
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": max_tokens
                }
            }

            async def generate():
                full_reply = []
                try:
                    async with client.stream("POST", url, json=payload, timeout=90) as resp:
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
        payload = {
            "contents": gemini_contents,
            "systemInstruction": {
                "parts": [{"text": full_system_prompt}]
            },
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": max_tokens
            }
        }
        # Only attach tools for pure text calculations (not for vision, visualizer, or widget generation)
        if not (image_data or is_viz_request or _widget):
            payload["tools"] = GEMINI_TOOLS

        fallback_models = [
            gemini_model,
            "gemini-3.6-flash"
        ]
        seen_models = set()
        fallback_models = [m for m in fallback_models if m and not (m in seen_models or seen_models.add(m))]

        reply = None

        if is_custom_provider:
            try:
                endpoint_url = f"{openai_base_url}/chat/completions" if openai_base_url else "https://api-inference.huggingface.co/v1/chat/completions"
                hf_headers = {"Authorization": f"Bearer {openai_api_key}", "Content-Type": "application/json"} if openai_api_key else {"Content-Type": "application/json"}
                hf_payload = {
                    "model": hf_model_name,
                    "messages": openai_messages,
                    "temperature": 0.3,
                    "max_tokens": max_tokens,
                    "stream": False
                }
                resp = await client.post(endpoint_url, headers=hf_headers, json=hf_payload, timeout=60)
                if resp.status_code == 200:
                    reply = resp.json()["choices"][0]["message"]["content"]
                    print(f"[Chat] Generated reply via {llm_provider} ({hf_model_name})")
            except Exception as ex_hf:
                print(f"[WARN] {llm_provider} call failed: {ex_hf}. Falling back to Gemini.")

        for current_model in fallback_models:
            if reply:
                break
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:generateContent?key={gemini_api_key}"
            for attempt in range(1):
                try:
                    curr_payload = json.loads(json.dumps(payload))
                    # Tool calling multi-turn execution loop (up to 4 iterations)
                    for tool_step in range(4):
                        resp = await client.post(url, json=curr_payload, timeout=18)
                        if resp.status_code == 400 and "tools" in curr_payload:
                            print(f"[WARN] {current_model} returned 400 during tool call — retrying without tools")
                            curr_payload.pop("tools", None)
                            resp = await client.post(url, json=curr_payload, timeout=18)
                        if resp.status_code in (429, 503):
                            print(f"[WARN] {current_model} returned {resp.status_code}")
                            break
                        resp.raise_for_status()
                        res_data = resp.json()
                        candidate = res_data.get("candidates", [{}])[0]
                        candidate_content = candidate.get("content", {})
                        parts = candidate_content.get("parts", [])

                        # Check for functionCall
                        has_func = False
                        for p in parts:
                            if "functionCall" in p:
                                has_func = True
                                fc = p["functionCall"]
                                fc_name = fc.get("name")
                                fc_args = fc.get("args", {})
                                if fc_name == "evaluate_math":
                                    math_expr = fc_args.get("expression", "")
                                    math_res = evaluate_math_expression(math_expr)
                                    print(f"[MathTool] evaluate_math('{math_expr}') -> {math_res.get('numeric') or math_res.get('exact')}")
                                    curr_payload["contents"].append({
                                        "role": "model",
                                        "parts": parts
                                    })
                                    curr_payload["contents"].append({
                                        "role": "user",
                                        "parts": [{
                                            "functionResponse": {
                                                "name": "evaluate_math",
                                                "response": math_res
                                            }
                                        }]
                                    })
                                break

                        if not has_func:
                            # Final text received - concatenate all text parts
                            text_parts = [p.get("text", "") for p in parts if "text" in p]
                            reply = "".join(text_parts).strip()
                            break

                    if reply:
                        break
                except Exception as e:
                    print(f"[WARN] Error with {current_model} ({e}) — retrying once without tools")
                    try:
                        no_tools_payload = json.loads(json.dumps(payload))
                        no_tools_payload.pop("tools", None)
                        resp = await client.post(url, json=no_tools_payload, timeout=20)
                        if resp.status_code == 200:
                            res_data = resp.json()
                            candidate_parts = res_data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                            text_parts = [p.get("text", "") for p in candidate_parts if "text" in p]
                            reply = "".join(text_parts).strip()
                    except Exception as e2:
                        print(f"[WARN] Direct retry failed: {e2}")
            if reply:
                break

        if not reply:
            # Fallback to OpenRouter LLM if Gemini is unavailable or returns 503
            if _vision_agent.is_configured():
                try:
                    print("[Chat] Gemini unavailable/503. Calling OpenRouter LLM for intelligent canvas response...")
                    openrouter_key = os.environ.get("OPENROUTER_API_KEY", "")
                    openrouter_model = os.environ.get("OPENROUTER_VISION_MODEL", "minimax/minimax-m3:free")
                    or_headers = {
                        "Authorization": f"Bearer {openrouter_key}",
                        "HTTP-Referer": "https://duomath.local",
                        "X-Title": "DuoMath AI",
                        "Content-Type": "application/json"
                    }
                    or_messages = [
                        {"role": "system", "content": full_system_prompt}
                    ]
                    for gc in gemini_contents[-8:]:
                        role = "assistant" if gc.get("role") == "model" else "user"
                        t_parts = [p.get("text", "") for p in gc.get("parts", []) if "text" in p]
                        if t_parts:
                            or_messages.append({"role": role, "content": " ".join(t_parts)})

                    or_payload = {
                        "model": openrouter_model,
                        "messages": or_messages,
                        "temperature": 0.2
                    }
                    or_resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=or_headers, json=or_payload, timeout=60)
                    if or_resp.status_code == 200:
                        reply = or_resp.json()["choices"][0]["message"]["content"]
                        print("[Chat] Successfully generated reply via OpenRouter fallback!")
                except Exception as ex_or:
                    print(f"[Chat] OpenRouter fallback failed: {ex_or}")

        if not reply:
            print("[INFO] Using local MathGPT Engine for instant, reliable response")
            reply = generate_mock_mathgpt_reply(user_message, _widget, chat_mode)




        # ── MathViz validation, bounded retry + free-tier escalation
        #    (Risk 2), then geometric regularization (Risk 1) ─────────────
        _reply_text, _viz_block = _extract_mathviz_block(reply)
        if _viz_block is not None and not is_viz_request:
            actual_widget = _viz_block.get("widget") or _widget or "geometry_3d"
            _viz_errors = validate_mathviz(actual_widget, _viz_block)

            # Tier 1 (existing): one same-model Gemini retry with the errors appended.
            if _viz_errors:
                print(f"[MathViz] Schema errors for widget '{actual_widget}': {_viz_errors} — retrying once with Gemini")
                retry_contents = gemini_contents + [
                    {"role": "model", "parts": [{"text": reply}]},
                    {"role": "user", "parts": [{"text": f"Khối mathviz bị lỗi: {'; '.join(_viz_errors)}. Hãy trả lại TOÀN BỘ câu trả lời, sửa đúng schema."}]}
                ]
                retry_payload = {**payload, "contents": retry_contents}
                try:
                    resp2 = await client.post(url, json=retry_payload, timeout=30)
                    resp2.raise_for_status()
                    reply2 = resp2.json()["candidates"][0]["content"]["parts"][0]["text"]
                    _reply2_text, _viz2 = _extract_mathviz_block(reply2)
                    _viz2_errors = validate_mathviz(actual_widget, _viz2) if _viz2 is not None else _viz_errors
                    if _viz2 is not None and not _viz2_errors:
                        reply = reply2
                        _reply_text, _viz_block = _reply2_text, _viz2
                        _viz_errors = []
                    else:
                        _viz_errors = _viz2_errors
                except Exception as ex:
                    logger.debug(f"Mathviz retry failed: {ex}")
                    print(f"[MathViz] Gemini retry tier failed: {ex} — escalating to free OpenRouter repair tier")

            # Tier 2 (new): still broken after the Gemini retry -> one
            # targeted repair call to a FREE OpenRouter model asking for
            # ONLY the corrected JSON, not a whole new reply. Cheaper than
            # another full-reply retry and works even when Gemini itself is
            # the one that's rate-limited.
            if _viz_errors and _viz_block is not None:
                _fixed = await _repair_mathviz_with_free_openrouter(
                    actual_widget, json.dumps(_viz_block, ensure_ascii=False), _viz_errors
                )
                if _fixed is not None:
                    _viz_block = _fixed
                    reply = f"{_reply_text}\n\n```mathviz\n{json.dumps(_viz_block, ensure_ascii=False, indent=2)}\n```"
                    print(f"[MathViz] Free-tier OpenRouter escalation repaired widget '{actual_widget}'.")
                else:
                    logger.debug(f"[MathViz] Widget '{actual_widget}' still invalid after all repair tiers — sending reply without a visual.")

        # Geometric regularization for geometry_2d, in order of generality:
        #   1. Construction-graph solver (RESTORED — was built but never
        #      wired in): resolves any point the LLM declared via
        #      "constructions" exactly, for ANY point names/count. This is
        #      what fixes diagrams with 10+ labeled points that the fixed
        #      template below doesn't recognize.
        #   2. Olympiad template solver — NOTE: this now only activates for
        #      one specific memorized problem (title contains GLK/CEVIAN/
        #      AML/"EULER (9 ĐIỂM)", or points G+L+K+P are all present) —
        #      every other diagram passes through it untouched by design.
        #      Keep it for that one case; it is no longer a general fallback.
        #   3. General angle/collinearity snapper — final cleanup, gated by
        #      numeric verification so it can only help, not hurt.
        if _viz_block is not None:
            actual_widget = _viz_block.get("widget") or _widget or "geometry_2d"
            if actual_widget == "geometry_2d" and "layers" in _viz_block:
                try:
                    from geometry_construction_solver import resolve_constructions
                    from geometry_canvas_solver import auto_align_geometry_mathviz
                    from geometry_snapping import snap_geometry_2d, verify_snap_safe
                    _viz_block, _unsolved = resolve_constructions(_viz_block)
                    if _unsolved:
                        logger.info(f"[MathViz] Construction solver left {_unsolved} at their raw LLM coordinates (unknown dependency, cycle, or unsupported type).")
                    _viz_block = auto_align_geometry_mathviz(_viz_block)
                    _snapped = snap_geometry_2d(_viz_block)
                    if verify_snap_safe(_viz_block, _snapped):
                        _viz_block = _snapped
                    reply = f"{_reply_text}\n\n```mathviz\n{json.dumps(_viz_block, ensure_ascii=False, indent=2)}\n```"
                except Exception as e_align:
                    logger.debug(f"MathViz auto-align/snap skipped: {e_align}")

                # Risk 4: cheap, non-blocking confirmation pass. Logged only
                # — never gates the response — to keep the hot path fast and
                # free-tier-cheap (one small flat-schema Flash call).
                try:
                    _confirm = await confirm_mathviz_understanding(actual_widget, _viz_block)
                    if not _confirm.get("understood", True) or _confirm.get("issues"):
                        logger.info(f"[MathViz] Confirmation flagged widget '{actual_widget}': {_confirm.get('issues')}")
                except Exception as e_confirm:
                    logger.debug(f"MathViz confirmation skipped: {e_confirm}")


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
            {
                "role": "system",
                "content": (
                    "You are a JSON-only translation API. Output only the JSON object. "
                    "CRITICAL: For all Vietnamese fields (like 'translation', 'summary', 'vietnamese', and 'theory.vi'), "
                    "you MUST use only standard Latin-based Vietnamese characters (Chữ Quốc Ngữ). "
                    "Do NOT use any Chinese characters (Hanzi/Kanji like '等式', '不等式', etc.) under any circumstances. "
                    "Always write terms like 'inequality' as 'bất đẳng thức', NOT 'bất等式'."
                )
            },
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


# ═══════════════════════════════════════════════════════════════════════════════
#  MRM MULTIPLAYER WEBSOCKET INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════
from fastapi import WebSocket, WebSocketDisconnect
import random

async def resolve_user_id_from_token(token: str) -> int:
    # Try backend JWT first
    try:
        identity = decode_token(token)
        return int(identity)
    except Exception:
        pass
    
    # Try Firebase ID token
    try:
        payload = await verify_firebase_token(token)
        firebase_uid = payload["sub"]
        db = get_db()
        try:
            row = db.execute("SELECT id FROM users WHERE firebase_uid=?", (firebase_uid,)).fetchone()
            if row:
                return row["id"]
        finally:
            db.close()
    except Exception as e:
        print(f"[WS Auth Error] {e}")
    raise ValueError("Invalid token")


async def get_user_profile_for_ws(user_id: int) -> dict:
    db = get_db()
    try:
        user_row = db.execute("SELECT id, username, avatar_url, grade FROM users WHERE id=?", (user_id,)).fetchone()
        gami_row = db.execute("SELECT elo_rating, level FROM user_gamification WHERE user_id=?", (user_id,)).fetchone()
        
        username = user_row["username"] if user_row else "Player"
        avatar = user_row["avatar_url"] if user_row else ""
        grade = user_row["grade"] if user_row else "Lớp 11"
        elo = gami_row["elo_rating"] if gami_row else 1000
        level = gami_row["level"] if gami_row else 1
        
        return {
            "uid": user_id,
            "username": username,
            "avatar": avatar,
            "grade": grade,
            "elo": elo,
            "level": level
        }
    finally:
        db.close()


def calculate_elo_change(r_a: int, r_b: int, won: bool) -> tuple[int, int]:
    # K-factor
    K = 32
    # Expected scores
    E_a = 1.0 / (1.0 + 10.0 ** ((r_b - r_a) / 400.0))
    E_b = 1.0 / (1.0 + 10.0 ** ((r_a - r_b) / 400.0))
    
    # Actual scores
    S_a = 1.0 if won else 0.0
    S_b = 0.0 if won else 1.0
    
    # New ratings
    new_r_a = max(1000, round(r_a + K * (S_a - E_a)))
    new_r_b = max(1000, round(r_b + K * (S_b - E_b)))
    
    return new_r_a - r_a, new_r_b - r_b


def update_db_elo(user_id: int, elo_change: int) -> int:
    db = get_db()
    try:
        # Check if user exists in user_gamification
        row = db.execute("SELECT elo_rating, peak_elo FROM user_gamification WHERE user_id=?", (user_id,)).fetchone()
        if not row:
            db.execute("INSERT INTO user_gamification (user_id, elo_rating, peak_elo) VALUES (?,?,?)", (user_id, 1000 + elo_change, max(1000, 1000 + elo_change)))
            new_elo = 1000 + elo_change
        else:
            new_elo = max(1000, row["elo_rating"] + elo_change)
            new_peak = max(row["peak_elo"], new_elo)
            db.execute("UPDATE user_gamification SET elo_rating=?, peak_elo=? WHERE user_id=?", (new_elo, new_peak, user_id))
        
        # Get country
        c_row = db.execute("SELECT country FROM users WHERE id=?", (user_id,)).fetchone()
        country = c_row["country"] if c_row else "VN"
        
        # Calculate rank
        global_rank = db.execute(
            """SELECT COUNT(*)+1 as r FROM user_gamification g
               JOIN users u ON u.id=g.user_id
               WHERE g.elo_rating > ? AND u.banned=0""",
            (new_elo,)
        ).fetchone()["r"]
        
        # Insert into mrm_rank_history
        db.execute(
            "INSERT INTO mrm_rank_history (user_id, elo_rating, global_rank) VALUES (?,?,?)",
            (user_id, new_elo, global_rank)
        )
        db.commit()
        return new_elo
    finally:
        db.close()


class MRMConnectionManager:
    def __init__(self):
        # active connections: user_id (int) -> WebSocket
        self.active_connections = {}
        # lobby listeners: user_id (int) -> WebSocket
        self.lobby_listeners = {}
        # matchmaking queue: list of user_id (int)
        self.matchmaking_queue = []
        # active rooms: room_id (str) -> room_dict
        self.rooms = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.lobby_listeners:
            del self.lobby_listeners[user_id]
        if user_id in self.matchmaking_queue:
            try:
                self.matchmaking_queue.remove(user_id)
            except ValueError:
                pass
        
        # If user was in a room, handle their abandonment
        abandoned_rooms = []
        for r_id, room in self.rooms.items():
            if room["host_id"] == user_id or room["guest_id"] == user_id:
                abandoned_rooms.append(r_id)
        
        return abandoned_rooms

    async def send_to_user(self, user_id: int, message: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(user_id)

    async def broadcast_to_lobby(self):
        lobby_data = self.get_lobby_rooms_data()
        msg = {"type": "lobby_update", "rooms": lobby_data}
        dead_users = []
        for uid, ws in self.lobby_listeners.items():
            try:
                await ws.send_json(msg)
            except Exception:
                dead_users.append(uid)
        for uid in dead_users:
            self.disconnect(uid)

    def get_lobby_rooms_data(self):
        data = []
        for r_id, room in self.rooms.items():
            # Only include public waiting or playing rooms (matchmaking rooms are temporary and hidden)
            if not r_id.startswith("mm_temp_"):
                data.append({
                    "id": r_id,
                    "host": room["host_profile"].get("username", "Unknown"),
                    "map": room["map_info"].get("title", "Mixed Map"),
                    "grade": room["map_info"].get("grade", "Lớp 11"),
                    "diff": room["map_info"].get("difficulty_fmp", 5.0),
                    "players": 2 if room["guest_id"] else 1,
                    "maxPlayers": 2,
                    "status": room["status"],
                    "elo": f"{room['host_profile'].get('elo', 1000)}+"
                })
        return data

mrm_manager = MRMConnectionManager()


@app.websocket("/api/mrm/ws")
async def mrm_websocket_endpoint(websocket: WebSocket, token: str = None):
    if not token:
        token = websocket.query_params.get("token")
    if not token:
        await websocket.accept()
        await websocket.close(code=4001, reason="Missing token")
        return

    try:
        user_id = await resolve_user_id_from_token(token)
    except Exception as e:
        await websocket.accept()
        await websocket.close(code=4002, reason=f"Auth failed: {str(e)}")
        return

    profile = await get_user_profile_for_ws(user_id)
    await mrm_manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "join_lobby":
                mrm_manager.lobby_listeners[user_id] = websocket
                await websocket.send_json({
                    "type": "lobby_update",
                    "rooms": mrm_manager.get_lobby_rooms_data()
                })

            elif msg_type == "create_room":
                room_id = f"r_{uuid.uuid4().hex[:8]}"
                map_info = data.get("map_info", {})
                wager = data.get("wager", 0)
                
                mrm_manager.rooms[room_id] = {
                    "id": room_id,
                    "host_id": user_id,
                    "host_profile": profile,
                    "guest_id": None,
                    "guest_profile": None,
                    "map_info": map_info,
                    "status": "waiting",
                    "wager": wager,
                    "phase": "discarding",
                    "discarded_cards": [],
                    "chooser_id": None,
                    "selected_card": None,
                    "current_q_idx": 0,
                    "host_hp": 5,
                    "guest_hp": 5,
                    "host_big_hp": 3,
                    "guest_big_hp": 3,
                    "answers": {}
                }
                
                await websocket.send_json({
                    "type": "room_created",
                    "room_id": room_id
                })
                await mrm_manager.broadcast_to_lobby()

            elif msg_type == "join_room":
                room_id = data.get("room_id")
                if room_id in mrm_manager.rooms:
                    room = mrm_manager.rooms[room_id]
                    if room["guest_id"] is None and room["host_id"] != user_id:
                        room["guest_id"] = user_id
                        room["guest_profile"] = profile
                        room["status"] = "in_game"
                        room["chooser_id"] = room["host_id"] if random.random() < 0.5 else room["guest_id"]
                        
                        await mrm_manager.send_to_user(room["host_id"], {
                            "type": "game_start",
                            "role": "host",
                            "opponent": profile,
                            "room_id": room_id,
                            "chooser_id": room["chooser_id"]
                        })
                        await mrm_manager.send_to_user(room["guest_id"], {
                            "type": "game_start",
                            "role": "guest",
                            "opponent": room["host_profile"],
                            "room_id": room_id,
                            "chooser_id": room["chooser_id"]
                        })
                        await mrm_manager.broadcast_to_lobby()

            elif msg_type == "leave_room":
                room_id = data.get("room_id")
                if room_id in mrm_manager.rooms:
                    room = mrm_manager.rooms[room_id]
                    opp_id = room["guest_id"] if room["host_id"] == user_id else room["host_id"]
                    if opp_id:
                        if room["status"] == "in_game":
                            new_opp_elo = update_db_elo(opp_id, 15)
                            update_db_elo(user_id, -15)
                            await mrm_manager.send_to_user(opp_id, {
                                "type": "opponent_left",
                                "won": True,
                                "elo_delta": 15,
                                "new_elo": new_opp_elo,
                                "reason": "Đối thủ đã đầu hàng! Bạn thắng mặc định +15 ELO."
                            })
                        else:
                            await mrm_manager.send_to_user(opp_id, {
                                "type": "opponent_left",
                                "won": False,
                                "reason": "Đối thủ đã rời phòng!"
                            })
                    
                    if room_id in mrm_manager.rooms:
                        del mrm_manager.rooms[room_id]
                    await mrm_manager.broadcast_to_lobby()

            elif msg_type == "matchmaking_search":
                if user_id not in mrm_manager.matchmaking_queue:
                    mrm_manager.matchmaking_queue.append(user_id)
                
                if len(mrm_manager.matchmaking_queue) >= 2:
                    p1_id = mrm_manager.matchmaking_queue.pop(0)
                    p2_id = mrm_manager.matchmaking_queue.pop(0)
                    
                    room_id = f"mm_temp_{uuid.uuid4().hex[:8]}"
                    p1_profile = await get_user_profile_for_ws(p1_id)
                    p2_profile = await get_user_profile_for_ws(p2_id)
                    
                    mrm_manager.rooms[room_id] = {
                        "id": room_id,
                        "host_id": p1_id,
                        "host_profile": p1_profile,
                        "guest_id": p2_id,
                        "guest_profile": p2_profile,
                        "map_info": {"title": "Xác suất & Tổ hợp", "grade": "Lớp 11", "difficulty_fmp": 6.8},
                        "status": "in_game",
                        "wager": 0,
                        "phase": "discarding",
                        "discarded_cards": [],
                        "chooser_id": p1_id if random.random() < 0.5 else p2_id,
                        "selected_card": None,
                        "current_q_idx": 0,
                        "host_hp": 5,
                        "guest_hp": 5,
                        "host_big_hp": 3,
                        "guest_big_hp": 3,
                        "answers": {}
                    }
                    
                    await mrm_manager.send_to_user(p1_id, {
                        "type": "match_found",
                        "room_id": room_id,
                        "role": "host",
                        "opponent": p2_profile,
                        "chooser_id": mrm_manager.rooms[room_id]["chooser_id"]
                    })
                    await mrm_manager.send_to_user(p2_id, {
                        "type": "match_found",
                        "room_id": room_id,
                        "role": "guest",
                        "opponent": p1_profile,
                        "chooser_id": mrm_manager.rooms[room_id]["chooser_id"]
                    })
                    await mrm_manager.broadcast_to_lobby()

            elif msg_type == "matchmaking_cancel":
                if user_id in mrm_manager.matchmaking_queue:
                    mrm_manager.matchmaking_queue.remove(user_id)

            elif msg_type == "card_phase_action":
                room_id = data.get("room_id")
                if room_id in mrm_manager.rooms:
                    room = mrm_manager.rooms[room_id]
                    opp_id = room["guest_id"] if room["host_id"] == user_id else room["host_id"]
                    if opp_id:
                        await mrm_manager.send_to_user(opp_id, {
                            "type": "opponent_card_action",
                            "action": data.get("action"),
                            "card": data.get("card"),
                            "discarded_cards": data.get("discarded_cards"),
                            "chooser_id": data.get("next_chooser_id")
                        })
                    
            elif msg_type == "submit_answer":
                room_id = data.get("room_id")
                if room_id in mrm_manager.rooms:
                    room = mrm_manager.rooms[room_id]
                    q_idx = data.get("q_idx")
                    option = data.get("option")
                    is_correct = data.get("is_correct")
                    time_taken = data.get("time_taken")
                    
                    if q_idx not in room["answers"]:
                        room["answers"][q_idx] = {}
                    
                    room["answers"][q_idx][user_id] = {
                        "option": option,
                        "is_correct": is_correct,
                        "time_taken": time_taken
                    }
                    
                    opp_id = room["guest_id"] if room["host_id"] == user_id else room["host_id"]
                    if opp_id:
                        await mrm_manager.send_to_user(opp_id, {
                            "type": "opponent_submitted",
                            "q_idx": q_idx
                        })
                    
                    if len(room["answers"][q_idx]) >= 2:
                        p1_ans = room["answers"][q_idx][room["host_id"]]
                        p2_ans = room["answers"][q_idx][room["guest_id"]]
                        
                        p1_corr = p1_ans["is_correct"]
                        p2_corr = p2_ans["is_correct"]
                        
                        p1_time = p1_ans["time_taken"]
                        p2_time = p2_ans["time_taken"]
                        
                        host_dmg = 0
                        guest_dmg = 0
                        
                        host_name = room["host_profile"]["username"]
                        guest_name = room["guest_profile"]["username"]
                        
                        host_log = ""
                        guest_log = ""
                        
                        if p1_corr and p2_corr:
                            if p1_time < p2_time:
                                guest_dmg = 1
                                host_log = f"⚡ Bạn nhanh hơn! Gây 1 sát thương lên {guest_name}!"
                                guest_log = f"⚡ {host_name} nhanh hơn! Bạn mất 1 HP."
                            elif p2_time < p1_time:
                                host_dmg = 1
                                host_log = f"⚡ {guest_name} nhanh hơn! Bạn mất 1 HP."
                                guest_log = f"⚡ Bạn nhanh hơn! Gây 1 sát thương lên {host_name}!"
                            else:
                                host_log = "🤝 Hòa! Cả hai đều đúng cùng tốc độ!"
                                guest_log = "🤝 Hòa! Cả hai đều đúng cùng tốc độ!"
                        elif p1_corr and not p2_corr:
                            guest_dmg = 1
                            host_log = f"🎯 Bạn đúng, {guest_name} sai! Gây 1 sát thương!"
                            guest_log = f"🎯 Bạn sai, {host_name} đúng! Bạn mất 1 HP."
                        elif not p1_corr and p2_corr:
                            host_dmg = 1
                            host_log = f"🎯 Bạn sai, {guest_name} đúng! Bạn mất 1 HP."
                            guest_log = f"🎯 Bạn đúng, {host_name} sai! Gây 1 sát thương!"
                        else:
                            host_log = "💨 Cả hai đều trả lời sai!"
                            guest_log = "💨 Cả hai đều trả lời sai!"
                            
                        room["host_hp"] = max(0, room["host_hp"] - host_dmg)
                        room["guest_hp"] = max(0, room["guest_hp"] - guest_dmg)
                        
                        base_eval_msg = {
                            "type": "round_evaluation",
                            "q_idx": q_idx,
                            "host_id": room["host_id"],
                            "guest_id": room["guest_id"],
                            "answers": {
                                str(room["host_id"]): p1_ans,
                                str(room["guest_id"]): p2_ans
                            },
                            "host_hp": room["host_hp"],
                            "guest_hp": room["guest_hp"],
                        }
                        
                        await mrm_manager.send_to_user(room["host_id"], {**base_eval_msg, "logs": [host_log]})
                        await mrm_manager.send_to_user(room["guest_id"], {**base_eval_msg, "logs": [guest_log]})
                        
            elif msg_type == "duel_round_end":
                room_id = data.get("room_id")
                if room_id in mrm_manager.rooms:
                    room = mrm_manager.rooms[room_id]
                    
                    # Validate winner_role on server based on remaining HP
                    if room["host_hp"] > room["guest_hp"]:
                        winner_role = "host"
                    elif room["guest_hp"] > room["host_hp"]:
                        winner_role = "guest"
                    else:
                        winner_role = data.get("winner_role") or "host"
                    
                    if winner_role == "host":
                        room["guest_big_hp"] = max(0, room["guest_big_hp"] - 1)
                    else:
                        room["host_big_hp"] = max(0, room["host_big_hp"] - 1)
                        
                    sync_set_msg = {
                        "type": "round_end_sync",
                        "host_big_hp": room["host_big_hp"],
                        "guest_big_hp": room["guest_big_hp"],
                        "winner_role": winner_role
                    }
                    await mrm_manager.send_to_user(room["host_id"], sync_set_msg)
                    await mrm_manager.send_to_user(room["guest_id"], sync_set_msg)

            elif msg_type == "match_end_action":
                room_id = data.get("room_id")
                if room_id in mrm_manager.rooms:
                    room = mrm_manager.rooms[room_id]
                    h_elo = room["host_profile"]["elo"]
                    g_elo = room["guest_profile"]["elo"]
                    
                    if room["host_big_hp"] > room["guest_big_hp"]:
                        host_won = True
                    elif room["guest_big_hp"] > room["host_big_hp"]:
                        host_won = False
                    else:
                        host_won = room["host_hp"] >= room["guest_hp"]
                    
                    h_change, g_change = calculate_elo_change(h_elo, g_elo, host_won)
                    new_h_elo = update_db_elo(room["host_id"], h_change)
                    new_g_elo = update_db_elo(room["guest_id"], g_change)
                    
                    await mrm_manager.send_to_user(room["host_id"], {
                        "type": "match_results",
                        "won": host_won,
                        "elo_delta": h_change,
                        "new_elo": new_h_elo
                    })
                    await mrm_manager.send_to_user(room["guest_id"], {
                        "type": "match_results",
                        "won": not host_won,
                        "elo_delta": g_change,
                        "new_elo": new_g_elo
                    })
                    
                    if room_id in mrm_manager.rooms:
                        del mrm_manager.rooms[room_id]
                    await mrm_manager.broadcast_to_lobby()

    except WebSocketDisconnect:
        abandoned = mrm_manager.disconnect(user_id)
        for r_id in abandoned:
            if r_id in mrm_manager.rooms:
                room = mrm_manager.rooms[r_id]
                opp_id = room["guest_id"] if room["host_id"] == user_id else room["host_id"]
                if opp_id:
                    if room["status"] == "in_game":
                        new_opp_elo = update_db_elo(opp_id, 15)
                        update_db_elo(user_id, -15)
                        await mrm_manager.send_to_user(opp_id, {
                            "type": "opponent_left",
                            "won": True,
                            "elo_delta": 15,
                            "new_elo": new_opp_elo,
                            "reason": "Đối thủ đã rời trận đấu! Bạn thắng mặc định +15 ELO."
                        })
                if r_id in mrm_manager.rooms:
                    del mrm_manager.rooms[r_id]
        await mrm_manager.broadcast_to_lobby()


# ══════════════════════════════════════════════════════════════════════════════
#  AI TEST STUDIO — Powered by Google Gemini
# ══════════════════════════════════════════════════════════════════════════════

GEMINI_KEY   = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta/models"
AI_MOCK_MODE = not bool(GEMINI_KEY)

# ── Gemini helpers ─────────────────────────────────────────────────────────────
import random as _rand

async def _gemini_json(prompt: str, schema: dict, temperature: float = 0.7) -> dict:
    url = f"{GEMINI_BASE}/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "temperature": temperature,
        }
    }
    client = await get_http_client()
    r = await client.post(url, json=payload, timeout=60)
    r.raise_for_status()
    raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(raw)

async def _gemini_vision_json(prompt: str, img_b64: str, mime: str, schema: dict) -> dict:
    url = f"{GEMINI_BASE}/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}"
    payload = {
        "contents": [{
            "parts": [
                {"inlineData": {"mimeType": mime, "data": img_b64}},
                {"text": prompt}
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "temperature": 0.3,
        }
    }
    client = await get_http_client()
    r = await client.post(url, json=payload, timeout=90)
    r.raise_for_status()
    raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(raw)

# ── MathViz confirmation pass (Risk 4 mitigation) ────────────────────────────
# Deliberately FLAT (no nesting) — Gemini's responseSchema mode only accepts a
# subset of JSON Schema and can reject deeply nested schemas outright. Kept
# flat here so it always fits that subset no matter how complex the mathviz
# payload itself gets; the payload is passed as plain prompt text, never
# bound to responseSchema (see confirm_mathviz_understanding below).
MATHVIZ_CONFIRM_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "understood": {"type": "BOOLEAN"},
        "element_count": {"type": "INTEGER"},
        "issues": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": ["understood", "element_count", "issues"],
}

async def confirm_mathviz_understanding(widget: str, viz_block: dict) -> dict:
    """
    Cheap, non-blocking pre-flight sanity check on a mathviz block, reusing
    the existing _gemini_json() structured-output helper rather than
    inventing a new calling convention. Called only for geometry_2d (see
    chat()) — the widget type with the deepest/most error-prone payload —
    to keep the extra call limited to where it actually earns its cost.
    Fails OPEN: any error here (bad key, rate limit, timeout) returns an
    "understood: True" stub so it can never block a response from reaching
    the user; callers should only ever log its output, not gate on it.
    """
    try:
        summary = json.dumps(viz_block, ensure_ascii=False)[:4000]  # cap prompt size for token efficiency
        prompt = (
            f"Widget type: {widget}\n"
            f"MathViz JSON to sanity-check:\n{summary}\n\n"
            f"Does this look like a complete, internally consistent '{widget}' diagram "
            f"(no missing coordinates, no obviously contradictory values)? "
            f"Report element_count as the total number of points/shapes/layers found."
        )
        return await _gemini_json(prompt, MATHVIZ_CONFIRM_SCHEMA, temperature=0.1)
    except Exception as e:
        logger.debug(f"[MathViz] Confirmation step skipped: {e}")
        return {"understood": True, "element_count": -1, "issues": []}

# ── Mock helpers (no API key needed) ─────────────────────────────────────────
def _mock_analyze(filename: str) -> dict:
    return {
        "summary": f"[DEMO] Phân tích tài liệu '{filename}' — dữ liệu giả lập. Thêm GEMINI_API_KEY vào .env để phân tích thật.",
        "topics": [
            {"name": "Số học", "description": "Phép cộng, trừ, nhân, chia"},
            {"name": "Phương trình bậc nhất", "description": "Giải phương trình một ẩn"},
            {"name": "Phương trình bậc hai", "description": "Phân tích nhân tử, tìm nghiệm"},
        ],
        "key_concepts": ["số nguyên", "nghiệm", "phân tích nhân tử"],
        "overall_difficulty": "intermediate",
        "suggested_question_count": 5,
    }

def _mock_make_question(difficulty: str, idx: int) -> dict:
    if difficulty == "easy":
        a, b = _rand.randint(2, 40), _rand.randint(2, 40)
        ans = a + b
        return {
            "question_text": {"vi": f"Tính: {a} + {b} = ?", "en": f"Calculate: {a} + {b} = ?"},
            "topic": "Số học", "difficulty": "easy",
            "time_limit_seconds": 120,
            "reference_answer": str(ans),
            "reference_solution_steps": [f"{a} + {b} = {ans}"],
            "max_score": 10,
        }
    if difficulty == "medium":
        a = _rand.randint(2, 9); x = _rand.randint(-10, 10); b = _rand.randint(1, 20)
        c = a * x + b
        return {
            "question_text": {"vi": f"Giải (chỉ ghi giá trị x): {a}x + {b} = {c}", "en": f"Solve for x only: {a}x + {b} = {c}"},
            "topic": "Phương trình bậc nhất", "difficulty": "medium",
            "time_limit_seconds": 300,
            "reference_answer": str(x),
            "reference_solution_steps": [f"{a}x = {c-b}", f"x = {x}"],
            "max_score": 10,
        }
    r1 = _rand.randint(-8, 8); r2 = _rand.randint(-8, 8)
    if r2 == r1: r2 += 1
    b_c = -(r1 + r2); c_c = r1 * r2
    sorted_r = sorted([r1, r2])
    b_sign = "+" if b_c >= 0 else "-"
    c_sign = "+" if c_c >= 0 else "-"
    eq = f"x² {b_sign} {abs(b_c)}x {c_sign} {abs(c_c)} = 0"
    return {
        "question_text": {"vi": f"Giải PT (ghi 2 nghiệm, nhỏ trước, cách nhau dấu phẩy): {eq}",
                          "en": f"Solve (both roots, smaller first, comma-separated): {eq}"},
        "topic": "Phương trình bậc hai", "difficulty": "hard",
        "time_limit_seconds": 600,
        "reference_answer": f"{sorted_r[0]},{sorted_r[1]}",
        "reference_solution_steps": [f"(x − {r1})(x − {r2}) = 0", f"x = {r1} hoặc x = {r2}"],
        "max_score": 10,
    }

def _mock_generate(count: int) -> dict:
    difficulties = ["easy", "medium", "hard"]
    qs = [_mock_make_question(difficulties[i % 3], i) for i in range(max(1, min(count, 15)))]
    return {"questions": qs}

def _mock_grade(answer_text: str, ref_answer: str, question_text: str) -> dict:
    norm = lambda s: s.replace(" ", "").replace(",", ",").strip().lower()
    correct = norm(answer_text) == norm(ref_answer) and answer_text.strip() != ""
    return {
        "is_correct": correct,
        "score_awarded": 10 if correct else 0,
        "student_answer_transcribed": answer_text,
        "error_type": "none" if correct else ("incomplete_steps" if not answer_text.strip() else "calculation_error"),
        "feedback": {
            "vi": "Chính xác! 🎉" if correct else (
                f"Chưa đúng. Đáp án đúng là: {ref_answer}. Xem lại các bước giải."
                if answer_text.strip() else f"Chưa có bài làm. Đáp án đúng là: {ref_answer}."
            ),
            "en": "Correct! 🎉" if correct else (
                f"Not quite. Correct answer: {ref_answer}. Review the solution steps."
                if answer_text.strip() else f"No answer submitted. Correct answer: {ref_answer}."
            ),
        },
        "confidence": 1.0,
    }

def _mock_review(items: list) -> dict:
    by_topic: dict = {}
    for it in items:
        t = it.get("topic", "Khác")
        by_topic.setdefault(t, {"correct": 0, "total": 0})
        by_topic[t]["total"] += 1
        if it.get("is_correct"):
            by_topic[t]["correct"] += 1
    strengths, weaknesses = [], []
    for topic, s in by_topic.items():
        ratio = s["correct"] / s["total"]
        desc = {"vi": f"Làm đúng {s['correct']}/{s['total']} câu chủ đề \"{topic}\".",
                "en": f"Got {s['correct']}/{s['total']} correct in \"{topic}\"."}
        if ratio >= 0.6:
            strengths.append({"topic": topic, "description": desc})
        else:
            weaknesses.append({
                "topic": topic, "description": desc,
                "recommended_resources": [{"title": f"Ôn tập: {topic}", "type": "practice_topic",
                                            "description": "[DEMO] Gợi ý cụ thể khi dùng Gemini thật."}]
            })
    n_correct = sum(1 for it in items if it.get("is_correct"))
    return {
        "overall_feedback": {
            "vi": f"[DEMO] Đúng {n_correct}/{len(items)} câu. Thêm GEMINI_API_KEY để nhận phân tích chi tiết.",
            "en": f"[DEMO] {n_correct}/{len(items)} correct. Add GEMINI_API_KEY for detailed AI analysis.",
        },
        "strengths": strengths,
        "weaknesses": weaknesses,
    }

# ── Gemini schemas ────────────────────────────────────────────────────────────
_ANALYZE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {"type": "STRING"},
        "topics": {"type": "ARRAY", "items": {"type": "OBJECT",
            "properties": {"name": {"type": "STRING"}, "description": {"type": "STRING"}},
            "required": ["name"]}},
        "key_concepts": {"type": "ARRAY", "items": {"type": "STRING"}},
        "overall_difficulty": {"type": "STRING", "enum": ["basic", "intermediate", "advanced"]},
        "suggested_question_count": {"type": "INTEGER"},
    },
    "required": ["summary", "topics", "key_concepts", "overall_difficulty"],
}

_TEST_GEN_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "questions": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "question_text": {"type": "OBJECT", "properties": {
                "vi": {"type": "STRING"}, "en": {"type": "STRING"}}, "required": ["vi", "en"]},
            "topic": {"type": "STRING"},
            "difficulty": {"type": "STRING", "enum": ["easy", "medium", "hard"]},
            "time_limit_seconds": {"type": "INTEGER"},
            "reference_answer": {"type": "STRING"},
            "reference_solution_steps": {"type": "ARRAY", "items": {"type": "STRING"}},
            "max_score": {"type": "INTEGER"},
        }, "required": ["question_text", "topic", "difficulty", "time_limit_seconds",
                        "reference_answer", "reference_solution_steps", "max_score"]}},
    },
    "required": ["questions"],
}

_GRADE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "is_correct": {"type": "BOOLEAN"},
        "score_awarded": {"type": "NUMBER"},
        "student_answer_transcribed": {"type": "STRING"},
        "error_type": {"type": "STRING", "enum": [
            "none", "calculation_error", "conceptual_error",
            "incomplete_steps", "wrong_formula", "illegible"]},
        "feedback": {"type": "OBJECT", "properties": {
            "vi": {"type": "STRING"}, "en": {"type": "STRING"}}},
        "confidence": {"type": "NUMBER"},
    },
    "required": ["is_correct", "score_awarded", "error_type", "feedback", "confidence"],
}

_REVIEW_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "overall_feedback": {"type": "OBJECT", "properties": {
            "vi": {"type": "STRING"}, "en": {"type": "STRING"}}},
        "strengths": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "topic": {"type": "STRING"},
            "description": {"type": "OBJECT", "properties": {
                "vi": {"type": "STRING"}, "en": {"type": "STRING"}}}}}},
        "weaknesses": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "topic": {"type": "STRING"},
            "description": {"type": "OBJECT", "properties": {
                "vi": {"type": "STRING"}, "en": {"type": "STRING"}}},
            "recommended_resources": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
                "title": {"type": "STRING"}, "type": {"type": "STRING"}, "description": {"type": "STRING"}}}}}}},
    },
    "required": ["strengths", "weaknesses"],
}

MAX_Q_TIME = 1800
GRACE_MS   = 3000

def _serve_q(attempt_id: str, q: dict, q_idx: int) -> dict:
    now = time.time()
    limit = min(int(q.get("time_limit_seconds", 300)), MAX_Q_TIME)
    deadline = now + limit
    qa_id = str(uuid.uuid4())
    db = get_db()
    db.execute(
        "INSERT INTO ai_qa (id, attempt_id, q_idx, served_at, deadline_at) VALUES (?,?,?,?,?)",
        (qa_id, attempt_id, q_idx,
         time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
         time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(deadline)))
    )
    db.commit()
    db.close()
    return {
        "qa_id": qa_id,
        "q_idx": q_idx,
        "question_text_vi": q["question_text"]["vi"],
        "question_text_en": q["question_text"]["en"],
        "topic": q.get("topic", ""),
        "difficulty": q.get("difficulty", "medium"),
        "time_limit_seconds": limit,
        "deadline_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(deadline)),
        "max_score": q.get("max_score", 10),
    }

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/ai-test/analyze")
async def ai_test_analyze(request: Request):
    d = await request.json()
    text    = (d.get("text_content") or "").strip()
    b64     = d.get("data_base64", "")
    mime    = d.get("mime_type", "text/plain")
    fname   = d.get("filename", "document")
    session = d.get("session_id", str(uuid.uuid4()))

    if not text and not b64:
        raise HTTPException(400, "text_content or data_base64 required")

    if AI_MOCK_MODE:
        analysis = _mock_analyze(fname)
    else:
        prompt = (
            "Phân tích tài liệu học tập sau và trả về JSON theo schema.\n\n"
            f"Tên tài liệu: {fname}\n\n"
            f"Nội dung:\n{text[:8000] if text else '[Xem file đính kèm]'}"
        )
        try:
            if b64 and not text:
                analysis = await _gemini_vision_json(prompt, b64, mime, _ANALYZE_SCHEMA)
            else:
                analysis = await _gemini_json(prompt, _ANALYZE_SCHEMA)
        except Exception as e:
            raise HTTPException(502, f"Gemini error: {e}")

    mat_id = str(uuid.uuid4())
    db = get_db()
    db.execute(
        "INSERT INTO ai_materials (id, session_id, filename, text_content, mime_type, analysis) VALUES (?,?,?,?,?,?)",
        (mat_id, session, fname, text[:20000], mime, json.dumps(analysis))
    )
    db.commit()
    db.close()
    return {"material_id": mat_id, "analysis": analysis, "mock": AI_MOCK_MODE}


@app.post("/api/ai-test/generate")
async def ai_test_generate(request: Request):
    d = await request.json()
    mat_id = d.get("material_id", "")
    count  = max(1, min(int(d.get("question_count", 5)), 15))

    db = get_db()
    mat = db.execute("SELECT * FROM ai_materials WHERE id=?", (mat_id,)).fetchone()
    if not mat:
        db.close()
        raise HTTPException(404, "Material not found")

    analysis = json.loads(mat["analysis"])

    if AI_MOCK_MODE:
        result = _mock_generate(count)
    else:
        topics_txt = ", ".join(t["name"] for t in analysis.get("topics", []))
        prompt = (
            f"Tạo {count} câu hỏi Toán cho học sinh dựa trên nội dung sau.\n"
            f"Chủ đề: {topics_txt}\n"
            f"Độ khó tổng thể: {analysis.get('overall_difficulty','intermediate')}\n"
            f"Tóm tắt tài liệu: {analysis.get('summary','')}\n\n"
            "Yêu cầu:\n"
            "- Câu hỏi phải có đáp án số (hoặc biểu thức) cụ thể, tính được\n"
            "- Viết song ngữ vi+en\n"
            "- time_limit_seconds: easy=120, medium=300, hard=600\n"
            "- reference_answer phải là chuỗi số có thể so sánh trực tiếp\n"
            "- reference_solution_steps là danh sách các bước giải ngắn gọn"
        )
        try:
            result = await _gemini_json(prompt, _TEST_GEN_SCHEMA)
        except Exception as e:
            db.close()
            raise HTTPException(502, f"Gemini error: {e}")

    test_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO ai_tests (id, material_id, title, questions, status) VALUES (?,?,?,?,'ready')",
        (test_id, mat_id, f"Đề AI — {analysis.get('summary','')[:60]}", json.dumps(result["questions"]))
    )
    db.commit()
    db.close()
    return {
        "test_id": test_id,
        "question_count": len(result["questions"]),
        "mock": AI_MOCK_MODE,
    }


@app.post("/api/ai-test/{test_id}/start")
async def ai_test_start(test_id: str):
    db = get_db()
    test = db.execute("SELECT * FROM ai_tests WHERE id=?", (test_id,)).fetchone()
    if not test:
        db.close()
        raise HTTPException(404, "Test not found")

    questions = json.loads(test["questions"])
    if not questions:
        db.close()
        raise HTTPException(400, "No questions in test")

    max_score = sum(q.get("max_score", 10) for q in questions)
    attempt_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO ai_attempts (id, test_id, max_score) VALUES (?,?,?)",
        (attempt_id, test_id, max_score)
    )
    db.commit()
    db.close()

    first_q = _serve_q(attempt_id, questions[0], 0)
    return {
        "attempt_id": attempt_id,
        "total_questions": len(questions),
        "max_score": max_score,
        "current_question": first_q,
        "mock": AI_MOCK_MODE,
    }


@app.post("/api/ai-test/attempt/{attempt_id}/submit")
async def ai_test_submit(attempt_id: str, request: Request):
    d = await request.json()
    ans_type  = d.get("answer_type", "typed")
    ans_text  = (d.get("answer_text") or "").strip()
    ans_b64   = d.get("answer_image_base64", "")
    img_mime  = d.get("image_mime", "image/jpeg")

    db = get_db()
    attempt = db.execute("SELECT * FROM ai_attempts WHERE id=?", (attempt_id,)).fetchone()
    if not attempt:
        db.close()
        raise HTTPException(404, "Attempt not found")

    qa = db.execute(
        "SELECT * FROM ai_qa WHERE attempt_id=? AND submitted_at='' ORDER BY served_at DESC LIMIT 1",
        (attempt_id,)
    ).fetchone()
    if not qa:
        db.close()
        raise HTTPException(404, "No active question")

    test  = db.execute("SELECT * FROM ai_tests WHERE id=?", (attempt["test_id"],)).fetchone()
    questions = json.loads(test["questions"])
    q_idx = qa["q_idx"]
    question = questions[q_idx]

    now_ts = time.time()
    deadline_ts = time.mktime(time.strptime(qa["deadline_at"], "%Y-%m-%dT%H:%M:%SZ"))
    time_expired = now_ts > deadline_ts + (GRACE_MS / 1000)

    if AI_MOCK_MODE or (ans_type == "typed" and not ans_b64):
        if AI_MOCK_MODE:
            grading = _mock_grade(ans_text, question["reference_answer"], question["question_text"]["vi"])
        else:
            prompt = (
                f"Câu hỏi: {question['question_text']['vi']}\n"
                f"Đáp án mẫu: {question['reference_answer']}\n"
                f"Các bước giải mẫu: {'; '.join(question.get('reference_solution_steps', []))}\n"
                f"Bài làm của học sinh: {ans_text or '(trống)'}\n\n"
                "Chấm điểm bài làm trên (tối đa 10 điểm). "
                "Chấp nhận đáp án tương đương về giá trị (vd: '2,−3' = '−3,2'). "
                "Nếu bài trống hoặc hết giờ, cho 0 điểm."
            )
            try:
                grading = await _gemini_json(prompt, _GRADE_SCHEMA)
            except Exception as e:
                db.close()
                raise HTTPException(502, f"Gemini error: {e}")
    else:
        prompt = (
            f"Câu hỏi toán: {question['question_text']['vi']}\n"
            f"Đáp án mẫu: {question['reference_answer']}\n"
            f"Các bước giải mẫu: {'; '.join(question.get('reference_solution_steps', []))}\n\n"
            "Trong ảnh là bài giải tay viết của học sinh. Hãy:\n"
            "1. Đọc và ghi lại bài làm (student_answer_transcribed)\n"
            "2. So sánh với đáp án mẫu và chấm điểm (0–10)\n"
            "3. Phân loại lỗi và cho nhận xét song ngữ vi+en"
        )
        try:
            grading = await _gemini_vision_json(prompt, ans_b64, img_mime, _GRADE_SCHEMA)
        except Exception as e:
            db.close()
            raise HTTPException(502, f"Gemini error: {e}")

    if time_expired:
        grading["score_awarded"] = 0
        grading["is_correct"] = False

    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_ts))
    db.execute(
        "UPDATE ai_qa SET submitted_at=?, answer_type=?, answer_text=?, answer_b64=?, grading=? WHERE id=?",
        (now_str, ans_type, ans_text, ans_b64[:500] if ans_b64 else "",
         json.dumps(grading), qa["id"])
    )
    db.commit()

    next_idx = q_idx + 1
    response = {"time_expired": time_expired, "grading": grading}

    if next_idx < len(questions):
        response["completed"] = False
        response["next_question"] = _serve_q(attempt_id, questions[next_idx], next_idx)
    else:
        all_qa = db.execute(
            "SELECT grading FROM ai_qa WHERE attempt_id=? AND submitted_at!=''", (attempt_id,)
        ).fetchall()
        total = sum(json.loads(r["grading"]).get("score_awarded", 0) for r in all_qa)
        db.execute(
            "UPDATE ai_attempts SET status='completed', total_score=?, completed_at=? WHERE id=?",
            (total, now_str, attempt_id)
        )
        db.commit()
        response["completed"] = True

    db.close()
    return response


@app.get("/api/ai-test/attempt/{attempt_id}/review")
async def ai_test_review(attempt_id: str):
    db = get_db()
    attempt = db.execute("SELECT * FROM ai_attempts WHERE id=?", (attempt_id,)).fetchone()
    if not attempt:
        db.close()
        raise HTTPException(404, "Attempt not found")
    if attempt["status"] != "completed":
        db.close()
        raise HTTPException(409, "Attempt not completed")

    if attempt["review"]:
        cached = json.loads(attempt["review"])
        db.close()
        return {**cached,
                "total_score": attempt["total_score"],
                "max_score": attempt["max_score"]}

    rows = db.execute(
        "SELECT q_idx, grading FROM ai_qa WHERE attempt_id=? AND submitted_at!='' ORDER BY q_idx",
        (attempt_id,)
    ).fetchall()
    test = db.execute(
        "SELECT questions FROM ai_tests WHERE id=?", (attempt["test_id"],)
    ).fetchone()
    questions = json.loads(test["questions"])

    items = []
    for row in rows:
        g = json.loads(row["grading"])
        q = questions[row["q_idx"]] if row["q_idx"] < len(questions) else {}
        items.append({
            "topic": q.get("topic", "Khác"),
            "is_correct": bool(g.get("is_correct")),
            "score": g.get("score_awarded", 0),
            "error_type": g.get("error_type", "none"),
        })

    if AI_MOCK_MODE:
        review = _mock_review(items)
    else:
        items_txt = "\n".join(
            f"- Chủ đề: {it['topic']}, Đúng: {it['is_correct']}, "
            f"Điểm: {it['score']}/10, Loại lỗi: {it['error_type']}"
            for it in items
        )
        prompt = (
            "Học sinh vừa hoàn thành đề thi với kết quả sau:\n"
            f"{items_txt}\n\n"
            "Hãy tổng kết điểm mạnh, điểm yếu và gợi ý tài liệu ôn tập phù hợp. "
            "Trả lời song ngữ vi+en, cụ thể và thực tế."
        )
        try:
            review = await _gemini_json(prompt, _REVIEW_SCHEMA)
        except Exception as e:
            db.close()
            raise HTTPException(502, f"Gemini error: {e}")

    db.execute("UPDATE ai_attempts SET review=? WHERE id=?", (json.dumps(review), attempt_id))
    db.commit()
    db.close()
    return {**review, "total_score": attempt["total_score"], "max_score": attempt["max_score"]}


# ═════════════════════════════════════════════════════════════════════════════
# ── DUOMATH: MATHMAP COMMENTS, CLANS, EVENTS & CHANGELOG API ─────────────────
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/api/mathmaps/{map_id}/comments")
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
            (map_id, limit, (page - 1) * limit)
        ).fetchall()

        upvoted_ids = set()
        if current_uid:
            up_rows = db.execute(
                "SELECT comment_id FROM comment_upvotes WHERE user_id=?", (str(current_uid),)
            ).fetchall()
            upvoted_ids = {r["comment_id"] for r in up_rows}

        comments = []
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
                "replies": []
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


@app.post("/api/mathmaps/{map_id}/comments")
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
            (comment_id, map_id, "u_anon", author, user_rank, parent_id, body, now_str)
        )
        db.commit()
        return {"success": True, "comment_id": comment_id, "created_at": now_str}
    finally:
        db.close()


@app.post("/api/comments/{comment_id}/upvote")
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


@app.post("/api/comments/{comment_id}/report")
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
            (report_id, comment_id, reporter_id, reason, detail, now_str)
        )
        db.execute("UPDATE mathmap_comments SET report_count = report_count + 1 WHERE id=?", (comment_id,))
        db.commit()
        return {"success": True, "message": "Báo cáo đã được ghi nhận"}
    finally:
        db.close()


# ── Clans API ─────────────────────────────────────────────────────────────────

@app.get("/api/clans")
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
                    "total_xp": 142000, "wins": 23, "losses": 6, "members_count": 86
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
                    "total_xp": 128000, "wins": 19, "losses": 8, "members_count": 72
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
                    "total_xp": 115000, "wins": 17, "losses": 5, "members_count": 64
                }
            ]
        return {"clans": clans}
    finally:
        db.close()


@app.post("/api/clans")
async def create_clan(request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    try:
        if is_fb:
            u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
        else:
            u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
        if not u:
            raise HTTPException(404, "User not found")

        body = await request.json()
        cid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        db.execute("""
            INSERT INTO clans (id, name, tag, description, crest_gradient, avatar_url, banner_url, privacy, level, current_xp, xp_to_next, total_xp, wins, losses, created_at, owner_user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1000, 0, 0, 0, ?, ?)
        """, (
            cid,
            body.get("name", "New Clan"),
            body.get("tag", "#CLAN"),
            body.get("description", ""),
            body.get("crest_gradient", "linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)"),
            body.get("avatar_url", ""),
            body.get("banner_url", ""),
            body.get("privacy", "open"),
            now,
            str(u["id"])
        ))

        # Add creator as owner
        db.execute("""
            INSERT OR REPLACE INTO clan_members (clan_id, user_id, username, role, rank, xp_contributed, joined_at)
            VALUES (?, ?, ?, 'owner', 'SS', 0, ?)
        """, (cid, str(u["id"]), u["username"], now))

        db.commit()
        return {"ok": True, "clan_id": cid}
    finally:
        db.close()


@app.get("/api/clans/{clan_id}")
async def get_clan_detail(clan_id: str):
    db = get_db()
    try:
        row = db.execute("SELECT * FROM clans WHERE id=?", (clan_id,)).fetchone()
        if not row:
            if clan_id == "thth":
                return {
                    "id": "thth", "name": "Thánh Toán Học", "tag": "#THTH",
                    "description": "Clan luyện đề thi chuyên toán và THPT QG, sinh hoạt mỗi tối thứ 3 & thứ 6.",
                    "level": 24, "current_xp": 8200, "xp_to_next": 12000,
                    "total_xp": 142000, "wins": 23, "losses": 6, "member_count": 86,
                    "avatar_url": "", "banner_url": "",
                    "crest_gradient": "linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)",
                    "achievements": [
                        {"title": "🏆 Quán Quân Giải Đấu Mùa Hè 2026", "date": "10/09/2026", "badge": "Gold", "xp": "+15,000 XP"},
                        {"title": "🥈 Á Quân Đấu Trường Clan Liên Trường", "date": "05/09/2026", "badge": "Silver", "xp": "+8,000 XP"},
                        {"title": "⭐ Top 1 Bảng Xếp Hạng Tháng 8", "date": "31/08/2026", "badge": "SeasonTop", "xp": "+5,000 XP"}
                    ]
                }
            raise HTTPException(404, "Clan not found")

        clan = dict(row)
        members = db.execute("SELECT * FROM clan_members WHERE clan_id=? ORDER BY xp_contributed DESC", (clan_id,)).fetchall()
        clan["members"] = [dict(m) for m in members]
        clan["member_count"] = len(members) if members else clan.get("member_count", 1)
        clan["achievements"] = [
            {"title": "🏆 Quán Quân Giải Đấu Mùa Hè 2026", "date": "10/09/2026", "badge": "Gold", "xp": "+15,000 XP"},
            {"title": "🥈 Á Quân Đấu Trường Clan Liên Trường", "date": "05/09/2026", "badge": "Silver", "xp": "+8,000 XP"},
            {"title": "⭐ Top 1 Bảng Xếp Hạng Tháng 8", "date": "31/08/2026", "badge": "SeasonTop", "xp": "+5,000 XP"}
        ]
        return clan
    finally:
        db.close()


@app.get("/api/clans/{clan_id}/messages")
async def get_clan_messages(clan_id: str, limit: int = 50):
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM clan_messages WHERE clan_id=? ORDER BY created_at ASC LIMIT ?",
            (clan_id, limit)
        ).fetchall()
        msgs = [dict(r) for r in rows]
        if not msgs:
            # Seed default welcome messages for demo
            msgs = [
                {"id": "m1", "clan_id": clan_id, "user_id": "u1", "username": "william_math", "role": "owner", "avatar_url": "", "message": "Chào mừng các thành viên mới gia nhập Clan! Lịch sinh hoạt tối nay lúc 20:00 nhé.", "created_at": "2026-08-23T19:00:00"},
                {"id": "m2", "clan_id": clan_id, "user_id": "u2", "username": "co_giao_lan", "role": "officer", "avatar_url": "", "message": "Tất cả mọi người nhớ đăng ký Giải Đấu Mùa Hè trên trang Sự Kiện để nhận x1.5 XP nhé! ⚡", "created_at": "2026-08-23T19:15:00"},
                {"id": "m3", "clan_id": clan_id, "user_id": "u3", "username": "minh_toan_hoc", "role": "officer", "avatar_url": "", "message": "Ai cần luyện chung đề tổ hợp xác suất thì tạo phòng Đấu Nhóm nhé!", "created_at": "2026-08-23T19:40:00"}
            ]
        return {"messages": msgs}
    finally:
        db.close()


@app.post("/api/clans/{clan_id}/messages")
async def post_clan_message(clan_id: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    try:
        if is_fb:
            u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
        else:
            u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
        if not u:
            raise HTTPException(404, "User not found")

        body = await request.json()
        msg_text = body.get("message", "").strip()
        if not msg_text:
            raise HTTPException(400, "Message cannot be empty")

        mid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # Check clan role
        mem = db.execute("SELECT role FROM clan_members WHERE clan_id=? AND user_id=?", (clan_id, str(u["id"]))).fetchone()
        role = mem["role"] if mem else "member"

        db.execute("""
            INSERT INTO clan_messages (id, clan_id, user_id, username, avatar_url, role, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (mid, clan_id, str(u["id"]), u["username"], u["avatar_url"] or "", role, msg_text, now))
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
                "created_at": now
            }
        }
    finally:
        db.close()


@app.get("/api/users/{user_id}/clan")
async def get_user_clan(user_id: str):
    db = get_db()
    try:
        mem = db.execute("SELECT * FROM clan_members WHERE user_id=?", (user_id,)).fetchone()
        if not mem:
            # Fallback default clan for demo
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
                        {"title": "⭐ Top 1 Bảng Xếp Hạng Tháng 8", "date": "31/08/2026", "badge": "SeasonTop", "xp": "+5,000 XP"}
                    ],
                    "members": [
                        {"id": "u1", "username": "william_math", "role": "owner", "rank": "SS", "xp_contributed": 42800, "matches_played": 28},
                        {"id": "u2", "username": "co_giao_lan", "role": "officer", "rank": "SS", "xp_contributed": 38400, "matches_played": 24},
                        {"id": "u3", "username": "minh_toan_hoc", "role": "officer", "rank": "A", "xp_contributed": 26100, "matches_played": 19},
                        {"id": "u4", "username": "huy_math99", "role": "member", "rank": "B", "xp_contributed": 18500, "matches_played": 15},
                        {"id": "u5", "username": "thu_trang_2k9", "role": "member", "rank": "S", "xp_contributed": 16200, "matches_played": 14},
                    ]
                },
                "user_role": "owner",
                "xp_contributed": 42800
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
            {"title": "⭐ Top 1 Bảng Xếp Hạng Tháng 8", "date": "31/08/2026", "badge": "SeasonTop", "xp": "+5,000 XP"}
        ]

        return {
            "has_clan": True,
            "clan": c_dict,
            "user_role": mem["role"],
            "xp_contributed": mem["xp_contributed"]
        }
    finally:
        db.close()


@app.get("/api/clans/leaderboard")
async def get_clan_leaderboard(period: str = "week"):
    DATA = {
        "week": [
            {"rank": 1, "id": "thth", "name": "Thánh Toán Học", "tag": "TH", "members": 86, "xp": 18420, "delta": 3},
            {"rank": 2, "id": "shb",  name: "Đội Số Học Bay", tag: "SH", "members": 72, "xp": 17955, "delta": -1},
            {"rank": 3, "id": "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", "members": 64, "xp": 16110, "delta": 5},
            {"rank": 4, "id": "hsvc", name: "Hàm Số Vô Cực", tag: "HS", "members": 51, "xp": 14870, "delta": -2},
            {"rank": 5, "id": "mtvn", name: "Ma Trận Việt Nam", tag: "MT", "members": 43, "xp": 13200, "delta": 1},
        ],
        "month": [
            {"rank": 1, "id": "thth", "name": "Thánh Toán Học", "tag": "TH", "members": 86, "xp": 78500, "delta": 2},
            {"rank": 2, "id": "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", "members": 64, "xp": 71200, "delta": 3},
            {"rank": 3, "id": "shb",  name: "Đội Số Học Bay", tag: "SH", "members": 72, "xp": 69800, "delta": -1},
            {"rank": 4, "id": "hsvc", name: "Hàm Số Vô Cực", tag: "HS", "members": 51, "xp": 62400, "delta": 0},
        ],
        "season": [
            {"rank": 1, "id": "thth", "name": "Thánh Toán Học", "tag": "TH", "members": 86, "xp": 142000, "delta": 1},
            {"rank": 2, "id": "shb",  name: "Đội Số Học Bay", tag: "SH", "members": 72, "xp": 138500, "delta": 0},
            {"rank": 3, "id": "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", "members": 64, "xp": 115000, "delta": 2},
            {"rank": 4, "id": "mtvn", name: "Ma Trận Việt Nam", tag: "MT", "members": 43, "xp": 98000, "delta": -1},
        ],
        "alltime": [
            {"rank": 1, "id": "thth", "name": "Thánh Toán Học", "tag": "TH", "members": 86, "xp": 482000, "delta": 0},
            {"rank": 2, "id": "shb",  name: "Đội Số Học Bay", tag: "SH", "members": 72, "xp": 415000, "delta": 0},
            {"rank": 3, "id": "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", "members": 64, "xp": 368000, "delta": 1},
            {"rank": 4, "id": "mtvn", name: "Ma Trận Việt Nam", tag: "MT", "members": 43, "xp": 294000, "delta": -1},
            {"rank": 5, "id": "hsvc", name: "Hàm Số Vô Cực", tag: "HS", "members": 51, "xp": 248000, "delta": 0},
        ]
    }
    return {
        "period": period,
        "leaderboard": DATA.get(period, DATA["week"])
    }


# ── Tournaments, Events & Changelog API ───────────────────────────────────────

@app.get("/api/tournaments/featured")
async def get_featured_tournament():
    db = get_db()
    row = db.execute(
        "SELECT * FROM tournaments WHERE is_featured=1 AND status != 'finished' ORDER BY created_at DESC LIMIT 1"
    ).fetchone()
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
    # Fallback stub
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


@app.get("/api/tournaments")
async def list_tournaments(status: str = "", size: str = "", limit: int = 20):
    db = get_db()
    q = "SELECT * FROM tournaments WHERE 1=1"
    params = []
    if status:
        q += " AND status=?"; params.append(status)
    if size:
        q += " AND size=?"; params.append(size)
    q += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    rows = db.execute(q, params).fetchall()
    db.close()
    return {"tournaments": [dict(r) for r in rows]}


@app.post("/api/tournaments")
async def create_tournament(request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()

    # Look up user
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u:
        db.close(); raise HTTPException(404, "User not found")

    body = await request.json()
    size = body.get("size", "small")

    # Permission check:
    # admin → can create any size
    # event_organizer_global → can create small, large requires approval
    # others → forbidden
    is_admin = bool(u["is_admin"])
    is_global_organizer = False
    org_row = db.execute(
        "SELECT 1 FROM event_organizers WHERE user_id=? AND tournament_id='*'",
        (str(u["id"]),)
    ).fetchone()
    if org_row:
        is_global_organizer = True

    if not is_admin and not is_global_organizer:
        db.close(); raise HTTPException(403, "Insufficient permissions to create tournaments")

    pending = 0
    if not is_admin and size == "large":
        pending = 1  # Requires admin approval

    tid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    xp_mult = 1.5 if size == "large" else 1.2

    db.execute("""
        INSERT INTO tournaments
        (id, title, tag, description, rules, status, size, xp_multiplier, starts_at, ends_at,
         play_mode, min_clan_members, max_participants, prize_json, is_featured,
         created_by, pending_approval, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
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
        pending, now
    ))
    db.commit()
    db.close()
    return {"ok": True, "id": tid, "pending_approval": bool(pending)}


@app.get("/api/tournaments/{tid}")
async def get_tournament(tid: str):
    db = get_db()
    row = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(404, "Tournament not found")
    d = dict(row)
    d["prize_json"] = json.loads(d.get("prize_json") or "[]")
    return d


@app.put("/api/tournaments/{tid}")
async def update_tournament(tid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u:
        db.close(); raise HTTPException(404, "User not found")

    row = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
    if not row:
        db.close(); raise HTTPException(404, "Tournament not found")

    is_admin = bool(u["is_admin"])
    is_organizer = bool(db.execute(
        "SELECT 1 FROM event_organizers WHERE tournament_id=? AND user_id=?",
        (tid, str(u["id"]))
    ).fetchone())

    if not is_admin and not is_organizer:
        db.close(); raise HTTPException(403, "Not authorized to edit this tournament")

    body = await request.json()
    fields, vals = [], []
    for key in ["title", "tag", "description", "rules", "status", "starts_at", "ends_at",
                "play_mode", "min_clan_members", "max_participants", "is_featured"]:
        if key in body:
            fields.append(f"{key}=?"); vals.append(body[key])
    if "prize_json" in body:
        fields.append("prize_json=?"); vals.append(json.dumps(body["prize_json"]))

    # Large tournament approval: if non-admin tries to set size=large, flag pending
    if "size" in body:
        new_size = body["size"]
        fields.append("size=?"); vals.append(new_size)
        mult = 1.5 if new_size == "large" else 1.2
        fields.append("xp_multiplier=?"); vals.append(mult)
        if not is_admin and new_size == "large":
            fields.append("pending_approval=?"); vals.append(1)
            fields.append("status=?"); vals.append("pending_approval")

    if fields:
        vals.append(tid)
        db.execute(f"UPDATE tournaments SET {', '.join(fields)} WHERE id=?", vals)
        db.commit()
    db.close()
    return {"ok": True}


@app.post("/api/tournaments/{tid}/approve")
async def approve_tournament(tid: str, request: Request):
    """Admin approves a large tournament."""
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u or not u["is_admin"]:
        db.close(); raise HTTPException(403, "Admin only")
    db.execute(
        "UPDATE tournaments SET pending_approval=0, status='upcoming', approved_by=? WHERE id=?",
        (str(u["id"]), tid)
    )
    db.commit(); db.close()
    return {"ok": True}


@app.delete("/api/tournaments/{tid}")
async def delete_tournament(tid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u or not u["is_admin"]:
        db.close(); raise HTTPException(403, "Admin only")
    db.execute("DELETE FROM tournaments WHERE id=?", (tid,))
    db.commit(); db.close()
    return {"ok": True}


# ── Tournament Participants ────────────────────────────────────────────────────

@app.post("/api/tournaments/{tid}/register")
async def register_tournament(tid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u:
        db.close(); raise HTTPException(404, "User not found")

    tour = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
    if not tour:
        db.close(); raise HTTPException(404, "Tournament not found")
    if tour["status"] not in ("upcoming", "active"):
        db.close(); raise HTTPException(400, "Tournament is not open for registration")

    body = await request.json()
    clan_id = body.get("clan_id", "")
    existing = db.execute(
        "SELECT 1 FROM tournament_participants WHERE tournament_id=? AND user_id=?",
        (tid, str(u["id"]))
    ).fetchone()
    if existing:
        db.close()
        return {"ok": True, "already_registered": True, "play_url": f"/mrm/multiplayer?tournament={tid}&mode=tournament"}

    now = datetime.now(timezone.utc).isoformat()
    db.execute("""
        INSERT INTO tournament_participants (tournament_id, user_id, username, clan_id, registered_at)
        VALUES (?,?,?,?,?)
    """, (tid, str(u["id"]), u["username"], clan_id, now))
    db.commit()

    count = db.execute(
        "SELECT COUNT(*) as c FROM tournament_participants WHERE tournament_id=?", (tid,)
    ).fetchone()["c"]
    db.close()

    return {
        "ok": True,
        "registered": True,
        "participant_count": count,
        "play_url": f"/mrm/multiplayer?tournament={tid}&mode=tournament",
    }


@app.delete("/api/tournaments/{tid}/register")
async def unregister_tournament(tid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u:
        db.close(); raise HTTPException(404, "User not found")
    db.execute(
        "DELETE FROM tournament_participants WHERE tournament_id=? AND user_id=?",
        (tid, str(u["id"]))
    )
    db.commit(); db.close()
    return {"ok": True}


@app.get("/api/tournaments/{tid}/participants")
async def get_tournament_participants(tid: str, limit: int = 50):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM tournament_participants WHERE tournament_id=? ORDER BY score DESC LIMIT ?",
        (tid, limit)
    ).fetchall()
    db.close()
    return {"participants": [dict(r) for r in rows]}


@app.get("/api/tournaments/{tid}/leaderboard")
async def get_tournament_leaderboard(tid: str, limit: int = 10):
    db = get_db()
    rows = db.execute(
        """SELECT p.*, u.avatar_url FROM tournament_participants p
           LEFT JOIN users u ON u.id = p.user_id
           WHERE p.tournament_id=? ORDER BY p.score DESC LIMIT ?""",
        (tid, limit)
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
    db.close()
    return {"leaderboard": result}


@app.post("/api/tournaments/{tid}/participants/{uid}/score")
async def add_participant_score(tid: str, uid: str, request: Request):
    """Called by game engine after a tournament match ends. Applies xp_multiplier to XP."""
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    tour = db.execute("SELECT * FROM tournaments WHERE id=?", (tid,)).fetchone()
    if not tour:
        db.close(); raise HTTPException(404, "Tournament not found")

    body = await request.json()
    points_earned = int(body.get("points", 0))
    xp_earned = int(body.get("xp", 0))
    multiplier = float(tour["xp_multiplier"]) if tour["xp_multiplier"] else 1.2
    bonus_xp = int(xp_earned * multiplier)

    db.execute("""
        UPDATE tournament_participants
        SET score = score + ?, matches_played = matches_played + 1
        WHERE tournament_id=? AND user_id=?
    """, (points_earned, tid, uid))

    # Apply bonus XP to user account
    db.execute("UPDATE users SET xp = COALESCE(xp, 0) + ? WHERE id=?", (bonus_xp, uid))
    db.commit(); db.close()
    return {"ok": True, "bonus_xp": bonus_xp, "multiplier": multiplier}


# ── Event Organizers ──────────────────────────────────────────────────────────

@app.get("/api/tournaments/{tid}/organizers")
async def get_organizers(tid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u or not u["is_admin"]:
        db.close(); raise HTTPException(403, "Admin only")
    rows = db.execute(
        "SELECT * FROM event_organizers WHERE tournament_id=?", (tid,)
    ).fetchall()
    db.close()
    return {"organizers": [dict(r) for r in rows]}


@app.post("/api/tournaments/{tid}/organizers")
async def assign_organizer(tid: str, request: Request):
    """Admin assigns an event organizer to a tournament."""
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u or not u["is_admin"]:
        db.close(); raise HTTPException(403, "Admin only")

    body = await request.json()
    target_uid = str(body.get("user_id", ""))
    role = body.get("role", "organizer")

    target = db.execute("SELECT * FROM users WHERE id=?", (target_uid,)).fetchone()
    if not target:
        db.close(); raise HTTPException(404, "Target user not found")

    now = datetime.now(timezone.utc).isoformat()
    db.execute("""
        INSERT OR REPLACE INTO event_organizers (tournament_id, user_id, username, role, assigned_at)
        VALUES (?,?,?,?,?)
    """, (tid, target_uid, target["username"], role, now))
    db.commit(); db.close()
    return {"ok": True}


@app.delete("/api/tournaments/{tid}/organizers/{uid}")
async def remove_organizer(tid: str, uid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u or not u["is_admin"]:
        db.close(); raise HTTPException(403, "Admin only")
    db.execute(
        "DELETE FROM event_organizers WHERE tournament_id=? AND user_id=?", (tid, uid)
    )
    db.commit(); db.close()
    return {"ok": True}


@app.post("/api/organizers/grant-global")
async def grant_global_organizer(request: Request):
    """Admin grants user ability to create small tournaments independently."""
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u or not u["is_admin"]:
        db.close(); raise HTTPException(403, "Admin only")

    body = await request.json()
    target_uid = str(body.get("user_id", ""))
    target = db.execute("SELECT * FROM users WHERE id=?", (target_uid,)).fetchone()
    if not target:
        db.close(); raise HTTPException(404, "User not found")

    now = datetime.now(timezone.utc).isoformat()
    db.execute("""
        INSERT OR REPLACE INTO event_organizers (tournament_id, user_id, username, role, assigned_at)
        VALUES ('*',?,?,'global_organizer',?)
    """, (target_uid, target["username"], now))
    db.commit(); db.close()
    return {"ok": True, "message": f"{target['username']} can now create small tournaments"}


# ── Tournament Rooms (Multiplayer) ────────────────────────────────────────────

@app.get("/api/tournaments/{tid}/rooms")
async def get_tournament_rooms(tid: str):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM tournament_rooms WHERE tournament_id=? AND status='waiting' ORDER BY created_at DESC",
        (tid,)
    ).fetchall()
    db.close()
    return {"rooms": [dict(r) for r in rows]}


@app.post("/api/tournaments/{tid}/rooms")
async def create_tournament_room(tid: str, request: Request):
    identity, is_fb = await get_firebase_uid_or_backend_id(request)
    db = get_db()
    if is_fb:
        u = db.execute("SELECT * FROM users WHERE firebase_uid=?", (identity,)).fetchone()
    else:
        u = db.execute("SELECT * FROM users WHERE id=?", (identity,)).fetchone()
    if not u:
        db.close(); raise HTTPException(404, "User not found")

    # Must be registered in the tournament
    reg = db.execute(
        "SELECT 1 FROM tournament_participants WHERE tournament_id=? AND user_id=? AND status='active'",
        (tid, str(u["id"]))
    ).fetchone()
    if not reg:
        db.close(); raise HTTPException(403, "You must register for this tournament first")

    body = await request.json()
    room_mode = body.get("room_mode", "individual")
    clan_a_id = body.get("clan_a_id", "")
    clan_b_id = body.get("clan_b_id", "")
    max_players = int(body.get("max_players", 2))
    mathmap_id = body.get("mathmap_id", "")

    # Clan mode: verify user is clan leader/sub-leader
    if room_mode == "clan" and clan_a_id:
        clan_role = db.execute(
            "SELECT role FROM clan_members WHERE clan_id=? AND user_id=?",
            (clan_a_id, str(u["id"]))
        ).fetchone()
        if not clan_role or clan_role["role"] not in ("owner", "leader", "sub_leader"):
            db.close(); raise HTTPException(403, "Only clan leader or sub-leader can create clan tournament rooms")

    rid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db.execute("""
        INSERT INTO tournament_rooms
        (id, tournament_id, host_user_id, host_username, room_mode, clan_a_id, clan_b_id,
         max_players, mathmap_id, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (rid, tid, str(u["id"]), u["username"], room_mode, clan_a_id, clan_b_id,
          max_players, mathmap_id, now))
    db.commit(); db.close()

    return {
        "ok": True,
        "room_id": rid,
        "redirect_url": f"/mrm/multiplayer?tournament={tid}&room={rid}&mode=tournament",
    }


@app.patch("/api/tournaments/{tid}/rooms/{rid}")
async def update_tournament_room_status(tid: str, rid: str, request: Request):
    body = await request.json()
    new_status = body.get("status", "waiting")
    db = get_db()
    db.execute(
        "UPDATE tournament_rooms SET status=? WHERE id=? AND tournament_id=?",
        (new_status, rid, tid)
    )
    db.commit(); db.close()
    return {"ok": True}


@app.get("/api/events")
async def get_events():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM events ORDER BY created_at DESC LIMIT 20"
    ).fetchall()
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


@app.get("/api/changelog")
async def get_changelog():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM changelog_entries ORDER BY date DESC LIMIT 20"
    ).fetchall()
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


# ── AI Addons: Geometry Engine & Video Enhancer ───────────────────────────────
@app.post("/api/geometry/preprocess")
async def api_geometry_preprocess(req: Request):
    """Bóc tách sơ đồ hình học (GeoSolver + Qwen2.5-VL) và sinh mã AlphaGeometry DSL."""
    try:
        data = await req.json()
        img = data.get("image")
        text = data.get("text", "")
        vision_text = ""
        if img and _vision_agent.is_configured():
            v_text, v_ok = await _vision_agent.extract_with_fallback(img, user_hint=text)
            if v_ok and v_text:
                vision_text = v_text
        from geometry_engine import process_geometry_image
        res = process_geometry_image(img, text, vision_text=vision_text)
        return JSONResponse(res)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/geometry/alphageometry/translate")
async def api_alphageometry_translate(req: Request):
    """Chuyển đổi bài toán hình học sang ngôn ngữ hình thức AlphaGeometry DSL."""
    try:
        data = await req.json()
        text = data.get("text", "")
        from geometry_engine import AlphaGeometryTranslator, SymbolicGeometryEngine
        formal_info = AlphaGeometryTranslator.to_formal_dsl(text)
        deduction = SymbolicGeometryEngine.deduce(formal_info)
        return JSONResponse({**formal_info, **deduction})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/video/enhance")
async def api_video_enhance(req: Request):
    """Khởi động pipeline phục hồi & nâng cấp video AI (CodeFormer + Real-ESRGAN + RIFE)."""
    try:
        data = await req.json()
        video_path = data.get("video_path") or data.get("url")
        options = data.get("options", {})
        from video_enhancer import enhance_user_video_async
        task_id = enhance_user_video_async(video_path, options)
        return JSONResponse({"task_id": task_id, "status": "queued", "message": "Video enhancement job started"})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/video/enhance/status/{task_id}")
async def api_video_enhance_status(task_id: str):
    """Kiểm tra tiến trình % và trạng thái xử lý video."""
    try:
        from video_enhancer import get_video_task_status
        st = get_video_task_status(task_id)
        if not st:
            return JSONResponse({"error": "Task not found"}, status_code=404)
        return JSONResponse(st)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn # pyright: ignore[reportMissingImports]
    port = int(os.environ.get("PORT", 5000))
    print(f"DuoMath API v4 (FastAPI + MathGPT) -> http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")

