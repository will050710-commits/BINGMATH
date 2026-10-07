# DuoMath / BingMCB — Báo cáo QA & Kế hoạch Nâng cấp (2026-10-06)

> Người thực hiện: AI Agent kế nhiệm · Phạm vi: đọc bàn giao `HANDOVER_DUOMATH_AGENT.md`,
> kiểm thử năng lực chatbot + độ chính xác trực quan hóa hình ảnh, sửa lỗi chất lượng/lượng giác.

## 1. Tóm tắt điều hành

- **Bộ test offline (baseline):** tất cả suite hệ thống đều xanh (chi tiết §2).
- **Kiểm thử live (text + ảnh olympiad) đã phát hiện 4 lỗi thực tế** mà bộ test offline không bắt được.
- **Đã sửa 3 lỗi trong mã + tăng cường prompt/repair** và thêm test hồi quy (§4).
- **Còn 4 vấn đề chất lượng cần kế hoạch xử lý** (§5), quan trọng nhất là tầng kiểm chứng
  (`verification`) liên tục timeout → mọi đáp án số học hiển thị nhãn "chưa kiểm chứng".

## 2. Baseline — kết quả test offline (trước khi sửa)

| Suite | Kết quả |
|---|---|
| `backend/test_chat_budget.py` | **154/154 pass** (+1 check mới → nay **155/155**) |
| `backend/test_mathviz.py` | **9/9 pass** |
| `backend/test_mathviz_contract.py` | pass (nay +5 check mới) |
| `backend/test_geometry_pipeline.py` | pass |
| `backend/test_geometry_construction_solver.py` | pass |
| `backend/test_geometry_analytic_checks.py` | **16/16 pass** |
| `backend/test_nvidia_tier.py` | pass |
| `frontend/scripts/check-mathviz-kinds.mjs` | **22/22 pass** |
| `frontend/scripts/check-chat-errors.mjs` | **30/30 pass** |
| `frontend/scripts/check-mathviz-extract.mjs` | **11/11 pass** |
| `frontend/scripts/check-image-downscale.mjs` | pass |

⚠️ **Lưu ý:** `backend/test_chat_routing.py` **FAIL sẵn từ trước** (không phải do thay đổi lần này).
Bản `main.py` trong working tree đã thiếu 2 chuỗi mà bản commit `HEAD` có:
`"trình bày lời giải TRƯỚC"` và `"bản minh họa ```mathviz đặt SAU CÙNG"`.
Cần khôi phục lại (xem §5.5).

## 3. Kiểm thử live (backend `127.0.0.1:8000`, ăn ảnh + text)

