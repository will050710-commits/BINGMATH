"use client";
import { useRef } from "react";

/**
 * TiltCard — 3D perspective tilt on mouse move.
 * Props:
 *   maxRotation  — max degrees of tilt (default 8)
 *   perspective  — CSS perspective in px (default 900)
 *   shine        — show specular shine overlay (default true)
 */
export default function TiltCard({
  children,
  className = "",
  style = {},
  maxRotation = 8,
  perspective = 900,
  shine = true,
  ...props
}) {
  const cardRef = useRef(null);
  const shineRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / rect.height) * -maxRotation;
    const rotateY = ((x - rect.width / 2) / rect.width) * maxRotation;

    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.transition = "transform 0.08s ease";

    // Move shine gradient to follow cursor
    if (shine && shineRef.current) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      shineRef.current.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.12) 0%, transparent 65%)`;
      shineRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    card.style.transition = "transform 0.5s cubic-bezier(0.2,0.8,0.2,1)";

    if (shine && shineRef.current) {
      shineRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        willChange: "transform",
        position: "relative",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {/* Specular shine overlay */}
      {shine && (
        <div
          ref={shineRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            opacity: 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
