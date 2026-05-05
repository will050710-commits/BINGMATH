/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { clearTestSession } from "@/utils/testTimer";

const gradeData = [
  {
    grade: "Grade 10", img: "/images/math10.png", comingSoon: false,
    tests: [
      { href: "/section1-L10",   key: "reading-test-1" },
      { href: "/section1-L10-2", key: "reading-test-2" },
      { href: "/section1-L10-3", key: "reading-test-3" },
      { href: "/section1-L10-4", key: "reading-test-4" },
      { href: "/section1-L10-5", key: "reading-test-5" },
      { href: "/section1-L10-6", key: "reading-test-6" },
    ],
  },
  {
    grade: "Grade 11", img: "/images/math11.png", comingSoon: false,
    tests: [
      { href: "/section1-L11",   key: "reading-test-L11-1" },
      { href: "/section1-L11-2", key: "reading-test-L11-2" },
      { href: "/section1-L11-3", key: "reading-test-L11-3" },
      { href: "/section1-L11-4", key: "reading-test-L11-4" },
      { href: "/section1-L11-5", key: "reading-test-L11-5" },
      { href: "/section1-L11-6", key: "reading-test-L11-6" },
    ],
  },
  {
    grade: "Grade 12", img: "/images/math12.png", comingSoon: true,
    tests: Array.from({ length: 6 }, (_, i) => ({ href: null, key: null })),
  },
];

export default function CacBaiLamPage() {
  return (
    <div style={{ width: "100%", background: "#ffffff", display: "flex", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>

        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "#0B4F5C", marginBottom: 8, letterSpacing: 1 }}>
          Bilingual Math Tests
        </h1>
        <p style={{ color: "#777", fontSize: 18, marginBottom: 12 }}>
          3 sections per test · SAT Reading → IELTS T/F/NG → Grade Math · 60 minutes
        </p>
        <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
          {["📖 Section 1: SAT Reading (10 MC)", "📝 Section 2: IELTS True/False/NG (5 Q)", "🔢 Section 3: Math Short Answer (5 problems)"].map((s, i) => (
            <div key={i} style={{ background: "#e8f4f6", color: "#0B4F5C", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>{s}</div>
          ))}
        </div>

        {gradeData.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#0B4F5C", marginBottom: 28 }}>
              {g.grade}{g.comingSoon ? " (Coming soon)" : ""}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28, background: "#f9f9f9", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 28 }}>
              {g.tests.map((test, idx) => {
                const card = (
                  <div style={{ background: "#ffffff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden", opacity: g.comingSoon ? 0.45 : 1, cursor: g.comingSoon ? "not-allowed" : "pointer", transition: "box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { if (!g.comingSoon) { e.currentTarget.style.boxShadow = "0 8px 24px rgba(11,79,92,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}}
                    onMouseLeave={e => { if (!g.comingSoon) { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}}
                  >
                    <img src={g.img} alt={g.grade} style={{ width: "100%", height: 170, objectFit: "cover" }} />
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#0B4F5C" }}>Test {idx + 1}</div>
                      <div style={{ color: "#777", fontSize: 15, marginTop: 3 }}>{g.grade}</div>
                      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>15 questions · 3 sections · 60 min</div>
                      {!g.comingSoon && (
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#0B4F5C", fontWeight: 600 }}>
                          Start Test →
                        </div>
                      )}
                      {g.comingSoon && (
                        <div style={{ marginTop: 10, fontSize: 12, color: "#bbb" }}>Coming soon</div>
                      )}
                    </div>
                  </div>
                );

                if (!g.comingSoon && test.href) {
                  return (
                    <Link key={idx} href={test.href} style={{ textDecoration: "none" }}
                      onClick={() => test.key && clearTestSession(test.key)}>
                      {card}
                    </Link>
                  );
                }
                return <div key={idx}>{card}</div>;
              })}
            </div>

            {gi < gradeData.length - 1 && (
              <div style={{ height: 1, background: "#e0e0e0", margin: "48px 0 0" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
