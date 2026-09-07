"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

const PRESET_CRESTS = [
  { id: "p1", gradient: "linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #06b6d4 100%)", label: "Neon" },
  { id: "p2", gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)", label: "Lửa" },
  { id: "p3", gradient: "linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #06b6d4 100%)", label: "Ngọc" },
  { id: "p4", gradient: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #4f46e5 100%)", label: "Biển" },
  { id: "p5", gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #ec4899 100%)", label: "Vũ Trụ" },
  { id: "p6", gradient: "linear-gradient(135deg, #ef4444 0%, #e11d48 50%, #f59e0b 100%)", label: "Huyết" },
];

const PRESET_BANNERS = [
  "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
  "linear-gradient(135deg, #042f2e 0%, #0c4a6e 50%, #172554 100%)",
  "linear-gradient(135deg, #450a0a 0%, #701a75 50%, #1e1b4b 100%)",
];

const panelStyle = {
  background: "linear-gradient(135deg, rgba(2,8,24,0.92) 0%, rgba(4,12,36,0.88) 100%)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: "clamp(24px, 5vw, 40px)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "rgba(255,255,255,0.5)",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(2,6,23,0.7)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "white",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function ClanCreateForm({ onSubmit = () => {} }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCrest, setSelectedCrest] = useState(PRESET_CRESTS[0]);
  
  // Custom Avatar & Banner
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarMode, setAvatarMode] = useState("preset"); // 'preset' | 'upload'
  const [bannerMode, setBannerMode] = useState("preset"); // 'preset' | 'upload'
  const [selectedBannerGrad, setSelectedBannerGrad] = useState(PRESET_BANNERS[0]);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [privacy, setPrivacy] = useState("open"); // open | invite_only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [submitHover, setSubmitHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ảnh đại diện không được vượt quá 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError("Ảnh bìa không được vượt quá 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 3) {
      setError("Tên Clan phải có ít nhất 3 ký tự.");
      return;
    }

    if (!tag.trim() || tag.trim().length < 2 || tag.trim().length > 5) {
      setError("Mã thẻ Clan (#TAG) phải từ 2 đến 5 ký tự viết tắt.");
      return;
    }

    setLoading(true);

    const formattedTag = tag.startsWith("#") ? tag.toUpperCase() : `#${tag.toUpperCase()}`;
    const chosenAvatar = avatarMode === "upload" && avatarUrl ? avatarUrl : "";
    const chosenBanner = bannerMode === "upload" && bannerUrl ? bannerUrl : selectedBannerGrad;

    try {
      const hdrs = { "Content-Type": "application/json" };
      const cu = auth?.currentUser;
      if (cu) {
        try { hdrs["Authorization"] = `Bearer ${await cu.getIdToken(true)}`; } catch (_) {}
      }

      const res = await fetch(`${BASE}/api/clans`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({
          name: name.trim(),
          tag: formattedTag,
          description: description.trim() || "Chào mừng bạn đến với Clan của chúng mình!",
          crest_gradient: selectedCrest.gradient,
          avatar_url: chosenAvatar,
          banner_url: chosenBanner,
          privacy,
        }),
      });

      const data = await res.json().catch(() => ({}));

      const createdClan = {
        id: data.clan_id || "clan_" + Date.now(),
        name: name.trim(),
        tag: formattedTag,
        description: description.trim() || "Chào mừng bạn đến với Clan của chúng mình!",
        crestGradient: selectedCrest.gradient,
        avatar_url: chosenAvatar,
        banner_url: chosenBanner,
        privacy,
        level: 1,
        memberCount: 1,
        totalXP: "0 XP",
        record: "0-0",
      };

      onSubmit(createdClan);
      router.push(`/clans`);
    } catch (_) {
      // Optimistic fallback
      router.push(`/clans`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 style={{
          fontSize: "clamp(22px, 4vw, 28px)",
          fontWeight: 900,
          color: "white",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          <span>🏰</span>
          <span>Thành Lập Math Clan</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
          Tự do chọn biểu tượng, tải lên ảnh bìa, thiết lập đội ngũ và leo bảng xếp hạng toàn quốc.
        </p>
      </div>

      {error && (
        <div style={{
          marginBottom: 24,
          padding: "12px 16px",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12,
          color: "#fca5a5",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Name & Tag */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>
              Tên Clan <span style={{ color: "#f472b6" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Thánh Toán Học, Đội Số Học Bay..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Mã thẻ (#TAG) <span style={{ color: "#f472b6" }}>*</span>
            </label>
            <input
              type="text"
              required
              maxLength={5}
              placeholder="VD: THTH, PI..."
              value={tag}
              onChange={(e) => setTag(e.target.value.replace(/[^a-zA-Z0-9#]/g, ""))}
              style={{ ...inputStyle, fontFamily: "monospace", color: "#22d3ee", textTransform: "uppercase" }}
              onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Mô tả Clan</label>
          <textarea
            rows={3}
            placeholder="Mô tả mục tiêu, lịch sinh hoạt hoặc đối tượng thành viên..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
            onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
          />
        </div>

        {/* ── Clan Avatar / Huy hiệu biểu tượng ── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Huy hiệu / Biểu tượng Clan</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => setAvatarMode("preset")}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: avatarMode === "preset" ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.05)",
                  color: avatarMode === "preset" ? "#22d3ee" : "rgba(255,255,255,0.4)",
                }}
              >
                Mẫu Gradient
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode("upload")}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: avatarMode === "upload" ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)",
                  color: avatarMode === "upload" ? "#f472b6" : "rgba(255,255,255,0.4)",
                }}
              >
                Tải ảnh riêng 🖼️
              </button>
            </div>
          </div>

          {avatarMode === "preset" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 12,
            }}>
              {PRESET_CRESTS.map((c) => {
                const isSelected = selectedCrest.id === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelectedCrest(c)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 10px",
                      borderRadius: 14,
                      cursor: "pointer",
                      background: isSelected ? "rgba(236,72,153,0.14)" : "rgba(2,6,23,0.6)",
                      border: isSelected ? "1.5px solid #ec4899" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isSelected ? "0 0 20px rgba(236,72,153,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: c.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 14,
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {tag.replace("#", "").slice(0, 2) || "CL"}
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: isSelected ? "#f472b6" : "rgba(255,255,255,0.5)",
                    }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px", borderRadius: 14, background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                background: avatarUrl ? "transparent" : "rgba(255,255,255,0.05)",
                border: "1.5px dashed rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 24 }}>🖼️</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  onChange={handleAvatarFile}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
                    border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    marginBottom: 6,
                  }}
                >
                  📁 Chọn file ảnh từ máy
                </button>
                <input
                  type="url"
                  placeholder="Hoặc dán đường link ảnh (URL)..."
                  value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Clan Banner / Ảnh bìa Clan ── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Ảnh Bìa (Banner) Clan</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => setBannerMode("preset")}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: bannerMode === "preset" ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.05)",
                  color: bannerMode === "preset" ? "#22d3ee" : "rgba(255,255,255,0.4)",
                }}
              >
                Mẫu nền tối
              </button>
              <button
                type="button"
                onClick={() => setBannerMode("upload")}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: bannerMode === "upload" ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)",
                  color: bannerMode === "upload" ? "#f472b6" : "rgba(255,255,255,0.4)",
                }}
              >
                Tải ảnh banner riêng 🌌
              </button>
            </div>
          </div>

          {/* Banner Live Preview */}
          <div style={{
            width: "100%", height: 110, borderRadius: 14, overflow: "hidden", position: "relative",
            background: bannerMode === "upload" && bannerUrl ? `url(${bannerUrl}) center/cover no-repeat` : selectedBannerGrad,
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "flex-end", padding: "16px",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: avatarMode === "upload" && avatarUrl ? `url(${avatarUrl}) center/cover` : selectedCrest.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "white", fontSize: 13,
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}>
                {avatarMode === "upload" && avatarUrl ? "" : (tag.replace("#", "").slice(0, 2) || "CL")}
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: 15, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                  {name || "Tên Clan của bạn"}
                </span>
                <span style={{ display: "block", fontSize: 11, fontFamily: "monospace", color: "#22d3ee", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                  {tag.startsWith("#") ? tag.toUpperCase() : (tag ? `#${tag.toUpperCase()}` : "#TAG")}
                </span>
              </div>
            </div>

            {bannerMode === "upload" && (
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerInputRef}
                  onChange={handleBannerFile}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  style={{
                    padding: "6px 12px", borderRadius: 8,
                    background: "rgba(2,6,23,0.8)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  📷 Đổi ảnh bìa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Toggle */}
        <div>
          <label style={labelStyle}>Chế độ gia nhập</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {/* Open */}
            <div
              onClick={() => setPrivacy("open")}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px 18px",
                borderRadius: 14,
                cursor: "pointer",
                background: privacy === "open" ? "rgba(34,211,238,0.1)" : "rgba(2,6,23,0.6)",
                border: privacy === "open" ? "1.5px solid #22d3ee" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: privacy === "open" ? "0 0 20px rgba(34,211,238,0.2)" : "none",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: privacy === "open" ? "5px solid #22d3ee" : "2px solid rgba(255,255,255,0.3)",
                background: "transparent",
                marginTop: 2,
                flexShrink: 0,
                transition: "all 0.2s",
              }} />
              <div>
                <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, color: "white" }}>
                  Công khai (Tự do tham gia)
                </span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, display: "block", marginTop: 3 }}>
                  Bất kỳ học sinh nào cũng có thể gia nhập ngay lập tức.
                </span>
              </div>
            </div>

            {/* Invite only */}
            <div
              onClick={() => setPrivacy("invite_only")}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px 18px",
                borderRadius: 14,
                cursor: "pointer",
                background: privacy === "invite_only" ? "rgba(236,72,153,0.1)" : "rgba(2,6,23,0.6)",
                border: privacy === "invite_only" ? "1.5px solid #ec4899" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: privacy === "invite_only" ? "0 0 20px rgba(236,72,153,0.2)" : "none",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: privacy === "invite_only" ? "5px solid #ec4899" : "2px solid rgba(255,255,255,0.3)",
                background: "transparent",
                marginTop: 2,
                flexShrink: 0,
                transition: "all 0.2s",
              }} />
              <div>
                <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, color: "white" }}>
                  Cần phê duyệt (Lời mời)
                </span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, display: "block", marginTop: 3 }}>
                  Chủ Clan hoặc Phó Clan phải duyệt yêu cầu gia nhập.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: cancelHover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setSubmitHover(true)}
            onMouseLeave={() => setSubmitHover(false)}
            style={{
              padding: "12px 28px",
              borderRadius: 12,
              background: submitHover
                ? "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #8b5cf6 100%)"
                : "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
              border: "none",
              color: "white",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(236,72,153,0.35)",
              transform: submitHover ? "translateY(-1px) scale(1.02)" : "none",
              transition: "all 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Đang tạo..." : "✨ Tạo Clan Mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
