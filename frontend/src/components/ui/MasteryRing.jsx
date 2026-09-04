"use client";
import React from "react";

export default function MasteryRing({
  percent = 0,
  size = 42,
  strokeWidth = 4,
  trackColor = "rgba(255, 255, 255, 0.08)",
  color = "#38bdf8",
  gradient = null,
  showText = true,
  children = null,
  className = "",
}) {
  const cleanPct = Math.min(100, Math.max(0, Number(percent) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (cleanPct / 100) * circumference;
  const gradientId = React.useId();

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={cleanPct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 origin-center"
      >
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0] || "#ec4899"} />
              <stop offset="100%" stopColor={gradient[1] || "#38bdf8"} />
            </linearGradient>
          </defs>
        )}
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Inner Content / Percentage */}
      <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-slate-100 select-none pointer-events-none">
        {children ? (
          children
        ) : showText ? (
          <span
            style={{
              fontSize: size <= 36 ? "9px" : size <= 48 ? "11px" : "13px",
            }}
          >
            {Math.round(cleanPct)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
