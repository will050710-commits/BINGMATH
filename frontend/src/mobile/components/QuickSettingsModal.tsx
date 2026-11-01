"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LIQUID_GLASS_OPACITY_PRESETS,
} from "../constants";
import {
  generateQuickMathQuestion,
  getQuickMathStats,
  recordQuickMathSolve,
} from "../quickMath";
import type { QuickMathQuestion, QuickMathStats, ThemeMode } from "../types";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export interface QuickSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onChangeThemeMode: (mode: ThemeMode) => void;
  liquidGlassOpacity: number;
  onChangeLiquidGlassOpacity: (opacity: number) => void;
  onOpenInterfaceGuide?: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  learnerScope?: string;
  authReady?: boolean;
}

/**
 * Web port of `QuickSettingsModal` extracted from D:\BingMATH.apk
 * (Hermes bundle lines 260454–261482)
 */
export function QuickSettingsModal({
  visible,
  onClose,
  themeMode,
  onChangeThemeMode,
  liquidGlassOpacity,
  onChangeLiquidGlassOpacity,
  onOpenInterfaceGuide,
  returnFocusRef,
  learnerScope = "guest",
  authReady = true,
}: QuickSettingsModalProps) {
  const { lang, setLang } = useLanguage();
  const isVi = lang === "vi";
  const { palette } = useTheme();

  const cardRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [quickQuestion, setQuickQuestion] = useState<QuickMathQuestion>(() =>
    generateQuickMathQuestion()
  );
  const [quickStats, setQuickStats] = useState<QuickMathStats>({
    bonusXp: 0,
    solvedToday: 0,
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Sync Quick Math stats and manage focus + body scroll lock when modal opens/closes
  useEffect(() => {
    if (!visible) return undefined;
    const returnFocusTarget = returnFocusRef?.current;

    if (typeof document !== "undefined") {
      previousFocusRef.current =
        (document.activeElement as HTMLElement | null) || null;
    }

    const prevOverflow =
      typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    const focusTimer = window.setTimeout(() => {
      setQuickStats(getQuickMathStats({ scope: learnerScope }));
      closeBtnRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusable = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !cardRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !cardRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = prevOverflow;
      }
      const restoreTarget =
        returnFocusTarget || previousFocusRef.current || null;
      if (restoreTarget && typeof restoreTarget.focus === "function") {
        window.setTimeout(() => {
          if (!document.querySelector('[role="dialog"]')) restoreTarget.focus();
        }, 0);
      }
    };
  }, [visible, onClose, returnFocusRef, learnerScope]);

  useEffect(() => {
    if (!visible) return;
    const refreshStats = () => setQuickStats(getQuickMathStats({ scope: learnerScope }));
    const timer = window.setInterval(refreshStats, 30_000);
    window.addEventListener("storage", refreshStats);
    document.addEventListener("visibilitychange", refreshStats);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refreshStats);
      document.removeEventListener("visibilitychange", refreshStats);
    };
  }, [visible, learnerScope]);

  if (!visible) return null;

  const pct = Math.round(liquidGlassOpacity * 100);

  const adjustOpacity = (delta: number) => {
    const next = Math.max(
      0.15,
      Math.min(1, Number((liquidGlassOpacity + delta).toFixed(2)))
    );
    onChangeLiquidGlassOpacity(next);
  };

  const handleSelectQuickOption = (opt: number) => {
    if (selectedOption !== null || !authReady) return;
    setSelectedOption(opt);
    if (opt === quickQuestion.answer) {
      const updated = recordQuickMathSolve(20, { scope: learnerScope });
      setQuickStats(updated);
    }
  };

  const handleNextQuickQuestion = () => {
    setSelectedOption(null);
    setShowHint(false);
    setQuickQuestion(generateQuickMathQuestion());
    setQuickStats(getQuickMathStats({ scope: learnerScope }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isVi ? "Cài đặt nhanh" : "Quick Settings"}
      data-theme-mode={palette.mode}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10020,
        background: "rgba(2, 6, 23, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          "max(12px, env(safe-area-inset-top, 12px)) max(12px, env(safe-area-inset-right, 12px)) max(12px, env(safe-area-inset-bottom, 12px)) max(12px, env(safe-area-inset-left, 12px))",
        overflowY: "auto",
      }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          maxHeight: "calc(100dvh - 24px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 24,
          padding: "16px 18px",
          background: palette.bgElevated,
          color: palette.text,
          border: `1.5px solid ${palette.borderAccent}`,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 12,
            flexShrink: 0,
            borderBottom: `1px solid ${palette.borderSubtle}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚙️</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                {isVi ? "Cài Đặt Nhanh" : "Quick Settings"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {isVi
                  ? "Ngôn ngữ & Giao diện Liquid Glass"
                  : "Language & Liquid Glass Theme"}
              </div>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            title={isVi ? "Đóng cài đặt nhanh" : "Close Quick Settings"}
            aria-label={isVi ? "Đóng cài đặt nhanh" : "Close Quick Settings"}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Region */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingTop: 14,
            paddingRight: 2,
          }}
        >
          {/* Language Section */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                opacity: 0.75,
                marginBottom: 8,
              }}
            >
              🌐 {isVi ? "Ngôn ngữ / Language" : "Language"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <button
                type="button"
                aria-pressed={isVi}
                onClick={() => setLang("vi")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: isVi
                    ? "1.5px solid #f43f5e"
                    : "1px solid rgba(148,163,184,0.25)",
                  background: isVi
                    ? "rgba(244, 63, 94, 0.18)"
                    : "rgba(148, 163, 184, 0.08)",
                  color: "inherit",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                type="button"
                aria-pressed={!isVi}
                onClick={() => setLang("en")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: !isVi
                    ? "1.5px solid #38bdf8"
                    : "1px solid rgba(148,163,184,0.25)",
                  background: !isVi
                    ? "rgba(56, 189, 248, 0.18)"
                    : "rgba(148, 163, 184, 0.08)",
                  color: "inherit",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Theme Mode Section */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                opacity: 0.75,
                marginBottom: 8,
              }}
            >
              🎨 {isVi ? "Chế độ giao diện" : "Theme Mode"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
              }}
            >
              {(
                [
                  { mode: "light", icon: "☀️", vi: "Sáng", en: "Light" },
                  { mode: "dark", icon: "🌙", vi: "Tối", en: "Dark" },
                  {
                    mode: "liquidGlass",
                    icon: "💧",
                    vi: "Kính Lỏng",
                    en: "Liquid Glass",
                  },
                  { mode: "system", icon: "🖥️", vi: "Hệ thống", en: "System" },
                ] as const
              ).map((item) => {
                const active = themeMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      onChangeThemeMode(item.mode);
                    }}
                    style={{
                      padding: "10px 6px",
                      borderRadius: 14,
                      border: active
                        ? "1.5px solid #38bdf8"
                        : "1px solid rgba(148,163,184,0.25)",
                      background: active
                        ? "rgba(56, 189, 248, 0.20)"
                        : "rgba(148, 163, 184, 0.08)",
                      color: "inherit",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 17 }}>{item.icon}</span>
                    <span>{isVi ? item.vi : item.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Liquid Glass Opacity Controls */}
          {themeMode === "liquidGlass" && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 16,
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                <span>
                  💧 {isVi ? "Độ đậm Kính Lỏng" : "Liquid Glass Opacity"}
                </span>
                <span style={{ color: "#38bdf8" }}>{pct}%</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {LIQUID_GLASS_OPACITY_PRESETS.map((preset) => {
                  const active = Math.abs(liquidGlassOpacity - preset.value) < 0.03;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        onChangeLiquidGlassOpacity(preset.value);
                      }}
                      style={{
                        padding: "6px 4px",
                        borderRadius: 10,
                        border: active
                          ? "1px solid #38bdf8"
                          : "1px solid rgba(148,163,184,0.25)",
                        background: active
                          ? "rgba(56, 189, 248, 0.25)"
                          : "rgba(148,163,184,0.08)",
                        color: "inherit",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {isVi ? preset.labelVI : preset.labelEN}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => adjustOpacity(-0.05)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.25)",
                    background: "rgba(148,163,184,0.1)",
                    color: "inherit",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  −5%
                </button>
                <button
                  type="button"
                  onClick={() => adjustOpacity(0.05)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.25)",
                    background: "rgba(148,163,184,0.1)",
                    color: "inherit",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  +5%
                </button>
              </div>
            </div>
          )}

          {/* Quick Math Daily Challenge Section */}
          <div
            data-testid="quick-math-card"
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 16,
              border: `1px solid ${palette.border}`,
              background: palette.bgGlass,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>
                ⚡ {isVi ? "Toán Nhanh Mỗi Ngày" : "Daily Quick Math"}
              </span>
              <span
                data-testid="quick-math-stats"
                style={{ color: palette.gold, fontSize: 11.5 }}
              >
                {isVi
                  ? `Hôm nay: ${quickStats.solvedToday} · +${quickStats.bonusXp} XP`
                  : `Today: ${quickStats.solvedToday} · +${quickStats.bonusXp} XP`}
              </span>
            </div>

            <div
              data-testid="quick-math-question"
              style={{
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 8,
                textAlign: "center",
                padding: "6px 8px",
                borderRadius: 10,
                background: palette.bgInput,
              }}
            >
              {quickQuestion.question}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                marginBottom: 8,
              }}
            >
              {quickQuestion.options.map((opt) => {
                const isPicked = selectedOption === opt;
                const isAnswer = opt === quickQuestion.answer;
                const showResult = selectedOption !== null;
                return (
                  <button
                    key={opt}
                    type="button"
                    data-testid={`quick-math-opt-${opt}`}
                    disabled={selectedOption !== null || !authReady}
                    onClick={() => handleSelectQuickOption(opt)}
                    style={{
                      padding: "7px 4px",
                      borderRadius: 10,
                      border: showResult
                        ? isAnswer
                          ? `1.5px solid ${palette.success}`
                          : isPicked
                            ? `1.5px solid ${palette.danger}`
                            : `1px solid ${palette.border}`
                        : `1px solid ${palette.border}`,
                      background: showResult
                        ? isAnswer
                          ? palette.successBg
                          : isPicked
                            ? palette.dangerBg
                            : "transparent"
                        : palette.bgInput,
                      color: "inherit",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: selectedOption === null ? "pointer" : "default",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: `1px solid ${palette.border}`,
                  background: "transparent",
                  color: "inherit",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                💡 {isVi ? "Gợi ý" : "Hint"}
              </button>
              <button
                type="button"
                onClick={handleNextQuickQuestion}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: `1px solid ${palette.borderAccent}`,
                  background: palette.primaryGlow,
                  color: "inherit",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔄 {isVi ? "Câu khác" : "Next"}
              </button>
            </div>

            {showHint && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11.5,
                  opacity: 0.85,
                }}
              >
                {isVi ? quickQuestion.hintVI : quickQuestion.hintEN}
              </div>
            )}
          </div>

          {/* Interface Guide Trigger */}
          {onOpenInterfaceGuide && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInterfaceGuide();
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                border: "1px solid rgba(192, 132, 252, 0.45)",
                background:
                  "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(168,85,247,0.18))",
                color: "inherit",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>✨</span>
              <span>
                {isVi
                  ? "Xem Hướng Dẫn Giao Diện V1.0"
                  : "View V1.0 Interface Tour"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickSettingsModal;
