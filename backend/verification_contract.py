"""
backend/verification_contract.py
================================
Q1 — Scoped, honest mathematical verification contract & envelope evaluator.

Distinguishes four states:
1. Content generated
2. Verification checks executed
3. Mathematical claims verified within an explicit scope
4. Action eligible for learning rewards (handled by Q2/G1)

Key invariants:
- `mode == "off"` is NEVER `verified=True`; it returns `verified=False, status="not_applicable", reason="disabled"`.
- Structural `schema` checks never count as positive mathematical proof of an answer or step.
- Critic agreement (`verdict="correct"`) is a secondary consistency signal and cannot promote an
  unchecked or schema-only reply to `verified=True`.
- Scene-only verification (`geometry` pass) when an algebraic/numeric answer claim remains unchecked
  yields `status="partial", verified=False, reason="incomplete"`.
"""
from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, Sequence
import uuid

VerificationStatus = Literal["verified", "partial", "failed", "timeout", "not_applicable"]
CheckOutcome = Literal["pass", "fail", "unknown", "timeout"]
VerificationReason = Literal[
    "complete",
    "disabled",
    "unsupported",
    "no_evidence",
    "conflict",
    "budget",
    "incomplete",
]

VERIFIER_VERSION = "q1.v1"

STATUS_VERIFIED: VerificationStatus = "verified"
STATUS_PARTIAL: VerificationStatus = "partial"
STATUS_FAILED: VerificationStatus = "failed"
STATUS_TIMEOUT: VerificationStatus = "timeout"
STATUS_NOT_APPLICABLE: VerificationStatus = "not_applicable"

_ENGINE_MAP = {
    "presolve": "sympy",
    "identities": "sympy",
    "sanity": "sympy",
    "substitution": "substitution",
    "geometry": "geometry-analytic",
    "schema": "schema",
}

_SCOPE_MAP = {
    "presolve": "algebraic-roots-match",
    "substitution": "candidate-point-substitution",
    "identities": "symbolic-equality-steps",
    "sanity": "domain-positivity-bounds",
    "geometry": "scene-coordinates-constraints",
    "schema": "structural-schema-only",
}


def normalize_check(raw: Dict[str, Any], index: int = 0) -> Dict[str, Any]:
    """Normalize a legacy or Q1 check dictionary into the canonical Q1 shape while
    preserving legacy `name` and `status` keys for existing callers."""
    name = str(raw.get("name") or raw.get("engine") or f"check_{index}").strip()
    raw_status = str(raw.get("outcome") or raw.get("status") or "unknown").strip().lower()

    if raw_status in ("pass", "passed", "ok", "true"):
        outcome: CheckOutcome = "pass"
        legacy_status = "passed"
    elif raw_status in ("fail", "failed", "false", "error"):
        outcome = "fail"
        legacy_status = "failed"
    elif raw_status == "timeout":
        outcome = "timeout"
        legacy_status = "timeout"
    else:
        outcome = "unknown"
        legacy_status = raw_status if raw_status in ("skipped", "unknown") else "skipped"

    # Special case: legacy `sanity` check with `checked == 0` did not test any domain claim.
    if name == "sanity" and raw.get("checked") == 0 and outcome == "pass":
        outcome = "unknown"
        legacy_status = "skipped"

    engine = raw.get("engine") or _ENGINE_MAP.get(name, "sympy")
    if raw.get("claimId"):
        claim_id = str(raw["claimId"])
    elif name == "geometry" or engine == "geometry-analytic":
        claim_id = "scene:main"
    elif name == "identities":
        claim_id = "steps:identities"
    elif name == "sanity":
        claim_id = "constraint:sanity"
    elif name == "schema" or engine == "schema":
        claim_id = "schema:structure"
    else:
        claim_id = "answer:main"
    scope = str(raw.get("scope") or _SCOPE_MAP.get(name, "declared-expression"))
    assumptions = list(raw.get("assumptions") or [])

    normalized: Dict[str, Any] = {
        **raw,
        "checkId": str(raw.get("checkId") or f"chk:{name}:{index}"),
        "claimId": claim_id,
        "name": name,
        "engine": engine,
        "outcome": outcome,
        "status": legacy_status,
        "scope": scope,
        "assumptions": assumptions,
    }
    if raw.get("reason") and "reasonCode" not in normalized:
        normalized["reasonCode"] = str(raw["reason"])
    return normalized