Công cụ: `_qa_probe.py` (workspace root) — gửi yêu cầu giống `DuoMCBPage`, rồi kiểm định
khối ` ```mathviz ` bằng chính `mathviz_contract` + `geometry_analytic_checks`.

| Case | Kết quả quan sát |
|---|---|
| `benchmark_tangent_arc` (text) | Lần 1: khối `mathviz` **không có `layers`** → **0 lớp vẽ được** → UI trắng. Lần 2: **không có khối nào**. → KHÔNG ổn định. |
| `orthocenter` (text) | mathviz OK 8 layers, nhưng `conflicts=[right_angle_mismatch ×2]` |
| `circumcircle` (text) | mathviz OK, `verified=true`, 0 conflicts ✅ |
| `problem_1_power_of_point` (ảnh) | `perception.confidence=0.0`, `kind="mixed"` → đọc ảnh thất bại |
| `verification` (mọi case) | hầu hết `status="timeout"` ("hết thời gian kiểm chứng") |

### 3b. Kiểm thử live SAU khi sửa (focused re-run)

| Case | Trước sửa | Sau sửa |
|---|---|---|
| `benchmark_tangent_arc` | block không `layers` → 0 lớp | (chưa cải thiện — model lần này không phát block; xem §5.2) |
| `orthocenter` | 8 layers, `conflicts=[right_angle_mismatch ×2]` | 4 layers, `incomplete=0`, `conflicts=[]` ✅ |
| `circumcircle` | OK, verified | 3 layers, `incomplete=0`, `conflicts=[]`, `verified=true` ✅ |
| Payload lịch sử `problem_3` (dòng nét đứt ẩn danh) | `incomplete=1 (not_enough_points)` | `incomplete=[]` ✅ (xác minh D2 trên dữ liệu thật) |
| `problem_1_power_of_point` (ảnh) | `incomplete=1` + confidence 0.0 | 6 layers, `incomplete=0` ✅ ; vẫn `right_angle_mismatch ×1`, confidence 0.0 (§5.3/§5.4) |
| `problem_2_orthocenter` (ảnh) | — | 6 layers, `incomplete=0`, `conflicts=[]`, confidence 0.9, `verified=true` ✅ |

Backend log của lượt "sau sửa" **không còn** dòng `UnboundLocalError: url` (D1).

## 4. Lỗi đã phát hiện & ĐÃ SỬA

### D1 — `UnboundLocalError: url` phá hủy tầng sửa MathViz (backend) ✅
- **Bằng chứng log:** `[MathViz] Gemini retry tier failed: cannot access local variable 'url' where it is not associated with a value`.
- **Nguyên nhân:** khối repair tại `main.py:5190` dùng biến `url`, nhưng `url` chỉ được gán bên trong
  vòng lặp Tier‑1 Gemini (`main.py:4833`) — vòng lặp bị bỏ qua khi tầng khác (Groq/Cerebras/NVIDIA)
  trả lời trước. Vì vậy **tầng sửa chính luôn chết** với đáp án không phải Gemini.
- **Sửa:** dựng URL cục bộ từ `gemini_model` (luôn được gán ở `main.py:4377`) → `_repair_url`.
- Giữ nguyên chuỗi test `timeout=_budget.clamp(_gen_budget)` (bất biến §8 bàn giao).

### D2 — Báo cáo `incomplete/not_enough_points` SAI cho tọa độ inline (backend) ✅
- **Bằng chứng:** trong ảnh olympiad, `line` nét đứt có `from:{x:-1,y:0}` `to:{x:9,y:0}` (không `id`)
  bị báo `incomplete` dù cả hai renderer đều vẽ được (JSXGraph tạo điểm ẩn từ `layer.from.x`).
- **Nguyên nhân:** `mathviz_contract._drawable()` chỉ đếm `reference_ids()` (chỉ tính điểm CÓ `id`).
- **Sửa:** thêm `_point_ref_count()` đếm cả id lẫn điểm inline ẩn danh; `_drawable()` dùng hàm này.
- **Test:** +5 check trong `test_mathviz_contract.py` (dòng, polyline ẩn danh KHÔNG incomplete;
  đường 1 điểm VẪN incomplete; `_point_ref_count` = 2 cho hỗn hợp id + inline).

### D3 — Model "trôi schema" không bị chặn đúng mức (backend) ✅
- **Bằng chứng:** block benchmark dùng `points` trần (không `layers`), `constructions` kiểu
  `{id, type:"radius"|"circle"|"intersection"|"arc"}`, `claims` type `"tangent"`, thêm `groups`.
- **Sửa:** thêm "QUY TẮC CHỐNG LỆCH SCHEMA" vào prompt `geometry_2d` (`main.py`, cuối mục 6) và
  liệt kê rõ khóa/kiểu cấm trong `mathviz_contract.repair_vocabulary()`.

### D4 — Khối hình "rỗng" vẫn được gửi, kèm chú thích log gây nhầm (backend) ✅
- **Bằng chứng:** comment "sending reply without a visual" nhưng `main.py:5364` lại ghép lại khối
  từ `_viz_block` bất kể `_viz_errors` → học sinh thấy artifact trắng không lời giải thích.
- **Sửa:** trước khi ghép reply, nếu `geometry_2d` KHÔNG có lớp vẽ được VÀ không có `points` →
  ẩn khối và chèn ghi chú trung thực. Dùng vòng lặp thường (không comprehension) để vượt
  cổng tĩnh `scripts/audit_bound_names.py`.

## 5. Vấn đề còn tồn & Kế hoạch nâng cấp (đề xuất theo ưu tiên)

### 5.1 (Ưu tiên CAO) — Tầng kiểm chứng liên tục timeout
- **Hiện tượng:** mọi lượt live đều `verification.status="timeout"` (`verify_s = 25s`), đáp án
  số học luôn bị gắn nhãn "Máy chưa kịp kiểm chứng". Với bài `benchmark_tangent_arc`, tầng
  `deterministic_checks` cũng không trả về check nào (`_checks0` rỗng) → mất luôn nhãn "đã kiểm tra số học".
- **Nguyên nhân khả dĩ:** `math_solver.verify_and_repair()` là một lượt gọi LLM (critic) chạy trong
  `asyncio.wait_for(verify_s)`; model free-tier chậm hơn 25s. Tầng deterministic chỉ 3s.
- **Hướng xử lý (đề xuất):**
  1. Chạy `deterministic_checks` với timeout rộng hơn (5–8s) để LUÔN có kết quả số học;
     khi đó timeout critic → nhãn "partial" (đã kiểm tra số học) thay vì "timeout".
  2. Cho critic dùng model nhanh hơn (Groq ưu tiên) thay vì OpenRouter free.
  3. Cân nhắc `CHAT_VERIFY_BUDGET_S` mặc định cao hơn cho chế độ `extended` (đang là 25s).

### 5.2 (Ưu tiên CAO) — Độ ổn định trực quan hóa bài "ba cung nội tiếp"
- **Hiện tượng:** cùng một đề, lúc ra block hỏng (không `layers`) lúc không ra block nào.
- **Hướng xử lý:**
  1. (Đã làm) Sửa D1 để tầng repair Tier-1 hoạt động ⇒ block hỏng sẽ được sửa.
  2. Thêm **bộ chuyển đổi "cứu" schema** (todo): nếu `geometry_2d` không có `layers` nhưng có
     `points`/`mode` → tự tổng hợp mảng `layers` trước khi validate, để cả bộ giải dựng hình
     (`resolve_constructions`, `infer_tangent_triple_from_diagram`) chạy — hiện khối regularization
     bị chặn bởi điều kiện `"layers" in _viz_block` (`main.py:~5244`).
  3. Cân nhắc `temperature` thấp hơn / few-shot mạnh hơn cho prompt `geometry_2d`.

### 5.3 (Trung bình) — `right_angle_mismatch` (sai số góc vuông)
- **Hiện tượng:** layer `angle` gắn `right_angle:true` nhưng số đo không vuông (`orthocenter` case, 2 conflict).
- **Hướng xử lý:** trong `geometry_snapping`, nắn nhóm 3 điểm đã khai `right_angle` về vuông
  (đã có hạ tầng snap); hoặc hạ marker xuống warn và sửa toạ độ điểm.

### 5.4 (Trung bình) — Đọc ảnh kém trên đề olympiad
- **Hiện tượng:** `problem_1_power_of_point` cho `perception.confidence=0.0`, `kind="mixed"`.
- **Hướng xử lý:** tăng `VISION_GRID_OVERLAY`, thêm lượt "reread" khi confidence thấp, hoặc
  bật OCR phụ trợ; ghi log rõ model nào trả về rỗng.

> **✅ ĐÃ CHẨN ĐOÁN ĐƯỢC NGUYÊN NHÂN (P16-fix, 2026-10-06):** log chẩn đoán mới (`[MathReader] weak
> reader …`) chỉ ra chính xác vì sao ảnh đọc ra 0.0:
> ```
> weak reader model=qwen/qwen3.8-27b:free ok=False error=… OpenRouter model id failed (404)
> weak reader model=google/gemma-4-31b-it:free ok=False error=… OpenRouter model id failed (429)
> [MathReader] all readers failed
> ```
> Tức là **slug model vision trên OpenRouter đã cũ (404) và model còn lại bị rate-limit (429)** —
> đây là lỗi **cấu hình/biến môi trường**, không phải lỗi mã. Việc cần làm: cập nhật
> `OPENROUTER_VISION_MODEL` / `MATH_READER_MODELS` bằng slug còn sống (kiểm tra bằng
> `scripts/check_free_catalog.py`), và bật `OCR_ENABLED` nếu muốn có lưới an toàn OCR.
> `VISION_GRID_OVERLAY=true` cũng nên bật để cải thiện đọc hình học.

### 5.5 (Thấp nhưng cần) — Khôi phục `test_chat_routing.py`
- Thêm lại 2 chuỗi vào `main.py` (trong `_VISUAL_RULES`) hoặc cập nhật test nếu quy tắc đã đổi tên.

## 6. Cách chạy lại kiểm thử

```powershell
# Backend (từ duosteam/backend)
& "..\..\.venv\Scripts\python.exe" test_mathviz_contract.py
& "..\..\.venv\Scripts\python.exe" test_mathviz.py
& "..\..\.venv\Scripts\python.exe" test_chat_budget.py
& "..\..\.venv\Scripts\python.exe" scripts\audit_bound_names.py

