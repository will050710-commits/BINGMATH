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

export default function Lesson5_HeBPTBacNhatHaiAn() {
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
    ["khoiDong", "🚀", t("Khởi động", "Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],
    ["khai1", "📖", t("1. Định Nghĩa", "1. Definition")],
    ["khai2", "📖", t("2. Miền Nghiệm", "2. Solution Region")],
    ["khai3", "📖", t("3. Cách Giải", "3. Method")],
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
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 5: Hệ Bất Phương Trình Bậc Nhất Hai Ẩn", "Lesson 5: System of Linear Inequalities in Two Variables")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
          {[
            t("Hiểu khái niệm hệ BPT bậc nhất hai ẩn.", "Understand the concept of a system of linear inequalities in 2 variables."),
            t("Biểu diễn miền nghiệm của hệ BPT trên mặt phẳng tọa độ.", "Graph the solution region of a system on the coordinate plane."),
            t("Xác định miền nghiệm là giao của các nửa mặt phẳng.", "Identify the solution region as the intersection of half-planes."),
            t("Tìm các điểm góc (đỉnh) của miền đa giác.", "Find the corner points (vertices) of the polygonal region."),
          ].map((obj, i) => (
            <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• {obj}</div>
          ))}
        </div>

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

        {/* KHỞI ĐỘNG */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
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
              videoId="145zOBT0LD4"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
            />
          </div>
        </section>


        {/* 1. ĐỊNH NGHĨA */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Định Nghĩa Hệ BPT", "1. System Definition")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Hệ BPT bậc nhất hai ẩn gồm nhiều BPT bậc nhất hai ẩn đặt đồng thời. Nghiệm của hệ là cặp (x₀, y₀) thỏa mãn TẤT CẢ các BPT trong hệ.",
                "A system of linear inequalities in two variables consists of multiple linear inequalities simultaneously. A solution is a pair (x₀, y₀) satisfying ALL inequalities in the system.")}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📘 {t("Ví dụ hệ BPT", "Example system")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, color: "#0B4F5C", lineHeight: 2, padding: "10px 0" }}>
              {"{"} x + y ≤ 4<br />
              {"{"} x − y ≥ −2<br />
              {"{"} x ≥ 0
            </div>
            <div style={{ fontSize: 15, color: "#777", marginTop: 8 }}>
              {t("Nghiệm: mọi điểm (x,y) thỏa đồng thời cả 3 BPT trên.", "Solutions: all points (x,y) satisfying all 3 inequalities simultaneously.")}
            </div>
          </div>
        </section>

        {/* 2. MIỀN NGHIỆM */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Miền Nghiệm Của Hệ", "2. Solution Region of the System")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Tính chất", "Properties")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Miền nghiệm của hệ = giao của tất cả các nửa mặt phẳng tương ứng với từng BPT. Miền này có thể là:", "Solution region = intersection of all corresponding half-planes. This region can be:")}
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { icon: "∅", title: t("Tập rỗng", "Empty set"), desc: t("Không có điểm nào thỏa tất cả BPT — các nửa mặt phẳng không có điểm chung.", "No point satisfies all — half-planes share no common point."), color: "#fdf2f2", text: "#922b21" },
              { icon: "▲", title: t("Đa giác lồi hữu hạn", "Bounded convex polygon"), desc: t("Miền nghiệm là đa giác lồi có các đỉnh xác định.", "Solution region is a bounded convex polygon with defined vertices."), color: "#eafaf1", text: "#1e8449" },
              { icon: "↗", title: t("Vùng vô hạn", "Unbounded region"), desc: t("Miền nghiệm kéo dài ra vô hạn theo một hoặc nhiều hướng.", "Solution region extends infinitely in one or more directions."), color: "#e8f4fd", text: "#1a5276" },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#0B4F5C", marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "#777" }}>{card.desc}</div>
                <div style={{ marginTop: 10, padding: "4px 10px", background: card.color, color: card.text, fontSize: 12, fontWeight: 700, borderRadius: 20, display: "inline-block" }}>{card.title}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. CÁCH GIẢI */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Cách Biểu Diễn Miền Nghiệm Của Hệ", "3. Graphing the Solution Region")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#0B4F5C" }}>📋 {t("Các bước thực hiện", "Steps")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "flex", flexDirection: "column", gap: 12, transition: "all 0.3s ease" }}>
              {[
                { step: "1", text: t("Với mỗi BPT trong hệ: vẽ đường biên tương ứng và xác định nửa mp nghiệm.", "For each inequality: draw its boundary and identify the solution half-plane.") },
                { step: "2", text: t("Tô màu (nhẹ) từng miền nghiệm đơn lẻ theo màu khác nhau.", "Lightly shade each individual solution region with different colors.") },
                { step: "3", text: t("Phần giao chung (được tô màu bởi TẤT CẢ) chính là miền nghiệm của hệ.", "The common intersection (shaded by ALL) is the solution region of the system.") },
                { step: "4", text: t("Tìm các đỉnh (điểm góc) của miền bằng cách giải các hệ phương trình đường biên.", "Find the vertices by solving systems of boundary line equations.") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 32, height: 32, borderRadius: "50%", background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7, paddingTop: 4 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📘 {t("Ví dụ: Tìm miền nghiệm của hệ", "Example: Find solution region of")}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, color: "#0B4F5C", lineHeight: 2, marginBottom: 16 }}>
              {"{"} x + y ≤ 4 &nbsp;&nbsp; (1)<br />
              {"{"} x − y ≥ 0 &nbsp;&nbsp; (2)<br />
              {"{"} x ≥ 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (3)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 15, color: "#555" }}>
              <div>① {t("Đường biên (1): x+y=4. Thử O: 0+0=0≤4 ✓ → tô phía chứa O.", "Boundary (1): x+y=4. Test O: 0≤4 ✓ → shade O's side.")}</div>
              <div>② {t("Đường biên (2): x−y=0 (y=x). Thử O: 0−0=0≥0 ✓ → tô phía chứa O.", "Boundary (2): x−y=0 (y=x). Test O: 0≥0 ✓ → shade O's side.")}</div>
              <div>③ {t("Đường biên (3): x=0. Thử điểm (1,0): 1≥0 ✓ → tô phía phải.", "Boundary (3): x=0. Test (1,0): 1≥0 ✓ → shade right side.")}</div>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#eafaf1", borderRadius: 8, color: "#1e8449", fontWeight: 600 }}>
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
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập", "Exercise")}</div>
                  <div style={{ color: "#777", fontSize: 14 }}>{t("Toán 10", "Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginTop: 10, whiteSpace: "pre-wrap" }}>{q}</div>
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
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 5 / Chương II", "Lesson 5 / Chapter II")}
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
