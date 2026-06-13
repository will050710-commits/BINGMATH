/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import MathGraphSVG from "./MathGraphSVG";

// ─── BENTO CARD DATA ─────────────────────────────────────────────────────────
// Each chapter / section gets a Bento card with a unique graph type and color.
const BENTO_CARDS = [
  {
    id: "ch1",
    size: "large",      // spans 2 columns
    chapter: "Chapter 1",
    title: "Propositions & Sets",
    titleVi: "Mệnh Đề & Tập Hợp",
    graphType: "venn",
    accentColor: "#22d3ee",
    glowColor: "rgba(34,211,238,0.25)",
    badge: "Set Theory",
    lessons: [
      { title: "Mathematical Propositions", slug: "Menh-de", done: true },
      { title: "Sets", slug: "Tap-hop", done: true },
      { title: "Set Operations", slug: "phep-toan-tap-hop", done: true },
      { title: "Practice & Review – Ch.1", slug: "OnTapChuong1", done: true },
    ],
  },
  {
    id: "ch2",
    size: "medium",
    chapter: "Chapter 2",
    title: "Linear Inequalities",
    titleVi: "Bất Phương Trình",
    graphType: "inequality",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.25)",
    badge: "2-Variable",
    lessons: [
      { title: "Linear Inequalities in 2 Variables", slug: "Bpt-bac-nhat-2-an", done: true },
      { title: "Systems of Linear Inequalities", slug: "Lesson5_HeBPTBacNhatHaiAn", done: true },
      { title: "Practice & Review – Ch.2", slug: "chuong2-10", done: true },
    ],
  },
  {
    id: "ch3",
    size: "medium",
    chapter: "Chapter 3",
    title: "Quadratic Functions",
    titleVi: "Hàm Số Bậc Hai",
    graphType: "parabola",
    accentColor: "#818cf8",
    glowColor: "rgba(129,140,248,0.25)",
    badge: "y = ax² + bx + c",
    lessons: [
      { title: "Functions and Graphs", slug: "Ham-so-va-do-thi", done: true },
      { title: "Quadratic Functions", slug: "Ham-so-bac-hai", done: true },
      { title: "Practice & Review – Ch.3", slug: "on-tap-chuong-3", done: true },
    ],
  },
  {
    id: "ch4-5",
    size: "wide",      // spans full row
    chapter: "Chapter 4 – 5",
    title: "Trigonometry & Vectors",
    titleVi: "Hệ Thức Lượng & Vectơ",
    graphType: "vectors",
    accentColor: "#a78bfa",
    glowColor: "rgba(167,139,250,0.25)",
    badge: "Geometry",
    lessons: [
      { title: "Trigonometric Values (0°–180°)", slug: "gia-tri-luong-giac", done: true },
      { title: "Law of Cosines", slug: "Lesson10_DinhLiCosin", done: true },
      { title: "Law of Sines", slug: "Lesson11_DinhLiSin", done: true },
      { title: "Solving Triangles", slug: "Lesson12_GiaiTamGiac", done: true },
      { title: "Introduction to Vectors", slug: "Lesson13_KhaiNiemVecto", done: true },
      { title: "Sum & Difference of Vectors", slug: "Lesson14_TongHieuVecto", done: true },
      { title: "Scalar Multiplication", slug: "Lesson15_TichSoVecto", done: true },
      { title: "Dot Product", slug: "Lesson16_TichVoHuong", done: true },
      { title: "Practice – Ch.4", slug: "OnTapChuong4", done: true },
      { title: "Practice – Ch.5", slug: "Lesson17_OnTapChuong5", done: true },
    ],
  },
  {
    id: "ch6",
    size: "small",
    chapter: "Chapter 6",
    title: "Geometry & Measurement",
    titleVi: "Hình Học Đo Lường",
    graphType: "trig",
    accentColor: "#38bdf8",
    glowColor: "rgba(56,189,248,0.25)",
    badge: "Measurement",
    lessons: [
      { title: "Geometric Shapes & Properties", slug: "Lesson18_HinhHocDoLuong1", done: true },
      { title: "Area and Perimeter", slug: "Lesson19_HinhHocDoLuong2", done: true },
      { title: "Practice – Ch.6", slug: "Lesson20_OnTapChuong6", done: true },
    ],
  },
  {
    id: "ch7",
    size: "small",
    chapter: "Chapter 7",
    title: "Quadratic Inequalities",
    titleVi: "Bất Phương Trình Bậc Hai",
    graphType: "parabola",
    accentColor: "#fb7185",
    glowColor: "rgba(251,113,133,0.25)",
    badge: "Δ = b² - 4ac",
    lessons: [
      { title: "Sign of a Quadratic Trinomial", slug: "Lesson21_DauTamThucBacHai", done: true },
      { title: "Solving Quadratic Inequalities", slug: "Lesson22_GiaiBPTBacHai", done: true },
      { title: "Equations Reducible to Quadratic", slug: "Lesson23_PhuongTrinhQuyVeBacHai", done: true },
      { title: "Practice – Ch.7", slug: "Lesson24_OnTapChuong7", done: true },
    ],
  },
  {
    id: "ch8",
    size: "medium",
    chapter: "Chapter 8",
    title: "Combinatorial Algebra",
    titleVi: "Tổ Hợp & Hoán Vị",
    graphType: "venn",
    accentColor: "#fbbf24",
    glowColor: "rgba(251,191,36,0.25)",
    badge: "C(n,k)",
    lessons: [
      { title: "Addition & Multiplication Principles", slug: "Lesson25_QuyTacCongNhan", done: true },
      { title: "Permutations, Arrangements & Combinations", slug: "Lesson26_HoanViChinhHopToHop", done: true },
      { title: "Binomial Theorem", slug: "Lesson27_NhiThucNewton", done: true },
      { title: "Practice – Ch.8", slug: "Lesson28_OnTapChuong8", done: true },
    ],
  },
  {
    id: "ch9",
    size: "large",
    chapter: "Chapter 9",
    title: "Coordinate Geometry",
    titleVi: "Phương Pháp Tọa Độ",
    graphType: "ellipse",
    accentColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.25)",
    badge: "Analytic Geometry",
    lessons: [
      { title: "Coordinates of a Vector", slug: "Lesson29_ToaDoVecto", done: true },
      { title: "Lines in the Coordinate Plane", slug: "Lesson30_DuongThang", done: true },
      { title: "Circles in the Coordinate Plane", slug: "Lesson31_DuongTron", done: true },
      { title: "Ellipse (Introduction)", slug: "Lesson32_Elip", done: true },
      { title: "Practice – Ch.9", slug: "Lesson33_OnTapChuong9", done: true },
    ],
  },
  {
    id: "ch10",
    size: "medium",
    chapter: "Chapter 10",
    title: "Probability",
    titleVi: "Xác Suất",
    graphType: "venn",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,0.25)",
    badge: "P(A)",
    lessons: [
      { title: "Sample Spaces and Events", slug: "Lesson34_KhongGianMau", done: true },
      { title: "Probability of an Event", slug: "Lesson35_XacSuatBienCo", done: true },
      { title: "Practice – Ch.10", slug: "Lesson36_OnTapChuong10", done: true },
    ],
  },
];

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
        gap: 12,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.3s ease",
      }}
      whileHover={{
        borderColor: card.accentColor + "50",
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${card.glowColor}`,
        y: -5,
        transition: { duration: 0.3 },
      }}
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

      {/* SVG Graph — auto-draws on hover */}
      <div style={{ position: "relative", zIndex: 1, height: card.size === "wide" ? 80 : 90, flexShrink: 0, display: "flex", alignItems: "center" }}>
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
        <div style={{ fontSize: 12, color: card.accentColor, fontWeight: 600, marginBottom: 12 }}>
          {card.titleVi}
        </div>

        {/* Lesson pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {card.lessons.map((l) =>
            l.done ? (
              <Link key={l.slug} href={`/${l.slug}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none" }}>
                <motion.span
                  whileHover={{ scale: 1.05, backgroundColor: card.accentColor + "33" }}
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "4px 9px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.title}
                </motion.span>
              </Link>
            ) : (
              <span key={l.slug} style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 6,
                padding: "4px 9px",
                whiteSpace: "nowrap",
              }}>
                {l.title} 🔜
              </span>
            )
          )}
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

  return href ? (
    <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      {cardContent}
    </Link>
  ) : cardContent;
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────
export default function CacBaiLamPage() {
  // Stats bar data
  const stats = [
    { label: "Chapters", value: "10" },
    { label: "Lessons", value: "36+" },
    { label: "Bilingual", value: "EN/VI" },
    { label: "Mini Games", value: "3 types" },
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
            Bilingual Curriculum · Grade 10
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
            Toán Lớp 10 — Grade 10
          </h1>

          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 640, lineHeight: 1.7 }}>
            Chọn chương để bắt đầu học. Mỗi thẻ bên dưới đại diện cho một chương trong chương trình
            Toán 10 song ngữ Anh - Việt theo chuẩn SAT/IELTS Math.
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
            // Determine grid column span based on size
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

        {/* ── Bottom tip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 48, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}
        >
          💡 Di chuột vào mỗi thẻ để xem đồ thị toán học tự vẽ · Hover a card to see the math graph animate
        </motion.div>
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
