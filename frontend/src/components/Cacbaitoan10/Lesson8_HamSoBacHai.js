/* eslint-disable react-hooks/static-components */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
export default function Lesson8_HamSoBacHai() {
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
      q: t("Hàm số bậc hai y = ax² + bx + c có dạng chuẩn (đỉnh) là?", "The vertex form of quadratic y = ax² + bx + c is?"),
      options: ["y = a(x − h)² + k", "y = a(x + h)² − k", "y = ax² + k", "y = (x − h)² + k"],
      answer: 0,
      explain: t("Dạng đỉnh: y = a(x − h)² + k, đỉnh I(h, k) với h = −b/(2a), k = f(h).", "Vertex form: y = a(x−h)²+k, vertex I(h,k) with h = −b/(2a), k = f(h)."),
    },
    {
      q: t("Parabol y = 2x² − 4x + 1 có đỉnh tại?", "The parabola y = 2x² − 4x + 1 has vertex at?"),
      options: ["(−1, −1)", "(1, −1)", "(2, 1)", "(−2, 9)"],
      answer: 1,
      explain: t("h = −(−4)/(2×2) = 1. k = 2(1)²−4(1)+1 = −1. Đỉnh I(1, −1).", "h = 4/4 = 1. k = 2−4+1 = −1. Vertex I(1, −1)."),
    },
    {
      q: t("Parabol y = −x² + 2x + 3 mở về phía nào?", "Does parabola y = −x² + 2x + 3 open up or down?"),
      options: [t("Mở lên (a > 0)", "Opens up (a > 0)"), t("Mở xuống (a < 0)", "Opens down (a < 0)"), t("Không xác định", "Cannot determine"), t("Nằm ngang", "Opens sideways")],
      answer: 1,
      explain: t("a = −1 < 0 → parabol mở xuống, đỉnh là điểm CỰC ĐẠI.", "a = −1 < 0 → parabola opens downward, vertex is a MAXIMUM point."),
    },
    {
      q: t("Trục đối xứng của parabol y = ax² + bx + c là?", "The axis of symmetry of y = ax² + bx + c is?"),
      options: ["x = b/(2a)", "x = −b/(2a)", "x = −b/a", "y = −b/(2a)"],
      answer: 1,
      explain: t("Trục đối xứng: x = −b/(2a). Đây cũng là hoành độ của đỉnh.", "Axis of symmetry: x = −b/(2a). This is also the x-coordinate of the vertex."),
    },
    {
      q: t("Hàm y = x² − 2x đồng biến trên khoảng nào?", "y = x² − 2x is increasing on which interval?"),
      options: ["(−∞, 1)", "(1, +∞)", "(−∞, 0)", "(0, +∞)"],
      answer: 1,
      explain: t("h = −(−2)/(2×1) = 1. a > 0 → đồng biến trên (1, +∞), nghịch biến trên (−∞, 1).", "h = 1. a > 0 → increasing on (1, +∞), decreasing on (−∞, 1)."),
    },
  ];

  const tfCards = [
    { stmt: t("Parabol y = ax² + bx + c luôn có đúng một trục đối xứng.", "The parabola y = ax²+bx+c always has exactly one axis of symmetry."), answer: true, explain: t("ĐÚNG — trục đối xứng x = −b/(2a) là duy nhất.", "TRUE — axis x = −b/(2a) is unique.") },
    { stmt: t("Nếu a > 0, hàm y = ax² + bx + c nghịch biến trên (−∞, h) với h = −b/(2a).", "If a > 0, y = ax²+bx+c is decreasing on (−∞, h) with h = −b/(2a)."), answer: true, explain: t("ĐÚNG — parabol mở lên: nghịch biến bên trái đỉnh, đồng biến bên phải.", "TRUE — upward parabola: decreasing left of vertex, increasing right.") },
    { stmt: t("Đỉnh của parabol y = a(x−h)² + k là điểm (h, k).", "The vertex of y = a(x−h)²+k is (h, k)."), answer: true, explain: t("ĐÚNG — đây là dạng đỉnh, đỉnh I(h, k).", "TRUE — vertex form, vertex I(h, k).") },
    { stmt: t("Parabol y = x² − 4x + 5 cắt trục Ox tại 2 điểm phân biệt.", "The parabola y = x² − 4x + 5 intersects Ox at 2 distinct points."), answer: false, explain: t("SAI — Δ = 16 − 20 = −4 < 0, không cắt Ox (parabol nằm hoàn toàn phía trên Ox).", "FALSE — Δ = 16−20 = −4 < 0, no x-intercepts (parabola entirely above Ox).") },
    { stmt: t("Giá trị nhỏ nhất của y = 2(x−3)² + 1 là 1.", "The minimum value of y = 2(x−3)²+1 is 1."), answer: true, explain: t("ĐÚNG — a = 2 > 0, min = k = 1 tại x = 3.", "TRUE — a = 2 > 0, min = k = 1 at x = 3.") },
  ];

  const fillQuestions = [
    { id: "f1", template: t("Trục đối xứng của y = 2x² − 8x + 3 là x = ___.", "Axis of symmetry of y = 2x²−8x+3 is x = ___."), answer: "2", altAnswers: ["2"], hint: t("x = −b/(2a) = 8/4 = ?", "x = −b/(2a) = 8/4 = ?") },
    { id: "f2", template: t("Đỉnh của y = (x−2)² − 5 là I(___, ___).", "Vertex of y = (x−2)²−5 is I(___, ___)."), answer: "2, -5", altAnswers: ["(2,-5)", "2,-5", "(2, -5)"], hint: t("Dạng đỉnh a(x−h)²+k → đỉnh (h, k).", "Vertex form a(x−h)²+k → vertex (h,k).") },
    { id: "f3", template: t("Parabol y = −3x² + 6x mở ___ vì a = −3 ___ 0.", "Parabola y = −3x²+6x opens ___ because a = −3 ___ 0."), answer: "xuống, <", altAnswers: ["down, <", "xuong, <", "downward, <"], hint: t("a âm → mở xuống.", "Negative a → opens down.") },
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
    ["khai1", "📖", t("1. Định Nghĩa", "1. Definition")],
    ["khai2", "📖", t("2. Đỉnh & Trục", "2. Vertex & Axis")],
    ["khai3", "📖", t("3. Đơn Điệu", "3. Monotonicity")],
    ["khai4", "📖", t("4. Vẽ Đồ Thị", "4. Graphing")],
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
                <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 4 }}>{t("Câu","Q")} {idx+1}: {item.qText}</div>
                {!item.correct && <div style={{ fontSize: 14, color: "#922b21" }}>{t("Đáp án đúng:","Correct answer:")} <strong>{item.correctText}</strong></div>}
                {item.yourText && !item.correct && <div style={{ fontSize: 14, color: "#777" }}>{t("Bạn chọn:","You answered:")} {item.yourText}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={onReset} style={{ padding:"12px 32px", background:"black", color:"white", border:"none", borderRadius:8, fontWeight:600, fontSize:15, cursor:"pointer" }}>🔄 {t("Chơi lại","Play Again")}</button>
      </div>
    </div>
  );

  const mcResultItems = mcHistory.map((h) => ({ correct: h.correct, qText: mcQuestions[h.q].q, correctText: mcQuestions[h.q].options[mcQuestions[h.q].answer], yourText: mcQuestions[h.q].options[h.selected] }));
  const tfResultItems = tfHistory.map((h) => ({ correct: h.correct, qText: tfCards[h.q].stmt, correctText: tfCards[h.q].answer ? t("ĐÚNG","TRUE") : t("SAI","FALSE"), yourText: h.given ? t("ĐÚNG","TRUE") : t("SAI","FALSE") }));
  const fillResultItems = fillChecked ? fillQuestions.map((q) => ({ correct: checkFill(q.id), qText: q.template, correctText: q.answer, yourText: fillAnswers[q.id] || t("(bỏ trống)","(blank)") })) : [];

  return (
    <div style={{ width: "100%", background: "#ffffff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>

        <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>← {t("Quay lại","Back to lessons")}</Link>
        </div>

        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>{t("Chương III · Hàm Số và Đồ Thị","Chapter III · Functions and Graphs")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 8: Hàm Số Bậc Hai","Lesson 8: Quadratic Functions")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang==="vi"?"black":"#f9f9f9", color: lang==="vi"?"white":"black", border:"none", borderRadius:8, padding:"10px 18px", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang==="en"?"black":"#f9f9f9", color: lang==="en"?"white":"black", border:"none", borderRadius:8, padding:"10px 18px", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt","Learning Objectives")}</div>
          {[t("Nhận biết hàm số bậc hai y = ax² + bx + c (a ≠ 0).","Identify quadratic function y = ax²+bx+c (a ≠ 0)."), t("Tìm đỉnh, trục đối xứng của parabol.","Find vertex and axis of symmetry of a parabola."), t("Xác định chiều biến thiên (đồng/nghịch biến).","Determine monotonicity (increasing/decreasing)."), t("Vẽ đồ thị parabol theo 5 bước chuẩn.","Sketch parabola using 5 standard steps."), t("Tìm giá trị lớn nhất/nhỏ nhất.","Find maximum and minimum values.")].map((o,i) => (
            <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• {o}</div>
          ))}
        </div>

        <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", paddingTop: 12, paddingBottom: 12, marginBottom: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map(([id,icon,label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background:"#f9f9f9", color:"black", border:"none", borderRadius:8, padding:"10px 14px", fontWeight:600, fontSize:13, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background="black"; e.currentTarget.style.color="white"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#f9f9f9"; e.currentTarget.style.color="black"; }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* KHỞI ĐỘNG */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động","Warm-Up")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu","Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t("Một quả bóng được ném lên theo phương thẳng đứng. Độ cao h (mét) theo thời gian t (giây) có dạng: h(t) = −5t² + 20t + 1. Đây là một hàm số bậc hai. Đồ thị của nó là một parabol và cho biết vận tốc, độ cao cực đại, thời gian rơi,...",
                "A ball is thrown vertically. Height h (meters) vs time t (seconds): h(t) = −5t²+20t+1. This is a quadratic function. Its graph — a parabola — tells us speed, maximum height, fall time, etc.")}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Đỉnh của parabol h(t) cho biết điều gì về quả bóng?","What does the vertex of h(t) tell us about the ball?")}</em></div>
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


        {/* 1. ĐỊNH NGHĨA */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Hàm Số Bậc Hai","1. Quadratic Function")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight:"bold", fontSize:18, color:"#0B4F5C", marginBottom:10 }}>📌 {t("Định nghĩa","Definition")}</div>
            <div style={{ fontSize:16, lineHeight:1.8 }}>{t("Hàm số bậc hai là hàm số có dạng y = ax² + bx + c, trong đó a, b, c ∈ ℝ và a ≠ 0. Đồ thị là một parabol.","A quadratic function has the form y = ax²+bx+c, where a,b,c ∈ ℝ and a ≠ 0. Its graph is a parabola.")}</div>
            <div style={{ color:"#777", fontSize:15, marginTop:10 }}>💡 {t("Tập xác định: D = ℝ (mọi x ∈ ℝ đều cho giá trị y xác định).","Domain: D = ℝ (every x ∈ ℝ gives a defined y value).")}</div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:20, transition:"all 0.3s" }}>
            {[["y = x²","a=1, b=0, c=0"],["y = −2x² + 4","a=−2, b=0, c=4"],["y = x² − 3x + 2","a=1, b=−3, c=2"],["y = 3(x−1)²","a=3, b=−6, c=3"]].map(([expr,note],i) => (
              <article key={i} style={{ padding:16, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", textAlign:"center" }}>
                <div style={{ fontFamily:"monospace", fontSize:17, color:"#0B4F5C", marginBottom:6 }}>{expr}</div>
                <div style={{ fontSize:13, color:"#777" }}>{note}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 2. ĐỈNH & TRỤC */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Đỉnh và Trục Đối Xứng","2. Vertex and Axis of Symmetry")} />
          <div className="reveal" data-reveal style={{ padding:20, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", marginBottom:24 }}>
            <div style={{ fontWeight:"bold", fontSize:18, color:"#0B4F5C", marginBottom:16 }}>📌 {t("Công thức","Formulas")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", gap:16, transition:"all 0.3s" }}>
              {[
                { label:t("Hoành độ đỉnh","x-coordinate of vertex"), formula:"h = −b / (2a)", note:t("Cũng là trục đối xứng x = h","Also the axis x = h") },
                { label:t("Tung độ đỉnh","y-coordinate of vertex"), formula:"k = f(h) = c − b²/(4a)", note:t("Giá trị hàm tại x = h","Function value at x = h") },
                { label:t("Trục đối xứng","Axis of symmetry"), formula:"x = −b/(2a)", note:t("Đường thẳng x = h","Vertical line x = h") },
              ].map((card,i) => (
                <article key={i} style={{ padding:16, borderRadius:10, background:"white", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", textAlign:"center" }}>
                  <div style={{ fontSize:14, color:"#777", marginBottom:6 }}>{card.label}</div>
                  <div style={{ fontFamily:"monospace", fontSize:20, color:"#0B4F5C", fontWeight:700, marginBottom:6 }}>{card.formula}</div>
                  <div style={{ fontSize:13, color:"#aaa" }}>{card.note}</div>
                </article>
              ))}
            </div>
          </div>
          <div className="reveal" data-reveal style={{ padding:20, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:14 }}>📘 {t("Ví dụ: y = 2x² − 8x + 6","Example: y = 2x²−8x+6")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:15, color:"#555" }}>
              <div>① a = 2, b = −8, c = 6</div>
              <div>② h = −(−8)/(2×2) = 8/4 = <strong>2</strong></div>
              <div>③ k = 2(4) − 8(2) + 6 = 8 − 16 + 6 = <strong>−2</strong></div>
              <div style={{ marginTop:8, padding:"10px 14px", background:"#eafaf1", borderRadius:8, color:"#1e8449", fontWeight:600 }}>
                ✅ {t("Đỉnh I(2, −2), trục đối xứng x = 2, parabol mở lên (a = 2 > 0)","Vertex I(2,−2), axis x = 2, opens up (a = 2 > 0)")}
              </div>
            </div>
          </div>
        </section>

        {/* 3. ĐƠN ĐIỆU */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Sự Đơn Điệu","3. Monotonicity")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:24, transition:"all 0.3s" }}>
            {[
              { label:"a > 0", shape:t("Parabol mở lên ∪","Parabola opens up ∪"), dec:t("Nghịch biến trên (−∞, h)","Decreasing on (−∞, h)"), inc:t("Đồng biến trên (h, +∞)","Increasing on (h, +∞)"), min:t("Đỉnh là GTNN: y_min = k","Vertex is MIN: y_min = k"), color:"#1e8449", bg:"#eafaf1" },
              { label:"a < 0", shape:t("Parabol mở xuống ∩","Parabola opens down ∩"), dec:t("Đồng biến trên (−∞, h)","Increasing on (−∞, h)"), inc:t("Nghịch biến trên (h, +∞)","Decreasing on (h, +∞)"), min:t("Đỉnh là GTLN: y_max = k","Vertex is MAX: y_max = k"), color:"#922b21", bg:"#fdf2f2" },
            ].map((card,i) => (
              <article key={i} style={{ padding:20, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{card.label} — {card.shape}</div>
                <div style={{ fontSize:15, color:"#555", marginBottom:6 }}>↘ {card.dec}</div>
                <div style={{ fontSize:15, color:"#555", marginBottom:12 }}>↗ {card.inc}</div>
                <div style={{ background:card.bg, color:card.color, padding:"8px 14px", borderRadius:8, fontSize:14, fontWeight:600 }}>🎯 {card.min}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. VẼ ĐỒ THỊ */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("4. Vẽ Đồ Thị Parabol","4. Graphing the Parabola")} />
          <div className="reveal" data-reveal style={{ padding:20, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", marginBottom:24 }}>
            <div style={{ fontSize:16, fontWeight:700, color:"#0B4F5C", marginBottom:16 }}>📋 {t("5 bước vẽ đồ thị parabol","5 steps to sketch a parabola")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"flex", flexDirection:"column", gap:12, transition:"all 0.3s" }}>
              {[
                t("Xác định chiều mở: a > 0 → ∪, a < 0 → ∩","Determine opening direction: a>0 → ∪, a<0 → ∩"),
                t("Tính đỉnh I(h, k) với h = −b/(2a)","Find vertex I(h,k) with h = −b/(2a)"),
                t("Vẽ trục đối xứng x = h (đường nét đứt)","Draw axis of symmetry x = h (dashed line)"),
                t("Tìm giao với trục Oy: x = 0 → y = c → điểm (0, c)","Find y-intercept: x = 0 → y = c → point (0, c)"),
                t("Tìm giao với trục Ox (nếu có): giải ax²+bx+c = 0. Vẽ đường cong qua các điểm.","Find x-intercepts (if any): solve ax²+bx+c = 0. Draw smooth curve."),
              ].map((step, i) => (
                <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ minWidth:32, height:32, borderRadius:"50%", background:"black", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, flexShrink:0 }}>{i+1}</div>
                  <div style={{ fontSize:15, color:"#555", lineHeight:1.7, paddingTop:4 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal" data-reveal style={{ padding:20, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:12 }}>📘 {t("Ví dụ: Vẽ đồ thị y = x² − 2x − 3","Example: Sketch y = x²−2x−3")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:15, color:"#555" }}>
              <div>① a = 1 {">"} 0 → {t("parabol mở lên","opens up")}</div>
              <div>② h = 2/2 = 1, k = 1−2−3 = −4 → {t("Đỉnh I(1, −4)","Vertex I(1,−4)")}</div>
              <div>③ {t("Trục đối xứng","Axis")} x = 1</div>
              <div>④ {t("Giao Oy","y-intercept")}: (0, −3)</div>
              <div>⑤ x²−2x−3 = 0 → (x−3)(x+1) = 0 → x = 3 {t("hoặc","or")} x = −1 → {t("Giao Ox","x-intercepts")}: (3,0) {t("và","and")} (−1,0)</div>
              <div style={{ marginTop:8, padding:"10px 14px", background:"#eafaf1", borderRadius:8, color:"#1e8449", fontWeight:600 }}>
                ✅ {t("Nối các điểm: (−1,0), đỉnh (1,−4), (3,0), qua (0,−3) — parabol mở lên.","Connect: (−1,0), vertex (1,−4), (3,0), through (0,−3) — upward parabola.")}
              </div>
            </div>
          </div>
        </section>

        {/* THỰC HÀNH */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành","Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px,1fr))", gap:40, transition:"all 0.3s" }}>
            {[
              { id:"e1", q:t("Cho y = x² − 6x + 8.\n(a) Tìm đỉnh và trục đối xứng.\n(b) Parabol mở lên hay xuống?","For y = x²−6x+8.\n(a) Find vertex and axis.\n(b) Does it open up or down?"), a:[t("h = 6/2 = 3, k = 9−18+8 = −1 → Đỉnh I(3, −1)","h = 6/2 = 3, k = 9−18+8 = −1 → Vertex I(3,−1)"), t("Trục đối xứng: x = 3","Axis of symmetry: x = 3"), t("a = 1 > 0 → Parabol mở lên, GTNN = −1 tại x = 3","a = 1 > 0 → Opens up, MIN = −1 at x = 3")] },
              { id:"e2", q:t("Vẽ phác đồ thị y = −x² + 4x − 3.\nTìm giao điểm với các trục tọa độ.","Sketch y = −x²+4x−3.\nFind intersections with axes."), a:[t("a = −1 < 0 → mở xuống","a = −1 < 0 → opens down"), t("h = 4/2 = 2, k = −4+8−3 = 1 → Đỉnh (2,1)","h = 2, k = 1 → Vertex (2,1)"), t("Giao Oy: (0,−3)","y-intercept: (0,−3)"), t("−x²+4x−3=0 → x²−4x+3=0 → (x−1)(x−3)=0 → x=1, x=3","Solve: x=1, x=3 → x-intercepts: (1,0) and (3,0)")] },
              { id:"e3", q:t("Tìm giá trị lớn nhất/nhỏ nhất của y = 2x² − 4x + 5.","Find max/min of y = 2x²−4x+5."), a:[t("a = 2 > 0 → parabol mở lên → hàm có GTNN","a = 2 > 0 → opens up → has MINIMUM"), t("h = 4/4 = 1, k = 2−4+5 = 3","h = 1, k = 3"), t("GTNN = 3 tại x = 1. Không có GTLN.","MIN = 3 at x = 1. No maximum.")] },
            ].map(({id,q,a}) => (
              <article key={id}>
                <div style={{ padding:"16px 20px", borderRadius:"10px 10px 0 0", background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:4 }}>📝 {t("Bài tập","Exercise")}</div>
                  <div style={{ color:"#777", fontSize:14, marginBottom:10 }}>{t("Toán 10","Grade 10")}</div>
                  <div style={{ fontSize:15, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display:"block", width:"100%", padding:"12px 20px", background:"black", color:"white", border:"none", fontWeight:600, fontSize:15, cursor:"pointer", textAlign:"left" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲","Hide Answer ▲") : t("Xem đáp án ▼","Show Answer ▼")}
                </button>
                {revealedAnswers[id] && <div style={{ padding:"16px 20px", background:"#eafaf1", borderRadius:"0 0 10px 10px" }}>{a.map((line,i) => <div key={i} style={{ fontSize:15, color:"#555", marginBottom:6 }}>{line}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>

        {/* MINI GAME */}
        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎮" title={t("Mini Game","Mini Game")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:24, marginBottom:32, transition:"all 0.3s" }}>
            {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 questions")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background:gameMode===mode?"black":"#f9f9f9", color:gameMode===mode?"white":"black", cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", padding:20, borderRadius:10 }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{label}</div>
                <div style={{ fontSize:14, opacity:0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

          {gameMode === "mc" && (
            <div className="reveal" data-reveal style={{ padding:24, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              {!mcDone ? (
                <>
                  <div style={{ color:"#777", fontSize:15, marginBottom:8 }}>{t("Câu","Q")} {mcIndex+1}/{mcQuestions.length} · {t("Điểm:","Score:")} {mcScore}</div>
                  <div style={{ fontSize:20, fontWeight:600, marginBottom:20 }}>{mcQuestions[mcIndex].q}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {mcQuestions[mcIndex].options.map((opt,i) => {
                      let bg="white",color="black";
                      if (mcSelected!==null){if(i===mcQuestions[mcIndex].answer){bg="#eafaf1";color="#1e8449";}else if(i===mcSelected){bg="#fdf2f2";color="#922b21";}}
                      return <button key={i} onClick={()=>handleMcSelect(i)} style={{ textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color,fontSize:15,fontWeight:mcSelected!==null&&(i===mcSelected||i===mcQuestions[mcIndex].answer)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s" }}>{String.fromCharCode(65+i)}. {opt}</button>;
                    })}
                  </div>
                  {mcSelected!==null&&(<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQuestions[mcIndex].explain}</div><button onClick={handleMcNext} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mcIndex+1<mcQuestions.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}
                </>
              ) : <ResultSummary items={mcResultItems} onReset={resetMc} scoreLabel={mcScore===mcQuestions.length?t("Xuất sắc! 🎉","Perfect! 🎉"):mcScore>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} />}
            </div>
          )}

          {gameMode === "tf" && (
            <div className="reveal" data-reveal style={{ padding:24, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              {!tfDone ? (
                <>
                  <div style={{ color:"#777", fontSize:15, marginBottom:14 }}>{t("Thẻ","Card")} {tfIndex+1}/{tfCards.length} · {t("Điểm:","Score:")} {tfScore}</div>
                  <article style={{ background:"white", borderRadius:10, padding:24, marginBottom:20, textAlign:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize:18, lineHeight:1.7, marginBottom:24 }}>{tfCards[tfIndex].stmt}</div>
                    {!tfFlipped ? (
                      <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
                        <button onClick={()=>handleTfAnswer(true)} style={{ padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>✅ {t("ĐÚNG","TRUE")}</button>
                        <button onClick={()=>handleTfAnswer(false)} style={{ padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>❌ {t("SAI","FALSE")}</button>
                      </div>
                    ) : (
                      <><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfCards[tfIndex].explain}</div><button onClick={handleTfNext} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{tfIndex+1<tfCards.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>
                    )}
                  </article>
                </>
              ) : <ResultSummary items={tfResultItems} onReset={resetTf} scoreLabel={tfScore===tfCards.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} />}
            </div>
          )}

          {gameMode === "fill" && (
            <div className="reveal" data-reveal style={{ padding:24, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              {!fillChecked ? (
                <>
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:20 }}>{t("Điền câu trả lời vào chỗ trống","Fill in each blank")}</div>
                  {fillQuestions.map((q,qi) => (
                    <div key={q.id} style={{ marginBottom:24 }}>
                      <div style={{ fontSize:15, color:"#777", marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div>
                      <div style={{ fontSize:16, lineHeight:1.7, marginBottom:10 }}>{q.template}</div>
                      <input value={fillAnswers[q.id]||""} onChange={(e)=>setFillAnswers((p)=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Enter answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} />
                    </div>
                  ))}
                  <button onClick={()=>setFillChecked(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button>
                </>
              ) : <ResultSummary items={fillResultItems} onReset={()=>{setFillAnswers({});setFillChecked(false);}} scoreLabel={fillScore===fillQuestions.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fillScore>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} />}
            </div>
          )}
        </section>

        <hr style={{ width:"5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign:"center", color:"#777", fontSize:15, marginBottom:60 }}>
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 8 / Chương III","Lesson 8 / Chapter III")}
        </div>

        <style>{`
          .reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}
          .reveal.visible{opacity:1;transform:translateY(0) scale(1);}
          .reveal[data-reveal-stagger].visible{opacity:1;transform:none;}
          .reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}
          header.reveal{transform:translateY(-18px);opacity:0;}
          header.reveal.visible{opacity:1;transform:translateY(0);}
          article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}
          article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}
        `}</style>
        <DuoTranslate/> 
      </div>
    </div>
  );
}
