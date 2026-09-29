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
          set(plan) == {"request_s", "vision_s", "vision_agent_s", "verify_s",
                        "retrieval_s", "generate_s"}
          and plan["request_s"] == cb.CHAT_REQUEST_TIMEOUT_S)
    # Đợt 8 / 4I: the ANSWER itself is bounded too. Before this, generation used
    # hard-coded client timeouts while every stage around it was bounded, which is
    # how a dense diagram still outlived the request between two stages.
    check("the generation stage is budgeted as well",
          "generate_s" in plan and plan["generate_s"] == cb.CHAT_GENERATE_BUDGET_S)
    check("the generation budget is smaller than the whole request",
          cb.CHAT_GENERATE_BUDGET_S < cb.CHAT_REQUEST_TIMEOUT_S,
          f"{cb.CHAT_GENERATE_BUDGET_S} vs {cb.CHAT_REQUEST_TIMEOUT_S}")


# ── 3b. the invariant behind 4H-2b: a blocking call must not own the loop ────

def test_event_loop_liveness():
    """Why offloading matters: this IS the 502 mechanism.

    While a synchronous call runs, nothing else on the event loop progresses —
    which is how a slow retrieval became "the whole API is dead", a platform 502
    with its own HTML body, and therefore a CORS error in the browser.
    """
    print("\n[event-loop liveness]")
    import asyncio as _asyncio
    import time as _time

    def blocking(seconds):
        _time.sleep(seconds)
        return "done"

    async def ticks_while(call):
        state = {"ticks": 0, "stop": False}

        async def ticker():
            while not state["stop"]:
                state["ticks"] += 1
                await _asyncio.sleep(0.01)

        task = _asyncio.create_task(ticker())
        await call()
        state["stop"] = True
        await task
        return state["ticks"]

    async def in_loop():
        async def blocked():
            blocking(0.3)
        return await ticks_while(blocked)

    async def offloaded():
        return await ticks_while(lambda: _asyncio.to_thread(blocking, 0.3))

    stalled = _asyncio.run(in_loop())
    served = _asyncio.run(offloaded())
    check("a synchronous call inside the loop stops every other task (the 502 mechanism)",
          stalled <= 2, f"{stalled} loop turns")
    check("the same call offloaded with to_thread lets the server keep answering",
          served >= 10, f"{served} loop turns")


# ── 4b. Đợt 8 / 4I: the tiering and the generation budget are wired in ──────

