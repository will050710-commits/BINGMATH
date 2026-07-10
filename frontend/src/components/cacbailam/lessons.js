/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
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

const gradeData = [
  {
    grade: "Grade 10", img: "/images/math10.webp", comingSoon: false,
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
    grade: "Grade 11", img: "/images/math11.webp", comingSoon: false,
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
    grade: "Grade 12", img: "/images/math12.webp", comingSoon: false,
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

export default function CacBaiLamPage() {
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
          3 sections per test · SAT Reading → IELTS T/F/NG → Grade Math · 60 minutes
        </p>
        <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
          {["📖 Section 1: SAT Reading (10 MC)", "📝 Section 2: IELTS True/False/NG (5 Q)", "🔢 Section 3: Math Short Answer (5 problems)"].map((s, i) => (
            <div key={i} style={{ background: "rgba(14,165,233,0.15)", color: "#7dd3fc", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>{s}</div>
          ))}
        </div>

        {gradeData.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 28 }}>
              {g.grade}{g.comingSoon ? " (Coming soon)" : ""}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,180,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", padding: 28 }}>
              {g.tests.map((test, idx) => {
                const card = (
                  <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", opacity: g.comingSoon ? 0.45 : 1, cursor: g.comingSoon ? "not-allowed" : "pointer", transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s" }}
                    onMouseEnter={e => { if (!g.comingSoon) { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,180,255,0.2)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(0,200,255,0.35)"; } }}
                    onMouseLeave={e => { if (!g.comingSoon) { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; } }}
                  >
                    <img src={g.img} alt={g.grade} style={{ width: "100%", height: 170, objectFit: "cover" }} />
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>Test {idx + 1}</div>
                      <div style={{ color: "#93c5fd", fontSize: 15, marginTop: 3 }}>{g.grade}</div>
                      <div style={{ fontSize: 13, color: "#7dd3fc", marginTop: 4 }}>15 questions · 3 sections · 60 min</div>
                      {!g.comingSoon && (
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#38bdf8", fontWeight: 600 }}>
                          Start Test →
                        </div>
                      )}
                      {g.comingSoon && (
                        <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>Coming soon</div>
                      )}
                    </div>
                  </div>
                );

                if (!g.comingSoon && test.href) {
                  return (
                    <Link key={idx} href={test.href} style={{ textDecoration: "none" }}
                      onClick={() => test.key && resetTimer(test.key)}> {/* ✅ FIX */}
                      {card}
                    </Link>
                  );
                }
                return <div key={idx}>{card}</div>;
              })}
            </div>

            {gi < gradeData.length - 1 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "48px 0 0" }} />
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