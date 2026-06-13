/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";

const SHAPES = [
  { size: 120, left: "8%",  top: "15%", delay: "0s",   dur: "18s", shape: "pyramid",  color: "#00c8ff" },
  { size: 90,  left: "75%", top: "10%", delay: "3s",   dur: "22s", shape: "cube",     color: "#a78bfa" },
  { size: 70,  left: "55%", top: "60%", delay: "6s",   dur: "15s", shape: "diamond",  color: "#38bdf8" },
  { size: 100, left: "20%", top: "70%", delay: "1.5s", dur: "20s", shape: "triangle", color: "#818cf8" },
  { size: 60,  left: "88%", top: "55%", delay: "4s",   dur: "17s", shape: "pyramid",  color: "#67e8f9" },
  { size: 80,  left: "40%", top: "30%", delay: "8s",   dur: "24s", shape: "cube",     color: "#c4b5fd" },
];

function ShapesSVG({ shape, color }) {
  if (shape === "pyramid")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  if (shape === "cube")     return <svg viewBox="0 0 100 100" fill="none"><rect x="15" y="15" width="55" height="55" stroke={color} strokeWidth="2" fill={color+"18"}/><rect x="30" y="30" width="55" height="55" stroke={color} strokeWidth="1.5" fill="none"/><line x1="15" y1="15" x2="30" y2="30" stroke={color} strokeWidth="1.5"/><line x1="70" y1="15" x2="85" y2="30" stroke={color} strokeWidth="1.5"/><line x1="15" y1="70" x2="30" y2="85" stroke={color} strokeWidth="1.5"/><line x1="70" y1="70" x2="85" y2="85" stroke={color} strokeWidth="1.5"/></svg>;
  if (shape === "diamond")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,50 50,95 5,50" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill="none"/><line x1="50" y1="5" x2="50" y2="90" stroke={color} strokeWidth="1" opacity="0.5"/></svg>;
}

const grades = [
  { label: "Grade 10", href: "/Cacbaitoan10", img: "/images/math10.webp" },
  { label: "Grade 11", href: "/Cacbaitoan11", img: "/images/math11.webp" },
  { label: "Grade 12", href: "/Cacbaitoan12", img: "/images/math12.webp" },
];

export default function CacbailamPage() {
  return (
    <div style={{ width: "100%", background: "#0a0a1a", display: "flex", justifyContent: "center", minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Floating shapes */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {SHAPES.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.18 + (i % 2) * 0.06, filter: `drop-shadow(0 0 18px ${s.color}bb) drop-shadow(0 0 6px ${s.color}66)`, animation: `floatShape ${s.dur} ${s.delay} ease-in-out infinite alternate` }}>
            <ShapesSVG shape={s.shape} color={s.color} />
          </div>
        ))}
      </div>

      <div style={{ width: "1200px", maxWidth: "95%", color: "white", paddingTop: 60, paddingBottom: 80, position: "relative", zIndex: 1 }}>

        {/* Back button */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "7px 14px", marginBottom: 32,
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(56,189,248,0.1)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            ← Trang chủ
          </div>
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 8, letterSpacing: 1 }}>
          Bilingual Math Lessons for High School Students
        </h1>
        <p style={{ color: "#93c5fd", fontSize: 18, marginBottom: 48 }}>
          Choose a class to learn
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {grades.map((g) => (
            <Link key={g.label} href={g.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 32, background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,180,255,0.1)", border: "1px solid rgba(255,255,255,0.13)", padding: "28px 36px", cursor: "pointer", transition: "box-shadow 0.2s ease, border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,180,255,0.25)"; e.currentTarget.style.borderColor = "rgba(0,200,255,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,180,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; }}
              >
                <img src={g.img} alt={g.label} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 10 }} />
                <span style={{ fontSize: 36, fontWeight: "bold", color: "white" }}>{g.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 28, color: "#7dd3fc" }}>›</span>
              </div>
            </Link>
          ))}
        </div>

        <style jsx>{`
          @keyframes floatShape {
            0%   { transform: translateY(0px) rotate(0deg); }
            50%  { transform: translateY(-28px) rotate(8deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
