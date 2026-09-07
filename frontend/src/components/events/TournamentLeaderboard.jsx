"use client";
import React, { useEffect, useState } from "react";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

const MEDAL_BG = {
  1: "linear-gradient(135deg, #FFE58A, #F59E0B)",
  2: "linear-gradient(135deg, #E4E4F0, #94A3B8)",
  3: "linear-gradient(135deg, #FDBA74, #D97706)",
};
const MEDAL_COLOR = { 1: "#1A0512", 2: "#0F172A", 3: "#1A0512" };
const MEDAL_ICON = { 1: "👑", 2: "🥈", 3: "🥉" };

function getInitials(name) {
  return (name || "?")[0].toUpperCase();
}

const STUB_LEADERBOARD = [
  { rank: 1, username: "minh_toan_hoc", score: 11480, matches_played: 8, clan_id: "thth", avatar_url: "" },
  { rank: 2, username: "lan_pi_math", score: 9120, matches_played: 7, clan_id: "vtsp", avatar_url: "" },
  { rank: 3, username: "huy_math99", score: 8340, matches_played: 6, clan_id: "hsvc", avatar_url: "" },
  { rank: 4, username: "toan_thuy_2k7", score: 7600, matches_played: 5, clan_id: "", avatar_url: "" },
  { rank: 5, username: "delta_solver", score: 6800, matches_played: 5, clan_id: "shb", avatar_url: "" },
];

export default function TournamentLeaderboard({
  tournamentId = "tourney_summer_2026",
  xpMultiplier = 1.5,
}) {
  const [entries, setEntries] = useState(STUB_LEADERBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/tournaments/${tournamentId}/leaderboard?limit=10`)
      .then(r => r.json())
      .then(data => {
        if (data.leaderboard?.length > 0) setEntries(data.leaderboard);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tournamentId]);

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Section Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏅</span>
          <h2 style={{
            fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
            background: "linear-gradient(135deg, #ffffff 40%, #fde68a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Bảng Xếp Hạng Giải Đấu
          </h2>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: 100, padding: "4px 12px",
          fontSize: 11, fontWeight: 800, color: "#fbbf24", letterSpacing: 0.8,
        }}>
          ⚡ {xpMultiplier}x XP
        </div>
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(2,8,24,0.9) 0%, rgba(4,12,36,0.85) 100%)",
        backdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 80px 80px",
          gap: 0, padding: "10px 20px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {["#", "Người chơi", "Điểm", "Trận"].map((h, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: 1.2, color: "rgba(255,255,255,0.35)",
              textAlign: i > 1 ? "right" : "left",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div>
          {(loading ? STUB_LEADERBOARD : entries).map((entry, idx) => {
            const rank = entry.rank || idx + 1;
            const isTop3 = rank <= 3;
            return (
              <div
                key={entry.user_id || entry.username}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 80px 80px",
                  gap: 0,
                  padding: "12px 20px",
                  borderBottom: idx < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: isTop3 ? `rgba(245,158,11,${0.04 - idx * 0.01})` : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = isTop3 ? `rgba(245,158,11,${0.04 - idx * 0.01})` : "transparent"}
              >
                {/* Rank */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {isTop3 ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: MEDAL_BG[rank],
                      color: MEDAL_COLOR[rank],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 900,
                    }}>
                      {MEDAL_ICON[rank]}
                    </div>
                  ) : (
                    <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      {rank}
                    </span>
                  )}
                </div>

                {/* Player */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: entry.avatar_url ? "none" : "linear-gradient(135deg, #6366f1, #22d3ee)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 13, color: "white",
                    flexShrink: 0, overflow: "hidden",
                    border: isTop3 ? "1.5px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : getInitials(entry.username)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{
                      display: "block", fontWeight: 800, fontSize: 13.5,
                      color: isTop3 ? "#fde68a" : "rgba(255,255,255,0.85)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {entry.username}
                    </span>
                    {entry.clan_id && (
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
                        #{entry.clan_id.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  textAlign: "right", fontFamily: "monospace", fontWeight: 900,
                  fontSize: isTop3 ? 14 : 13,
                  color: isTop3 ? "#fbbf24" : "rgba(255,255,255,0.75)",
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                }}>
                  {entry.score.toLocaleString()}
                </div>

                {/* Matches */}
                <div style={{
                  textAlign: "right", fontFamily: "monospace", fontSize: 12,
                  color: "rgba(255,255,255,0.38)",
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                }}>
                  {entry.matches_played}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
