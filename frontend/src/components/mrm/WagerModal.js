"use client";
/**
 * WagerModal.js — Modal đặt cược xu trước khi bắt đầu game
 * Xuất hiện ở màn hình Intro của SingleplayerGame
 */
import { useState } from "react";
import { useCoinStore } from "@/context/CoinStore";

const WAGER_OPTIONS = [
  { label: "An toàn",  desc: "Không mất gì", wager: 0,   multiplier: 0, reward: 10,  color: "#4ade80", icon: "🛡️" },
  { label: "Mạo hiểm", desc: "Cược 20 xu",  wager: 20,  multiplier: 3, reward: 60,  color: "#fbbf24", icon: "⚡" },
  { label: "Liều lĩnh", desc: "Cược 50 xu", wager: 50,  multiplier: 3, reward: 150, color: "#f97316", icon: "🔥" },
  { label: "Tất tay!", desc: "Cược 100 xu", wager: 100, multiplier: 3, reward: 300, color: "#ef4444", icon: "💀" },
];

export default function WagerModal({ onConfirm, onSkip }) {
  const { coins } = useCoinStore();
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(null);

  const opt = WAGER_OPTIONS[selected];
  const canAfford = opt.wager === 0 || coins >= opt.wager;

  const handleConfirm = () => {
    onConfirm({
      wager: opt.wager,
      multiplier: opt.multiplier,
      safeReward: opt.reward,
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(2,6,23,0.92)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: "linear-gradient(145deg, #0d1b3e 0%, #0a0a1a 100%)",
        border: "1px solid rgba(251,191,36,0.25)",
        borderRadius: 20, padding: "32px 36px",
        width: "100%", maxWidth: 460,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(251,191,36,0.06)",
        animation: "wagerSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎰</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: 0, marginBottom: 6 }}>
            Đặt Cược Trước Khi Bắt Đầu
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Cược xu để nhân phần thưởng — Thắng = x3, Thua = mất cược
          </p>
          <div style={{
            marginTop: 10, fontSize: 13, fontWeight: 700,
            color: "#fbbf24", background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8,
            padding: "5px 12px", display: "inline-block",
          }}>
            🪙 Ví của bạn: {coins.toLocaleString()} xu
          </div>
        </div>

        {/* Options grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {WAGER_OPTIONS.map((op, i) => {
            const isSelected = selected === i;
            const affordable = op.wager === 0 || coins >= op.wager;
            return (
              <button
                key={i}
                disabled={!affordable}
                onClick={() => affordable && setSelected(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: "14px 12px", borderRadius: 12, cursor: affordable ? "pointer" : "not-allowed",
                  background: isSelected ? `${op.color}18` : hovered === i && affordable ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                  border: `2px solid ${isSelected ? op.color : affordable ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                  color: affordable ? "white" : "rgba(255,255,255,0.25)",
                  transition: "all 0.2s", textAlign: "center",
                  boxShadow: isSelected ? `0 0 16px ${op.color}44` : "none",
                  opacity: affordable ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{op.icon}</div>
                <div style={{
                  fontSize: 13, fontWeight: 800,
                  color: isSelected ? op.color : "white",
                }}>
                  {op.label}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  {op.desc}
                </div>
                <div style={{
                  marginTop: 6, fontSize: 11, fontWeight: 700,
                  color: op.color,
                }}>
                  {op.wager === 0 ? `+${op.reward} xu cố định` : `Thắng: +${op.reward} xu`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, padding: "12px 16px",
          marginBottom: 20, fontSize: 13,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Cược:</span>
            <span style={{ fontWeight: 800, color: opt.wager === 0 ? "#4ade80" : "#fbbf24" }}>
              {opt.wager === 0 ? "Không cược" : `${opt.wager} xu`}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Nếu thắng (≥60%):</span>
            <span style={{ fontWeight: 800, color: "#4ade80" }}>+{opt.reward} xu</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleConfirm}
            disabled={!canAfford}
            style={{
              flex: 2, padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 800,
              background: canAfford
                ? `linear-gradient(135deg, ${opt.color}, ${opt.color}bb)`
                : "rgba(255,255,255,0.05)",
              border: "none",
              color: canAfford ? "#000" : "rgba(255,255,255,0.25)",
              cursor: canAfford ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: canAfford ? `0 4px 16px ${opt.color}55` : "none",
            }}
          >
            {opt.icon} Xác nhận & Bắt đầu
          </button>
          <button
            onClick={onSkip}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            Bỏ qua
          </button>
        </div>
      </div>

      <style>{`
        @keyframes wagerSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
