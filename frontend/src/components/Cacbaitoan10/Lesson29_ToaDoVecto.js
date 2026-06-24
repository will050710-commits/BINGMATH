/* eslint-disable react-hooks/static-components */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumLessonEngine from "./PremiumLessonEngine";

// ─── LOCAL COMPONENTS FOR LESSON ───
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#22d3ee", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

const TheoryBlock = ({ children }) => (
  <div style={{ padding: "20px 22px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
    {children}
  </div>
);

const FormulaCard = ({ label, formula, note }) => (
  <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", textAlign: "center" }}>
    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ fontFamily: "monospace", fontSize: 18, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>{formula}</div>
    {note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{note}</div>}
  </div>
);

const SH = SectionHeader;
const TB = TheoryBlock;
const FC = FormulaCard;

export default function Lesson29_ToaDoVecto() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson29_ToaDoVecto";
  const chapterTitle = { vi: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng", en: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng" };
  const lessonTitle = { vi: "Bài 29: Tọa Độ Vectơ", en: "Bài 29: Tọa Độ Vectơ" };
  const learningObjectives = [
  {
    "vi": "Hiểu kiến thức trọng tâm của bài học.",
    "en": "Understand key concepts of the lesson."
  },
  {
    "vi": "Luyện tập bài tập tương tác.",
    "en": "Practice interactive exercises."
  }
];
  const navItems = [
  [
    "khoiDong",
    "🚀",
    "Khởi động",
    "Warm-up"
  ],
  [
    "videoBaiGiang",
    "🎬",
    "Video",
    "Video"
  ],
  [
    "k1",
    "📖",
    "1. Khái niệm",
    "1. Concept"
  ],
  [
    "k2",
    "📖",
    "2. Khái niệm",
    "2. Concept"
  ],
  [
    "th",
    "✏️",
    "Thực hành",
    "Practice"
  ],
  [
    "miniGame",
    "🎮",
    "Mini Game",
    "Mini Game"
  ]
];

  const videoSubtitles = [
  {
    "start": 0,
    "end": 12,
    "words": [
      {
        "text": "This lesson introduces",
        "vi": "Bài học này giới thiệu"
      },
      {
        "text": "vector coordinates",
        "vi": "tọa độ véc-tơ",
        "detail": "<b>vector coordinates</b>: tọa độ véc-tơ.",
        "detailTitle": "vector coordinates (tọa độ véc-tơ)"
      },
      {
        "text": "and the main ideas used in Grade 10 math.",
        "vi": "và các ý chính dùng trong Toán 10."
      }
    ]
  },
  {
    "start": 12,
    "end": 30,
    "words": [
      {
        "text": "First identify",
        "vi": "Trước hết xác định"
      },
      {
        "text": "coordinate plane",
        "vi": "mặt phẳng tọa độ",
        "detail": "<b>coordinate plane</b>: mặt phẳng tọa độ.",
        "detailTitle": "coordinate plane (mặt phẳng tọa độ)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "component",
        "vi": "thành phần tọa độ",
        "detail": "<b>component</b>: thành phần tọa độ.",
        "detailTitle": "component (thành phần tọa độ)"
      },
      {
        "text": "through examples.",
        "vi": "qua các ví dụ."
      }
    ]
  },
  {
    "start": 30,
    "end": 55,
    "words": [
      {
        "text": "Use",
        "vi": "Sử dụng"
      },
      {
        "text": "midpoint",
        "vi": "trung điểm",
        "detail": "<b>midpoint</b>: trung điểm.",
        "detailTitle": "midpoint (trung điểm)"
      },
      {
        "text": "carefully and check every condition before solving.",
        "vi": "một cách cẩn thận và kiểm tra mọi điều kiện trước khi giải."
      }
    ]
  },
  {
    "start": 55,
    "end": 9999,
    "words": [
      {
        "text": "For practice, combine",
        "vi": "Khi luyện tập, hãy kết hợp"
      },
      {
        "text": "coordinate plane",
        "vi": "mặt phẳng tọa độ",
        "detail": "<b>coordinate plane</b>: mặt phẳng tọa độ.",
        "detailTitle": "coordinate plane (mặt phẳng tọa độ)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "component",
        "vi": "thành phần tọa độ",
        "detail": "<b>component</b>: thành phần tọa độ.",
        "detailTitle": "component (thành phần tọa độ)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "midpoint",
        "vi": "trung điểm",
        "detail": "<b>midpoint</b>: trung điểm.",
        "detailTitle": "midpoint (trung điểm)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{ 'q': '→AB với A(1,3), B(4,7) = ?', 'o': ['(5,10)', '(3,4)', '(−3,−4)', '(4,7)'], 'a': 1, 'ex': '→AB=(4−1,7−3)=(3,4).' }, { 'q': '|(3,4)| = ?', 'o': ['7', '5', '√7', '1'], 'a': 1, 'ex': '|→a|=√(9+16)=5.' }, { 'q': '→a=(2,3), →b=(−3,2). →a·→b = ?', 'o': ['0', '12', '−6', '13'], 'a': 0, 'ex': '2×(−3)+3×2=−6+6=0 → vuông góc.' }, { 'q': 'Trung điểm M của A(2,0) và B(6,4)?', 'o': ['(4,2)', '(8,4)', '(2,2)', '(4,4)'], 'a': 0, 'ex': 'M=((2+6)/2,(0+4)/2)=(4,2).' }, { 'q': '→a=(1,0), →b=(0,1). Góc giữa →a và →b?', 'o': ['0°', '45°', '90°', '180°'], 'a': 2, 'ex': '→a·→b=0 → vuông góc → 90°.' }];
  const tfCards = [{ 's': '→AB = B − A theo tọa độ.', 'a': true, 'ex': 'ĐÚNG — →AB=(xB−xA, yB−yA).' }, { 's': '|(3,4)| = 7.', 'a': false, 'ex': 'SAI — |(3,4)|=√(9+16)=5.' }, { 's': '→a⊥→b ⟺ →a·→b=0.', 'a': true, 'ex': 'ĐÚNG — vuông góc ⟺ tích vô hướng bằng 0.' }, { 's': 'Trọng tâm G = trung bình cộng tọa độ 3 đỉnh.', 'a': true, 'ex': 'ĐÚNG — G=((xA+xB+xC)/3,(yA+yB+yC)/3).' }, { 's': '→a=(a₁,a₂). k→a = (ka₁,a₂).', 'a': false, 'ex': 'SAI — k→a=(ka₁,ka₂), nhân cả hai thành phần.' }];
  const fillQuestions = [{ 'id': 'f1', 'tp': 'A(2,3),B(6,7): |→AB| = ___', 'ans': '4√2', 'alt': ['4√2', '4root2', '√32'], 'h': '√((6-2)²+(7-3)²)' }, { 'id': 'f2', 'tp': '→a=(3,4). |→a| = ___', 'ans': '5', 'alt': ['5'], 'h': '√(9+16)' }, { 'id': 'f3', 'tp': '→a=(2,−1),→b=(1,2): →a·→b = ___', 'ans': '0', 'alt': ['0'], 'h': '2×1+(−1)×2' }];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
        
        
        

        <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Trong GPS và bản đồ số, mỗi địa điểm được xác định bởi một cặp số (kinh độ, vĩ độ). Đây chính là hệ tọa độ — và một vectơ cũng có thể biểu diễn qua tọa độ!", "In GPS and digital maps, each location is defined by a pair (longitude, latitude). This is the coordinate system — and a vector can also be expressed through coordinates!")}</div>
          </div>
        </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="ZM4VvCg7mI"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>
        <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="📖" title={t("1. Tọa Độ Vectơ", "1. Vector Coordinates")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <div style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>{t("Với hệ trục Oxy, vectơ →a được biểu diễn qua các vectơ đơn vị →i=(1,0) và →j=(0,1):", "In coordinate system Oxy, vector →a is expressed via unit vectors →i=(1,0) and →j=(0,1):")}</div>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "14px 18px", fontFamily: "monospace", fontSize: 16, textAlign: "center", lineHeight: 2.4, color: "#22d3ee", fontWeight: 700 }}>
              →a = (a₁, a₂) = a₁→i + a₂→j<br />
              |→a| = √(a₁² + a₂²)
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, transition: "all 0.3s" }}>
            {[
              {
                title: t("Tọa độ điểm và vectơ", "Point and vector coordinates"),
                formula: `A(x,y) → →OA = (x,y)
→AB = (xB−xA, yB−yA)`,
                c: "#38bdf8", bg: "rgba(14, 165, 233, 0.15)"
              },
              {
                title: t("Phép toán theo tọa độ", "Operations via coordinates"),
                formula: `→a±→b = (a₁±b₁, a₂±b₂)
k→a = (ka₁, ka₂)
→a·→b = a₁b₁+a₂b₂`,
                c: "#4ade80", bg: "rgba(16, 185, 129, 0.15)"
              },
              {
                title: t("Điều kiện // và ⊥", "Parallel and perpendicular"),
                formula: `//: a₁b₂−a₂b₁=0
⊥: a₁b₁+a₂b₂=0
Góc: cosφ=(→a·→b)/(|→a||→b|)`,
                c: "#f87171", bg: "rgba(239, 68, 68, 0.15)"
              },
            ].map((card, i) => (
              <article key={i} style={{ padding: 18, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: card.c, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, background: card.bg, color: card.c, padding: "8px 12px", borderRadius: 8, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{card.formula}</div>
              </article>
            ))}
          </div>
        </section>
        <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="📖" title={t("2. Tọa Độ Trung Điểm và Trọng Tâm", "2. Midpoint and Centroid")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 8, padding: "14px 18px", fontFamily: "monospace", fontSize: 15, lineHeight: 2.4 }}>
              Trung điểm M của AB: M = ((xA+xB)/2, (yA+yB)/2)<br />
              Trọng tâm G của △ABC: G = ((xA+xB+xC)/3, (yA+yB+yC)/3)
            </div>
          </div>
        </section>
        <section id="th" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="✏️" title={t("Thực Hành", "Practice")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 36, transition: "all 0.3s" }}>
            {[{ id: "e1", q: t("A(1,2), B(5,6). Tính →AB, |→AB|, trung điểm M.", "A(1,2), B(5,6). Find →AB, |→AB|, midpoint M."), a: ["→AB=(5−1,6−2)=(4,4)", "|→AB|=√(16+16)=4√2≈5.66", "M=((1+5)/2,(2+6)/2)=(3,4)"] },
            { id: "e2", q: t("→a=(3,4), →b=(−4,3). Kiểm tra →a⊥→b.", "→a=(3,4), →b=(−4,3). Check →a⊥→b."), a: ["→a·→b=3×(−4)+4×3=−12+12=0", t("→a·→b=0 → →a⊥→b ✓", "→a·→b=0 → perpendicular ✓")] },
            { id: "e3", q: t("A(0,0), B(4,0), C(2,6). Tìm trọng tâm G.", "A(0,0), B(4,0), C(2,6). Find centroid G."), a: ["G=((0+4+2)/3,(0+0+6)/3)=(6/3,6/3)=(2,2)"] },
            ].map(({ id, q, a }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập", "Exercise")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7 }}>{q}</div>
                </div>
                <button onClick={() => tr(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>{rev[id] ? t("Ẩn ▲", "Hide ▲") : t("Xem đáp án ▼", "Show ▼")}</button>
                {rev[id] && <div style={{ padding: "16px 20px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "0 0 10px 10px" }}>{a.map((l, i) => <div key={i} style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)", marginBottom: 6 }}>{l}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>
      </>
    );
  };

  return (
    <PremiumLessonEngine
      lessonSlug={lessonSlug}
      chapterTitle={chapterTitle}
      lessonTitle={lessonTitle}
      learningObjectives={learningObjectives}
      navItems={navItems}
      videoId="ZM4VvCg7mI"
      videoSubtitles={videoSubtitles}
      mcQuestions={mcQuestions}
      tfCards={tfCards}
      fillQuestions={fillQuestions}
      renderTheory={renderTheory}
      lang={lang}
      setLang={setLang}
    />
  );
}
