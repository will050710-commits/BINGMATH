# PHASE 4 — Tích hợp thư viện theo `DUOMATH_AGENT_INTEGRATION_GUIDE.md`

> Tiếp nối các `SECURITY_PHASE*.md` (Phase 0–3 đã xong). Phase 4 là phần **tính năng/tích hợp**, mỗi mục đều giữ đúng “cổng bảo mật” đã nêu trong guide.

## Trạng thái

| # | Mục trong guide | Trạng thái | Ghi chú |
|---|---|---|---|
| 2.6 | **mathjs** — thay `new Function()` trong canvas DuoMCB | ✅ Xong ở Phase 0 | `frontend/src/utils/safeMathEval.js` |
| 2.3 | **Math-Verify** — chấm theo giá trị toán học | ✅ Xong ở Phase 1 | `backend/grading.py` (math-verify khi có, SymPy hạn chế khi không) |
| 2.2 | **Streamdown** — markdown + LaTeX khi streaming | ✅ Đợt 1 | `frontend/src/components/chat/StreamdownMessage.jsx` (dùng ở `/aithi`, `/ketqua`) |
| 2.1 | **MathLive** — nhập công thức trực quan | ✅ Đợt 1 | `frontend/src/components/shared/MathInput.jsx` + `scripts/copy-mathlive-assets.mjs` |
| 2.4 | **py-fsrs** — ôn tập giãn cách | ✅ **Đợt 4E + 4H** | `backend/fsrs_scheduler.py`, bảng `relearn_cards`, 3 endpoint `/api/relearn/*`, màn `/relearn`; `test_relearn_flow.py` chứng minh vòng seed→review→due **16/16** |
| 2.7 | **Offline mode** | ✅ **Đợt 4G** (không dùng Serwist — xem lý do) | `frontend/public/sw.js` (SW tĩnh), `/api/*` **NETWORK-ONLY** (đã sửa lỗi cache rò dữ liệu người dùng), trang `/offline` |
| 2.5 | **Mafs** — widget tương tác | ✅ **Đợt 4H** | `mafs@0.21`, `src/components/duomath/ParabolaExplorer.jsx`, trang `/khampha` |
| 1 | **Penrose** — hình minh hoạ hình học | ✅ **Đợt 5** | `@penrose/core@3.3.1` (MIT, **không có WASM**), `src/lib/penroseTrios.js` + `components/duomath/PenroseFigure.jsx` ở `/khampha`; 2 trio được máy kiểm chứng (`scripts/check-penrose-trios.mjs`, ràng buộc thoả tới 1e-12) |
| 2.8 | **VNHSGE** — ngân hàng đề THPT | ✅ **Đợt 6** (chờ dữ liệu thật) | `backend/vnhsge_bank.py` (luật chuẩn hoá + hash định danh) · `backend/scripts/import_vnhsge.py` (cổng **license bắt buộc**) · 3 endpoint `/api/exam/vnhsge/*` · trang `/nganhangde`; `test_vnhsge_bank.py` **36/36**; nguồn dữ liệu thật vẫn chờ chủ dự án chốt |

**Ngoài guide (các đợt 3 → 4H đã làm):** thang model free OpenRouter + tự loại slug chết/429 (đợt 3) · MathReader đọc đối chứng + cổng SymPy (4A) · bộ giải gọi tool SymPy + hậu kiểm & sửa 1 lần (4B) · telemetry `ai_quality_log` + endpoint admin + cổng CI (4C) · gỡ khoá TypeSafe hard-code + kiểm chứng hình học (4D) · gieo thẻ FSRS từ `/ketqua` + màn `/relearn` (4E) · cổng CI `checkJs` bắt lớp lỗi “biến chưa định nghĩa” (4G/CI) · sửa SW rò dữ liệu + `/offline` (4G) · vòng FSRS thật 16/16 + widget Mafs (4H) · **xuất hình MathViz ra tệp GeoGebra `.ggb` (đợt 7, roadmap Q4/2026 §4.2)**.

**Trạng thái kỹ thuật hiện tại:** backend **113 route** (đếm trực tiếp từ bảng route của FastAPI) · **7 bộ test Python** trong CI (thêm `test_vnhsge_bank.py` 36/36 và `test_geogebra_export.py` 91/91) + `tests/eval_math_regression.py` + 2 cổng `tsc` (cú pháp `src/**`, `checkJs` cho `src/app/api/**`) + `test_relearn_flow.py` đều xanh · `pnpm --frozen-lockfile` khớp lockfile · **production đã kiểm chứng 6/6 ALL_OK** (dịch có failover, nhận xét qua OpenRouter, `/api/relearn/*` + `/api/admin/ai-quality` sống và có bảo vệ).

## Đợt 1 — Đã làm

### 2.2 Streamdown
- `StreamdownMessage.jsx`: bọc `Streamdown` + plugin `createMathPlugin({ singleDollarTextMath: true })`, kèm `streamdown/styles.css` và `katex/dist/katex.min.css`.
- **Bảo mật:** Streamdown tự sanitize bằng `rehype-sanitize` + `rehype-harden` (có trong dependencies) ⇒ nội dung AI không còn đi qua `dangerouslySetInnerHTML` do ứng dụng tự ghép.
- Đã thay ở **AI Test Studio** 4 chỗ: `grading.feedback.vi/en` và `review.overall_feedback.vi/en` (trước đây là text thuần, giờ render được bullet + LaTeX).
- **Việc tiếp theo (đợt 2):** chuyển `DuoTranslate` (theory) và trang `/ketqua` (phần feedback) sang cùng component; sau đó mới cân nhắc thay tokenizer trong `DuoMCBPage.js` bằng Streamdown (cần test hồi quy phần canvas/animation trước).

### 2.1 MathLive
- `MathInput.jsx`: `<math-field>` bọc trong React, phát ra LaTeX qua `onChange` (giữ API kiểu input thường để dễ thay thế textarea hiện có).
- `scripts/copy-mathlive-assets.mjs` + `postinstall`: copy `fonts/` và `sounds/` từ `node_modules/mathlive` vào `public/mathlive-fonts` + `public/mathlive-sounds` (đã ignore trong git).
- **Lưu ý kỹ thuật:** guide dùng `cp -r` (chỉ chạy trên Unix). Ở đây dùng script Node cross-platform vì **`fs.cpSync()` crash cứng Node 24 trên workspace Windows + OneDrive** (`STATUS_STACK_BUFFER_OVERRUN`); script dùng vòng lặp `readdirSync` + `copyFileSync` và luôn `exit 0` để không bao giờ làm hỏng `pnpm install`.
- **Bảo mật:** LaTeX do MathLive sinh ra vẫn phải render qua `Streamdown`/KaTeX an toàn (`trust: false`), không nối chuỗi HTML thủ công.

## Đợt 2 — DuoTranslate song ngữ 2 chiều + Streamdown ở trang kết quả

### DuoTranslate giờ song ngữ thật sự (cả 2 phía)
- **Hiển thị 2 cột**: thẻ 🇬🇧 English và thẻ 🇻🇳 Tiếng Việt luôn cùng xuất hiện — bất kể bạn bôi đen tiếng Anh hay tiếng Việt (trước đây chỉ hiện 1 chiều theo `source_lang`).
- **Lý thuyết**: bỏ nút bật/tắt VI/EN; hiện **cả hai ngôn ngữ xếp chồng** (🇻🇳 rồi 🇬🇧), mỗi khối render bằng Streamdown (markdown + LaTeX).
- **Ghi chú/Conceptual note**: hiện cả `summary_vi` và `summary_en` khi có.
- **Từ vựng**: mỗi thẻ hiển thị song song thuật ngữ tiếng Anh và nghĩa tiếng Việt.
- Header ghi rõ hướng đang dịch (`🇬🇧 EN ➔ 🇻🇳 VI` hoặc ngược lại) + nhãn “song ngữ”.

### Tính năng “Dịch trang” (EN ⇄ VI)
- Nút **🌐 Dịch trang** trên header panel và nút **“🌐 Dịch cả trang này · Translate this page”** ở trạng thái gợi ý.
- Nút lấy `innerText` của vùng nội dung được bọc (`contentRef`), gộp khoảng trắng, cắt 1500 ký tự rồi gửi vào `/api/translate` — kết quả hiển thị song ngữ như trên.
- Backend: nới giới hạn đầu vào từ 500 → **1500 ký tự** và tăng `max_tokens` (500 → 1200 khi văn bản dài) để bản dịch dài không bị cụt.

### Backend: mọi kết quả dịch đều có đủ 2 ngôn ngữ
- `_detect_lang()` (heuristic dấu tiếng Việt) + `_bilingual_payload()` bảo đảm payload luôn có `translation_vi` / `translation_en` (và `summary_vi` / `summary_en`), đồng thời giữ các khoá cũ `translation` / `summary` cho tương thích.
- Khi model chỉ trả một chiều, ô còn thiếu được điền bằng **chính văn bản đầu vào** (vốn đã ở ngôn ngữ kia) — không tốn thêm lượt gọi AI.
- Prompt JSON đã yêu cầu model trả đủ `translation_vi`, `translation_en`, `summary_vi`, `summary_en`, `words[].english`.
- Áp dụng cho cả 4 đường trả kết quả: parse trực tiếp, parse lại từ `raw`, khi thiếu `GROQ_API_KEY`, và khi Groq lỗi (mock).

### Trang `/ketqua`
- Khối “🤖 Gợi ý học tập từ AI” giờ render bằng Streamdown (bullet + LaTeX) thay vì `white-space: pre-wrap`.

## Đợt 3 — OpenRouter free-tier: thang model mạnh nhất miễn phí (chat · dịch · thị giác)

### Vì sao: 5 slug đã chết + khoá Groq bị thu hồi
Kiểm tra catalog **sống** của OpenRouter ngày 26/09/2026 cho thấy các slug mà hệ thống đang dùng **không còn tồn tại ở free tier**, nên mọi lời gọi đều lỗi *trước khi tới được provider*:

| Vị trí | Slug cũ | Tình trạng live |
|---|---|---|
| `vision_agent.py` `DEFAULT_MODEL` | `inclusionai/ling-3.0-flash-vl:free` | chỉ còn bản **không** `:free` = trả phí |
| `vision_agent.py` fallback | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | còn, nhưng uptime 1 ngày **80.9%** |
| `render.yaml` (env **override** code) | `qwen/qwen2.5-vl-72b-instruct:free`, `qwen2.5-vl-32b-instruct:free`, `google/gemma-3-27b-it:free` | cả 3 **mất** |
| `main.py` sửa MathViz | `minimax/minimax-m3:free` | **mất** |
| `main.py` chat tier 3 | `deepseek/deepseek-v4-flash-0731:free` | **mất** (+ `nemotron-3.5-lightning` chỉ 87% uptime) |

### Thang model mới (xếp theo chỉ số Artificial Analysis in trên trang từng model)
| Model (miễn phí) | AA Intelligence | AA Coding | AA Agentic | GPQA-D | Uptime 1d | Ctx | Max out | Thị giác | JSON mode |
|---|---|---|---|---|---|---|---|---|---|
| **`qwen/qwen3.8-27b:free`** (chính) | **33.7** | **68.1** | **45.8** | 90.5% | 97.7% | 262K | 235.9K | ✓ | `structured_outputs` |
| `nvidia/nemotron-3-ultra-550b-a55b:free` (dự phòng 1) | 22.9 | 49.3 | 20.1 | 86.7% | 98.4% | **1M** | 65.5K | ✗ | ✗ |
| `openrouter/free` (chốt cuối) | router chọn ngẫu nhiên 1 model free **đủ tính năng request cần** | | | | | 200K | | ✓ | – |
| Dự phòng đổi bằng env: `poolside/laguna-s-2.1:free` (Terminal-Bench 2.1 **70.2%**), `nvidia/nemotron-3-super-120b-a12b:free`, `google/gemma-4-31b-it:free` (99.6%, 140+ ngôn ngữ), `dots-studio/dots-3-note-preview:free` (512K ctx), `thinkingmachines/inkling:free` (1M ctx) | | | | | | | | | |

Hạn mức free (FAQ chính thức): **50 request/ngày** nếu chưa nạp credit, **1000/ngày** sau khi nạp ≥ **$10** — dùng chung toàn tài khoản, nên đã thêm cache + ngân sách ngày.

### Đã thay đổi trong code
1. **`main.py` — thang tier cấu hình được**: `_openrouter_chat()` (một request với mảng `models` để OpenRouter **tự failover phía server**), `_translate_with_openrouter()`, `_translate_with_groq()` (tách khỏi endpoint), `_parse_json_lenient()` (bỏ markdown fence + dọn dấu phẩy thừa + `json_repair`), cache dịch `sha256 → payload` (LRU 256, TTL 24h, **không** cache bản mock), ngân sách `OPENROUTER_DAILY_BUDGET`.
   - Thứ tự nhà cung cấp: `TRANSLATE_TIER_ORDER` mặc định **`openrouter,gemini,groq`** (Qwen3.8 27B dịch VI tốt nhất trong 3 nhà cung cấp) → mock chỉ khi cả ba hỏng, kèm cờ `_fallback`.
   - Chat tier 3 dùng lại `_openrouter_chat` với mảng `models` (bỏ vòng lặp 1 HTTP/model).
   - Sửa slug chết ở tầng sửa MathViz → `OPENROUTER_REPAIR_MODEL=qwen/qwen3.8-27b:free`.
2. **`vision_agent.py`**: `DEFAULT_MODEL=qwen/qwen3.8-27b:free`; fallback `Gemma 4 31B → Dots 3 Note → Inkling → openrouter/free`; khối comment kiểm toán ghi rõ **không còn `*-vl:free` chuyên dụng** + cảnh báo chống tái diễn lỗi "model nano/omni làm mặc định OCR".
3. **`render.yaml` + `DEPLOYMENT_AND_TESTING_GUIDE.md` + `ARCHITECTURE_AND_INFRASTRUCTURE.md`**: thay giá trị slug đã chết, thêm `OPENROUTER_CHAT_MODELS`, `OPENROUTER_TRANSLATE_MODELS`, `OPENROUTER_REPAIR_MODEL`, `TRANSLATE_TIER_ORDER`, `OPENROUTER_DAILY_BUDGET`.
4. **`frontend/src/app/api/learning-feedback/route.js`**: Groq hỏng/thiếu → **thử OpenRouter free** trước, chỉ khi cả hai hỏng mới trả bản rule-based (`degraded: true`, `reason: "groq_…|openrouter_…"`); phản hồi thành công kèm `provider`/`model` để `/ketqua` không hiện nhầm nhãn "chế độ đơn giản".
5. **`frontend/src/app/privacy/page.js`**: công bố rõ model **miễn phí** có thể ghi log/dùng dữ liệu để cải thiện model (NVIDIA/Poolside/Cohere/Google AI Studio) + khuyến nghị không đưa dữ liệu cá nhân vào ảnh/câu hỏi.

### ⚠️ Hai giới hạn của OpenRouter phát hiện bằng test sống (ghi lại để không tái phạm)
1. **Mảng `models` tối đa 3 phần tử** — gửi 4-5 model trả `HTTP 400: 'models' array must have 3 items or fewer`. Code nay **tự cắt còn 3** và ghi cảnh báo.
2. **Slug chết KHÔNG được tự động failover** — OpenRouter trả `400 "<id> is not a valid model ID"` cho *cả* request (đây chính là cơ chế đã giết chuỗi vision trước đây). Code nay **tự phát hiện, loại slug chết và thử lại** với các model còn lại (tối đa 3 lần) + log cảnh báo để cập nhật env.

### Cấu hình cần có trên Render/Vercel
`OPENROUTER_API_KEY` (**hiện đang THIẾU trên dịch vụ Render live** — nếu không thêm, cả 3 tầng OpenRouter bị vô hiệu và hệ thống quay lại mock), `GEMINI_API_KEY` (khoá trên Render đang 401), `GROQ_API_KEY` (khoá cũ đã bị thu hồi). Nạp ≥ $10 credit để nâng hạn mức free 50 → 1000 request/ngày.

