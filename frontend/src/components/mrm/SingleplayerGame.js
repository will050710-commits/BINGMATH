/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMathMapStore } from "@/context/MathMapStore";
import { useAuth } from "@/context/authContext";

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_MATHMAPS = {
  mm001: {
    title: "Phương trình bậc hai nâng cao",
    title_en: "Advanced Quadratic Equations",
    bgm: "Dramatic Theme",
    difficulty_fmp: 7.8,
    thumbnail_color: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    icon: "📐",
    questions: [
      {
        id: "q1",
        text: "Phương trình x² - 5x + 6 = 0 có các nghiệm là:",
        options: ["x = 2 và x = 3", "x = 1 và x = 6", "x = -2 và x = -3", "x = 2 và x = -3"],
        correct: 0,
        explain: "Δ = 25 - 24 = 1 > 0. x₁ = (5+1)/2 = 3, x₂ = (5-1)/2 = 2",
      },
      {
        id: "q2",
        text: "Phương trình 2x² - 7x + 3 = 0 có tổng các nghiệm là:",
        options: ["3/2", "7/2", "3", "7"],
        correct: 1,
        explain: "Theo Vieta: x₁ + x₂ = -b/a = 7/2",
      },
      {
        id: "q3",
        text: "Phương trình x² + 4x + 4 = 0 có bao nhiêu nghiệm?",
        options: ["0 nghiệm", "1 nghiệm kép", "2 nghiệm phân biệt", "Vô số nghiệm"],
        correct: 1,
        explain: "Δ = 16 - 16 = 0 → nghiệm kép x = -b/2a = -2",
      },
      {
        id: "q4",
        text: "Tích các nghiệm của 3x² - 5x - 2 = 0 là:",
        options: ["-2/3", "5/3", "2/3", "-5/3"],
        correct: 0,
        explain: "Theo Vieta: x₁ · x₂ = c/a = -2/3",
      },
      {
        id: "q5",
        text: "Phương trình nào sau đây vô nghiệm?",
        options: ["x² - 4 = 0", "x² + 4 = 0", "x² - 4x + 3 = 0", "x² - 2x - 3 = 0"],
        correct: 1,
        explain: "x² + 4 = 0 có Δ = -16 < 0 nên vô nghiệm trong ℝ",
      },
    ],
  },
  mm002: {
    title: "Hình học phẳng cơ bản",
    title_en: "Basic Plane Geometry",
    bgm: "Calm Study",
    difficulty_fmp: 4.2,
    thumbnail_color: "linear-gradient(135deg, #10b981, #059669)",
    icon: "📏",
    questions: [
      {
        id: "q1",
        text: "Tổng các góc trong một tam giác bằng:",
        options: ["90°", "180°", "270°", "360°"],
        correct: 1,
        explain: "Tổng 3 góc trong bất kỳ tam giác nào luôn bằng 180°",
      },
      {
        id: "q2",
        text: "Diện tích hình tròn bán kính r là:",
        options: ["2πr", "πr²", "πr", "2πr²"],
        correct: 1,
        explain: "S = πr² là công thức diện tích hình tròn",
      },
      {
        id: "q3",
        text: "Trong tam giác vuông, sin(30°) =",
        options: ["√3/2", "1/2", "√2/2", "1"],
        correct: 1,
        explain: "sin(30°) = 1/2 là giá trị lượng giác cơ bản cần nhớ",
      },
    ],
  },
};

// Default fallback for unknown map IDs
const DEFAULT_MAP = {
  title: "MathMap",
  title_en: "Practice Set",
  bgm: "Chill Lofi",
  difficulty_fmp: 5.0,
  thumbnail_color: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
  icon: "📚",
  questions: [
    {
      id: "q1",
      text: "1 + 1 = ?",
      options: ["1", "2", "3", "4"],
      correct: 1,
      explain: "1 + 1 = 2 — câu hỏi cơ bản nhất!",
    },
  ],
};

