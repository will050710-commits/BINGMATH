"use client";
import { useEffect } from "react";
import GlobalSidebar from "@/components/GlobalSidebar";
import PageTransition from "@/components/PageTransition/PageTransition";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import { usePathname } from "next/navigation";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function isLessonPath(pathname) {
  if (!pathname) return false;
  const path = pathname.toLowerCase();

  const staticLessons = [
    "/menh-de",
    "/tap-hop",
    "/phep-toan-tap-hop",
    "/bpt-bac-nhat-2-an",
    "/chuong2-10",
    "/ham-so-va-do-thi",
    "/ham-so-bac-hai",
    "/gia-tri-luong-giac",
    "/ontapchuong1",
    "/ontapchuong4"
  ];

  if (staticLessons.includes(path)) return true;
  if (path.startsWith("/lesson")) return true;
  if (path.startsWith("/l11-")) return true;
  if (path.startsWith("/l12-")) return true;

  return false;
}

/**
 * Cụm điều khiển nổi góc dưới-trái — Redesign Claude-style (Đợt 1).
 *
 * Thay pill gradient neon cũ bằng segmented control dùng token --surface/--text/
 * --accent (xem .duo-* trong globals.css), và thêm nút Sáng/Tối:
 *   • VI/EN  — vẫn là cùng một LanguageContext (t(vi,en) + localStorage
 *              "duomath_lang") nên mọi trang song ngữ không đổi hành vi.
 *   • ☀️/🌙  — ThemeContext: đổi <html data-theme="paper|ink">.
 *
 * GIỮ id="lang-toggle-btn" trên phần tử gốc: app mobile
 * (LessonWebViewScreen) ẩn id này khi nhúng WebView, và globals.css có
 * media-query responsive cho nó.
 */
function LanguageThemeControls() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isVi = lang === "vi";
  const isPaper = theme === "paper";

  return (
    <div
      id="lang-toggle-btn"
      className="duo-control-pill"
      style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9999 }}
    >
      <div
        className="duo-segmented"
        role="group"
        aria-label={t("Chọn ngôn ngữ", "Choose language")}
      >
        <button
          type="button"
          className="duo-segmented-item"
          data-active={isVi}
          aria-pressed={isVi}
          lang="vi"
          title={t("Tiếng Việt", "Vietnamese")}
          onClick={() => setLang("vi")}
        >
          <span aria-hidden="true">🇻🇳</span>
          <span>VI</span>
        </button>
        <button
          type="button"
          className="duo-segmented-item"
          data-active={!isVi}
          aria-pressed={!isVi}
          lang="en"
          title={t("Tiếng Anh", "English")}
          onClick={() => setLang("en")}
        >
          <span aria-hidden="true">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>

      <span className="duo-pill-divider" aria-hidden="true" />

      <button
        type="button"
        className="duo-icon-btn"
        onClick={toggleTheme}
        aria-pressed={isPaper}
        aria-label={
          isPaper
            ? t("Đang là nền sáng — chuyển sang nền tối", "Light theme — switch to dark")
            : t("Đang là nền tối — chuyển sang nền sáng", "Dark theme — switch to light")
        }
        title={
          isPaper
            ? t("Nền sáng (giấy) · nhấn để đổi", "Light (paper) · click to switch")
            : t("Nền tối (than) · nhấn để đổi", "Dark (ink) · click to switch")
        }
      >
        <span aria-hidden="true">{isPaper ? "🌙" : "☀️"}</span>
      </button>
    </div>
  );
}

/**
 * Registers the offline service worker (public/sw.js).
 * Production only: a worker during `next dev` would cache a half-built app.
 * The worker itself is network-first for documents and NETWORK-ONLY for /api/*,
 * so it can never replay another user's data (see the header of sw.js).
 */
function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch((err) => console.warn("[PWA] Service worker registration failed:", err?.message));
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);
}

function LayoutInner({ children }) {
  const pathname = usePathname();
  const showTranslate = isLessonPath(pathname);

  return (
    <>
      <PageTransition>{children}</PageTransition>
      <GlobalSidebar />
      {showTranslate && <DuoTranslate />}
      <LangToggleButton />
    </>
  );
}

export default function LayoutClient({ children }) {
  useServiceWorker();

  return (
    <LanguageProvider>
      <LayoutInner>{children}</LayoutInner>
    </LanguageProvider>
  );
}
