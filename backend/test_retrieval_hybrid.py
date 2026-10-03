"""
test_retrieval_hybrid.py
========================
R2 of DUOMATH_HYBRIDRAG_PLAN.md — the multi-source fusion layer, and the two
defects it exists to fix.

What is asserted
----------------
1. **Off by default.** `MATH_RETRIEVAL_HYBRID` unset (or misspelled, or blank)
   means the sparse R0 path, unchanged. Turning the flag on is the only way to get
   the new behaviour — that is what makes one-line rollback real.
2. **The false positives are gone, on the measured evidence.** R0 returned a worked
   example for BOTH off-topic controls and for the uncovered integral query. R2
   returns nothing for the controls and no EXAMPLE for the uncovered one, while
   still returning the concepts that are actually on topic.
3. **The cost is recorded, not hidden.** Q11 loses its worked example: its only
   lexical link to the right document is a single generic token ("tìm"), and a
   diagnostic over the whole golden set showed a strict superset of lexical
   evidence for the two false positives. `test_the_lexical_ceiling_is_pinned`
   asserts that the sparse scorer DID have a candidate there and the GUARD removed
   it, so nobody can "fix" recall later by quietly loosening the guard without
   this test failing first.
4. **Deterministic output.** Two processes with different PYTHONHASHSEED must rank
   identically, otherwise every before/after number is noise (the lesson R1 had to
   learn for the graph renderer).
5. **Ties favour the more specific evidence.** A concept match is a keyword hit and
   is always available; a worked example only survives the overlap guard when the
   query really is about it.
6. **Unavailable sources are a no-op.** `templates` needs a registry that does not
   exist yet; asking for it must not raise and must not silently pretend.
7. **This module never imports main.py** (it binds DB tables and provider clients
   at import time), which is what lets the CI job run it at all.

Run:  python backend/test_retrieval_hybrid.py
"""

import io
import json
import os
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import retrieval_hybrid as rh  # noqa: E402
from math_problem_retrieval import (  # noqa: E402
    _reciprocal_rank_fusion,
    get_default_index,
)

GOLDEN_PATH = os.path.join(HERE, "tests", "rag_golden_set.json")

#: The three golden queries the guard exists for, plus the paraphrase whose worked
#: example the guard costs. Spelling them out keeps the intent readable.
CONTROL_OFFTOPIC = "cách nấu phở bò ngon tại nhà"
CONTROL_OFFTOPIC_2 = "dự báo thời tiết ngày mai"
UNCOVERED = "tính tích phân bất định của sin bình phương x"
LEXICAL_CEILING = "tìm cực đại của một parabol bằng cách đưa về bình phương đủ"

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


class env_var:
    """Set/restore one environment variable, so a test cannot leak into the next."""

    def __init__(self, name, value):
        self.name = name
        self.value = value

    def __enter__(self):
        self.old = os.environ.get(self.name)
        if self.value is None:
            os.environ.pop(self.name, None)
        else:
            os.environ[self.name] = self.value
        return self

    def __exit__(self, *exc):
        if self.old is None:
            os.environ.pop(self.name, None)
        else:
            os.environ[self.name] = self.old
        return False


with io.open(GOLDEN_PATH, encoding="utf-8") as fh:
    GOLDEN = json.load(fh)
QUERIES = GOLDEN["queries"]


# ── 1. defaults and env robustness ───────────────────────────────────────────

def test_defaults():
    print("\n[defaults] off unless explicitly on, and a typo cannot enable it")
    with env_var("MATH_RETRIEVAL_HYBRID", None):
        check("unset -> disabled", rh.enabled() is False)
    with env_var("MATH_RETRIEVAL_HYBRID", ""):
        check("blank -> disabled", rh.enabled() is False)
    with env_var("MATH_RETRIEVAL_HYBRID", "of"):          # typo
        check("a typo ('of') -> disabled, not enabled by accident", rh.enabled() is False)
    with env_var("MATH_RETRIEVAL_HYBRID", "off"):
        check("'off' -> disabled", rh.enabled() is False)
    with env_var("MATH_RETRIEVAL_HYBRID", "on"):
        check("'on' -> enabled", rh.enabled() is True)
    with env_var("MATH_RETRIEVAL_HYBRID", "1"):
        check("'1' -> enabled", rh.enabled() is True)

    with env_var("MATH_RETRIEVAL_BM25", None):
        check("BM25 off by default", rh.bm25_enabled() is False)
    with env_var("MATH_RETRIEVAL_BM25", "on"):
        check("BM25 can be switched on", rh.bm25_enabled() is True)

    with env_var("MATH_RETRIEVAL_MIN_OVERLAP", None):
        check("min_overlap defaults to 2", rh.min_overlap() == 2)
    with env_var("MATH_RETRIEVAL_MIN_OVERLAP", "abc"):
        check("a non-numeric min_overlap falls back to 2", rh.min_overlap() == 2)
    with env_var("MATH_RETRIEVAL_MIN_OVERLAP", "0"):
        check("min_overlap is clamped to >= 1 (0 would disable the guard)",
              rh.min_overlap() == 1)
    with env_var("MATH_RETRIEVAL_MIN_OVERLAP", "99"):
        check("min_overlap is clamped at the top too", rh.min_overlap() <= 10)


