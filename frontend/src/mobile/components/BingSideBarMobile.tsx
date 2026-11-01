"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BING_MCB_SUGGESTIONS,
  DarkTheme,
  LightTheme,
  buildLiquidGlassPalette,
} from "../constants";
import type { BingMCBEdgeSide, BingMCBMessage, BingMCBMode } from "../types";
import { createSession, chat } from "@/components/DuoMCB/duoServer";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const MOBILE_MAX_WIDTH = 768;

/**
 * Web port of the APK's draggable, edge-tucking `BingSideBar` AI Tutor
 * (Hermes bundle lines 282784–286240)
 *
 * Behavior reproduced from the APK:
 * - Tucked state (`isTucked = true`): docks flush to left (`x = 0`) or right (`x = window.innerWidth - 44`) screen edge.
 * - First activation while tucked: slides out to `x = 8` (left) or `window.innerWidth - 146` (right) showing full pill ("🎓 BingMCB AI").
 * - Second activation while untucked: opens the bottom-sheet AI Tutor modal with Hint (`💡`) / Solution (`📝`) mode toggle and 4 quick suggestion chips.
 * - Drag release (`hypot(dx, dy) >= 6`): clamps Y to `[60, innerHeight - 130]` and snaps to nearest edge without opening chat.
 */