def test_complexity_wiring():
    """A module that exists but is not called fixes nothing.

    Every check here is about the WIRING in main.py: the tier has to be measured
    from the CV hints, the plan has to replace the fixed per-stage budgets, the
    answer call has to be bounded, and the soft deadline has to answer with what
    the reader already produced. Each of those was the difference between "the
    student gets a partial answer" and "the student gets a timeout notice".
    """
    print("\n[complexity + generation wiring]")

    check("main.py imports the complexity module", "import diagram_complexity" in MAIN)
    check("the figure is measured BEFORE the expensive stages run",
          MAIN.index("diagram_complexity.estimate(")
          < MAIN.index("math_reader.read_consensus("))
    check("the tier is measured from the CV hints already computed",
          "diagram_complexity.estimate(_cv_hints" in MAIN)
    check("the plan is built from that tier",
          "diagram_complexity.plan_for(_tier[\"tier\"])" in MAIN)
    check("the tier and the plan are logged together (triage needs both)",
          "diagram_complexity.describe(_tier, _plan)" in MAIN)

    check("the reader runs under the PLAN's budget, not the fixed one",
          "timeout=_budget.clamp(_reader_budget)" in MAIN
          and "chat_budget.CHAT_VISION_BUDGET_S)" not in strip_comments(MAIN))
    check("the reader can be skipped entirely on an extreme figure",
          "_reader_budget > 0" in MAIN)
    check("the legacy vision agent runs under the PLAN's budget",
          "timeout=_budget.clamp(_agent_budget)" in MAIN
          and "chat_budget.CHAT_VISION_AGENT_BUDGET_S)" not in strip_comments(MAIN))
    check("the agent is skipped when the reader already transcribed the page",
          "_agent_budget > 0 and not vision_description" in MAIN)
    check("retrieval runs under the PLAN's budget",
          "timeout=_budget.clamp(_retrieval_budget)" in MAIN
          and "chat_budget.CHAT_RETRIEVAL_BUDGET_S)" not in strip_comments(MAIN))
    check("the critic runs under the PLAN's budget",
          "timeout=_budget.clamp(_verify_budget)" in MAIN)
    check("the critic can be skipped on an extreme figure",
          "_verify_budget > 0 and math_solver.should_verify(" in MAIN)

    check("the ANSWER itself is bounded by the generation budget",
          "_gen_budget = (_plan or {}).get(\"generate\")" in MAIN
          and "_gen_left = _budget.clamp(_gen_budget)" in MAIN)
    # Every streaming model call in the answer path must take the request's
    # remaining clock. A single fixed 90 s call is enough for a dense diagram to
    # outlive the whole request between two stages — the failure this removes.
    _streams = MAIN.count("client.stream(")
    check("every streaming model call in the answer path is budgeted",
          _streams >= 4 and MAIN.count("timeout=_gen_left") >= _streams,
          f"{MAIN.count('timeout=_gen_left')} budgeted of {_streams} stream calls")
    check("the Groq stream in the answer path uses the budget",
          "GROQ_BASE}/chat/completions" in MAIN and "timeout=_gen_left" in MAIN)
    check("every streaming answer call uses the budget",
          MAIN.count("timeout=_gen_left") >= 3, str(MAIN.count("timeout=_gen_left")))
    check("the schema-repair retry is bounded too",
          "timeout=_budget.clamp(_gen_budget)" in MAIN)
    check("a full-reply retry is not attempted when the clock is nearly gone",
          "_retry_worth_it = _budget.remaining() > 15.0" in MAIN)
    check("the free-tier JSON repair is skipped when the clock is nearly gone",
          "_budget.remaining() > 8.0" in MAIN)

    check("an extreme figure gets the plan's lower token cap",
          'max_tokens = (_plan or {}).get("max_tokens") or 4096' in MAIN)
    check("the plan's drawing instruction reaches the prompt",
          "_plan.get(\"draw_hint\")" in MAIN and "YÊU CẦU RIÊNG CHO HÌNH NÀY" in MAIN)

    check("the soft deadline answers from what was already read",
          "diagram_complexity.soft_deadline_s()" in MAIN
          and "_budget.remaining() <= diagram_complexity.soft_deadline_s()" in MAIN)
    check("the partial answer is labelled as partial for the client",
          '"partial": True' in MAIN)
    check("the partial answer says what it read",
          "Đề bài mình đọc được" in MAIN)
    check("the partial answer is reachable, not dead code",
          MAIN.index("soft_deadline_s()") < MAIN.index("if use_stream:"))
    check("a soft-deadline answer is recorded in the telemetry",
          'tier="soft_deadline"' in MAIN)
    # The soft-deadline branch answers BEFORE the model ladder runs, so every name
    # it touches must already exist at that point. `_answered` did not — it was
    # initialised further down, inside the ladder — which is a NameError the first
    # time a dense figure actually reached the branch. This is the regression guard
    # for that ordering.
    _partial_at = MAIN.index("_partial_note = \"\"")
    check("every name the soft-deadline branch uses is initialised before it",
          MAIN.index('_answered = {"provider": "", "model": ""}') < _partial_at,
          "_answered is assigned after the partial-answer branch")
    check("the cost plan is initialised for TEXT-only requests too",
          MAIN.index("_plan = None") < _partial_at,
          "_plan is only assigned inside the image branch")
    check("the tier is initialised for TEXT-only requests too",
          MAIN.index("_tier = None") < _partial_at)
    for _name in ("_t0 = time.time()", "_widget = detect_widget(", "_budget = chat_budget.StageBudget(",
                  "history = ensure_session("):
        check(f"'{_name.split()[0]}' is initialised before the soft-deadline branch",
              MAIN.index(_name) < _partial_at, _name)
    check("the per-answer log line now reports the complexity tier",
          'complexity={(_plan or {}).get(\'tier\') or \'text\'}' in MAIN)

    # The plan must not be able to exceed the request bound it is derived from.
    import diagram_complexity as dc
    for tier in dc.TIERS:
        plan = dc.plan_for(tier, total_s=cb.CHAT_REQUEST_TIMEOUT_S)
        spent = (plan["math_reader"] + plan["vision_agent"] + plan["verify"]
                 + plan["generate"] + 2 * plan["retrieval"])
        check(f"the shipped '{tier}' plan fits inside CHAT_REQUEST_TIMEOUT_S",
              spent <= cb.CHAT_REQUEST_TIMEOUT_S + 1e-6,
              f"{spent:.2f} > {cb.CHAT_REQUEST_TIMEOUT_S}")


