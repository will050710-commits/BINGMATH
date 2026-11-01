"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Leaf,
  LearningExperienceState,
  LearningMode,
  OpenPhraseState,
  OpenTermState,
} from '@/types/clil';
import { getMathTerm } from '@/content/clil/mathTerms';
import {
  isCoarsePointer,
  useClilPopoverTimers,
} from '@/hooks/useClilPopover';
import { useAuth } from '@/context/authContext';

export type TermLookupRecord = {
  termId: string;
  lookupCount: number;
  lastTriggerId: string;
  lastSource: 'click' | 'keyboard' | 'hover-dwell';
  lastSeenAt: string;
};

type OptionalAuthResult = {
  user: { id?: string; uid?: string; publicId?: string } | null;
  ready: boolean;
  hasProvider: boolean;
};

function useOptionalAuth(): OptionalAuthResult {
  try {
    const auth = useAuth() as {
      user?: { id?: string; uid?: string; publicId?: string } | null;
      ready?: boolean;
    };
    return {
      user: auth?.user ?? null,
      ready: auth?.ready ?? true,
      hasProvider: true,
    };
  } catch {
    return {
      user: null,
      ready: true,
      hasProvider: false,
    };
  }
}

function sanitizeScopeId(raw: unknown): string {
  return String(raw ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
}

export function resolveClientLearnerScope(
  authUser: { id?: string; uid?: string; publicId?: string } | null,
  learnerIdOverride?: string | null,
): string {
  if (learnerIdOverride) {
    const cleanOverride = sanitizeScopeId(learnerIdOverride);
    if (cleanOverride) return `u_${cleanOverride}`;
  }
  const authId = authUser?.id ?? authUser?.uid ?? authUser?.publicId;
  if (authId) {
    const cleanAuthId = sanitizeScopeId(authId);
    if (cleanAuthId) return `u_${cleanAuthId}`;
  }
  if (typeof window === 'undefined') return 'guest_local';
  try {
    const rawUser = localStorage.getItem('duomath_user') || localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const storedId = parsed?.id ?? parsed?.uid ?? parsed?.publicId;
      if (storedId) {
        const cleanStoredId = sanitizeScopeId(storedId);
        if (cleanStoredId) return `u_${cleanStoredId}`;
      }
    }
    let guestId = localStorage.getItem('bingmath_guest_scope');
    if (!guestId) {
      guestId = 'guest_local';
      localStorage.setItem('bingmath_guest_scope', guestId);
    }
    return guestId;
  } catch {
    return 'guest_memory';
  }
}

export function getStorageKey(learnerScope: string): string {
  return `bingmath:clil:v1:${learnerScope}`;
}

type LearningExperienceContextValue = {
  state: LearningExperienceState;
  surfaceId: string;
  storageAvailable: boolean;
  lookupRecords: Record<string, TermLookupRecord>;
  setMode: (mode: LearningMode) => void;
  setActiveSegmentId: (segmentId: string | null) => void;
  openTermExplicit: (args: {
    termId: string;
    triggerId: string;
    segmentId: string;
    source: 'click' | 'keyboard';
    anchorRect: DOMRect | null;
  }) => void;
  hoverTermEnter: (args: {
    termId: string;
    triggerId: string;
    segmentId: string;
    anchorRect: DOMRect | null;
  }) => void;
  hoverTermLeave: (triggerId: string) => void;
  enterPopoverCard: () => void;
  leavePopoverCard: () => void;
  enterPopoverFocus: () => void;
  leavePopoverFocus: () => void;
  closePopover: (restoreFocus?: boolean) => void;
  openPhraseExplicit: (args: {
    segmentId: string;
    phraseId: string;
    triggerId: string;
    en: Leaf[];
    vi: Leaf[];
    source: 'click' | 'keyboard';
    anchorRect: DOMRect | null;
  }) => void;
  hoverPhraseEnter: (args: {
    segmentId: string;
    phraseId: string;
    triggerId: string;
    en: Leaf[];
    vi: Leaf[];
    anchorRect: DOMRect | null;
  }) => void;
  hoverPhraseLeave: (triggerId: string) => void;
};

const LearningExperienceContext = createContext<LearningExperienceContextValue | null>(null);

export type LearningExperienceProviderProps = {
  lessonId: string;
  contentVersion: string;
  initialMode?: LearningMode;
  learnerIdOverride?: string | null;
  children: React.ReactNode;
};

