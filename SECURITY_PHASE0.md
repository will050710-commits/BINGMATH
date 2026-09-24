# SECURITY_PHASE0.md — Khắc phục bảo mật khẩn cấp (Phase 0)

> Nguồn: báo cáo audit nội bộ (18 phát hiện; 4 mức **P0**) + kế hoạch Phase 0.
> Ngày thực thi: xem `git log --grep="security(phase0)"`.

## 1. Đã vá trong mã nguồn

| # | Lỗ hổng (trước) | Cách vá | File |
|---|---|---|---|
| P0-1 | `backend/duomath.db` (PII + hash mật khẩu) bị commit & publish | `git rm --cached` + ignore `*.db` | `.gitignore`, `backend/.gitignore` |
| P0-2 | API key thật trong lịch sử git | **Cần bạn rotate** (xem §3) + purge history (§4) | — |
| P0-3 | RCE: `eval()` đọc `expr` từ LLM trong `canvas_to_video.py` | AST allowlist `safe_expr.py` (chặn `import`, attribute lạ, `x**1000`…) | `backend/safe_expr.py`, `canvas_to_video.py` |
| P0-3b | `/api/video/generate` ẩn danh, argv lộ payload, subprocess kế thừa env (API keys), không timeout | Bắt buộc login + rate limit 3/giờ + 1 job/lần + timeout 180s + env con đã lọc + JSON qua temp file | `main.py` |
| P0-4 | `JWT_SECRET` fallback hardcode `duomath-dev-secret-...` | `config_guard.require_secret` (prod thiếu → **từ chối boot**; dev → secret ngẫu nhiên tạm thời) | `backend/config_guard.py`, `main.py` |
| P0-4b | Bypass admin bằng email hardcode (2 chỗ, 1 chỗ chạy mỗi lần boot) | Chỉ dùng `users.is_admin`; allowlist `ADMIN_EMAILS` chỉ **promote tài khoản đã tồn tại** | `main.py` |
| P0-4c | `/api/refresh` cấp access token mới từ access token | Token có claim `typ`; refresh bắt buộc `typ=refresh` | `main.py` |
| P1-5 | CORS regex `https://*.vercel.app|render.com|netlify.app` + credentials | Allowlist từ `ALLOWED_ORIGINS`; `allow_credentials=False`; tắt `/docs` ở production | `main.py` |
| P1-6 | 12 endpoint AI/canvas ẩn danh (chat, translate, session, ai-test, geometry, video, typesafe, mathmap) | Bắt buộc login (`resolve_user_id`) hoặc admin (`verify_admin`) + frontend gửi kèm token | `main.py`, `frontend/src/lib/authFetch.js` |
| P1-7 | `new Function()` + "sanitize" string-replace trong canvas DuoMCB (XSS/JS-exec) | Chuyển sang `mathjs` AST (`safeMathEval.js`) | `frontend/src/utils/safeMathEval.js`, `DuoMCBPage.js` |
| P1-10 | Ảnh/tài liệu base64 không giới hạn kích thước | Cap 5 MB (ảnh) / 8 MB (tài liệu) + message ≤ 4.000 ký tự | `security_limits.py`, `main.py` |
| P1-11 | Không có rate limiting | `slowapi` + ngân sách theo endpoint (§2) | `security_limits.py`, `main.py` |
| P2-18 | `--workers 2` làm rate-limit & state MRM bị chia đôi; đường dẫn Windows hardcode trong render pipeline | `--workers 1 --proxy-headers`; dùng `sys.executable` | `render.yaml`, `main.py` |

## 2. Ngân sách rate limit (Phase 0)

| Endpoint | Giới hạn | Ghi chú |
|---|---|---|
| `/api/chat` | 12/phút (theo IP) | vẫn cho phép khách ẩn danh |
| `/api/translate` | 20/phút | |
| `/api/session/*` | 30/phút | |
| `/api/ai-test/*` | 5–30/phút + **bắt buộc login** | |
| `/api/video/generate` | 3/giờ + login + 1 job đồng thời | |
| `/api/video/enhance*` | 2/giờ + **admin** | |
| `/api/geometry/*`, `/api/mathmap/parse-file` | 10/phút + login | |
| `/api/typesafe/rotate`, `/status` | **admin** | |

## 3. Việc CHỈ chủ dự án làm được (bắt buộc)

- [ ] **Rotate** các key từng nằm trong lịch sử công khai: `GROQ_API_KEY` (commit `8ae3122`), `GEMINI_API_KEY` (commit `09a4a12`), và nên rotate thêm `OPENROUTER_API_KEY`, `HF_API_KEY`, `TYPESAFE_API_KEY_*`, `JWT_SECRET`.
- [ ] Đặt trên Render: `ALLOWED_ORIGINS=https://duomath.vercel.app,http://localhost:3000` và `ADMIN_EMAILS=<email chủ dự án>`.
- [ ] Mở ticket GitHub Support xin purge cache/object không còn tham chiếu sau force-push.
- [ ] Bật **Firebase App Check** + giới hạn API key theo referrer/API.
- [ ] Kiểm tra DB production: số lượng tài khoản thật bị ảnh hưởng để thực hiện nghĩa vụ thông báo (NĐ 13/2023/NĐ-CP).

## 4. Purge lịch sử git (sau khi rotate key)

```powershell
pip install git-filter-repo
git -C duosteam clone --mirror . "$env:USERPROFILE\duosteam-backup.git"   # backup
git clone --mirror https://github.com/will050710-commits/DUOMATH duosteam-purge.git
cd duosteam-purge
git filter-repo --path backend/duomath.db --path backend/.env `
                --path backend/vision_cache.db --path mobile/android/app/debug.keystore `
                --invert-paths --force
git push --force --mirror origin
cd ..\duosteam; git fetch --all --prune; git reset --hard origin/main; git gc --prune=now --aggressive
```

## 5. Kiểm chứng (đã chạy)

```powershell
python duosteam\backend\test_phase0_security.py      # 4 nhóm test — PASS
curl -X POST .../api/video/generate  (ẩn danh)       # 401
curl -X POST .../api/chat  (message > 4.000 ký tự)   # 413
curl .../api/session/new  ×32                        # 200 ×30 rồi 429
OPTIONS /api/chat  Origin: https://evil.vercel.app   # 400, KHÔNG có Access-Control-Allow-Origin
OPTIONS /api/chat  Origin: https://duomath.vercel.app# 200 + Access-Control-Allow-Origin
```

## 6. Tồn đọng (chuyển Phase 1)

- Chấm điểm server-side + math-verify; bỏ answer key khỏi bundle (P1-8).
- Session chat gắn `user_id` + kiểm tra sở hữu (P1-9).
- DOMPurify cho `LessonVideoPlayer`; security headers/CSP trong `next.config.mjs` (P2).
- SQL động dạng f-string → allowlist map (P2-12); `sympify` → parser hạn chế (P2-13).
- Consent + export/delete tài khoản + retention (P2-17).
