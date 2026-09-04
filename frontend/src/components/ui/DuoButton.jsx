"use client";
import React from "react";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-pink-500 to-rose-500 text-slate-950 font-bold shadow-[0_4px_16px_rgba(236,72,153,0.35)] hover:shadow-[0_6px_22px_rgba(236,72,153,0.5)] hover:brightness-110",
  cyan:
    "bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold shadow-[0_4px_16px_rgba(14,165,233,0.35)] hover:shadow-[0_6px_22px_rgba(14,165,233,0.5)] hover:brightness-110",
  outline:
    "bg-transparent border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200 hover:border-cyan-300",
  ghost:
    "bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-white/20",
  gold:
    "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.5)] hover:brightness-110",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-[0_4px_16px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_22px_rgba(239,68,68,0.5)]",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base tracking-wide",
};

const CUT_CLASSES = {
  sm: "cut-sm",
  chip: "cut-chip",
  none: "rounded-xl",
};

export default function DuoButton({
  variant = "primary",
  size = "md",
  cut = "sm",
  className = "",
  disabled = false,
  loading = false,
  icon = null,
  children,
  onClick,
  type = "button",
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const cutClass = CUT_CLASSES[cut] || CUT_CLASSES.sm;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 select-none uppercase tracking-wider font-sans cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${variantClass} ${sizeClass} ${cutClass} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
