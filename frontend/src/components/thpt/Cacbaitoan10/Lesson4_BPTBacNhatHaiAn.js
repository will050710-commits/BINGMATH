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

export default function Lesson4_BPTBacNhatHaiAn() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson4_BPTBacNhatHaiAn";
  const chapterTitle = { vi: "Chương II · Bất Phương Trình Bậc Nhất", en: "Chapter II · Linear Inequalities" };
  const lessonTitle = { vi: "Bài 4: Bất Phương Trình Bậc Nhất Hai Ẩn", en: "Lesson 4: Linear Inequality in Two Variables" };
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
    "khoiDong",
    "📖",
    "1. Khái niệm",
    "1. Concept"
  ],
  [
    "khai1",
    "📖",
    "2. Khái niệm",
    "2. Concept"
  ],
  [
    "khai2",
    "📖",
    "3. Khái niệm",
    "3. Concept"
  ],
  [
    "khai3",
    "📖",
    "4. Khái niệm",
    "4. Concept"
  ],
  [
    "thucHanh",
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
        "text": "linear inequalities in two variables",
        "vi": "bất phương trình bậc nhất hai ẩn",
        "detail": "<b>linear inequalities in two variables</b>: bất phương trình bậc nhất hai ẩn.",
        "detailTitle": "linear inequalities in two variables (bất phương trình bậc nhất hai ẩn)"
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
        "text": "solution region",
        "vi": "miền nghiệm",
        "detail": "<b>solution region</b>: miền nghiệm.",
        "detailTitle": "solution region (miền nghiệm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "boundary line",
        "vi": "đường biên",
        "detail": "<b>boundary line</b>: đường biên.",
        "detailTitle": "boundary line (đường biên)"
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
        "text": "half-plane",
        "vi": "nửa mặt phẳng",
        "detail": "<b>half-plane</b>: nửa mặt phẳng.",
        "detailTitle": "half-plane (nửa mặt phẳng)"
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
        "text": "solution region",
        "vi": "miền nghiệm",
        "detail": "<b>solution region</b>: miền nghiệm.",
        "detailTitle": "solution region (miền nghiệm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "boundary line",
        "vi": "đường biên",
        "detail": "<b>boundary line</b>: đường biên.",
        "detailTitle": "boundary line (đường biên)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "half-plane",
        "vi": "nửa mặt phẳng",
        "detail": "<b>half-plane</b>: nửa mặt phẳng.",
        "detailTitle": "half-plane (nửa mặt phẳng)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {
      q: t("BPT bậc nhất hai ẩn có dạng tổng quát nào?", "What is the general form of a linear inequality in two variables?"),
      options: ["ax² + bx + c > 0", "ax + by + c ≥ 0", "ax + by² + c < 0", "ax² + by² = 0"],
      answer: 1,
      explain: t("Dạng ax + by + c ≥ 0 (hoặc >, <, ≤) với a, b không đồng thời bằng 0.", "Form ax + by + c ≥ 0 (or >, <, ≤) where a, b are not both zero.")
    },
    {
      q: t("Miền nghiệm của BPT 2x + y ≥ 4 là?", "The solution region of 2x + y ≥ 4 is?"),
      options: [t("Nửa mặt phẳng không chứa gốc O(0,0)", "The half-plane not containing origin O(0,0)"), t("Nửa mặt phẳng chứa gốc O(0,0)", "The half-plane containing origin O(0,0)"), t("Toàn bộ mặt phẳng Oxy", "The entire Oxy plane"), t("Chỉ đường thẳng 2x + y = 4", "Only the line 2x + y = 4")],
      answer: 0,
      explain: t("Thử O(0,0): 2(0)+0 = 0 < 4 → O không thỏa → miền nghiệm là nửa mp không chứa O.", "Test O(0,0): 2(0)+0 = 0 < 4 → O fails → solution is the half-plane not containing O.")
    },
    {
      q: t("Điểm nào sau đây là nghiệm của BPT x − 2y < 3?", "Which point is a solution of x − 2y < 3?"),
      options: ["(3, 0)", "(5, 1)", "(1, 2)", "(4, 0)"],
      answer: 2,
      explain: t("Thử (1,2): 1 − 2(2) = 1−4 = −3 < 3 ✓. Các điểm khác: (3,0)→3≮3; (5,1)→3≮3; (4,0)→4≮3.", "Test (1,2): 1−2(2) = −3 < 3 ✓. Others: (3,0)→3, (5,1)→3, (4,0)→4, none < 3.")
    },
    {
      q: t("Đường thẳng ax + by + c = 0 chia mặt phẳng thành bao nhiêu phần?", "The line ax + by + c = 0 divides the plane into how many parts?"),
      options: ["1", "2", "3", "4"],
      answer: 1,
      explain: t("Một đường thẳng chia mặt phẳng thành 2 nửa mặt phẳng (hai phần mở).", "A line divides the plane into 2 open half-planes.")
    },
    {
      q: t("BPT x + y > 1. Điểm (0, 0) có thỏa BPT không?", "BPT x + y > 1. Does the point (0, 0) satisfy it?"),
      options: [t("Có, vì 0 + 0 > 1", "Yes, because 0 + 0 > 1"), t("Không, vì 0 + 0 ≤ 1", "No, because 0 + 0 ≤ 1"), t("Có, (0,0) luôn là nghiệm", "Yes, (0,0) is always a solution"), t("Không xác định", "Undetermined")],
      answer: 1,
      explain: t("0 + 0 = 0 < 1, không thỏa điều kiện > 1.", "0 + 0 = 0 < 1, does not satisfy > 1.")
    },
  ];
  const tfCards = [
    { stmt: t("Miền nghiệm của BPT ax + by + c > 0 luôn là nửa mặt phẳng mở (không kể biên).", "The solution region of ax + by + c > 0 is always an open half-plane (boundary excluded)."), answer: true, explain: t("ĐÚNG — dấu > hoặc < không kể đường biên. Dấu ≥, ≤ thì kể biên.", "TRUE — strict inequalities (>, <) exclude the boundary. ≥, ≤ include it.") },
    { stmt: t("Điểm O(0, 0) luôn không phải nghiệm của BPT ax + by + c > 0.", "The origin O(0,0) is never a solution of ax + by + c > 0."), answer: false, explain: t("SAI — phụ thuộc vào c. Nếu c > 0 thì O(0,0) thỏa ax+by+c > 0.", "FALSE — depends on c. If c > 0, O(0,0) satisfies the inequality.") },
    { stmt: t("Miền nghiệm của BPT là một nửa mặt phẳng (nửa mp mở hoặc đóng).", "The solution region of a linear inequality in 2 variables is a half-plane (open or closed)."), answer: true, explain: t("ĐÚNG — nghiệm của BPT bậc nhất hai ẩn luôn là nửa mặt phẳng.", "TRUE — the solution of a linear inequality in two variables is always a half-plane.") },
    { stmt: t("BPT bậc nhất hai ẩn có thể vô nghiệm.", "A linear inequality in two variables can have no solution."), answer: false, explain: t("SAI — BPT bậc nhất hai ẩn luôn có miền nghiệm là nửa mặt phẳng (vô số nghiệm).", "FALSE — it always has a half-plane as its solution region (infinitely many solutions).") },
    { stmt: t("Để biểu diễn miền nghiệm, ta tô màu vùng thỏa mãn BPT.", "To represent the solution region, we shade the region satisfying the inequality."), answer: true, explain: t("ĐÚNG — quy ước tô màu (hoặc gạch chéo) vào vùng nghiệm.", "TRUE — convention is to shade (or hatch) the solution region.") },
  ];
  const fillQuestions = [
    { id: "f1", template: t("Dạng tổng quát của BPT bậc nhất hai ẩn: ax + by ___ 0 (điền dấu bất kỳ).", "General form of linear inequality in 2 variables: ax + by ___ 0 (fill any inequality sign)."), answer: ">", altAnswers: ["<", ">=", "<=", "≥", "≤"], hint: t("Một trong bốn dấu: >, <, ≥, ≤.", "One of four signs: >, <, ≥, ≤.") },
    { id: "f2", template: t("Để xác định nửa mặt phẳng chứa nghiệm, ta thử điểm ___ vào BPT.", "To find which half-plane contains solutions, we test the point ___ in the inequality."), answer: "o", altAnswers: ["(0,0)", "O(0,0)", "gốc tọa độ", "origin"], hint: t("Thường dùng gốc tọa độ O(0,0).", "We usually use the origin O(0,0).") },
    { id: "f3", template: t("BPT x + 2y ≤ 6. Thử A(0,0): 0 + 0 = 0 ___ 6, nên O ___ miền nghiệm.", "BPT x + 2y ≤ 6. Test A(0,0): 0 + 0 = 0 ___ 6, so O ___ in the solution region."), answer: "≤, thuộc", altAnswers: ["<=, thuoc", "≤,thuộc", "<=,thuộc"], hint: t("0 ≤ 6 đúng, nên O thuộc miền nghiệm.", "0 ≤ 6 is true, so O is in the solution region.") },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

        

        {/* OBJECTIVES */}
        

        {/* STICKY NAV */}
        

        {/* ════ KHỞI ĐỘNG ════ */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t('Một xưởng sản xuất hai loại sản phẩm A và B. Mỗi sản phẩm A tốn 2 giờ, mỗi sản phẩm B tốn 3 giờ. Tổng thời gian làm việc không quá 120 giờ/ngày. Điều kiện này có thể mô tả bằng: 2x + 3y ≤ 120, với x, y ≥ 0.',
                'A factory produces two products A and B. Each A takes 2 hours, each B takes 3 hours. Total working time is at most 120 hours/day. This condition is: 2x + 3y ≤ 120, with x, y ≥ 0.')}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Đây là ví dụ của bất phương trình bậc nhất hai ẩn. Tập nghiệm là một vùng trên mặt phẳng Oxy.", "This is a linear inequality in two variables. The solution set is a region on the Oxy plane.")}</em></div>
          </div>
        </section>
        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="unSBFwK881s"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
            />
          </div>
        </section>


        {/* ════ 1. ĐỊNH NGHĨA ════ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Định Nghĩa", "1. Definition")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#22d3ee", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Bất phương trình bậc nhất hai ẩn x, y có dạng:", "A linear inequality in two variables x, y has the form:")}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 22, color: "#22d3ee", textAlign: "center", padding: "16px 0" }}>
              ax + by + c {">"} 0 &nbsp;|&nbsp; ax + by + c {"<"} 0 &nbsp;|&nbsp; ax + by + c ≥ 0 &nbsp;|&nbsp; ax + by + c ≤ 0
            </div>
            <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.5)" }}>
              {t("Trong đó a, b, c ∈ ℝ và a, b không đồng thời bằng 0.", "Where a, b, c ∈ ℝ and a, b are not both zero.")}
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { label: t("✅ BPT bậc nhất hai ẩn", "✅ Linear inequalities in 2 vars"), items: ["2x + 3y > 6", "x − y ≤ 0", "−x + 2y + 1 ≥ 0"], ok: true },
              { label: t("❌ KHÔNG phải BPT bậc nhất hai ẩn", "❌ NOT linear in 2 vars"), items: ["x² + y > 0  (có x²)", "x + y + z < 1  (3 ẩn)", "2x + 3y = 6  (phương trình)"], ok: false },
            ].map((g, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{g.label}</div>
                {g.items.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <code style={{ fontFamily: "monospace" }}>{item}</code>
                    <span style={{ fontSize: 12, fontWeight: 700, background: g.ok ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: g.ok ? "#4ade80" : "#f87171", padding: "2px 10px", borderRadius: 20, marginLeft: 8 }}>{g.ok ? "✓" : "✗"}</span>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        {/* ════ 2. MIỀN NGHIỆM ════ */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Nghiệm và Miền Nghiệm", "2. Solutions and Solution Region")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#22d3ee", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 10 }}>
              {t("Cặp số (x₀, y₀) là nghiệm của BPT ax + by + c > 0 nếu khi thay x = x₀, y = y₀ vào BPT, ta được bất đẳng thức đúng.",
                "A pair (x₀, y₀) is a solution of ax + by + c > 0 if substituting x = x₀, y = y₀ yields a true inequality.")}
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Tập hợp tất cả các nghiệm gọi là miền nghiệm. Miền nghiệm của BPT bậc nhất hai ẩn là một nửa mặt phẳng.",
                "The set of all solutions is called the solution region. For a linear inequality in two variables, it is always a half-plane.")}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>🔑 {t("Nhận xét quan trọng", "Key Observation")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, transition: "all 0.3s ease" }}>
              {[
                { icon: "📏", title: t("Đường biên", "Boundary line"), desc: t("Đường thẳng ax + by + c = 0 là biên chia mp thành 2 nửa.", "Line ax + by + c = 0 is the boundary dividing the plane in 2.") },
                { icon: "🔒", title: t("Đường kín / mở", "Closed / open boundary"), desc: t("Dấu ≥, ≤ → đường biên thuộc miền nghiệm (vẽ liền nét).\nDấu >, < → đường biên không thuộc (vẽ nét đứt).", "≥, ≤ → boundary included (solid line).\n>, < → boundary excluded (dashed line).") },
                { icon: "🎯", title: t("Kiểm tra với O(0,0)", "Test with O(0,0)"), desc: t("Thử gốc tọa độ vào BPT:\n• Thỏa → O thuộc miền nghiệm → tô phía O\n• Không thỏa → tô phía đối diện", "Test origin:\n• Satisfies → shade O's side\n• Fails → shade opposite side") },
              ].map((card, i) => (
                <article key={i} style={{ padding: 16, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)", whiteSpace: "pre-wrap" }}>{card.desc}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════ 3. BIỂU DIỄN ════ */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Cách Biểu Diễn Miền Nghiệm", "3. Graphing the Solution Region")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#22d3ee" }}>📋 {t("Các bước thực hiện", "Steps")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "flex", flexDirection: "column", gap: 12, transition: "all 0.3s ease" }}>
              {[
                { step: "1", text: t("Vẽ đường thẳng d: ax + by + c = 0 (dạng phương trình đường thẳng).", "Draw the line d: ax + by + c = 0.") },
                { step: "2", text: t("Chọn một điểm thử không nằm trên d (thường dùng O(0,0)).", "Choose a test point not on d (usually O(0,0)).") },
                { step: "3", text: t("Thay điểm thử vào BPT:\n• Thỏa → tô màu nửa mp chứa điểm thử\n• Không thỏa → tô màu nửa mp đối diện", "Substitute test point:\n• Satisfies → shade the side containing it\n• Fails → shade the opposite side") },
                { step: "4", text: t("Quy ước vẽ đường biên: liền nét (≥, ≤), nét đứt (>, <).", "Draw boundary: solid line (≥, ≤), dashed line (>, <).") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 32, height: 32, borderRadius: "50%", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.7, paddingTop: 4, whiteSpace: "pre-wrap" }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📘 {t("Ví dụ: Biểu diễn miền nghiệm của 2x + y ≥ 4", "Example: Graph 2x + y ≥ 4")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 15, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.8 }}>
              <div>① {t("Đường biên: 2x + y = 4. Vẽ liền nét (dấu ≥).", "Boundary: 2x + y = 4. Draw solid (≥).")}</div>
              <div>② {t("Thử O(0,0): 2(0) + 0 = 0 < 4 → không thỏa.", "Test O(0,0): 2(0)+0 = 0 < 4 → fails.")}</div>
              <div>③ {t("Tô màu nửa mặt phẳng không chứa O (phía trên-phải đường biên).", "Shade the half-plane not containing O (above-right of boundary).")}</div>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(16, 185, 129, 0.15)", borderRadius: 8, color: "#4ade80", fontWeight: 600 }}>
                ✅ {t("Miền tô màu (kể cả đường biên) chính là miền nghiệm.", "The shaded region (including boundary) is the solution region.")}
              </div>
            </div>
          </div>
        </section>

        {/* ════ THỰC HÀNH ════ */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              {
                id: "e1",
                q: t("Xét xem điểm nào là nghiệm của BPT 3x − 2y > 6:\n(a) A(4, 2)\n(b) B(1, −3)\n(c) C(2, 0)", "Which points satisfy 3x − 2y > 6:\n(a) A(4, 2)\n(b) B(1, −3)\n(c) C(2, 0)"),
                a: [
                  t("(a) 3(4)−2(2)=12−4=8>6 ✓ → A là nghiệm", "(a) 3(4)−2(2)=8>6 ✓ → A is a solution"),
                  t("(b) 3(1)−2(−3)=3+6=9>6 ✓ → B là nghiệm", "(b) 3(1)−2(−3)=9>6 ✓ → B is a solution"),
                  t("(c) 3(2)−2(0)=6, 6>6 sai → C không là nghiệm", "(c) 3(2)−2(0)=6, 6>6 is false → C is not a solution"),
                ]
              },
              {
                id: "e2",
                q: t("Biểu diễn miền nghiệm của BPT: x + 2y ≤ 6", "Graph the solution region of: x + 2y ≤ 6"),
                a: [
                  t("Bước 1: Đường biên x + 2y = 6 (liền nét vì ≤).", "Step 1: Boundary x + 2y = 6 (solid line, ≤)."),
                  t("Bước 2: Thử O(0,0): 0+0 = 0 ≤ 6 ✓ → O thuộc miền nghiệm.", "Step 2: Test O(0,0): 0 ≤ 6 ✓ → O is in the region."),
                  t("Bước 3: Tô màu nửa mặt phẳng chứa O (phía dưới-trái đường biên).", "Step 3: Shade the half-plane containing O (below-left of boundary)."),
                ]
              },
              {
                id: "e3",
                q: t("Trong mặt phẳng Oxy, điểm M(−1, 3) thuộc miền nghiệm của BPT nào?", "In the Oxy plane, which inequality has M(−1, 3) as a solution?"),
                a: [
                  t("Thử với 2x − y + 5 ≥ 0:", "Test with 2x − y + 5 ≥ 0:"),
                  t("2(−1) − 3 + 5 = −2−3+5 = 0 ≥ 0 ✓ → M là nghiệm", "2(−1)−3+5 = 0 ≥ 0 ✓ → M is a solution"),
                  t("Thử x + y − 1 > 0: −1+3−1 = 1 > 0 ✓ → M cũng là nghiệm của BPT này.", "Test x+y−1>0: −1+3−1=1>0 ✓ → M is also a solution of this one."),
                ]
              },
            ].map(({ id, q, a }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập", "Exercise")}</div>
                  <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14 }}>{t("Toán 10", "Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginTop: 10, whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲", "Hide Answer ▲") : t("Xem đáp án ▼", "Show Answer ▼")}
                </button>
                {revealedAnswers[id] && <div style={{ padding: "16px 20px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "0 0 10px 10px" }}>{a.map((line, i) => <div key={i} style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)", marginBottom: 6 }}>{line}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>

        {/* ════ MINI GAME ════ */}
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
      videoId="unSBFwK881s"
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
