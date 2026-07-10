"use client";
/**
 * NearMissEffect.js — Hiệu ứng "suýt thắng" khi trả lời sai
 * Phân tích khoảng cách đáp án, hiện nút Revive bằng xu
 */
import { useState } from "react";
import { useCoinStore } from "@/context/CoinStore";

const REVIVE_COST = 30;

export default function NearMissEffect({ question, userAnswer, onRevive, onContinue, disabled }) {
  const { coins, spendCoins } = useCoinStore();
  const [reviving, setReviving] = useState(false);
  const canRevive = coins >= REVIVE_COST && !disabled;

  // Phân tích khoảng cách đáp án
  function getNearMissMessage() {
    if (!question) return null;

    if (question.type === "fill_in_blank") {
      const correct = (question.correctAnswerText || "").trim();
      const user = (userAnswer || "").trim();
      if (!correct || !user) return null;
      const cNum = parseFloat(correct);
      const uNum = parseFloat(user);
      if (!isNaN(cNum) && !isNaN(uNum)) {
        const diff = Math.abs(cNum - uNum);
        if (diff <= 0.5) return `Bạn chỉ cách đáp án đúng ${diff.toFixed(2)} đơn vị! 🎯`;
        if (diff <= 2)   return `Rất gần rồi! Chênh lệch chỉ ${diff.toFixed(1)} đơn vị`;
      }
      let matches = 0;
      const minLen = Math.min(correct.length, user.length);
      for (let i = 0; i < minLen; i++) {
        if (correct[i].toLowerCase() === user[i].toLowerCase()) matches++;
      }
      const pct = Math.round((matches / Math.max(correct.length, 1)) * 100);
      if (pct >= 70) return `Bạn đã đúng ${pct}% — chỉ sai một chút ở cuối!`;
    }

    if (question.type === "multiple_choice" || question.type === "true_false") {
      return "Gần đúng rồi! Hãy đọc lại câu hỏi và chọn cẩn thận hơn.";
    }
    return null;
  }

  const nearMissMsg = getNearMissMessage();
  const isNearMiss = !!nearMissMsg;

  const handleRevive = async () => {
    if (!canRevive) return;
    setReviving(true);
    await spendCoins(REVIVE_COST);
    setTimeout(() => {
      setReviving(false);
      onRevive?.();
    }, 400);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(2,6,23,0.88)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      animation: "nearMissIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      <div style={{
        background: "linear-gradient(145deg, #1a0a0a 0%, #0a0a1a 100%)",
        border: `1px solid ${isNearMiss ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: 20, padding: "32px 36px",
        width: "100%", maxWidth: 420, textAlign: "center",
        boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${isNearMiss ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)"}`,
      }}>
        {/* Icon */}
        <div style={{
          fontSize: 52, marginBottom: 10,
          animation: "shakeBounce 0.5s ease-out both",
        }}>
          {isNearMiss ? "😬" : "💔"}
        </div>

        <h2 style={{
          fontSize: 20, fontWeight: 900, color: "white",
          margin: 0, marginBottom: 8,
        }}>
          {isNearMiss ? "Suýt rồi!" : "Sai mất rồi!"}
        </h2>

        {nearMissMsg && (
          <div style={{
            fontSize: 13, color: "#fbbf24", marginBottom: 12,
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: 8, padding: "8px 14px",
            fontWeight: 600,
          }}>
            {nearMissMsg}
          </div>
        )}

        {/* Correct answer hint */}
        {question?.type === "multiple_choice" && question.correct !== undefined && (
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            marginBottom: 20, fontStyle: "italic",
          }}>
            Đáp án đúng: <span style={{ color: "#4ade80", fontWeight: 700, fontStyle: "normal" }}>
              {["A", "B", "C", "D"][question.correct]}. {question.options?.[question.correct]}
            </span>
          </div>
        )}

        {/* Revive button */}
        {isNearMiss && (
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={handleRevive}
              disabled={!canRevive || reviving}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10,
                fontSize: 14, fontWeight: 800,
                background: canRevive
                  ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                color: canRevive ? "#000" : "rgba(255,255,255,0.25)",
                cursor: canRevive ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow: canRevive ? "0 4px 16px rgba(251,191,36,0.4)" : "none",
              }}
            >
              {reviving ? "⏳ Hồi sinh..." : canRevive
                ? `⚡ Hồi sinh (${REVIVE_COST} xu) — thử lại câu này!`
                : `Không đủ xu (cần ${REVIVE_COST})`
              }
            </button>
            {canRevive && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>
                Còn {coins} xu · Sẽ còn {coins - REVIVE_COST} xu sau khi dùng
              </div>
            )}
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={onContinue}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 10,
            fontSize: 13, fontWeight: 700,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
        >
          Tiếp tục →
        </button>
      </div>

      <style>{`
        @keyframes nearMissIn {
          from { opacity: 0; transform: scale(1.05); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shakeBounce {
          0%   { transform: rotate(0deg) scale(0.5); opacity: 0; }
          40%  { transform: rotate(-8deg) scale(1.2); opacity: 1; }
          60%  { transform: rotate(6deg) scale(0.95); }
          80%  { transform: rotate(-3deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
