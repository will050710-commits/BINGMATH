import { STORAGE_KEYS } from "./constants";
import type {
  QuickMathOptions,
  QuickMathQuestion,
  QuickMathStats,
  QuickMathType,
} from "./types";

const QUICK_MATH_TYPES: QuickMathType[] = ["add", "sub", "mul", "linear", "square"];
const DISTRACTOR_OFFSETS = [-10, -4, -2, -1, 1, 2, 4, 10, 6, -6];

/**
 * Format a Date as a local calendar date key `YYYY-MM-DD` for daily rollover.
 */
export function getLocalDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * The caller supplies the authenticated account scope. Cached profile data is
 * not an identity source: it can belong to a previously signed-in learner.
 */
export function resolveQuickMathScope(explicitScope?: string | null): string {
  return explicitScope?.trim() || "guest";
}

function getScopedKeys(scope: string) {
  return {
    bonusXpKey: `${STORAGE_KEYS.BONUS_XP}:${scope}`,
    solvedTodayKey: `${STORAGE_KEYS.SOLVED_TODAY}:${scope}`,
    solvedDateKey: `${STORAGE_KEYS.SOLVED_DATE}:${scope}`,
  };
}

/**
 * Exact Quick Math question generator extracted from D:\BingMATH.apk
 * (Hermes bundle lines 214586–214914)
 */
export function generateQuickMathQuestion(): QuickMathQuestion {
  const type = QUICK_MATH_TYPES[Math.floor(Math.random() * QUICK_MATH_TYPES.length)];

  let question = "";
  let answer = 0;
  let hintVI = "";
  let hintEN = "";

  if (type === "add") {
    const a = Math.floor(Math.random() * 45) + 12;
    const b = Math.floor(Math.random() * 45) + 12;
    answer = a + b;
    question = `${a} + ${b} = ?`;
    hintVI = "Cộng hàng chục trước rồi cộng hàng đơn vị";
    hintEN = "Add tens first, then units";
  } else if (type === "sub") {
    const a = Math.floor(Math.random() * 60) + 35;
    const b = Math.floor(Math.random() * 30) + 8;
    answer = a - b;
    question = `${a} − ${b} = ?`;
    hintVI = `Nhẩm: ${a} - ${b} = ${answer}`;
    hintEN = `Mental math: ${a} - ${b} = ${answer}`;
  } else if (type === "mul") {
    const a = Math.floor(Math.random() * 11) + 3;
    const b = Math.floor(Math.random() * 11) + 4;
    answer = a * b;
    question = `${a} × ${b} = ?`;
    hintVI = `Bảng nhân mở rộng: ${a} × ${b}`;
    hintEN = `Multiplication table: ${a} × ${b}`;
  } else if (type === "linear") {
    const x = Math.floor(Math.random() * 12) + 2;
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 15) + 3;
    const c = a * x + b;
    answer = x;
    question = `${a}x + ${b} = ${c}  ⇒  x = ?`;
    const diff = c - b;
    hintVI = `Chuyển vế: ${a}x = ${c} - ${b} = ${diff}, suy ra x = ${diff} ÷ ${a}`;
    hintEN = `Isolate x: ${a}x = ${c} - ${b} = ${diff}, so x = ${diff} ÷ ${a}`;
  } else {
    // 'square'
    const a = Math.floor(Math.random() * 12) + 4;
    const b = Math.floor(Math.random() * 15) + 1;
    const sq = a * a;
    answer = sq + b;
    question = `${a}² + ${b} = ?`;
    hintVI = `Tính ${a}² = ${sq}, sau đó cộng ${b}`;
    hintEN = `Compute ${a}² = ${sq}, then add ${b}`;
  }

  const optionSet = new Set<number>([answer]);
  while (optionSet.size < 4) {
    const offset = DISTRACTOR_OFFSETS[Math.floor(Math.random() * DISTRACTOR_OFFSETS.length)];
    const candidate = answer + offset;
    if (candidate > 0 && candidate !== answer) {
      optionSet.add(candidate);
    } else {
      optionSet.add(answer + optionSet.size + 1);
    }
  }

  const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

  return {
    question,
    answer,
    options,
    hintVI,
    hintEN,
  };
}

/**
 * Load persisted Quick Math bonus XP and daily solved count from localStorage
 * with automatic local calendar day rollover (`YYYY-MM-DD`) and account/guest isolation.
 */
export function getQuickMathStats(options: QuickMathOptions = {}): QuickMathStats {
  const scope = resolveQuickMathScope(options.scope);
  const todayKey = getLocalDateKey(options.now);
  if (typeof window === "undefined") {
    return { bonusXp: 0, solvedToday: 0, date: todayKey, scope };
  }
  try {
    const { bonusXpKey, solvedTodayKey, solvedDateKey } = getScopedKeys(scope);
    // Legacy unscoped totals have no reliable owner. Leave them untouched rather
    // than importing a previous account's progress into a guest profile.
    const rawXp = localStorage.getItem(bonusXpKey);
    const rawSolved = localStorage.getItem(solvedTodayKey);
    const rawDate = localStorage.getItem(solvedDateKey);

    const bonusXp = Math.max(0, parseInt(rawXp || "0", 10) || 0);
    const parsedSolved = Math.max(0, parseInt(rawSolved || "0", 10) || 0);

    // Rollover: if stored date does not match today's local date, reset solvedToday to 0
    const isSameDay = rawDate === todayKey;
    const solvedToday = isSameDay ? parsedSolved : 0;

    return { bonusXp, solvedToday, date: todayKey, scope };
  } catch {
    return { bonusXp: 0, solvedToday: 0, date: todayKey, scope };
  }
}

/**
 * Persist +20 XP and +1 daily solved count on correct Quick Math answer,
 * scoped to the active account or guest profile and stamped with today's local date.
 */
export function recordQuickMathSolve(
  xpGain = 20,
  options: QuickMathOptions = {}
): QuickMathStats {
  const scope = resolveQuickMathScope(options.scope);
  const todayKey = getLocalDateKey(options.now);
  const current = getQuickMathStats({ scope, now: options.now });
  const next: QuickMathStats = {
    bonusXp: current.bonusXp + xpGain,
    solvedToday: current.solvedToday + 1,
    date: todayKey,
    scope,
  };
  if (typeof window !== "undefined") {
    try {
      const { bonusXpKey, solvedTodayKey, solvedDateKey } = getScopedKeys(scope);
      localStorage.setItem(bonusXpKey, String(next.bonusXp));
      localStorage.setItem(solvedTodayKey, String(next.solvedToday));
      localStorage.setItem(solvedDateKey, todayKey);
    } catch {
      // Ignore storage quota errors
    }
  }
  return next;
}
