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

export default function Lesson1_MenhDe() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson1_MenhDe";
  const chapterTitle = { vi: "Chương I · Mệnh Đề và Tập Hợp", en: "Chapter I · Propositions and Sets" };
  const lessonTitle = { vi: "Bài 1: Mệnh Đề", en: "Lesson 1: Mathematical Propositions" };
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
    "khai5",
    "📖",
    "6. Khái niệm",
    "6. Concept"
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
        "text": "mathematical propositions",
        "vi": "mệnh đề toán học",
        "detail": "<b>mathematical propositions</b>: mệnh đề toán học.",
        "detailTitle": "mathematical propositions (mệnh đề toán học)"
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
        "text": "truth value",
        "vi": "giá trị chân lý",
        "detail": "<b>truth value</b>: giá trị chân lý.",
        "detailTitle": "truth value (giá trị chân lý)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "negation",
        "vi": "phủ định",
        "detail": "<b>negation</b>: phủ định.",
        "detailTitle": "negation (phủ định)"
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
        "text": "implication",
        "vi": "mệnh đề kéo theo",
        "detail": "<b>implication</b>: mệnh đề kéo theo.",
        "detailTitle": "implication (mệnh đề kéo theo)"
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
        "text": "truth value",
        "vi": "giá trị chân lý",
        "detail": "<b>truth value</b>: giá trị chân lý.",
        "detailTitle": "truth value (giá trị chân lý)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "negation",
        "vi": "phủ định",
        "detail": "<b>negation</b>: phủ định.",
        "detailTitle": "negation (phủ định)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "implication",
        "vi": "mệnh đề kéo theo",
        "detail": "<b>implication</b>: mệnh đề kéo theo.",
        "detailTitle": "implication (mệnh đề kéo theo)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    { q: t("Câu nào dưới đây là mệnh đề đúng?", "Which of the following is a true proposition?"), options: [t('"x + 1 = 5"', '"x + 1 = 5"'), t('"Bạn có khỏe không?"', '"Are you well?"'), t('"2 + 2 = 4"', '"2 + 2 = 4"'), t('"Hãy học chăm chỉ!"', '"Study hard!"')], answer: 2, explain: t('"2 + 2 = 4" có giá trị chân lý xác định (ĐÚNG) → là mệnh đề.', '"2 + 2 = 4" has a definite truth value (TRUE) → it is a proposition.') },
    { q: t('Phủ định của P: "√2 là số hữu tỉ" là?', 'The negation of P: "√2 is rational" is?'), options: [t('"√2 là số thực"', '"√2 is real"'), t('"√2 không là số hữu tỉ"', '"√2 is not rational"'), '"√2 = 1.41"', t('"√2 là số nguyên"', '"√2 is an integer"')], answer: 1, explain: t('¬P: "√2 không là số hữu tỉ" → ĐÚNG.', '¬P: "√2 is not rational" → TRUE.') },
    { q: t("P ⇒ Q sai khi nào?", "When is P ⇒ Q false?"), options: [t("P sai, Q đúng", "P false, Q true"), t("P đúng, Q đúng", "P true, Q true"), t("P đúng, Q sai", "P true, Q false"), t("P sai, Q sai", "P false, Q false")], answer: 2, explain: t("P ⇒ Q chỉ SAI khi P đúng và Q sai.", "P ⇒ Q is FALSE only when P is true and Q is false.") },
    { q: t('Phủ định của "∀x ∈ ℝ, x² ≥ 0" là?', 'Negation of "∀x ∈ ℝ, x² ≥ 0" is?'), options: ["∀x ∈ ℝ, x² < 0", "∃x ∈ ℝ, x² < 0", "∃x ∈ ℝ, x² ≥ 0", "∀x ∈ ℝ, x² > 0"], answer: 1, explain: t("Phủ định của ∀ là ∃: ∃x ∈ ℝ, x² < 0.", "Negation of ∀ is ∃: ∃x ∈ ℝ, x² < 0.") },
    { q: t("P ⟺ Q đúng khi nào?", "When is P ⟺ Q true?"), options: [t("P đúng, Q sai", "P true, Q false"), t("P sai, Q đúng", "P false, Q true"), t("P và Q cùng giá trị chân lý", "P and Q share the same truth value"), t("P và Q khác nhau", "P and Q differ")], answer: 2, explain: t("P ⟺ Q đúng khi cả hai cùng đúng hoặc cùng sai.", "P ⟺ Q is true when both are true or both are false.") },
  ];
  const tfCards = [
    { stmt: t('"5 là số chẵn" là mệnh đề đúng.', '"5 is an even number" is a true proposition.'), answer: false, explain: t("SAI — \"5 là số chẵn\" là mệnh đề nhưng có giá trị SAI (5 là số lẻ).", "FALSE — it IS a proposition but its truth value is FALSE (5 is odd).") },
    { stmt: t("Câu hỏi không phải là mệnh đề.", "A question is not a proposition."), answer: true, explain: t("ĐÚNG — mệnh đề phải là câu khẳng định có thể xác định đúng/sai.", "TRUE — a proposition must be declarative with a definite truth value.") },
    { stmt: t("P ⇒ Q và Q ⇒ P luôn có cùng giá trị chân lý.", "P ⇒ Q and Q ⇒ P always share the same truth value."), answer: false, explain: t("SAI — ví dụ: \"chia hết 6 ⇒ chia hết 2\" đúng nhưng chiều ngược lại sai.", 'FALSE — "divisible by 6 ⇒ divisible by 2" is true but the converse is false.') },
    { stmt: t("Phủ định của mệnh đề đúng là mệnh đề sai.", "The negation of a true proposition is a false proposition."), answer: true, explain: t("ĐÚNG — ¬P luôn có giá trị ngược lại với P.", "TRUE — ¬P always has the opposite truth value of P.") },
    { stmt: t("Phủ định của ∃ là ∀.", "The negation of ∃ is ∀."), answer: true, explain: t("ĐÚNG — ¬(∃x, P(x)) = ∀x, ¬P(x).", "TRUE — ¬(∃x, P(x)) = ∀x, ¬P(x).") },
  ];
  const fillQuestions = [
    { id: "f1", template: t('Phủ định của P: "12 chia hết cho 3" là ¬P: "___"', 'Negation of P: "12 is divisible by 3" is ¬P: "___"'), answer: t("12 không chia hết cho 3", "12 is not divisible by 3"), hint: t("Thêm 'không' vào mệnh đề.", "Add 'not' to the proposition.") },
    { id: "f2", template: t("P ⇒ Q chỉ SAI khi P ___ và Q ___.", "P ⇒ Q is FALSE only when P is ___ and Q is ___."), answer: t("đúng, sai", "true, false"), hint: t("Xem lại bảng chân trị.", "Review the truth table.") },
    { id: "f3", template: t("Phủ định của ∀x ∈ A, P(x) là: ___ x ∈ A, ¬P(x).", "Negation of ∀x ∈ A, P(x) is: ___ x ∈ A, ¬P(x)."), answer: "∃", hint: t("'Với mọi' → 'Tồn tại'.", "'For all' → 'There exists'.") },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

        

        {/* OBJECTIVES */}
        

        {/* ── STICKY NAV (scroll-to anchors) ── */}
        

        {/* ════════════════════════════════════════
            KHỞI ĐỘNG
        ════════════════════════════════════════ */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t('Trong cuộc sống hằng ngày, chúng ta thường phát biểu những câu khẳng định — ví dụ: "Hôm nay trời nắng" hay "2 + 2 = 4". Liệu mọi câu đều có thể xác định đúng hay sai không?',
                'In everyday life we often make statements — e.g. "Today is sunny" or "2 + 2 = 4". Can every sentence be judged as true or false?')}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Hãy cho ví dụ một câu có thể xác định đúng/sai và một câu không thể.", "Give an example of a sentence that can be judged true/false, and one that cannot.")}</em></div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="Vzre276y-R0"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════
            1. MỆNH ĐỀ
        ════════════════════════════════════════ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Khái Niệm Mệnh Đề", "1. Propositions")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Mệnh đề là một câu khẳng định có giá trị chân lý xác định — hoặc đúng (Đ) hoặc sai (S), không thể vừa đúng vừa sai.", "A proposition is a declarative sentence with a definite truth value — either true (T) or false (F), but not both.")}</div>
            <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("Mệnh đề ký hiệu bằng chữ in hoa: P, Q, R. Câu hỏi và mệnh lệnh không phải mệnh đề.", "Propositions are denoted P, Q, R. Questions and commands are NOT propositions.")}</div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { label: t("✅ Mệnh đề ĐÚNG", "✅ TRUE Propositions"), items: ['"2 + 2 = 4"', t('"Hà Nội là thủ đô Việt Nam"', '"Hanoi is the capital of Vietnam"'), t('"Số 7 là số nguyên tố"', '"7 is a prime number"')], bc: "#1e8449", bb: "#eafaf1", badge: t("ĐÚNG","TRUE") },
              { label: t("❌ Mệnh đề SAI", "❌ FALSE Propositions"), items: ['"3 + 4 = 8"', t('"Mặt trời quay quanh Trái Đất"', '"The Sun orbits the Earth"')], bc: "#922b21", bb: "#fdf2f2", badge: t("SAI","FALSE") },
              { label: t("🚫 KHÔNG phải mệnh đề", "🚫 NOT Propositions"), items: [t('"x + 1 = 5" (chứa biến)', '"x + 1 = 5" (has variable)'), t('"Bạn có khỏe không?" (câu hỏi)', '"Are you well?" (question)'), t('"Học chăm chỉ!" (lệnh)', '"Study hard!" (command)')], bc: "#555", bb: "#f0f0f0", badge: t("Không xác định","Undetermined") },
            ].map((group, gi) => (
              <article key={gi} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{group.label}</div>
                {group.items.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 15, color: "#555", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{item}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, background: group.bb, color: group.bc, padding: "2px 10px", borderRadius: 20, marginLeft: 8, whiteSpace: "nowrap" }}>{group.badge}</span>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            2. PHỦ ĐỊNH
        ════════════════════════════════════════ */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Mệnh Đề Phủ Định (¬P)", "2. Negation (¬P)")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Phủ định của mệnh đề P, ký hiệu ¬P, là mệnh đề có giá trị chân lý ngược lại với P.", "The negation of P, written ¬P, is the proposition with the opposite truth value of P.")}</div>
          </div>
          <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>{t("Bảng chân trị", "Truth Table")}</div>
            <div style={{ display: "inline-block", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 15 }}>
                <thead><tr>{["P","¬P"].map(h => <th key={h} style={{ background: "black", color: "white", padding: "12px 48px", textAlign: "center" }}>{h}</th>)}</tr></thead>
                <tbody>
                  <tr><td style={{ padding: "10px 48px", textAlign: "center", background: "#eafaf1", color: "#1e8449", fontWeight: 600, border: "1px solid #eee" }}>{t("Đúng","True")}</td><td style={{ padding: "10px 48px", textAlign: "center", background: "#fdf2f2", color: "#922b21", fontWeight: 600, border: "1px solid #eee" }}>{t("Sai","False")}</td></tr>
                  <tr><td style={{ padding: "10px 48px", textAlign: "center", background: "#fdf2f2", color: "#922b21", fontWeight: 600, border: "1px solid #eee" }}>{t("Sai","False")}</td><td style={{ padding: "10px 48px", textAlign: "center", background: "#eafaf1", color: "#1e8449", fontWeight: 600, border: "1px solid #eee" }}>{t("Đúng","True")}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { p: t('P: "12 chia hết cho 3"','P: "12 is divisible by 3"'), pv: true, np: t('¬P: "12 không chia hết cho 3"','¬P: "12 is not divisible by 3"'), npv: false },
              { p: t('P: "√2 là số hữu tỉ"','P: "√2 is rational"'), pv: false, np: t('¬P: "√2 không là số hữu tỉ"','¬P: "√2 is not rational"'), npv: true },
            ].map((ex, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 15 }}>{ex.p}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, background: ex.pv?"#eafaf1":"#fdf2f2", color: ex.pv?"#1e8449":"#922b21", padding: "2px 10px", borderRadius: 20 }}>{ex.pv?t("ĐÚNG","TRUE"):t("SAI","FALSE")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 15 }}>{ex.np}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, background: ex.npv?"#eafaf1":"#fdf2f2", color: ex.npv?"#1e8449":"#922b21", padding: "2px 10px", borderRadius: 20 }}>{ex.npv?t("ĐÚNG","TRUE"):t("SAI","FALSE")}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            3. KÉO THEO
        ════════════════════════════════════════ */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Mệnh Đề Kéo Theo (P ⇒ Q)", "3. Implication (P ⇒ Q)")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t('Mệnh đề "Nếu P thì Q", ký hiệu P ⇒ Q. P là giả thiết, Q là kết luận. P ⇒ Q chỉ SAI khi P đúng và Q sai.', '"If P then Q", written P ⇒ Q. P is hypothesis, Q is conclusion. P ⇒ Q is FALSE only when P is true and Q is false.')}</div>
            <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("P là điều kiện đủ để có Q; Q là điều kiện cần để có P.", "P is sufficient for Q; Q is necessary for P.")}</div>
          </div>
          <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>{t("Bảng chân trị P ⇒ Q", "Truth Table for P ⇒ Q")}</div>
            <div style={{ display: "inline-block", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 15 }}>
                <thead><tr>{["P","Q","P ⇒ Q"].map(h => <th key={h} style={{ background: "black", color: "white", padding: "12px 40px", textAlign: "center" }}>{h}</th>)}</tr></thead>
                <tbody>{[["T","T","T"],["T","F","F"],["F","T","T"],["F","F","T"]].map((row,ri) => (<tr key={ri}>{row.map((c,ci) => <td key={ci} style={{ padding:"10px 40px", textAlign:"center", background:c==="T"?"#eafaf1":"#fdf2f2", color:c==="T"?"#1e8449":"#922b21", fontWeight:600, border:"1px solid #eee" }}>{c}</td>)}</tr>))}</tbody>
              </table>
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { expr: t('"Nếu n chia hết cho 6 thì n chia hết cho 2"','"If n is divisible by 6 then n is divisible by 2"'), v: true, note: t("Mọi bội của 6 đều là bội của 2.","Every multiple of 6 is a multiple of 2.") },
              { expr: t('"Nếu n chia hết cho 2 thì n chia hết cho 6"','"If n is divisible by 2 then n is divisible by 6"'), v: false, note: t("Phản ví dụ: n = 4.","Counter-example: n = 4.") },
            ].map((ex, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 15, marginBottom: 12 }}>{ex.expr}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: ex.v?"#eafaf1":"#fdf2f2", color: ex.v?"#1e8449":"#922b21", padding: "2px 10px", borderRadius: 20 }}>{ex.v?t("ĐÚNG","TRUE"):t("SAI","FALSE")}</span>
                  <span style={{ color: "#777", fontSize: 14, fontStyle: "italic" }}>{ex.note}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            4. TƯƠNG ĐƯƠNG
        ════════════════════════════════════════ */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("4. Mệnh Đề Tương Đương (P ⟺ Q)", "4. Equivalence (P ⟺ Q)")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t('Mệnh đề "P khi và chỉ khi Q", ký hiệu P ⟺ Q, đúng khi P và Q cùng giá trị chân lý.','"P if and only if Q", written P ⟺ Q, is true when P and Q share the same truth value.')}</div>
            <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("P ⟺ Q tương đương với (P ⇒ Q) ∧ (Q ⇒ P). P, Q là điều kiện cần và đủ của nhau.","P ⟺ Q ≡ (P ⇒ Q) ∧ (Q ⇒ P). P and Q are necessary and sufficient conditions for each other.")}</div>
          </div>
          <div className="reveal" data-reveal>
            <article style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "inline-flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 15 }}>{t('"n chia hết cho 2 khi và chỉ khi n là số chẵn"','"n is divisible by 2 if and only if n is even"')}</div>
              <span style={{ fontSize: 12, fontWeight: 700, background: "#eafaf1", color: "#1e8449", padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{t("ĐÚNG","TRUE")}</span>
            </article>
          </div>
        </section>

        {/* ════════════════════════════════════════
            5. LƯỢNG TỪ
        ════════════════════════════════════════ */}
        <section id="khai5" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("5. Ký Hiệu ∀ và ∃", "5. Quantifiers ∀ and ∃")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="120" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { sym: "∀", name: t("Với mọi (lượng từ phổ dụng)","For all (universal quantifier)"), desc: t('"∀x ∈ A, P(x)" — P(x) đúng với mọi x thuộc A.','"∀x ∈ A, P(x)" — P(x) is true for every x in A.'), neg: "¬(∀x ∈ A, P(x)) = ∃x ∈ A, ¬P(x)", ex: t('"∀n ∈ ℕ, n² ≥ 0" → ĐÚNG','"∀n ∈ ℕ, n² ≥ 0" → TRUE') },
              { sym: "∃", name: t("Tồn tại (lượng từ vị từ)","There exists (existential quantifier)"), desc: t('"∃x ∈ A, P(x)" — tồn tại ít nhất một x ∈ A sao cho P(x) đúng.','"∃x ∈ A, P(x)" — there is at least one x ∈ A such that P(x) holds.'), neg: "¬(∃x ∈ A, P(x)) = ∀x ∈ A, ¬P(x)", ex: t('"∃x ∈ ℝ, x² = 2" → ĐÚNG (x = √2)','"∃x ∈ ℝ, x² = 2" → TRUE (x = √2)') },
            ].map((q, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: "#0B4F5C", marginBottom: 8 }}>{q.sym}</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{q.name}</div>
                <div style={{ fontSize: 15, color: "#555", marginBottom: 10 }}>{q.desc}</div>
                <div style={{ fontSize: 14, color: "#777", marginBottom: 6, fontFamily: "monospace", background: "white", padding: "6px 10px", borderRadius: 6 }}>📌 {q.neg}</div>
                <div style={{ fontSize: 14, color: "#777" }}>📘 {q.ex}</div>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            THỰC HÀNH
        ════════════════════════════════════════ */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              { id: "e1", q: t("Trong các câu sau, câu nào là mệnh đề? Xác định đúng/sai.\n(a) \"5 là số chẵn\"\n(b) \"x + 3 = 7\"\n(c) \"Tổng ba góc của tam giác bằng 180°\"","Which are propositions? State T/F.\n(a) \"5 is even\"\n(b) \"x + 3 = 7\"\n(c) \"Sum of angles in a triangle = 180°\""), a: [t("(a) Mệnh đề — SAI (5 là số lẻ)","(a) Proposition — FALSE (5 is odd)"),t("(b) Không phải mệnh đề (chứa biến x)","(b) Not a proposition (contains variable x)"),t("(c) Mệnh đề — ĐÚNG","(c) Proposition — TRUE")] },
              { id: "e2", q: t("Viết phủ định:\n(a) P: \"√5 là số hữu tỉ\"\n(b) Q: \"Mọi số nguyên tố đều là số lẻ\"","Write the negation:\n(a) P: \"√5 is rational\"\n(b) Q: \"Every prime is odd\""), a: [t("(a) ¬P: \"√5 không là số hữu tỉ\" → ĐÚNG","(a) ¬P: \"√5 is not rational\" → TRUE"),t("(b) ¬Q: \"Tồn tại số nguyên tố không phải số lẻ\" → ĐÚNG (số 2)","(b) ¬Q: \"There exists a prime that is not odd\" → TRUE (2)")] },
              { id: "e3", q: t("P: \"ΔABC vuông tại A\", Q: \"BC² = AB² + AC²\".\nPhát biểu P ⇒ Q và kiểm tra.","P: \"△ABC is right-angled at A\", Q: \"BC² = AB² + AC²\".\nState P ⇒ Q and check."), a: [t("P ⇒ Q: \"Nếu ΔABC vuông tại A thì BC² = AB² + AC²\"","P ⇒ Q: \"If △ABC is right-angled at A, then BC² = AB² + AC²\""),t("Đây là Định lý Pythagoras → ĐÚNG","This is the Pythagorean Theorem → TRUE")] },
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

        {/* ════════════════════════════════════════
            MINI GAME
        ════════════════════════════════════════ */}
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
      videoId="Vzre276y-R0"
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
