"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { resetTimer, getTimeSpent, formatTime } from "../../utils/testTimer";
import { clearAllAnswers } from "../../utils/answerStorage";
import { SKILL_DEFS } from "../../utils/questionSkills";

const SHAPES = [
  { size: 120, left: "5%",  top: "10%", delay: "0s",   dur: "18s", shape: "pyramid",  color: "#00c8ff" },
  { size: 85,  left: "80%", top: "12%", delay: "3s",   dur: "22s", shape: "cube",     color: "#a78bfa" },
  { size: 70,  left: "55%", top: "62%", delay: "6s",   dur: "15s", shape: "diamond",  color: "#38bdf8" },
  { size: 95,  left: "18%", top: "68%", delay: "1.5s", dur: "20s", shape: "triangle", color: "#818cf8" },
  { size: 60,  left: "88%", top: "52%", delay: "4s",   dur: "17s", shape: "pyramid",  color: "#67e8f9" },
];
function ShapesSVG({ shape, color }) {
  if (shape === "pyramid")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  if (shape === "cube")     return <svg viewBox="0 0 100 100" fill="none"><rect x="15" y="15" width="55" height="55" stroke={color} strokeWidth="2" fill={color+"18"}/><rect x="30" y="30" width="55" height="55" stroke={color} strokeWidth="1.5" fill="none"/><line x1="15" y1="15" x2="30" y2="30" stroke={color} strokeWidth="1.5"/><line x1="70" y1="15" x2="85" y2="30" stroke={color} strokeWidth="1.5"/><line x1="15" y1="70" x2="30" y2="85" stroke={color} strokeWidth="1.5"/><line x1="70" y1="70" x2="85" y2="85" stroke={color} strokeWidth="1.5"/></svg>;
  if (shape === "diamond")  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,50 50,95 5,50" stroke={color} strokeWidth="2" fill={color+"18"}/></svg>;
  return <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,90 5,90" stroke={color} strokeWidth="2" fill="none"/><line x1="50" y1="5" x2="50" y2="90" stroke={color} strokeWidth="1" opacity="0.5"/></svg>;
}