const MAX_HP = 5;
const TIME_PER_QUESTION = 30; // seconds

export default function SingleplayerGame({ mapId }) {
  const { saveLeaderboardScore, maps, hydrated } = useMathMapStore();
  const { user } = useAuth();

  let mapData = (hydrated && maps.find(m => m.id === mapId)) || MOCK_MATHMAPS[mapId] || DEFAULT_MAP;
  if (!mapData.questions || mapData.questions.length === 0) {
    mapData = MOCK_MATHMAPS[mapId] || DEFAULT_MAP;
  }
  const { questions } = mapData;

  const [phase, setPhase] = useState("intro"); // intro | playing | result
  const [currentQ, setCurrentQ] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplain, setShowExplain] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [answers, setAnswers] = useState([]); // { correct, time }
  const [swapUsed, setSwapUsed] = useState(false);
  const [lastPoints, setLastPoints] = useState(null); // for animation

  const timerRef = useRef(null);
  const router = useRouter();

  const question = questions[currentQ];
  const isLastQ = currentQ === questions.length - 1;

  // Save score to leaderboard when game ends
  useEffect(() => {
    if (phase === "result") {
      const correctCount = answers.filter(a => a.correct).length;
      const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
      
      const username = user?.username || user?.email?.split("@")[0] || "Người chơi";
      const grade = user?.grade || "Lớp 11";
      
      saveLeaderboardScore(mapId, username, grade, score, accuracy, maxCombo);
    }
  }, [phase, answers, score, maxCombo, user, mapId, saveLeaderboardScore]);

  // ─── Timer ───────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time out → treat as wrong answer
          handleAnswer(-1, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentQ]); // eslint-disable-line

  useEffect(() => {
    if (phase === "playing") startTimer();
    return () => clearInterval(timerRef.current);
  }, [phase, currentQ]); // eslint-disable-line

  // ─── Answer handling ─────────────────────────────────────────────────────
  const handleAnswer = (optionIdx, timeout = false) => {
    if (selected !== null || showExplain) return;
    clearInterval(timerRef.current);
    const isCorrect = !timeout && optionIdx === question.correct;
    setSelected(optionIdx === -1 ? null : optionIdx);
    setShowExplain(true);

    const timeBonus = Math.floor(timeLeft * 3);
    const newCombo = isCorrect ? combo + 1 : 0;
    const comboBonus = isCorrect ? newCombo * 10 : 0;
    const pts = isCorrect ? (100 + timeBonus + comboBonus) : 0;

    setAnswers(prev => [...prev, { correct: isCorrect, time: TIME_PER_QUESTION - timeLeft, points: pts }]);

    if (isCorrect) {
      setScore(prev => prev + pts);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setLastPoints(`+${pts}`);
      setTimeout(() => setLastPoints(null), 1200);
    } else {
      setCombo(0);
      const newHp = hp - 1;
      setHp(newHp);
      if (newHp <= 0) {
        // Game over
        setTimeout(() => setPhase("result"), 1200);
        return;
      }
    }

    // Auto-advance after 1.5s
    setTimeout(() => {
      if (isLastQ || (!isCorrect && hp <= 1)) {
        setPhase("result");
      } else {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setShowExplain(false);
      }
    }, 1500);
  };

  const handleSwap = () => {
    if (swapUsed || selected !== null) return;
    setSwapUsed(true);
    // Skip current question (treat as pass)
    clearInterval(timerRef.current);
    if (isLastQ) {
      setPhase("result");
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplain(false);
    }
  };

  // ─── Render: Intro ───────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", color: "white",
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 20,
          background: mapData.thumbnail_color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, marginBottom: 20,
          boxShadow: "0 8px 32px rgba(34,211,238,0.3)",
          animation: "floatIn 0.5s ease-out both",
        }}>
          {mapData.icon}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>
          {mapData.title}
        </h1>
        <p style={{ fontSize: 14, color: "#93c5fd", marginBottom: 4 }}>{mapData.title_en}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 30 }}>
          🎵 BGM: {mapData.bgm} · {questions.length} câu · {TIME_PER_QUESTION}s/câu
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "❤️", label: `${MAX_HP} tim`, color: "#f87171" },
            { icon: "⏱", label: `${TIME_PER_QUESTION}s/câu`, color: "#fbbf24" },
            { icon: "🃏", label: "1 Swap Card", color: "#a78bfa" },
            { icon: "💎", label: "Combo bonus", color: "#22d3ee" },
          ].map(f => (
            <div key={f.label} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, fontSize: 13, color: f.color,
            }}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>

        <button
          onClick={() => setPhase("playing")}
          style={{
            padding: "16px 56px", borderRadius: 12, fontSize: 16, fontWeight: 800,
            background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
            border: "none", color: "#000", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(34,211,238,0.5)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          ▶ Bắt đầu
        </button>

        <Link href="/mrm/singleplayer" style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← Quay lại danh sách
        </Link>

        <style>{`
          @keyframes floatIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // ─── Render: Result ──────────────────────────────────────────────────────
  if (phase === "result") {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
    const grade = accuracy >= 90 ? "S" : accuracy >= 70 ? "A" : accuracy >= 50 ? "B" : "C";
    const gradeColor = grade === "S" ? "#fbbf24" : grade === "A" ? "#22d3ee" : grade === "B" ? "#a78bfa" : "#f87171";

    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", color: "white", padding: 24,
      }}>
        {/* Grade badge */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: `radial-gradient(circle, ${gradeColor}33, ${gradeColor}11)`,
          border: `3px solid ${gradeColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, fontWeight: 900, color: gradeColor,
          marginBottom: 16,
          boxShadow: `0 0 32px ${gradeColor}55`,
        }}>{grade}</div>

        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          {accuracy >= 90 ? "Xuất sắc! 🎉" : accuracy >= 70 ? "Tốt lắm! 👍" : accuracy >= 50 ? "Cố gắng hơn nhé 💪" : "Chưa ổn, thử lại! 😅"}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
          {mapData.title}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28, width: "100%", maxWidth: 480 }}>
          {[
            { label: "Điểm", value: score.toLocaleString(), color: "#fbbf24", icon: "💎" },
            { label: "Đúng", value: `${correctCount}/${answers.length}`, color: "#4ade80", icon: "✅" },
            { label: "Combo", value: `x${maxCombo}`, color: "#22d3ee", icon: "⚡" },
            { label: "Độ chính xác", value: `${accuracy}%`, color: "#a78bfa", icon: "🎯" },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: "center", padding: "16px 8px",
              background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Answer review */}
        <div style={{
          width: "100%", maxWidth: 480, marginBottom: 24,
          background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
            Chi tiết từng câu
          </div>
          {answers.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
              borderBottom: i < answers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <span style={{ fontSize: 16 }}>{a.correct ? "✅" : "❌"}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1 }}>Câu {i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: a.correct ? "#4ade80" : "#f87171" }}>
                {a.correct ? `+${a.points}` : "0"} điểm
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a.time}s</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              setPhase("intro");
              setCurrentQ(0);
              setHp(MAX_HP);
              setScore(0);
              setCombo(0);
              setMaxCombo(0);
              setSelected(null);
              setShowExplain(false);
              setAnswers([]);
              setSwapUsed(false);
            }}
            style={{
              padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
              border: "none", color: "#000", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(34,211,238,0.4)",
            }}
          >
            🔄 Chơi lại
          </button>
          <Link href="/mrm/singleplayer">
            <button style={{
              padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "white", cursor: "pointer",
            }}>
              ← Danh sách
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Render: Playing ─────────────────────────────────────────────────────
  const timerFrac = timeLeft / TIME_PER_QUESTION;
  const timerColor = timerFrac > 0.5 ? "#22d3ee" : timerFrac > 0.25 ? "#fbbf24" : "#ef4444";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(135deg, #020617, #0a0a1a)",
      fontFamily: "'Inter', sans-serif", color: "white",
    }}>
      {/* ─── TOP BAR ─── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* HP */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {Array.from({ length: MAX_HP }).map((_, i) => (
            <span key={i} style={{
              fontSize: 18,
              filter: i < hp ? "none" : "grayscale(1) opacity(0.25)",
              transition: "filter 0.3s",
            }}>❤️</span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Map name */}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
          {mapData.icon} {mapData.title}
        </div>

        <div style={{ flex: 1 }} />

        {/* Score & Combo */}
        <div style={{ textAlign: "right", position: "relative" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24" }}>
            {score.toLocaleString()}
            {lastPoints && (
              <span style={{
                position: "absolute", top: -16, right: 0,
                color: "#22d3ee", fontSize: 14, fontWeight: 700,
                animation: "scoreFloat 1.2s ease-out forwards",
              }}>{lastPoints}</span>
            )}
          </div>
          {combo > 1 && (
            <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700 }}>
              ⚡ x{combo} COMBO
            </div>
          )}
        </div>
      </div>

      {/* ─── PROGRESS BAR ─── */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", position: "relative" }}>
        <div style={{
          height: "100%", width: `${((currentQ) / questions.length) * 100}%`,
          background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* ─── MAIN GAME AREA ─── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "24px 20px", maxWidth: 680, margin: "0 auto", width: "100%",
      }}>
        {/* Question counter + Timer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            Câu {currentQ + 1} / {questions.length}
          </span>

          {/* Circular timer */}
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="26" cy="26" r="22" fill="none"
                stroke={timerColor} strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerFrac)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: timerColor,
            }}>{timeLeft}</div>
          </div>

          {/* Swap Card */}
          <button
            onClick={handleSwap}
            disabled={swapUsed || selected !== null}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: swapUsed ? "rgba(255,255,255,0.04)" : "rgba(167,139,250,0.12)",
              border: swapUsed ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(167,139,250,0.35)",
              color: swapUsed ? "rgba(255,255,255,0.2)" : "#a78bfa",
              cursor: swapUsed ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            🃏 {swapUsed ? "Đã dùng" : "Swap"}
          </button>
        </div>

        {/* Question text */}
        <div style={{
          width: "100%", background: "rgba(15,23,42,0.7)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "22px 24px", marginBottom: 20,
          fontSize: 17, fontWeight: 600, lineHeight: 1.6, textAlign: "center",
        }}>
          {question.text}
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
          {question.options.map((opt, i) => {
            let bg = "rgba(15,23,42,0.7)";
            let border = "rgba(255,255,255,0.08)";
            let color = "white";

            if (showExplain) {
              if (i === question.correct) {
                bg = "rgba(34,197,94,0.15)"; border = "rgba(34,197,94,0.5)"; color = "#4ade80";
              } else if (i === selected && i !== question.correct) {
                bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.5)"; color = "#f87171";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showExplain}
                style={{
                  padding: "14px 16px", borderRadius: 10, fontSize: 14,
                  fontWeight: selected === i || (showExplain && i === question.correct) ? 700 : 400,
                  background: bg, border: `2px solid ${border}`, color,
                  cursor: showExplain ? "default" : "pointer",
                  transition: "all 0.2s", textAlign: "left",
                }}
                onMouseEnter={e => { if (!showExplain) e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)"; }}
                onMouseLeave={e => { if (!showExplain) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginRight: 6 }}>
                  {["A", "B", "C", "D"][i]}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplain && (
          <div style={{
            marginTop: 16, width: "100%", padding: "14px 18px",
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.2)",
            borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6,
            animation: "fadeIn 0.3s ease-out both",
          }}>
            <span style={{ color: "#22d3ee", fontWeight: 700 }}>💡 Giải thích: </span>
            {question.explain}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scoreFloat {
          from { transform: translateY(0); opacity: 1; }
          to   { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
