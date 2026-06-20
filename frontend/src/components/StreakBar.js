"use client";
/**
 * StreakBar.js
 * Thanh hiển thị Streak + Level + XP luôn hiển thị ở header/sidebar.
 * Gọi /api/stats để lấy dữ liệu, cache trong sessionStorage 5 phút.
 *
 * Usage: <StreakBar />
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { getUserStats } from "@/lib/api";
import Link from "next/link";

const CACHE_KEY = "dm_streak_bar";
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

const LEAGUE_ICON = {
  Bronze: "🥉", Silver: "🥈", Gold: "🥇", Platinum: "💠", Diamond: "💎",
};

export default function StreakBar() {
  const { user, ready } = useAuth();
  const [gami, setGami] = useState(null);

  const loadStats = useCallback(async () => {
    if (!user) return;
    // Try cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setGami(data); return; }
      }
    } catch (_) {}

    const { ok, data } = await getUserStats();
    if (ok && data.gamification) {
      setGami(data.gamification);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data.gamification }));
      } catch (_) {}
    }
  }, [user]);

  useEffect(() => {
    if (ready && user) loadStats();
  }, [ready, user, loadStats]);

  if (!user || !gami) return null;

  const xpThresholds = [0,100,250,450,700,1000,1400,1900,2500,3200,4000];
  const cur = xpThresholds[Math.max(0, gami.level - 1)] || 0;
  const nxt = xpThresholds[gami.level] || xpThresholds[xpThresholds.length - 1];
  const xpPct = nxt > cur ? Math.min(100, ((gami.total_xp - cur) / (nxt - cur)) * 100) : 100;

  return (
    <Link href="/stats" style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(13,31,60,0.8)",
        border: "1px solid rgba(34,211,238,0.15)",
        borderRadius: 12, padding: "8px 14px",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        backdropFilter: "blur(6px)",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(34,211,238,0.15)"}
      >
        {/* Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#f97316" }}>
            {gami.current_streak}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)" }} />

        {/* Level + XP bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>
              {LEAGUE_ICON[gami.league]} Lv.{gami.level}
            </span>
            <span style={{ color: "#64748b" }}>{gami.total_xp?.toLocaleString()} XP</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", width: 80 }}>
            <div style={{
              width: `${xpPct}%`, height: "100%",
              background: "linear-gradient(90deg,#22d3ee,#6366f1)",
              borderRadius: 2,
            }} />
          </div>
        </div>

        {/* Freeze */}
        {gami.freeze_count > 0 && (
          <>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14 }}>🧊</span>
              <span style={{ fontSize: 12, color: "#7dd3fc", fontWeight: 700 }}>
                {gami.freeze_count}
              </span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