export function LearningExperienceProvider({
  lessonId,
  contentVersion,
  initialMode = 'assisted',
  learnerIdOverride = null,
  children,
}: LearningExperienceProviderProps) {
  const surfaceId = useId();
  const auth = useOptionalAuth();
  const [learnerScope, setLearnerScope] = useState<string>('guest_local');
  const [sessionId] = useState<string>(() => `clil-${lessonId}-${contentVersion}`);
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true);

  // R6: Deterministic initial mode on both SSR and client initial render to prevent hydration mismatches
  const [mode, setModeState] = useState<LearningMode>(initialMode);

  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [openTerm, setOpenTerm] = useState<OpenTermState | null>(null);
  const [openPhrase, setOpenPhrase] = useState<OpenPhraseState | null>(null);
  const [xray] = useState<LearningExperienceState['xray']>({
    active: false,
    source: null,
  });
  const [glossaryOpen] = useState<boolean>(false);
  const [lookupRecords, setLookupRecords] = useState<Record<string, TermLookupRecord>>({});

  const openTermRef = useRef<OpenTermState | null>(null);
  openTermRef.current = openTerm;
  const openPhraseRef = useRef<OpenPhraseState | null>(null);
  openPhraseRef.current = openPhrase;
  const focusWithinPopoverRef = useRef<boolean>(false);
  const prevScopeRef = useRef<string | null>(null);

  const recordTermLookup = useCallback(
    (termId: string, triggerId: string, source: 'click' | 'keyboard' | 'hover-dwell') => {
      if (!getMathTerm(termId)) return;
      setLookupRecords((prev) => {
        const existing = prev[termId];
        return {
          ...prev,
          [termId]: {
            termId,
            lookupCount: (existing?.lookupCount ?? 0) + 1,
            lastTriggerId: triggerId,
            lastSource: source,
            lastSeenAt: new Date().toISOString(),
          },
        };
      });
    },
    [],
  );

  const {
    clearAllTimers,
    clearCloseTimer,
    scheduleHoverOpen,
    scheduleHoverClose,
    startHoverDwell,
    markImmediateLookup,
    resetSessionKey,
  } = useClilPopoverTimers({
    onDwellLookup: (termId, triggerId) => {
      recordTermLookup(termId, triggerId, 'hover-dwell');
    },
  });

  // R5 + R6: Reactively resolve learnerScope from AuthContext (and storage events) and load scoped mode post-hydration
  useEffect(() => {
    const syncScopeAndMode = () => {
      const nextScope = resolveClientLearnerScope(auth.user, learnerIdOverride);
      const scopeChanged = prevScopeRef.current !== null && prevScopeRef.current !== nextScope;
      prevScopeRef.current = nextScope;
      setLearnerScope(nextScope);

      if (scopeChanged) {
        clearAllTimers();
        resetSessionKey();
        focusWithinPopoverRef.current = false;
        setOpenTerm(null);
        setOpenPhrase(null);
        setActiveSegmentId(null);
        setLookupRecords({});
      }

      try {
        const key = getStorageKey(nextScope);
        const existing = localStorage.getItem(key);
        if (existing) {
          const parsed = JSON.parse(existing);
          if (
            parsed?.mode === 'immersion' ||
            parsed?.mode === 'assisted' ||
            parsed?.mode === 'parallel'
          ) {
            setModeState(parsed.mode);
            setStorageAvailable(true);
            return;
          }
        }
        setModeState(initialMode);
        setStorageAvailable(true);
      } catch {
        setModeState(initialMode);
        setStorageAvailable(false);
      }
    };

    syncScopeAndMode();

    const handleStorageOrAuthChange = () => {
      syncScopeAndMode();
    };
    window.addEventListener('storage', handleStorageOrAuthChange);
    window.addEventListener('bingmath:auth-scope-change', handleStorageOrAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageOrAuthChange);
      window.removeEventListener('bingmath:auth-scope-change', handleStorageOrAuthChange);
    };
  }, [
    auth.ready,
    auth.user,
    clearAllTimers,
    initialMode,
    learnerIdOverride,
    resetSessionKey,
  ]);

  const setMode = useCallback(
    (nextMode: LearningMode) => {
      clearAllTimers();
      resetSessionKey();
      setOpenTerm(null);
      setOpenPhrase(null);
      setModeState(nextMode);
      try {
        localStorage.setItem(
          getStorageKey(learnerScope),
          JSON.stringify({
            schemaVersion: 1,
            mode: nextMode,
            updatedAt: new Date().toISOString(),
          }),
        );
      } catch {
        setStorageAvailable(false);
      }
    },
    [clearAllTimers, learnerScope, resetSessionKey],
  );

  const closePopover = useCallback(
    (restoreFocus = false) => {
      clearAllTimers();
      focusWithinPopoverRef.current = false;
      const triggerIdToFocus =
        openTermRef.current?.triggerId || openPhraseRef.current?.triggerId || null;
      resetSessionKey();
      setOpenTerm(null);
      setOpenPhrase(null);
      if (restoreFocus && triggerIdToFocus && typeof document !== 'undefined') {
        const el = document.getElementById(triggerIdToFocus);
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      }
    },
    [clearAllTimers, resetSessionKey],
  );

  const openTermExplicit = useCallback(
    ({
      termId,
      triggerId,
      segmentId,
      source,
      anchorRect,
    }: {
      termId: string;
      triggerId: string;
      segmentId: string;
      source: 'click' | 'keyboard';
      anchorRect: DOMRect | null;
    }) => {
      clearAllTimers();
      setOpenPhrase(null);
      setActiveSegmentId(segmentId);

      // Toggle off if already pinned on the exact same trigger
      if (
        openTermRef.current &&
        openTermRef.current.triggerId === triggerId &&
        openTermRef.current.pinned
      ) {
        resetSessionKey();
        setOpenTerm(null);
        return;
      }

      const sessionKey = `${triggerId}:${termId}`;
      const isNewSession = markImmediateLookup(sessionKey);
      if (isNewSession) {
        recordTermLookup(termId, triggerId, source);
      }

      setOpenTerm({
        termId,
        triggerId,
        segmentId,
        openReason: source,
        pinned: true,
        anchorRect,
      });
    },
    [clearAllTimers, markImmediateLookup, recordTermLookup, resetSessionKey],
  );

  const hoverTermEnter = useCallback(
    ({
      termId,
      triggerId,
      segmentId,
      anchorRect,
    }: {
      termId: string;
      triggerId: string;
      segmentId: string;
      anchorRect: DOMRect | null;
    }) => {
      // Hover auto-open is only active in 'assisted' mode on fine pointers
      if (mode !== 'assisted' || isCoarsePointer()) return;
      if (openTermRef.current?.pinned) return;

      if (openTermRef.current?.triggerId === triggerId) {
        clearCloseTimer();
        return;
      }

      scheduleHoverOpen(() => {
        setOpenPhrase(null);
        setActiveSegmentId(segmentId);
        const sessionKey = `${triggerId}:${termId}`;
        setOpenTerm({
          termId,
          triggerId,
          segmentId,
          openReason: 'pointer',
          pinned: false,
          anchorRect,
        });
        startHoverDwell(sessionKey, termId, triggerId);
      });
    },
    [clearCloseTimer, mode, scheduleHoverOpen, startHoverDwell],
  );

  const hoverTermLeave = useCallback(
    (triggerId: string) => {
      if (openTermRef.current?.pinned || focusWithinPopoverRef.current) return;
      if (openTermRef.current && openTermRef.current.triggerId !== triggerId) return;
      scheduleHoverClose(() => {
        if (!openTermRef.current?.pinned && !focusWithinPopoverRef.current) {
          resetSessionKey();
          setOpenTerm(null);
        }
      });
    },
    [resetSessionKey, scheduleHoverClose],
  );

  const openPhraseExplicit = useCallback(
    ({
      segmentId,
      phraseId,
      triggerId,
      en,
      vi,
      source,
      anchorRect,
    }: {
      segmentId: string;
      phraseId: string;
      triggerId: string;
      en: Leaf[];
      vi: Leaf[];
      source: 'click' | 'keyboard';
      anchorRect: DOMRect | null;
    }) => {
      clearAllTimers();
      resetSessionKey();
      setOpenTerm(null);
      setActiveSegmentId(segmentId);

      if (
        openPhraseRef.current &&
        openPhraseRef.current.triggerId === triggerId &&
        openPhraseRef.current.pinned
      ) {
        setOpenPhrase(null);
        return;
      }

      setOpenPhrase({
        segmentId,
        phraseId,
        triggerId,
        en,
        vi,
        openReason: source,
        pinned: true,
        anchorRect,
      });
    },
    [clearAllTimers, resetSessionKey],
  );

  const hoverPhraseEnter = useCallback(
    ({
      segmentId,
      phraseId,
      triggerId,
      en,
      vi,
      anchorRect,
    }: {
      segmentId: string;
      phraseId: string;
      triggerId: string;
      en: Leaf[];
      vi: Leaf[];
      anchorRect: DOMRect | null;
    }) => {
      if (mode !== 'assisted' || isCoarsePointer()) return;
      if (openTermRef.current?.pinned || openPhraseRef.current?.pinned) return;

      if (openPhraseRef.current?.triggerId === triggerId) {
        clearCloseTimer();
        return;
      }

      scheduleHoverOpen(() => {
        setOpenTerm(null);
        setActiveSegmentId(segmentId);
        setOpenPhrase({
          segmentId,
          phraseId,
          triggerId,
          en,
          vi,
          openReason: 'pointer',
          pinned: false,
          anchorRect,
        });
      });
    },
    [clearCloseTimer, mode, scheduleHoverOpen],
  );

  const hoverPhraseLeave = useCallback(
    (triggerId: string) => {
      if (openPhraseRef.current?.pinned || focusWithinPopoverRef.current) return;
      if (openPhraseRef.current && openPhraseRef.current.triggerId !== triggerId) return;
      scheduleHoverClose(() => {
        if (!openPhraseRef.current?.pinned && !focusWithinPopoverRef.current) {
          setOpenPhrase(null);
        }
      });
    },
    [scheduleHoverClose],
  );

  const enterPopoverCard = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const leavePopoverCard = useCallback(() => {
    if (focusWithinPopoverRef.current) return;
    if (openTermRef.current && !openTermRef.current.pinned) {
      scheduleHoverClose(() => {
        if (!openTermRef.current?.pinned && !focusWithinPopoverRef.current) {
          resetSessionKey();
          setOpenTerm(null);
        }
      });
    } else if (openPhraseRef.current && !openPhraseRef.current.pinned) {
      scheduleHoverClose(() => {
        if (!openPhraseRef.current?.pinned && !focusWithinPopoverRef.current) {
          setOpenPhrase(null);
        }
      });
    }
  }, [resetSessionKey, scheduleHoverClose]);

  const enterPopoverFocus = useCallback(() => {
    focusWithinPopoverRef.current = true;
    clearCloseTimer();
  }, [clearCloseTimer]);

  const leavePopoverFocus = useCallback(() => {
    focusWithinPopoverRef.current = false;
  }, []);

  // Global Escape handler when a popover is open
  useEffect(() => {
    if (!openTerm && !openPhrase) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closePopover(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closePopover, openPhrase, openTerm]);

  const state: LearningExperienceState = useMemo(
    () => ({
      lessonId,
      contentVersion,
      sessionId,
      learnerScope,
      mode,
      activeSegmentId,
      openTerm,
      openPhrase,
      xray,
      glossaryOpen,
    }),
    [
      activeSegmentId,
      contentVersion,
      glossaryOpen,
      learnerScope,
      lessonId,
      mode,
      openPhrase,
      openTerm,
      sessionId,
      xray,
    ],
  );

  const value = useMemo<LearningExperienceContextValue>(
    () => ({
      state,
      surfaceId,
      storageAvailable,
      lookupRecords,
      setMode,
      setActiveSegmentId,
      openTermExplicit,
      hoverTermEnter,
      hoverTermLeave,
      enterPopoverCard,
      leavePopoverCard,
      enterPopoverFocus,
      leavePopoverFocus,
      closePopover,
      openPhraseExplicit,
      hoverPhraseEnter,
      hoverPhraseLeave,
    }),
    [
      closePopover,
      enterPopoverCard,
      enterPopoverFocus,
      hoverPhraseEnter,
      hoverPhraseLeave,
      hoverTermEnter,
      hoverTermLeave,
      leavePopoverCard,
      leavePopoverFocus,
      lookupRecords,
      openPhraseExplicit,
      openTermExplicit,
      setMode,
      state,
      storageAvailable,
      surfaceId,
    ],
  );

  return (
    <LearningExperienceContext.Provider value={value}>
      {children}
    </LearningExperienceContext.Provider>
  );
}

export function useLearningExperience(): LearningExperienceContextValue | null {
  return useContext(LearningExperienceContext);
}

