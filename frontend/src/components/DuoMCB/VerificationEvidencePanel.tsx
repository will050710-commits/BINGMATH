"use client";
import React from "react";
import type { VerificationEnvelope } from "@/types/verification";

type VerificationEvidencePanelProps = {
  envelope: VerificationEnvelope;
  lang?: "vi" | "en";
};

export default function VerificationEvidencePanel({
  envelope,
  lang = "vi",
}: VerificationEvidencePanelProps) {
  const isEn = lang === "en";
  const checks = Array.isArray(envelope.checks) ? envelope.checks : [];
  const coverage = Array.isArray(envelope.coverage) ? envelope.coverage : [];

  return (
    <div
      className="mt-2 rounded-xl border border-line bg-surface p-3 text-xs text-ink"
      role="region"
      aria-label={isEn ? "Verification evidence details" : "Chi tiết bằng chứng kiểm chứng"}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span>
          {isEn ? "Scope:" : "Phạm vi:"}{" "}
          <strong className="font-semibold text-ink">
            {envelope.scope || (isEn ? "Declared checks" : "Các phép kiểm đã chạy")}
          </strong>
        </span>
        {envelope.verifierVersion && (
          <span className="font-mono text-[10px] text-subtle">
            {envelope.verifierVersion}
          </span>
        )}
      </div>

      {checks.length > 0 && (
        <ul className="space-y-1.5">
          {checks.map((chk, idx) => {
            const outcome = chk.outcome || (chk.status === "passed" ? "pass" : chk.status === "failed" ? "fail" : "unknown");
            const badgeText =
              outcome === "pass"
                ? isEn ? "PASS" : "ĐẠT"
                : outcome === "fail"
                  ? isEn ? "FAIL" : "KHÔNG ĐẠT"
                  : outcome === "timeout"
                    ? isEn ? "TIMEOUT" : "HẾT GIỜ"
                    : isEn ? "SKIPPED" : "BỎ QUA";
            return (
              <li
                key={chk.checkId || `${chk.name || chk.engine}-${idx}`}
                className="flex flex-wrap items-baseline gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5"
              >
                <span className="font-mono text-[11px] font-semibold text-ink">
                  [{badgeText}]
                </span>
                <span className="font-semibold text-ink">
                  {chk.name || chk.engine}
                </span>
                {chk.scope && (
                  <span className="text-muted">
                    · {chk.scope}
                  </span>
                )}
                {Array.isArray(chk.assumptions) && chk.assumptions.length > 0 && (
                  <span className="text-subtle">
                    ({isEn ? "Assumptions: " : "Giả thiết: "}
                    {chk.assumptions.join(", ")})
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {coverage.length > 0 && (
        <div className="mt-2 border-t border-line pt-1.5 text-[11px] text-muted">
          <span className="font-semibold">
            {isEn ? "Claim coverage:" : "Độ phủ mệnh đề:"}{" "}
          </span>
          {coverage.map((cov) => `${cov.claimId} (${cov.outcome})`).join(" · ")}
        </div>
      )}
    </div>
  );
}

