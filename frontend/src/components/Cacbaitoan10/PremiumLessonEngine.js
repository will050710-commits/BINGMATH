/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/static-components */
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
import MathToolsPanel from "./MathToolsPanel";
import { logQuizAttempt, getNextDifficulty } from "@/lib/api";
import { useGamification } from "@/hooks/useGamification";
import GamificationHUD from "@/components/GamificationHUD";
import { renderDuoIcon } from "@/components/DuoIcons";

// ─── PARTICLE BURST ──────────────────────────────────────────────────────────
function ParticleBurst({ active }) {
  const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i / 14) * 360,
    distance: 40 + Math.random() * 30,
    color: ["#6366f1", "#22d3ee", "#a78bfa", "#34d399", "#fbbf24"][i % 5],
  }));
  if (!active) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── MORPHING CHECK BUTTON ───────────────────────────────────────────────────
function MorphButton({ onClick, label, disabled = false }) {
  const [state, setState] = useState("idle"); // idle | loading | done
  const [particles, setParticles] = useState(false);

  const handleClick = async () => {
    if (state !== "idle" || disabled) return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 700));
    setState("done");
    setParticles(true);
    onClick?.();
    setTimeout(() => setParticles(false), 800);
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <ParticleBurst active={particles} />
      <motion.button
        onClick={handleClick}
        disabled={disabled || state !== "idle"}
        animate={
          state === "loading"
            ? { width: 44, borderRadius: 22 }
            : state === "done"
            ? { width: 44, borderRadius: 22, backgroundColor: "#059669" }
            : { width: "auto", borderRadius: 10, backgroundColor: "#6366f1" }
        }
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{
          height: 44,
          padding: state === "idle" ? "0 24px" : 0,
          color: "white",
          border: "none",
          fontSize: 15,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minWidth: state === "idle" ? 160 : 44,
          boxShadow: state === "done" ? "0 0 20px rgba(5,150,105,0.5)" : "0 0 20px rgba(99,102,241,0.4)",
        }}
      >
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {label}
            </motion.span>
          )}
          {state === "loading" && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 0.7, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.15 } }}
              style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%" }}
            />
          )}
          {state === "done" && (
            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300 }}>
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// ─── RESULT SUMMARY ───────────────────────────────────────────────────────────
function ResultSummary({ items, onReset, scoreLabel, t }) {
  const correct = items.filter((i) => i.correct).length;
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>
          {correct === items.length ? "🏆" : correct >= items.length * 0.6 ? "👍" : "💪"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>{correct} / {items.length}</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginTop: 4 }}>{scoreLabel}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            padding: "12px 16px", borderRadius: 10,
            background: item.correct ? "rgba(5,150,105,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${item.correct ? "rgba(5,150,105,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.correct ? "✅" : "❌"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>
                  {t("Câu", "Q")} {idx + 1}: {item.qText}
                </div>
                {!item.correct && (
                  <div style={{ fontSize: 13, color: "#f87171" }}>
                    {t("Đáp án đúng:", "Correct:")} <strong>{item.correctText}</strong>
                  </div>
                )}
                {item.yourText && !item.correct && (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    {t("Bạn chọn:", "Your answer:")} {item.yourText}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onReset}
        style={{
          padding: "11px 28px",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}
      >
        🔄 {t("Chơi lại", "Play Again")}
      </button>
    </div>
  );
}

// ─── ENGINE COMPONENT ────────────────────────────────────────────────────────
export default function PremiumLessonEngine({
  lessonSlug,
  chapterTitle,
  lessonTitle,
  learningObjectives = [],
  navItems = [],
  videoId,
  videoSubtitles = [],
  mcQuestions = [],
  tfCards = [],
  fillQuestions = [],
  renderTheory,
  lang: propLang,
  setLang: propSetLang,
}) {
  const { user, saveGameResult } = useAuth();
  const [localLang, localSetLang] = useState("vi");
  const lang = propLang !== undefined ? propLang : localLang;
  const setLang = propSetLang !== undefined ? propSetLang : localSetLang;
  const [gameMode, setGameMode] = useState("mc");
  const [activeSection, setActiveSection] = useState("khoiDong");

  // Dynamic Difficulty and Gamification Hook
  const { showHUD, triggerGamification, closeHUD } = useGamification();
  const [difficultyMode, setDifficultyMode] = useState("auto"); // auto | manual
  const [difficulty, setDifficulty] = useState("NB"); // NB | TH | VD | VDC

  const questionStartTimeRef = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());

  // Game state
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

  const t = (vi, en) => (lang === "vi" ? vi : en);

  // ─── QUESTION NORMALIZERS ──────────────────────────────────────────────────
  const normalizeMcQuestion = (q, idx) => {
    if (!q) return null;
    const rawQ = q.q || q.question || "";
    const rawOpts = q.options || q.o || [];
    let rawAns = q.answer !== undefined ? q.answer : q.a;
    if (typeof rawAns === 'string') {
      const code = rawAns.toUpperCase().charCodeAt(0);
      if (code >= 65 && code <= 68) {
        rawAns = code - 65;
      } else {
        rawAns = parseInt(rawAns, 10) || 0;
      }
    }
    const rawExplain = q.explain || q.ex || q.explanation || "";
    const key = q.id || q.key || `mc_${idx}`;
    return {
      q: rawQ,
      options: rawOpts,
      answer: rawAns,
      explain: rawExplain,
      key,
      difficulty: q.difficulty || q.level || "NB"
    };
  };

  const normalizeTfCard = (q, idx) => {
    if (!q) return null;
    const stmt = q.stmt || q.s || q.statement || "";
    let rawAns = q.answer !== undefined ? q.answer : q.a;
    let answer = false;
    if (typeof rawAns === 'string') {
      const lower = rawAns.toLowerCase().trim();
      answer = (lower === 'true' || lower === 'đúng' || lower === 'dung' || lower === 't' || lower === 'd' || lower === '1');
    } else {
      answer = Boolean(rawAns);
    }
    const explain = q.explain || q.ex || q.explanation || "";
    const key = q.id || q.key || `tf_${idx}`;
    return {
      stmt,
      answer,
      explain,
      key,
      difficulty: q.difficulty || q.level || "NB"
    };
  };

  const normalizeFillQuestion = (q, idx) => {
    if (!q) return null;
    const id = q.id || q.key || `fill_${idx}`;
    const template = q.template || q.tp || q.text || "";
    const answer = q.answer || q.ans || "";
    const altAnswers = q.altAnswers || q.alt || [];
    const hint = q.hint || q.h || "";
    return {
      id,
      template,
      answer,
      altAnswers,
      hint,
      difficulty: q.difficulty || q.level || "NB"
    };
  };

  const normalizeListOrDict = (input, normalizer) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.map(normalizer).filter(Boolean);
    }
    if (typeof input === "object") {
      const result = {};
      Object.keys(input).forEach(k => {
        if (Array.isArray(input[k])) {
          result[k] = input[k].map(normalizer).filter(Boolean);
        }
      });
      return result;
    }
    return [];
  };

  const normalizedMc = normalizeListOrDict(mcQuestions, normalizeMcQuestion);
  const normalizedTf = normalizeListOrDict(tfCards, normalizeTfCard);
  const normalizedFill = normalizeListOrDict(fillQuestions, normalizeFillQuestion);

  // Helper to slice legacy question arrays or retrieve structured dict entries
  const getActiveList = (normalizedInput) => {
    if (!normalizedInput) return [];
    if (!Array.isArray(normalizedInput) && typeof normalizedInput === "object") {
      const key = Object.keys(normalizedInput).find(k => k.toUpperCase() === difficulty.toUpperCase());
      if (key && Array.isArray(normalizedInput[key])) {
        return normalizedInput[key];
      }
      const anyKey = Object.keys(normalizedInput)[0];
      if (anyKey && Array.isArray(normalizedInput[anyKey])) {
        return normalizedInput[anyKey];
      }
      return [];
    }

    const len = normalizedInput.length;
    if (len === 0) return [];
    if (len < 3) return normalizedInput; // Too short to split
    
    // Index-based slicing for 100% legacy coverage:
    // NB: first 40%, TH: next 30%, VD: next 20%, VDC: last 10%
    const nbCount = Math.max(1, Math.round(len * 0.4));
    const thCount = Math.max(1, Math.round(len * 0.3));
    const vdCount = Math.max(1, Math.round(len * 0.2));
    
    const nbSlice = normalizedInput.slice(0, nbCount);
    const thSlice = normalizedInput.slice(nbCount, nbCount + thCount);
    const vdSlice = normalizedInput.slice(nbCount + thCount, nbCount + thCount + vdCount);
    const vdcSlice = normalizedInput.slice(nbCount + thCount + vdCount);
    
    if (difficulty === "NB") return nbSlice.length > 0 ? nbSlice : normalizedInput;
    if (difficulty === "TH") return thSlice.length > 0 ? thSlice : normalizedInput;
    if (difficulty === "VD") return vdSlice.length > 0 ? vdSlice : normalizedInput;
    if (difficulty === "VDC") return vdcSlice.length > 0 ? vdcSlice : normalizedInput;
    return normalizedInput;
  };

  const activeMcQuestions = getActiveList(normalizedMc);
  const activeTfCards = getActiveList(normalizedTf);
  const activeFillQuestions = getActiveList(normalizedFill);

  // Fetch recommended difficulty in Auto ELO mode
  useEffect(() => {
    if (difficultyMode === "auto" && lessonSlug) {
      getNextDifficulty(lessonSlug).then(res => {
        if (res.ok && res.data && res.data.recommended_difficulty) {
          setDifficulty(res.data.recommended_difficulty);
        }
      }).catch(err => console.error("Error fetching recommended difficulty:", err));
    }
  }, [difficultyMode, lessonSlug]);

  // Scroll reveal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => {
      el.classList.remove("visible");
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, [lang]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  // MC handlers
  const handleMcSelect = (i) => {
    if (mcSelected !== null) return;
    setMcSelected(i);
    const correct = i === activeMcQuestions[mcIndex].answer;
    if (correct) setMcScore((s) => s + 1);
    setMcHistory((h) => [...h, { q: mcIndex, selected: i, correct }]);
  };

  const handleMcNext = () => {
    if (mcIndex + 1 >= activeMcQuestions.length) {
      setMcDone(true);
      const totalTime = Math.round((Date.now() - sessionStartTime.current) / 1000);
      const accuracy = Math.round((mcScore / activeMcQuestions.length) * 100);
      triggerGamification({
        questions: mcHistory.map((h, idx) => ({
          key: activeMcQuestions[h.q].key || `mc_${idx}`,
          section: lessonSlug,
          difficulty: activeMcQuestions[h.q].difficulty || difficulty,
          isCorrect: h.correct
        })),
        timeTakenSec: totalTime,
        topic: lessonSlug,
        sessionAccuracy: accuracy
      }).then(() => {
        // Refetch recommended difficulty to reflect user's newly updated ELO
        if (difficultyMode === "auto") {
          getNextDifficulty(lessonSlug).then(res => {
            if (res.ok && res.data && res.data.recommended_difficulty) {
              setDifficulty(res.data.recommended_difficulty);
            }
          });
        }
      });
    } else {
      setMcIndex((i) => i + 1);
      setMcSelected(null);
      questionStartTimeRef.current = Date.now();
    }
  };

  const resetMc = () => {
    setMcIndex(0);
    setMcSelected(null);
    setMcScore(0);
    setMcDone(false);
    setMcHistory([]);
  };

  // TF handlers
  const handleTfAnswer = (ans) => {
    if (tfFlipped) return;
    setTfFlipped(true);
    const correct = ans === activeTfCards[tfIndex].answer;
    if (correct) setTfScore((s) => s + 1);
    setTfHistory((h) => [...h, { q: tfIndex, given: ans, correct }]);
  };

  const handleTfNext = () => {
    if (tfIndex + 1 >= activeTfCards.length) {
      setTfDone(true);
      const totalTime = Math.round((Date.now() - sessionStartTime.current) / 1000);
      const accuracy = Math.round((tfScore / activeTfCards.length) * 100);
      triggerGamification({
        questions: tfHistory.map((h, idx) => ({
          key: activeTfCards[h.q].key || `tf_${idx}`,
          section: lessonSlug,
          difficulty: activeTfCards[h.q].difficulty || difficulty,
          isCorrect: h.correct
        })),
        timeTakenSec: totalTime,
        topic: lessonSlug,
        sessionAccuracy: accuracy
      }).then(() => {
        if (difficultyMode === "auto") {
          getNextDifficulty(lessonSlug).then(res => {
            if (res.ok && res.data && res.data.recommended_difficulty) {
              setDifficulty(res.data.recommended_difficulty);
            }
          });
        }
      });
    } else {
      setTfIndex((i) => i + 1);
      setTfFlipped(false);
      questionStartTimeRef.current = Date.now();
    }
  };

  const resetTf = () => {
    setTfIndex(0);
    setTfFlipped(false);
    setTfScore(0);
    setTfDone(false);
    setTfHistory([]);
  };

  // Fill handlers
  const checkFill = (q) => {
    const raw = (fillAnswers[q.id] || "").toLowerCase().trim().replace(/\s/g, "");
    return [q.answer, ...(q.altAnswers || [])].map((a) => a.toLowerCase().replace(/\s/g, "")).includes(raw);
  };
  const fillScore = fillChecked ? activeFillQuestions.filter((q) => checkFill(q)).length : null;

  const handleFillCheck = () => {
    setFillChecked(true);
    const correctCount = activeFillQuestions.filter((q) => checkFill(q)).length;
    const totalTime = Math.round((Date.now() - sessionStartTime.current) / 1000);
    const accuracy = Math.round((correctCount / activeFillQuestions.length) * 100);
    triggerGamification({
      questions: activeFillQuestions.map((q) => ({
        key: q.id,
        section: lessonSlug,
        difficulty: q.difficulty || difficulty,
        isCorrect: checkFill(q)
      })),
      timeTakenSec: totalTime,
      topic: lessonSlug,
      sessionAccuracy: accuracy
    }).then(() => {
      if (difficultyMode === "auto") {
        getNextDifficulty(lessonSlug).then(res => {
          if (res.ok && res.data && res.data.recommended_difficulty) {
            setDifficulty(res.data.recommended_difficulty);
          }
        });
      }
    });
  };

  // Formatting results
  const mcResultItems = mcHistory.map((h) => ({
    correct: h.correct,
    qText: activeMcQuestions[h.q].q,
    correctText: activeMcQuestions[h.q].options[activeMcQuestions[h.q].answer],
    yourText: activeMcQuestions[h.q].options[h.selected]
  }));

  const tfResultItems = tfHistory.map((h) => ({
    correct: h.correct,
    qText: activeTfCards[h.q].stmt,
    correctText: activeTfCards[h.q].answer ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE"),
    yourText: h.given ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE")
  }));

  const fillResultItems = fillChecked ? activeFillQuestions.map((q) => ({
    correct: checkFill(q),
    qText: q.template,
    correctText: q.answer,
    yourText: fillAnswers[q.id] || t("(bỏ trống)", "(blank)")
  })) : [];

  // DB integration via useEffects (legacy callback sync)
  useEffect(() => {
    if (mcDone && user && activeMcQuestions.length > 0) {
      saveGameResult({ lesson_slug: lessonSlug, mode: "mc", score: mcScore, total: activeMcQuestions.length });
    }
  }, [mcDone, mcScore, user, lessonSlug, activeMcQuestions.length, saveGameResult]);

  useEffect(() => {
    if (tfDone && user && activeTfCards.length > 0) {
      saveGameResult({ lesson_slug: lessonSlug, mode: "tf", score: tfScore, total: activeTfCards.length });
    }
  }, [tfDone, tfScore, user, lessonSlug, activeTfCards.length, saveGameResult]);

  useEffect(() => {
    if (fillChecked && user && activeFillQuestions.length > 0) {
      saveGameResult({
        lesson_slug: lessonSlug,
        mode: "fill",
        score: activeFillQuestions.filter((q) => checkFill(q)).length,
        total: activeFillQuestions.length
      });
    }
  }, [fillChecked, fillAnswers, user, lessonSlug, activeFillQuestions.length, saveGameResult]);

  // Reset internal indices when difficulty level changes
  useEffect(() => {
    resetMc();
    resetTf();
    setFillAnswers({});
    setFillChecked(false);
    sessionStartTime.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, [gameMode, difficulty]);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "linear-gradient(160deg, #020c1b 0%, #0a1628 20%, #0c2340 50%, #0a1628 100%)", color: "white", overflowX: "hidden" }}>
      
      {/* ── Top Navigation Bar ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 400, background: "rgba(2,12,27,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 0" }}>
        <div style={{ width: "1400px", maxWidth: "97%", margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", position: "relative" }}>
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              ← {t("Quay lại", "Back")}
            </div>
          </Link>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {navItems.map(([id, icon, labelVi, labelEn]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{
                  background: activeSection === id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                  color: activeSection === id ? "#a5b4fc" : "rgba(255,255,255,0.6)",
                  border: activeSection === id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 7, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (activeSection !== id) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; } }}
                onMouseLeave={e => { if (activeSection !== id) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {renderDuoIcon(icon, { size: 15 })}
                  {t(labelVi, labelEn)}
                </span>
              </button>
            ))}
          </div>



          {/* Bilingual toggle */}
          <div style={{ position: "relative", display: "flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: 3, borderRadius: 24, flexShrink: 0 }}>
            <motion.div
              layoutId="langSlider"
              style={{ position: "absolute", top: 3, height: "calc(100% - 6px)", width: "calc(50% - 3px)", background: "rgba(99,102,241,0.7)", borderRadius: 20, backdropFilter: "blur(4px)" }}
              animate={{ left: lang === "vi" ? 3 : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
            {[["vi", "🇻🇳 VI"], ["en", "🇬🇧 EN"]].map(([l, label]) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ position: "relative", zIndex: 1, width: 60, padding: "5px 0", background: "none", border: "none", fontSize: 12, fontWeight: 700, color: lang === l ? "white" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "color 0.2s" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Split-Screen Layout ── */}
      <div style={{ width: "1400px", maxWidth: "97%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 32, paddingTop: 36, paddingBottom: 80, alignItems: "start" }}>
        
        {/* ════ LEFT COLUMN: Theory ════ */}
        <div>
          {/* Page Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
              {t(chapterTitle?.vi, chapterTitle?.en)}
            </div>
            <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, background: "linear-gradient(135deg, #fff 60%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10, lineHeight: 1.15 }}>
              {t(lessonTitle?.vi, lessonTitle?.en)}
            </h1>
            {/* Learning Objectives */}
            {learningObjectives.length > 0 && (
              <div data-reveal style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", marginBottom: 10 }}>🎯 {t("Yêu cầu cần đạt", "Learning Objectives")}</div>
                {learningObjectives.map((o, i) => (
                  <div key={i} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", marginBottom: 5 }}>• {t(o.vi, o.en)}</div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Render Lesson Custom Theory Markup */}
          {renderTheory?.({ t, lang, LessonVideoPlayer, videoId, videoSubtitles })}
        </div>

        {/* ════ RIGHT COLUMN: Interactive Mini Game workspace ════ */}
        <div style={{ position: "sticky", top: 72, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <section id="miniGame" style={{ scrollMarginTop: 80 }}>
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              overflow: "hidden",
              backdropFilter: "blur(16px)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}>
              {/* Game Header */}
              <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎮 {t("Mini Game", "Mini Game")}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("Luyện tập tương tác — 3 thể loại", "Interactive practice — 3 formats")}</div>
              </div>

              {/* Adaptive Difficulty Control Panel */}
              <div style={{
                padding: "16px 20px",
                background: "rgba(255, 255, 255, 0.03)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                    {t("Độ khó:", "Difficulty Mode:")}
                  </span>
                  <div style={{ display: "flex", background: "rgba(0, 0, 0, 0.3)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
                    <button 
                      onClick={() => setDifficultyMode("auto")}
                      style={{
                        background: difficultyMode === "auto" ? "rgba(99, 102, 241, 0.8)" : "transparent",
                        color: difficultyMode === "auto" ? "white" : "rgba(255, 255, 255, 0.5)",
                        border: "none", borderRadius: 16, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.25s",
                        boxShadow: difficultyMode === "auto" ? "0 0 10px rgba(99, 102, 241, 0.4)" : "none",
                        display: "inline-flex", alignItems: "center", gap: 5
                      }}
                    >
                      {renderDuoIcon("🤖", { size: 14 })} {t("Tự động", "Auto")}
                    </button>
                    <button 
                      onClick={() => setDifficultyMode("manual")}
                      style={{
                        background: difficultyMode === "manual" ? "rgba(34, 211, 238, 0.8)" : "transparent",
                        color: difficultyMode === "manual" ? "white" : "rgba(255, 255, 255, 0.5)",
                        border: "none", borderRadius: 16, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.25s",
                        boxShadow: difficultyMode === "manual" ? "0 0 10px rgba(34, 211, 238, 0.4)" : "none",
                        display: "inline-flex", alignItems: "center", gap: 5
                      }}
                    >
                      {renderDuoIcon("🛠️", { size: 14 })} {t("Thủ công", "Manual")}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                  {[
                    ["NB", "Nhận Biết", "Recall"],
                    ["TH", "Thông Hiểu", "Understand"],
                    ["VD", "Vận Dụng", "Apply"],
                    ["VDC", "Vận Dụng Cao", "Analyze"]
                  ].map(([level, labelVi, labelEn]) => {
                    const isActive = difficulty === level;
                    const isAuto = difficultyMode === "auto";
                    
                    let border = "1px solid rgba(255, 255, 255, 0.08)";
                    let bg = "rgba(255, 255, 255, 0.02)";
                    let color = "rgba(255, 255, 255, 0.4)";
                    
                    if (isActive) {
                      if (isAuto) {
                        border = "1.5px solid #6366f1";
                        bg = "rgba(99, 102, 241, 0.15)";
                        color = "#a5b4fc";
                      } else {
                        border = "1.5px solid #22d3ee";
                        bg = "rgba(34, 211, 238, 0.15)";
                        color = "#22d3ee";
                      }
                    } else if (!isAuto) {
                      color = "rgba(255, 255, 255, 0.7)";
                    }

                    return (
                      <button
                        key={level}
                        disabled={isAuto}
                        onClick={() => setDifficulty(level)}
                        style={{
                          padding: "8px 4px",
                          borderRadius: 8,
                          border,
                          background: bg,
                          color,
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: isAuto ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                          textAlign: "center",
                          boxShadow: isActive ? `0 0 12px ${isAuto ? "rgba(99, 102, 241, 0.3)" : "rgba(34, 211, 238, 0.3)"}` : "none",
                          opacity: isAuto && !isActive ? 0.5 : 1
                        }}
                        title={t(labelVi, labelEn)}
                      >
                        <div style={{ fontSize: 11, marginBottom: 2 }}>{level}</div>
                        <div style={{ fontSize: 8, fontWeight: 500, opacity: 0.7 }}>
                          {t(labelVi.split(" ")[0], labelEn.substring(0, 5))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {difficultyMode === "auto" && (
                  <div style={{ fontSize: 10.5, color: "rgba(99, 102, 241, 0.85)", display: "flex", alignItems: "center", gap: 5, padding: "2px 4px" }}>
                    <span>{renderDuoIcon("⚡", { size: 12 })}</span>
                    <span>
                      {t("Độ khó tự động điều chỉnh theo ELO của bạn.", "Difficulty automatically adjusts to your ELO.")}
                    </span>
                  </div>
                )}
              </div>

              {/* Game Mode Selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  ["mc", "🧩", t("Trắc Nghiệm", "MC")],
                  ["tf", "🃏", t("Đúng/Sai", "T/F")],
                  ["fill", "✍️", t("Điền Từ", "Fill")]
                ].map(([mode, icon, label]) => (
                  <button key={mode} onClick={() => setGameMode(mode)} style={{
                    padding: "13px 8px",
                    background: gameMode === mode ? "rgba(99,102,241,0.2)" : "transparent",
                    color: gameMode === mode ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                    border: "none",
                    borderBottom: gameMode === mode ? "2px solid #6366f1" : "2px solid transparent",
                    fontWeight: 700, fontSize: 12.5, cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {renderDuoIcon(icon, { size: 16 })}
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Game Content */}
              <div style={{ padding: "20px 20px" }}>
                <AnimatePresence mode="wait">
                  
                  {/* ── MC ── */}
                  {gameMode === "mc" && (
                    <motion.div key="mc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {activeMcQuestions.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>{t("Không có câu hỏi trắc nghiệm ở độ khó này.", "No multiple choice questions for this difficulty.")}</div>
                      ) : !mcDone ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("Câu", "Q")} {mcIndex + 1}/{activeMcQuestions.length}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{t("Điểm:", "Score:")} {mcScore}</span>
                          </div>
                          <div style={{ fontSize: 15.5, fontWeight: 600, color: "white", lineHeight: 1.6, marginBottom: 18 }}>{activeMcQuestions[mcIndex].q}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                            {activeMcQuestions[mcIndex].options.map((opt, i) => {
                              let bg = "rgba(255,255,255,0.05)";
                              let border = "rgba(255,255,255,0.08)";
                              let color = "rgba(255,255,255,0.8)";
                              if (mcSelected !== null) {
                                if (i === activeMcQuestions[mcIndex].answer) {
                                  bg = "rgba(5,150,105,0.18)";
                                  border = "rgba(5,150,105,0.5)";
                                  color = "#6ee7b7";
                                } else if (i === mcSelected) {
                                  bg = "rgba(239,68,68,0.15)";
                                  border = "rgba(239,68,68,0.4)";
                                  color = "#fca5a5";
                                }
                              }
                              return (
                                <button key={i} onClick={() => handleMcSelect(i)} style={{
                                  textAlign: "left", padding: "11px 14px", borderRadius: 9, border: `1px solid ${border}`,
                                  background: bg, color, fontSize: 14, fontWeight: 500, cursor: mcSelected !== null ? "default" : "pointer", transition: "all 0.2s",
                                }}>
                                  {String.fromCharCode(65 + i)}. {opt}
                                </button>
                              );
                            })}
                          </div>
                          {mcSelected !== null && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 14 }}>
                              <div style={{ padding: "11px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 9, fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                                💬 {activeMcQuestions[mcIndex].explain}
                              </div>
                              <MorphButton onClick={handleMcNext} label={mcIndex + 1 < activeMcQuestions.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")} />
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <ResultSummary items={mcResultItems} onReset={resetMc} t={t} scoreLabel={mcScore === activeMcQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : mcScore >= activeMcQuestions.length * 0.6 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
                      )}
                    </motion.div>
                  )}

                  {/* ── T/F ── */}
                  {gameMode === "tf" && (
                    <motion.div key="tf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {activeTfCards.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>{t("Không có câu hỏi đúng/sai ở độ khó này.", "No true/false questions for this difficulty.")}</div>
                      ) : !tfDone ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("Thẻ", "Card")} {tfIndex + 1}/{activeTfCards.length}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{t("Điểm:", "Score:")} {tfScore}</span>
                          </div>
                          <div style={{ padding: "18px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 16, textAlign: "center", fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
                            {activeTfCards[tfIndex].stmt}
                          </div>
                          {!tfFlipped ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <button onClick={() => handleTfAnswer(true)} style={{ padding: "12px 0", background: "rgba(5,150,105,0.12)", color: "#6ee7b7", border: "2px solid rgba(5,150,105,0.35)", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>✅ {t("ĐÚNG", "TRUE")}</button>
                              <button onClick={() => handleTfAnswer(false)} style={{ padding: "12px 0", background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "2px solid rgba(239,68,68,0.35)", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>❌ {t("SAI", "FALSE")}</button>
                            </div>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                              <div style={{ padding: "11px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 9, fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                                💬 {activeTfCards[tfIndex].explain}
                              </div>
                              <MorphButton onClick={handleTfNext} label={tfIndex + 1 < activeTfCards.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")} />
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <ResultSummary items={tfResultItems} onReset={resetTf} t={t} scoreLabel={tfScore === activeTfCards.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : tfScore >= activeTfCards.length * 0.6 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
                      )}
                    </motion.div>
                  )}

                  {/* ── Fill ── */}
                  {gameMode === "fill" && (
                    <motion.div key="fill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {activeFillQuestions.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>{t("Không có câu hỏi điền từ ở độ khó này.", "No fill in the blanks for this difficulty.")}</div>
                      ) : !fillChecked ? (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 18 }}>{t("Điền câu trả lời vào chỗ trống", "Fill in each blank")}</div>
                          {activeFillQuestions.map((q, qi) => (
                            <div key={q.id} style={{ marginBottom: 20 }}>
                              <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("Câu", "Q")} {qi + 1}</div>
                              <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", marginBottom: 9 }}>{q.template}</div>
                              <input
                                value={fillAnswers[q.id] || ""}
                                onChange={(e) => setFillAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                                placeholder={t("Nhập đáp án...", "Enter answer...")}
                                style={{
                                  width: "100%", padding: "11px 14px", borderRadius: 9,
                                  fontSize: 14, outline: "none",
                                  background: "rgba(255,255,255,0.06)", color: "white",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  boxSizing: "border-box",
                                  transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                              />
                              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>💡 {q.hint}</div>
                            </div>
                          ))}
                          <MorphButton onClick={handleFillCheck} label={t("Kiểm tra đáp án", "Check Answers")} />
                        </>
                      ) : (
                        <ResultSummary items={fillResultItems} onReset={() => { setFillAnswers({}); setFillChecked(false); }} t={t} scoreLabel={fillScore === activeFillQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fillScore >= activeFillQuestions.length * 0.6 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showHUD && <GamificationHUD onClose={closeHUD} />}

      <DuoTranslate />
      <MathToolsPanel lang={lang} />

      <style>{`
        [data-reveal]{opacity:0;transform:translateY(24px);transition:opacity 0.6s cubic-bezier(.16,1,.3,1),transform 0.5s cubic-bezier(.16,1,.3,1);}
        [data-reveal].visible{opacity:1;transform:translateY(0);}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.35);border-radius:3px;}
        @media(max-width:900px){div[style*="gridTemplateColumns: 1fr 420px"]{grid-template-columns:1fr!important;}div[style*="position: sticky; top: 72px"]{position:static!important;}}
      `}</style>
    </div>
  );
}
