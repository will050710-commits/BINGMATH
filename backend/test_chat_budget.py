"""
test_chat_budget.py
===================
Offline suite for Đợt 4H-2 — the request budgets that turned the production
"phantom CORS error" into an honest HTTP 504.

Runs with plain Python — no fastapi, no network, no `import main` — so it can
gate every push like the other offline suites (chat_budget.py is deliberately
free of fastapi imports for exactly this reason).

What is asserted:
  * the budget parser is defensive: a missing, blank, non-numeric or
    non-positive dashboard variable falls back to the default instead of
    silently disabling the guard, and every value is clamped;
  * the stage budgets COMPOSE under the whole-request bound (the invariant that
    stops the vision chain + the text model + the critic from summing past what
    the platform proxy tolerates);
  * the 504 body the middleware sends is complete and actionable;
  * main.py still WIRES all of it: the guard is registered inside CORS, each
    expensive stage is wrapped, the telemetry records which tier answered, and
    /api/health no longer claims an OCR engine that is not installed.

Run:  python backend/test_chat_budget.py
"""

import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import chat_budget as cb  # noqa: E402

checks = 0
failures = []


def check(label, condition, detail=""):
    global checks
    checks += 1
    if condition:
        print(f"  ok   {label}")
    else:
        failures.append(label)
        print(f"  FAIL {label} {detail}")


BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
with io.open(os.path.join(BACKEND_DIR, "main.py"), encoding="utf-8") as fh:
    MAIN = fh.read()

# The guards below ask "is this string ABSENT from the code?" — and the comments
# explaining these very fixes quote the old strings on purpose. Strip the notes so
# the suite tests code, not prose (same approach as the frontend .mjs guards).
_COMMENT_RE = re.compile(r"/\*[\s\S]*?\*/|(?<![:'\"`])#[^\n]*")


def strip_comments(source: str) -> str:
    return _COMMENT_RE.sub("", source)


# ── 1. the environment parser must fail safe ────────────────────────────────

def test_env_budget():
    print("\n[env_budget]")
    saved = dict(os.environ)
    try:
        os.environ.pop("DUOMATH_TEST_BUDGET", None)
        check("an unset variable uses the default", cb.env_budget("DUOMATH_TEST_BUDGET", 75.0) == 75.0)

        os.environ["DUOMATH_TEST_BUDGET"] = ""
        check("a blank variable uses the default", cb.env_budget("DUOMATH_TEST_BUDGET", 75.0) == 75.0)

        os.environ["DUOMATH_TEST_BUDGET"] = "abc"
        check("a non-numeric value uses the default (a typo must not disable the guard)",
              cb.env_budget("DUOMATH_TEST_BUDGET", 75.0) == 75.0)

        os.environ["DUOMATH_TEST_BUDGET"] = "0"
        check("0 means 'use the default', NOT 'no limit'",
              cb.env_budget("DUOMATH_TEST_BUDGET", 75.0) == 75.0)

        os.environ["DUOMATH_TEST_BUDGET"] = "-5"
        check("a negative value uses the default", cb.env_budget("DUOMATH_TEST_BUDGET", 75.0) == 75.0)

        os.environ["DUOMATH_TEST_BUDGET"] = "42.5"
        check("a valid value is honoured", cb.env_budget("DUOMATH_TEST_BUDGET", 75.0) == 42.5)

        os.environ["DUOMATH_TEST_BUDGET"] = "9999"
        check("an absurd value is clamped to the maximum",
              cb.env_budget("DUOMATH_TEST_BUDGET", 75.0, 5.0, 120.0) == 120.0)

        os.environ["DUOMATH_TEST_BUDGET"] = "0.01"
        check("a value below the floor is clamped up",
              cb.env_budget("DUOMATH_TEST_BUDGET", 75.0, 5.0, 120.0) == 5.0)
    finally:
        os.environ.clear()
        os.environ.update(saved)


# ── 2. the budgets must compose, not stack ──────────────────────────────────

