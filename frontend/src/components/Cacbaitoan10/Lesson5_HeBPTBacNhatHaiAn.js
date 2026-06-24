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

export default function Lesson5_HeBPTBacNhatHaiAn() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson5_HeBPTBacNhatHaiAn";
  const chapterTitle = { vi: "Chương II · Bất Phương Trình Bậc Nhất", en: "Chapter II · Linear Inequalities" };
  const lessonTitle = { vi: "Bài 5: Hệ Bất Phương Trình Bậc Nhất Hai Ẩn", en: "Lesson 5: System of Linear Inequalities in Two Variables" };
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
        "text": "systems of linear inequalities",
        "vi": "hệ bất phương trình bậc nhất hai ẩn",
        "detail": "<b>systems of linear inequalities</b>: hệ bất phương trình bậc nhất hai ẩn.",
        "detailTitle": "systems of linear inequalities (hệ bất phương trình bậc nhất hai ẩn)"
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
        "text": "feasible region",
        "vi": "miền nghiệm chung",
        "detail": "<b>feasible region</b>: miền nghiệm chung.",
        "detailTitle": "feasible region (miền nghiệm chung)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "constraint",
        "vi": "điều kiện ràng buộc",
        "detail": "<b>constraint</b>: điều kiện ràng buộc.",
        "detailTitle": "constraint (điều kiện ràng buộc)"
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
        "text": "intersection",
        "vi": "giao của các miền",
        "detail": "<b>intersection</b>: giao của các miền.",
        "detailTitle": "intersection (giao của các miền)"
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
        "text": "feasible region",
        "vi": "miền nghiệm chung",
        "detail": "<b>feasible region</b>: miền nghiệm chung.",
        "detailTitle": "feasible region (miền nghiệm chung)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "constraint",
        "vi": "điều kiện ràng buộc",
        "detail": "<b>constraint</b>: điều kiện ràng buộc.",
        "detailTitle": "constraint (điều kiện ràng buộc)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "intersection",
        "vi": "giao của các miền",
        "detail": "<b>intersection</b>: giao của các miền.",
        "detailTitle": "intersection (giao của các miền)"
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
      q: t("Miền nghiệm của hệ BPT bậc nhất hai ẩn là?", "The solution region of a system of linear inequalities in 2 variables is?"),
      options: [t("Hợp của các nửa mặt phẳng", "Union of half-planes"), t("Giao của các nửa mặt phẳng", "Intersection of half-planes"), t("Một đường thẳng", "A line"), t("Toàn bộ mặt phẳng", "The entire plane")],
      answer: 1,
      explain: t("Nghiệm của hệ phải thỏa MỌI BPT trong hệ → giao của các nửa mặt phẳng.", "A solution must satisfy ALL inequalities → intersection of half-planes.")
    },
    {
      q: t("Điểm M(1, 2) có là nghiệm của hệ {x + y ≤ 4; x − y ≥ −2} không?", "Is M(1,2) a solution of {x+y ≤ 4; x−y ≥ −2}?"),
      options: [t("Có", "Yes"), t("Không", "No"), t("Không xác định", "Cannot determine"), t("Phụ thuộc vào a, b", "Depends on a, b")],
      answer: 0,
      explain: t("BPT 1: 1+2=3≤4 ✓. BPT 2: 1−2=−1≥−2 ✓. Cả hai thỏa → M là nghiệm.", "BPT 1: 3≤4 ✓. BPT 2: −1≥−2 ✓. Both satisfied → M is a solution.")
    },
    {
      q: t("Miền nghiệm của hệ có thể là?", "The solution region of a system can be?"),
      options: [t("Tập rỗng", "Empty set"), t("Đa giác lồi", "Convex polygon"), t("Nửa mặt phẳng", "Half-plane"), t("Tất cả các trường hợp trên", "All of the above")],
      answer: 3,
      explain: t("Miền nghiệm của hệ BPT có thể là rỗng, đa giác lồi (hữu hạn) hoặc nửa mặt phẳng (vô hạn).", "The solution region can be empty, a bounded convex polygon, or an unbounded half-plane.")
    },
    {
      q: t("Hệ BPT: {x ≥ 0; y ≥ 0; x + y ≤ 5}. Điểm góc của miền nghiệm là?", "System: {x≥0; y≥0; x+y≤5}. Vertices of the solution region?"),
      options: ["(0,0), (5,0), (0,5)", "(0,0), (1,0), (0,1)", "(5,5), (0,0), (5,0)", "(5,0), (0,5), (5,5)"],
      answer: 0,
      explain: t("Giao các đường biên: O(0,0), A(5,0), B(0,5) là 3 đỉnh của tam giác nghiệm.", "Intersections of boundaries: O(0,0), A(5,0), B(0,5) are the 3 vertices.")
    },
    {
      q: t("Để tìm miền nghiệm của hệ BPT, ta dùng phương pháp nào?", "To find the solution region of a system of linear inequalities, we?"),
      options: [
        t("Lấy hợp các miền nghiệm từng BPT", "Take the union of individual solution regions"),
        t("Lấy giao các miền nghiệm từng BPT (phần chung)", "Take the intersection (common part) of individual solution regions"),
        t("Giải từng BPT độc lập", "Solve each inequality independently"),
        t("Chỉ cần xét BPT đầu tiên", "Only consider the first inequality"),
      ],
      answer: 1,
      explain: t("Miền nghiệm của hệ = phần giao chung của tất cả các miền nghiệm đơn lẻ.", "System solution = common intersection of all individual solution regions.")
    },
  ];
  const tfCards = [
    { stmt: t("Mọi điểm trong miền nghiệm của hệ BPT đều thỏa mãn TẤT CẢ các BPT trong hệ.", "Every point in the solution region of the system satisfies ALL inequalities in the system."), answer: true, explain: t("ĐÚNG — đó chính là định nghĩa của nghiệm của hệ BPT.", "TRUE — that is the definition of a solution to a system of inequalities.") },
    { stmt: t("Miền nghiệm của hệ BPT luôn là một đa giác.", "The solution region of a system of inequalities is always a polygon."), answer: false, explain: t("SAI — miền nghiệm có thể là vô hạn (nửa mặt phẳng, góc phần tư) hoặc thậm chí là tập rỗng.", "FALSE — the region can be unbounded (half-plane, quadrant) or even empty.") },
    { stmt: t("Nếu O(0,0) thỏa tất cả các BPT trong hệ, thì O thuộc miền nghiệm của hệ.", "If O(0,0) satisfies all inequalities in the system, then O is in the solution region."), answer: true, explain: t("ĐÚNG — O là nghiệm của hệ khi và chỉ khi O thỏa tất cả BPT trong hệ.", "TRUE — O is a solution iff it satisfies every inequality in the system.") },
    { stmt: t("Miền nghiệm của hệ là giao của các nửa mặt phẳng tương ứng.", "The solution region is the intersection of the corresponding half-planes."), answer: true, explain: t("ĐÚNG — mỗi BPT cho một nửa mặt phẳng, hệ cho giao của chúng.", "TRUE — each inequality gives a half-plane; the system gives their intersection.") },
    { stmt: t("Hệ có 3 BPT thì miền nghiệm là tam giác.", "A system with 3 inequalities always has a triangular solution region."), answer: false, explain: t("SAI — có thể là vô hạn, hoặc tập rỗng tùy thuộc vào các đường biên.", "FALSE — it can be unbounded or empty depending on the boundaries.") },
  ];
  const fillQuestions = [
    { id: "f1", template: t("Nghiệm của hệ BPT phải thỏa ___ BPT trong hệ.", "A solution of the system must satisfy ___ inequalities in the system."), answer: "tất cả", altAnswers: ["all", "tat ca", "mọi", "moi"], hint: t("Phải thỏa đồng thời tất cả.", "Must satisfy all simultaneously.") },
    { id: "f2", template: t("Miền nghiệm của hệ = ___ các miền nghiệm từng BPT.", "Solution region of system = ___ of individual solution regions."), answer: "giao", altAnswers: ["intersection", "giao nhau", "phần giao"], hint: t("Phần chung giữa các miền.", "The common part of the regions.") },
    { id: "f3", template: t("Để tìm miền nghiệm của hệ trên đồ thị, ta tô ___ phần chung của các miền.", "To find the solution region graphically, we shade the ___ common part."), answer: "chung", altAnswers: ["common", "phần chung", "giao"], hint: t("Vùng thuộc tất cả các nửa mặt phẳng.", "The region belonging to all half-planes.") },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

        

        

        

        {/* KHỞI ĐỘNG */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t('Một nhà máy sản xuất hai sản phẩm X và Y. Với các ràng buộc về nguyên liệu, nhân công và máy móc, ta có nhiều BPT đồng thời:\n• 2x + y ≤ 100 (nguyên liệu)\n• x + 3y ≤ 90 (nhân công)\n• x ≥ 0, y ≥ 0 (sản lượng không âm)',
                'A factory makes products X and Y. With constraints on materials, labor and machines, we have multiple simultaneous inequalities:\n• 2x + y ≤ 100 (materials)\n• x + 3y ≤ 90 (labor)\n• x ≥ 0, y ≥ 0 (non-negative quantities)')}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Đây là hệ BPT. Bài toán tìm miền nghiệm xuất hiện trong nhiều bài toán tối ưu thực tế.", "This is a system of inequalities, appearing in many real-world optimization problems.")}</em></div>
          </div>
        </section>
        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="482VpZ7V0A4"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
            />
          </div>
        </section>


        {/* 1. ĐỊNH NGHĨA */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Định Nghĩa Hệ BPT", "1. System Definition")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#22d3ee", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Hệ BPT bậc nhất hai ẩn gồm nhiều BPT bậc nhất hai ẩn đặt đồng thời. Nghiệm của hệ là cặp (x₀, y₀) thỏa mãn TẤT CẢ các BPT trong hệ.",
                "A system of linear inequalities in two variables consists of multiple linear inequalities simultaneously. A solution is a pair (x₀, y₀) satisfying ALL inequalities in the system.")}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📘 {t("Ví dụ hệ BPT", "Example system")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, color: "#22d3ee", lineHeight: 2, padding: "10px 0" }}>
              {"{"} x + y ≤ 4<br />
              {"{"} x − y ≥ −2<br />
              {"{"} x ≥ 0
            </div>
            <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.5)", marginTop: 8 }}>
              {t("Nghiệm: mọi điểm (x,y) thỏa đồng thời cả 3 BPT trên.", "Solutions: all points (x,y) satisfying all 3 inequalities simultaneously.")}
            </div>
          </div>
        </section>

        {/* 2. MIỀN NGHIỆM */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Miền Nghiệm Của Hệ", "2. Solution Region of the System")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#22d3ee", marginBottom: 10 }}>📌 {t("Tính chất", "Properties")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Miền nghiệm của hệ = giao của tất cả các nửa mặt phẳng tương ứng với từng BPT. Miền này có thể là:", "Solution region = intersection of all corresponding half-planes. This region can be:")}
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { icon: "∅", title: t("Tập rỗng", "Empty set"), desc: t("Không có điểm nào thỏa tất cả BPT — các nửa mặt phẳng không có điểm chung.", "No point satisfies all — half-planes share no common point."), color: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
              { icon: "▲", title: t("Đa giác lồi hữu hạn", "Bounded convex polygon"), desc: t("Miền nghiệm là đa giác lồi có các đỉnh xác định.", "Solution region is a bounded convex polygon with defined vertices."), color: "rgba(16, 185, 129, 0.15)", text: "#4ade80" },
              { icon: "↗", title: t("Vùng vô hạn", "Unbounded region"), desc: t("Miền nghiệm kéo dài ra vô hạn theo một hoặc nhiều hướng.", "Solution region extends infinitely in one or more directions."), color: "#e8f4fd", text: "#38bdf8" },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#22d3ee", marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)" }}>{card.desc}</div>
                <div style={{ marginTop: 10, padding: "4px 10px", background: card.color, color: card.text, fontSize: 12, fontWeight: 700, borderRadius: 20, display: "inline-block" }}>{card.title}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. CÁCH GIẢI */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Cách Biểu Diễn Miền Nghiệm Của Hệ", "3. Graphing the Solution Region")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#22d3ee" }}>📋 {t("Các bước thực hiện", "Steps")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "flex", flexDirection: "column", gap: 12, transition: "all 0.3s ease" }}>
              {[
                { step: "1", text: t("Với mỗi BPT trong hệ: vẽ đường biên tương ứng và xác định nửa mp nghiệm.", "For each inequality: draw its boundary and identify the solution half-plane.") },
                { step: "2", text: t("Tô màu (nhẹ) từng miền nghiệm đơn lẻ theo màu khác nhau.", "Lightly shade each individual solution region with different colors.") },
                { step: "3", text: t("Phần giao chung (được tô màu bởi TẤT CẢ) chính là miền nghiệm của hệ.", "The common intersection (shaded by ALL) is the solution region of the system.") },
                { step: "4", text: t("Tìm các đỉnh (điểm góc) của miền bằng cách giải các hệ phương trình đường biên.", "Find the vertices by solving systems of boundary line equations.") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 32, height: 32, borderRadius: "50%", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.7, paddingTop: 4 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📘 {t("Ví dụ: Tìm miền nghiệm của hệ", "Example: Find solution region of")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, color: "#22d3ee", lineHeight: 2, marginBottom: 16 }}>
              {"{"} x + y ≤ 4 &nbsp;&nbsp; (1)<br />
              {"{"} x − y ≥ 0 &nbsp;&nbsp; (2)<br />
              {"{"} x ≥ 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (3)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 15, color: "rgba(255, 255, 255, 0.7)" }}>
              <div>① {t("Đường biên (1): x+y=4. Thử O: 0+0=0≤4 ✓ → tô phía chứa O.", "Boundary (1): x+y=4. Test O: 0≤4 ✓ → shade O's side.")}</div>
              <div>② {t("Đường biên (2): x−y=0 (y=x). Thử O: 0−0=0≥0 ✓ → tô phía chứa O.", "Boundary (2): x−y=0 (y=x). Test O: 0≥0 ✓ → shade O's side.")}</div>
              <div>③ {t("Đường biên (3): x=0. Thử điểm (1,0): 1≥0 ✓ → tô phía phải.", "Boundary (3): x=0. Test (1,0): 1≥0 ✓ → shade right side.")}</div>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(16, 185, 129, 0.15)", borderRadius: 8, color: "#4ade80", fontWeight: 600 }}>
                ✅ {t("Đỉnh miền: O(0,0), A(4,0), B(2,2) — tam giác có cạnh trên đường y=x.", "Vertices: O(0,0), A(4,0), B(2,2) — triangle on y=x.")}
              </div>
            </div>
          </div>
        </section>

        {/* THỰC HÀNH */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              {
                id: "e1",
                q: t("Kiểm tra xem M(2,1) có thuộc miền nghiệm của hệ:\n{x + y ≤ 5; 2x − y ≥ 0; x ≥ 0} không?", "Check if M(2,1) is in the solution region of:\n{x+y ≤ 5; 2x−y ≥ 0; x ≥ 0}"),
                a: [
                  "① x+y: 2+1=3≤5 ✓",
                  "② 2x−y: 4−1=3≥0 ✓",
                  "③ x: 2≥0 ✓",
                  t("→ M(2,1) THUỘC miền nghiệm ✅", "→ M(2,1) IS in the solution region ✅"),
                ]
              },
              {
                id: "e2",
                q: t("Tìm các đỉnh của miền nghiệm hệ:\n{x + y ≤ 6; x ≥ 0; y ≥ 0}", "Find vertices of the solution region:\n{x+y ≤ 6; x ≥ 0; y ≥ 0}"),
                a: [
                  t("Giao x+y=6 và x=0 → (0,6)", "Intersect x+y=6 and x=0 → (0,6)"),
                  t("Giao x+y=6 và y=0 → (6,0)", "Intersect x+y=6 and y=0 → (6,0)"),
                  t("Giao x=0 và y=0 → O(0,0)", "Intersect x=0 and y=0 → O(0,0)"),
                  t("3 đỉnh: O(0,0), A(6,0), B(0,6) — tam giác vuông.", "3 vertices: O(0,0), A(6,0), B(0,6) — right triangle."),
                ]
              },
              {
                id: "e3",
                q: t("Hệ {x ≥ 2; x ≤ 0} có miền nghiệm không?", "Does {x ≥ 2; x ≤ 0} have a solution region?"),
                a: [
                  t("BPT 1: x ≥ 2 (bên phải đường x=2)", "BPT 1: x ≥ 2 (right of x=2)"),
                  t("BPT 2: x ≤ 0 (bên trái đường x=0)", "BPT 2: x ≤ 0 (left of x=0)"),
                  t("Hai nửa mặt phẳng không giao nhau → Miền nghiệm là TẬP RỖNG ∅.", "Two non-intersecting half-planes → Solution region is EMPTY SET ∅."),
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

        {/* MINI GAME */}
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
      videoId="482VpZ7V0A4"
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
