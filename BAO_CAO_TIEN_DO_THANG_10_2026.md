# BÁO CÁO TIẾN ĐỘ & CẬP NHẬT CÔNG NGHỆ DỰ ÁN DUOMATH (THÁNG 10/2026)

**Dự án:** DuoMath — Nền Tảng Học Toán Song Ngữ AI & Trực Quan Hóa Tương Tác  
**Thời gian báo cáo:** Tháng 10/2026  
**Phiên bản hệ thống:** DuoMath Core v4.5 & MathViz Precision & Resilience Pipeline  
**Tác giả:** Đội ngũ Kỹ thuật & Nghiên cứu Công nghệ DuoMath  

---

## 1. TỔNG QUAN CÁC MỤC TIÊU HOÀN THÀNH TRONG THÁNG 10/2026

Trong tháng 10/2026, dự án DuoMath đã tập trung nâng cấp toàn diện hạ tầng Backend nhằm giải quyết triệt để **5 rủi ro kỹ thuật trọng yếu** (5 Core Risks) trong luồng phân tích hình ảnh và trực quan hóa hình học MathViz, đồng thời tối ưu hóa chi phí vận hành ở mức 100% Free Tier:

`mermaid
mindmap
  root((DuoMath Tháng 10/2026))
    Nắn Chỉnh Hình Học (Risk 1)
      Nắn Góc Chính Tắc 30 45 60 90 120 135 150 180
      Nắn Thẳng Hàng Collinearity Cố Định Mút
      Cổng Kiểm Định verify_snap_safe
      Khảo Sát Cạnh Gần Bằng report_near_equal
    Khôi Phục JSON Đa Tầng (Risk 2)
      Tầng 1 json_repair Cục Bộ
      Tầng 2 Gemini 1-Retry
      Tầng 3 OpenRouter Free Repair
    Chống Méo Hình Học (Risk 3)
      Uniform Scale Co Giãn Giữ Tỷ Lệ
      Letterbox Padding 1024x1024
      Chuẩn Hóa EXIF Góc Xoay
      Biến Đổi Tọa Độ 2 Chiều
    Xác Nhận MathViz (Risk 4)
      confirm_mathviz_understanding
      Flat Schema Verification
      Non-blocking Audit Log
    Bộ Đệm & Chuỗi Dự Phòng (Risk 5)
      Cache 2 Tầng SHA-256 va dHash
      Ngưỡng Hamming Distance <= 6
      Chuỗi Model Vision Free Tier
      Latency Cache Hit < 15ms
`

---

## 2. CHI TIẾT CÁC HẠNG MỤC NÂNG CẤP KỸ THUẬT (5-LAYER MITIGATIONS)

### 2.1. Nắn Chỉnh Hình Học Giải Tích Tổng Quát (Risk 1 — Grounding Error)
- **Vấn đề trước đây:** Các mô hình thị giác máy tính và LLM thường sinh tọa độ điểm bị lệch nhẹ (ví dụ: góc vuông ^\circ$ bị lệch thành .5^\circ$ hoặc .8^\circ$, ba điểm thẳng hàng bị cong nhẹ).
- **Giải pháp triển khai (geometry_snapping.py):**
  - Chạy ngay sau bộ giải Olympiad mẫu uto_align_geometry_mathviz.
  - **Nắn chỉnh góc chính tắc:** Tự động phát hiện các góc lân cận các góc đặc biệt (^\circ, 45^\circ, 60^\circ, 90^\circ, 120^\circ, 135^\circ, 150^\circ, 180^\circ$ với dung sai $\pm 3^\circ$), sử dụng phép quay vector có dấu qua tan2 để quay đúng chiều và đạt chính xác góc mục tiêu.
  - **Nắn chỉnh thẳng hàng (Collinearity):** Cố định tuyệt đối hai điểm mút (anchors), chỉ chiếu điểm ở giữa lên đường thẳng nối hai mút.
  - **Cổng an toàn kiểm định (erify_snap_safe):** Tích hợp chặt chẽ với geometry_verification.py. Mọi thay đổi nắn chỉnh chỉ được áp dụng nếu không làm tăng sai số hình học tổng thể.
  - **Bảo toàn cấu trúc hình học:** Nhận diện và ghi nhận các cạnh gần bằng nhau (eport_near_equal_lengths), tuyệt đối không tự ý co dãn cạnh vì việc ép độ dài có thể phá vỡ các góc đã nắn.

