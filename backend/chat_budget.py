"""Phase 4 / Đợt 4H-2 — wall-clock budgets for one /api/chat request.

Why this exists (production, 2026-09-28):

    POST /api/chat from https://duomath.vercel.app failed in the browser with
    ERR_FAILED plus a *phantom* CORS error ("No 'Access-Control-Allow-Origin'
    header is present"), even though the preflight OPTIONS from that exact
    origin answered 200 with the correct ACAO header and an unlisted origin was
    still rejected. The allowlist was never the problem: the request produced no
    app-level response at all. When a proxy gives up on a long request it tears
    the socket down before any header arrives, and that is indistinguishable
    from a CORS failure in DevTools.

The fix has two halves, and this module holds the numbers for both:

* an upper bound on time-to-first-byte (``CHAT_REQUEST_TIMEOUT_S``) enforced by a
  middleware in main.py, so a stalled pipeline answers 504 JSON *inside*
  CORSMiddleware — the browser then reports "504" instead of "CORS";
* per-stage budgets (``CHAT_VISION_BUDGET_S``, ``CHAT_VISION_AGENT_BUDGET_S``,
  ``CHAT_VERIFY_BUDGET_S``) so the stages that make up the pipeline can never
  sum past the whole-request bound. Each stage degrades on its own: a slow
  perception pass falls back to the legacy vision path, and a slow critic ships
  the answer with the honest "chưa kiểm chứng" label instead of losing the work.

Kept free of fastapi/starlette imports ON PURPOSE: the CI quality gate installs
only the light maths dependencies, so this file (and its test) must be importable
with the standard library alone. main.py does the wiring.
"""
from __future__ import annotations

import os
import time
from typing import Callable, Dict


def env_budget(name: str, default: float, minimum: float = 1.0,
               maximum: float = 600.0) -> float:
    """Read a seconds-budget from the environment, defensively.

    Unset, blank, non-numeric and non-positive values all fall back to
    ``default`` — a typo in a dashboard variable must not silently disable the
    guard (``0`` is *not* "no limit" here) — and the result is clamped to
    ``[minimum, maximum]`` so one bad value cannot make the pipeline unbounded
    or kill every request instantly.
    """
    raw = os.environ.get(name)
    if raw is None or str(raw).strip() == "":
        return float(default)
    try:
        value = float(str(raw).strip())
    except (TypeError, ValueError):
        return float(default)
    if value <= 0:
        return float(default)
    return float(max(minimum, min(maximum, value)))


