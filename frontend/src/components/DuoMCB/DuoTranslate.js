/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./DuoTranslate.module.css";
import { createSession, translateText } from "./duoServer";
import StreamdownMessage from "@/components/chat/StreamdownMessage";
import MathGraphSVG from "@/components/thpt/Cacbaitoan10/MathGraphSVG";

/**
 * DuoTranslate (BingTranslate)
 * Bidirectional translation (English <-> Vietnamese) with mathematical context,
 * interactive editing, audio speech synthesis, and conceptual theory.
 */
export default function DuoTranslate({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [direction, setDirection] = useState("auto"); // "auto" | "en_vi" | "vi_en"
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showTheory, setShowTheory] = useState(false);
  const [showDualView, setShowDualView] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [speakingKey, setSpeakingKey] = useState(null);

  const contentRef = useRef(null);
  const panelRef = useRef(null);
  const lastTranslatedRef = useRef("");
  const debounceRef = useRef(null);
  const mouseDownRef = useRef({ x: 0, y: 0, target: null });

  useEffect(() => {
    initSession();
  }, []);

  async function initSession() {
    const sid = await createSession();
    setSessionId(sid || "offline-" + Date.now());
  }

  // Text-To-Speech (TTS) using Web Speech API
  const handleSpeak = (text, lang = "vi", key = "speak") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speakingKey === key) {
      setSpeakingKey(null);
      return;
    }
    const clean = (text || "").replace(/[\$\*\#\_\[\]\(\)\{\}\\]/g, " ").trim();
    if (!clean) return;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === "vi" ? "vi-VN" : "en-US";
    utterance.rate = 0.95;
    setSpeakingKey(key);
    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);
    window.speechSynthesis.speak(utterance);
  };

  // Clipboard copy helper with temporary badge
  const handleCopy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (_) {}
  };

  const doTranslate = useCallback(async (text, dir = direction) => {
    const cleanText = (text || "").trim();
    if (!cleanText || cleanText.length < 2) return;

    setInputText(cleanText);
    setIsOpen(true);
    setLoading(true);
    setResults(null);
    setShowTheory(false);

    try {
      const parsed = await translateText(cleanText, { direction: dir });

      // If backend flagged an error but raw is actually valid JSON, attempt recovery
      if (parsed?.error && parsed?.raw) {
        try {
          let raw = parsed.raw.trim()
            .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          const m = raw.match(/(\{[\s\S]*\})/);
          if (m) raw = m[1];
          const recovered = JSON.parse(raw);
          if (recovered.translation || recovered.translation_vi || recovered.translation_en) {
            setResults(recovered);
            return;
          }
        } catch (_) { /* fall through */ }
      }

      setResults(parsed);
    } catch (e) {
      setResults({
        error: true,
        message: "Không thể kết nối với dịch vụ AI. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }, [direction]);

  // Tags that should never trigger translation when clicked
  const IGNORED_TAGS = new Set(["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A", "LABEL"]);

  const isInteractive = (el) => {
    let node = el;
    for (let i = 0; i < 5; i++) {
      if (!node || node === document.body) break;
      if (IGNORED_TAGS.has(node.tagName)) return true;
      node = node.parentElement;
    }
    return false;
  };

  const handleMouseDown = useCallback((e) => {
    mouseDownRef.current = { x: e.clientX, y: e.clientY, target: e.target };
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (panelRef.current?.contains(e.target)) return;
    if (isInteractive(mouseDownRef.current.target)) return;

    const dx = Math.abs(e.clientX - mouseDownRef.current.x);
    const dy = Math.abs(e.clientY - mouseDownRef.current.y);
    if (dx < 8 && dy < 8) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 2) return;
      if (text === lastTranslatedRef.current) return;
      if (panelRef.current?.contains(selection.anchorNode)) return;

      lastTranslatedRef.current = text;
      doTranslate(text, direction);
    }, 80);
  }, [doTranslate, direction]);

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      clearTimeout(debounceRef.current);
    };
  }, [handleMouseDown, handleMouseUp]);

  const handleClose = () => {
    setIsOpen(false);
    lastTranslatedRef.current = "";
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTranslatePage = () => {
    const node = contentRef.current;
    if (!node) return;
    const pageText = (node.innerText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
    if (pageText.length < 2) return;
    lastTranslatedRef.current = pageText;
    doTranslate(pageText, direction);
  };

  // Swap direction and flip text if translation exists
  const handleSwapDirection = () => {
    let newDir = "en_vi";
    if (direction === "en_vi") {
      newDir = "vi_en";
    } else if (direction === "vi_en") {
      newDir = "en_vi";
    } else {
      // Auto: flip opposite to detected source language
      const currentSource = results?.source_lang || "vi";
      newDir = currentSource === "vi" ? "en_vi" : "vi_en";
    }
    setDirection(newDir);

    // If we have an existing translation result, swap input with translated target!
    if (results && !results.error) {
      const translatedText = (
        newDir === "vi_en"
          ? results.translation_vi || results.translation
          : results.translation_en || results.translation
      );
      if (translatedText && translatedText !== inputText) {
        setInputText(translatedText);
        lastTranslatedRef.current = translatedText;
        doTranslate(translatedText, newDir);
        return;
      }
    }

    if (inputText.trim()) {
      doTranslate(inputText, newDir);
    }
  };

  const handleDirectionChange = (newDir) => {
    setDirection(newDir);
    if (inputText.trim()) {
      doTranslate(inputText, newDir);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doTranslate(inputText, direction);
    }
  };

  const handleSampleClick = (sampleText, sampleDir) => {
    setInputText(sampleText);
    setDirection(sampleDir);
    lastTranslatedRef.current = sampleText;
    doTranslate(sampleText, sampleDir);
  };

  const typeColors = {
    noun: "#38bdf8",
    verb: "#34d399",
    adj: "#f472b6",
    adv: "#fbbf24",
    term: "#a78bfa",
    phrase: "#fb923c",
  };
  const typeColor = (t) => typeColors[t?.toLowerCase()] || "#94a3b8";

  // Determine current active source and target labels
  const isEnToVi = direction === "en_vi" || (direction === "auto" && results?.source_lang === "en");
  const sourceLang = isEnToVi ? "en" : "vi";
  const targetLang = isEnToVi ? "vi" : "en";

  const targetTranslation = isEnToVi ? results?.translation_vi : results?.translation_en;
  const primaryTranslation = targetTranslation || results?.translation;

  const renderPanel = () => (
    <>
      {isOpen && <div className={styles.backdrop} onClick={handleClose} />}

      <div ref={panelRef} className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🔤</div>
            <div className={styles.headerTitleWrapper}>
              <div className={styles.headerTitleRow}>
                <span className={styles.headerTitle}>BingTranslate</span>
                <span className={styles.badge2Way}>Song ngữ 2 chiều</span>
              </div>
              <div className={styles.headerSub}>
                {direction === "auto" && "🌐 Tự động nhận diện (Anh ⇄ Việt)"}
                {direction === "en_vi" && "🇬🇧 Tiếng Anh ➔ 🇻🇳 Tiếng Việt"}
                {direction === "vi_en" && "🇻🇳 Tiếng Việt ➔ 🇬🇧 Tiếng Anh"}
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {children && (
              <button
                className={styles.pageTranslateBtn}
                onClick={handleTranslatePage}
                title="Dịch toàn bộ trang hiện tại"
              >
                🌐 Dịch trang
              </button>
            )}
            <button className={styles.closeBtn} onClick={handleClose} title="Đóng">✕</button>
          </div>
        </div>

        {/* Direction Switcher Bar (Dịch 2 chiều) */}
        <div className={styles.directionBar}>
          <div className={styles.directionPills}>
            <button
              className={`${styles.directionPill} ${direction === "auto" ? styles.directionPillActive : ""}`}
              onClick={() => handleDirectionChange("auto")}
            >
              🌐 Tự động
            </button>
            <button
              className={`${styles.directionPill} ${direction === "en_vi" ? styles.directionPillActive : ""}`}
              onClick={() => handleDirectionChange("en_vi")}
            >
              🇬🇧 Anh ➔ 🇻🇳 Việt
            </button>
            <button
              className={`${styles.directionPill} ${direction === "vi_en" ? styles.directionPillActive : ""}`}
              onClick={() => handleDirectionChange("vi_en")}
            >
              🇻🇳 Việt ➔ 🇬🇧 Anh
            </button>
          </div>

          <button
            className={styles.swapBtn}
            onClick={handleSwapDirection}
            title="Đảo chiều dịch và hoán đổi văn bản (⇄)"
          >
            ⇄
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Source Input Box (Editable) */}
          <div className={styles.sourceCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardLabelBadge}>
                <span>{sourceLang === "en" ? "🇬🇧 Tiếng Anh" : "🇻🇳 Tiếng Việt"}</span>
                <span>·</span>
                <span>Văn bản cần dịch</span>
              </div>
              <span className={styles.charCount}>{inputText.length} ký tự</span>
            </div>

            <textarea
              className={styles.inputTextarea}
              placeholder="Nhập hoặc dán văn bản tiếng Anh / tiếng Việt (hoặc bôi đen chữ trên trang)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={3}
            />

            <div className={styles.cardFooterRow}>
              <div className={styles.toolBtnGroup}>
                <button
                  className={`${styles.toolBtn} ${speakingKey === "input" ? styles.toolBtnSpeaking : ""}`}
                  onClick={() => handleSpeak(inputText, sourceLang, "input")}
                  disabled={!inputText.trim()}
                  title="Phát âm văn bản gốc"
                >
                  🔊 Nghe
                </button>
                <button
                  className={styles.toolBtn}
                  onClick={() => handleCopy(inputText, "input")}
                  disabled={!inputText.trim()}
                  title="Sao chép văn bản gốc"
                >
                  {copiedKey === "input" ? "✓ Đã chép" : "📋 Sao chép"}
                </button>
                {inputText && (
                  <button
                    className={styles.toolBtn}
                    onClick={() => { setInputText(""); setResults(null); }}
                    title="Xóa văn bản"
                  >
                    ✕ Xóa
                  </button>
                )}
              </div>

              <button
                className={styles.translateSubmitBtn}
                onClick={() => doTranslate(inputText, direction)}
                disabled={loading || !inputText.trim()}
              >
                {loading ? "Đang dịch..." : "🚀 Dịch (Enter)"}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Đang phân tích & dịch song ngữ với AI...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && results?.error && (
            <div className={styles.errorState}>
              <div className={styles.errorHeader}>
                <span>⚠️</span>
                <span>Thông báo dịch thuật</span>
              </div>
              <p>{results.message || results.raw || "Đã xảy ra sự cố trong quá trình dịch. Vui lòng thử lại."}</p>
            </div>
          )}

          {/* Fallback Badge if in mock/demo mode */}
          {!loading && results?._fallback && (
            <div className={styles.fallbackNotice}>
              <span>⚡</span>
              <span>Chế độ mô phỏng cục bộ (Đang dùng dữ liệu toán học tích hợp)</span>
            </div>
          )}

          {/* Success Results */}
          {!loading && results && !results.error && (
            <>
              {/* Primary Translation Card */}
              <div className={styles.translationCard}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabelBadge} style={{ color: "#38bdf8" }}>
                    <span>{targetLang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}</span>
                    <span>·</span>
                    <span>Bản dịch chính</span>
                  </div>

                  <div className={styles.toolBtnGroup}>
                    <button
                      className={`${styles.toolBtn} ${speakingKey === "target" ? styles.toolBtnSpeaking : ""}`}
                      onClick={() => handleSpeak(primaryTranslation, targetLang, "target")}
                      title="Phát âm bản dịch"
                    >
                      🔊 Nghe
                    </button>
                    <button
                      className={styles.toolBtn}
                      onClick={() => handleCopy(primaryTranslation, "target")}
                      title="Sao chép bản dịch"
                    >
                      {copiedKey === "target" ? "✓ Đã chép" : "📋 Sao chép"}
                    </button>
                  </div>
                </div>

                <div className={styles.translationText}>
                  <StreamdownMessage content={primaryTranslation} />
                </div>
              </div>

              {/* Bilingual Comparison View Toggle */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className={styles.toolBtn}
                  onClick={() => setShowDualView(p => !p)}
                  style={{ fontSize: 11.5 }}
                >
                  {showDualView ? "➖ Thu gọn đối chiếu" : "🔀 Xem đối chiếu song ngữ Anh - Việt"}
                </button>
              </div>

              {/* Side-by-Side Dual Card View */}
              {showDualView && (
                <div className={styles.dualViewContainer}>
                  <div className={styles.dualCard}>
                    <div className={styles.dualCardTitle}>
                      <span>🇬🇧 Tiếng Anh</span>
                      <div className={styles.toolBtnGroup}>
                        <button
                          className={styles.toolBtn}
                          onClick={() => handleSpeak(results.translation_en, "en", "dual_en")}
                          style={{ padding: "2px 6px", fontSize: 11 }}
                        >
                          🔊
                        </button>
                        <button
                          className={styles.toolBtn}
                          onClick={() => handleCopy(results.translation_en, "dual_en")}
                          style={{ padding: "2px 6px", fontSize: 11 }}
                        >
                          {copiedKey === "dual_en" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div className={styles.dualCardText}>
                      <StreamdownMessage content={results.translation_en} />
                    </div>
                  </div>

                  <div className={styles.dualCard}>
                    <div className={styles.dualCardTitle}>
                      <span>🇻🇳 Tiếng Việt</span>
                      <div className={styles.toolBtnGroup}>
                        <button
                          className={styles.toolBtn}
                          onClick={() => handleSpeak(results.translation_vi, "vi", "dual_vi")}
                          style={{ padding: "2px 6px", fontSize: 11 }}
                        >
                          🔊
                        </button>
                        <button
                          className={styles.toolBtn}
                          onClick={() => handleCopy(results.translation_vi, "dual_vi")}
                          style={{ padding: "2px 6px", fontSize: 11 }}
                        >
                          {copiedKey === "dual_vi" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div className={styles.dualCardText}>
                      <StreamdownMessage content={results.translation_vi} />
                    </div>
                  </div>
                </div>
              )}

              {/* Conceptual Note & Summary */}
              {(results.summary_vi || results.summary_en || results.summary) && (
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span>💡</span>
                    <span>Ghi chú & Ý nghĩa toán học · Conceptual Note</span>
                  </div>

                  <div className={styles.summaryBody}>
                    {(results.summary_vi || results.summary) && (
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryFlag}>🇻🇳</span>
                        <div className={styles.summaryText}>
                          <StreamdownMessage content={results.summary_vi || results.summary} />
                        </div>
                      </div>
                    )}
                    {results.summary_en && (
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryFlag}>🇬🇧</span>
                        <div className={styles.summaryText}>
                          <StreamdownMessage content={results.summary_en} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Theory Expand Button */}
              {results.theory && (
                <div className={styles.theoryAction}>
                  <button
                    className={styles.moreBtn}
                    onClick={() => setShowTheory(p => !p)}
                  >
                    {showTheory ? "▲ Thu gọn lý thuyết & đồ thị" : "👁️ Xem lý thuyết song ngữ & đồ thị trực quan"}
                  </button>
                </div>
              )}

              {/* Theory Panel with KaTeX and Diagram */}
              {showTheory && results.theory && (
                <div className={styles.theoryPanel}>
                  <div className={styles.theoryHeader}>
                    <div className={styles.theoryTitle}>
                      <span>📘</span>
                      <span>Lý thuyết chi tiết · Detailed Theory</span>
                    </div>
                  </div>

                  {results.theory.vi && (
                    <div className={styles.theorySection}>
                      <div className={styles.theorySectionLabel} style={{ color: "#38bdf8" }}>
                        <span>🇻🇳</span>
                        <span>Tiếng Việt</span>
                      </div>
                      <div className={styles.theoryBody}>
                        <StreamdownMessage content={results.theory.vi} />
                      </div>
                    </div>
                  )}

                  {results.theory.en && (
                    <div className={styles.theorySection} style={{ marginTop: 8 }}>
                      <div className={styles.theorySectionLabel} style={{ color: "#a78bfa" }}>
                        <span>🇬🇧</span>
                        <span>English</span>
                      </div>
                      <div className={styles.theoryBody}>
                        <StreamdownMessage content={results.theory.en} />
                      </div>
                    </div>
                  )}

                  {results.diagram_type && results.diagram_type !== "default" && (
                    <div className={styles.diagramContainer}>
                      <div className={styles.diagramLabel}>📈 Minh họa trực quan · Visual Diagram:</div>
                      <div className={styles.diagramBox}>
                        <MathGraphSVG type={results.diagram_type} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vocabulary Cards */}
              {results.words?.length > 0 && (
                <div className={styles.wordList}>
                  <div className={styles.wordListLabel}>
                    <span>📖</span>
                    <span>Từ vựng song ngữ trọng tâm · Vocabulary</span>
                  </div>

                  {results.words.map((w, i) => (
                    <div key={i} className={styles.wordCard} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className={styles.wordTop}>
                        <div className={styles.wordLeft}>
                          <span className={styles.wordTerm}>{w.word}</span>
                          {w.type && (
                            <span
                              className={styles.wordType}
                              style={{ color: typeColor(w.type), borderColor: typeColor(w.type) }}
                            >
                              {w.type}
                            </span>
                          )}
                        </div>

                        <button
                          className={styles.toolBtn}
                          onClick={() => handleSpeak(w.english || w.word, "en", `word_${i}`)}
                          style={{ padding: "2px 7px", fontSize: 11 }}
                          title="Phát âm từ"
                        >
                          🔊
                        </button>
                      </div>

                      {w.pronunciation && (
                        <div className={styles.wordPronun}>{w.pronunciation}</div>
                      )}

                      <div className={styles.wordMeaningRow}>
                        {w.english && <span className={styles.wordEn}>🇬🇧 {w.english}</span>}
                        {w.vietnamese && <span className={styles.wordVi}>🇻🇳 {w.vietnamese}</span>}
                      </div>

                      {w.example && (
                        <div className={styles.wordExample}>e.g. &quot;{w.example}&quot;</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Hint / Empty State */}
          {!loading && !results && (
            <div className={styles.hintState}>
              <div className={styles.hintHeader}>
                <span>💡</span>
                <span>Hướng dẫn dịch thuật 2 chiều</span>
              </div>
              <p className={styles.hintText}>
                Bạn có thể <strong>bôi đen bất kỳ đoạn văn nào</strong> trên bài học để dịch ngay lập tức, hoặc nhập trực tiếp văn bản vào ô trên.
              </p>

              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                  Thử nhanh với các thuật ngữ mẫu:
                </span>
                <div className={styles.chipsContainer}>
                  <button
                    className={styles.chip}
                    onClick={() => handleSampleClick("Bài 1 · Dãy số", "vi_en")}
                  >
                    🇻🇳 Bài 1 · Dãy số
                  </button>
                  <button
                    className={styles.chip}
                    onClick={() => handleSampleClick("Arithmetic progression", "en_vi")}
                  >
                    🇬🇧 Arithmetic progression
                  </button>
                  <button
                    className={styles.chip}
                    onClick={() => handleSampleClick("Hàm số bậc hai và parabol", "vi_en")}
                  >
                    🇻🇳 Hàm số bậc hai
                  </button>
                  <button
                    className={styles.chip}
                    onClick={() => handleSampleClick("Cauchy-Schwarz inequality", "en_vi")}
                  >
                    🇬🇧 Cauchy inequality
                  </button>
                  <button
                    className={styles.chip}
                    onClick={() => handleSampleClick("Vectơ chỉ phương", "vi_en")}
                  >
                    🇻🇳 Vectơ chỉ phương
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (!children) {
    return renderPanel();
  }

  return (
    <div className={styles.root}>
      <div className={styles.content} ref={contentRef}>{children}</div>
      {renderPanel()}
    </div>
  );
}
