import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'duomath_mobile_theme';
const GLASS_OPACITY_KEY = 'bingmath_liquid_glass_opacity';

export const DarkTheme = {
  mode: 'dark',
  isDark: true,
  isLiquidGlass: false,
  bg: '#020c1b',
  bgElevated: '#071426',
  bgSurface: 'rgba(10,25,47,0.75)',
  bgCard: 'rgba(13,31,58,0.85)',
  bgCardHover: 'rgba(20,45,82,0.9)',
  bgGlass: 'rgba(255,255,255,0.04)',
  bgInput: 'rgba(255,255,255,0.06)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textInverse: '#020c1b',
  primary: '#22d3ee',
  primaryDark: '#0891b2',
  primaryGlow: 'rgba(34,211,238,0.18)',
  accent: '#a855f7',
  accentGlow: 'rgba(168,85,247,0.18)',
  gold: '#fbbf24',
  goldGlow: 'rgba(251,191,36,0.15)',
  success: '#34d399',
  successBg: 'rgba(52,211,153,0.12)',
  danger: '#f87171',
  dangerBg: 'rgba(248,113,113,0.12)',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  borderAccent: 'rgba(34,211,238,0.35)',
  tabBar: '#041022',
  tabBarBorder: 'rgba(34,211,238,0.14)',
  headerBg: '#041022',
  shadowColor: '#000000',
  gradientPrimary: ['#06b6d4', '#3b82f6'],
  gradientAccent: ['#8b5cf6', '#ec4899'],
  gradientCard: ['rgba(34,211,238,0.12)', 'rgba(168,85,247,0.08)'],
  gradientHero: ['#0891b2', '#4f46e5', '#7e22ce'],
};

export const LightTheme = {
  mode: 'light',
  isDark: false,
  isLiquidGlass: false,
  bg: '#f1f5f9',
  bgElevated: '#ffffff',
  bgSurface: '#ffffff',
  bgCard: '#ffffff',
  bgCardHover: '#f8fafc',
  bgGlass: 'rgba(15,23,42,0.03)',
  bgInput: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textInverse: '#ffffff',
  primary: '#0284c7',
  primaryDark: '#0369a1',
  primaryGlow: 'rgba(2,132,199,0.12)',
  accent: '#7c3aed',
  accentGlow: 'rgba(124,58,237,0.12)',
  gold: '#d97706',
  goldGlow: 'rgba(217,119,6,0.12)',
  success: '#059669',
  successBg: 'rgba(5,150,105,0.1)',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.1)',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  borderAccent: 'rgba(2,132,199,0.4)',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  headerBg: '#ffffff',
  shadowColor: '#64748b',
  gradientPrimary: ['#0284c7', '#2563eb'],
  gradientAccent: ['#7c3aed', '#db2777'],
  gradientCard: ['rgba(2,132,199,0.08)', 'rgba(124,58,237,0.06)'],
  gradientHero: ['#0284c7', '#4338ca', '#6d28d9'],
};

export const LiquidGlassTheme = {
  mode: 'liquidGlass',
  isDark: true,
  isLiquidGlass: true,
  bg: '#040816',
  bgElevated: 'rgba(14, 24, 52, 0.55)',
  bgSurface: 'rgba(255, 255, 255, 0.09)',
  bgCard: 'rgba(255, 255, 255, 0.12)',
  bgCardHover: 'rgba(255, 255, 255, 0.18)',
  bgGlass: 'rgba(255, 255, 255, 0.18)',
  bgInput: 'rgba(255, 255, 255, 0.12)',
  text: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textInverse: '#030712',
  primary: '#38bdf8',
  primaryDark: '#0284c7',
  primaryGlow: 'rgba(56, 189, 248, 0.30)',
  accent: '#c084fc',
  accentGlow: 'rgba(192, 132, 252, 0.28)',
  gold: '#fcd34d',
  goldGlow: 'rgba(252, 211, 77, 0.24)',
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.18)',
  danger: '#fb7185',
  dangerBg: 'rgba(251, 113, 133, 0.18)',
  border: 'rgba(255, 255, 255, 0.24)',
  borderSubtle: 'rgba(255, 255, 255, 0.14)',
  borderAccent: 'rgba(56, 189, 248, 0.65)',
  tabBar: 'rgba(15, 23, 42, 0.52)',
  tabBarBorder: 'rgba(255, 255, 255, 0.28)',
  headerBg: 'rgba(10, 18, 40, 0.58)',
  shadowColor: '#0284c7',
  gradientPrimary: ['#38bdf8', '#818cf8'],
  gradientAccent: ['#c084fc', '#f472b6'],
  gradientCard: ['rgba(255, 255, 255, 0.18)', 'rgba(56, 189, 248, 0.10)'],
  gradientHero: ['#38bdf8', '#a855f7', '#ec4899'],
};

