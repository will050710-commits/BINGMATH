/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import MathGraphSVG from "../../thpt/Cacbaitoan10/MathGraphSVG";
import { renderDuoIcon } from "@/components/DuoIcons";

const BENTO_CARDS = [
  {
    id: "ch1",
    size: "large",
    chapter: "Chapter 1",
    title: "Advanced Algebra Expressions",
    titleVi: "Bieu Thuc Dai So Nang Cao",
    graphType: "parabola",
    accentColor: "#14b8a6",
    glowColor: "rgba(20,184,166,0.25)",
    badge: "Algebra",
    lessons: [
      { thumb: "rocket", title: "Notable Algebraic Identities", titleVi: "Hang Dang Thuc Dang Nho", slug: "L8-C1-L1", done: true },
      { thumb: "book", title: "Polynomial Factorization", titleVi: "Phan Tich Da Thuc Thanh Nhan Tu", slug: "L8-C1-L2", done: true },
      { thumb: "book", title: "Algebraic Fractions", titleVi: "Phan Thuc Dai So", slug: "L8-C1-L3", done: true },
    ],
  },
  {
    id: "ch2",
    size: "large",
    chapter: "Chapter 2",
    title: "Linear Equations",
    titleVi: "Phuong Trinh Bac Nhat",
    graphType: "trig",
    accentColor: "#2dd4bf",
    glowColor: "rgba(45,212,191,0.25)",
    badge: "Equations",
    lessons: [
      { thumb: "rocket", title: "One-Variable Linear Equations", titleVi: "Phuong Trinh Bac Nhat Mot An", slug: "L8-C2-L1", done: true },
      { thumb: "book", title: "Equations with Variable Denominators", titleVi: "Phuong Trinh Chua An O Mau", slug: "L8-C2-L2", done: true },
      { thumb: "book", title: "Applied Linear Equation Problems", titleVi: "Bai Toan Ung Dung Phuong Trinh", slug: "L8-C2-L3", done: true },
    ],
  },
  {
    id: "ch3",
    size: "medium",
    chapter: "Chapter 3",
    title: "Inequalities",
    titleVi: "Bat Phuong Trinh",
    graphType: "inequality",
    accentColor: "#0d9488",
    glowColor: "rgba(13,148,136,0.25)",
    badge: "Inequalities",
    lessons: [
      { thumb: "rocket", title: "One-Variable Linear Inequalities", titleVi: "Bat Phuong Trinh Bac Nhat", slug: "L8-C3-L1", done: true },
      { thumb: "book", title: "Solving & Graphing Inequalities", titleVi: "Giai & Bieu Dien Bat Phuong Trinh", slug: "L8-C3-L2", done: true },
    ],
  },
  {
    id: "ch4",
    size: "medium",
    chapter: "Chapter 4",
    title: "Solid Geometry",
    titleVi: "Hinh Hoc Khong Gian",
    graphType: "vectors",
    accentColor: "#5eead4",
    glowColor: "rgba(94,234,212,0.25)",
    badge: "Geometry",
    lessons: [
      { thumb: "rocket", title: "Prisms & Cuboids", titleVi: "Hinh Lang Tru & Hinh Hop", slug: "L8-C4-L1", done: true },
      { thumb: "book", title: "Pyramids & Cones", titleVi: "Hinh Chop & Hinh Non", slug: "L8-C4-L2", done: true },
    ],
  },
];

