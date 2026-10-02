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


def run(golden_path=GOLDEN_SET, top_k=TOP_K, emit_json=None):
    with open(golden_path, "r", encoding="utf-8") as handle:
        golden = json.load(handle)
    queries = golden["queries"]

    index = build_index()
    dense_on = getattr(index, "_doc_embeddings", None) is not None

    print("=" * 78)
    print("DUOMATH RETRIEVAL BASELINE (R0) - worked-example source (S2)")
    print("=" * 78)
    print(f"bank rows          : {len(index.rows)}")
    print(f"index path         : {getattr(index, 'jsonl_path', '?')}")
    print(f"dense (embeddings) : {'ON' if dense_on else 'OFF (production config)'}")
    print(f"queries            : {len(queries)}  (top_k={top_k})")
    print("-" * 78)
    print(f"{'id':<4} {'kind':<11} {'rank':>4} {'top-3':>20} {'nDCG@5':>7} {'ms':>7}")
    print("-" * 78)

    rows = []
    latencies = []
    for item in queries:
        query = item["query"]
        expected = item.get("expected_ids") or []

        started = time.perf_counter()
        results = index.search(query, top_k=top_k)
        elapsed_ms = (time.perf_counter() - started) * 1000.0
        latencies.append(elapsed_ms)

        ranked = [r.get("id") for r in results]
        rank = first_hit_rank(ranked, expected)
        hits = ",".join(ranked[:3]) or "-"
        score = ndcg_at(ranked, expected, top_k)

        print(f"{item['id']:<4} {item.get('kind', ''):<11} "
              f"{(rank if rank else '-'):>4} {hits:>20} "
              f"{'-' if score is None else f'{score:.3f}':>7} {elapsed_ms:>7.1f}")

        rows.append({
            "id": item["id"],
            "kind": item.get("kind", ""),
            "query": query,
            "expected_ids": expected,
            "ranked_ids": ranked,
            "first_hit_rank": rank,
            "recall@1": recall_at(ranked, expected, 1),
            "recall@3": recall_at(ranked, expected, 3),
            "recall@5": recall_at(ranked, expected, top_k),
            "reciprocal_rank": reciprocal_rank(ranked, expected),
            "ndcg@5": score,
            "latency_ms": round(elapsed_ms, 2),
            "returned": len(results),
        })

    # ── aggregates ───────────────────────────────────────────────────────────
    positives = [r for r in rows if r["recall@5"] is not None]
    controls = [r for r in rows if r["recall@5"] is None]

    summary = {
        "bank_rows": len(index.rows),
        "dense_enabled": dense_on,
        "queries_total": len(rows),
        "queries_scored": len(positives),
        "queries_control": len(controls),
        "recall@1": round(mean([r["recall@1"] for r in positives]), 4),
        "recall@3": round(mean([r["recall@3"] for r in positives]), 4),
        "recall@5": round(mean([r["recall@5"] for r in positives]), 4),
        "mrr": round(mean([r["reciprocal_rank"] for r in positives]), 4),
        "ndcg@5": round(mean([r["ndcg@5"] for r in positives]), 4),
        "false_positive_controls": sum(1 for r in controls if r["returned"] > 0),
        "latency_p50_ms": round(percentile(latencies, 50), 2),
        "latency_p95_ms": round(percentile(latencies, 95), 2),
    }

    # Split by query kind: this separates "the bank lacks the topic" from
    # "the lexical matcher cannot see the paraphrase" - two different fixes.
    by_kind = {}
    for kind in sorted({r["kind"] for r in rows}):
        subset = [r for r in rows if r["kind"] == kind and r["recall@3"] is not None]
        if subset:
            by_kind[kind] = {
                "n": len(subset),
                "recall@3": round(mean([r["recall@3"] for r in subset]), 4),
            }

    print("-" * 78)
    print(f"Recall@1 {summary['recall@1']:.3f}   "
          f"Recall@3 {summary['recall@3']:.3f}   "
          f"Recall@5 {summary['recall@5']:.3f}")
    print(f"MRR      {summary['mrr']:.3f}   "
          f"nDCG@5   {summary['ndcg@5']:.3f}")
    print(f"latency  p50 {summary['latency_p50_ms']:.1f} ms   "
          f"p95 {summary['latency_p95_ms']:.1f} ms")
    print(f"false positives on {summary['queries_control']} control queries: "
          f"{summary['false_positive_controls']}")
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
    parser = argparse.ArgumentParser(description="DuoMath retrieval baseline (R0)")
    parser.add_argument("--golden", default=GOLDEN_SET, help="golden-set JSON path")
    parser.add_argument("--top-k", type=int, default=TOP_K)
    parser.add_argument("--json", dest="emit_json", default=None,
                        help="also write the full report to this path")
    args = parser.parse_args()
    run(golden_path=args.golden, top_k=args.top_k, emit_json=args.emit_json)
    return 0


if __name__ == "__main__":
    sys.exit(main())