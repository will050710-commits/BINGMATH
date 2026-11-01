"use client";
import React from 'react';
import type { Locale } from '@/types/clil';
import { getMathTerm } from '@/content/clil/mathTerms';
import { useLearningExperience } from '@/context/LearningExperienceContext';
import MathTermPopover from './MathTermPopover';
import PhraseTranslationPopover from './PhraseTranslationPopover';

type ClilPopoverPortalHostProps = {
  labelsLocale?: Locale;
};

export default function ClilPopoverPortalHost({
  labelsLocale = 'vi',
}: ClilPopoverPortalHostProps) {
  const ctx = useLearningExperience();
  if (!ctx) return null;

  const { openTerm, openPhrase } = ctx.state;
  const activeTerm = openTerm ? getMathTerm(openTerm.termId) : null;

  return (
    <>
      {activeTerm && openTerm && (
        <MathTermPopover
          term={activeTerm}
          open={Boolean(openTerm)}
          triggerId={openTerm.triggerId}
          anchorRect={openTerm.anchorRect}
          pinned={openTerm.pinned}
          labelsLocale={labelsLocale}
          onPointerEnterCard={ctx.enterPopoverCard}
          onPointerLeaveCard={ctx.leavePopoverCard}
          onFocusEnterCard={ctx.enterPopoverFocus}
          onFocusLeaveCard={ctx.leavePopoverFocus}
          onClose={() => ctx.closePopover(true)}
          onLookup={() => {}}
        />
      )}

      {openPhrase && (
        <PhraseTranslationPopover
          segmentId={openPhrase.segmentId}
          phraseId={openPhrase.phraseId}
          en={openPhrase.en}
          vi={openPhrase.vi}
          open={Boolean(openPhrase)}
          anchorRect={openPhrase.anchorRect}
          labelsLocale={labelsLocale}
          onPointerEnterCard={ctx.enterPopoverCard}
          onPointerLeaveCard={ctx.leavePopoverCard}
          onFocusEnterCard={ctx.enterPopoverFocus}
          onFocusLeaveCard={ctx.leavePopoverFocus}
          onClose={() => ctx.closePopover(true)}
        />
      )}
    </>
  );
}

