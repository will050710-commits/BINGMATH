"use client";
/**
 * MRMLeaderboard.js — Bảng xếp hạng osu!-style, rank theo ELO
 * 3 tab: Global | Country | School
 */
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { auth } from "@/lib/firebase";
import JackpotBanner from "@/components/mrm/JackpotBanner";
import { CoinStoreProvider } from "@/context/CoinStore";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

async function apiFetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };
  const cu = auth?.currentUser;
  if (cu) { try { hdrs["Authorization"] = `Bearer ${await cu.getIdToken(true)}`; } catch (_) {} }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

const LEAGUE_COLORS = {
  Bronze:   "#cd7f32",
  Silver:   "#b0b0b0",
  Gold:     "#ffd700",
  Platinum: "#a8d8ea",
  Diamond:  "#00d2ff",
};

const RANK_MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

const COUNTRY_FLAGS = {
  VN: "🇻🇳", US: "🇺🇸", JP: "🇯🇵", KR: "🇰🇷", CN: "🇨🇳",
  UK: "🇬🇧", AU: "🇦🇺", FR: "🇫🇷", DE: "🇩🇪", SG: "🇸🇬",
};

function EloBar({ elo, peak }) {
  const pct = Math.min(100, ((elo - 800) / (3000 - 800)) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, minWidth: 60 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
          borderRadius: 2, transition: "width 0.5s ease",
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: "#22d3ee", minWidth: 44 }}>
        {elo.toLocaleString()}
      </span>
    </div>
  );
}

function BorderAvatar({ avatarUrl, borderCssStyle, username, size = 44 }) {
  let borderStyle = {};
  try { borderStyle = JSON.parse(borderCssStyle || "{}"); } catch (_) {}
  const { animation: _a, ...safeStyle } = borderStyle;
  const initials = (username || "?")[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: avatarUrl ? "transparent" : "linear-gradient(135deg, #1e293b, #0f172a)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 800, color: "#94a3b8",
      flexShrink: 0, overflow: "hidden",
      ...safeStyle,
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials}
    </div>
  );
}

