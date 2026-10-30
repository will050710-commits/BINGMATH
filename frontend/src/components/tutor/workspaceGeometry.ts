import type { TutorLayout } from "./types";

export const DIVIDER_SPACE = 28; // 12px handle + two 8px grid gaps.
export const DEFAULT_CHAT_RATIO = 0.4;
export const SPLIT_STORAGE_KEY = "bingmath.tutor.split-ratio.v1";

export function layoutForWidth(width: number): TutorLayout {
  return width >= 1024 ? "desktop" : width >= 768 ? "tablet" : "mobile";
}

export function splitBounds(width: number) {
  const available = Math.max(1, width - DIVIDER_SPACE);
  const min = Math.max(0.35, 360 / available);
  const max = Math.max(min, Math.min(0.55, 1 - 440 / available));
  return { available, min, max };
}

export function clampChatRatio(ratio: number, width: number): number {
  const { min, max } = splitBounds(width);
  return Math.max(min, Math.min(max, Number.isFinite(ratio) ? ratio : DEFAULT_CHAT_RATIO));
}

export function readStoredRatio(raw: string | null): number {
  const value = raw === null ? NaN : Number(raw);
  return Number.isFinite(value) && value >= 0.35 && value <= 0.55
    ? value
    : DEFAULT_CHAT_RATIO;
}