# Frontend (từ duosteam/frontend)
node scripts/check-mathviz-kinds.mjs
node scripts/check-chat-errors.mjs

# Live probe (từ workspace root; cần backend chạy ở 127.0.0.1:8000)
& ".\.venv\Scripts\python.exe" -u _qa_probe.py                 # tất cả case
& ".\.venv\Scripts\python.exe" -u _qa_probe.py benchmark problem_1   # lọc case
```

## 7. Bất biến kỹ thuật đã giữ đúng
- Không đổi chuỗi kiểm thử trong `test_chat_budget.py` / `check-chat-errors.mjs`.
- Điểm tiếp xúc vẫn đi qua bộ giải backend; frontend không tự tính lại.
- Không thêm thư viện nặng vào tiến trình production.
- `scripts/audit_bound_names.py` xanh (không có biến UNBOUND mới trong `chat()`).

---

## 8. Đợt triển khai kế hoạch (2026-10-06, tiếp theo) — đã thực hiện

Đánh dấu `P16-fix` trong mã. Tất cả mục §5 đều được xử lý (trừ §5.1.2 — xem ghi chú).

| Mục | Thay đổi | Tệp / vị trí | Kiểm chứng |
|---|---|---|---|
| §5.5 | Khôi phục quy tắc "trình bày lời giải TRƯỚC … ```mathviz đặt SAU CÙNG" trong `_VISUAL_RULES` | `backend/main.py` (rule 1) | `test_chat_routing.py` **42/42 PASS** (trước đó FAIL) |
| §5.1.1 | `deterministic_checks` timeout 3 s → **6 s** (luôn có phán quyết số học) | `backend/main.py` (~5478) | `test_chat_budget.py` (check `timeout=6.0,`) |
| §5.1.3 | Thêm **`CHAT_VERIFY_EXTENDED_BUDGET_S` = 45 s** (sàn cho request extended); chỉ nâng sàn, clamp giữ bất biến tổng | `chat_budget.py`, `main.py` (`if _is_extended: _verify_budget = max(...)`), `render.yaml` | `test_chat_budget.py` (2 check mới) |
| §5.1.2 | *(Ghi chú)* Critic dùng Groq cần một `chat_fn` mới → để lại, rủi ro cao; đã giảm nhẹ bằng ngân sách rộng hơn | — | — |
| §5.2 | **`mathviz_contract.synthesize_layers()`**: payload `geometry_2d` thiếu `layers` nhưng có `points` → tự tổng hợp `layers` (triangle/polygon/segment) TRƯỚC khi validate; nhờ đó bộ giải dựng hình & suy luận tiếp tuyến chạy | `mathviz_contract.py`, `main.py` (~5177) | `test_mathviz_contract.py` (+8 check, `test_synthesize_layers`) |
| §5.3 | **Snap góc vuông**: `angle` + `right_angle:true` được nắn về đúng 90° (bounded, gated); thêm `_set_point()` cập nhật MỌI bản sao; `_rotate_about(..., ndigits=10)` để đạt dung sai 1e-6 của tầng kiểm định | `geometry_snapping.py` (Pass 1b) | `test_geometry_snapping.py` (+3 check); xác minh thật: `problem_1` `right_angle_mismatch → []`, còn mẫu 98° đúng đắn bị bỏ qua |
| §5.4 | Log chẩn đoán reader yếu (`model/ok/conf/error`) khi ảnh đọc kém | `math_reader.py` | `test_math_reader.py` PASS |

