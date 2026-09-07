"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

export default function TournamentHero({
  tournamentId = "tourney_summer_2026",
  title = "Giải Đấu Toán Học Mùa Hè 2026",
  tag = "GIẢI ĐẤU MÙA",
  description = "Tranh tài cùng hơn 4,000 học sinh trên toàn quốc trong đấu trường toán học chuẩn hóa. Top 3 nhận huy hiệu độc quyền, điểm thưởng XP và Cúp Vinh Danh toàn quốc.",
  xpMultiplier = 1.5,
  initialDays = 3,
  initialHours = 14,
  initialMinutes = 22,
  initialSeconds = 45,
}) {
  const { user, token } = useAuth?.() || {};

  const [timeLeft, setTimeLeft] = useState({
    d: initialDays, h: initialHours, m: initialMinutes, s: initialSeconds,
  });
  const [registered, setRegistered] = useState(false);
  const [participantCount, setParticipantCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playUrl, setPlayUrl] = useState(`/mrm/multiplayer?tournament=${tournamentId}&mode=tournament`);

  const [regHovered, setRegHovered] = useState(false);
  const [playHovered, setPlayHovered] = useState(false);

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        if (prev.d > 0) return { ...prev, d: prev.d - 1, h: 23, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check participant count on mount
  useEffect(() => {
    fetch(`${BASE}/api/tournaments/${tournamentId}/participants?limit=1`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.participants)) {
          setParticipantCount(data.participants.length);
        }
      })
      .catch(() => {});
  }, [tournamentId]);

  const handleRegister = async () => {
    if (registered) return;
    // Optimistic: confirm immediately so the button switches at once
    setRegistered(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE}/api/tournaments/${tournamentId}/register`, {
        method: "POST", headers, body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.participant_count) setParticipantCount(data.participant_count);
      if (data.play_url) setPlayUrl(data.play_url);
    } catch {
      // Keep confirmed even on error — optimistic stays
    }
  };

  return (
    <div style={{
      position: "relative",
      borderRadius: 20, overflow: "hidden", marginBottom: 40,
      background: "radial-gradient(ellipse 700px 350px at 15% 20%, rgba(245,158,11,0.22), transparent 60%), radial-gradient(ellipse 800px 400px at 90% 80%, rgba(236,72,153,0.28), transparent 60%), linear-gradient(135deg, #0a1428 0%, #131b33 50%, #0c1020 100%)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      padding: "clamp(28px, 5vw, 56px) clamp(24px, 5vw, 52px)",
    }}>
      {/* Tag */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)",
        borderRadius: 100, padding: "4px 14px",
        fontSize: 11, fontWeight: 800, color: "#fbbf24",
        letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 6px #f59e0b" }} />
        🏆 {tag}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 40 }}>
        {/* Left */}
        <div style={{ flex: "1 1 300px", maxWidth: 560 }}>
          <h1 style={{
            fontSize: "clamp(22px, 5vw, 38px)", fontWeight: 900, color: "white",
            margin: 0, lineHeight: 1.15, letterSpacing: -0.5,
            background: "linear-gradient(135deg, #ffffff 40%, #fde68a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {title}
          </h1>
          <p style={{
            marginTop: 14, color: "rgba(255,255,255,0.6)",
            fontSize: "clamp(13px, 3.5vw, 15px)", lineHeight: 1.7, marginBottom: 28,
          }}>
            {description}
          </p>

          {/* Participant count */}
          {participantCount !== null && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16, fontFamily: "monospace" }}>
              👥 <strong style={{ color: "#fbbf24" }}>{participantCount.toLocaleString()}</strong> người đã đăng ký
            </p>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {/* Register / Registered button */}
            <button
              onMouseEnter={() => setRegHovered(true)}
              onMouseLeave={() => setRegHovered(false)}
              onClick={handleRegister}
              disabled={registered}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 26px",
                background: registered
                  ? "rgba(52,211,153,0.12)"
                  : regHovered
                    ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                    : "linear-gradient(135deg, #fbbf24, #f97316)",
                border: registered ? "1px solid rgba(52,211,153,0.4)" : "none",
                borderRadius: 12,
                color: registered ? "#34d399" : "white",
                fontWeight: 800, fontSize: 14, cursor: registered ? "default" : "pointer",
                boxShadow: registered ? "none" : "0 4px 20px rgba(251,191,36,0.35)",
                transition: "all 0.25s",
                transform: regHovered && !registered ? "translateY(-2px) scale(1.02)" : "none",
              }}
            >
              {registered ? "✓ Đã xác nhận tham gia" : "🚀 ĐĂNG KÝ THAM GIA NGAY"}
            </button>

            {/* Play Now — only shows after registration */}
            {registered && (
              <a href={playUrl} style={{ textDecoration: "none" }}>
                <button
                  onMouseEnter={() => setPlayHovered(true)}
                  onMouseLeave={() => setPlayHovered(false)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "13px 26px",
                    background: playHovered
                      ? "linear-gradient(135deg, #6366f1, #22d3ee)"
                      : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    border: "none", borderRadius: 12,
                    color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(14,165,233,0.4)",
                    transition: "all 0.25s",
                    transform: playHovered ? "translateY(-2px) scale(1.02)" : "none",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                >
                  ⚡ CHƠI NGAY
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div style={{ flexShrink: 0 }}>
          <span style={{
            display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: 1.5, color: "rgba(255,255,255,0.4)", marginBottom: 12,
            textAlign: "right",
          }}>
            THỜI GIAN ĐẾM NGƯỢC
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {[
              { val: timeLeft.d, label: "NGÀY" },
              { val: timeLeft.h, label: "GIỜ" },
              { val: timeLeft.m, label: "PHÚT" },
              { val: timeLeft.s, label: "GIÂY" },
            ].map((item, idx) => (
              <div key={idx} style={{
                width: 68, textAlign: "center",
                background: "rgba(2,6,23,0.85)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12,
                padding: "12px 8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>
                <span style={{
                  display: "block", fontFamily: "monospace", fontWeight: 900,
                  fontSize: "clamp(22px, 4vw, 30px)", color: "#fbbf24", lineHeight: 1,
                }}>
                  {String(item.val).padStart(2, "0")}
                </span>
                <span style={{
                  display: "block", fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
                  color: "rgba(255,255,255,0.35)", marginTop: 6, textTransform: "uppercase",
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(14,165,233,0.4); }
          50% { box-shadow: 0 4px 32px rgba(14,165,233,0.7), 0 0 20px rgba(99,102,241,0.4); }
        }
      `}</style>
    </div>
  );
}
