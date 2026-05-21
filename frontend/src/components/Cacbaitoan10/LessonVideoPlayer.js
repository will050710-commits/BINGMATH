/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────
   LessonVideoPlayer
   Props:
     videoId   – YouTube video ID string
     subtitles – array of subtitle objects:
                 { start: number (sec), end: number (sec),
                   words: [ { text: string,
                              vi: string,          // Vietnamese tooltip
                              detail?: string,     // sidebar full detail (HTML allowed)
                              detailTitle?: string // sidebar title
                            } ] }
     lang      – "vi" | "en" (for UI labels)
     credit    – optional source attribution string
   ─────────────────────────────────────────────────*/
export default function LessonVideoPlayer({ videoId, subtitles = [], lang = "vi", credit }) {
  const t = (vi, en) => (lang === "vi" ? vi : en);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sidebar state
  const [sidebar, setSidebar] = useState({ open: false, title: "", detail: "", vi: "" });

  // ── YouTube IFrame API ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onYTReady = () => {
      if (!iframeRef.current) return;
      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e) => {
            // 1 = playing
            setIsPlaying(e.data === 1);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYTReady();
    } else {
      // Load YouTube IFrame API
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.__onYouTubeIframeAPIReady_lvp = onYTReady;
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        onYTReady();
      };
    }
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // ── Poll current time ──────────────────────────────────────────────
  useEffect(() => {
    const poll = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          setCurrentTime(playerRef.current.getCurrentTime());
        } catch (_) {}
      }
    };
    timerRef.current = setInterval(poll, 250);
    return () => clearInterval(timerRef.current);
  }, [playerReady]);

  // ── Active subtitle ─────────────────────────────────────────────────
  const activeSub = subtitles.find(
    (s) => currentTime >= s.start && currentTime < s.end
  ) || null;

  const handleWordClick = useCallback((word) => {
    setSidebar({ open: true, title: word.detailTitle || word.text, detail: word.detail, vi: word.vi });
  }, []);

  // ── Inline styles ────────────────────────────────────────────────────
  const S = {
    wrapper: {
      position: "relative",
      borderRadius: 16,
      overflow: "visible",
      marginBottom: 32,
      boxShadow: "0 8px 32px rgba(11,79,92,0.13)",
    },
    videoBox: {
      position: "relative",
      paddingTop: "56.25%",
      borderRadius: "16px 16px 0 0",
      overflow: "hidden",
      background: "#000",
    },
    iframe: {
      position: "absolute",
      top: "-1px",
      left: "-1px",
      width: "calc(100% + 2px)",
      height: "calc(100% + 2px)",
      border: "none",
    },
    subtitleBar: {
      background: "linear-gradient(135deg, #0B4F5C 0%, #0e6678 100%)",
      borderRadius: "0 0 16px 16px",
      padding: "14px 20px",
      minHeight: 52,
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "4px 6px",
    },
    subtitleWord: () => ({
      display: "inline-block",
      padding: "3px 7px",
      borderRadius: 6,
      fontSize: 15,
      fontWeight: 500,
      color: "white",
      cursor: "pointer",
      background: "rgba(255,255,255,0.15)",
      transition: "background 0.15s, transform 0.12s",
      userSelect: "none",
      lineHeight: 1.5,
    }),
    noSubtitle: {
      color: "rgba(255,255,255,0.45)",
      fontSize: 14,
      fontStyle: "italic",
    },
    creditBar: {
      marginTop: 8,
      padding: "6px 12px",
      borderRadius: 8,
      background: "#f0f7f9",
      fontSize: 12,
      color: "#888",
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    /* Removed Tooltip Styles */
    /* Right Sidebar */
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      zIndex: 10000,
      backdropFilter: "blur(2px)",
    },
    sidebar: (open) => ({
      position: "fixed",
      top: 0, right: 0,
      width: "min(420px, 95vw)",
      height: "100vh",
      background: "white",
      zIndex: 10001,
      boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
      display: "flex",
      flexDirection: "column",
      transform: open ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.35s cubic-bezier(.2,.8,.2,1)",
    }),
    sidebarHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px 16px",
      borderBottom: "1px solid #f0f0f0",
      background: "linear-gradient(135deg,#0B4F5C,#0e6678)",
      color: "white",
      flexShrink: 0,
    },
    sidebarTitle: {
      fontSize: 20,
      fontWeight: 700,
    },
    sidebarCloseBtn: {
      background: "rgba(255,255,255,0.15)",
      border: "none",
      borderRadius: 8,
      color: "white",
      width: 36, height: 36,
      cursor: "pointer",
      fontSize: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    sidebarBody: {
      flex: 1,
      overflowY: "auto",
      padding: "24px",
    },
  };

  return (
    <>
      {/* ── Sidebar overlay ── */}
      {sidebar.open && (
        <div style={S.overlay} onClick={() => setSidebar((p) => ({ ...p, open: false }))} />
      )}

      {/* ── Sidebar panel ── */}
      <div style={S.sidebar(sidebar.open)}>
        <div style={S.sidebarHeader}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 2 }}>📖 {t("Giải thích chi tiết", "Detailed Explanation")}</div>
            <div style={S.sidebarTitle}>{sidebar.title}</div>
          </div>
          <button style={S.sidebarCloseBtn} onClick={() => setSidebar((p) => ({ ...p, open: false }))}>✕</button>
        </div>
        <div style={S.sidebarBody}>
          {sidebar.vi && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{t("Dịch nghĩa", "Translation")}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0B4F5C" }}>{sidebar.vi}</div>
            </div>
          )}
          {sidebar.detail && (
            <div
              style={{ fontSize: 15, lineHeight: 1.85, color: "#333", borderTop: sidebar.vi ? "1px solid #f0f0f0" : "none", paddingTop: sidebar.vi ? 16 : 0 }}
              dangerouslySetInnerHTML={{ __html: sidebar.detail }}
            />
          )}
        </div>
      </div>

      {/* ── Main video widget ── */}
      <div style={S.wrapper}>
        <div style={S.videoBox}>
          <iframe
            ref={iframeRef}
            style={S.iframe}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&cc_load_policy=0`}
            title="Lesson Explanation Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* ── Subtitle bar ── */}
        <div style={S.subtitleBar}>
          {activeSub ? (
            activeSub.words.map((w, i) => (
              <span
                key={i}
                className="lvp-word"
                style={S.subtitleWord()}
                onClick={() => handleWordClick(w)}
                title={t("Nhấn để xem chi tiết", "Click for details")}
              >
                {w.text}
              </span>
            ))
          ) : (
            <span style={S.noSubtitle}>
              {t("▶ Phát video để xem phụ đề tương tác", "▶ Play the video to see interactive subtitles")}
            </span>
          )}
        </div>

        {/* ── Credit bar ── */}
        {credit && (
          <div style={S.creditBar}>
            <span>🎬</span>
            <span
              dangerouslySetInnerHTML={{
                __html: credit.replace(
                  /Khan Academy/g,
                  `<a href="https://www.youtube.com/@khanacademy" target="_blank" rel="noopener noreferrer" style="color: #0B4F5C; text-decoration: underline; font-weight: 600; transition: opacity 0.2s;" onMouseOver="this.style.opacity=0.8" onMouseOut="this.style.opacity=1">Khan Academy</a>`
                ),
              }}
            />
          </div>
        )}
      </div>

      {/* Hover style for subtitle words */}
      <style>{`
        .lvp-word:hover { background: rgba(255,255,255,0.3) !important; transform: translateY(-1px) !important; }
      `}</style>
    </>
  );
}
