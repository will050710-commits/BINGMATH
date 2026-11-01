/**
 * TypeScript specification extracted from D:\BingMATH.apk
 * (Hermes Bytecode v98, bundle lines 213910–366508, BingSTEAM V1.0 Official)
 */

export type ThemeMode = "dark" | "light" | "liquidGlass" | "system";

export interface ThemePalette {
  mode: "dark" | "light" | "liquidGlass";
  isDark: boolean;
  isLiquidGlass: boolean;
  bg: string;
  bgElevated: string;
  bgSurface: string;
  bgCard: string;
  bgCardHover: string;
  bgGlass: string;
  bgInput: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryGlow: string;
  accent: string;
  accentGlow: string;
  gold: string;
  goldGlow: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  border: string;
  borderSubtle: string;
  borderAccent: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  shadowColor: string;
  gradientPrimary: [string, string];
  gradientAccent: [string, string];
  gradientCard: [string, string];
  gradientHero: [string, string, string];
}

export interface LiquidGlassOpacityPreset {
  labelVI: string;
  labelEN: string;
  value: number;
}

export type MobileTabName = "Home" | "Learn" | "Battle" | "Library" | "Profile";

export interface MobileTabConfig {
  name: MobileTabName;
  webHref: string;
  icon: string;
  labelVI: string;
  labelEN: string;
}

export type QuickMathType = "add" | "sub" | "mul" | "linear" | "square";

export interface QuickMathQuestion {
  question: string;
  answer: number;
  options: number[];
  hintVI: string;
  hintEN: string;
}

export interface QuickMathStats {
  bonusXp: number;
  solvedToday: number;
  date?: string;
  scope?: string;
}

export interface QuickMathOptions {
  scope?: string | null;
  now?: Date;
}

export interface QuickActionItem {
  key: string;
  icon: string;
  titleVI: string;
  titleEN: string;
  subVI: string;
  subEN: string;
  color: string;
  bg: string;
  border: string;
  apkScreen: string;
  webHref: string;
}

export interface GradeTrack {
  grade: "10" | "11" | "12" | "THCS";
  titleVI: string;
  titleEN: string;
  descVI: string;
  descEN: string;
  topicsVI: string;
  topicsEN: string;
  icon: string;
  color: string;
  badge: string;
  webHref: string;
}

export interface DailyQuest {
  id: string;
  titleVI: string;
  titleEN: string;
  xpReward: number;
  target: number;
  current: number;
  completed: boolean;
}

export interface AvatarPreset {
  id: string;
  emoji: string;
  labelVI: string;
  labelEN: string;
  bg: string;
  border: string;
  adminOnly?: boolean;
}

export interface InterfaceGuideStep {
  badge: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  bgGlow: string;
  bullets: string[];
  visualType: "bingmcb" | "liquidglass" | "quicksettings";
}

export type BingMCBMode = "hint" | "solution";
export type BingMCBEdgeSide = "left" | "right";

export interface BingMCBSuggestion {
  vi: string;
  en: string;
}

export interface BingMCBMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface MRMMap {
  id: string;
  nameVI: string;
  nameEN: string;
  descVI: string;
  descEN: string;
  icon: string;
  color: string;
  bgGlow: string;
  grades: string;
  targetQ: number;
  timeBonus: string;
}

export interface LeaderboardFilter {
  labelVI: string;
  labelEN: string;
  value: number | null;
}

export interface OfflineMCQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explain: string;
}

export interface OfflineTFCard {
  id: string;
  text: string;
  isTrue: boolean;
  explain: string;
}

export interface OfflineFillQuestion {
  id: string;
  text: string;
  answer: string;
  hint: string;
}

export interface OfflineLesson {
  slug: string;
  grade: string;
  chapter: string;
  chapterEn: string;
  title: string;
  titleEn: string;
  objectives: string[];
  theoryHtml: string;
  mcQuestions: OfflineMCQuestion[];
  tfCards: OfflineTFCard[];
  fillQuestions: OfflineFillQuestion[];
}

export interface ResponsiveMetrics {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  contentMaxWidth: number | "100%";
  modalMaxWidth: number | "100%";
  screenPadding: number;
  cardRadius: number;
  numGridColumns: 1 | 2 | 3;
}
