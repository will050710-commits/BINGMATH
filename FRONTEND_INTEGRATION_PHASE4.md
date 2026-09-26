# PHASE 4 — Tích hợp thư viện theo `DUOMATH_AGENT_INTEGRATION_GUIDE.md`

> Tiếp nối các `SECURITY_PHASE*.md` (Phase 0–3 đã xong). Phase 4 là phần **tính năng/tích hợp**, mỗi mục đều giữ đúng “cổng bảo mật” đã nêu trong guide.

## Trạng thái

| # | Mục trong guide | Trạng thái | Ghi chú |
|---|---|---|---|
| 2.6 | **mathjs** — thay `new Function()` trong canvas DuoMCB | ✅ Xong ở Phase 0 | `frontend/src/utils/safeMathEval.js` |
| 2.3 | **Math-Verify** — chấm theo giá trị toán học | ✅ Xong ở Phase 1 | `backend/grading.py` (math-verify khi có, SymPy hạn chế khi không) |
| 2.2 | **Streamdown** — markdown + LaTeX khi streaming | ✅ Đã tích hợp (đợt 1) | `frontend/src/components/chat/StreamdownMessage.jsx`, dùng trong AI Test Studio (`/aithi`) |
| 2.1 | **MathLive** — nhập công thức trực quan | ✅ Component + asset sẵn sàng | `frontend/src/components/shared/MathInput.jsx`, `scripts/copy-mathlive-assets.mjs` (+`postinstall`) |
| 1 | **Penrose** — hình minh hoạ hình học | ⏳ Chưa | Cần `@penrose/core` + `@penrose/components`; xem rủi ro Turbopack bên dưới |
| 2.4 | **py-fsrs** — ôn tập giãn cách | ⏳ Chưa | Cần bảng `concept_mastery(user_id, concept_id, fsrs_state, due_at)` |
| 2.7 | **Serwist** — Offline Mode | ⏳ Chưa | Bắt buộc `NetworkOnly` cho `/api/*` (nếu không sẽ rò dữ liệu người dùng khác trên máy dùng chung) |
| 2.8 | **VNHSGE** — ngân hàng đề THPT | ⏳ Chưa | Cần kiểm tra license/attribution trước khi nhập; nhập qua script kiểu `migrate_lessons.py`; **không** commit DB sinh ra |
| 2.5 | **Mafs** — prototype widget | ⏳ Tuỳ chọn | Chỉ khi cần widget mới nhanh |

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


- `@streamdown/math@1.0.2` phụ thuộc `katex ^0.16.27` trong khi app dùng `katex ^0.17.0` ⇒ pnpm cài 2 bản KaTeX (CSS trùng lặp nhẹ, không ảnh hưởng chức năng). Khi Streamdown nâng lên KaTeX 0.17 có thể bỏ import CSS trùng.
- Trước khi thêm Penrose: chạy `npm run dev` và `next build` ngay sau khi cài, vì `@penrose/core` có WASM và Turbopack từng lỗi với loader `.wasm` (guide §1.3). Luôn `dynamic(..., { ssr: false })`.

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
