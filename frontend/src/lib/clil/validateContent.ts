import katex from 'katex';
import type {
  BilingualSegment,
  ClilLessonManifest,
  InlinePart,
  Leaf,
  MathTerm,
} from '@/types/clil';

export type ClilValidationIssue = {
  code:
    | 'missing_segment'
    | 'segment_id_mismatch'
    | 'unreviewed_segment'
    | 'empty_locale_parts'
    | 'raw_html_detected'
    | 'raw_dollar_in_text'
    | 'duplicate_phrase_id'
    | 'phrase_alignment_mismatch'
    | 'unknown_term_ref'
    | 'unreviewed_term'
    | 'missing_term_definition'
    | 'unknown_illustration_key'
    | 'invalid_latex'
    | 'duplicate_question_id'
    | 'duplicate_option_id';
  location: string;
  message: string;
};

const RAW_HTML_RE = /<\/?[a-zA-Z][^>]*>/;
const VALID_ILLUSTRATION_KEYS = new Set([
  'set-elements',
  'membership',
  'empty-set',
]);

function collectLeaves(parts: InlinePart[]): Leaf[] {
  const out: Leaf[] = [];
  for (const part of parts) {
    if (part.kind === 'phrase') {
      for (const child of part.children) {
        out.push(child);
      }
    } else {
      out.push(part);
    }
  }
  return out;
}

function validatePartsForLocale(
  segmentId: string,
  locale: 'en' | 'vi',
  parts: InlinePart[],
  termsCatalog: Record<string, MathTerm>,
  issues: ClilValidationIssue[],
): Set<string> {
  const phraseIds = new Set<string>();
  if (!Array.isArray(parts) || parts.length === 0) {
    issues.push({
      code: 'empty_locale_parts',
      location: `${segmentId}.${locale}`,
      message: `Segment "${segmentId}" has empty ${locale.toUpperCase()} content.`,
    });
    return phraseIds;
  }

  for (const part of parts) {
    if (part.kind === 'phrase') {
      if (!part.phraseId || phraseIds.has(part.phraseId)) {
        issues.push({
          code: 'duplicate_phrase_id',
          location: `${segmentId}.${locale}.${part.phraseId || 'empty'}`,
          message: `Duplicate or empty phraseId "${part.phraseId}" in ${segmentId}.${locale}.`,
        });
      }
      phraseIds.add(part.phraseId);
      if (!Array.isArray(part.children) || part.children.length === 0) {
        issues.push({
          code: 'empty_locale_parts',
          location: `${segmentId}.${locale}.${part.phraseId}`,
          message: `Phrase "${part.phraseId}" in ${segmentId}.${locale} has no children.`,
        });
      }
    }
  }

  const leaves = collectLeaves(parts);
  for (const leaf of leaves) {
    if (leaf.kind === 'text') {
      if (RAW_HTML_RE.test(leaf.text)) {
        issues.push({
          code: 'raw_html_detected',
          location: `${segmentId}.${locale}`,
          message: `Raw HTML tag found in text leaf of "${segmentId}.${locale}".`,
        });
      }
      if (leaf.text.includes('$')) {
        issues.push({
          code: 'raw_dollar_in_text',
          location: `${segmentId}.${locale}`,
          message: `Raw "$" math delimiter found in text leaf of "${segmentId}.${locale}"; use { kind: "math", latex } instead.`,
        });
      }
    } else if (leaf.kind === 'term') {
      const term = termsCatalog[leaf.termId];
      if (!term) {
        issues.push({
          code: 'unknown_term_ref',
          location: `${segmentId}.${locale}.${leaf.termId}`,
          message: `Unknown termId "${leaf.termId}" referenced in "${segmentId}.${locale}".`,
        });
      } else if (term.review?.status !== 'reviewed') {
        issues.push({
          code: 'unreviewed_term',
          location: `term:${leaf.termId}`,
          message: `Term "${leaf.termId}" is not marked as reviewed.`,
        });
      }
      if (!leaf.surface || !leaf.surface.trim() || RAW_HTML_RE.test(leaf.surface)) {
        issues.push({
          code: 'raw_html_detected',
          location: `${segmentId}.${locale}.${leaf.termId}`,
          message: `Invalid surface text for term "${leaf.termId}" in "${segmentId}.${locale}".`,
        });
      }
    } else if (leaf.kind === 'math') {
      try {
        katex.renderToString(leaf.latex, {
          displayMode: Boolean(leaf.display),
          throwOnError: true,
        });
      } catch (err) {
        issues.push({
          code: 'invalid_latex',
          location: `${segmentId}.${locale}`,
          message: `KaTeX failed to parse "${leaf.latex}": ${(err as Error).message}`,
        });
      }
    }
  }

  return phraseIds;
}

export function validateBilingualSegment(
  segment: BilingualSegment,
  termsCatalog: Record<string, MathTerm>,
): ClilValidationIssue[] {
  const issues: ClilValidationIssue[] = [];
  if (segment.review?.status !== 'reviewed' || !segment.review.revision || !segment.review.reviewerRef) {
    issues.push({
      code: 'unreviewed_segment',
      location: segment.id,
      message: `Segment "${segment.id}" lacks complete review metadata.`,
    });
  }

  const enPhrases = validatePartsForLocale(segment.id, 'en', segment.en, termsCatalog, issues);
  const viPhrases = validatePartsForLocale(segment.id, 'vi', segment.vi, termsCatalog, issues);

  if (enPhrases.size !== viPhrases.size) {
    issues.push({
      code: 'phrase_alignment_mismatch',
      location: segment.id,
      message: `Segment "${segment.id}" has ${enPhrases.size} EN phrases vs ${viPhrases.size} VI phrases.`,
    });
  } else {
    for (const pid of enPhrases) {
      if (!viPhrases.has(pid)) {
        issues.push({
          code: 'phrase_alignment_mismatch',
          location: `${segment.id}.${pid}`,
          message: `Phrase "${pid}" exists in EN but not in VI for segment "${segment.id}".`,
        });
      }
    }
  }

  return issues;
}