# ── 5. main.py must still wire all of it ────────────────────────────────────

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

    # Each expensive stage is still wrapped in `_budget.clamp(...)` — but since đợt
    # 8 / 4I the number comes from the COST PLAN for this figure rather than the
    # fixed module constant, so the stages cannot sum past the request bound. The
    # fixed constants remain the fallback when there is no image to measure.
    for pattern, budget, label in (
        (r"asyncio\.wait_for\(\s*math_reader\.read_consensus\(", "_reader_budget",
         "perception (MathReader)"),
        (r"asyncio\.wait_for\(\s*_vision_agent\.extract_with_fallback\(", "_agent_budget",
         "the legacy vision agent"),
        (r"asyncio\.wait_for\(\s*math_solver\.verify_and_repair\(", "_verify_budget",
         "verification + critic"),
    ):
        match = re.search(pattern, MAIN)
        window = MAIN[match.start():match.start() + 900] if match else ""
        check(f"{label} runs under its own clamped budget",
              bool(match) and f"_budget.clamp({budget})" in window, budget)

    # The three stage budgets must be ASSIGNED (from the plan, with the fixed
    # constant as the no-image fallback) rather than hard-coded at the call site.
    for stage, constant in (("_reader_budget", "CHAT_VISION_BUDGET_S"),
                            ("_agent_budget", "CHAT_VISION_AGENT_BUDGET_S"),
                            ("_retrieval_budget", "CHAT_RETRIEVAL_BUDGET_S"),
                            ("_verify_budget", "CHAT_VERIFY_BUDGET_S")):
        check(f"{stage} is assigned, and falls back to {constant} without a plan",
              f"{stage} = " in MAIN and f"if _plan else chat_budget.{constant}" in MAIN)

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

    # Đợt 4H-2b: the CPU-bound half of the pipeline must not own the event loop.
    check("the knowledge-base call is offloaded to a thread",
          "asyncio.to_thread(retrieve_math_context, user_message)" in MAIN)
    check("the problem-bank (embedding) call is offloaded too",
          "asyncio.to_thread(retrieve_similar_problems, user_message, 2)" in MAIN)
    check("both retrieval calls are bounded by the plan's retrieval budget",
          MAIN.count("timeout=_budget.clamp(_retrieval_budget)") >= 2,
          str(MAIN.count("timeout=_budget.clamp(_retrieval_budget)")) + " of 2")
    check("image preprocessing (PIL/CLAHE) is offloaded",
          "asyncio.to_thread(\n                preprocess_image_b64" in MAIN)
    check("the OpenCV hint pass is offloaded",
          "asyncio.to_thread(preprocess_geometry_image, _raw_img_bytes)" in MAIN)
    check("no CPU-bound stage was left running inside the loop",
          "retrieved_kb = retrieve_math_context(" not in MAIN
          and "= preprocess_image_b64(raw_b64, with_grid=" not in MAIN)
    check("retrieval is optional, so its timeout only drops the reference block",
          'retrieved_kb = ""' in MAIN and 'retrieved_examples = ""' in MAIN)

    # Torch is what made the instance stop answering at all — keep it out.
    reqs = io.open(os.path.join(BACKEND_DIR, "requirements.txt"), encoding="utf-8").read()
    check("sentence-transformers (torch, ~2 GB) is out of the production requirements",
          "sentence-transformers" not in strip_comments(reqs))
    check("it survives as a documented optional extra",
          os.path.exists(os.path.join(BACKEND_DIR, "requirements-retrieval.txt")))
    render = io.open(os.path.join(BACKEND_DIR, "render.yaml"), encoding="utf-8").read()
    check("production switches the dense retrieval path off",
          re.search(r'MATH_RETRIEVAL_EMBEDDINGS\s*\n\s*value:\s*"off"', render) is not None)
    retrieval = io.open(os.path.join(BACKEND_DIR, "math_problem_retrieval.py"), encoding="utf-8").read()
    check("the gate lives in the retrieval module",
          "def embeddings_disabled()" in retrieval and "MATH_RETRIEVAL_EMBEDDINGS" in retrieval)
    check("the gate cannot break the test-injected embedder",
          retrieval.index("if self._encode_fn is not None:")
          < retrieval.index("if embeddings_disabled():"))

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
    test_event_loop_liveness()
    test_complexity_wiring()
    test_main_py_wiring()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_CHAT_BUDGET_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