# Whole-request bound on time-to-first-byte. Sits below the platform proxy's
# own ceiling (Render terminates a request that outlives ~100 s), which is the
# whole point: we want to answer before the socket is taken away from us.
CHAT_REQUEST_TIMEOUT_S = env_budget("CHAT_REQUEST_TIMEOUT_S", 75.0, 5.0, 120.0)
# Extended timeout for heavy image recognition or geometry visualization requests
CHAT_REQUEST_TIMEOUT_EXTENDED_S = env_budget("CHAT_REQUEST_TIMEOUT_EXTENDED_S", 140.0, 10.0, 300.0)
CHAT_VISION_EXTENDED_BUDGET_S = env_budget("CHAT_VISION_EXTENDED_BUDGET_S", 60.0, 5.0, 120.0)
CHAT_GENERATE_EXTENDED_BUDGET_S = env_budget("CHAT_GENERATE_EXTENDED_BUDGET_S", 60.0, 5.0, 120.0)
CHAT_GEN_MODEL_EXTENDED_TIMEOUT_S = env_budget("CHAT_GEN_MODEL_EXTENDED_TIMEOUT_S", 50.0, 5.0, 120.0)
# Verified MathReader (1-2 vision models + a SymPy gate + a possible crop
# re-read). Generous on purpose: on timeout the legacy vision path still runs,
# so a slow reader costs quality, never the answer.
CHAT_VISION_BUDGET_S = env_budget("CHAT_VISION_BUDGET_S", 45.0, 5.0, 90.0)
# Single legacy vision-agent call (OpenRouter vision ladder).
CHAT_VISION_AGENT_BUDGET_S = env_budget("CHAT_VISION_AGENT_BUDGET_S", 25.0, 5.0, 90.0)
# Deterministic checks + cross-family critic + at most one repair round.
CHAT_VERIFY_BUDGET_S = env_budget("CHAT_VERIFY_BUDGET_S", 25.0, 5.0, 90.0)
# P16-fix (2026-10-06): on an EXTENDED request (image / geometry, whole-request
# bound 140 s) the critic is given more room. Live QA showed the free-tier critic
# never finished inside 25 s, so every numeric answer shipped with the "chưa kịp
# kiểm chứng" label even though the request still had >60 s of headroom. This is
# only a FLOOR: the per-stage clamp in chat() still caps it by what is left, so
# the sum invariant (stages ≤ whole-request bound) is preserved.
CHAT_VERIFY_EXTENDED_BUDGET_S = env_budget("CHAT_VERIFY_EXTENDED_BUDGET_S", 45.0, 5.0, 120.0)
# Đợt 8 / 4I — the ANSWER itself, network included. This was the one hole left:
# every stage around it was bounded, but generation used hard-coded client
# timeouts (90 s for a Gemini stream, 60 s for OpenRouter, 30 s for each retry),
# so a dense diagram could still outlive the request between two stages and die
# with no answer at all. Anything that calls a model now takes
# min(this budget, what is left of the request).
CHAT_GENERATE_BUDGET_S = env_budget("CHAT_GENERATE_BUDGET_S", 40.0, 5.0, 90.0)
# Đợt canvas-libraries follow-up (P1) — the SAME invariant at TIER level.
# Đợt 8 / 4I bounded the answer stage as a whole, but every provider call
# INSIDE it kept a fixed timeout (15 s per Gemini tool round, 30 s per Groq
# model, 90 s for the OpenRouter helper), so one unresponsive provider could
# still burn the whole request before a fallback ever ran — the local
# olympiad-image tests showed exactly that (two Gemini attempts × ~40 s, then
# a Groq answer arriving after the deadline had already fired).
#   * CHAT_GEN_MODEL_TIMEOUT_S — ceiling for ONE model call / tool round;
#   * CHAT_GEN_RETRY_S         — ceiling for the no-tools retry of one call;
#   * CHAT_TIER_MIN_S          — never START a new model/tier with less than
#                                this much of the request left (skip ahead, or
#                                land on the local MathGPT floor).
CHAT_GEN_MODEL_TIMEOUT_S = env_budget("CHAT_GEN_MODEL_TIMEOUT_S", 22.0, 5.0, 90.0)
CHAT_GEN_RETRY_S = env_budget("CHAT_GEN_RETRY_S", 15.0, 5.0, 60.0)
CHAT_TIER_MIN_S = env_budget("CHAT_TIER_MIN_S", 12.0, 3.0, 60.0)
# P1b (live-report follow-up): ALWAYS leave this much for the local MathGPT
# floor. The ladder is only useful if it stops in time for the one tier that
# cannot fail — without the floor, two slow Gemini attempts (22 s cap + 15 s
# retry each) consumed the whole 75 s request and the student got a 504 even
# though an instant local answer was one step away. Raised to 10 s by P1d: the
# post-generation stages (verification, telemetry, response assembly) still run
# AFTER the reply exists, and a 3 s cushion lost the race with the deadline
# middleware twice in a row during the live tests.
CHAT_LOCAL_FLOOR_S = env_budget("CHAT_LOCAL_FLOOR_S", 10.0, 3.0, 30.0)


def env_int(name: str, default: int, minimum: int, maximum: int) -> int:
    """Integer sibling of ``env_budget`` — identical fail-safe rules."""
    return int(env_budget(name, float(default), float(minimum), float(maximum)))


