import { expect, test } from "@playwright/test";
import { getQuickMathStats, recordQuickMathSolve, resolveQuickMathScope } from "../src/mobile/quickMath";

test("daily progress rolls over locally without losing XP or crossing accounts", () => {
  const storage = new Map<string, string>();
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } });
  try {
    const yesterday = new Date(2026, 10, 1, 23, 59);
    const today = new Date(2026, 10, 2, 0, 1);
    recordQuickMathSolve(20, { scope: "u_alice", now: yesterday });
    expect(getQuickMathStats({ scope: "u_alice", now: yesterday })).toMatchObject({ bonusXp: 20, solvedToday: 1 });
    expect(getQuickMathStats({ scope: "u_alice", now: today })).toMatchObject({ bonusXp: 20, solvedToday: 0 });
    expect(recordQuickMathSolve(20, { scope: "u_alice", now: today })).toMatchObject({ bonusXp: 40, solvedToday: 1 });
    expect(getQuickMathStats({ scope: "u_bob", now: today })).toMatchObject({ bonusXp: 0, solvedToday: 0 });
    expect(getQuickMathStats({ scope: "guest", now: today })).toMatchObject({ bonusXp: 0, solvedToday: 0 });
    recordQuickMathSolve(20, { scope: "guest", now: today });
    expect(getQuickMathStats({ scope: "u_alice", now: today })).toMatchObject({ bonusXp: 40, solvedToday: 1 });
    expect(resolveQuickMathScope("u_a/b")).not.toBe(resolveQuickMathScope("u_a_b"));
    storage.set("duomath_user", JSON.stringify({ id: "old-user" }));
    expect(resolveQuickMathScope()).toBe("guest");
    expect(storage.has("bingmath_bonus_xp")).toBe(false);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldStorage) Object.defineProperty(globalThis, "localStorage", oldStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
