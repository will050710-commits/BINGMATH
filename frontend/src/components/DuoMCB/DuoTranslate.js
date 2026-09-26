/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./DuoTranslate.module.css";
import { createSession, translateText } from "./duoServer";
import StreamdownMessage from "@/components/chat/StreamdownMessage";
import katex from "katex";
import "katex/dist/katex.min.css";
import MathGraphSVG from "@/components/thpt/Cacbaitoan10/MathGraphSVG";

// LaTeX parsing utility
function parseMathAndText(text) {
  if (!text) return [];
  const tokens = [];
  let index = 0;
  
  while (index < text.length) {
    const nextBlock = text.indexOf("$$", index);
    const nextBlockBracket = text.indexOf("\\[", index);
    const nextInline = text.indexOf("$", index);
    const nextInlineParen = text.indexOf("\\(", index);
    
    const finders = [
      { type: "block_dollar", index: nextBlock, startLen: 2, endDelim: "$$" },
      { type: "block_bracket", index: nextBlockBracket, startLen: 2, endDelim: "\\]" },
      { type: "inline_dollar", index: nextInline, startLen: 1, endDelim: "$" },
      { type: "inline_paren", index: nextInlineParen, startLen: 2, endDelim: "\\)" }
    ].filter(f => f.index !== -1).sort((a, b) => a.index - b.index);
    
    if (finders.length === 0) {
      tokens.push({ type: "text", content: text.substring(index) });
      break;
    }
    
    const first = finders[0];
    
    if (first.index > index) {
      tokens.push({ type: "text", content: text.substring(index, first.index) });
    }
    
    const searchStart = first.index + first.startLen;
    const endIdx = text.indexOf(first.endDelim, searchStart);
    
    if (endIdx === -1) {
      tokens.push({ type: "text", content: text.substring(first.index) });
      break;
    }
    
    const mathContent = text.substring(searchStart, endIdx);
    const isBlock = first.type.startsWith("block");
    tokens.push({ type: "math", content: mathContent, isBlock });
    
    index = endIdx + first.endDelim.length;
  }
  
  return tokens;
}

/**
 * DuoTranslate
 * Wrap any lesson page.jsx (must have "use client") with this component:
 *   <DuoTranslate><YourLesson /></DuoTranslate>
 *
 * Requires main.py running at http://localhost:8000
 */
