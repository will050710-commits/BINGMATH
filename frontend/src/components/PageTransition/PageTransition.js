"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition
 * Wraps page children and fires document.startViewTransition() on every
 * route change, giving the CSS View Transitions API a chance to animate.
 *
 * Usage: wrap {children} in layout.js with <PageTransition>{children}</PageTransition>
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the very first mount — no "old" page to transition from
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    // Fire the native View Transition if supported
    if (!document.startViewTransition) return;

    // The actual DOM swap is handled by Next.js; we just need the API
    // to know a transition is happening so it captures the snapshot.
    // Calling startViewTransition with an empty callback is enough —
    // Next.js will update the DOM on its own schedule.
    document.startViewTransition(() => {});
  }, [pathname]);

  return children;
}
