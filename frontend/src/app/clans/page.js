"use client";
import React, { useState } from "react";
import Link from "next/link";
import BattleCard from "@/components/clans/BattleCard";
import ClanLeaderboard from "@/components/clans/ClanLeaderboard";

const FEATURED_CLANS = [
  {
    id: "thth",
    name: "Thánh Toán Học",
    tag: "#THTH",
    level: 24,
    members: 86,
    totalXP: "142K XP",
    description: "Clan luyện đề thi chuyên toán và THPT QG, sinh hoạt mỗi tối thứ 3 & thứ 6.",
    crestColor: "#ec4899",
    crestBg: "linear-gradient(135deg, #ec4899, #7c3aed, #22d3ee)",
  },
  {
    id: "shb",
    name: "Đội Số Học Bay",
    tag: "#SHB",
    level: 21,
    members: 72,
    totalXP: "128K XP",
    description: "Đội ngũ chuyên toán hình không gian và đại số tổ hợp, giao lưu thi đấu hàng tuần.",
    crestColor: "#fbbf24",
    crestBg: "linear-gradient(135deg, #fbbf24, #f97316, #f43f5e)",
  },
  {
    id: "vtsp",
    name: "Vòng Tròn Số Pi",
    tag: "#VTSP",
    level: 19,
    members: 64,
    totalXP: "115K XP",
    description: "Môi trường học tập cởi mở cho học sinh lớp 10-11 thích giải đố toán học.",
    crestColor: "#34d399",
    crestBg: "linear-gradient(135deg, #34d399, #0ea5e9)",
  },
];

function FeaturedClanCard({ clan }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/clans/${clan.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${clan.crestColor}12 0%, rgba(10,10,24,0.95) 100%)`
            : "rgba(10,10,24,0.82)",
          backdropFilter: "blur(18px)",
          border: `1px solid ${hovered ? clan.crestColor + "44" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 18,
          padding: "24px 20px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          minHeight: 160,
          transition: "all 0.3s cubic-bezier(0.2,0.8,0.2,1)",
          transform: hovered ? "translateY(-5px)" : "none",
          boxShadow: hovered
            ? `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${clan.crestColor}18`
            : "0 4px 20px rgba(0,0,0,0.4)",
          cursor: "pointer",
        }}
      >
        {/* Header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: clan.crestBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 14, color: "white",
              boxShadow: `0 4px 16px ${clan.crestColor}44`,
              userSelect: "none", flexShrink: 0,
            }}>
              {clan.tag.replace("#", "").slice(0, 2)}
            </div>
            <div>
              <h4 style={{
                fontWeight: 800, fontSize: 16, color: "white",
                margin: 0, lineHeight: 1.25,
              }}>
                {clan.name}
              </h4>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#22d3ee", fontWeight: 700 }}>
                {clan.tag} · Cấp {clan.level}
              </span>
            </div>
          </div>

          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.52)",
            lineHeight: 1.65, margin: "0 0 16px 0",
          }}>
            {clan.description}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)",
          fontFamily: "monospace", fontSize: 12,
        }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>👥 {clan.members} thành viên</span>
          <span style={{ fontWeight: 800, color: "#fbbf24" }}>{clan.totalXP}</span>
        </div>
      </div>
    </Link>
  );
}

export default function ClansHubPage() {
  const [createHovered, setCreateHovered] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      paddingBottom: 120, paddingTop: 32,
      paddingLeft: "clamp(16px, 4vw, 48px)",
      paddingRight: "clamp(16px, 4vw, 48px)",
      maxWidth: 1100, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "flex-start",
        justifyContent: "space-between", gap: 20, marginBottom: 40,
      }}>
        <div>
          {/* Breadcrumb */}
          <nav style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
            fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)",
            userSelect: "none",
          }}>
            <Link href="/mrm" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "#22d3ee"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              MathMap Hub
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Math Clans</span>
          </nav>

          <h1 style={{
            fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 900, color: "white",
            margin: 0, display: "flex", alignItems: "center", gap: 12,
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            🛡️ Math Clans — Đấu Nhóm Toán Học
          </h1>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65,
            margin: "10px 0 0 0", maxWidth: 560,
          }}>
            Thành lập Clan, tập hợp bạn bè cùng trường, thách đấu các Clan khác trong trận chiến tính điểm &amp; thời gian thực.
          </p>
        </div>

        {/* Create Clan Button */}
        <Link href="/clans/create" style={{ textDecoration: "none", flexShrink: 0 }}>
          <button
            onMouseEnter={() => setCreateHovered(true)}
            onMouseLeave={() => setCreateHovered(false)}
            style={{
              padding: "13px 24px",
              background: createHovered
                ? "linear-gradient(135deg, #a78bfa, #f472b6)"
                : "linear-gradient(135deg, #ec4899, #a78bfa)",
              border: "none", borderRadius: 12,
              color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
              transition: "all 0.25s", transform: createHovered ? "translateY(-2px) scale(1.02)" : "none",
              boxShadow: createHovered
                ? "0 8px 24px rgba(236,72,153,0.45)"
                : "0 4px 16px rgba(236,72,153,0.3)",
              letterSpacing: 0.3,
            }}
          >
            ✨ TẠO CLAN MỚI
          </button>
        </Link>
      </div>

      {/* Featured Battle */}
      <div style={{ marginBottom: 48 }}>
        <BattleCard />
      </div>

      {/* Featured Clans Grid */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ fontSize: 22 }}>🌟</span>
          <h2 style={{
            fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Clan Nổi Bật
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 18,
        }}>
          {FEATURED_CLANS.map((clan) => (
            <FeaturedClanCard key={clan.id} clan={clan} />
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <ClanLeaderboard />
    </div>
  );
}
