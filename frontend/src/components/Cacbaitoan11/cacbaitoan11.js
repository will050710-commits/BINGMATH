/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import MathGraphSVG from "../Cacbaitoan10/MathGraphSVG";
import { renderDuoIcon } from "../DuoIcons";

// ─── BENTO CARD DATA FOR GRADE 11 ───────────────────────────────────────────
const BENTO_CARDS = [
  {
    id: "ch1",
    size: "large",
    chapter: "Chapter 1",
    title: "Trigonometric Functions & Equations",
    titleVi: "Hàm Số Lượng Giác & Phương Trình",
    graphType: "trig",
    accentColor: "#38bdf8",
    glowColor: "rgba(56,189,248,0.25)",
    badge: "Trigonometry",
    lessons: [
      { thumb: "🚀", title: "Trigonometric Angles & Values", titleVi: "Góc Lượng Giác & Giá Trị", slug: "L11-C1-L1", done: true },
      { thumb: "📖", title: "Trigonometric Formulas", titleVi: "Công Thức Lượng Giác", slug: "L11-C1-L2", done: true },
      { thumb: "📖", title: "Trigonometric Functions & Graphs", titleVi: "Hàm Số Lượng Giác & Đồ Thị", slug: "L11-C1-L3", done: true },
      { thumb: "📖", title: "Basic Trigonometric Equations", titleVi: "Phương Trình Lượng Giác Cơ Bản", slug: "L11-C1-L4", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.1", titleVi: "Ôn Tập Chương 1", slug: "L11-C1-L5", done: true },
    ],
  },
  {
    id: "ch2",
    size: "medium",
    chapter: "Chapter 2",
    title: "Sequences & Progressions",
    titleVi: "Dãy Số & Cấp Số Cộng, Cấp Số Nhân",
    graphType: "parabola",
    accentColor: "#a78bfa",
    glowColor: "rgba(167,139,250,0.25)",
    badge: "Sequences",
    lessons: [
      { thumb: "🚀", title: "Sequences", titleVi: "Dãy Số", slug: "L11-C2-L1", done: true },
      { thumb: "📖", title: "Arithmetic Progressions", titleVi: "Cấp Số Cộng", slug: "L11-C2-L2", done: true },
      { thumb: "📖", title: "Geometric Progressions", titleVi: "Cấp Số Nhân", slug: "L11-C2-L3", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.2", titleVi: "Ôn Tập Chương 2", slug: "L11-C2-L4", done: true },
    ],
  },
  {
    id: "ch3",
    size: "medium",
    chapter: "Chapter 3",
    title: "Limits & Continuous Functions",
    titleVi: "Giới Hạn & Hàm Số Liên Tục",
    graphType: "inequality",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.25)",
    badge: "Limits",
    lessons: [
      { thumb: "🚀", title: "Limits of Sequences", titleVi: "Giới Hạn Dãy Số", slug: "L11-C3-L1", done: true },
      { thumb: "📖", title: "Limits of Functions", titleVi: "Giới Hạn Hàm Số", slug: "L11-C3-L2", done: true },
      { thumb: "📖", title: "Continuous Functions", titleVi: "Hàm Số Liên Tục", slug: "L11-C3-L3", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.3", titleVi: "Ôn Tập Chương 3", slug: "L11-C3-L4", done: true },
    ],
  },
  {
    id: "ch4",
    size: "wide",
    chapter: "Chapter 4",
    title: "Parallel Relations in Space",
    titleVi: "Quan Hệ Song Song Trong Không Gian",
    graphType: "vectors",
    accentColor: "#fbbf24",
    glowColor: "rgba(251,191,36,0.25)",
    badge: "Spatial Geometry",
    lessons: [
      { thumb: "🚀", title: "Lines & Planes in Space", titleVi: "Đường Thẳng & Mặt Phẳng", slug: "L11-C4-L1", done: true },
      { thumb: "📖", title: "Two Parallel Lines", titleVi: "Hai Đường Thẳng Song Song", slug: "L11-C4-L2", done: true },
      { thumb: "📖", title: "Line and Plane Parallel", titleVi: "Đường Thẳng Song Song Mặt Phẳng", slug: "L11-C4-L3", done: true },
      { thumb: "📖", title: "Two Parallel Planes", titleVi: "Hai Mặt Phẳng Song Song", slug: "L11-C4-L4", done: true },
      { thumb: "📖", title: "Parallel Projection", titleVi: "Phép Chiếu Song Song", slug: "L11-C4-L5", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.4", titleVi: "Ôn Tập Chương 4", slug: "L11-C4-L6", done: true },
    ],
  },
  {
    id: "ch5",
    size: "small",
    chapter: "Chapter 5",
    title: "Central Tendency Measures",
    titleVi: "Số Đặc Trưng Đo Xu Thế Trung Tâm",
    graphType: "venn",
    accentColor: "#f97316",
    glowColor: "rgba(249,115,22,0.25)",
    badge: "Statistics",
    lessons: [
      { thumb: "🚀", title: "Mean & Median of Grouped Data", titleVi: "Số Trung Bình & Trung Vị", slug: "L11-C5-L1", done: true },
      { thumb: "📖", title: "Quartiles & Mode of Grouped Data", titleVi: "Tứ Phân Vị & Mốt", slug: "L11-C5-L2", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.5", titleVi: "Ôn Tập Chương 5", slug: "L11-C5-L3", done: true },
    ],
  },
  {
    id: "ch6",
    size: "large",
    chapter: "Chapter 6",
    title: "Exponential & Logarithmic Functions",
    titleVi: "Hàm Số Mũ & Hàm Số Lôgarit",
    graphType: "parabola",
    accentColor: "#fb7185",
    glowColor: "rgba(251,113,133,0.25)",
    badge: "Exponents",
    lessons: [
      { thumb: "🚀", title: "Powers & Exponents", titleVi: "Lũy Thừa & Số Mũ", slug: "L11-C6-L1", done: true },
      { thumb: "📖", title: "Logarithms", titleVi: "Lôgarit", slug: "L11-C6-L2", done: true },
      { thumb: "📖", title: "Exponential & Logarithmic Functions", titleVi: "Hàm Số Mũ & Lôgarit", slug: "L11-C6-L3", done: true },
      { thumb: "📖", title: "Equations & Inequalities", titleVi: "Phương Trình & Bất Phương Trình", slug: "L11-C6-L4", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.6", titleVi: "Ôn Tập Chương 6", slug: "L11-C6-L5", done: true },
    ],
  },
  {
    id: "ch7",
    size: "medium",
    chapter: "Chapter 7",
    title: "Derivatives",
    titleVi: "Đạo Hàm",
    graphType: "trig",
    accentColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.25)",
    badge: "Calculus",
    lessons: [
      { thumb: "🚀", title: "Definition & Meaning of Derivatives", titleVi: "Định Nghĩa & Ý Nghĩa", slug: "L11-C7-L1", done: true },
      { thumb: "📖", title: "Rules of Differentiation", titleVi: "Quy Tắc Tính Đạo Hàm", slug: "L11-C7-L2", done: true },
      { thumb: "📖", title: "Second-Order Derivatives", titleVi: "Đạo Hàm Cấp Hai", slug: "L11-C7-L3", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.7", titleVi: "Ôn Tập Chương 7", slug: "L11-C7-L4", done: true },
    ],
  },
  {
    id: "ch8",
    size: "wide",
    chapter: "Chapter 8",
    title: "Perpendicular Relations in Space",
    titleVi: "Quan Hệ Vuông Góc Trong Không Gian",
    graphType: "vectors",
    accentColor: "#22d3ee",
    glowColor: "rgba(34,211,238,0.25)",
    badge: "Spatial Geometry",
    lessons: [
      { thumb: "🚀", title: "Two Perpendicular Lines", titleVi: "Hai Đường Thẳng Vuông Góc", slug: "L11-C8-L1", done: true },
      { thumb: "📖", title: "Line Perpendicular to Plane", titleVi: "Đường Thẳng Vuông Góc Mặt Phẳng", slug: "L11-C8-L2", done: true },
      { thumb: "📖", title: "Two Perpendicular Planes", titleVi: "Hai Mặt Phẳng Vuông Góc", slug: "L11-C8-L3", done: true },
      { thumb: "📖", title: "Distances in Space", titleVi: "Khoảng Cách Trong Không Gian", slug: "L11-C8-L4", done: true },
      { thumb: "📖", title: "Angles in Space", titleVi: "Góc Trong Không Gian", slug: "L11-C8-L5", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.8", titleVi: "Ôn Tập Chương 8", slug: "L11-C8-L6", done: true },
    ],
  },
  {
    id: "ch9",
    size: "small",
    chapter: "Chapter 9",
    title: "Probability",
    titleVi: "Xác Suất Cơ Bản",
    graphType: "venn",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,0.25)",
    badge: "Probability",
    lessons: [
      { thumb: "🚀", title: "Union, Intersection & Independent Events", titleVi: "Biến Cố Hợp, Giao & Độc Lập", slug: "L11-C9-L1", done: true },
      { thumb: "📖", title: "Addition & Multiplication Rules", titleVi: "Quy Tắc Cộng & Quy Tắc Nhân", slug: "L11-C9-L2", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.9", titleVi: "Ôn Tập Chương 9", slug: "L11-C9-L3", done: true },
    ],
  },
];

// ─── LESSON PILL COMPONENT ────────────────────────────────────────────────────
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
        {/* custom pixel art badge */}
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

        {/* Title stack */}
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

        {/* Arrow */}
        <div style={{ color: accentColor, fontSize: 11, opacity: 0.6, flexShrink: 0 }}>›</div>
      </motion.div>
    </Link>
  );
}

// ─── BENTO CARD COMPONENT ─────────────────────────────────────────────────────
function BentoCard({ card }) {
  const firstDoneLesson = card.lessons.find((l) => l.done);
  const href = firstDoneLesson ? `/${firstDoneLesson.slug}` : null;

  const cardContent = (
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
        initial: {
          borderColor: "rgba(255,255,255,0.07)",
          boxShadow: "0 0px 0px rgba(0,0,0,0)",
          y: 0,
        },
        hover: {
          borderColor: card.accentColor + "50",
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${card.glowColor}`,
          y: -5,
        }
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Ambient glow overlay revealed on hover */}
      <motion.div
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 20% 20%, ${card.glowColor} 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Math graph visualization background */}
      <div style={{
        position: "absolute",
        right: -10,
        top: -10,
        width: 140,
        height: 100,
        opacity: 0.28,
        zIndex: 0,
        pointerEvents: "none",
      }}>
        <MathGraphSVG type={card.graphType} color={card.accentColor} />
      </div>

      {/* Card Info */}
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <div style={{
          display: "inline-block",
          fontSize: 10, fontWeight: 800,
          color: card.accentColor,
          background: card.accentColor + "18",
          border: `1px solid ${card.accentColor}44`,
          borderRadius: 20,
          padding: "3px 10px",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
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

        {/* Lesson pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {card.lessons.map((l) => (
            <LessonPill key={l.slug} lesson={l} accentColor={card.accentColor} />
          ))}
        </div>
      </div>

      {/* Arrow indicator */}
      {href && (
        <motion.div
          variants={{
            initial: { opacity: 0, x: -4 },
            hover: { opacity: 1, x: 0 },
          }}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            color: card.accentColor,
            fontSize: 18,
            fontWeight: 700,
            zIndex: 1,
          }}
        >
          →
        </motion.div>
      )}
    </motion.div>
  );

  return cardContent;
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────
export default function CacBaiLamPage() {
  const stats = [
    { label: "Chapters", value: "9" },
    { label: "Lessons", value: "37" },
    { label: "Bilingual", value: "EN/VI" },
    { label: "Mini Games", value: "Interactive" },
  ];

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(160deg, #020c1b 0%, #0a1628 15%, #0c2340 35%, #0e3158 50%, #0a3d5c 65%, #063d56 80%, #042f46 100%)",
      position: "relative",
      overflow: "hidden",
      color: "white",
    }}>

      {/* ── Ambient background glows ── */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 15% 25%, rgba(6,182,212,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(56,189,248,0.035) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
      </div>

      <div style={{ width: "1280px", maxWidth: "95%", margin: "0 auto", paddingTop: 50, paddingBottom: 80, position: "relative", zIndex: 1 }}>

        {/* ── Back button ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/Cacbaitoan" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, padding: "7px 14px", marginBottom: 40,
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; e.currentTarget.style.background = "rgba(56,189,248,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              ← Chọn lớp
            </div>
          </Link>
        </motion.div>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 56 }}
        >
          <div style={{
            display: "inline-block",
            fontSize: 11, fontWeight: 800,
            color: "#38bdf8",
            background: "rgba(56,189,248,0.10)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 20,
            padding: "4px 14px",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            Bilingual Curriculum · Grade 11
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #ffffff 60%, #93c5fd 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12,
            lineHeight: 1.1,
          }}>
            Toán Lớp 11 — Grade 11
          </h1>

          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 640, lineHeight: 1.7 }}>
            Chọn bài học để bắt đầu. Mỗi thẻ đại diện cho một chương trong chương trình
            Toán 11 song ngữ Anh–Việt theo chuẩn SAT/IELTS Math.
          </p>

          {/* Stats bar */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 0,
            marginTop: 28,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            width: "fit-content",
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

        {/* ── BENTO GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "auto",
          gap: 20,
        }}>
          {BENTO_CARDS.map((card, i) => {
            const colSpanMap = {
              large:  "span 5",
              medium: "span 4",
              small:  "span 3",
              wide:   "span 12",
            };
            const colSpan = colSpanMap[card.size] || "span 4";

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
          div[style*="gridTemplateColumns"] > div {
            grid-column: span 12 !important;
          }
        }
        @media (min-width: 901px) and (max-width: 1100px) {
          div[style*="gridTemplateColumns"] > div[style*="span 5"],
          div[style*="gridTemplateColumns"] > div[style*="span 4"] {
            grid-column: span 6 !important;
          }
          div[style*="gridTemplateColumns"] > div[style*="span 3"] {
            grid-column: span 4 !important;
          }
        }
      `}</style>
    </div>
  );
}
