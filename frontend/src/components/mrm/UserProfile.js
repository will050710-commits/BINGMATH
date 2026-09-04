"use client";
/**
 * UserProfile.js — Trang profile osu!-style với Rank History Graph
 * Xếp hạng theo ELO: Global | Country | School
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:5000");

async function apiFetch(path) {
  const hdrs = {};
  const cu = auth?.currentUser;
  if (cu) { try { hdrs["Authorization"] = `Bearer ${await cu.getIdToken(true)}`; } catch (_) {} }
  const res = await fetch(`${BASE}${path}`, { headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

const LEAGUE_COLORS = {
  Bronze: "#cd7f32", Silver: "#b0b0b0", Gold: "#ffd700",
  Platinum: "#a8d8ea", Diamond: "#00d2ff",
};

const COUNTRY_FLAGS = {
  VN: "🇻🇳", US: "🇺🇸", JP: "🇯🇵", KR: "🇰🇷", CN: "🇨🇳",
  UK: "🇬🇧", AU: "🇦🇺", FR: "🇫🇷", DE: "🇩🇪", SG: "🇸🇬",
};

const KNOWN_BADGES = {
  first_test:   { name: "First Steps",     icon: "🎓", desc: "Hoàn thành bài test đầu tiên" },
  streak_7:     { name: "Week Warrior",     icon: "🔥", desc: "Streak 7 ngày" },
  streak_30:    { name: "Month Master",     icon: "🏆", desc: "Streak 30 ngày" },
  perfect_score:{ name: "Perfect Score",   icon: "💯", desc: "Đạt 100% một bài test" },
  combo_master: { name: "Combo Master",     icon: "⚡", desc: "Đạt combo x20 trong MRM" },
  top10_global: { name: "Global Elite",    icon: "🌍", desc: "Lọt top 10 toàn cầu" },
};

// ── Rank History Graph (SVG) ────────────────────────────────────────────────
function RankHistoryGraph({ history }) {
  if (!history || history.length < 2) {
    return (
      <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
        Chưa đủ dữ liệu để vẽ biểu đồ
      </div>
    );
  }

  const W = 500, H = 120, PAD = { t: 10, r: 10, b: 24, l: 40 };
  const IW = W - PAD.l - PAD.r;
  const IH = H - PAD.t - PAD.b;

  const elos = history.map(h => h.elo_rating);
  const minElo = Math.min(...elos) - 30;
  const maxElo = Math.max(...elos) + 30;

  const pts = history.map((h, i) => {
    const x = PAD.l + (i / (history.length - 1)) * IW;
    const y = PAD.t + IH - ((h.elo_rating - minElo) / (maxElo - minElo)) * IH;
    return { x, y, elo: h.elo_rating, date: h.recorded_at };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.b} L ${PAD.l} ${H - PAD.b} Z`;

  // Gradient: red(low) → green(high)
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="eloGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD.t + f * IH;
          const eloVal = Math.round(maxElo - f * (maxElo - minElo));
          return (
            <g key={f}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <text x={PAD.l - 5} y={y + 4} textAnchor="end"
                fontSize={9} fill="rgba(255,255,255,0.2)">{eloVal}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#eloGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#4ade80" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4}
              fill="#4ade80" stroke="#0d1b3e" strokeWidth={2}
              style={{ cursor: "pointer", transition: "r 0.15s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)} />
            {hovered === i && (
              <g>
                <rect x={p.x - 36} y={p.y - 36} width={72} height={28}
                  rx={5} fill="rgba(13,27,62,0.9)" stroke="#4ade8055" strokeWidth={1} />
                <text x={p.x} y={p.y - 24} textAnchor="middle" fontSize={10}
                  fill="#4ade80" fontWeight={700}>{p.elo} ELO</text>
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize={9}
                  fill="rgba(255,255,255,0.4)">
                  {new Date(p.date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                </text>
              </g>
            )}
          </g>
        ))}

        {[pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]].filter(Boolean).map((p, i) => (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle"
            fontSize={9} fill="rgba(255,255,255,0.25)">
            {new Date(p.date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [rankHistory, setRankHistory] = useState([]);
  const [clanData, setClanData] = useState(null);
  const [clanMessages, setClanMessages] = useState([]);
  const [newChatMsg, setNewChatMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      apiFetch(`/api/profile/${userId}`),
      apiFetch(`/api/mrm/rank-history/${userId}`),
      apiFetch(`/api/users/${userId}/clan`),
    ]).then(([profRes, histRes, clanRes]) => {
      if (profRes.ok) setProfile(profRes.data);
      if (histRes.ok) setRankHistory(histRes.data);
      if (clanRes.ok && clanRes.data?.has_clan) {
        setClanData(clanRes.data);
        apiFetch(`/api/clans/${clanRes.data.clan.id}/messages`).then(msgRes => {
          if (msgRes.ok) setClanMessages(msgRes.data.messages || []);
        });
      }
      setLoading(false);
    });
  }, [userId]);

  const handleSendClanMsg = async (e) => {
    e.preventDefault();
    if (!newChatMsg.trim() || !clanData?.clan?.id || sendingMsg) return;
    setSendingMsg(true);
    const clanId = clanData.clan.id;
    const text = newChatMsg.trim();
    setNewChatMsg("");

    const tempMsg = {
      id: "m_" + Date.now(),
      clan_id: clanId,
      user_id: userId,
      username: profile?.user?.username || "You",
      role: clanData.user_role || "member",
      message: text,
      created_at: new Date().toISOString(),
    };
    setClanMessages(prev => [...prev, tempMsg]);

    const res = await apiFetch(`/api/clans/${clanId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: text }),
    });

    if (res.ok && res.data?.message) {
      setClanMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data.message : m));
    }
    setSendingMsg(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>Đang tải hồ sơ...</div>;
  if (!profile || !profile.user) return <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>Không tìm thấy người dùng</div>;

  const { user, gamification, ranks, badges, active_border, test_stats } = profile;
  const leagueColor = LEAGUE_COLORS[gamification?.league] || "#94a3b8";
  const flag = COUNTRY_FLAGS[user.country] || "🌍";

  let safeBorderStyle = {};
  try { const raw = JSON.parse(active_border?.css_style || "{}"); const { animation: _a, ...s } = raw; safeBorderStyle = s; } catch (_) {}

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020617, #0a0a1a)", fontFamily: "'Inter', sans-serif", color: "white" }}>
      <div style={{ background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 28px" }}>
        <Link href="/mrm/leaderboard" style={{ textDecoration: "none" }}><button style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>← Leaderboard</button></Link>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ background: "rgba(10,10,24,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #1e293b, #0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, ...safeBorderStyle }}>
              {user.avatar_url ? <img src={user.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : (user.username || "?")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{flag} {user.username}</h1>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ background: `${leagueColor}22`, border: `1px solid ${leagueColor}55`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800, color: leagueColor }}>{gamification?.league}</span>
                {clanData?.has_clan && <span style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800, color: "#f472b6" }}>🛡️ {clanData.clan.tag}</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 4 }}>
          {[{ key: "overview", label: "📊 Tổng quan" }, { key: "badges", label: "🎖️ Badges" }, { key: "clan", label: "🛡️ Clan" }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ flex: 1, padding: "9px 8px", borderRadius: 9, border: "none", background: activeTab === t.key ? "rgba(34,211,238,0.15)" : "transparent", color: activeTab === t.key ? "#22d3ee" : "rgba(255,255,255,0.45)", fontWeight: 700, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ background: "rgba(10,10,24,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <RankHistoryGraph history={rankHistory} />
          </div>
        )}

        {activeTab === "badges" && (
          <div style={{ background: "rgba(10,10,24,0.8)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {Object.entries(KNOWN_BADGES).map(([id, info]) => {
                const earned = badges?.some(b => b.badge_id === id);
                return (
                  <div key={id} style={{ padding: "14px", borderRadius: 12, background: earned ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${earned ? "#fbbf2455" : "#ffffff11"}` }}>
                    <div style={{ fontSize: 24 }}>{info.icon}</div>
                    <div style={{ fontSize: 12, color: earned ? "#fbbf24" : "#ffffff55" }}>{info.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "clan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {clanData?.has_clan ? (
              <>
                {/* Clan Banner Card */}
                <div style={{
                  position: "relative", borderRadius: 16, overflow: "hidden",
                  background: clanData.clan.banner_url ? `url(${clanData.clan.banner_url}) center/cover` : "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "24px", minHeight: 140,
                  display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 50px rgba(0,0,0,0.7)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 58, height: 58, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                      background: clanData.clan.avatar_url ? `url(${clanData.clan.avatar_url}) center/cover` : (clanData.clan.crest_gradient || "linear-gradient(135deg, #ec4899, #8b5cf6)"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, color: "white", fontSize: 18,
                      border: "2px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}>
                      {!clanData.clan.avatar_url && clanData.clan.tag?.replace("#", "").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                          {clanData.clan.name}
                        </h2>
                        <span style={{
                          background: "rgba(34,211,238,0.2)", border: "1px solid rgba(34,211,238,0.4)",
                          borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 800, color: "#22d3ee",
                        }}>
                          {clanData.clan.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                        {clanData.clan.description}
                      </p>
                    </div>
                  </div>

                  <Link href={`/clans/${clanData.clan.id}`} style={{ textDecoration: "none" }}>
                    <button style={{
                      padding: "9px 18px", borderRadius: 10,
                      background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
                      border: "none", color: "white", fontWeight: 800, fontSize: 12,
                      cursor: "pointer", boxShadow: "0 4px 14px rgba(244,114,182,0.35)",
                    }}>
                      🏰 Xem Trang Clan →
                    </button>
                  </Link>
                </div>

                {/* Clan Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                  {[
                    { label: "Cấp độ Clan", value: `Lv.${clanData.clan.level || 1}`, icon: "⭐", color: "#fbbf24" },
                    { label: "Tổng XP", value: (clanData.clan.total_xp || 0).toLocaleString(), icon: "⚡", color: "#22d3ee" },
                    { label: "Thắng / Thua", value: `${clanData.clan.wins || 0}W - ${clanData.clan.losses || 0}L`, icon: "⚔️", color: "#4ade80" },
                    { label: "Thành viên", value: `${clanData.clan.member_count || clanData.clan.members?.length || 1} người`, icon: "👥", color: "#a78bfa" },
                    { label: "Vai trò của bạn", value: clanData.user_role === "owner" ? "Trưởng Clan 👑" : (clanData.user_role === "officer" ? "Phó Clan ⚔️" : "Thành viên"), icon: "🎖️", color: "#f472b6" },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: "rgba(10,10,24,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "14px 12px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* 2-Column Grid: Tournament Achievements & Member Rankings */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
                  {/* Tournament Achievements */}
                  <div style={{
                    background: "rgba(10,10,24,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: "20px",
                  }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span>🏆</span>
                      <span>Thành Tích Các Giải Đấu</span>
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(clanData.clan.achievements || []).map((ach, idx) => (
                        <div key={idx} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 14px", borderRadius: 10,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                        }}>
                          <div>
                            <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "white" }}>
                              {ach.title}
                            </span>
                            <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
                              {ach.date}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 800, color: "#fbbf24", fontFamily: "monospace",
                            background: "rgba(251,191,36,0.1)", padding: "3px 8px", borderRadius: 6,
                          }}>
                            {ach.xp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Internal Clan Member Leaderboard */}
                  <div style={{
                    background: "rgba(10,10,24,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: "20px",
                  }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span>🏅</span>
                      <span>Bảng Xếp Hạng Thành Viên</span>
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(clanData.clan.members || []).map((m, idx) => (
                        <div key={m.id || idx} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderRadius: 10,
                          background: m.username === user.username ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${m.username === user.username ? "rgba(34,211,238,0.25)" : "rgba(255,255,255,0.05)"}`,
                        }}>
                          <span style={{ width: 20, fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: idx < 3 ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
                            #{idx + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                                {m.username}
                              </span>
                              {m.role === "owner" && <span style={{ fontSize: 9, fontWeight: 800, color: "#fbbf24", background: "rgba(251,191,36,0.15)", padding: "1px 5px", borderRadius: 4 }}>Trưởng Clan</span>}
                              {m.role === "officer" && <span style={{ fontSize: 9, fontWeight: 800, color: "#22d3ee", background: "rgba(34,211,238,0.15)", padding: "1px 5px", borderRadius: 4 }}>Phó Clan</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#fbbf24" }}>
                            +{(m.xp_contributed || 0).toLocaleString()} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Private Clan Chatbox ── */}
                <div style={{
                  background: "rgba(10,10,24,0.85)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>💬</span>
                      <span>Khung Chat Riêng Clan ({clanData.clan.name})</span>
                    </h3>
                    <span style={{ fontSize: 11, color: "rgba(52,211,153,0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                      Trực tuyến
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div style={{
                    height: 220, overflowY: "auto",
                    background: "rgba(2,6,23,0.6)", borderRadius: 12,
                    padding: "14px", display: "flex", flexDirection: "column", gap: 10,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    {clanMessages.map((msg, i) => {
                      const isMe = msg.username === user.username || msg.user_id === userId;
                      return (
                        <div key={msg.id || i} style={{
                          display: "flex", flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: isMe ? "#22d3ee" : "rgba(255,255,255,0.7)" }}>
                              {msg.username}
                            </span>
                            {msg.role === "owner" && <span style={{ fontSize: 9, color: "#fbbf24" }}>👑</span>}
                            {msg.role === "officer" && <span style={{ fontSize: 9, color: "#22d3ee" }}>⚔️</span>}
                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                          <div style={{
                            padding: "8px 14px", borderRadius: 12, maxWidth: "80%",
                            fontSize: 13, lineHeight: 1.5,
                            background: isMe ? "linear-gradient(135deg, #0ea5e9, #6366f1)" : "rgba(255,255,255,0.06)",
                            color: "white", border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
                          }}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendClanMsg} style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn thảo luận nội bộ với các thành viên Clan..."
                      value={newChatMsg}
                      onChange={e => setNewChatMsg(e.target.value)}
                      style={{
                        flex: 1, padding: "10px 14px",
                        background: "rgba(2,6,23,0.7)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10, color: "white", fontSize: 13, outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !newChatMsg.trim()}
                      style={{
                        padding: "10px 20px", borderRadius: 10,
                        background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
                        border: "none", color: "white", fontWeight: 800, fontSize: 13,
                        cursor: "pointer", opacity: !newChatMsg.trim() ? 0.5 : 1,
                      }}
                    >
                      Gửi 🚀
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{
                background: "rgba(10,10,24,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "40px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "white", margin: 0 }}>
                  Chưa tham gia Math Clan nào
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "8px 0 20px" }}>
                  Hãy gia nhập hoặc tự thành lập Clan để cùng đồng đội Đấu Nhóm và leo bảng xếp hạng!
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <Link href="/clans" style={{ textDecoration: "none" }}>
                    <button style={{
                      padding: "10px 20px", borderRadius: 10,
                      background: "linear-gradient(135deg, #22d3ee, #6366f1)",
                      border: "none", color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer",
                    }}>
                      🔍 Khám phá Clan
                    </button>
                  </Link>
                  <Link href="/clans/create" style={{ textDecoration: "none" }}>
                    <button style={{
                      padding: "10px 20px", borderRadius: 10,
                      background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
                      border: "none", color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer",
                    }}>
                      ✨ Thành lập Clan
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
