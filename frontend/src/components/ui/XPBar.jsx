"use client";
import React from "react";

export default function XPBar({
  percent = 0,
  current = null,
  total = null,
  height = 8,
  gradient = "linear-gradient(90deg, #38bdf8 0%, #ec4899 100%)",
  trackBg = "rgba(255, 255, 255, 0.08)",
  showLabel = false,
  label = null,
  className = "",
}) {
  let cleanPct = Number(percent) || 0;
  if (current !== null && total !== null && total > 0) {
    cleanPct = (Number(current) / Number(total)) * 100;
  }
  cleanPct = Math.min(100, Math.max(0, cleanPct));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5 select-none">
          <span className="font-sans font-medium text-slate-300">
            {label || "Tiến trình XP"}
          </span>
          <span>
            {current !== null && total !== null
              ? `${Number(current).toLocaleString()} / ${Number(total).toLocaleString()} XP`
              : `${Math.round(cleanPct)}%`}
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: trackBg }}
        role="progressbar"
        aria-valuenow={cleanPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{
            width: `${cleanPct}%`,
            background: gradient,
            boxShadow: cleanPct > 0 ? "0 0 10px rgba(56, 189, 248, 0.4)" : "none",
          }}
        />
      </div>
    </div>
  );
}
