"use client";
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import katex from 'katex';
import type { TermPopoverProps } from '@/types/clil';
import {
  popover as popoverVariants,
  reducedInstant,
  springDrawer,
  springSurface,
} from '@/lib/learningMotion';
import MathTermIllustration from './MathTermIllustration';

function computeDesktopPosition(anchorRect: DOMRect | null): {
  top: number;
  left: number;
  originY: 'top' | 'bottom';
} {
  if (typeof window === 'undefined' || !anchorRect) {
    return { top: 96, left: 24, originY: 'top' };
  }
  const pad = 16;
  const cardWidth = Math.min(352, window.innerWidth - pad * 2);
  const estHeight = 290;

  let left = anchorRect.left + anchorRect.width / 2 - cardWidth / 2;
  left = Math.max(pad, Math.min(left, window.innerWidth - cardWidth - pad));

  const spaceBelow = window.innerHeight - anchorRect.bottom - pad;
  const placeAbove = spaceBelow < estHeight && anchorRect.top > spaceBelow;
  const top = placeAbove
    ? Math.max(pad, anchorRect.top - estHeight - 10)
    : Math.min(window.innerHeight - pad - 180, anchorRect.bottom + 8);

  return {
    top,
    left,
    originY: placeAbove ? 'bottom' : 'top',
  };
}

export default function MathTermPopover({
  term,
  open,
  triggerId,
  anchorRect,
  labelsLocale = 'vi',
  onPointerEnterCard,
  onPointerLeaveCard,
  onFocusEnterCard,
  onFocusLeaveCard,
  onClose,
}: TermPopoverProps & { surfaceId?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const [isMobile, setIsMobile] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // R7: Mobile modal accessibility — initial focus, Tab/Shift+Tab focus trap, and background inert/scroll lock
  useEffect(() => {
    if (!open || !isMobile || typeof document === 'undefined') return;

    const rafId = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const backgroundRoots = Array.from(
      document.querySelectorAll<HTMLElement>('[data-clil-managed="true"]'),
    ).filter((el) => !el.hasAttribute('data-clil-portal-modal'));

    backgroundRoots.forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('inert', '');
    });

    const handleTrapKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !dialogRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !dialogRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTrapKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', handleTrapKeyDown);
      document.body.style.overflow = prevOverflow;
      backgroundRoots.forEach((el) => {
        el.removeAttribute('aria-hidden');
        el.removeAttribute('inert');
      });
    };
  }, [isMobile, open, term?.id]);

  const katexHtml = useMemo(() => {
    if (!term?.latex) return null;
    try {
      return katex.renderToString(term.latex, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [term?.latex]);

  if (typeof document === 'undefined') return null;

  const isEn = labelsLocale === 'en';
  const pos = computeDesktopPosition(anchorRect);
  const dialogId = `clil-term-dialog-${triggerId}`;

  const handleFocusCapture = () => {
    onFocusEnterCard?.();
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const nextFocused = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(nextFocused)) {
      onFocusLeaveCard?.();
    }
  };

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 id={titleId} className="text-base font-bold text-ink">
              {term.en}
            </h3>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
              {term.vi}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-subtle">
            {isEn ? `Domain: ${term.domain}` : `Chủ đề: ${term.domain === 'sets' ? 'Tập hợp' : 'Mệnh đề'}`}
          </p>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          data-testid="math-term-popover-close"
          aria-label={isEn ? `Close ${term.en} term card` : `Đóng thẻ thuật ngữ ${term.en}`}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 px-2.5 py-1.5 text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ✕
        </button>
      </div>

      <div id={descId} className="mt-2.5 space-y-1.5 text-sm leading-6 text-ink">
        <p>{term.definition.en}</p>
        <p className="border-l-2 border-line-strong pl-2.5 text-xs leading-5 text-muted">
          {term.definition.vi}
        </p>
      </div>

      {katexHtml && (
        <div
          className="mt-2.5 overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink"
          dangerouslySetInnerHTML={{ __html: katexHtml }}
        />
      )}

      <MathTermIllustration
        illustrationKey={term.illustrationKey}
        locale={labelsLocale}
      />

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <span className="text-[11px] text-subtle">
          {isEn ? 'Reviewed CLIL glossary' : 'Thuật ngữ CLIL đã duyệt'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {isEn ? 'Got it' : 'Đã hiểu'}
        </button>
      </div>
    </>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        isMobile ? (
          <div
            className="fixed inset-0 flex flex-col justify-end"
            style={{ zIndex: 550 }}
            data-clil-managed="true"
            data-clil-portal-modal="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? reducedInstant : { duration: 0.15 }}
              className="fixed inset-0 bg-black/50"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              ref={dialogRef}
              id={dialogId}
              data-testid="math-term-popover"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={prefersReducedMotion ? { duration: 0.1 } : springDrawer}
              className="relative z-10 max-h-[70dvh] w-full overflow-y-auto rounded-t-2xl border-t border-line-strong bg-surface p-4 pb-6 text-ink shadow-xl"
            >
              {cardBody}
            </motion.div>
          </div>
        ) : (
          <motion.div
            ref={dialogRef}
            id={dialogId}
            data-testid="math-term-popover"
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={descId}
            data-clil-managed="true"
            data-clil-portal-modal="true"
            onPointerEnter={onPointerEnterCard}
            onPointerLeave={onPointerLeaveCard}
            onFocusCapture={handleFocusCapture}
            onBlurCapture={handleBlurCapture}
            variants={popoverVariants}
            initial={prefersReducedMotion ? { opacity: 0 } : 'initial'}
            animate={prefersReducedMotion ? { opacity: 1 } : 'animate'}
            exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
            transition={prefersReducedMotion ? { duration: 0.1 } : springSurface}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              zIndex: 550,
              transformOrigin: `${pos.originY} center`,
              background: 'var(--surface-glass, var(--surface, #1c1c1a))',
              backdropFilter: 'blur(12px)',
            }}
            className="w-[min(22rem,calc(100vw-2rem))] rounded-panel border border-line-strong bg-surface p-4 text-ink shadow-xl"
          >
            {cardBody}
          </motion.div>
        )
      )}
    </AnimatePresence>,
    document.body,
  );
}

