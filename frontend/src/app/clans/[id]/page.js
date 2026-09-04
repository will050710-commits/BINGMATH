"use client";
import React, { useState, use } from "react";
import Link from "next/link";
import ClanHero from "@/components/clans/ClanHero";
import ClanSubnav from "@/components/clans/ClanSubnav";
import ClanMemberList from "@/components/clans/ClanMemberList";
import BattleCard from "@/components/clans/BattleCard";
import ClanLeaderboard from "@/components/clans/ClanLeaderboard";

const CLAN_PROFILES = {
  thth: {
    id: "thth", name: "Thánh Toán Học", tag: "#THTH", foundedDate: "03/2026",
    description: "Clan luyện đề thi chuyên toán và THPT QG, sinh hoạt mỗi tối thứ 3 & thứ 6. Chào đón mọi trình độ, ưu tiên các bạn thích Đấu Nhóm thời gian thực.",
    level: 24, currentXP: 8200, xpToNextLevel: 12000, memberCount: 86, totalXP: "142K", record: "23-6", isMember: true,
  },
  shb: {
    id: "shb", name: "Đội Số Học Bay", tag: "#SHB", foundedDate: "02/2026",
    description: "Đội ngũ chuyên toán hình không gian và đại số tổ hợp, giao lưu thi đấu và giải đề hàng tuần.",
    level: 21, currentXP: 6400, xpToNextLevel: 10000, memberCount: 72, totalXP: "128K", record: "19-8", isMember: false,
  },
  vtsp: {
    id: "vtsp", name: "Vòng Tròn Số Pi", tag: "#VTSP", foundedDate: "04/2026",
    description: "Môi trường học tập cởi mở cho học sinh lớp 10-11 thích giải đố toán học và tư duy logic.",
    level: 19, currentXP: 4900, xpToNextLevel: 9000, memberCount: 64, totalXP: "115K", record: "17-5", isMember: false,
  },
};

const panelStyle = {
  background: "linear-gradient(135deg, rgba(2,8,24,0.92) 0%, rgba(4,12,36,0.88) 100%)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 18,
  boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export default function ClanProfilePage({ params }) {
  const unwrappedParams = use(params);
  const clanId = unwrappedParams?.id || "thth";
  const [activeTab, setActiveTab] = useState("battles");
  const clan = CLAN_PROFILES[clanId] || CLAN_PROFILES.thth;

  return (
    <div style={{
      minHeight: "100vh",
      paddingBottom: 120, paddingTop: 32,
      paddingLeft: "clamp(16px, 4vw, 48px)",
      paddingRight: "clamp(16px, 4vw, 48px)",
      maxWidth: 1000, margin: "0 auto",
    }}>
      {/* Breadcrumb */}
      <nav style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
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
        <Link href="/clans" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          onMouseEnter={e => e.currentTarget.style.color = "#22d3ee"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          Math Clans
        </Link>
        <span>/</span>
        <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{clan.name}</span>
      </nav>

      {/* Clan Hero */}
      <ClanHero
        id={clan.id} name={clan.name} tag={clan.tag}
        foundedDate={clan.foundedDate} description={clan.description}
        level={clan.level} currentXP={clan.currentXP}
        xpToNextLevel={clan.xpToNextLevel} memberCount={clan.memberCount}
        totalXP={clan.totalXP} record={clan.record} isMember={clan.isMember}
      />

      {/* Tab Nav */}
      <ClanSubnav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panels */}
      <div style={{ marginTop: 28 }}>
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Rules panel */}
            <div style={{ ...panelStyle, padding: "clamp(20px, 4vw, 32px)" }}>
              <h3 style={{
                fontSize: 17, fontWeight: 800, color: "white", margin: "0 0 16px",
                background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                📜 Quy định &amp; Lịch sinh hoạt
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Sinh hoạt luyện đề chung lúc 20:00 thứ 3 và thứ 6 hàng tuần.",
                  "Tham gia ít nhất 1 trận Đấu Nhóm mỗi tuần để duy trì cấp bậc.",
                  "Hỗ trợ giải bài tập cho các thành viên mới trong kênh thảo luận.",
                ].map((rule, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                      background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "monospace", fontWeight: 900, fontSize: 9, color: "#22d3ee",
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <ClanMemberList />
          </div>
        )}
        {activeTab === "members" && <ClanMemberList />}
        {activeTab === "battles" && <BattleCard />}
        {activeTab === "leaderboard" && <ClanLeaderboard />}
      </div>
    </div>
  );
}
