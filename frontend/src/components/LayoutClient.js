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

/** Floating language toggle pill — rendered in bottom-left corner across all pages */
function LangToggleButton() {
  const { lang, toggleLang } = useLanguage();
  const isVi = lang === "vi";

  return (
    <div
      id="lang-toggle-btn"
      onClick={toggleLang}
      title={isVi ? "Switch to English (Chuyển sang Tiếng Anh)" : "Switch to Vietnamese (Chuyển sang Tiếng Việt)"}
      aria-label={isVi ? "Switch to English" : "Switch to Vietnamese"}
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        padding: "4px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(2,8,24,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(34,211,238,0.15)",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
        e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.6), 0 0 25px rgba(34,211,238,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(34,211,238,0.15)";
      }}
    >
      {/* VI Option */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: 999,
        background: isVi
          ? "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)"
          : "transparent",
        color: isVi ? "white" : "rgba(255,255,255,0.45)",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.5,
        boxShadow: isVi ? "0 2px 10px rgba(244,63,94,0.4)" : "none",
        transition: "all 0.2s ease",
      }}>
        <span style={{ fontSize: 14 }}>🇻🇳</span>
        <span>VI</span>
      </div>

      {/* EN Option */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: 999,
        background: !isVi
          ? "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)"
          : "transparent",
        color: !isVi ? "white" : "rgba(255,255,255,0.45)",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.5,
        boxShadow: !isVi ? "0 2px 10px rgba(14,165,233,0.4)" : "none",
        transition: "all 0.2s ease",
      }}>
        <span style={{ fontSize: 14 }}>🇬🇧</span>
        <span>EN</span>
      </div>
    </div>
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
