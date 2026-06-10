"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DuoMCBSidebar.module.css";
import { createSession, chat } from "./duoServer";

/**
 * DuoMCBSidebar
 * Drop this into ANY page/component to get a sliding chatbot from the right.
 * Toggle button is a floating icon that opens the panel on click.
 *
 * Usage:
 *   import DuoMCBSidebar from "@/components/DuoMCB/DuoMCBSidebar";
 *   <DuoMCBSidebar />
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
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 350); }, [isOpen]);

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

  return (
    <>
      {/* Floating toggle button — icon only, round */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabHide : ""}`}
        onClick={() => setIsOpen(true)}
        title="Mở DuoMCB AI"
        aria-label="Mở DuoMCB AI Chatbot"
      >
        🎓
      </button>

      {/* Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}

      {/* Sidebar panel */}
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        {/* Header */}
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

        {/* Messages */}
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

        {/* Input */}
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
      </div>
    </>
  );
}
