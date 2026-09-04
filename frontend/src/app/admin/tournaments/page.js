"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:5000");

const PANEL_STYLE = {
  background: "linear-gradient(135deg, rgba(2,8,24,0.92) 0%, rgba(4,12,36,0.88) 100%)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 18,
  boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const STATUS_COLORS = {
  upcoming: "#fbbf24",
  active: "#34d399",
  finished: "rgba(255,255,255,0.3)",
  pending_approval: "#f97316",
};

const STATUS_LABELS = {
  upcoming: "Sắp diễn ra",
  active: "Đang diễn ra",
  finished: "Đã kết thúc",
  pending_approval: "Chờ duyệt",
};

const STUB_TOURNAMENTS = [
  { id: "tourney_summer_2026", title: "Giải Đấu Toán Học Mùa Hè 2026", tag: "GIẢI ĐẤU MÙA", status: "upcoming", size: "large", xp_multiplier: 1.5, starts_at: "2026-08-28T00:00:00", ends_at: "2026-09-10T23:59:59", play_mode: "individual", pending_approval: 0, created_by: "admin" },
];

export default function AdminTournamentsPage() {
  const { user, token } = useAuth?.() || {};
  const router = useRouter();
  const [tournaments, setTournaments] = useState(STUB_TOURNAMENTS);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", tag: "Giải đấu", description: "", size: "small",
    play_mode: "individual", starts_at: "", ends_at: "",
    min_clan_members: 2, is_featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${BASE}/api/tournaments${filterStatus ? `?status=${filterStatus}` : ""}`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        if (d.tournaments?.length > 0) setTournaments(d.tournaments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, filterStatus]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/tournaments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...form, is_featured: form.is_featured ? 1 : 0 }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowCreate(false);
        router.push(`/admin/tournaments/${data.id}`);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xoá giải đấu này?")) return;
    await fetch(`${BASE}/api/tournaments/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setTournaments(t => t.filter(x => x.id !== id));
  };

  const handleApprove = async (id) => {
    await fetch(`${BASE}/api/tournaments/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    setTournaments(t => t.map(x => x.id === id ? { ...x, pending_approval: 0, status: "upcoming" } : x));
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "rgba(2,6,23,0.7)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "white", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 1, color: "rgba(255,255,255,0.45)", marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #0c1a2e 100%)",
      paddingBottom: 80, paddingTop: 24,
      paddingLeft: "clamp(16px, 4vw, 40px)",
      paddingRight: "clamp(16px, 4vw, 40px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          <Link href="/admin" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>⚙ Admin</Link>
          <span>/</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Quản Lý Giải Đấu</span>
        </nav>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, margin: 0,
              background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              🏆 Quản Lý Giải Đấu
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              Tạo, chỉnh sửa giải đấu và phân quyền ban tổ chức sự kiện
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "11px 22px",
              background: "linear-gradient(135deg, #ec4899, #a78bfa)",
              border: "none", borderRadius: 12,
              color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(236,72,153,0.35)",
            }}
          >
            ✨ Tạo Giải Đấu Mới
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["", "upcoming", "active", "finished", "pending_approval"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8,
              background: filterStatus === s ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
              color: filterStatus === s ? "#a5b4fc" : "rgba(255,255,255,0.45)",
              border: filterStatus === s ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.2s",
            }}>
              {s === "" ? "Tất cả" : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>

        {/* Tournament List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tournaments.map(t => (
            <div key={t.id} style={{
              ...PANEL_STYLE,
              padding: "18px 24px",
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16,
            }}>
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: STATUS_COLORS[t.status] || "rgba(255,255,255,0.3)",
                boxShadow: `0 0 8px ${STATUS_COLORS[t.status] || "transparent"}`,
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: "white" }}>{t.title}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: 100,
                    background: t.size === "large" ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)",
                    color: t.size === "large" ? "#f87171" : "#34d399",
                    border: `1px solid ${t.size === "large" ? "rgba(239,68,68,0.3)" : "rgba(52,211,153,0.3)"}`,
                    letterSpacing: 0.5,
                  }}>
                    {t.size === "large" ? "🔥 Giải Lớn" : "⚡ Giải Nhỏ"}
                  </span>
                  {t.pending_approval ? (
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100,
                      background: "rgba(249,115,22,0.12)", color: "#f97316",
                      border: "1px solid rgba(249,115,22,0.3)",
                    }}>
                      ⏳ Chờ duyệt
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 5, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#fbbf24" }}>
                    ⚡ {t.xp_multiplier}x XP
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {t.play_mode === "individual" ? "👤 Cá nhân" : `🛡 Clan (${t.min_clan_members}+)`}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.38)", display: "block" }}>
                  {t.starts_at?.slice(0, 10)} → {t.ends_at?.slice(0, 10)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {t.pending_approval ? (
                  <button onClick={() => handleApprove(t.id)} style={{
                    padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #34d399, #0ea5e9)",
                    color: "white", fontWeight: 800, fontSize: 11,
                  }}>
                    ✓ Phê duyệt
                  </button>
                ) : null}
                <Link href={`/admin/tournaments/${t.id}`}>
                  <button style={{
                    padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.75)", fontWeight: 700, fontSize: 11,
                  }}>
                    ✏ Quản lý
                  </button>
                </Link>
                <button onClick={() => handleDelete(t.id)} style={{
                  padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171", fontWeight: 700, fontSize: 11,
                }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
          {tournaments.length === 0 && !loading && (
            <div style={{
              ...PANEL_STYLE, padding: "48px 24px", textAlign: "center",
              color: "rgba(255,255,255,0.35)", fontSize: 14,
            }}>
              Chưa có giải đấu nào. Tạo giải đấu đầu tiên!
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}>
            <div style={{
              ...PANEL_STYLE,
              width: "100%", maxWidth: 560, padding: 32,
              maxHeight: "90vh", overflowY: "auto",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontWeight: 900, color: "white", fontSize: 20 }}>Tạo Giải Đấu Mới</h2>
                <button onClick={() => setShowCreate(false)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.5)",
                  fontSize: 22, cursor: "pointer", lineHeight: 1,
                }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Title */}
                <div>
                  <label style={labelStyle}>Tên giải đấu</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="VD: Giải Đấu Toán Học Mùa Thu 2026"
                    style={inputStyle}
                  />
                </div>
                {/* Tag */}
                <div>
                  <label style={labelStyle}>Nhãn hiển thị</label>
                  <input
                    value={form.tag}
                    onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                    placeholder="VD: GIẢI ĐẤU MÙA"
                    style={inputStyle}
                  />
                </div>
                {/* Description */}
                <div>
                  <label style={labelStyle}>Mô tả ngắn</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {/* Size + Play mode row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Loại giải</label>
                    <select
                      value={form.size}
                      onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                      style={{ ...inputStyle }}
                    >
                      <option value="small">⚡ Giải Nhỏ (1.2x XP)</option>
                      <option value="large">🔥 Giải Lớn (1.5x XP — cần admin duyệt)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Chế độ thi đấu</label>
                    <select
                      value={form.play_mode}
                      onChange={e => setForm(f => ({ ...f, play_mode: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="individual">👤 Cá nhân</option>
                      <option value="clan">🛡 Clan</option>
                    </select>
                  </div>
                </div>

                {form.play_mode === "clan" && (
                  <div>
                    <label style={labelStyle}>Số đại diện tối thiểu mỗi Clan</label>
                    <input
                      type="number" min={2} max={5}
                      value={form.min_clan_members}
                      onChange={e => setForm(f => ({ ...f, min_clan_members: Number(e.target.value) }))}
                      style={inputStyle}
                    />
                  </div>
                )}

                {/* Dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Kết thúc</label>
                    <input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Featured toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="checkbox"
                    id="featuredChk"
                    checked={form.is_featured}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  />
                  <label htmlFor="featuredChk" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    ⭐ Giải đấu nổi bật (hiện trên trang Events)
                  </label>
                </div>

                {form.size === "large" && (
                  <div style={{
                    padding: "12px 16px", borderRadius: 10,
                    background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
                    fontSize: 12, color: "#fdba74", lineHeight: 1.6,
                  }}>
                    ⚠️ <strong>Giải lớn</strong> cần admin phê duyệt trước khi hiển thị công khai.
                    Giải sẽ ở trạng thái "Chờ duyệt" sau khi tạo.
                  </div>
                )}

                {/* Submit */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={handleCreate}
                    disabled={saving || !form.title || !form.starts_at || !form.ends_at}
                    style={{
                      flex: 1, padding: "12px",
                      background: saving ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #ec4899, #a78bfa)",
                      border: "none", borderRadius: 12,
                      color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
                      opacity: (!form.title || !form.starts_at || !form.ends_at) ? 0.5 : 1,
                    }}
                  >
                    {saving ? "Đang tạo..." : "✨ Tạo giải đấu"}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12, color: "rgba(255,255,255,0.6)",
                      fontWeight: 700, fontSize: 14, cursor: "pointer",
                    }}
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
