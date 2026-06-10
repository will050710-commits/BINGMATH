"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition
 * Wraps page children and applies a smooth fade & slide transition
 * whenever the route (pathname) changes.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    // When the route changes, start fading out
    setTransitionStage("fadeOut");
    
    // Wait for fade-out to complete, swap contents, then fade in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage("fadeIn");
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Handle case where children update independently of pathname
  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <div
      style={{
        transition: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: transitionStage === "fadeIn" ? 1 : 0,
        transform: transitionStage === "fadeIn" ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {displayChildren}
    </div>
  );
}
