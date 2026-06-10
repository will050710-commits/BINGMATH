/* eslint-disable react-hooks/static-components */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DuoMCBSidebar from "../DuoMCB/DuoMCBSidebar";
import { clearTestSession } from "@/utils/testTimer";
import { useAuth } from "@/context/authContext";
import { useMathMapStore } from "@/context/MathMapStore";

function getInitials(name) {
  const parts = (name || "U").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || "U").slice(0, 2).toUpperCase();
}

function UserAvatar({ user, size = 34, style = {} }) {
  const initials = getInitials(user?.username || user?.email?.split("@")[0] || "U");
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username || "Avatar"}
        style={{
          width: size, height: size, borderRadius: "50%", objectFit: "cover",
          border: "2px solid rgba(56,189,248,0.4)",
          boxShadow: "0 0 10px rgba(56,189,248,0.2)",
          ...style,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 800, fontSize: size <= 36 ? 12 : 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      letterSpacing: -0.5,
      ...style,
    }}>
      {initials}
    </div>
  );
}

/// ── EditProfileModal (avatar upload + profile edit) ────────────────────
function EditProfileModal({ onClose }) {
  const { user, updateProfile, uploadAvatar, reloadProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [school, setSchool] = useState(user?.school || "");
  const [grade, setGrade] = useState(user?.grade || "");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "");
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setErrorMsg("");
    setSuccessMsg("");
    setAvatarLoading(true);

    try {
      const { ok, error } = await uploadAvatar(file);
      if (ok) {
        setSuccessMsg("Ảnh đại diện đã được cập nhật!");
        if (reloadProfile) await reloadProfile();
      } else {
        setErrorMsg(error || "Upload ảnh thất bại.");
        setAvatarPreview(user?.avatar_url || "");
      }
    } catch {
      setErrorMsg("Không thể upload ảnh.");
      setAvatarPreview(user?.avatar_url || "");
    } finally {
      setAvatarLoading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!username.trim()) { setErrorMsg("Tên người dùng không được để trống."); return; }
    if (username.trim().length < 2) { setErrorMsg("Tên người dùng phải có ít nhất 2 ký tự."); return; }
    setLoading(true);
    try {
      const { ok, error } = await updateProfile({
        username: username.trim(),
        phone: phone.trim(),
        school: school.trim(),
        grade: grade.trim(),
      });
      if (ok) {
        setSuccessMsg("Đã lưu thông tin thành công!");
        if (reloadProfile) await reloadProfile();
        setTimeout(() => onClose(), 1400);
      } else {
        setErrorMsg(error || "Đã xảy ra lỗi khi cập nhật thông tin.");
      }
    } catch {
      setErrorMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white", fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  const currentAvatar = avatarPreview || user?.avatar_url || "";
  const initials = getInitials(user?.username || user?.email?.split("@")[0] || "U");

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(10,10,26,0.85)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: "16px",
    }}>
      <div style={{
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 16, width: "100%", maxWidth: 560,
        padding: "28px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(14,165,233,0.15)",
        color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#38bdf8" }}> Chỉnh sửa thông tin cá nhân</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 24, cursor: "pointer" }}>&times;</button>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "16px", borderRadius: 12, marginBottom: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover",
                  border: "3px solid rgba(14,165,233,0.5)",
                  boxShadow: "0 0 20px rgba(14,165,233,0.3)",
                  opacity: avatarLoading ? 0.5 : 1, transition: "opacity 0.3s",
                }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 800, fontSize: 22,
                border: "3px solid rgba(14,165,233,0.5)",
                letterSpacing: -1,
              }}>{initials}</div>
            )}
            {avatarLoading && (
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.4)", fontSize: 20,
              }}>⏳</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 4 }}>
              Ảnh đại diện
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
              JPG, PNG, GIF, WebP • Tối đa 5MB • Tự động resize về 200×200
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              style={{
                padding: "7px 16px", borderRadius: 7, cursor: avatarLoading ? "not-allowed" : "pointer",
                background: "rgba(14,165,233,0.15)",
                border: "1px solid rgba(14,165,233,0.35)",
                color: "#7dd3fc", fontSize: 12, fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!avatarLoading) e.currentTarget.style.background = "rgba(14,165,233,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(14,165,233,0.15)"; }}
            >
              {avatarLoading ? "⏳ Đang xử lý..." : "📷 Chọn ảnh"}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#fca5a5", marginBottom: 14 }}>
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#86efac", marginBottom: 14 }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 6 }}>Tên học sinh *</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Nhập tên học sinh" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 6 }}>Số điện thoại</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 6 }}>Trường</label>
            <input type="text" value={school} onChange={e => setSchool(e.target.value)} placeholder="Nhập tên trường học" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 6 }}>Lớp</label>
            <select value={grade} onChange={e => setGrade(e.target.value)} style={{ ...inputStyle, background: "rgba(15,23,42,0.95)", cursor: "pointer" }}>
              <option value="">-- Chọn lớp --</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 6, gridColumn: "1 / -1" }}>
            <button type="button" onClick={onClose} disabled={loading}
              style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
              Hủy
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "11px 0", background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.3)" }}>
              {loading ? "⏳ Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TrangChuForm() {
  const router = useRouter();
  const {
    user, ready,
    bestScores, recentActivity,
    totalTests, totalGames, avgTest, avgGame,
    competitiveStats,
    logout,
  } = useAuth();

  const { admins } = useMathMapStore();

  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mathSymbols, setMathSymbols] = useState([]);

  // Generate unique floating math symbols on mount
  useEffect(() => {
    const symbols = ["π", "Σ", "θ", "∞", "∫", "Δ", "√", "f(x)", "dy/dx", "log", "x²", "y", "z", "a+b", "sin", "cos"];
    const items = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      char: symbols[i % symbols.length],
      size: Math.floor(Math.random() * 20) + 14, // 14px to 34px
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 20}s`,
      dur: `${Math.random() * 18 + 15}s`, // 15s to 33s
    }));
    setMathSymbols(items);
  }, []);

  // Reveal animations on scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      if (el.hasAttribute("data-reveal-stagger")) {
        const s = parseInt(el.getAttribute("data-stagger") || "80", 10);
        Array.from(el.children).forEach((c, i) => {
          c.style.opacity = "0"; c.style.transform = "translateY(24px) scale(0.97)";
          c.style.transition = `opacity .5s cubic-bezier(.2,.8,.2,1) ${i * s}ms,transform .45s cubic-bezier(.2,.8,.2,1) ${i * s}ms`;
          c.style.willChange = "opacity,transform";
        });
      }
    });
    
    const obs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const s = parseInt(el.getAttribute("data-stagger") || "80", 10);
        if (el.hasAttribute("data-reveal-stagger")) {
          Array.from(el.children).forEach((c, i) => setTimeout(() => { c.style.opacity = "1"; c.style.transform = "translateY(0) scale(1)"; }, i * s));
        }
        el.classList.add("visible");
        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!showProfile) return;
    const h = (e) => {
      if (!e.target.closest("[data-profile-root]")) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showProfile]);

  function handleSignOut() { logout(); setShowProfile(false); router.push("/"); }

  const isUserAdmin = user && (
    admins.map(e => e.toLowerCase()).includes(user.email.toLowerCase()) || 
    user.email.toLowerCase() === "will050710@gmail.com"
  );

  const dropStyle = {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    width: 310, maxHeight: "82vh", overflowY: "auto",
    background: "rgba(15, 23, 42, 0.95)", borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.15)", zIndex: 1000,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(16px)",
  };

  function ProfileDropdown() {
    if (!ready) return (
      <div style={dropStyle}>
        <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 13 }}>Đang tải…</div>
      </div>
    );

    if (!user) return (
      <div style={dropStyle}>
        <div style={{ padding: "20px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#38bdf8", marginBottom: 4 }}>Chưa đăng nhập</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>Đăng nhập để lưu tiến độ học tập</div>
          <Link href="/login" onClick={() => setShowProfile(false)}>
            <div style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white", borderRadius: 8, padding: "10px 0", textAlign: "center", fontWeight: 600, fontSize: 13, marginBottom: 10, cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }}>
              Đăng nhập
            </div>
          </Link>
          <Link href="/signup" onClick={() => setShowProfile(false)}>
            <div style={{ border: "1.5px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 8, padding: "9px 0", textAlign: "center", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#38bdf8"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}>
              Tạo tài khoản miễn phí
            </div>
          </Link>
        </div>
      </div>
    );

    return (
      <div style={dropStyle}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <UserAvatar user={user} size={38} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{user.username}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{user.email}</div>
          </div>
        </div>

        {/* Personal info */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Thông tin cá nhân</div>
          {[["📱", "Điện thoại", user.phone || "—"], ["🏫", "Trường", user.school || "—"], ["📚", "Lớp", user.grade || "—"]].map(([ic, lb, val]) => (
            <div key={lb} style={{ display: "flex", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 5, alignItems: "center" }}>
              <span>{ic}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", minWidth: 60 }}>{lb}:</span>
              <span style={{ fontWeight: 500 }}>{val}</span>
            </div>
          ))}
          <button
            onClick={() => {
              setShowEditModal(true);
              setShowProfile(false);
            }}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "7px 0",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            ✏️ Chỉnh sửa thông tin
          </button>
        </div>

        {/* Stats */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Thống kê học tập</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[["📝", "Bài test", totalTests], ["🎮", "Lượt game", totalGames],
            ["📊", "TB test", avgTest != null ? `${avgTest}%` : "—"], ["⭐", "TB game", avgGame != null ? `${avgGame}%` : "—"]].map(([ic, lb, val]) => (
              <div key={lb} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 9px" }}>
                <div style={{ fontSize: 14 }}>{ic}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Stats */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>🏆 Đấu Hạng & Cạnh Tranh</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[
              ["⭐", "XP", competitiveStats.xp || 0],
              ["🔥", "Streak hiện tại", `${competitiveStats.current_streak || 0} ngày`],
              ["🎯", "Streak dài nhất", `${competitiveStats.longest_streak || 0} ngày`],
              ["🥇", "Xếp hạng toàn cầu", `#${competitiveStats.global_rank || 0}`],
            ].map(([ic, lb, val]) => (
              <div key={lb} style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.1)", borderRadius: 8, padding: "7px 9px" }}>
                <div style={{ fontSize: 14 }}>{ic}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#c084fc", lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>

        {isUserAdmin && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Link href="/admin" onClick={() => setShowProfile(false)} style={{ textDecoration: "none" }}>
              <div style={{
                width: "100%", padding: "9px 0",
                background: "rgba(167, 139, 250, 0.12)",
                color: "#c084fc",
                border: "1px solid rgba(167, 139, 250, 0.3)",
                borderRadius: 8, textAlign: "center", fontWeight: 700, fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 0 10px rgba(167,139,250,0.15)"
              }}>
                🛡️ Admin Panel
              </div>
            </Link>
          </div>
        )}

        {recentActivity.length > 0 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hoạt động gần đây</div>
            {recentActivity.map((line, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginBottom: 4, padding: "3px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                {line}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "12px 16px" }}>
          <button onClick={handleSignOut}
            style={{ width: "100%", padding: "9px 0", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: "📖",
      title: "Bilingual Lessons",
      titleVi: "Học Toán Song Ngữ",
      desc: "Trực quan hóa lý thuyết toán học THPT với hệ thống chương mục từ I đến X. Giao diện mượt mà hỗ trợ chuyển đổi tức thì giữa ngôn ngữ Tiếng Việt và Tiếng Anh để tăng vốn từ vựng chuyên ngành.",
      link: "/Cacbaitoan",
      cta: "Vào học ngay",
      color: "rgba(14, 165, 233, 0.15)",
      glowColor: "rgba(14, 165, 233, 0.45)",
      badge: "Chương I - X",
    },
    {
      icon: "🤖",
      title: "DuoMCB AI Assistant",
      titleVi: "Trợ Lý Giải Toán AI",
      desc: "Chatbot AI hỗ trợ đắc lực trong học tập song ngữ. Giải đáp các bài toán từ cơ bản tới nâng cao với từng bước gợi ý tư duy, giải chi tiết và tính năng nhận diện đề bài bằng hình ảnh cực nhạy.",
      link: "/DuoMCB",
      cta: "Trò chuyện ngay",
      color: "rgba(99, 102, 241, 0.15)",
      glowColor: "rgba(99, 102, 241, 0.45)",
      badge: "Học tập 24/7",
    },
    {
      icon: "🔍",
      title: "DuoTranslator",
      titleVi: "Tra Từ Vựng Toán Học",
      desc: "Tính năng tích hợp ngay trong trang bài học. Chỉ cần bôi đen thuật ngữ tiếng Anh, bảng tra cứu thông minh sẽ tự động hiện định nghĩa toán học tiếng Việt, phiên âm IPA chuẩn xác kèm ví dụ.",
      link: "/Cacbaitoan",
      cta: "Khám phá bài học",
      color: "rgba(16, 185, 129, 0.15)",
      glowColor: "rgba(16, 185, 129, 0.45)",
      badge: "Tra từ thông minh",
    },
    {
      icon: "🎮",
      title: "Interactive Mini Games",
      titleVi: "Trò Chơi Toán Học",
      desc: "Luyện tập không nhàm chán với 3 thể loại mini-games ở cuối mỗi bài học: Trắc nghiệm (Multiple Choice), Đúng/Sai (True/False) và Điền từ thích hợp. Tự động thống kê kết quả học tập chi tiết.",
      link: "/Cacbaitoan",
      cta: "Chơi & ôn luyện",
      color: "rgba(167, 139, 250, 0.15)",
      glowColor: "rgba(167, 139, 250, 0.45)",
      badge: "3 Thể Loại Game",
    },
    {
      icon: "📝",
      title: "Bilingual Exams",
      titleVi: "Đề Thi Thử Song Ngữ",
      desc: "Trải nghiệm cấu trúc bài kiểm tra song ngữ chuẩn hóa (phối hợp các định dạng SAT Reading, IELTS True/False/Not Given và Tự luận toán) trong thời gian 60 phút có hệ thống tự động lưu kết quả.",
      link: "/cacbailam",
      cta: "Luyện thi thử",
      color: "rgba(244, 63, 94, 0.15)",
      glowColor: "rgba(244, 63, 94, 0.45)",
      badge: "SAT & IELTS Math",
    },
    {
      icon: "⚔️",
      title: "Math Ranking Match",
      titleVi: "Đấu Hạng Toán Học (MRM)",
      desc: "Chế độ chơi Multiplayer thời gian thực kịch tính. Bạn sẽ được ghép trận với đối thủ để so tài tốc độ và độ chính xác (Speed-First tiebreaker) thông qua các MathMap phong phú từ cộng đồng.",
      link: "/mrm",
      cta: "Tham gia đấu ngay",
      color: "rgba(234, 179, 8, 0.15)",
      glowColor: "rgba(234, 179, 8, 0.45)",
      badge: "Realtime Multiplayer",
    },
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#050512", position: "relative", overflow: "hidden", color: "white" }}>
      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}

      {/* ═══════ GEOMETRIC FLOATING SHAPES BACKGROUND ═══════ */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Ambient glow layers */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 15% 35%, rgba(6,182,212,0.06) 0%, transparent 65%), radial-gradient(ellipse 60% 60% at 85% 70%, rgba(124,58,237,0.07) 0%, transparent 65%)",
        }} />
        {mathSymbols.map((s) => (
          <div
            key={s.id}
            className="floating-math-symbol"
            style={{
              position: "absolute",
              left: s.left,
              bottom: "-100px",
              fontSize: s.size,
              color: s.id % 3 === 0 ? "rgba(6,182,212,0.18)" : s.id % 3 === 1 ? "rgba(124,58,237,0.14)" : "rgba(56,189,248,0.12)",
              textShadow: s.id % 3 === 0
                ? "0 0 18px rgba(6,182,212,0.5), 0 0 6px rgba(6,182,212,0.3)"
                : s.id % 3 === 1
                ? "0 0 18px rgba(124,58,237,0.5), 0 0 6px rgba(124,58,237,0.3)"
                : "0 0 14px rgba(56,189,248,0.4)",
              animationDelay: s.delay,
              animationDuration: s.dur,
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: "bold",
            }}
          >
            {s.char}
          </div>
        ))}
        {/* SVG Geometric shapes - teal/purple palette */}
        {[
          { w: 160, l: "4%",  t: "10%",  c: "#06b6d4", d: "0s",   dur: "22s", pts: "50,4 96,75 4,75" },
          { w: 100, l: "82%", t: "5%",   c: "#8b5cf6", d: "4s",   dur: "26s", rect: true },
          { w: 80,  l: "60%", t: "63%",  c: "#38bdf8", d: "2s",   dur: "18s", diamond: true },
          { w: 120, l: "14%", t: "73%",  c: "#a78bfa", d: "7s",   dur: "24s", pts: "50,4 96,75 4,75" },
          { w: 65,  l: "90%", t: "50%",  c: "#22d3ee", d: "1s",   dur: "15s", rect: true },
          { w: 95,  l: "44%", t: "19%",  c: "#c4b5fd", d: "9s",   dur: "30s", diamond: true },
          { w: 55,  l: "73%", t: "83%",  c: "#0891b2", d: "3.5s", dur: "20s", pts: "50,4 96,75 4,75" },
          { w: 135, l: "27%", t: "44%",  c: "#7c3aed", d: "6s",   dur: "27s", diamond: true },
        ].map((s, i) => (
          <svg key={i} viewBox="0 0 100 100" style={{
            position: "absolute", left: s.l, top: s.t,
            width: s.w, height: s.w,
            opacity: 0.09 + (i % 3) * 0.03,
            filter: `drop-shadow(0 0 18px ${s.c}99) drop-shadow(0 0 5px ${s.c}55)`,
            animation: `floatShape ${s.dur} ${s.d} ease-in-out infinite alternate`,
          }}>
            {s.rect
              ? <rect x="12" y="12" width="76" height="76" rx="6" stroke={s.c} strokeWidth="1.5" fill={s.c + "15"} />
              : s.diamond
              ? <polygon points="50,4 96,50 50,96 4,50" stroke={s.c} strokeWidth="1.5" fill={s.c + "15"} />
              : <polygon points={s.pts} stroke={s.c} strokeWidth="1.5" fill={s.c + "15"} />
            }
          </svg>
        ))}
      </div>

      {/* ═══════ HEADER / NAVBAR ═══════ */}
      <header className="reveal" data-reveal
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 300,
          background: "rgba(10, 10, 26, 0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)"
        }}>
        <div style={{ width: "1200px", maxWidth: "95%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
          
          {/* Logo & Owl Mascot */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/images/duosteamicon.png" alt="DuoMath" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6, animation: "bounceMascot 4s ease-in-out infinite" }} onError={(e) => { e.currentTarget.src = "/images/duosteamicon.svg"; }} />
            <span style={{ fontWeight: 900, fontSize: 20, color: "white", letterSpacing: 1.5, background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              DUOMATH
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 14.5 }}>
            <Link href="/Cacbaitoan" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)", padding: "8px 12px", borderRadius: 8, transition: "all 0.2s", fontWeight: 600 }}
              className="nav-link-item">
              Bài học
            </Link>

            <Link href="/DuoMCB" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)", padding: "8px 12px", borderRadius: 8, transition: "all 0.2s", fontWeight: 600 }}
              className="nav-link-item">
              AI Chatbot
            </Link>

            <Link href="/cacbailam" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)", padding: "8px 12px", borderRadius: 8, transition: "all 0.2s", fontWeight: 600 }}
              className="nav-link-item">
              Đề thi thử
            </Link>

            <Link href="/mrm" style={{ textDecoration: "none" }}>
              <button className="nav-mrm-btn" style={{
                color: "white",
                padding: "8px 16px", borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                border: "none", fontSize: 13.5, cursor: "pointer",
                fontWeight: 700, display: "flex", alignItems: "center",
                gap: 6, transition: "all 0.25s",
                boxShadow: "0 0 15px rgba(99,102,241,0.3)"
              }}>
                🎮 MRM Đấu Hạng
              </button>
            </Link>

            {ready && !user && (
              <Link href="/login">
                <button style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                  Đăng nhập
                </button>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div data-profile-root style={{ position: "relative" }}>
              <button onClick={() => setShowProfile(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", alignItems: "center" }}
                title={user ? user.username : "Tài khoản"}>
                {user ? (
                  <UserAvatar user={user} size={34} />
                ) : (
                  <UserAvatar user={{ username: "?" }} size={34} />
                )}
              </button>
              {showProfile && <ProfileDropdown />}
            </div>

          </nav>
        </div>
      </header>

      {/* ═══════ CONTENT MAIN ═══════ */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1, paddingBottom: 60 }}>
        <div style={{ width: "1200px", maxWidth: "95%", color: "white" }}>

          {/* ═══════ HERO SECTION ═══════ */}
          <div className="reveal" data-reveal
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, paddingTop: 40, paddingBottom: 50, flexWrap: "wrap" }}>
            
            {/* Mascot Animation Block */}
            <div style={{ flex: "1 1 420px", display: "flex", justifyContent: "center", position: "relative" }}>
              <div className="mascot-container" style={{
                position: "relative",
                width: "380px",
                height: "380px",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img src="/images/duosteamicon.png" alt="DuoMath mascot" style={{ width: "240px", maxWidth: "90%", filter: "drop-shadow(0 8px 30px rgba(99,102,241,0.35))", animation: "floatMascot 6s ease-in-out infinite" }} onError={(e) => { e.currentTarget.src = "/images/duosteamicon.svg"; }} />
                <div style={{ position: "absolute", bottom: "10%", background: "rgba(15,23,42,0.6)", padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", fontSize: 13, color: "#a78bfa", fontWeight: 700, letterSpacing: 0.5, boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                  💡 Fun Math Learn
                </div>
              </div>
            </div>

            {/* Intro text */}
            <div style={{ flex: "1 1 520px" }}>
              <div className="reveal" data-reveal data-reveal-stagger data-stagger="80"
                style={{
                  padding: "36px",
                  borderRadius: 20,
                  background: "rgba(15,23,42,0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.05)"
                }}>
                <div style={{ display: "inline-block", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 30, padding: "4px 14px", fontSize: 12, fontWeight: 800, color: "#38bdf8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
                  Bilingual Math Platform
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 12, lineHeight: 1.1, background: "linear-gradient(135deg, #ffffff 60%, #93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {user ? `Chào bạn, ${user.username}! 👋` : "Chào mừng tới DUOMATH!"}
                </h1>
                <p style={{ color: "#bae6fd", fontSize: 20, lineHeight: 1.5, fontWeight: 500, marginBottom: 16 }}>
                  Khơi mở tư duy, làm chủ toán học THPT với <strong>giáo trình song ngữ Anh - Việt</strong> tiên tiến!
                </p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15.5, lineHeight: 1.65, marginBottom: 26 }}>
                  Chúng tôi tin rằng tương lai của <strong>STEM</strong> gắn liền với <strong>năng lực song ngữ</strong>. DuoMath mang tới trải nghiệm học tập đỉnh cao kết hợp bài học chuẩn hóa, AI chatbot thông minh và đấu hạng thời gian thực.
                </p>
                
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/Cacbaitoan" style={{ textDecoration: "none" }}>
                    <button className="primary-hero-btn" style={{ padding: "14px 28px", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", transition: "all 0.25s" }}>
                      Bắt đầu học ngay 🚀
                    </button>
                  </Link>
                  {ready && !user && (
                    <Link href="/signup" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "14px 28px", background: "rgba(255,255,255,0.06)", color: "white", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.2)", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                        Đăng ký miễn phí
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ FEATURE GRID (Google Antigravity style) ═══════ */}
          <div className="reveal" data-reveal style={{ marginTop: 80, marginBottom: 60 }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: 0.5 }}>
                Các Tính Năng Cốt Lõi
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
                Khám phá hệ sinh thái học tập toàn diện giúp cải thiện kỹ năng giải toán tiếng Anh lẫn tiếng Việt
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feature-card"
                  style={{
                    background: "rgba(15, 23, 42, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 16,
                    padding: 28,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(f.link)}
                >
                  {/* Subtle card glow overlay */}
                  <div className="card-glow" style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    background: `radial-gradient(circle at 10% 10%, ${f.glowColor} 0%, rgba(0,0,0,0) 60%)`,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                  }} />

                  <div>
                    {/* Top Row: Icon and Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div style={{
                        fontSize: 28,
                        width: 54,
                        height: 54,
                        borderRadius: 12,
                        background: f.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        {f.icon}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#a78bfa", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 20, padding: "3px 10px", letterSpacing: 0.5, textTransform: "uppercase" }}>
                        {f.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 }}>
                      {f.title}
                    </h3>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 10 }}>
                      {f.titleVi}
                    </div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24 }}>
                      {f.desc}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13.5, color: "#38bdf8" }}>
                    <span>{f.cta}</span>
                    <span style={{ transition: "transform 0.2s" }} className="arrow-icon">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ TESTS SECTION ═══════ */}
          <div className="reveal" data-reveal style={{ marginTop: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 900 }}>Đề Kiểm Tra Mới Nhất</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14.5 }}>Hệ thống đề thi song ngữ SAT & IELTS tự luyện</p>
              </div>
              <Link href="/cacbailam" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none", fontSize: 14.5 }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                Xem tất cả ›
              </Link>
            </div>

            <div className="reveal" data-reveal data-reveal-stagger data-stagger="100"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 28,
                padding: "28px",
                borderRadius: 20,
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
              }}>
              {[
                { href: "/L10-test1-section1", key: "reading-test-1", label: "Test 1", grade: "Lớp 10", img: "/images/math10.png" },
                { href: "/L10-test2-section1", key: "reading-test-2", label: "Test 2", grade: "Lớp 10", img: "/images/math10.png" },
                { href: null, key: null, label: "Test 1", grade: "Lớp 11 (Coming soon)", img: "/images/math11.png", disabled: true },
                { href: null, key: null, label: "Test 1", grade: "Lớp 12 (Coming soon)", img: "/images/math12.png", disabled: true },
              ].map((t, i) => {
                const myScores = t.key ? Object.entries(bestScores).filter(([k]) => k.startsWith(t.key)) : [];
                const scoreBadge = myScores.length > 0
                  ? `🏅 Điểm cao nhất: ${myScores.map(([, r]) => `${r.score}/${r.total}`).join(", ")}`
                  : null;
                const card = (
                  <article key={i} className="test-card" style={{
                    transition: "all 0.3s ease",
                    borderRadius: 12,
                    overflow: "hidden",
                    opacity: t.disabled ? 0.45 : 1,
                  }}>
                    <div style={{ overflow: "hidden", borderRadius: 10, height: 180, marginBottom: 14 }}>
                      <img src={t.img} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} className="test-card-image" />
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "white", marginBottom: 3 }}>{t.label}</div>
                    <div style={{ color: "#38bdf8", fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{t.grade}</div>
                    <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>15 câu hỏi • Bấm giờ 60 phút</div>
                    {scoreBadge && (
                      <div style={{ marginTop: 4, fontSize: 11, color: "#38bdf8", fontWeight: 700, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                        {scoreBadge}
                      </div>
                    )}
                  </article>
                );
                return t.href
                  ? <Link key={i} href={t.href} style={{ textDecoration: "none", color: "inherit" }} onClick={() => t.key && clearTestSession(t.key)}>{card}</Link>
                  : card;
              })}
            </div>
          </div>

          {/* ═══════ BRANDING FOOTER ═══════ */}
          <div className="reveal" data-reveal style={{ marginTop: 80 }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 40,
              padding: "40px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(12px)",
              flexWrap: "wrap",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
            }}>
              {/* Left branding */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src="/images/duosteamicon.png" alt="DuoMath" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8 }} onError={(e) => { e.currentTarget.src = "/images/duosteamicon.svg"; }} />
                  <span style={{ fontWeight: 900, fontSize: 20, color: "white", letterSpacing: 0.5 }}>DUOMATH</span>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                  Học toán song ngữ cho học sinh chuyên STEM
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  © 2026 DuoMath. Mọi quyền được bảo lưu.
                </span>
              </div>

              <div style={{ width: 1, background: "rgba(255,255,255,0.1)", alignSelf: "stretch", minHeight: 80 }} className="footer-divider" />

              {/* Right contacts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 260 }}>
                {[
                  { icon: "📍", label: "Địa chỉ", value: "Thpt Nguyễn Chí Thanh, TP Hồ Chí Minh" },
                  { icon: "📧", label: "Gmail", value: "will050710@gmail.com", href: "mailto:will050710@gmail.com" },
                  { icon: "☎️", label: "Hotline", value: "+84 336 290 219", href: "tel:+84336290219" },
                ].map(({ icon, label, value, href }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "#38bdf8", width: 68, flexShrink: 0 }}>{label}</span>
                    {href
                      ? <a href={href} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", textDecoration: "none", transition: "color 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"}
                          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}>{value}</a>
                      : <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)" }}>{value}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global CSS enhancements */}
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .reveal[data-reveal-stagger].visible {
          opacity: 1;
          transform: none;
        }
        .reveal[data-reveal-stagger] > * {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          will-change: opacity, transform;
        }
        header.reveal {
          transform: translateY(-12px);
          opacity: 0;
        }
        header.reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Floating math symbols in background */
        .floating-math-symbol {
          pointer-events: none;
          opacity: 0;
          animation: floatUp 25s linear infinite;
        }
        
        @keyframes floatUp {
          0% {
            transform: translateY(105vh) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 0.15;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-15vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        /* Mascot gentle float */
        @keyframes floatMascot {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        /* Mascot light bounce */
        @keyframes bounceMascot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        /* Nav link hover effects */
        .nav-link-item:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.08);
        }
        
        /* Premium button hover states */
        .nav-mrm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(99,102,241,0.5) !important;
        }
        .primary-hero-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(99,102,241,0.5) !important;
        }
        
        /* Antigravity grid card styling */
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(99, 102, 241, 0.3) !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.12);
        }
        .feature-card:hover .card-glow {
          opacity: 0.7 !important;
        }
        .feature-card:hover .arrow-icon {
          transform: translateX(4px);
        }
        
        /* Test card image zoom */
        .test-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(56, 189, 248, 0.15);
        }
        .test-card:hover .test-card-image {
          transform: scale(1.05);
        }
        
        /* Responsive tweaks */
        @media (max-width: 768px) {
          .mascot-container {
            width: 280px !important;
            height: 280px !important;
          }
          .mascot-container img {
            width: 180px !important;
          }
          .footer-divider {
            display: none !important;
          }
        }
      `}</style>
      <DuoMCBSidebar />
    </div>
  );
}
