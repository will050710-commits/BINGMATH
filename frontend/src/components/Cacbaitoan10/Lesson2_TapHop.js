/* eslint-disable react-hooks/static-components */
 
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";

export default function Lesson2_TapHop() {
  const [lang, setLang] = useState("vi");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [gameMode, setGameMode] = useState("mc");
  const [mcIndex, setMcIndex] = useState(0);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcScore, setMcScore] = useState(0);
  const [mcDone, setMcDone] = useState(false);
  const [tfIndex, setTfIndex] = useState(0);
  const [tfFlipped, setTfFlipped] = useState(false);
  const [tfScore, setTfScore] = useState(0);
  const [tfDone, setTfDone] = useState(false);
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

  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

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

  const handleMcSelect = (i) => { if (mcSelected !== null) return; setMcSelected(i); if (i === mcQuestions[mcIndex].answer) setMcScore((s) => s + 1); };
  const handleMcNext = () => { if (mcIndex + 1 >= mcQuestions.length) setMcDone(true); else { setMcIndex((i) => i + 1); setMcSelected(null); } };
  const resetMc = () => { setMcIndex(0); setMcSelected(null); setMcScore(0); setMcDone(false); };
  const handleTfAnswer = (ans) => { if (tfFlipped) return; setTfFlipped(true); if (ans === tfCards[tfIndex].answer) setTfScore((s) => s + 1); };
  const handleTfNext = () => { if (tfIndex + 1 >= tfCards.length) setTfDone(true); else { setTfIndex((i) => i + 1); setTfFlipped(false); } };
  const resetTf = () => { setTfIndex(0); setTfFlipped(false); setTfScore(0); setTfDone(false); };
  const checkFill = (id) => { const correct = fillQuestions.find((q) => q.id === id).answer.toLowerCase().replace(/\s/g, ""); return (fillAnswers[id] || "").toLowerCase().replace(/\s/g, "") === correct; };

  const tabs = [
    ["khoiDong", "🚀", t("Khởi động", "Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],
    ["khai1",    "📖", t("1. Tập Hợp", "1. Sets")],
    ["khai2",    "📖", t("2. Tập Con", "2. Subsets")],
    ["khai3",    "📖", t("3. Tập Bằng Nhau", "3. Equal Sets")],
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
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 2: Tập Hợp", "Lesson 2: Sets")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        {/* OBJECTIVES */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
          {[t("Hiểu khái niệm tập hợp và phần tử.", "Understand the concept of a set and its elements."), t("Biết các cách xác định tập hợp (liệt kê và tính chất đặc trưng).", "Know ways to define sets (listing and characteristic property)."), t("Hiểu khái niệm tập con (A ⊂ B).", "Understand subsets (A ⊂ B)."), t("Hiểu khái niệm hai tập hợp bằng nhau.", "Understand equal sets."), t("Biết tập hợp rỗng ∅ và tính chất của nó.", "Know the empty set ∅ and its properties.")].map((obj, i) => (
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
              videoId="tyDKR4FG3Yw" 
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Socratica (CC BY-SA)", "Video by Socratica (CC BY-SA)")}
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
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 2 / Chương I","Lesson 2 / Chapter I")}
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
        <DuoTranslate />
      </div>
    </div>
  );
}