const ThemeContext = createContext({
  themeMode: 'liquidGlass',
  isDark: true,
  isLiquidGlass: true,
  liquidGlassOpacity: 0.85,
  colors: LiquidGlassTheme,
  setTheme: () => {},
  toggleTheme: () => {},
  setLiquidGlassOpacity: () => {},
  quickSettingsVisible: false,
  openQuickSettings: () => {},
  closeQuickSettings: () => {},
  interfaceGuideVisible: false,
  openInterfaceGuide: () => {},
  closeInterfaceGuide: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('liquidGlass');
  const [liquidGlassOpacity, setLiquidGlassOpacityState] = useState(0.85);
  const [quickSettingsVisible, setQuickSettingsVisible] = useState(false);
  const [interfaceGuideVisible, setInterfaceGuideVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light' || saved === 'liquidGlass' || saved === 'system') {
          setThemeMode(saved);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(GLASS_OPACITY_KEY)
      .then((saved) => {
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!Number.isNaN(parsed)) {
            setLiquidGlassOpacityState(Math.max(0.15, Math.min(1, parsed)));
          }
        }
      })
      .catch(() => {});
  }, []);

  const setTheme = useCallback((mode) => {
    setThemeMode(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : prev === 'dark' ? 'liquidGlass' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const setLiquidGlassOpacity = useCallback((val) => {
    const clamped = Math.max(0.15, Math.min(1, Number(val) || 0.85));
    setLiquidGlassOpacityState(clamped);
    AsyncStorage.setItem(GLASS_OPACITY_KEY, String(clamped)).catch(() => {});
  }, []);

  const openQuickSettings = useCallback(() => setQuickSettingsVisible(true), []);
  const closeQuickSettings = useCallback(() => setQuickSettingsVisible(false), []);
  const openInterfaceGuide = useCallback(() => setInterfaceGuideVisible(true), []);
  const closeInterfaceGuide = useCallback(() => setInterfaceGuideVisible(false), []);

  const resolvedMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    if (resolvedMode === 'light') return LightTheme;
    if (resolvedMode === 'dark') return DarkTheme;
    const o = liquidGlassOpacity;
    const fmt = (v) => Math.min(0.95, Math.max(0.03, v)).toFixed(2);
    return {
      ...LiquidGlassTheme,
      bgElevated: `rgba(14, 24, 52, ${fmt(0.65 * o)})`,
      bgSurface: `rgba(255, 255, 255, ${fmt(0.11 * o)})`,
      bgCard: `rgba(255, 255, 255, ${fmt(0.14 * o)})`,
      bgCardHover: `rgba(255, 255, 255, ${fmt(0.21 * o)})`,
      bgGlass: `rgba(255, 255, 255, ${fmt(0.21 * o)})`,
      bgInput: `rgba(255, 255, 255, ${fmt(0.14 * o)})`,
      border: `rgba(255, 255, 255, ${fmt(0.28 * o)})`,
      borderSubtle: `rgba(255, 255, 255, ${fmt(0.16 * o)})`,
      tabBar: `rgba(15, 23, 42, ${fmt(0.62 * o)})`,
      tabBarBorder: `rgba(255, 255, 255, ${fmt(0.32 * o)})`,
      headerBg: `rgba(10, 18, 40, ${fmt(0.68 * o)})`,
    };
  }, [resolvedMode, liquidGlassOpacity]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark: colors.isDark,
      isLiquidGlass: colors.isLiquidGlass,
      liquidGlassOpacity,
      colors,
      setTheme,
      toggleTheme,
      setLiquidGlassOpacity,
      quickSettingsVisible,
      openQuickSettings,
      closeQuickSettings,
      interfaceGuideVisible,
      openInterfaceGuide,
      closeInterfaceGuide,
    }),
    [
      themeMode,
      colors,
      liquidGlassOpacity,
      setTheme,
      toggleTheme,
      setLiquidGlassOpacity,
      quickSettingsVisible,
      openQuickSettings,
      closeQuickSettings,
      interfaceGuideVisible,
      openInterfaceGuide,
      closeInterfaceGuide,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
