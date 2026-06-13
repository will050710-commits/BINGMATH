/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";

const SHAPES = [
  { size: 110, left: "7%",  top: "14%", delay: "0s",   dur: "19s", shape: "pyramid",  color: "#00c8ff" },
  { size: 85,  left: "76%", top: "9%",  delay: "4s",   dur: "21s", shape: "cube",     color: "#a78bfa" },
  { size: 68,  left: "52%", top: "63%", delay: "7s",   dur: "16s", shape: "diamond",  color: "#38bdf8" },
  { size: 90,  left: "21%", top: "70%", delay: "2s",   dur: "23s", shape: "triangle", color: "#818cf8" },
  { size: 58,  left: "89%", top: "48%", delay: "5s",   dur: "14s", shape: "pyramid",  color: "#67e8f9" },
  { size: 78,  left: "36%", top: "27%", delay: "9s",   dur: "26s", shape: "cube",     color: "#c4b5fd" },
];

function ShapesSVG({ shape, color }) {
  if (shape === "pyramid")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  if (shape === "cube")     return <svg viewBox="0 0 100 100" fill="none"><rect x="15" y="15" width="55" height="55" stroke={color} strokeWidth="2" fill={color+"18"}/><rect x="30" y="30" width="55" height="55" stroke={color} strokeWidth="1.5" fill="none"/><line x1="15" y1="15" x2="30" y2="30" stroke={color} strokeWidth="1.5"/><line x1="70" y1="15" x2="85" y2="30" stroke={color} strokeWidth="1.5"/><line x1="15" y1="70" x2="30" y2="85" stroke={color} strokeWidth="1.5"/><line x1="70" y1="70" x2="85" y2="85" stroke={color} strokeWidth="1.5"/></svg>;
  if (shape === "diamond")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,50 50,95 5,50" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill="none"/><line x1="50" y1="5" x2="50" y2="90" stroke={color} strokeWidth="1" opacity="0.5"/></svg>;
}

const sections = [
  {
    section: "Section: Algebra and Elements of Calculus",
    chapters: [
      {
        title: "Chapter 1: Applications of Derivatives for Graphing Functions",
        lessons: [
          { title: "Monotonicity & Extremum of Functions", slug: "L12-C1-L1", done: true },
          { title: "Maximum & Minimum Values of Functions", slug: "L12-C1-L2", done: false },
          { title: "Asymptotes of Graphs", slug: "L12-C1-L3", done: false },
          { title: "Surveying & Graphing Functions", slug: "L12-C1-L4", done: false },
          { title: "Practice & Review – Chapter 1", slug: "L12-C1-L5", done: false },
        ],
      },
    ],
  },
  {
    section: "Section: Geometry and Measurement",
    chapters: [
      {
        title: "Chapter 2: Vectors and Coordinate System in Space",
        lessons: [
          { title: "Vectors in Space", slug: "L12-C2-L1", done: false },
          { title: "Coordinate System in Space", slug: "L12-C2-L2", done: false },
          { title: "Coordinate Expressions of Vector Operations", slug: "L12-C2-L3", done: false },
          { title: "Practice & Review – Chapter 2", slug: "L12-C2-L4", done: false },
        ],
      },
    ],
  },
  {
    section: "Section: Statistics and Probability",
    chapters: [
      {
        title: "Chapter 3: Measures of Dispersion for Grouped Data",
        lessons: [
          { title: "Range & Interquartile Range of Grouped Data", slug: "L12-C3-L1", done: false },
          { title: "Variance & Standard Deviation of Grouped Data", slug: "L12-C3-L2", done: false },
          { title: "Practice & Review – Chapter 3", slug: "L12-C3-L3", done: false },
        ],
      },
    ],
  },
  {
    section: "Section: Algebra and Elements of Calculus (Continued)",
    chapters: [
      {
        title: "Chapter 4: Antiderivatives & Integrals",
        lessons: [
          { title: "Antiderivatives", slug: "L12-C4-L1", done: false },
          { title: "Integrals", slug: "L12-C4-L2", done: false },
          { title: "Geometric Applications of Integrals", slug: "L12-C4-L3", done: false },
          { title: "Practice & Review – Chapter 4", slug: "L12-C4-L4", done: false },
        ],
      },
    ],
  },
  {
    section: "Section: Geometry and Measurement (Continued)",
    chapters: [
      {
        title: "Chapter 5: Planes, Lines & Spheres in Space",
        lessons: [
          { title: "Equations of Planes", slug: "L12-C5-L1", done: false },
          { title: "Equations of Lines", slug: "L12-C5-L2", done: false },
          { title: "Equations of Spheres", slug: "L12-C5-L3", done: false },
          { title: "Practice & Review – Chapter 5", slug: "L12-C5-L4", done: false },
        ],
      },
    ],
  },
  {
    section: "Section: Statistics and Probability (Continued)",
    chapters: [
      {
        title: "Chapter 6: Probability & Statistics Elements",
        lessons: [
          { title: "Conditional Probability", slug: "L12-C6-L1", done: false },
          { title: "Total Probability & Bayes' Formula", slug: "L12-C6-L2", done: false },
          { title: "Practice & Review – Chapter 6", slug: "L12-C6-L3", done: false },
        ],
      },
    ],
  },
];

