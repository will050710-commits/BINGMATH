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

        {/* Date labels */}
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | badges

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      apiFetch(`/api/profile/${userId}`),
      apiFetch(`/api/mrm/rank-history/${userId}`),
    ]).then(([profRes, histRes]) => {
      if (profRes.ok) setProfile(profRes.data);
      if (histRes.ok) setRankHistory(histRes.data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif",
      }}>
        Đang tải hồ sơ...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#f87171", fontFamily: "'Inter', sans-serif",
      }}>
        Không tìm thấy người dùng
      </div>
    );
  }

  const { user, gamification, ranks, badges, active_border, test_stats } = profile;
  const leagueColor = LEAGUE_COLORS[gamification?.league] || "#94a3b8";
  const flag = COUNTRY_FLAGS[user.country] || "🌍";

  let borderStyle = {};
  if (active_border?.css_style) {
    try { borderStyle = JSON.parse(active_border.css_style); } catch (_) {}
  }
  const { animation: _a, ...safeBorderStyle } = borderStyle;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617, #0a0a1a)",
      fontFamily: "'Inter', sans-serif", color: "white",
    }}>
      {/* Nav */}
      <div style={{
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 28px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/mrm/leaderboard" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
          }}>← Leaderboard</button>
        </Link>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
          Hồ sơ · {user.username}
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
        {/* ── PROFILE HEADER ── */}
        <div style={{
          background: "rgba(10,10,24,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: "28px",
          marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: -40, left: -40, width: 200, height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${leagueColor}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", position: "relative" }}>
            {/* Avatar with border */}
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: user.avatar_url ? "transparent" : "linear-gradient(135deg, #1e293b, #0f172a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, fontWeight: 800, color: "#94a3b8",
              flexShrink: 0, overflow: "hidden",
              ...safeBorderStyle,
            }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user.username || "?")[0].toUpperCase()}
            </div>

            {/* User info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
                  {flag} {user.username}
                </h1>
                <span style={{
                  background: `${leagueColor}22`,
                  border: `1px solid ${leagueColor}55`,
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: 11, fontWeight: 800, color: leagueColor,
                }}>
                  {gamification?.league}
                </span>
                {active_border && (
                  <span style={{
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.3)",
                    borderRadius: 20, padding: "3px 10px",
                    fontSize: 10, fontWeight: 700, color: "#a78bfa",
                  }}>
                    🖼️ {active_border.name_vi}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                {user.school || "Chưa cập nhật trường"} · {user.grade || ""} · Level {gamification?.level}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                Tham gia: {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "N/A"}
              </div>
            </div>

            {/* Coins display */}
            <div style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: 12, padding: "10px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>
                🪙 {(gamification?.coins || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>xu hiện có</div>
            </div>
          </div>

          {/* ── RANK BADGES ── */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "🌍 Global", rank: ranks?.global_rank, color: "#22d3ee" },
              { label: `${flag} ${user.country}`, rank: ranks?.country_rank, color: "#4ade80" },
              { label: "🏫 Trường", rank: ranks?.school_rank, color: "#fbbf24" },
            ].map(r => r.rank != null && (
              <div key={r.label} style={{
                background: `${r.color}11`,
                border: `1px solid ${r.color}33`,
                borderRadius: 10, padding: "8px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5 }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: r.color }}>
                  #{r.rank.toLocaleString()}
                </div>
              </div>
            ))}
            <div style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: 10, padding: "8px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Peak ELO</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>
                {gamification?.peak_elo?.toLocaleString() || 1000}
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 10, marginBottom: 20,
        }}>
          {[
            { label: "ELO Rating",  value: (gamification?.elo_rating || 1000).toLocaleString(), icon: "⚔️", color: "#22d3ee" },
            { label: "Bài Test",    value: test_stats?.total_tests || 0, icon: "📋", color: "#a78bfa" },
            { label: "Accuracy TB", value: `${test_stats?.avg_accuracy || 0}%`, icon: "🎯", color: "#4ade80" },
            { label: "Best Score",  value: (test_stats?.best_score || 0).toLocaleString(), icon: "🏆", color: "#fbbf24" },
            { label: "Streak",      value: `${gamification?.current_streak || 0} ngày`, icon: "🔥", color: "#f97316" },
            { label: "Streak Max",  value: `${gamification?.longest_streak || 0} ngày`, icon: "💎", color: "#f97316" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(10,10,24,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 20,
          background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 4,
        }}>
          {[
            { key: "overview", label: "📊 Tổng quan" },
            { key: "badges",   label: `🎖️ Badges (${badges?.length || 0})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: "9px 8px", borderRadius: 9, border: "none",
              background: activeTab === t.key ? "rgba(34,211,238,0.15)" : "transparent",
              color: activeTab === t.key ? "#22d3ee" : "rgba(255,255,255,0.45)",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              borderBottom: activeTab === t.key ? "2px solid #22d3ee" : "2px solid transparent",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Rank History Graph */}
            <div style={{
              background: "rgba(10,10,24,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "20px", gridColumn: "1/-1",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>📈 Rank History</h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, marginTop: 2 }}>
                    Lịch sử ELO Rating qua thời gian
                  </p>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>
                  Peak: {gamification?.peak_elo?.toLocaleString() || 1000} ELO
                </div>
              </div>
              <RankHistoryGraph history={rankHistory} />
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === "badges" && (
          <div style={{
            background: "rgba(10,10,24,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "20px",
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, marginBottom: 16 }}>
              🎖️ Badge Collection ({badges?.length || 0} earned)
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}>
              {Object.entries(KNOWN_BADGES).map(([id, info]) => {
                const earned = badges?.some(b => b.badge_id === id);
                return (
                  <div key={id} style={{
                    background: earned ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${earned ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: 12, padding: "14px 12px", textAlign: "center",
                    opacity: earned ? 1 : 0.35,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{info.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: earned ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
                      {info.name}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                      {info.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
