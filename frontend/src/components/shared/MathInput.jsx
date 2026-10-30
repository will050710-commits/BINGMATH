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
import { MathfieldElement } from "mathlive";

if (typeof window !== "undefined") {
  MathfieldElement.fontsDirectory = "/mathlive-fonts";
  MathfieldElement.soundsDirectory = "/mathlive-sounds";
}

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

  useEffect(() => {
    // MathLive's keyboard overlays document.body; it does not resize the native
    // VisualViewport. Notify any workspace without coupling this shared field
    // to the tutor or importing MathLive into the workspace's initial bundle.
    const keyboard = window.mathVirtualKeyboard;
    const field = fieldRef.current;
    const notifyGeometry = () => window.dispatchEvent(new Event("bingmath:math-keyboard-resize"));
    keyboard?.addEventListener("geometrychange", notifyGeometry);
    keyboard?.addEventListener("virtual-keyboard-toggle", notifyGeometry);
    return () => {
      keyboard?.removeEventListener("geometrychange", notifyGeometry);
      keyboard?.removeEventListener("virtual-keyboard-toggle", notifyGeometry);
      if (document.activeElement === field || document.activeElement?.tagName !== "MATH-FIELD") keyboard?.hide();
      notifyGeometry();
    };
  }, []);

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
