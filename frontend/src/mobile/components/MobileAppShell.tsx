"use client";

import React, { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "../constants";
import { LiquidGlassTabBar } from "./LiquidGlassTabBar";
import { QuickSettingsModal } from "./QuickSettingsModal";
import { InterfaceGuideModal } from "./InterfaceGuideModal";
import { BingSideBarMobile } from "./BingSideBarMobile";
import { useTheme } from "@/context/ThemeContext";

export interface MobileAppShellProps {
  enableTabBar?: boolean;
  enableBingSideBar?: boolean;
  learnerScope?: string;
  authReady?: boolean;
}

function subscribeGuideTrigger(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("duomath-guide-trigger", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("duomath-guide-trigger", onStoreChange);
  };
}

function getGuideTriggerSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const triggerGuide = localStorage.getItem(STORAGE_KEYS.TRIGGER_V1_GUIDE);
    const guideSeen = localStorage.getItem(STORAGE_KEYS.V1_GUIDE_SEEN);
    return triggerGuide === "true" && guideSeen !== "true";
  } catch {
    return false;
  }
}

function getGuideTriggerServerSnapshot(): boolean {
  return false;
}

/**
 * Trigger the V1.0 Interface Guide tour on next/current mobile shell render
 * unless the learner has already completed/dismissed it.
 */
export function triggerV1InterfaceGuide(force = false): void {
  if (typeof window === "undefined") return;
  try {
    if (force) {
      localStorage.removeItem(STORAGE_KEYS.V1_GUIDE_SEEN);
    }
    localStorage.setItem(STORAGE_KEYS.TRIGGER_V1_GUIDE, "true");
    window.dispatchEvent(new Event("duomath-guide-trigger"));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Drop-in Mobile App Shell uniting the V1.0 Official APK features:
 * - `LiquidGlassTabBar` (mobile viewports `md:hidden`)
 * - `QuickSettingsModal` (1-tap language, 4-mode theme, Liquid Glass opacity, Quick Math daily challenge)
 * - `InterfaceGuideModal` (3-step feature tour)
 * - `BingSideBarMobile` (edge-tucking draggable AI tutor)
 */
export function MobileAppShell({
  enableTabBar = true,
  enableBingSideBar = false,
  learnerScope = "guest",
  authReady = true,
}: MobileAppShellProps) {
  const {
    themeMode,
    setThemeMode,
    liquidGlassOpacity,
    setLiquidGlassOpacity,
  } = useTheme();

  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [manualGuideOpen, setManualGuideOpen] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);

  const autoGuideTriggered = useSyncExternalStore(
    subscribeGuideTrigger,
    getGuideTriggerSnapshot,
    getGuideTriggerServerSnapshot
  );

  const showInterfaceGuide =
    manualGuideOpen || (autoGuideTriggered && !guideDismissed);
  const closeSettings = useCallback(() => setShowQuickSettings(false), []);
  const openGuide = useCallback(() => {
    setShowQuickSettings(false);
    setGuideDismissed(false);
    setManualGuideOpen(true);
  }, []);
  const closeGuide = useCallback(() => {
    setManualGuideOpen(false);
    setGuideDismissed(true);
  }, []);

  return (
    <>
      {enableTabBar && (
        <LiquidGlassTabBar
          opacity={liquidGlassOpacity}
          themeMode={themeMode}
          settingsButtonRef={settingsBtnRef}
          onOpenQuickSettings={() => setShowQuickSettings(true)}
        />
      )}
      {enableBingSideBar && <BingSideBarMobile />}
      <QuickSettingsModal
        visible={showQuickSettings}
        onClose={closeSettings}
        learnerScope={learnerScope}
        authReady={authReady}
        themeMode={themeMode}
        onChangeThemeMode={setThemeMode}
        liquidGlassOpacity={liquidGlassOpacity}
        onChangeLiquidGlassOpacity={setLiquidGlassOpacity}
        returnFocusRef={settingsBtnRef}
        onOpenInterfaceGuide={openGuide}
      />
      <InterfaceGuideModal
        visible={showInterfaceGuide}
        returnFocusRef={settingsBtnRef}
        onClose={closeGuide}
      />
    </>
  );
}

export default MobileAppShell;
