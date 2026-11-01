"use client";
import React, { useId, useRef } from 'react';
import type { TermTriggerProps } from '@/types/clil';
import { getMathTerm } from '@/content/clil/mathTerms';
import { useLearningExperience } from '@/context/LearningExperienceContext';

export default function MathTermTrigger({
  termId,
  surface,
  segmentId,
  mode: propMode,
  assessmentAllowsLookup = true,
  interactiveParent = false,
}: TermTriggerProps) {
  const ctx = useLearningExperience();
  const reactId = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const term = getMathTerm(termId);
  const mode = propMode ?? ctx?.state.mode ?? 'assisted';

  if (!term || !assessmentAllowsLookup || !ctx) {
    return <span>{surface}</span>;
  }

  // Never nest a <button> inside an interactive parent (<button>, <a>, etc.)
  if (interactiveParent) {
    return (
      <span className="underline decoration-dotted decoration-brand/60 underline-offset-4">
        {surface}
      </span>
    );
  }

  const triggerId = `clil-term-trig-${segmentId}-${termId}-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const isOpen = ctx.state.openTerm?.triggerId === triggerId;
  const dialogId = `clil-term-dialog-${triggerId}`;

  const underlineClass =
    mode === 'immersion'
      ? 'underline decoration-solid decoration-brand/45 underline-offset-4'
      : 'underline decoration-dotted decoration-brand/75 underline-offset-4';

  return (
    <button
      ref={btnRef}
      id={triggerId}
      type="button"
      data-clil-term-trigger="true"
      data-term-id={termId}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={isOpen ? dialogId : undefined}
      onClick={(e) => {
        e.stopPropagation();
        const rect = btnRef.current?.getBoundingClientRect() ?? null;
        ctx.openTermExplicit({
          termId,
          triggerId,
          segmentId,
          source: e.detail === 0 ? 'keyboard' : 'click',
          anchorRect: rect,
        });
      }}
      onPointerEnter={() => {
        const rect = btnRef.current?.getBoundingClientRect() ?? null;
        ctx.hoverTermEnter({
          termId,
          triggerId,
          segmentId,
          anchorRect: rect,
        });
      }}
      onPointerLeave={() => {
        ctx.hoverTermLeave(triggerId);
      }}
      className={`inline cursor-pointer rounded-sm px-0.5 py-0.5 font-medium text-ink transition-colors hover:bg-brand-soft/60 focus-visible:outline-2 focus-visible:outline-offset-2 ${underlineClass}`}
    >
      {surface}
    </button>
  );
}

