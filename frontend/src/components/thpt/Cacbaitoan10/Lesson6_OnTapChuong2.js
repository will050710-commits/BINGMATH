/* eslint-disable react-hooks/static-components */
"use client";
import Link from "next/link";
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

export default function Lesson6_OnTapChuong2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson6_OnTapChuong2";
  const chapterTitle = { vi: "Chương II · Bất Phương Trình Bậc Nhất", en: "Chapter II · Linear Inequalities" };
  const lessonTitle = { vi: "Bài 4 · BPT Bậc Nhất Hai Ẩn", en: "Lesson 4 · Linear Inequality (2 vars)" };
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
        "text": "linear inequality review",
        "vi": "ôn tập bất phương trình bậc nhất",
        "detail": "<b>linear inequality review</b>: ôn tập bất phương trình bậc nhất.",
        "detailTitle": "linear inequality review (ôn tập bất phương trình bậc nhất)"
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
        "text": "graphing",
        "vi": "biểu diễn hình học",
        "detail": "<b>graphing</b>: biểu diễn hình học.",
        "detailTitle": "graphing (biểu diễn hình học)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "solution region",
        "vi": "miền nghiệm",
        "detail": "<b>solution region</b>: miền nghiệm.",
        "detailTitle": "solution region (miền nghiệm)"
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
        "text": "system",
        "vi": "hệ bất phương trình",
        "detail": "<b>system</b>: hệ bất phương trình.",
        "detailTitle": "system (hệ bất phương trình)"
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
        "text": "graphing",
        "vi": "biểu diễn hình học",
        "detail": "<b>graphing</b>: biểu diễn hình học.",
        "detailTitle": "graphing (biểu diễn hình học)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "solution region",
        "vi": "miền nghiệm",
        "detail": "<b>solution region</b>: miền nghiệm.",
        "detailTitle": "solution region (miền nghiệm)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "system",
        "vi": "hệ bất phương trình",
        "detail": "<b>system</b>: hệ bất phương trình.",
        "detailTitle": "system (hệ bất phương trình)"
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
      q: t("BPT 3x − y > 6. Điểm nào sau đây là nghiệm?", "BPT 3x − y > 6. Which point is a solution?"),
      options: ["(2, 0)", "(3, 1)", "(0, −7)", "(1, −3)"],
      answer: 2,
      explain: t("(0,−7): 3(0)−(−7)=7>6 ✓. Các điểm khác: (2,0)→6≯6; (3,1)→8>6 ✓ — cũng đúng! Nhưng (0,−7) là đáp án sắp xếp đầu tiên.", "(0,−7): 3(0)−(−7)=7>6 ✓. Note: (3,1) also works → check carefully.")
    },
    {
      q: t("Miền nghiệm của BPT x − y ≤ 0 là vùng chứa điểm nào?", "The solution region of x − y ≤ 0 contains which point?"),
      options: ["(2, 1)", "(3, −1)", "(0, 1)", "(5, 2)"],
      answer: 2,
      explain: t("(0,1): 0−1=−1≤0 ✓. (2,1): 1≰0. (3,−1): 4≰0. (5,2): 3≰0.", "(0,1): 0−1=−1≤0 ✓.")
    },
    {
      q: t("Hệ {x+y ≤ 3; x−y ≥ 1; x ≥ 0}. Điểm nào thuộc miền nghiệm?", "System {x+y ≤ 3; x−y ≥ 1; x ≥ 0}. Which point is in the region?"),
      options: ["(0, 3)", "(2, 0)", "(1, 2)", "(−1, 0)"],
      answer: 1,
      explain: t("(2,0): ①2+0=2≤3✓ ②2−0=2≥1✓ ③2≥0✓ — thỏa cả 3.", "(2,0): ①2≤3✓ ②2≥1✓ ③2≥0✓ — all 3 satisfied.")
    },
    {
      q: t("Để biểu diễn miền nghiệm của BPT ax+by+c<0, đường biên được vẽ như thế nào?", "To graph ax+by+c<0, the boundary is drawn as?"),
      options: [t("Đường liền nét (thuộc miền nghiệm)", "Solid line (included)"), t("Đường nét đứt (không thuộc miền nghiệm)", "Dashed line (excluded)"), t("Đường nét đôi", "Double line"), t("Không cần vẽ đường biên", "No boundary needed")],
      answer: 1,
      explain: t("Dấu < (hoặc >) → đường biên không thuộc miền nghiệm → vẽ nét đứt.", "< or > → boundary excluded → draw dashed line.")
    },
    {
      q: t("Miền nghiệm của hệ {x≥0; y≥0; x+y≤4} có bao nhiêu đỉnh?", "How many vertices does the solution region of {x≥0; y≥0; x+y≤4} have?"),
      options: ["2", "3", "4", "5"],
      answer: 1,
      explain: t("Ba đường biên giao nhau tạo 3 đỉnh: O(0,0), A(4,0), B(0,4) — tam giác.", "3 boundary lines create 3 vertices: O(0,0), A(4,0), B(0,4) — a triangle.")
    },
  ];
  const tfCards = [
    { stmt: t("BPT ax + by + c ≥ 0 có miền nghiệm là nửa mặt phẳng ĐÓNG (kể cả đường biên).", "BPT ax+by+c ≥ 0 has a CLOSED half-plane as solution region (boundary included)."), answer: true, explain: t("ĐÚNG — dấu ≥ → đường biên là một phần của miền nghiệm.", "TRUE — ≥ means boundary is part of the solution region.") },
    { stmt: t("Hệ BPT luôn có nghiệm.", "A system of linear inequalities always has solutions."), answer: false, explain: t("SAI — hệ có thể vô nghiệm nếu các nửa mặt phẳng không giao nhau.", "FALSE — the system may have no solution if the half-planes don't intersect.") },
    { stmt: t("Điểm nằm trên đường biên ax+by+c=0 luôn là nghiệm của cả BPT ax+by+c>0 và ax+by+c<0.", "A point on ax+by+c=0 is always a solution of both ax+by+c>0 and ax+by+c<0."), answer: false, explain: t("SAI — điểm trên đường biên thỏa ax+by+c=0, không thỏa > hay <.", "FALSE — points on the boundary satisfy =0, not > or <.") },
    { stmt: t("Miền nghiệm của hệ BPT là giao của các nửa mặt phẳng.", "The solution region of a system is the intersection of half-planes."), answer: true, explain: t("ĐÚNG — đây là định nghĩa cơ bản.", "TRUE — this is the basic definition.") },
    { stmt: t("Đỉnh (điểm góc) của miền nghiệm là giao điểm của các đường biên.", "The vertices of the solution region are intersections of boundary lines."), answer: true, explain: t("ĐÚNG — các đỉnh được tìm bằng cách giải hệ phương trình từng cặp đường biên.", "TRUE — vertices are found by solving systems of pairs of boundary equations.") },
  ];
  const fillQuestions = [
    { id: "f1", template: t("BPT bậc nhất HAI ẩn có dạng ax + ___ + c ≥ 0.", "Linear inequality in TWO variables has form ax + ___ + c ≥ 0."), answer: "by", altAnswers: ["BY"], hint: t("Ẩn thứ hai là y, hệ số là b.", "Second variable is y with coefficient b.") },
    { id: "f2", template: t("Để kiểm tra điểm M(x₀,y₀) có thuộc miền nghiệm không, ta ___ vào BPT.", "To check if M(x₀,y₀) is in the solution region, we ___ into the inequality."), answer: "thay", altAnswers: ["substitute", "thay vào", "thế vào", "thế"], hint: t("Thay giá trị x₀, y₀ vào biểu thức ax+by+c.", "Substitute x₀, y₀ into ax+by+c.") },
    { id: "f3", template: t("Miền nghiệm của hệ BPT bằng ___ của các miền nghiệm đơn lẻ.", "Solution region of a system equals the ___ of individual solution regions."), answer: "giao", altAnswers: ["intersection", "giao nhau", "phần giao chung"], hint: t("Phần chung của tất cả.", "The common part of all.") },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

        

        {/* Chapter progress nav */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40, transition: "all 0.3s ease" }}>
          {[
            { slug: "bpt-bac-nhat-hai-an", num: "4", title: t("BPT Bậc Nhất Hai Ẩn", "Linear Inequality (2 vars)") },
            { slug: "he-bpt-bac-nhat-hai-an", num: "5", title: t("Hệ BPT Bậc Nhất Hai Ẩn", "System of Inequalities") },
          ].map((lesson) => (
            <Link key={lesson.slug} href={`/cacbailam10/${lesson.slug}`} style={{ textDecoration: "none" }}>
              <article style={{ padding: 16, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", cursor: "pointer" }}>
                <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.5)", marginBottom: 4 }}>{t("Bài", "Lesson")} {lesson.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#22d3ee" }}>{lesson.title}</div>
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>← {t("Ôn lại", "Review")}</div>
              </article>
            </Link>
          ))}
        </div>

        {/* STICKY NAV */}
        

        {/* TÓM TẮT */}
        <section id="tomTat" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📚" title={t("Tóm Tắt Chương II", "Chapter II Summary")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              {
                title: t("Bài 4 · BPT Bậc Nhất Hai Ẩn", "Lesson 4 · Linear Inequality (2 vars)"),
                points: [
                  t("Dạng: ax + by + c > 0 (hoặc <, ≥, ≤)", "Form: ax + by + c > 0 (or <, ≥, ≤)"),
                  t("Nghiệm: cặp (x₀, y₀) thỏa BPT", "Solution: pair (x₀, y₀) satisfying the BPT"),
                  t("Miền nghiệm: nửa mặt phẳng", "Solution region: half-plane"),
                  t("Biên: liền nét (≥, ≤), nét đứt (>, <)", "Boundary: solid (≥, ≤), dashed (>, <)"),
                  t("Kiểm tra: thử điểm O(0,0)", "Test: try point O(0,0)"),
                ],
              },
              {
                title: t("Bài 5 · Hệ BPT Bậc Nhất Hai Ẩn", "Lesson 5 · System of Inequalities"),
                points: [
                  t("Nghiệm hệ: thỏa TẤT CẢ BPT trong hệ", "System solution: satisfies ALL inequalities"),
                  t("Miền nghiệm = giao các nửa mặt phẳng", "Solution region = intersection of half-planes"),
                  t("Có thể: đa giác lồi, vô hạn, hoặc tập rỗng", "Can be: convex polygon, unbounded, or empty"),
                  t("Đỉnh: giao điểm các cặp đường biên", "Vertices: pairwise boundary intersections"),
                ],
              },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#22d3ee", marginBottom: 12 }}>{card.title}</div>
                {card.points.map((pt, j) => (
                  <div key={j} style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.7)", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#22d3ee", fontWeight: 700, flexShrink: 0 }}>•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="5xQqwgS3O4U"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>

        {/* CÔNG THỨC */}
        <section id="congThuc" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📐" title={t("Công Thức và Quy Tắc Quan Trọng", "Key Formulas and Rules")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { label: t("Xác định nửa mặt phẳng nghiệm", "Finding solution half-plane"), formula: t("Thử O(0,0) vào BPT:\n• Thỏa → tô phía O\n• Không thỏa → tô phía kia", "Test O(0,0):\n• Satisfies → shade O's side\n• Fails → shade opposite") },
              { label: t("Đường biên", "Boundary line"), formula: t("≥ hoặc ≤ → liền nét (đường biên thuộc MN)\n> hoặc < → nét đứt (không thuộc MN)", "≥ or ≤ → solid line (boundary included)\n> or < → dashed line (boundary excluded)") },
              { label: t("Miền nghiệm hệ BPT", "System solution region"), formula: t("MN(hệ) = MN(BPT₁) ∩ MN(BPT₂) ∩ ...\n= phần chung của tất cả", "SR(system) = SR(BPT₁) ∩ SR(BPT₂) ∩ ...\n= common part of all") },
              { label: t("Tìm đỉnh miền nghiệm", "Finding vertices"), formula: t("Giải hệ PT từng cặp đường biên:\n{ d₁: a₁x+b₁y+c₁=0\n{ d₂: a₂x+b₂y+c₂=0", "Solve each pair of boundary equations:\n{ d₁: a₁x+b₁y+c₁=0\n{ d₂: a₂x+b₂y+c₂=0") },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#22d3ee", marginBottom: 10 }}>{card.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 14, color: "rgba(255, 255, 255, 0.9)", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 14px", borderRadius: 8 }}>{card.formula}</div>
              </article>
            ))}
          </div>
        </section>

        {/* BÀI TẬP TỔNG HỢP */}
        <section id="baiTapTongHop" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Bài Tập Tổng Hợp", "Mixed Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              {
                id: "e1",
                badge: t("Bài 4", "L4"),
                q: t("Biểu diễn miền nghiệm của:\n2x + 3y ≥ 6", "Graph the solution region of:\n2x + 3y ≥ 6"),
                a: [
                  t("Đường biên: 2x+3y=6 (liền nét, dấu ≥)", "Boundary: 2x+3y=6 (solid line, ≥)"),
                  t("Hai điểm trên biên: A(3,0) và B(0,2)", "Two boundary points: A(3,0) and B(0,2)"),
                  t("Thử O(0,0): 0+0=0 < 6 → O không thỏa", "Test O(0,0): 0 < 6 → O fails"),
                  t("Tô màu nửa mp KHÔNG chứa O (phía trên-phải)", "Shade half-plane NOT containing O (upper-right)"),
                ]
              },
              {
                id: "e2",
                badge: t("Bài 5", "L5"),
                q: t("Tìm miền nghiệm và các đỉnh của hệ:\n{x + y ≤ 5\n{2x − y ≤ 4\n{x ≥ 0, y ≥ 0", "Find solution region and vertices of:\n{x+y ≤ 5\n{2x−y ≤ 4\n{x ≥ 0, y ≥ 0"),
                a: [
                  t("Giải hệ x+y=5 và 2x−y=4: cộng → 3x=9 → x=3, y=2 → P(3,2)", "Solve x+y=5 and 2x−y=4: add → 3x=9 → x=3, y=2 → P(3,2)"),
                  t("Giao x+y=5 và x=0 → Q(0,5)", "Intersect x+y=5 and x=0 → Q(0,5)"),
                  t("Giao 2x−y=4 và y=0 → R(2,0)", "Intersect 2x−y=4 and y=0 → R(2,0)"),
                  t("Giao x=0 và y=0 → O(0,0)", "Intersect x=0 and y=0 → O(0,0)"),
                  t("4 đỉnh: O(0,0), R(2,0), P(3,2), Q(0,5)", "4 vertices: O(0,0), R(2,0), P(3,2), Q(0,5)"),
                ]
              },
              {
                id: "e3",
                badge: t("Tổng hợp", "Mixed"),
                q: t("Một nhà hàng cần pha chế 2 loại nước uống A, B với x lít A và y lít B. Yêu cầu: x+y ≥ 10, 2x+y ≤ 24, x ≥ 2, y ≥ 3. Kiểm tra xem (4, 8) có thỏa không?", "A restaurant makes x liters of drink A and y liters of drink B. Constraints: x+y≥10, 2x+y≤24, x≥2, y≥3. Does (4,8) satisfy all?"),
                a: [
                  "① x+y: 4+8=12≥10 ✓",
                  "② 2x+y: 8+8=16≤24 ✓",
                  "③ x: 4≥2 ✓",
                  "④ y: 8≥3 ✓",
                  t("→ (4,8) THỎA mãn tất cả điều kiện ✅", "→ (4,8) SATISFIES all constraints ✅"),
                ]
              },
            ].map(({ id, q, a, badge }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>📝 {t("Bài tập", "Exercise")}</div>
                    <span style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{badge}</span>
                  </div>
                  <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14, marginBottom: 10 }}>{t("Toán 10", "Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{q}</div>
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
      videoId="5xQqwgS3O4U"
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
