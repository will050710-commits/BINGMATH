"use client";
// ─────────────────────────────────────────────────────────────────────────────
// FILE:  frontend/src/components/Auth/SignUpForm.js
//
// ROUTE: Create  frontend/src/app/signup/page.js  with:
//   "use client";
//   import SignUpForm from "@/components/Auth/SignUpForm";
//   export default function Page() { return <SignUpForm />; }
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/authContext";

const GRADES = ["Grade 10", "Grade 11", "Grade 12", "Other"];

const baseInp = {
  width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8,
  fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border 0.2s",
};

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

function Inp({ style, ...props }) {
  return (
    <input {...props} style={{ ...baseInp, ...style }}
      onFocus={e => e.target.style.borderColor = "#13b0ff"}
      onBlur={e  => e.target.style.borderColor = "#ddd"} />
  );
}

export default function SignUpForm() {
  const { signup } = useAuth();
  const router     = useRouter();

  const [f, setF] = useState({ username: "", email: "", password: "", confirm: "", phone: "", school: "", grade: "Grade 10" });
  const set        = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!f.username.trim())   return "Tên người dùng không được để trống.";
    if (!f.email.trim())      return "Email không được để trống.";
    if (!/\S+@\S+\.\S+/.test(f.email)) return "Email không hợp lệ.";
    if (f.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (f.password !== f.confirm) return "Mật khẩu không khớp.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const { ok, error: apiErr } = await signup({
        email: f.email.trim().toLowerCase(), username: f.username.trim(),
        password: f.password, phone: f.phone.trim(), school: f.school.trim(), grade: f.grade,
      });
      if (ok) router.push("/");
      else    setError(apiErr || "Đăng ký thất bại. Vui lòng thử lại.");
    } catch (authErr) {
      setError(getAuthErrorMessage(authErr, "Đăng ký thất bại. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f8fa", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.1)", overflow: "hidden" }}>

        {/* Banner */}
        <div style={{ background: "linear-gradient(135deg,#0B4F5C,#1a9ab5)", padding: "26px 32px 20px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 28, marginBottom: 5 }}>🎓</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>Tạo tài khoản</div>
          <div style={{ fontSize: 13, opacity: 0.82 }}>Điểm số và tiến độ học sẽ được lưu tự động</div>
        </div>

        {/* Hint bar */}
        <div style={{ background: "#e8f4f6", padding: "7px 32px", fontSize: 12, color: "#13b0ff", fontWeight: 500 }}>
          ✦ Miễn phí · Lưu điểm test & mini-game · Xem thống kê cá nhân
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "22px 32px 28px" }}>

          {error && (
            <div style={{ background: "#fdf2f2", border: "1px solid #f5c6cb", color: "#c0392b", borderRadius: 8, padding: "9px 13px", fontSize: 13, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Row: username + grade */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Tên người dùng *</label>
              <Inp type="text" value={f.username} onChange={set("username")} placeholder="Họ tên của bạn" autoComplete="name" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Lớp</label>
              <select value={f.grade} onChange={set("grade")}
                style={{ width: "100%", padding: "11px 12px", border: "1.5px solid #13b0ff", borderRadius: 8, fontSize: 15, background: "#fff", outline: "none" }}>
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Email *</label>
            <Inp type="email" value={f.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required style={{ border: "1.5px solid #555555" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Trường học <span style={{ color: "#555555", fontWeight: 400 }}>(không bắt buộc)</span></label>
            <Inp type="text" value={f.school} onChange={set("school")} placeholder="VD: THPT Nguyễn Chí Thanh" style={{ border: "1.5px solid #555555" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Số điện thoại <span style={{ color: "#555555", fontWeight: 400 }}>(không bắt buộc)</span></label>
            <Inp type="tel" value={f.phone} onChange={set("phone")} placeholder="+84 ..." style={{ border: "1.5px solid #555555" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Mật khẩu * <span style={{ color: "#555555", fontWeight: 400 }}>(tối thiểu 6 ký tự)</span></label>
            <div style={{ position: "relative" }}>
              <Inp type={showPw ? "text" : "password"} value={f.password} onChange={set("password")} placeholder="Tạo mật khẩu" autoComplete="new-password" required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#888" }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 5 }}>Xác nhận mật khẩu *</label>
            <Inp type={showPw ? "text" : "password"} value={f.confirm} onChange={set("confirm")} placeholder="Nhập lại mật khẩu" autoComplete="new-password" required style={{ color: "#555555", border: "1.5px solid #555555"}} />
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "12px 0", background: loading ? "#6ca3ae" : "#13b0ff", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12, transition: "background 0.2s" }}>
            {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 8 }}>
            Đã có tài khoản?{" "}
            <Link href="/login" style={{ color: "#13b0ff", fontWeight: 600, textDecoration: "none" }}>Đăng nhập</Link>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/" style={{ color: "#6e6e6e", fontSize: 12, textDecoration: "none" }}>← Về trang chủ</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
