/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { Component } from "react";

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

// ─── LESSON REGISTRY ───────────────────────────────────────────────────────────
// Each lesson has:
//   title  – displayed on the card
//   slug   – used as the URL: /cacbailam10/[slug]
//   done   – true = clickable card | false = "coming soon" (greyed out)
// ─────────────────────────────────────────────────────────────────────────────

const sections = [
  {
    section: "Section: Algebra and Elements of Calculus",
    chapters: [
      {
        title: "Chapter 1: Propositions and Sets",
        lessons: [
          { title: "Mathematical Propositions",             slug: "Menh-de",              done: true  },
          { title: "Sets",                                  slug: "Tap-hop",              done: true  },
          { title: "Set Operations",                        slug: "phep-toan-tap-hop",    done: true  },
          { title: "Practice & Review – Chapter 1",         slug: "OnTapChuong1",      done: true },
        ],
      },
      {
        title: "Chapter 2: Linear Inequalities and Systems with 2 Variables",
        lessons: [
          { title: "Linear Inequalities in Two Variables",          slug: "Bpt-bac-nhat-2-an",   done: true },
          { title: "Systems of Linear Inequalities in Two Variables",slug: "Lesson5_HeBPTBacNhatHaiAn",done: true },
          { title: "Practice & Review – Chapter 2",                  slug: "chuong2-10",       done: true },
        ],
      },
      {
        title: "Chapter 3: Quadratic Functions and Graphs",
        lessons: [
          { title: "Functions and Graphs",     slug: "Ham-so-va-do-thi",  done: true },
          { title: "Quadratic Functions",      slug: "Ham-so-bac-hai",    done: true },
          { title: "Practice & Review – Chapter 3", slug: "on-tap-chuong-3", done: true },
        ],
      },
    ],
  },
  {
    section: "Section: Geometry and Measurement",
    chapters: [
      {
        title: "Chapter 4: Trigonometric Relationships in a Triangle",
        lessons: [
          { title: "Trigonometric Values (0°–180°)",     slug: "gia-tri-luong-giac",   done: true },
          { title: "Law of Cosines",                     slug: "Lesson10_DinhLiCosin",        done: true },
          { title: "Law of Sines",                       slug: "Lesson11_DinhLiSin",          done: true },
          { title: "Solving Triangles & Applications",   slug: "Lesson12_GiaiTamGiac",        done: true },
          { title: "Practice & Review – Chapter 4",      slug: "OnTapChuong4",      done: true },
        ],
      },
      {
        title: "Chapter 5: Vectors",
        lessons: [
          { title: "Introduction to Vectors",            slug: "Lesson13_KhaiNiemVecto",      done: true },
          { title: "Sum and Difference of Vectors",      slug: "Lesson14_TongHieuVecto",      done: true },
          { title: "Scalar Multiplication of a Vector",  slug: "Lesson15_TichSoVecto",        done: true },
          { title: "Dot Product of Two Vectors",         slug: "Lesson16_TichVoHuong",        done: true },
          { title: "Practice & Review – Chapter 5",      slug: "Lesson17_OnTapChuong5",      done: true },
        ],
      },
      {
        title: "Chapter 6: Geometry and Measurement",
        lessons: [
          { title: "Geometric Shapes & Properties",      slug: "Lesson18_HinhHocDoLuong1",  done: true },
          { title: "Area and Perimeter",                 slug: "Lesson19_HinhHocDoLuong2",  done: true },
          { title: "Practice & Review – Chapter 6",      slug: "Lesson20_OnTapChuong6",      done: true },
        ],
      },
    ],
  },
  {
    section: "Section: Algebra and Elements of Calculus",
    chapters: [
      {
        title: "Chapter 7: Quadratic Inequality with One Variable",
        lessons: [
          { title: "Sign of a Quadratic Trinomial",      slug: "Lesson21_DauTamThucBacHai",         done: true },
          { title: "Solving Quadratic Inequalities",     slug: "Lesson22_GiaiBPTBacHai",             done: true },
          { title: "Equations Reducible to Quadratic",   slug: "Lesson23_PhuongTrinhQuyVeBacHai",  done: true },
          { title: "Practice & Review – Chapter 7",      slug: "Lesson24_OnTapChuong7",              done: true },
        ],
      },
      {
        title: "Chapter 8: Combinatorial Algebra",
        lessons: [
          { title: "Addition & Multiplication Principles", slug: "Lesson25_QuyTacCongNhan",            done: true },
          { title: "Permutations, Arrangements & Combinations", slug: "Lesson26_HoanViChinhHopToHop",done: true },
          { title: "Binomial Theorem",                     slug: "Lesson27_NhiThucNewton",              done: true },
          { title: "Practice & Review – Chapter 8",        slug: "Lesson28_OnTapChuong8",              done: true },
        ],
      },
    ],
  },
  {
    section: "Section: Geometry and Measurement",
    chapters: [
      {
        title: "Chapter 9: Coordinate Method in a Plane",
        lessons: [
          { title: "Coordinates of a Vector",            slug: "Lesson29_ToaDoVecto",         done: true },
          { title: "Lines in the Coordinate Plane",      slug: "Lesson30_DuongThang",          done: true },
          { title: "Circles in the Coordinate Plane",    slug: "Lesson31_DuongTron",           done: true },
          { title: "Ellipse (Introduction)",             slug: "Lesson32_Elip",                 done: true },
          { title: "Practice & Review – Chapter 9",      slug: "Lesson33_OnTapChuong9",      done: true },
        ],
      },
    ],
  },
  {
    section: "Section: Statistics and Probability",
    chapters: [
      {
        title: "Chapter 10: Probability",
        lessons: [
          { title: "Sample Spaces and Events",           slug: "Lesson34_KhongGianMau",       done: true },
          { title: "Probability of an Event",            slug: "Lesson35_XacSuatBienCo",     done: true },
          { title: "Practice & Review – Chapter 10",     slug: "Lesson36_OnTapChuong10",     done: true },
        ],
      },
    ],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function CacBaiLamPage() {
  return (
    <div style={{ width: "100%", background: "#0a0a1a", display: "flex", justifyContent: "center", minHeight: "105vh", position: "relative", overflow: "hidden" }}>

      {/* Floating shapes */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {SHAPES.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.5, filter: `drop-shadow(0 0 12px ${s.color}88)`, animation: `floatShape ${s.dur} ${s.delay} ease-in-out infinite alternate` }}>
            <ShapesSVG shape={s.shape} color={s.color} />
          </div>
        ))}
      </div>

      <div style={{ width: "1200px", maxWidth: "95%", color: "white", paddingTop: 60, paddingBottom: 80, position: "relative", zIndex: 1 }}>
        <Link href="/Trangchu" style={{ textDecoration: "none", color: "white", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>
          ← {("Quay lại")}
        </Link>
        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 8, letterSpacing: 1, paddingTop: 20 }}>
          Grade 10
        </h1>
        <p style={{ color: "#93c5fd", fontSize: 18, marginBottom: 48 }}>
          Chọn chương để bắt đầu học.
        </p>

        {sections.map((s, si) => (
          <div key={si} style={{ marginBottom: 60 }}>

            {/* Section header */}
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
                          <img src="/images/math10.png" alt="Grade 10" style={{ width: "100%", height: 160, objectFit: "cover" }} />
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
                        <img src="/images/math10.png" alt="Grade 10" style={{ width: "100%", height: 160, objectFit: "cover", filter: "grayscale(80%)" }} />
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
