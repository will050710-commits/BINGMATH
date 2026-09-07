/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMathMapStore } from "@/context/MathMapStore";
import { useAuth } from "@/context/authContext";
import { MOCK_MATHMAPS } from "@/data/mockMathmaps";
import { CoinStoreProvider, useCoinStore } from "@/context/CoinStore";
import WagerModal from "@/components/mrm/WagerModal";
import NearMissEffect from "@/components/mrm/NearMissEffect";
import MysteryChestModal from "@/components/mrm/MysteryChestModal";
import { auth } from "@/lib/firebase";

const _BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

async function _apiPost(path, body) {
  const hdrs = { "Content-Type": "application/json" };
  const cu = auth?.currentUser;
  if (cu) { try { hdrs["Authorization"] = `Bearer ${await cu.getIdToken(true)}`; } catch (_) {} }
  try {
    const res = await fetch(`${_BACKEND}${path}`, { method: "POST", headers: hdrs, body: JSON.stringify(body) });
    return res.json().catch(() => ({}));
  } catch (_) { return {}; }
}

// ── BGM synthesizer ──────────────────────────────────────────────────────────
function useBgmPlayer(bgmId, customBgmUrl) {
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const audioElRef = useRef(null);

  useEffect(() => {
    // Clean up previous
    oscillatorsRef.current.forEach(o => { try { o.stop(); } catch(e) {} });
    oscillatorsRef.current = [];
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }

    if (customBgmUrl) {
      // Play custom MP3 from base64 data URL
      const audio = new Audio(customBgmUrl);
      audio.loop = true;
      audio.volume = 0.35;
      audio.play().catch(() => {});
      audioElRef.current = audio;
      return;
    }

    if (!bgmId || bgmId === 'none') return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(ctx.destination);

      // BGM patterns by ID
      const patterns = {
        dramatic01: [261.6, 329.6, 392, 523.3],
        electronic01: [440, 550, 660, 880],
        calm01: [220, 277.2, 329.6, 369.9],
        boss01: [110, 138.6, 164.8, 220],
        lofi01: [196, 220, 246.9, 261.6],
      };
      const freqs = patterns[bgmId] || patterns.calm01;
      let time = ctx.currentTime;

      const scheduleNotes = () => {
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = bgmId === 'boss01' ? 'sawtooth' : bgmId === 'electronic01' ? 'square' : 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, time + i * 0.5);
          gain.gain.linearRampToValueAtTime(0.6, time + i * 0.5 + 0.05);
          gain.gain.linearRampToValueAtTime(0, time + i * 0.5 + 0.45);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(time + i * 0.5);
          osc.stop(time + i * 0.5 + 0.5);
          oscillatorsRef.current.push(osc);
        });
        time += freqs.length * 0.5;
      };

      // Schedule 8 loops
      for (let loop = 0; loop < 8; loop++) scheduleNotes();
    } catch(e) {}

    return () => {
      oscillatorsRef.current.forEach(o => { try { o.stop(); } catch(e) {} });
      oscillatorsRef.current = [];
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, [bgmId, customBgmUrl]);
}

// ── Background image layer ────────────────────────────────────────────────────
function MapBgLayer({ bgImageUrl, bgOpacity }) {
  if (!bgImageUrl) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: `url(${bgImageUrl})`,
      backgroundSize: "cover", backgroundPosition: "center",
      opacity: typeof bgOpacity === "number" ? bgOpacity : 0.3,
      transition: "opacity 0.5s",
    }} />
  );
}


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

