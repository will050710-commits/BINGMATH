"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ResponsiveMetrics } from "./types";

function computeMetrics(width: number, height: number): ResponsiveMetrics {
  const minDim = Math.min(width, height);
  const isTablet = minDim >= 600 || width >= 768;
  const isLandscape = width > height;
  const contentMaxWidth = isTablet ? 820 : "100%";
  const modalMaxWidth = isTablet ? 520 : "100%";
  const screenPadding = isTablet ? 32 : 16;
  const cardRadius = isTablet ? 24 : 20;
  const numGridColumns = isTablet ? (isLandscape ? 3 : 2) : 1;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    contentMaxWidth,
    modalMaxWidth,
    screenPadding,
    cardRadius,
    numGridColumns,
  };
}

/**
 * Web port of the APK's `useResponsive()` hook (bundle lines 266338–266401)
 */
export function useResponsive(): ResponsiveMetrics {
  const [metrics, setMetrics] = useState<ResponsiveMetrics>(() => computeMetrics(390, 844));

  useEffect(() => {
    const handleResize = () => {
      setMetrics(computeMetrics(window.innerWidth, window.innerHeight));
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return metrics;
}

export default useResponsive;

function subscribeMobileViewport(onChange: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useIsMobileViewport() {
  return useSyncExternalStore(
    subscribeMobileViewport,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}
