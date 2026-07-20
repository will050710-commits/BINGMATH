// ─── DuoMath Mobile — Color System ─────────────────────────────────────────
// Mirrors the web globals.css design tokens

export const Colors = {
  // Backgrounds
  bg: '#020c1b',
  bgSurface: '#08122a',
  bgCard: 'rgba(8, 18, 42, 0.75)',
  bgGlass: 'rgba(255,255,255,0.04)',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderAccent: 'rgba(0,210,255,0.35)',

  // Brand / Accent
  primary: '#0ea5e9',       // sky blue
  accent: '#6366f1',        // indigo
  teal: '#14b8a6',
  cyan: '#00d4ff',
  purple: '#a78bfa',
  pink: '#ec4899',
  amber: '#f59e0b',

  // Text
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.6)',
  textDim: 'rgba(255,255,255,0.35)',
  textBlue: '#bae6fd',
  textCyan: '#38bdf8',

  // Status
  success: '#22d3ee',
  warning: '#f59e0b',
  error: '#f87171',

  // Gradients (used as array for LinearGradient)
  gradientHero: ['#0ea5e9', '#6366f1'],
  gradientCard: ['rgba(8,18,42,0.8)', 'rgba(8,18,42,0.4)'],
  gradientGlow: ['rgba(0,210,255,0.3)', 'transparent'],

  // Rarity (Gacha)
  common: '#22d3ee',
  rare: '#a78bfa',
  legendary: '#f59e0b',

  // Transparent overlays
  overlay: 'rgba(2,12,27,0.85)',
  shimmer: 'rgba(255,255,255,0.12)',
};

export default Colors;
