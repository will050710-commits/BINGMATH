"use client";
import React, { useEffect, useState } from "react";
import { resolveApiBase } from "@/lib/apiBase";

const BASE = resolveApiBase();

const RANK_COLORS = { SS: "#fbbf24", S: "#a78bfa", A: "#22d3ee", B: "#34d399", C: "#94a3b8" };
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #22d3ee, #6366f1)",
  "linear-gradient(135deg, #34d399, #0891b2)",
  "linear-gradient(135deg, #a78bfa, #6366f1)",
];

function inferRankFromXp(xp) {
  const n = Number(xp || 0);
  if (n >= 35000) return "SS";
  if (n >= 20000) return "S";
  if (n >= 10000) return "A";
  if (n >= 3000) return "B";
  return "C";
}

function normalizeMember(m, idx) {
  const xp = Number(m?.xpContributed ?? m?.xp_contributed ?? m?.xp ?? 0);
  const username = String(m?.username || m?.display_name || m?.user_id || `hoc_sinh_${idx + 1}`);
  const rawDate = m?.joinedAt || m?.joined_at || "";
  let joinedAt = "—";
  if (rawDate) {
    const d = new Date(rawDate);
    joinedAt = Number.isNaN(d.getTime()) ? String(rawDate) : d.toLocaleDateString("vi-VN");
  }
  return {
    id: m?.id || m?.user_id || `m-${idx}`,
    username,
    role: m?.role || "member",
    rank: m?.rank || inferRankFromXp(xp),
    xpContributed: xp,
    joinedAt,
  };
}

export default function ClanMemberList({ members, clanId }) {
  const [fetchedMembers, setFetchedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(members) || !clanId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${BASE}/api/clans/${encodeURIComponent(clanId)}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.members)) {
          setFetchedMembers(data.members);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clanId, members]);

  const rawList = Array.isArray(members) ? members : fetchedMembers;
  const normalizedList = rawList.map(normalizeMember);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{
          margin: 0, fontWeight: 800, fontSize: 17, color: "white",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>👥</span>
          <span style={{
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Danh sách thành viên ({normalizedList.length})
          </span>
        </h3>
      </div>

      {loading && normalizedList.length === 0 && (
        <div style={{
          padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.45)",
          background: "rgba(2,6,23,0.4)", borderRadius: 14, fontSize: 13,
        }}>
          Đang tải danh sách thành viên Clan...
        </div>
      )}

      {!loading && normalizedList.length === 0 && (
        <div style={{
          padding: "24px 18px", textAlign: "center", color: "rgba(255,255,255,0.45)",
          background: "rgba(2,6,23,0.4)", border: "1px dashed rgba(255,255,255,0.1)",
          borderRadius: 14, fontSize: 13,
        }}>
          Chưa có thành viên nào trong Clan này.
        </div>
      )}

      {/* Member rows */}
      {normalizedList.map((m, idx) => {
        const isOwner = m.role === "owner";
        const isOfficer = m.role === "officer";
        const rankColor = RANK_COLORS[m.rank] || "#94a3b8";
        const avatarBg = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

        return (
          <div
            key={m.id}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 18px",
              background: "rgba(2,6,23,0.6)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.background = "rgba(2,6,23,0.6)";
            }}
          >
            {/* Rank number */}
            <span style={{
              width: 24, textAlign: "center",
              fontFamily: "monospace", fontWeight: 800, fontSize: 11,
              color: "rgba(255,255,255,0.3)", flexShrink: 0,
            }}>
              #{idx + 1}
            </span>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 13, color: "white", textTransform: "uppercase",
              userSelect: "none",
              border: isOwner ? "2px solid rgba(251,191,36,0.5)" : "1.5px solid rgba(255,255,255,0.1)",
              boxShadow: isOwner ? "0 0 10px rgba(251,191,36,0.3)" : "none",
            }}>
              {m.username[0] || "U"}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.3 }}>
                  {m.username}
                </span>

                {/* Rank badge */}
                <span style={{
                  fontSize: 10, fontWeight: 900, lineHeight: 1,
                  padding: "2px 6px", borderRadius: 5,
                  background: `${rankColor}18`,
                  color: rankColor,
                  border: `1px solid ${rankColor}40`,
                }}>
                  {m.rank}
                </span>

                {isOwner && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                    color: "#fbbf24", padding: "2px 7px", borderRadius: 6,
                    background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                  }}>
                    Trưởng Clan 👑
                  </span>
                )}
                {isOfficer && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                    color: "#22d3ee", padding: "2px 7px", borderRadius: 6,
                    background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.28)",
                  }}>
                    Phó Clan ⚔️
                  </span>
                )}
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, display: "block" }}>
                Gia nhập: {m.joinedAt}
              </span>
            </div>

            {/* XP contribution */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={{
                display: "block", fontFamily: "monospace", fontWeight: 800,
                fontSize: 13, color: "#fbbf24",
              }}>
                +{m.xpContributed.toLocaleString()} XP
              </span>
              <span style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8,
                color: "rgba(255,255,255,0.3)", fontWeight: 700,
              }}>
                Đóng góp
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

