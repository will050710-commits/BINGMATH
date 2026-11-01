"use client";
import React, { useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import katex from 'katex';
import type { Leaf, PhraseTranslationProps } from '@/types/clil';
import { popover as popoverVariants, springSurface } from '@/lib/learningMotion';

function renderLeafList(leaves: Leaf[]) {
  return leaves.map((leaf, idx) => {
    if (leaf.kind === 'text') {
      return <React.Fragment key={idx}>{leaf.text}</React.Fragment>;
    }
    if (leaf.kind === 'term') {
      return (
        <strong key={idx} className="font-semibold text-brand">
          {leaf.surface}
        </strong>
      );
    }
    try {
      const html = katex.renderToString(leaf.latex, {
        displayMode: Boolean(leaf.display),
        throwOnError: false,
      });
      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <code key={idx}>{leaf.latex}</code>;
    }
  });
}

export default function PhraseTranslationPopover({
  segmentId,
  phraseId,
  en,
  vi,
  open,
  anchorRect,
  labelsLocale = 'vi',
  onPointerEnterCard,
  onPointerLeaveCard,
  onFocusEnterCard,
  onFocusLeaveCard,
  onClose,
}: PhraseTranslationProps) {
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();

  if (typeof document === 'undefined') return null;

  const pad = 16;
  const width = typeof window !== 'undefined' ? Math.min(340, window.innerWidth - pad * 2) : 320;
  const left =
    anchorRect && typeof window !== 'undefined'
      ? Math.max(pad, Math.min(anchorRect.left, window.innerWidth - width - pad))
      : 24;
  const top =
    anchorRect && typeof window !== 'undefined'
      ? Math.min(window.innerHeight - 180, anchorRect.bottom + 8)
      : 96;

  const isEn = labelsLocale === 'en';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id={`clil-phrase-${segmentId}-${phraseId}`}
          data-testid="phrase-translation-popover"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          data-clil-managed="true"
          data-clil-portal-modal="true"
          onPointerEnter={onPointerEnterCard}
          onPointerLeave={onPointerLeaveCard}
          onFocusCapture={() => onFocusEnterCard?.()}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              onFocusLeaveCard?.();
            }
          }}
          variants={popoverVariants}
          initial={prefersReducedMotion ? { opacity: 0 } : 'initial'}
          animate={prefersReducedMotion ? { opacity: 1 } : 'animate'}
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          transition={prefersReducedMotion ? { duration: 0.1 } : springSurface}
          style={{
            position: 'fixed',
            top,
            left,
            zIndex: 550,
            background: 'var(--surface-glass, var(--surface, #1c1c1a))',
            backdropFilter: 'blur(12px)',
          }}
          className="w-[min(21rem,calc(100vw-2rem))] rounded-panel border border-line-strong bg-surface p-3.5 text-ink shadow-xl"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              id={titleId}
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              {isEn ? 'Phrase translation' : 'Dịch cụm câu tương ứng'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={isEn ? 'Close phrase translation' : 'Đóng dịch cụm câu'}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            {renderLeafList(en)}
          </p>
          <p className="mt-1.5 border-l-2 border-brand pl-2.5 text-sm font-medium leading-6 text-ink">
            {renderLeafList(vi)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

