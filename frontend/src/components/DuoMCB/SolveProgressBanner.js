"use client";
import { useState, useEffect } from "react";

const SERVER_STAGE_LABELS = {
  requesting: {
    vi: "Đang gửi yêu cầu...",
    en: "Sending request...",
  },
  generating: {
    vi: "Đang xử lý lời giải toán học...",
    en: "Generating mathematical response...",
  },
  verifying: {
    vi: "Đang kiểm chứng kết quả...",
    en: "Verifying mathematical claims...",
  },
  complete: {
    vi: "Đã hoàn tất xử lý",
    en: "Processing complete",
  },
  failed: {
    vi: "Không thể hoàn tất yêu cầu",
    en: "Request could not be completed",
  },
};

/**
 * Q1-compliant progress banner during AI math/image solving.
 * Never fabricates pipeline stages ("verifying", "drawing") or fake percentage
 * progress from elapsed time alone; only shows stage-specific copy when backed
 * by an explicit `source === "server-event"` signal.
 */
export default function SolveProgressBanner({
  active,
  hasImage = false,
  lang = "vi",
  stage = null,
  source = "transport",
}) {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedSec(0);
      return;
    }
    const t0 = Date.now();
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - t0) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const isEn = lang === "en";
  const hasServerStage = source === "server-event" && stage && SERVER_STAGE_LABELS[stage];
  const label = hasServerStage
    ? SERVER_STAGE_LABELS[stage][isEn ? "en" : "vi"]
    : hasImage
      ? isEn
        ? "Processing image and request..."
        : "Đang xử lý ảnh và yêu cầu..."
      : isEn
        ? "Processing request..."
        : "Đang xử lý yêu cầu...";

  return (
    <div
      role="status"
      aria-live="polite"
      className=" my-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs text-ink"
      style={{
        margin: "8px 0 12px",
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--surface, #1c1c1a)",
        border: "1px solid var(--border, #3a3a37)",
        color: "var(--text, #faf9f5)",
        fontSize: 12.5,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span
          aria-hidden="true"
          style={{ fontFamily: "monospace", color: "var(--text-muted, #b0aea5)", fontSize: 11.5 }}
        >
          {elapsedSec}s
        </span>
      </div>
    </div>
  );
}
