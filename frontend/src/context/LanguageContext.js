/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const LanguageContext = createContext(null);

const STORAGE_KEY = "duomath_lang";

/**
 * LanguageProvider — wraps entire app, persists lang choice to localStorage.
 * Usage:
 *   const { lang, toggleLang, t } = useLanguage();
 *   t("Tiếng Việt", "English text")  → returns correct string per lang
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("vi"); // default Vietnamese

  // Hydrate from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "vi") setLangState(saved);
    } catch (_) {}
  }, []);

  const setLang = useCallback((next) => {
    if (next === "vi" || next === "en") {
      setLangState(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "vi" ? "en" : "vi";
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
      return next;
    });
  }, []);

  /** Inline translation helper: t(Vietnamese, English) */
  const t = useCallback(
    (vi, en) => (lang === "vi" ? vi : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook to consume language context */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
