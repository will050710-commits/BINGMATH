"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DarkTheme,
  LightTheme,
  MOBILE_TABS,
  buildLiquidGlassPalette,
} from "../constants";
import type { ThemeMode } from "../types";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export interface LiquidGlassTabBarProps {
  opacity?: number;
  themeMode?: ThemeMode;
  onOpenQuickSettings?: () => void;
  settingsButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Web port of the APK's visionOS-inspired `LiquidGlassTabBar`
 * (Hermes bundle lines 213939–214450)
 */
export function LiquidGlassTabBar({
  opacity,
  themeMode,
  onOpenQuickSettings,
  settingsButtonRef,
}: LiquidGlassTabBarProps) {
  const pathname = usePathname() || "";
  const { lang } = useLanguage();
  const themeCtx = useTheme();
  const isVi = lang === "vi";

  const effectiveOpacity = opacity ?? themeCtx.liquidGlassOpacity;
  const effectiveMode = !themeMode || themeMode === "system"
    ? themeCtx.resolvedMobileTheme
    : themeMode;

  const palette =
    effectiveMode === "light"
      ? LightTheme
      : effectiveMode === "dark"
        ? DarkTheme
        : buildLiquidGlassPalette(effectiveOpacity);

  const isTabActive = (href: string, name: string) => {
    const clean = pathname.replace(/\/+$/, "").toLowerCase();
    const target = href.replace(/\/+$/, "").toLowerCase();
    if (name === "Home" && (clean === "" || clean === "/" || clean === "/trangchu")) {
      return true;
    }
    return clean === target || clean.startsWith(target + "/");
  };

  return (
    <div
      className="flex md:hidden"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "max(8px, env(safe-area-inset-bottom, 8px))",
        zIndex: 9990,
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <nav
        aria-label={isVi ? "Thanh điều hướng di động" : "Mobile navigation"}
        data-theme-mode={palette.mode}
        style={{
          pointerEvents: "auto",
          position: "relative",
          width: "100%",
          maxWidth: 580,
          borderRadius: 30,
          padding: "5px 6px",
          background: palette.tabBar,
          color: palette.text,
          border: `1.2px solid ${palette.tabBarBorder}`,
          backdropFilter: palette.isLiquidGlass
            ? "blur(24px) saturate(180%)"
            : "blur(16px)",
          WebkitBackdropFilter: palette.isLiquidGlass
            ? "blur(24px) saturate(180%)"
            : "blur(16px)",
          boxShadow: palette.isDark
            ? "0 10px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
            : "0 10px 28px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          overflow: "hidden",
          transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
        }}
      >
        {/* Top specular highlight rim (bundle line 214402) */}
        {palette.isLiquidGlass && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 24,
              right: 24,
              height: 1.5,
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.55)",
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflowX: "auto",
            scrollbarWidth: "none",
            gap: 2,
          }}
        >
          {MOBILE_TABS.map((tab) => {
            const active = isTabActive(tab.webHref, tab.name);
            const label = isVi ? tab.labelVI : tab.labelEN;

            return (
              <Link
                key={tab.name}
                href={tab.webHref}
                aria-current={active ? "page" : undefined}
                style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 44,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 4px 5px",
                  borderRadius: 24,
                  textDecoration: "none",
                  transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  background: active ? palette.primaryGlow : "transparent",
                  border: active
                    ? `1px solid ${palette.borderAccent}`
                    : "1px solid transparent",
                  boxShadow: active
                    ? `0 4px 14px ${palette.primaryGlow}`
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: active ? 19 : 18,
                    lineHeight: 1.1,
                    transform: active ? "translateY(-1px) scale(1.06)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  style={{
                    marginTop: 2,
                    fontSize: 10.5,
                    fontWeight: active ? 800 : 600,
                    letterSpacing: 0.2,
                    color: active ? palette.primary : palette.textSecondary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {onOpenQuickSettings && (
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={onOpenQuickSettings}
              title={isVi ? "Cài đặt nhanh" : "Quick Settings"}
              aria-label={isVi ? "Cài đặt nhanh" : "Quick Settings"}
              style={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: 20,
                border: `1px solid ${palette.border}`,
                background: palette.bgGlass,
                color: palette.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                cursor: "pointer",
                marginLeft: 2,
                flexShrink: 0,
              }}
            >
              ⚙️
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

export default LiquidGlassTabBar;
