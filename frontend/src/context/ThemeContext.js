"use client";

// frontend/src/context/ThemeContext.js
//
// Redesign Claude-style — Đợt 1.
//
// ThemeContext quyết định <html data-theme="paper|ink">:
//   1. Mặc định theo ROUTE (src/lib/themeRoutes.js): marketing → paper,
//      phần còn lại → ink.
//   2. Người dùng có thể tự chọn (nút ☀️/🌙 ở góc dưới-trái, cạnh VI/EN);
//      lựa chọn được lưu vào localStorage["duomath_theme"] và THẮNG route
//      cho tới khi người dùng bấm "theo trang".
//
// Không dùng next-themes: repo chưa có dependency đó, và CSP + script pre-paint
// trong src/app/layout.js đã lo phần chống nháy theme khi tải trang.
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
  DEFAULT_THEME,
  parseStoredTheme,
  resolveTheme,
  THEME_INK,
  THEME_PAPER,
  THEME_STORAGE_KEY,
} from "@/lib/themeRoutes";

const ThemeContext = createContext(null);

const THEME_COLOR = {
  [THEME_PAPER]: "#f5f4ed",
  [THEME_INK]: "#141413",
};

/** Ghi màu thanh trình duyệt (meta theme-color) theo theme đang hiển thị. */
function syncThemeColor(theme) {
  if (typeof document === "undefined") return;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((meta) => meta.setAttribute("content", THEME_COLOR[theme] || THEME_COLOR[THEME_INK]));
}

export function ThemeProvider({ children }) {
  const pathname = usePathname();
  // null = "theo route"; "paper"/"ink" = người dùng đã tự chọn
  const [override, setOverride] = useState(null);

  const routeTheme = useMemo(() => resolveTheme(pathname), [pathname]);
  const theme = override ?? routeTheme;

  // Hydrate lựa chọn thủ công sau khi mount (script pre-paint đã áp theme đúng
  // cho lần paint đầu, nên không có nháy).
  useEffect(() => {
    try {
      const saved = parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY));
      if (saved) setOverride(saved);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme || DEFAULT_THEME);
    syncThemeColor(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (next !== THEME_PAPER && next !== THEME_INK) return;
    setOverride(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (_) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((theme || DEFAULT_THEME) === THEME_PAPER ? THEME_INK : THEME_PAPER);
  }, [setTheme, theme]);

  /** Quay lại quy tắc theo route (marketing = giấy, phần còn lại = tối). */
  const resetToRoute = useCallback(() => {
    setOverride(null);
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (_) {}
  }, []);

  const value = useMemo(
    () => ({
      theme: theme || DEFAULT_THEME,
      routeTheme,
      isRouteDefault: override === null,
      setTheme,
      toggleTheme,
      resetToRoute,
    }),
    [theme, routeTheme, override, setTheme, toggleTheme, resetToRoute]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook tiêu thụ theme. Phải nằm trong <ThemeProvider> (LayoutClient). */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
