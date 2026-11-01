"""
backend/tests/test_verification_coverage.py
===========================================
Q1 mandatory regression suite covering all 11 verification states and coverage
boundaries specified in SPEC_BINGMCB_QUALITY.md:
1. off
2. empty
3. no applicable check (no_evidence)
4. schema-only (never promotes to verified)
5. critic unavailable (positive math pass vs no evidence)
6. mixed pass/fail
7. partially covered
8. timeout
9. repaired-and-rechecked
10. stale request guard
11. scene pass / answer unknown
"""
from __future__ import annotations

import asyncio
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import math_solver as ms  # noqa: E402
import verification_contract as vc  # noqa: E402

PASS = []


def check(name: str, condition: bool, detail: str = "") -> None:
    PASS.append((name, bool(condition)))
    print(f"{'OK  ' if condition else 'FAIL'} {name} {'' if condition else detail}")


def fake_critic(verdict: str):
    async def _chat(models=None, messages=None, temperature=0.0, max_tokens=0, **kwargs):
        return json.dumps({"verdict": verdict, "failed_steps": [], "corrected_final": ""}), "fake/critic"
    return _chat


async def run_suite() -> None:
    print("=== Q1 Verification Coverage & Honest State Regression Suite ===")

    ir_eq = {"transcription": "Giải phương trình x^2 - 5x + 6 = 0", "latex": ["x^2-5x+6=0"]}
    ir_empty = {"transcription": "Xin chào", "latex": []}

    # 1. off
    res_off = await ms.verify_and_repair(ir_eq, "Đáp án: x = 3", chat_fn=fake_critic("correct"), mode="off")
    check(
        "1. off -> verified=False, status=not_applicable, reason=disabled",
        res_off["verified"] is False
        and res_off["status"] == vc.STATUS_NOT_APPLICABLE
        and res_off["reason"] == "disabled",
        str(res_off),
    )

    # 2. empty
    res_empty = await ms.verify_and_repair(ir_eq, "   \n  ", chat_fn=fake_critic("correct"))
    check(
        "2. empty -> verified=False, status=not_applicable, reason=no_evidence",
        res_empty["verified"] is False
        and res_empty["status"] == vc.STATUS_NOT_APPLICABLE
        and res_empty["reason"] == "no_evidence",
        str(res_empty),
    )

    # 3. no applicable check
    res_none = await ms.verify_and_repair(ir_empty, "Chào em, hôm nay học bài gì?", chat_fn=fake_critic("correct"))
    check(
        "3. no applicable check -> verified=False even if critic says correct",
        res_none["verified"] is False
        and res_none["status"] == vc.STATUS_NOT_APPLICABLE
        and res_none["reason"] == "no_evidence",
        str(res_none),
    )

    # 4. schema-only
    res_schema = vc.evaluate_verification_envelope(
        mode="auto",
        reply="Đáp án: tập hợp A",
        raw_checks=[{"name": "schema", "engine": "schema", "status": "passed"}],
        critic={"verdict": "correct"},
        has_answer_claim=False,
    )
    check(
        "4. schema-only -> verified=False, status=not_applicable (schema is not math proof)",
        res_schema["verified"] is False
        and res_schema["status"] == vc.STATUS_NOT_APPLICABLE
        and res_schema["reason"] == "no_evidence",
        str(res_schema),
    )

    # 5. critic unavailable
    res_no_critic_ok = await ms.verify_and_repair(ir_eq, "Đáp án: x = 3", chat_fn=None)
    check(
        "5a. critic unavailable + positive deterministic check -> verified=True",
        res_no_critic_ok["verified"] is True
        and res_no_critic_ok["status"] == vc.STATUS_VERIFIED
        and res_no_critic_ok["reason"] == "complete",
        str(res_no_critic_ok),
    )
    res_no_critic_empty = await ms.verify_and_repair(ir_empty, "Một nhận xét chung", chat_fn=None)
    check(
        "5b. critic unavailable + no applicable check -> verified=False",
        res_no_critic_empty["verified"] is False
        and res_no_critic_empty["status"] == vc.STATUS_NOT_APPLICABLE,
        str(res_no_critic_empty),
    )

    # 6. mixed pass/fail
    res_mixed = vc.evaluate_verification_envelope(
        mode="auto",
        reply="Ta có x^2 - 5x + 6 = (x-2)(x-4). Đáp án: x = 3",
        raw_checks=[
            {"name": "substitution", "status": "passed"},
            {"name": "identities", "status": "failed"},
        ],
        critic={"verdict": "correct"},
        has_answer_claim=True,
    )
    check(
        "6. mixed pass/fail -> verified=False, status=failed, reason=conflict",
        res_mixed["verified"] is False
        and res_mixed["status"] == vc.STATUS_FAILED
        and res_mixed["reason"] == "conflict",
        str(res_mixed),
    )

    # 7. partially covered
    res_partial = vc.evaluate_verification_envelope(
        mode="auto",
        reply="Bước 1 đúng, bước 2 chưa kiểm chứng.",
        raw_checks=[{"name": "identities", "status": "passed", "claimId": "step:1"}],
        explicit_coverage=[
            {"claimId": "step:1", "kind": "step", "required": True, "checkIds": ["chk:identities:0"], "outcome": "pass"},
            {"claimId": "answer:main", "kind": "answer", "required": True, "checkIds": [], "outcome": "not_checked"},
        ],
    )
    check(
        "7. partially covered -> verified=False, status=partial, reason=incomplete",
        res_partial["verified"] is False
        and res_partial["status"] == vc.STATUS_PARTIAL
        and res_partial["reason"] == "incomplete",
        str(res_partial),
    )

    # 8. timeout
    res_timeout = vc.evaluate_verification_envelope(
        mode="auto",
        reply="Đáp án: x = 3",
        raw_checks=[{"name": "substitution", "status": "timeout"}],
        timed_out=True,
        has_answer_claim=True,
    )
    check(
        "8. timeout -> verified=False, status=timeout, reason=budget",
        res_timeout["verified"] is False
        and res_timeout["status"] == vc.STATUS_TIMEOUT
        and res_timeout["reason"] == "budget",
        str(res_timeout),
    )

    # 9. repaired-and-rechecked
    script = [
        '{"verdict": "wrong", "failed_steps": ["sai nghiem"], "corrected_final": "x = 3"}',
        "Sửa lại:\nĐáp án: x = 3",
        '{"verdict": "correct", "failed_steps": [], "corrected_final": ""}',
    ]
    idx = {"i": 0}

    async def repair_chat(*_a, **_k):
        val = script[min(idx["i"], len(script) - 1)]
        idx["i"] += 1
        return val, "fake/repair"

    res_repaired = await ms.verify_and_repair(
        ir_eq,
        "Đáp án: x = 5",
        chat_fn=repair_chat,
        request_id="req-9",
        response_version="v1",
    )
    check(
        "9. repaired-and-rechecked -> verified=True, repaired=True, responseVersion bumped",
        res_repaired["verified"] is True
        and res_repaired["repaired"] is True
        and res_repaired["status"] == vc.STATUS_VERIFIED
        and res_repaired["reason"] == "complete"
        and res_repaired["responseVersion"] == "v1-r1",
        str(res_repaired),
    )

    # 10. stale request guard
    check(
        "10. stale request -> rejected when requestId or responseVersion mismatches",
        vc.is_envelope_for_request(res_repaired, expected_request_id="req-9", expected_response_version="v1-r1") is True
        and vc.is_envelope_for_request(res_repaired, expected_request_id="req-10") is False
        and vc.is_envelope_for_request(res_repaired, expected_request_id="req-9", expected_response_version="v2") is False,
    )

    # 11. scene pass / answer unknown
    res_scene_only = await ms.verify_and_repair(
        {"transcription": "Tính diện tích tam giác ABC", "latex": []},
        "Đáp án: S = 12",
        chat_fn=fake_critic("correct"),
        precomputed_checks=[
            {"name": "sanity", "status": "skipped", "checked": 0},
            {"name": "presolve", "status": "skipped"},
            {"name": "substitution", "status": "skipped"},
            {"name": "identities", "status": "skipped"},
            {"name": "geometry", "status": "passed"},
        ],
    )
    check(
        "11. scene pass / answer unknown -> verified=False, status=partial, reason=incomplete",
        res_scene_only["verified"] is False
        and res_scene_only["status"] == vc.STATUS_PARTIAL
        and res_scene_only["reason"] == "incomplete",
        str(res_scene_only),
    )

    # 12. R2 regression: sanity positivity check on wrong area (S = 999 for 3x2 rectangle)
    res_sanity_rect = await ms.verify_and_repair(
        reply="Hình chữ nhật có diện tích S = 999.",
        perception={"problem_statement": "Tính diện tích hình chữ nhật có chiều dài 3 và chiều rộng 2."},
        chat_fn=fake_critic("correct"),
        mode="strict",
    )
    check(
        "12. R2: sanity positivity alone (S=999 > 0 for 3x2 rectangle) -> verified=False",
        res_sanity_rect["verified"] is False
        and res_sanity_rect["status"] == vc.STATUS_NOT_APPLICABLE
        and res_sanity_rect["reason"] == "unsupported",
        str(res_sanity_rect),
    )

    # 13. R2 regression: unchecked required answer claim alongside passed step identity
    res_unchecked_ans_with_step = vc.evaluate_verification_envelope(
        mode="strict",
        reply="Ta có 2 + 2 = 4. Vậy diện tích là 999.",
        raw_checks=[{"name": "identities", "status": "passed", "claimId": "step:1"}],
        has_answer_claim=True,
        explicit_coverage=[
            {"claimId": "answer:main", "kind": "answer", "required": True, "checkIds": [], "outcome": "not_checked"},
        ],
    )
    check(
        "13. R2: unchecked required answer claim with passed step identity -> verified=False, status=partial",
        res_unchecked_ans_with_step["verified"] is False
        and res_unchecked_ans_with_step["status"] == vc.STATUS_PARTIAL
        and res_unchecked_ans_with_step["reason"] == "incomplete",
        str(res_unchecked_ans_with_step),
    )

    # 14. R3 regression: main._solver_summary preserves full Q1 envelope contract
    import main as backend_main  # noqa: E402

    summary = backend_main._solver_summary(res_repaired)
    check(
        "14. R3: _solver_summary preserves reason, scope, coverage, requestId, responseVersion, verifierVersion, and check outcome/scope",
        summary.get("reason") == "complete"
        and bool(summary.get("scope"))
        and isinstance(summary.get("coverage"), list)
        and len(summary["coverage"]) >= 1
        and summary.get("requestId") == "req-9"
        and summary.get("responseVersion") == "v1-r1"
        and summary.get("verifierVersion") == vc.VERIFIER_VERSION
        and any(c.get("outcome") == "pass" and c.get("scope") for c in summary.get("checks", [])),
        str(summary),
    )

    failed = [name for name, ok in PASS if not ok]
    print(f"\n{len(PASS) - len(failed)}/{len(PASS)} Q1 coverage checks passed")
    if failed:
        print("FAILED:", failed)
        sys.exit(1)
    print("ALL_Q1_VERIFICATION_COVERAGE_TESTS_PASSED")


if __name__ == "__main__":
    asyncio.run(run_suite())

