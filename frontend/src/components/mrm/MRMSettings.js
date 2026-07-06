/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ── Default keybinds ──────────────────────────────────────────────────────────
const DEFAULT_KEYBINDS = {
  pause:     { key: "Escape",      label: "Tạm dừng / Tiếp tục",  icon: "⏸",  desc: "Dừng trò chơi trong Singleplayer" },
  answer_a:  { key: "KeyZ",        label: "Chọn đáp án A",         icon: "🅰️", desc: "Phím tắt cho đáp án thứ nhất" },
  answer_b:  { key: "KeyX",        label: "Chọn đáp án B",         icon: "🅱️", desc: "Phím tắt cho đáp án thứ hai" },
  answer_c:  { key: "KeyC",        label: "Chọn đáp án C",         icon: "🇨",  desc: "Phím tắt cho đáp án thứ ba" },
  answer_d:  { key: "KeyV",        label: "Chọn đáp án D",         icon: "🇩",  desc: "Phím tắt cho đáp án thứ tư" },
  swap:      { key: "Space",       label: "Đổi câu hỏi (Swap)",    icon: "🔀",  desc: "Bỏ qua câu hỏi hiện tại (dùng 1 lần)" },
};

const STORAGE_KEY_PREFIX = "duomath_";

// Human-readable key names
function friendlyKey(code) {
  const map = {
    "Escape": "Esc", "Space": "Space", "Enter": "Enter",
    "Backspace": "⌫", "Tab": "Tab", "ShiftLeft": "Shift L",
    "ShiftRight": "Shift R", "ControlLeft": "Ctrl L", "ControlRight": "Ctrl R",
    "AltLeft": "Alt L", "AltRight": "Alt R",
    "ArrowUp": "↑", "ArrowDown": "↓", "ArrowLeft": "←", "ArrowRight": "→",
  };
  if (map[code]) return map[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num" + code.slice(6);
  if (code.startsWith("F") && !isNaN(code.slice(1))) return code;
  return code;
}

function KeyBadge({ keyCode, active, conflict }) {
  return (
    <kbd style={{
      display: "inline-block",
      background: active
        ? "rgba(34,211,238,0.15)"
        : conflict ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
      border: `1px solid ${active ? "rgba(34,211,238,0.5)" : conflict ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.18)"}`,
      borderRadius: 7,
      padding: "5px 14px",
      fontSize: 14,
      fontWeight: 800,
      fontFamily: "monospace",
      color: active ? "#22d3ee" : conflict ? "#f87171" : "white",
      boxShadow: active ? "0 0 12px rgba(34,211,238,0.25)" : "none",
      minWidth: 60,
      textAlign: "center",
      transition: "all 0.2s",
      letterSpacing: 0.5,
    }}>
      {friendlyKey(keyCode)}
    </kbd>
  );
}

export default function MRMSettings() {
  const [keybinds, setKeybinds] = useState(() => {
    const saved = {};
    Object.entries(DEFAULT_KEYBINDS).forEach(([id, def]) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PREFIX + id + "_key");
        saved[id] = stored || def.key;
      } catch { saved[id] = def.key; }
    });
    return saved;
  });

  const [listening, setListening] = useState(null); // which keybind is being recorded
  const [flash, setFlash] = useState(null);         // id that just changed
  const [saved, setSaved] = useState(false);

  // Detect conflicts
  const conflicts = {};
  const keyCounts = {};
  Object.entries(keybinds).forEach(([id, key]) => {
    keyCounts[key] = (keyCounts[key] || []);
    keyCounts[key].push(id);
  });
  Object.entries(keyCounts).forEach(([key, ids]) => {
    if (ids.length > 1) ids.forEach(id => { conflicts[id] = true; });
  });

  // Keyboard listener when recording
  useEffect(() => {
    if (!listening) return;
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const code = e.code;
      // Ignore modifier-only keys
      if (["ShiftLeft","ShiftRight","ControlLeft","ControlRight","AltLeft","AltRight","MetaLeft","MetaRight"].includes(code)) return;
      setKeybinds(prev => ({ ...prev, [listening]: code }));
      setFlash(listening);
      setTimeout(() => setFlash(null), 600);
      setListening(null);
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [listening]);

  const saveAll = () => {
    Object.entries(keybinds).forEach(([id, key]) => {
      try { localStorage.setItem(STORAGE_KEY_PREFIX + id + "_key", key); } catch {}
    });
    // Save the pause key with the name the game reads directly
    try { localStorage.setItem("duomath_pause_key", keybinds.pause); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetAll = () => {
    const defaults = {};
    Object.entries(DEFAULT_KEYBINDS).forEach(([id, def]) => { defaults[id] = def.key; });
    setKeybinds(defaults);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 50%, #06030f 100%)",
      fontFamily: "'Inter', 'Exo 2', sans-serif",
      color: "white",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 200, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "16px 32px",
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,211,238,0.12)",
        position: "relative", zIndex: 10,
      }}>
        <Link href="/mrm" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2 }}>
            DUO<span style={{ color: "#22d3ee" }}>MATH</span>
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
        <span style={{ fontSize: 14, color: "#22d3ee", fontWeight: 600 }}>⚙️ MRM Settings</span>

        <div style={{ flex: 1 }} />

        <Link href="/mrm/singleplayer" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
          }}>← Danh sách Map</button>
        </Link>
      </header>

      {/* Main */}
      <div style={{
        maxWidth: 680, margin: "0 auto", padding: "40px 24px",
        position: "relative", zIndex: 1,
      }}>

        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⌨️</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: 1 }}>
            Cài đặt phím tắt
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 }}>
            Nhấp vào ô phím rồi bấm phím mới để thay đổi keybind
          </p>
        </div>

        {/* Keybind rows */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {/* Section header */}
          <div style={{
            padding: "14px 24px",
            background: "rgba(34,211,238,0.05)",
            borderBottom: "1px solid rgba(34,211,238,0.1)",
            fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
            color: "#22d3ee",
          }}>
            SINGLEPLAYER — KEYBINDS
          </div>

          {Object.entries(DEFAULT_KEYBINDS).map(([id, def], i, arr) => {
            const isListening = listening === id;
            const isConflict = conflicts[id];
            const isFlash = flash === id;

            return (
              <div
                key={id}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "18px 24px",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: isListening
                    ? "rgba(34,211,238,0.05)"
                    : isFlash ? "rgba(34,211,238,0.08)" : "transparent",
                  transition: "background 0.3s",
                }}
              >
                {/* Icon */}
                <div style={{ fontSize: 20, flexShrink: 0, width: 30, textAlign: "center" }}>
                  {def.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>
                    {def.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    {def.desc}
                  </div>
                  {isConflict && (
                    <div style={{ fontSize: 10, color: "#f87171", marginTop: 3, fontWeight: 700 }}>
                      ⚠️ Phím này đang bị trùng với keybind khác!
                    </div>
                  )}
                </div>

                {/* Key bind button */}
                <button
                  onClick={() => setListening(isListening ? null : id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    outline: "none",
                  }}
                >
                  {isListening ? (
                    <kbd style={{
                      display: "inline-block",
                      background: "rgba(34,211,238,0.15)",
                      border: "2px solid #22d3ee",
                      borderRadius: 7, padding: "5px 18px",
                      fontSize: 12, fontWeight: 800, color: "#22d3ee",
                      animation: "mrmPulse 1s infinite",
                      minWidth: 100, textAlign: "center",
                      letterSpacing: 0.5,
                    }}>
                      Bấm phím...
                    </kbd>
                  ) : (
                    <KeyBadge
                      keyCode={keybinds[id]}
                      active={false}
                      conflict={isConflict}
                    />
                  )}
                </button>

                {/* Reset single */}
                <button
                  onClick={() => {
                    setKeybinds(prev => ({ ...prev, [id]: def.key }));
                  }}
                  title="Đặt lại mặc định"
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.25)", cursor: "pointer",
                    fontSize: 14, padding: "4px 6px", borderRadius: 6,
                    transition: "color 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fbbf24"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
                >
                  ↺
                </button>
              </div>
            );
          })}
        </div>

        {/* Conflict warning */}
        {Object.keys(conflicts).length > 0 && (
          <div style={{
            marginTop: 12,
            padding: "12px 18px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, fontSize: 12, color: "#f87171", fontWeight: 600,
          }}>
            ⚠️ Có {Object.keys(conflicts).length} keybind đang bị trùng nhau. Vui lòng chỉnh lại trước khi lưu.
          </div>
        )}

        {/* Action row */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <button
            onClick={resetAll}
            style={{
              padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          >
            ↺ Đặt lại tất cả
          </button>

          <button
            onClick={saveAll}
            disabled={Object.keys(conflicts).length > 0}
            style={{
              padding: "12px 32px", borderRadius: 10, fontSize: 14, fontWeight: 800,
              background: saved
                ? "linear-gradient(135deg, #4ade80, #16a34a)"
                : Object.keys(conflicts).length > 0
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, #22d3ee, #0ea5e9)",
              color: saved ? "#000" : Object.keys(conflicts).length > 0 ? "rgba(255,255,255,0.3)" : "#000",
              border: "none", cursor: Object.keys(conflicts).length > 0 ? "not-allowed" : "pointer",
              boxShadow: saved ? "0 4px 20px rgba(74,222,128,0.4)" : "0 4px 20px rgba(34,211,238,0.3)",
              transition: "all 0.3s",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {saved ? "✓ Đã lưu!" : "💾 Lưu keybind"}
          </button>
        </div>

        {/* Info card */}
        <div style={{
          marginTop: 32,
          padding: "18px 22px",
          background: "rgba(167,139,250,0.06)",
          border: "1px solid rgba(167,139,250,0.15)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#a78bfa", marginBottom: 10, letterSpacing: 0.5 }}>
            💡 Hướng dẫn
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 2 }}>
            <li>Nhấp vào ô phím (badge màu trắng) rồi bấm phím mới để thay đổi</li>
            <li>Phím <kbd style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>Esc</kbd> mặc định dùng để tạm dừng trò chơi</li>
            <li>Sau khi thay đổi, nhấn <strong style={{ color: "white" }}>Lưu keybind</strong> để áp dụng</li>
            <li>Keybind được lưu riêng trên trình duyệt này</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
