/**
 * theme/effects.js
 *
 * Small shared helpers so every screen "feels" the same:
 *  - haptic.*         → optional tactile feedback. If `expo-haptics` isn't
 *                       installed in the project, falls back to RN core
 *                       Vibration for a basic tick on Android.
 *  - withAlpha()      → centralized hex opacity helper.
 *  - openExternalUrl() → Linking.openURL with error handling.
 *  - Motion           → shared timing constants for press/fade animations.
 */
import { Linking, Vibration, Platform } from 'react-native';

let Haptics = null;
try {
  // eslint-disable-next-line global-require
  Haptics = require('expo-haptics');
} catch (e) {
  Haptics = null;
}

const vibrateTick = () => {
  try {
    if (Platform.OS === 'android') Vibration.vibrate(18);
  } catch (_) {}
};

const safe = (fn, fallback) => {
  try {
    if (fn) fn();
    else if (fallback) fallback();
  } catch (e) {
    // no-op
  }
};

export const haptic = {
  tap: () =>
    safe(
      () => Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light),
      vibrateTick,
    ),
  select: () =>
    safe(
      () => Haptics?.selectionAsync?.(),
      vibrateTick,
    ),
  success: () =>
    safe(
      () => Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Success),
      () => Vibration.vibrate([0, 30, 60, 30]),
    ),
  warn: () =>
    safe(
      () => Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType?.Warning),
      () => Vibration.vibrate([0, 50, 80]),
    ),
};

/**
 * withAlpha('#0EA5E9', 20) → '#0EA5E933' (≈20% opacity)
 * alphaPct is 0–100. Clamped so a typo can't produce an invalid color.
 */
export function withAlpha(hexColor, alphaPct) {
  if (typeof hexColor !== 'string' || !hexColor.startsWith('#')) return hexColor;
  const pct = Math.max(0, Math.min(100, alphaPct));
  const a = Math.round((pct / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${a}`;
}

/**
 * Linking.openURL(url) with error checking and callback
 */
export async function openExternalUrl(url, onError) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error(`Unsupported URL: ${url}`);
    await Linking.openURL(url);
  } catch (e) {
    if (onError) onError(e);
  }
}

// Shared motion presets
export const Motion = {
  pressScale: { toValue: 0.96, duration: 90 },
  releaseScale: { toValue: 1, duration: 140 },
  fadeInDuration: 380,
  slideDuration: 280,
};
