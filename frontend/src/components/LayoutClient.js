"use client";
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

/** Floating language toggle pill — rendered in bottom-left corner */
function LangToggleButton() {
  const { lang, toggleLang } = useLanguage();
  const isVi = lang === "vi";

  return (
    <button
      id="lang-toggle-btn"
      onClick={toggleLang}
      title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      aria-label={isVi ? "Switch to English" : "Switch to Vietnamese"}
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 999,
        border: isVi
          ? "1px solid rgba(20,184,166,0.5)"
          : "1px solid rgba(56,189,248,0.5)",
        background: isVi
          ? "rgba(20,184,166,0.12)"
          : "rgba(56,189,248,0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
        boxShadow: isVi
          ? "0 0 12px rgba(20,184,166,0.35), 0 2px 8px rgba(0,0,0,0.3)"
          : "0 0 12px rgba(56,189,248,0.35), 0 2px 8px rgba(0,0,0,0.3)",
        letterSpacing: 0.4,
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
        e.currentTarget.style.boxShadow = isVi
          ? "0 0 22px rgba(20,184,166,0.7), 0 4px 16px rgba(0,0,0,0.4)"
          : "0 0 22px rgba(56,189,248,0.7), 0 4px 16px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = isVi
          ? "0 0 12px rgba(20,184,166,0.35), 0 2px 8px rgba(0,0,0,0.3)"
          : "0 0 12px rgba(56,189,248,0.35), 0 2px 8px rgba(0,0,0,0.3)";
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{isVi ? "🇻🇳" : "🇬🇧"}</span>
      <span>{isVi ? "VI" : "EN"}</span>
    </button>
  );
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
  return (
    <LanguageProvider>
      <LayoutInner>{children}</LayoutInner>
    </LanguageProvider>
  );
}