**Tổng test sau đợt này:**
- Backend: **22/22 suite xanh** (`test_chat_budget` 159/159, `test_mathviz_contract` pass, `test_geometry_snapping` pass, `test_chat_routing` 42/42, …).
- Frontend: `check-mathviz-kinds` 22/22, `check-chat-errors` pass, `check-mathviz-extract` 11/11, `check-image-downscale` pass, `check-api-base` OK.
- `scripts/audit_bound_names.py`: xanh.

### 8b. Kiểm thử live sau đợt triển khai (bằng chứng)

| Case | Kết quả sau đợt này | Ghi chú |
|---|---|---|
| `orthocenter` (text) | `verified=true`, notes = **"deterministic checks passed, critic agrees"** | Critic đã CHẠY XONG (trước đây timeout) nhờ sàn verify 45 s — §5.1.3 phát huy tác dụng |
| `orthocenter` (text) | 4 layers, `incomplete=0`, `conflicts=[]` | §5.3 giữ 0 conflict |
| `problem_2_orthocenter` (ảnh, cache conf 0.9) | 10 layers, `incomplete=0`, `conflicts=[]`, `verified=true` | — |
| `problem_1_power_of_point` (ảnh) | Trả lời **trung thực** "chưa đọc được nội dung trong ảnh…" | `perception.confidence=0.0` vì **model vision 404/429** (§5.4) — log chẩn đoán mới chỉ rõ |
| `benchmark_tangent_arc` (text) | Không phát khối mathviz lần này | Model non-deterministic (§5.2.3); khi có khối thiếu `layers` thì §5.2 sẽ cứu (đã xác minh bằng `_syn_check`) |

Xác minh §5.2 trên schema "trôi" thật: `errors BEFORE synth` có 4 lỗi → sau `synthesize_layers`:
`layers=[triangle, points]`, `render_report.incomplete=[]` → **hình tam giác THẬT được vẽ** thay vì canvas trắng.
Xác minh §5.3 trên payload thật: `problem_1` `right_angle_mismatch → []`; mẫu 98° (ngoài dung sai) **đúng đắn bị bỏ qua**.