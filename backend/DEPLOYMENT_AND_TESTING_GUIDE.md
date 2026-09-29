# Hướng Dẫn Triển Khai Môi Trường & Kiểm Thử Chatbot DuoMCB (Track A)

Tài liệu này cung cấp hướng dẫn đầy đủ, chi tiết từng bước dành cho kỹ sư và các Agent tự động để triển khai môi trường (environment deployment), cấu hình biến môi trường, chạy bộ kiểm thử (test suites) và vận hành hệ thống chatbot **DuoMCB (DuoMath Conversational Math Buddy)** theo **Hướng A (Tự vận hành 24/7 với Worked-Example RAG + Solver Hình Học Giải Tích)**.

---

## 1. Kiến Trúc Vận Hành Độc Lập (Track A Architecture)

DuoMCB được thiết kế theo tiêu chí **100% tự vận hành (self-operating), chi phí $0 (Free-tier API & local algorithms)**:
1. **Lõi suy luận (Core Brain):** Google Gemini (mặc định `gemini-3.6-flash`) kết hợp Groq Socratic API.
2. **Thị giác hình học (Vision Agent):** thang model MIỄN PHÍ mạnh nhất trên OpenRouter — mặc định `qwen/qwen3.8-27b:free` (AA Intelligence 33.7 / Coding 68.1 / Agentic 45.8, có thị giác) với chuỗi dự phòng `Gemma 4 31B → Dots 3 Note → Inkling → openrouter/free`. Ghi chú kiểm toán 26/09/2026: **không còn model `*-vl:free` chuyên dụng** (các slug cũ `ling-3.0-flash-vl:free`, `qwen2.5-vl-72b-instruct:free`, `gemma-3-27b-it:free` đã biến mất khỏi free tier).
3. **Tiền xử lý ảnh (Image Preprocessing):** Aspect-preserving uniform resize + letterbox padding 1024x1024 (chống méo hình học, méo góc, biến tròn thành elip) kèm tùy chọn lưới tọa độ pixel (`VISION_GRID_OVERLAY`).
4. **Bộ giải hình học giải tích (Analytic Construction Solver):** `geometry_construction_solver.py` tính tọa độ giải tích chính xác tuyệt đối cho 9 dạng dựng hình chuẩn (trực tâm, tâm ngoại tiếp, nội tiếp, trọng tâm, chân đường cao, trung điểm, giao điểm, đối xứng, điểm chia tỉ lệ), hỗ trợ giải chuỗi phụ thuộc (dependency chaining).
5. **Bộ Snapping & Kiểm định hình học:** `geometry_snapping.py` (làm tròn góc vuông 90°, thẳng hàng, tiếp tuyến) và `geometry_verification.py` (kiểm tra quan hệ hình học tránh ảo giác).
6. **Worked-Example RAG (Hybrid Dense + Sparse):** `math_problem_retrieval.py` tìm kiếm các bài toán mẫu đã giải tương tự bằng thuật toán **Reciprocal Rank Fusion (RRF)** kết hợp dense embedding tiếng Việt và TF-IDF thuần. Có cơ chế tự suy biến an toàn (graceful fallback) sang TF-IDF thuần (0-dependency, dùng NumPy) nếu thiếu package hoặc mạng.

---

## 2. Yêu Cầu Hệ Thống & Chuẩn Bị Môi Trường

### Yêu cầu tối thiểu
- **Hệ điều hành:** Linux / macOS / Windows (hỗ trợ cả PowerShell và Bash).
- **Python:** Phiên bản `>= 3.10` (khuyên dùng Python 3.10, 3.11 hoặc 3.12).
- **RAM:** Tối thiểu 2GB (chế độ TF-IDF fallback) hoặc 4GB (nếu bật mô hình embedding tiếng Việt).
- **GPU:** Không bắt buộc (100% các thành phần production đều chạy mượt mà trên CPU).

---

## 3. Các Bước Cài Đặt Từng Bước

### Bước 1: Điều hướng vào thư mục backend
```bash
cd duosteam/backend
```

### Bước 2: Tạo và kích hoạt môi trường ảo (Virtual Environment)
- **Trên Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```
- **Trên Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### Bước 3: Cài đặt thư viện phụ thuộc (Dependencies)
Cài đặt các gói cốt lõi từ `requirements.txt`:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> **Ghi chú về `sentence-transformers`:**
> - Nếu bạn muốn kích hoạt tính năng tìm kiếm ngữ nghĩa sâu (Dense Semantic Search) với mô hình `AITeamVN/Vietnamese_Embedding`, hãy đảm bảo `sentence-transformers` đã được cài đặt thành công.
> - Nếu môi trường của bạn không có kết nối internet tải model hoặc bị giới hạn RAM, hệ thống sẽ **tự động chuyển sang TF-IDF thuần** bằng NumPy mà không gây bất kỳ lỗi nào.

### Bước 4: Cấu hình biến môi trường (`.env`)
Tạo file `.env` dựa trên file mẫu `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` và điền các API key miễn phí tương ứng:
```env
# 1. Google Gemini API (Model đầu não miễn phí)
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
GEMINI_MODEL=gemini-3.6-flash

