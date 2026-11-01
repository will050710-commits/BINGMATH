"use client";
import React, { useId, useRef } from 'react';
import katex from 'katex';
import type {
  BilingualSegment,
  InlinePart,
  Leaf,
  LearningMode,
  Locale,
} from '@/types/clil';
import { useLearningExperience } from '@/context/LearningExperienceContext';
import MathTermTrigger from './MathTermTrigger';

function renderSingleLeaf(
  leaf: Leaf,
  idx: string | number,
  segmentId: string,
  mode: LearningMode,
  assessmentAllowsLookup: boolean,
  interactiveParent: boolean,
) {
  if (leaf.kind === 'text') {
    return <React.Fragment key={idx}>{leaf.text}</React.Fragment>;
  }
  if (leaf.kind === 'term') {
    return (
      <MathTermTrigger
        key={idx}
        termId={leaf.termId}
        surface={leaf.surface}
        segmentId={segmentId}
        mode={mode}
        assessmentAllowsLookup={assessmentAllowsLookup}
        interactiveParent={interactiveParent}
      />
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
        className={leaf.display ? 'my-2 block overflow-x-auto' : 'inline'}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <code key={idx}>{leaf.latex}</code>;
  }
}

type PhraseAssistChipProps = {
  segmentId: string;
  phraseId: string;
  enLeaves: Leaf[];
  viLeaves: Leaf[];
};

function PhraseAssistChip({
  segmentId,
  phraseId,
  enLeaves,
  viLeaves,
}: PhraseAssistChipProps) {
  const ctx = useLearningExperience();
  const reactId = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  if (!ctx) return null;

  const triggerId = `clil-phrase-trig-${segmentId}-${phraseId}-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const isOpen = ctx.state.openPhrase?.triggerId === triggerId;

  return (
    <button
      ref={btnRef}
      id={triggerId}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`Dịch cụm câu ${phraseId}`}
      title="Xem bản dịch cụm câu"
      onClick={(e) => {
        e.stopPropagation();
        const rect = btnRef.current?.getBoundingClientRect() ?? null;
        ctx.openPhraseExplicit({
          segmentId,
          phraseId,
          triggerId,
          en: enLeaves,
          vi: viLeaves,
          source: e.detail === 0 ? 'keyboard' : 'click',
          anchorRect: rect,
        });
      }}
      onPointerEnter={() => {
        const rect = btnRef.current?.getBoundingClientRect() ?? null;
        ctx.hoverPhraseEnter({
          segmentId,
          phraseId,
          triggerId,
          en: enLeaves,
          vi: viLeaves,
          anchorRect: rect,
        });
      }}
      onPointerLeave={() => {
        ctx.hoverPhraseLeave(triggerId);
      }}
      className="ml-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-muted hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      VI
    </button>
  );
}

export function extractSegmentTerms(
  segment: BilingualSegment,
  locale: Locale = 'en',
): { termId: string; surface: string }[] {
  const seen = new Set<string>();
  const out: { termId: string; surface: string }[] = [];
  const parts = segment[locale] || [];
  for (const part of parts) {
    const leaves = part.kind === 'phrase' ? part.children : [part];
    for (const leaf of leaves) {
      if (leaf.kind === 'term' && !seen.has(leaf.termId)) {
        seen.add(leaf.termId);
        out.push({ termId: leaf.termId, surface: leaf.surface });
      }
    }
  }
  return out;
}

type ClilInlineRendererProps = {
  segment: BilingualSegment;
  locale: Locale;
  mode: LearningMode;
  assessmentAllowsLookup?: boolean;
  interactiveParent?: boolean;
};

export default function ClilInlineRenderer({
  segment,
  locale,
  mode,
  assessmentAllowsLookup = true,
  interactiveParent = false,
}: ClilInlineRendererProps) {
  const parts: InlinePart[] = segment[locale] || [];
  const viPhrasesMap = new Map<string, Leaf[]>();
  const enPhrasesMap = new Map<string, Leaf[]>();

  for (const p of segment.vi || []) {
    if (p.kind === 'phrase') {
      viPhrasesMap.set(p.phraseId, p.children);
    }
  }
  for (const p of segment.en || []) {
    if (p.kind === 'phrase') {
      enPhrasesMap.set(p.phraseId, p.children);
    }
  }

  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.kind !== 'phrase') {
          return renderSingleLeaf(
            part,
            `${segment.id}-${locale}-leaf-${pIdx}`,
            segment.id,
            mode,
            assessmentAllowsLookup,
            interactiveParent,
          );
        }

        const viCounterpart = viPhrasesMap.get(part.phraseId) || [];
        const enCounterpart = enPhrasesMap.get(part.phraseId) || part.children;
        const showPhraseChip =
          locale === 'en' &&
          mode === 'assisted' &&
          assessmentAllowsLookup &&
          !interactiveParent &&
          viCounterpart.length > 0;

        // Leaves are rendered directly as siblings with a separate non-nested
        // phrase translation button chip, avoiding button-inside-button.
        return (
          <span
            key={`${segment.id}-${locale}-phrase-${part.phraseId}`}
            className="inline"
          >
            {part.children.map((leaf, cIdx) =>
              renderSingleLeaf(
                leaf,
                `${segment.id}-${locale}-${part.phraseId}-${cIdx}`,
                segment.id,
                mode,
                assessmentAllowsLookup,
                interactiveParent,
              ),
            )}
            {showPhraseChip && (
              <PhraseAssistChip
                segmentId={segment.id}
                phraseId={part.phraseId}
                enLeaves={enCounterpart}
                viLeaves={viCounterpart}
              />
            )}
          </span>
        );
      })}
    </>
  );
}

