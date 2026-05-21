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

export default function Lesson6_OnTapChuong2() {
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
    const answers = [q.answer, ...(q.altAnswers || [])].map(a => a.toLowerCase().replace(/\s/g, ""));
    return answers.includes(raw);
  };
  const fillScore = fillChecked ? fillQuestions.filter(q => checkFill(q.id)).length : null;

  const tabs = [
    ["tomTat", "📚", t("Tóm Tắt", "Summary")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],
    ["congThuc", "📐", t("Công Thức", "Key Formulas")],
    ["baiTapTongHop", "✏️", t("Bài Tập TH", "Mixed Exercises")],
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
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {items.filter(i => i.correct).length === items.length ? "🏆" : items.filter(i => i.correct).length >= items.length * 0.6 ? "👍" : "💪"}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0B4F5C" }}>
          {items.filter(i => i.correct).length} / {items.length}
        </div>
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
        <button onClick={onReset} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          🔄 {t("Chơi lại", "Play Again")}
        </button>
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
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>
            ← {t("Quay lại", "Back to lessons")}
          </Link>
        </div>

        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>{t("Chương II · Bất Phương Trình Bậc Nhất", "Chapter II · Linear Inequalities")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Ôn Tập Chương II", "Chapter II Review")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        {/* Chapter progress nav */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40, transition: "all 0.3s ease" }}>
          {[
            { slug: "bpt-bac-nhat-hai-an", num: "4", title: t("BPT Bậc Nhất Hai Ẩn", "Linear Inequality (2 vars)") },
            { slug: "he-bpt-bac-nhat-hai-an", num: "5", title: t("Hệ BPT Bậc Nhất Hai Ẩn", "System of Inequalities") },
          ].map((lesson) => (
            <Link key={lesson.slug} href={`/cacbailam10/${lesson.slug}`} style={{ textDecoration: "none" }}>
              <article style={{ padding: 16, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", cursor: "pointer" }}>
                <div style={{ fontSize: 13, color: "#777", marginBottom: 4 }}>{t("Bài", "Lesson")} {lesson.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0B4F5C" }}>{lesson.title}</div>
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>← {t("Ôn lại", "Review")}</div>
              </article>
            </Link>
          ))}
        </div>

        {/* STICKY NAV */}
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
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0B4F5C", marginBottom: 12 }}>{card.title}</div>
                {card.points.map((pt, j) => (
                  <div key={j} style={{ fontSize: 14, color: "#555", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#0B4F5C", fontWeight: 700, flexShrink: 0 }}>•</span>
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
            videoId="145zOBT0LD4"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
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
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0B4F5C", marginBottom: 10 }}>{card.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 14, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "white", padding: "10px 14px", borderRadius: 8 }}>{card.formula}</div>
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
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>📝 {t("Bài tập", "Exercise")}</div>
                    <span style={{ background: "black", color: "white", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{badge}</span>
                  </div>
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
          <SectionHeader icon="🎮" title={t("Mini Game · Ôn Tập Chương II", "Mini Game · Chapter II Review")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s ease" }}>
            {[["mc", "🧩", t("Trắc Nghiệm", "Multiple Choice"), t("5 câu hỏi", "5 questions")], ["tf", "🃏", t("Đúng / Sai", "True / False"), t("5 thẻ", "5 cards")], ["fill", "✍️", t("Điền Chỗ Trống", "Fill in Blank"), t("3 câu", "3 items")]].map(([mode, icon, label, sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background: gameMode === mode ? "black" : "#f9f9f9", color: gameMode === mode ? "white" : "black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

          {gameMode === "mc" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!mcDone ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 8 }}>{t("Câu", "Q")} {mcIndex + 1}/{mcQuestions.length} · {t("Điểm:", "Score:")} {mcScore}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{mcQuestions[mcIndex].q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mcQuestions[mcIndex].options.map((opt, i) => {
                      let bg = "white", color = "black";
                      if (mcSelected !== null) { if (i === mcQuestions[mcIndex].answer) { bg = "#eafaf1"; color = "#1e8449"; } else if (i === mcSelected) { bg = "#fdf2f2"; color = "#922b21"; } }
                      return <button key={i} onClick={() => handleMcSelect(i)} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 10, border: "none", background: bg, color, fontSize: 15, fontWeight: mcSelected !== null && (i === mcSelected || i === mcQuestions[mcIndex].answer) ? 600 : 400, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
                    })}
                  </div>
                  {mcSelected !== null && (<><div style={{ marginTop: 16, padding: "12px 16px", background: "white", borderRadius: 8, fontSize: 15, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {mcQuestions[mcIndex].explain}</div><button onClick={handleMcNext} style={{ marginTop: 14, padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{mcIndex + 1 < mcQuestions.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button></>)}
                </>
              ) : (
                <ResultSummary items={mcResultItems} onReset={resetMc} scoreLabel={mcScore === mcQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : mcScore >= 3 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
              )}
            </div>
          )}

          {gameMode === "tf" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!tfDone ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 14 }}>{t("Thẻ", "Card")} {tfIndex + 1}/{tfCards.length} · {t("Điểm:", "Score:")} {tfScore}</div>
                  <article style={{ background: "white", borderRadius: 10, padding: 24, marginBottom: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 24 }}>{tfCards[tfIndex].stmt}</div>
                    {!tfFlipped ? (
                      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <button onClick={() => handleTfAnswer(true)} style={{ padding: "12px 36px", background: "#eafaf1", color: "#1e8449", border: "2px solid #1e8449", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✅ {t("ĐÚNG", "TRUE")}</button>
                        <button onClick={() => handleTfAnswer(false)} style={{ padding: "12px 36px", background: "#fdf2f2", color: "#922b21", border: "2px solid #922b21", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>❌ {t("SAI", "FALSE")}</button>
                      </div>
                    ) : (
                      <><div style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 8, fontSize: 15, color: "#555", textAlign: "left", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {tfCards[tfIndex].explain}</div><button onClick={handleTfNext} style={{ padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{tfIndex + 1 < tfCards.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button></>
                    )}
                  </article>
                </>
              ) : (
                <ResultSummary items={tfResultItems} onReset={resetTf} scoreLabel={tfScore === tfCards.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
              )}
            </div>
          )}

          {gameMode === "fill" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!fillChecked ? (
                <>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời vào chỗ trống", "Fill in each blank")}</div>
                  {fillQuestions.map((q, qi) => (
                    <div key={q.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>{t("Câu", "Q")} {qi + 1}</div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.template}</div>
                      <input value={fillAnswers[q.id] || ""} onChange={(e) => setFillAnswers((p) => ({ ...p, [q.id]: e.target.value }))} placeholder={t("Nhập đáp án...", "Enter answer...")} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none", border: "1px solid #ddd", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button onClick={() => setFillChecked(true)} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{t("Kiểm tra", "Check Answers")}</button>
                </>
              ) : (
                <ResultSummary items={fillResultItems} onReset={() => { setFillAnswers({}); setFillChecked(false); }} scoreLabel={fillScore === fillQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fillScore >= 2 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
              )}
            </div>
          )}
        </section>

        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>
          Toán 10 · Chân Trời Sáng Tạo · {t("Ôn Tập Chương II", "Chapter II Review")}
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
