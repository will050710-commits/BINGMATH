"use client";
import React, { useId, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ClilLessonManifest, LearningMode, LearningModeSwitchProps } from '@/types/clil';
import { useLearningExperience } from '@/context/LearningExperienceContext';
import { springControl } from '@/lib/learningMotion';
import LearningModeHelp from './LearningModeHelp';

const MODE_ORDER: LearningMode[] = ['immersion', 'assisted', 'parallel'];

export function getAvailableModesForManifest(
  manifest?: ClilLessonManifest | null,
): LearningMode[] {
  if (!manifest || !manifest.segments) return MODE_ORDER;
  const segments = Object.values(manifest.segments);
  if (segments.length === 0) return MODE_ORDER;
  const allHaveVi = segments.every(
    (seg) => Array.isArray(seg.vi) && seg.vi.length > 0 && seg.review?.status === 'reviewed',
  );
  return allHaveVi ? ['immersion', 'assisted', 'parallel'] : ['immersion'];
}

const MODE_LABELS: Record<
  LearningMode,
  { en: string; vi: string; badge: string }
> = {
  immersion: {
    en: 'English Immersion',
    vi: 'English Immersion',
    badge: 'EN',
  },
  assisted: {
    en: 'CLIL Assisted',
    vi: 'CLIL Assisted',
    badge: 'EN+VI',
  },
  parallel: {
    en: 'Side-by-Side',
    vi: 'Side-by-Side (Song song)',
    badge: 'EN∥VI',
  },
};

export default function LearningModeSwitch({
  value,
  onChange,
  available,
  disabledReason,
  labelsLocale,
}: LearningModeSwitchProps) {
  const ctx = useLearningExperience();
  const instanceId = useId();
  const prefersReducedMotion = useReducedMotion();
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const effectiveValue: LearningMode = value ?? ctx?.state.mode ?? 'assisted';
  const effectiveOnChange = onChange ?? ctx?.setMode;
  const effectiveAvailable: LearningMode[] =
    Array.isArray(available) && available.length > 0 ? available : MODE_ORDER;

  const isEn = labelsLocale === 'en';
  const enabledModes = MODE_ORDER.filter((m) => effectiveAvailable.includes(m));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, current: LearningMode) => {
    const idx = enabledModes.indexOf(current);
    if (idx === -1) return;

    let nextIdx = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = (idx + 1) % enabledModes.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = (idx - 1 + enabledModes.length) % enabledModes.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = enabledModes.length - 1;
    }

    if (nextIdx !== -1) {
      e.preventDefault();
      const targetMode = enabledModes[nextIdx];
      effectiveOnChange?.(targetMode);
      btnRefs.current[targetMode]?.focus();
    }
  };

  return (
    <div
      className="flex flex-col gap-2"
      data-clil-managed="true"
      data-testid="learning-mode-switch"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="radiogroup"
          aria-label={isEn ? 'CLIL learning mode' : 'Chế độ học song ngữ CLIL'}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-2 p-1.5"
        >
          {MODE_ORDER.map((modeKey) => {
            const isAvailable = effectiveAvailable.includes(modeKey);
            const isSelected = effectiveValue === modeKey;
            const label = isEn ? MODE_LABELS[modeKey].en : MODE_LABELS[modeKey].vi;

            return (
              <button
                key={modeKey}
                ref={(el) => {
                  btnRefs.current[modeKey] = el;
                }}
                type="button"
                role="radio"
                data-testid={`learning-mode-option-${modeKey}`}
                aria-checked={isSelected}
                aria-disabled={!isAvailable || undefined}
                disabled={!isAvailable}
                tabIndex={isSelected ? 0 : -1}
                title={!isAvailable ? disabledReason : undefined}
                onClick={() => isAvailable && effectiveOnChange?.(modeKey)}
                onKeyDown={(e) => handleKeyDown(e, modeKey)}
                className={`relative z-10 inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isSelected ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layout={!prefersReducedMotion ? 'position' : false}
                    layoutId={`clil-mode:${instanceId}`}
                    initial={false}
                    transition={prefersReducedMotion ? { duration: 0 } : springControl}
                    className="pointer-events-none absolute inset-0 rounded-xl border border-line-strong bg-surface"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{label}</span>
                <span
                  className={`relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? 'bg-brand-soft text-brand'
                      : 'bg-surface text-subtle'
                  }`}
                >
                  {MODE_LABELS[modeKey].badge}
                </span>
              </button>
            );
          })}
        </div>

        <LearningModeHelp labelsLocale={labelsLocale} />
      </div>

      <p className="text-xs leading-5 text-muted">
        {isEn
          ? 'Switch reading mode anytime — your quiz answers and progress stay intact.'
          : 'Đổi cách đọc bất kỳ lúc nào — bài làm và tiến độ câu hỏi vẫn được giữ nguyên.'}
      </p>
    </div>
  );
}

export function ConnectedLearningModeSwitch({
  labelsLocale,
  manifest,
  disabledReason,
}: {
  labelsLocale: 'vi' | 'en';
  manifest?: ClilLessonManifest | null;
  disabledReason?: string;
}) {
  const ctx = useLearningExperience();
  const available = getAvailableModesForManifest(manifest);
  if (!ctx) return null;
  return (
    <LearningModeSwitch
      value={ctx.state.mode}
      onChange={ctx.setMode}
      available={available}
      disabledReason={disabledReason}
      labelsLocale={labelsLocale}
    />
  );
}

