"""
test_math_problem_retrieval.py
=================================
Unit tests for the hybrid (TF-IDF + embedding, via Reciprocal Rank Fusion)
worked-example retriever.

Real embedding inference isn't testable in a network-free sandbox (no
sentence-transformers install, no model download) — those parts are
covered by injecting a fake encode_fn via EmbeddingBackend, which tests
the ACTUAL retrieval/fusion logic without needing the real neural network.
Test 1 additionally proves the real-world no-package path degrades safely.
"""

import sys, os
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from math_problem_retrieval import ProblemIndex, EmbeddingBackend, format_as_few_shot, _reciprocal_rank_fusion

SAMPLE_PATH = os.path.join(os.path.dirname(__file__), "data", "math_problems.jsonl")


def test_retrieval():
    print("=== TESTING HYBRID MATH PROBLEM RETRIEVAL ===")

    # 1. Real-world default: sentence-transformers not installed/no network
    #    -> must degrade to TF-IDF-only, not crash, and match v1 behavior.
    idx = ProblemIndex(SAMPLE_PATH)
    assert len(idx.rows) > 0
    assert idx.embedding_backend.available is False
    assert idx._doc_embeddings is None
    res = idx.search("tam giác nhọn trực tâm H đường cao vuông góc", top_k=3)
    ids = {r["id"] for r in res}
    assert "p1" in ids and not ids & {"p4", "p5"}
    print("[OK] Missing embedding package degrades safely to TF-IDF-only (unchanged v1 behavior)")

    res2 = idx.search("giải phương trình bậc hai delta nghiệm", top_k=3)
    assert "p4" in {r["id"] for r in res2}
    assert idx.search("dự báo thời tiết ngày mai") == []
    res3 = idx.search("tam giác", top_k=5, topic_filter="algebra")
    assert all(r["topic"] == "algebra" for r in res3)
    print("[OK] Topic discrimination, no-match handling, and topic_filter still correct in fallback mode")

    # 2. RRF fusion math: a doc ranked well in BOTH lists beats one ranked
    #    only in a single list, which beats one ranked poorly in one list.
    fused = _reciprocal_rank_fusion([["a", "b", "c"], ["b", "a", "d"]], k=60)
    assert fused["a"] > fused["c"] > 0
    assert fused["a"] > fused["d"]
    print(f"[OK] RRF fusion prioritizes docs strong across multiple rankings: {fused}")

    # 3. Dense pathway works end-to-end, isolated from TF-IDF entirely: a
    #    query with ZERO shared vocabulary with any document (TF-IDF score
    #    is provably 0 for everything) still returns the dense-matched doc.
    zero_overlap_query = "zzqx wwvbn plarm noctu vindar"
    assert idx._tfidf_scores(zero_overlap_query) == {}

    def fake_encode(texts):
        return np.array([[0.0, 1.0]] * len(texts), dtype=np.float32)

    mock_idx = ProblemIndex(SAMPLE_PATH, embedding_backend=EmbeddingBackend(encode_fn=fake_encode))
    p3_row_idx = [r["id"] for r in mock_idx.rows].index("p3")
    mock_idx._doc_embeddings[:] = [0.0, 1.0]
    mock_idx._doc_embeddings[p3_row_idx] = [1.0, 0.0]
    # Force the query embedding to match p3's boosted direction specifically.
    mock_idx.embedding_backend._encode_fn = lambda texts: np.array([[1.0, 0.0]] * len(texts), dtype=np.float32)

    dense_only_result = mock_idx.search(zero_overlap_query, top_k=3, min_score=0.5)
    assert [r["id"] for r in dense_only_result] == ["p3"]
    print("[OK] Dense signal independently surfaces a match when TF-IDF has literally zero signal")

    # 4. format_as_few_shot unaffected by the hybrid change.
    assert format_as_few_shot([]) == ""
    long_text = format_as_few_shot([{"problem": "P", "solution": "S" * 1000, "source": "t"}], max_solution_chars=20)
    assert "[...]" in long_text
    print("[OK] format_as_few_shot still handles empty input and truncation correctly")

    print("\n>>> ALL HYBRID RETRIEVAL TESTS PASSED! <<<")


if __name__ == "__main__":
    test_retrieval()
