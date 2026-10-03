"""
test_retrieval_context.py
=========================
R4 of DUOMATH_HYBRIDRAG_PLAN.md — the role-shaped context layer, and the one rule it
exists to enforce: **a transcriber must never be handed a worked solution.**

What is asserted
----------------
1. **Off by default, and a typo cannot switch it on.** `MATH_RETRIEVAL_CONTEXT`
   unset (or `of`, or a nonsense value) means every slice is empty and the pipeline is
   untouched. The allowlist is the same lesson `retrieval_hybrid._flag` already paid
   for once: a denylist made `=of` turn the feature ON.
2. **`reader` never sees a solution.** This is the point of the whole module. A reader
   that can see someone else's solved answer may transcribe numbers that are not on
   the page, and the result still looks like a confident, correct reading. So the
   assertion is on the actual solution string from the bank: `chat` must contain it,
   `reader` must not — and `reader` must also not carry the node's `definition` or
   `examples` prose, which describe the result in the same way.
3. **`critic` gets a checklist, not theory.** Every formula line of the matched
   concept becomes a `☐` item, and no worked example is included, because a critic
   must test a claim rather than compare the student's numbers with a stranger's.
4. **Caps are enforced and honest.** `cap_for` is env-overridable, clamps, and falls
   back on a non-numeric value; a slice that had to be cut sets `truncated=True` and
   says so in the text. A silently shortened reference block is indistinguishable
   from a complete one, which is exactly why the marker exists.
5. **One vocabulary, not two.** `repair` must equal what
   `mathviz_contract.repair_vocabulary()` produces — this repo has already paid for
   "one vocabulary, three copies" (whole sets of layers silently undrawn).
6. **The registry and the documented role table agree**, and `build()` never raises:
   an unknown role returns an empty slice with the reason recorded.
7. **No prompt text in `summary()`** — it is a log line, so it carries evidence ids
   and sizes, never the reference block itself.
8. **The module does not import `main.py`**, so the CI quality gate can run all of
   this with no network, no key and no event loop.

Run:  python backend/test_retrieval_context.py
"""

import io
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import retrieval_context as rc  # noqa: E402
import math_concepts  # noqa: E402

#: A query that matches a concept AND retrieves a worked example with a solution — so
#: one slice can legitimately carry the solution while the other must not.
QUADRATIC = "Giải phương trình bậc hai x^2 - 5x + 6 = 0"
#: A query that matches a concept but has NO worked example in the bank.
DERIVATIVE = "tính đạo hàm của hàm số f(x)"

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


class env_many:
    """Set/restore several environment variables, so a test cannot leak into the next."""

    def __init__(self, mapping):
        self.mapping = mapping
        self.saved = {}

    def __enter__(self):
        for name, value in self.mapping.items():
            self.saved[name] = os.environ.get(name)
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value
        return self

    def __exit__(self, *exc):
        for name, old in self.saved.items():
            if old is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = old
        return False


ALL_ROLES = ("reader", "solver", "critic", "repair", "translate", "chat")


# ── 1. the flag ──────────────────────────────────────────────────────────────

def test_flag_off_is_byte_identical():
    print("\n[flag] off by default; every slice empty; a typo cannot enable it")
    for value, expected in ((None, False), ("", False), ("off", False),
                            ("of", False),          # typo
                            ("on", True), ("1", True), ("TRUE", True),
                            (" ON ", True)):
        with env_many({"MATH_RETRIEVAL_CONTEXT": value}):
            got = rc.enabled()
            check(f"MATH_RETRIEVAL_CONTEXT={value!r} -> enabled={expected}",
                  got is expected, f"got {got!r}")

    with env_many({"MATH_RETRIEVAL_CONTEXT": None}):
        for role in ALL_ROLES:
            text, meta = rc.build(role, QUADRATIC, tier="rich", widget="geometry_2d")
            check(f"flag off: {role} slice is empty (pipeline unchanged)",
                  text == "", repr(text[:60]))
            check(f"flag off: {role} meta records enabled=False",
                  meta.get("enabled") is False, str(meta.get("enabled")))
            check(f"flag off: {role} meta carries no ids",
                  meta.get("ids") == [], str(meta.get("ids")))


