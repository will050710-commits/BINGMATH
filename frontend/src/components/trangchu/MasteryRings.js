"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/authContext";

export default function MasteryRings() {
  const { user } = useAuth();
  const [prog, setProg] = useState({
    practice_count: 0,
    mastery_count: 0,
    socratic_count: 0,
    daily_xp_goal: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchProgress() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/gami/daily-progress`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProg(data);
        }
      } catch (err) {
        console.error("Failed to load daily progress:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [user]);

  if (!user || loading) return null;

  // Calculate percentages (capped at 100)
  const pctPractice = Math.min(100, (prog.practice_count / 10) * 100);
  const pctMastery = Math.min(100, (prog.mastery_count / 3) * 100);
  const pctSocratic = Math.min(100, (prog.socratic_count / 5) * 100);

  // SVG parameters
  const size = 160;
  const strokeWidth = 10;
  const center = size / 2;

  // Concentric rings configuration
  const rings = [
    {
      pct: pctPractice,
      r: 65,
      color: "#22d3ee", // Cyan
      label: "Luyện tập",
      val: `${prog.practice_count}/10`,
      icon: "📋"
    },
    {
      pct: pctMastery,
      r: 50,
      color: "#a78bfa", // Purple
      label: "Tinh thông",
      val: `${prog.mastery_count}/3`,
      icon: "⭐"
    },
    {
      pct: pctSocratic,
      r: 35,
      color: "#f472b6", // Pink
      label: "Học thuật",
      val: `${prog.socratic_count}/5`,
      icon: "💬"
    }
  ];

  return (
    <div style={{
      background: "rgba(13, 31, 60, 0.65)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 24,
      padding: 24,
      display: "flex",
      alignItems: "center",
      gap: 24,
      backdropFilter: "blur(20px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative subtle background glow */}
      <div style={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* SVG Rings Container */}
      <div style={{ position: "relative", width: size, height: size, zIndex: 1, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {rings.map((ring, idx) => {
            const circ = 2 * Math.PI * ring.r;
            const offset = circ - (ring.pct / 100) * circ;
            return (
              <g key={idx}>
                {/* Background Ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.r}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth={strokeWidth}
                />
                {/* Progress Ring */}
                <motion.circle
                  cx={center}
                  cy={center}
                  r={ring.r}
                  fill="transparent"
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 * idx }}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 4px ${ring.color})`
                  }}
                />
              </g>
            );
          })}
        </svg>
        {/* Center icon indicator */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 22,
          opacity: 0.85
        }}>
          🧠
        </div>
      </div>

      {/* Legend & Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, zIndex: 1, flexGrow: 1 }}>
        <h4 style={{
          margin: 0,
          fontSize: 14.5,
          fontWeight: 800,
          color: "#94a3b8",
          letterSpacing: 0.5,
          textTransform: "uppercase"
        }}>
          Chỉ tiêu hôm nay
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rings.map((ring, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: ring.color,
                boxShadow: `0 0 8px ${ring.color}`
              }} />
              <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)", fontWeight: 600, flexGrow: 1 }}>
                {ring.icon} {ring.label}
              </span>
              <span style={{ fontSize: 12.5, color: "white", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                {ring.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
