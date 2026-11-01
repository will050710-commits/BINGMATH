export type LearningMode = 'immersion' | 'assisted' | 'parallel';

export type AsyncState<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; data: T; receivedAt: string }
  | { status: 'error'; code: string; retryable: boolean };

export type LearningContext = {
  sessionId: string;
  lessonId: string;
  contentVersion: string;
  learnerScope: string; // opaque user ID or guest ID, never raw email
};

export type FeatureFlags = {
  clilPilot: boolean;
  clilPolisher: boolean;
  verifiedSocraticSteps: boolean;
  rewardLedger: boolean;
  learningPath: boolean;
  streakBlitz: boolean;
  bossChallenge: boolean;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  clilPilot: true,
  clilPolisher: false,
  verifiedSocraticSteps: false,
  rewardLedger: false,
  learningPath: false,
  streakBlitz: false,
  bossChallenge: false,
};

