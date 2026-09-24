# SECURITY_PHASE3.md — CI quét bảo mật, chống Host-header, audit log, trang quyền riêng tư

> Tiếp nối `SECURITY_PHASE0/1/2.md`. Ngày thực thi: xem `git log --grep="security(phase3)"`.

## 1. Đã làm

| # | Hạng mục | Chi tiết | File |
|---|---|---|---|
| 1 | **CI quét secret tự động** | Workflow chạy khi push/PR, định kỳ thứ Hai hằng tuần và khi bấm tay: gitleaks quét **toàn bộ lịch sử** (chặn build nếu có secret mới) + `pip-audit` (backend) + `pnpm audit` (frontend, chỉ báo cáo) | `.github/workflows/security-scan.yml`, `.gitleaks.toml` |
| 2 | **Dọn secret thật phát hiện được** | Quét lần đầu: 23 cảnh báo. Hai **Hugging Face token thật** nằm trong `backend/training/test_hard_geometry_suite.py`, notebook fine-tune, `generate_latest_pipeline_and_model_pdf.py` và báo cáo HTML sinh ra → đã thay bằng `os.environ.get(...)` / placeholder. Xoá luôn khỏi **toàn bộ lịch sử** bằng `git filter-repo --replace-text` (201 commit bị viết lại, có backup `D:\duomath-backup2.git`) | 4 file + lịch sử git |
| 3 | **Chống Host-header** | `TrustedHostMiddleware` với allowlist cấu hình qua `ALLOWED_HOSTS` (mặc định `*.onrender.com`, `localhost`, `127.0.0.1`, `testserver`) | `backend/main.py`, `backend/render.yaml` |
| 4 | **Audit log cho hành động admin** | Bảng `admin_audit_log` (append-only) + `audit_admin()`; ghi lại: đổi quyền (`user.role`), khoá tài khoản (`user.ban`), xử lý báo cáo (`report.resolve`), chạy retention (`retention.run`). Endpoint đọc: `GET /api/admin/audit-log?limit=100` | `backend/main.py` |
| 5 | **Trang Chính sách quyền riêng tư** | `/privacy`: dữ liệu thu thập, mục đích, chia sẻ với bên thứ ba (AI, Firebase, Render/Vercel), thời hạn lưu, quyền của chủ thể dữ liệu, bảo mật, liên hệ; có link chéo tới `/mrm/settings` và ngược lại | `frontend/src/app/privacy/page.js`, `components/mrm/MRMSettings.js` |

## 2. Bằng chứng

```
gitleaks trước:  23 cảnh báo (2 HF token thật + Firebase keys hợp lệ-chủ-đích + build output .next/)
gitleaks sau:     0 cảnh báo (sau khi dọn token, allowlist build output và 1 commit lịch sử)
TrustedHost:      Host: evil.example.com -> 400   |   Host mặc định -> 200
Audit trail:      POST /api/admin/retention/run (admin) -> 200
                  GET  /api/admin/audit-log -> [('retention.run', '{"sessions_deleted": 0, ...')]
                  GET  /api/admin/audit-log (không phải admin) -> 403
                  POST /api/admin/retention/run (ẩn danh) -> 401
Backend import:   105 route (thêm /api/admin/audit-log), ALLOWED_HOSTS đúng allowlist
```

## 3. Việc cần bạn làm (không tự động hoá được)

1. **Rotate ngay 2 Hugging Face token vừa phát hiện** (`hf_qmotu…`, `hf_WISh…` — chúng từng công khai khi repo còn public; lịch sử đã sạch nhưng token vẫn còn hiệu lực nếu chưa đổi).
2. Vẫn còn nhóm key từ Phase 0: **Groq, Gemini, OpenRouter, HF, TypeSafe** + **Render API key** đã dán vào chat.
3. **Firebase (bấm trong console):**
   - Bật **App Check** cho Web (reCAPTCHA v3) và Android (Play Integrity) — sau khi bật, theo dõi vài ngày trước khi enforce.
   - Giới hạn API key: Google Cloud → Credentials → key của web (`AIzaSyBbLq9…`) → *Application restrictions*: HTTP referrers `duomath.vercel.app/*` + localhost; key Android trong `google-services.json` → giới hạn theo package name + SHA-1.
   - Firebase → Authentication → Settings → *User actions*: bật yêu cầu xác minh email nếu muốn siết.
4. Thêm biến `ALLOWED_HOSTS` trên Render nếu dùng **domain riêng** (mặc định đã bao `*.onrender.com`).
5. (tuỳ chọn) Bỏ bước commit APK ~70 MB trong `build-apk.yml`; thêm `DOMAIN` vào CSP nếu nhúng thêm dịch vụ ngoài.

## 4. Đề xuất Phase 4

- Tích hợp theo `DUOMATH_AGENT_INTEGRATION_GUIDE.md`: Streamdown (render markdown + KaTeX khi stream) → MathLive (nhập công thức) → Penrose (hình minh hoạ) → py-fsrs (ôn tập giãn cách) → Serwist (offline; nhớ `NetworkOnly` cho `/api/*`) → VNHSGE (ngân hàng đề) → Mafs (prototype widget).
- Siết CI: bỏ `continue-on-error` ở 2 job audit sau khi báo cáo đã sạch; thêm job chạy `test_phase*` của backend.
- Giám sát: đẩy log audit + retention lên dịch vụ log tập trung; cảnh báo khi có secret mới bị đẩy lên.
