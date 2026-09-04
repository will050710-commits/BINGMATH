"use client";
import React, { useState } from "react";
import Link from "next/link";

function getInitials(name) {
  const parts = (name || "CL").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || "CL").slice(0, 2).toUpperCase();
}

export default function ClanHero({
  id = "thth",
  name = "Thánh Toán Học",
  tag = "#THTH",
  foundedDate = "03/2026",
  description = "Clan luyện đề thi chuyên toán và THPT QG, sinh hoạt mỗi tối thứ 3 & thứ 6. Chào đón mọi trình độ, ưu tiên các bạn thích Đấu Nhóm thời gian thực.",
  level = 24,
  currentXP = 8200,
  xpToNextLevel = 12000,
  memberCount = 86,
  totalXP = "142K",
  record = "23-6",
  isMember = false,
  isOwner = false,
  onJoin = () => {},
  onChallenge = () => {},
}) {
  const [joined, setJoined] = useState(isMember);
  const [chalHovered, setChalHovered] = useState(false);
  const [joinHovered, setJoinHovered] = useState(false);

  const levelPct = Math.min(100, (currentXP / xpToNextLevel) * 100);

  const stats = [
    { value: memberCount, label: "Thành viên", color: "#22d3ee" },
    { value: totalXP + " XP", label: "Tổng XP", color: "#fbbf24" },
    { value: record, label: "Thắng - Thua", color: "#34d399" },
  ];

  return (
    <div style={{
      position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 40,
      background: "radial-gradient(ellipse 700px 350px at 90% -10%, rgba(236,72,153,0.22), transparent 60%), radial-gradient(ellipse 600px 350px at 10% 90%, rgba(14,165,233,0.2), transparent 60%), linear-gradient(135deg, #0a1628 0%, #0d1e38 50%, #081220 100%)",
      border: "1px solid rgba(255,255,255,0.09)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      padding: "clamp(28px, 5vw, 52px) clamp(24px, 5vw, 48px)",
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 28 }}>
        {/* Left: Crest + Info */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 22, flex: "1 1 300px" }}>
          {/* Crest */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Level Ring SVG */}
            <svg width={100} height={100} style={{ position: "absolute", top: -8, left: -8, pointerEvents: "none" }}>
              <circle cx={50} cy={50} r={46} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
              <circle
                cx={50} cy={50} r={46}
                fill="none"
                stroke="url(#clanRingGrad)"
                strokeWidth={5}
                strokeDasharray={`${2 * Math.PI * 46 * levelPct / 100} ${2 * Math.PI * 46 * (1 - levelPct / 100)}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
              />
              <defs>
                <linearGradient id="clanRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              width: 84, height: 84, borderRadius: 18,
              background: "linear-gradient(135deg, #ec4899, #7c3aed, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 22, color: "white",
              boxShadow: "0 4px 24px rgba(236,72,153,0.4)",
              userSelect: "none",
            }}>
              {getInitials(name)}
            </div>
            {/* Level Badge */}
            <div style={{
              position: "absolute", bottom: -4, right: -8,
              background: "#fbbf24", color: "#1a0512",
              fontFamily: "monospace", fontWeight: 900, fontSize: 10,
              padding: "3px 7px", borderRadius: 7,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              userSelect: "none",
            }}>
              LV {level}
            </div>
          </div>

          {/* Clan Name & Description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 900, color: "white",
              margin: "0 0 6px 0", letterSpacing: -0.5,
            }}>
              {name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: "#22d3ee" }}>{tag}</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Thành lập {foundedDate}</span>
            </div>
            <p style={{
              fontSize: 13.5, color: "rgba(255,255,255,0.58)", lineHeight: 1.65,
              margin: 0, maxWidth: 480,
            }}>
              {description}
            </p>
          </div>
        </div>

        {/* Right: Stats */}
        <div style={{
          display: "flex", alignItems: "center", gap: 28,
          paddingTop: 8, flexShrink: 0,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <span style={{
                display: "block", fontFamily: "monospace", fontWeight: 900,
                fontSize: "clamp(20px, 3.5vw, 28px)", color: s.color,
              }}>
                {s.value}
              </span>
              <span style={{
                display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 1.2, color: "rgba(255,255,255,0.38)", marginTop: 4,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1 }}>
            Cấp Clan {level}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>
            {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </span>
        </div>
        <div style={{ height: 8, background: "rgba(2,6,23,0.7)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 6,
            width: `${levelPct}%`,
            background: "linear-gradient(90deg, #ec4899, #38bdf8)",
            boxShadow: "0 0 10px rgba(236,72,153,0.4)",
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 24 }}>
        <button
          onMouseEnter={() => setChalHovered(true)}
          onMouseLeave={() => setChalHovered(false)}
          onClick={onChallenge}
          style={{
            padding: "11px 24px",
            background: chalHovered
              ? "linear-gradient(135deg, #7c3aed, #ec4899)"
              : "linear-gradient(135deg, #6366f1, #a78bfa)",
            border: "none", borderRadius: 12,
            color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
            transition: "all 0.25s", transform: chalHovered ? "translateY(-2px)" : "none",
            boxShadow: chalHovered ? "0 6px 20px rgba(99,102,241,0.45)" : "0 3px 12px rgba(99,102,241,0.3)",
          }}
        >
          ⚔ Thách đấu Clan
        </button>

        <button
          onMouseEnter={() => setJoinHovered(true)}
          onMouseLeave={() => setJoinHovered(false)}
          onClick={() => { setJoined(!joined); onJoin(!joined); }}
          style={{
            padding: "11px 24px",
            background: joined
              ? "rgba(255,255,255,0.04)"
              : joinHovered
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.06)",
            border: `1px solid ${joined ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 12,
            color: joined ? "#34d399" : "rgba(255,255,255,0.75)",
            fontWeight: 800, fontSize: 14, cursor: "pointer",
            transition: "all 0.25s", transform: joinHovered ? "translateY(-2px)" : "none",
          }}
        >
          {joined ? "✓ Đã là thành viên" : "➕ Tham gia Clan"}
        </button>
      </div>
    </div>
  );
}
