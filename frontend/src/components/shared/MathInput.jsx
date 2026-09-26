"use client";

// frontend/src/components/shared/MathInput.jsx
//
// Phase 4 — guide item 2.1 (MathLive).
//
// Visual formula input: types like a textarea, emits LaTeX, and gives mobile
// users (including the Android WebView build) a proper maths keyboard.
// Fonts/sounds are copied into public/ by scripts/copy-mathlive-assets.mjs
// (postinstall) — without them the virtual keyboard has no glyphs in production.
import { useEffect, useRef } from "react";
import "mathlive";

export default function MathInput({
  value = "",
  onChange,
  placeholder = "Nhập công thức…",
  className,
  style,
  ariaLabel = "Math input",
}) {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;

    // Reflect external value changes without fighting the user's typing.
    if (field.value !== value) field.value = value ?? "";

    const handleInput = (event) => onChange?.(event.target.value);
    field.addEventListener("input", handleInput);
    return () => field.removeEventListener("input", handleInput);
  }, [value, onChange]);

  useEffect(() => {
    const field = fieldRef.current;
    if (field && placeholder) field.setAttribute("placeholder", placeholder);
  }, [placeholder]);

  return (
    <math-field
      ref={fieldRef}
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "block",
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.05)",
        color: "#e2e8f0",
        fontSize: 18,
        ...style,
      }}
    />
  );
}
