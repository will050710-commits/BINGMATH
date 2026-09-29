"""
diagram_complexity.py
=====================
How much work a diagram is worth, decided BEFORE the expensive stages run
(đợt 8 / 4I).

Why this module exists
----------------------
The pipeline treated every picture as equally hard. With an image, the order was
fixed and every stage ran to its own budget:

    MathReader (dual read + a crop re-read)   up to 45 s
    legacy vision agent                       up to 25 s
    KB retrieval, twice                       10 s each
    verification + critic                     up to 25 s
    ---- plus the answer itself, unbounded ----

Each stage was individually bounded (chat_budget.py) but their SUM was not the
whole request's budget, so the figure that needs the most help — a dense Olympiad
drawing with a dozen labelled points — was the one most likely to run out of
time and end in "⏳ Bài này cần nhiều thời gian hơn mức hệ thống cho phép". The
student got nothing at all, not even the problem statement the reader had
already transcribed.

The fix is to measure first. ``estimate()`` reads the structural hints the
OpenCV pass already produces (line/circle counts — they were computed and then
only pasted into the prompt as prose) and returns a tier; ``plan_for()`` turns
that tier into an explicit per-stage plan whose budgets SUM to no more than the
whole-request bound. A picture that is too expensive to read twice is read once;
a picture too expensive to read at all is handed to the downstream model with
the hint text and a "draw the essentials only" instruction.

Deliberately stdlib-only (chat_budget.py's rule) so the CI quality gate — which
installs just the light maths dependencies — can import this module and its test.
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional

# ── Thresholds ───────────────────────────────────────────────────────────────
#
# Calibrated against what the Hough pass actually returns on a page of school
# maths: `line_count_estimate` counts SEGMENTS, so one drawn side of a triangle
# is often 2-3 of them, and a text-heavy page adds a few false positives. The
# numbers below are therefore deliberately generous — the cost of calling a
# simple page "rich" is one skipped re-read, while the cost of calling a dense
# page "simple" is the timeout this module exists to prevent.
RICH_LINES = 8
RICH_CIRCLES = 3
RICH_LABELS = 8

EXTREME_LINES = 16
EXTREME_CIRCLES = 6
EXTREME_LABELS = 14

# A page whose transcription is long is usually a multi-part problem ("a) prove
# … b) calculate … c) …"), which is what makes an answer long enough to time out.
RICH_TEXT_CHARS = 900
EXTREME_TEXT_CHARS = 2200

TIERS = ("simple", "rich", "extreme")

# Seconds left on the whole request below which we stop trying to generate a
# fresh answer and reply from what has already been read (see soft_deadline_s).
SOFT_DEADLINE_S = 12.0


def _int(value: Any, default: int = 0) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError):
        return default
    return number if number > 0 else default


def estimate(cv_hints: Optional[Dict[str, Any]] = None, *,
             labels: int = 0, text_chars: int = 0) -> Dict[str, Any]:
    """Classify a diagram as ``simple`` | ``rich`` | ``extreme``.

    ``cv_hints`` is the dict ``image_preprocessing.preprocess_geometry_image``
    already returns (``line_count_estimate``, ``circle_count_estimate``, …), so
    no new detection pass is needed. ``labels`` (distinct point names the reader
    found) and ``text_chars`` (length of the transcription) are optional extras
    a caller can add once it has them.

    Returns ``{"tier": …, "reasons": [...], "signals": {...}}``. The reasons are
    part of the contract on purpose: "why was this request downgraded?" has to be
    answerable from the log line alone.
    """
    hints = cv_hints or {}
    lines = _int(hints.get("line_count_estimate"))
    circles = _int(hints.get("circle_count_estimate"))
    label_count = _int(labels)
    chars = _int(text_chars)

    signals = {
        "lines": lines,
        "circles": circles,
        "labels": label_count,
        "text_chars": chars,
        "cv_processed": bool(hints.get("cv_processed")),
    }

    reasons: List[str] = []
    tier = "simple"

    def bump(level: str, why: str) -> None:
        nonlocal tier
        if TIERS.index(level) > TIERS.index(tier):
            tier = level
        reasons.append(why)

    if lines >= EXTREME_LINES:
        bump("extreme", f"{lines} estimated line segments (>= {EXTREME_LINES})")
    elif lines >= RICH_LINES:
        bump("rich", f"{lines} estimated line segments (>= {RICH_LINES})")

    if circles >= EXTREME_CIRCLES:
        bump("extreme", f"{circles} estimated circles (>= {EXTREME_CIRCLES})")
    elif circles >= RICH_CIRCLES:
        bump("rich", f"{circles} estimated circles (>= {RICH_CIRCLES})")

    if label_count >= EXTREME_LABELS:
        bump("extreme", f"{label_count} labelled points (>= {EXTREME_LABELS})")
    elif label_count >= RICH_LABELS:
        bump("rich", f"{label_count} labelled points (>= {RICH_LABELS})")

    if chars >= EXTREME_TEXT_CHARS:
        bump("extreme", f"{chars} transcribed characters (>= {EXTREME_TEXT_CHARS})")
    elif chars >= RICH_TEXT_CHARS:
        bump("rich", f"{chars} transcribed characters (>= {RICH_TEXT_CHARS})")

    if not reasons:
        reasons.append("no structural signal exceeded the 'simple' range")
    if not signals["cv_processed"]:
        # Said out loud so a "simple" verdict from a failed CV pass is not
        # mistaken for a measured one.
        reasons.append("CV hints unavailable (classified on text length alone)")

    return {"tier": tier, "reasons": reasons, "signals": signals}

def plan_for(tier: str, total_s: Optional[float] = None) -> Dict[str, Any]:
    """Turn a tier into an explicit per-stage plan.

    Every entry is a decision the caller is expected to honour, not a
    suggestion:

      ``math_reader``       — budget for the verified reader (0 = skip it)
      ``vision_agent``      — budget for the legacy vision agent (0 = skip it)
      ``retrieval``         — budget for ONE retrieval call (both share it)
      ``verify``            — budget for the critic + repair round (0 = skip)
      ``generate``          — budget for the answer itself, network included
      ``max_tokens``        — output cap for that answer
      ``draw_hint``         — extra instruction appended to the prompt
      ``partial_ok``        — answer from what we already read if time runs out

    INVARIANT (asserted by test_diagram_complexity.py): the stage budgets sum to
    no more than ``total_s``, the whole-request bound. That sum is what used to
    exceed the bound and let the proxy kill the connection — the production
    symptom documented in chat_budget.py.
    """
    if total_s is None:
        try:
            import chat_budget
            total_s = chat_budget.CHAT_REQUEST_TIMEOUT_S
        except Exception:  # pragma: no cover — keeps this module importable alone
            total_s = 75.0
    total_s = float(total_s)
    name = tier if tier in TIERS else "simple"

    if name == "extreme":
        # The whole point: spend the budget on ONE answer rather than on three
        # attempts to read the page, and ask for a schematic drawing.
        raw = {
            "math_reader": 0.0,
            "vision_agent": 0.0,
            "retrieval": 3.0,
            "verify": 0.0,
            "generate": 0.60 * total_s,
            "max_tokens": 2048,
            "draw_hint": (
                "Hình này rất phức tạp. Vẽ LƯỢC: chỉ các đối tượng chính và các điểm "
                "có tên trong đề, bỏ nét phụ và các chi tiết trang trí; nếu một chi tiết "
                "không diễn tả được bằng bảng kind hợp lệ thì mô tả nó bằng lời thay vì "
                "thêm kind lạ."
            ),
            "partial_ok": True,
        }
    elif name == "rich":
        raw = {
            "math_reader": 0.45 * total_s,   # one read, no tiebreak re-read
            "vision_agent": 0.0,             # the reader is preferred; agent only if it fails
            "retrieval": 5.0,
            "verify": 0.10 * total_s,
            "generate": 0.50 * total_s,
            "max_tokens": 3072,
            "draw_hint": (
                "Hình có nhiều chi tiết: ưu tiên đúng các đối tượng và điểm có tên trong đề."
            ),
            "partial_ok": True,
        }
    else:
        raw = {
            "math_reader": 0.60 * total_s,
            "vision_agent": 0.33 * total_s,
            "retrieval": 10.0,
            "verify": 0.33 * total_s,
            "generate": 0.60 * total_s,
            "max_tokens": 4096,
            "draw_hint": "",
            "partial_ok": False,
        }

    # ── The sum invariant ────────────────────────────────────────────────────
    # Four stages can also run in sequence for ONE answer, so scale the four
    # budget-bearing stages down together until they fit. Equal proportional
    # scaling keeps the SHAPE of the plan (which stage gets the biggest share)
    # while guaranteeing the invariant for any configured total.
    stages = ("math_reader", "vision_agent", "retrieval", "verify", "generate")
    floor = {"math_reader": 0.0, "vision_agent": 0.0, "retrieval": 0.0,
             "verify": 0.0, "generate": 5.0}
    budgets = {stage: float(raw[stage]) for stage in stages}
    # retrieval is called twice (KB + problem bank), so it counts twice.
    weight = {"math_reader": 1, "vision_agent": 1, "retrieval": 2,
              "verify": 1, "generate": 1}

    def total_of(values: Dict[str, float]) -> float:
        return sum(values[stage] * weight[stage] for stage in stages)

    if total_of(budgets) > total_s:
        for _ in range(24):
            over = total_of(budgets)
            if over <= total_s + 1e-9:
                break
            factor = total_s / over
            for stage in stages:
                budgets[stage] = max(floor[stage], budgets[stage] * factor)
            if total_of(budgets) > total_s:
                # floors dominate: drop the optional stages outright rather than
                # leave a plan that cannot fit.
                for stage in ("vision_agent", "verify", "math_reader"):
                    if budgets[stage] > 0:
                        budgets[stage] = 0.0
                        break

    plan = {
        "tier": name,
        "total_s": round(total_s, 2),
        # FLOOR, never round up: the numbers are handed to asyncio.wait_for, and a
        # plan rounded 0.005 s upwards would sit exactly on the bound instead of
        # inside it (measured: 'rich' at 45 s came out 45.01).
        **{stage: math.floor(budgets[stage] * 100) / 100 for stage in stages},
        "max_tokens": raw["max_tokens"],
        "draw_hint": raw["draw_hint"],
        "partial_ok": raw["partial_ok"],
    }
    plan["budget_total_s"] = round(total_of(plan), 2)
    return plan


def soft_deadline_s() -> float:
    """Seconds left below which we answer from what we already read.

    A flat, small number rather than a fraction of the plan: by the time the
    clock is this low, the only thing worth doing is the local-engine answer plus
    a minimal figure, which is CPU-only and takes well under a second. Keeping it
    independent of the tier also keeps it predictable to test.
    """
    return SOFT_DEADLINE_S


def describe(tier_report: Dict[str, Any], plan: Dict[str, Any]) -> str:
    """One log line: why this tier, and what it costs."""
    return (f"complexity={tier_report.get('tier')} "
            f"signals={tier_report.get('signals')} "
            f"plan_total={plan.get('budget_total_s')}s/{plan.get('total_s')}s "
            f"reasons={' | '.join(tier_report.get('reasons') or [])}")