function LeaderboardRow({ entry, myUserId, index }) {
  const isMe = entry.user_id === myUserId;
  const medal = RANK_MEDALS[entry.rank];
  const leagueColor = LEAGUE_COLORS[entry.league] || "#94a3b8";
  const flag = COUNTRY_FLAGS[entry.country] || "🌍";
  const borderStyle = entry.active_border?.css_style;

  return (
    <Link href={`/mrm/profile/${entry.user_id}`} style={{ textDecoration: "none" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr 80px 100px 90px",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderRadius: 10,
        background: isMe
          ? "rgba(34,211,238,0.06)"
          : index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
        border: isMe ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent",
        transition: "all 0.2s",
        cursor: "pointer",
        marginBottom: 4,
      }}
      onMouseEnter={e => {
        if (!isMe) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={e => {
        if (!isMe) e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent";
      }}
      >
        {/* Rank */}
        <div style={{ textAlign: "center" }}>
          {medal
            ? <span style={{ fontSize: 20 }}>{medal}</span>
            : <span style={{
                fontSize: 14, fontWeight: 800,
                color: entry.rank <= 10 ? "#fbbf24" : "rgba(255,255,255,0.3)",
              }}>#{entry.rank}</span>
          }
        </div>

        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <BorderAvatar
            avatarUrl={entry.avatar_url}
            borderCssStyle={borderStyle}
            username={entry.username}
            size={40}
          />
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: isMe ? "#22d3ee" : "white",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {flag} {entry.username}
              {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: "#22d3ee", fontWeight: 800 }}>YOU</span>}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {entry.school || "Chưa cập nhật trường"} · {entry.grade || ""} · Lv.{entry.level}
            </div>
          </div>
        </div>

        {/* League */}
        <div style={{
          textAlign: "center",
          fontSize: 12, fontWeight: 700,
          color: leagueColor,
        }}>
          {entry.league}
        </div>

        {/* ELO bar */}
        <div>
          <EloBar elo={entry.elo_rating} peak={entry.peak_elo} />
        </div>

        {/* Streak */}
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: entry.current_streak > 0 ? "#f97316" : "rgba(255,255,255,0.2)" }}>
            {entry.current_streak > 0 ? `🔥 ${entry.current_streak}` : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MRMLeaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("global"); // global | country | school
  const [timeframe, setTimeframe] = useState("alltime"); // alltime | season | month | week
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [myRank, setMyRank] = useState(null);
  const [userCountry, setUserCountry] = useState("VN");
  const [userSchool, setUserSchool] = useState("");

  const LIMIT = 50;

  // Detect user country/school
  useEffect(() => {
    if (user?.country) setUserCountry(user.country);
    if (user?.school) setUserSchool(user.school);
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);
    let path = `/api/mrm/leaderboard?type=${tab}&timeframe=${timeframe}&page=${page}&limit=${LIMIT}`;
    if (tab === "country") path += `&country=${encodeURIComponent(userCountry)}`;
    if (tab === "school" && userSchool) path += `&school=${encodeURIComponent(userSchool)}`;
    const { ok, data } = await apiFetch(path);
    if (ok) {
      setItems(data.items || []);
      setTotal(data.total || 0);
      // Find my rank
      if (user) {
        const me = data.items.find(x => x.username === user.username || x.user_id === user.id);
        if (me) setMyRank(me.rank);
      }
    }
    setLoading(false);
  }, [tab, timeframe, page, userCountry, userSchool, user]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? items.filter(i => i.username.toLowerCase().includes(search.toLowerCase()) || (i.school || "").toLowerCase().includes(search.toLowerCase()))
    : items;

  const TABS = [
    { key: "global",  label: "🌍 Toàn Cầu", desc: "Xếp hạng ELO toàn thế giới" },
    { key: "country", label: `${COUNTRY_FLAGS[userCountry] || "🌏"} Quốc Gia`, desc: `Top ${userCountry}` },
    { key: "school",  label: "🏫 Trường học", desc: userSchool || "Cập nhật trường để xem" },
  ];

  const TIMEFRAMES = [
    { key: "alltime", label: "TOÀN THỜI GIAN 🌐" },
    { key: "season",  label: "MÙA GIẢI 🏆" },
    { key: "month",   label: "THÁNG NÀY 📅" },
    { key: "week",    label: "TUẦN NÀY ⚡" },
  ];

  return (
    <CoinStoreProvider>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        fontFamily: "'Inter', sans-serif", color: "white",
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>🏆 MRM Leaderboard</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, marginTop: 2 }}>
              Xếp hạng theo ELO Rating · Cập nhật real-time
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/mrm/shop" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                color: "#fbbf24", cursor: "pointer",
              }}>🛍️ Cửa hàng</button>
            </Link>
            <Link href="/mrm" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
              }}>← MRM</button>
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
          {/* Jackpot banner */}
          <JackpotBanner />

          {/* My rank callout */}
          {myRank && (
            <div style={{
              background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.2)",
              borderRadius: 10, padding: "10px 16px", marginBottom: 16,
              fontSize: 13, fontWeight: 700, color: "#22d3ee",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              📍 Bạn đang ở vị trí <strong>#{myRank}</strong> trong bảng này
            </div>
          )}

          {/* Tabs (Scope) */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 4 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                style={{
                  flex: 1, padding: "10px 8px", borderRadius: 9, border: "none",
                  background: tab === t.key ? "rgba(34,211,238,0.15)" : "transparent",
                  color: tab === t.key ? "#22d3ee" : "rgba(255,255,255,0.45)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s",
                  borderBottom: tab === t.key ? "2px solid #22d3ee" : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Timeframe Filter (osu!-style) */}
          <div style={{
            display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap",
            background: "rgba(2,6,23,0.6)", padding: "6px 8px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {TIMEFRAMES.map(tf => {
              const active = timeframe === tf.key;
              return (
                <button
                  key={tf.key}
                  onClick={() => { setTimeframe(tf.key); setPage(1); }}
                  style={{
                    padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    background: active ? "linear-gradient(135deg, #f472b6, #ec4899)" : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.45)",
                    transition: "all 0.2s",
                    boxShadow: active ? "0 2px 10px rgba(244,114,182,0.3)" : "none",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ marginBottom: 16, position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Tìm kiếm username hoặc trường..."
              style={{
                width: "100%", padding: "10px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "white", fontSize: 13,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "52px 1fr 80px 100px 90px",
            gap: 12, padding: "8px 20px", marginBottom: 6,
            fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
          }}>
            <div style={{ textAlign: "center" }}>Hạng</div>
            <div>Người chơi</div>
            <div style={{ textAlign: "center" }}>League</div>
            <div>ELO</div>
            <div style={{ textAlign: "right" }}>Streak</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)" }}>
              Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)" }}>
              {tab === "school" && !userSchool
                ? "Cập nhật tên trường trong hồ sơ để xem bảng xếp hạng theo trường"
                : "Chưa có dữ liệu"}
            </div>
          ) : (
            filtered.map((entry, i) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                index={i}
                myUserId={user?.id}
              />
            ))
          )}

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {page > 1 && (
                <button onClick={() => setPage(p => p - 1)} style={paginationBtnStyle}>← Trước</button>
              )}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: "32px" }}>
                Trang {page} / {Math.ceil(total / LIMIT)}
              </span>
              {page * LIMIT < total && (
                <button onClick={() => setPage(p => p + 1)} style={paginationBtnStyle}>Sau →</button>
              )}
            </div>
          )}
        </div>
      </div>
    </CoinStoreProvider>
  );
}

const paginationBtnStyle = {
  padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
  background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)",
  color: "#22d3ee", cursor: "pointer",
};
