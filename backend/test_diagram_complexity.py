"""
test_diagram_complexity.py
==========================
Đợt 8 / 4I — the tiering that keeps a dense diagram from eating the whole
request budget.

The incident this locks down: every stage of the image pipeline was bounded on
its own (chat_budget.py) but their SUM was not, so a picture with a dozen
labelled points could spend 45 s reading, 25 s on the legacy agent, 20 s on
retrieval and 25 s on the critic — and then be killed by the deadline middleware
with "⏳ Bài này cần nhiều thời gian hơn mức hệ thống cho phép" and NOTHING
answered, not even the problem statement the reader had already transcribed.

Run:  python backend/test_diagram_complexity.py
"""

import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import diagram_complexity as dc

FAILED = []


def check(label, condition, detail=""):
    if condition:
        print(f"  [OK] {label}")
    else:
        FAILED.append(label)
        print(f"  [FAIL] {label} {detail}")


# ── 1. estimate() ────────────────────────────────────────────────────────────

def test_estimate():
    print("\n[estimate]")

    plain = dc.estimate({"line_count_estimate": 4, "circle_count_estimate": 0,
                         "cv_processed": True})
    check("a sparse figure is 'simple'", plain["tier"] == "simple", plain["tier"])
    check("a 'simple' verdict still explains itself", plain["reasons"])

    dense = dc.estimate({"line_count_estimate": 24, "circle_count_estimate": 7,
                         "cv_processed": True})
    check("a dense figure is 'extreme'", dense["tier"] == "extreme", dense["tier"])
    check("the reason names the signal that decided it",
          any("line segments" in r for r in dense["reasons"]), str(dense["reasons"]))

    medium = dc.estimate({"line_count_estimate": 10, "circle_count_estimate": 3,
                          "cv_processed": True})
    check("a mid-density figure is 'rich'", medium["tier"] == "rich", medium["tier"])

    circles_only = dc.estimate({"line_count_estimate": 1, "circle_count_estimate": 6,
                                "cv_processed": True})
    check("circles alone can push a figure to 'extreme'",
          circles_only["tier"] == "extreme", circles_only["tier"])

    check("a dozen-plus labelled points reaches 'extreme'",
          dc.estimate({"cv_processed": True}, labels=15)["tier"] == "extreme")
    check("a long multi-part transcription reaches 'extreme'",
          dc.estimate({"cv_processed": True}, text_chars=2500)["tier"] == "extreme")

    check("boundary values are inclusive, not off-by-one",
          dc.estimate({"line_count_estimate": dc.EXTREME_LINES - 1,
                       "cv_processed": True})["tier"] == "rich"
          and dc.estimate({"line_count_estimate": dc.EXTREME_LINES,
                           "cv_processed": True})["tier"] == "extreme")

    blind = dc.estimate({}, text_chars=10)
    check("a failed CV pass is admitted, not hidden",
          any("CV hints unavailable" in r for r in blind["reasons"]), str(blind["reasons"]))
    check("garbage input cannot crash the classifier",
          dc.estimate({"line_count_estimate": "many",
                       "circle_count_estimate": None})["tier"] == "simple")
    check("a missing hints dict is fine (text-only requests)",
          dc.estimate(None)["tier"] == "simple")


STAGES = ("math_reader", "vision_agent", "retrieval", "verify", "generate")


def spent_of(plan):
    """What a plan costs: retrieval runs TWICE per request (KB + problem bank)."""
    return (plan["math_reader"] + plan["vision_agent"] + plan["verify"]
            + plan["generate"] + 2 * plan["retrieval"])


# ── 2. plan_for() — the sum invariant ────────────────────────────────────────