function SingleplayerGameInner({ mapId }) {
  const { saveLeaderboardScore, maps, hydrated } = useMathMapStore();
  const { user } = useAuth();
  const { earnCoins, refreshCoins } = useCoinStore();

  let mapData = (hydrated && maps.find(m => m.id === mapId)) || MOCK_MATHMAPS[mapId] || DEFAULT_MAP;
  if (!mapData.questions || mapData.questions.length === 0) {
    mapData = MOCK_MATHMAPS[mapId] || DEFAULT_MAP;
  }
  
  const rawQuestions = mapData.questions || [];

  // Normalize questions from both mock seed format and user-created format
  const questions = rawQuestions.map((q, idx) => {
    // If it's already in the mock format:
    if (q.text && Array.isArray(q.options) && typeof q.options[0] === 'string' && typeof q.correct === 'number') {
      return {
        id: q.id || `q-${idx}`,
        type: 'multiple_choice',
        text: q.text,
        options: q.options,
        correct: q.correct,
        explain: q.explain || '',
        points: q.points || 100,
        timeLimit: q.time_seconds || 30,
      };
    }
    
    // Otherwise, normalize from user-created format:
    const type = q.type || 'multiple_choice';
    const text = q.content_vi || q.content_en || 'Câu hỏi chưa có nội dung';
    const explain = q.explanation_vi || q.explanation_en || '';
    const points = q.points || 100;
    const timeLimit = q.time_seconds || 30;

    if (type === 'multiple_choice') {
      const opts = Array.isArray(q.options)
        ? q.options.map(o => o.text_vi || o.text_en || '')
        : ['', '', '', ''];
      const correctMap = { a: 0, b: 1, c: 2, d: 3 };
      const correct = correctMap[(q.correct_answer || 'a').toLowerCase()] ?? 0;
      return { id: q.id, type, text, options: opts, correct, explain, points, timeLimit };
    } else if (type === 'true_false') {
      const opts = ['Đúng (True)', 'Sai (False)'];
      const correct = q.correct_answer === 'true' ? 0 : 1;
      return { id: q.id, type, text, options: opts, correct, explain, points, timeLimit };
    } else if (type === 'fill_in_blank') {
      return {
        id: q.id,
        type,
        text,
        options: [],
        correctAnswerText: (q.correct_answer || '').trim(),
        explain,
        points,
        timeLimit,
      };
    }
    return { id: q.id, type: 'multiple_choice', text, options: ['', '', '', ''], correct: 0, explain, points, timeLimit };
  });

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
  const [blankInput, setBlankInput] = useState(""); // text input for fill_in_blank questions

  // ── Gamification v2 states ──
  const [showWager, setShowWager] = useState(false);
  const [wagerConfig, setWagerConfig] = useState(null); // { wager, multiplier, safeReward }
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [nearMissQuestion, setNearMissQuestion] = useState(null);
  const [nearMissAnswer, setNearMissAnswer] = useState(null);
  const [showChest, setShowChest] = useState(false);
  const [lastWrongIdx, setLastWrongIdx] = useState(null);
  const [x2TokenActive, setX2TokenActive] = useState(false);

  const timerRef = useRef(null);
  const router = useRouter();

  // Read user-chosen opacity from listing slider (stored in localStorage)
  const [activeBgOpacity] = useState(() => {
    try {
      const stored = localStorage.getItem("duomath_bg_opacity");
      if (stored !== null) {
        const val = parseFloat(stored);
        // Clear it so it doesn't persist unexpectedly
        localStorage.removeItem("duomath_bg_opacity");
        return isNaN(val) ? (mapData.bgOpacity ?? 0.3) : val;
      }
    } catch(e) {}
    return mapData.bgOpacity ?? 0.3;
  });

  // Start BGM when playing phase begins
  useBgmPlayer(
    phase === 'playing' ? (mapData.bgmId || null) : null,
    phase === 'playing' ? (mapData.bgm_url || mapData.bgmFile || null) : null
  );

  const question = questions[currentQ];  // ─── Read keybind from localStorage (set in MRM Settings) ────────────────
  const pauseKey = useRef("Escape");
  useEffect(() => {
    try {
      const k = localStorage.getItem("duomath_pause_key");
      if (k) pauseKey.current = k;
    } catch(e) {}
  }, []);

  const [isPaused, setIsPaused] = useState(false);

  // Toggle pause with keybind
  useEffect(() => {
    const handleKey = (e) => {
      if (phase !== "playing") return;
      // Ignore if user is typing in input
      if (["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === pauseKey.current) {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  const isLastQ = currentQ === questions.length - 1;

  const bgmLabel = mapData.bgm === "custom" 
    ? (mapData.customBgmName || "Nhạc tự chọn") 
    : (mapData.bgm || "Chill Lofi");

  // Save score to leaderboard + earn coins + record rank when game ends
  useEffect(() => {
    if (phase === "result") {
      const correctCount = answers.filter(a => a.correct).length;
      const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

      const username = user?.username || user?.email?.split("@")[0] || "Người chơi";
      const grade = user?.grade || "Lớp 11";

      saveLeaderboardScore(mapId, username, grade, score, accuracy, maxCombo);

      // Wager payout
      if (wagerConfig && user) {
        if (accuracy >= 60 && wagerConfig.wager > 0) {
          // Won the wager: earn wager * multiplier
          earnCoins(wagerConfig.wager * wagerConfig.multiplier, "wager_win");
        } else if (accuracy >= 60 && wagerConfig.wager === 0) {
          // Safe mode flat reward
          earnCoins(wagerConfig.safeReward || 10, "game_complete");
        }
        // Loss: coins already optimistically deducted if needed — no extra action
      } else if (accuracy >= 60 && user) {
        // No wager chosen — base reward by accuracy
        const baseReward = accuracy === 100 ? 80 : accuracy >= 80 ? 50 : 20;
        earnCoins(baseReward, "game_complete");
      }

      // Record ELO rank snapshot (fire-and-forget)
      if (user) {
        _apiPost("/api/mrm/rank-history/record", {}).then(() => refreshCoins());
      }
    }
  }, [phase]); // eslint-disable-line

  // ─── Timer ───────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    const limit = question ? (question.timeLimit || 30) : 30;
    setTimeLeft(limit);
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
  }, [currentQ, question]); // eslint-disable-line

  useEffect(() => {
    if (phase === "playing" && !isPaused) startTimer();
    if (isPaused) clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQ, isPaused]); // eslint-disable-line

  // ─── Answer handling ─────────────────────────────────────────────────────
  const handleAnswer = (optionIdx, timeout = false) => {
    if (selected !== null || showExplain) return;
    clearInterval(timerRef.current);
    const limit = question ? (question.timeLimit || 30) : 30;

    let isCorrect = false;
    let userAnswerText = null;
    if (!timeout) {
      if (question.type === "fill_in_blank") {
        userAnswerText = typeof optionIdx === "string" ? optionIdx.trim() : "";
        const correctAns = (question.correctAnswerText || "").trim().toLowerCase();
        isCorrect = userAnswerText.toLowerCase() === correctAns;
      } else {
        isCorrect = optionIdx === question.correct;
      }
    }

    setSelected(optionIdx === -1 || optionIdx === null ? null : optionIdx);
    setShowExplain(true);

    const timeBonus = Math.floor(timeLeft * 3);
    const newCombo = isCorrect ? combo + 1 : 0;
    const comboBonus = isCorrect ? newCombo * 10 : 0;
    const basePoints = question ? (question.points || 100) : 100;
    const multiplier = x2TokenActive ? 2 : 1;
    const pts = isCorrect ? (basePoints + timeBonus + comboBonus) * multiplier : 0;
    if (x2TokenActive && isCorrect) setX2TokenActive(false);

    setAnswers(prev => [...prev, { correct: isCorrect, time: limit - timeLeft, points: pts }]);

    if (isCorrect) {
      setScore(prev => prev + pts);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setLastPoints(`+${pts}`);
      setTimeout(() => setLastPoints(null), 1200);
    } else {
      setCombo(0);
      // Show NearMiss effect if user answered (not timeout)
      if (!timeout && optionIdx !== null) {
        setNearMissQuestion(question);
        setNearMissAnswer(userAnswerText ?? optionIdx);
        setLastWrongIdx(optionIdx);
        setShowNearMiss(true);
        // Don't auto-advance yet — NearMiss handles it
        const newHp = hp - 1;
        setHp(newHp);
        if (newHp <= 0) {
          setTimeout(() => { setShowNearMiss(false); setPhase("result"); }, 1500);
        }
        return;
      }
      const newHp = hp - 1;
      setHp(newHp);
      if (newHp <= 0) {
        setTimeout(() => setPhase("result"), 1200);
        return;
      }
    }

    // Auto-advance after 2s
    setTimeout(() => {
      if (isLastQ || (!isCorrect && hp <= 1)) {
        setPhase("result");
      } else {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setShowExplain(false);
        setBlankInput("");
      }
    }, 2000);
  };

  // ─── NearMiss: Revive (redo current question) ─────────────────────────────
  const handleRevive = () => {
    setShowNearMiss(false);
    setSelected(null);
    setShowExplain(false);
    setBlankInput("");
    setHp(prev => Math.min(prev + 1, MAX_HP)); // restore 1 hp
    // Restart timer for same question
    startTimer();
  };

  const handleNearMissContinue = () => {
    setShowNearMiss(false);
    if (isLastQ || hp <= 0) {
      setPhase("result");
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplain(false);
      setBlankInput("");
    }
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
      setBlankInput("");
    }
  };

  // ─── Render: Intro ───────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", color: "white", position: "relative",
      }}>
        <MapBgLayer bgImageUrl={mapData.bgImageUrl || mapData.thumbnail_url} bgOpacity={activeBgOpacity} />

        {/* WagerModal */}
        {showWager && (
          <WagerModal
            onConfirm={(cfg) => { setWagerConfig(cfg); setShowWager(false); setPhase("playing"); }}
            onSkip={() => { setWagerConfig(null); setShowWager(false); setPhase("playing"); }}
          />
        )}

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
            { icon: "⏱", label: `${mapData.time_avg || 30}s/câu`, color: "#fbbf24" },
            { icon: "🃏", label: "1 Swap Card", color: "#a78bfa" },
            { icon: "💎", label: "Combo bonus", color: "#22d3ee" },
            { icon: "🎰", label: "Đặt cược xu", color: "#f97316" },
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
          onClick={() => setShowWager(true)}
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

    // osu! Style Grade System
    const grade = accuracy === 100 ? "SS"
      : accuracy >= 95 ? "S"
      : accuracy >= 90 ? "A"
      : accuracy >= 80 ? "B"
      : accuracy >= 70 ? "C"
      : "D";

    const gradeColor = grade === "SS" ? "#facc15"
      : grade === "S" ? "#fbbf24"
      : grade === "A" ? "#22d3ee"
      : grade === "B" ? "#a78bfa"
      : grade === "C" ? "#ec4899"
      : "#ef4444";

    // MysteryChest shown on top of result if accuracy >= 40%
    if (showChest) {
      return (
        <MysteryChestModal
          onClose={() => setShowChest(false)}
          onTokenEarned={(t) => { if (t === "x2") setX2TokenActive(true); }}
        />
      );
    }

    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "linear-gradient(135deg, #020208 0%, #0c0b1e 50%, #05040e 100%)",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", color: "white", padding: 24, position: "relative",
      }}>
        <MapBgLayer bgImageUrl={mapData.bgImageUrl || mapData.thumbnail_url} bgOpacity={activeBgOpacity * 0.6} />
        {/* Grade badge */}
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${gradeColor}33, ${gradeColor}0b)`,
          border: `3px solid ${gradeColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 54, fontWeight: 950, color: gradeColor,
          marginBottom: 20,
          boxShadow: `0 0 35px ${gradeColor}66, inset 0 0 20px ${gradeColor}33`,
          transform: "skewX(-10deg)",
        }}>
          <span style={{ transform: "skewX(10deg)" }}>{grade}</span>
        </div>

        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, letterSpacing: 0.5 }}>
          {accuracy === 100 ? "Perfect Combo! 👑" : accuracy >= 90 ? "Xuất sắc! 🎉" : accuracy >= 70 ? "Tốt lắm! 👍" : accuracy >= 50 ? "Cố gắng hơn nhé 💪" : "Chưa ổn, thử lại! 😅"}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 32, fontWeight: 600 }}>
          {mapData.icon} {mapData.title}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32, width: "100%", maxWidth: 480 }}>
          {[
            { label: "Điểm", value: score.toLocaleString(), color: "#fbbf24", icon: "💎" },
            { label: "Đúng", value: `${correctCount}/${answers.length}`, color: "#4ade80", icon: "✅" },
            { label: "Combo Max", value: `x${maxCombo}`, color: "#22d3ee", icon: "⚡" },
            { label: "Độ chính xác", value: `${accuracy}%`, color: "#a78bfa", icon: "🎯" },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: "center", padding: "18px 8px",
              background: "rgba(10,10,24,0.7)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              transform: "skewX(-6deg)"
            }}>
              <div style={{ transform: "skewX(6deg)" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer review */}
        <div style={{
          width: "100%", maxWidth: 480, marginBottom: 32,
          background: "rgba(10,10,24,0.6)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Chi tiết câu trả lời
          </div>
          {answers.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
              borderBottom: i < answers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <span style={{ fontSize: 16 }}>{a.correct ? "✅" : "❌"}</span>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", flex: 1, fontWeight: 600 }}>Câu {i + 1}</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: a.correct ? "#4ade80" : "#f87171" }}>
                {a.correct ? `+${a.points}` : "0"} điểm
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{a.time}s</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {/* Mystery Chest button — reward for completing */}
          {accuracy >= 40 && (
            <button
              onClick={() => setShowChest(true)}
              style={{
                padding: "12px 28px", borderRadius: 8, fontSize: 14.5, fontWeight: 800,
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                border: "none", color: "#000", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(251,191,36,0.4)",
                transform: "skewX(-8deg)",
                animation: "chestGlow 2s ease-in-out infinite",
              }}
            >
              <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>🎁 Mở hộp quà</span>
            </button>
          )}
          <button
            onClick={() => {
              setPhase("intro");
              setCurrentQ(0); setHp(MAX_HP); setScore(0);
              setCombo(0); setMaxCombo(0); setSelected(null);
              setShowExplain(false); setAnswers([]); setSwapUsed(false);
              setBlankInput(""); setShowNearMiss(false); setShowChest(false);
              setWagerConfig(null);
            }}
            style={{
              padding: "12px 32px", borderRadius: 8, fontSize: 14.5, fontWeight: 800,
              background: "linear-gradient(135deg, #00d2ff, #7c3aed)",
              border: "1px solid rgba(0, 210, 255, 0.3)", color: "white", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,210,255,0.4)",
              transform: "skewX(-8deg)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,210,255,0.6)"; e.currentTarget.style.transform = "skewX(-8deg) scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,210,255,0.4)"; e.currentTarget.style.transform = "skewX(-8deg) scale(1)"; }}
          >
            <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>🔄 Chơi lại</span>
          </button>
          <Link href="/mrm/singleplayer" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "12px 28px", borderRadius: 8, fontSize: 14.5, fontWeight: 800,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              color: "white", cursor: "pointer",
              transform: "skewX(-8deg)",
              transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>← Danh sách</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Render: Playing ─────────────────────────────────────────────────────
  const limit = question ? (question.timeLimit || 30) : 30;
  const timerFrac = timeLeft / limit;
  const timerColor = timerFrac > 0.5 ? "#22d3ee" : timerFrac > 0.25 ? "#fbbf24" : "#ef4444";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(135deg, #020617, #0a0a1a)",
      fontFamily: "'Inter', sans-serif", color: "white", position: "relative",
    }}>
      <MapBgLayer bgImageUrl={mapData.bgImageUrl || mapData.thumbnail_url} bgOpacity={activeBgOpacity} />

      {/* ─── PAUSE OVERLAY ─── */}
      {isPaused && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(2,6,23,0.88)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 0,
        }}>
          {/* Big pause icon */}
          <div style={{
            fontSize: 72, marginBottom: 12,
            animation: "mrmPulse 2s infinite",
          }}>⏸</div>

          <div style={{
            fontSize: 32, fontWeight: 900, color: "white",
            letterSpacing: 4, textTransform: "uppercase", marginBottom: 6,
          }}>TẠM DỪNG</div>

          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 40,
            fontWeight: 600,
          }}>
            Nhấn <kbd style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 5, padding: "2px 8px", fontSize: 12,
              fontFamily: "monospace",
            }}>{pauseKey.current}</kbd> để tiếp tục
          </div>

          {/* Stats while paused */}
          <div style={{
            display: "flex", gap: 20, marginBottom: 40,
          }}>
            {[
              { label: "Câu", val: `${currentQ + 1}/${questions.length}`, color: "#22d3ee" },
              { label: "Điểm", val: score.toLocaleString(), color: "#fbbf24" },
              { label: "HP", val: `${hp}/${MAX_HP}`, color: "#f87171" },
              { label: "Combo", val: `x${combo}`, color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "14px 20px",
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 700, letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setIsPaused(false)}
              style={{
                padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 800,
                background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                color: "#000", border: "none", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(34,211,238,0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              ▶ Tiếp tục
            </button>

            <button
              onClick={() => {
                setIsPaused(false);
                setPhase("intro");
                setCurrentQ(0); setHp(MAX_HP); setScore(0);
                setCombo(0); setMaxCombo(0); setSelected(null);
                setShowExplain(false); setAnswers([]); setSwapUsed(false);
                setBlankInput("");
              }}
              style={{
                padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 800,
                background: "rgba(251,191,36,0.12)",
                color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(251,191,36,0.22)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(251,191,36,0.12)"}
            >
              🔄 Chơi lại
            </button>

            <Link href="/mrm/singleplayer" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 800,
                  background: "rgba(239,68,68,0.12)",
                  color: "#f87171", border: "1px solid rgba(239,68,68,0.35)",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
              >
                ✕ Thoát
              </button>
            </Link>
          </div>

          {/* Settings link */}
          <div style={{ marginTop: 28 }}>
            <Link href="/mrm/settings" style={{ textDecoration: "none" }}>
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,0.3)",
                cursor: "pointer", transition: "color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#22d3ee"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >
                ⚙️ Cài đặt phím tắt
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── TOP BAR ─── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative", zIndex: 10,
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

        {/* Pause button */}
        <button
          id="sp-pause-btn"
          onClick={() => setIsPaused(p => !p)}
          title={`Tạm dừng (${pauseKey.current})`}
          style={{
            background: isPaused ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${isPaused ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 8, color: isPaused ? "#22d3ee" : "rgba(255,255,255,0.55)",
            cursor: "pointer", fontSize: 14, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(34,211,238,0.15)"}
          onMouseLeave={e => { if (!isPaused) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        >
          {isPaused ? "▶" : "⏸"}
          <span style={{ fontSize: 10, opacity: 0.6 }}>{pauseKey.current}</span>
        </button>

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

        {/* Options / Input */}
        {question.type === "fill_in_blank" ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              value={blankInput}
              onChange={e => setBlankInput(e.target.value)}
              disabled={showExplain}
              onKeyDown={e => {
                if (e.key === "Enter" && blankInput.trim()) {
                  handleAnswer(blankInput);
                }
              }}
              placeholder="Nhập câu trả lời của bạn..."
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(15,23,42,0.7)",
                border: showExplain
                  ? (answers[currentQ]?.correct ? "2px solid rgba(74,222,128,0.5)" : "2px solid rgba(239,68,68,0.5)")
                  : "2px solid rgba(255,255,255,0.08)",
                color: showExplain
                  ? (answers[currentQ]?.correct ? "#4ade80" : "#f87171")
                  : "white",
                fontSize: 15,
                outline: "none",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            />
            {!showExplain && (
              <button
                onClick={() => handleAnswer(blankInput)}
                disabled={!blankInput.trim()}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  background: blankInput.trim() ? "linear-gradient(135deg, #22d3ee, #0ea5e9)" : "rgba(255,255,255,0.04)",
                  border: "none",
                  color: blankInput.trim() ? "#000" : "rgba(255,255,255,0.25)",
                  cursor: blankInput.trim() ? "pointer" : "default",
                  boxShadow: blankInput.trim() ? "0 4px 16px rgba(34,211,238,0.25)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Gửi câu trả lời 🚀
              </button>
            )}
          </div>
        ) : (
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
        )}

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

        {/* NearMiss Effect — show after wrong answer */}
        {showNearMiss && (
          <NearMissEffect
            question={nearMissQuestion}
            userAnswer={nearMissAnswer}
            onRevive={handleRevive}
            onContinue={handleNearMissContinue}
          />
        )}
      </div>

      {/* X2 Token indicator */}
      {x2TokenActive && (
        <div style={{
          position: "fixed", top: 70, right: 20, zIndex: 100,
          background: "rgba(251,191,36,0.15)",
          border: "1px solid rgba(251,191,36,0.4)",
          borderRadius: 8, padding: "6px 12px",
          fontSize: 12, fontWeight: 800, color: "#fbbf24",
          animation: "fadeIn 0.3s ease-out",
        }}>
          🃏 X2 Điểm Active!
        </div>
      )}

      <style>{`
        @keyframes scoreFloat {
          from { transform: translateY(0); opacity: 1; }
          to   { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chestGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(251,191,36,0.4); }
          50%       { box-shadow: 0 4px 40px rgba(251,191,36,0.8); }
        }
      `}</style>
    </div>
  );
}

// Wrap with CoinStoreProvider
export default function SingleplayerGame({ mapId }) {
  return (
    <CoinStoreProvider>
      <SingleplayerGameInner mapId={mapId} />
    </CoinStoreProvider>
  );
}

