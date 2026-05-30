/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./DuoTranslate.module.css";
import { createSession, translateText } from "./duoServer";

/**
 * DuoTranslate
 * Wrap any lesson page.jsx (must have "use client") with this component:
 *   <DuoTranslate><YourLesson /></DuoTranslate>
 *
 * Requires server.py running at http://localhost:5000
 */
export default function DuoTranslate({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
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
    try {
      
      const parsed = await translateText(text);
      setResults(parsed);
    } catch (e) {
      setResults({ error: true, raw: `Unexpected error: ${e?.message || e}\n\nMake sure server.py is running.` });
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

  const typeColors = {
    noun: "#60a5fa", verb: "#34d399", adj: "#f472b6",
    adv: "#fbbf24", prep: "#a78bfa", conj: "#fb923c",
  };
  const typeColor = (t) => typeColors[t?.toLowerCase()] || "#9ca3af";

  return (
    <div className={styles.root}>
      <div className={styles.content}>{children}</div>

      {isOpen && <div className={styles.backdrop} onClick={handleClose} />}

      <div ref={panelRef} className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🔤</span>
            <div>
              <div className={styles.headerTitle}>DuoTranslate</div>
              <div className={styles.headerSub}>EN → VI</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
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

              <div className={styles.translationCard}>
                <div className={styles.cardLabel}>🇻🇳 Bản dịch</div>
                <p className={styles.translationText}>{results.translation}</p>
              </div>

              {results.summary && (
                <div className={styles.summaryCard}>
                  <div className={styles.cardLabel}>💡 Ghi chú</div>
                  <p className={styles.summaryText}>{results.summary}</p>
                </div>
              )}

              {results.words?.length > 0 && (
                <div className={styles.wordList}>
                  <div className={styles.wordListLabel}>📖 Từ vựng</div>
                  {results.words.map((w, i) => (
                    <div key={i} className={styles.wordCard} style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className={styles.wordTop}>
                        <span className={styles.wordEn}>{w.word}</span>
                        <span className={styles.wordType} style={{ color: typeColor(w.type), borderColor: typeColor(w.type) }}>
                          {w.type}
                        </span>
                      </div>
                      {w.pronunciation && <div className={styles.wordPronun}>{w.pronunciation}</div>}
                      <div className={styles.wordVi}>{w.vietnamese}</div>
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
              <p>Bôi đen bất kỳ đoạn văn nào để dịch sang tiếng Việt</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
