"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DarkTheme,
  INTERFACE_GUIDE_STEPS,
  LightTheme,
  STORAGE_KEYS,
  buildLiquidGlassPalette,
} from "../constants";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

const ENGLISH_STEPS = [
  {
    badge: "BINGMCB AI TUTOR", title: "Your tutor at the edge of the screen",
    subtitle: "Keep your lesson in view and open help when you need it.",
    bullets: ["Drag the tutor button to either edge.", "Activate it once to expand, then again to open the conversation.", "Choose Hint for guidance or Full Solution for a worked answer."],
  },
  {
    badge: "LIQUID GLASS", title: "Your learning shortcuts",
    subtitle: "Navigate between Home, Learn, Battle, Library, and Profile.",
    bullets: ["The navigation stays at the bottom of the screen.", "Swipe the navigation row to reach all shortcuts on a narrow phone.", "Adjust the glass opacity in Quick Settings."],
  },
  {
    badge: "QUICK SETTINGS", title: "Choose your language and appearance",
    subtitle: "Open the gear button on the bottom navigation.",
    bullets: ["Switch between Vietnamese and English.", "Choose Light, Dark, Liquid Glass, or your system preference.", "Try Quick Math and revisit this guide from Quick Settings."],
  },
];

export interface InterfaceGuideModalProps {
  visible: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Web port of the 3-step V1.0 Official `InterfaceGuideModal`
 * extracted from D:\BingMATH.apk (Hermes bundle lines 262123–263168)
 */
export function InterfaceGuideModal({
  visible,
  onClose,
  returnFocusRef,
}: InterfaceGuideModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const { lang } = useLanguage();
  const isVi = lang === "vi";
  const { resolvedMobileTheme, liquidGlassOpacity } = useTheme();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const skipBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleFinish = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.V1_GUIDE_SEEN, "true");
        localStorage.removeItem(STORAGE_KEYS.TRIGGER_V1_GUIDE);
        window.dispatchEvent(new Event("duomath-guide-trigger"));
      } catch {
        // Ignore storage errors
      }
    }
    setStepIdx(0);
    onClose();
  }, [onClose]);

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
      skipBtnRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleFinish();
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
  }, [visible, handleFinish, returnFocusRef]);

  if (!visible) return null;

  const baseStep = INTERFACE_GUIDE_STEPS[stepIdx] || INTERFACE_GUIDE_STEPS[0];
  const step = isVi ? baseStep : { ...baseStep, ...ENGLISH_STEPS[stepIdx] };
  const isLast = stepIdx === INTERFACE_GUIDE_STEPS.length - 1;
  const palette =
    resolvedMobileTheme === "light"
      ? LightTheme
      : resolvedMobileTheme === "dark"
        ? DarkTheme
        : buildLiquidGlassPalette(liquidGlassOpacity);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      onClick={handleFinish}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10030,
        background: "rgba(2, 6, 23, 0.78)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
          maxWidth: 440,
          maxHeight: "calc(100dvh - 24px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 26,
          padding: "18px 20px",
          background: palette.bgElevated,
          color: palette.text,
          border: `1.5px solid ${step.color}`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.65), 0 0 32px ${step.bgGlow}`,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Top Badge + Skip (sticky) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            paddingBottom: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "5px 10px",
              borderRadius: 999,
              background: step.bgGlow,
              color: step.color,
              border: `1px solid ${step.color}`,
            }}
          >
            {step.badge}
          </span>
          <button
            ref={skipBtnRef}
            type="button"
            onClick={handleFinish}
            style={{
              background: "transparent",
              border: "none",
              color: palette.textSecondary,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 8,
            }}
          >
            {isVi ? "Bỏ qua ✕" : "Skip ✕"}
          </button>
        </div>

        {/* Scrollable Content Region */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingRight: 2,
          }}
        >
          {/* Hero Icon + Title */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                margin: "0 auto 8px",
                background: step.bgGlow,
                border: `1.5px solid ${step.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              {step.icon}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 5px" }}>
              {step.title}
            </h3>
            <p
              style={{
                fontSize: 12.5,
                color: palette.textSecondary,
                margin: 0,
              }}
            >
              {step.subtitle}
            </p>
          </div>

          {/* Bullets */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
              padding: 13,
              borderRadius: 16,
              background: palette.bgGlass,
              border: `1px solid ${palette.border}`,
              marginBottom: 14,
            }}
          >
            {step.bullets.map((b, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: palette.text,
                }}
              >
                <span style={{ color: step.color, fontWeight: 800 }}>✦</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stepper Dots + Navigation Buttons (sticky bottom) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            flexShrink: 0,
            borderTop: `1px solid ${palette.borderSubtle}`,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {INTERFACE_GUIDE_STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === stepIdx ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    i === stepIdx ? step.color : "rgba(148,163,184,0.3)",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={() => setStepIdx((p) => p - 1)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  background: "transparent",
                  color: palette.textSecondary,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {isVi ? "← Trước" : "← Back"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) handleFinish();
                else setStepIdx((p) => p + 1);
              }}
              style={{
                padding: "9px 18px",
                borderRadius: 12,
                border: "none",
                background: step.color,
                color: "#020c1b",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {isLast ? (isVi ? "Bắt đầu trải nghiệm 🚀" : "Get started 🚀") : (isVi ? "Tiếp theo →" : "Next →")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterfaceGuideModal;