export default function CacBaiLamPage() {
  return (
    <div style={{ width: "100%", background: "#0a0a1a", display: "flex", justifyContent: "center", minHeight: "105vh", position: "relative", overflow: "hidden" }}>

      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {SHAPES.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.18 + (i % 2) * 0.06, filter: `drop-shadow(0 0 18px ${s.color}bb) drop-shadow(0 0 6px ${s.color}66)`, animation: `floatShape ${s.dur} ${s.delay} ease-in-out infinite alternate` }}>
            <ShapesSVG shape={s.shape} color={s.color} />
          </div>
        ))}
      </div>

      <div style={{ width: "1200px", maxWidth: "95%", color: "white", paddingTop: 60, paddingBottom: 80, position: "relative", zIndex: 1 }}>
        <Link href="/Cacbaitoan" style={{ textDecoration: "none" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "7px 14px", marginBottom: 24,
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(56,189,248,0.1)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            ← Chọn khối lớp
          </div>
        </Link>
        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 8, letterSpacing: 1, paddingTop: 0 }}>
          Grade 12
        </h1>
        <p style={{ color: "#93c5fd", fontSize: 18, marginBottom: 48 }}>
          Chọn chương để bắt đầu học.
        </p>

        {sections.map((s, si) => (
          <div key={si} style={{ marginBottom: 60 }}>
            <div style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#7dd3fc",
              borderLeft: "4px solid #0ea5e9",
              paddingLeft: 16,
              marginBottom: 32,
            }}>
              {s.section}
            </div>

            {s.chapters.map((ch) => (
              <div key={ch.title} style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#bae6fd", marginBottom: 20 }}>
                  {ch.title}
                </h2>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 24,
                }}>
                  {ch.lessons.map((lesson, idx) => (
                    lesson.done ? (
                      <Link
                        key={lesson.slug}
                        href={`/${lesson.slug}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            background: "rgba(255,255,255,0.07)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.13)",
                            borderRadius: 10,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "box-shadow 0.2s ease, border-color 0.2s",
                            height: "100%",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,180,255,0.22)"; e.currentTarget.style.borderColor = "rgba(0,200,255,0.4)"; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; }}
                        >
                          <img src="/images/math12.webp" alt="Grade 12" style={{ width: "100%", height: 160, objectFit: "cover" }} />
                          <div style={{ padding: "16px 20px" }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>
                              Lesson {idx + 1}
                            </div>
                            <div style={{ color: "#93c5fd", fontSize: 14, margin: "4px 0 6px" }}>
                              {lesson.title}
                            </div>
                            <div style={{ fontSize: 14, color: "#38bdf8", fontWeight: 500 }}>
                              Click to learn →
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div
                        key={lesson.slug}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 10,
                          overflow: "hidden",
                          cursor: "not-allowed",
                          opacity: 0.5,
                          height: "100%",
                        }}
                      >
                        <img src="/images/math12.webp" alt="Grade 12" style={{ width: "100%", height: 160, objectFit: "cover", filter: "grayscale(80%)" }} />
                        <div style={{ padding: "16px 20px" }}>
                          <div style={{ fontSize: 18, fontWeight: 600, color: "#64748b" }}>
                            Lesson {idx + 1}
                          </div>
                          <div style={{ color: "#475569", fontSize: 14, margin: "4px 0 6px" }}>
                            {lesson.title}
                          </div>
                          <div style={{ fontSize: 13, color: "#334155" }}>
                            🔜 Coming soon
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}

            {si < sections.length - 1 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "20px 0 40px" }} />
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
