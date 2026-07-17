/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useState } from "react";
import { resetTimer } from "@/utils/testTimer";

const SHAPES = [
  { size: 110, left: "6%",  top: "12%", delay: "0s",   dur: "20s", shape: "pyramid",  color: "#00c8ff" },
  { size: 80,  left: "78%", top: "8%",  delay: "4s",   dur: "18s", shape: "cube",     color: "#a78bfa" },
  { size: 65,  left: "50%", top: "65%", delay: "7s",   dur: "16s", shape: "diamond",  color: "#38bdf8" },
  { size: 95,  left: "22%", top: "72%", delay: "2s",   dur: "22s", shape: "triangle", color: "#818cf8" },
  { size: 55,  left: "90%", top: "50%", delay: "5s",   dur: "14s", shape: "pyramid",  color: "#67e8f9" },
  { size: 75,  left: "38%", top: "28%", delay: "9s",   dur: "25s", shape: "cube",     color: "#c4b5fd" },
];
function ShapesSVG({ shape, color }) {
  if (shape === "pyramid")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  if (shape === "cube")     return <svg viewBox="0 0 100 100" fill="none"><rect x="15" y="15" width="55" height="55" stroke={color} strokeWidth="2" fill={color+"18"}/><rect x="30" y="30" width="55" height="55" stroke={color} strokeWidth="1.5" fill="none"/><line x1="15" y1="15" x2="30" y2="30" stroke={color} strokeWidth="1.5"/><line x1="70" y1="15" x2="85" y2="30" stroke={color} strokeWidth="1.5"/><line x1="15" y1="70" x2="30" y2="85" stroke={color} strokeWidth="1.5"/><line x1="70" y1="70" x2="85" y2="85" stroke={color} strokeWidth="1.5"/></svg>;
  if (shape === "diamond")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,50 50,95 5,50" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill="none"/><line x1="50" y1="5" x2="50" y2="90" stroke={color} strokeWidth="1" opacity="0.5"/></svg>;
}

const thptGradeData = [
  {
    grade: "Grade 10", img: "/images/math10.webp", level: "SAT", comingSoon: false,
    tests: [
      { href: "/L10-test1-section1", key: "reading-test-1" },
      { href: "/L10-test2-section1", key: "reading-test-2" },
      { href: "/L10-test3-section1", key: "reading-test-3" },
      { href: "/L10-test4-section1", key: "reading-test-4" },
      { href: "/L10-test5-section1", key: "reading-test-5" },
      { href: "/L10-test6-section1", key: "reading-test-6" },
    ],
  },
  {
    grade: "Grade 11", img: "/images/math11.webp", level: "SAT", comingSoon: false,
    tests: [
      { href: "/L11-test1-section1", key: "reading-test-L11-1" },
      { href: "/L11-test2-section1", key: "reading-test-L11-2" },
      { href: "/L11-test3-section1", key: "reading-test-L11-3" },
      { href: "/L11-test4-section1", key: "reading-test-L11-4" },
      { href: "/L11-test5-section1", key: "reading-test-L11-5" },
      { href: "/L11-test6-section1", key: "reading-test-L11-6" },
    ],
  },
  {
    grade: "Grade 12", img: "/images/math12.webp", level: "SAT", comingSoon: false,
    tests: [
      { href: "/L12-test1-section1", key: "reading-test-L12-1" },
      { href: "/L12-test2-section1", key: "reading-test-L12-2" },
      { href: "/L12-test3-section1", key: "reading-test-L12-3" },
      { href: "/L12-test4-section1", key: "reading-test-L12-4" },
      { href: "/L12-test5-section1", key: "reading-test-L12-5" },
      { href: "/L12-test6-section1", key: "reading-test-L12-6" },
    ],
  },
];

const thcsGradeData = [
  {
    grade: "Grade 6", img: "/images/math6.png", level: "Flyer", comingSoon: false,
    tests: [
      { href: "/L6-test1-section1", key: "reading-test-L6-1" },
      { href: "/L6-test2-section1", key: "reading-test-L6-2" },
      { href: "/L6-test3-section1", key: "reading-test-L6-3" },
    ],
  },
  {
    grade: "Grade 7", img: "/images/math7.png", level: "KET", comingSoon: false,
    tests: [
      { href: "/L7-test1-section1", key: "reading-test-L7-1" },
      { href: "/L7-test2-section1", key: "reading-test-L7-2" },
      { href: "/L7-test3-section1", key: "reading-test-L7-3" },
    ],
  },
  {
    grade: "Grade 8", img: "/images/math8.png", level: "PET", comingSoon: false,
    tests: [
      { href: "/L8-test1-section1", key: "reading-test-L8-1" },
      { href: "/L8-test2-section1", key: "reading-test-L8-2" },
      { href: "/L8-test3-section1", key: "reading-test-L8-3" },
    ],
  },
  {
    grade: "Grade 9", img: "/images/math9.png", level: "IELTS Academic (Easy)", comingSoon: false,
    tests: [
      { href: "/L9-test1-section1", key: "reading-test-L9-1" },
      { href: "/L9-test2-section1", key: "reading-test-L9-2" },
      { href: "/L9-test3-section1", key: "reading-test-L9-3" },
    ],
  },
];

