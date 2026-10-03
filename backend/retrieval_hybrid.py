"""
retrieval_hybrid.py
===================
R2 of DUOMATH_HYBRIDRAG_PLAN.md — one ranked list out of several retrieval sources.

What it does
------------
Runs the sources that exist, turns each into its own ranking, and fuses them with
Reciprocal Rank Fusion (the same `_reciprocal_rank_fusion` the worked-example
retriever already used — reused, not reimplemented, so there is one copy of the
fusion maths). RRF is the right combiner here for the reason the original module
already documented: the sources produce scores on scales that are not comparable
(TF-IDF cosine, a keyword-strength weight), and RRF only needs the ORDER.

Sources
-------
* ``concepts`` — the knowledge graph (`math_concepts.match_details`). A name hit
  is stronger evidence than a keyword hit, so each node carries a weight by match
  reason.
* ``examples`` — the worked-example bank (`math_problem_retrieval.ProblemIndex`).
* ``templates``, ``exam`` — NOT implemented yet, and deliberately feature-detected
  rather than faked: `templates` needs `mathviz_registry.py` and `exam` needs the
  VNHSGE table. Asking for a source that is not there is a no-op, never an error.

The false-positive guard (measured, not guessed)
------------------------------------------------
R0's baseline found the sparse retriever returning a worked example for BOTH
off-topic control queries. A diagnostic over every golden query
(`docs/baseline_rag_2026-10.md` §3.2) showed why no single threshold fixes it:

    control Q14 -> p3   overlap 1 ("tại")    tfidf 0.4195
    control Q15 -> p4   overlap 1 ("phương") tfidf 0.3871
    legit   Q11 -> p5   overlap 1 ("tìm")    tfidf 0.1959   <- the TRUE answer

The false positives score HIGHER than the true answer, because with six documents
IDF is meaningless: a token in 1-of-6 docs earns a large weight whether or not it
means anything. So the guard is structural, not threshold-based:

1. Vietnamese FUNCTION WORDS are not content. "tại" alone made Q14 collide with a
   geometry problem that happens to contain the word.
2. A worked example must share at least `MIN_OVERLAP` distinct content tokens with
   the query (default 2).

Consequence, stated honestly: Q11 (a deliberately lexically-distant paraphrase)
loses its worked example under this guard. That is the known ceiling of lexical
retrieval, and it is what the dense half (R3) exists to fix — NOT something to hide
by loosening the threshold. What Q11 does get is the ``cuc_tri`` CONCEPT (its
keyword "cực đại" matches), so the reference block still carries the extrema rules.
`test_retrieval_hybrid.py` pins both facts so neither can drift silently.

Deterministic ordering
----------------------
R0 also showed RRF producing equal fused scores on a small bank, which made the
order within a tie depend on dict/insertion accident. Ties are now broken by
source priority, then by id — so the same query always yields the same list, which
is what makes a before/after comparison meaningful at all (and what R1 had to fix
in the graph renderer for the same reason).

Env (all default to current behaviour / off)
--------------------------------------------
    MATH_RETRIEVAL_HYBRID=off|on            (default off)
    MATH_RETRIEVAL_SOURCES=concepts,examples
    MATH_RETRIEVAL_MIN_OVERLAP=2
    MATH_RETRIEVAL_BM25=off|on              (see math_problem_retrieval)

Stdlib + numpy only (numpy arrives through math_problem_retrieval), so the CI
quality gate can import this module and its test.
"""

from __future__ import annotations

import os
from typing import Dict, List, Optional, Tuple

import math_concepts
from math_problem_retrieval import (
    ProblemIndex,
    _reciprocal_rank_fusion,
    _tokenize,
    get_default_index,
)

RRF_K = 60  # standard damping constant — same value the sparse retriever used

