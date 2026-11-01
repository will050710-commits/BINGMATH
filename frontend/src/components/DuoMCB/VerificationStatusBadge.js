"use client";
import { useState } from "react";
import VerificationEvidencePanel from "./VerificationEvidencePanel";

const STATUS_CONFIG = {
  verified: {
    icon: "✅",
    labelVi: "Đã kiểm chứng",
    labelEn: "Verified",
    color: "#7f8f6f",
    bg: "rgba(127, 143, 111, 0.14)",
    border: "rgba(127, 143, 111, 0.4)",
  },
  partial: {
    icon: "ℹ️",
    labelVi: "Đã kiểm tra một phần",
    labelEn: "Partially checked",
    color: "#3898ec",
    bg: "rgba(56, 152, 236, 0.12)",
    border: "rgba(56, 152, 236, 0.35)",
  },
  timeout: {
    icon: "⏱",
    labelVi: "Chưa kịp kiểm chứng (hết thời gian xử lý)",
    labelEn: "Verification timed out",
    color: "#d97757",
    bg: "rgba(217, 119, 87, 0.12)",
    border: "rgba(217, 119, 87, 0.35)",
  },
  failed: {
    icon: "⚠️",
    labelVi: "Chưa kiểm chứng được đáp án",
    labelEn: "Verification failed — please check steps",
    color: "#b53333",
    bg: "rgba(181, 51, 51, 0.14)",
    border: "rgba(181, 51, 51, 0.4)",
  },
};

/**
 * Q1-compliant verification status badge for AI Tutor responses.
 * Never displays "verified" when verification is disabled, has no positive
 * mathematical evidence, or only passed structural schema checks.
 */
export default function VerificationStatusBadge({
  verification,
  perception = null,
  lang = "vi",
  expectedRequestId = null,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!verification || typeof verification !== "object") return null;

  // R3: Guard against rendering stale verification envelope when requestId does not match
  if (
    expectedRequestId &&
    verification.requestId &&
    String(verification.requestId) !== String(expectedRequestId)
  ) {
    return null;
  }

  const reason = verification.reason || "";
  const rawStatus = verification.status || "not_applicable";
  if (rawStatus === "not_applicable" || reason === "disabled" || reason === "no_evidence" || reason === "unsupported") {
    return null;
  }

  const isTrulyVerified =
    Boolean(verification.verified) &&
    rawStatus === "verified" &&
    reason !== "disabled" &&
    reason !== "no_evidence" &&
    reason !== "unsupported" &&
    reason !== "incomplete";

  const effectiveStatus = isTrulyVerified
    ? "verified"
    : STATUS_CONFIG[rawStatus]
      ? rawStatus
      : "partial";

  const cfg = STATUS_CONFIG[effectiveStatus];
  const checks = Array.isArray(verification.checks) ? verification.checks : [];
  const coverage = Array.isArray(verification.coverage) ? verification.coverage : [];
  const hasEvidenceDetails = checks.length > 0 || coverage.length > 0 || Boolean(verification.scope);
  const isEn = lang === "en";

  const scopeSuffix =
    effectiveStatus === "verified"
      ? verification.scope
        ? `: ${verification.scope}`
        : isEn
          ? ": checked claims"
          : ": phạm vi biểu thức đã kiểm"
      : "";
  const repairedSuffix =
    effectiveStatus === "verified" && verification.repaired
      ? isEn
        ? " (repaired)"
        : " (có sửa lại)"
      : "";
  const perceptionSuffix =
    perception?.confidence != null
      ? perception.confidence >= 0.5
        ? isEn
          ? ` · OCR confidence ${Math.round(perception.confidence * 100)}%`
          : ` · đọc tin cậy ${Math.round(perception.confidence * 100)}%`
        : isEn
          ? ` · uncertain OCR (${Math.round(perception.confidence * 100)}%)`
          : ` · đọc chưa chắc (${Math.round(perception.confidence * 100)}%)`
      : "";

  return (
    <div style={{ marginTop: 4 }} data-testid="verification-status-badge">
      <button
        type="button"
        onClick={() => hasEvidenceDetails && setExpanded((v) => !v)}
        aria-expanded={hasEvidenceDetails ? expanded : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 8,
          fontSize: 11.5,
          fontWeight: 600,
          color: cfg.color,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          cursor: hasEvidenceDetails ? "pointer" : "default",
        }}
      >
        <span aria-hidden="true">{cfg.icon}</span>
        <span>
          {isEn ? cfg.labelEn : cfg.labelVi}
          {scopeSuffix}
          {repairedSuffix}
          {perceptionSuffix}
        </span>
        {hasEvidenceDetails && (
          <span style={{ opacity: 0.75, fontSize: 10 }}>
            {expanded ? "▲" : `▼ (${checks.length})`}
          </span>
        )}
      </button>

      {expanded && hasEvidenceDetails && (
        <VerificationEvidencePanel
          envelope={verification}
          lang={isEn ? "en" : "vi"}
        />
      )}
    </div>
  );
}
