"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * useViewTransition
 * Returns a navigate() helper that wraps router.push() inside
 * document.startViewTransition() when the browser supports it.
 *
 * Usage:
 *   const { navigate } = useViewTransition();
 *   <button onClick={() => navigate("/some-page")}>Go</button>
 */
export function useViewTransition() {
  const router = useRouter();

  const navigate = useCallback(
    (href) => {
      if (!document.startViewTransition) {
        router.push(href);
        return;
      }
      document.startViewTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return { navigate };
}

/**
 * TransitionLink
 * Drop-in replacement for Next.js <Link> that triggers the View Transitions
 * API before navigating. Accepts all the same props as a regular <a> element.
 *
 * Usage:
 *   import TransitionLink from "@/components/PageTransition/TransitionLink";
 *   <TransitionLink href="/dashboard">Go to Dashboard</TransitionLink>
 */
export default function TransitionLink({
  href,
  children,
  className,
  style,
  onClick,
  ...rest
}) {
  const { navigate } = useViewTransition();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style} {...rest}>
      {children}
    </a>
  );
}
