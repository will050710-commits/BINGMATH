/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * @typedef {"vi" | "en"} SupportedLanguage
 */

/**
 * @typedef {Object} LanguageContextValue
 * @property {SupportedLanguage} lang
 * @property {(next: SupportedLanguage) => void} setLang
 * @property {() => void} toggleLang
 * @property {<V, E>(vi: V, en: E) => V | E} t
 */

/** @type {import("react").Context<LanguageContextValue | null>} */
const LanguageContext = createContext(null);

const STORAGE_KEY = "duomath_lang";

/**
 * LanguageProvider — wraps entire app, persists lang choice to localStorage.
 * Usage:
 *   const { lang, setLang, toggleLang, t } = useLanguage();
 *   t("Tiếng Việt", "English text")  → returns correct string per lang
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(/** @type {SupportedLanguage} */ ("vi")); // default Vietnamese

  // Hydrate from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "vi") setLangState(saved);
    } catch (_) {}
  }, []);

  const setLang = useCallback(
    /** @param {SupportedLanguage} next */
    (next) => {
      if (next === "vi" || next === "en") {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (_) {}
      }
    },
    []
  );

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "vi" ? "en" : "vi";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {}
      return next;
    });
  }, []);

  /**
   * Inline translation helper: t(Vietnamese, English)
   * @type {<V, E>(vi: V, en: E) => V | E}
   */
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

/**
 * Hook to consume language context
 * @returns {LanguageContextValue}
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