## Đợt 4A — MathReader có kiểm chứng (nhận diện ảnh trước khi giải)

### Lỗ hổng được vá
Trước đợt này, ảnh chỉ được đọc **một lần bằng một model** rồi đưa thẳng vào bộ giải. Một ký hiệu đọc sai (ví dụ `x^5` thành `x^3`) tạo ra lời giải *tự nhất quán nhưng sai* mà không lớp nào phát hiện: toán thì được kiểm, **việc đọc thì không**.

### Kiến trúc mới
```
ảnh → preprocess (resize đồng dạng + letterbox + sha256/phash cache)
     → MathReader: đọc bằng model họ A  →  nếu mơ hồ/không chắc (confidence < 0.75)
                                        →  đọc thêm model họ B (khác họ)
     → so khớp LaTeX sau chuẩn hoá: agree / merge / conflict
          · conflict → trọng tài (dots-3) → nếu vẫn bất đồng ⇒ HỎI LẠI HỌC SINH
     → cổng SymPy: công thức không parse được ⇒ crop + zoom đúng vùng đó, đọc lại 1 lần
     → Problem IR + contract văn bản → bộ giải (model văn bản KHÔNG nhận ảnh thô nữa)
```
Module mới `backend/math_reader.py`:
- `_normalize_latex()` — chuẩn hoá `x^{2}`/`x^2`, `\left(...\right)`, `\times`/`\cdot`, Unicode `≤ − → π √`… để so khớp không bị nhiễu bởi định dạng.
- `_formula_match()` — ghép 1-1 theo vị trí rồi theo độ tương đồng (model đổi thứ tự dòng không bị coi là bất đồng).
- `sympy_gate()` — tái dùng parser hạn chế của Phase 1 (`grading.safe_symbolic_parse`); tách `=`/`<`/`>` thành từng biểu thức nên **phương trình và bất phương trình không bị báo lỗi oan**.
- `_crop_b64()` + `_reread_failed()` — crop theo `bbox` (0..1) + phóng 2-3× rồi đọc lại đúng vùng đáng ngờ.
- `to_solver_contract()` — hình học giữ nguyên định dạng cũ (`LABELED POINTS / PRIMITIVES / RELATIONS`) nên pipeline MathViz không phải sửa gì.
- Cache: kết quả lưu qua `vision_cache` với tiền tố `MR1:` (không xung đột với text thô của vision agent cũ).

### Nối vào `/api/chat`
- Chạy **trước** vision agent cũ (giữ làm đường lui): `image_data` + `AI_DUAL_READ != never`.
- Khi bất đồng thật: chat trả lời bằng câu hỏi xác nhận kèm 2 cách đọc + `ocr_confirm` trong JSON (chưa cần UI mới vẫn dùng được), **không giải** trên đề chưa chắc.
- Phản hồi thành công có thêm `perception: {consensus, confidence, kind, reread, parse_failures, cache, readers, ms}`.

### Kiểm chứng
- `python backend/test_math_reader.py` → **36/36 checks pass** (bao gồm: đồng thuận, trọng tài phân xử, bất đồng không phân xử được ⇒ `needs_confirm`, chế độ `never` chỉ gọi 1 reader, mọi reader lỗi ⇒ trả lỗi gọn, và nhánh crop + đọc lại sửa được công thức hỏng). Test **không cần mạng/khóa** nhờ `chat_fn` được tiêm vào.
- Ba lỗi thật bắt được ngay trong lúc viết test: (1) `.strip("()")` phá ngoặc của `\frac{x^2-1}{x+1}` ⇒ dương tính giả; (2) thiếu `import io` khiến crop lỗi bị `except` nuốt mất ⇒ nhánh đọc-lại im lặng không chạy; (3) phương trình `x^2-5x+6=0` và nhân ngầm `5x` bị coi là "đọc sai" trước khi tách theo dấu quan hệ.

### Việc còn lại của đợt 4A
- Thẻ UI “xác nhận đề” trong `DuoMCBPage.js` (hiện đã có câu hỏi xác nhận dạng văn bản; UI nút bấm là cải tiến kế tiếp).
- Chạy live với ảnh đề thật sau khi quota/khoá được khôi phục (OpenRouter free đang chập chờn `429` trong lúc kiểm chứng, xem mục Đợt 3).

## Đợt 4B — Bộ giải có công cụ + hậu kiểm (không còn "đáp án nói là tin")

### Lỗ hổng được vá
Đợt 4A bảo đảm **đọc đúng đề**. Nhưng lời giải vẫn có thể sai ở phần **tính toán**: model tự nhẩm, hoặc dùng đúng con số nhưng sai biểu thức — và trước đợt này **không có gì kiểm tra đáp án cuối** (SymPy chỉ kiểm mấy bước số học trong văn xuôi).

### Kiến trúc mới — module `backend/math_solver.py`
```
Problem IR (latex + diagram + lời học sinh)   ← không bao giờ là ảnh thô
   → SOLVER SYSTEM + 4 tool SymPy (model tự gọi, tính chính xác tuyệt đối)
        sympy_eval · sympy_solve · sympy_verify · sympy_simplify
   → vòng gọi tool (tối đa 3 lượt) → lời giải + dòng cuối `Đáp án: …`
   → KIỂM TRA TẤT ĐỊNH (không tin model nào):
        1. sanity        — bán kính/độ dài/diện tích không âm, xác suất ≤ 1
        2. presolve      — đáp án có nằm trong tập nghiệm SymPy của chính đề không
        3. substitution  — thay đáp án ngược vào phương trình gốc
        4. identities    — mọi đẳng thức in ra trong bài làm phải đúng (bỏ từ đệm tiếng Việt)
   → CRITIC khác họ model: {"verdict": correct|wrong|unclear, failed_steps[], corrected_final}
   → nếu có lỗi: ĐÚNG 1 lượt sửa kèm bằng chứng lỗi → kiểm lại
   → vẫn không đạt ⇒ thêm nhãn "⚠️ Chưa kiểm chứng được đáp án này (…)" vào cuối câu trả lời
```

### Nối vào `/api/chat`
- Chạy **sau** `typesafe_guard` và trước khi lưu lịch sử; `MATH_VERIFY_MODE=auto` chỉ kiểm khi có căn cứ (có `perception` từ ảnh, hoặc câu trả lời có đáp án trích được cạnh toán tử).
- Phản hồi có thêm `verification: {verified, repaired, mode, notes, checks[], critic, tool_calls}`.
- `_openrouter_chat()` được mở rộng: tham số `tools`, `tool_choice`, `raw_message` (trả nguyên message để vòng tool-calling đọc được `tool_calls`).

### Kiểm chứng
- `python backend/test_math_solver.py` → **25/25 checks pass** (không cần mạng/khoá): tool chạy đúng, guard chặn `__import__`/input dài, vòng tool-calling 2 lượt, đáp án sai bị bắt **tất định**, nhánh sửa-1-lần thành công, nhánh không sửa được ⇒ cờ `verified: false` + nhãn cảnh báo, chế độ `off` không gọi gì.
- `python backend/test_math_reader.py` → vẫn **36/36** (không hồi quy).
- Hai lỗi thật bắt được khi viết test: (1) `check_identities` coi `x = 3` (đáp án) là "hằng đẳng thức" ⇒ báo sai hàng loạt và kích hoạt sửa vô ích; (2) bộ kiểm đẳng thức chỉ nhìn vào dòng đáp án, **không** kiểm các bước trong bài làm ⇒ thêm `extract_equalities()` + `_verify_identity()` (bỏ tối đa 4 từ đệm tiếng Việt trước khi parse).

### Việc còn lại của đợt 4B
- Bật tool-calling cho **Gemini** ở tầng chính của chat (đã có `GEMINI_TOOLS`/`evaluate_math_expression` sẵn nhưng Gemini chưa được gọi kèm tool trong luồng chat).
- Geo chuyên sâu: dùng `geometry_verification.verify_geometry_mathviz` cho tầng kiểm chứng hình học (hiện hình học dựa vào critic + quan hệ trong IR).
- Ghi telemetry `ai_quality_log` để đo tỉ lệ `verified` theo từng model (thuộc Đợt 4C).

## Đợt 4C — Đo lường chất lượng + cổng CI (xếp hạng model bằng dữ liệu thật)

### Telemetry: bảng `ai_quality_log`
| Thành phần | Nội dung |
|---|---|
| Bảng | `ai_quality_log {surface, model, tier, provider, latency_ms, verified, consensus, confidence, fallback, notes, created_at}` + 2 index (`created_at`, `surface+model`) — tạo trong danh sách migration của `main.py` như `admin_audit_log` |
| `quality_log(...)` | Ghi 1 dòng mỗi kết quả AI; **không bao giờ raise** (cùng hợp đồng với `audit_admin`) — telemetry không được làm hỏng request đang đo |
| `quality_summary(days)` | Gom theo `surface + model`: số lượt, tỉ lệ `verified`, số lượt `unverified`, latency trung bình, số lần rơi vào đường demo (`fallback`) + 25 dòng gần nhất |
| Endpoint | `GET /api/admin/ai-quality?days=7` (admin-only, `days` kẹp trong 1..90) |
| Điểm gọi | dịch (`/api/translate`: model/tier/latency/fallback, kể cả nhánh mock) · chat (tier `verify_ok`/`verify_failed` + notes) · nhận diện (consensus, confidence, `needs_confirm`) |

### Cổng CI: `.github/workflows/quality-gate.yml`
- **Job `offline-suites`** (push/PR): 4 bộ test **không cần khoá, không cần mạng** — `test_math_reader.py`, `test_math_solver.py`, `test_typesafe_guard.py`, `tests/eval_math_regression.py`. Cài phụ thuộc gọn (sympy/numpy/Pillow/httpx/pydantic/json-repair/gradio_client) thay vì cả `requirements.txt` (tránh kéo torch/sentence-transformers cho CI).
- **Job `free-catalog`** (chạy hằng ngày 04:23 UTC + khi push): `python backend/scripts/check_free_catalog.py` — quét slug `:variant` trong **code/config** (bỏ qua file `.md` và **bỏ phần comment**, vì comment cố ý ghi lại các slug đã chết) rồi đối chiếu catalog OpenRouter; **exit 1** nếu có slug đã biến mất ⇒ biết trước khi người dùng gặp lỗi 400.

### Bằng chứng
```
test_math_reader.py      exit 0    test_math_solver.py     exit 0
test_typesafe_guard.py   exit 0    tests/eval_math_regression.py  exit 0
check_free_catalog.py    exit 0    tracked slugs: 8 — all tracked free slugs still exist
import main → 106 route (thêm /api/admin/ai-quality)
```

### Hạn chế đã biết
Telemetry nằm trong SQLite của backend (phù hợp free tier 1 worker); chưa có dashboard UI (dùng API admin). Khi cần phân tích sâu hơn, đẩy bảng này lên dịch vụ log tập trung.

## Đợt 4D — Củng cố bảo mật + kiểm chứng hình học + dọn nợ kỹ thuật

### 1. Gỡ 2 khoá TypeSafe hard-code (bảo mật)
`backend/typesafe_guard.py` từng chứa 2 khoá thật làm giá trị mặc định (`apikey_2426f1b9…`, `apikey_24266479…`) — trái với kết luận “đã triệt tiêu hard-code key” của Phase 0 và bộ luật gitleaks mặc định không nhận dạng dạng `apikey_<hex>_<hex>`.
- Đã đổi sang **chỉ đọc từ env** (`TYPESAFE_API_KEY_PRIMARY`/`_SECONDARY`); pool rỗng là trạng thái **hợp lệ** và guard tự lùi về đường rule-based.
- Thêm luật gitleaks tuỳ biến `typesafe-apikey` (`.gitleaks.toml`) để dạng này không quay lại.
- `test_typesafe_guard.py` cập nhật theo hợp đồng mới: pool phải **phản ánh env**, nhánh kiểm thử xoay khoá chỉ chạy khi có ≥2 khoá (trước đây assert cứng `== 2` nên khoá hard-code là điều kiện để test xanh — đúng thứ cần loại bỏ).

### 2. Kiểm chứng hình học trong tầng hậu kiểm
`math_solver.check_geometry()` trích khối viz (`layers`) trong câu trả lời và gọi lại **cổng kiểm định trước khi render** của Phase 3 (`geometry_verification.verify_geometry_mathviz`): sơ đồ học sinh sắp thấy phải thoả chính các dựng hình/quan hệ mà nó khai báo. Không có viz block ⇒ `skipped` (critic vẫn phủ bài toán hình học chữ).

### 3. Xác nhận hạng mục đã có sẵn (không cần làm)
Tool-calling cho **Gemini**: `main.py:3735` đã gắn `GEMINI_TOOLS` cho nhánh chat văn bản và `main.py:3839-3858` đã xử lý `functionCall` → chạy `evaluate_math_expression` → trả `functionResponse`. Không còn việc tồn ở mục này.

### 4. Việc còn lại của 4D (đã cập nhật)
- ✅ **Thẻ UI “xác nhận đề” + nhãn kiểm chứng đã hoàn tất** (`DuoMCBPage.js`): khi `ocr_confirm` xuất hiện, học sinh bấm chọn một trong hai cách đọc và tin nhắn gửi lại **đúng LaTeX** đó (không cần gửi lại ảnh); kèm dòng trạng thái `✅ đã kiểm chứng` / `⚠️ chưa kiểm chứng được đáp án` và độ tin cậy của bước đọc.
- Cách kiểm chứng cú pháp frontend (đã thay công cụ sau sự cố build Vercel):
  - ❌ **`@babel/parser` KHÔNG đủ**: nó chấp nhận cả `}` lạc trong JSX lẫn khai báo hàm **trùng tên** — đúng hai lỗi đã làm `pnpm build` trên Vercel thất bại ở commit `3bd29c4`.
  - ✅ **Dùng `tsc --noEmit --allowJs --checkJs false --jsx preserve --target esnext --module esnext --moduleResolution bundler --skipLibCheck`** (TypeScript đã có trong `node_modules`, config tạm `tsconfig.syntax.json` trỏ vào `src/**/*.js|jsx`): bắt được khai báo trùng **và** JSX sai cấu trúc, chạy vài giây, không ngốn RAM như Turbopack.
  - `node --check` chỉ dùng cho file `.js` thuần và cũng không phát hiện trùng tên hàm ⇒ không còn là cổng đủ tin cậy.
  - `next build` đầy đủ vẫn là cổng cuối (máy này đã OOM Turbopack 2 lần) — Vercel chạy khi deploy.