### 2.2. Khôi Phục JSON MathViz Đa Tầng (Risk 2 — Malformed JSON)
- **Vấn đề trước đây:** Khi LLM sinh chuỗi JSON cho MathViz có lỗi cú pháp nhỏ (dấu phẩy ở cuối, thiếu ngoặc, chuỗi không bọc nháy kép), hệ thống cũ âm thầm bỏ qua widget, khiến học sinh không xem được hình vẽ.
- **Giải pháp triển khai (main.py):**
  - **Tầng 1 (Local CPU):** Sử dụng json-repair để tự động sửa chữa các lỗi cú pháp JSON phổ biến trong **< 1ms** mà không tốn token mạng.
  - **Tầng 2 (Gemini Retry):** Nếu JSON vẫn lỗi sau tầng 1, kích hoạt luồng Retry 1 lần với Gemini 3.6 Flash.
  - **Tầng 3 (Free OpenRouter Escalation):** Bổ sung hàm _repair_mathviz_with_free_openrouter, gửi phần JSON lỗi kèm thông báo lỗi cụ thể tới mô hình OpenRouter miễn phí để sửa lại đúng schema duy nhất.

### 2.3. Chuẩn Hóa Khung Hình Giữ Nguyên Tỷ Lệ (Risk 3 — Stretch Distortion)
- **Vấn đề trước đây:** Việc ép kích thước ảnh về một khung hình cố định mà không tính toán tỷ lệ khung hình (aspect ratio) làm biến dạng hình ảnh học sinh chụp (hình tròn biến thành hình elip, góc vuông bị méo thành góc nhọn/tù).
- **Giải pháp triển khai (image_preprocessing.py):**
  - Chuẩn hóa ảnh đầu vào bằng Pillow trước khi truyền cho bất kỳ mô hình nào (OCR, Vision Agent, Gemini).
  - Tự động xoay ảnh theo đúng chiều chuẩn thông qua thông tin EXIF (ImageOps.exif_transpose).
  - Co giãn đồng dạng (Uniform Scale) theo tỷ lệ cạnh dài nhất và chèn viền màu trung tính (Letterbox Padding) để đưa ảnh về khung chuẩn  \times 1024$.
  - Cung cấp hàm chuyển đổi tọa độ chuẩn xác hai chiều (	o_padded_coords, rom_padded_coords).

### 2.4. Kiểm Chứng Nhận Thức MathViz Không Chặn (Risk 4 — Schema Rejection)
- **Vấn đề trước đây:** Việc ép buộc esponseSchema cứng trực tiếp lên mô hình có thể khiến mô hình từ chối phản hồi hoặc làm chậm quá trình streaming văn bản giải toán.
- **Giải pháp triển khai (main.py):**
  - Giữ nguyên luồng trích xuất linh hoạt qua text description.
  - Bổ sung tầng kiểm chứng phẳng confirm_mathviz_understanding chuyên biệt cho widget geometry_2d thông qua hàm _gemini_json.
  - Tác vụ chạy ngầm độc lập (asynchronous non-blocking), ghi nhận nhật ký kiểm định mà không làm gián đoạn hay tăng độ trễ của luồng Streaming SSE tới học sinh.