export default function PageKetQua() {
  const { user, saveTestResult } = useAuth();
  const [result, setResult] = useState(null);
  const [timeSpent, setTimeSpent] = useState("00:00:00");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [examId, setExamId] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("currentTest") || "reading-test-1"
      : "reading-test-1"
  );
  const [feedback, setFeedback] = useState("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // ================= LOAD RESULT =================
  useEffect(() => {
    const data = localStorage.getItem("readingTest_result");
    if (data) {
      const parsed = JSON.parse(data);
      setResult(parsed);
      const exam = parsed.testId || localStorage.getItem("currentTest") || "reading-test-1";
      setExamId(exam);
      const savedTime = parsed.timeSpent ?? (Number(localStorage.getItem("timeSpent")) || getTimeSpent(exam));
      if (!Number.isNaN(Number(savedTime))) setTimeSpent(formatTime(Number(savedTime)));
      resetTimer(exam);
    }
  }, []);

  // ================= SAVE TO BACKEND =================
  useEffect(() => {
    if (!user || !result || result.isSaved) return;

    const exam = result.testId || examId || "reading-test-1";
    const savedTime = result.timeSpent ?? (Number(localStorage.getItem("timeSpent")) || 0);
    const sections = ["section1", "section2", "section3"];
    let anySaved = false;

    const statsBySection = {};
    sections.forEach(sec => {
      const secQs = (result.questions || []).filter(q => q.section === sec);
      if (secQs.length > 0) {
        const score = secQs.filter(q => q.isCorrect).length;
        const total = secQs.length;
        const answers = {};
        secQs.forEach(q => {
          answers[q.key] = q.userAnswer || "";
        });
        statsBySection[sec] = { score, total, answers };
      }
    });

    const saveAll = async () => {
      for (const sec of sections) {
        if (statsBySection[sec]) {
          const { score, total, answers } = statsBySection[sec];
          try {
            await saveTestResult({
              test_key: exam,
              section: sec,
              score,
              total,
              answers,
              time_spent: savedTime
            });
            anySaved = true;
          } catch (err) {
            console.error(`Failed to save test result for ${sec}:`, err);
          }
        }
      }

      if (anySaved) {
        const updatedResult = { ...result, isSaved: true };
        setResult(updatedResult);
        localStorage.setItem("readingTest_result", JSON.stringify(updatedResult));
      }
    };

    saveAll();
  }, [user, result, examId, saveTestResult]);

  // ================= SCORE ANIMATION =================
  useEffect(() => {
    if (!result) return;
    let start = 0;
    const end = result.score || 0;
    const duration = 800;
    const stepTime = 20;
    const increment = end / (duration / stepTime);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { start = end; clearInterval(timer); }
      setAnimatedScore(start.toFixed(1));
    }, stepTime);
    return () => clearInterval(timer);
  }, [result]);

  // ================= AI FEEDBACK =================
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!result) return;
      try {
        setIsLoadingFeedback(true);
        setFeedbackError("");
        const res = await fetch("/api/learning-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result }),
        });
        if (!res.ok) { setFeedbackError("Không thể tạo gợi ý ôn tập tự động."); return; }
        const data = await res.json();
        setFeedback(data.feedback || "");
      } catch (err) {
        setFeedbackError("Đã xảy ra lỗi khi gọi AI feedback.");
      } finally {
        setIsLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, [result]);

  // ================= AUTO SCROLL FIRST WRONG =================
  useEffect(() => {
    if (!result) return;
    const firstWrongIndex = result.questions?.findIndex((q) => !q.isCorrect && !q.isSkipped);
    if (firstWrongIndex >= 0) {
      setTimeout(() => {
        document.getElementById(`question-${firstWrongIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }
  }, [result, reviewMode]);

  if (!result) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a1a", color: "#7dd3fc", fontSize: 18, fontWeight: 600 }}>
        Đang tải kết quả...
      </div>
    );
  }

  const { correct = 0, wrong = 0, skipped = 0, total = 0, accuracy = 0, skills = [], weakSkills = [], questions = [] } = result;

  const getAnswerBorderColor = (q) => {
    if (q.isSkipped) return "#f0a500";
    if (q.isCorrect) return "#22a55a";
    return "#e53e3e";
  };
  const getAnswerBg = (q) => {
    if (q.isSkipped) return "#fffbea";
    if (q.isCorrect) return "#f0faf5";
    return "#fff5f5";
  };

  const startNewTest = () => {
    const exam = examId || localStorage.getItem("currentTest") || "reading-test-1";
    localStorage.removeItem("readingTest_result");
    localStorage.removeItem("timeSpent");
    localStorage.removeItem("lastTimeSpent");
    clearAllAnswers(exam);
    resetTimer(exam);
    window.location.href = "/";
  };

  return (
    <div style={{ width: "100%", background: "#0a0a1a", display: "flex", justifyContent: "center", minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Floating shapes */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {SHAPES.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.5, filter: `drop-shadow(0 0 12px ${s.color}88)`, animation: `floatShape ${s.dur} ${s.delay} ease-in-out infinite alternate` }}>
            <ShapesSVG shape={s.shape} color={s.color} />
          </div>
        ))}
      </div>

      <div style={{ width: "1200px", maxWidth: "95%", color: "white", paddingTop: 60, paddingBottom: 80, position: "relative", zIndex: 1 }}>

        {/* TITLE */}
        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 8, letterSpacing: 1, textAlign: "center" }}>
          Kết quả bài làm
        </h1>
        <p style={{ color: "#93c5fd", fontSize: 16, marginBottom: 40, textAlign: "center" }}>
          Xem lại kết quả và gợi ý học tập của bạn bên dưới.
        </p>

        {/* SCORE HERO */}
        <div style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 32px rgba(0,180,255,0.12)",
          padding: "40px 48px",
          textAlign: "center",
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 16, color: "#93c5fd", marginBottom: 8 }}>Điểm số của bạn</div>
          <div style={{ fontSize: 72, fontWeight: "bold", color: "#7dd3fc", lineHeight: 1 }}>{animatedScore}</div>
          <div style={{ marginTop: 16, color: "#bae6fd", fontSize: 16 }}>
            ⏱ Thời gian: <strong>{timeSpent}</strong> &nbsp;|&nbsp; 🎯 Độ chính xác: <strong>{accuracy}%</strong>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
          {[
            { label: "✅ Đúng", value: correct, color: "#34d399", border: "rgba(52,211,153,0.3)" },
            { label: "❌ Sai", value: wrong, color: "#f87171", border: "rgba(248,113,113,0.3)" },
            { label: "⏭ Bỏ qua", value: skipped, color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(10px)",
              borderRadius: 12,
              border: `1px solid ${stat.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              padding: "28px 24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 15, color: "#93c5fd", marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 44, fontWeight: "bold", color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>/ {total} câu</div>
            </div>
          ))}
        </div>

        {/* REVIEW TOGGLE */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            onClick={() => setReviewMode(!reviewMode)}
            style={{
              background: reviewMode ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              padding: "12px 36px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {reviewMode ? "Ẩn đáp án" : "Xem chi tiết bài làm"}
          </button>
        </div>

        {/* ANSWER REVIEW */}
        {reviewMode && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {questions.map((q, i) => (
              <div
                key={i}
                id={`question-${i}`}
                style={{
                  borderLeft: `4px solid ${getAnswerBorderColor(q)}`,
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 10,
                  padding: "16px 20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p style={{ fontWeight: 600, color: "white", marginBottom: 6 }}>Câu {i + 1}</p>
                <p style={{ color: "#93c5fd", marginBottom: 4 }}>Trả lời: <strong>{q.userAnswer || "—"}</strong></p>
                {!q.isCorrect && (
                  <p style={{ color: "#f87171" }}>Đáp án đúng: <strong>{q.correctAnswer}</strong></p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WEAK SKILLS */}
        {weakSkills.length > 0 && (
          <div style={{
            background: "rgba(248,113,113,0.08)",
            backdropFilter: "blur(10px)",
            borderRadius: 12,
            border: "1px solid rgba(248,113,113,0.25)",
            padding: 28,
            marginBottom: 32,
            borderLeft: "4px solid #f87171",
          }}>
            <p style={{ fontWeight: "bold", color: "#f87171", marginBottom: 16, fontSize: 17 }}>
              🔴 Kỹ năng cần cải thiện
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {weakSkills.map((skill) => (
                <div key={skill.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontWeight: 600, color: "white" }}>{skill.name}</span>
                  <span style={{ color: "#f87171", fontWeight: 700 }}>{skill.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI FEEDBACK */}
        <div style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow: "0 4px 24px rgba(0,180,255,0.08)",
          padding: 28,
          marginBottom: 48,
        }}>
          <p style={{ fontWeight: "bold", color: "#7dd3fc", fontSize: 17, marginBottom: 16 }}>
            🤖 Gợi ý học tập từ AI
          </p>
          {isLoadingFeedback && (
            <p style={{ color: "#93c5fd", fontStyle: "italic" }}>Đang tạo nhận xét...</p>
          )}
          {feedbackError && (
            <p style={{ color: "#f87171" }}>{feedbackError}</p>
          )}
          {!isLoadingFeedback && !feedbackError && (
            <div style={{ whiteSpace: "pre-wrap", fontSize: 15, color: "#bae6fd", lineHeight: 1.8 }}>
              {feedback || "Chưa có phản hồi."}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Link href="/xem-dap-an" style={{ textDecoration: "none" }}>
            <button style={{
              background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              transition: "opacity 0.2s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Xem đáp án
            </button>
          </Link>

          <button
            onClick={startNewTest}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: 10,
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          >
            Làm bài mới
          </button>
        </div>

        <style jsx>{`
          @keyframes floatShape {
            0%   { transform: translateY(0px) rotate(0deg); }
            50%  { transform: translateY(-28px) rotate(8deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
