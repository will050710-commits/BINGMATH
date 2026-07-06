/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useMathMapStore } from "@/context/MathMapStore";
import { useAuth } from "@/context/authContext";

// ── Constants ──────────────────────────────────────────────────────────────
const GRADES = ["Lớp 10", "Lớp 11", "Lớp 12"];
const BGM_OPTIONS = [
  { id: "dramatic01", label: "🎵 Dramatic Theme #1", preview: "Epic orchestral for intense matches" },
  { id: "electronic01", label: "🎵 Electronic Beat #1", preview: "Fast-paced electronic for speed rounds" },
  { id: "calm01", label: "🎵 Calm Study BGM", preview: "Ambient music for focused thinking" },
  { id: "boss01", label: "🎵 Boss Battle", preview: "Intense boss fight music for hard maps" },
  { id: "lofi01", label: "🎵 Chill Lofi", preview: "Lo-fi beats for casual play" },
  { id: "custom", label: "📤 Tải lên BGM riêng", preview: "Upload your own MP3 file" },
];
const SUGGESTED_TAGS = [
  "#ĐạiSố10", "#ĐạiSố11", "#ĐạiSố12",
  "#HinhHoc10", "#HinhHoc11", "#HinhHoc12",
  "#GiaiTich12", "#XacSuat", "#TongHop",
  "#CoBan", "#TrungBinh", "#NangCao", "#SieuKho",
  "#PhuongTrinhBacHai", "#DaoHam", "#TichPhan",
  "#LuongGiac", "#MenhDe", "#TapHop", "#DaySo",
];

// ── Empty question template ────────────────────────────────────────────────
const newQuestion = (order) => ({
  id: `q${Date.now()}`, type: "multiple_choice", order,
  content_vi: "", content_en: "",
  options: [
    { id: "a", text_vi: "", text_en: "" },
    { id: "b", text_vi: "", text_en: "" },
    { id: "c", text_vi: "", text_en: "" },
    { id: "d", text_vi: "", text_en: "" },
  ],
  correct_answer: "a",
  explanation_vi: "",
  points: 100,
  time_seconds: 30,
});

