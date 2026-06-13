"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/authContext";

function getInitials(name) {
  const parts = (name || "U").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || "U").slice(0, 2).toUpperCase();
}

export default function EditProfileModal({ onClose }) {
  const { user, updateProfile, uploadAvatar, reloadProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file before processing
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Định dạng file không hỗ trợ. Vui lòng chọn JPG, PNG, GIF hoặc WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ảnh quá lớn (tối đa 5MB). Vui lòng chọn ảnh khác.");
      return;
    }

    // Show a temporary local preview while uploading
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setErrorMsg("");
    setSuccessMsg("");
    setAvatarLoading(true);

    try {
      const { ok, error, url } = await uploadAvatar(file);
      if (ok) {
        // Replace temp objectUrl with the permanent base64 dataUrl
        setAvatarPreview(url || user?.avatar_url || "");
        setSuccessMsg("✅ Ảnh đại diện đã được cập nhật!");
        if (reloadProfile) await reloadProfile();
      } else {
        setErrorMsg(error || "❌ Upload ảnh thất bại. Vui lòng thử lại.");
        setAvatarPreview(user?.avatar_url || "");
      }
    } catch (err) {
      console.error("[handleAvatarChange] error:", err);
      setErrorMsg("❌ Lỗi xử lý ảnh. Vui lòng thử lại.");
      setAvatarPreview(user?.avatar_url || "");
    } finally {
      setAvatarLoading(false);
      URL.revokeObjectURL(objectUrl); // safe to revoke now — we already switched preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!username.trim()) { 
      setErrorMsg("Tên người dùng không được để trống."); 
      return; 
    }
    if (username.trim().length < 2) { 
      setErrorMsg("Tên người dùng phải có ít nhất 2 ký tự."); 
      return; 
    }
    if (phone.trim() && !/^\d{10,}$/.test(phone.trim().replace(/\D/g, ""))) {
      setErrorMsg("Số điện thoại không hợp lệ.");
      return;
    }
    
    setLoading(true);
    try {
      // Add timeout for profile update (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Yêu cầu cập nhật hết thời gian chờ. Vui lòng thử lại.")), 10000)
      );
      
      const { ok, error } = await Promise.race([
        updateProfile({
          username: username.trim(),
          phone: phone.trim(),
          school: school.trim(),
          grade: grade.trim(),
        }),
        timeoutPromise
      ]);
      
      if (ok) {
        setSuccessMsg("✅ Đã lưu thông tin thành công!");
        if (reloadProfile) await reloadProfile();
        setTimeout(() => onClose(), 1400);
      } else {
        setErrorMsg(error || "❌ Đã xảy ra lỗi khi cập nhật thông tin.");
      }
    } catch (err) {
      console.error("[handleSubmit] error:", err);
      const msg = err?.message || String(err);
      if (msg.includes("timeout") || msg.includes("hết thời gian")) {
        setErrorMsg("❌ Kết nối quá lâu. Vui lòng kiểm tra Internet và thử lại.");
      } else if (msg.includes("Network") || msg.includes("network")) {
        setErrorMsg("❌ Lỗi kết nối mạng. Vui lòng kiểm tra Internet.");
      } else {
        setErrorMsg("❌ Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
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

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000,
        backgroundColor: "rgba(10,10,26,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        overflowY: "auto",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 16, width: "100%", maxWidth: 560,
        padding: "28px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(14,165,233,0.15)",
        color: "white",
        margin: "auto",
        maxHeight: "min(90vh, 90dvh)",
        overflowY: "auto",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 id="edit-profile-title" style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#38bdf8" }}>Chỉnh sửa thông tin cá nhân</h3>
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
                alt="Avatar"
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
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#86efac", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
            <span>{successMsg}</span>
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
    </div>,
    document.body
  );
}
