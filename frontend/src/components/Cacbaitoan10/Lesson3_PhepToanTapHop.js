/* eslint-disable react-hooks/static-components */
 
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
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

export default function Lesson3_PhepToanTapHop() {
  const { user, saveGameResult } = useAuth();
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


  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

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
  const checkFill = (id) => {
    const correct = fillQuestions.find((q) => q.id === id).answer.toLowerCase().replace(/[\s{}]/g, "");
    return (fillAnswers[id] || "").toLowerCase().replace(/[\s{}]/g, "") === correct;
  };

  const mcResultItems = mcHistory.map((h) => ({ correct: h.correct, qText: mcQuestions[h.q].q, correctText: mcQuestions[h.q].options[mcQuestions[h.q].answer], yourText: mcQuestions[h.q].options[h.selected] }));
  const tfResultItems = tfHistory.map((h) => ({ correct: h.correct, qText: tfCards[h.q].stmt, correctText: h.correct ? t("ĐÚNG","TRUE") : t("SAI","FALSE"), yourText: h.given ? t("ĐÚNG","TRUE") : t("SAI","FALSE") }));
  const fillResultItems = fillChecked ? fillQuestions.map((q) => ({ correct: checkFill(q.id), qText: q.template, correctText: q.answer, yourText: fillAnswers[q.id] || t("(bỏ trống)", "(blank)") })) : [];

  const tabs = [
    ["khoiDong", "🚀", t("Khởi động", "Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],
    ["khai1",    "📖", t("1. Phép Hợp ∪", "1. Union ∪")],
    ["khai2",    "📖", t("2. Phép Giao ∩", "2. Intersection ∩")],
    ["khai3",    "📖", t("3. Phép Hiệu \\", "3. Difference \\")],
    ["khai4",    "📖", t("4. Phần Bù Cᵤ", "4. Complement Cᵤ")],
    ["thucHanh", "✏️", t("Thực Hành", "Practice")],
    ["miniGame", "🎮", t("Mini Game", "Mini Game")],
  ];

  const SectionHeader = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#0B4F5C", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0f0f0" }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );

  const OpCard = ({ op, sym, defn, formula, example, result }) => (
    <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#0B4F5C" }}>{sym}</span>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{op}</span>
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 10 }}>{defn}</div>
      <div style={{ fontFamily: "monospace", fontSize: 16, background: "white", padding: "8px 14px", borderRadius: 8, marginBottom: 10, color: "#0B4F5C" }}>{formula}</div>
      <div style={{ fontSize: 15, color: "#555" }}>📘 {example} = <strong>{result}</strong></div>
    </div>
  );

  
  useEffect(() => {
    if (mcDone && user) {
      saveGameResult({
        lesson_slug: "Lesson3_PhepToanTapHop",
        mode: "mc",
        score: mcScore,
        total: mcQuestions.length
      });
    }
  }, [mcDone, mcScore, user]);

  useEffect(() => {
    if (tfDone && user) {
      saveGameResult({
        lesson_slug: "Lesson3_PhepToanTapHop",
        mode: "tf",
        score: tfScore,
        total: tfCards.length
      });
    }
  }, [tfDone, tfScore, user]);

  useEffect(() => {
    if (fillChecked && user) {
      const correctCount = fillQuestions.filter((q) => {
        const correct = q.answer.toLowerCase().replace(/\s/g, "");
        return (fillAnswers[q.id] || "").toLowerCase().replace(/\s/g, "") === correct;
      }).length;
      saveGameResult({
        lesson_slug: "Lesson3_PhepToanTapHop",
        mode: "fill",
        score: correctCount,
        total: fillQuestions.length
      });
    }
  }, [fillChecked, fillAnswers, user]);

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
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 3: Các Phép Toán Trên Tập Hợp", "Lesson 3: Set Operations")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        {/* OBJECTIVES */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
          {[t("Thực hiện phép hợp (∪) và phép giao (∩) hai tập hợp.", "Perform union (∪) and intersection (∩) of two sets."), t("Thực hiện phép hiệu (\\) và phép lấy phần bù Cᵤ(A).", "Perform difference (\\) and complement Cᵤ(A)."), t("Áp dụng công thức |A ∪ B| = |A| + |B| − |A ∩ B|.", "Apply the formula |A ∪ B| = |A| + |B| − |A ∩ B|."), t("Biết các tính chất (giao hoán, kết hợp, De Morgan).", "Know properties: commutativity, associativity, De Morgan's laws.")].map((obj, i) => (
            <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• {obj}</div>
          ))}
        </div>

        {/* ── STICKY NAV ── */}
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

        {/* ════ KHỞI ĐỘNG ════ */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
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
              videoId="jafz_fX4X04"
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
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>📐 {t("Tính chất", "Properties")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, transition: "all 0.3s ease" }}>
              {[["A ∪ B = B ∪ A", t("Giao hoán","Commutative")], ["(A ∪ B) ∪ C = A ∪ (B ∪ C)", t("Kết hợp","Associative")], ["A ∪ ∅ = A", t("Phần tử trung lập","Identity")], ["A ∪ A = A", t("Lũy đẳng","Idempotent")]].map(([formula, name]) => (
                <article key={formula} style={{ padding: "12px 16px", borderRadius: 10, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 15, color: "#0B4F5C", marginBottom: 4 }}>{formula}</div>
                  <div style={{ fontSize: 13, color: "#777" }}>{name}</div>
                </article>
              ))}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>📊 {t("Công thức cộng (Inclusion-Exclusion)", "Inclusion-Exclusion Formula")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 20, color: "#0B4F5C", textAlign: "center", padding: "16px 0" }}>|A ∪ B| = |A| + |B| − |A ∩ B|</div>
            <div style={{ fontSize: 15, color: "#777", textAlign: "center" }}>{t("Tránh đếm hai lần các phần tử thuộc cả A và B.", "Avoids counting twice elements in both A and B.")}</div>
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
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>📐 {t("Tính chất", "Properties")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, transition: "all 0.3s ease" }}>
              {[["A ∩ B = B ∩ A", t("Giao hoán","Commutative")], ["(A ∩ B) ∩ C = A ∩ (B ∩ C)", t("Kết hợp","Associative")], ["A ∩ ∅ = ∅", t("Phần tử không","Zero element")], ["A ∩ A = A", t("Lũy đẳng","Idempotent")]].map(([formula, name]) => (
                <article key={formula} style={{ padding: "12px 16px", borderRadius: 10, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 15, color: "#0B4F5C", marginBottom: 4 }}>{formula}</div>
                  <div style={{ fontSize: 13, color: "#777" }}>{name}</div>
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
          <div className="reveal" data-reveal style={{ padding: 14, borderRadius: 10, background: "#fdf2f2", fontSize: 15, color: "#922b21" }}>
            ⚠️ {t("Chú ý: A \\ B ≠ B \\ A (phép hiệu KHÔNG có tính giao hoán)", "Note: A \\ B ≠ B \\ A (difference is NOT commutative)")}
          </div>
        </section>

        {/* ════ 4. PHẦN BÙ ════ */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("4. Phần Bù Cᵤ(A)", "4. Complement Cᵤ(A)")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Cho tập hợp toàn thể U và A ⊂ U. Phần bù của A trong U là tập gồm các phần tử thuộc U nhưng không thuộc A.", "Given universe U and A ⊂ U, the complement of A in U is the set of elements in U but not in A.")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, color: "#0B4F5C", margin: "10px 0", padding: "8px 14px", background: "white", borderRadius: 8 }}>Cᵤ(A) = U \\ A = {"{x | x ∈ U và x ∉ A}"}</div>
            <div style={{ fontSize: 15, color: "#555" }}>📘 U = {"{1,2,3,4,5}"}, A = {"{1,3,5}"} → Cᵤ(A) = <strong>{"{2,4}"}</strong></div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>🔁 {t("Định luật De Morgan", "De Morgan's Laws")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, transition: "all 0.3s ease" }}>
              {[{ law: "Cᵤ(A ∪ B) = Cᵤ(A) ∩ Cᵤ(B)", desc: t("Phần bù của hợp = giao của hai phần bù", "Complement of union = intersection of complements") }, { law: "Cᵤ(A ∩ B) = Cᵤ(A) ∪ Cᵤ(B)", desc: t("Phần bù của giao = hợp của hai phần bù", "Complement of intersection = union of complements") }].map((item, i) => (
                <article key={i} style={{ padding: "14px 18px", borderRadius: 10, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 16, color: "#0B4F5C", marginBottom: 6 }}>{item.law}</div>
                  <div style={{ fontSize: 14, color: "#777" }}>{item.desc}</div>
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
        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎮" title={t("Mini Game","Mini Game")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s ease" }}>
            {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu hỏi","5 questions")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background: gameMode===mode?"black":"#f9f9f9", color: gameMode===mode?"white":"black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

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
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 3 / Chương I","Lesson 3 / Chapter I")}
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