export default function DuoTranslate({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showTheory, setShowTheory] = useState(false);
  // Phase 4: the wrapper node is read by the "translate this page" button.
  const contentRef = useRef(null);
  const panelRef = useRef(null);
  const lastTranslatedRef = useRef("");
  const debounceRef = useRef(null);
  const mouseDownRef = useRef({ x: 0, y: 0, target: null });

  useEffect(() => { initSession(); }, []);

  async function initSession() {
    const sid = await createSession();
    setSessionId(sid || "offline-" + Date.now());
  }

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
      doTranslate(text);
    }, 80);
  }, [doTranslate, isInteractive]); 

  async function doTranslate(text) {
    setSelectedText(text);
    setIsOpen(true);
    setLoading(true);
    setResults(null);
    setShowTheory(false);
    try {
      const parsed = await translateText(text);

      // If backend flagged an error but `raw` is actually valid JSON, try to use it
      if (parsed?.error && parsed?.raw) {
        try {
          // Strip any markdown fences
          let raw = parsed.raw.trim()
            .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          // Extract first JSON object if there's surrounding text
          const m = raw.match(/(\{[\s\S]*\})/);
          if (m) raw = m[1];
          const recovered = JSON.parse(raw);
          if (recovered.translation) {
            setResults(recovered);
            return;
          }
        } catch (_) { /* not parseable — fall through to show error */ }
      }

      setResults(parsed);
    } catch (e) {
      setResults({ error: true, raw: `Unexpected error: ${e?.message || e}\n\nMake sure main.py is running.` });
    } finally {
      setLoading(false);
    }
  }

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
    lastTranslatedRef.current = ""; // allow re-translating same text after closing
  };

  // Phase 4: "dịch trang" — take the wrapped page's visible text and translate it
  // as one bilingual block (the backend accepts up to 1500 characters).
  const handleTranslatePage = () => {
    const node = contentRef.current;
    if (!node) return;
    const pageText = (node.innerText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
    if (pageText.length < 2) return;
    lastTranslatedRef.current = pageText;
    doTranslate(pageText);
  };

  const typeColors = {
    noun: "#60a5fa", verb: "#34d399", adj: "#f472b6",
    adv: "#fbbf24", prep: "#a78bfa", conj: "#fb923c",
  };
  const typeColor = (t) => typeColors[t?.toLowerCase()] || "#9ca3af";

  // Phase 4: the previous KaTeX token renderer (renderMathText) was replaced by
  // <StreamdownMessage>, which renders markdown + LaTeX and sanitises the output.

  const isEnToVi = results?.source_lang ? results.source_lang === "en" : true;

  const renderPanel = () => (
    <>
      {isOpen && <div className={styles.backdrop} onClick={handleClose} />}

      <div ref={panelRef} className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🔤</span>
            <div>
              <div className={styles.headerTitle}>DuoTranslate</div>
              <div className={styles.headerSub}>{isEnToVi ? "🇬🇧 EN ➔ 🇻🇳 VI" : "🇻🇳 VI ➔ 🇬🇧 EN"} · song ngữ</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {children && (
              <button
                onClick={handleTranslatePage}
                title="Dịch cả trang này (EN ⇄ VI)"
                style={{
                  border: "1px solid rgba(34,211,238,0.35)",
                  background: "rgba(34,211,238,0.12)",
                  color: "#67e8f9",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🌐 Dịch trang
              </button>
            )}
            <button className={styles.closeBtn} onClick={handleClose}>✕</button>
          </div>
        </div>

        {/* Selected text preview */}
        {selectedText && (
          <div className={styles.selectedPreview}>
            <span className={styles.selectedLabel}>Selected</span>
            <p className={styles.selectedText}>&quot;{selectedText}&quot;</p>
          </div>
        )}

        <div className={styles.body}>

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Translating...</p>
            </div>
          )}

          {/* Error with full diagnostic message */}
          {!loading && results?.error && (
            <div className={styles.errorState}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 8 }}>
                {results.raw}
              </p>
            </div>
          )}

          {/* Success */}
          {!loading && results && !results.error && (
            <div className={styles.results}>

              {/* Phase 4: both languages side by side, in both directions */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <div className={styles.translationCard}>
                  <div className={styles.cardLabel}>🇬🇧 English</div>
                  <StreamdownMessage className={styles.translationText} content={results.translation_en} />
                </div>
                <div className={styles.translationCard}>
                  <div className={styles.cardLabel}>🇻🇳 Tiếng Việt</div>
                  <StreamdownMessage className={styles.translationText} content={results.translation_vi} />
                </div>
              </div>

              {(results.summary_vi || results.summary_en || results.summary) && (
                <div className={styles.summaryCard}>
                  <div className={styles.cardLabel}>💡 Ghi chú · Conceptual note</div>
                  {(results.summary_vi || results.summary) && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ marginRight: 6 }}>🇻🇳</span>
                      <StreamdownMessage className={styles.summaryText} content={results.summary_vi || results.summary} />
                    </div>
                  )}
                  {results.summary_en && (
                    <div>
                      <span style={{ marginRight: 6 }}>🇬🇧</span>
                      <StreamdownMessage className={styles.summaryText} content={results.summary_en} />
                    </div>
                  )}
                </div>
              )}

              {/* Theory Expand Button */}
              {results.theory && (
                <div className={styles.theoryAction}>
                  <button
                    className={styles.moreBtn}
                    onClick={() => setShowTheory(p => !p)}
                  >
                    {showTheory ? "▲ Thu gọn lý thuyết" : "👁️ Xem lý thuyết song ngữ & đồ thị"}
                  </button>
                </div>
              )}

              {/* Theory Panel — both languages stacked (Phase 4) */}
              {showTheory && results.theory && (
                <div className={styles.theoryPanel}>
                  <div className={styles.theoryHeader}>
                    <div className={styles.theoryTitle}>📘 Lý thuyết chi tiết · Detailed theory</div>
                  </div>
                  {results.theory.vi && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#22d3ee", marginBottom: 6 }}>🇻🇳 Tiếng Việt</div>
                      <StreamdownMessage className={styles.theoryBody} content={results.theory.vi} />
                    </div>
                  )}
                  {results.theory.en && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#a78bfa", marginBottom: 6 }}>🇬🇧 English</div>
                      <StreamdownMessage className={styles.theoryBody} content={results.theory.en} />
                    </div>
                  )}
                  {results.diagram_type && results.diagram_type !== "default" && (
                    <div className={styles.diagramContainer}>
                      <div className={styles.diagramLabel}>📈 Minh họa trực quan · Visual illustration:</div>
                      <div className={styles.diagramBox}>
                        <MathGraphSVG type={results.diagram_type} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {results.words?.length > 0 && (
                <div className={styles.wordList}>
                  <div className={styles.wordListLabel}>📖 Từ vựng song ngữ · Vocabulary</div>
                  {results.words.map((w, i) => (
                    <div key={i} className={styles.wordCard} style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className={styles.wordTop}>
                        <span className={styles.wordEn}>{w.word}</span>
                        <span className={styles.wordType} style={{ color: typeColor(w.type), borderColor: typeColor(w.type) }}>
                          {w.type}
                        </span>
                      </div>
                      {w.pronunciation && <div className={styles.wordPronun}>{w.pronunciation}</div>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {w.english && <span className={styles.wordBiItem} style={{ fontSize: 13 }}>🇬🇧 {w.english}</span>}
                        {w.vietnamese && <span className={styles.wordVi}>🇻🇳 {w.vietnamese}</span>}
                      </div>
                      {w.example && <div className={styles.wordExample}>e.g. &quot;{w.example}&quot;</div>}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {!loading && !results && (
            <div className={styles.hintState}>
              <span>🖱️</span>
              <p>Bôi đen bất kỳ đoạn văn nào để dịch song ngữ</p>
              {children && (
                <button
                  className={styles.moreBtn}
                  style={{ marginTop: 14 }}
                  onClick={handleTranslatePage}
                >
                  🌐 Dịch cả trang này · Translate this page
                </button>
              )}
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
