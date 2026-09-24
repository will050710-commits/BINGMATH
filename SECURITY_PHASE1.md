# SECURITY_PHASE1.md — Chấm điểm server-side, session ownership, hardening

> Tiếp nối `SECURITY_PHASE0.md`. Ngày thực thi: xem `git log --grep="security(phase1)"`.

## 1. Đã vá

| # | Vấn đề (audit) | Cách vá | File |
|---|---|---|---|
| P1-8 | Điểm bài test do client tính (`frontend/src/utils/scoring.js`) và server lưu nguyên `score` client gửi → có thể gian lận bảng xếp hạng | `backend/grading.py` giữ **answer key server-side** (`backend/answer_key.json`, 30 đề / 613 câu) và tự chấm; `/api/test-result` **bỏ qua** `score`/`total` của client; thêm cột `test_results.verified` | `backend/grading.py`, `backend/answer_key.json`, `backend/main.py` |
| P1-8b | Chấm theo so khớp chuỗi → sai với `1/2` vs `0.5`, `x=1/2`, `√3/2`, MCQ chọn cả câu | So khớp **theo giá trị toán học**: chuẩn hoá unicode (√, −, ²), phương trình, `math-verify` (khi cài) và SymPy parser hạn chế | `backend/grading.py` |
| P1-8c | Endpoint chấm điểm có thể lộ đáp án | `/api/tests/grade` chỉ trả `score/total/accuracy/answered` — **không** trả đáp án đúng | `backend/main.py` |
| P1-9 | Session chat không gắn chủ sở hữu: ai biết `session_id` đều đọc/xoá được lịch sử | Cột `sessions.user_id` + `assert_session_access()`/`bind_session()`: session do tài khoản tạo chỉ tài khoản đó truy cập được | `backend/main.py` |
| P2-12 | 4 chỗ dựng SQL bằng f-string (`UPDATE users/daily_progress/tournaments`) | `backend/sql_guard.py`: mọi tên cột phải nằm trong allowlist trước khi vào câu lệnh | `backend/sql_guard.py`, `backend/main.py` |
| P2-13 | `sympy.sympify` trên chuỗi do LLM sinh (tool-calling) — tài liệu SymPy ghi rõ không an toàn với input không tin cậy | `safe_symbolic_parse()`: namespace hạn chế + guard token + giới hạn độ dài | `backend/grading.py`, `backend/main.py` |
| P2-14 | `LessonVideoPlayer` render HTML thô bằng `dangerouslySetInnerHTML` | `frontend/src/lib/sanitize.js` (parser DOM + allowlist tag/attr, chặn `on*`, `javascript:`) — sanitise sau khi mount để không lệch hydration | `frontend/src/lib/sanitize.js`, `.../LessonVideoPlayer.js` |
| P2-15 | Thiếu security headers | `next.config.mjs`: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` + **CSP ở chế độ report-only** | `frontend/next.config.mjs` |
| — | Endpoint AI mới cần rate limit | `/api/test-result` + `/api/tests/grade` dùng `GRADING_LIMIT` (30/phút) | `backend/main.py` |

## 2. Bằng chứng (đã chạy)

```
python duosteam\backend\test_phase1_grading.py            # 5/5 PASS (13 cặp tương đương, 6 câu sai bị loại)
POST /api/tests/grade  {"p1q1":"B","p1q2":"C"}            # {"score":1,"total":10,"accuracy":10.0,"answered":2}
POST /api/test-result  score=10 (giả)                     # 201 {"score":1,"total":10,"verified":true}
GET  /api/test-results                                    # hàng đã lưu: "score":1,"verified":1
POST /api/test-result  không token                        # 401
npm run build                                             # PASS, 270 routes
```

## 2b. Sửa luôn pipeline deploy frontend (phát hiện khi kiểm chứng)

**Triệu chứng:** từ commit `a171aec` (thêm `konva`) Vercel không deploy được nữa; log build:

```
Detected `pnpm-lock.yaml` 9 ... Using pnpm@10.x
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
* 1 dependencies were added: konva@^10.0.12
```

**Nguyên nhân:** frontend dùng **pnpm** (`node_modules` chuẩn pnpm, Vercel ưu tiên `pnpm-lock.yaml`), nhưng lockfile không được cập nhật khi `konva` được thêm vào `package.json` → `pnpm install --frozen-lockfile` từ chối cài. (Trên máy dev, việc này còn kéo theo lỗi npm khi resolve dev-dependency dạng git của `@firebase/webchannel-wrapper` — `closure-net@git+github.com/google/closure-net` — nên mọi lệnh `npm install` mới đều crash.)

**Đã sửa:**
- Cập nhật **`frontend/pnpm-lock.yaml`** (`pnpm install --lockfile-only`) → có `konva`, không còn `closure-net` (pnpm vốn bỏ qua devDependencies của dependency).
- Giữ `"overrides": { "closure-net": "0.0.1-security" }` trong `package.json` làm lưới an toàn cho ai dùng npm (npm cần override này, pnpm thì không).
- Bỏ `frontend/package-lock.json` (tôi tạo tạm khi thử npm) để dự án chỉ còn **một** nguồn khoá phiên bản là pnpm.

**Bằng chứng:** clean-room `pnpm install --frozen-lockfile` → `Done in 1m 16.6s`, exit 0, `node_modules/konva` tồn tại.

## 3. Chưa làm (chuyển Phase 2)

Vercel build thất bại từ commit `a171aec` (thêm `konva` vào `package.json`) vì frontend **không có `package-lock.json`**, nên mỗi lần đổi dependency npm phải resolve lại toàn bộ cây và crash ở dev-dependency dạng git của `@firebase/webchannel-wrapper`:

```
closure-net@git+https://github.com/google/closure-net.git#6f48f578...  -> npm error Cannot read properties of null
```

Đã sửa:
- `"overrides": { "closure-net": "0.0.1-security" }` trong `frontend/package.json` (registry đã thay gói này bằng placeholder bảo mật).
- Sinh và commit **`frontend/package-lock.json`** (804 gói khoá cứng) → install trên Vercel giờ deterministic.

Bằng chứng: clean-room `npm ci` → `added 797 packages`, exit 0, lockfile không còn `closure-net`.

## 3. Chưa làm (chuyển Phase 2)

- **Answer key vẫn nằm trong bundle client** (`frontend/src/utils/answerKey.js`) để có phản hồi tức thì — điểm *lưu trữ* đã do server quyết định, nhưng học sinh vẫn xem được đáp án. Muốn bịt hẳn: chuyển luồng nộp bài sang `/api/tests/grade` rồi mới hiện đáp án (bỏ `ANSWER_KEY` khỏi client).
- Đổi sanitizer nội bộ sang `DOMPurify` khi npm cài được (hiện fail ở git-dependency `closure-net` của cây deps).
- Bật CSP từ report-only → enforced sau khi đọc báo cáo vi phạm.
- Consent + export/delete tài khoản + retention (P2-17).
- `math-verify` là tuỳ chọn: thêm vào `backend/requirements-ai-addons.txt`; nếu không cài, grading vẫn chạy bằng SymPy.
