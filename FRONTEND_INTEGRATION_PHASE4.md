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

## Lưu ý phụ thuộc

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

### Bằng chứng chạy thử cục bộ (chuỗi nhà cung cấp)

- `"quadratic equation"` → Groq 401 → **Gemini OK**: `_provider: gemini`, `translation_en: "quadratic equation"`, `words[0].english: "quadratic equation"`, `words[0].vietnamese: "phương trình bậc hai"`.
- `"phương trình bậc hai"` (lúc Gemini trả 503 cả 2 lần thử) → `_fallback: mock_error` + log `[translate] Gemini fallback failed (... key=***)` → xác nhận vừa thoái hoá an toàn vừa không lộ khoá.

### Việc cần chủ dự án làm

- Tạo **khoá Groq mới** và cập nhật `GROQ_API_KEY` ở cả 3 nơi: Render (backend), Vercel (route `/api/learning-feedback`), và `backend/.env` khi chạy local. Trước khi có khoá mới, bản dịch vẫn chạy qua Gemini (chất lượng tốt, thỉnh thoảng gặp 503 → hiện cảnh báo demo).
