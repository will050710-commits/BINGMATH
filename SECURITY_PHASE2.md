# SECURITY_PHASE2.md — Bỏ answer key khỏi client, DOMPurify, CSP enforced, quyền dữ liệu

> Tiếp nối `SECURITY_PHASE0.md` / `SECURITY_PHASE1.md`.
> Ngày thực thi: xem `git log --grep="security(phase2)"`.

## 1. Đã làm

| # | Hạng mục | Cách làm | File |
|---|---|---|---|
| P2a | **Answer key không còn nằm trong bundle client** (trước đây `answerKey.js` chứa 30 đề/613 đáp án, ai cũng đọc được) | `gradeTest()` chỉ **gom bài làm** vào `localStorage["readingTest_submission"]`; trang `/ketqua` gọi `POST /api/tests/grade` để chấm. Xoá hẳn `utils/answerKey.js`, `utils/scoring.js`, `app/api/score/route.js`. Cờ đúng/sai từng câu **chỉ trả cho người đã đăng nhập** (khách ẩn danh chỉ nhận điểm tổng) và **không bao giờ** trả đáp án đúng | `frontend/src/utils/grader.js`, `utils/mastery.js`, `components/result/pageketqua.js`, `backend/main.py` |
| P2b | Sanitizer chuyển sang **DOMPurify** (trước đó phải tự viết vì chưa cài được) | `dompurify ^3.4.16`; giữ parser nội bộ làm fallback; API `sanitizeHtml`/`creditHtml` không đổi nên component không phải sửa | `frontend/src/lib/sanitize.js`, `package.json`, `pnpm-lock.yaml` |
| P2c | **CSP enforced** (Phase 1 chỉ report-only) | Allowlist quét từ toàn bộ URL ngoài trong `frontend/src`: YouTube iframe API + embed, Firebase auth/firestore, Google fonts, GeoGebra/Desmos, Render API. Gồm `frame-ancestors`, `object-src 'none'`, `base-uri`, `form-action` | `frontend/next.config.mjs` |
| P2d | **Quyền của chủ dữ liệu** (NĐ 13/2023) | `GET /api/me/export` (hồ sơ, kết quả test, lịch sử game, gamification, hội thoại DuoMCB) · `DELETE /api/me` (xoá tài khoản + toàn bộ hàng dữ liệu liên quan) · retention tự động: hội thoại ẩn danh + tài liệu AI cũ hơn `DATA_RETENTION_DAYS` (mặc định 30) bị dọn lúc khởi động, có `POST /api/admin/retention/run` để chạy tay | `backend/main.py`, `frontend/src/components/mrm/MRMSettings.js` |
| — | UI cho người dùng | Khối **“🔐 Dữ liệu & quyền riêng tư”** trong `/mrm/settings`: nút tải JSON và nút xoá tài khoản (có xác nhận, tự đăng xuất sau khi xoá) | `frontend/src/components/mrm/MRMSettings.js` |

## 2. Bằng chứng

Backend (chạy thật, tài khoản test dùng một lần):
```
signup 201
POST /api/test-result gửi score=99 (giả)  -> 201 {"score":1,"total":10,"verified":true}
GET  /api/me/export                       -> 200, keys = [chat_sessions, exported_at, game_results,
                                             gamification, retention_days, test_results, user]
                                             test_results=1, score lưu = 1, verified = 1, email khớp
DELETE /api/me                            -> 200 {"deleted":true,"rows":{test_results:1,...}}
GET  /api/me (sau khi xoá)                -> 404
log khởi động                             -> [retention] {'sessions_deleted': 145, ...}
```
Bộ test hiện có: `test_phase0_security` · `test_phase1_grading` · `test_geometry_canvas_solver_regression` ·
`test_geometry_snapping` · `test_duomath_space_agent` → **tất cả PASS**; `next build` (270 route) PASS.

## 2b. Kiểm chứng PRODUCTION (sau deploy)

| Kiểm tra | Kết quả |
|---|---|
| Render deploy | `live` @ `c267e83` |
| `POST /api/tests/grade` ẩn danh + `include_questions:true` | `200 {"score":1,"total":10,...,"questions_requires_login":true}` — **không** trả chi tiết câu |
| `GET /api/me/export` ẩn danh | `401` |
| `POST /api/admin/retention/run` ẩn danh | `401` |
| Vercel headers | `Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; form-action …` (**enforced**, không còn `-Report-Only`) |
| Bundle đang phục vụ (27 chunk) | có `readingTest_submission` + chuỗi UI “Dữ liệu & quyền riêng tư” ⇒ code Phase 2 đã lên |
| Đáp án trong bundle | `answerKey` = 0 chunk · `[-5/3,1]` = 0 · `5x+12y+35=0` = 0 · `x^2/181 + y^2/81 = 1` = 0 ⇒ **answer key đã biến mất khỏi client** |

## 3. Lưu ý vận hành

- **Khách ẩn danh** chỉ thấy điểm tổng ở trang kết quả (không có phần xem lại từng câu) — đây là đánh đổi có chủ đích để không biến API thành “máy dò đáp án”. Học sinh đã đăng nhập giữ nguyên trải nghiệm cũ.
- `DATA_RETENTION_DAYS` có thể chỉnh trên Render (mặc định 30 ngày).
- Nếu CSP chặn nhầm một tài nguyên nào đó trong production: đổi key trong `next.config.mjs` về `Content-Security-Policy-Report-Only`, thêm host còn thiếu rồi bật lại — phần hardening khác không bị ảnh hưởng.
- Vẫn nên bổ sung trang **Chính sách quyền riêng tư** (nội dung pháp lý) và tick đồng ý khi gửi ảnh cho AI — hiện đã có API export/delete để gắn vào đó.

## 4. Đề xuất Phase 3

- CI: `gitleaks` + `pip-audit` + `pnpm audit` chạy tự động; chặn commit chứa secret.
- Bật **Firebase App Check**, giới hạn API key theo referrer/API.
- FastAPI: thêm `TrustedHostMiddleware`, log bất biến cho hành động admin.
- Data: trang privacy + tick consent khi upload ảnh; thông báo cho người dùng bị ảnh hưởng (sự cố DB/keys ở Phase 0).
- Tích hợp theo `DUOMATH_AGENT_INTEGRATION_GUIDE.md`: Streamdown → MathLive → Penrose → py-fsrs → Serwist (nhớ `NetworkOnly` cho `/api/*`) → VNHSGE → Mafs.
