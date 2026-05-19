/* eslint-disable react-hooks/static-components */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
export default function Lesson7_HamSoVaDoThi() {
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
        { text: "Welcome", vi: "Chào mừng" },
        { text: "to", vi: "đến với" },
        { text: "this", vi: "bài" },
        { text: "lesson.", vi: "học." }
      ]
    }
  ];

  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const mcQuestions = [
    {
      q: t("Hàm số y = f(x) được định nghĩa như thế nào?", "How is a function y = f(x) defined?"),
      options: [
        t("Mỗi x cho nhiều giá trị y", "Each x gives multiple y values"),
        t("Mỗi x trong tập xác định cho đúng một giá trị y", "Each x in the domain gives exactly one y value"),
        t("Mỗi y cho đúng một giá trị x", "Each y gives exactly one x value"),
        t("x và y luôn bằng nhau", "x and y are always equal"),
      ],
      answer: 1,
      explain: t("Hàm số: với mỗi x ∈ D, tồn tại đúng MỘT giá trị y tương ứng. Đây là tính đơn trị.", "Function: for each x ∈ D, there exists exactly ONE corresponding y value. This is the single-value property."),
    },
    {
      q: t("Tập xác định của hàm số y = 1/(x−2) là?", "The domain of y = 1/(x−2) is?"),
      options: ["ℝ", "ℝ \\ {2}", "ℝ \\ {−2}", "(2, +∞)"],
      answer: 1,
      explain: t("Mẫu số x−2 ≠ 0 → x ≠ 2. Tập xác định D = ℝ \\ {2}.", "Denominator x−2 ≠ 0 → x ≠ 2. Domain D = ℝ \\ {2}."),
    },
    {
      q: t("Hàm số y = f(x) đồng biến trên (a,b) khi nào?", "When is y = f(x) increasing on (a,b)?"),
      options: [
        t("x₁ < x₂ ⟹ f(x₁) > f(x₂)", "x₁ < x₂ ⟹ f(x₁) > f(x₂)"),
        t("x₁ < x₂ ⟹ f(x₁) < f(x₂)", "x₁ < x₂ ⟹ f(x₁) < f(x₂)"),
        t("f(x₁) = f(x₂) với mọi x₁, x₂", "f(x₁) = f(x₂) for all x₁, x₂"),
        t("f(x) > 0 với mọi x ∈ (a,b)", "f(x) > 0 for all x ∈ (a,b)"),
      ],
      answer: 1,
      explain: t("Đồng biến: x₁ < x₂ trong (a,b) ⟹ f(x₁) < f(x₂). Nghịch biến thì ngược lại.", "Increasing: x₁ < x₂ in (a,b) ⟹ f(x₁) < f(x₂). Decreasing is the opposite."),
    },
    {
      q: t("Hàm số chẵn thỏa mãn điều kiện nào?", "What condition does an even function satisfy?"),
      options: ["f(−x) = f(x)", "f(−x) = −f(x)", "f(x) = f(x+T)", "f(0) = 0"],
      answer: 0,
      explain: t("Hàm chẵn: f(−x) = f(x) với mọi x ∈ D. Đồ thị đối xứng qua trục Oy.", "Even function: f(−x) = f(x) for all x ∈ D. Graph is symmetric about the y-axis."),
    },
    {
      q: t("Đồ thị của hàm số y = f(x) là gì?", "What is the graph of y = f(x)?"),
      options: [
        t("Tập hợp các điểm (x, 0)", "The set of points (x, 0)"),
        t("Tập hợp các điểm (x, f(x)) trên mặt phẳng Oxy", "The set of points (x, f(x)) on the Oxy plane"),
        t("Một đường thẳng", "A straight line"),
        t("Một đường tròn", "A circle"),
      ],
      answer: 1,
      explain: t("Đồ thị = {(x, f(x)) | x ∈ D} — tập các điểm có hoành độ x và tung độ f(x).", "Graph = {(x, f(x)) | x ∈ D} — set of points with x-coordinate x and y-coordinate f(x)."),
    },
  ];

  const tfCards = [
    { stmt: t("Mọi đường cong trong mặt phẳng đều là đồ thị của một hàm số.", "Every curve in the plane is the graph of a function."), answer: false, explain: t("SAI — chỉ khi mỗi đường thẳng x = const cắt đường cong tại ĐÚNG MỘT điểm (kiểm tra đường thẳng đứng).", "FALSE — only if every vertical line x = const intersects the curve at EXACTLY ONE point (vertical line test).") },
    { stmt: t("Hàm số y = x² là hàm số chẵn.", "y = x² is an even function."), answer: true, explain: t("ĐÚNG — f(−x) = (−x)² = x² = f(x) ✓. Đồ thị đối xứng qua Oy.", "TRUE — f(−x) = (−x)² = x² = f(x) ✓. Graph symmetric about Oy.") },
    { stmt: t("Hàm số y = x³ là hàm số lẻ.", "y = x³ is an odd function."), answer: true, explain: t("ĐÚNG — f(−x) = (−x)³ = −x³ = −f(x) ✓. Đồ thị đối xứng qua gốc O.", "TRUE — f(−x) = −x³ = −f(x) ✓. Graph symmetric about origin O.") },
    { stmt: t("Tập xác định của y = √x là D = ℝ.", "The domain of y = √x is D = ℝ."), answer: false, explain: t("SAI — √x chỉ xác định khi x ≥ 0. D = [0, +∞).", "FALSE — √x is only defined for x ≥ 0. D = [0, +∞).") },
    { stmt: t("Hai hàm số y = x và y = (x²)/x có cùng đồ thị.", "y = x and y = (x²)/x have the same graph."), answer: false, explain: t("SAI — y = x²/x = x với x ≠ 0, tức thiếu điểm (0,0). Tập xác định khác nhau.", "FALSE — y = x²/x = x for x ≠ 0, missing the point (0,0). Different domains.") },
  ];

  const fillQuestions = [
    { id: "f1", template: t("Tập xác định của y = √(x − 3) là D = [___, +∞).", "The domain of y = √(x − 3) is D = [___, +∞)."), answer: "3", altAnswers: ["3"], hint: t("x − 3 ≥ 0 → x ≥ ?", "x − 3 ≥ 0 → x ≥ ?") },
    { id: "f2", template: t("Hàm số đồng biến: x₁ < x₂ ⟹ f(x₁) ___ f(x₂).", "Increasing function: x₁ < x₂ ⟹ f(x₁) ___ f(x₂)."), answer: "<", altAnswers: ["<"], hint: t("Giá trị hàm tăng theo x.", "Function value increases with x.") },
    { id: "f3", template: t("Hàm chẵn thỏa f(−x) = ___ với mọi x ∈ D.", "Even function satisfies f(−x) = ___ for all x ∈ D."), answer: "f(x)", altAnswers: ["f(x)"], hint: t("Đối xứng qua trục Oy.", "Symmetric about Oy.") },
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
    const q = fillQuestions.find((q) => q.id === id);
    const raw = (fillAnswers[id] || "").toLowerCase().trim().replace(/\s/g, "");
    return [q.answer, ...(q.altAnswers || [])].map(a => a.toLowerCase().replace(/\s/g, "")).includes(raw);
  };
  const fillScore = fillChecked ? fillQuestions.filter(q => checkFill(q.id)).length : null;

  const tabs = [
    ["khoiDong", "🚀", t("Khởi động", "Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],
    ["khai1", "📖", t("1. Hàm Số", "1. Functions")],
    ["khai2", "📖", t("2. Tập Xác Định", "2. Domain")],
    ["khai3", "📖", t("3. Đơn Điệu", "3. Monotonicity")],
    ["khai4", "📖", t("4. Chẵn / Lẻ", "4. Even / Odd")],
    ["khai5", "📖", t("5. Đồ Thị", "5. Graph")],
    ["thucHanh", "✏️", t("Thực Hành", "Practice")],
    ["miniGame", "🎮", t("Mini Game", "Mini Game")],
  ];

  const SectionHeader = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#0B4F5C", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0f0f0" }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );

  const ResultSummary = ({ items, onReset, scoreLabel }) => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{items.filter(i => i.correct).length === items.length ? "🏆" : items.filter(i => i.correct).length >= items.length * 0.6 ? "👍" : "💪"}</div>
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

  const mcResultItems = mcHistory.map((h) => ({ correct: h.correct, qText: mcQuestions[h.q].q, correctText: mcQuestions[h.q].options[mcQuestions[h.q].answer], yourText: mcQuestions[h.q].options[h.selected] }));
  const tfResultItems = tfHistory.map((h) => ({ correct: h.correct, qText: tfCards[h.q].stmt, correctText: tfCards[h.q].answer ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE"), yourText: h.given ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE") }));
  const fillResultItems = fillChecked ? fillQuestions.map((q) => ({ correct: checkFill(q.id), qText: q.template, correctText: q.answer, yourText: fillAnswers[q.id] || t("(bỏ trống)", "(blank)") })) : [];

  return (
    <div style={{ width: "100%", background: "#ffffff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>

        <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
          <Link href="/cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>← {t("Quay lại", "Back to lessons")}</Link>
        </div>

        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>{t("Chương III · Hàm Số và Đồ Thị", "Chapter III · Functions and Graphs")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 7: Hàm Số và Đồ Thị", "Lesson 7: Functions and Graphs")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
          {[t("Hiểu khái niệm hàm số, tập xác định, tập giá trị.", "Understand functions, domain, and range."), t("Phân biệt hàm đồng biến và nghịch biến.", "Distinguish increasing and decreasing functions."), t("Nhận biết hàm số chẵn, hàm số lẻ.", "Identify even and odd functions."), t("Vẽ và đọc đồ thị hàm số.", "Draw and read graphs of functions."), t("Biết kiểm tra đường thẳng đứng (vertical line test).", "Apply the vertical line test.")].map((o, i) => (
            <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• {o}</div>
          ))}
        </div>

        <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", paddingTop: 12, paddingBottom: 12, marginBottom: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map(([id, icon, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: "#f9f9f9", color: "black", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "black"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "black"; }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* KHỞI ĐỘNG */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t("Nhiệt độ ngoài trời thay đổi theo giờ trong ngày. Nếu đo nhiệt độ T(t) tại mỗi thời điểm t, ta có một quy tắc: mỗi giờ t cho đúng một nhiệt độ T. Đây chính là khái niệm hàm số trong thực tế.",
                "Outside temperature changes by the hour. If we measure T(t) at each moment t, we have a rule: each hour t gives exactly one temperature T. This is a real-world function.")}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Cho ví dụ một quy tắc không phải hàm số (một giá trị đầu vào cho nhiều đầu ra).", "Give an example of a rule that is NOT a function (one input giving multiple outputs).")}</em></div>
          </div>
        </section>
        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="8Rz77E7rYHI"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
            />
          </div>
        </section>


        {/* 1. HÀM SỐ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Khái Niệm Hàm Số", "1. Function Concept")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Hàm số là quy tắc f đặt tương ứng mỗi phần tử x thuộc tập D với đúng một phần tử y ∈ ℝ. Ký hiệu: y = f(x), x là biến số, y là giá trị hàm.", "A function is a rule f that assigns to each element x in set D exactly one element y ∈ ℝ. Notation: y = f(x), x is the variable, y is the function value.")}</div>
            <div style={{ color: "#777", fontSize: 15, marginTop: 10 }}>💡 {t("D là tập xác định (domain). Tập giá trị = {f(x) | x ∈ D}.", "D is the domain. Range = {f(x) | x ∈ D}.")}</div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, transition: "all 0.3s" }}>
            {[
              { label: t("✅ Là hàm số", "✅ Is a function"), items: ["y = 2x + 1", "y = x²", "y = sin x", "y = |x|"], ok: true },
              { label: t("❌ KHÔNG phải hàm số", "❌ NOT a function"), items: [t("x² + y² = 4 (đường tròn — mỗi x cho 2 giá trị y)", "x² + y² = 4 (circle — each x gives 2 y-values)"), t("y² = x (mỗi x > 0 cho y = ±√x)", "y² = x (each x > 0 gives y = ±√x)")], ok: false },
            ].map((g, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{g.label}</div>
                {g.items.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 15, color: "#555", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "monospace" }}>{item}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, background: g.ok ? "#eafaf1" : "#fdf2f2", color: g.ok ? "#1e8449" : "#922b21", padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{g.ok ? "✓" : "✗"}</span>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        {/* 2. TẬP XÁC ĐỊNH */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Tập Xác Định", "2. Domain")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Tập xác định D là tập hợp tất cả các giá trị x mà hàm số f(x) có nghĩa (xác định được giá trị).", "The domain D is the set of all x-values for which f(x) is defined.")}</div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, transition: "all 0.3s" }}>
            {[
              { type: t("Mẫu số ≠ 0", "Denominator ≠ 0"), rule: t("y = 1/(x−a): x ≠ a", "y = 1/(x−a): x ≠ a"), example: "y = 1/(x+3)", domain: "ℝ \\ {−3}" },
              { type: t("Căn bậc hai ≥ 0", "Square root ≥ 0"), rule: t("y = √g(x): g(x) ≥ 0", "y = √g(x): g(x) ≥ 0"), example: "y = √(x−1)", domain: "[1, +∞)" },
              { type: t("Căn + mẫu", "Root + denominator"), rule: t("Kết hợp cả hai điều kiện", "Combine both conditions"), example: "y = √x / (x−2)", domain: "[0,+∞) \\ {2}" },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0B4F5C", marginBottom: 8 }}>{card.type}</div>
                <div style={{ fontFamily: "monospace", fontSize: 14, color: "#555", marginBottom: 8 }}>{card.rule}</div>
                <div style={{ fontSize: 15, marginBottom: 6 }}>📘 <code>{card.example}</code></div>
                <div style={{ background: "#eafaf1", color: "#1e8449", fontWeight: 700, padding: "6px 12px", borderRadius: 8, fontSize: 14 }}>D = {card.domain}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. ĐƠN ĐIỆU */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Tính Đơn Điệu", "3. Monotonicity")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="120" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s" }}>
            {[
              { title: t("📈 Đồng biến (Tăng)", "📈 Increasing"), condition: t("∀ x₁ < x₂ trong (a,b): f(x₁) < f(x₂)", "∀ x₁ < x₂ in (a,b): f(x₁) < f(x₂)"), note: t("Đồ thị đi từ trái sang phải theo hướng ĐI LÊN.", "Graph goes from left to right UPWARD."), color: "#1e8449", bg: "#eafaf1" },
              { title: t("📉 Nghịch biến (Giảm)", "📉 Decreasing"), condition: t("∀ x₁ < x₂ trong (a,b): f(x₁) > f(x₂)", "∀ x₁ < x₂ in (a,b): f(x₁) > f(x₂)"), note: t("Đồ thị đi từ trái sang phải theo hướng ĐI XUỐNG.", "Graph goes from left to right DOWNWARD."), color: "#922b21", bg: "#fdf2f2" },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 14, background: "white", padding: "8px 12px", borderRadius: 8, marginBottom: 10 }}>{card.condition}</div>
                <div style={{ background: card.bg, color: card.color, fontSize: 14, padding: "8px 12px", borderRadius: 8 }}>{card.note}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. CHẴN / LẺ */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("4. Hàm Số Chẵn và Hàm Số Lẻ", "4. Even and Odd Functions")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="120" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, transition: "all 0.3s" }}>
            {[
              { title: t("Hàm số CHẴN", "EVEN function"), cond: "f(−x) = f(x)", sym: t("Đối xứng qua trục Oy", "Symmetric about y-axis"), ex: ["y = x²", "y = cos x", "y = |x|"], color: "#1a5276", bg: "#e8f4fd" },
              { title: t("Hàm số LẺ", "ODD function"), cond: "f(−x) = −f(x)", sym: t("Đối xứng qua gốc O(0,0)", "Symmetric about origin O(0,0)"), ex: ["y = x³", "y = sin x", "y = x"], color: "#6c3483", bg: "#f5eef8" },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 18, color: card.color, background: card.bg, padding: "8px 14px", borderRadius: 8, marginBottom: 10 }}>{card.cond}</div>
                <div style={{ fontSize: 14, color: "#777", marginBottom: 10 }}>🔁 {card.sym}</div>
                <div style={{ fontSize: 14, color: "#555" }}>{t("Ví dụ:", "Examples:")} {card.ex.join(", ")}</div>
              </article>
            ))}
          </div>
          <div className="reveal" data-reveal style={{ marginTop: 24, padding: 16, borderRadius: 10, background: "#fff3cd", border: "1px solid #ffc107", fontSize: 15 }}>
            ⚠️ {t("Điều kiện cần: tập xác định D phải đối xứng qua gốc O (nếu x ∈ D thì −x ∈ D).", "Necessary condition: domain D must be symmetric about O (if x ∈ D then −x ∈ D).")}
          </div>
        </section>

        {/* 5. ĐỒ THỊ */}
        <section id="khai5" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("5. Đồ Thị Hàm Số", "5. Graph of a Function")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Đồ thị của hàm số y = f(x) trên tập D là tập hợp tất cả các điểm M(x, f(x)) trong mặt phẳng Oxy với x ∈ D.", "The graph of y = f(x) on D is the set of all points M(x, f(x)) in the Oxy plane with x ∈ D.")}</div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, transition: "all 0.3s" }}>
            {[
              { icon: "📏", title: t("Kiểm tra đường thẳng đứng", "Vertical Line Test"), desc: t("Mỗi đường thẳng x = c cắt đồ thị tại đúng 1 điểm → là hàm số.", "Each vertical line x = c intersects graph at exactly 1 point → it's a function.") },
              { icon: "📐", title: t("Hàm bậc nhất y = ax + b", "Linear y = ax + b"), desc: t("Đồ thị là đường thẳng. a > 0: đồng biến. a < 0: nghịch biến.", "Graph is a line. a > 0: increasing. a < 0: decreasing.") },
              { icon: "⛰️", title: t("Hàm bậc hai y = ax²", "Quadratic y = ax²"), desc: t("Đồ thị là parabol đỉnh O. a > 0: mở lên. a < 0: mở xuống.", "Graph is parabola with vertex O. a > 0: opens up. a < 0: opens down.") },
            ].map((card, i) => (
              <article key={i} style={{ padding: 18, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>{card.desc}</div>
              </article>
            ))}
          </div>
        </section>

        {/* THỰC HÀNH */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s" }}>
            {[
              { id: "e1", q: t("Tìm tập xác định của:\n(a) y = √(2x − 4)\n(b) y = 1/(x² − 1)", "Find the domain of:\n(a) y = √(2x − 4)\n(b) y = 1/(x² − 1)"), a: [t("(a) 2x−4 ≥ 0 → x ≥ 2 → D = [2, +∞)", "(a) 2x−4 ≥ 0 → x ≥ 2 → D = [2, +∞)"), t("(b) x²−1 ≠ 0 → x ≠ ±1 → D = ℝ \\ {−1, 1}", "(b) x²−1 ≠ 0 → x ≠ ±1 → D = ℝ \\ {−1, 1}")] },
              { id: "e2", q: t("Xét tính chẵn/lẻ của:\n(a) f(x) = x⁴ − 2x²\n(b) g(x) = x³ + x\n(c) h(x) = x² + x", "Determine even/odd for:\n(a) f(x) = x⁴ − 2x²\n(b) g(x) = x³ + x\n(c) h(x) = x² + x"), a: [t("(a) f(−x) = x⁴−2x² = f(x) → HÀM CHẴN ✓", "(a) f(−x) = x⁴−2x² = f(x) → EVEN ✓"), t("(b) g(−x) = −x³−x = −g(x) → HÀM LẺ ✓", "(b) g(−x) = −x³−x = −g(x) → ODD ✓"), t("(c) h(−x) = x²−x ≠ h(x) và ≠ −h(x) → KHÔNG CHẴN KHÔNG LẺ", "(c) h(−x) = x²−x ≠ h(x) and ≠ −h(x) → NEITHER")] },
              { id: "e3", q: t("Cho f(x) = 2x − 3. Tính f(0), f(2), f(−1) và xét chiều biến thiên.", "For f(x) = 2x − 3. Find f(0), f(2), f(−1) and determine monotonicity."), a: ["f(0) = −3,  f(2) = 1,  f(−1) = −5", t("Hệ số a = 2 > 0 → f đồng biến trên ℝ.", "Coefficient a = 2 > 0 → f is increasing on ℝ.")] },
            ].map(({ id, q, a }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập", "Exercise")}</div>
                  <div style={{ color: "#777", fontSize: 14, marginBottom: 10 }}>{t("Toán 10", "Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "black", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲", "Hide Answer ▲") : t("Xem đáp án ▼", "Show Answer ▼")}
                </button>
                {revealedAnswers[id] && <div style={{ padding: "16px 20px", background: "#eafaf1", borderRadius: "0 0 10px 10px" }}>{a.map((line, i) => <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>{line}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>

        {/* MINI GAME */}
        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎮" title={t("Mini Game", "Mini Game")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s" }}>
            {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 questions")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background: gameMode===mode?"black":"#f9f9f9", color: gameMode===mode?"white":"black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

          {gameMode === "mc" && (
            <div className="reveal" data-reveal style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
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
              ) : <ResultSummary items={mcResultItems} onReset={resetMc} scoreLabel={mcScore===mcQuestions.length?t("Xuất sắc! 🎉","Perfect! 🎉"):mcScore>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} />}
            </div>
          )}

          {gameMode === "tf" && (
            <div className="reveal" data-reveal style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
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
              ) : <ResultSummary items={tfResultItems} onReset={resetTf} scoreLabel={tfScore===tfCards.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} />}
            </div>
          )}

          {gameMode === "fill" && (
            <div className="reveal" data-reveal style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!fillChecked ? (
                <>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời vào chỗ trống","Fill in each blank")}</div>
                  {fillQuestions.map((q, qi) => (
                    <div key={q.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>{t("Câu","Q")} {qi+1}</div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.template}</div>
                      <input value={fillAnswers[q.id]||""} onChange={(e) => setFillAnswers((p) => ({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Enter answer...")} style={{ width:"100%", padding:"12px 16px", borderRadius:8, fontSize:15, outline:"none", border:"1px solid #ddd", background:"white", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", boxSizing:"border-box" }} />
                    </div>
                  ))}
                  <button onClick={() => setFillChecked(true)} style={{ padding:"12px 32px", background:"black", color:"white", border:"none", borderRadius:8, fontWeight:600, fontSize:15, cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button>
                </>
              ) : <ResultSummary items={fillResultItems} onReset={() => {setFillAnswers({}); setFillChecked(false);}} scoreLabel={fillScore===fillQuestions.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fillScore>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} />}
            </div>
          )}
        </section>

        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 7 / Chương III","Lesson 7 / Chapter III")}
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