def is_positive_math_check(chk: Dict[str, Any]) -> bool:
    """Return True iff `chk` is a passed mathematical check that positively proves a claim.

    Excludes structural `schema` checks and one-sided domain bound `sanity` checks
    (e.g. `S > 0`), which can refute when `fail` but never prove correctness when `pass`.
    """
    outcome = chk.get("outcome") or chk.get("status")
    if outcome not in ("pass", "passed"):
        return False
    engine = str(chk.get("engine") or "")
    name = str(chk.get("name") or "")
    claim_id = str(chk.get("claimId") or "")
    if engine == "schema" or name == "schema" or claim_id.startswith("schema"):
        return False
    if name == "sanity" or claim_id.startswith("constraint:"):
        return False
    return True


def is_positive_answer_check(chk: Dict[str, Any]) -> bool:
    """Return True iff `chk` positively proves the main mathematical answer claim."""
    if not is_positive_math_check(chk):
        return False
    name = str(chk.get("name") or "")
    claim_id = str(chk.get("claimId") or "")
    if name in ("identities", "geometry", "sanity", "schema"):
        return False
    if claim_id.startswith(("step", "scene", "constraint", "schema")):
        return False
    return True


def build_claim_coverage(
    checks: Sequence[Dict[str, Any]],
    *,
    has_answer_claim: bool = False,
    has_scene_claim: bool = False,
    explicit_coverage: Optional[Sequence[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """Build or normalize the required claim coverage list for a verification run."""
    if explicit_coverage is not None:
        return [dict(item) for item in explicit_coverage]

    answer_proving_checks = [
        c for c in checks
        if c.get("engine") != "schema"
        and c.get("name") not in ("schema", "geometry", "identities", "sanity")
        and not str(c.get("claimId") or "").startswith(("step", "scene", "constraint", "schema"))
    ]
    sanity_checks = [
        c for c in checks
        if c.get("name") == "sanity" or str(c.get("claimId") or "").startswith("constraint:")
    ]
    step_checks = [
        c for c in checks
        if c.get("name") == "identities" or str(c.get("claimId") or "").startswith("step")
    ]
    scene_checks = [
        c for c in checks
        if c.get("name") == "geometry"
        or c.get("engine") == "geometry-analytic"
        or str(c.get("claimId") or "").startswith("scene")
    ]

    answer_pass = [c for c in answer_proving_checks if is_positive_answer_check(c)]
    answer_fail = [
        c for c in [*answer_proving_checks, *sanity_checks]
        if c.get("outcome") == "fail" or c.get("status") == "failed"
    ]
    answer_timeout = [
        c for c in [*answer_proving_checks, *sanity_checks]
        if c.get("outcome") == "timeout" or c.get("status") == "timeout"
    ]

    step_pass = [c for c in step_checks if is_positive_math_check(c)]
    step_fail = [c for c in step_checks if c.get("outcome") == "fail" or c.get("status") == "failed"]
    step_timeout = [c for c in step_checks if c.get("outcome") == "timeout" or c.get("status") == "timeout"]

    scene_pass = [c for c in scene_checks if is_positive_math_check(c)]
    scene_fail = [c for c in scene_checks if c.get("outcome") == "fail" or c.get("status") == "failed"]
    scene_timeout = [c for c in scene_checks if c.get("outcome") == "timeout" or c.get("status") == "timeout"]

    sanity_active = [c for c in sanity_checks if c.get("outcome") in ("pass", "fail", "timeout")]

    coverage: List[Dict[str, Any]] = []

    if has_answer_claim or answer_pass or answer_fail or answer_timeout:
        if answer_fail:
            ans_outcome = "fail"
        elif answer_timeout:
            ans_outcome = "timeout"
        elif answer_pass:
            ans_outcome = "pass"
        else:
            ans_outcome = "not_checked"
        coverage.append({
            "claimId": "answer:main",
            "kind": "answer",
            "required": True,
            "checkIds": [
                str(c.get("checkId"))
                for c in answer_proving_checks
                if c.get("outcome") != "unknown"
            ],
            "outcome": ans_outcome,
        })

    if step_pass or step_fail or step_timeout:
        if step_fail:
            stp_outcome = "fail"
        elif step_timeout:
            stp_outcome = "timeout"
        else:
            stp_outcome = "pass"
        coverage.append({
            "claimId": "steps:identities",
            "kind": "step",
            "required": True,
            "checkIds": [str(c.get("checkId")) for c in step_checks if c.get("outcome") != "unknown"],
            "outcome": stp_outcome,
        })

    if has_scene_claim or scene_pass or scene_fail or scene_timeout:
        if scene_fail:
            scn_outcome = "fail"
        elif scene_timeout:
            scn_outcome = "timeout"
        elif scene_pass:
            scn_outcome = "pass"
        else:
            scn_outcome = "not_checked"
        coverage.append({
            "claimId": "scene:main",
            "kind": "scene",
            "required": True,
            "checkIds": [str(c.get("checkId")) for c in scene_checks if c.get("outcome") != "unknown"],
            "outcome": scn_outcome,
        })

    if sanity_active:
        if any(c.get("outcome") == "fail" for c in sanity_active):
            san_outcome = "fail"
        elif any(c.get("outcome") == "timeout" for c in sanity_active):
            san_outcome = "timeout"
        else:
            san_outcome = "pass"
        coverage.append({
            "claimId": "constraint:sanity",
            "kind": "constraint",
            "required": False,
            "checkIds": [str(c.get("checkId")) for c in sanity_active],
            "outcome": san_outcome,
        })

    return coverage


def evaluate_verification_envelope(
    *,
    mode: str = "auto",
    reply: str = "",
    raw_checks: Sequence[Dict[str, Any]] = (),
    critic: Optional[Dict[str, Any]] = None,
    has_answer_claim: bool = False,
    has_scene_claim: bool = False,
    explicit_coverage: Optional[Sequence[Dict[str, Any]]] = None,
    repaired: bool = False,
    timed_out: bool = False,
    request_id: Optional[str] = None,
    response_version: str = "v1",
) -> Dict[str, Any]:
    """Evaluate checks, coverage, and critic signal into a Q1-compliant VerificationEnvelope."""
    req_id = request_id or f"req-{uuid.uuid4().hex[:10]}"
    norm_mode = (mode or "auto").strip().lower()

    if norm_mode == "off":
        return {
            "schemaVersion": 1,
            "requestId": req_id,
            "responseVersion": response_version,
            "status": STATUS_NOT_APPLICABLE,
            "verified": False,
            "reason": "disabled",
            "checks": [],
            "coverage": [],
            "critic": None,
            "repaired": False,
            "mode": norm_mode,
            "verifierVersion": VERIFIER_VERSION,
            "notes": "verification disabled",
        }

    if not str(reply or "").strip():
        return {
            "schemaVersion": 1,
            "requestId": req_id,
            "responseVersion": response_version,
            "status": STATUS_NOT_APPLICABLE,
            "verified": False,
            "reason": "no_evidence",
            "checks": [],
            "coverage": [],
            "critic": None,
            "repaired": False,
            "mode": norm_mode,
            "verifierVersion": VERIFIER_VERSION,
            "notes": "empty reply",
        }

    checks = [normalize_check(c, idx) for idx, c in enumerate(raw_checks)]
    coverage = build_claim_coverage(
        checks,
        has_answer_claim=has_answer_claim,
        has_scene_claim=has_scene_claim,
        explicit_coverage=explicit_coverage,
    )

    failed = [c for c in checks if c.get("outcome") == "fail"]
    timed_out_checks = [c for c in checks if c.get("outcome") == "timeout"]
    positive_math = [c for c in checks if is_positive_math_check(c)]
    verdict = (critic or {}).get("verdict")

    required_claims = [c for c in coverage if c.get("required", True)]
    failed_claims = [c for c in required_claims if c.get("outcome") == "fail"]
    timeout_claims = [c for c in required_claims if c.get("outcome") == "timeout"]
    unchecked_claims = [
        c for c in required_claims
        if c.get("outcome") in ("not_checked", "unknown")
    ]
    passed_claims = [c for c in required_claims if c.get("outcome") == "pass"]

    # 1. Any explicit failure or critic conflict -> failed
    if failed or failed_claims or verdict == "wrong":
        status: VerificationStatus = STATUS_FAILED
        verified = False
        reason: VerificationReason = "conflict"
        fail_names = [str(c.get("name", "?")) for c in failed]
        if verdict == "wrong" and not fail_names:
            fail_names.append("critic")
        notes = "kiểm tra không đạt: " + ", ".join(fail_names or ["required_claim"])
    # 2. Timeout before required claims completed -> timeout
    elif timed_out or timed_out_checks or timeout_claims:
        status = STATUS_TIMEOUT
        verified = False
        reason = "budget"
        notes = "hết thời gian kiểm chứng trước khi hoàn tất các mệnh đề bắt buộc"
    # 3. Any required claim remains unchecked -> NEVER verified
    elif unchecked_claims:
        if passed_claims or positive_math:
            status = STATUS_PARTIAL
            verified = False
            reason = "incomplete"
            notes = "đã kiểm tra một phần; còn mệnh đề bắt buộc chưa được kiểm chứng"
        else:
            status = STATUS_NOT_APPLICABLE
            verified = False
            reason = "unsupported"
            notes = "chưa có phép kiểm toán học áp dụng cho mệnh đề này"
    # 4. No positive mathematical check ran at all (e.g. chitchat, schema-only, or constraint-only)
    elif not positive_math or not passed_claims:
        status = STATUS_NOT_APPLICABLE
        verified = False
        reason = "no_evidence"
        notes = "không có mệnh đề toán học cần kiểm chứng"
    # 5. All required claims in scope have positive mathematical evidence and no conflict
    else:
        status = STATUS_VERIFIED
        verified = True
        reason = "complete"
        if repaired:
            notes = "đã sửa và kiểm lại đạt"
        else:
            notes = "deterministic checks passed" + (", critic agrees" if verdict == "correct" else "")

    scopes = sorted({str(c.get("scope")) for c in positive_math if c.get("scope")})
    return {
        "schemaVersion": 1,
        "requestId": req_id,
        "responseVersion": response_version,
        "status": status,
        "verified": verified,
        "reason": reason,
        "scope": ", ".join(scopes) if scopes else "",
        "checks": checks,
        "coverage": coverage,
        "critic": critic,
        "repaired": repaired,
        "mode": norm_mode,
        "verifierVersion": VERIFIER_VERSION,
        "notes": notes,
    }


def is_envelope_for_request(
    envelope: Optional[Dict[str, Any]],
    *,
    expected_request_id: str,
    expected_response_version: Optional[str] = None,
) -> bool:
    """Guard against attaching stale verification evidence to a newer reply."""
    if not isinstance(envelope, dict):
        return False
    if str(envelope.get("requestId") or "") != str(expected_request_id):
        return False
    if expected_response_version is not None:
        if str(envelope.get("responseVersion") or "") != str(expected_response_version):
            return False
    return True

