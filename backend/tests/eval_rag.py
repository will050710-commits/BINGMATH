"""
eval_rag.py
===========
R0 of the HybridRAG plan (see DUOMATH_HYBRIDRAG_PLAN.md) - MEASURE BEFORE
CHANGING.

What this is
------------
A number-generating harness for the retrieval layer, NOT a pass/fail gate. It
answers "how good is retrieval today?" with real measured numbers, so every
later phase (R1 concept-graph extraction, R2 multi-source RRF, R3 dense ladder,
R5 data expansion) is compared against a recorded baseline instead of a guess.

Why it matters here
-------------------
The plan's own audit found the real defect is a DATA defect: the worked-example
bank is 6 rows and the concept graph is 13 nodes. Without a baseline, "the new
hybrid retriever is better" is an opinion. With one, it is a delta.

Scope of R0 - and it is deliberately narrow
-------------------------------------------
Only the WORKED-EXAMPLE source (S2, backend/math_problem_retrieval.py) owns a
real index, so only S2 is scored here. The concept graph (S1) still lives inside
main.py as a 13-node dict and is not importable from a light offline script
(importing main.py pulls FastAPI/uvicorn); R1 moves it to backend/math_concepts.py
and this file then gains an S1 section. Recording that gap IS part of the
baseline - the same way the October report recorded "the embedding half is off".

Offline by construction: no LLM call, no network, no API key, no repo writes.
The dense half of the hybrid search is switched off in production
(MATH_RETRIEVAL_EMBEDDINGS=off in render.yaml), so this measures the
configuration students actually get - the exact thing
test_math_problem_retrieval.py already pins.

Usage
-----
    python backend/tests/eval_rag.py
    python backend/tests/eval_rag.py --json tests/baseline_rag_2026-10.json
"""

import argparse
import json
import math
import os
import statistics
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND = os.path.abspath(os.path.join(_HERE, ".."))
sys.path.insert(0, _BACKEND)

from math_problem_retrieval import get_default_index  # noqa: E402

GOLDEN_SET = os.path.join(_HERE, "rag_golden_set.json")
TOP_K = 5

EXPECT_MUST_FIND = "must_find"
EXPECT_NO_EXAMPLES = "no_examples"
EXPECT_NOTHING = "nothing"

#: Short prefixes, shared with `retrieval_hybrid` (which emits `ex:`/`concept:`).
#: The golden set spells the source out in full ("examples"), so the mapping lives
#: here — one place, so a renamed prefix cannot silently zero every recall number.
SOURCE_PREFIX = {"examples": "ex", "concepts": "concept",
                 "templates": "tpl", "exam": "exam"}


def key_for(source: str, doc_id: str) -> str:
    return f"{SOURCE_PREFIX.get(source, source)}:{doc_id}"


# ── mode ─────────────────────────────────────────────────────────────────────

def resolve_mode(requested: str) -> str:
    """``auto`` | ``sparse`` | ``hybrid`` -> the two the harness can actually run.

    `sparse` is the R0 path (`ProblemIndex.search`, TF-IDF cosine) and stays
    available forever because it is the recorded baseline. `hybrid` is the R2 path
    (multi-source RRF). `auto` follows the flag, which is off by default, so an
    unconfigured run reproduces the baseline instead of silently changing it.
    """
    if requested in ("sparse", "hybrid"):
        return requested
    try:
        import retrieval_hybrid
        return "hybrid" if retrieval_hybrid.enabled() else "sparse"
    except Exception:
        return "sparse"


def rank(query: str, mode: str, index, top_k: int):
    """Normalised ranked keys, both modes in the same `source:id` namespace."""
    if mode == "hybrid":
        import retrieval_hybrid
        results = retrieval_hybrid.search(query, top_k=top_k, index=index)
        return results, [r["key"] for r in results]
    results = index.search(query, top_k=top_k)
    return results, [key_for("examples", r.get("id")) for r in results]


def expected_keys(item: dict):
    source = item.get("expected_source", "examples")
    return [key_for(source, doc_id) for doc_id in (item.get("expected_ids") or [])]


# ── metrics ──────────────────────────────────────────────────────────────────

def first_hit_rank(ranked, expected):
    """1-based rank of the first expected id, or 0 when none was retrieved."""
    for position, doc_id in enumerate(ranked, 1):
        if doc_id in expected:
            return position
    return 0


def recall_at(ranked, expected, k):
    if not expected:
        return None                      # negatives are not part of Recall
    return 1.0 if set(ranked[:k]) & set(expected) else 0.0


