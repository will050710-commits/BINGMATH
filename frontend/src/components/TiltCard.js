"use client";
import { useRef } from "react";

export default function TiltCard({ children, className = "", style = {}, maxRotation = 12, perspective = 600, ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / rect.height) * -maxRotation;
    const rotateY = ((x - rect.width / 2) / rect.width) * maxRotation;

    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transition = "transform 0.05s ease";
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
    card.style.transition = "transform 0.5s ease";
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}