export function validateClilLessonManifest(
  manifest: ClilLessonManifest,
  termsCatalog: Record<string, MathTerm>,
): { valid: boolean; issues: ClilValidationIssue[] } {
  const issues: ClilValidationIssue[] = [];
  const segments = manifest.segments || {};

  const requireSegmentRef = (segId: string | undefined, owner: string) => {
    if (!segId || !segments[segId]) {
      issues.push({
        code: 'missing_segment',
        location: owner,
        message: `Missing segment "${segId || ''}" referenced by ${owner}.`,
      });
    }
  };

  requireSegmentRef(manifest.chapterSegmentId, 'manifest.chapterSegmentId');
  requireSegmentRef(manifest.titleSegmentId, 'manifest.titleSegmentId');

  for (const objId of manifest.objectiveSegmentIds || []) {
    requireSegmentRef(objId, `manifest.objective:${objId}`);
  }

  for (const nav of manifest.navItems || []) {
    requireSegmentRef(nav.segmentId, `manifest.nav:${nav.id}`);
  }

  for (const sec of manifest.sections || []) {
    requireSegmentRef(sec.headingSegmentId, `section:${sec.id}.heading`);
    for (const bodyId of sec.bodySegmentIds || []) {
      requireSegmentRef(bodyId, `section:${sec.id}.body:${bodyId}`);
    }
    if (sec.calloutTitleSegmentId) {
      requireSegmentRef(sec.calloutTitleSegmentId, `section:${sec.id}.calloutTitle`);
    }
    if (sec.calloutSegmentId) {
      requireSegmentRef(sec.calloutSegmentId, `section:${sec.id}.callout`);
    }
  }

  const seenQuestionIds = new Set<string>();
  for (const q of manifest.questions || []) {
    if (seenQuestionIds.has(q.questionId)) {
      issues.push({
        code: 'duplicate_question_id',
        location: `question:${q.questionId}`,
        message: `Duplicate questionId "${q.questionId}".`,
      });
    }
    seenQuestionIds.add(q.questionId);
    requireSegmentRef(q.promptSegmentId, `question:${q.questionId}.prompt`);

    const seenOptionIds = new Set<string>();
    for (const opt of q.options || []) {
      if (seenOptionIds.has(opt.optionId)) {
        issues.push({
          code: 'duplicate_option_id',
          location: `question:${q.questionId}.option:${opt.optionId}`,
          message: `Duplicate optionId "${opt.optionId}" in question "${q.questionId}".`,
        });
      }
      seenOptionIds.add(opt.optionId);
      requireSegmentRef(opt.segmentId, `question:${q.questionId}.option:${opt.optionId}`);
    }

    for (const fbId of q.feedbackSegmentIds || []) {
      requireSegmentRef(fbId, `question:${q.questionId}.feedback:${fbId}`);
    }
    if (q.hintSegmentId) {
      requireSegmentRef(q.hintSegmentId, `question:${q.questionId}.hint`);
    }
  }

  for (const termId of manifest.termIds || []) {
    const term = termsCatalog[termId];
    if (!term) {
      issues.push({
        code: 'unknown_term_ref',
        location: `manifest.termIds:${termId}`,
        message: `Manifest lists unknown termId "${termId}".`,
      });
    } else {
      if (term.review?.status !== 'reviewed') {
        issues.push({
          code: 'unreviewed_term',
          location: `term:${termId}`,
          message: `Term "${termId}" is not reviewed.`,
        });
      }
      if (!term.definition?.en?.trim() || !term.definition?.vi?.trim()) {
        issues.push({
          code: 'missing_term_definition',
          location: `term:${termId}`,
          message: `Term "${termId}" is missing bilingual definition.en or definition.vi.`,
        });
      }
      if (term.illustrationKey && !VALID_ILLUSTRATION_KEYS.has(term.illustrationKey)) {
        issues.push({
          code: 'unknown_illustration_key',
          location: `term:${termId}.illustrationKey`,
          message: `Unknown illustrationKey "${term.illustrationKey}" on term "${termId}".`,
        });
      }
      if (term.latex) {
        try {
          katex.renderToString(term.latex, { throwOnError: true });
        } catch (err) {
          issues.push({
            code: 'invalid_latex',
            location: `term:${termId}.latex`,
            message: `Invalid LaTeX on term "${termId}": ${(err as Error).message}`,
          });
        }
      }
    }
  }

  for (const [key, seg] of Object.entries(segments)) {
    if (seg.id !== key) {
      issues.push({
        code: 'segment_id_mismatch',
        location: key,
        message: `Segment key "${key}" does not match segment.id "${seg.id}".`,
      });
    }
    issues.push(...validateBilingualSegment(seg, termsCatalog));
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function flattenInlinePartToPlainText(parts: InlinePart[]): string {
  const leaves = collectLeaves(parts);
  return leaves
    .map((leaf) => {
      if (leaf.kind === 'text') return leaf.text;
      if (leaf.kind === 'term') return leaf.surface;
      return leaf.latex;
    })
    .join('');
}

