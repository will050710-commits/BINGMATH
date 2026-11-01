import type { LearningMode } from './learning';

export type { LearningMode };
export type Locale = 'en' | 'vi';

export type Review = {
  status: 'reviewed';
  revision: string;
  reviewerRef: string;
};

export type Leaf =
  | { kind: 'text'; text: string }
  | { kind: 'math'; latex: string; display?: boolean }
  | { kind: 'term'; termId: string; surface: string };

export type InlinePart =
  | Leaf
  | { kind: 'phrase'; phraseId: string; children: Leaf[] };

export type BilingualSegment = {
  id: string;
  role: 'title' | 'objective' | 'theory' | 'prompt' | 'option' | 'feedback';
  en: InlinePart[];
  vi: InlinePart[];
  review: Review;
};

export type IllustrationKey = 'set-elements' | 'membership' | 'empty-set';

export type MathTerm = {
  id: string;
  version: string;
  en: string;
  vi: string;
  sense: string;
  domain: 'sets' | 'logic';
  aliases: { en: string[]; vi: string[] };
  definition: { en: string; vi: string };
  latex?: string;
  illustrationKey?: IllustrationKey;
  sourceRefs: string[];
  review: Review;
};

export type ClilQuestionView = {
  questionId: string;
  questionVersion: string;
  kind: 'mc' | 'tf' | 'fill';
  promptSegmentId: string;
  options?: { optionId: string; segmentId: string }[];
  feedbackSegmentIds?: string[];
  hintSegmentId?: string;
};

export type ClilLessonSection = {
  id: string;
  icon?: string;
  headingSegmentId: string;
  bodySegmentIds: string[];
  calloutSegmentId?: string;
  calloutTitleSegmentId?: string;
};

export type ClilLessonManifest = {
  lessonId: string;
  contentVersion: string;
  chapterSegmentId: string;
  titleSegmentId: string;
  objectiveSegmentIds: string[];
  navItems: { id: string; icon: string; segmentId: string }[];
  sections: ClilLessonSection[];
  segments: Record<string, BilingualSegment>;
  questions: ClilQuestionView[];
  termIds: string[];
};

export type OpenTermState = {
  termId: string;
  triggerId: string;
  segmentId: string;
  openReason: 'pointer' | 'keyboard' | 'click';
  pinned: boolean;
  anchorRect: DOMRect | null;
};

export type OpenPhraseState = {
  segmentId: string;
  phraseId: string;
  triggerId: string;
  en: Leaf[];
  vi: Leaf[];
  openReason: 'pointer' | 'keyboard' | 'click';
  pinned: boolean;
  anchorRect: DOMRect | null;
};

export type LearningExperienceState = {
  lessonId: string;
  contentVersion: string;
  sessionId: string;
  learnerScope: string;
  mode: LearningMode;
  activeSegmentId: string | null;
  openTerm: OpenTermState | null;
  openPhrase: OpenPhraseState | null;
  xray: { active: boolean; source: 'keyboard' | 'pointer' | 'toggle' | null };
  glossaryOpen: boolean;
};

export type BilingualBlockProps = {
  segment: BilingualSegment;
  mode?: LearningMode;
  as?: 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'span';
  translateAllowed?: boolean;
  interactiveParent?: boolean;
  className?: string;
};

export type LearningModeSwitchProps = {
  value?: LearningMode;
  onChange?: (mode: LearningMode) => void;
  available?: LearningMode[];
  disabledReason?: string;
  labelsLocale: 'vi' | 'en';
};

export type TermTriggerProps = {
  termId: string;
  surface: string;
  segmentId: string;
  mode?: LearningMode;
  assessmentAllowsLookup?: boolean;
  interactiveParent?: boolean;
};

export type TermPopoverProps = {
  term: MathTerm;
  open: boolean;
  triggerId: string;
  anchorRect: DOMRect | null;
  pinned: boolean;
  labelsLocale?: Locale;
  onPointerEnterCard?: () => void;
  onPointerLeaveCard?: () => void;
  onFocusEnterCard?: () => void;
  onFocusLeaveCard?: () => void;
  onClose: () => void;
  onLookup: (event: {
    termId: string;
    triggerId: string;
    source: 'click' | 'keyboard' | 'hover-dwell';
  }) => void;
};

export type PopoverState = {
  openKey: string | null;
  openReason: 'pointer' | 'keyboard' | 'click' | null;
  pinned: boolean;
  anchorRect: DOMRect | null;
};

export type PhraseTranslationProps = {
  segmentId: string;
  phraseId: string;
  en: Leaf[];
  vi: Leaf[];
  open: boolean;
  anchorRect: DOMRect | null;
  labelsLocale?: Locale;
  onPointerEnterCard?: () => void;
  onPointerLeaveCard?: () => void;
  onFocusEnterCard?: () => void;
  onFocusLeaveCard?: () => void;
  onClose: () => void;
};