#: Vietnamese function words. A shared function word is NOT evidence that two
#: texts are about the same thing, but TF-IDF cannot know that: on a small bank a
#: rare function word gets a big IDF weight and a big cosine. Measured cause of one
#: of the two R0 false positives ("tại"). Kept separate from
#: `math_problem_retrieval._STOPWORDS` on purpose: that list feeds the index and
#: its own tested behaviour, while this one is the R2 GUARD and may grow.
FUNCTION_WORDS = {
    "tại", "và", "của", "có", "cho", "một", "các", "trong", "với", "khi", "để",
    "được", "này", "đó", "là", "hãy", "theo", "về", "từ", "đến", "bằng", "nếu",
    "thì", "mà", "như", "sau", "trước", "trên", "dưới", "giữa", "ra", "vào",
    "lên", "xuống", "cũng", "nhưng", "hoặc", "vì", "nên", "rằng", "em", "mình",
    "the", "a", "an", "of", "and", "to", "in", "is", "find", "let", "given",
}

#: How many distinct content tokens a worked example must share with the query.
#: 2 separates both measured false positives from every true positive the sparse
#: retriever can reach at all (diagnostic in the module docstring).
DEFAULT_MIN_OVERLAP = 2

#: Weight per concept match reason: a full-name hit beats an English-name hit,
#: which beats a keyword hit. Also used as the source priority when RRF ties.
CONCEPT_WEIGHTS = {"name": 1.0, "english_name": 0.85, "keyword": 0.7}

#: Which source wins a tie. Lower number = higher priority. A concept match is a
#: deliberate mention of the topic; a worked example is a similarity guess.
#: Which source wins a tie. Lower number = higher priority. Deliberately NOT the
#: same order as SOURCE_PRIORITY: when both sources are equally confident (RRF
#: gives them the same score, which happens constantly on a small bank) the more
#: SPECIFIC evidence should lead. A worked example only survives the overlap guard
#: when the query really is about it; a concept match is a keyword hit that is
#: always available. Measured: with concepts first, Q05 ("giai phuong trinh bac
#: hai x^2-5x+6=0") put the general theory above ex:p4, which IS that equation.
TIE_BREAK_PRIORITY = {"examples": 0, "dense": 1, "templates": 2, "concepts": 3, "exam": 4}

SOURCE_PRIORITY = {"concepts": 0, "dense": 1, "templates": 2, "examples": 3, "exam": 4}

_ON = {"on", "true", "1", "yes", "enable", "enabled"}
KNOWN_SOURCES = ("concepts", "dense", "examples", "templates", "exam")


def _flag(name: str, default: str = "off") -> bool:
    """Env flag, OFF unless the value is an explicit yes.

    Allowlist, not denylist — and the test suite found out why: with a denylist
    ("anything that is not `off` is on") the typo `MATH_RETRIEVAL_HYBRID=of` ENABLED
    the feature. For a switch whose whole job is "off by default, one env line to
    roll back", a misspelling has to fail closed.
    """
    raw = os.environ.get(name)
    if raw is None or not str(raw).strip():
        return default.strip().lower() in _ON
    return str(raw).strip().lower() in _ON


def _int_env(name: str, default: int, minimum: int = 1, maximum: int = 10) -> int:
    raw = os.environ.get(name)
    if raw is None or str(raw).strip() == "":
        return default
    try:
        value = int(str(raw).strip())
    except (TypeError, ValueError):
        return default
    return max(minimum, min(maximum, value))


def enabled() -> bool:
    """MATH_RETRIEVAL_HYBRID — off means callers use the sparse path unchanged."""
    return _flag("MATH_RETRIEVAL_HYBRID", "off")


def min_overlap() -> int:
    return _int_env("MATH_RETRIEVAL_MIN_OVERLAP", DEFAULT_MIN_OVERLAP)


def bm25_enabled() -> bool:
    """MATH_RETRIEVAL_BM25 — length-normalised scoring instead of TF-IDF cosine.

    Off by default: the measured bottleneck on the current 6-row bank is data, not
    the scoring function, so switching everyone over would be churn without
    evidence. It is here, tested, for when the bank grows (R5).
    """
    return _flag("MATH_RETRIEVAL_BM25", "off")