function LessonPill({ lesson, accentColor }) {
  return (
    <Link href={`/${lesson.slug}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 10,
          padding: "7px 10px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = accentColor + "15";
          e.currentTarget.style.borderColor = accentColor + "40";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
        }}
      >
        <div style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 8,
          background: accentColor + "18",
          border: `1px solid ${accentColor}35`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}>
          {renderDuoIcon(lesson.thumb, { size: 18, color: accentColor })}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.82)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}>
            {lesson.title}
          </div>
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 1,
          }}>
            {lesson.titleVi}
          </div>
        </div>
        <div style={{ color: accentColor, fontSize: 11, opacity: 0.6, flexShrink: 0 }}>›</div>
      </motion.div>
    </Link>
  );
}

function BentoCard({ card }) {
  const firstDoneLesson = card.lessons.find((l) => l.done);
  const href = firstDoneLesson ? `/${firstDoneLesson.slug}` : null;

  return (
    <motion.div
      whileHover="hover"
      initial="initial"
      style={{
        height: "100%",
        background: "rgba(15, 23, 42, 0.55)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        cursor: href ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        gap: 14,
        backdropFilter: "blur(12px)",
      }}
      variants={{
        initial: { borderColor: "rgba(255,255,255,0.07)", boxShadow: "0 0px 0px rgba(0,0,0,0)", y: 0 },
        hover: { borderColor: card.accentColor + "50", boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${card.glowColor}`, y: -5 },
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 20% 20%, ${card.glowColor} 0%, transparent 65%)`,
          pointerEvents: "none", zIndex: 0,
        }}
      />
      <div style={{ position: "absolute", right: -10, top: -10, width: 140, height: 100, opacity: 0.28, zIndex: 0, pointerEvents: "none" }}>
        <MathGraphSVG type={card.graphType} color={card.accentColor} />
      </div>
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <div style={{
          display: "inline-block", fontSize: 10, fontWeight: 800,
          color: card.accentColor, background: card.accentColor + "18",
          border: `1px solid ${card.accentColor}44`, borderRadius: 20,
          padding: "3px 10px", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8,
        }}>
          {card.badge}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
          {card.chapter}
        </div>
        <h2 style={{ fontSize: card.size === "large" || card.size === "wide" ? 20 : 17, fontWeight: 800, color: "white", marginBottom: 2, lineHeight: 1.2 }}>
          {card.title}
        </h2>
        <div style={{ fontSize: 12, color: card.accentColor, fontWeight: 600, marginBottom: 14 }}>
          {card.titleVi}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {card.lessons.map((l) => (
            <LessonPill key={l.slug} lesson={l} accentColor={card.accentColor} />
          ))}
        </div>
      </div>
      {href && (
        <motion.div
          variants={{ initial: { opacity: 0, x: -4 }, hover: { opacity: 1, x: 0 } }}
          style={{ position: "absolute", bottom: 20, right: 20, color: card.accentColor, fontSize: 18, fontWeight: 700, zIndex: 1 }}
        >
          →
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CacBaiToan8Page() {
  const stats = [
    { label: "Chapters", value: "4" },
    { label: "Lessons", value: "10" },
    { label: "Bilingual", value: "EN/VI" },
    { label: "Mini Games", value: "Interactive" },
  ];

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(160deg, #020c1b 0%, #031a1a 15%, #042424 35%, #053030 50%, #053a36 65%, #04302c 80%, #022420 100%)",
      position: "relative", overflow: "hidden", color: "white",
    }}>
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 15% 25%, rgba(20,184,166,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(13,148,136,0.08) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
      </div>
      <div style={{ width: "1280px", maxWidth: "95%", margin: "0 auto", paddingTop: 50, paddingBottom: 80, position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/Cacbaitoan" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, padding: "7px 14px", marginBottom: 40,
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.4)"; e.currentTarget.style.background = "rgba(20,184,166,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              ← Chon lop
            </div>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 56 }}>
          <div style={{
            display: "inline-block", fontSize: 11, fontWeight: 800,
            color: "#14b8a6", background: "rgba(20,184,166,0.10)", border: "1px solid rgba(20,184,166,0.25)",
            borderRadius: 20, padding: "4px 14px", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 16,
          }}>
            Bilingual Curriculum · Grade 8 · THCS
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900,
            background: "linear-gradient(135deg, #ffffff 60%, #5eead4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 12, lineHeight: 1.1,
          }}>
            Toan Lop 8 — Grade 8
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 640, lineHeight: 1.7 }}>
            Chon bai hoc de bat dau. Moi the dai dien cho mot chuong trong chuong trinh Toan 8 song ngu Anh-Viet theo chuan THCS 2018.
          </p>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 0, marginTop: 28,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, overflow: "hidden", width: "fit-content",
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                padding: "12px 24px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "auto", gap: 20 }}>
          {BENTO_CARDS.map((card, i) => {
            const colSpanMap = { large: "span 6", medium: "span 6", small: "span 4", wide: "span 12" };
            const colSpan = colSpanMap[card.size] || "span 6";
            return (
              <motion.div
                key={card.id}
                style={{ gridColumn: colSpan }}
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <BentoCard card={card} />
              </motion.div>
            );
          })}
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns"] > div { grid-column: span 12 !important; }
        }
        @media (min-width: 901px) and (max-width: 1100px) {
          div[style*="gridTemplateColumns"] > div[style*="span 6"] { grid-column: span 6 !important; }
        }
      `}</style>
    </div>
  );
}
