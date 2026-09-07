"use client";
/**
 * JackpotBanner.js — Banner jackpot cộng đồng với SSE real-time
 */
import { useEffect, useRef, useState } from "react";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

function AnimatedCount({ value, duration = 600 }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const diff = value - prev.current;
    const steps = 20;
    const step = diff / steps;
    let cur = prev.current;
    let count = 0;
    const id = setInterval(() => {
      cur += step;
      count++;
      setDisplay(Math.round(cur));
      if (count >= steps) { clearInterval(id); setDisplay(value); prev.current = value; }
    }, duration / steps);
    return () => clearInterval(id);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export default function JackpotBanner() {
  const [data, setData] = useState({ jackpot: 0, online: 0, recent_wins: [] });
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      try {
        const es = new EventSource(`${BASE}/api/sse/mrm-live`);
        esRef.current = es;
        es.onopen = () => setConnected(true);
        es.onmessage = (e) => {
          try { const parsed = JSON.parse(e.data); setData(parsed); setConnected(true); } catch (_) {}
        };
        es.onerror = () => { setConnected(false); es.close(); setTimeout(connect, 5000); };
      } catch (_) {
        setData(prev => ({ jackpot: prev.jackpot + Math.floor(Math.random() * 3), online: 12 + Math.floor(Math.random() * 8), recent_wins: [] }));
      }
    };
    connect();
    const fallback = setInterval(() => {
      if (!connected) {
        setData(prev => ({ jackpot: prev.jackpot + Math.floor(Math.random() * 5) + 1, online: 8 + Math.floor(Math.random() * 20), recent_wins: prev.recent_wins }));
      }
    }, 5000);
    return () => { esRef.current?.close(); clearInterval(fallback); };
  }, []); // eslint-disable-line

  const nextSunday = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = (7 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });
  })();

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(234,179,8,0.04) 100%)",
      border: "1px solid rgba(251,191,36,0.25)",
      borderRadius: 16, padding: "14px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12,
      marginBottom: 16,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.04) 50%, transparent 100%)",
        animation: "jackpotShimmer 3s ease-in-out infinite" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 28, animation: "jackpotPulse 2s ease-in-out infinite" }}>🎰</div>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Hũ Tuần</div>
          <div style={{ fontSize: 24, fontWeight: 900, background: "linear-gradient(90deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
            <AnimatedCount value={data.jackpot} /> Xu
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        <div>Nổ hũ {nextSunday} lúc 20:00</div>
        {data.recent_wins?.length > 0 && <div style={{ color: "#4ade80", marginTop: 2 }}>🏆 {data.recent_wins[0]?.username || ""} vừa thắng!</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#4ade80" : "#f87171", boxShadow: connected ? "0 0 6px #4ade80" : "none", animation: connected ? "onlinePulse 2s ease-in-out infinite" : "none" }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: connected ? "#4ade80" : "#94a3b8" }}><AnimatedCount value={data.online} /></div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>đang online</div>
        </div>
      </div>
      <style>{`
        @keyframes jackpotShimmer { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
        @keyframes jackpotPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes onlinePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