# 2. Groq API (Gợi ý Socratic song song - tùy chọn)
GROQ_API_KEY=gsk_...your_groq_key...

# 3. OpenRouter Free-Tier Vision Agent (Nhận diện hình học Olympiad)
OPENROUTER_API_KEY=sk-or-v1-...your_openrouter_key...
# Phase 4/Đợt 3 — thang model free mạnh nhất (kiểm chứng live 26/09/2026).
# OpenRouter chỉ nhận tối đa 3 model trong mảng `models`; slug chết làm cả
# request trả 400 (code tự loại slug chết rồi thử lại).
OPENROUTER_VISION_MODEL=qwen/qwen3.8-27b:free
OPENROUTER_VISION_FALLBACK_MODELS=google/gemma-4-31b-it:free,dots-studio/dots-3-note-preview:free,thinkingmachines/inkling:free,openrouter/free
OPENROUTER_CHAT_MODELS=qwen/qwen3.8-27b:free,nvidia/nemotron-3-ultra-550b-a55b:free,openrouter/free
OPENROUTER_TRANSLATE_MODELS=qwen/qwen3.8-27b:free,nvidia/nemotron-3-ultra-550b-a55b:free,openrouter/free
OPENROUTER_REPAIR_MODEL=qwen/qwen3.8-27b:free
TRANSLATE_TIER_ORDER=openrouter,gemini,groq
OPENROUTER_DAILY_BUDGET=800
# Đợt 4A — Verified MathReader (đọc đối chứng + cổng SymPy + đọc lại vùng zoom)
MATH_READER_MODELS=qwen/qwen3.8-27b:free,google/gemma-4-31b-it:free
MATH_READER_TIEBREAK_MODEL=dots-studio/dots-3-note-preview:free
AI_DUAL_READ=auto
# Đợt 4B — bộ giải có tool SymPy + hậu kiểm trước khi hiển thị đáp án
MATH_TOOLS_MODEL=qwen/qwen3.8-27b:free,nvidia/nemotron-3-ultra-550b-a55b:free,openrouter/free
MATH_CRITIC_MODEL=google/gemma-4-31b-it:free,nvidia/nemotron-3-ultra-550b-a55b:free,openrouter/free
MATH_VERIFY_MODE=auto
VISION_AGENT_ENABLED=true

# 4. Cấu hình Worked-Example RAG (Track A)
MATH_PROBLEM_INDEX_PATH=data/math_problems.jsonl
MATH_EMBEDDING_MODEL=AITeamVN/Vietnamese_Embedding

# 5. Tùy chọn lưới tọa độ khi debug nhận diện hình
VISION_GRID_OVERLAY=false
```

---

## 4. Chạy Bộ Kiểm Thử Tự Động (Automated Test Suites)

Để xác nhận hệ thống hoạt động chính xác trước khi khởi chạy server, hãy thực thi toàn bộ 4 bài test độc lập:

```bash
# 1. Kiểm tra bộ giải hình học giải tích (9 dạng dựng hình + chuỗi phụ thuộc)
python test_geometry_construction_solver.py

# 2. Kiểm tra bộ dọn dẹp tọa độ (snapping góc vuông, thẳng hàng, tỉ lệ)
python test_geometry_snapping.py

# 3. Kiểm tra cổng xác minh hình học (loại bỏ ảo giác)
python test_geometry_verification.py

# 4. Kiểm tra bộ truy xuất bài toán mẫu Hybrid RAG (TF-IDF + Embedding RRF)
python test_math_problem_retrieval.py

# 5. (Đợt 8 / 4I) Kiểm tra HỢP ĐỒNG TỪ VỰNG MathViz: kind hợp lệ, alias, thu điểm
#    lồng trong arc/sector/region, báo cáo render (_render), và từ vựng dựng hình.
python test_mathviz_contract.py

# 6. (Đợt 8 / 4I) Kiểm tra phân loại ĐỘ PHỨC TẠP của hình và bất biến tổng ngân sách
#    các chặng ≤ CHAT_REQUEST_TIMEOUT_S (đây là tổng trước đây vượt trần).
python test_diagram_complexity.py

# 7. (Đợt 8 / 4I) Kiểm tra nối dây ngân sách trong main.py: plan thay ngân sách cứng,
#    mọi lời gọi sinh câu trả lời đều bị chặn, soft-deadline trả kết quả một phần.
python test_chat_budget.py

