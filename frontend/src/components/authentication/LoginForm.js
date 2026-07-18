"use client";
// ─────────────────────────────────────────────────────────────────────────────
// FILE:  frontend/src/components/Auth/LoginForm.js
//
// ROUTE: Create  frontend/src/app/login/page.js  with:
//   "use client";
//   import LoginForm from "@/components/Auth/LoginForm";
//   export default function Page() { return <LoginForm />; }
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { useMathMapStore } from "@/context/MathMapStore";
import { useLanguage } from "@/context/LanguageContext";

function getAuthErrorMessage(error, fallback) {
  const message = error?.message || "";
  if (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("fetch")
  ) {
    return "Không kết nối được máy chủ xác thực. Vui lòng kiểm tra backend và thử lại.";
  }
  return fallback;
}

export default function LoginForm() {
  const { login }  = useAuth();
  const { isAdmin, syncAdminSession } = useMathMapStore();
  const router     = useRouter();
  const { t }      = useLanguage();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      const { ok, error: err } = await login({ email: emailNorm, password });
      if (ok) {
        if (isAdmin(emailNorm)) {
          syncAdminSession(emailNorm);
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(err || "Sai email hoặc mật khẩu. Vui lòng thử lại.");
      }
    } catch (authErr) {
      setError(getAuthErrorMessage(authErr, "Đăng nhập thất bại. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: "100%", padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 8,
    fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f8fa", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.1)", overflow: "hidden" }}>

        {/* Banner */}
        <div style={{ background: "linear-gradient(135deg, #00d8fe, #13b0ff)", padding: "28px 32px 22px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>🎓</div>
          <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>{t("Đăng nhập", "Sign In")}</div>
          <div style={{ fontSize: 13, opacity: 0.82 }}>{t("Chào mừng quay lại DuoMath!", "Welcome back to DuoMath!")}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "26px 32px 30px" }}>

          {error && (
            <div style={{ background: "#fdf2f2", border: "1px solid #f5c6cb", color: "#c0392b", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              autoComplete="email" required style={inp}
              onFocus={e => e.target.style.borderColor = "#13b0ff"}
              onBlur={e  => e.target.style.borderColor = "#ddd"} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 5 }}>{t("Mật khẩu", "Password")}</label>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={t("Nhập mật khẩu", "Enter password")} autoComplete="current-password" required
                style={{ ...inp, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = "#13b0ff"}
                onBlur={e  => e.target.style.borderColor = "#ddd"} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#888" }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "12px 0", background: loading ? "#6ca3ae" : "#13b0ff", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 14, transition: "background 0.2s" }}>
            {loading ? t("Đang đăng nhập…", "Signing in…") : t("Đăng nhập", "Sign In")}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 10 }}>
            {t("Chưa có tài khoản?", "Don't have an account?")}{" "}
            <Link href="/signup" style={{ color: "#13b0ff", fontWeight: 600, textDecoration: "none" }}>{t("Đăng ký miễn phí", "Sign up free")}</Link>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/" style={{ color: "#bbb", fontSize: 12, textDecoration: "none" }}>← {t("Về trang chủ", "Back to Home")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