export function BingSideBarMobile() {
  const { lang } = useLanguage();
  const { resolvedMobileTheme, liquidGlassOpacity } = useTheme();
  const isVi = lang === "vi";

  const [mounted, setMounted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTucked, setIsTucked] = useState(true);
  const [edgeSide, setEdgeSide] = useState<BingMCBEdgeSide>("right");
  const [posY, setPosY] = useState(280);
  const [sheetMaxHeight, setSheetMaxHeight] = useState<string>(
    "min(82dvh, calc(100dvh - 16px))"
  );
  const [visibleViewport, setVisibleViewport] = useState<{ height: number; top: number } | null>(null);
  const [mode, setMode] = useState<BingMCBMode>("hint");
  const sessionIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<BingMCBMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origY: number;
    dragging: boolean;
  } | null>(null);
  const suppressNextClickRef = useRef(false);

  // Conversation generation & cancellation refs
  const conversationGenRef = useRef(0);
  const sessionPromiseRef = useRef<Promise<string> | null>(null);
  const sessionAbortRef = useRef<AbortController | null>(null);
  const chatAbortRef = useRef<AbortController | null>(null);

  const palette =
    resolvedMobileTheme === "light"
      ? LightTheme
      : resolvedMobileTheme === "dark"
        ? DarkTheme
        : buildLiquidGlassPalette(liquidGlassOpacity);

  // Track viewport size and software keyboard height via visualViewport
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncViewport = () => {
      const mobile = window.innerWidth < MOBILE_MAX_WIDTH;
      setIsMobileViewport(mobile);
      if (!mobile) {
        setIsOpen(false);
        setIsTucked(true);
      } else {
        setPosY((prev) => {
          const maxH = Math.max(120, window.innerHeight - 130);
          return Math.min(Math.max(60, prev), maxH);
        });
      }
      const vvHeight = window.visualViewport?.height || window.innerHeight;
      if (vvHeight > 0) {
        setVisibleViewport({ height: vvHeight, top: window.visualViewport?.offsetTop || 0 });
        setSheetMaxHeight(`${Math.max(0, Math.min(720, vvHeight - 16, Math.round(vvHeight * 0.9)))}px`);
      }
    };

    setPosY(Math.max(120, Math.round(window.innerHeight * 0.38)));
    syncViewport();
    setMounted(true);

    window.addEventListener("resize", syncViewport, { passive: true });
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", syncViewport);
      vv.addEventListener("scroll", syncViewport);
    }

    return () => {
      window.removeEventListener("resize", syncViewport);
      if (vv) {
        vv.removeEventListener("resize", syncViewport);
        vv.removeEventListener("scroll", syncViewport);
      }
      conversationGenRef.current += 1;
      sessionAbortRef.current?.abort();
      chatAbortRef.current?.abort();
      sessionPromiseRef.current = null;
      sessionIdRef.current = null;
    };
  }, []);

  const ensureSession = useCallback(
    async (gen: number): Promise<string> => {
      if (sessionIdRef.current && conversationGenRef.current === gen) {
        return sessionIdRef.current;
      }
      if (sessionPromiseRef.current && conversationGenRef.current === gen) {
        return sessionPromiseRef.current;
      }

      const controller = new AbortController();
      sessionAbortRef.current?.abort();
      sessionAbortRef.current = controller;

      const promise = (async () => {
        try {
          const sid = await createSession({ signal: controller.signal });
          const resolved = sid || `offline-${Date.now()}`;
          if (conversationGenRef.current === gen && !controller.signal.aborted) {
            sessionIdRef.current = resolved;
          }
          return resolved;
        } catch {
          const fallback = `offline-${Date.now()}`;
          if (conversationGenRef.current === gen && !controller.signal.aborted) {
            sessionIdRef.current = fallback;
          }
          return fallback;
        } finally {
          if (sessionAbortRef.current === controller) {
            sessionPromiseRef.current = null;
          }
        }
      })();

      sessionPromiseRef.current = promise;
      return promise;
    },
    []
  );

  // Close handler that restores focus to the floating tutor button
  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
    setIsTucked(true);
    window.setTimeout(() => {
      triggerBtnRef.current?.focus();
    }, 0);
  }, []);

  // Lazily create session on first open, lock body scroll, trap focus, and handle Escape
  useEffect(() => {
    if (!isOpen || !isMobileViewport) return undefined;

    void ensureSession(conversationGenRef.current);

    const prevOverflow =
      typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseModal();
        return;
      }
      if (e.key === "Tab" && sheetRef.current) {
        const focusable = Array.from(
          sheetRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !sheetRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !sheetRef.current.contains(active)) {
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
    };
  }, [isOpen, isMobileViewport, ensureSession, handleCloseModal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleReset = useCallback(() => {
    conversationGenRef.current += 1;
    const nextGen = conversationGenRef.current;
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    sessionAbortRef.current?.abort();
    sessionAbortRef.current = null;
    sessionPromiseRef.current = null;
    sessionIdRef.current = null;
    setMessages([]);
    setInputText("");
    setIsLoading(false);
    void ensureSession(nextGen);
  }, [ensureSession]);

  async function handleSend(customPrompt?: string) {
    const text = (customPrompt ?? inputText).trim();
    if (!text || isLoading) return;
    if (!customPrompt) setInputText("");

    const myGen = conversationGenRef.current;
    const controller = new AbortController();
    chatAbortRef.current?.abort();
    chatAbortRef.current = controller;

    const userMsg: BingMCBMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const activeSid = await ensureSession(myGen);
      if (conversationGenRef.current !== myGen || controller.signal.aborted) {
        return;
      }

      const res = await chat(activeSid, text, {
        mode,
        signal: controller.signal,
      });

      if (
        conversationGenRef.current !== myGen ||
        controller.signal.aborted ||
        res?.kind === "cancelled"
      ) {
        return;
      }

      if (res?.error) {
        const errorText =
          typeof res.reply === "string" && res.reply.trim()
            ? res.reply
            : isVi
              ? "⚠️ Không thể kết nối máy chủ BingMCB lúc này. Vui lòng thử lại sau giây lát!"
              : "⚠️ Could not connect to BingMCB AI server. Please try again shortly!";
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-err`, role: "assistant", content: errorText },
        ]);
        return;
      }

      const reply =
        res?.reply ||
        (isVi
          ? "Xin chào! BingMCB đã nhận câu hỏi của bạn."
          : "Hello! BingMCB received your question.");

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content: reply },
      ]);
    } catch {
      if (conversationGenRef.current !== myGen || controller.signal.aborted) {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-catch`,
          role: "assistant",
          content: isVi
            ? "⚠️ Không thể kết nối máy chủ BingMCB lúc này. Vui lòng thử lại sau giây lát!"
            : "⚠️ Could not connect to BingMCB AI server. Please try again shortly!",
        },
      ]);
    } finally {
      if (conversationGenRef.current === myGen) {
        setIsLoading(false);
      }
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.isPrimary || e.button !== 0) return;
    suppressNextClickRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events without active pointerId
    }
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origY: posY,
      dragging: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) >= 6) {
      dragRef.current.dragging = true;
      suppressNextClickRef.current = true;
      const maxH = typeof window !== "undefined" ? window.innerHeight - 130 : 650;
      const clampedY = Math.min(Math.max(60, dragRef.current.origY + dy), maxH);
      setPosY(clampedY);
    }
  };

  const finishDrag = (clientX?: number) => {
    if (!dragRef.current) return;
    const wasDragging = dragRef.current.dragging;
    dragRef.current = null;

    if (wasDragging && typeof clientX === "number") {
      const vw = typeof window !== "undefined" ? window.innerWidth : 390;
      const nextSide: BingMCBEdgeSide = clientX < vw / 2 ? "left" : "right";
      setEdgeSide(nextSide);
      setIsTucked(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    finishDrag(e.clientX);
  };

  const handlePointerCancel = () => {
    suppressNextClickRef.current = false;
    dragRef.current = null;
  };

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressNextClickRef.current && e.detail !== 0) {
      suppressNextClickRef.current = false;
      return;
    }
    if (isTucked) {
      setIsTucked(false);
    } else {
      setIsOpen(true);
    }
  };

  if (!mounted || !isMobileViewport) return null;

  const activeButtonY = isOpen ? 10 : posY;

  return (
    <>
      {/* Edge-tucking floating button (bundle lines 283421–283715) — GPU-accelerated via translate3d */}
      <button
        ref={triggerBtnRef}
        type="button"
        className="flex md:hidden"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isVi ? "Trợ lý AI BingMCB" : "BingMCB AI Tutor"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleTriggerClick}
        title={isVi ? "Trợ lý AI BingMCB" : "BingMCB AI Tutor"}
        style={{
          position: "fixed",
          top: 0,
          left: edgeSide === "left" ? (isTucked ? 0 : 8) : "auto",
          right: edgeSide === "right" ? (isTucked ? 0 : 8) : "auto",
          transform: `translate3d(0, ${activeButtonY}px, 0)`,
          willChange: "transform, width",
          zIndex: 9995,
          visibility: isOpen ? "hidden" : "visible",
          height: 44,
          width: isTucked ? 44 : 138,
          borderRadius: isTucked
            ? edgeSide === "right"
              ? "22px 0 0 22px"
              : "0 22px 22px 0"
            : 22,
          border: `1.5px solid ${palette.borderAccent}`,
          background: `linear-gradient(135deg, ${palette.gradientPrimary[0]}, ${palette.gradientPrimary[1]})`,
          color: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          boxShadow: "0 8px 24px rgba(2, 132, 199, 0.45)",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          transition:
            "width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.25s ease",
        }}
      >
        {isTucked ? (
          <span style={{ fontSize: 15, fontWeight: 800 }}>
            {edgeSide === "right" ? "❮ 🎓" : "🎓 ❯"}
          </span>
        ) : (
          <>
            <span style={{ fontSize: 18 }}>🎓</span>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              BingMCB AI
            </span>
          </>
        )}
      </button>

      {/* Bottom-Sheet Modal (bundle lines 284720–285880) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="BingMCB AI Tutor"
          onClick={handleCloseModal}
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: visibleViewport?.top || 0,
            height: visibleViewport?.height || "100dvh",
            zIndex: 10010,
            background: "rgba(2, 6, 23, 0.68)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            ref={sheetRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 640,
              height: sheetMaxHeight,
              maxHeight: "calc(100dvh - 16px)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              background: palette.bgElevated,
              border: `1.5px solid ${palette.borderAccent}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: palette.text,
              backdropFilter: palette.isLiquidGlass ? "blur(24px)" : "none",
              WebkitBackdropFilter: palette.isLiquidGlass
                ? "blur(24px)"
                : "none",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${palette.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🎓</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>
                    BingMCB AI Tutor
                  </div>
                  <div style={{ fontSize: 11.5, color: palette.textSecondary }}>
                    {isVi
                      ? "Gia sư Toán song ngữ VI & EN"
                      : "Bilingual Math AI Tutor"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleReset}
                  title={isVi ? "Cuộc trò chuyện mới" : "Reset conversation"}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: `1px solid ${palette.border}`,
                    background: palette.bgGlass,
                    color: palette.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🔄 {isVi ? "Mới" : "Reset"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  title={isVi ? "Đóng trợ lý AI" : "Close AI Tutor"}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    border: `1px solid ${palette.border}`,
                    background: palette.bgGlass,
                    color: palette.text,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mode Selector: Hint vs Solution */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                padding: "10px 16px",
                background: palette.bgGlass,
                borderBottom: `1px solid ${palette.borderSubtle}`,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                aria-pressed={mode === "hint"}
                onClick={() => setMode("hint")}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border:
                    mode === "hint"
                      ? `1.5px solid ${palette.primary}`
                      : `1px solid ${palette.border}`,
                  background:
                    mode === "hint" ? palette.primaryGlow : "transparent",
                  color:
                    mode === "hint" ? palette.primary : palette.textSecondary,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                💡 {isVi ? "Chế độ Gợi ý (Hint)" : "Hint Mode"}
              </button>
              <button
                type="button"
                aria-pressed={mode === "solution"}
                onClick={() => setMode("solution")}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border:
                    mode === "solution"
                      ? `1.5px solid ${palette.accent}`
                      : `1px solid ${palette.border}`,
                  background:
                    mode === "solution" ? palette.accentGlow : "transparent",
                  color:
                    mode === "solution" ? palette.accent : palette.textSecondary,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📝 {isVi ? "Lời giải chi tiết" : "Full Solution"}
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.length === 0 && (
                <div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px 8px",
                      color: palette.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    {isVi
                      ? "Chọn câu hỏi gợi ý hoặc nhập bài toán của bạn:"
                      : "Pick a starter topic or type your math problem:"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {BING_MCB_SUGGESTIONS.map((s, idx) => {
                      const label = isVi ? s.vi : s.en;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void handleSend(label)}
                          style={{
                            textAlign: "left",
                            padding: "10px 14px",
                            borderRadius: 14,
                            border: `1px solid ${palette.borderAccent}`,
                            background: palette.primaryGlow,
                            color: palette.text,
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ✦ {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 16,
                    background:
                      m.role === "user"
                        ? `linear-gradient(135deg, ${palette.gradientPrimary[0]}, ${palette.gradientPrimary[1]})`
                        : palette.bgCard,
                    color: m.role === "user" ? "#ffffff" : palette.text,
                    border:
                      m.role === "assistant"
                        ? `1px solid ${palette.border}`
                        : "none",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              ))}

              {isLoading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    padding: "10px 14px",
                    borderRadius: 16,
                    background: palette.bgCard,
                    border: `1px solid ${palette.border}`,
                    color: palette.textSecondary,
                    fontSize: 12.5,
                  }}
                >
                  ⏳ {isVi ? "BingMCB đang suy nghĩ..." : "BingMCB is thinking..."}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div
              style={{
                padding:
                  "10px 12px max(10px, env(safe-area-inset-bottom, 10px))",
                borderTop: `1px solid ${palette.border}`,
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                aria-label={
                  isVi
                    ? "Nhập bài toán hoặc câu hỏi"
                    : "Ask a math question"
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleSend()}
                placeholder={
                  isVi
                    ? "Nhập bài toán hoặc câu hỏi..."
                    : "Ask a math question..."
                }
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: `1px solid ${palette.border}`,
                  background: palette.bgInput,
                  color: palette.text,
                  fontSize: 13.5,
                  minWidth: 0,
                }}
              />
              <button
                type="button"
                aria-label={isVi ? "Gửi tin nhắn" : "Send message"}
                title={isVi ? "Gửi tin nhắn" : "Send message"}
                onClick={() => void handleSend()}
                disabled={!inputText.trim() || isLoading}
                style={{
                  padding: "0 18px",
                  borderRadius: 14,
                  border: "none",
                  background:
                    inputText.trim() && !isLoading
                      ? `linear-gradient(135deg, ${palette.gradientPrimary[0]}, ${palette.gradientPrimary[1]})`
                      : "rgba(148,163,184,0.2)",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor:
                    inputText.trim() && !isLoading ? "pointer" : "not-allowed",
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BingSideBarMobile;
