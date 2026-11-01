"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * SSR-safe, quota-resilient localStorage hook for DuoMath (WP-1.5).
 *
 * Replaces scattered try/catch localStorage.getItem/setItem blocks across components.
 * Automatically syncs across browser tabs when `storage` events fire.
 *
 * @template T
 * @param {string} key - The localStorage key.
 * @param {T} initialValue - Fallback value when key is absent or invalid JSON.
 * @param {{ raw?: boolean }} [options] - If `raw: true`, stores strings directly without JSON.stringify.
 * @returns {[T, (next: T | ((prev: T) => T)) => void, () => void]}
 */
export function usePersistentStorage(key, initialValue, options = {}) {
  const isRaw = Boolean(options?.raw);

  const readValue = useCallback(() => {
    if (typeof window === "undefined") {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return typeof initialValue === "function" ? initialValue() : initialValue;
      }
      return isRaw ? item : JSON.parse(item);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  }, [key, initialValue, isRaw]);

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const nextValue = typeof value === "function" ? value(prev) : value;
          if (typeof window !== "undefined") {
            if (nextValue === undefined || nextValue === null) {
              window.localStorage.removeItem(key);
            } else {
              window.localStorage.setItem(
                key,
                isRaw ? String(nextValue) : JSON.stringify(nextValue)
              );
            }
          }
          return nextValue;
        });
      } catch {
        // Ignore QuotaExceededError or private-mode restrictions
      }
    },
    [key, isRaw]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(typeof initialValue === "function" ? initialValue() : initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event) => {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

export default usePersistentStorage;