def test_sources_feature_detect():
    print("\n[sources] unavailable sources are dropped, never an error")
    with env_var("MATH_RETRIEVAL_SOURCES", None):
        check("default sources are concepts + examples",
              rh.active_sources() == ["concepts", "examples"])
    with env_var("MATH_RETRIEVAL_SOURCES", "nonsense"):
        check("an unknown source name is dropped", rh.active_sources() == [])
    with env_var("MATH_RETRIEVAL_SOURCES", "templates,exam,concepts"):
        got = rh.active_sources()
        check("a not-yet-implemented source is dropped, and no exception is raised",
              "concepts" in got and "templates" not in got)
    with env_var("MATH_RETRIEVAL_SOURCES", "examples,examples"):
        check("duplicates collapse", rh.active_sources().count("examples") == 1)
    with env_var("MATH_RETRIEVAL_SOURCES", " EXAMPLES "):
        check("names are trimmed and lower-cased", rh.active_sources() == ["examples"])
    with env_var("MATH_RETRIEVAL_SOURCES", ""):
        check("an empty list means no source, not a crash",
              rh.search(LEXICAL_CEILING, sources=rh.active_sources()) == [])


# ── 2. the guard and the two defects it removes ──────────────────────────────

def test_guard_removes_false_positives():
    print("\n[guard] the two R0 false positives, and the uncovered query")
    for label, query in (("off-topic (phở)", CONTROL_OFFTOPIC),
                         ("off-topic (weather)", CONTROL_OFFTOPIC_2)):
        res = rh.search(query, top_k=5)
        check(f"{label}: no result at all", res == [], str([r['key'] for r in res]))

    res = rh.search(UNCOVERED, top_k=5)
    keys = [r["key"] for r in res]
    check("uncovered (integral of sin^2 x): NO worked example is dragged in",
          not [k for k in keys if k.startswith("ex:")], str(keys))
    check("uncovered: the on-topic concepts ARE returned",
          {"concept:tich_phan", "concept:ham_so_luong_giac"} <= set(keys), str(keys))

    # Why they were dropped: not an empty index, the overlap guard.
    index = get_default_index()
    check("the sparse scorer still HAS candidates for the off-topic query (so the "
          "guard - not an empty index - is what removed them)",
          bool(index._tfidf_scores(CONTROL_OFFTOPIC)))
    check("...and the guard reports zero overlap with every one of them",
          rh.example_ranking(CONTROL_OFFTOPIC) == [])
    check("a Vietnamese function word ('tại') is not content",
          "tại" in rh.FUNCTION_WORDS and "tại" not in rh.content_tokens("tại sao"))
    check("function words are removed from the document side too",
          "tại" not in rh.content_tokens("Cho tam giác ABC vuông tại A"))


def test_the_lexical_ceiling_is_pinned():
    print("\n[ceiling] the recall this guard costs is recorded, not hidden")
    index = get_default_index()
    ranked_all = index.search(LEXICAL_CEILING, top_k=5)
    check("the sparse path DOES see a candidate for the paraphrase query",
          len(ranked_all) > 0, str(len(ranked_all)))
    check("...and the guard removes it (single shared token, below MIN_OVERLAP)",
          rh.example_ranking(LEXICAL_CEILING) == [])

    res = rh.search(LEXICAL_CEILING, top_k=5)
    keys = [r["key"] for r in res]
    check("the fusion still answers: the matching CONCEPT is returned",
          keys == ["concept:cuc_tri"], str(keys))
    check("which is the concept whose keyword actually appears in the query",
          rh.math_concepts.match_details(LEXICAL_CEILING)[0]["token"] == "cực đại")

    # Pin the exact threshold so loosening it is a deliberate, visible change.
    check("MIN_OVERLAP default is 2 (1 would re-admit both measured false positives)",
          rh.DEFAULT_MIN_OVERLAP == 2)


# ── 3. ranking quality: ties, determinism, counts ────────────────────────────

def test_tie_break_prefers_specific_evidence():
    print("\n[tie-break] an exact worked example outranks the general concept")
    q = "Giải phương trình bậc hai x^2 - 5x + 6 = 0"
    slots = rh.search(q, top_k=5)
    keys = [r["key"] for r in slots]
    check("the worked example of that exact equation is first", keys[0] == "ex:p4", str(keys))
    check("the general concept is still present, just after it",
          "concept:phuong_trinh_bac_hai" in keys, str(keys))
    check("the two sources really do tie (otherwise the tie-break is not what decided)",
          len({r["fused"] for r in slots
               if r["key"] in ("ex:p4", "concept:phuong_trinh_bac_hai")}) == 1)
    check("source_counts reports where each hit came from",
          rh.source_counts(slots) == {"examples": 1, "concepts": 1},
          str(rh.source_counts(slots)))


DETERMINISM_PROBE = r'''
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import retrieval_hybrid as rh
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "tests", "rag_golden_set.json"), encoding="utf-8") as fh:
    queries = json.load(fh)["queries"]
out = {q["id"]: [r["key"] for r in rh.search(q["query"], top_k=5)] for q in queries}
sys.stdout.write(json.dumps(out, ensure_ascii=True))
'''


