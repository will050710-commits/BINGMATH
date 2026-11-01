/* eslint-disable react-hooks/set-state-in-effect */
"use client";

// frontend/src/context/ThemeContext.js
//
// Redesign Claude-style — Đợt 1 + Mobile Web Theme Unification.
//
// ThemeContext quyết định:
//   1. <html data-theme="paper|ink"> cho toàn bộ hệ thống CSS token của web.
//   2. <html data-mobile-theme="light|dark|liquidGlass"> và bảng màu `palette`
//      cho thanh điều hướng di động, BingMCB AI Tutor, Quick Settings và
//      Interface Guide.
//   3. Đồng bộ 2 chiều giữa `duomath_mobile_theme` ("light" | "dark" | "liquidGlass" | "system"),
//      `duomath_theme` ("paper" | "ink") và `bingmath_liquid_glass_opacity` (0.15..1.0).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  clampLiquidGlassOpacity,
  DEFAULT_LIQUID_GLASS_OPACITY,
  DEFAULT_MOBILE_THEME,
  DEFAULT_THEME,
  LIQUID_GLASS_OPACITY_KEY,
  MOBILE_THEME_STORAGE_KEY,
  parseStoredMobileTheme,
  parseStoredTheme,
  resolveMobileThemeMode,
  resolveTheme,
  THEME_INK,
  THEME_PAPER,
  THEME_STORAGE_KEY,
} from "@/lib/themeRoutes";
import {
  DarkTheme,
  LightTheme,
  buildLiquidGlassPalette,
} from "@/mobile/constants";

/** @typedef {"paper" | "ink"} WebTheme */
/** @typedef {"dark" | "light" | "liquidGlass" | "system"} MobileThemeMode */
/** @typedef {"dark" | "light" | "liquidGlass"} ResolvedMobileThemeMode */

/**
 * @typedef {import("@/mobile/types").ThemePalette} ThemePalette
 */

/**
 * @typedef {Object} ThemeContextValue
 * @property {WebTheme} theme
 * @property {WebTheme} routeTheme
 * @property {boolean} isRouteDefault
 * @property {MobileThemeMode} themeMode
 * @property {ResolvedMobileThemeMode} resolvedMobileTheme
 * @property {number} liquidGlassOpacity
 * @property {ThemePalette} palette
 * @property {(next: WebTheme) => void} setTheme
 * @property {() => void} toggleTheme
 * @property {(nextMode: MobileThemeMode) => void} setThemeMode
 * @property {(nextOpacity: number) => void} setLiquidGlassOpacity
 * @property {() => void} resetToRoute
 */

/** @type {import("react").Context<ThemeContextValue | null>} */
const ThemeContext = createContext(null);

const THEME_COLOR = {
  [THEME_PAPER]: "#f5f4ed",
  [THEME_INK]: "#141413",
};

/** Ghi màu thanh trình duyệt (meta theme-color) theo theme đang hiển thị. */
function syncThemeColor(theme) {
  if (typeof document === "undefined") return;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((meta) =>
    meta.setAttribute("content", THEME_COLOR[theme] || THEME_COLOR[THEME_INK])
  );
}

/**
 * Đồng bộ thuộc tính DOM ngay lập tức để cả CSS pseudo-element và bộ kiểm thử
 * đọc thấy trạng thái mới mà không bị trễ frame.
 * @param {WebTheme} docTheme
 * @param {ResolvedMobileThemeMode} mobileTheme
 * @param {number} glassOpacity
 */
function applyDocumentThemeDom(docTheme, mobileTheme, glassOpacity) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", docTheme || DEFAULT_THEME);
  document.documentElement.setAttribute("data-mobile-theme", mobileTheme || DEFAULT_MOBILE_THEME);
  document.documentElement.style.setProperty("--bm-glass-opacity", String(glassOpacity));
  syncThemeColor(docTheme || DEFAULT_THEME);
}

