"use client";
// ═══════════════════════════════════════════════════════════════
//  usePWAInstall — Cross-platform PWA Install Hook
//  Detects: Android/Desktop (beforeinstallprompt) vs iOS (manual)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";

/**
 * @returns {{
 *   isInstallable: boolean,        // true if browser can prompt install
 *   isIOS: boolean,                // true on iPhone/iPad Safari
 *   isInstalled: boolean,          // true if already running as PWA
 *   promptInstall: () => Promise<string | null>,  // trigger install prompt
 *   registerSW: () => void,        // register service worker
 * }}
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Detect if already installed (running in standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Listen for browser install prompt (Android, Desktop Chrome/Edge)
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for successful install
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  /** Register the service worker */
  const registerSW = useCallback(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[SW] Registered:", reg.scope))
        .catch((err) => console.error("[SW] Registration failed:", err));
    });
  }, []);

  /**
   * Trigger the browser's native install prompt.
   * Returns 'accepted' | 'dismissed' | null
   */
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome;
  }, [deferredPrompt]);

  return { isInstallable, isIOS, isInstalled, promptInstall, registerSW };
}
