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

const gradesThcs = [
  { label: "Grade 6", href: "/Cacbaitoan6", img: "/images/math6.webp" },
  { label: "Grade 7", href: "/Cacbaitoan7", img: "/images/math7.webp" },
  { label: "Grade 8", href: "/Cacbaitoan8", img: "/images/math8.webp" },
  { label: "Grade 9", href: "/Cacbaitoan9", img: "/images/math9.webp" },
];

const gradesThpt = [
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
          Bilingual Math Lessons / Bài Học Toán Song Ngữ
        </h1>
        <p style={{ color: "#93c5fd", fontSize: 18, marginBottom: 48 }}>
          Choose a class to learn / Chọn lớp học để bắt đầu
        </p>

        {/* Cấp 2 - Middle School */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#14b8a6", marginBottom: 24, borderBottom: "2px solid rgba(20, 184, 166, 0.3)", paddingBottom: 8 }}>
            🏫 Middle School / Cấp 2 (THCS)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {gradesThcs.map((g) => (
              <Link key={g.label} href={g.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", padding: "20px 24px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(20,184,166,0.2)"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <div style={{ width: 64, height: 64, background: "rgba(20, 184, 166, 0.1)", border: "1px solid rgba(20, 184, 166, 0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyValue: "center", fontSize: 24, fontWeight: "bold", color: "#14b8a6", justifyContent: "center" }}>
                    {g.label.replace("Grade ", "")}
                  </div>
                  <span style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>{g.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 24, color: "#14b8a6" }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Cấp 3 - High School */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#38bdf8", marginBottom: 24, borderBottom: "2px solid rgba(56, 189, 248, 0.3)", paddingBottom: 8 }}>
            🎓 High School / Cấp 3 (THPT)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {gradesThpt.map((g) => (
              <Link key={g.label} href={g.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", padding: "20px 24px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(56,189,248,0.2)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <div style={{ width: 64, height: 64, background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyValue: "center", fontSize: 24, fontWeight: "bold", color: "#38bdf8", justifyContent: "center" }}>
                    {g.label.replace("Grade ", "")}
                  </div>
                  <span style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>{g.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 24, color: "#38bdf8" }}>›</span>
                </div>
              </Link>
            ))}
          </div>
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
