"use client";
import React from "react";

const MOCK_MEMBERS = [
  { id: "u1", username: "william_math", role: "owner", rank: "SS", xpContributed: 42800, joinedAt: "01/03/2026" },
  { id: "u2", username: "co_giao_lan", role: "officer", rank: "SS", xpContributed: 38400, joinedAt: "05/03/2026" },
  { id: "u3", username: "minh_toan_hoc", role: "officer", rank: "A", xpContributed: 26100, joinedAt: "10/03/2026" },
  { id: "u4", username: "huy_math99", role: "member", rank: "B", xpContributed: 18500, joinedAt: "15/03/2026" },
  { id: "u5", username: "thu_trang_2k9", role: "member", rank: "S", xpContributed: 16200, joinedAt: "20/03/2026" },
];

const RANK_COLORS = { SS: "#fbbf24", S: "#a78bfa", A: "#22d3ee", B: "#34d399", C: "#94a3b8" };
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #22d3ee, #6366f1)",
  "linear-gradient(135deg, #34d399, #0891b2)",
  "linear-gradient(135deg, #a78bfa, #6366f1)",
];

export default function ClanMemberList({ members = MOCK_MEMBERS }) {
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
            Danh sách thành viên ({members.length})
          </span>
        </h3>
      </div>

      {/* Member rows */}
      {members.map((m, idx) => {
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
              {m.username[0]}
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
