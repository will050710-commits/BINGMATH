"use client";
import React from "react";
import Link from "next/link";
import TournamentHero from "@/components/events/TournamentHero";
import RulesRewards from "@/components/events/RulesRewards";
import TournamentLeaderboard from "@/components/events/TournamentLeaderboard";
import HallOfFame from "@/components/events/HallOfFame";
import EventList from "@/components/events/EventList";

const TOURNAMENT_ID = "tourney_summer_2026";

export default function EventsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      paddingBottom: 120, paddingTop: 32,
      paddingLeft: "clamp(16px, 4vw, 48px)",
      paddingRight: "clamp(16px, 4vw, 48px)",
      maxWidth: 1100, margin: "0 auto",
    }}>
      {/* Breadcrumb */}
      <nav style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 32,
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
        <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Sự Kiện &amp; Giải Đấu</span>
      </nav>

      {/* 1. Banner giải đấu chính + đăng ký + Chơi Ngay */}
      <TournamentHero tournamentId={TOURNAMENT_ID} xpMultiplier={1.5} />

      {/* 2. Thể lệ + Cơ cấu giải thưởng — đưa lên sát sau hero */}
      <RulesRewards />

      {/* 3. Bảng xếp hạng giải đấu đang diễn ra */}
      <TournamentLeaderboard tournamentId={TOURNAMENT_ID} xpMultiplier={1.5} />

      {/* 4. Bảng vinh danh mùa trước */}
      <HallOfFame />

      {/* Divider */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, margin: "40px 0 28px",
      }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap",
        }}>
          Các Sự Kiện &amp; Thử Thách Khác
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* 5. Các sự kiện khác — đẩy xuống dưới */}
      <EventList />
    </div>
  );
}