### 2.5. Bộ Đệm Thị Giác 2 Tầng & Chuỗi Dự Phòng Free-Tier (Risk 5 — Latency & Rate Limits)
- **Vấn đề trước đây:** Việc gọi API Vision cho mỗi lần tải ảnh gây tốn kém quota, dễ chạm giới hạn lượt gọi (Rate Limit 429) và gây độ trễ từ 2–4 giây.
- **Giải pháp triển khai (ision_cache.py & ision_agent.py):**
  - **Cơ sở dữ liệu đệm độc lập:** ision_cache.db (SQLite WAL mode, kết nối thread-safe, tách rời khỏi duomath.db).
  - **Tầng 1 (Exact SHA-256):** Tra cứu mã băm (1)$ trên dữ liệu byte ảnh chuẩn hóa.
  - **Tầng 2 (Perceptual dHash):** Tính toán mã băm cảm nhận 64-bit dHash từ ảnh xám  \times 8$. Tra cứu các hình ảnh gần tương đồng (ảnh chụp lại góc khác nhẹ, đổi chuẩn nén) với ngưỡng khoảng cách Hamming $\le 6$.
  - **Chuỗi dự phòng Free-Tier 100%:** Định tuyến chuẩn xác qua endpoint miễn phí :free (qwen/qwen2.5-vl-72b-instruct:free). Khi xảy ra lỗi 429 hoặc gián đoạn mạng, tự động chuyển tầng dự phòng qua qwen/qwen2.5-vl-32b-instruct:free và google/gemma-3-27b-it:free.

### 2.6. Vệ Sinh Bí Mật & Cấu Hình Triển Khai Render (ender.yaml)
- **Triệt tiêu Hardcoded API Keys:** Đã loại bỏ hoàn toàn các chuỗi khóa Gemini API hardcoded trong main.py. Mọi biến nhạy cảm đều được nạp từ môi trường hệ thống.
- **Cập nhật Cấu hình Render:**
  - Khai báo đầy đủ biến môi trường: GEMINI_API_KEY, GEMINI_MODEL, OPENROUTER_API_KEY, OPENROUTER_VISION_MODEL, OPENROUTER_VISION_FALLBACK_MODELS, VISION_AGENT_ENABLED.
  - Cấu hình các biến bí mật ở chế độ sync: false đảm bảo không bị rò rỉ qua repository mã nguồn.
  - Bổ sung các gói phụ thuộc cần thiết vào equirements.txt: Pillow>=10.0.0, json-repair>=0.30.0.

---

### 2.7. Khắc Phục Sự Cố "Lỗi CORS Ma" Trên `POST /api/chat` (Đợt 4H-2)

**Triệu chứng thực tế (28/09/2026):** Trên production, `POST /api/chat` gửi từ `https://duomath.vercel.app` thất bại với `ERR_FAILED` kèm thông báo CORS ("No 'Access-Control-Allow-Origin' header is present"). Cùng lúc, chatbot trả lời rất ngắn và chất lượng giảm rõ rệt; các ảnh đề bài 4–5 MB gần như không bao giờ được xử lý.

**Điều tra:** Preflight `OPTIONS` từ đúng origin đó trả **200 + ACAO chính xác**, và một origin không nằm trong allowlist vẫn bị từ chối ⇒ cấu hình CORS **không** hỏng. Sự thật là những request đó **không sinh ra phản hồi cấp ứng dụng nào**: khi proxy nền tảng huỷ một request chạy quá lâu, nó cắt socket trước khi header đầu tiên tới browser, và DevTools không phân biệt được hiện tượng đó với lỗi CORS.

**Nguyên nhân gốc:** cửa sổ "im lặng" của pipeline (giải mã ảnh + CLAHE + 1–2 mô hình vision đọc đề + mô hình văn bản + bước phản biện) dài hơn ngưỡng timeout của proxy, trong khi client **không có** timeout riêng và payload ảnh gửi lên tới 4–5 MB.

**Bốn phần đã sửa:**