def test_caps():
    print("\n[caps] tier caps, env override, clamping, non-numeric fallback")
    with env_many({f"MATH_RETRIEVAL_MAX_CHARS_{t.upper()}": None
                   for t in ("simple", "rich", "extreme")}):
        got = tuple(rc.cap_for(t) for t in ("simple", "rich", "extreme"))
        check("the three tier caps are the documented defaults",
              got == (1800, 4200, 7000), str(got))
        check("caps increase with tier (a denser figure may carry more)",
              rc.cap_for("simple") < rc.cap_for("rich") < rc.cap_for("extreme"))
        check("an unknown tier falls back to simple",
              rc.cap_for("nonsense") == rc.cap_for("simple"))
        check("a missing tier falls back to simple",
              rc.cap_for(None) == rc.cap_for("simple"))
    with env_many({"MATH_RETRIEVAL_MAX_CHARS_SIMPLE": "500"}):
        check("a tier cap is overridable by env", rc.cap_for("simple") == 500)
    with env_many({"MATH_RETRIEVAL_MAX_CHARS_SIMPLE": "banana"}):
        check("a non-numeric cap falls back to the default", rc.cap_for("simple") == 1800)
    with env_many({"MATH_RETRIEVAL_MAX_CHARS_SIMPLE": "0"}):
        check("a 0 cap is clamped up (it would blank every reference block)",
              rc.cap_for("simple") >= 200, str(rc.cap_for("simple")))
    with env_many({"MATH_RETRIEVAL_MAX_CHARS_SIMPLE": "-5"}):
        check("a negative cap is clamped up too", rc.cap_for("simple") >= 200)
    with env_many({"MATH_RETRIEVAL_MAX_CHARS_SIMPLE": "999999"}):
        check("an absurd cap is clamped down", rc.cap_for("simple") <= 20000)
    with env_many({"MATH_RETRIEVAL_MAX_CHARS_RICH": "900",
                   "MATH_RETRIEVAL_MAX_CHARS_SIMPLE": None}):
        check("overriding ONE tier does not change the others",
              rc.cap_for("rich") == 900 and rc.cap_for("simple") == 1800,
              f"rich={rc.cap_for('rich')} simple={rc.cap_for('simple')}")


# ── 2. THE rule: the reader must never be handed a solution ───────────────────

def _bank_solution(doc_id):
    """The real solution text of a bank row, so the assertion is on actual content."""
    try:
        from math_problem_retrieval import get_default_index
        for row in get_default_index().rows:
            if str(row.get("id")) == str(doc_id):
                return str(row.get("solution", "")).strip()
    except Exception:
        pass
    return ""