/**
 * @param {{ children: import("react").ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const pathname = usePathname();
  // null = "theo route"; khi người dùng chọn thì lưu chế độ đã chọn
  const [mobileOverride, setMobileOverride] = useState(
    /** @type {MobileThemeMode | null} */ (null)
  );
  const [webOverride, setWebOverride] = useState(
    /** @type {WebTheme | null} */ (null)
  );
  const [liquidGlassOpacity, setLiquidGlassOpacityState] = useState(
    DEFAULT_LIQUID_GLASS_OPACITY
  );
  const [systemPrefersLight, setSystemPrefersLight] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const routeTheme = useMemo(() => resolveTheme(pathname), [pathname]);

  // Theo dõi prefers-color-scheme của hệ điều hành cho chế độ "system"
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    setSystemPrefersLight(mql.matches);
    const handleChange = (e) => setSystemPrefersLight(Boolean(e.matches));
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handleChange);
      return () => mql.removeEventListener("change", handleChange);
    }
    return undefined;
  }, []);

  // Hydrate lựa chọn đã lưu từ localStorage sau khi mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedMobile = parseStoredMobileTheme(
        localStorage.getItem(MOBILE_THEME_STORAGE_KEY)
      );
      const savedWeb = parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY));
      const savedOpacity = localStorage.getItem(LIQUID_GLASS_OPACITY_KEY);

      if (savedMobile) {
        setMobileOverride(savedMobile);
      } else if (savedWeb) {
        setWebOverride(savedWeb);
        setMobileOverride(savedWeb === THEME_PAPER ? "light" : "dark");
      }

      if (savedOpacity !== null) {
        setLiquidGlassOpacityState(clampLiquidGlassOpacity(savedOpacity));
      }
    } catch (_) {}
    setPreferencesLoaded(true);
  }, []);

  const themeMode = useMemo(() => {
    if (mobileOverride) return mobileOverride;
    if (webOverride) return webOverride === THEME_PAPER ? "light" : "dark";
    return DEFAULT_MOBILE_THEME;
  }, [mobileOverride, webOverride]);

  const { resolvedMobileMode, documentTheme } = useMemo(() => {
    if (mobileOverride) {
      return resolveMobileThemeMode(mobileOverride, systemPrefersLight);
    }
    if (webOverride) {
      return {
        resolvedMobileMode: webOverride === THEME_PAPER ? "light" : "dark",
        documentTheme: webOverride,
      };
    }
    return {
      resolvedMobileMode: DEFAULT_MOBILE_THEME,
      documentTheme: routeTheme || DEFAULT_THEME,
    };
  }, [mobileOverride, webOverride, systemPrefersLight, routeTheme]);

  const palette = useMemo(() => {
    if (resolvedMobileMode === "light") return LightTheme;
    if (resolvedMobileMode === "dark") return DarkTheme;
    return buildLiquidGlassPalette(liquidGlassOpacity);
  }, [resolvedMobileMode, liquidGlassOpacity]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    applyDocumentThemeDom(documentTheme, resolvedMobileMode, liquidGlassOpacity);
  }, [documentTheme, resolvedMobileMode, liquidGlassOpacity, preferencesLoaded]);

  const setThemeMode = useCallback(
    /** @param {MobileThemeMode} nextMode */
    (nextMode) => {
      const valid = parseStoredMobileTheme(nextMode);
      if (!valid) return;
      const sysLight =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      const { resolvedMobileMode: nextResolved, documentTheme: nextDoc } =
        resolveMobileThemeMode(valid, sysLight);

      setMobileOverride(valid);
      setWebOverride(nextDoc);
      applyDocumentThemeDom(nextDoc, nextResolved, liquidGlassOpacity);

      try {
        localStorage.setItem(MOBILE_THEME_STORAGE_KEY, valid);
        localStorage.setItem(THEME_STORAGE_KEY, nextDoc);
      } catch (_) {}
    },
    [liquidGlassOpacity]
  );

  const setTheme = useCallback(
    /** @param {WebTheme} next */
    (next) => {
      if (next !== THEME_PAPER && next !== THEME_INK) return;
      const mappedMobile = next === THEME_PAPER ? "light" : "dark";
      setWebOverride(next);
      setMobileOverride(mappedMobile);
      applyDocumentThemeDom(next, mappedMobile, liquidGlassOpacity);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        localStorage.setItem(MOBILE_THEME_STORAGE_KEY, mappedMobile);
      } catch (_) {}
    },
    [liquidGlassOpacity]
  );

  const toggleTheme = useCallback(() => {
    setTheme(
      (documentTheme || DEFAULT_THEME) === THEME_PAPER ? THEME_INK : THEME_PAPER
    );
  }, [setTheme, documentTheme]);

  const setLiquidGlassOpacity = useCallback(
    /** @param {number} nextOpacity */
    (nextOpacity) => {
      const clamped = clampLiquidGlassOpacity(nextOpacity);
      setLiquidGlassOpacityState(clamped);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty(
          "--bm-glass-opacity",
          String(clamped)
        );
      }
      try {
        localStorage.setItem(LIQUID_GLASS_OPACITY_KEY, String(clamped));
      } catch (_) {}
    },
    []
  );

  /** Quay lại quy tắc theo route (marketing = giấy, phần còn lại = tối). */
  const resetToRoute = useCallback(() => {
    setMobileOverride(null);
    setWebOverride(null);
    applyDocumentThemeDom(
      routeTheme || DEFAULT_THEME,
      DEFAULT_MOBILE_THEME,
      liquidGlassOpacity
    );
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(MOBILE_THEME_STORAGE_KEY);
    } catch (_) {}
  }, [routeTheme, liquidGlassOpacity]);

  const value = useMemo(
    () => ({
      theme: documentTheme || DEFAULT_THEME,
      routeTheme,
      isRouteDefault: mobileOverride === null && webOverride === null,
      themeMode,
      resolvedMobileTheme: resolvedMobileMode,
      liquidGlassOpacity,
      palette,
      setTheme,
      toggleTheme,
      setThemeMode,
      setLiquidGlassOpacity,
      resetToRoute,
    }),
    [
      documentTheme,
      routeTheme,
      mobileOverride,
      webOverride,
      themeMode,
      resolvedMobileMode,
      liquidGlassOpacity,
      palette,
      setTheme,
      toggleTheme,
      setThemeMode,
      setLiquidGlassOpacity,
      resetToRoute,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook tiêu thụ theme. Phải nằm trong <ThemeProvider> (LayoutClient).
 * @returns {ThemeContextValue}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
