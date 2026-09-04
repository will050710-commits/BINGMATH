"use client";
import React from "react";

const RANK_STYLES = {
  SS: {
    bg: "linear-gradient(135deg, #FFE58A, #F59E0B, #F97316)",
    text: "#1A0512",
    shadow: "0 0 16px rgba(245, 158, 11, 0.45)",
    border: "border-amber-300/40",
  },
  S: {
    bg: "linear-gradient(135deg, #FFE58A, #F59E0B)",
    text: "#1A0512",
    shadow: "0 0 12px rgba(245, 158, 11, 0.35)",
    border: "border-amber-400/30",
  },
  A: {
    bg: "linear-gradient(135deg, #8CFFC4, #10B981)",
    text: "#06281E",
    shadow: "0 0 12px rgba(16, 185, 129, 0.35)",
    border: "border-emerald-400/30",
  },
  B: {
    bg: "linear-gradient(135deg, #9FE6FF, #0EA5E9)",
    text: "#041F38",
    shadow: "0 0 12px rgba(14, 165, 233, 0.35)",
    border: "border-sky-400/30",
  },
  C: {
    bg: "linear-gradient(135deg, #D9AFFF, #8B5CF6)",
    text: "#FFFFFF",
    shadow: "0 0 12px rgba(139, 92, 246, 0.35)",
    border: "border-purple-400/30",
  },
  D: {
    bg: "linear-gradient(135deg, #FF9C9C, #EF4444)",
    text: "#FFFFFF",
    shadow: "0 0 12px rgba(239, 68, 68, 0.35)",
    border: "border-red-400/30",
  },
};

const SIZE_STYLES = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-base",
  lg: "w-13 h-13 text-xl",
};

export default function RankBadge({
  rank = "A",
  size = "md",
  className = "",
  glow = true,
}) {
  const normRank = (rank || "A").toUpperCase();
  const rankConfig = RANK_STYLES[normRank] || RANK_STYLES.A;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <div
      className={`inline-flex items-center justify-center font-black cut-chip shrink-0 select-none tracking-wider ${sizeClass} ${className}`}
      style={{
        background: rankConfig.bg,
        color: rankConfig.text,
        boxShadow: glow ? rankConfig.shadow : "none",
      }}
      title={`Xếp loại ${normRank}`}
      aria-label={`Xếp loại ${normRank}`}
    >
      <span>{normRank}</span>
    </div>
  );
}