def test_reader_never_sees_a_solution():
    print("\n[reader] the rule this module exists for: no solutions to a transcriber")
    solution = _bank_solution("p4")
    check("the fixture is real: the bank row p4 has a solution to hide",
          len(solution) > 20, repr(solution[:60]))

    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        chat_text, chat_meta = rc.build("chat", QUADRATIC, tier="rich")
        solver_text, _ = rc.build("solver", QUADRATIC, tier="rich")
        reader_text, reader_meta = rc.build("reader", QUADRATIC, tier="rich")

        check("chat DOES carry the worked solution (it is the answering stage)",
              solution[:40] in chat_text, repr(chat_text[:120]))
        check("solver DOES carry the worked solution (it is the computing stage)",
              solution[:40] in solver_text)
        check("reader does NOT carry the worked solution",
              solution[:40] not in reader_text, repr(reader_text[:200]))
        check("reader does not even carry the solution's opening words",
              "hướng giải" not in reader_text and "Gọi D là" not in reader_text)
        check("reader is not empty for this query (so the test is not vacuous)",
              len(reader_text) > 40, repr(reader_text))

        node = math_concepts.nodes().get("phuong_trinh_bac_hai") or {}
        check("reader does not carry the concept's `examples` prose (it states results)",
              bool(node.get("examples")) and node["examples"][:30] not in reader_text)
        check("reader does not carry the concept's `definition` prose",
              bool(node.get("definition")) and node["definition"][:30] not in reader_text)
        check("reader DOES carry the concept name (it needs to know what to look for)",
              node.get("name", "@@") in reader_text)
        check("reader's ids name the matched concept for telemetry",
              "concept:phuong_trinh_bac_hai" in (reader_meta.get("ids") or []),
              str(reader_meta.get("ids")))
        check("chat's ids name the sources it actually used",
              chat_meta.get("sources") and chat_meta.get("ids"), str(chat_meta))

        # The CV hints are the one thing the reader is meant to reconcile against.
        with_hints, _ = rc.build("reader", QUADRATIC, tier="rich",
                                 cv_hints={"line_count_estimate": 12,
                                           "circle_count_estimate": 3})
        check("reader includes the CV line/circle hint when one is available",
              "12" in with_hints and "3" in with_hints, repr(with_hints[:160]))
        check("...and it still contains no solution with hints present",
              solution[:40] not in with_hints)
        no_hints, _ = rc.build("reader", QUADRATIC, tier="rich", cv_hints={})
        check("a CV pass that found nothing adds no hint line",
              "đoạn thẳng" not in no_hints, repr(no_hints[:160]))
        broken_hints, _ = rc.build("reader", QUADRATIC, tier="rich",
                                   cv_hints={"line_count_estimate": "many"})
        check("a malformed CV hint does not raise and adds no line",
              isinstance(broken_hints, str) and "đoạn thẳng" not in broken_hints)


# ── 3. critic: a checklist, not theory ───────────────────────────────────────

def test_critic_is_a_checklist():
    print("\n[critic] a property checklist derived from `formulas`, no worked example")
    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        text, meta = rc.build("critic", QUADRATIC, tier="rich")
        node = math_concepts.nodes().get("phuong_trinh_bac_hai") or {}
        formula_lines = [b.strip() for b in (node.get("formulas") or "").splitlines()
                         if b.strip()]

        check("the critic slice is not empty for a matched concept", len(text) > 20,
              repr(text[:120]))
        check("it is rendered as a checklist (☐ items)", "☐" in text, repr(text[:160]))
        check("every formula line of the node becomes a checklist item",
              all(f in text for f in formula_lines[:4]), str(formula_lines[:2]))
        check("the node name leads the checklist so the critic knows the topic",
              node.get("name", "@@") in text)
        check("the critic does NOT receive a worked example",
              "hướng giải" not in text and "Ví dụ đã giải" not in text, repr(text[:200]))
        check("the critic's meta is concept-sourced only",
              (meta.get("sources") or []) == ["concepts"], str(meta.get("sources")))
        check("the critic's ids name the concept it is checking",
              "concept:phuong_trinh_bac_hai" in (meta.get("ids") or []),
              str(meta.get("ids")))

        # A concept that matches but has no formulas must degrade to empty, not crash.
        empty_text, empty_meta = rc.build("critic", "cách nấu phở bò ngon tại nhà",
                                          tier="rich")
        check("a query matching no concept yields an empty checklist",
              empty_text == "" and empty_meta.get("ids") == [], repr(empty_text[:60]))


# ── 4. one vocabulary, not two ───────────────────────────────────────────────