### Sự cố build Vercel ở commit `3bd29c4` (đã sửa)
Log Vercel báo **2 lỗi, cùng do thao tác chèn code trong đợt này**:
1. `route.js`: `the name 'scrubSecrets' is defined multiple times` — tôi chèn lại một helper **đã tồn tại** ở đầu file (hàm trùng tên vẫn là JS hợp lệ nên `node --check` cho qua, nhưng SWC/Turbopack coi là lỗi).
2. `DuoMCBPage.js`: `Unexpected token` tại `)}` — khi chèn thẻ “xác nhận đề” tôi **đã xoá mất dòng mở block `{vizData && m.role === "assistant" && (`` của MathViz, để lại phần thân block mồ côi.

Bản vá: xoá helper trùng (giữ bản gốc) + khôi phục dòng mở block MathViz; sau đó `tsc` trên cả `src/` trả **exit 0** trước khi push. Bài học được mã hoá vào quy trình ở mục “Cách kiểm chứng cú pháp frontend” phía trên.
- Đẩy `ai_quality_log` lên dịch vụ log tập trung khi có nhu cầu phân tích dài hạn.

## Đợt 4E — Ôn tập giãn cách bằng FSRS (integration-guide mục 2.4)

### Vì sao
Ứng dụng đã biết học sinh **yếu kỹ năng nào** (`/ketqua`, `test_results`, `utils/mastery.js`) nhưng chưa biết **nên ôn lại khi nào**. FSRS (Free Spaced Repetition Scheduler) biến mỗi kỹ năng yếu thành một thẻ có ngày đến hạn thích ứng theo trí nhớ thực tế — nửa còn thiếu của lộ trình học.

### Thành phần
- **`backend/fsrs_scheduler.py`** — thuần (không DB/HTTP, không import `main`) nên test offline được: `new_card`, `review`, `is_due`, `rating_from_accuracy` (92%→easy, 70%→good, 50%→hard, <40%→again), `entries_to_cards` (dựng thẻ từ `weakSkills` mà `/ketqua` vốn đã gửi), `summarise`, `card_to_storage`/`card_from_storage` (JSON⇄Card), `desired_retention` (`FSRS_DESIRED_RETENTION`, mặc định 0.9, kẹp 0.70–0.97).
- Ghi chú API: **`fsrs` 6.x giữ `reps`/`lapses` trong ReviewLog, không trong Card** (khoá Card: `card_id, difficulty, due, last_review, stability, state, step`) ⇒ bộ đếm do bảng của ta quản lý, `summarise()` hợp nhất lại để API không lộ chi tiết này.
- **Bảng `relearn_cards`** (migration trong `main.py`): `UNIQUE(user_id, card_key)`, `card_json` (trạng thái FSRS), `due_at` tách riêng + index ⇒ "hôm nay ôn gì" là truy vấn có index, không quét JSON.
- **Endpoint** (đều yêu cầu đăng nhập): `POST /api/relearn/seed` · `GET /api/relearn/due?limit=` · `POST /api/relearn/review` (nhận `again|hard|good|easy`).
- **Tự động hoá**: route Vercel `/api/learning-feedback` gọi `seedRelearnCards(weakSkills, request)` — fire-and-forget, chuyển tiếp `Authorization`, chạy ở **cả** nhánh AI lẫn nhánh dự phòng rule-based (kỹ năng yếu vẫn đáng ôn dù AI hỏng).

### Kiểm chứng
```
python backend/test_fsrs_scheduler.py  → 30/30 checks (offline, mốc thời gian cố định)
import main → 109 route (thêm 3 endpoint relearn)
runtime: upsert {created: 2} → due 2/2 → review 'good' → next_due +4h, reps 1 → còn 1 thẻ đến hạn
route.js: node --check OK · DuoMCBPage.js / pageketqua.js: JSX_PARSE_OK (@babel/parser)
fsrs>=6.0.0 đã thêm vào requirements.txt và bước cài của CI (test_fsrs_scheduler.py)
```

### Hạn chế đã biết
Thẻ mới rơi vào bước "learning" trong ngày nên `interval_days` ban đầu bằng 0 (đúng chuẩn FSRS). Chưa có màn hình danh sách ôn tập — hiện dùng API `GET /api/relearn/due`; đề xuất gắn vào `/mrm/settings` hoặc thêm mục “🔁 Ôn tập hôm nay”.

## Kiểm chứng chuỗi Phase 4 trên production (sau khi chủ dự án cấu hình khoá)

| # | Hạng mục | Kết quả |
|---|---|---|
| 1 | `POST /api/translate` | ✅ 200 · `provider=openrouter` · `model=nvidia/nemotron-3-ultra-550b-a55b:free` · `_fallback` rỗng · **đã tự failover** khi model đầu bị 429 ⇒ cơ chế tự-loại-slug/429 chạy thật trên prod |
| 2 | `GET /api/relearn/due` (không auth) | ✅ **401** ⇒ endpoint FSRS đã deploy trên Render (trước đó là 404) |
| 3 | `GET /api/admin/ai-quality` (không auth) | ✅ 401 ⇒ telemetry có bảo vệ |
| 4 | `/DuoMCB`, `/ketqua` (Vercel) | ✅ 200 |
| 5 | `POST /api/learning-feedback` (Vercel) | ❌ **500** → đã tìm ra nguyên nhân và vá (dưới đây) |

### Sự cố 500 ở `/api/learning-feedback` (đã vá trong working tree)
`fallbackAfterProviderFailure(...)` dùng biến `request` để chuyển tiếp `Authorization` khi gieo thẻ ôn tập, nhưng **`request` không phải tham số của hàm** ⇒ mỗi lần Groq lỗi (Groq đã bị thu hồi nên **luôn** lỗi) ném `ReferenceError: request is not defined` → route trả **500** (trước bản 4E route trả 200 degraded, nên đây là hồi quy do đợt này).
**Bản vá:** thêm tham số `request` + truyền ở **cả hai** điểm gọi (nhánh thiếu khoá Groq và nhánh Groq lỗi); nhánh OpenRouter thành công cũng gieo thẻ ôn tập.

### ⚠️ Trạng thái commit (quan trọng)
Bản vá **đang nằm trong working tree, CHƯA commit/push** vì shell của phiên làm việc bị treo giữa chừng (PowerShell không chạy được lệnh nào nữa, kể cả `python -c`). Cần chạy:

```powershell
git -C "duosteam" add frontend/src/app/api/learning-feedback/route.js
git -C "duosteam" commit -m "fix(feedback): pass request into the fallback helper (prod 500)" -m "fallbackAfterProviderFailure referenced request without having it as a parameter; every Groq failure (Groq is revoked) raised ReferenceError and the route answered 500. Both call sites pass request now, and the OpenRouter-success branch seeds relearn cards too."
git -C "duosteam" push origin main
```

### Bài học về cổng kiểm tra (cập nhật lần 2)
- `tsc` chỉ-cú-pháp (`frontend/tsconfig.syntax.json`) bắt được **JSX sai cấu trúc** và **khai báo trùng tên** (2 lỗi build Vercel ở `3bd29c4`) nhưng **không** bắt biến chưa định nghĩa trong thân hàm.
- ESLint với config hiện tại của dự án **cũng không bắt** lớp lỗi này (đã thử trên chính file lỗi: 0 cảnh báo).
- ✅ **Đã bổ sung cổng** (`frontend/tsconfig.checkjs.json`, chạy trong CI job `frontend-syntax`): `checkJs` **BẬT**, phạm vi **chỉ `src/app/api/**/*.js`** (để `src/lib` ra ngoài vì JSDoc cũ ở đó sẽ nhấn chìm tín hiệu), kèm `paths` `@/*` để import phân giải được. **Bằng chứng cổng bắt đúng lỗi thật:** dán lại nguyên bản `c4d5af3` vào `src/app/api/_probe_buggy.js` rồi chạy cổng ⇒
  `src/app/api/_probe_buggy.js(142,49): error TS2552: Cannot find name 'request'. Did you mean 'Request'?` (exit 2) — chính dòng đã gây 500; xoá probe ⇒ exit 0. Từ nay lớp lỗi này bị chặn ở CI thay vì ở production.

### Việc còn lại sau kiểm chứng
1. **Commit + push bản vá 500** (lệnh ở trên) rồi chạy lại kiểm chứng #5 — kỳ vọng: `provider` có giá trị, `relearn.seeded = true`, không còn `degraded` khi Vercel đã có `OPENROUTER_API_KEY`.
2. **`keys=3` ở nhánh văn xuôi**: khi model trả prose, payload degraded chỉ có 3 khoá (`translation*`) mà thiếu `summary*` ⇒ bổ sung `summary` (cắt từ chính prose) để DuoTranslate luôn nhận đủ **6 khoá song ngữ**.
3. (đề xuất) Màn **“🔁 Ôn tập hôm nay”** dùng `GET /api/relearn/due` + 4 nút `again/hard/good/easy` gọi `/api/relearn/review`; sau đó **Serwist** (PWA offline, nhớ `NetworkOnly` cho `/api/*`).

## Đợt 4G — Sửa quyền riêng tư Service Worker + trang offline (guide mục 2.7)

### Lỗi riêng tư phát hiện được (đang ảnh hưởng người dùng thật)
`frontend/public/sw.js` (v1 — **đang được `usePWAInstall.js` đăng ký**) cache **mọi phản hồi `/api/*` thành công** rồi phát lại khi mất mạng:
- Phản hồi API là **dữ liệu theo từng người** (bản dịch, nhận xét AI, lịch ôn FSRS) ⇒ trên máy dùng chung (lớp học, máy tính chung), học sinh này có thể được phục vụ dữ liệu của học sinh khác;
- Bản phát lại trông y như phản hồi mới ⇒ sai lệch **âm thầm**.
Guide đã dặn rõ `/api/*` phải `NetworkOnly` — đây đúng là trường hợp đó.

### Đã sửa
- `/api/*` cùng mọi host AI/Firebase/Google ⇒ **NETWORK-ONLY**: handler trả về **không gọi `respondWith`**, trình duyệt đi thẳng ra mạng và **không ghi cache**; lỗi mạng vẫn là lỗi thật (UI đã có sẵn trạng thái demo/lỗi).
- `CACHE_NAME` bump `duomath-v1` → **`duomath-v2`** ⇒ mọi trình duyệt đã có cache v1 nhiễm dữ liệu sẽ **tự xoá ở `activate`** (nhánh dọn cache cũ đã có sẵn).
- Thêm `/offline` vào precache và làm fallback cho điều hướng lỗi; trang mới `frontend/src/app/offline/page.js` (thuần tĩnh, có link về trang chủ và `/relearn`).
- Giữ nguyên chiến lược cũ cho phần còn lại: cache-first cho tài sản tĩnh, network-first cho trang HTML.

### Vì sao KHÔNG dùng `@serwist/next` (ghi lại để khỏi thắc mắc sau này)
`next build` của dự án chạy **Turbopack** (log build: `▲ Next.js 16.1.6 (Turbopack)`), còn Serwist cắm **plugin webpack** ⇒ worker sinh ra sẽ **không bao giờ được phát hành** — một dạng “im lặng không làm gì” đúng như những lỗi đợt này đang loại bỏ. Vì vậy giữ **SW tĩnh trong `public/`**: không phụ thuộc bundler, `node --check` kiểm được, và chính sách cache viết tường minh. Nếu sau này cần precache theo route/manifest sinh tự động, có thể thêm Serwist trên nền `next build --webpack`.

### Kiểm chứng đợt 4G
```
node --check frontend/public/sw.js        → OK (cú pháp service worker)
frontend tsc cú pháp src/** (gồm /offline) → exit 0
frontend tsc checkJs src/app/api/**        → exit 0
```
Hệ quả cần biết: người dùng đang mở app sẽ nhận SW v2 ở lần tải kế tiếp; lần đầu sau khi cập nhật, cache v1 bị xoá nên vài tài sản tĩnh sẽ được tải lại một lần (bình thường, không ảnh hưởng dữ liệu học tập).

## Đợt 4H — Kiểm chứng thật vòng FSRS + widget tương tác Mafs (guide 2.5)

### 1. `test_relearn_flow.py` — vòng FSRS chạy thật qua HTTP có xác thực (16/16)
`/api/relearn/*` cố tình trả 401 khi ẩn danh, nên chỉ **cuộc gọi có token** mới chứng minh được chuỗi. Test chạy **chính app FastAPI** trong tiến trình (ASGI transport), tự tạo tài khoản bằng `/api/signup` rồi `/api/login` (JWT nội bộ — không cần Firebase/Internet) và đi hết hành trình của học sinh:

```
signup → login (token) → ẩn danh bị 401
   → seed 2 kỹ năng yếu            ⇒ created=2
   → seed lại (idempotent)         ⇒ refreshed=1
   → GET due                       ⇒ due_count=2, thẻ có days_until_due/interval_days
   → review "good"                 ⇒ reps=1 + có next_due
   → GET due lại                   ⇒ thẻ rời hàng đợi (due_count=1), nằm ở "upcoming"
   → review "again"                ⇒ lapses=1, interval_days ≤ 1 (ôn lại sớm)
   → thiếu card_id ⇒ 400 · card lạ ⇒ 404
16/16 checks — ALL_RELEARN_FLOW_TESTS_PASSED
```
Mảnh cuối chứng minh tính năng khép kín: **seed → lịch FSRS → đánh giá → ngày ôn kế tiếp** qua đúng các endpoint đang chạy trên production. Vẫn nên làm một lần bằng trình duyệt với tài khoản thật (đăng nhập → làm bài → mở `/relearn`) để kiểm tra phần UI.

### 2. Mafs — widget “📈 Khám phá đồ thị” (guide mục 2.5)
- Cài `mafs@0.21.0` (React + SVG, **không WASM**) — chọn Mafs trước Penrose vì Penrose mang lõi WASM cần vòng xác minh bundler/asset riêng.
- `frontend/src/components/duomath/ParabolaExplorer.jsx`: ba thanh trượt `a, b, c` → vẽ parabol (`Plot.OfX`), đánh dấu **đỉnh** (đỏ) và **nghiệm** (xanh), hiển thị **Δ = b²−4ac**, số nghiệm, trục đối xứng; có nhánh riêng cho `a = 0` (suy biến thành đường thẳng). Import `mafs/core.css` ngay trong component.
- `frontend/src/app/khampha/page.js`: tải widget bằng `next/dynamic({ ssr: false })` (Mafs cần DOM) + 3 gợi ý học tập; có link chéo ⇄ `/relearn`.
- Ý nghĩa sư phạm: đỉnh/Δ/nghiệm ở đây dùng **cùng công thức** mà bộ giải trên máy chủ kiểm chứng bằng SymPy ⇒ học sinh nhìn thấy đúng phép tính trợ lý đã thực hiện.

### Cổng kiểm tra đợt 4H
```
frontend tsc cú pháp src/** (gồm .jsx mới) → exit 0
frontend tsc checkJs src/app/api/**       → exit 0
python backend/test_relearn_flow.py (venv) → 16/16 exit 0
```
Ghi chú: `test_relearn_flow.py` **chưa** đưa vào CI vì cần `import main` (fastapi/slowapi/PyJWT/werkzeug/orjson…); muốn gác ở CI thì phải cài thêm nhóm phụ thuộc đó cho job. Hiện chạy tay: `python backend/test_relearn_flow.py`.

## Đợt 4F — Khép kín vòng ôn tập + dọn nợ (sau kiểm chứng prod)

### Kết quả kiểm chứng prod (lần 2, sau khi chủ dự án commit bản vá `5c2d646`)
| # | Hạng mục | Kết quả |
|---|---|---|
| 1 | `POST /api/translate` | ✅ 200 · `provider=gemini` · **đủ 6 khoá song ngữ** |
| 2 | `POST /api/learning-feedback` | ✅ **200** (hết 500) · `reason=groq_404\|openrouter_no_key` · `relearn={"seeded": false, "reason": "http_401"}` (đúng: gọi không auth) |

| 3 | `GET /api/relearn/due` | ✅ 401 |
| 4 | `GET /api/admin/ai-quality` | ✅ 401 |
| 5 | `/DuoMCB`, `/ketqua` | ✅ 200 |

⇒ Chuỗi AI + ôn tập đã chạy thật; **duy nhất Vercel còn thiếu `OPENROUTER_API_KEY`** (và khoá Groq trên Vercel trả `404`), nên nhận xét vẫn ở chế độ đơn giản. Thêm 2 biến + Redeploy là xong.

### Đã làm trong đợt 4F
1. **Màn “🔁 Ôn tập hôm nay”** — `frontend/src/app/relearn/page.js` (mới): gọi `GET /api/relearn/due` qua `authFetch` (kèm Firebase token), hiển thị **thẻ đến hạn** với 4 nút tự đánh giá (`Quên rồi / Khó / Được / Dễ`) gọi `POST /api/relearn/review`, kèm danh sách **Sắp tới**, mục tiêu ghi nhớ của FSRS, trạng thái 401 → mời đăng nhập. Link vào từ khối “🔴 Kỹ năng cần cải thiện” ở `/ketqua`.
2. **Nhánh dịch văn xuôi giữ đủ 6 khoá**: payload degraded nay có `summary` + tự điền nốt slot `summary_vi`/`summary_en` còn thiếu (kèm cờ `_degraded_format` để caller biết chất lượng).
3. **Retention cho telemetry**: `quality_log()` tự xoá dòng cũ hơn `AI_QUALITY_RETENTION_DAYS` (mặc định 90) — dùng `idx_quality_created` nên rẻ.
4. **Docstring `typesafe_guard.py`** viết lại trung tính: nêu rõ thứ tự “SymPy tất định trước → middleware TypeSafe tuỳ chọn sau”, guard vẫn chạy với 0 khoá.

### Kiểm chứng & commit đợt 4F
```
test_math_solver.py             exit 0   ALL_MATH_SOLVER_TESTS_PASSED
test_math_reader.py             exit 0   ALL_MATH_READER_TESTS_PASSED
test_fsrs_scheduler.py          exit 0   ALL_FSRS_TESTS_PASSED
test_typesafe_guard.py          exit 0   ALL 5/5 TESTS PASSED
tests/eval_math_regression.py   exit 0
import main                     exit 0   ROUTES 109
frontend tsc (cú pháp src/**)   exit 0
```
Lưu ý vận hành (đã gặp trong phiên): PowerShell bị treo nhiều lần ⇒ tiến trình kiểm tra phải chạy **detached** (`Start-Process -WindowStyle Hidden`) và ghi kết quả ra file, vì mỗi lệnh mới sẽ đóng terminal và giết tiến trình đang chạy; tiến trình detached cần **đường dẫn tuyệt đối tới python của `.venv`** (không dùng `python` trần) và **không có `node` trong PATH** nên cổng `tsc` phải chạy ở shell tương tác.


## Lưu ý phụ thuộc

- `@streamdown/math@1.0.2` phụ thuộc `katex ^0.16.27` trong khi app dùng `katex ^0.17.0` ⇒ pnpm cài 2 bản KaTeX (CSS trùng lặp nhẹ, không ảnh hưởng chức năng). Khi Streamdown nâng lên KaTeX 0.17 có thể bỏ import CSS trùng.
- ~~Trước khi thêm Penrose: `@penrose/core` có WASM và Turbopack từng lỗi với loader `.wasm`.~~ **Đã đo lại ở đợt 5** (xem mục Đợt 5): `@penrose/core@3.3.1` **không chứa tệp `.wasm` nào** và không dùng `eval`/`new Function` (kể cả `mathjax-full`) ⇒ CSP giữ nguyên, không cần `wasm-unsafe-eval`. Luật còn đúng: luôn `dynamic(..., { ssr: false })` vì Penrose cần DOM.

## Kiểm chứng đợt 1

- `pnpm install` chạy postinstall → `[mathlive] copied 20 font file(s) and 5 sound file(s) into public/` (exit 0).
- `next build` phải pass (270 route) trước khi commit — nếu build lỗi, xem log `%TEMP%\duomath_build9.log`.

## Kiểm chứng đợt 2 trên production (`044a176`)

- Render: deploy `044a176` **live**; Vercel: `/ketqua`, `/DuoMCB`, `/Lesson10_DinhLiCos` đều **200**.
- `POST /api/translate` (cả 2 chiều) trả **đủ 6 khoá song ngữ**: `translation`, `translation_vi`, `translation_en`, `summary`, `summary_vi`, `summary_en` — đúng thiết kế đợt 2.

### Sự cố phát hiện khi kiểm chứng: khoá Groq đã bị thu hồi

- Gọi trực tiếp Groq từ máy dev: `GET /v1/models` và `chat/completions` với mọi model đều trả **401 `Invalid API Key`** → khoá `GROQ_API_KEY` hiện tại đã hết hiệu lực (khả năng cao bị Groq tự thu hồi vì từng bị lộ khi repo còn public).
- Hệ quả: `/api/translate` và `/api/mathmap/parse-file` ở production **âm thầm rơi vào mock** — payload vẫn 200 nhưng nội dung là mẫu có sẵn (`Hàm số bậc hai (Parabola)`, `Dịch nghĩa tương ứng`).

### Đã xử lý trong code (không cần chờ khoá mới)

1. **Tầng dự phòng Gemini** cho `/api/translate`: Groq → **Gemini** (`_gemini_json` + `_TRANSLATE_SCHEMA`, tối đa 2 lần thử để vượt lỗi 503 thoáng qua) → mock. Phản hồi do Gemini tạo được gắn `_provider: "gemini"`.
2. **Cờ `_fallback`**: `mock_no_key` (thiếu khoá) hoặc `mock_error` (cả 2 nhà cung cấp lỗi) → client biết ngay là đang ở chế độ demo thay vì tưởng là AI thật.
3. **Frontend**: `DuoTranslate` hiện cảnh báo `⚠ chế độ demo (AI dịch chưa phản hồi)` khi thấy `_fallback`.
4. **Che khoá trong log** (`_scrub_secrets`): httpx đưa nguyên URL vào thông báo lỗi nên `?key=<GEMINI_KEY>` từng lọt vào log Render; nay các mẫu `key=***`, `Bearer ***`, `AIza***`, `gsk_***`, `hf_***`, `sk-or-v1-***` đều được thay bằng `***`.
5. **Route Vercel `/api/learning-feedback`** cũng dùng khoá Groq: trước đây khoá hỏng ⇒ trả **502** và trang kết quả báo lỗi. Nay tách hàm `buildRuleBasedFeedback()` và **thoái hoá êm**: trả 200 kèm `degraded: true` + nhận xét tổng hợp theo luật; `pageketqua.js` hiện dòng nhắc `⚠ Chế độ đơn giản…` khi thấy cờ này.

### Bằng chứng chạy thử cục bộ (chuỗi nhà cung cấp)

- `"quadratic equation"` → Groq 401 → **Gemini OK**: `_provider: gemini`, `translation_en: "quadratic equation"`, `words[0].english: "quadratic equation"`, `words[0].vietnamese: "phương trình bậc hai"`.
- `"phương trình bậc hai"` (lúc Gemini trả 503 cả 2 lần thử) → `_fallback: mock_error` + log `[translate] Gemini fallback failed (... key=***)` → xác nhận vừa thoái hoá an toàn vừa không lộ khoá.

### Chẩn đoán cuối cùng từ log Render (deploy `1a5fbf1`)

Đọc log Render (`GET /v1/logs`) cho thấy **cả hai** nhà cung cấp AI trên production đều lỗi xác thực:

```
[translate] Groq call failed (HTTPStatusError: Client error '401 Unauthorized' ...)
[translate] Gemini fallback failed (HTTPStatusError: Client error '401 Unauthorized'
            for url '.../models/gemini-3.6-flash:generateContent?key=***')
```

---

## Đợt 5 — Penrose (guide mục 1): hình học minh hoạ tự dựng

### Đo lại hai định kiến trước khi viết mã (đây chính là phần "verify" kế hoạch yêu cầu)

| Điều kế hoạch lo | Số đo thực tế trên `@penrose/core@3.3.1` |
| --- | --- |
| "Penrose mang lõi WASM ⇒ rủi ro loader `.wasm` của Turbopack" | **Không có tệp `.wasm` nào** trong gói (3.9 MB, file lớn nhất `dist/bundle/index.js` 2.7 MB JS thuần) ⇒ không cần `wasm-unsafe-eval`, không cần vòng riêng cho asset |
| "Có thể phải nới CSP để chạy WASM/`eval`" | `eval(`/`new Function`: **0** trong `@penrose/core` (`index.js`, `bundle/index.js`, `lib/Functions.js`, `utils/CollectLabels.js`) và **0** trong toàn bộ `mathjax-full` ⇒ **CSP giữ nguyên 100%** |
| "Phải luôn `dynamic(..., { ssr: false })`" | Vẫn đúng: `diagram()` cần DOM thật |
| Giấy phép | `license: MIT` ⇒ dùng được, không phải theo dõi bản quyền ảnh như hình stock |

### Đã thêm

- `frontend/src/lib/penroseTrios.js` — 2 **trio** tự viết (domain + style + substance): *trọng tâm & ba đường trung tuyến*, *đường tròn ngoại tiếp*. Bản Penrose đã cài **không kèm domain hình học nào**, nên mọi thứ dựng từ `Circle`/`Line`/`Polygon`/`Text` + số học vector, chỉ dùng đúng từ vựng mà gói thực có (`constrDict` 34 ràng buộc, `compDict` 228 hàm, `objDict` 24 mục tiêu).
- `frontend/src/components/duomath/PenroseFigure.jsx` — nạp `@penrose/core` bằng `import()` động trong `useEffect`, gọi `diagram()` (Penrose **tự chèn DOM node**, không đi qua chuỗi HTML do mình ghép), kèm nút đổi hình/đổi trio, trạng thái đang dựng, hạn chờ `<svg>` 20 s và khối lỗi có thể thử lại.
- `frontend/src/app/khampha/page.js` — mục "🧭 Hình học minh hoạ (Penrose)" (`dynamic`, `ssr: false`).
- `frontend/scripts/check-penrose-trios.mjs` — cổng chạy **trong Node, không cần DOM**: compile + optimize từng trio rồi đọc `evalFns()` và **thất bại nếu còn ràng buộc chưa thoả**; thêm `--vocab` (in từ vựng Style) và `--diagnose` (in phân rã năng lượng).
- `.github/workflows/quality-gate.yml` — job **`frontend-build`**: `pnpm install --frozen-lockfile` → cổng trio → `pnpm build` (Turbopack). Đây là "vòng build/bundler thật" mà kế hoạch yêu cầu; job không cần secret vì cấu hình Firebase công khai nằm sẵn trong `src/lib/firebase.js`.

### Bằng chứng (chạy thật)

```
node scripts/check-penrose-trios.mjs
ok  trung-tuyen — 15 shapes · canvas 440x340 · constraints 26 (worst 0.0e+0) · stages 1
ok  ngoai-tiep  — 11 shapes · canvas 440x340 · constraints 22 (worst 1.6e-12) · stages 1
ALL_PENROSE_TRIOS_OK
```
`worst 1.6e-12` = ba đẳng thức "cách đều ba đỉnh" được giải tới độ chính xác máy ⇒ **tâm ngoại tiếp là tâm thật**, không phải hình may rủi.

### 6 lỗi thật đã bị cổng này bắt (đều sẽ nổ trước mặt học sinh)

1. `forall Segment s, Point p, Point q` **không hợp lệ**: ngữ pháp Style v3 là `decl_patterns → decl_list (";" decl_list)*`, mỗi `decl_list` = **một type + danh sách biến** ⇒ phải là `forall Segment s; Point p, q`.
2. `p.label = Text {...}` sinh **vòng lặp biến** (`p.label` là tên đối tượng có sẵn) ⇒ đổi thành `p.text`.
3. `ensure p.label above p.icon` không phải cú pháp; dạng đúng là hàm: `above(top, bottom, offset)`, `centerLabelAbove(...)`.
4. `onCanvas(shape)` thiếu tham số ⇒ `onCanvas(shape, canvas.width, canvas.height)`.
5. **Bài học đắt nhất**: `ensure isConvex(points, closed)` là ràng buộc **chỉ thị** (năng lượng 0/1, **không có gradient**) nên optimizer **không bao giờ** sửa được — đo được residual đứng nguyên ở 1.0. Phép thử loại trừ từng ràng buộc chỉ ra nó; thay bằng mục tiêu trơn `encourage nonDegenerateAngle(...)` + `notTooClose(...)` là về `0.0e+0`.
6. `where p != q` không được hỗ trợ ⇒ khác biệt hoá bằng predicate `Pair(Point p, Point q)` khai báo trong Substance.

### Việc còn lại (không chặn)

- `next build` cục bộ vẫn không chạy nổi trên máy này (RAM trống 1,3 GB); **job `frontend-build` mới là nơi xác nhận Turbopack đóng gói được `@penrose/core`** và nó chạy ngay ở lần push này.
- Nên mở `/khampha` bằng trình duyệt một lần để nhìn bố cục/nhãn bằng mắt — phần toán đã được máy kiểm tới 1e-12.


- `key=***` ⇒ `_scrub_secrets()` đang hoạt động, log Render không còn lộ khoá.
- Kiểm tra trực tiếp bằng khoá trong `backend/.env` (**chỉ in trạng thái, không in khoá**):
  `groq: 401` (đã chết) · `gemini: 200` (**còn sống**) · `openrouter: 200` (**còn sống**).
- `GET /v1/services/{id}/env-vars` trên Render liệt kê: `ADMIN_EMAILS, ALLOWED_ORIGINS, GEMINI_API_KEY, GROQ_API_KEY, JWT_SECRET, NEXT_PUBLIC_BACKEND_URL, SELF_URL` ⇒ **`GEMINI_API_KEY` trên Render là khoá khác (đã bị thu hồi), và production không có `OPENROUTER_API_KEY`**.

⇒ Việc cần làm để AI chạy thật trên production (chỉ chủ dự án làm được):

1. Render → service `duomath` → **Environment** → sửa `GEMINI_API_KEY` = giá trị `GEMINI_API_KEY` đang dùng tốt trong `backend/.env` (khoá local đã kiểm tra 200). Chỉ cần đổi 1 biến này là `/api/translate`, OCR `/api/mathmap/parse-file`… chạy thật trở lại.
2. (Khuyến nghị) Thêm `OPENROUTER_API_KEY` vào Render để có tầng dự phòng thứ ba.
3. Tạo khoá **Groq mới** (khoá cũ đã bị thu hồi) và cập nhật ở Render + Vercel + `backend/.env`.

### Kiểm chứng bằng chứng production (sau khi có khoá đúng)

- `/api/translate` phải trả `_provider: "gemini"` (hoặc `groq` khi khoá Groq mới hoạt động) và **không** có `_fallback`.
- Nếu vẫn thấy `_fallback: mock_error` ⇒ kiểm tra lại 2 biến môi trường ở trên; UI đã hiện cảnh báo demo nên không còn “âm thầm sai”.

### Kết quả kiểm chứng bản sửa trên production (deploy `995f2e4`)

```
POST https://duomath.vercel.app/api/learning-feedback
  trước:  502 {"error": "Failed to generate feedback"}
  sau:    200 degraded=True reason=groq_401
          "**Ưu điểm (Pros)** | - Kỹ năng **Algebra** khá tốt (90%). | **Hạn chế (Cons)** |
           - Cần cải thiện kỹ năng **Geometry** (đúng 2/5). | **Gợi ý ôn tập …**"
GET /ketqua -> 200 | GET /DuoMCB -> 200
```

- `reason=groq_401` xác nhận **khoá Groq trên Vercel cũng đã bị thu hồi** ⇒ vẫn cần tạo khoá Groq mới; nhưng người dùng giờ luôn nhận được nhận xét có ích + dòng nhắc “Chế độ đơn giản” thay vì lỗi.

---

## Đợt 4H — Sự cố CSP `http://localhost:8000` trên production (2026-09-27)

### Triệu chứng (DevTools, bản deploy đang chạy)

```
Refused to connect to 'http://localhost:8000/api/leaderboard' because it violates the
following Content Security Policy directive: "connect-src 'self' https://duomath.onrender.com …"
```

### Nguyên nhân gốc — đã xác minh trên production, không phỏng đoán

| Kiểm tra | Kết quả |
| --- | --- |
| `curl -I https://duomath.vercel.app` | `200` + CSP đang **enforce** từ `next.config.mjs` |
| chunk `8a41677b8863b953.js` do chính `duomath.vercel.app` phục vụ | **`localhost:8000` × 4**, `onrender.com` × 0 |
| chunk `3ee0e65c0561b9fb.js` (trang `/stats`) | `localhost:8000` × 1 |
| chunk `ee7337f5a2da1272.js` (cùng bản build) | `duomath.onrender.com` × 3 ⇒ bản deploy khớp `main` |
| `frontend/.env.local` | có `NEXT_PUBLIC_API_URL=http://localhost:8000` nhưng **bị `.gitignore`** ⇒ không bao giờ tới Vercel |
| `curl https://duomath.onrender.com/api/leaderboard` | `200 []` (backend sống) |
| `curl https://duosteam-api.onrender.com/api/leaderboard` | **404** ⇒ host này đã chết với mọi route API |

Chuỗi lỗi: bản build trên Vercel **thiếu `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_BACKEND_URL`** ⇒ 5 lời
gọi trong 4 tệp rơi vào giá trị cứng `"http://localhost:8000"` (`TrangChuForm.js` ×2 — trong đó có
`/api/leaderboard`, `StreakBar.js`, `MasteryRings.js`, `KnowledgeAlbum.js`) ⇒ **CSP của chính chúng ta
(đúng) chặn** ⇒ giao diện báo "Failed to fetch leaderboard".

Lỗi `manifest-src` trong cùng ảnh chụp **không phải lỗi ứng dụng**: tab đang mở một URL deployment đã
bị xoá (`404 DEPLOYMENT_NOT_FOUND`), Vercel chuyển hướng `/manifest.json` sang `vercel.com/sso-api`
và `manifest-src 'self'` chặn đúng. Chỉ cần mở `https://duomath.vercel.app` (không nới CSP).

### Cách sửa đã áp dụng

1. **`src/lib/apiBase.js` (mới)** — một nguồn duy nhất cho địa chỉ backend: env build-time →
   hostname heuristic → `https://duomath.onrender.com`; chỉ `localhost` / `127.0.0.1` / `::1` mới
   nhận `http://localhost:8000`, và phía server luôn là host production.
2. **29 tệp** chuyển sang `resolveApiBase()`: `lib/api.js`, `lib/authFetch.js`, `context/authContext.js`,
   `context/CoinStore.js`, 5 widget nói trên, 14 tệp có guard *ngược* (`hostname !== "127.0.0.1"` —
   production đúng nhưng dev lại gọi API production), `DuoMCB/duoServer.js`, `mrm/MathMapCreator.js`.
3. **5 widget đi qua `authFetch`** ⇒ token Firebase thật được gửi kèm; loại bỏ
   `localStorage.getItem("token")` (đã chết từ khi chuyển sang Firebase) — sửa luôn lỗi 401 tiềm ẩn
   của `/api/gacha/*` và `/api/gami/*`.
4. **`/aithi`**: `duosteam-api.onrender.com` (404 mọi route) → `duomath.onrender.com`; xoá host chết
   khỏi `connect-src`.
5. **CSP**: `connect-src` chỉ thêm `http://localhost:8000` khi `NODE_ENV !== "production"`;
   `/manifest.json` được trả `application/manifest+json`.
6. **`public/sw.js` v3**: **không cache HTML/RSC** (đây là nguyên nhân kinh điển của
   `PageNotFoundError` sau deploy — shell cũ trỏ tới `/_next/static/<hash>.js` đã biến mất),
   `/api/*` vẫn **network-only** như bản vá quyền riêng tư; worker được đăng ký trong `LayoutClient`
   (chỉ production).
7. **Cổng CI mới** `frontend/scripts/check-api-base.mjs`: chặn mọi `http://localhost:8000` ngoài
   `src/lib/apiBase.js`; đã nối vào `quality-gate.yml` và mở rộng `paths` sang `frontend/src/**`,
   `frontend/scripts/**`, `frontend/next.config.mjs`.

### Bằng chứng kiểm chứng cục bộ

| Hạng mục | Lệnh | Kết quả |
| --- | --- | --- |
| Logic resolver | harness 8 ca (host deploy không env, localhost, 127.0.0.1, env thắng, `BACKEND_URL`, phía server) | **8/8 PASS** |
| Cổng CI chống tái phát | chèn lại `… \|\| "http://localhost:8000"` vào `src/components/__gateprobe.js` | **exit 1** (chỉ đúng tệp:dòng) — xoá probe ⇒ **exit 0** |
| Cổng CI hiện có | `npx tsc -p tsconfig.syntax.json` / `tsconfig.checkjs.json` | **0 / 0** |
| Lint | `eslint` trên 24 tệp đã sửa | 36 vấn đề, **tất cả nằm ở dòng cũ** (đã đối chiếu từng dòng); `apiBase.js` và mọi vùng sửa sạch |
| Toàn vẹn tệp | 30 tệp: encoding, marker, không còn fallback cứng | **30/30 OK** (2 BOM trong `mrm/CoinShop.js`, `mrm/JackpotBanner.js` đã có từ trước — đối chiếu blob `HEAD`) |
| Build cục bộ | `next build` (Turbopack và `--webpack`) | **không chạy được trên máy này**: RAM trống 1.3 GB — Turbopack worker crash (`os error 10054`), webpack `JavaScript heap out of memory`. Build thật do CI/Vercel thực hiện. |

### Việc chủ dự án cần làm (Vercel) — bước còn lại duy nhất

1. Settings → Environment Variables → thêm cho **cả Production, Preview, Development**:
   `NEXT_PUBLIC_API_URL=https://duomath.onrender.com` và
   `NEXT_PUBLIC_BACKEND_URL=https://duomath.onrender.com` (nên thêm `SELF_URL=https://duomath.vercel.app`).
2. Deployments → **Redeploy** — bắt buộc, vì `NEXT_PUBLIC_*` được nhúng vào bundle **lúc build**.
3. Chỉ kiểm thử trên `https://duomath.vercel.app`; URL theo từng deployment là tạm thời.
4. Nếu `PageNotFoundError (.next/server/app/page.js)` quay lại: redeploy và **bỏ chọn**
   "Use existing build cache".

### Kết quả mong đợi sau deploy

- Console **không còn** `Refused to connect to 'http://localhost:8000/…'`; leaderboard + các widget
  trả `200` từ `duomath.onrender.com` (kể cả khi biến môi trường chưa được đặt, nhờ hostname heuristic).
- Trong bundle, `localhost:8000` chỉ còn đúng **1 chỗ** (hằng `DEV_API` của `apiBase.js`) và luôn nằm
  sau kiểm tra hostname — mẫu inline cũ (`process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`)
  phải vắng mặt hoàn toàn.
## Đợt 6 — VNHSGE: ngân hàng đề THPT (guide mục 2.8)

### Vì sao làm “cỗ máy” trước khi có dữ liệu thật

Dataset VNHSGE gốc (Hugging Face) là **repo gated**: phải có access token mới tải được, và hiện chưa
được cấp. Thay vì ngồi chờ, đợt này hoàn thiện **toàn bộ đường ống**: luật đọc/chuẩn hoá đề, cổng giấy
phép, tính idempotent, API và màn hình học sinh. Khi chủ dự án chốt nguồn dữ liệu, việc còn lại chỉ là
chạy một dòng lệnh — không phải viết lại gì.

### Cổng giấy phép (đây là quyết định kỹ thuật, không phải thủ tục giấy tờ)

`scripts/import_vnhsge.py` **bắt buộc** khai báo nguồn gốc và giấy phép: `--source` (định dạng tệp:
`jsonl`/`json`/`csv`/`hf`), `--license`, `--source-name`, tuỳ chọn `--attribution`, và phải xác nhận
bằng `--acknowledge-license`. Script từ chối chạy nếu thiếu, và **ghi lại giấy phép vào từng câu**
trong DB. Endpoint
`/api/exam/vnhsge/meta` đọc ngược lại để trang web in dòng ghi công. Hệ quả: không thể tồn tại một câu
hỏi trong ngân hàng mà không biết nó đến từ đâu — đúng yêu cầu “license + attribution” trong guide.

- Dữ liệu **mẫu** nằm trong repo: `backend/data/vnhsge_sample.jsonl`, do DuoMath **tự soạn** — chỉ để chạy
  test, **không phải đề thi thật**. Tệp này **không chứa trường giấy phép**: giấy phép do người nhập khai
  báo lúc chạy (lần nhập vào DB dev dùng `--source-name duomath-original-sample --license CC-BY-4.0`).
  Nó cố ý viết **hai kiểu khoá khác nhau ngay trong cùng một tệp** (một dòng dùng `choices` + `answer`,
  dòng khác dùng `options` là chuỗi JSON + `correct_answer`) — để chứng minh luật đọc chịu được dump lộn xộn.
- Ba lựa chọn cho chủ dự án: (a) tự soạn/tự chịu trách nhiệm nội dung, (b) dùng VNHSGE khi được cấp
  quyền tải + ghi attribution, (c) một nguồn mở khác có giấy phép rõ ràng.
- File `.db` sinh ra **không** được commit (đã có `*.db` trong `.gitignore`).

### Thành phần

| Tệp | Vai trò |
|---|---|
| `backend/vnhsge_bank.py` | Luật đọc/chuẩn hoá một câu, hash định danh, DDL dùng chung, nhãn môn học |
| `backend/scripts/import_vnhsge.py` | **Người ghi duy nhất**: cổng giấy phép, upsert idempotent, báo cáo câu bị bỏ |
| `backend/data/vnhsge_sample.jsonl` | Dữ liệu **mẫu tự soạn** (2 kiểu khoá khác nhau trong cùng tệp) để chạy test — không phải đề thật |
| `backend/test_vnhsge_bank.py` | 36 kiểm tra, gồm **import hai lần vào DB tạm** để chứng minh idempotent |
| `backend/main.py` | 3 endpoint `/api/exam/vnhsge/{meta,questions,random}` + DDL lúc khởi động |
| `frontend/src/app/nganhangde/page.js` | Trang ngân hàng đề (duyệt + luyện tập) |

### Các dạng đề thật phải chịu được (phần dễ hỏng nhất)

Dump thật không bao giờ đồng nhất một kiểu, nên luật đọc đã tính sẵn:

- nhãn đáp án viết `A.`, `A)`, `a.`, `(A)`, có hoặc không có khoảng trắng sau dấu — thậm chí **lẫn nhiều
  kiểu trong cùng một tệp**;
- đáp án nằm ở cuối đề dưới dạng “Đáp án: B”, “Đáp án đúng là B”, “Chọn B” — tách khỏi phần lựa chọn;
- lời giải nằm sau “Lời giải” / “Giải thích” / “Hướng dẫn giải” → cắt ra khỏi đề bài, không để lẫn vào
  câu hỏi học sinh đọc;
- câu có **hai đáp án** (`A, C`) → **loại bỏ**, không đoán (đề trắc nghiệm một đáp án mà có hai đáp án
  đúng thì không thể chấm);
- công thức LaTeX (`$...$`) **giữ nguyên**, không bị cắt theo dấu câu;
- chuẩn hoá Unicode + khoảng trắng không ngắt (NBSP) + xuống dòng trước khi so sánh;
- câu trùng nội dung (sau chuẩn hoá) chỉ vào ngân hàng **một lần**;
- câu thiếu đề / thiếu lựa chọn / đáp án ngoài dải A–D → bỏ **và đếm**, in ra cuối báo cáo nhập — không
  bao giờ bỏ im lặng.

**Vì sao import chạy lại được (idempotent):** mỗi câu có một hash SHA-256 trên nội dung *đã chuẩn hoá*;
script upsert theo hash, nên chạy lại cùng một tệp không nhân đôi câu. Test chứng minh bằng cách import
hai lần vào DB tạm rồi so tổng số và số câu theo từng môn.

### API (đã gọi thật trên DB dev)

| Endpoint | Việc |
|---|---|
| `GET /api/exam/vnhsge/meta` | Tổng số câu, số câu theo môn, **dòng ghi công + ghi chú giấy phép**, và gợi ý lệnh nhập khi ngân hàng trống |
| `GET /api/exam/vnhsge/questions?subject=&limit=&offset=` | Danh sách câu để duyệt (kèm đáp án + lời giải) |
| `GET /api/exam/vnhsge/random?subject=&count=` | Đề ngẫu nhiên để luyện tập |

Mỗi câu trả về kèm `subject_label` (nhãn tiếng Việt: Toán, Vật lí, Hoá học, …) và `source`/`license` của
chính câu đó, để trang web in được nguồn ngay cạnh câu hỏi.

### Trang `/nganhangde` (học sinh dùng)

- **Chế độ duyệt:** đọc đề, tự nghĩ, rồi bấm “Hiện đáp án” — đáp án đúng tô xanh kèm lời giải.
- **Chế độ luyện tập:** lấy N câu ngẫu nhiên (N = 5, lọc theo môn nếu đang chọn môn), học sinh chọn đáp
  án → tô **xanh** đáp án đúng / **đỏ** lựa chọn sai, hiện lời giải, đếm điểm, cho “Làm đề khác”. Đã chọn
  thì **không bấm lại để đổi** (nút bị khoá) — để điểm có nghĩa.
- Lọc theo môn bằng chip có số câu, nút “Xem thêm” khi còn câu chưa tải.
- **Khi ngân hàng trống, trang không im lặng:** in ra lệnh nhập dữ liệu và nói rõ nội dung *không tự sinh
  ra* — để không ai tưởng hệ thống hỏng.
- Có link “📚 Ngân hàng đề” từ trang `/khampha`.

### Cổng kiểm tra của đợt này

- `python backend/test_vnhsge_bank.py` → **36/36**, đã thêm vào job `offline-suites` của
  `.github/workflows/quality-gate.yml` (thuần stdlib, không thêm phụ thuộc cho CI).
- `tsc -p tsconfig.syntax.json` = 0 lỗi · `tsc -p tsconfig.checkjs.json` = 0 lỗi ·
  `eslint src/app/nganhangde/page.js` = 0 lỗi · `node scripts/check-api-base.mjs` = OK (trang mới dùng
  `apiBase`, không hard-code `localhost`) · `check-penrose-trios.mjs` vẫn `ALL_PENROSE_TRIOS_OK`.
- **Bằng chứng HTTP thật** (uvicorn trên DB dev, `127.0.0.1:8011`): `meta` → `total=7`, 9 môn có slot /
  6 môn có câu, kèm dòng ghi công `Nguồn: duomath-original-sample · Giấy phép: CC-BY-4.0 · …` ·
  `questions?limit=2` → `total=7`, trả `answer_index` + `subject_label: Toán` ·
  `questions?with_answers=false` → **không rò `answer_index`** (khoá riêng của học sinh không bị lộ nếu
  sau này dùng để thi) · `random?count=3&with_answers=true` → đủ 3 câu có đáp án ·
  môn không tồn tại → **HTTP 400** (không âm thầm trả hết mọi câu).

### Việc còn lại (cần chủ dự án quyết)

1. **Chốt nguồn dữ liệu thật + giấy phép** — VNHSGE gated (cần access token) / tự soạn / nguồn mở khác.
2. Nhập dữ liệu trên máy chủ có DB thật, xem trước bằng `--dry-run`:

   ```bash
   python backend/scripts/import_vnhsge.py --source jsonl --path <tệp>.jsonl \
     --source-name "…" --license "…" --attribution "…" --acknowledge-license --dry-run
   ```

   Bỏ `--dry-run` để ghi thật; có thêm `--hf-repo`/`--hf-file` (tải thẳng từ Hugging Face), `--limit`,
   `--db`, `--show-rejects`.
3. `*.db` **không** được commit. Muốn dữ liệu đề sống sót qua các lần deploy thì cần đĩa/DB bền vững
   trên Render (xem “Lưu ý phụ thuộc”).

---

## Đợt 7 — Xuất GeoGebra `.ggb` từ hình MathViz (Roadmap Q4/2026 mục 2)

`BAO_CAO_TIEN_DO_THANG_10_2026.md` §4 liệt kê 3 hạng mục roadmap; đây là mục **2** — “Xuất tệp
GeoGebra tương thích (.ggb): cho phép học sinh tải cấu hình hình học đã nắn chỉnh về máy để mở trên
GeoGebra”. Trước đợt này, hình học trong DuoMath chỉ *xem được* trong widget; muốn kéo-thả tiếp thì
học sinh phải tự dựng lại từ đầu.

### Vì sao phần lớn thời gian là “đọc đặc tả”, không phải viết mã

`.ggb` chỉ là tệp ZIP chứa `geogebra.xml` (GeoGebra manual → Reference → *File Format*). Sai một
định dạng là học sinh tải về một tệp **không mở được** — mà CI thì không có GeoGebra để thử. Nên
cách tiếp cận là **bám vào đúng bộ tag mà tài liệu GeoGebra cho phép**, rồi tự kiểm bằng một “schema
oracle” trong test:

- `Common XML tags and types` cho danh sách con hợp lệ của `<element>` (`coords`, `matrix`,
  `objColor`, `lineStyle`, `labelMode`, `caption`, `pointSize`, `show`…) và enum `elType`
  (`point|segment|line|polygon|conic|…`).
- `XML tags in geogebra.xml` cho khung tài liệu: `<geogebra><gui/><euclidianView/><kernel/>
  <scripting/><construction/></geogebra>`, trong đó `coordSystem`, `evSettings`, `bgColor`,
  `axesColor`, `gridColor`, `lineStyle` và **đúng 2** `<axis>` là bắt buộc.
- File `.ggb` thật (repo chuyển đổi `jumpjack/geogebra-converter`) cho thấy `<point>` có
  `<coords x y z="1">`, `<lineStyle>` **không** cần `opacity`, và `<command>` luôn đi kèm `<element>`.

### Quyết định thiết kế (mỗi điều được test ràng buộc)

1. **Một nguồn định nghĩa duy nhất: `<expression label="A" exp="(-0.8, 3.5)"/>`.** Đây chính là cú
   pháp thanh nhập của GeoGebra, nên nó parse được *theo định nghĩa* — khác với việc tự viết bộ đệm
   số (`<coords>` trên đoạn thẳng, `<matrix>` trên conic). Một bộ đệm lệch với định nghĩa là cách
   exporter **âm thầm làm sai hình**, nên đối tượng phụ thuộc ở đây **không mang hình học** nào cả.
2. **`<element>` chỉ mang style** (màu, nét, caption, cỡ điểm). Riêng điểm tự do có `<coords>` đúng
   bằng toạ độ trong `exp`. Hệ quả: lỗi style cùng lắm làm mất nét đứt — không thể làm sai hình.
3. **Tắt script trong tệp**: `<scripting blocked="true" disabled="true"/>` — tệp học sinh tải về
   không thể chạy mã.
4. **Không bỏ im lặng**: layer không hỗ trợ (`arc`, đường tròn `r = 0`, đoạn thiếu đầu…) được ghi
   vào `skipped` kèm lý do và **chỉ số layer**, để UI nói được “N phần chưa hỗ trợ”.
5. **Tất định**: mốc thời gian ZIP cố định + `id` = UUIDv5 của danh sách lệnh ⇒ cùng một hình cho ra
   tệp **giống nhau từng byte** (test so byte) và có thể đối chiếu giữa các lần xuất.
6. **Nhãn phải là định danh GeoGebra hợp lệ.** Nhãn trong IR là văn bản tự do (`M'`, `(O)`, cả một
   cụm tiếng Việt), nên được chuẩn hoá về `[A-Za-z][A-Za-z0-9_]*`; khi phải đổi, **văn bản gốc được
   giữ làm caption** (`labelMode="3"`) — học sinh vẫn đọc thấy đúng ký hiệu của thầy cô.

### Thành phần

| Tệp | Vai trò |
|---|---|
| `backend/geogebra_export.py` (mới) | `collect_objects()` (IR → đối tượng), `command_of()`, `build_commands()`, `build_xml()`, `build_ggb()`. Chỉ dùng thư viện chuẩn (`zipfile`, `xml.etree`, `uuid`) nên không tốn thêm phụ thuộc nào cho CI. |
| `backend/test_geogebra_export.py` (mới) | 11 nhóm kiểm tra offline, gồm “schema oracle” và kiểm tra thứ tự phụ thuộc. |
| `backend/main.py` | `POST /api/viz/geogebra` (+`?format=commands`), rate-limit `VIZ_EXPORT_LIMIT`, trần body `MAX_VIZ_BODY_CHARS`, `expose_headers` cho 4 header metadata. |
| `backend/security_limits.py` | `VIZ_EXPORT_LIMIT = "20/minute"`, `MAX_VIZ_BODY_CHARS = 512_000`. |
| `frontend/src/lib/ggbExport.js` (mới) | `countExportableGeometry()` (ẩn nút khi không có gì để xuất), `downloadGgb()`, `fetchGgbCommands()`. |
| `frontend/src/components/duomath/GgbExportButton.jsx` (mới) | Nút “⬇ .ggb” + “📋 Lệnh”, hiện số đối tượng **do server trả về**. |
| 3 engine của widget | `MathVizGeometry2D.js` (SVG), `MathVizJSXGraph.js`, `MathVizKonvaGeometry2D.js` đều gắn nút — học sinh dùng engine nào cũng xuất được. |
| `.github/workflows/quality-gate.yml` | Thêm bước “Export — MathViz → GeoGebra worksheet (.ggb)” vào job `offline-suites`. |

Hai thứ được **cố ý không** xuất: trạng thái xem của widget (engine đang chọn, điểm đang kéo,
“ghost” của phép biến đổi) — tệp chứa *bài toán*, không chứa thao tác xem; và ảnh thu nhỏ
`geogebra_thumbnail.png` (không bắt buộc, GeoGebra tự tạo lại khi lưu).

### Hai lỗi thật bắt được ngay khi dựng (nhờ chạy thật, không nhờ đọc lại mã)

1. **`E` bị đổi thành `PE`.** Tôi so tên dành riêng bằng chữ thường, mà GeoGebra **phân biệt hoa
   thường**: `e` mới là hằng số Euler, `E` là tên điểm hoàn toàn hợp lệ. Hậu quả nếu bỏ qua: mọi
   điểm `E`, `X`, `Y` trong bài đều bị đổi tên thành `PE`, `PX`… Bản vá: so khớp **đúng nguyên văn**
   và thêm `xAxis/yAxis/zAxis` vào danh sách dành riêng.
2. **Điểm `H` (trực tâm) bị mất tên, thành `O2`.** Tâm đường tròn do exporter tự sinh trùng toạ độ
   với điểm thật của bài, và vì “đã có điểm ở đó” nên giữ tên cũ. Hậu quả: trong GeoGebra học sinh
   thấy `O2` ở chỗ đáng lẽ là `H`, tệ hơn là lệnh `Circle(O2, …)` cũng theo tên sai. Bản vá: tách
   “mô tả endpoint” khỏi “tạo điểm”, cho điểm tự sinh **nhận tên của bài** khi bài có điểm ở đó, và
   **phân giải nhãn ở bước render** nên mọi lệnh tham chiếu tự động đi theo tên mới
   (`c2 = Circle(H, 2.04)`).

### Kiểm chứng

- `python backend/test_geogebra_export.py` → **91/91** (`ALL_GEOGEBRA_EXPORT_TESTS_PASSED`), đã thêm
  vào job `offline-suites`. Nội dung đáng chú ý:
  - **schema oracle**: mọi tag con của `<element>` phải nằm trong danh sách tài liệu, mọi `type`
    phải thuộc enum `elType`, chỉ dùng 4 loại (`point`, `segment`, `line`, `polygon`, `conic`);
  - **thứ tự phụ thuộc**: mỗi lệnh chỉ được tham chiếu đối tượng khai báo *phía trên* nó (GeoGebra
    chạy từ trên xuống) — lỗi mà chỉ chạy thật mới lộ;
  - **không có bộ đệm hình học**: không `<matrix>` nào, và mọi đối tượng phụ thuộc không có `<coords>`;
  - **giữ đúng toạ độ**: `A(-0.8, 3.5)`, `C(3, −1.8)`, `E(1.13, 0.81)` khớp nguyên văn; điểm trùng
    toạ độ không bị nhân đôi (9 điểm cho hình mẫu);
  - **không bỏ im lặng**: `arc`, `r = 0`, tâm thiếu toạ độ, đoạn thiếu đầu, layer không phải object…
    đều có mặt trong `skipped` kèm lý do, phần dùng được vẫn xuất;
  - **nhãn**: `M'` → `M` + caption, `(O)` → `O` + caption, `x` (dành riêng) → `Px` + caption, tiếng
    Việt giữ nguyên trong caption, id trùng được thêm hậu tố, không nhãn nào trùng nhau;
  - **tất định**: hai lần xuất ra byte giống nhau; hình khác ⇒ `id` UUID khác;
  - **thoát ký tự**: `& < > "` và tiếng Việt trong `title`/`caption` quay vòng chính xác.
- **Bằng chứng HTTP thật** (uvicorn + `TestClient` trên `main.app`, không chạy lifespan/DB):
  - `POST /api/viz/geogebra` → **200**, `content-type: application/vnd.geogebra.file`,
    `content-disposition: attachment; filename="duomath-hinh-hoc.ggb"`,
    `x-duomath-objects: 7`, `x-duomath-skipped: 1`, ZIP hợp lệ (`testzip: None`) và chỉ chứa
    `geogebra.xml`;
  - `POST /api/viz/geogebra?format=commands` → **200** với
    `['A = (0, 0)', 'B = (4, 0)', 'C = (0, 3)', 'O1 = (2, 1.5)', 's1 = Segment(A, B)',
    'poly1 = Polygon(A, B, C)', 'c1 = Circle(O1, 2.5)']`;
  - JSON hỏng → **400** · `{"layers": "nope"}` → **400** · body quá lớn → **413** · `{}` → **200**
    (tệp rỗng hợp lệ, không lỗi).
- Cổng frontend: `node scripts/check-api-base.mjs` = OK (chỉ dùng `resolveApiBase`) ·
  `tsc -p tsconfig.syntax.json` = 0 lỗi · `tsc -p tsconfig.checkjs.json` = 0 lỗi ·
  `eslint src/lib/ggbExport.js src/components/duomath/GgbExportButton.jsx` = 0 lỗi.
  (`eslint` trên các file widget 2500 dòng cũ thì hết RAM cục bộ — cùng giới hạn đã biết của máy
  dev, không phải lỗi mã.)

### Hạn chế đã biết

1. **Không thể kiểm “GeoGebra desktop mở được tệp” ngay trong CI** (không có GeoGebra, không có
   mạng trong job offline). Bù lại bằng 3 lớp: bám đúng đặc tả + schema oracle ở trên, cách viết
   duy nhất `<expression>` (cú pháp thanh nhập), và nút **“📋 Lệnh”** để học sinh dán trực tiếp vào
   geogebra.org — con đường chắc chắn chạy kể cả khi bản XML có trục trặc với một phiên bản nào đó.
2. Một số layer của IR chưa có tương ứng trong bộ 4 loại đang vẽ (ví dụ `arc`): chúng được báo là
   “chưa hỗ trợ” chứ chưa được chuyển thành cung. Muốn thêm thì cần thêm `command_of()` + một mục
   trong test.
3. Nút xuất chưa có trong bản PWA offline (trang offline không gọi được API) — đúng như thiết kế,
   nhưng đáng ghi lại.

### Việc còn lại (không chặn)

- Mở thử một tệp `.ggb` bằng GeoGebra thật **một lần** (việc của chủ dự án, cần trình duyệt) — đây
  là bước kiểm chứng cuối mà CI không làm thay được.
- Roadmap §4 còn 2 mục chưa làm: **1. Step-by-step Animated Canvas** và **3. Vietnamese Math Voice
  Agent** (mục 3 cần micro + dịch vụ nhận dạng giọng nói nên phải cân nhắc quyền riêng tư trước).

---

## Đợt 4H-2 — Sự cố "CORS ma" trên `POST /api/chat` (phần frontend)

Sự cố production 28/09/2026 **không phải** lỗi CORS: preflight `OPTIONS` từ origin Vercel vẫn trả
**200 + ACAO đúng**, còn `POST` thì **không có phản hồi cấp ứng dụng** — proxy nền tảng cắt socket
trước khi header đầu tiên tới browser, và DevTools báo hiện tượng đó là lỗi CORS. Phần frontend của
bản sửa gồm ba việc, mỗi việc có một guard CI riêng chạy bằng Node thuần (không cần dependency):

1. **`src/lib/imageDownscale.js` — nén ảnh trước khi gửi.** `prepareImageForUpload(file)` thu nhỏ
   cạnh dài về 1600 px và mã hoá JPEG q85 (ảnh 4–5 MB → ~200–300 KB), giữ nguyên tỉ lệ, không bao
   giờ phóng to, bỏ qua SVG/GIF, và **không bao giờ làm mất ảnh vì lý do hình thức**: mọi nhánh lỗi
   (không có canvas, giải mã hỏng, mã hoá ra tệp lớn hơn) đều rơi về dữ liệu gốc. `DuoMCBPage` hiển
   thị nhãn "Đã nén …" và chặn hẳn ảnh vượt `MAX_IMAGE_B64_CHARS`; giới hạn này được **đối chiếu
   trực tiếp** với `backend/security_limits.py` trong `check-image-downscale.mjs` (23/23 checks) nên
   hai bên không thể lệch nhau.
2. **`src/lib/chatErrors.js` — lỗi phải nói được lý do.** `classifyChatFailure(status)` tách "có
   status" (413/429/504/5xx/4xx) khỏi "không có phản hồi" (mạng/huỷ), và mỗi loại có một câu tiếng
   Việt chỉ đúng việc học sinh nên làm. `duoServer.chat()` thêm timeout 95 s (lớn hơn ngân sách 75 s
   của server để **504 của server luôn thắng**), tự thử lại 1 lần với lỗi tạm thời, và hiển thị
   `reply` mà server gửi kèm 504 thay vì câu "kiểm tra kết nối" chung chung. Guard:
   `check-chat-errors.mjs` (25/25 checks).
3. **`CosmosBackground.js` — `THREE.Clock` → `THREE.Timer`.** Clock deprecated từ three r183 (đúng
   cảnh báo xuất hiện trong console production). Timer cần `update()` mỗi frame trước khi đọc
   `getDelta()`/`getElapsed()`, có `connect(document)` theo Page Visibility API (tab ẩn ⇒ delta 0,
   không còn cú nhảy rotation khi tab quay lại) và `dispose()` trong cleanup. Guard:
   `check-three-api.mjs` (6/6 checks, quét toàn bộ `src/`).

**Vì sao vẫn dùng non-streaming.** Nhánh `if use_stream:` của `/api/chat` chỉ phát
`{token}`/`{done}`, **return sớm**, và do đó bỏ qua validate MathViz, TypeSafe guard, kiểm chứng
(`verification`) cùng nhãn `perception`/`ocr_confirm`. Với request có ảnh, chuỗi vision vẫn chạy
trước byte đầu tiên, nên SSE **không** rút ngắn cửa sổ im lặng — chuyển UI sang SSE sẽ mất tính năng
mà không sửa được lỗi. Ghi chú này được nhắc lại ngay trong `duoServer.js` và được canh bằng guard
("no chat call site switches this UI onto the SSE path").

### Hạn chế đã biết của bản sửa này

- Ngân sách chặng được chọn theo *suy luận* (ngưỡng ~100 s của proxy nền tảng) vì máy local không đo
  được proxy production. Vì vậy `/api/health` công bố `chat_budgets_s` để hạ ngưỡng bằng biến môi
  trường (`CHAT_REQUEST_TIMEOUT_S`, `CHAT_VISION_BUDGET_S`, `CHAT_VISION_AGENT_BUDGET_S`,
  `CHAT_VERIFY_BUDGET_S`) mà không cần deploy lại.
- `next build`/eslint đầy đủ vẫn không chạy được trên máy này (~1.3 GB RAM trống). Cổng thay thế cục
  bộ: `tsc -p tsconfig.syntax.json`, `tsc -p tsconfig.checkjs.json` (đều exit 0), `check-api-base.mjs`
  và 3 guard Node mới; job `frontend-build` trong CI vẫn chạy bundler thật.
- `test_fsrs_scheduler.py` không chạy được ở venv cục bộ vì thiếu gói `fsrs` (CI có cài) — không liên
  quan tới đợt này.
- Bước kiểm chứng cuối cần người: gửi lại đúng tấm ảnh đã gây lỗi trên bản deploy mới và xem
  `/api/health` (`chat_budgets_s`, `text_tiers`) — CI không đo được proxy production.
- Nguyên nhân gốc thật hoá ra **nặng hơn phần frontend**: một lời gọi `sentence_transformers` đồng bộ
  trong event loop (cộng torch ~2 GB trong `requirements.txt`) làm **cả service** ngừng trả lời, và
  Render trả trang 502 *không có header CORS* — đó mới là "lỗi CORS" mà người dùng thấy. Phần frontend
  ở trên vẫn cần (nó rút ngắn cửa sổ im lặng và nói đúng lý do), nhưng bản sửa quyết định là ở backend:
  xem **Đợt 4H-2b** trong `BAO_CAO_TIEN_DO_THANG_10_2026.md` §2.8 (`asyncio.to_thread` cho retrieval +
  preprocessing, `CHAT_RETRIEVAL_BUDGET_S`, bỏ `sentence-transformers` khỏi production,
  `MATH_RETRIEVAL_EMBEDDINGS=off`).

---

## Đợt canvas-libraries — Shapely · trimesh · MathLive vào ô soạn tin · gỡ hẳn Konva

Quyết định của chủ dự án: *nối thật MathLive, gỡ hẳn Konva, làm shapely, trimesh làm luôn,
khai báo `matplotlib` + `imageio-ffmpeg`, và test localhost để chắc không timeout.*

### 1. Gỡ engine thứ ba (Konva) — một widget, không còn ba bản trùng

`MathVizGeometry2D.js` (SVG) + `MathVizJSXGraph.js` + `MathVizKonvaGeometry2D.js` cùng vẽ đủ 14
kind; mỗi giá trị hình học (tâm, trực tâm, diện tích…) bị viết lại 3 lần ở client, thêm 1 lần ở
server. Konva đã gỡ toàn bộ: xoá file engine, bỏ nhánh `engine === 'konva'` + nút "Konva Mode",
bỏ prop `onSwitchToKonva`; contract `mathviz_contract.py` + `mathvizKinds.js` +
`check-mathviz-kinds.mjs` chốt `ENGINE_PREFERENCE = ("jsxgraph", "svg")`; test
`test_mathviz_contract.py` giờ *cấm* tên `konva` quay lại. Xoá kèm 2 hàm chết theo Konva trong
`src/lib/mathvizOutline.js` (`pointsToFlat`, `sampleSectorOutline`) và gỡ `konva` khỏi
`package.json` (lockfile `pnpm install` sạch bóng konva).

### 2. MathLive — từ import chết thành nút Σ thật trong ô soạn tin

`mathlive@0.110` + `MathInput.jsx` tồn tại từ Đợt 1 nhưng *không được mount ở đâu*. Nay
`DuoMCBPage` nạp lazy `MathInput` (`next/dynamic`) sau nút **Σ**: bật thì ô nhập thành
`<math-field>` (bàn phím công thức đầy đủ), Enter gửi; nội dung gửi được gói `$…$` để tầng đọc
hiểu là Toán — chỉ áp dụng cho text gõ từ ô soạn tin, không đổi hành vi các call site gợi ý/công cụ.

### 3. Tầng kiểm định dữ liệu hình học — Shapely + SymPy (`backend/geometry_analytic_checks.py`)

Các bước cũ nắn từng lớp nhưng không hỏi *các lớp có đồng ý nhau không*. Module mới bắt: đa giác
tự cắt (GEOS `is_valid` + `explain_validity`), đa giác suy biến (kèm ý kiến chính xác của SymPy
`Rational(str(x))` để không báo nhầm vì nhiễu float), cung/hình quạt có hai đầu lệch đường tròn,
cùng một point-id khai báo hai toạ độ (nguồn của hình "phụ thuộc thứ tự lớp"), góc vuông khai báo
sai (SymPy xác nhận trước khi báo), tâm đường tròn không cách đều `through_3pts`, toạ độ NaN/Inf.
Kết quả gắn vào `_render.conflicts` trong pipeline `/api/chat` và hiện thành chip cảnh báo ở cả
hai engine. Chỉ dựa vào `mathviz_contract.iter_point_dicts` (một định nghĩa "điểm của payload"),
tối đa 12 cảnh báo/lượt, không sửa payload.

### 4. Tầng lưới 3D — trimesh (`backend/geometry3d_mesh.py` + `POST /api/geometry3d/mesh`)

Khối ngoài 19 template client trước đây rơi về hộp 1×1×1 trong im lặng. Nay: box/prism/pyramid/
truncated_pyramid/cylinder/cone/frustum/sphere/ellipsoid/hemisphere/capsule/torus (kèm alias
tiếng Việt: `hinh_hop_chu_nhat`…), kích thước clamp `[1e-3, 50]`, trần 120k mặt; trả số liệu kiểm
định (watertight/volume/bbox) + mảng đỉnh–chỉ số cho `THREE.BufferGeometry` + (tuỳ chọn) STL/GLB
base64. `MathVizGeometry3D.js` tự gọi endpoint khi `solid` lạ, vẽ lưới server, hiện trạng thái và
nút "⬇ STL". Hemisphere dựng tay bằng lưới UV — đường `slice_plane` của trimesh kéo theo scipy nên
bị loại khỏi phụ thuộc. Endpoint anonymous-friendly như `/api/viz/geogebra`
(`VIZ_EXPORT_LIMIT`, trần body 16 KB, không chạy mã của model).

### 5. Khai báo phụ thuộc cho thật

`requirements.txt` thêm `shapely>=2.0`, `trimesh>=4.0`, `matplotlib>=3.8`, `imageio-ffmpeg>=0.4.9`
(hai gói cuối do `canvas_to_video.py` import nhưng trước đây **không manifest nào khai**).
`requirements-ai-addons.txt` đổi đầu mục thành **LOCAL ONLY** kèm cảnh báo sự cố 2026-09-28 và
chuyển `shapely` sang requirements chính. CI `quality-gate.yml` cài `shapely` + `trimesh` và thêm
2 bước test mới.

### 6. Bằng chứng localhost (2026-09-30, uvicorn cổng 8000 + `pnpm dev` cổng 3000)

- `POST /api/geometry3d/mesh` (prism lục giác): **9 ms**, watertight, volume 41.569 ✓; xuất STL
  (hemisphere): **37 ms**, 51.284 byte; khối lạ → 400 kèm danh sách hỗ trợ.
- `POST /api/viz/geogebra`: **9 ms**, 4 đối tượng (không hồi quy).
- `POST /api/chat` LLM thật: "2+2" **1,3 s** (trả `$4$`); câu hình học mode `solution` **28,4 s**,
  có payload ```mathviz``` — đều rất dưới ngân sách 75 s của server.
- `GET /DuoMCB`: **HTTP 200** (50 KB; lần compile-first của `next dev` trên máy yếu 21 s — render
  154 ms, không lỗi).
- Guard: frontend 22/22 + 6/6 + 27/27 + 23/23 + three-api OK + `tsc` exit 0; backend 16/16
  analytic, 30/30 mesh, 91/91 geogebra, 9/9 widget routing, 105/105 chat budget.

### 7. Ghi chú vận hành

- Không cài `requirements-ai-addons.txt` trên Render (torch/easyocr/realesrgan — LOCAL ONLY).
- Nếu sau này cần CAD thật (STEP/B-Rep/OCCT) hoặc Manim: dựng **service riêng**, không thêm vào
  service chính; giữ nguyên khe cắm JSON-IR + HTTP như `/api/geometry3d/mesh`.

### 8. Nhật ký test ảnh olympiad trên localhost (2026-09-30 → 10-01)

Gửi 3 ảnh olympiad sẵn có trong `backend/training/hard_geometry_tests/` qua **đúng payload trang
DuoMCB** (`POST /api/chat` + `Origin: http://localhost:3000`, kèm preflight OPTIONS):

- **Đạt:** CORS/preflight 200 + ACAO đúng origin; **MathReader đọc đúng hình** (conf 0.90–0.95,
  ~13 s, cache `sha256`); có 2 lượt trả **HTTP 200** (115,5 s có block ```mathviz```; 119,9 s verify
  `deterministic checks passed`). Nội dung model trích xuất khớp hình: "A, B, C, D, E; B-D-C-E thẳng
  hàng; AB=6, AC=4, BC=5".
- **Chưa đạt trên máy này:** phần lớn lượt khác chạm ngân sách và trả **504 + lời nhắn trung thực**
  (đúng thiết kế soft-deadline) vì nguồn ngoài lúc test rất chậm/chập chờn: OpenRouter free 429,
  Gemini ~40 s/lượt và lỗi rỗng trong pipeline, Groq **413** khi còn ảnh trong payload, và
  `VISION_HF_SPACE_ID=WilliamShakespear/duomath-qwen-vl-demo` trả **401 RepositoryNotFound**
  (Space đã bị xoá/đổi tên).
- Tổng thời gian ảnh ~115–120 s > timeout client 95 s ⇒ **trên máy này, thả ảnh trong trình duyệt sẽ
  hiện thông báo timeout của client** dù server vẫn đang xử lý; prompt chữ thì đã nhanh (1,3–28,4 s).
- Đã sửa `.env` local: slug chết `inclusionai/ling-3.0-flash-vl:free` → `qwen/qwen3.8-27b:free` và
  fallback theo đúng `render.yaml`. **Đề xuất (chưa làm):** (a) khi đã có văn bản từ MathReader thì
  bỏ ảnh khỏi payload gửi Groq (tránh 413); (b) cập nhật/gỡ `VISION_HF_SPACE_ID` đã chết;
  (c) cho timeout gọi Gemini theo `CHAT_GENERATE_BUDGET_S` thay vì timeout ngắn cố định.

### 9. Đợt P1–P7 — bốn đề xuất + trạng thái kiểm chứng trung thực + luồng hình-không-đề (2026-10-01)

Triển khai đầy đủ kế hoạch đã chốt (P1→P7), mỗi phần một commit độc lập:

- **P1 — ngân sách cấp tier.** `chat_budget.py` thêm `CHAT_GEN_MODEL_TIMEOUT_S` (22 s),
  `CHAT_GEN_RETRY_S` (15 s), `CHAT_TIER_MIN_S` (12 s); mọi call sinh câu trả lời (Gemini tool-round,
  Groq, OpenRouter helper, custom provider) đều lấy `min(cap, phần còn lại)`; tier không đủ thời
  gian bị BỎ QUA thay vì bắt đầu rồi chết. Kèm sửa **bug thụt lề chết** trong vòng Tier-1: khối parse
  phản hồi Gemini 200 nằm trong `if should_continue_attempt:` (cờ không bao giờ true) nên phản hồi
  thành công không được đọc — nay đã chạy đúng; log lỗi in thêm `type(e).__name__`.
- **P2 — payload fallback.** Module mới `fallback_policy.py`: `trim_for_tier` (giữ system prompt +
  4 lượt gần nhất), `fallback_max_tokens` (cap 1600, `CHAT_FALLBACK_MAX_TOKENS`), `shrink_on_tpm`
  (413 → thử lại CÙNG model với nửa ngân sách trước khi đổi model).
- **P3/E — trạng thái kiểm chứng trung thực.** `math_solver` có 5 trạng thái
  (`verified/failed/partial/timeout/not_applicable`), gate `should_verify` chỉ chạy khi đọc đủ tin
  (`VERIFY_MIN_READ_CONFIDENCE=0.5`) hoặc có đáp án trích được; lớp deterministic chạy TRƯỚC và
  riêng khỏi `wait_for` của critic (`precomputed_checks`), nên critic hết giờ vẫn giữ được verdict
  "đã kiểm tra số học" (partial). Badge chọn theo trạng thái: NA → không gắn gì, timeout → ⏳,
  partial → ℹ️, failed → ⚠️ kèm tên check.
- **P4 — chip frontend** phân nhánh theo `verification.status` (ẩn với NA; ⏱/ℹ️/⚠️ theo loại) và
  đọc <0.5 hiện "đọc chưa chắc (X%)" thay vì "0%".
- **P5/F — luồng hình-không-đề.** Module mới `chat_routing.py`: có đề (transcription/latex có toán
  hoặc tin nhắn thật) → giải như thường; chỉ có HÌNH đọc được → chế độ **figure-only**: prompt
  `visualizer`, cấm bịa số/giải, dựng mathviz từ cấu trúc vision, server chèn cứng dòng ℹ️; kill
  switch `FIGURE_ONLY_ENABLED`. Luật thứ tự "lời giải TRƯỚC, khối ```mathviz SAU CÙNG" ghi rõ trong
  `_VISUAL_RULES`.
- **P6 — HF Space opt-in.** `vision_agent` mặc định `VISION_HF_SPACE_ID=""` (Space demo cũ trả 401);
  `.env` local đã gỡ; harness training có ghi chú.
- **P7 — timeout client.** Giữ 95 s, thêm guard CHẶN HAI PHÍA (`> serverBudget` và `< 100 s` trần
  proxy Render) trong `check-chat-errors.mjs`.

**Kiểm chứng:** offline suites mới `test_fallback_policy.py` (15), `test_verify_states.py`,
`test_chat_routing.py` (28) + mở rộng `test_chat_budget.py` (127/127) đều vào CI `offline-suites`;
frontend guard cập nhật xanh; `tsc` exit 0. **Smoke live** (uvicorn, ngân sách mặc định):
`/api/health` công bố các khóa mới (`gen_model_s=22, tier_min_s=12, fallback_max_tokens=1600`);
chat chữ "1+1" trả `$2$` trong 3,4 s kèm `verification.status="not_applicable"` — **không badge đỏ**,
đúng ca báo cáo từ lớp học.

### 9b. P1b–P1d — sửa 504 ảnh theo báo cáo LIVE (2026-10-01, từ console của lớp học)

Lượt ảnh + `mode=visualizer` trả **504** dù P1–P7 đã xong. Log chỉ ra bốn mảnh còn thiếu:

1. **Retry "without tools" là vô nghĩa với request ảnh** (payload ảnh vốn không có `tools` từ
   dòng 4249) — gửi lại y hệt lời gọi đã fail, tốn ~15 s/model (P1b: chỉ retry khi `"tools" in payload`).
2. **Model chính bị cap 22 s** trong khi một câu trả lời 4096-token cần hơn thế — model đầu giờ
   được dùng `CHAT_GENERATE_BUDGET_S`, model sau giữ cap nhỏ (P1b).
3. **Không dành chỗ cho tier local** (`CHAT_LOCAL_FLOOR_S`=10 s): mọi clamp HTTP lấy
   `remaining − floor`, và request ảnh không đọc được gì (`_blind_image`) thì bỏ qua Groq/OpenRouter
   (các tier chữ không thấy ảnh; Groq 413 cả 3 model — P1c). Kèm đó: **text của MathReader
   (`latex`+`text_blocks`) được "thăng cấp" vào `vision_description`** để các tier chữ có đề để trả lời
   — trước đây agent fail là cả pipeline coi như trang giấy trắng dù MathReader đã đọc xong (P1c).
4. **Verification đua với deadline**: gần mốc, verification bị bỏ qua (`remaining < floor` →
   `not_applicable`, note "hết thời gian…"), và khi vẫn chạy thì wait_for bị chặn bởi
   `remaining − floor` (P1d).

**Kết quả live sau sửa:** ảnh olympiad (`problem_3`) → **HTTP 200 trong 66,6 s, `budget_left=8,5 s`**,
trả lời từ **local MathGPT** kèm payload `mathviz` hợp lệ (do mọi provider ngoài đều 429/503/413 vào
ngày test), `verification.status=not_applicable` — hết hẳn 504 và hết badge đỏ. Guard mở rộng:
`test_chat_budget.py` **142/142**.





### 9c. P8 — Cerebras vào thang trả lời + xác minh hai key mới (2026-10-01)

Hai key mới nạp và **kiểm chứng sống**: Gemini `AQ.Ab8…` hợp lệ (`ListModels` → 200, 50 model —
các 503 trong ngày là *Google quá tải*, body "experiencing high demand", KHÔNG phải key sai);
Cerebras `csk-rj…` hợp lệ (`GET /v1/models` → 200: `gpt-oss-120b`, `qwen-3.8-27b`). Ghi chú sống:
Cloudflare của Cerebras chặn fingerprint `urllib` ("error code: 1010") — **httpx mà backend đang
dùng đi qua bình thường** (test cả GET lẫn POST chat đều 200; không cần User-Agent đặc biệt).

**Tier 1.5 mới** (`CEREBRAS_BASE`/`CEREBRAS_KEY` + `cerebras_headers()`, chèn giữa Gemini và Groq)
theo đúng luật P1: gate `CHAT_TIER_MIN_S`, clamp `remaining − CHAT_LOCAL_FLOOR_S`, bỏ qua khi
`_blind_image`, `trim_for_tier` + cap token. Hai phát hiện live quyết định cấu hình:

1. Model reasoning "đói" token trả 200 **không có key `content`** (KeyError) — đọc bằng `.get()`,
   coi như rỗng và chuyển model kế tiếp; sàn `max_tokens` 2048 → **3072**.
2. `qwen-3.8-27b` fail **cả hai** lượt chạy live (cháy hết budget reasoning rồi ReadTimeout trong
   cửa sổ ngắn) trong khi `gpt-oss-120b` trả lời trong vài giây → mặc định
   `CEREBRAS_CHAT_MODELS=gpt-oss-120b,qwen-3.8-27b` (kèm ghi chú evidence-based trong code).

**Chuỗi leo thang live thật** (`_img_test.py problem_3`, Gemini 503 toàn bộ):
`3× Gemini 503 → Tier 1.5 Cerebras (qwen KeyError → gpt-oss 200) → answered_by=cerebras:gpt-oss-120b`,
59,5 s, `budget_left=15,8 s` — **200, không còn 504**. Lượt sau Gemini ngốn clock vào ReadTimeout →
tier bị gate chặn đúng lúc (còn 10,0 s < 12 s) → local floor trả lời kèm `mathviz` hợp lệ. Lượt thứ
tư Google hồi phục: `answered_by=gemini:gemini-3.1-flash-lite`, 60,5 s, 4.422 ký tự, `mathviz`
5 layer (line/points/polygon/segment), `verification.status=timeout` trung thực.

Config: `CEREBRAS_API_KEY` (sync:false) + `CEREBRAS_CHAT_MODELS` vào `render.yaml`, `.env`,
`.env.example`; `/api/health` thêm `cerebras:<model>` vào `text_tiers`. Guard P8 (6 mục) trong
`test_chat_budget.py` → **148/148**; routing/verify/fallback giữ nguyên **28/28, 19/19, 15/15**.
Proof gọn: `_p8_proof.txt`; log thô: `duosteam/backend/_run_out.log`.




### 9d. P11–P13 + P10 — bể khoá, NVIDIA Tier 2.5, Cerebras qwen-first, đồng hồ token (2026-10-01)

#### P11 — Bể khoá đa khoá (`key_pool.py`, mới)

Mọi quota free tính THEO TỪNG KHOÁ — một 429/401/413 là cả nhà cung cấp bị gạch tên hết ngày.
Bể khoá đổi điều đó:

- `key_pool.py` thuần Python (không mạng, đồng hồ tiêm được): `parse_keys` (phẩy/chấm
  phẩy/xuống dòng, khử trùng), `key_id` (chỉ 4 ký tự cuối — không bao giờ lộ khoá vào log),
  `parse_reset_duration` (`"2m59.56s"` — regex `\b` cũ bỏ sót số hạng đầu vì "m59" không có
  word-boundary; sửa thành `(?![A-Za-z])`), `cooldown_seconds` (ưu tiên `retry-after`, rồi
  giá trị dài nhất trong `x-ratelimit-reset-*`, 401/403 khoá 1 giờ), `KeyPool` với
  `request_order / active / note_response / note_ok / snapshot`.
- `groq_headers()` đọc khoá đang sống từ bể (bỏ cache-global — cache sẽ ghim pipeline vào
  khoá đang cooldown); mọi POST Groq thường đi qua `_groq_post_with_key_rotation` (**thử CÙNG
  model bằng khoá kế tiếp** trước khi bỏ model); **stream Groq xoay khoá trước khi xoay model**.
- Env: `GROQ_API_KEY_SECONDARY` (trống = bể một khoá) vào `.env` / `.env.example` / `render.yaml`.
- `test_key_pool.py` **56/56** (hành vi bể + wiring) + 3 guard mới trong `test_chat_budget.py`.

#### P12 — NVIDIA NIM: Tier 2.5 "math reasoning" + helper coding

- `NVIDIA_BASE` + `NVIDIA_KEY_POOL` (2 khoá, cùng khuôn bể P11); `_nvidia_chat()` giữ đúng bài
  học P8: **sàn 3072 token**, `.get("content")` (200-thiếu-content rơi model kế, không KeyError),
  lỗi mạng cũng rơi model kế, hết model mới `RuntimeError` để caller xuống tier.
- **Tier 2.5** chèn giữa Groq và OpenRouter
  (`NVIDIA_MATH_MODELS=nvidia/nemotron-3-super-120b-a12b,nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`),
  đủ 3 luật tier (gate `CHAT_TIER_MIN_S`, clamp `remaining − floor`, bỏ qua ảnh mù) + ghi
  `_answered` provider=nvidia.
- `_nvidia_coder()` (`NVIDIA_CODE_MODELS=poolside/laguna-xs-2.1,openai/gpt-oss-20b`) nhận **đúng
  prompt sửa MathViz** và chạy TRƯỚC OpenRouter trong `_repair_mathviz_with_free_openrouter` —
  OpenRouter giờ chỉ còn là fallback phía sau.
- `/api/health` thêm `nvidia:<model>`; `test_nvidia_tier.py` **29/29**.

#### P13 — Cerebras ưu tiên `qwen-3.8-27b` (quyết định của người dùng)

`CEREBRAS_CHAT_MODELS=qwen-3.8-27b,gpt-oss-120b` (default trong code + `.env` + `.env.example`
+ `render.yaml` + guard `test_chat_budget.py`). Bằng chứng P8 (qwen từng cháy reasoning trong
cửa sổ ngắn) được giữ nguyên trong comment; sàn 3072 là bảo hiểm, và gpt-oss ở lại CÙNG tier
làm lưới hứng cửa sổ đói token. Probe P12 xác nhận live thứ tự mới.

#### P10 — Đồng hồ token/quota + tab admin "Token & Quota"

- `token_meter.py` thuần: `normalize_openai_usage` (tách `reasoning_tokens`),
  `normalize_gemini_usage` (`thoughtsTokenCount` cộng vào output nhưng báo riêng),
  `quota_snapshot` (quét `x-ratelimit-remaining-* / limit-* / reset-*` + `retry-after`),
  `pct_left` / `gauge_state` (đỏ <15 %, vàng <30 %, **unknown khi thiếu số**), retention fail-safe.
- Bảng `token_usage_log` (DDL trong `init_db`) + `token_log()` (không bao giờ raise, retention
  riêng `TOKEN_USAGE_RETENTION_DAYS=30`); gắn tại MỌI choke point: 2 helper xoay khoá (Groq kèm
  quota header live; NVIDIA self-count + reasoning), Cerebras (kèm quota), Gemini (2 nhánh
  success), OpenRouter; nhãn `surface` (chat / translate / repair).
- `GET /api/admin/token-usage?days=1` (admin-only, kẹp 1..90): tổng theo provider/model + ảnh
  chụp quota live mới nhất + `snapshot()` bể khoá + nhãn trung thực `live+self-count` /
  `self-count` cho từng provider.
- Frontend: tab **📊 Token & Quota** trong `AdminPanel` + `TokenGauges.js` (kim lớn
  Cerebras/Groq chỉ vẽ khi có số live, hàng khoá live/cooldown, bảng tự đếm có cột "Suy nghĩ").
- `test_token_meter.py` **40/40**; CI thêm 3 bước (key pool, NVIDIA tier, token meter).

#### Hai bug thật bắt được LIVE trong quá trình probe

1. **Loader `.env` nuốt override môi trường** — `main.py` ghi thẳng `os.environ[k]=v` từ file,
   nên mọi biến của shell / Render dashboard / probe bị đè ngược (probe P12 "khoá invalid" vẫn
   được trả lời bằng khoá thật, tới 2 lần). Sửa thành **env thắng file** (file chỉ điền biến
   trống) + guard trong `test_key_pool.py` — đúng hướng 12-factor.
2. **`_blind_image` chưa gán cho request chữ** — chỉ được set trong nhánh ảnh, nên chat chữ khi
   các tier trên hỏng ném `UnboundLocalError` → **500 thay vì rơi xuống tier dưới** (đúng kịch
   bản Gemini outage). Khởi tạo `_blind_image = False` sớm + guard trong `test_nvidia_tier.py`.

#### Kiểm chứng LIVE

- **P11** (`_p11_live.ps1`): chat chữ → `answered_by=groq:qwen/qwen3.8-27b`, 13,7 s, qua helper
  xoay khoá; `/api/health` công bố đủ 5 tier.
- **P12** (`_p12_live.ps1`, khoá Groq/Gemini/Cerebras cố tình sai): chuỗi đầy đủ
  `Groq 401 → Gemini 400×4 → Cerebras qwen→gpt-oss (thứ tự P13!) → Groq 401×3 → Tier 2.5 NVIDIA`
  → `answered_by=nvidia:nvidia/nemotron-3-super-120b-a12b`, 41,3 s, `budget_left=48,7 s` —
  **không còn 500**.
- **P10** (`_p10_live.ps1`): 1 dòng thật trong `token_usage_log` —
  `groq / qwen/qwen3.8-27b / total=1797 / quota live {"requests":"999","tokens":"6135"}`;
  `GET /api/admin/token-usage` không auth → **401**.
- Suite toàn cục: chat_budget **153/153** (guard P11×3, P13×2), key_pool **56/56**, nvidia
  **29/29**, token_meter **40/40**, routing/verify/fallback **28/28, 19/19, 15/15**;
  `tsc --noEmit --noResolve --allowJs --jsx preserve` cho `TokenGauges.js` + `AdminPanel.js` →
  exit 0.

**Còn lại của lô kế hoạch:** P14 (vision NVIDIA + Gemini thay vai OpenRouter — đã test sống
`meta/llama-3.2-90b-vision-instruct` và `-11b-vision` đọc đúng hình olympiad, 200 OK) và P9a/P9b
(refine MathViz runtime + thư viện artifact). Khoá đã dán trong chat cần **rotate sau nghiệm
thu**; `.env` không commit (backup: `duosteam/backend/.env.bak_keys`).




### 9e. P14-fix — báo cáo lớp học: "hình minh hoạ không liên quan" (2026-10-01)

Báo cáo live: học sinh **đính ảnh bài tứ diện $S.ABC$** (chế độ 3D) → nhận về văn bản mẫu
"🔍 Hình Học Phẳng & Vectơ…" kèm minh hoạ **tam giác 2D generic** — "hình không liên quan gì,
đưa sai mẫu hình là hình tam giác".

Điều tra (tái hiện: `_repro_3d.py`, `_repro_floor.ps1` + `_repro_floor.py`):

1. Câu gửi đi là **placeholder của UI** — "Minh họa tương tác cho bài toán này." (nút 3D) —
   nhưng `chat_routing.PLACEHOLDER_MESSAGES` chỉ có 4 biến thể CŨ; **3 câu UI hiện tại**
   (Gợi ý / Giải chi tiết / Minh họa tương tác) chưa từng có trong danh sách.
2. Placeholder lọt vào `detect_widget` và khớp các **keyword UI chung** trong danh sách 2D
   ("tương tác", "bài toán này", "minh họa", "hình học") → widget = `geometry_2d` cho MỌI ảnh,
   kể cả ảnh chóp/tứ diện (leo thang 3D luôn thắng nếu đề CÓ chữ, nhưng placeholder thì không).
3. Khi thang tier rơi xuống tầng local, `generate_mock_mathgpt_reply` trả **bài mẫu bịa**
   ("Cho tam giác ABC… trọng tâm G") + hình tam giác canned — không liên quan gì đến ảnh.
4. Badge đỏ "⚠️ **Chưa kiểm chứng được đáp án này**" còn bị gắn lên chính câu "mình chưa giải".

Bản vá:

- `chat_routing.PLACEHOLDER_MESSAGES` += 3 câu UI thật (giữ biến thể cũ để tương thích);
- `detect_widget` **bỏ qua placeholder** (coi như không có chữ) và danh sách keyword 2D gỡ các
  từ UI chung ("minh họa/hoạ", "tương tác", "bài toán này", "hình học" trần) — chỉ giữ "vẽ
  hình / dựng hình / hình vẽ" là ý định vẽ tường minh;
- **đề là placeholder ⇒ mô tả của vision chọn widget** (`detect_widget(vision_description)`)
  — ảnh "hình chóp / tứ diện" định tuyến `geometry_3d` thay vì mặc định 2D;
- helper mới `_local_floor_reply()` dùng ở **cả hai** điểm gọi tầng local (soft-deadline +
  tier 4): request có ảnh → trả về **bản chép đọc được** + nói rõ "chưa phải lời giải", hoặc
  mời chụp lại rõ hơn, **KHÔNG dựng hình bịa**; request chữ vẫn giữ bài mẫu demo;
- cờ `_honest_floor`: tầng local trung thực **bỏ qua verification** — không còn badge đỏ trên
  câu "chưa giải" (cùng tinh thần P3/P5).

Kiểm chứng live (`_repro_floor.ps1`: ép mọi khoá sai + ảnh olympiad thật + placeholder 3D):
`200 | mathviz_block=False | canned_sample=False | honest_read=True` — reply = note bận +
bản chép từ ảnh (LABELED POINTS… `AB = 6; AC = 4; BC = 5`, lấy từ vision cache) + mời gửi lại,
**819 ký tự, KHÔNG badge** (trước sửa: 942 ký tự kèm bài mẫu 2D + badge).
Suite: routing **42/42** (14 guard mới), chat_budget **153/153**, verify **19/19**, key_pool
**56/56**, nvidia **29/29**, token_meter **40/40**; `py_compile` OK.




### 9f. P15-fix — báo cáo lớp học: chatbot hiện nguyên khối JSON (2026-10-01)

Báo cáo: response hiển thị **JSON thô** (`"title": "△ABC và các điểm…"`, `"layers":[…]`)
thay vì hình tương tác.

Điều tra:

1. Frontend chỉ nhận ĐÚNG fence ` ```mathviz ` — không có nó thì khối JSON được render
   như text thường (đúng như ảnh chụp).
2. Backend `_extract_mathviz_block` cũng chỉ nhận ĐÚNG ` ```mathviz `. Khi model — đặc biệt
   các tier fallback (Groq qwen / Nemotron / Cerebras) — gói payload trong ` ```json `,
   ` ```javascript ` hoặc fence trần, khối đó **đi thẳng ra client**, không hề qua
   validation / repair / regularization.
3. Nhánh strip bảo hiểm (`elif "```mathviz" in reply`) cũng không khớp → fence khác lọt lưới
   hoàn toàn.

Bản vá — hai đầu, cùng một luật "nhận theo GIÁ TRỊ, không theo nhãn fence":

- `mathviz_contract.recover_fenced_mathviz()` (thuần, stdlib): quét MỌI fence, chỉ nhận khi
  payload parse được thành dict có `widget` và `type` trống/`mathviz.v1` → trả
  `(text đã bỏ khối, payload)`. Không "cướp" code JSON không liên quan; bỏ qua fence
  `mathviz` chuẩn (main.py lo, kèm các nhánh json_repair).
- `main.py _extract_mathviz_block()`: gọi recovery này trước `return raw, None` → payload
  dưới bất kỳ fence nào cũng vào đúng dây validation/repair/regularization rồi được tái gắn
  fence chuẩn ở bước ghép reply.
- Frontend: logic tách khối chuyển từ `DuoMCBPage.js` sang module thuần
  **`src/lib/mathvizExtract.js`** + 3 luật mới: nhận ` ```json/javascript/bare ` nếu payload
  LÀ mathviz (type mặc định `mathviz.v1`); payload mathviz không parse được thì **ẩn** (không
  bao giờ lộ JSON thô); code block không liên quan giữ nguyên.
- Guard mới `frontend/scripts/check-mathviz-extract.mjs` (**11 case thật**, vào CI) + 11 check
  mới trong `test_mathviz_contract.py` + 1 wiring check trong `test_chat_budget.py`.

Kiểm chứng: `test_mathviz_contract` ALL PASSED; chat_budget **154/154**; node guard **11/11**
(exit 0); `tsc --noEmit --noResolve` cho 2 file JSX → exit 0. Live smoke (server khởi động
lại với code mới, `_repro_viz.py`): 3/3 prompt sinh khối đúng fence chuẩn và parse OK
(`geometry_2d` ×2, `geometry_3d` ×1) — không hồi quy đường chính.