# Đợt canvas-libraries follow-up (P2): the Groq free tier rejects a request
# whose input + max_tokens crosses its per-minute token budget ("Request too
# large for model …") — which is what every image request hit once the vision
# text made the prompt long. The fallback tiers are the safety net, not the
# showpiece, so they answer with a trimmed context and a capped answer length.
CHAT_FALLBACK_MAX_TOKENS = env_int("CHAT_FALLBACK_MAX_TOKENS", 1600, 256, 8192)
CHAT_FALLBACK_KEEP_MESSAGES = env_int("CHAT_FALLBACK_KEEP_MESSAGES", 4, 1, 12)
# Knowledge-base / problem-bank retrieval (Đợt 4H-2b). It is CPU-bound and runs in
# a thread, and the answer is still useful without the reference block — so this
# budget decides only how long we WAIT for retrieval, never whether we answer.
CHAT_RETRIEVAL_BUDGET_S = env_budget("CHAT_RETRIEVAL_BUDGET_S", 10.0, 1.0, 30.0)

# Shown when the request outlives its budget. Deliberately actionable (what the
# student can do next) and honest (it does NOT pretend the answer failed).
TIMEOUT_REPLY = (
    "⏳ Bài này cần nhiều thời gian hơn mức hệ thống cho phép nên mình chưa trả lời xong được.\n\n"
    "Em thử một trong các cách sau nhé:\n"
    "• Chụp/gửi lại ảnh đề rõ hơn (ánh sáng đủ, không bị nghiêng, chỉ 1 bài mỗi ảnh)\n"
    "• Hoặc gõ lại đề ngắn gọn bằng chữ\n"
    "• Hoặc tách thành từng câu nhỏ để hỏi lần lượt\n\n"
    "Đây là lỗi thời gian xử lý, không phải lỗi kết nối của em."
)


class StageBudget:
    """Wall-clock budget shared by the stages of one request.

    ``clamp`` is how the per-stage budgets compose: no single stage may take
    longer than what is left of the whole request, so the stages can never sum
    past ``total``. The clock is injectable, which is what makes this testable
    without sleeping in CI.
    """

    __slots__ = ("total", "_clock", "_start")

    def __init__(self, total: float, clock: Callable[[], float] = time.monotonic,
                 start: float | None = None) -> None:
        self.total = float(total)
        self._clock = clock
        self._start = self._clock() if start is None else float(start)

    def elapsed(self) -> float:
        return max(0.0, self._clock() - self._start)

    def remaining(self) -> float:
        return max(0.0, self.total - self.elapsed())

    def expired(self) -> bool:
        return self.remaining() <= 0.0

    def clamp(self, budget: float) -> float:
        """The smaller of ``budget`` and what is left, never below 0.5 s.

        A tiny floor matters: ``asyncio.wait_for(..., timeout=0)`` would cancel
        the stage immediately and turn "little time left" into "never try".
        """
        left = self.remaining()
        if left <= 0.0:
            return 0.5
        return float(max(0.5, min(float(budget), left)))


def timeout_payload(elapsed_s: float = 0.0, budget_s: float = 0.0) -> Dict[str, object]:
    """JSON body for the deadline middleware's 504 (keys match chat errors)."""
    return {
        "error": "timeout",
        "reply": TIMEOUT_REPLY,
        "elapsed_s": round(float(elapsed_s or 0.0), 1),
        "budget_s": round(float(budget_s or 0.0), 1),
    }


def stage_plan() -> Dict[str, float]:
    """The active budgets, exposed by /api/health for on-call triage."""
    return {
        "request_s": CHAT_REQUEST_TIMEOUT_S,
        "vision_s": CHAT_VISION_BUDGET_S,
        "vision_agent_s": CHAT_VISION_AGENT_BUDGET_S,
        "verify_s": CHAT_VERIFY_BUDGET_S,
        "retrieval_s": CHAT_RETRIEVAL_BUDGET_S,
        "generate_s": CHAT_GENERATE_BUDGET_S,
        # P1/P2 — per-tier clamps and the fallback payload cap.
        "gen_model_s": CHAT_GEN_MODEL_TIMEOUT_S,
        "gen_retry_s": CHAT_GEN_RETRY_S,
        "tier_min_s": CHAT_TIER_MIN_S,
        "local_floor_s": CHAT_LOCAL_FLOOR_S,
        "fallback_max_tokens": CHAT_FALLBACK_MAX_TOKENS,
    }
