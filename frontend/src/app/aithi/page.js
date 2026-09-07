"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000"
    : "https://duosteam-api.onrender.com");

const DIFFICULTY_COLOR = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
const DIFFICULTY_LABEL = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };

// ── Global styles (injected once) ────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .aithi-root *, .aithi-root *::before, .aithi-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .aithi-root {
    min-height: 100dvh;
    background: #070b14;
    background-image:
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(99,102,241,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 90%, rgba(16,185,129,0.12) 0%, transparent 60%);
    font-family: 'Space Grotesk', sans-serif;
    color: #e2e8f0;
    overflow-x: hidden;
  }
  .aithi-mono { font-family: 'JetBrains Mono', monospace; }
  .aithi-glass {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 20px;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes stamp { from { transform:rotate(-6deg) scale(2); opacity:0; } to { transform:rotate(-6deg) scale(1); opacity:1; } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4);} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0);} }
  @keyframes timerUrgent { 0%,100%{color:#ef4444;} 50%{color:#fca5a5;} }

  .aithi-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 26px; border-radius: 12px; font-size: 15px; font-weight: 600;
    cursor: pointer; border: none; transition: all .18s ease; letter-spacing: .01em;
  }
  .aithi-btn-primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.4);
  }
  .aithi-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,102,241,0.55); }
  .aithi-btn-primary:active:not(:disabled) { transform:scale(.97); }
  .aithi-btn-primary:disabled { opacity:.45; cursor:not-allowed; }
  .aithi-btn-secondary {
    background: rgba(255,255,255,0.07); color: #94a3b8;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .aithi-btn-secondary:hover { background:rgba(255,255,255,0.12); color:#e2e8f0; }
  .aithi-btn-secondary.active { background:rgba(99,102,241,0.2); border-color:rgba(99,102,241,0.5); color:#a5b4fc; }

  .aithi-input {
    width:100%; background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:13px 16px; color:#e2e8f0; font-family:inherit; font-size:15px;
    resize:vertical; outline:none; transition:border-color .2s;
  }
  .aithi-input:focus { border-color:rgba(99,102,241,0.7); }
  .aithi-input::placeholder { color:#475569; }

  .aithi-tag {
    display:inline-flex; align-items:center; gap:6px;
    padding:4px 12px; border-radius:999px; font-size:12.5px; font-weight:600;
    background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.35); color:#a5b4fc;
  }
  .aithi-spinner {
    width:28px; height:28px; border:3px solid rgba(255,255,255,0.12);
    border-top-color:#6366f1; border-radius:50%; animation:spin .7s linear infinite;
  }
  .aithi-error {
    background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.35);
    color:#fca5a5; border-radius:12px; padding:12px 16px; font-size:14px;
  }
  .drag-zone {
    border:2px dashed rgba(99,102,241,0.4); border-radius:16px;
    padding:40px 24px; text-align:center; transition:all .2s; cursor:pointer;
  }
  .drag-zone.over { border-color:#6366f1; background:rgba(99,102,241,0.08); }
  .timer-bar {
    height:4px; border-radius:999px; background:rgba(255,255,255,0.08);
    overflow:hidden; margin-bottom:16px;
  }
  .timer-bar-fill {
    height:100%; border-radius:999px;
    background:linear-gradient(90deg,#6366f1,#8b5cf6);
    transition:width 1s linear, background .5s;
  }
  .timer-bar-fill.urgent { background:linear-gradient(90deg,#ef4444,#f97316); }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
async function apiFetch(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function fmtTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ── Step Indicator ─────────────────────────────────────────────────────────
const STEPS = ["Upload", "Phân tích", "Cấu hình", "Làm bài", "Phản hồi", "Tổng kết"];

function StepDots({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 32 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div title={label} style={{
              width: active ? 36 : done ? 24 : 20,
              height: active ? 12 : done ? 12 : 8,
              borderRadius: 999,
              background: active ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                : done ? "#4f46e5" : "rgba(255,255,255,0.12)",
              transition: "all .3s ease",
              boxShadow: active ? "0 0 12px rgba(99,102,241,0.6)" : "none",
            }} />
            {i < STEPS.length - 1 && (
              <div style={{
                width: 20, height: 1.5, borderRadius: 1,
                background: done ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)",
                transition: "background .3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Back Button ───────────────────────────────────────────────────────────────
function BackBtn({ onClick }) {
  return (
    <button className="aithi-btn aithi-btn-secondary" onClick={onClick}
      style={{ marginBottom: 20, padding: "9px 18px", fontSize: 14 }}>
      ← Quay lại
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 1 — Upload
// ══════════════════════════════════════════════════════════════════════════════
function StepUpload({ onDone }) {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileB64, setFileB64] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  const fileRef = useRef();

  const pickFile = async (f) => {
    if (!f) return;
    setFile(f);
    const b64 = await fileToBase64(f);
    setFileB64(b64);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setTab("file"); pickFile(f); }
  };

  const analyze = async () => {
    setErr("");
    const payload = {};
    if (tab === "text") {
      if (!text.trim()) { setErr("Hãy nhập nội dung ôn tập."); return; }
      payload.text_content = text.trim();
      payload.filename = "noi-dung-dan-tay.txt";
    } else {
      if (!fileB64) { setErr("Hãy chọn file."); return; }
      payload.data_base64 = fileB64;
      payload.mime_type = file.type || "application/octet-stream";
      payload.filename = file.name;
    }
    setBusy(true);
    try {
      const res = await apiFetch("POST", "/api/ai-test/analyze", payload);
      onDone(res);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, background: "linear-gradient(135deg,#a5b4fc,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI Test Studio
        </h1>
        <p style={{ color: "#64748b", marginTop: 8, fontSize: 15 }}>
          Tải PDF/ảnh tài liệu — Unlimited-OCR & Gemini sẽ đọc công thức và tạo đề thi sát nhất
        </p>
      </div>

      <div className="aithi-glass" style={{ padding: "28px", marginBottom: 16 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["text", "✏️ Dán nội dung"], ["file", "📁 Tải file PDF / Ảnh"]].map(([v, label]) => (
            <button key={v} className={`aithi-btn aithi-btn-secondary ${tab === v ? "active" : ""}`}
              style={{ flex: 1 }} onClick={() => setTab(v)}>{label}</button>
          ))}
        </div>

        {tab === "text" ? (
          <textarea className="aithi-input" rows={8}
            placeholder="Dán đề cương, ghi chú bài giảng, hoặc mô tả chủ đề cần ôn tập…&#10;Ví dụ: Phương trình bậc hai: ax² + bx + c = 0, delta = b²−4ac, ..."
            value={text} onChange={e => setText(e.target.value)} />
        ) : (
          <div
            className={`drag-zone ${over ? "over" : ""}`}
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="application/pdf,image/*"
              style={{ display: "none" }} onChange={e => pickFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontWeight: 600, color: "#a5b4fc" }}>{file.name}</div>
                <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                  {(file.size / 1024).toFixed(0)} KB — click để đổi file
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>☁️</div>
                <div style={{ fontWeight: 600, color: "#94a3b8" }}>Kéo thả file vào đây</div>
                <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>Hỗ trợ tài liệu PDF nhiều trang, ảnh đề cương, công thức toán</div>
              </>
            )}
          </div>
        )}

        {err && <div className="aithi-error" style={{ marginTop: 14 }}>{err}</div>}

        <button className="aithi-btn aithi-btn-primary" style={{ width: "100%", marginTop: 18 }}
          onClick={analyze} disabled={busy}>
          {busy ? <><div className="aithi-spinner" style={{ width: 18, height: 18 }} /> Đang đọc OCR & phân tích…</> : "Phân tích tài liệu →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 2 — Analysis
// ══════════════════════════════════════════════════════════════════════════════
function StepAnalysis({ analysis, ocrInfo, mock, onBack, onNext }) {
  const [showOcr, setShowOcr] = useState(false);
  const diff = { basic: "Cơ bản", intermediate: "Trung bình", advanced: "Nâng cao" };
  const diffColor = { basic: "#22c55e", intermediate: "#f59e0b", advanced: "#ef4444" };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <BackBtn onClick={onBack} />
      <div className="aithi-glass" style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="aithi-tag">✅ Phân tích xong</span>
            {ocrInfo?.used && (
              <span className="aithi-tag" style={{ background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)", color: "#34d399" }}>
                ✨ Unlimited-OCR
              </span>
            )}
            {!ocrInfo?.used && ocrInfo?.engine === "gemini_vision_fallback" && (
              <span className="aithi-tag" style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
                👁️ Gemini Vision
              </span>
            )}
          </div>
          {mock && <span className="aithi-tag" style={{ background: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.4)", color: "#fcd34d" }}>⚡ DEMO MODE</span>}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{analysis.summary}</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {(analysis.topics || []).map((t, i) => (
            <span key={i} title={t.description} style={{
              padding: "5px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: `hsla(${i * 60 + 200},70%,50%,0.15)`,
              border: `1px solid hsla(${i * 60 + 200},70%,60%,0.35)`,
              color: `hsl(${i * 60 + 200},80%,75%)`,
            }}>{t.name}</span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="aithi-glass" style={{ padding: "12px 20px", borderRadius: 12, flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Độ khó</div>
            <div style={{ fontWeight: 700, color: diffColor[analysis.overall_difficulty] }}>
              {diff[analysis.overall_difficulty] || analysis.overall_difficulty}
            </div>
          </div>
          <div className="aithi-glass" style={{ padding: "12px 20px", borderRadius: 12, flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Gợi ý số câu</div>
            <div style={{ fontWeight: 700, color: "#a5b4fc" }}>{analysis.suggested_question_count || 5} câu</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Khái niệm chính</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(analysis.key_concepts || []).slice(0, 8).map((c, i) => (
              <span key={i} style={{ fontSize: 12.5, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94a3b8" }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Collapsible OCR Content Preview */}
        {ocrInfo?.preview && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              type="button"
              className="aithi-btn aithi-btn-secondary"
              style={{ width: "100%", justifyContent: "space-between", padding: "10px 16px", fontSize: 13 }}
              onClick={() => setShowOcr(prev => !prev)}
            >
              <span>📝 Nội dung văn bản OCR trích xuất</span>
              <span>{showOcr ? "▲ Thu gọn" : "▼ Xem chi tiết"}</span>
            </button>
            {showOcr && (
              <div style={{
                marginTop: 10,
                padding: "14px 16px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#cbd5e1",
                whiteSpace: "pre-wrap",
                maxHeight: 220,
                overflowY: "auto",
                fontFamily: "var(--font-mono, monospace)"
              }}>
                {ocrInfo.preview}
              </div>
            )}
          </div>
        )}
      </div>

      <button className="aithi-btn aithi-btn-primary" style={{ width: "100%" }} onClick={onNext}>
        Cấu hình & Tạo đề thi →
      </button>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
//  STEP 3 — Configure
// ══════════════════════════════════════════════════════════════════════════════
function StepConfig({ analysis, materialId, onBack, onDone }) {
  const [count, setCount] = useState(analysis.suggested_question_count || 5);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    setBusy(true); setErr("");
    try {
      const res = await apiFetch("POST", "/api/ai-test/generate", { material_id: materialId, question_count: count });
      const start = await apiFetch("POST", `/api/ai-test/${res.test_id}/start`, {});
      onDone(start);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <BackBtn onClick={onBack} />
      <div className="aithi-glass" style={{ padding: 28, marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>⚙️ Cấu hình đề thi</h2>

        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
          Số câu hỏi: <span style={{ color: "#a5b4fc", fontSize: 18 }}>{count}</span>
        </label>
        <input type="range" min={1} max={15} value={count}
          onChange={e => setCount(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#6366f1", marginBottom: 20 }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#475569", marginBottom: 28 }}>
          <span>1 câu</span><span>8 câu</span><span>15 câu</span>
        </div>

        <div className="aithi-glass" style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748b" }}>
            <span>Tổng điểm tối đa</span>
            <span style={{ fontWeight: 700, color: "#a5b4fc" }}>{count * 10} điểm</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748b", marginTop: 8 }}>
            <span>Thời gian ước tính</span>
            <span style={{ fontWeight: 700, color: "#34d399" }}>~{Math.ceil(count * 4)} phút</span>
          </div>
        </div>

        {err && <div className="aithi-error" style={{ marginTop: 12 }}>{err}</div>}
      </div>

      <button className="aithi-btn aithi-btn-primary" style={{ width: "100%" }} onClick={generate} disabled={busy}>
        {busy ? <><div className="aithi-spinner" style={{ width: 18, height: 18 }} /> Đang tạo đề…</> : `Bắt đầu ${count} câu →`}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 4 — Question
// ══════════════════════════════════════════════════════════════════════════════
function StepQuestion({ question, totalQ, qNum, attemptId, mock, onDone }) {
  const [ansMode, setAnsMode] = useState("typed");
  const [typed, setTyped] = useState("");
  const [photoB64, setPhotoB64] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submitted = useRef(false);
  const photoRef = useRef();

  // Timer
  useEffect(() => {
    submitted.current = false;
    setTyped(""); setPhotoB64(""); setPhotoUrl(""); setErr("");

    const deadline = new Date(question.deadline_at).getTime();
    const tick = () => {
      const rem = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(rem);
      if (rem <= 0 && !submitted.current) {
        submitted.current = true;
        doSubmit("", "", "typed");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [question.qa_id]);

  const doSubmit = useCallback(async (txtOverride, b64Override, modeOverride) => {
    if (submitted.current && txtOverride === undefined) return;
    submitted.current = true;
    setBusy(true); setErr("");
    const ansType = modeOverride ?? ansMode;
    const payload = { answer_type: ansType };
    if (ansType === "photo") {
      payload.answer_image_base64 = b64Override ?? photoB64;
      payload.image_mime = "image/jpeg";
    } else {
      payload.answer_text = txtOverride ?? typed;
    }
    try {
      const res = await apiFetch("POST", `/api/ai-test/attempt/${attemptId}/submit`, payload);
      onDone(res);
    } catch (e) { setErr(e.message); setBusy(false); submitted.current = false; }
  }, [ansMode, typed, photoB64, attemptId]);

  const limit = question.time_limit_seconds;
  const pct = remaining !== null ? Math.min(100, (remaining / limit) * 100) : 100;
  const urgent = remaining !== null && remaining <= 60;

  return (
    <div style={{ animation: "fadeUp .35s ease" }}>
      {/* Progress & topic */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>
          Câu {qNum}/{totalQ}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: DIFFICULTY_COLOR[question.difficulty] || "#6366f1", display: "inline-block" }} />
          <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
            {question.topic} · {DIFFICULTY_LABEL[question.difficulty] || question.difficulty}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="timer-bar">
        <div className={`timer-bar-fill ${urgent ? "urgent" : ""}`} style={{ width: `${pct}%` }} />
      </div>

      {/* Timer display */}
      <div className="aithi-mono" style={{
        textAlign: "center", fontSize: 42, fontWeight: 700, marginBottom: 20,
        color: urgent ? "#ef4444" : "#e2e8f0",
        animation: urgent ? "timerUrgent 1s ease infinite" : "none",
        textShadow: urgent ? "0 0 20px rgba(239,68,68,0.5)" : "none",
      }}>
        {remaining !== null ? fmtTime(remaining) : "--:--"}
      </div>

      {/* Question card */}
      <div className="aithi-glass" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5, marginBottom: 8 }}>
          {question.question_text_vi}
        </div>
        {question.question_text_en && (
          <div style={{ fontSize: 14.5, color: "#475569", fontStyle: "italic" }}>
            {question.question_text_en}
          </div>
        )}
      </div>

      {/* Answer mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className={`aithi-btn aithi-btn-secondary ${ansMode === "typed" ? "active" : ""}`}
          style={{ flex: 1 }} onClick={() => setAnsMode("typed")}>⌨️ Gõ đáp án</button>
        <button className={`aithi-btn aithi-btn-secondary ${ansMode === "photo" ? "active" : ""}`}
          style={{ flex: 1 }} onClick={() => setAnsMode("photo")}>📷 Chụp ảnh</button>
      </div>

      {ansMode === "typed" ? (
        <textarea className="aithi-input" rows={3}
          placeholder="Nhập đáp án hoặc lời giải…"
          value={typed} onChange={e => setTyped(e.target.value)} />
      ) : (
        <div>
          <input ref={photoRef} type="file" accept="image/*" capture="environment"
            style={{ display: "none" }}
            onChange={async e => {
              const f = e.target.files[0];
              if (!f) return;
              const b64 = await fileToBase64(f);
              setPhotoB64(b64);
              setPhotoUrl(URL.createObjectURL(f));
            }} />
          {photoUrl ? (
            <img src={photoUrl} alt="preview" style={{ width: "100%", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.1)", marginBottom: 8, cursor: "pointer" }}
              onClick={() => photoRef.current?.click()} />
          ) : (
            <button className="aithi-btn aithi-btn-secondary" style={{ width: "100%", padding: 30 }}
              onClick={() => photoRef.current?.click()}>
              📷 Chụp ảnh hoặc chọn từ thư viện
            </button>
          )}
          {mock && <div style={{ fontSize: 12, color: "#475569", marginTop: 8, textAlign: "center" }}>⚠️ DEMO mode không OCR được ảnh — dùng Gemini thật để chấm ảnh</div>}
        </div>
      )}

      {err && <div className="aithi-error" style={{ marginTop: 12 }}>{err}</div>}

      <button className="aithi-btn aithi-btn-primary" style={{ width: "100%", marginTop: 16 }}
        onClick={() => doSubmit()} disabled={busy}>
        {busy ? <><div className="aithi-spinner" style={{ width: 18, height: 18 }} /> Đang chấm bài…</> : "Nộp bài →"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 5 — Feedback
// ══════════════════════════════════════════════════════════════════════════════
function StepFeedback({ grading, timeExpired, completed, totalQ, qNum, onNext }) {
  const ok = grading.is_correct;
  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div className="aithi-glass" style={{ padding: 28, textAlign: "center", marginBottom: 16 }}>
        {timeExpired && (
          <div className="aithi-error" style={{ marginBottom: 16, textAlign: "left" }}>⏱ Đã hết thời gian cho câu này.</div>
        )}

        {/* Stamp */}
        <div style={{
          display: "inline-block", fontWeight: 800, fontSize: 28, letterSpacing: ".06em",
          padding: "14px 40px", borderRadius: 14,
          border: `3.5px solid ${ok ? "#22c55e" : "#ef4444"}`,
          color: ok ? "#22c55e" : "#ef4444",
          background: ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          transform: "rotate(-4deg)",
          animation: "stamp .3s cubic-bezier(.2,1.6,.4,1)",
          marginBottom: 20,
          boxShadow: ok ? "0 0 28px rgba(34,197,94,0.3)" : "0 0 28px rgba(239,68,68,0.3)",
        }}>
          {ok ? "ĐÚNG ✓" : "CHƯA ĐÚNG ✗"}
        </div>

        <div style={{ fontSize: 16, color: "#64748b", marginBottom: 16, fontWeight: 600 }}>
          +{grading.score_awarded} điểm
        </div>

        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 15.5, lineHeight: 1.6, marginBottom: 6 }}>{grading.feedback?.vi}</div>
          {grading.feedback?.en && (
            <div style={{ fontSize: 13.5, color: "#475569", fontStyle: "italic" }}>{grading.feedback.en}</div>
          )}
          {grading.student_answer_transcribed && grading.student_answer_transcribed !== grading.feedback?.vi && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)", fontSize: 13.5, color: "#64748b" }}>
              <strong style={{ color: "#94a3b8" }}>Bài làm ghi nhận:</strong> {grading.student_answer_transcribed}
            </div>
          )}
        </div>
      </div>

      <button className="aithi-btn aithi-btn-primary" style={{ width: "100%" }} onClick={onNext}>
        {completed ? "Xem tổng kết →" : `Câu ${qNum + 1} →`}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STEP 6 — Review
// ══════════════════════════════════════════════════════════════════════════════
function StepReview({ review, onRestart }) {
  const pct = review.max_score > 0 ? Math.round((review.total_score / review.max_score) * 100) : 0;
  const grade = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : pct >= 40 ? "📚" : "💪";

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      {/* Score circle */}
      <div className="aithi-glass" style={{ padding: 32, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 56 }}>{grade}</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 64, fontWeight: 800,
          background: pct >= 60 ? "linear-gradient(135deg,#34d399,#6366f1)" : "linear-gradient(135deg,#f97316,#ef4444)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
          {review.total_score}
        </div>
        <div style={{ color: "#475569", fontSize: 15, marginTop: 4 }}>/ {review.max_score} điểm ({pct}%)</div>

        <div style={{ marginTop: 16, padding: "14px 0 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 4 }}>{review.overall_feedback?.vi}</div>
          {review.overall_feedback?.en && (
            <div style={{ fontSize: 13, color: "#475569", fontStyle: "italic" }}>{review.overall_feedback.en}</div>
          )}
        </div>
      </div>

      {/* Strengths */}
      {review.strengths?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "#22c55e", marginBottom: 10 }}>✓ Điểm mạnh</h3>
          {review.strengths.map((s, i) => (
            <div key={i} className="aithi-glass" style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 8, borderLeft: "3px solid #22c55e" }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{s.topic}</div>
              <div style={{ fontSize: 13.5, color: "#64748b" }}>{s.description?.vi}</div>
            </div>
          ))}
        </div>
      )}

      {/* Weaknesses */}
      {review.weaknesses?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "#f97316", marginBottom: 10 }}>△ Cần ôn thêm</h3>
          {review.weaknesses.map((w, i) => (
            <div key={i} className="aithi-glass" style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 8, borderLeft: "3px solid #f97316" }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{w.topic}</div>
              <div style={{ fontSize: 13.5, color: "#64748b", marginBottom: w.recommended_resources?.length ? 8 : 0 }}>{w.description?.vi}</div>
              {w.recommended_resources?.map((r, j) => (
                <div key={j} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", fontSize: 13, marginTop: 4, color: "#94a3b8" }}>
                  <strong style={{ color: "#cbd5e1" }}>{r.title}</strong>
                  {r.description && ` — ${r.description}`}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button className="aithi-btn aithi-btn-secondary" style={{ flex: 1 }}
          onClick={() => window.location.href = "/"}>← Trang chủ</button>
        <button className="aithi-btn aithi-btn-primary" style={{ flex: 2 }} onClick={onRestart}>
          ↺ Làm đề mới
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AiThiPage() {
  const [step, setStep] = useState(0); // 0..5
  const [analysis, setAnalysis] = useState(null);
  const [materialId, setMaterialId] = useState("");
  const [ocrInfo, setOcrInfo] = useState(null); // { used, preview, engine }
  const [mock, setMock] = useState(false);
  const [attemptData, setAttemptData] = useState(null); // {attempt_id, total_questions, current_question}
  const [qNum, setQNum] = useState(1);
  const [grading, setGrading] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Inject global CSS once
  useEffect(() => {
    if (document.getElementById("aithi-css")) return;
    const s = document.createElement("style");
    s.id = "aithi-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }, []);

  const handleAnalyzeDone = ({ material_id, analysis: a, mock: m, ocr_used: ou, ocr_preview: op, ocr_engine: oe }) => {
    setMaterialId(material_id);
    setAnalysis(a);
    setMock(!!m);
    setOcrInfo({ used: !!ou, preview: op || "", engine: oe || "" });
    setStep(1);
  };

  const handleStartDone = (data) => {
    setAttemptData(data);
    setQNum(1);
    setStep(3);
  };

  const handleSubmitDone = async (res) => {
    setGrading(res.grading);
    setCompleted(res.completed);
    setNextQuestion(res.next_question || null);
    setStep(4);
    if (res.completed) {
      // Pre-fetch review in background
      setLoadingReview(true);
      try {
        const rv = await apiFetch("GET", `/api/ai-test/attempt/${attemptData.attempt_id}/review`);
        setReview(rv);
      } catch (e) { console.error("Review error:", e); }
      finally { setLoadingReview(false); }
    }
  };

  const handleNextAfterFeedback = () => {
    if (completed) {
      if (review) setStep(5);
      else setLoadingReview(true); // wait
    } else {
      // Advance to next question
      setAttemptData(prev => ({ ...prev, current_question: nextQuestion }));
      setQNum(q => q + 1);
      setStep(3);
    }
  };

  // Watch review load
  useEffect(() => {
    if (loadingReview === false && review && step === 4 && completed) setStep(5);
  }, [loadingReview, review]);

  const restart = () => {
    setStep(0); setAnalysis(null); setMaterialId(""); setMock(false); setOcrInfo(null);
    setAttemptData(null); setQNum(1); setGrading(null); setCompleted(false);
    setNextQuestion(null); setReview(null);
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepUpload onDone={handleAnalyzeDone} />;
      case 1: return <StepAnalysis analysis={analysis} ocrInfo={ocrInfo} mock={mock}
        onBack={() => setStep(0)} onNext={() => setStep(2)} />;

      case 2: return <StepConfig analysis={analysis} materialId={materialId}
        onBack={() => setStep(1)} onDone={handleStartDone} />;
      case 3: return (
        attemptData?.current_question
          ? <StepQuestion
              question={attemptData.current_question}
              totalQ={attemptData.total_questions}
              qNum={qNum}
              attemptId={attemptData.attempt_id}
              mock={mock}
              onDone={handleSubmitDone}
            />
          : <div className="aithi-spinner" style={{ margin: "60px auto" }} />
      );
      case 4: return grading
        ? <StepFeedback grading={grading} timeExpired={false}
            completed={completed} totalQ={attemptData?.total_questions} qNum={qNum}
            onNext={handleNextAfterFeedback} />
        : <div className="aithi-spinner" style={{ margin: "60px auto" }} />;
      case 5: return review
        ? <StepReview review={review} onRestart={restart} />
        : (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="aithi-spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#475569" }}>AI đang tổng kết kết quả…</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="aithi-root">
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <a href="/" style={{ color: "#475569", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            ← DuoMath
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: 15, background: "linear-gradient(90deg,#a5b4fc,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI Test Studio
            </span>
          </div>
          {mock !== null && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
              background: mock ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
              border: `1px solid ${mock ? "rgba(245,158,11,0.4)" : "rgba(34,197,94,0.4)"}`,
              color: mock ? "#fcd34d" : "#86efac",
              letterSpacing: ".06em", textTransform: "uppercase",
            }}>
              {mock ? "DEMO" : "Gemini"}
            </span>
          )}
        </div>

        <StepDots current={step} />

        {renderStep()}
      </div>
    </div>
  );
}