def test_determinism():
    print("\n[determinism] another process, another hash seed, same ranking")
    probe = os.path.join(HERE, "_probe_hybrid_determinism.py")
    env = dict(os.environ, PYTHONHASHSEED="424242", PYTHONIOENCODING="utf-8")
    local = {q["id"]: [r["key"] for r in rh.search(q["query"], top_k=5)] for q in QUERIES}
    try:
        with io.open(probe, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(DETERMINISM_PROBE)
        run = subprocess.run([sys.executable, "-B", probe], capture_output=True,
                             text=True, encoding="utf-8", errors="replace", env=env)
        check("the child process ran", run.returncode == 0, (run.stderr or "")[-300:])
        if run.returncode == 0:
            child = json.loads(run.stdout.strip())
            differing = [qid for qid in local if child.get(qid) != local[qid]]
            check(f"all {len(QUERIES)} golden queries rank identically in both processes",
                  not differing, str(differing[:3]))
    finally:
        if os.path.exists(probe):
            os.remove(probe)


def test_golden_set_totals():
    print("\n[golden] the fusion's own false-positive totals over the whole set")
    violations, no_examples, found_all = [], [], 0
    must_find = 0
    for item in QUERIES:
        ranked = [r["key"] for r in rh.search(item["query"], top_k=5)]
        expect = item.get("expect", "must_find")
        if expect == "nothing":
            if ranked:
                violations.append(item["id"])
        elif expect == "no_examples":
            no_examples.append(item["id"])
            if [k for k in ranked if k.startswith("ex:")]:
                violations.append(item["id"])
        else:
            must_find += 1
            prefix = "ex" if item.get("expected_source", "examples") == "examples" else "concept"
            expected = {f"{prefix}:{i}" for i in item["expected_ids"]}
            if expected & set(ranked[:3]):
                found_all += 1
            elif item["id"] != "Q11":          # Q11 is the pinned lexical ceiling
                violations.append(item["id"])
    check("0 off-topic or unrelated-example violations", not violations, str(violations))
    check(f"{found_all}/{must_find} recall queries hit within top-3 "
          f"(Q11 is the pinned ceiling, expected to miss)",
          found_all == must_find - 1, f"{found_all} of {must_find}")
    check("the golden set still contains the uncovered query the split introduced",
          len(no_examples) == 1)


# ── 4. BM25 (opt-in) ─────────────────────────────────────────────────────────

def test_bm25():
    print("\n[bm25] available, length-normalised, and inert unless enabled")
    index = get_default_index()
    probe = "Giải phương trình bậc hai x^2 - 5x + 6 = 0"
    scores = index._bm25_scores(probe)
    check("BM25 returns a positive score for a real match", bool(scores))
    check("BM25 is not an alias of TF-IDF (a separate scorer)",
          scores != index._tfidf_scores(probe))
    check("every BM25 idf is strictly positive (a term in most documents must not "
          "score negative)", all(v > 0 for v in index._bm25_idf.values()))
    check("BM25 is reproducible for the same query",
          index._bm25_scores("tam giác") == index._bm25_scores("tam giác"))

    with env_var("MATH_RETRIEVAL_BM25", "off"):
        off = [r["key"] for r in rh.search("tam giác nhọn trực tâm", top_k=3)]
    with env_var("MATH_RETRIEVAL_BM25", "on"):
        on = [r["key"] for r in rh.search("tam giác nhọn trực tâm", top_k=3)]
    check("turning BM25 on does not break the ordering contract",
          bool(on) and bool(off), f"{off} vs {on}")
    check("the top hit is stable across scorers on a clear query",
          off[0] == on[0], f"{off} vs {on}")


# ── 5. module hygiene ────────────────────────────────────────────────────────

def test_module_hygiene():
    print("\n[hygiene] importable in CI, one copy of the fusion maths")
    check("importing this module did NOT pull in main.py", "main" not in sys.modules)
    import math_problem_retrieval as mpr
    check("RRF is reused from math_problem_retrieval, not reimplemented",
          rh._reciprocal_rank_fusion is mpr._reciprocal_rank_fusion)
    check("the tokenizer is reused too (one vocabulary, not two)",
          rh._tokenize is mpr._tokenize)
    check("the RRF damping constant matches the sparse retriever's default",
          rh.RRF_K == 60)
    src = io.open(os.path.join(HERE, "retrieval_hybrid.py"), encoding="utf-8").read()
    check("no import of main anywhere in the module source", "import main" not in src)


# ── run ──────────────────────────────────────────────────────────────────────

def main():
    test_defaults()
    test_sources_feature_detect()
    test_guard_removes_false_positives()
    test_the_lexical_ceiling_is_pinned()
    test_tie_break_prefers_specific_evidence()
    test_determinism()
    test_golden_set_totals()
    test_bm25()
    test_module_hygiene()

    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED:")
        for name in failures:
            print(f"  - {name}")
        return 1
    print("ALL_RETRIEVAL_HYBRID_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())