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

export default function Lesson32_Elip() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson32_Elip";
  const chapterTitle = { vi: "Chương IX: Phương pháp tọa độ trong mặt phẳng", en: "Chapter IX: Coordinate Methods in the Plane" };
  const lessonTitle = { vi: "Bài 32: Đường Elip", en: "Lesson 32: The Ellipse" };
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
    "videoBaiGiang",
    "🎬",
    "Video",
    "Video"
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
        "text": "ellipse",
        "vi": "elip",
        "detail": "<b>ellipse</b>: elip.",
        "detailTitle": "ellipse (elip)"
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
        "text": "foci",
        "vi": "tiêu điểm",
        "detail": "<b>foci</b>: tiêu điểm.",
        "detailTitle": "foci (tiêu điểm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "major axis",
        "vi": "trục lớn",
        "detail": "<b>major axis</b>: trục lớn.",
        "detailTitle": "major axis (trục lớn)"
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
        "text": "standard equation",
        "vi": "phương trình chính tắc",
        "detail": "<b>standard equation</b>: phương trình chính tắc.",
        "detailTitle": "standard equation (phương trình chính tắc)"
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
        "text": "foci",
        "vi": "tiêu điểm",
        "detail": "<b>foci</b>: tiêu điểm.",
        "detailTitle": "foci (tiêu điểm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "major axis",
        "vi": "trục lớn",
        "detail": "<b>major axis</b>: trục lớn.",
        "detailTitle": "major axis (trục lớn)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "standard equation",
        "vi": "phương trình chính tắc",
        "detail": "<b>standard equation</b>: phương trình chính tắc.",
        "detailTitle": "standard equation (phương trình chính tắc)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    { 'q': 'Phương trình chính tắc của Elip có dạng nào?', 'o': ['x²/a² - y²/b² = 1', 'x²/a² + y²/b² = 1', 'y = ax² + bx + c', 'x² + y² = R²'], 'a': 1, 'ex': 'Elip (E) luôn có dấu cộng giữa hai phân số.' },
    { 'q': 'Trong Elip (a > b > 0), mối liên hệ giữa a, b, c là gì?', 'o': ['a² = b² + c²', 'c² = a² + b²', 'b² = a² + c²', 'a = b + c'], 'a': 0, 'ex': 'Với Elip, a là bán trục lớn nên a² = b² + c².' },
    { 'q': 'Tiêu cự của Elip là khoảng cách nào?', 'o': ['2a', '2b', '2c', 'a+b'], 'a': 2, 'ex': 'Khoảng cách giữa hai tiêu điểm F₁F₂ gọi là tiêu cự, độ dài bằng 2c.' },
    { 'q': 'Điểm M nằm trên Elip khi nào?', 'o': ['MF₁ - MF₂ = 2a', 'MF₁ + MF₂ = 2c', 'MF₁ + MF₂ = 2a', 'MF₁ = MF₂'], 'a': 2, 'ex': 'Định nghĩa: Tổng khoảng cách từ M đến hai tiêu điểm bằng 2a.' },
    { 'q': 'Elip x²/25 + y²/9 = 1 có bán trục lớn a bằng?', 'o': ['25', '9', '5', '3'], 'a': 2, 'ex': 'a² = 25 suy ra a = 5.' }
  ];
  const tfCards = [
    { 's': 'Trục lớn của Elip nằm trên trục hoành Ox (với pt chính tắc).', 'a': true, 'ex': 'ĐÚNG — Theo quy ước phương trình chính tắc x²/a² + y²/b² = 1.' },
    { 's': 'Tâm sai e của Elip luôn lớn hơn 1.', 'a': false, 'ex': 'SAI — Tâm sai e = c/a, vì c < a nên 0 < e < 1.' },
    { 's': 'Hình tròn là một trường hợp đặc biệt của Elip khi a = b.', 'a': true, 'ex': 'ĐÚNG — Khi a = b, phương trình trở thành x² + y² = a².' },
    { 's': 'Bốn đỉnh của Elip là A₁(a;0), A₂(-a;0), B₁(0;b), B₂(0;-b).', 'a': true, 'ex': 'ĐÚNG — Đây là các giao điểm của Elip với hai trục tọa độ.' },
    { 's': 'Độ dài trục nhỏ của Elip bằng c.', 'a': false, 'ex': 'SAI — Độ dài trục nhỏ bằng 2b.' }
  ];
  const fillQuestions = [
    { 'id': 'f1', 'tp': 'Độ dài trục lớn của Elip bằng ___.', 'ans': '2a', 'alt': ['2 a'], 'h': 'Gấp đôi bán trục lớn' },
    { 'id': 'f2', 'tp': 'Elip x²/16 + y²/7 = 1 có c = ___.', 'ans': '3', 'alt': ['ba'], 'h': 'c² = 16 - 7 = 9' },
    { 'id': 'f3', 'tp': 'Tỉ số e = c/a được gọi là ___ của Elip.', 'ans': 'tâm sai', 'alt': ['tam sai'], 'h': 'Độ dẹt của hình' }
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        <div style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 style={{ fontSize: 20, color: "#a5b4fc", marginBottom: 12 }}>Theory content is available in standard lesson format.</h2>
      <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>Please see interactive exercises and videos for practice.</p>
    </div>
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
      videoId="HO2zAU3Eppo"
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