def test_stage_budget():
    print("\n[StageBudget]")

    def clock_at(value):
        return lambda: value

    fresh = cb.StageBudget(75.0, clock=clock_at(1000.0), start=1000.0)
    check("a fresh request has the whole budget left", fresh.remaining() == 75.0 and not fresh.expired())
    check("a stage gets its own budget while time remains",
          fresh.clamp(cb.CHAT_VISION_BUDGET_S) == cb.CHAT_VISION_BUDGET_S,
          str(fresh.clamp(cb.CHAT_VISION_BUDGET_S)))

    late = cb.StageBudget(75.0, clock=clock_at(1060.0), start=1000.0)
    check("a slow request shrinks the NEXT stage instead of letting it stack",
          late.clamp(cb.CHAT_VISION_BUDGET_S) == 15.0, str(late.clamp(cb.CHAT_VISION_BUDGET_S)))
    check("sum of the stages can never exceed the request bound",
          late.elapsed() + late.clamp(45.0) <= 75.0 + 1e-9)

    over = cb.StageBudget(75.0, clock=clock_at(1100.0), start=1000.0)
    check("an exhausted request is reported as expired", over.expired() and over.remaining() == 0.0)
    check("clamp keeps a 0.5 s floor so a stage is never cancelled instantly",
          over.clamp(45.0) == 0.5, str(over.clamp(45.0)))
    check("a negative clock skew cannot produce negative elapsed time",
          cb.StageBudget(10.0, clock=clock_at(5.0), start=10.0).elapsed() == 0.0)

    check("the shipped request budget fits inside a proxy ceiling of ~100 s",
          5.0 <= cb.CHAT_REQUEST_TIMEOUT_S <= 100.0, str(cb.CHAT_REQUEST_TIMEOUT_S))
    check("every stage budget is smaller than the whole request",
          max(cb.CHAT_VISION_BUDGET_S, cb.CHAT_VISION_AGENT_BUDGET_S, cb.CHAT_VERIFY_BUDGET_S)
          < cb.CHAT_REQUEST_TIMEOUT_S)


# ── 3. the 504 the client actually receives ─────────────────────────────────

def test_timeout_payload():
    print("\n[timeout payload]")
    payload = cb.timeout_payload(80.24, 75.0)
    check("the body carries an error code the client can branch on", payload["error"] == "timeout")
    check("the reply is the shared Vietnamese explanation", payload["reply"] == cb.TIMEOUT_REPLY)
    check("the timings are reported rounded, for the log and for support",
          payload["elapsed_s"] == 80.2 and payload["budget_s"] == 75.0)
    check("the copy is actionable (says what the student can do)",
          "Em thử" in cb.TIMEOUT_REPLY and len(cb.TIMEOUT_REPLY) > 200)
    check("the copy is honest that it is NOT a connection failure",
          "không phải lỗi kết nối" in cb.TIMEOUT_REPLY)
    plan = cb.stage_plan()
    check("stage_plan exposes every knob /api/health reports",
          set(plan) == {"request_s", "vision_s", "vision_agent_s", "verify_s"}
          and plan["request_s"] == cb.CHAT_REQUEST_TIMEOUT_S)


# ── 4. main.py must still wire all of it ────────────────────────────────────

