import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'duomath_lang';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('vi');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'vi' || saved === 'en') setLang(saved);
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'vi' ? 'en' : 'vi';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (vi, en) => (lang === 'vi' ? vi : en),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
