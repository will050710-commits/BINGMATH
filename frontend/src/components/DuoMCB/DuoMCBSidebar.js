"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DuoMCBSidebar.module.css";
import { createSession, chat } from "./duoServer";

/**
 * DuoMCBSidebar — composable AI chat panel toggled from bottom-right FAB.
 */
export default function DuoMCBSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { initSession(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  async function initSession() {
    const sid = await createSession();
    if (sid) setSessionId(sid);
    else setSessionId("offline-" + Date.now());
  }

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg, id: Date.now() }]);
    setLoading(true);
    try {
      const data = await chat(sessionId, msg);
      if (data.error) throw new Error("server-offline");
      setMessages((p) => [...p, { role: "assistant", content: data.reply, id: Date.now() + 1 }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "⚠️ Server offline. Run `python server.py`.", id: Date.now() + 1 }]);
    } finally { setLoading(false); }
  }

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <>
      {/* Bottom-right toggle — always visible */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabActive : ""}`}
        onClick={toggleSidebar}
        title={isOpen ? "Đóng DuoMCB AI" : "Mở DuoMCB AI"}
        aria-label={isOpen ? "Đóng DuoMCB AI Chatbot" : "Mở DuoMCB AI Chatbot"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "🎓"}
      </button>

      {/* Only mount panel when open — prevents white strip leak */}
      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} aria-hidden="true" />

          <aside
            className={`${styles.panel} ${styles.panelOpen}`}
            role="dialog"
            aria-label="DuoMCB AI Tutor"
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <span>🎓</span>
                <div>
                  <div className={styles.panelName}>DuoMCB</div>
                  <div className={styles.panelSub}>AI Tutor · EN & VI</div>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.iconBtn} onClick={() => { setMessages([]); initSession(); }} title="New chat">✏️</button>
                <button className={styles.iconBtn} onClick={() => setIsOpen(false)} title="Close">✕</button>
              </div>
            </div>

            <div className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎓</div>
                  <p>Ask me anything in<br /><strong>English</strong> or <strong>Tiếng Việt</strong></p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`${styles.msgRow} ${m.role === "user" ? styles.userRow : styles.botRow}`}>
                  {m.role === "assistant" && <div className={styles.avatar}>🎓</div>}
                  <div className={`${styles.bubble} ${m.role === "user" ? styles.userBubble : styles.botBubble}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className={`${styles.msgRow} ${styles.botRow}`}>
                  <div className={styles.avatar}>🎓</div>
                  <div className={`${styles.bubble} ${styles.botBubble} ${styles.typing}`}>
                    <span /><span /><span />
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
              >➤</button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