export default function CacBaiLamPage() {
  const [activeTab, setActiveTab] = useState("thpt"); // "thpt" | "thcs"
  const currentData = activeTab === "thpt" ? thptGradeData : thcsGradeData;

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
          Bilingual Math Tests
        </h1>
        <p style={{ color: "#93c5fd", fontSize: 18, marginBottom: 12 }}>
          3 sections per test · SAT/Flyer/KET/PET/IELTS Reading → Bilingual Math · 60 minutes
        </p>
        <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
          {["📖 Section 1 & 2: Reading Comprehension", "🔢 Section 3: Math (thcs.toanmath.com & Sở GD)"].map((s, i) => (
            <div key={i} style={{ background: "rgba(14,165,233,0.15)", color: "#7dd3fc", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>{s}</div>
          ))}
        </div>

        {/* School Level Tabs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
          <button
            onClick={() => setActiveTab("thpt")}
            style={{
              background: activeTab === "thpt" ? "linear-gradient(135deg, #0ea5e9, #6366f1)" : "rgba(255,255,255,0.05)",
              color: activeTab === "thpt" ? "white" : "rgba(255,255,255,0.6)",
              border: "1px solid " + (activeTab === "thpt" ? "#38bdf8" : "rgba(255,255,255,0.1)"),
              borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", transition: "all 0.3s ease",
              boxShadow: activeTab === "thpt" ? "0 4px 20px rgba(14,165,233,0.3)" : "none"
            }}
          >
            🎓 Cấp 3 (Grades 10–12)
          </button>
          <button
            onClick={() => setActiveTab("thcs")}
            style={{
              background: activeTab === "thcs" ? "linear-gradient(135deg, #0d9488, #10b981)" : "rgba(255,255,255,0.05)",
              color: activeTab === "thcs" ? "white" : "rgba(255,255,255,0.6)",
              border: "1px solid " + (activeTab === "thcs" ? "#2dd4bf" : "rgba(255,255,255,0.1)"),
              borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", transition: "all 0.3s ease",
              boxShadow: activeTab === "thcs" ? "0 4px 20px rgba(13,148,136,0.3)" : "none"
            }}
          >
            🏫 Cấp 2 (Grades 6–9)
          </button>
        </div>

        {currentData.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: "800", color: "white", margin: 0 }}>
                {g.grade}{g.comingSoon ? " (Coming soon)" : ""}
              </h2>
              <div style={{ background: activeTab === "thpt" ? "rgba(14,165,233,0.2)" : "rgba(13,148,136,0.2)", color: activeTab === "thpt" ? "#38bdf8" : "#2dd4bf", border: "1px solid " + (activeTab === "thpt" ? "rgba(14,165,233,0.4)" : "rgba(13,148,136,0.4)"), borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>
                Level: {g.level}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", padding: 28 }}>
              {g.tests.map((test, idx) => {
                const card = (
                  <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", opacity: g.comingSoon ? 0.45 : 1, cursor: g.comingSoon ? "not-allowed" : "pointer", transition: "box-shadow 0.3s, transform 0.3s, border-color 0.3s" }}
                    onMouseEnter={e => { if (!g.comingSoon) { e.currentTarget.style.boxShadow = activeTab === "thpt" ? "0 8px 32px rgba(14,165,233,0.25)" : "0 8px 32px rgba(13,148,136,0.25)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = activeTab === "thpt" ? "rgba(56,189,248,0.4)" : "rgba(45,212,191,0.4)"; } }}
                    onMouseLeave={e => { if (!g.comingSoon) { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; } }}
                  >
                    <img src={g.img} alt={g.grade} style={{ width: "100%", height: 170, objectFit: "cover" }} />
                    <div style={{ padding: "20px" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Test {idx + 1}</div>
                      <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>{g.grade}</div>
                      <div style={{ fontSize: 13, color: activeTab === "thpt" ? "#38bdf8" : "#2dd4bf", marginTop: 6, fontWeight: "600" }}>13 questions · 3 sections · 60 min</div>
                      {!g.comingSoon && (
                        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: activeTab === "thpt" ? "#38bdf8" : "#2dd4bf", fontWeight: 700 }}>
                          Bắt đầu làm bài →
                        </div>
                      )}
                      {g.comingSoon && (
                        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>Coming soon</div>
                      )}
                    </div>
                  </div>
                );

                if (!g.comingSoon && test.href) {
                  return (
                    <Link key={idx} href={test.href} style={{ textDecoration: "none" }}
                      onClick={() => test.key && resetTimer(test.key)}>
                      {card}
                    </Link>
                  );
                }
                return <div key={idx}>{card}</div>;
              })}
            </div>

            {gi < currentData.length - 1 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "48px 0 0" }} />
            )}
          </div>
        ))}

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