"""test_verify_states.py — offline suite for P3 (honest verification states).

Needs sympy (already in CI's light install). No network, no main.py import.
"""
import asyncio
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import math_solver as ms  # noqa: E402

checks = 0
failures = 0


def check(label, ok, detail=""):
    global checks, failures
    checks += 1
    if ok:
        print(f"  [OK] {label}")
    else:
        failures += 1
        print(f"  [FAIL] {label} {detail}")


print("=== should_verify: the 0 %-confidence reading is no longer grounds ===")
saved = dict(os.environ)
try:
    os.environ["MATH_VERIFY_MODE"] = "auto"
    check("a confident reading is verified",
          ms.should_verify("bài này", "Xin chào", {"confidence": 0.9}) is True)
    check("a 0 %-confidence reading with a non-answer is NOT verified",
          ms.should_verify("Gợi ý bài toán từ ảnh", "Hãy gửi đề bài cụ thể nhé!",
                           {"confidence": 0.0}) is False)
    check("...even at 0.4 (below the 0.5 default)",
          ms.should_verify("Gợi ý bài toán từ ảnh", "Hãy gửi đề bài cụ thể nhé!",
                           {"confidence": 0.4}) is False)
    check("a low-confidence reading still verifies when the REPLY has an answer",
          ms.should_verify("x^2 - 4 = 0", "Đáp án: 2", {"confidence": 0.2}) is True)
    check("no perception + chit-chat is not verified",
          ms.should_verify("chào bạn", "Chào em!") is False)
    os.environ["VERIFY_MIN_READ_CONFIDENCE"] = "0.8"
    check("the threshold is configurable (0.7 < 0.8 → no)",
          ms.should_verify("bài này", "Xin chào", {"confidence": 0.7}) is False)
    os.environ.pop("VERIFY_MIN_READ_CONFIDENCE", None)
    os.environ["MATH_VERIFY_MODE"] = "always"
    check("mode=always verifies even without perception",
          ms.should_verify("", "", None) is True)
    os.environ["MATH_VERIFY_MODE"] = "off"
    check("mode=off never verifies",
          ms.should_verify("x+1=2", "Đáp án: 1", {"confidence": 0.99}) is False)
    os.environ["MATH_VERIFY_MODE"] = "auto"
finally:
    os.environ.clear()
    os.environ.update(saved)

print("\n=== verification_note: one sentence per state ===")
check("verified → no note", ms.verification_note({"verified": True}) == "")
check("not_applicable → no scary badge",
      ms.verification_note({"verified": False, "status": ms.STATUS_NOT_APPLICABLE}) == "")
check("timeout → the calm 'chưa kịp' note",
      "chưa kịp" in ms.verification_note({"verified": False, "status": ms.STATUS_TIMEOUT}))
check("partial → the ℹ️ 'kiểm tra số học' note",
      "phản biện" in ms.verification_note({"verified": False, "status": ms.STATUS_PARTIAL}))
failed_note = ms.verification_note({
    "verified": False, "status": ms.STATUS_FAILED,
    "checks": [{"name": "substitution", "status": "failed"}]})
check("failed → the loud badge WITH the failing check's name",
      "Chưa kiểm chứng" in failed_note and "substitution" in failed_note)
legacy = ms.verification_note({"verified": False})   # no status (old payload)
check("a payload without a status keeps the old badge",
      "chưa kết luận được" in legacy)

print("\n=== verify_and_repair: the status is set on every exit ===")


def fake_critic(verdict):
    async def _chat(models=None, messages=None, temperature=0.0, max_tokens=0, **kwargs):
        return json.dumps({"verdict": verdict, "failed_steps": [], "corrected_final": ""}), "fake/critic"
    return _chat


ir = {"transcription": "Xin chào", "latex": ""}
out = asyncio.run(ms.verify_and_repair(ir, "Xin chào em!", chat_fn=fake_critic("unclear")))
check("a plain reply with an unclear critic is verified",
      out["verified"] is True and out["status"] == ms.STATUS_VERIFIED, str(out.get("status")))
check("...with the historical notes text kept", out["notes"].startswith("deterministic checks passed"))

out_empty = asyncio.run(ms.verify_and_repair(ir, "   ", chat_fn=fake_critic("unclear")))
check("an empty reply is not_applicable, not failed",
      out_empty["status"] == ms.STATUS_NOT_APPLICABLE and out_empty["verified"] is False)

out_off = asyncio.run(ms.verify_and_repair(ir, "Xin chào", chat_fn=fake_critic("unclear"), mode="off"))
check("mode=off reports verified (nothing to fear) with its own note",
      out_off["verified"] is True and out_off["status"] == ms.STATUS_VERIFIED
      and out_off["notes"] == "verification disabled")

# precomputed_checks must be REUSED, not recomputed — that is what lets main()
# run the free layer outside the critic's clock (P3).
original = ms.deterministic_checks


def boom(*_a, **_k):
    raise AssertionError("deterministic_checks re-ran despite precomputed_checks")


ms.deterministic_checks = boom
try:
    out_pre = asyncio.run(ms.verify_and_repair(
        ir, "Xin chào em!", chat_fn=fake_critic("unclear"),
        precomputed_checks=[{"name": "sanity", "status": "passed"}]))
    check("precomputed checks are honoured (the free layer does not re-run)",
          out_pre["verified"] is True and out_pre["checks"][0]["name"] == "sanity")
finally:
    ms.deterministic_checks = original

print(f"\n{checks - failures}/{checks} VERIFY STATE CHECKS PASSED")
if failures > 0:
    print(">>> VERIFY STATES SUITE FAILED <<<")
    sys.exit(1)