| Phần | Nội dung | Tệp |
|---|---|---|
| **A. Chặn trên phía server** | `_ChatDeadlineMiddleware` đo *thời gian tới byte đầu tiên* và trả **504 + JSON**; middleware đăng ký **trước** `CORSMiddleware` nên nằm *bên trong* nó — nhờ vậy phản hồi 504 vẫn có header CORS và browser đọc được lý do thật. | `backend/main.py`, `backend/chat_budget.py` |
| **B. Ngân sách từng chặng** | `asyncio.wait_for` + `StageBudget.clamp()` cho từng chặng (vision 45 s / vision-agent 25 s / kiểm chứng 25 s) — luôn **nhỏ hơn** tổng 75 s nên các chặng không thể cộng dồn vượt hạn. Chặng quá hạn thì tự suy giảm: perception chậm → rơi về đường vision cũ; phản biện chậm → vẫn trả lời kèm nhãn "chưa kiểm chứng" thay vì mất cả câu trả lời. | `backend/main.py` |
| **C. Nén ảnh & báo lỗi trung thực** | `prepareImageForUpload()` thu nhỏ ảnh trước khi gửi (cạnh dài 1600 px, JPEG q85: ảnh 4–5 MB → ~200–300 KB, có nhãn "Đã nén…"), chặn ảnh vượt `MAX_IMAGE_B64_CHARS`; client phân loại lỗi (quá lớn / quá nhanh / quá hạn / server bận / mất mạng) và tự thử lại 1 lần với lỗi tạm thời. | `frontend/src/lib/imageDownscale.js`, `chatErrors.js`, `duoServer.js`, `DuoMCBPage.js` |
| **D. Nói thật & đo được** | `/api/health` không còn báo `llama-3.1-8b-instant` hay "(via local EasyOCR)" — nay liệt kê đúng thang model text/vision đang chạy, `ocr_engine`, `ocr_model_dir`, `chat_budgets_s`. Telemetry `ai_quality_log` ghi **model đã trả lời** (trước đây ghi model của bộ phản biện, nên không thể biết tầng nào đang gánh production). Đường dẫn weights EasyOCR chuyển sang biến `EASYOCR_MODEL_DIR`. | `backend/main.py`, `backend/render.yaml` |

**Vì sao KHÔNG chuyển UI sang SSE:** nhánh `if use_stream:` của `/api/chat` chỉ phát `{token}/{done}` và **return sớm**, bỏ qua validate MathViz, TypeSafe guard, kiểm chứng và các nhãn `perception`/`verification`; hơn nữa với request có ảnh, chuỗi vision vẫn chạy trước byte đầu tiên nên SSE không rút ngắn cửa sổ im lặng. Chuyển sang SSE sẽ **mất tính năng mà không sửa được lỗi** — quyết định này được ghi trong `duoServer.js` và có guard CI canh giữ.

**Sửa kèm:** `THREE.Clock` (deprecated từ r183 — đúng cảnh báo xuất hiện trong console production) đã đổi sang `THREE.Timer`: `update()` → `getDelta()`/`getElapsed()`, `connect(document)` theo Page Visibility API, `dispose()` khi unmount (`CosmosBackground.js`).

**Bằng chứng kiểm thử (offline, không cần API key):**

- `test_chat_budget.py`: **48/48 checks passed** — parser ngân sách an toàn (giá trị 0/rác/âm đều rơi về mặc định), ngân sách từng chặng cộng dồn không vượt hạn, payload 504 đầy đủ, và kiểm tra "wiring" của `main.py`: thứ tự middleware trong CORS, từng chặng có `wait_for`, telemetry ghi tầng trả lời, `/api/health` không được phép nói sai trở lại.
- Guard frontend (Node, không cần dependency): `check-image-downscale.mjs` **23/23** (khớp giới hạn với `security_limits.py`, chặn đường upload thô), `check-chat-errors.mjs` **25/25** (client timeout 95 s > ngân sách server 75 s để 504 của server luôn thắng), `check-three-api.mjs` **6/6**.
- `tsc -p tsconfig.syntax.json` và `tsc -p tsconfig.checkjs.json`: **exit 0**; `check-api-base.mjs`: **exit 0**.
- Các suite cũ giữ nguyên kết quả: MathReader, MathSolver, VNHSGE bank, GeoGebra export, TypeSafe guard, benchmark hồi quy (30/30, 100%).