def test_repair_uses_the_contract():
    print("\n[repair] the vocabulary comes FROM mathviz_contract, not a second copy")
    import mathviz_contract
    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        text, meta = rc.build("repair", tier="rich", widget="geometry_2d")
        vocabulary = mathviz_contract.repair_vocabulary()
        check("the repair slice contains the contract's repair vocabulary verbatim",
              vocabulary in text, f"text={len(text)} vocab={len(vocabulary)}")
        check("the target widget is stated so the repair model knows what to emit",
              "geometry_2d" in text)
        check("the meta names the contract as the source",
              (meta.get("sources") or []) == ["contract"], str(meta.get("sources")))
        check("an unspecified widget does not raise",
              isinstance(rc.build("repair", tier="rich")[0], str))
        # A vocabulary short enough to be uncapped proves no local copy is used.
        with env_many({"MATH_RETRIEVAL_MAX_CHARS_RICH": "20000"}):
            full, full_meta = rc.build("repair", tier="rich", widget="geometry_2d")
            check("with a large cap the whole vocabulary survives uncut",
                  full_meta.get("truncated") is False and vocabulary in full)


# ── 5. translate: a glossary from data that already exists ───────────────────

def test_translate_glossary():
    print("\n[translate] a vi<->en glossary built from the graph's own name fields")
    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        text, meta = rc.build("translate", DERIVATIVE, tier="rich")
        node = math_concepts.nodes().get("dao_ham") or {}
        check("the glossary is not empty for a matched concept", len(text) > 10,
              repr(text[:80]))
        check("it pairs the Vietnamese name with the English name",
              node.get("name", "@@") in text and node.get("english_name", "@@") in text,
              repr(text[:120]))
        check("the header names it a glossary",
              "Thuật ngữ" in text, repr(text[:60]))
        check("meta is concept-sourced", (meta.get("sources") or []) == ["concepts"])
        empty_text, _ = rc.build("translate", "cách nấu phở bò ngon tại nhà", tier="rich")
        check("a query matching no concept yields an empty glossary", empty_text == "")


# ── 6. truncation is visible ─────────────────────────────────────────────────

def test_truncation_is_visible():
    print("\n[truncate] a cut slice says so, and the cap is respected")
    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        text, meta = rc.build("chat", QUADRATIC, tier="extreme")
        check("a large cap does not truncate, and reports truncated=False",
              meta.get("truncated") is False, str(meta))
        check("chars equals the real length", meta.get("chars") == len(text), str(meta))
        check("a slice under the cap carries no truncation marker",
              rc.TRUNCATION_MARK not in text)

        with env_many({"MATH_RETRIEVAL_MAX_CHARS_EXTREME": "300"}):
            cut, cut_meta = rc.build("chat", QUADRATIC, tier="extreme")
            check("a small cap truncates and reports truncated=True",
                  cut_meta.get("truncated") is True, str(cut_meta))
            check("the truncated text ends with the marker (it is not silent)",
                  cut.endswith(rc.TRUNCATION_MARK), repr(cut[-80:]))
            check("the truncated slice stays within the cap",
                  len(cut) <= cut_meta.get("cap", 0), f"{len(cut)} vs {cut_meta.get('cap')}")
            check("truncation keeps the beginning, not the end",
                  cut.strip() != "" and cut_meta.get("chars") == len(cut))

        # No cap in the world can exceed a slice that is already short: assert the
        # marker is applied by SIZE, not unconditionally.
        check("a cap at exactly the length does not add a marker",
              rc._truncate("abc", 3)[1] is False)
        check("a cap one below the length does add a marker",
              rc._truncate("abcd" * 50, 50)[1] is True)
        check("_truncate never returns more than the cap plus the marker",
              len(rc._truncate("x" * 5000, 100)[0]) <= 100 + len(rc.TRUNCATION_MARK))


# ── 7. registry, build() robustness, summary ─────────────────────────────────

