"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition
 * Wraps page children and applies a smooth fade & slide transition
 * whenever the route (pathname) changes.
 *
 * Fixed: no more stale-children flash or double-render glitch.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState("visible"); // "visible" | "exiting" | "entering"
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef(null);

  // Route change ➜ fade-out → swap → fade-in
  useEffect(() => {
    if (pathname === prevPathname.current) {
      // Same route — just update children in place (no animation)
      setDisplayChildren(children);
      return;
    }

    // New route detected
    prevPathname.current = pathname;
    setStage("exiting");

    // Clear any lingering timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // Swap to new content while invisible
      setDisplayChildren(children);
      setStage("entering");

      timeoutRef.current = setTimeout(() => {
        setStage("visible");
      }, 30); // allow one frame for the browser to paint "entering" opacity:0
    }, 250); // exit duration

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, children]);

  const styles = {
    visible:  { opacity: 1, transform: "translateY(0)",   transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)" },
    exiting:  { opacity: 0, transform: "translateY(-12px)", transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)" },
    entering: { opacity: 0, transform: "translateY(16px)",  transition: "none" },
  };

  return (
    <div style={styles[stage]}>
      {displayChildren}
    </div>
  );
}