def _templates_available() -> bool:
    """`templates` needs the MathViz template registry, which does not exist yet."""
    try:
        import mathviz_registry  # noqa: F401
        return True
    except Exception:
        return False


def _exam_available() -> bool:
    """`exam` needs the VNHSGE question table; the module may exist without it."""
    try:
        import vnhsge_bank  # noqa: F401
        return True
    except Exception:
        return False


def dense_enabled() -> bool:
    """MATH_RETRIEVAL_DENSE names a provider it knows (off by default)."""
    try:
        import retrieval_dense
        return retrieval_dense.enabled()
    except Exception:
        return False


def _dense_available() -> bool:
    """`dense` needs the flag AND a key for the chosen provider.

    `retrieval_dense.available()` owns both checks, so this module never has to
    know which env name holds which key. Imported lazily: the module reaches for
    httpx, and a missing httpx must degrade to "no dense source", not to an
    ImportError that takes the whole retriever down.
    """
    try:
        import retrieval_dense
        return retrieval_dense.available()
    except Exception:
        return False


def active_sources() -> List[str]:
    """Requested sources that actually exist, in declaration order.

    Unknown or unavailable sources are DROPPED, never an error: asking for one that
    is not implemented is a no-op, so R2 ships without waiting on another plan. The
    DEFAULT list grows by itself when dense retrieval is switched on, so enabling R3
    is one env line (`MATH_RETRIEVAL_DENSE=gemini`) and never has to be accompanied
    by a second one that somebody will forget.
    """
    default = "concepts,dense,examples" if _dense_available() else "concepts,examples"
    raw = os.environ.get("MATH_RETRIEVAL_SOURCES", default)
    wanted = [s.strip().lower() for s in raw.split(",") if s.strip()]
    out: List[str] = []
    for name in wanted:
        if name not in KNOWN_SOURCES or name in out:
            continue
        if name == "templates" and not _templates_available():
            continue
        if name == "exam" and not _exam_available():
            continue
        if name == "dense" and not _dense_available():
            continue
        out.append(name)
    return sorted(out, key=lambda s: SOURCE_PRIORITY.get(s, 99))


def content_tokens(text: str) -> set:
    """Query/document tokens with the Vietnamese function words removed."""
    return {t for t in _tokenize(text) if t not in FUNCTION_WORDS}


# ── source rankings ──────────────────────────────────────────────────────────

def concept_ranking(query: str) -> List[Tuple[str, float, dict]]:
    """(key, weight, meta) per matched concept, weight by match reason.

    Keyed `concept:<node_id>` so a concept and a worked example can never collide
    in the fused list, and so the source is readable in a log line or a test.
    """
    out: List[Tuple[str, float, dict]] = []
    for detail in math_concepts.match_details(query):
        node_id = detail["id"]
        out.append((
            f"concept:{node_id}",
            CONCEPT_WEIGHTS.get(detail["reason"], 0.5),
            {"node_id": node_id, "reason": detail["reason"], "token": detail["token"]},
        ))
    return out


