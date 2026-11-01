"use client";
import { useCallback, useEffect, useRef } from 'react';

export const HOVER_OPEN_DELAY_MS = 180;
export const HOVER_CLOSE_DELAY_MS = 120;
export const HOVER_DWELL_LOOKUP_MS = 600;

export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

type UseClilPopoverTimerOptions = {
  onDwellLookup?: (termId: string, triggerId: string) => void;
};

export function useClilPopoverTimers({ onDwellLookup }: UseClilPopoverTimerOptions = {}) {
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countedSessionKeyRef = useRef<string | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const clearDwellTimer = useCallback(() => {
    if (dwellTimerRef.current !== null) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    clearDwellTimer();
  }, [clearOpenTimer, clearCloseTimer, clearDwellTimer]);

  const scheduleHoverOpen = useCallback(
    (fn: () => void) => {
      clearCloseTimer();
      clearOpenTimer();
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        fn();
      }, HOVER_OPEN_DELAY_MS);
    },
    [clearCloseTimer, clearOpenTimer],
  );

  const scheduleHoverClose = useCallback(
    (fn: () => void) => {
      clearOpenTimer();
      clearCloseTimer();
      clearDwellTimer();
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        fn();
      }, HOVER_CLOSE_DELAY_MS);
    },
    [clearOpenTimer, clearCloseTimer, clearDwellTimer],
  );

  const startHoverDwell = useCallback(
    (sessionKey: string, termId: string, triggerId: string) => {
      clearDwellTimer();
      if (countedSessionKeyRef.current === sessionKey) return;
      dwellTimerRef.current = setTimeout(() => {
        dwellTimerRef.current = null;
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          return;
        }
        if (countedSessionKeyRef.current !== sessionKey) {
          countedSessionKeyRef.current = sessionKey;
          onDwellLookup?.(termId, triggerId);
        }
      }, HOVER_DWELL_LOOKUP_MS);
    },
    [clearDwellTimer, onDwellLookup],
  );

  const markImmediateLookup = useCallback((sessionKey: string) => {
    clearDwellTimer();
    if (countedSessionKeyRef.current === sessionKey) {
      return false;
    }
    countedSessionKeyRef.current = sessionKey;
    return true;
  }, [clearDwellTimer]);

  const resetSessionKey = useCallback(() => {
    countedSessionKeyRef.current = null;
    clearDwellTimer();
  }, [clearDwellTimer]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearDwellTimer();
        clearOpenTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearAllTimers();
    };
  }, [clearAllTimers, clearDwellTimer, clearOpenTimer]);

  return {
    clearOpenTimer,
    clearCloseTimer,
    clearDwellTimer,
    clearAllTimers,
    scheduleHoverOpen,
    scheduleHoverClose,
    startHoverDwell,
    markImmediateLookup,
    resetSessionKey,
  };
}

