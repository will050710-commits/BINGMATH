"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DuoMCBPage.module.css";
import Image from "next/image";
import { createSession, chat } from "./duoServer";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";

const SUGGESTED = [
  { icon: "📐", text: "Solve x² - 5x + 6 = 0 step by step" },
  { icon: "📊", text: "Explain mean, median and standard deviation" },
  { icon: "📝", text: "Give me bilingual exercises on trigonometry" },
  { icon: "🧪", text: "What is Newton's second law of motion?" },
];

const TOOLS = [
  { id: "hint",     icon: "💡", label: "Gợi Ý Socratic",     desc: "Hướng dẫn từng bước nhỏ" },
  { id: "solution", icon: "📖", label: "Giải Đầy Đủ",        desc: "Lời giải chi tiết hoàn chỉnh" },
  { id: "video",    icon: "🎬", label: "Tạo Video Giải",      desc: "Video hoạt hình giải bài" },
];

// ── LaTeX & Markdown Parser Helper Functions ────────────────────────────────
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

function renderTextWithMarkdown(text, key, styles) {
  const lines = text.split("\n");
  return (
    <span key={key}>
      {lines.map((line, lineIdx) => {
        let content = line;
        let isHeader = false;
        let isBullet = false;
        
        if (content.startsWith("### ")) {
          content = content.replace("### ", "");
          isHeader = true;
        } else if (content.startsWith("## ")) {
          content = content.replace("## ", "");
          isHeader = true;
        } else if (content.startsWith("# ")) {
          content = content.replace("# ", "");
          isHeader = true;
        }
        
        if (content.trim().startsWith("- ")) {
          content = content.trim().replace("- ", "");
          isBullet = true;
        } else if (content.trim().startsWith("* ")) {
          content = content.trim().replace("* ", "");
          isBullet = true;
        }
        
        const boldRegex = /\*\*([\s\S]*?)\*\*/g;
        const parts = [];
        let lastIdx = 0;
        let match;
        
        while ((match = boldRegex.exec(content)) !== null) {
          if (match.index > lastIdx) {
            parts.push(content.substring(lastIdx, match.index));
          }
          parts.push(<strong key={match.index}>{match[1]}</strong>);
          lastIdx = boldRegex.lastIndex;
        }
        
        if (lastIdx < content.length) {
          parts.push(content.substring(lastIdx));
        }
        
        const renderedLine = parts.length > 0 ? parts : content;
        
        if (isHeader) {
          return (
            <h3 key={lineIdx} className={styles.msgHeader}>
              {renderedLine}
            </h3>
          );
        }
        
        if (isBullet) {
          return (
            <li key={lineIdx} className={styles.msgListItem}>
              {renderedLine}
            </li>
          );
        }
        
        return (
          <span key={lineIdx}>
            {renderedLine}
            {lineIdx < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

// ── Video Player Modal ────────────────────────────────────────────────────
function VideoModal({ question, onClose }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [shared, setShared] = useState(false);
  const frameRef = useRef(0);
  const totalFrames = 300; // ~10 seconds at 30fps

  const mathLines = [
    question ? question.substring(0, 60) : "Solving the math problem...",
    "Step 1: Identify the equation",
    "Step 2: Apply the formula",
    "\\Delta = b^2 - 4ac",
    "Step 3: Calculate the roots",
    "x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}",
    "Step 4: Verify the solution ✓",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 360;

    function drawFrame(frame) {
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid background
      ctx.strokeStyle = "rgba(99,102,241,0.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Animated circle (decorative)
      const t = frame / totalFrames;
      ctx.strokeStyle = "rgba(0,216,254,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width - 80, 80, 50 + Math.sin(t * Math.PI * 4) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Draw math lines progressively
      const linesPerFrame = totalFrames / mathLines.length;
      const visibleLines = Math.floor(frame / linesPerFrame);

      mathLines.forEach((line, i) => {
        if (i > visibleLines) return;
        const y = 80 + i * 40;
        const lineProgress = i < visibleLines ? 1 : (frame % linesPerFrame) / linesPerFrame;
        const isFormula = line.startsWith("\\");

        ctx.save();
        ctx.globalAlpha = Math.min(1, lineProgress * 2);

        if (isFormula) {
          ctx.font = "bold 22px 'Courier New', monospace";
          ctx.fillStyle = "#00d8fe";
          ctx.textAlign = "center";
          // Simulate formula rendering with colored text
          ctx.fillText(line.replace(/\\/g, ""), canvas.width / 2, y);
        } else {
          ctx.font = `${i === 0 ? "16px" : "18px"} 'Sora', sans-serif`;
          ctx.fillStyle = i === 0 ? "#9ca3af" : "#e5e7eb";
          ctx.textAlign = "center";
          const chars = Math.floor(line.length * lineProgress);
          ctx.fillText(line.substring(0, chars), canvas.width / 2, y);
        }

        // Underline active line
        if (i === visibleLines) {
          ctx.fillStyle = "#6366f1";
          ctx.fillRect(canvas.width / 2 - 30, y + 6, 60 * lineProgress, 2);
        }

        ctx.restore();
      });

      // DuoMath watermark
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.font = "12px 'Sora', sans-serif";
      ctx.fillStyle = "#00d8fe";
      ctx.textAlign = "left";
      ctx.fillText("DuoMath AI Video", 12, canvas.height - 12);
      ctx.restore();
    }

    function animate() {
      if (!isPlaying) return;
      frameRef.current = (frameRef.current + 1) % totalFrames;
      drawFrame(frameRef.current);
      setProgress((frameRef.current / totalFrames) * 100);
      animRef.current = requestAnimationFrame(animate);
    }

    drawFrame(frameRef.current);
    if (isPlaying) {
      animRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, question]);

  function togglePlay() {
    setIsPlaying(p => !p);
  }

  function handleShare() {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.videoModalHeader}>
          <div className={styles.videoModalTitle}>
            <span className={styles.videoModalIcon}>🎬</span>
            <span>DuoMath Video Giải</span>
            <span className={styles.videoBadge}>AI Generated</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Canvas player */}
        <div className={styles.videoWrapper}>
          <canvas ref={canvasRef} className={styles.videoCanvas} />
          {/* Progress bar */}
          <div className={styles.videoProgressBar}>
            <div className={styles.videoProgressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Controls */}
        <div className={styles.videoControls}>
          <div className={styles.videoControlsLeft}>
            <button className={styles.videoCtrlBtn} onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button className={styles.videoCtrlBtn} onClick={() => { frameRef.current = 0; setProgress(0); }} title="Replay">
              🔄
            </button>
            <span className={styles.videoDuration}>
              {Math.floor((progress / 100) * 10)}s / 10s
            </span>
          </div>
          <button
            className={`${styles.shareBtn} ${shared ? styles.shareBtnSuccess : ""}`}
            onClick={handleShare}
          >
            {shared ? "✓ Đã sao chép!" : "🔗 Chia sẻ Video"}
          </button>
        </div>

        {/* Problem label */}
        {question && (
          <div className={styles.videoProblemLabel}>
            <span className={styles.videoProblemIcon}>📝</span>
            <span className={styles.videoProblemText}>{question}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tools Dropdown ─────────────────────────────────────────────────────────
function ToolsDropdown({ onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.toolsDropdownWrapper} ref={ref}>
      <button
        className={styles.toolsBtn}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        title="Công cụ AI"
      >
        <span>⚙️</span>
        <span>Tools</span>
        <span className={`${styles.toolsChevron} ${open ? styles.toolsChevronOpen : ""}`}>▾</span>
      </button>
      {open && (
        <div className={styles.toolsMenu}>
          <div className={styles.toolsMenuHeader}>Chọn công cụ AI</div>
          {TOOLS.map(t => (
            <button
              key={t.id}
              className={styles.toolsMenuItem}
              onClick={() => { setOpen(false); onSelect(t.id); }}
            >
              <span className={styles.toolsMenuIcon}>{t.icon}</span>
              <div className={styles.toolsMenuText}>
                <span className={styles.toolsMenuLabel}>{t.label}</span>
                <span className={styles.toolsMenuDesc}>{t.desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DuoMCBPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [videoQuestion, setVideoQuestion] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [chatHistory] = useState([
    { id: 1, title: "Quadratic equations help", date: "Today" },
    { id: 2, title: "Statistics exercises", date: "Today" },
    { id: 3, title: "Newton's laws review", date: "Yesterday" },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { initSession(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function initSession() {
    const sid = await createSession();
    setSessionId(sid || "offline-" + Date.now());
  }

  async function ensureSession() {
    let sid = sessionId;
    if (!sid || sid.startsWith("offline-")) {
      sid = await createSession();
      if (!sid) sid = "offline-" + Date.now();
      setSessionId(sid);
    }
    return sid;
  }

  // ── Image file selection ──
  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageBase64(ev.target.result);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ── Send image with chosen mode ──
  async function sendImageMessage(mode) {
    setShowImageModal(false);
    if (mode === "video") {
      setVideoQuestion(input.trim() || "Bài toán từ ảnh");
      setShowVideo(true);
      return;
    }
    const modeText = mode === "hint"
      ? "Provide A FEW HINTS to solve this problem without giving the answer"
      : "Look at the problem in this image and solve it STEP BY STEP for me.";

    const userMsg = { role: "user", content: modeText, image: imagePreview, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const sid = await ensureSession();

    try {
      const data = await chat(sid, modeText, { image: imageBase64, mode: mode === "hint" ? "hint" : "solution" });
      if (data.error) throw new Error("bad response");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error, id: Date.now() + 1 }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Không thể xử lý ảnh. Vui lòng thử lại sau.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
      setImagePreview(null);
      setImageBase64(null);
    }
  }

  // ── Send text message ──
  async function sendMessage(text, mode = "hint") {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (mode === "video") {
      setVideoQuestion(msg);
      setShowVideo(true);
      setInput("");
      return;
    }

    setInput("");
    const sid = await ensureSession();
    setMessages((prev) => [...prev, { role: "user", content: msg, id: Date.now() }]);
    setLoading(true);
    try {
      const data = await chat(sid, msg, { mode: mode === "hint" ? "hint" : "solution" });
      if (data.error) throw new Error("bad response");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, id: Date.now() + 1 }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Không thể kết nối với máy chủ DuoMCB. Vui lòng thử lại sau.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  }

  function handleToolSelect(toolId) {
    const msg = input.trim();
    if (!msg && toolId !== "video") return;
    sendMessage(msg || null, toolId);
  }

  function newChat() {
    setMessages([]);
    initSession();
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.root}>

      {/* ── VIDEO MODAL ── */}
      {showVideo && (
        <VideoModal
          question={videoQuestion}
          onClose={() => setShowVideo(false)}
        />
      )}

      {/* ── IMAGE MODAL ── */}
      {showImageModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowImageModal(false); setImagePreview(null); setImageBase64(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>🖼️ Ảnh đã tải lên</span>
              <button className={styles.modalClose} onClick={() => { setShowImageModal(false); setImagePreview(null); setImageBase64(null); }}>✕</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className={styles.modalPreview} />
            <p className={styles.modalQuestion}>Bạn muốn DuoMCB làm gì với bài toán này?</p>
            <div className={styles.modalActions}>
              <button className={styles.hintBtn} onClick={() => sendImageMessage("hint")}>
                💡 Gợi ý
              </button>
              <button className={styles.answerBtn} onClick={() => sendImageMessage("answer")}>
                📖 Giải đầy đủ
              </button>
              <button className={styles.videoModalBtn} onClick={() => sendImageMessage("video")}>
                🎬 Video Giải
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            {sidebarOpen && <span className={styles.logoText}>DuoMCB</span>}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {sidebarOpen && (
          <>
            <button className={styles.newChatBtn} onClick={newChat}>
              <span>✏️</span> New Chat
            </button>
            <div className={styles.historySection}>
              <p className={styles.historyLabel}>Recent</p>
              {chatHistory.map((h) => (
                <button key={h.id} className={styles.historyItem}>
                  <span className={styles.historyIcon}>💬</span>
                  <span className={styles.historyTitle}>{h.title}</span>
                </button>
              ))}
            </div>
            <div className={styles.sidebarFooter}>
              <div className={styles.modelBadge}>
                <span className={styles.modelDot} />
                llama-3.3-70b
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>DuoMCB</span>
          <span className={styles.headerSub}>Bilingual AI Tutor</span>
          <div className={styles.headerActions}> <Link href="/">Go back</Link></div>
        </header>

        <div className={styles.chatArea}>
          {isEmpty ? (
            <div className={styles.welcome}>
              <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB Logo" width={64} height={64} style={{ width: 64, height: "auto" }} />
              <h1 className={styles.welcomeTitle}>Hello, I&apos;m DuoMCB</h1>
              <p className={styles.welcomeSub}>Your bilingual <strong>DUOMATH</strong> chatbot!</p>
              <div className={styles.suggestions}>
                {SUGGESTED.map((s, i) => (
                  <button key={i} className={styles.suggestionCard} onClick={() => sendMessage(s.text)}>
                    <span className={styles.suggestionIcon}>{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((m) => (
                <div key={m.id} className={`${styles.msgRow} ${m.role === "user" ? styles.userRow : styles.botRow}`}>
                  {m.role === "assistant" && (
                    <div className={styles.avatar}>
                      <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB" width={32} height={32} />
                    </div>
                  )}
                  <div className={`${styles.bubble} ${m.role === "user" ? styles.userBubble : styles.botBubble}`}>
                    {m.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image} alt="Uploaded" className={styles.bubbleImage} />
                    )}
                    {parseMathAndText(m.content || "").map((token, idx) => {
                      if (token.type === "text") {
                        return renderTextWithMarkdown(token.content, idx, styles);
                      } else {
                        try {
                          const html = katex.renderToString(token.content.trim(), {
                            displayMode: token.isBlock,
                            throwOnError: false
                          });
                          return (
                            <span 
                              key={idx} 
                              dangerouslySetInnerHTML={{ __html: html }} 
                              style={token.isBlock ? { display: "block", margin: "0.5em 0" } : {}}
                            />
                          );
                        } catch (err) {
                          return <code key={idx}>{token.content}</code>;
                        }
                      }
                    })}
                  </div>
                  {m.role === "user" && <div className={styles.userAvatar}>👤</div>}
                </div>
              ))}
              {loading && (
                <div className={`${styles.msgRow} ${styles.botRow}`}>
                  <div className={styles.avatar}>
                    <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB" width={32} height={32} />
                  </div>
                  <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingBubble}`}>
                    <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className={styles.inputBar}>
          <div className={styles.inputWrapper}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
            <button className={styles.imageBtn} onClick={() => fileInputRef.current?.click()} title="Tải ảnh lên" disabled={loading}>
              +
            </button>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Hỏi DuoMCB... hoặc tải ảnh đề bài lên"
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(null, "hint"); } }}
            />
            {/* Tools dropdown */}
            <ToolsDropdown onSelect={handleToolSelect} disabled={loading} />
            <button
              className={`${styles.sendBtn} ${input.trim() && !loading ? styles.sendActive : ""}`}
              onClick={() => sendMessage(null, "hint")}
              disabled={!input.trim() || loading}
              title="Gửi (Hint mặc định)"
            >➤</button>
          </div>
          <p className={styles.disclaimer}>DuoMCB có thể mắc lỗi. Hãy kiểm tra lại các đáp án quan trọng.</p>
        </div>
      </main>
    </div>
  );
}
