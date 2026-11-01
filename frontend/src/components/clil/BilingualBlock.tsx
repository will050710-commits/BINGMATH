"use client";
import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { BilingualBlockProps } from '@/types/clil';
import { useLearningExperience } from '@/context/LearningExperienceContext';
import { fadeTranslation, reducedInstant } from '@/lib/learningMotion';
import ClilInlineRenderer from './ClilInlineRenderer';

export default function BilingualBlock({
  segment,
  mode: propMode,
  as: Tag = 'div',
  translateAllowed = true,
  interactiveParent = false,
  className = '',
}: BilingualBlockProps) {
  const ctx = useLearningExperience();
  const prefersReducedMotion = useReducedMotion();
  const activeMode = propMode ?? ctx?.state.mode ?? 'assisted';

  if (activeMode === 'parallel' && translateAllowed && !interactiveParent) {
    return (
      <div
        data-segment-id={segment.id}
        data-learning-mode={activeMode}
        onFocusCapture={() => ctx?.setActiveSegmentId(segment.id)}
        className={`grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5 ${className}`}
      >
        <div className="min-w-0">
          <span className="mb-1 block text-xs font-semibold tracking-wide text-muted">
            EN
          </span>
          <Tag className="text-base leading-7 text-ink">
            <ClilInlineRenderer
              segment={segment}
              locale="en"
              mode="parallel"
              assessmentAllowsLookup={translateAllowed}
              interactiveParent={false}
            />
          </Tag>
        </div>
        <motion.div
          initial={false}
          variants={fadeTranslation}
          animate="visible"
          exit="exit"
          transition={prefersReducedMotion ? reducedInstant : { duration: 0.12 }}
          className="min-w-0 border-t border-line pt-2.5 md:border-t-0 md:border-l-2 md:pl-4 md:pt-0"
        >
          <span className="mb-1 block text-xs font-semibold tracking-wide text-muted">
            VI
          </span>
          <Tag className="text-base leading-7 text-ink">
            <ClilInlineRenderer
              segment={segment}
              locale="vi"
              mode="parallel"
              assessmentAllowsLookup={translateAllowed}
              interactiveParent={false}
            />
          </Tag>
        </motion.div>
      </div>
    );
  }

  // Inside an interactive parent (e.g. a button option) in parallel mode, render EN · VI inline without nesting block divs/buttons
  if (activeMode === 'parallel' && translateAllowed && interactiveParent) {
    return (
      <span data-segment-id={segment.id} data-learning-mode={activeMode} className={className}>
        <span>
          <ClilInlineRenderer
            segment={segment}
            locale="en"
            mode="parallel"
            assessmentAllowsLookup={translateAllowed}
            interactiveParent={true}
          />
        </span>
        <span className="mx-2 text-muted" aria-hidden="true">
          ·
        </span>
        <span className="text-muted">
          <ClilInlineRenderer
            segment={segment}
            locale="vi"
            mode="parallel"
            assessmentAllowsLookup={translateAllowed}
            interactiveParent={true}
          />
        </span>
      </span>
    );
  }

  return (
    <Tag
      data-segment-id={segment.id}
      data-learning-mode={activeMode}
      onFocusCapture={() => ctx?.setActiveSegmentId(segment.id)}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync">
        <span key={`${segment.id}-en`}>
          <ClilInlineRenderer
            segment={segment}
            locale="en"
            mode={activeMode}
            assessmentAllowsLookup={translateAllowed}
            interactiveParent={interactiveParent}
          />
        </span>
      </AnimatePresence>
    </Tag>
  );
}