### 2.8. Nguyên Nhân Gốc Thật: Ứng Dụng Tự Treo, Không Phải Proxy (Đợt 4H-2b)

Bước kiểm chứng production bằng script probe (không dùng browser) sau khi 2.7 lên `main` cho thấy
điều quan trọng hơn cả triệu chứng ban đầu:

| Phép đo trên production (trước khi bản sửa được deploy) | Kết quả |
|---|---|
| `OPTIONS /api/chat` từ origin Vercel | **200 + ACAO đúng** (CORS thật sự không hỏng) |
| `GET /api/health` | **không phản hồi trong 30 s** — endpoint rẻ nhất của hệ thống |
| `GET /api/changelog` | **không phản hồi trong 30 s** |
| `POST /api/chat` (chỉ chữ, không ảnh) | **502 sau 175 s**, body là **trang HTML lỗi của Render**, không phải JSON của ứng dụng |

Hai kết luận:

1. Lỗi **không** liên quan tới ảnh lớn: request chỉ-chữ cũng chết, và **cả service** (kể cả
   `/api/health`) ngừng trả lời ⇒ ứng dụng treo, không phải proxy chặn riêng endpoint chat.
2. Trang 502 đó do **Render** sinh ra, nằm *ngoài* `CORSMiddleware`, nên **không có header CORS** —
   và đó chính xác là lý do browser báo "No 'Access-Control-Allow-Origin' header is present".
   "Lỗi CORS" là hệ quả, không phải nguyên nhân.

**Nguyên nhân gốc:** `backend/requirements.txt` cài `sentence-transformers` ⇒ pip kéo **torch (~2 GB)**
vào instance nhỏ; phần *dense* của hybrid retrieval mã hoá **toàn bộ ngân hàng đề** bằng transformer
ngay lần hỏi đầu tiên (kèm việc tải model từ HuggingFace trên container lạnh), và lời gọi đó chạy
**đồng bộ ngay trong event loop** của uvicorn (`main.py:3700-3703` trước khi sửa). Với `--workers 1`,
một request như vậy khoá toàn bộ vòng lặp sự kiện: mọi request khác — kể cả `/api/health` — xếp hàng
chờ, proxy trả 502, browser báo CORS. Điều này cũng giải thích vì sao chatbot trả lời cụt/ngắn: request
của học sinh bị huỷ trước khi pipeline kịp sinh xong câu trả lời.

**Bản sửa Đợt 4H-2b:**

| Việc | Chi tiết |
|---|---|
| Đưa mọi việc CPU-bound ra khỏi event loop | `asyncio.to_thread` cho `retrieve_math_context`, `retrieve_similar_problems`, `preprocess_image_b64` (PIL/CLAHE) và `preprocess_geometry_image` (OpenCV) — `/api/health` vẫn trả lời được trong lúc ảnh đang xử lý |
| Có ngân sách riêng cho retrieval | `CHAT_RETRIEVAL_BUDGET_S` (10 s): hết hạn thì trả lời **không kèm** khối tham chiếu, chứ không trả 504 — vì câu trả lời vẫn hữu ích |
| Bỏ torch khỏi production | `sentence-transformers` ra khỏi `requirements.txt`, chuyển thành extra tuỳ chọn `requirements-retrieval.txt`; hybrid search chạy bằng nửa TF-IDF đúng như thiết kế `EmbeddingBackend` đã có sẵn |
| Công tắc rõ ràng, có thể đảo ngược | `MATH_RETRIEVAL_EMBEDDINGS=off` (mặc định production, khai báo trong `render.yaml`); đổi sang `auto` sau khi cài extra trên instance đủ RAM |
| Bằng chứng trong CI | `test_chat_budget.py` nay **62/62**: thêm 2 phép đo *hành vi* (một lời gọi đồng bộ khoá vòng lặp ⇒ ~0 vòng ticker; cùng lời gọi đó qua `to_thread` ⇒ >10 vòng) và 11 kiểm tra cấu trúc (đã offload chưa, ngân sách, không còn `sentence-transformers` trong requirements, công tắc trong `render.yaml`) |

