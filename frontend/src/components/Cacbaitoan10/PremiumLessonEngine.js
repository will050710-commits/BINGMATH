/* eslint-disable react-hooks/static-components */
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";

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
}) {
  const { user, saveGameResult } = useAuth();
  const [lang, setLang] = useState("vi");
  const [gameMode, setGameMode] = useState("mc");
  const [activeSection, setActiveSection] = useState("khoiDong");

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
    const correct = i === mcQuestions[mcIndex].answer;
    if (correct) setMcScore((s) => s + 1);
    setMcHistory((h) => [...h, { q: mcIndex, selected: i, correct }]);
  };
  const handleMcNext = () => {
    if (mcIndex + 1 >= mcQuestions.length) {
      setMcDone(true);
    } else {
      setMcIndex((i) => i + 1);
      setMcSelected(null);
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
    const correct = ans === tfCards[tfIndex].answer;
    if (correct) setTfScore((s) => s + 1);
    setTfHistory((h) => [...h, { q: tfIndex, given: ans, correct }]);
  };
  const handleTfNext = () => {
    if (tfIndex + 1 >= tfCards.length) {
      setTfDone(true);
    } else {
      setTfIndex((i) => i + 1);
      setTfFlipped(false);
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
  const fillScore = fillChecked ? fillQuestions.filter((q) => checkFill(q)).length : null;

  // Formatting results
  const mcResultItems = mcHistory.map((h) => ({
    correct: h.correct,
    qText: mcQuestions[h.q].q,
    correctText: mcQuestions[h.q].options[mcQuestions[h.q].answer],
    yourText: mcQuestions[h.q].options[h.selected]
  }));
  const tfResultItems = tfHistory.map((h) => ({
    correct: h.correct,
    qText: tfCards[h.q].stmt,
    correctText: tfCards[h.q].answer ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE"),
    yourText: h.given ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE")
  }));
  const fillResultItems = fillChecked ? fillQuestions.map((q) => ({
    correct: checkFill(q),
    qText: q.template,
    correctText: q.answer,
    yourText: fillAnswers[q.id] || t("(bỏ trống)", "(blank)")
  })) : [];

  // DB integration via useEffects
  useEffect(() => {
    if (mcDone && user && mcQuestions.length > 0) {
      saveGameResult({ lesson_slug: lessonSlug, mode: "mc", score: mcScore, total: mcQuestions.length });
    }
  }, [mcDone, mcScore, user, lessonSlug, mcQuestions.length, saveGameResult]);

  useEffect(() => {
    if (tfDone && user && tfCards.length > 0) {
      saveGameResult({ lesson_slug: lessonSlug, mode: "tf", score: tfScore, total: tfCards.length });
    }
  }, [tfDone, tfScore, user, lessonSlug, tfCards.length, saveGameResult]);

  useEffect(() => {
    if (fillChecked && user && fillQuestions.length > 0) {
      saveGameResult({
        lesson_slug: lessonSlug,
        mode: "fill",
        score: fillQuestions.filter((q) => checkFill(q)).length,
        total: fillQuestions.length
      });
    }
  }, [fillChecked, fillAnswers, user, lessonSlug, fillQuestions.length, saveGameResult]);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "linear-gradient(160deg, #020c1b 0%, #0a1628 20%, #0c2340 50%, #0a1628 100%)", color: "white", overflowX: "hidden" }}>
      
      {/* ── Top Navigation Bar ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 400, background: "rgba(2,12,27,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 0" }}>
        <div style={{ width: "1400px", maxWidth: "97%", margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
                {icon} {t(labelVi, labelEn)}
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
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* Game Content */}
              <div style={{ padding: "20px 20px" }}>
                <AnimatePresence mode="wait">
                  
                  {/* ── MC ── */}
                  {gameMode === "mc" && (
                    <motion.div key="mc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {mcQuestions.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>{t("Không có câu hỏi trắc nghiệm.", "No multiple choice questions.")}</div>
                      ) : !mcDone ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("Câu", "Q")} {mcIndex + 1}/{mcQuestions.length}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{t("Điểm:", "Score:")} {mcScore}</span>
                          </div>
                          <div style={{ fontSize: 15.5, fontWeight: 600, color: "white", lineHeight: 1.6, marginBottom: 18 }}>{mcQuestions[mcIndex].q}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                            {mcQuestions[mcIndex].options.map((opt, i) => {
                              let bg = "rgba(255,255,255,0.05)";
                              let border = "rgba(255,255,255,0.08)";
                              let color = "rgba(255,255,255,0.8)";
                              if (mcSelected !== null) {
                                if (i === mcQuestions[mcIndex].answer) {
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
                                💬 {mcQuestions[mcIndex].explain}
                              </div>
                              <MorphButton onClick={handleMcNext} label={mcIndex + 1 < mcQuestions.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")} />
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <ResultSummary items={mcResultItems} onReset={resetMc} t={t} scoreLabel={mcScore === mcQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : mcScore >= mcQuestions.length * 0.6 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
                      )}
                    </motion.div>
                  )}

                  {/* ── T/F ── */}
                  {gameMode === "tf" && (
                    <motion.div key="tf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {tfCards.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>{t("Không có câu hỏi đúng/sai.", "No true/false questions.")}</div>
                      ) : !tfDone ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("Thẻ", "Card")} {tfIndex + 1}/{tfCards.length}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{t("Điểm:", "Score:")} {tfScore}</span>
                          </div>
                          <div style={{ padding: "18px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 16, textAlign: "center", fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
                            {tfCards[tfIndex].stmt}
                          </div>
                          {!tfFlipped ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <button onClick={() => handleTfAnswer(true)} style={{ padding: "12px 0", background: "rgba(5,150,105,0.12)", color: "#6ee7b7", border: "2px solid rgba(5,150,105,0.35)", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>✅ {t("ĐÚNG", "TRUE")}</button>
                              <button onClick={() => handleTfAnswer(false)} style={{ padding: "12px 0", background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "2px solid rgba(239,68,68,0.35)", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>❌ {t("SAI", "FALSE")}</button>
                            </div>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                              <div style={{ padding: "11px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 9, fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                                💬 {tfCards[tfIndex].explain}
                              </div>
                              <MorphButton onClick={handleTfNext} label={tfIndex + 1 < tfCards.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")} />
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <ResultSummary items={tfResultItems} onReset={resetTf} t={t} scoreLabel={tfScore === tfCards.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : tfScore >= tfCards.length * 0.6 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
                      )}
                    </motion.div>
                  )}

                  {/* ── Fill ── */}
                  {gameMode === "fill" && (
                    <motion.div key="fill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {fillQuestions.length === 0 ? (
                        <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>{t("Không có câu hỏi điền từ.", "No fill in the blanks.")}</div>
                      ) : !fillChecked ? (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 18 }}>{t("Điền câu trả lời vào chỗ trống", "Fill in each blank")}</div>
                          {fillQuestions.map((q, qi) => (
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
                          <MorphButton onClick={() => setFillChecked(true)} label={t("Kiểm tra đáp án", "Check Answers")} />
                        </>
                      ) : (
                        <ResultSummary items={fillResultItems} onReset={() => { setFillAnswers({}); setFillChecked(false); }} t={t} scoreLabel={fillScore === fillQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fillScore >= fillQuestions.length * 0.6 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </div>

      <DuoTranslate />

      <style>{`
        [data-reveal]{opacity:0;transform:translateY(24px);transition:opacity 0.6s cubic-bezier(.16,1,.3,1),transform 0.5s cubic-bezier(.16,1,.3,1);}
        [data-reveal].visible{opacity:1;transform:translateY(0);}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.35);border-radius:3px;}
        @media(max-width:900px){div[style*="gridTemplateColumns: 1fr 420px"]{grid-template-columns:1fr!important;}div[style*="position: sticky; top: 72px"]{position:static!important;}}
      `}</style>
    </div>
  );
}