def example_ranking(query: str, index: Optional[ProblemIndex] = None,
                    top_n: int = 20) -> List[Tuple[str, float, dict]]:
    """(key, tfidf, meta) per worked example that clears the overlap guard.

    The guard is the R2 false-positive fix; see the module docstring for the
    measurement that chose `MIN_OVERLAP`. `meta["shared"]` keeps the evidence, so a
    test (and a future reranker) can see WHY a document survived.
    """
    index = index or get_default_index()
    qtokens = content_tokens(query)
    # BM25 scores are unbounded, TF-IDF ones are a cosine in 0..1. The order is
    # what RRF consumes, and the overlap guard is what keeps precision honest, so
    # either scorer is safe here — but `raw_score` is telemetry, not a threshold,
    # which is why nothing downstream compares it against a fixed number.
    scores = (index._bm25_scores(query) if bm25_enabled()
              else index._tfidf_scores(query))
    if not scores:
        return []

    need = min_overlap()
    kept: List[Tuple[str, float, dict]] = []
    for row_index, score in scores.items():
        row = index.rows[row_index] if row_index < len(index.rows) else None
        if row is None:
            continue
        shared = sorted(qtokens & content_tokens(
            f"{row.get('problem', '')} {row.get('topic', '')}"))
        if len(shared) < need:
            continue
        doc_id = row.get("id") or str(row_index)
        kept.append((
            f"ex:{doc_id}", float(score),
            {"doc_id": doc_id, "shared": shared, "overlap": len(shared),
             "topic": row.get("topic")},
        ))
    kept.sort(key=lambda item: (-item[1], item[0]))
    return kept[:top_n]


def _source_ranking(name: str, query: str, index: Optional[ProblemIndex]):
    if name == "concepts":
        return concept_ranking(query)
    if name == "examples":
        return example_ranking(query, index)
    if name == "dense":
        return dense_ranking(query, index)
    return []          # templates / exam: feature-detected, not implemented yet


def dense_ranking(query: str, index: Optional[ProblemIndex] = None,
                  top_n: int = 20) -> List[Tuple[str, float, dict]]:
    """(key, cosine, meta) from the embedding index; [] whenever it is unavailable.

    Deliberately NOT subject to the lexical overlap guard. That guard exists to stop
    a shared FUNCTION WORD from dragging in an unrelated problem when the only
    signal available is vocabulary; a cosine in embedding space is the signal that
    guard was standing in for. Re-applying it here would recreate the exact ceiling
    R3 is meant to lift (Q11's paraphrase shares one generic token with the right
    document and nothing else).
    """
    if not _dense_available():
        return []
    try:
        import retrieval_dense
        matrix_index = index if index is not None else get_default_index()
        return retrieval_dense.get_default_index().ranking(query, matrix_index, top_n)
    except Exception:
        return []       # never let an optional source break the fused result


# ── fusion ───────────────────────────────────────────────────────────────────

def search(query: str, top_k: int = 5, index: Optional[ProblemIndex] = None,
           sources: Optional[List[str]] = None) -> List[dict]:
    """Fuse the active sources into one deterministic ranked list.

    Determinism: RRF can hand two candidates the SAME fused score on a small bank,
    so the sort falls through to source priority and then to the key. Two runs on
    two processes therefore agree — which is the precondition for comparing a
    before/after number at all.
    """
    names = sources if sources is not None else active_sources()
    rankings: List[List[str]] = []
    evidence: Dict[str, Tuple[str, float, dict]] = {}

    for name in names:
        ranking = _source_ranking(name, query, index)
        if not ranking:
            continue
        rankings.append([key for key, _score, _meta in ranking])
        for key, score, meta in ranking:
            evidence[key] = (name, score, meta)

    if not rankings:
        return []

    fused = _reciprocal_rank_fusion(rankings, k=RRF_K)
    results = []
    for key, fused_score in fused.items():
        source, raw_score, meta = evidence[key]
        results.append({
            "key": key,
            "source": source,
            "id": meta.get("doc_id") or meta.get("node_id"),
            "fused": round(float(fused_score), 6),
            "raw_score": round(float(raw_score), 4),
            "meta": meta,
        })

    results.sort(key=lambda r: (-r["fused"], TIE_BREAK_PRIORITY.get(r["source"], 99), r["key"]))
    return results[:top_k]


def source_counts(results: List[dict]) -> Dict[str, int]:
    """How many hits each source contributed — for telemetry (R5) and logs."""
    counts: Dict[str, int] = {}
    for row in results:
        counts[row["source"]] = counts.get(row["source"], 0) + 1
    return counts