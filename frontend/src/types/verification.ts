export type VerificationStatus = 'verified' | 'partial' | 'failed' | 'timeout' | 'not_applicable';
export type CheckOutcome = 'pass' | 'fail' | 'unknown' | 'timeout';

export type VerificationCheck = {
  checkId: string;
  claimId: string;
  name?: string;
  engine: 'sympy' | 'substitution' | 'geometry-analytic' | 'schema';
  outcome: CheckOutcome;
  status?: string;
  scope: string;
  assumptions: string[];
  reasonCode?: string;
};

export type ClaimCoverage = {
  claimId: string;
  kind: 'answer' | 'step' | 'constraint' | 'scene';
  required: boolean;
  checkIds: string[];
  outcome: CheckOutcome | 'not_checked';
};

export type VerificationEnvelope = {
  schemaVersion: 1;
  requestId: string;
  responseVersion: string;
  status: VerificationStatus;
  verified: boolean;
  reason: 'complete' | 'disabled' | 'unsupported' | 'no_evidence' | 'conflict' | 'budget' | 'incomplete';
  scope?: string;
  checks: VerificationCheck[];
  coverage: ClaimCoverage[];
  verifierVersion: string;
  repaired?: boolean;
  notes?: string;
};

export type VerificationBadgeProps = {
  result: VerificationEnvelope | null;
  requestState: 'idle' | 'sending' | 'streaming' | 'complete' | 'error';
  onShowEvidence: () => void;
};

export type RequestProgress = {
  requestId: string;
  stage: 'requesting' | 'generating' | 'verifying' | 'complete' | 'failed';
  source: 'transport' | 'server-event';
};

