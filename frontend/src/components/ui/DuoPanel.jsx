"use client";
import React from "react";

const CUT_CLASSES = {
  lg: "cut-lg",
  md: "cut-md",
  sm: "cut-sm",
  chip: "cut-chip",
  none: "rounded-2xl",
};

const GLOW_CLASSES = {
  cyan: "hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(56,189,248,0.2)]",
  pink: "hover:border-pink-500/40 hover:shadow-[0_0_24px_rgba(236,72,153,0.2)]",
  gold: "hover:border-amber-400/40 hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]",
  violet: "hover:border-purple-500/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.2)]",
  none: "",
};

export default function DuoPanel({
  cut = "md",
  hoverable = false,
  glow = "none",
  className = "",
  style = {},
  children,
  onClick,
  ...props
}) {
  const cutClass = CUT_CLASSES[cut] || CUT_CLASSES.md;
  const glowClass = GLOW_CLASSES[glow] || GLOW_CLASSES.none;
  const hoverClass = hoverable
    ? "transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    : "transition-colors duration-200";

  return (
    <div
      className={`relative bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-100 ${cutClass} ${hoverClass} ${glowClass} ${className}`}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