def reciprocal_rank(ranked, expected):
    if not expected:
        return None
    rank = first_hit_rank(ranked, expected)
    return 0.0 if rank == 0 else 1.0 / rank


def ndcg_at(ranked, expected, k):
    """nDCG@k with BINARY relevance and a single relevant item.

    The golden set marks "which problems a correct retriever should surface",
    not a graded ordering, so the ideal DCG is 1.0 (one relevant doc at rank 1)
    and the score collapses to a discounted-hit measure. Saying that out loud
    keeps the number honest instead of implying judge-graded relevance.
    """
    if not expected:
        return None
    rank = first_hit_rank(ranked[:k], expected)
    return 0.0 if rank == 0 else 1.0 / math.log2(rank + 1)


def percentile(values, pct):
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, int(round((pct / 100.0) * (len(ordered) - 1)))))
    return ordered[index]


def mean(values):
    clean = [v for v in values if v is not None]
    return statistics.fmean(clean) if clean else 0.0


# ── run ──────────────────────────────────────────────────────────────────────

def build_index():
    """Production configuration: whatever get_default_index() returns.

    Reusing the shared accessor instead of building a second ProblemIndex keeps
    this harness measuring the SAME object the chat path uses.
    """
    return get_default_index()


def run(golden_path=GOLDEN_SET, top_k=TOP_K, emit_json=None, mode="auto"):
    with open(golden_path, "r", encoding="utf-8") as handle:
        golden = json.load(handle)
    queries = golden["queries"]

    index = build_index()
    dense_on = getattr(index, "_doc_embeddings", None) is not None
    mode = resolve_mode(mode)

    print("=" * 78)
    print(f"DUOMATH RETRIEVAL HARNESS - mode={mode}")
    print("=" * 78)
    print(f"bank rows          : {len(index.rows)}")
    print(f"index path         : {getattr(index, 'jsonl_path', '?')}")
    print(f"dense (embeddings) : {'ON' if dense_on else 'OFF (production config)'}")
    print(f"queries            : {len(queries)}  (top_k={top_k})")
    if mode == "hybrid":
        import retrieval_hybrid
        print(f"sources            : {retrieval_hybrid.active_sources()}")
        print(f"min_overlap guard  : {retrieval_hybrid.min_overlap()}")
    print("-" * 78)
    print(f"{'id':<4} {'kind':<11} {'expect':<12} {'rank':>4} {'top-3':>24} {'ms':>7}")
    print("-" * 78)

    rows = []
    latencies = []
    for item in queries:
        query = item["query"]
        expect = item.get("expect", EXPECT_MUST_FIND)
        expected = expected_keys(item)

        started = time.perf_counter()
        results, ranked = rank(query, mode, index, top_k)
        elapsed_ms = (time.perf_counter() - started) * 1000.0
        latencies.append(elapsed_ms)

        if expect == EXPECT_MUST_FIND:
            hit_rank = first_hit_rank(ranked, expected)
            score = ndcg_at(ranked, expected, top_k)
            r1, r3, r5 = (recall_at(ranked, expected, k) for k in (1, 3, top_k))
            rr = reciprocal_rank(ranked, expected)
        else:
            hit_rank, score, r1, r3, r5, rr = 0, None, None, None, None, None

        # Violations are counted PER expectation kind, so "dragged in an unrelated
        # worked example" and "answered an off-topic question at all" stay
        # distinguishable in the report - they are different defects.
        example_keys = [k for k in ranked if k.startswith("ex:")]
        violation = ((expect == EXPECT_NOTHING and bool(ranked))
                     or (expect == EXPECT_NO_EXAMPLES and bool(example_keys)))

        print(f"{item['id']:<4} {item.get('kind', ''):<11} {expect:<12} "
              f"{(hit_rank if hit_rank else '-'):>4} "
              f"{(','.join(ranked[:3]) or '-'):>24} {elapsed_ms:>7.1f}")

        rows.append({
            "id": item["id"],
            "kind": item.get("kind", ""),
            "expect": expect,
            "query": query,
            "expected_keys": expected,
            "ranked_keys": ranked,
            "first_hit_rank": hit_rank,
            "recall@1": r1, "recall@3": r3, "recall@5": r5,
            "reciprocal_rank": rr, "ndcg@5": score,
            "sources": ([r.get("source") for r in results] if mode == "hybrid"
                        else ["examples"] * len(results)),
            "example_keys": example_keys,
            "concept_hits": [k for k in ranked if k in expected],
            "violation": bool(violation),
            "latency_ms": round(elapsed_ms, 2),
            "returned": len(results),
        })

    # ── aggregates ───────────────────────────────────────────────────────────
    recall_rows = [r for r in rows if r["expect"] == EXPECT_MUST_FIND]
    nothing_rows = [r for r in rows if r["expect"] == EXPECT_NOTHING]
    uncovered_rows = [r for r in rows if r["expect"] == EXPECT_NO_EXAMPLES]

    source_totals = {}
    for row in rows:
        for name in row["sources"]:
            source_totals[name] = source_totals.get(name, 0) + 1

    concept_total = sum(len(r["expected_keys"]) for r in uncovered_rows)
    concept_found = sum(len(r["concept_hits"]) for r in uncovered_rows)

    summary = {
        "mode": mode,
        "bank_rows": len(index.rows),
        "dense_enabled": dense_on,
        "queries_total": len(rows),
        "queries_recall": len(recall_rows),
        "queries_control": len(nothing_rows),
        "queries_uncovered": len(uncovered_rows),
        "recall@1": round(mean([r["recall@1"] for r in recall_rows]), 4),
        "recall@3": round(mean([r["recall@3"] for r in recall_rows]), 4),
        "recall@5": round(mean([r["recall@5"] for r in recall_rows]), 4),
        "mrr": round(mean([r["reciprocal_rank"] for r in recall_rows]), 4),
        "ndcg@5": round(mean([r["ndcg@5"] for r in recall_rows]), 4),
        # Two separate defects, two separate numbers.
        "false_positive_controls": sum(1 for r in nothing_rows if r["violation"]),
        "false_positive_examples": sum(1 for r in uncovered_rows if r["violation"]),
        "concept_recall_uncovered": round(concept_found / concept_total, 4) if concept_total else 0.0,
        "source_totals": dict(sorted(source_totals.items())),
        "latency_p50_ms": round(percentile(latencies, 50), 2),
        "latency_p95_ms": round(percentile(latencies, 95), 2),
    }

    # Split by query kind: this separates "the bank lacks the topic" from
    # "the lexical matcher cannot see the paraphrase" - two different fixes.
    by_kind = {}
    for kind in sorted({r["kind"] for r in rows}):
        subset = [r for r in recall_rows if r["kind"] == kind]
        if subset:
            by_kind[kind] = {
                "n": len(subset),
                "recall@3": round(mean([r["recall@3"] for r in subset]), 4),
            }

    print("-" * 78)
    print(f"[mode={mode}] Recall@1 {summary['recall@1']:.3f}   "
          f"Recall@3 {summary['recall@3']:.3f}   Recall@5 {summary['recall@5']:.3f}")
    print(f"MRR {summary['mrr']:.3f}   nDCG@5 {summary['ndcg@5']:.3f}   "
          f"latency p50 {summary['latency_p50_ms']:.1f} ms  p95 {summary['latency_p95_ms']:.1f} ms")
    print(f"false positives  off-topic {summary['false_positive_controls']}"
          f"/{len(nothing_rows)}   unrelated-example {summary['false_positive_examples']}"
          f"/{len(uncovered_rows)}")
    print(f"concept recall on uncovered queries: "
          f"{summary['concept_recall_uncovered']:.3f} ({concept_found}/{concept_total})")
    if summary["source_totals"]:
        print(f"sources used     {summary['source_totals']}")
    for kind, stats in by_kind.items():
        print(f"  by kind {kind:<11} n={stats['n']:<3} Recall@3 {stats['recall@3']:.3f}")
    print("=" * 78)

    if emit_json:
        payload = {"summary": summary, "by_kind": by_kind, "per_query": rows}
        with open(emit_json, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
        print(f"[eval_rag] wrote {emit_json}")

    return summary


def main():
    parser = argparse.ArgumentParser(description="DuoMath retrieval harness (R0 baseline / R2 hybrid)")
    parser.add_argument("--golden", default=GOLDEN_SET, help="golden-set JSON path")
    parser.add_argument("--top-k", type=int, default=TOP_K)
    parser.add_argument("--mode", default="auto", choices=("auto", "sparse", "hybrid"),
                        help="sparse = R0 TF-IDF path; hybrid = R2 multi-source RRF; "
                             "auto follows MATH_RETRIEVAL_HYBRID (off by default)")
    parser.add_argument("--json", dest="emit_json", default=None,
                        help="also write the full report to this path")
    args = parser.parse_args()
    run(golden_path=args.golden, top_k=args.top_k, emit_json=args.emit_json, mode=args.mode)
    return 0


if __name__ == "__main__":
    sys.exit(main())