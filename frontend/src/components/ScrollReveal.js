"use client";
import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({ children, className = "", stagger = 0, threshold = 0.1, ...props }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Apply initial hidden styles to children if stagger is set
    if (stagger > 0) {
      Array.from(el.children).forEach((c, idx) => {
        c.style.opacity = "0";
        c.style.transform = "translateY(24px) scale(0.97)";
        c.style.transition = `opacity 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${idx * stagger}ms, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) ${idx * stagger}ms`;
        c.style.willChange = "opacity, transform";
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (stagger > 0) {
            Array.from(el.children).forEach((c, idx) => {
              setTimeout(() => {
                c.style.opacity = "1";
                c.style.transform = "translateY(0) scale(1)";
              }, idx * stagger);
            });
          }
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [stagger, threshold]);

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? "visible" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