# 8. (Đợt 8 / 4I) Kiểm tra tĩnh: các nhánh thoát sớm trong chat() (soft-deadline,
#    báo cáo render) không dùng tên nào trước khi nó được gán — lớp lỗi NameError
#    chỉ xuất hiện trên đường khó thử tay nhất. --selftest chứng minh cổng này bắt được.
python scripts/audit_bound_names.py --selftest
python scripts/audit_bound_names.py
```

Cổng tương ứng phía frontend (không cần cài dependency):

```bash
node scripts/check-mathviz-kinds.mjs   # hợp đồng từ vựng: Python ↔ mirror JS ↔ 3 renderer
node scripts/check-chat-errors.mjs     # thông điệp lỗi + thứ tự timeout + luật retry
```

### Tiêu chí vượt qua kiểm thử thành công:
Mỗi bài test sẽ hiển thị thông báo thành công tương ứng:
- `>>> ALL CONSTRUCTION & CANVAS SOLVER TESTS PASSED! <<<`
- `>>> ALL GEOMETRIC SNAPPING TESTS PASSED! <<<`
- `>>> ALL GEOMETRY VERIFICATION TESTS PASSED! <<<`
- `>>> ALL HYBRID RETRIEVAL TESTS PASSED! <<<`
- `>>> ALL MATHVIZ CONTRACT TESTS PASSED! <<<`
- `>>> ALL DIAGRAM COMPLEXITY TESTS PASSED! <<<`
- `ALL_CHAT_BUDGET_TESTS_PASSED`

---

## 5. Khởi Chạy Server Backend

### Khởi chạy chế độ phát triển (Development Mode):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Khởi chạy chế độ sản xuất (Production Mode):
- **Linux (Gunicorn + Uvicorn Workers):**
  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
  ```
- **Windows / Multiplatform:**
  ```bash
  uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
  ```

---

## 6. Kiểm Thử API Trực Tiếp (End-to-End Verification)

### Kiểm tra trạng thái hoạt động (Health Check):
```bash
curl http://localhost:8000/
```
*Phản hồi mong đợi: JSON chứa thông tin trạng thái backend DuoMath.*

### Kiểm tra hội thoại giải toán & RAG qua endpoint `/chat`:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cho tam giác ABC nhọn, gọi H là trực tâm. Hãy chứng minh và vẽ hình minh họa các đường cao và đường tròn Euler.",
    "mode": "socratic"
  }'
```
*Hệ thống sẽ tự động:*
1. Tìm kiếm khái niệm trực tâm & đường tròn Euler trong LightRAG.
2. Tìm 2 bài toán mẫu tương tự trong ngân hàng `data/math_problems.jsonl`.
3. Gửi prompt tích hợp vào Gemini.
4. Trả về payload chứa lời giải Socratic kèm khối `"constructions"` cho MathViz widget.
5. Bộ giải giải tích `geometry_construction_solver` tự động tính chính xác 100% tọa độ các điểm mà không phụ thuộc đoán mò.

---

## 7. Mở Rộng Ngân Hàng Bài Toán RAG (Data Ingestion Offline)

Để làm giàu thêm ngân hàng bài toán từ các tập dữ liệu mở lớn trên Hugging Face (như NuminaMath, OpenMathReasoning từ AoPS, DHMATH tiếng Việt), bạn có thể chạy script thu thập dữ liệu ngoại tuyến:

```bash
pip install datasets
python training/prepare_math_datasets.py --max-per-source 500
```
Script sẽ tự động chuẩn hóa, lọc bài toán và nối thêm vào `data/math_problems.jsonl`. `ProblemIndex` trong `math_problem_retrieval.py` sẽ tự động tải các bài mới mà không cần sửa code.

---

## 8. Các Tình Huống Xử Lý Sự Cố Thường Gặp (Troubleshooting)

| Hiện Tượng | Nguyên Nhân Gốc | Cách Xử Lý |
|---|---|---|
| Báo lỗi `No module named 'sentence_transformers'` | Chưa cài package embedding | Hệ thống **tự động chuyển sang TF-IDF thuần**, không gây lỗi. Nếu muốn bật embedding, chạy `pip install sentence-transformers`. |
| OpenRouter báo lỗi `429 Too Many Requests` | Hết hạn mức model chính trên free-tier | Hệ thống tự động chuyển sang model tiếp theo trong chuỗi fallback (`qwen2.5-vl-32b` $\to$ `gemma-3-27b` $\to$ `minimax-m3`). |
| Điểm hình học bị lệch hoặc nhãn chồng chéo | Mô hình đưa ra điểm ngoài danh sách cũ | Hệ thống mới với `geometry_construction_solver.py` tự động giải mọi chữ cái dựa trên quan hệ `constructions` (không bị giới hạn danh sách 13 chữ cái). |