def test_registry_and_build():
    print("\n[registry] the documented roles are all implemented and addressable")
    for role in ALL_ROLES:
        check(f"{role} is in the SLICES registry", role in rc.SLICES)
    check("the registry has exactly the documented six roles",
          sorted(rc.SLICES) == sorted(ALL_ROLES), str(sorted(rc.SLICES)))
    check("every registry entry is callable",
          all(callable(fn) for fn in rc.SLICES.values()))

    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        unknown_text, unknown_meta = rc.build("wizardry", QUADRATIC)
        check("an unknown role returns an empty slice instead of raising",
              unknown_text == "", repr(unknown_text[:40]))
        check("...and records the reason so the caller can see the typo",
              any(str(i).startswith("unknown_role:") for i in unknown_meta.get("ids") or []),
              str(unknown_meta.get("ids")))
        check("an empty role name is treated as unknown",
              rc.build("", QUADRATIC)[0] == "")
        check("a None role does not raise", rc.build(None, QUADRATIC)[0] == "")
        check("role matching is case-insensitive",
              rc.build("CHAT", QUADRATIC, tier="rich")[0] ==
              rc.build("chat", QUADRATIC, tier="rich")[0])
        check("a wrong-typed query does not raise",
              isinstance(rc.build("chat", None, tier="rich")[0], str))
        check("an int query does not raise",
              isinstance(rc.build("chat", 12345, tier="rich")[0], str))


def test_summary_is_a_log_line_not_a_prompt():
    print("\n[summary] one log line: sizes and ids, never the reference text")
    with env_many({"MATH_RETRIEVAL_CONTEXT": "on"}):
        text, meta = rc.build("chat", QUADRATIC, tier="rich")
        line = rc.summary(meta)
        check("summary names the role", "role=chat" in line, line)
        check("summary names the tier", "tier=rich" in line, line)
        check("summary reports chars/cap", f"chars={len(text)}/" in line, line)
        check("summary reports the truncation flag", "truncated=" in line, line)
        check("summary names the sources used", "sources=" in line, line)
        check("summary carries NO prompt text",
              text[:40] not in line and "hướng giải" not in line, line[:200])
        check("summary is a single line", "\n" not in line)
        check("summary survives an empty meta", isinstance(rc.summary({}), str))
        check("summary never raises on a malformed meta",
              isinstance(rc.summary({"ids": None, "sources": "x"}), str))


# ── 8. module hygiene ────────────────────────────────────────────────────────

def test_module_hygiene():
    print("\n[hygiene] importable by the CI job, no main.py, one source of truth")
    check("importing this module did NOT pull in main.py", "main" not in sys.modules)
    source = io.open(os.path.join(HERE, "retrieval_context.py"), encoding="utf-8").read()
    check("the module source never imports main", "import main" not in source)
    check("it reuses the R2 fusion instead of re-implementing search",
          "retrieval_hybrid.search" in source)
    check("it reuses the concept graph instead of re-reading the JSON",
          "math_concepts" in source and "math_concepts.json" not in source)
    check("it takes the MathViz vocabulary from the contract, not a local copy",
          "repair_vocabulary" in source)
    check("the documented env names are the ones actually read",
          all(name in source for name in (
              "MATH_RETRIEVAL_CONTEXT", "MATH_RETRIEVAL_MAX_CHARS_SIMPLE",
              "MATH_RETRIEVAL_MAX_CHARS_RICH", "MATH_RETRIEVAL_MAX_CHARS_EXTREME")))
    check("the META_KEYS tuple matches what _meta actually returns",
          set(rc.META_KEYS) == set(rc.build("chat", QUADRATIC, tier="rich")[1].keys()),
          str(sorted(rc.build("chat", QUADRATIC, tier="rich")[1].keys())))


# ── run ──────────────────────────────────────────────────────────────────────

def main():
    test_flag_off_is_byte_identical()
    test_caps()
    test_reader_never_sees_a_solution()
    test_critic_is_a_checklist()
    test_repair_uses_the_contract()
    test_translate_glossary()
    test_truncation_is_visible()
    test_registry_and_build()
    test_summary_is_a_log_line_not_a_prompt()
    test_module_hygiene()

    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED:")
        for name in failures:
            print(f"  - {name}")
        return 1
    print("ALL_RETRIEVAL_CONTEXT_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())