def test_main_py_wiring():
    print("\n[main.py wiring]")

    check("main.py imports the budget module", "import chat_budget" in MAIN)

    # Registration order decides who owns the response headers: middleware runs
    # outermost-first and add_middleware PREPENDS, so the deadline guard must be
    # registered BEFORE CORS to sit inside it and get CORS headers on its 504.
    guard_at = MAIN.find("app.add_middleware(_ChatDeadlineMiddleware)")
    cors_at = MAIN.find("    CORSMiddleware,")
    check("the deadline guard is registered before CORSMiddleware (so it is INSIDE it)",
          guard_at > -1 and cors_at > -1 and guard_at < cors_at, f"guard@{guard_at} cors@{cors_at}")
    # The body lives ABOVE the registration line, so read the class, not the add.
    guard_start = MAIN.find("class _ChatDeadlineMiddleware")
    guard_src = MAIN[guard_start:guard_at + 60] if guard_start > -1 and guard_at > guard_start else ""
    check("the guard class was found for inspection", len(guard_src) > 200, str(len(guard_src)))
    check("the guard answers 504, not 500", "status_code=504," in guard_src)
    check("the 504 body comes from the shared payload builder",
          "chat_budget.timeout_payload(" in guard_src)
    check("the guard marks the response so support can see it was a deadline kill",
          '"X-DuoMath-Timeout"' in guard_src)
    check("a deadline kill is recorded in the telemetry", 'tier="timeout"' in guard_src)
    check("the guard only touches POST /api/chat",
          'request.url.path != "/api/chat"' in guard_src)

    check("one budget object is created per request",
          "_budget = chat_budget.StageBudget(chat_budget.CHAT_REQUEST_TIMEOUT_S)" in MAIN)

    for pattern, budget, label in (
        (r"asyncio\.wait_for\(\s*math_reader\.read_consensus\(", "CHAT_VISION_BUDGET_S",
         "perception (MathReader)"),
        (r"asyncio\.wait_for\(\s*_vision_agent\.extract_with_fallback\(", "CHAT_VISION_AGENT_BUDGET_S",
         "the legacy vision agent"),
        (r"asyncio\.wait_for\(\s*math_solver\.verify_and_repair\(", "CHAT_VERIFY_BUDGET_S",
         "verification + critic"),
    ):
        match = re.search(pattern, MAIN)
        window = MAIN[match.start():match.start() + 900] if match else ""
        check(f"{label} runs under its own clamped budget",
              bool(match) and f"_budget.clamp(chat_budget.{budget})" in window, budget)

    check("the AI streaming paths no longer set a second, wildcard CORS header",
          '"Access-Control-Allow-Origin": "*"' not in strip_comments(MAIN))
    check("every streaming path is still returned (none was removed by the guard)",
          MAIN.count('media_type="text/event-stream"') >= 3,
          str(MAIN.count('media_type="text/event-stream"')))

    # Telemetry: "which tier answered" is the question the ladder needs answered.
    check("the chat telemetry row records the ANSWERING model, not the critic's",
          'model=str(_answered.get("model")' in MAIN)
    check("the answering tier is recorded on every success path",
          MAIN.count("_answered.update(provider=") >= 5, str(MAIN.count("_answered.update(provider=")))
    check("an answer with no tier recorded stays visible in the telemetry",
          '"_no_model"' in MAIN)

    # /api/health must describe reality, not aspiration.
    health = MAIN[MAIN.find('@app.get("/api/health")'):]
    next_route = health.find("@app.get", 10)     # 10 skips the decorator itself
    health = health[:next_route] if next_route > -1 else health
    health_code = strip_comments(health)         # comments quote the old strings on purpose
    check("health no longer names a text model the pipeline never calls",
          "llama-3.1-8b-instant" not in health_code)
    check("health no longer claims a local OCR engine that is not installed",
          "via local EasyOCR" not in health_code)
    check("health reports the real text ladder", '"text_tiers"' in health)
    check("health reports the real vision ladder",
          '"vision_models"' in health and "math_reader.reader_models()" in health)
    check("health reports the OCR engine and its weights directory",
          '"ocr_engine"' in health and '"ocr_model_dir"' in health)
    check("health publishes the chat budgets for on-call triage",
          bool(re.search(r'"chat_budgets_s":\s+chat_budget\.stage_plan\(\)', health)))

    check("the OCR weights path is configurable instead of a hard-coded drive",
          "EASYOCR_MODEL_DIR" in MAIN and 'model_storage_directory="D:' not in MAIN)
    check("an unusable OCR install degrades instead of crashing the boot",
          "except Exception as _e_ocr" in MAIN)


def main():
    print("=== Chat budget tests (offline) ===")
    test_env_budget()
    test_stage_budget()
    test_timeout_payload()
    test_main_py_wiring()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_CHAT_BUDGET_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
