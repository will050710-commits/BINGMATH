"use client";
/**
 * GamificationHUD.js
 * Hiển thị sau khi hoàn thành bài test / minigame:
 *  - Streak + XP gained animation
 *  - Badge mới (nếu có)
 *  - Daily quest progress
 *
 * Usage:
 *   import GamificationHUD from "@/components/GamificationHUD";
 *   <GamificationHUD onClose={() => setShowHUD(false)} />
 */

import { useEffect, useState, useCallback } from "react";
import { streakCheckin, getDailyQuests } from "@/lib/api";

const TIER_COLORS = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold:   "#ffd700",
  platinum: "#e5e4e2",
};

const LEAGUE_GRADIENT = {
  Bronze:   "linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)",
  Silver:   "linear-gradient(135deg, #b0b0b0 0%, #707070 100%)",
  Gold:     "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
  Platinum: "linear-gradient(135deg, #a8d8ea 0%, #aa96da 100%)",
  Diamond:  "linear-gradient(135deg, #00d2ff 0%, #7928ca 100%)",
};

export default function GamificationHUD({ onClose, autoCloseMs = 8000 }) {
  const [state, setState] = useState(null);   // streak checkin response
  const [quests, setQuests] = useState([]);
  const [visible, setVisible] = useState(false);
  const [xpCount, setXpCount] = useState(0);

  const load = useCallback(async () => {
    const [checkinRes, questRes] = await Promise.all([
      streakCheckin(),
      getDailyQuests(),
    ]);
    if (checkinRes.ok) {
      setState(checkinRes.data);
      // Animate XP counter
      const target = checkinRes.data.xp_bonus || 0;
      let cur = 0;
      const step = Math.ceil(target / 20) || 1;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        setXpCount(cur);
        if (cur >= target) clearInterval(timer);
      }, 50);
    }
    if (questRes.ok) setQuests(questRes.data.quests || []);
    setVisible(true);
  }, []);

  useEffect(() => {
    load();
    if (autoCloseMs > 0) {
      const t = setTimeout(() => handleClose(), autoCloseMs);
      return () => clearTimeout(t);
    }
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    setVisible(false);
    setTimeout(() => onClose?.(), 350);
  }

  if (!state) return null;

  const { new_streak, freeze_used, streak_reset, gamification, recent_badges } = state;
  const { current_streak, total_xp, level, league, freeze_count } = gamification || {};

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(2, 12, 27, 0.82)",
      backdropFilter: "blur(8px)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.35s ease",
    }}>
      <div style={{
        background: "linear-gradient(145deg, #0d1f3c 0%, #0e3158 60%, #063d56 100%)",
        border: "1.5px solid rgba(34,211,238,0.25)",
        borderRadius: 24,
        padding: "32px 36px",
        minWidth: 340,
        maxWidth: 460,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(34,211,238,0.08)",
        animation: "hudSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 8 }}>
            {streak_reset ? "💔" : freeze_used ? "🧊" : new_streak >= 7 ? "🔥" : "✨"}
          </div>
          <h2 style={{
            fontSize: 22, fontWeight: 800,
            background: "linear-gradient(90deg,#22d3ee,#a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: 0,
          }}>
            {streak_reset
              ? "Streak bị gãy 😢"
              : freeze_used
              ? `Freeze token đã cứu streak! 🧊`
              : `Streak ${new_streak} ngày! 🔥`}
          </h2>
          {freeze_used && (
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
              Còn {freeze_count} Freeze token
            </p>
          )}
        </div>

        {/* XP Gained */}
        {xpCount > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginBottom: 20,
            background: "rgba(34,211,238,0.08)",
            borderRadius: 12, padding: "12px 20px",
            border: "1px solid rgba(34,211,238,0.18)",
          }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#22d3ee", lineHeight: 1 }}>
                +{xpCount} XP
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Tổng: {total_xp?.toLocaleString()} XP · Level {level}</div>
            </div>
          </div>
        )}

        {/* League badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: LEAGUE_GRADIENT[league] || LEAGUE_GRADIENT.Bronze,
          borderRadius: 20, padding: "6px 16px",
          fontSize: 13, fontWeight: 700, color: "#fff",
          marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}>
          🏆 {league} League
        </div>

        {/* New badges */}
        {recent_badges?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>
              🎖️ Badge mới đạt được
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {recent_badges.map((b) => (
                <div key={b.id} style={{
                  background: "rgba(255,215,0,0.08)",
                  border: `1.5px solid ${TIER_COLORS[b.tier] || "#ffd700"}`,
                  borderRadius: 12, padding: "8px 14px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 22 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TIER_COLORS[b.tier] || "#ffd700" }}>
                      {b.name_vi}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{b.math_term}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Quests progress */}
        {quests.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>
              📋 Nhiệm vụ hôm nay
            </div>
            {quests.map((q) => {
              const pct = Math.min(100, (q.current_value / q.target_value) * 100);
              return (
                <div key={q.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: q.is_completed ? "#4ade80" : "#cbd5e1" }}>
                      {q.is_completed ? "✅ " : ""}{q.quest_label_vi}
                    </span>
                    <span style={{ color: "#64748b" }}>
                      {q.current_value}/{q.target_value} · +{q.xp_reward} XP
                    </span>
                  </div>
                  <div style={{
                    height: 6, background: "rgba(255,255,255,0.06)",
                    borderRadius: 3, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: q.is_completed
                        ? "linear-gradient(90deg,#4ade80,#22d3ee)"
                        : "linear-gradient(90deg,#22d3ee,#6366f1)",
                      borderRadius: 3,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Close button */}
        <button onClick={handleClose} style={{
          width: "100%", padding: "12px 0",
          background: "linear-gradient(135deg,#22d3ee,#6366f1)",
          border: "none", borderRadius: 12,
          color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(34,211,238,0.25)",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={e => e.target.style.opacity = "0.85"}
        onMouseLeave={e => e.target.style.opacity = "1"}
        >
          Tiếp tục học 🚀
        </button>
      </div>

      <style>{`
        @keyframes hudSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