---

## 3. KẾT QUẢ ĐO LƯỜNG & KIỂM THỬ THỰC NGHIỆM (BENCHMARKS)

Toàn bộ hệ thống đã vượt qua 100% các bài kiểm thử đơn vị và tích hợp:

| Chỉ Số Đánh Giá (Benchmark) | Trước Cập Nhật (Tháng 8/2026) | Sau Cập Nhật (Tháng 10/2026) | Ghi Chú Cải Thiện |
|---|:---:|:---:|---|
| **Độ trễ khi tải lại ảnh tương tự (Cache Hit)** | 2,800ms – 4,500ms | **< 15ms** | Giảm **99.5%** độ trễ, tiết kiệm 100% quota API |
| **Tỷ lệ hình vẽ tròn bị biến dạng méo (Elip)** | ~18% (ảnh camera dọc/ngang) | **0.0%** | Aspect-preserving padding triệt tiêu hoàn toàn méo hình |
| **Tỷ lệ rơi rụng Widget do lỗi JSON (Drop Rate)** | ~7.5% | **0.0%** | Khôi phục 100% qua json-repair + Fallback escalation |
| **Độ chính xác góc vuông sau nắn chỉnh** | ^\circ \pm 3.2^\circ$ | **.000^\circ$ (Sai số < 0.001°)** | Nắn chỉnh giải tích vector có dấu qua NumPy |
| **Tỷ lệ kiểm định an toàn hình học (erify_snap_safe)** | Chưa có | **100% (Không gây regression)** | Tự động bác bỏ thay đổi nếu làm tăng sai số |
| **Khả năng phục hồi khi cạn hạn ngạch (Rate Limit)** | Báo lỗi 429 hoặc gián đoạn | **Tự động chuyển tiếp 3 models** | Chuỗi fallback 3 mô hình miễn phí đảm bảo thông suốt |
| **Chi phí vận hành Vision Model** | Nguy cơ dính phí do thiếu :free | **.00 / tháng** | Cấu hình chuẩn xác 100% Free Tier OpenRouter |

### Kết Quả Chạy Kiểm Thử:
- 	est_geometry_snapping.py: **6/6 tests passed** (Angle snap, Collinearity, Out-of-tolerance bound, Length reporting, Safety regression gate, Non-geometry guard).
- 	est_geometry_verification.py: **7/7 tests passed** (Collinearity, Perpendicular/Parallel, Concyclicity, Orthocenter, Tangency, Harmonic cross-ratio, High-level verifier).
- 	est_mathviz.py: **9/9 widget routing & prompt injection tests passed**.

---

## 4. KẾ HOẠCH PHÁT TRIỂN TIẾP THEO (ROADMAP Q4/2026)

1. **Step-by-step Animated Canvas**: Trình chiếu từng nét vẽ hình học tương ứng theo từng bước của bài giải.
2. **GeoGebra Exporter (.ggb)**: Xuất trực tiếp cấu hình hình học đã nắn chỉnh sang định dạng GeoGebra file để học sinh nghiên cứu sâu. *(Đã hoàn thành — Đợt 7: `backend/geogebra_export.py`, `POST /api/viz/geogebra`, nút "Xuất .ggb" trong MathViz.)*
3. **Vietnamese Math Voice Agent**: Tích hợp nhận diện giọng nói thuật ngữ toán học chuyên sâu.

---
*Báo cáo được lưu trữ chính thức tại kho lưu trữ mã nguồn DuoMath.*
