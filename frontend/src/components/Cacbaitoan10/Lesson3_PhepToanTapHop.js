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

export default function Lesson3_PhepToanTapHop() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson3_PhepToanTapHop";
  const chapterTitle = { vi: "Chương I · Mệnh Đề và Tập Hợp", en: "Chapter I · Propositions and Sets" };
  const lessonTitle = { vi: "Bài 3: Các Phép Toán Trên Tập Hợp", en: "Lesson 3: Set Operations" };
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
    "khai4",
    "📖",
    "5. Khái niệm",
    "5. Concept"
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
        "text": "set operations",
        "vi": "phép toán tập hợp",
        "detail": "<b>set operations</b>: phép toán tập hợp.",
        "detailTitle": "set operations (phép toán tập hợp)"
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
        "text": "union",
        "vi": "phép hợp",
        "detail": "<b>union</b>: phép hợp.",
        "detailTitle": "union (phép hợp)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "intersection",
        "vi": "phép giao",
        "detail": "<b>intersection</b>: phép giao.",
        "detailTitle": "intersection (phép giao)"
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
        "text": "complement",
        "vi": "phần bù",
        "detail": "<b>complement</b>: phần bù.",
        "detailTitle": "complement (phần bù)"
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
        "text": "union",
        "vi": "phép hợp",
        "detail": "<b>union</b>: phép hợp.",
        "detailTitle": "union (phép hợp)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "intersection",
        "vi": "phép giao",
        "detail": "<b>intersection</b>: phép giao.",
        "detailTitle": "intersection (phép giao)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "complement",
        "vi": "phần bù",
        "detail": "<b>complement</b>: phần bù.",
        "detailTitle": "complement (phần bù)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    { q: t("A = {1,2,3}, B = {2,3,4}. A ∪ B = ?", "A = {1,2,3}, B = {2,3,4}. A ∪ B = ?"), options: ["{2,3}", "{1,2,3,4}", "{1,4}", "{1,2,3,4,4}"], answer: 1, explain: t("A ∪ B = {1,2,3,4} — hợp gồm mọi phần tử của A hoặc B (không lặp).", "A ∪ B = {1,2,3,4} — union includes all elements in A or B (no repeats).") },
    { q: t("A = {1,2,3}, B = {2,3,4}. A ∩ B = ?", "A = {1,2,3}, B = {2,3,4}. A ∩ B = ?"), options: ["{1,2,3,4}", "{2,3}", "{1,4}", "∅"], answer: 1, explain: t("A ∩ B = {2,3} — giao gồm các phần tử thuộc cả A và B.", "A ∩ B = {2,3} — intersection includes elements in both A and B.") },
    { q: t("A = {1,2,3,4}, B = {2,4}. A \\ B = ?", "A = {1,2,3,4}, B = {2,4}. A \\ B = ?"), options: ["{2,4}", "{1,2,3,4}", "{1,3}", "∅"], answer: 2, explain: t("A \\ B = {1,3} — hiệu gồm các phần tử thuộc A nhưng không thuộc B.", "A \\ B = {1,3} — difference includes elements in A but not in B.") },
    { q: t("U = {1,2,3,4,5}, A = {1,3,5}. Cᵤ(A) = ?", "U = {1,2,3,4,5}, A = {1,3,5}. Cᵤ(A) = ?"), options: ["{1,3,5}", "{2,4}", "{1,2,3,4,5}", "∅"], answer: 1, explain: t("Cᵤ(A) = {2,4} — phần bù là các phần tử thuộc U nhưng không thuộc A.", "Cᵤ(A) = {2,4} — complement includes elements in U but not in A.") },
    { q: t("|A ∪ B| khi |A|=5, |B|=6, |A ∩ B|=2?", "|A ∪ B| when |A|=5, |B|=6, |A ∩ B|=2?"), options: ["11", "9", "13", "7"], answer: 1, explain: t("|A ∪ B| = |A| + |B| - |A ∩ B| = 5 + 6 - 2 = 9.", "|A ∪ B| = |A| + |B| - |A ∩ B| = 5 + 6 - 2 = 9.") },
  ];
  const tfCards = [
    { stmt: t("A ∩ B = B ∩ A với mọi tập A, B.", "A ∩ B = B ∩ A for all sets A, B."), answer: true, explain: t("ĐÚNG — giao có tính giao hoán.", "TRUE — intersection is commutative.") },
    { stmt: t("A \\ B = B \\ A với mọi tập A, B.", "A \\ B = B \\ A for all sets A, B."), answer: false, explain: t("SAI — hiệu KHÔNG có tính giao hoán. Ví dụ: {1,2}\\{2,3} = {1} ≠ {3} = {2,3}\\{1,2}.", "FALSE — difference is NOT commutative. Example: {1,2}\\{2,3} = {1} ≠ {3} = {2,3}\\{1,2}.") },
    { stmt: t("Cᵤ(Cᵤ(A)) = A.", "Cᵤ(Cᵤ(A)) = A."), answer: true, explain: t("ĐÚNG — phần bù của phần bù là chính tập đó.", "TRUE — the complement of the complement is the set itself.") },
    { stmt: t("A \\ B = A ∩ Cᵤ(B).", "A \\ B = A ∩ Cᵤ(B)."), answer: true, explain: t("ĐÚNG — đây là tương đương quan trọng: phần tử thuộc A và không thuộc B.", "TRUE — this is an important equivalence: elements in A and not in B.") },
    { stmt: t("|A ∪ B| = |A| + |B| luôn đúng.", "|A ∪ B| = |A| + |B| is always true."), answer: false, explain: t("SAI — chỉ đúng khi A ∩ B = ∅. Công thức đúng: |A ∪ B| = |A| + |B| - |A ∩ B|.", "FALSE — only true when A ∩ B = ∅. Correct formula: |A ∪ B| = |A| + |B| - |A ∩ B|.") },
  ];
  const fillQuestions = [
    { id: "f1", template: t("A = {1,2,3}, B = {3,4,5}. A ∪ B = {___}", "A = {1,2,3}, B = {3,4,5}. A ∪ B = {___}"), answer: "1,2,3,4,5", hint: t("Hợp gồm mọi phần tử của A hoặc B.", "Union includes all elements in A or B.") },
    { id: "f2", template: t("|A ∪ B| = |A| + |B| − ___ (công thức cộng).", "|A ∪ B| = |A| + |B| − ___ (addition formula)."), answer: "|A ∩ B|", hint: t("Trừ đi phần bị đếm hai lần.", "Subtract the part counted twice.") },
    { id: "f3", template: t("U = {1,2,3,4,5}, A = {2,4}. Cᵤ(A) = {___}", "U = {1,2,3,4,5}, A = {2,4}. Cᵤ(A) = {___}"), answer: "1,3,5", hint: t("Phần bù = U trừ A.", "Complement = U minus A.") },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    const OpCard = ({ op, sym, defn, formula, example, result }) => (
      <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#22d3ee" }}>{sym}</span>
          <span style={{ fontSize: 18, fontWeight: 600 }}>{op}</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 10 }}>{defn}</div>
        <div style={{ fontFamily: "monospace", fontSize: 16, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "8px 14px", borderRadius: 8, marginBottom: 10, color: "#22d3ee" }}>{formula}</div>
        <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)" }}>📘 {example} = <strong>{result}</strong></div>
      </div>
    );
    return (
      <>
        

        

        {/* OBJECTIVES */}
        

        {/* ── STICKY NAV ── */}
        

        {/* ════ KHỞI ĐỘNG ════ */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t('Trong một lớp học có 30 học sinh: 18 em học Toán, 15 em học Lý, và 7 em học cả hai. Có bao nhiêu em học ít nhất một trong hai môn? Làm thế nào để không đếm trùng?',
                'In a class of 30 students: 18 study Math, 15 study Physics, and 7 study both. How many study at least one? How can we avoid counting twice?')}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Đây chính là bài toán của phép toán tập hợp!", "This is exactly the problem of set operations!")}</em></div>
          </div>
        </section>
        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="sBvaPopWOmQ"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
            />
          </div>
        </section>


        {/* ════ 1. PHÉP HỢP ════ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Phép Hợp (A ∪ B)", "1. Union (A ∪ B)")} />
          <OpCard
            op={t("Hợp hai tập hợp", "Union of two sets")}
            sym="∪"
            defn={t("A ∪ B là tập hợp gồm các phần tử thuộc A hoặc thuộc B (hoặc cả hai).", "A ∪ B is the set of elements belonging to A or B (or both).")}
            formula="A ∪ B = {x | x ∈ A hoặc x ∈ B}"
            example="A={1,2,3}, B={2,3,4} → A ∪ B"
            result="{1,2,3,4}"
          />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>📐 {t("Tính chất", "Properties")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, transition: "all 0.3s ease" }}>
              {[["A ∪ B = B ∪ A", t("Giao hoán","Commutative")], ["(A ∪ B) ∪ C = A ∪ (B ∪ C)", t("Kết hợp","Associative")], ["A ∪ ∅ = A", t("Phần tử trung lập","Identity")], ["A ∪ A = A", t("Lũy đẳng","Idempotent")]].map(([formula, name]) => (
                <article key={formula} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 15, color: "#22d3ee", marginBottom: 4 }}>{formula}</div>
                  <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.5)" }}>{name}</div>
                </article>
              ))}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>📊 {t("Công thức cộng (Inclusion-Exclusion)", "Inclusion-Exclusion Formula")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 20, color: "#22d3ee", textAlign: "center", padding: "16px 0" }}>|A ∪ B| = |A| + |B| − |A ∩ B|</div>
            <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.5)", textAlign: "center" }}>{t("Tránh đếm hai lần các phần tử thuộc cả A và B.", "Avoids counting twice elements in both A and B.")}</div>
          </div>
        </section>

        {/* ════ 2. PHÉP GIAO ════ */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Phép Giao (A ∩ B)", "2. Intersection (A ∩ B)")} />
          <OpCard
            op={t("Giao hai tập hợp", "Intersection of two sets")}
            sym="∩"
            defn={t("A ∩ B là tập hợp gồm các phần tử vừa thuộc A vừa thuộc B.", "A ∩ B is the set of elements belonging to both A and B.")}
            formula="A ∩ B = {x | x ∈ A và x ∈ B}"
            example="A={1,2,3}, B={2,3,4} → A ∩ B"
            result="{2,3}"
          />
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>📐 {t("Tính chất", "Properties")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, transition: "all 0.3s ease" }}>
              {[["A ∩ B = B ∩ A", t("Giao hoán","Commutative")], ["(A ∩ B) ∩ C = A ∩ (B ∩ C)", t("Kết hợp","Associative")], ["A ∩ ∅ = ∅", t("Phần tử không","Zero element")], ["A ∩ A = A", t("Lũy đẳng","Idempotent")]].map(([formula, name]) => (
                <article key={formula} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 15, color: "#22d3ee", marginBottom: 4 }}>{formula}</div>
                  <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.5)" }}>{name}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════ 3. PHÉP HIỆU ════ */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Phép Hiệu (A \\ B)", "3. Difference (A \\ B)")} />
          <OpCard
            op={t("Hiệu hai tập hợp", "Difference of two sets")}
            sym="\\"
            defn={t("A \\ B là tập hợp gồm các phần tử thuộc A nhưng không thuộc B.", "A \\ B is the set of elements in A but not in B.")}
            formula="A \\ B = {x | x ∈ A và x ∉ B} = A ∩ Cᵤ(B)"
            example="A={1,2,3,4}, B={2,4} → A \\ B"
            result="{1,3}"
          />
          <div className="reveal" data-reveal style={{ padding: 14, borderRadius: 10, background: "rgba(239, 68, 68, 0.15)", fontSize: 15, color: "#f87171" }}>
            ⚠️ {t("Chú ý: A \\ B ≠ B \\ A (phép hiệu KHÔNG có tính giao hoán)", "Note: A \\ B ≠ B \\ A (difference is NOT commutative)")}
          </div>
        </section>

        {/* ════ 4. PHẦN BÙ ════ */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("4. Phần Bù Cᵤ(A)", "4. Complement Cᵤ(A)")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#22d3ee", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Cho tập hợp toàn thể U và A ⊂ U. Phần bù của A trong U là tập gồm các phần tử thuộc U nhưng không thuộc A.", "Given universe U and A ⊂ U, the complement of A in U is the set of elements in U but not in A.")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, color: "#22d3ee", margin: "10px 0", padding: "8px 14px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 8 }}>Cᵤ(A) = U \\ A = {"{x | x ∈ U và x ∉ A}"}</div>
            <div style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)" }}>📘 U = {"{1,2,3,4,5}"}, A = {"{1,3,5}"} → Cᵤ(A) = <strong>{"{2,4}"}</strong></div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>🔁 {t("Định luật De Morgan", "De Morgan's Laws")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, transition: "all 0.3s ease" }}>
              {[{ law: "Cᵤ(A ∪ B) = Cᵤ(A) ∩ Cᵤ(B)", desc: t("Phần bù của hợp = giao của hai phần bù", "Complement of union = intersection of complements") }, { law: "Cᵤ(A ∩ B) = Cᵤ(A) ∪ Cᵤ(B)", desc: t("Phần bù của giao = hợp của hai phần bù", "Complement of intersection = union of complements") }].map((item, i) => (
                <article key={i} style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 16, color: "#22d3ee", marginBottom: 6 }}>{item.law}</div>
                  <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)" }}>{item.desc}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════ THỰC HÀNH ════ */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              { id: "e1", q: t("Cho A = {1,2,3,4,5}, B = {3,4,5,6,7}.\nTính: A ∪ B, A ∩ B, A \\ B, B \\ A.", "Let A = {1,2,3,4,5}, B = {3,4,5,6,7}.\nFind: A ∪ B, A ∩ B, A \\ B, B \\ A."), a: ["A ∪ B = {1,2,3,4,5,6,7}", "A ∩ B = {3,4,5}", "A \\ B = {1,2}", "B \\ A = {6,7}"] },
              { id: "e2", q: t("Lớp 10A có 40 học sinh, 25 học Toán, 20 học Văn, 10 học cả hai. Có bao nhiêu học sinh học ít nhất một trong hai môn?", "Class 10A: 40 students, 25 study Math, 20 study Literature, 10 study both. How many study at least one?"), a: [t("|M ∪ V| = |M| + |V| − |M ∩ V| = 25 + 20 − 10 = 35 học sinh.","| M ∪ V| = |M| + |V| − |M ∩ V| = 25 + 20 − 10 = 35 students.")] },
              { id: "e3", q: t("Cho U = {1,2,3,4,5,6,7,8}, A = {1,3,5,7}.\nTìm Cᵤ(A) và kiểm tra Cᵤ(Cᵤ(A)) = A.", "Let U = {1,2,3,4,5,6,7,8}, A = {1,3,5,7}.\nFind Cᵤ(A) and verify Cᵤ(Cᵤ(A)) = A."), a: ["Cᵤ(A) = {2,4,6,8}", "Cᵤ(Cᵤ(A)) = Cᵤ({2,4,6,8}) = {1,3,5,7} = A ✓"] },
            ].map(({ id, q, a }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập","Exercise")}</div>                  <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14 }}>{t("Toán 10","Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginTop: 10, whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲","Hide Answer ▲") : t("Xem đáp án ▼","Show Answer ▼")}
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
      videoId="sBvaPopWOmQ"
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
