"use client";
import { useState, useMemo } from "react";

/**
 * Progressive step-by-step reading disclosure for long responses.
 * Note: This is a local reading scaffold and does not represent server-graded
 * Socratic step assessment (which is governed by Q2).
 */
export default function SocraticHintCard({ content, enabled = false, children }) {
  const [unlockedStep, setUnlockedStep] = useState(1);
  const [prevEnabled, setPrevEnabled] = useState(enabled);

  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    setUnlockedStep(enabled ? 1 : 99);
  }

  const steps = useMemo(() => {
    const raw = String(content || "").trim();
    if (!raw) return [];
    const blocks = raw
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (blocks.length <= 1) return [raw];
    const step1 = blocks[0];
    const step2 = blocks.slice(1, Math.max(2, Math.ceil(blocks.length * 0.5))).join("\n\n");
    const step3 = blocks.slice(Math.max(2, Math.ceil(blocks.length * 0.5)), -1).join("\n\n");
    return [step1, step2, step3].filter(Boolean);
  }, [content]);

  if (!enabled || unlockedStep >= 4 || steps.length <= 1) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        border: "1px solid rgba(250, 204, 21, 0.35)",
        background: "rgba(250, 204, 21, 0.06)",
        borderRadius: 12,
        padding: 14,
        marginTop: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          fontSize: 12,
          color: "#facc15",
          fontWeight: 700,
        }}
      >
        <span>💡 GỢI Ý ĐỌC TỪNG BƯỚC — Đang mở {unlockedStep}/{steps.length} gợi ý</span>
        <button
          type="button"
          onClick={() => setUnlockedStep(99)}
          style={{
            background: "transparent",
            border: "1px solid rgba(250, 204, 21, 0.45)",
            color: "#fde047",
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 11.5,
            cursor: "pointer",
          }}
        >
          Xem lời giải đầy đủ
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.slice(0, unlockedStep).map((st, idx) => (
          <div
            key={idx}
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              background: "rgba(15, 23, 42, 0.75)",
              borderLeft: "3px solid #facc15",
              fontSize: 13.5,
              color: "#e2e8f0",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong style={{ color: "#facc15" }}>Gợi ý {idx + 1}: </strong>
            {st}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {unlockedStep < steps.length ? (
          <button
            type="button"
            onClick={() => setUnlockedStep((s) => s + 1)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              background: "#eab308",
              color: "#0b0f19",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            🔓 Mở Gợi ý {unlockedStep + 1}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setUnlockedStep(99)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              background: "#22c55e",
              color: "#052e16",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ✅ Xem toàn bộ lời giải & hình vẽ
          </button>
        )}
      </div>
    </div>
  );
}
