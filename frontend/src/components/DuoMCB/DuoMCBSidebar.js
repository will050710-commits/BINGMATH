"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./DuoMCBSidebar.module.css";
import { createSession, chat } from "./duoServer";

const DESKTOP_MIN_WIDTH = 768;

/**
 * DuoMCBSidebar — composable AI chat panel toggled from bottom-right sticky FAB on desktop (`>= 768px`).
 * Rendered via portal on document.body so position:fixed works while scrolling.
 * On viewports `< 768px`, `BingSideBarMobile` owns the tutor experience.
 */
export default function DuoMCBSidebar() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sessionPromiseRef = useRef(null);
  const conversationGenRef = useRef(0);
  const chatAbortRef = useRef(null);
  const sessionAbortRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncViewport = () => {
      const desktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsOpen(false);
      }
    };
    syncViewport();
    setMounted(true);
    window.addEventListener("resize", syncViewport, { passive: true });
    return () => {
      window.removeEventListener("resize", syncViewport);
      conversationGenRef.current += 1;
      chatAbortRef.current?.abort();
      sessionAbortRef.current?.abort();
      sessionPromiseRef.current = null;
      sessionIdRef.current = null;
    };
  }, []);

  const ensureSession = useCallback(async (gen = conversationGenRef.current) => {
    if (sessionIdRef.current) return sessionIdRef.current;
    if (sessionPromiseRef.current) return sessionPromiseRef.current;

    const controller = new AbortController();
    sessionAbortRef.current = controller;
    const promise = (async () => {
      const sid = await createSession({ signal: controller.signal });
      const resolved = sid || `offline-${Date.now()}`;
      if (conversationGenRef.current === gen && !controller.signal.aborted) {
        sessionIdRef.current = resolved;
      }
      if (sessionAbortRef.current === controller) sessionPromiseRef.current = null;
      return resolved;
    })();

    sessionPromiseRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isDesktop || !isOpen) {
      return undefined;
    }
    void ensureSession(conversationGenRef.current);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 350);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDesktop, isOpen, ensureSession]);

  function handleResetConversation() {
    conversationGenRef.current += 1;
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    sessionAbortRef.current?.abort();
    sessionAbortRef.current = null;
    sessionPromiseRef.current = null;
    sessionIdRef.current = null;
    setMessages([]);
    setInput("");
    setLoading(false);
    void ensureSession(conversationGenRef.current);
  }

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    const myGen = conversationGenRef.current;
    const controller = new AbortController();
    chatAbortRef.current?.abort();
    chatAbortRef.current = controller;

    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg, id: Date.now() }]);
    setLoading(true);
    try {
      const activeSid = await ensureSession(myGen);
      if (conversationGenRef.current !== myGen || controller.signal.aborted) return;
      const data = await chat(activeSid, msg, { signal: controller.signal });
      if (conversationGenRef.current !== myGen || controller.signal.aborted) return;
      if (data?.kind === "cancelled") return;
      if (data?.error) {
        const errReply =
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "⚠️ Không thể kết nối với máy chủ BingMCB. Vui lòng thử lại sau.";
        setMessages((p) => [
          ...p,
          { role: "assistant", content: errReply, id: Date.now() + 1 },
        ]);
        return;
      }
      setMessages((p) => [
        ...p,
        { role: "assistant", content: data.reply || "", id: Date.now() + 1 },
      ]);
    } catch {
      if (conversationGenRef.current !== myGen || controller.signal.aborted) return;
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: "⚠️ Không thể kết nối với máy chủ BingMCB. Vui lòng thử lại sau.",
          id: Date.now() + 1,
        },
      ]);
    } finally {
      if (conversationGenRef.current === myGen) {
        setLoading(false);
      }
    }
  }

  if (!mounted || !isDesktop) return null;

  return createPortal(
    <div className="hidden md:block">
      <button
        className={`${styles.fab} ${isOpen ? styles.fabActive : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? "Đóng BingMCB AI" : "Mở BingMCB AI"}
        aria-label={isOpen ? "Đóng BingMCB AI Chatbot" : "Mở BingMCB AI Chatbot"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "🎓"}
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} aria-hidden="true" />

          <aside className={styles.panel} role="dialog" aria-label="BingMCB AI Tutor">
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <span>🎓</span>
                <div>
                  <div className={styles.panelName}>BingMCB</div>
                  <div className={styles.panelSub}>AI Tutor · EN & VI</div>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.iconBtn}
                  onClick={handleResetConversation}
                  title="New chat"
                >
                  ✏️
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎓</div>
                  <p>
                    Ask me anything in
                    <br />
                    <strong>English</strong> or <strong>Tiếng Việt</strong>
                  </p>
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.msgRow} ${m.role === "user" ? styles.userRow : styles.botRow}`}
                >
                  {m.role === "assistant" && <div className={styles.avatar}>🎓</div>}
                  <div
                    className={`${styles.bubble} ${m.role === "user" ? styles.userBubble : styles.botBubble}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className={`${styles.msgRow} ${styles.botRow}`}>
                  <div className={styles.avatar}>🎓</div>
                  <div className={`${styles.bubble} ${styles.botBubble} ${styles.typing}`}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className={styles.inputArea}>
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Type a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className={`${styles.sendBtn} ${input.trim() && !loading ? styles.sendActive : ""}`}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                ➤
              </button>
            </div>
          </aside>
        </>
      )}
    </div>,
    document.body
  );
}
