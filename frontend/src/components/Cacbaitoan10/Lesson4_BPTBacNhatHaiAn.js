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

export default function Lesson4_BPTBacNhatHaiAn() {
  const { user, saveGameResult } = useAuth();
  const [lang, setLang] = useState("vi");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [gameMode, setGameMode] = useState("mc");

  // MC state
  const [mcIndex, setMcIndex] = useState(0);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcScore, setMcScore] = useState(0);
  const [mcDone, setMcDone] = useState(false);
  const [mcHistory, setMcHistory] = useState([]); // [{selected, correct}]

  // TF state
  const [tfIndex, setTfIndex] = useState(0);
  const [tfFlipped, setTfFlipped] = useState(false);
  const [tfScore, setTfScore] = useState(0);
  const [tfDone, setTfDone] = useState(false);
  const [tfHistory, setTfHistory] = useState([]); // [{given, correct}]

  // Fill state
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
        "text": "linear inequalities in two variables",
        "vi": "bất phương trình bậc nhất hai ẩn",
        "detail": "<b>linear inequalities in two variables</b>: bất phương trình bậc nhất hai ẩn.",
        "detailTitle": "linear inequalities in two variables (bất phương trình bậc nhất hai ẩn)"
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
        "text": "solution region",
        "vi": "miền nghiệm",
        "detail": "<b>solution region</b>: miền nghiệm.",
        "detailTitle": "solution region (miền nghiệm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "boundary line",
        "vi": "đường biên",
        "detail": "<b>boundary line</b>: đường biên.",
        "detailTitle": "boundary line (đường biên)"
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
        "text": "half-plane",
        "vi": "nửa mặt phẳng",
        "detail": "<b>half-plane</b>: nửa mặt phẳng.",
        "detailTitle": "half-plane (nửa mặt phẳng)"
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
        "text": "solution region",
        "vi": "miền nghiệm",
        "detail": "<b>solution region</b>: miền nghiệm.",
        "detailTitle": "solution region (miền nghiệm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "boundary line",
        "vi": "đường biên",
        "detail": "<b>boundary line</b>: đường biên.",
        "detailTitle": "boundary line (đường biên)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "half-plane",
        "vi": "nửa mặt phẳng",
        "detail": "<b>half-plane</b>: nửa mặt phẳng.",
        "detailTitle": "half-plane (nửa mặt phẳng)"
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
    {
      q: t("BPT bậc nhất hai ẩn có dạng tổng quát nào?", "What is the general form of a linear inequality in two variables?"),
      options: ["ax² + bx + c > 0", "ax + by + c ≥ 0", "ax + by² + c < 0", "ax² + by² = 0"],
      answer: 1,
      explain: t("Dạng ax + by + c ≥ 0 (hoặc >, <, ≤) với a, b không đồng thời bằng 0.", "Form ax + by + c ≥ 0 (or >, <, ≤) where a, b are not both zero.")
    },
    {
      q: t("Miền nghiệm của BPT 2x + y ≥ 4 là?", "The solution region of 2x + y ≥ 4 is?"),
      options: [t("Nửa mặt phẳng không chứa gốc O(0,0)", "The half-plane not containing origin O(0,0)"), t("Nửa mặt phẳng chứa gốc O(0,0)", "The half-plane containing origin O(0,0)"), t("Toàn bộ mặt phẳng Oxy", "The entire Oxy plane"), t("Chỉ đường thẳng 2x + y = 4", "Only the line 2x + y = 4")],
      answer: 0,
      explain: t("Thử O(0,0): 2(0)+0 = 0 < 4 → O không thỏa → miền nghiệm là nửa mp không chứa O.", "Test O(0,0): 2(0)+0 = 0 < 4 → O fails → solution is the half-plane not containing O.")
    },
    {
      q: t("Điểm nào sau đây là nghiệm của BPT x − 2y < 3?", "Which point is a solution of x − 2y < 3?"),
      options: ["(3, 0)", "(5, 1)", "(1, 2)", "(4, 0)"],
      answer: 2,
      explain: t("Thử (1,2): 1 − 2(2) = 1−4 = −3 < 3 ✓. Các điểm khác: (3,0)→3≮3; (5,1)→3≮3; (4,0)→4≮3.", "Test (1,2): 1−2(2) = −3 < 3 ✓. Others: (3,0)→3, (5,1)→3, (4,0)→4, none < 3.")
    },
    {
      q: t("Đường thẳng ax + by + c = 0 chia mặt phẳng thành bao nhiêu phần?", "The line ax + by + c = 0 divides the plane into how many parts?"),
      options: ["1", "2", "3", "4"],
      answer: 1,
      explain: t("Một đường thẳng chia mặt phẳng thành 2 nửa mặt phẳng (hai phần mở).", "A line divides the plane into 2 open half-planes.")
    },
    {
      q: t("BPT x + y > 1. Điểm (0, 0) có thỏa BPT không?", "BPT x + y > 1. Does the point (0, 0) satisfy it?"),
      options: [t("Có, vì 0 + 0 > 1", "Yes, because 0 + 0 > 1"), t("Không, vì 0 + 0 ≤ 1", "No, because 0 + 0 ≤ 1"), t("Có, (0,0) luôn là nghiệm", "Yes, (0,0) is always a solution"), t("Không xác định", "Undetermined")],
      answer: 1,
      explain: t("0 + 0 = 0 < 1, không thỏa điều kiện > 1.", "0 + 0 = 0 < 1, does not satisfy > 1.")
    },
  ];

  const tfCards = [
    { stmt: t("Miền nghiệm của BPT ax + by + c > 0 luôn là nửa mặt phẳng mở (không kể biên).", "The solution region of ax + by + c > 0 is always an open half-plane (boundary excluded)."), answer: true, explain: t("ĐÚNG — dấu > hoặc < không kể đường biên. Dấu ≥, ≤ thì kể biên.", "TRUE — strict inequalities (>, <) exclude the boundary. ≥, ≤ include it.") },
    { stmt: t("Điểm O(0, 0) luôn không phải nghiệm của BPT ax + by + c > 0.", "The origin O(0,0) is never a solution of ax + by + c > 0."), answer: false, explain: t("SAI — phụ thuộc vào c. Nếu c > 0 thì O(0,0) thỏa ax+by+c > 0.", "FALSE — depends on c. If c > 0, O(0,0) satisfies the inequality.") },
    { stmt: t("Miền nghiệm của BPT là một nửa mặt phẳng (nửa mp mở hoặc đóng).", "The solution region of a linear inequality in 2 variables is a half-plane (open or closed)."), answer: true, explain: t("ĐÚNG — nghiệm của BPT bậc nhất hai ẩn luôn là nửa mặt phẳng.", "TRUE — the solution of a linear inequality in two variables is always a half-plane.") },
    { stmt: t("BPT bậc nhất hai ẩn có thể vô nghiệm.", "A linear inequality in two variables can have no solution."), answer: false, explain: t("SAI — BPT bậc nhất hai ẩn luôn có miền nghiệm là nửa mặt phẳng (vô số nghiệm).", "FALSE — it always has a half-plane as its solution region (infinitely many solutions).") },
    { stmt: t("Để biểu diễn miền nghiệm, ta tô màu vùng thỏa mãn BPT.", "To represent the solution region, we shade the region satisfying the inequality."), answer: true, explain: t("ĐÚNG — quy ước tô màu (hoặc gạch chéo) vào vùng nghiệm.", "TRUE — convention is to shade (or hatch) the solution region.") },
  ];

  const fillQuestions = [
    { id: "f1", template: t("Dạng tổng quát của BPT bậc nhất hai ẩn: ax + by ___ 0 (điền dấu bất kỳ).", "General form of linear inequality in 2 variables: ax + by ___ 0 (fill any inequality sign)."), answer: ">", altAnswers: ["<", ">=", "<=", "≥", "≤"], hint: t("Một trong bốn dấu: >, <, ≥, ≤.", "One of four signs: >, <, ≥, ≤.") },
    { id: "f2", template: t("Để xác định nửa mặt phẳng chứa nghiệm, ta thử điểm ___ vào BPT.", "To find which half-plane contains solutions, we test the point ___ in the inequality."), answer: "o", altAnswers: ["(0,0)", "O(0,0)", "gốc tọa độ", "origin"], hint: t("Thường dùng gốc tọa độ O(0,0).", "We usually use the origin O(0,0).") },
    { id: "f3", template: t("BPT x + 2y ≤ 6. Thử A(0,0): 0 + 0 = 0 ___ 6, nên O ___ miền nghiệm.", "BPT x + 2y ≤ 6. Test A(0,0): 0 + 0 = 0 ___ 6, so O ___ in the solution region."), answer: "≤, thuộc", altAnswers: ["<=, thuoc", "≤,thuộc", "<=,thuộc"], hint: t("0 ≤ 6 đúng, nên O thuộc miền nghiệm.", "0 ≤ 6 is true, so O is in the solution region.") },
  ];

  // ── MC handlers ──
  const handleMcSelect = (i) => {
    if (mcSelected !== null) return;
    setMcSelected(i);
    const correct = i === mcQuestions[mcIndex].answer;
    if (correct) setMcScore((s) => s + 1);
    setMcHistory((h) => [...h, { q: mcIndex, selected: i, correct }]);
  };
  const handleMcNext = () => {
    if (mcIndex + 1 >= mcQuestions.length) setMcDone(true);
    else { setMcIndex((i) => i + 1); setMcSelected(null); }
  };
  const resetMc = () => { setMcIndex(0); setMcSelected(null); setMcScore(0); setMcDone(false); setMcHistory([]); };

  // ── TF handlers ──
  const handleTfAnswer = (ans) => {
    if (tfFlipped) return;
    setTfFlipped(true);
    const correct = ans === tfCards[tfIndex].answer;
    if (correct) setTfScore((s) => s + 1);
    setTfHistory((h) => [...h, { q: tfIndex, given: ans, correct }]);
  };
  const handleTfNext = () => {
    if (tfIndex + 1 >= tfCards.length) setTfDone(true);
    else { setTfIndex((i) => i + 1); setTfFlipped(false); }
  };
  const resetTf = () => { setTfIndex(0); setTfFlipped(false); setTfScore(0); setTfDone(false); setTfHistory([]); };

  // ── Fill handlers ──
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
    ["khai3", "📖", t("3. Biểu Diễn", "3. Graphing")],
    ["thucHanh", "✏️", t("Thực Hành", "Practice")],
    ["miniGame", "🎮", t("Mini Game", "Mini Game")],
  ];

  const SectionHeader = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#0B4F5C", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0f0f0" }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );

  // ── Shared result summary box ──
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
                <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                  {t("Câu", "Q")} {idx + 1}: {item.qText}
                </div>
                {!item.correct && (
                  <div style={{ fontSize: 14, color: "#922b21" }}>
                    {t("Đáp án đúng:", "Correct answer:")} <strong>{item.correctText}</strong>
                  </div>
                )}
                {item.yourText && !item.correct && (
                  <div style={{ fontSize: 14, color: "#777" }}>
                    {t("Bạn chọn:", "You answered:")} {item.yourText}
                  </div>
                )}
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

  const mcResultItems = mcHistory.map((h) => ({
    correct: h.correct,
    qText: mcQuestions[h.q].q,
    correctText: mcQuestions[h.q].options[mcQuestions[h.q].answer],
    yourText: mcQuestions[h.q].options[h.selected],
  }));

  const tfResultItems = tfHistory.map((h) => ({
    correct: h.correct,
    qText: tfCards[h.q].stmt,
    correctText: tfCards[h.q].answer ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE"),
    yourText: h.given ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE"),
  }));

  const fillResultItems = fillChecked ? fillQuestions.map((q) => ({
    correct: checkFill(q.id),
    qText: q.template,
    correctText: q.answer,
    yourText: fillAnswers[q.id] || t("(bỏ trống)", "(blank)"),
  })) : [];

  
  useEffect(() => {
    if (mcDone && user) {
      saveGameResult({
        lesson_slug: "Lesson4_BPTBacNhatHaiAn",
        mode: "mc",
        score: mcScore,
        total: mcQuestions.length
      });
    }
  }, [mcDone, mcScore, user]);

  useEffect(() => {
    if (tfDone && user) {
      saveGameResult({
        lesson_slug: "Lesson4_BPTBacNhatHaiAn",
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
        lesson_slug: "Lesson4_BPTBacNhatHaiAn",
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
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>{t("Chương II · Bất Phương Trình Bậc Nhất", "Chapter II · Linear Inequalities")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Bài 4: Bất Phương Trình Bậc Nhất Hai Ẩn", "Lesson 4: Linear Inequality in Two Variables")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        {/* OBJECTIVES */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
          {[
            t("Nhận biết bất phương trình bậc nhất hai ẩn.", "Identify linear inequalities in two variables."),
            t("Hiểu khái niệm nghiệm và miền nghiệm của BPT.", "Understand solutions and solution regions."),
            t("Biểu diễn miền nghiệm trên mặt phẳng tọa độ.", "Graph the solution region on the coordinate plane."),
            t("Xác định một điểm có thuộc miền nghiệm không.", "Determine whether a point belongs to the solution region."),
          ].map((obj, i) => (
            <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• {obj}</div>
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

        {/* ════ KHỞI ĐỘNG ════ */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              {t('Một xưởng sản xuất hai loại sản phẩm A và B. Mỗi sản phẩm A tốn 2 giờ, mỗi sản phẩm B tốn 3 giờ. Tổng thời gian làm việc không quá 120 giờ/ngày. Điều kiện này có thể mô tả bằng: 2x + 3y ≤ 120, với x, y ≥ 0.',
                'A factory produces two products A and B. Each A takes 2 hours, each B takes 3 hours. Total working time is at most 120 hours/day. This condition is: 2x + 3y ≤ 120, with x, y ≥ 0.')}
            </div>
            <div style={{ fontSize: 16 }}>❓ <em>{t("Đây là ví dụ của bất phương trình bậc nhất hai ẩn. Tập nghiệm là một vùng trên mặt phẳng Oxy.", "This is a linear inequality in two variables. The solution set is a region on the Oxy plane.")}</em></div>
          </div>
        </section>
        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="unSBFwK881s"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
            />
          </div>
        </section>


        {/* ════ 1. ĐỊNH NGHĨA ════ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("1. Định Nghĩa", "1. Definition")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Bất phương trình bậc nhất hai ẩn x, y có dạng:", "A linear inequality in two variables x, y has the form:")}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 22, color: "#0B4F5C", textAlign: "center", padding: "16px 0" }}>
              ax + by + c {">"} 0 &nbsp;|&nbsp; ax + by + c {"<"} 0 &nbsp;|&nbsp; ax + by + c ≥ 0 &nbsp;|&nbsp; ax + by + c ≤ 0
            </div>
            <div style={{ fontSize: 15, color: "#777" }}>
              {t("Trong đó a, b, c ∈ ℝ và a, b không đồng thời bằng 0.", "Where a, b, c ∈ ℝ and a, b are not both zero.")}
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, transition: "all 0.3s ease" }}>
            {[
              { label: t("✅ BPT bậc nhất hai ẩn", "✅ Linear inequalities in 2 vars"), items: ["2x + 3y > 6", "x − y ≤ 0", "−x + 2y + 1 ≥ 0"], ok: true },
              { label: t("❌ KHÔNG phải BPT bậc nhất hai ẩn", "❌ NOT linear in 2 vars"), items: ["x² + y > 0  (có x²)", "x + y + z < 1  (3 ẩn)", "2x + 3y = 6  (phương trình)"], ok: false },
            ].map((g, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{g.label}</div>
                {g.items.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 15, color: "#555", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <code style={{ fontFamily: "monospace" }}>{item}</code>
                    <span style={{ fontSize: 12, fontWeight: 700, background: g.ok ? "#eafaf1" : "#fdf2f2", color: g.ok ? "#1e8449" : "#922b21", padding: "2px 10px", borderRadius: 20, marginLeft: 8 }}>{g.ok ? "✓" : "✗"}</span>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        {/* ════ 2. MIỀN NGHIỆM ════ */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("2. Nghiệm và Miền Nghiệm", "2. Solutions and Solution Region")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontWeight: "bold", fontSize: 18, color: "#0B4F5C", marginBottom: 10 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 10 }}>
              {t("Cặp số (x₀, y₀) là nghiệm của BPT ax + by + c > 0 nếu khi thay x = x₀, y = y₀ vào BPT, ta được bất đẳng thức đúng.",
                "A pair (x₀, y₀) is a solution of ax + by + c > 0 if substituting x = x₀, y = y₀ yields a true inequality.")}
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>
              {t("Tập hợp tất cả các nghiệm gọi là miền nghiệm. Miền nghiệm của BPT bậc nhất hai ẩn là một nửa mặt phẳng.",
                "The set of all solutions is called the solution region. For a linear inequality in two variables, it is always a half-plane.")}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>🔑 {t("Nhận xét quan trọng", "Key Observation")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, transition: "all 0.3s ease" }}>
              {[
                { icon: "📏", title: t("Đường biên", "Boundary line"), desc: t("Đường thẳng ax + by + c = 0 là biên chia mp thành 2 nửa.", "Line ax + by + c = 0 is the boundary dividing the plane in 2.") },
                { icon: "🔒", title: t("Đường kín / mở", "Closed / open boundary"), desc: t("Dấu ≥, ≤ → đường biên thuộc miền nghiệm (vẽ liền nét).\nDấu >, < → đường biên không thuộc (vẽ nét đứt).", "≥, ≤ → boundary included (solid line).\n>, < → boundary excluded (dashed line).") },
                { icon: "🎯", title: t("Kiểm tra với O(0,0)", "Test with O(0,0)"), desc: t("Thử gốc tọa độ vào BPT:\n• Thỏa → O thuộc miền nghiệm → tô phía O\n• Không thỏa → tô phía đối diện", "Test origin:\n• Satisfies → shade O's side\n• Fails → shade opposite side") },
              ].map((card, i) => (
                <article key={i} style={{ padding: 16, borderRadius: 10, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 14, color: "#777", whiteSpace: "pre-wrap" }}>{card.desc}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════ 3. BIỂU DIỄN ════ */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📖" title={t("3. Cách Biểu Diễn Miền Nghiệm", "3. Graphing the Solution Region")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#0B4F5C" }}>📋 {t("Các bước thực hiện", "Steps")}</div>
            <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "flex", flexDirection: "column", gap: 12, transition: "all 0.3s ease" }}>
              {[
                { step: "1", text: t("Vẽ đường thẳng d: ax + by + c = 0 (dạng phương trình đường thẳng).", "Draw the line d: ax + by + c = 0.") },
                { step: "2", text: t("Chọn một điểm thử không nằm trên d (thường dùng O(0,0)).", "Choose a test point not on d (usually O(0,0)).") },
                { step: "3", text: t("Thay điểm thử vào BPT:\n• Thỏa → tô màu nửa mp chứa điểm thử\n• Không thỏa → tô màu nửa mp đối diện", "Substitute test point:\n• Satisfies → shade the side containing it\n• Fails → shade the opposite side") },
                { step: "4", text: t("Quy ước vẽ đường biên: liền nét (≥, ≤), nét đứt (>, <).", "Draw boundary: solid line (≥, ≤), dashed line (>, <).") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 32, height: 32, borderRadius: "50%", background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7, paddingTop: 4, whiteSpace: "pre-wrap" }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📘 {t("Ví dụ: Biểu diễn miền nghiệm của 2x + y ≥ 4", "Example: Graph 2x + y ≥ 4")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 15, color: "#555", lineHeight: 1.8 }}>
              <div>① {t("Đường biên: 2x + y = 4. Vẽ liền nét (dấu ≥).", "Boundary: 2x + y = 4. Draw solid (≥).")}</div>
              <div>② {t("Thử O(0,0): 2(0) + 0 = 0 < 4 → không thỏa.", "Test O(0,0): 2(0)+0 = 0 < 4 → fails.")}</div>
              <div>③ {t("Tô màu nửa mặt phẳng không chứa O (phía trên-phải đường biên).", "Shade the half-plane not containing O (above-right of boundary).")}</div>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#eafaf1", borderRadius: 8, color: "#1e8449", fontWeight: 600 }}>
                ✅ {t("Miền tô màu (kể cả đường biên) chính là miền nghiệm.", "The shaded region (including boundary) is the solution region.")}
              </div>
            </div>
          </div>
        </section>

        {/* ════ THỰC HÀNH ════ */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, transition: "all 0.3s ease" }}>
            {[
              {
                id: "e1",
                q: t("Xét xem điểm nào là nghiệm của BPT 3x − 2y > 6:\n(a) A(4, 2)\n(b) B(1, −3)\n(c) C(2, 0)", "Which points satisfy 3x − 2y > 6:\n(a) A(4, 2)\n(b) B(1, −3)\n(c) C(2, 0)"),
                a: [
                  t("(a) 3(4)−2(2)=12−4=8>6 ✓ → A là nghiệm", "(a) 3(4)−2(2)=8>6 ✓ → A is a solution"),
                  t("(b) 3(1)−2(−3)=3+6=9>6 ✓ → B là nghiệm", "(b) 3(1)−2(−3)=9>6 ✓ → B is a solution"),
                  t("(c) 3(2)−2(0)=6, 6>6 sai → C không là nghiệm", "(c) 3(2)−2(0)=6, 6>6 is false → C is not a solution"),
                ]
              },
              {
                id: "e2",
                q: t("Biểu diễn miền nghiệm của BPT: x + 2y ≤ 6", "Graph the solution region of: x + 2y ≤ 6"),
                a: [
                  t("Bước 1: Đường biên x + 2y = 6 (liền nét vì ≤).", "Step 1: Boundary x + 2y = 6 (solid line, ≤)."),
                  t("Bước 2: Thử O(0,0): 0+0 = 0 ≤ 6 ✓ → O thuộc miền nghiệm.", "Step 2: Test O(0,0): 0 ≤ 6 ✓ → O is in the region."),
                  t("Bước 3: Tô màu nửa mặt phẳng chứa O (phía dưới-trái đường biên).", "Step 3: Shade the half-plane containing O (below-left of boundary)."),
                ]
              },
              {
                id: "e3",
                q: t("Trong mặt phẳng Oxy, điểm M(−1, 3) thuộc miền nghiệm của BPT nào?", "In the Oxy plane, which inequality has M(−1, 3) as a solution?"),
                a: [
                  t("Thử với 2x − y + 5 ≥ 0:", "Test with 2x − y + 5 ≥ 0:"),
                  t("2(−1) − 3 + 5 = −2−3+5 = 0 ≥ 0 ✓ → M là nghiệm", "2(−1)−3+5 = 0 ≥ 0 ✓ → M is a solution"),
                  t("Thử x + y − 1 > 0: −1+3−1 = 1 > 0 ✓ → M cũng là nghiệm của BPT này.", "Test x+y−1>0: −1+3−1=1>0 ✓ → M is also a solution of this one."),
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

        {/* ════ MINI GAME ════ */}
        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎮" title={t("Mini Game", "Mini Game")} />

          {/* mode picker */}
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s ease" }}>
            {[["mc", "🧩", t("Trắc Nghiệm", "Multiple Choice"), t("5 câu hỏi", "5 questions")], ["tf", "🃏", t("Đúng / Sai", "True / False"), t("5 thẻ", "5 cards")], ["fill", "✍️", t("Điền Chỗ Trống", "Fill in Blank"), t("3 câu", "3 items")]].map(([mode, icon, label, sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background: gameMode === mode ? "black" : "#f9f9f9", color: gameMode === mode ? "white" : "black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

          {/* ── MULTIPLE CHOICE ── */}
          {gameMode === "mc" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!mcDone ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 8 }}>{t("Câu", "Q")} {mcIndex + 1}/{mcQuestions.length} · {t("Điểm:", "Score:")} {mcScore}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{mcQuestions[mcIndex].q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mcQuestions[mcIndex].options.map((opt, i) => {
                      let bg = "white", color = "black";
                      if (mcSelected !== null) {
                        if (i === mcQuestions[mcIndex].answer) { bg = "#eafaf1"; color = "#1e8449"; }
                        else if (i === mcSelected) { bg = "#fdf2f2"; color = "#922b21"; }
                      }
                      return <button key={i} onClick={() => handleMcSelect(i)} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 10, border: "none", background: bg, color, fontSize: 15, fontWeight: mcSelected !== null && (i === mcSelected || i === mcQuestions[mcIndex].answer) ? 600 : 400, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
                    })}
                  </div>
                  {mcSelected !== null && (
                    <>
                      <div style={{ marginTop: 16, padding: "12px 16px", background: "white", borderRadius: 8, fontSize: 15, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {mcQuestions[mcIndex].explain}</div>
                      <button onClick={handleMcNext} style={{ marginTop: 14, padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                        {mcIndex + 1 < mcQuestions.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <ResultSummary
                  items={mcResultItems}
                  onReset={resetMc}
                  scoreLabel={mcScore === mcQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : mcScore >= 3 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")}
                />
              )}
            </div>
          )}

          {/* ── TRUE / FALSE ── */}
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
                      <>
                        <div style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 8, fontSize: 15, color: "#555", textAlign: "left", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {tfCards[tfIndex].explain}</div>
                        <button onClick={handleTfNext} style={{ padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                          {tfIndex + 1 < tfCards.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}
                        </button>
                      </>
                    )}
                  </article>
                </>
              ) : (
                <ResultSummary
                  items={tfResultItems}
                  onReset={resetTf}
                  scoreLabel={tfScore === tfCards.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : t("Cố gắng thêm! 💪", "Keep going! 💪")}
                />
              )}
            </div>
          )}

          {/* ── FILL IN BLANK ── */}
          {gameMode === "fill" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!fillChecked ? (
                <>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời vào chỗ trống", "Fill in each blank")}</div>
                  {fillQuestions.map((q, qi) => (
                    <div key={q.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>{t("Câu", "Q")} {qi + 1}</div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.template}</div>
                      <input
                        value={fillAnswers[q.id] || ""}
                        onChange={(e) => setFillAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                        placeholder={t("Nhập đáp án...", "Enter answer...")}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none", border: "1px solid #ddd", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                  <button onClick={() => setFillChecked(true)} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                    {t("Kiểm tra", "Check Answers")}
                  </button>
                </>
              ) : (
                <>
                  <ResultSummary
                    items={fillResultItems}
                    onReset={() => { setFillAnswers({}); setFillChecked(false); }}
                    scoreLabel={fillScore === fillQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fillScore >= 2 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")}
                  />
                </>
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>
          Toán 10 · Chân Trời Sáng Tạo · {t("Bài 4 / Chương II", "Lesson 4 / Chapter II")}
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
