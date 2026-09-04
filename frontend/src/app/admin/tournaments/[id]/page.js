"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authContext";

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

const PRIZE_DEFAULTS = [
  { tier: 1, name: "Quán Quân (Vô Địch)", prize: "5,000 XP + Cúp Vô Địch + Huy hiệu Vàng Độc Quyền" },
  { tier: 2, name: "Á Quân (Hạng Nhì)", prize: "3,000 XP + Huy hiệu Bạc Độc Quyền" },
  { tier: 3, name: "Quý Quân (Hạng Ba)", prize: "1,500 XP + Huy hiệu Đồng Độc Quyền" },
  { tier: 4, name: "Top 10 Chung Cuộc", prize: "800 XP + Khung Avatar Danh Dự" },
];

export default function AdminTournamentDetailPage({ params }) {
  const { id } = use(params);
  const { token } = useAuth?.() || {};

  const [activeTab, setActiveTab] = useState("info"); // info | participants | organizers | results
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [newOrgUserId, setNewOrgUserId] = useState("");
  const [newOrgRole, setNewOrgRole] = useState("organizer");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/tournaments/${id}`, { headers: authHeaders }).then(r => r.json()),
    ]).then(([t]) => {
      setTournament(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === "participants") {
      fetch(`${BASE}/api/tournaments/${id}/participants?limit=100`, { headers: authHeaders })
        .then(r => r.json()).then(d => setParticipants(d.participants || [])).catch(() => {});
    }
    if (activeTab === "organizers") {
      fetch(`${BASE}/api/tournaments/${id}/organizers`, { headers: authHeaders })
        .then(r => r.json()).then(d => setOrganizers(d.organizers || [])).catch(() => {});
    }
  }, [activeTab, id]);

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await fetch(`${BASE}/api/tournaments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          ...tournament,
          prize_json: tournament.prize_json,
        }),
      });
    } finally { setSaving(false); }
  };

  const handleApprove = async () => {
    await fetch(`${BASE}/api/tournaments/${id}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
    });
    setTournament(t => ({ ...t, pending_approval: 0, status: "upcoming" }));
  };

  const handleAssignOrganizer = async () => {
    if (!newOrgUserId) return;
    await fetch(`${BASE}/api/tournaments/${id}/organizers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ user_id: newOrgUserId, role: newOrgRole }),
    });
    setNewOrgUserId("");
    // Refresh
    fetch(`${BASE}/api/tournaments/${id}/organizers`, { headers: authHeaders })
      .then(r => r.json()).then(d => setOrganizers(d.organizers || [])).catch(() => {});
  };

  const handleRemoveOrganizer = async (uid) => {
    await fetch(`${BASE}/api/tournaments/${id}/organizers/${uid}`, { method: "DELETE", headers: authHeaders });
    setOrganizers(o => o.filter(x => x.user_id !== uid));
  };

  const handleKickParticipant = async (uid) => {
    await fetch(`${BASE}/api/tournaments/${id}/register`, { method: "DELETE", headers: { "Content-Type": "application/json", ...authHeaders, } });
    setParticipants(p => p.filter(x => x.user_id !== uid));
  };

  const TABS = [
    { id: "info", label: "📋 Thông tin", },
    { id: "participants", label: "👥 Người đăng ký" },
    { id: "organizers", label: "🛡 Ban tổ chức" },
    { id: "results", label: "🏅 Kết quả" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #0c1a2e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Đang tải...</span>
    </div>
  );

  if (!tournament) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #0c1a2e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#f87171", fontFamily: "monospace" }}>Không tìm thấy giải đấu.</span>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #0c1a2e 100%)",
      paddingBottom: 80, paddingTop: 24,
      paddingLeft: "clamp(16px, 4vw, 40px)",
      paddingRight: "clamp(16px, 4vw, 40px)",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          <Link href="/admin" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>⚙ Admin</Link>
          <span>/</span>
          <Link href="/admin/tournaments" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Giải Đấu</Link>
          <span>/</span>
          <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{tournament.title}</span>
        </nav>

        {/* Tournament Header */}
        <div style={{ ...PANEL_STYLE, padding: "20px 28px", marginBottom: 20, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: "clamp(16px, 4vw, 22px)", color: "white" }}>
              {tournament.title}
            </h1>
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 800, textTransform: "uppercase", padding: "2px 8px", borderRadius: 100,
                background: tournament.size === "large" ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)",
                color: tournament.size === "large" ? "#f87171" : "#34d399",
                border: `1px solid ${tournament.size === "large" ? "rgba(239,68,68,0.3)" : "rgba(52,211,153,0.3)"}`,
              }}>
                {tournament.size === "large" ? "🔥 Giải Lớn" : "⚡ Giải Nhỏ"}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#fbbf24" }}>
                {tournament.xp_multiplier}x XP
              </span>
              {tournament.pending_approval ? (
                <span style={{ fontSize: 11, color: "#f97316", fontWeight: 700 }}>⏳ Chờ duyệt</span>
              ) : null}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {tournament.pending_approval ? (
              <button onClick={handleApprove} style={{
                padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #34d399, #0ea5e9)",
                color: "white", fontWeight: 800, fontSize: 13,
              }}>
                ✓ Phê duyệt giải đấu
              </button>
            ) : null}
            <a href={`/events`} target="_blank" rel="noopener noreferrer">
              <button style={{
                padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13,
              }}>
                🔗 Xem trang Events
              </button>
            </a>
          </div>
        </div>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(2,6,23,0.7)", borderRadius: 12, padding: 5, width: "fit-content" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "rgba(99,102,241,0.25)" : "transparent",
              color: activeTab === tab.id ? "#a5b4fc" : "rgba(255,255,255,0.45)",
              fontWeight: 700, fontSize: 12, transition: "all 0.2s",
              border: activeTab === tab.id ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Info ── */}
        {activeTab === "info" && (
          <div style={{ ...PANEL_STYLE, padding: "28px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Tên giải đấu</label>
                  <input value={tournament.title || ""} onChange={e => setTournament(t => ({ ...t, title: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nhãn hiển thị</label>
                  <input value={tournament.tag || ""} onChange={e => setTournament(t => ({ ...t, tag: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mô tả</label>
                <textarea value={tournament.description || ""} onChange={e => setTournament(t => ({ ...t, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div>
                <label style={labelStyle}>Thể lệ thi đấu</label>
                <textarea value={tournament.rules || ""} onChange={e => setTournament(t => ({ ...t, rules: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Nhập nội dung thể lệ thi đấu..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Trạng thái</label>
                  <select value={tournament.status} onChange={e => setTournament(t => ({ ...t, status: e.target.value }))} style={inputStyle}>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="active">Đang diễn ra</option>
                    <option value="finished">Đã kết thúc</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Loại giải</label>
                  <select value={tournament.size} onChange={e => setTournament(t => ({ ...t, size: e.target.value }))} style={inputStyle}>
                    <option value="small">Giải Nhỏ (1.2x XP)</option>
                    <option value="large">Giải Lớn (1.5x XP)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Chế độ</label>
                  <select value={tournament.play_mode} onChange={e => setTournament(t => ({ ...t, play_mode: e.target.value }))} style={inputStyle}>
                    <option value="individual">Cá nhân</option>
                    <option value="clan">Clan</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Bắt đầu</label>
                  <input type="datetime-local" value={tournament.starts_at?.slice(0, 16) || ""} onChange={e => setTournament(t => ({ ...t, starts_at: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kết thúc</label>
                  <input type="datetime-local" value={tournament.ends_at?.slice(0, 16) || ""} onChange={e => setTournament(t => ({ ...t, ends_at: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Prizes */}
              <div>
                <label style={labelStyle}>Cơ cấu giải thưởng</label>
                {(tournament.prize_json || PRIZE_DEFAULTS).map((p, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr 2fr", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#fbbf24", fontSize: 12, display: "flex", alignItems: "center" }}>
                      #{p.tier}
                    </span>
                    <input
                      value={p.name} onChange={e => {
                        const updated = [...(tournament.prize_json || PRIZE_DEFAULTS)];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setTournament(t => ({ ...t, prize_json: updated }));
                      }}
                      style={{ ...inputStyle }} placeholder="Tên hạng" />
                    <input
                      value={p.prize} onChange={e => {
                        const updated = [...(tournament.prize_json || PRIZE_DEFAULTS)];
                        updated[i] = { ...updated[i], prize: e.target.value };
                        setTournament(t => ({ ...t, prize_json: updated }));
                      }}
                      style={{ ...inputStyle }} placeholder="Phần thưởng" />
                  </div>
                ))}
              </div>

              {/* Featured */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox" id="featuredChk"
                  checked={!!tournament.is_featured}
                  onChange={e => setTournament(t => ({ ...t, is_featured: e.target.checked ? 1 : 0 }))}
                />
                <label htmlFor="featuredChk" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>
                  ⭐ Hiển thị là giải đấu nổi bật trên trang Events
                </label>
              </div>

              <button
                onClick={handleSaveInfo}
                disabled={saving}
                style={{
                  padding: "13px 28px", alignSelf: "flex-start",
                  background: saving ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #6366f1, #a78bfa)",
                  border: "none", borderRadius: 12,
                  color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                }}
              >
                {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Participants ── */}
        {activeTab === "participants" && (
          <div style={{ ...PANEL_STYLE, padding: "24px 28px" }}>
            <h3 style={{ margin: "0 0 16px", color: "white", fontWeight: 800 }}>
              👥 Danh sách đăng ký ({participants.length})
            </h3>
            {participants.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>Chưa có người đăng ký.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {participants.map((p, i) => (
                  <div key={p.user_id} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                  }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.35)", width: 24 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{p.username}</span>
                      <span style={{ marginLeft: 10, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        {p.registered_at?.slice(0, 10)}
                      </span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#fbbf24" }}>
                      {p.score.toLocaleString()} pts
                    </span>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                      background: p.status === "active" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                      color: p.status === "active" ? "#34d399" : "rgba(255,255,255,0.3)",
                    }}>
                      {p.status}
                    </span>
                    <button onClick={() => handleKickParticipant(p.user_id)} style={{
                      padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.08)", color: "#f87171",
                      fontWeight: 700, fontSize: 11, cursor: "pointer",
                    }}>
                      Kick
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Organizers ── */}
        {activeTab === "organizers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...PANEL_STYLE, padding: "24px 28px" }}>
              <h3 style={{ margin: "0 0 16px", color: "white", fontWeight: 800 }}>🛡 Thêm ban tổ chức</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  value={newOrgUserId}
                  onChange={e => setNewOrgUserId(e.target.value)}
                  placeholder="User ID người dùng"
                  style={{ ...inputStyle, flex: 1, minWidth: 180 }}
                />
                <select value={newOrgRole} onChange={e => setNewOrgRole(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                  <option value="organizer">Tổ chức sự kiện</option>
                  <option value="moderator">Giám sát</option>
                </select>
                <button onClick={handleAssignOrganizer} style={{
                  padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #22d3ee, #6366f1)",
                  color: "white", fontWeight: 800, fontSize: 13,
                }}>
                  + Phân quyền
                </button>
              </div>
            </div>

            <div style={{ ...PANEL_STYLE, padding: "24px 28px" }}>
              <h3 style={{ margin: "0 0 16px", color: "white", fontWeight: 800 }}>
                Danh sách ban tổ chức ({organizers.length})
              </h3>
              {organizers.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>Chưa có ban tổ chức.</p>
              ) : organizers.map(o => (
                <div key={o.user_id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, marginBottom: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{o.username}</span>
                    <span style={{
                      marginLeft: 10, fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                      background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)",
                    }}>
                      {o.role}
                    </span>
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {o.assigned_at?.slice(0, 10)}
                  </span>
                  <button onClick={() => handleRemoveOrganizer(o.user_id)} style={{
                    padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.08)", color: "#f87171",
                    fontWeight: 700, fontSize: 11, cursor: "pointer",
                  }}>
                    Thu hồi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Results ── */}
        {activeTab === "results" && (
          <div style={{ ...PANEL_STYLE, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "white", fontWeight: 800 }}>🏅 Kết quả & Bảng điểm</h3>
              <button
                onClick={() => {
                  fetch(`${BASE}/api/tournaments/${id}/leaderboard?limit=100`, { headers: authHeaders })
                    .then(r => r.json())
                    .then(d => {
                      const csv = ["rank,username,score,matches_played,clan_id",
                        ...(d.leaderboard || []).map(e => `${e.rank},${e.username},${e.score},${e.matches_played},${e.clan_id || ""}`)
                      ].join("\n");
                      const a = document.createElement("a");
                      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
                      a.download = `tournament_${id}_results.csv`;
                      a.click();
                    });
                }}
                style={{
                  padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(34,211,238,0.3)",
                  background: "rgba(34,211,238,0.08)", color: "#22d3ee",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}
              >
                ⬇ Xuất CSV
              </button>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              Bảng điểm được cập nhật tự động sau mỗi trận đấu giải. Hệ số XP áp dụng:{" "}
              <strong style={{ color: "#fbbf24" }}>{tournament.xp_multiplier}x</strong>
            </p>
            <a href={`/events`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #fbbf24, #f97316)",
                color: "white", fontWeight: 800, fontSize: 13,
              }}>
                📊 Xem bảng xếp hạng công khai
              </button>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
