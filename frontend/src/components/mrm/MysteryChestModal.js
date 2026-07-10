"use client";
/**
 * MysteryChestModal.js — Hộp quà bí ẩn sau khi hoàn thành bài
 * Variable Reward System — kích thích dopamine bằng sự bất định
 */
import { useState, useEffect } from "react";
import { useCoinStore } from "@/context/CoinStore";

const REWARDS = [
  { id: "coins_50",  label: "+50 Xu",    emoji: "🪙", rarity: "common",    weight: 45, coins: 50,  token: null },
  { id: "coins_150", label: "+150 Xu",   emoji: "💰", rarity: "uncommon",  weight: 30, coins: 150, token: null },
  { id: "coins_300", label: "+300 Xu",   emoji: "✨", rarity: "rare",      weight: 15, coins: 300, token: null },
  { id: "badge",     label: "Badge Ảo!", emoji: "🎖️", rarity: "epic",      weight: 7,  coins: 0,   token: "badge" },
  { id: "x2token",   label: "X2 Token!", emoji: "🃏", rarity: "legendary", weight: 3,  coins: 0,   token: "x2" },
];

const RARITY_COLORS = { common: "#94a3b8", uncommon: "#4ade80", rare: "#60a5fa", epic: "#a78bfa", legendary: "#fbbf24" };
const RARITY_GLOW   = { common: "rgba(148,163,184,0.3)", uncommon: "rgba(74,222,128,0.4)", rare: "rgba(96,165,250,0.4)", epic: "rgba(167,139,250,0.5)", legendary: "rgba(251,191,36,0.6)" };

function pickReward() {
  const total = REWARDS.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * total;
  for (const r of REWARDS) { rand -= r.weight; if (rand <= 0) return r; }
  return REWARDS[0];
}

export default function MysteryChestModal({ onClose, onTokenEarned }) {
  const { earnCoins } = useCoinStore();
  const [phase, setPhase] = useState("idle");
  const [reward, setReward] = useState(null);
  const [spinEmojis, setSpinEmojis] = useState(["🎁", "🎁", "🎁"]);
  const [earned, setEarned] = useState(false);

  const handleOpen = () => {
    if (phase !== "idle") return;
    setPhase("spinning");
    let spins = 0;
    const interval = setInterval(() => {
      setSpinEmojis([
        REWARDS[Math.floor(Math.random() * REWARDS.length)].emoji,
        REWARDS[Math.floor(Math.random() * REWARDS.length)].emoji,
        REWARDS[Math.floor(Math.random() * REWARDS.length)].emoji,
      ]);
      spins++;
      if (spins > 16) {
        clearInterval(interval);
        const picked = pickReward();
        setReward(picked);
        setSpinEmojis([picked.emoji, picked.emoji, picked.emoji]);
        setPhase("revealed");
      }
    }, 80);
  };

  useEffect(() => {
    if (phase === "revealed" && reward && !earned) {
      setEarned(true);
      if (reward.coins > 0) earnCoins(reward.coins, "mystery_chest");
      if (reward.token === "x2") onTokenEarned?.("x2");
    }
  }, [phase, reward, earned]); // eslint-disable-line

  const color = reward ? RARITY_COLORS[reward.rarity] : "#22d3ee";
  const glow  = reward ? RARITY_GLOW[reward.rarity]  : "rgba(34,211,238,0.3)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(2,6,23,0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "linear-gradient(145deg, #0d1b3e 0%, #0a0a1a 100%)", border: `1px solid ${color}44`, borderRadius: 24, padding: "36px 40px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${glow}`, animation: "chestIn 0.5s cubic-bezier(0.16,1,0.3,1) both", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents: "none", transition: "background 0.5s" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: 0, marginBottom: 6 }}>🎁 Hộp Quà Bí Ẩn</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Phần thưởng ngẫu nhiên khi hoàn thành bài!</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
            {spinEmojis.map((e, i) => (
              <div key={i} style={{ width: 72, height: 72, background: "rgba(255,255,255,0.04)", border: `2px solid ${phase === "revealed" ? color : "rgba(255,255,255,0.12)"}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: phase === "revealed" ? `0 0 20px ${glow}` : "none", transition: "border-color 0.3s, box-shadow 0.3s" }}>
                {e}
              </div>
            ))}
          </div>
          {phase === "revealed" && reward && (
            <div style={{ animation: "rewardReveal 0.6s cubic-bezier(0.16,1,0.3,1) both", marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color, textTransform: "uppercase", marginBottom: 6 }}>{reward.rarity}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white", textShadow: `0 0 20px ${color}` }}>{reward.emoji} {reward.label}</div>
              {reward.coins > 0 && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Đã thêm vào ví xu của bạn!</div>}
              {reward.token === "x2" && <div style={{ marginTop: 10, padding: "8px 16px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, fontSize: 12, color: "#fbbf24" }}>🃏 Token X2 điểm đã kích hoạt cho bài tiếp theo!</div>}
            </div>
          )}
          {phase === "idle" && (
            <button onClick={handleOpen} style={{ width: "100%", padding: "14px 0", borderRadius: 12, fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg, #22d3ee, #6366f1)", border: "none", color: "white", cursor: "pointer", boxShadow: "0 4px 20px rgba(34,211,238,0.4)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>🎰 Mở hộp quà!</button>
          )}
          {phase === "spinning" && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: 2 }}>✨ Đang quay...</div>}
          {phase === "revealed" && (
            <button onClick={onClose} style={{ width: "100%", padding: "13px 0", borderRadius: 12, fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}99)`, border: "none", color: "#000", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>🚀 Tiếp tục học!</button>
          )}
        </div>
      </div>
      {phase === "revealed" && reward?.rarity === "legendary" && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: "-10%", width: 8, height: 8, borderRadius: "50%", background: ["#fbbf24","#22d3ee","#a78bfa","#f87171","#4ade80"][i % 5], animation: `confettiFall ${1.5 + Math.random() * 2}s ${Math.random() * 0.5}s ease-in both` }} />
          ))}
        </div>
      )}
      <style>{`
        @keyframes chestIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes rewardReveal { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes confettiFall { from { transform: translateY(-20px) rotate(0deg); opacity: 1; } to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
      `}</style>
    </div>
  );
}