// ── Input styled ───────────────────────────────────────────────────────────
function StyledInput({ label, value, onChange, placeholder, type = "text", min, max, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd" }}>
          {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max}
        style={{
          padding: "10px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white", fontSize: 13, outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(34,211,238,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
      />
    </div>
  );
}

function StyledTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd" }}>{label}</label>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          padding: "10px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white", fontSize: 13, outline: "none",
          resize: "vertical", fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(34,211,238,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
      />
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, flexShrink: 0,
            background: i < current
              ? "linear-gradient(135deg, #22d3ee, #0ea5e9)"
              : i === current
                ? "rgba(34,211,238,0.2)"
                : "rgba(255,255,255,0.06)",
            border: i === current
              ? "2px solid #22d3ee"
              : i < current
                ? "2px solid #22d3ee"
                : "2px solid rgba(255,255,255,0.1)",
            color: i <= current ? (i < current ? "#000" : "#22d3ee") : "rgba(255,255,255,0.4)",
            transition: "all 0.3s",
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          <div style={{ marginLeft: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: i === current ? "white" : "rgba(255,255,255,0.5)" }}>
              {step.label}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{step.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: "0 16px",
              background: i < current
                ? "linear-gradient(90deg, #22d3ee, rgba(34,211,238,0.3))"
                : "rgba(255,255,255,0.06)",
              transition: "background 0.4s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Question editor ────────────────────────────────────────────────────────
function QuestionEditor({ q, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const typeColors = {
    multiple_choice: "#22d3ee",
    fill_in_blank: "#a78bfa",
    true_false: "#4ade80",
  };
  const typeLabels = {
    multiple_choice: "Trắc nghiệm",
    fill_in_blank: "Điền chỗ trống",
    true_false: "Đúng / Sai",
  };

  const updateField = (field, value) => onChange({ ...q, [field]: value });
  const updateOption = (optId, field, value) => {
    const newOpts = q.options.map(o => o.id === optId ? { ...o, [field]: value } : o);
    onChange({ ...q, options: newOpts });
  };

  const timeWarning = q.time_seconds < 15;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(${expanded ? "34,211,238" : "255,255,255"},${expanded ? "0.2" : "0.08"})`,
      borderRadius: 12, marginBottom: 12, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Question header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        background: "rgba(255,255,255,0.03)", cursor: "pointer",
        borderBottom: expanded ? "1px solid rgba(255,255,255,0.06)" : "none",
      }} onClick={() => setExpanded(v => !v)}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `rgba(${typeColors[q.type] === "#22d3ee" ? "34,211,238" : typeColors[q.type] === "#a78bfa" ? "167,139,250" : "74,222,128"},0.15)`,
          border: `1px solid ${typeColors[q.type]}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: typeColors[q.type], flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: typeColors[q.type],
            background: typeColors[q.type] + "18",
            border: `1px solid ${typeColors[q.type]}33`,
            borderRadius: 4, padding: "1px 6px", marginRight: 8,
          }}>
            {typeLabels[q.type]}
          </span>
          <span style={{ fontSize: 13, color: q.content_vi ? "white" : "rgba(255,255,255,0.3)", fontStyle: q.content_vi ? "normal" : "italic" }}>
            {q.content_vi || "Chưa có nội dung câu hỏi..."}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: timeWarning ? "#ef4444" : "rgba(255,255,255,0.4)" }}>
            ⏱ {q.time_seconds}s {timeWarning && "⚠️"}
          </span>
          <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst}
            style={{ background: "none", border: "none", color: isFirst ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)", cursor: isFirst ? "default" : "pointer", fontSize: 14 }}>
            ↑
          </button>
          <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}
            style={{ background: "none", border: "none", color: isLast ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)", cursor: isLast ? "default" : "pointer", fontSize: 14 }}>
            ↓
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>
            ✕
          </button>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginLeft: 4 }}>
            {expanded ? "▼" : "▶"}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Type selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 6, display: "block" }}>
              Loại câu hỏi
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {Object.entries(typeLabels).map(([key, label]) => (
                <button key={key} onClick={() => updateField("type", key)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer",
                  fontWeight: q.type === key ? 700 : 400,
                  background: q.type === key ? typeColors[key] + "22" : "rgba(255,255,255,0.04)",
                  border: q.type === key ? `1px solid ${typeColors[key]}55` : "1px solid rgba(255,255,255,0.08)",
                  color: q.type === key ? typeColors[key] : "rgba(255,255,255,0.5)",
                  transition: "all 0.15s",
                }}>
                  {key === "multiple_choice" ? "🔘" : key === "fill_in_blank" ? "✏️" : "✅"} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StyledTextarea label="Nội dung (Tiếng Việt) *" value={q.content_vi}
              onChange={v => updateField("content_vi", v)} rows={2}
              placeholder="Nhập nội dung câu hỏi bằng tiếng Việt..." />
            <StyledTextarea label="Content (English)" value={q.content_en}
              onChange={v => updateField("content_en", v)} rows={2}
              placeholder="Enter question content in English..." />
          </div>

          {/* Options (for multiple choice) */}
          {q.type === "multiple_choice" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                Các lựa chọn
              </label>
              {q.options.map(opt => (
                <div key={opt.id} style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                  padding: "8px 12px", borderRadius: 8,
                  background: q.correct_answer === opt.id ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)",
                  border: q.correct_answer === opt.id ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.15s",
                }}>
                  <input type="radio" name={`correct_${q.id}`} checked={q.correct_answer === opt.id}
                    onChange={() => updateField("correct_answer", opt.id)}
                    style={{ cursor: "pointer", accentColor: "#4ade80" }}
                  />
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                    background: q.correct_answer === opt.id ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
                    color: q.correct_answer === opt.id ? "#4ade80" : "rgba(255,255,255,0.5)",
                    border: q.correct_answer === opt.id ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                    {opt.id.toUpperCase()}
                  </span>
                  <input type="text" value={opt.text_vi}
                    onChange={e => updateOption(opt.id, "text_vi", e.target.value)}
                    placeholder={`Đáp án ${opt.id.toUpperCase()} (Tiếng Việt)`}
                    style={{
                      flex: 1, padding: "6px 10px", background: "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)",
                      color: "white", fontSize: 12, outline: "none",
                    }}
                  />
                  <input type="text" value={opt.text_en}
                    onChange={e => updateOption(opt.id, "text_en", e.target.value)}
                    placeholder={`Option ${opt.id.toUpperCase()} (English)`}
                    style={{
                      flex: 1, padding: "6px 10px", background: "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.6)", fontSize: 12, outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* True/False */}
          {q.type === "true_false" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                Đáp án đúng
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {["true", "false"].map(val => (
                  <button key={val} onClick={() => updateField("correct_answer", val)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                    fontWeight: q.correct_answer === val ? 700 : 400, fontSize: 14,
                    background: q.correct_answer === val
                      ? val === "true" ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"
                      : "rgba(255,255,255,0.04)",
                    border: q.correct_answer === val
                      ? val === "true" ? "2px solid rgba(74,222,128,0.5)" : "2px solid rgba(239,68,68,0.5)"
                      : "2px solid rgba(255,255,255,0.08)",
                    color: q.correct_answer === val
                      ? val === "true" ? "#4ade80" : "#f87171"
                      : "rgba(255,255,255,0.5)",
                    transition: "all 0.2s",
                  }}>
                    {val === "true" ? "✅ Đúng (True)" : "❌ Sai (False)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fill in blank */}
          {q.type === "fill_in_blank" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <StyledInput label="Đáp án đúng *" value={q.correct_answer}
                onChange={v => updateField("correct_answer", v)}
                placeholder="Nhập đáp án chính xác..." />
              <StyledInput label="Độ sai số cho phép" value={q.tolerance || 0}
                onChange={v => updateField("tolerance", Number(v))}
                type="number" min="0" placeholder="0 = chính xác tuyệt đối" />
            </div>
          )}

          {/* Timer + Points */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 6, display: "block" }}>
                ⏱ Thời gian (giây) *
              </label>
              <input type="number" value={q.time_seconds}
                onChange={e => updateField("time_seconds", Math.max(15, Number(e.target.value)))}
                min="15" max="300"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  background: timeWarning ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.06)",
                  border: timeWarning ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.12)",
                  color: timeWarning ? "#f87171" : "white", fontSize: 13, outline: "none",
                }}
              />
              {timeWarning && (
                <div style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
                  ⚠️ Tối thiểu 15 giây/câu
                </div>
              )}
            </div>
            <StyledInput label="Điểm thưởng" value={q.points}
              onChange={v => updateField("points", Number(v))}
              type="number" min="10" max="500" placeholder="100" />
            <StyledInput label="Giải thích (tùy chọn)" value={q.explanation_vi}
              onChange={v => updateField("explanation_vi", v)}
              placeholder="Giải thích đáp án..." />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview Card ───────────────────────────────────────────────────────────
function PreviewCard({ metadata, questions, customBgData, customBgmName }) {
  const totalTime = questions.reduce((s, q) => s + q.time_seconds, 0);
  const avgDiff = questions.length > 0 ? (totalTime / questions.length / 30 * 5).toFixed(1) : "—";

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(34,211,238,0.2)",
      borderRadius: 16, overflow: "hidden",
    }}>
      {/* Thumbnail */}
      <div style={{
        height: 140,
        background: customBgData ? `url(${customBgData}) center/cover no-repeat` : "linear-gradient(135deg, #0ea5e9, #6366f1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 56, position: "relative",
      }}>
        {!customBgData && "📐"}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 50%, rgba(5,10,20,0.8) 100%)",
        }} />
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>
          {metadata.title || "Chưa có tiêu đề"}
        </div>
        <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 12, fontStyle: "italic" }}>
          {metadata.title_en || "No English title"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            ["📚", "Khối", metadata.grade || "—"],
            ["❓", "Số câu", questions.length],
            ["⏱", "Tổng thời gian", `${totalTime}s`],
            ["🎵", "BGM", metadata.bgm === "custom" ? (customBgmName || "Nhạc tự chọn") : (BGM_OPTIONS.find(b => b.id === metadata.bgm)?.label.replace(/🎵 |📤 /, "") || "—")],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{icon} {label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {metadata.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: "#a78bfa",
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 5, padding: "2px 7px",
            }}>{tag}</span>
          ))}
        </div>

        {/* Question type breakdown */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Phân bố câu hỏi</div>
          {["multiple_choice", "fill_in_blank", "true_false"].map(type => {
            const count = questions.filter(q => q.type === type).length;
            if (count === 0) return null;
            const labels = { multiple_choice: "Trắc nghiệm", fill_in_blank: "Điền chỗ trống", true_false: "Đúng/Sai" };
            const colors = { multiple_choice: "#22d3ee", fill_in_blank: "#a78bfa", true_false: "#4ade80" };
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", minWidth: 90 }}>{labels[type]}</div>
                <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${(count / questions.length) * 100}%`, background: colors[type], borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: colors[type], fontWeight: 700, minWidth: 20 }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Creator Component ─────────────────────────────────────────────────
export default function MathMapCreator() {
  const { submitMap } = useMathMapStore();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const [metadata, setMetadata] = useState({
    title: "", title_en: "", grade: "Lớp 11",
    bgm: "dramatic01", tags: [],
    description: "", bgOpacity: 0.3,
  });

  const [questions, setQuestions] = useState([newQuestion(1)]);
  const [customTag, setCustomTag] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // Custom uploads
  const [customBgmData, setCustomBgmData] = useState("");
  const [customBgmName, setCustomBgmName] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [customBgData, setCustomBgData] = useState("");
  const [customBgName, setCustomBgName] = useState("");

  const handleBgmUpload = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Nhạc nền phải nhỏ hơn 10MB");
      return;
    }
    setCustomBgmName(file.name);
    const audioUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(audioUrl);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBgmData(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh nền phải nhỏ hơn 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Chỉ chấp nhận file ảnh");
      return;
    }
    setCustomBgName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBgData(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const [aiParsing, setAiParsing] = useState(false);

  const handleImportMap = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target.result);
        if (!rawData.title || !rawData.grade || !Array.isArray(rawData.questions)) {
          alert("File JSON không hợp lệ. Bản đồ phải có title, grade và questions!");
          return;
        }

        // Set metadata
        setMetadata({
          title: rawData.title || "",
          title_en: rawData.title_en || "",
          grade: rawData.grade || "Lớp 11",
          bgm: rawData.bgm || "dramatic01",
          tags: Array.isArray(rawData.tags) ? rawData.tags : [],
          description: rawData.description || "",
        });

        // Set questions
        const mappedQuestions = rawData.questions.map((q, idx) => {
          let opts = [];
          if (Array.isArray(q.options)) {
            opts = q.options.map((opt, i) => {
              if (typeof opt === 'object' && opt !== null) {
                return {
                  id: opt.id || ['a', 'b', 'c', 'd'][i],
                  text_vi: opt.text_vi || opt.text || "",
                  text_en: opt.text_en || "",
                };
              }
              return {
                id: ['a', 'b', 'c', 'd'][i],
                text_vi: String(opt),
                text_en: "",
              };
            });
          }
          if (opts.length < 4 && (q.type || 'multiple_choice') === 'multiple_choice') {
            while (opts.length < 4) {
              const letter = ['a', 'b', 'c', 'd'][opts.length];
              opts.push({ id: letter, text_vi: "", text_en: "" });
            }
          }

          let correct = q.correct_answer || 'a';
          if (typeof q.correct === 'number') {
            correct = ['a', 'b', 'c', 'd'][q.correct] || 'a';
          }

          return {
            id: q.id || `q-${Date.now()}-${idx}`,
            type: q.type || "multiple_choice",
            order: q.order || (idx + 1),
            content_vi: q.content_vi || q.text || "",
            content_en: q.content_en || "",
            options: opts,
            correct_answer: correct,
            explanation_vi: q.explanation_vi || q.explain || "",
            points: q.points || 100,
            time_seconds: q.time_seconds || q.timeLimit || 30,
          };
        });

        setQuestions(mappedQuestions);

        if (rawData.bgm === "custom" && rawData.bgm_url) {
          setCustomBgmData(rawData.bgm_url);
          setCustomBgmName(rawData.customBgmName || "custom.mp3");
        }
        if (rawData.thumbnail_url) {
          setCustomBgData(rawData.thumbnail_url);
          setCustomBgName(rawData.customBgName || "background.jpg");
        }

        alert(`Đã nhập thành công thông tin & ${mappedQuestions.length} câu hỏi của MathMap: "${rawData.title}"!`);
      } catch (err) {
        alert("Lỗi khi đọc file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAIImportMap = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiParsing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const textContent = event.target.result;
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://duomath.onrender.com";
        const res = await fetch(`${API_BASE}/api/mathmap/parse-file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textContent }),
        });
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.raw || "Lỗi bất thường từ AI.");
        }

        // Set metadata
        setMetadata({
          title: data.title || "",
          title_en: data.title_en || "",
          grade: data.grade || "Lớp 11",
          bgm: "dramatic01",
          tags: Array.isArray(data.tags) ? data.tags : [],
          description: data.description || "",
        });

        // Set questions
        const mappedQuestions = (data.questions || []).map((q, idx) => {
          let opts = [];
          if (Array.isArray(q.options)) {
            opts = q.options.map((opt, i) => ({
              id: opt.id || ['a', 'b', 'c', 'd'][i],
              text_vi: opt.text_vi || opt.text || "",
              text_en: opt.text_en || "",
            }));
          }
          while (opts.length < 4) {
            const letter = ['a', 'b', 'c', 'd'][opts.length];
            opts.push({ id: letter, text_vi: "", text_en: "" });
          }

          return {
            id: q.id || `q-${Date.now()}-${idx}`,
            type: q.type || "multiple_choice",
            order: q.order || (idx + 1),
            content_vi: q.content_vi || "",
            content_en: q.content_en || "",
            options: opts,
            correct_answer: q.correct_answer || 'a',
            explanation_vi: q.explanation_vi || "",
            points: q.points || 100,
            time_seconds: q.time_seconds || 30,
          };
        });

        setQuestions(mappedQuestions);
        alert(`AI đã chuyển hóa thành công ${mappedQuestions.length} câu hỏi từ tệp tin!`);
      } catch (err) {
        alert("Lỗi phân tích bằng AI: " + err.message);
      } finally {
        setAiParsing(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const updateMeta = (field, value) => setMetadata(prev => ({ ...prev, [field]: value }));
  const toggleTag = (tag) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };
  const addCustomTag = () => {
    const tag = customTag.trim().startsWith("#") ? customTag.trim() : `#${customTag.trim()}`;
    if (tag.length > 1 && !metadata.tags.includes(tag)) {
      setMetadata(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setCustomTag("");
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, newQuestion(prev.length + 1)]);
  };

  const updateQuestion = useCallback((id, updated) => {
    setQuestions(prev => prev.map(q => q.id === id ? updated : q));
  }, []);

  const deleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id).map((q, i) => ({ ...q, order: i + 1 })));
  };

  const moveQuestion = (index, dir) => {
    setQuestions(prev => {
      const arr = [...prev];
      const swapIdx = index + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return arr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  const validate = () => {
    const errors = [];
    if (!metadata.title.trim()) errors.push("Cần có tiêu đề Tiếng Việt");
    if (!metadata.grade) errors.push("Cần chọn khối lớp");
    if (questions.length < 3) errors.push("Cần ít nhất 3 câu hỏi");
    questions.forEach((q, i) => {
      if (!q.content_vi.trim()) errors.push(`Câu ${i + 1}: Thiếu nội dung tiếng Việt`);
      if (q.time_seconds < 15) errors.push(`Câu ${i + 1}: Thời gian tối thiểu là 15 giây`);
      if (q.type === "multiple_choice") {
        if (q.options.some(o => !o.text_vi.trim())) errors.push(`Câu ${i + 1}: Cần điền đủ 4 đáp án`);
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validate()) return;
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSubmit = async () => {
    if (!validate()) { setStep(1); return; }
    setSubmitting(true);
    setSubmitError("");
    await new Promise(r => setTimeout(r, 600));
    const totalTime = questions.reduce((s, q) => s + q.time_seconds, 0);
    const avgTime = questions.length > 0 ? Math.round(totalTime / questions.length) : 30;
    const mapData = {
      ...metadata,
      creator: user?.username || user?.email?.split("@")[0] || "Bạn",
      creatorEmail: user?.email || "anonymous@duomath.vn",
      question_count: questions.length,
      time_avg: avgTime,
      difficulty_fmp: Math.min(9.9, Math.max(1, questions.length * 0.6 + avgTime / 30)),
      questions,
      thumbnail_color: "linear-gradient(135deg, #a78bfa, #6d28d9)",
      icon: "📐",
      bgm_url: metadata.bgm === "custom" ? customBgmData : metadata.bgm,
      bgmId: metadata.bgm,
      customBgmName: customBgmName || "",
      thumbnail_url: customBgData || "",
      bgImageUrl: customBgData || "",
      bgOpacity: metadata.bgOpacity ?? 0.3,
      customBgName: customBgName || "",
    };
    const result = submitMap(mapData);
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error || "Không thể gửi MathMap. Vui lòng thử lại.");
      return;
    }
    setSubmittedId(result.id);
    setSubmitted(true);
  };

  const STEPS = [
    { label: "Metadata", sub: "Thông tin chung" },
    { label: "Câu hỏi", sub: "Thiết kế đề" },
    { label: "Xuất bản", sub: "Preview & Submit" },
  ];

  if (submitted) {
    return (
      <div style={{
        width: "100%", minHeight: "100vh",
        background: "linear-gradient(135deg, #020617, #0a0a1a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 20, padding: 40,
      }}>
        <div style={{ fontSize: 80 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", textAlign: "center" }}>
          MathMap đã được gửi thành công!
        </h2>

        {/* Status pipeline */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, overflow: "hidden",
        }}>
          {[
            { label: "Pending", desc: "Chờ admin duyệt", color: "#94a3b8", active: true },
            { label: "Qualified", desc: "Đã duyệt", color: "#fbbf24", active: false },
            { label: "Ranked", desc: "Sau 24h", color: "#22d3ee", active: false },
          ].map((s, i) => (
            <div key={s.label} style={{
              display: "flex", alignItems: "center",
            }}>
              <div style={{
                padding: "14px 22px", textAlign: "center",
                background: s.active ? `${s.color}18` : "transparent",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: s.active ? s.color : "rgba(255,255,255,0.25)", letterSpacing: 1 }}>
                  {s.active ? "▶ " : ""}{s.label}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.desc}</div>
              </div>
              {i < 2 && <span style={{ fontSize: 14, color: "rgba(255,255,255,0.15)", padding: "0 4px" }}>→</span>}
            </div>
          ))}
        </div>

        <p style={{ color: "rgba(255,255,255,0.55)", textAlign: "center", maxWidth: 460, fontSize: 13, lineHeight: 1.7 }}>
          Bài đã được lưu với trạng thái <strong style={{ color: "#94a3b8" }}>Pending</strong>. Admin sẽ xem xét và duyệt lên <strong style={{ color: "#fbbf24" }}>Qualified</strong>. Sau 24h sẽ tự động lên <strong style={{ color: "#22d3ee" }}>Ranked</strong> và xuất hiện trên BMF Forum.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/bmf"><button style={{
            padding: "12px 24px", background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
            color: "#000", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}>💬 Xem BMF Forum</button></Link>
          <button onClick={() => { setSubmitted(false); setStep(0); setQuestions([newQuestion(1)]); setMetadata({ title: "", title_en: "", grade: "Lớp 11", bgm: "dramatic01", tags: [], description: "" }); }} style={{
            padding: "12px 24px", background: "rgba(255,255,255,0.08)",
            color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}>
            ➕ Tạo MathMap mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 100%)",
      color: "white",
    }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 32px",
        background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(167,139,250,0.15)",
      }}>
        <Link href="/mrm" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2 }}>
            DUO<span style={{ color: "#22d3ee" }}>MATH</span>
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
        <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600 }}>🛠️ MathMap Creator</span>
        <div style={{ flex: 1 }} />
        <Link href="/mrm" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
          }}>← Quay lại MRM</button>
        </Link>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>
              ⚠️ Cần sửa trước khi tiếp tục:
            </div>
            {validationErrors.map((e, i) => (
              <div key={i} style={{ fontSize: 12, color: "#fca5a5", marginBottom: 2 }}>• {e}</div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
          {/* Main content */}
          <div>
            {/* ─── STEP 0: Metadata ─── */}
            {step === 0 && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
                    📋 Thông tin MathMap
                  </h2>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="file"
                      accept=".json"
                      id="import-map-file-creator"
                      onChange={handleImportMap}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("import-map-file-creator").click()}
                      style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 12,
                        background: "rgba(167,139,250,0.15)",
                        border: "1px solid rgba(167,139,250,0.3)",
                        color: "#a78bfa", cursor: "pointer", fontWeight: 700,
                      }}
                    >
                      📥 Nhập từ file JSON
                    </button>
                    <input
                      type="file"
                      accept=".txt,.md"
                      id="ai-import-map-file-creator"
                      onChange={handleAIImportMap}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      disabled={aiParsing}
                      onClick={() => document.getElementById("ai-import-map-file-creator").click()}
                      style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 12,
                        background: "rgba(6, 182, 212, 0.15)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                        color: "#22d3ee", cursor: "pointer", fontWeight: 700,
                        opacity: aiParsing ? 0.6 : 1,
                      }}
                    >
                      {aiParsing ? "⌛ Đang phân tích..." : "🧠 Nhập bằng AI (.txt, .md)"}
                    </button>
                  </div>
                </div>

                {/* AI Formatting guidelines */}
                <div style={{
                  padding: "12px 16px", borderRadius: 10,
                  background: "rgba(6, 182, 212, 0.05)",
                  border: "1px solid rgba(6, 182, 212, 0.18)",
                  fontSize: "12.5px", lineHeight: "1.65", color: "rgba(255,255,255,0.75)"
                }}>
                  💡 <strong>Quy tắc soạn file để AI tự động chuyển hóa:</strong><br />
                  1. Mỗi câu hỏi bắt đầu bằng: <code>Câu X:</code> hoặc <code>Question X:</code><br />
                  2. Đáp án trắc nghiệm trên dòng mới: <code>A. [Lựa chọn 1]</code>, <code>B. ...</code>, etc.<br />
                  3. Đáp án đúng ở cuối câu ghi rõ: <code>Đáp án: A</code> hoặc <code>Answer: A</code><br />
                  4. Có thể thêm lời giải: <code>Giải thích: [Lý giải...]</code>. Các công thức toán dùng <code>$ ... $</code>.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <StyledInput label="Tiêu đề (Tiếng Việt)" value={metadata.title}
                    onChange={v => updateMeta("title", v)} required
                    placeholder="VD: Phương trình bậc hai nâng cao" />
                  <StyledInput label="Title (English)" value={metadata.title_en}
                    onChange={v => updateMeta("title_en", v)}
                    placeholder="e.g. Advanced Quadratic Equations" />
                </div>

                <StyledTextarea label="Mô tả ngắn" value={metadata.description}
                  onChange={v => updateMeta("description", v)} rows={2}
                  placeholder="Mô tả ngắn về nội dung và đối tượng của MathMap này..." />

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                    Khối lớp *
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {GRADES.map(g => (
                      <button key={g} onClick={() => updateMeta("grade", g)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                        fontWeight: metadata.grade === g ? 700 : 400, fontSize: 14,
                        background: metadata.grade === g ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                        border: metadata.grade === g ? "2px solid rgba(34,211,238,0.5)" : "2px solid rgba(255,255,255,0.08)",
                        color: metadata.grade === g ? "#22d3ee" : "rgba(255,255,255,0.55)",
                        transition: "all 0.15s",
                      }}>{g}</button>
                    ))}
                  </div>
                </div>

                {/* BGM */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                    🎵 Nhạc nền (BGM)
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {BGM_OPTIONS.map(bgm => (
                      <button key={bgm.id} onClick={() => updateMeta("bgm", bgm.id)} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                        background: metadata.bgm === bgm.id ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)",
                        border: metadata.bgm === bgm.id ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        color: "white", transition: "all 0.15s",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: metadata.bgm === bgm.id ? "#a78bfa" : "rgba(255,255,255,0.2)",
                        }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: metadata.bgm === bgm.id ? 700 : 400, color: metadata.bgm === bgm.id ? "#c4b5fd" : "rgba(255,255,255,0.8)" }}>
                            {bgm.label}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{bgm.preview}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom BGM Upload */}
                {metadata.bgm === "custom" && (
                  <div style={{
                    marginTop: 10,
                    padding: 16,
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px dashed rgba(167, 139, 250, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleBgmUpload(file);
                    }}
                    onClick={() => document.getElementById("bgm-file-input").click()}
                  >
                    <input
                      id="bgm-file-input"
                      type="file"
                      accept="audio/*"
                      onChange={e => handleBgmUpload(e.target.files?.[0])}
                      style={{ display: "none" }}
                    />
                    <div style={{ fontSize: 24 }}>🎵</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c4b5fd", textAlign: "center" }}>
                      {customBgmName ? `Đã chọn: ${customBgmName}` : "Kéo thả file MP3 hoặc Nhấp để chọn"}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      Hỗ trợ MP3, WAV, OGG • Tối đa 10MB
                    </div>
                    {audioPreviewUrl && (
                      <div onClick={e => e.stopPropagation()} style={{ width: "100%", marginTop: 8 }}>
                        <audio src={audioPreviewUrl} controls style={{ width: "100%", height: 32 }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Background Image Upload */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                    🖼️ Hình nền MathMap (Background Image)
                  </label>
                  <div style={{
                    padding: 16,
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px dashed rgba(34, 211, 238, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleBgUpload(file);
                    }}
                    onClick={() => document.getElementById("bg-file-input").click()}
                  >
                    <input
                      id="bg-file-input"
                      type="file"
                      accept="image/*"
                      onChange={e => handleBgUpload(e.target.files?.[0])}
                      style={{ display: "none" }}
                    />
                    {customBgData ? (
                      <img src={customBgData} style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ fontSize: 24 }}>🖼️</div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee", textAlign: "center" }}>
                      {customBgName ? `Đã chọn: ${customBgName}` : "Kéo thả file ảnh hoặc Nhấp để chọn"}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      Hỗ trợ JPG, PNG, WEBP • Tối đa 5MB
                    </div>
                  </div>
                </div>

                {/* Background Opacity Slider */}
                {customBgData && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                      🌫️ Độ mờ nền (Background Opacity)
                    </label>

                    {/* Live preview strip */}
                    <div style={{
                      width: "100%", height: 64, borderRadius: 10, marginBottom: 12,
                      overflow: "hidden", position: "relative",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: `url(${customBgData})`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        opacity: metadata.bgOpacity ?? 0.3,
                        transition: "opacity 0.1s",
                      }} />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `rgba(3,2,10,${1 - (metadata.bgOpacity ?? 0.3)})`,
                      }} />
                      <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700,
                        letterSpacing: 0.5,
                      }}>
                        🎮 Xem trước — Opacity: {Math.round((metadata.bgOpacity ?? 0.3) * 100)}%
                      </div>
                    </div>

                    {/* Slider row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 24 }}>0%</span>
                      <input
                        type="range" min={0} max={100}
                        value={Math.round((metadata.bgOpacity ?? 0.3) * 100)}
                        onChange={e => updateMeta("bgOpacity", Number(e.target.value) / 100)}
                        style={{ flex: 1, accentColor: "#22d3ee", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 30 }}>100%</span>
                      <span style={{
                        fontSize: 12, fontWeight: 800, color: "#22d3ee",
                        background: "rgba(34,211,238,0.12)", borderRadius: 6,
                        padding: "3px 10px", border: "1px solid rgba(34,211,238,0.25)",
                        minWidth: 44, textAlign: "center",
                      }}>
                        {Math.round((metadata.bgOpacity ?? 0.3) * 100)}%
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                      Giá trị này sẽ được áp dụng khi user chơi bản đồ (cả Single & Multiplayer).
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", marginBottom: 8, display: "block" }}>
                    🏷️ Tags (hashtag)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                    {SUGGESTED_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)} style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                        fontWeight: metadata.tags.includes(tag) ? 700 : 400,
                        background: metadata.tags.includes(tag) ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                        border: metadata.tags.includes(tag) ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        color: metadata.tags.includes(tag) ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                        transition: "all 0.15s",
                      }}>{tag}</button>
                    ))}
                  </div>

                  {/* Custom tag */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text" value={customTag}
                      onChange={e => setCustomTag(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addCustomTag(); }}
                      placeholder="Tag tùy chỉnh (Enter để thêm)..."
                      style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "white", fontSize: 12, outline: "none",
                      }}
                    />
                    <button onClick={addCustomTag} style={{
                      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                      background: "rgba(167,139,250,0.15)",
                      border: "1px solid rgba(167,139,250,0.3)",
                      color: "#a78bfa", fontSize: 12, fontWeight: 600,
                    }}>+ Thêm</button>
                  </div>

                  {/* Selected tags */}
                  {metadata.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {metadata.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: 11, color: "#c4b5fd",
                          background: "rgba(167,139,250,0.15)",
                          border: "1px solid rgba(167,139,250,0.35)",
                          borderRadius: 5, padding: "3px 9px",
                          display: "flex", alignItems: "center", gap: 5,
                        }}>
                          {tag}
                          <button onClick={() => toggleTag(tag)} style={{
                            background: "none", border: "none", color: "#f87171",
                            cursor: "pointer", fontSize: 12, padding: 0,
                          }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── STEP 1: Questions ─── */}
            {step === 1 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
                    ❓ Câu hỏi ({questions.length})
                  </h2>
                  <button onClick={addQuestion} style={{
                    padding: "9px 18px", borderRadius: 9, cursor: "pointer",
                    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                    border: "none", color: "#000", fontWeight: 700, fontSize: 13,
                    boxShadow: "0 4px 12px rgba(34,211,238,0.35)",
                  }}>
                    + Thêm câu hỏi
                  </button>
                </div>

                {questions.map((q, i) => (
                  <QuestionEditor
                    key={q.id} q={q} index={i}
                    onChange={(updated) => updateQuestion(q.id, updated)}
                    onDelete={() => deleteQuestion(q.id)}
                    onMoveUp={() => moveQuestion(i, -1)}
                    onMoveDown={() => moveQuestion(i, 1)}
                    isFirst={i === 0} isLast={i === questions.length - 1}
                  />
                ))}

                {questions.length === 0 && (
                  <div style={{
                    textAlign: "center", padding: "60px 20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 12,
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                      Chưa có câu hỏi nào. Nhấn "+ Thêm câu hỏi" để bắt đầu.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2: Preview & Publish ─── */}
            {step === 2 && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 24,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 16 }}>
                  🚀 Xuất bản MathMap
                </h2>

                <div style={{
                  background: "rgba(34,211,238,0.06)",
                  border: "1px solid rgba(34,211,238,0.2)",
                  borderRadius: 10, padding: "14px 16px", marginBottom: 20,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", marginBottom: 6 }}>
                    ✅ MathMap sẵn sàng xuất bản
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                    Sau khi gửi, AI Classifier sẽ phân tích tags và nội dung để:
                    <br />• Xác định độ khó (điểm FMP) chính xác
                    <br />• Kiểm duyệt nội dung toán học
                    <br />• Phân loại chủ đề và gán nhãn tự động
                    <br />• Đưa vào danh sách <strong>Pending</strong> → sau khi duyệt sẽ lên <strong>Qualified</strong> → <strong>Ranked</strong>
                  </div>
                </div>

                {/* Preview all questions */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                    Preview tất cả câu hỏi:
                  </div>
                  {questions.map((q, i) => (
                    <div key={q.id} style={{
                      padding: "12px 14px", background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 8,
                    }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 800, color: "#22d3ee", flexShrink: 0,
                        }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                            {q.content_vi || "(Chưa có nội dung)"}
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                            {q.type === "multiple_choice" ? "Trắc nghiệm" : q.type === "fill_in_blank" ? "Điền chỗ trống" : "Đúng/Sai"}
                            {" · "}⏱ {q.time_seconds}s
                            {" · "}💎 {q.points} điểm
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {submitError && (
                  <div style={{
                    marginBottom: 14, padding: "12px 14px",
                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)",
                    borderRadius: 10, fontSize: 13, color: "#fca5a5", lineHeight: 1.5,
                  }}>
                    ⚠️ {submitError}
                  </div>
                )}

                <button
                  onClick={handleSubmit} disabled={submitting}
                  style={{
                    width: "100%", padding: "15px 0",
                    background: submitting
                      ? "rgba(34,211,238,0.3)"
                      : "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                    border: "none", borderRadius: 12, color: "#000",
                    fontSize: 16, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 20px rgba(34,211,238,0.4)",
                    transition: "all 0.2s",
                  }}
                >
                  {submitting ? "⏳ Đang gửi lên BMF Forum..." : "🚀 Xuất bản MathMap"}
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button
                onClick={() => setStep(s => Math.max(s - 1, 0))}
                disabled={step === 0}
                style={{
                  padding: "11px 24px", borderRadius: 10,
                  background: step === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: step === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
                  cursor: step === 0 ? "default" : "pointer", fontSize: 14, fontWeight: 600,
                }}
              >
                ← Quay lại
              </button>
              {step < 2 && (
                <button onClick={handleNext} style={{
                  padding: "11px 28px", borderRadius: 10,
                  background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                  border: "none", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(34,211,238,0.35)",
                }}>
                  Tiếp theo →
                </button>
              )}
            </div>
          </div>

          {/* Sidebar: Live Preview */}
          <div style={{ position: "sticky", top: 20, alignSelf: "flex-start" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              Preview
            </div>
            <PreviewCard metadata={metadata} questions={questions} customBgData={customBgData} customBgmName={customBgmName} />

            {/* Stats */}
            <div style={{
              marginTop: 12, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                Thống kê
              </div>
              {[
                ["❓", "Số câu", questions.length],
                ["⏱", "Thời gian TB", questions.length > 0 ? `${Math.round(questions.reduce((s, q) => s + q.time_seconds, 0) / questions.length)}s/câu` : "—"],
                ["💎", "Tổng điểm", questions.reduce((s, q) => s + q.points, 0)],
                ["⚠️", "Câu < 15s", questions.filter(q => q.time_seconds < 15).length],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{icon} {label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: label === "Câu < 15s" && val > 0 ? "#ef4444" : "white",
                  }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