def test_plan():
    print("\n[plan_for]")

    for tier in dc.TIERS:
        plan = dc.plan_for(tier, total_s=75.0)
        spent = spent_of(plan)
        check(f"'{tier}': the stage budgets sum to no more than the request bound",
              spent <= 75.0 + 1e-6, f"{spent:.2f}s > 75s")
        check(f"'{tier}': every stage is present in the plan",
              all(stage in plan for stage in STAGES))
        check(f"'{tier}': the reported total matches the stages",
              abs(plan["budget_total_s"] - spent) < 0.02,
              f"{plan['budget_total_s']} vs {spent:.2f}")

    # The invariant must hold for ANY configured total, including small ones.
    for total in (30.0, 45.0, 60.0, 90.0, 120.0):
        for tier in dc.TIERS:
            plan = dc.plan_for(tier, total_s=total)
            check(f"'{tier}' at {total:.0f}s: still within the bound",
                  spent_of(plan) <= total + 1e-6, f"{spent_of(plan):.2f} > {total}")

    extreme = dc.plan_for("extreme", total_s=75.0)
    check("'extreme' skips BOTH expensive vision stages",
          extreme["math_reader"] == 0.0 and extreme["vision_agent"] == 0.0,
          f"reader={extreme['math_reader']} agent={extreme['vision_agent']}")
    check("'extreme' skips the critic", extreme["verify"] == 0.0)
    check("'extreme' still leaves the answer most of the time",
          extreme["generate"] >= 0.45 * 75.0, str(extreme["generate"]))
    check("'extreme' asks for a schematic drawing",
          "Vẽ LƯỢC" in extreme["draw_hint"] and "kind lạ" in extreme["draw_hint"])
    check("'extreme' lowers the output cap",
          extreme["max_tokens"] < dc.plan_for("simple", 75.0)["max_tokens"])
    check("'extreme' declares that a partial answer is acceptable",
          extreme["partial_ok"] is True)

    rich = dc.plan_for("rich", total_s=75.0)
    check("'rich' keeps one reader but drops the legacy agent",
          rich["math_reader"] > 0 and rich["vision_agent"] == 0.0,
          f"reader={rich['math_reader']} agent={rich['vision_agent']}")
    check("'rich' keeps a (shorter) critic", 0 < rich["verify"] < 20.0, str(rich["verify"]))
    check("'rich' shortens retrieval too", rich["retrieval"] < 10.0)

    simple = dc.plan_for("simple", total_s=75.0)
    check("'simple' keeps every stage on (nothing is given up for an easy figure)",
          all(simple[stage] > 0 for stage in STAGES),
          str({stage: simple[stage] for stage in STAGES}))
    check("'simple' keeps the full token budget", simple["max_tokens"] == 4096)
    check("'simple' asks for no special drawing",
          simple["draw_hint"] == "" and simple["partial_ok"] is False)

    check("an unknown tier falls back to 'simple' rather than throwing",
          dc.plan_for("banana", total_s=75.0)["tier"] == "simple")

    tight = dc.plan_for("simple", total_s=20.0)
    check("a very small request budget still yields a fitting plan",
          spent_of(tight) <= 20.0 + 1e-6, f"{spent_of(tight):.2f} > 20")

    check("the plan follows the CONFIGURED request budget, not a hard-coded number",
          dc.plan_for("simple")["total_s"] > 0)
    check("plan_for is deterministic",
          dc.plan_for("rich", 75.0) == dc.plan_for("rich", 75.0))


# ── 3. describe() / soft_deadline_s() ────────────────────────────────────────

def test_reporting():
    print("\n[reporting]")
    report = dc.estimate({"line_count_estimate": 20, "cv_processed": True})
    plan = dc.plan_for(report["tier"], total_s=75.0)
    line = dc.describe(report, plan)
    check("the log line carries the tier", "complexity=extreme" in line, line)
    check("the log line carries the measured signals", "lines" in line, line)
    check("the log line carries both the plan total and the bound",
          "plan_total=" in line and "/75.0s" in line, line)
    check("the log line carries WHY", "line segments" in line, line)

    check("the soft deadline is small enough to leave room for a real reply",
          0 < dc.soft_deadline_s() <= 20.0, str(dc.soft_deadline_s()))
    check("the soft deadline stays well under the tightest stage budget",
          dc.soft_deadline_s() < dc.plan_for("extreme", 75.0)["generate"])


if __name__ == "__main__":
    test_estimate()
    test_plan()
    test_reporting()
    if FAILED:
        print(f"\n>>> {len(FAILED)} DIAGRAM COMPLEXITY CHECKS FAILED: {FAILED} <<<")
        sys.exit(1)
    print("\n>>> ALL DIAGRAM COMPLEXITY TESTS PASSED! <<<")