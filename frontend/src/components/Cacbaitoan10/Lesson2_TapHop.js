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

export default function Lesson2_TapHop() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson2_TapHop";
  const chapterTitle = { vi: "Chương I · Mệnh Đề và Tập Hợp", en: "Chapter I · Propositions and Sets" };
  const lessonTitle = { vi: "Bài 2: Tập Hợp", en: "Lesson 2: Sets" };
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
        "text": "sets",
        "vi": "tập hợp",
        "detail": "<b>sets</b>: tập hợp.",
        "detailTitle": "sets (tập hợp)"
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
        "text": "element",
        "vi": "phần tử",
        "detail": "<b>element</b>: phần tử.",
        "detailTitle": "element (phần tử)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "subset",
        "vi": "tập con",
        "detail": "<b>subset</b>: tập con.",
        "detailTitle": "subset (tập con)"
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
        "text": "set notation",
        "vi": "ký hiệu tập hợp",
        "detail": "<b>set notation</b>: ký hiệu tập hợp.",
        "detailTitle": "set notation (ký hiệu tập hợp)"
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
        "text": "element",
        "vi": "phần tử",
        "detail": "<b>element</b>: phần tử.",
        "detailTitle": "element (phần tử)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "subset",
        "vi": "tập con",
        "detail": "<b>subset</b>: tập con.",
        "detailTitle": "subset (tập con)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "set notation",
        "vi": "ký hiệu tập hợp",
        "detail": "<b>set notation</b>: ký hiệu tập hợp.",
        "detailTitle": "set notation (ký hiệu tập hợp)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    { q: t("Cách nào KHÔNG phải là cách xác định tập hợp?", "Which is NOT a valid way to define a set?"), options: [t("Liệt kê các phần tử", "List the elements"), t("Chỉ ra tính chất đặc trưng", "State a characteristic property"), t("Đặt tên bằng chữ thường", "Use a lowercase letter as name"), t("Dùng biểu đồ Venn", "Use a Venn diagram")], answer: 2, explain: t("Tập hợp được đặt tên bằng chữ IN HOA (A, B, C...), không dùng chữ thường.", "Sets are named with UPPERCASE letters (A, B, C...), not lowercase.") },
    { q: t("Tập hợp A = {1, 2, 3, 4}. Mệnh đề nào đúng?", "Set A = {1, 2, 3, 4}. Which statement is true?"), options: ["5 ∈ A", "3 ∉ A", "{1, 2} ⊂ A", "A ⊂ {1, 2}"], answer: 2, explain: t("{1,2} ⊂ A vì mọi phần tử của {1,2} đều thuộc A.", "{1,2} ⊂ A because every element of {1,2} belongs to A.") },
    { q: t("Tập hợp nào là tập con của tập ∅?", "Which set is a subset of ∅?"), options: ["{0}", "{∅}", "∅", t("Không có tập nào", "No set")], answer: 2, explain: t("∅ là tập con của mọi tập hợp, kể cả ∅ ⊂ ∅.", "∅ is a subset of every set, including ∅ ⊂ ∅.") },
    { q: t("A = {a, b, c}. Tập A có bao nhiêu tập con?", "A = {a, b, c}. How many subsets does A have?"), options: ["3", "6", "8", "9"], answer: 2, explain: t("Tập n phần tử có 2ⁿ tập con. 2³ = 8.", "A set with n elements has 2ⁿ subsets. 2³ = 8.") },
    { q: t("A = {1,2,3}, B = {1,2,3}. Kết luận nào đúng?", "A = {1,2,3}, B = {1,2,3}. Which conclusion is correct?"), options: ["A ⊂ B nhưng B ⊄ A", "A ⊃ B nhưng A ≠ B", "A = B", "A và B không so sánh được"], answer: 2, explain: t("A = B vì A ⊂ B và B ⊂ A (cùng phần tử, không phụ thuộc thứ tự).", "A = B since A ⊂ B and B ⊂ A (same elements, order does not matter).") },
  ];
  const tfCards = [
    { stmt: t("Tập hợp rỗng ∅ không là tập con của bất kỳ tập hợp nào.", "The empty set ∅ is not a subset of any set."), answer: false, explain: t("SAI — ∅ là tập con của mọi tập hợp.", "FALSE — ∅ is a subset of every set.") },
    { stmt: t("Nếu A ⊂ B và B ⊂ A thì A = B.", "If A ⊂ B and B ⊂ A, then A = B."), answer: true, explain: t("ĐÚNG — đây là định nghĩa hai tập bằng nhau.", "TRUE — this is the definition of set equality.") },
    { stmt: t("{1, 2, 3} = {3, 1, 2}.", "{1, 2, 3} = {3, 1, 2}."), answer: true, explain: t("ĐÚNG — thứ tự các phần tử không ảnh hưởng đến tập hợp.", "TRUE — order of elements does not matter in a set.") },
    { stmt: t("{1, 1, 2} = {1, 2}.", "{1, 1, 2} = {1, 2}."), answer: true, explain: t("ĐÚNG — mỗi phần tử chỉ xuất hiện một lần; phần tử lặp bị bỏ qua.", "TRUE — each element appears only once; duplicates are ignored.") },
    { stmt: t("A ⊂ B và a ∈ A suy ra a ∈ B.", "A ⊂ B and a ∈ A implies a ∈ B."), answer: true, explain: t("ĐÚNG — định nghĩa của tập con: mọi phần tử của A đều thuộc B.", "TRUE — definition of subset: every element of A belongs to B.") },
  ];
  const fillQuestions = [
    { id: "f1", template: t("Cho A = {x ∈ ℕ | x < 5}. Viết A bằng cách liệt kê: A = {___}", "Let A = {x ∈ ℕ | x < 5}. Write A by listing: A = {___}"), answer: "0,1,2,3,4", hint: t("Các số tự nhiên nhỏ hơn 5.", "Natural numbers less than 5.") },
    { id: "f2", template: t("Tập hợp n phần tử có ___ tập con.", "A set with n elements has ___ subsets."), answer: "2^n", hint: "2ⁿ" },
    { id: "f3", template: t("∅ ___ mọi tập hợp (dùng ký hiệu ⊂ hoặc ⊄).", "∅ ___ every set (use ⊂ or ⊄)."), answer: "⊂", hint: t("Tập rỗng là tập con của mọi tập hợp.", "The empty set is a subset of every set.") },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

        

        {/* OBJECTIVES */}
        

        {/* ── STICKY NAV ── */}
        

        {/* ════ KHỞI ĐỘNG ════ */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t('Khi nói về một nhóm vật thể — ví dụ "các số tự nhiên nhỏ hơn 10" hay "các học sinh trong lớp" — ta cần một khái niệm toán học để biểu diễn chúng. Toán học gọi đó là tập hợp.',
                'When talking about a collection of objects — e.g. "natural numbers less than 10" or "students in a class" — we need a mathematical concept to represent them. Mathematics calls this a set.')}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Hãy kể tên 3 ví dụ về tập hợp trong cuộc sống hằng ngày.", "Name 3 examples of sets in everyday life.")}</em></div>
          </div>
        </section>

        {/* ════ VIDEO BÀI GIẢNG ════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="tyDKR4Yw" 
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Don't Memorise (YouTube)", "Video by Don't Memorise (YouTube)")}
            />
          </div>
        </section>

        {/* ════ 1. TẬP HỢP ════ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Khái Niệm Tập Hợp", "1. Sets")} />
          <div className="ora" style={{ display: "grid", gap: 24 }}>
            <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
              <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Tập hợp là một nhóm các đối tượng, mỗi đối tượng gọi là phần tử. Tập hợp được ký hiệu bằng chữ in hoa, phần tử được liệt kê trong dấu ngoặc nhọn { }.", "A set is a collection of objects; each object is an element. Sets are denoted by uppercase letters; elements are listed inside curly braces { }.")}</div>
              <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("Nếu a là phần tử của A: a ∈ A. Nếu không: a ∉ A.", "If a is an element of A: a ∈ A. Otherwise: a ∉ A.")}</div>
            </div>
            <div className="reveal" data-reveal>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{t("Hai cách xác định tập hợp", "Two ways to define a set")}</div>
              <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
                {[
                  { method: t("① Liệt kê phần tử","① Listing elements"), example: "A = {1, 2, 3, 4, 5}", note: t("Liệt kê hết các phần tử, ngăn cách bởi dấu phẩy.","List all elements separated by commas.") },
                  { method: t("② Tính chất đặc trưng","② Characteristic property"), example: "B = {x ∈ ℕ | x ≤ 5}", note: t("Dùng điều kiện để xác định phần tử thuộc tập hợp.","Use a condition to define which elements belong.") },
                ].map((card, i) => (
                  <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{card.method}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 18, color: "#0B4F5C", marginBottom: 10, padding: "8px 12px", background: "white", borderRadius: 6 }}>{card.example}</div>
                    <div style={{ fontSize: 15, color: "#777" }}>{card.note}</div>
                  </article>
                ))}
              </div>
            </div>
            <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>∅ — {t("Tập hợp rỗng", "The Empty Set")}</div>
              <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Tập hợp không có phần tử nào gọi là tập hợp rỗng, ký hiệu ∅ hoặc {}.", "A set with no elements is called the empty set, denoted ∅ or {}.")}</div>
              <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[t("∅ là tập con của mọi tập hợp","∅ is a subset of every set"), t("∅ ≠ {0} (tập {0} có một phần tử)","∅ ≠ {0} (the set {0} has one element)")].map((note, i) => (
                  <div key={i} style={{ background: "white", padding: "8px 14px", borderRadius: 8, fontSize: 14, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💡 {note}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════ 2. TẬP CON ════ */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Tập Con (A ⊂ B)", "2. Subsets (A ⊂ B)")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("A là tập con của B (A ⊂ B) khi mọi phần tử của A đều là phần tử của B.", "A is a subset of B (A ⊂ B) when every element of A is also an element of B.")}</div>
            <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("A ⊄ B khi tồn tại ít nhất một phần tử của A không thuộc B.","A ⊄ B when at least one element of A does not belong to B.")}</div>
          </div>
          <div className="reveal" data-reveal style={{ marginBottom: 24, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{t("Số tập con của tập n phần tử", "Number of subsets of an n-element set")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 22, color: "#0B4F5C", textAlign: "center", padding: "12px 0" }}>|A| = n → {t("số tập con", "subsets")} = 2ⁿ</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 16, transition: "all 0.3s ease" }}>
              {[["A = {a}", 1, 2, ["{}", "{a}"]], ["A = {a,b}", 2, 4, ["{}", "{a}", "{b}", "{a,b}"]], ["A = {a,b,c}", 3, 8, ["...", "8 tập con"]]].map(([label, n, count, subsets], i) => (
                <article key={i} style={{ flex: "1 1 180px", padding: 16, borderRadius: 10, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#0B4F5C" }}>2{n === 1 ? "¹" : n === 2 ? "²" : "³"} = {count}</div>
                  <div style={{ fontSize: 13, color: "#777", marginTop: 6 }}>{subsets.join(", ")}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════ 3. TẬP BẰNG NHAU ════ */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Hai Tập Hợp Bằng Nhau", "3. Equal Sets")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("A = B khi và chỉ khi A ⊂ B và B ⊂ A, tức là hai tập có cùng tập phần tử.", "A = B if and only if A ⊂ B and B ⊂ A, meaning both sets contain exactly the same elements.")}</div>
            <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("Thứ tự liệt kê và số lần lặp phần tử không ảnh hưởng đến tập hợp.", "The order of listing and repetition of elements do not affect the set.")}</div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { a: "{1, 2, 3}", b: "{3, 1, 2}", eq: true, reason: t("Cùng phần tử, khác thứ tự → bằng nhau", "Same elements, different order → equal") },
              { a: "{1, 1, 2}", b: "{1, 2}", eq: true, reason: t("Phần tử lặp không tính → bằng nhau", "Repeated element counted once → equal") },
              { a: "{1, 2, 3}", b: "{1, 2}", eq: false, reason: t("A có phần tử 3 mà B không có → khác nhau", "A has element 3 that B does not → not equal") },
            ].map((ex, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 8 }}>{ex.a} {ex.eq ? "=" : "≠"} {ex.b}</div>
                <span style={{ fontSize: 12, fontWeight: 700, background: ex.eq ? "#eafaf1" : "#fdf2f2", color: ex.eq ? "#1e8449" : "#922b21", padding: "2px 10px", borderRadius: 20 }}>{ex.eq ? t("BẰNG NHAU", "EQUAL") : t("KHÁC NHAU", "NOT EQUAL")}</span>
                <div style={{ fontSize: 14, color: "#777", marginTop: 8, fontStyle: "italic" }}>{ex.reason}</div>
              </article>
            ))}
          </div>
        </section>

        {/* ════ THỰC HÀNH ════ */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              { id: "e1", q: t("Viết lại các tập hợp sau bằng cách liệt kê phần tử:\n(a) A = {x ∈ ℕ | x ≤ 4}\n(b) B = {x ∈ ℤ | -2 ≤ x ≤ 2}", "Rewrite by listing elements:\n(a) A = {x ∈ ℕ | x ≤ 4}\n(b) B = {x ∈ ℤ | -2 ≤ x ≤ 2}"), a: ["(a) A = {0, 1, 2, 3, 4}", "(b) B = {-2, -1, 0, 1, 2}"] },
              { id: "e2", q: t("Cho A = {1, 2, 3}. Liệt kê tất cả các tập con của A.", "For A = {1, 2, 3}, list all subsets of A."), a: [t("∅, {1}, {2}, {3}, {1,2}, {1,3}, {2,3}, {1,2,3} — tổng cộng 2³ = 8 tập con.", "∅, {1}, {2}, {3}, {1,2}, {1,3}, {2,3}, {1,2,3} — total 2³ = 8 subsets.")] },
              { id: "e3", q: t("Cho A = {1, 2, 4}, B = {x ∈ ℕ | x là ước của 4}.\nA và B có bằng nhau không?", "Let A = {1, 2, 4}, B = {x ∈ ℕ | x is a divisor of 4}.\nAre A and B equal?"), a: [t("B = {1, 2, 4} (ước của 4 là 1, 2, 4)", "B = {1, 2, 4} (divisors of 4 are 1, 2, 4)"), t("A = {1,2,4} = B → A = B ✓", "A = {1,2,4} = B → A = B ✓")] },
            ].map(({ id, q, a }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập","Exercise")}</div>
                  <div style={{ color: "#777", fontSize: 14 }}>{t("Toán 10","Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginTop: 10, whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "black", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲","Hide Answer ▲") : t("Xem đáp án ▼","Show Answer ▼")}
                </button>
                {revealedAnswers[id] && <div style={{ padding: "16px 20px", background: "#eafaf1", borderRadius: "0 0 10px 10px" }}>{a.map((line, i) => <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>{line}</div>)}</div>}
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
      videoId="tyDKR4Yw"
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
