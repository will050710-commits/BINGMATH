"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { resolveApiBase } from "@/lib/apiBase";
import ClanHero from "@/components/clans/ClanHero";
import ClanSubnav from "@/components/clans/ClanSubnav";
import ClanMemberList from "@/components/clans/ClanMemberList";
import BattleCard from "@/components/clans/BattleCard";
import ClanLeaderboard from "@/components/clans/ClanLeaderboard";

const BASE = resolveApiBase();

function formatCompactXP(val) {
  const n = Number(val || 0);
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

function normalizeClanProfile(raw, fallbackId) {
  if (!raw || typeof raw !== "object") return null;
  const created = raw.created_at || raw.foundedDate || "";
  let foundedDate = "—";
  if (created) {
    const d = new Date(created);
    foundedDate = Number.isNaN(d.getTime())
      ? String(created)
      : `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  const wins = Number(raw.wins || 0);
  const losses = Number(raw.losses || 0);
  return {
    id: raw.id || fallbackId,
    name: raw.name || `Clan ${fallbackId}`,
    tag: raw.tag ? (String(raw.tag).startsWith("#") ? raw.tag : `#${raw.tag}`) : "#CLAN",
    foundedDate,
    description: raw.description || "Clan học tập & thi đấu toán học trên DuoMath.",
    level: Number(raw.level || 1),
    currentXP: Number(raw.current_xp ?? raw.currentXP ?? 0),
    xpToNextLevel: Number(raw.xp_to_next ?? raw.xpToNextLevel ?? 1000),
    memberCount: Number(raw.member_count ?? raw.memberCount ?? (Array.isArray(raw.members) ? raw.members.length : 0)),
    totalXP: typeof raw.totalXP === "string" ? raw.totalXP : formatCompactXP(raw.total_xp),
    record: raw.record || `${wins}-${losses}`,
    isMember: Boolean(raw.isMember || raw.is_member),
    members: Array.isArray(raw.members) ? raw.members : undefined,
  };
}

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
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${BASE}/api/clans/${encodeURIComponent(clanId)}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setClan(normalizeClanProfile(data, clanId));
        }
      })
      .catch(() => {
        if (!cancelled) setClan(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clanId]);

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
        <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
          {clan ? clan.name : loading ? "Đang tải..." : clanId}
        </span>
      </nav>

      {loading && (
        <div style={{ ...panelStyle, padding: 32, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
          Đang tải thông tin Clan...
        </div>
      )}

      {!loading && !clan && (
        <div style={{ ...panelStyle, padding: 32, textAlign: "center", color: "rgba(255,255,255,0.65)" }}>
          <h3 style={{ margin: "0 0 8px", color: "white", fontSize: 18 }}>Không tìm thấy Clan</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "rgba(255,255,255,0.45)" }}>
            Clan <code style={{ color: "#22d3ee" }}>{clanId}</code> chưa tồn tại hoặc đã bị giải tán.
          </p>
          <Link href="/clans" style={{ color: "#22d3ee", fontWeight: 700, fontSize: 13.5 }}>
            ← Quay lại danh sách Math Clans
          </Link>
        </div>
      )}

      {!loading && clan && (
        <>
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
                <ClanMemberList clanId={clanId} members={clan.members} />
              </div>
            )}
            {activeTab === "members" && <ClanMemberList clanId={clanId} members={clan.members} />}
            {activeTab === "battles" && <BattleCard />}
            {activeTab === "leaderboard" && <ClanLeaderboard />}
          </div>
        </>
      )}
    </div>
  );
}
