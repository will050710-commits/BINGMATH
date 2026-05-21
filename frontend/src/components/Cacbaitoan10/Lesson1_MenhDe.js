/* eslint-disable react-hooks/static-components */
 
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";

const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#0B4F5C", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0f0f0" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

const ResultSummary = ({ items, onReset, scoreLabel, t }) => (
  <div>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>
        {items.filter(i => i.correct).length === items.length ? "🏆" : items.filter(i => i.correct).length >= items.length * 0.6 ? "👍" : "💪"}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#0B4F5C" }}>{items.filter(i => i.correct).length} / {items.length}</div>
      <div style={{ color: "#777", fontSize: 16, marginTop: 4 }}>{scoreLabel}</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ padding: "14px 18px", borderRadius: 10, background: item.correct ? "#eafaf1" : "#fdf2f2", border: `1px solid ${item.correct ? "#a9dfbf" : "#f1948a"}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.correct ? "✅" : "❌"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 4 }}>{t("Câu", "Q")} {idx + 1}: {item.qText}</div>
              {!item.correct && <div style={{ fontSize: 14, color: "#922b21" }}>{t("Đáp án đúng:", "Correct answer:")} <strong>{item.correctText}</strong></div>}
              {item.yourText && !item.correct && <div style={{ fontSize: 14, color: "#777" }}>{t("Bạn chọn:", "You answered:")} {item.yourText}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center" }}>
      <button onClick={onReset} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>🔄 {t("Chơi lại", "Play Again")}</button>
    </div>
  </div>
);

export default function Lesson1_MenhDe() {
  const [lang, setLang] = useState("vi");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [gameMode, setGameMode] = useState("mc");
  const [mcIndex, setMcIndex] = useState(0);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcScore, setMcScore] = useState(0);
  const [mcDone, setMcDone] = useState(false);
  const [mcHistory, setMcHistory] = useState([]);
  const [tfIndex, setTfIndex] = useState(0);
  const [tfFlipped, setTfFlipped] = useState(false);
  const [tfScore, setTfScore] = useState(0);
  const [tfDone, setTfDone] = useState(false);
  const [tfHistory, setTfHistory] = useState([]);
  const [fillAnswers, setFillAnswers] = useState({});
  const [fillChecked, setFillChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      if (el.hasAttribute("data-reveal-stagger")) {
        const stagger = parseInt(el.getAttribute("data-stagger") || "80", 10);
        Array.from(el.children).forEach((child, i) => {
          child.style.opacity = "0";
          child.style.transform = "translateY(24px) scale(0.97)";
          child.style.transition = `opacity 0.5s cubic-bezier(.2,.8,.2,1) ${i * stagger}ms, transform 0.45s cubic-bezier(.2,.8,.2,1) ${i * stagger}ms`;
          child.style.willChange = "opacity, transform";
        });
      }
    });
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.hasAttribute("data-reveal-stagger")) {
              const stagger = parseInt(el.getAttribute("data-stagger") || "80", 10);
              Array.from(el.children).forEach((child, i) => {
                setTimeout(() => { child.style.opacity = "1"; child.style.transform = "translateY(0) scale(1)"; }, i * stagger);
              });
            }
            el.classList.add("visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const t = (vi, en) => (lang === "vi" ? vi : en);

  const videoSubtitles = [
    {
      start: 0, end: 5,
      words: [
        { text: "Let's", vi: "Hãy" },
        { text: "study", vi: "nghiên cứu/học" },
        { text: "mathematical", vi: "toán học", detail: "<b>Mathematical</b>: Thuộc về toán học, liên quan đến toán học.", detailTitle: "Mathematical (Toán học)" },
        { text: "propositions.", vi: "mệnh đề.", detail: "<b>Proposition (Mệnh đề)</b>:<br/>Một câu khẳng định có tính đúng hoặc sai rõ ràng.", detailTitle: "Proposition (Mệnh đề)" }
      ]
    },
    {
      start: 5, end: 12,
      words: [
        { text: "Every", vi: "Mỗi" },
        { text: "proposition", vi: "mệnh đề" },
        { text: "has", vi: "có" },
        { text: "a", vi: "một" },
        { text: "truth", vi: "chân lý" },
        { text: "value,", vi: "giá trị,", detail: "<b>Truth value (Giá trị chân lý)</b>:<br/>Tính Đúng (True) hoặc Sai (False) của một mệnh đề.", detailTitle: "Truth value" },
        { text: "which", vi: "cái mà" },
        { text: "is", vi: "là" },
        { text: "either", vi: "hoặc" },
        { text: "true", vi: "đúng", detail: "<b>True (Đúng)</b>: Mệnh đề có giá trị chân lý đúng, thường ký hiệu là T hoặc 1.", detailTitle: "True (Đúng)" },
        { text: "or", vi: "hoặc" },
        { text: "false.", vi: "sai.", detail: "<b>False (Sai)</b>: Mệnh đề có giá trị chân lý sai, thường ký hiệu là F hoặc 0.", detailTitle: "False (Sai)" }
      ]
    },
    {
      start: 12, end: 20,
      words: [
        { text: "We", vi: "Chúng ta" },
        { text: "can", vi: "có thể" },
        { text: "form", vi: "tạo ra" },
        { text: "negation,", vi: "phép phủ định,", detail: "<b>Negation (Phủ định)</b>:<br/>Mệnh đề phủ định của P là ¬P, đúng khi P sai và sai khi P đúng.", detailTitle: "Negation (Phủ định)" },
        { text: "implication,", vi: "phép kéo theo,", detail: "<b>Implication (Mệnh đề kéo theo)</b>:<br/>Mệnh đề 'Nếu P thì Q' (P ⇒ Q), chỉ sai khi P đúng và Q sai.", detailTitle: "Implication (Kéo theo)" },
        { text: "equivalence,", vi: "mệnh đề tương đương,", detail: "<b>Equivalence (Mệnh đề tương đương)</b>:<br/>Mệnh đề 'P nếu và chỉ nếu Q' (P ⇔ Q), đúng khi P và Q có cùng giá trị chân lý.", detailTitle: "Equivalence (Tương đương)" },
        { text: "or", vi: "hoặc" },
        { text: "use", vi: "sử dụng" },
        { text: "a", vi: "một" },
        { text: "quantifier.", vi: "lượng từ.", detail: "<b>Quantifier (Lượng từ)</b>:<br/>Ký hiệu diễn tả số lượng như Với mọi (∀) hoặc Tồn tại (∃).", detailTitle: "Quantifier (Lượng từ)" }
      ]
    }
  ];


  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

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

  const handleMcSelect = (i) => {
    if (mcSelected !== null) return;
    setMcSelected(i);
    const correct = i === mcQuestions[mcIndex].answer;
    if (correct) setMcScore((s) => s + 1);
    setMcHistory((h) => [...h, { q: mcIndex, selected: i, correct }]);
  };
  const handleMcNext = () => { if (mcIndex + 1 >= mcQuestions.length) setMcDone(true); else { setMcIndex((i) => i + 1); setMcSelected(null); } };
  const resetMc = () => { setMcIndex(0); setMcSelected(null); setMcScore(0); setMcDone(false); setMcHistory([]); };
  const handleTfAnswer = (ans) => {
    if (tfFlipped) return;
    setTfFlipped(true);
    const correct = ans === tfCards[tfIndex].answer;
    if (correct) setTfScore((s) => s + 1);
    setTfHistory((h) => [...h, { q: tfIndex, given: ans, correct }]);
  };
  const handleTfNext = () => { if (tfIndex + 1 >= tfCards.length) setTfDone(true); else { setTfIndex((i) => i + 1); setTfFlipped(false); } };
  const resetTf = () => { setTfIndex(0); setTfFlipped(false); setTfScore(0); setTfDone(false); setTfHistory([]); };
  const checkFill = (id) => { const correct = fillQuestions.find((q) => q.id === id).answer.toLowerCase().replace(/\s/g, ""); return (fillAnswers[id] || "").toLowerCase().replace(/\s/g, "") === correct; };

  const mcResultItems = mcHistory.map((h) => ({ correct: h.correct, qText: mcQuestions[h.q].q, correctText: mcQuestions[h.q].options[mcQuestions[h.q].answer], yourText: mcQuestions[h.q].options[h.selected] }));
  const tfResultItems = tfHistory.map((h) => ({ correct: h.correct, qText: tfCards[h.q].stmt, correctText: h.correct ? t("ĐÚNG","TRUE") : t("SAI","FALSE"), yourText: h.given ? t("ĐÚNG","TRUE") : t("SAI","FALSE") }));
  const fillResultItems = fillChecked ? fillQuestions.map((q) => ({ correct: checkFill(q.id), qText: q.template, correctText: q.answer, yourText: fillAnswers[q.id] || t("(bỏ trống)", "(blank)") })) : [];

  const tabs = [
    ["khoiDong", "🚀", t("Khởi động", "Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],
    ["khai1",    "📖", t("1. Mệnh Đề", "1. Propositions")],
    ["khai2",    "📖", t("2. Phủ Định", "2. Negation")],
    ["khai3",    "📖", t("3. Kéo Theo", "3. Implication")],
    ["khai4",    "📖", t("4. Tương Đương", "4. Equivalence")],
    ["khai5",    "📖", t("5. ∀ và ∃", "5. Quantifiers")],
    ["thucHanh", "✏️", t("Thực Hành", "Practice")],
    ["miniGame", "🎮", t("Mini Game", "Mini Game")],
  ];

  const SectionHeader = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#0B4F5C", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0f0f0" }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );

  return (
    <div style={{ width: "100%", background: "#ffffff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>

        {/* BACK */}
        <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>
            ← {t("Quay lại", "Back to lessons")}
          </Link>
        </div>

        {/* HEADER */}
        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>{t("Chương I · Mệnh Đề và Tập Hợp", "Chapter I · Propositions and Sets")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 1: Mệnh Đề", "Lesson 1: Mathematical Propositions")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        {/* OBJECTIVES */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
          {[t("Nhận biết được mệnh đề và mệnh đề chứa biến.", "Identify propositions and propositional functions."), t("Phân biệt mệnh đề đúng và mệnh đề sai.", "Distinguish true and false propositions."), t("Hiểu và vận dụng mệnh đề phủ định (¬P).", "Understand and apply negation (¬P)."), t("Hiểu mệnh đề kéo theo (⇒) và tương đương (⟺).", "Understand implication (⇒) and equivalence (⟺)."), t("Sử dụng ký hiệu ∀ (với mọi) và ∃ (tồn tại).", "Use quantifiers ∀ (for all) and ∃ (there exists).")].map((obj, i) => (
            <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• {obj}</div>
          ))}
        </div>

        {/* ── STICKY NAV (scroll-to anchors) ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", paddingTop: 12, paddingBottom: 12, marginBottom: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map(([id, icon, label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ background: "#f9f9f9", color: "black", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "black"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "black"; }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

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
              videoId="sOeldimAvnM"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (CC BY-SA)", "Video by Khan Academy (CC BY-SA)")}
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
        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎮" title={t("Mini Game","Mini Game")} />

          {/* mode picker */}
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s ease" }}>
            {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu hỏi","5 questions")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background: gameMode===mode?"black":"#f9f9f9", color: gameMode===mode?"white":"black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

          {/* MC */}
          {gameMode === "mc" && (
            <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!mcDone ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 8 }}>{t("Câu","Q")} {mcIndex+1}/{mcQuestions.length} · {t("Điểm:","Score:")} {mcScore}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{mcQuestions[mcIndex].q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mcQuestions[mcIndex].options.map((opt, i) => {
                      let bg = "white", color = "black";
                      if (mcSelected !== null) { if (i === mcQuestions[mcIndex].answer) { bg = "#eafaf1"; color = "#1e8449"; } else if (i === mcSelected) { bg = "#fdf2f2"; color = "#922b21"; } }
                      return <button key={i} onClick={() => handleMcSelect(i)} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 10, border: "none", background: bg, color, fontSize: 15, fontWeight: mcSelected!==null&&(i===mcSelected||i===mcQuestions[mcIndex].answer)?600:400, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}>{String.fromCharCode(65+i)}. {opt}</button>;
                    })}
                  </div>
                  {mcSelected !== null && (<><div style={{ marginTop: 16, padding: "12px 16px", background: "white", borderRadius: 8, fontSize: 15, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {mcQuestions[mcIndex].explain}</div><button onClick={handleMcNext} style={{ marginTop: 14, padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{mcIndex+1<mcQuestions.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: "#0B4F5C", marginBottom: 8 }}>🏆 {mcScore}/{mcQuestions.length}</div>
                  <div style={{ color: "#777", fontSize: 18, marginBottom: 20 }}>{mcScore===mcQuestions.length?t("Xuất sắc! 🎉","Perfect! 🎉"):mcScore>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")}</div>
                  <button onClick={resetMc} style={{ padding: "10px 18px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>{t("Chơi lại","Play Again")}</button>
                </div>
              )}
            </div>
          )}

          {/* TF */}
          {gameMode === "tf" && (
            <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!tfDone ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 14 }}>{t("Thẻ","Card")} {tfIndex+1}/{tfCards.length} · {t("Điểm:","Score:")} {tfScore}</div>
                  <article style={{ background: "white", borderRadius: 10, padding: 24, marginBottom: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 24 }}>{tfCards[tfIndex].stmt}</div>
                    {!tfFlipped ? (
                      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <button onClick={() => handleTfAnswer(true)} style={{ padding: "12px 36px", background: "#eafaf1", color: "#1e8449", border: "2px solid #1e8449", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✅ {t("ĐÚNG","TRUE")}</button>
                        <button onClick={() => handleTfAnswer(false)} style={{ padding: "12px 36px", background: "#fdf2f2", color: "#922b21", border: "2px solid #922b21", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>❌ {t("SAI","FALSE")}</button>
                      </div>
                    ) : (
                      <><div style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 8, fontSize: 15, color: "#555", textAlign: "left", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {tfCards[tfIndex].explain}</div><button onClick={handleTfNext} style={{ padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{tfIndex+1<tfCards.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>
                    )}
                  </article>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: "#0B4F5C", marginBottom: 8 }}>🏆 {tfScore}/{tfCards.length}</div>
                  <div style={{ color: "#777", fontSize: 18, marginBottom: 20 }}>{tfScore===tfCards.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")}</div>
                  <button onClick={resetTf} style={{ padding: "10px 18px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>{t("Chơi lại","Play Again")}</button>
                </div>
              )}
            </div>
          )}

          {/* FILL */}
          {gameMode === "fill" && (
            <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời vào chỗ trống","Fill in each blank")}</div>
              {fillQuestions.map((q) => (
                <div key={q.id} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.template}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input value={fillAnswers[q.id]||""} onChange={(e) => setFillAnswers((p) => ({ ...p, [q.id]: e.target.value }))} placeholder={t("Nhập đáp án...","Enter answer...")} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none", border: fillChecked?`2px solid ${checkFill(q.id)?"#1e8449":"#922b21"}`:"1px solid #ddd", background: fillChecked?(checkFill(q.id)?"#eafaf1":"#fdf2f2"):"white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    {fillChecked && <span style={{ fontSize: 13, fontWeight: 700, background: checkFill(q.id)?"#eafaf1":"#fdf2f2", color: checkFill(q.id)?"#1e8449":"#922b21", padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>{checkFill(q.id)?"✓ Đúng":`✗ → ${q.answer}`}</span>}
                  </div>
                  {fillChecked&&!checkFill(q.id)&&<div style={{ fontSize: 14, color: "#777", fontStyle: "italic", marginTop: 6 }}>💡 {t("Gợi ý:","Hint:")} {q.hint}</div>}
                </div>
              ))}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setFillChecked(true)} style={{ padding: "10px 18px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>{t("Kiểm tra","Check Answers")}</button>
                <button onClick={() => { setFillAnswers({}); setFillChecked(false); }} style={{ padding: "10px 18px", background: "#f9f9f9", color: "black", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{t("Làm lại","Reset")}</button>
              </div>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 1 / Chương I","Lesson 1 / Chapter I")}
        </div>

        <style>{`
          .reveal { opacity:0; transform:translateY(28px) scale(0.97); transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1); will-change:opacity,transform; }
          .reveal.visible { opacity:1; transform:translateY(0) scale(1); }
          .reveal[data-reveal-stagger].visible { opacity:1; transform:none; }
          .reveal[data-reveal-stagger] > * { opacity:0; transform:translateY(24px) scale(0.97); will-change:opacity,transform; }
          header.reveal { transform:translateY(-18px); opacity:0; }
          header.reveal.visible { opacity:1; transform:translateY(0); }
          article { transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease; border-radius:10px; padding:8px; }
          article:hover { transform:translateY(-6px) scale(1.01); box-shadow:0 12px 28px rgba(0,0,0,0.12); }
        `}</style>
        <DuoTranslate/>
      </div>
    </div>
  );
}
