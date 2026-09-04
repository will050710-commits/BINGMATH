"use client";
import React from "react";

const PODIUM_WINNERS = [
  {
    place: 2,
    username: "lan_pi",
    clan: "Vòng Tròn Số Pi",
    score: 9120,
    avatarGradient: "linear-gradient(135deg, #22d3ee, #6366f1)",
    pedestalBg: "linear-gradient(160deg, #E4E4F0 0%, #94A3B8 100%)",
    pedestalColor: "#0F172A",
    medal: "🥈 2nd",
    height: 100,
  },
  {
    place: 1,
    username: "minh_toan_hoc",
    clan: "Thánh Toán Học",
    score: 11480,
    avatarGradient: "linear-gradient(135deg, #fbbf24, #f43f5e)",
    pedestalBg: "linear-gradient(160deg, #FFE58A 0%, #F59E0B 100%)",
    pedestalColor: "#1A0512",
    medal: "👑 1st",
    height: 140,
  },
  {
    place: 3,
    username: "huy_math99",
    clan: "Hàm Số Vô Cực",
    score: 8340,
    avatarGradient: "linear-gradient(135deg, #34d399, #0ea5e9)",
    pedestalBg: "linear-gradient(160deg, #FDBA74 0%, #D97706 100%)",
    pedestalColor: "#1A0512",
    medal: "🥉 3rd",
    height: 76,
  },
];

function getInitials(name) {
  return (name || "U").slice(0, 1).toUpperCase();
}

export default function HallOfFame({ seasonTitle = "Mùa Xuân 2026" }) {
  return (
    <div style={{ marginBottom: 56 }}>
      {/* Section Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 24 }}>🏛️</span>
        <h2 style={{
          fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 900, color: "white",
          margin: 0, letterSpacing: -0.3,
          background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Bảng Vinh Danh — {seasonTitle}
        </h2>
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(2,8,24,0.88) 0%, rgba(4,12,36,0.84) 100%)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "clamp(24px, 5vw, 52px) clamp(20px, 5vw, 48px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        {/* Podium */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "clamp(16px, 4vw, 40px)",
          paddingTop: 28,
          paddingBottom: 12,
        }}>
          {PODIUM_WINNERS.map((winner) => (
            <div
              key={winner.place}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 130 }}
            >
              {/* Avatar */}
              <div style={{
                width: 58, height: 58, borderRadius: "50%",
                background: winner.avatarGradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 22, color: "white",
                border: "2px solid rgba(255,255,255,0.25)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                marginBottom: 10, userSelect: "none",
              }}>
                {getInitials(winner.username)}
              </div>

              {/* Username */}
              <span style={{
                fontWeight: 800, fontSize: 13.5, color: "white",
                display: "block", textAlign: "center",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: "100%",
              }}>
                {winner.username}
              </span>

              {/* Clan */}
              <span style={{
                fontSize: 11, fontFamily: "monospace", color: "#22d3ee",
                display: "block", textAlign: "center", marginBottom: 14,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: "100%",
              }}>
                {winner.clan}
              </span>

              {/* Pedestal */}
              <div style={{
                width: "100%",
                height: winner.height,
                background: winner.pedestalBg,
                color: winner.pedestalColor,
                borderRadius: "10px 10px 6px 6px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                padding: "8px 4px",
                userSelect: "none",
              }}>
                <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: 0.5 }}>
                  {winner.medal}
                </span>
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 14, marginTop: 4 }}>
                  {winner.score.toLocaleString()}đ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
