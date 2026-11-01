"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { resolveApiBase } from "@/lib/apiBase";

const BASE = resolveApiBase();

const REASONS = [
  { id: "wrong_ocr", label: "📷 Đọc sai đề từ ảnh" },
  { id: "wrong_math", label: "🧮 Tính toán / Đáp số sai" },
  { id: "wrong_diagram", label: "📐 Hình vẽ bị lệch / thiếu điểm" },
  { id: "other", label: "💬 Lý do khác" },
];

/**
 * WP-A2: 1-Click Student Report button under AI Tutor answers.
 * Logs directly to /api/chat/feedback -> ai_quality_log for Admin review & regression test extraction.
 */
export default function SolutionFeedbackButton({ question = "", answer = "", sessionId = "" }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitReason(reasonId) {
    setSubmitting(true);
    try {
      const hdrs = { "Content-Type": "application/json" };
      try {
        const cu = auth?.currentUser;
        if (cu) {
          hdrs["Authorization"] = `Bearer ${await cu.getIdToken()}`;
        }
      } catch (_) {}
      if (!hdrs["Authorization"] && typeof window !== "undefined") {
        const tok = localStorage.getItem("duomath_token") || localStorage.getItem("token");
        if (tok) hdrs["Authorization"] = `Bearer ${tok}`;
      }
      await fetch(`${BASE}/api/chat/feedback`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({
          reason: reasonId,
          question: String(question || "").slice(0, 400),
          answer: String(answer || "").slice(0, 400),
          session_id: String(sessionId || ""),
        }),
      });
      setSent(true);
      setOpen(false);
    } catch (_) {
      setSent(true);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <span style={{ fontSize: 11.5, color: "#4ade80", fontWeight: 600 }}>
        ✓ Đã ghi nhận phản hồi để cải thiện lời giải
      </span>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          border: "1px solid rgba(148, 163, 184, 0.28)",
          color: "#94a3b8",
          borderRadius: 6,
          padding: "3px 8px",
          fontSize: 11.5,
          cursor: "pointer",
        }}
      >
        🚩 Báo lời giải sai / Hình lệch
      </button>
      {open && (
        <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={submitting}
              onClick={() => submitReason(r.id)}
              style={{
                background: "rgba(239, 68, 68, 0.14)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 11.5,
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
