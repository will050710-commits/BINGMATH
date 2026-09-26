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

## Lưu ý phụ thuộc

- `@streamdown/math@1.0.2` phụ thuộc `katex ^0.16.27` trong khi app dùng `katex ^0.17.0` ⇒ pnpm cài 2 bản KaTeX (CSS trùng lặp nhẹ, không ảnh hưởng chức năng). Khi Streamdown nâng lên KaTeX 0.17 có thể bỏ import CSS trùng.
- Trước khi thêm Penrose: chạy `npm run dev` và `next build` ngay sau khi cài, vì `@penrose/core` có WASM và Turbopack từng lỗi với loader `.wasm` (guide §1.3). Luôn `dynamic(..., { ssr: false })`.

## Kiểm chứng đợt 1

- `pnpm install` chạy postinstall → `[mathlive] copied 20 font file(s) and 5 sound file(s) into public/` (exit 0).
- `next build` phải pass (270 route) trước khi commit — nếu build lỗi, xem log `%TEMP%\duomath_build9.log`.
