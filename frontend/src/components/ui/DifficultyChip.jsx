"use client";
import React from "react";

export function getDifficultyTier(rating) {
  const r = parseFloat(rating) || 1.0;
  if (r <= 2.5) {
    return {
      label: "Cơ bản",
      color: "#38bdf8",
      borderColor: "rgba(56, 189, 248, 0.4)",
      bg: "rgba(56, 189, 248, 0.12)",
    };
  }
  if (r <= 4.0) {
    return {
      label: "Trung bình",
      color: "#34d399",
      borderColor: "rgba(52, 211, 153, 0.4)",
      bg: "rgba(52, 211, 153, 0.12)",
    };
  }
  if (r <= 5.5) {
    return {
      label: "Nâng cao",
      color: "#fbbf24",
      borderColor: "rgba(251, 191, 36, 0.4)",
      bg: "rgba(251, 191, 36, 0.12)",
    };
  }
  if (r <= 7.5) {
    return {
      label: "Khó",
      color: "#f472b6",
      borderColor: "rgba(244, 114, 182, 0.4)",
      bg: "rgba(244, 114, 182, 0.12)",
    };
  }
  return {
    label: "Chuyên gia",
    color: "#c084fc",
    borderColor: "rgba(192, 132, 252, 0.4)",
    bg: "rgba(192, 132, 252, 0.12)",
  };
}

export default function DifficultyChip({
  rating = 3.0,
  label = null,
  stars = true,
  size = "md",
  className = "",
}) {
  const tier = getDifficultyTier(rating);
  const displayLabel = label || tier.label;
  const numRating = Number(rating).toFixed(1);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 cut-chip font-mono select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        color: tier.color,
        backgroundColor: tier.bg,
        border: `1px solid ${tier.borderColor}`,
      }}
    >
      <span>{numRating}</span>
      {stars && <span className="text-[11px] leading-none">★</span>}
      <span className="font-sans font-medium">{displayLabel}</span>
    </span>
  );
}
