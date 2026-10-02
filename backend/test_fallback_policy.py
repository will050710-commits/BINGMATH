"""test_fallback_policy.py — offline suite for fallback_policy (P2).

Standard library only: the module under test imports nothing else, so this
suite joins the CI offline job without adding a dependency.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import fallback_policy as fp  # noqa: E402

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


print("=== fallback_max_tokens ===")
check("a huge request is capped", fp.fallback_max_tokens(4096, 1600) == 1600)
check("a small request is left alone", fp.fallback_max_tokens(900, 1600) == 900)
check("None / 0 become the cap", fp.fallback_max_tokens(None, 1600) == 1600
      and fp.fallback_max_tokens(0, 1600) == 1600)
check("a garbage value becomes the cap", fp.fallback_max_tokens("abc", 1600) == 1600)
check("never below the floor", fp.fallback_max_tokens(10, 1600) == fp.MIN_FALLBACK_TOKENS)

print("\n=== shrink_on_tpm ===")
check("halves the answer budget", fp.shrink_on_tpm(1600) == 800)
check("never below the floor", fp.shrink_on_tpm(300) == fp.MIN_FALLBACK_TOKENS)
check("garbage is survivable", fp.shrink_on_tpm("x") == fp.MIN_FALLBACK_TOKENS)

print("\n=== trim_for_tier ===")
msgs = [{"role": "system", "content": "S"}] + [
    {"role": "user", "content": f"u{i}"} for i in range(8)]
trimmed = fp.trim_for_tier(msgs, keep_recent=4)
check("keeps the system prompt", trimmed[0]["content"] == "S")
check("keeps only the most recent turns",
      [m["content"] for m in trimmed[1:]] == ["u4", "u5", "u6", "u7"])
check("the system prompt survives an aggressive trim",
      fp.trim_for_tier(msgs, keep_recent=1)[0]["content"] == "S")
check("the kept list never contains non-dicts",
      all(isinstance(m, dict) for m in fp.trim_for_tier([None, {"role": "user", "content": "x"}, 7], 4)))
check("a missing system prompt is fine",
      len(fp.trim_for_tier([{"role": "user", "content": "hi"}], 4)) == 1)
check("empty / None history stays empty",
      fp.trim_for_tier([], 4) == [] and fp.trim_for_tier(None, 4) == [])
check("keep_recent is defensively parsed",
      len(fp.trim_for_tier(msgs, keep_recent="abc")) == 5)

print(f"\n{checks - failures}/{checks} FALLBACK POLICY CHECKS PASSED")
if failures > 0:
    print(">>> FALLBACK POLICY SUITE FAILED <<<")
    sys.exit(1)
