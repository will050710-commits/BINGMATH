"use client";
import React, { useState } from "react";
import Link from "next/link";

const LEADERBOARD_DATA = {
  week: [
    { rank: 1, id: "thth", name: "Thánh Toán Học", tag: "TH", members: 86, xp: 18420, delta: 3, crestColor: "#ec4899" },
    { rank: 2, id: "shb",  name: "Đội Số Học Bay", tag: "SH", members: 72, xp: 17955, delta: -1, crestColor: "#fbbf24" },
    { rank: 3, id: "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", members: 64, xp: 16110, delta: 5, crestColor: "#34d399" },
    { rank: 4, id: "hsvc", name: "Hàm Số Vô Cực", tag: "HS", members: 51, xp: 14870, delta: -2, crestColor: "#f87171" },
    { rank: 5, id: "mtvn", name: "Ma Trận Việt Nam", tag: "MT", members: 43, xp: 13200, delta: 1, crestColor: "#a78bfa" },
  ],
  month: [
    { rank: 1, id: "thth", name: "Thánh Toán Học", tag: "TH", members: 86, xp: 78500, delta: 2, crestColor: "#ec4899" },
    { rank: 2, id: "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", members: 64, xp: 71200, delta: 3, crestColor: "#34d399" },
    { rank: 3, id: "shb",  name: "Đội Số Học Bay", tag: "SH", members: 72, xp: 69800, delta: -1, crestColor: "#fbbf24" },
    { rank: 4, id: "hsvc", name: "Hàm Số Vô Cực", tag: "HS", members: 51, xp: 62400, delta: 0, crestColor: "#f87171" },
  ],
  season: [
    { rank: 1, id: "thth", name: "Thánh Toán Học", tag: "TH", members: 86, xp: 142000, delta: 1, crestColor: "#ec4899" },
    { rank: 2, id: "shb",  name: "Đội Số Học Bay", tag: "SH", members: 72, xp: 138500, delta: 0, crestColor: "#fbbf24" },
    { rank: 3, id: "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", members: 64, xp: 115000, delta: 2, crestColor: "#34d399" },
    { rank: 4, id: "mtvn", name: "Ma Trận Việt Nam", tag: "MT", members: 43, xp: 98000, delta: -1, crestColor: "#a78bfa" },
  ],
  alltime: [
    { rank: 1, id: "thth", name: "Thánh Toán Học", tag: "TH", members: 86, xp: 482000, delta: 0, crestColor: "#ec4899" },
    { rank: 2, id: "shb",  name: "Đội Số Học Bay", tag: "SH", members: 72, xp: 415000, delta: 0, crestColor: "#fbbf24" },
    { rank: 3, id: "vtsp", name: "Vòng Tròn Số Pi", tag: "PI", members: 64, xp: 368000, delta: 1, crestColor: "#34d399" },
    { rank: 4, id: "mtvn", name: "Ma Trận Việt Nam", tag: "MT", members: 43, xp: 294000, delta: -1, crestColor: "#a78bfa" },
    { rank: 5, id: "hsvc", name: "Hàm Số Vô Cực", tag: "HS", members: 51, xp: 248000, delta: 0, crestColor: "#f87171" },
  ]
};

const MEDAL_BG = {
  1: "linear-gradient(135deg, #FFE58A, #F59E0B)",
  2: "linear-gradient(135deg, #E4E4F0, #94A3B8)",
  3: "linear-gradient(135deg, #FDBA74, #D97706)",
};
const MEDAL_COLOR = { 1: "#1A0512", 2: "#0F172A", 3: "#1A0512" };

export default function ClanLeaderboard() {
  const [period, setPeriod] = useState("alltime");
  const clans = LEADERBOARD_DATA[period] || LEADERBOARD_DATA.alltime;

  const TABS = [
    { id: "alltime", label: "TOÀN THỜI GIAN 🌐" },
    { id: "season",  label: "MÙA GIẢI 🏆" },
    { id: "month",   label: "THÁNG NÀY 📅" },
    { id: "week",    label: "TUẦN NÀY ⚡" },
  ];

  return (
    <div>
      {/* Header & Controls */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 16, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <h2 style={{
            fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Bảng Xếp Hạng Clan
          </h2>
        </div>

        {/* Period Toggle */}
        <div style={{
          display: "inline-flex",
          background: "rgba(2,6,23,0.8)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
          padding: 5, gap: 4,
        }}>
          {TABS.map((tab) => {
            const active = period === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 800, fontSize: 11, letterSpacing: 1,
                  background: active
                    ? "linear-gradient(135deg, #f472b6, #f43f5e)"
                    : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.45)",
                  transition: "all 0.2s",
                  boxShadow: active ? "0 2px 10px rgba(244,114,182,0.35)" : "none",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {clans.map((clan) => {
          const isTop3 = clan.rank <= 3;

          return (
            <Link
              key={clan.id}
              href={`/clans/${clan.id}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                background: "rgba(10,10,24,0.8)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.35)";
                  e.currentTarget.style.background = "rgba(14,165,233,0.06)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "rgba(10,10,24,0.8)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                {/* Rank Badge */}
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "monospace", fontWeight: 900, fontSize: 13,
                  background: isTop3 ? MEDAL_BG[clan.rank] : "rgba(255,255,255,0.05)",
                  color: isTop3 ? MEDAL_COLOR[clan.rank] : "rgba(255,255,255,0.4)",
                  border: isTop3 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isTop3 ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                  userSelect: "none",
                }}>
                  {clan.rank}
                </div>

                {/* Clan Crest */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${clan.crestColor}cc, ${clan.crestColor}66)`,
                  border: `1px solid ${clan.crestColor}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 12, color: "white",
                  boxShadow: `0 4px 12px ${clan.crestColor}25`,
                  userSelect: "none",
                }}>
                  {clan.tag}
                </div>

                {/* Clan Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: "block", fontWeight: 800, fontSize: 13.5, color: "rgba(255,255,255,0.9)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {clan.name}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.38)" }}>
                    {clan.members} thành viên
                  </span>
                </div>

                {/* XP */}
                <div style={{
                  fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#fbbf24",
                  flexShrink: 0, textAlign: "right",
                }}>
                  {clan.xp.toLocaleString()} XP
                </div>

                {/* Delta */}
                <div style={{ width: 44, textAlign: "right", fontFamily: "monospace", fontWeight: 800, fontSize: 12, flexShrink: 0, userSelect: "none" }}>
                  {clan.delta > 0 && <span style={{ color: "#34d399" }}>▲ {clan.delta}</span>}
                  {clan.delta < 0 && <span style={{ color: "#f87171" }}>▼ {Math.abs(clan.delta)}</span>}
                  {clan.delta === 0 && <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
