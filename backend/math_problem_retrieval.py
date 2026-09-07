"""
math_problem_retrieval.py
============================
Track A of the "improve chatbot quality with math data" plan (see the plan
doc for why this — RAG — beats fine-tuning Gemini, which needs paid Vertex
AI and isn't even supported yet for the model this project runs on).

v2: HYBRID retrieval — semantic embeddings + TF-IDF, combined via
Reciprocal Rank Fusion (RRF). Why hybrid, not embeddings-only: two
Olympiad geometry problems with the SAME construction ("trực tâm" +
"đường tròn Euler") can be worded completely differently — TF-IDF alone
misses that paraphrase, which is exactly what the v1 module's docstring
flagged as the reason to add embeddings. But TF-IDF isn't obsolete either:
it still wins on exact-terminology matches that a general-purpose
embedding model can under-weight. RRF combines whichever ranking(s) are
available without needing the two very different score scales (embedding
cosine vs. TF-IDF cosine) to be comparable.

Embedding model: AITeamVN/Vietnamese_Embedding by default — fine-tuned
specifically for Vietnamese retrieval (base: BGE-M3, ~300K Vietnamese
query/passage/negative triplets), matching this product's primary
language directly, rather than a generic multilingual model. Swap to a
smaller one via MATH_EMBEDDING_MODEL if latency/memory on your deploy
target matters more than the last bit of Vietnamese-specific quality —
intfloat/multilingual-e5-small is the well-established lightweight option
(needs MATH_EMBEDDING_QUERY_PREFIX="query: " / _PASSAGE_PREFIX="passage: ",
which the Vietnamese_Embedding default does NOT need — see its own model
card usage example, which uses no prefix).

sentence-transformers is a NEW dependency (add to requirements.txt), but
torch itself is not new — already present via requirements-ai-addons.txt
for RealESRGAN.

Degrades safely: if sentence-transformers isn't installed, or the model
fails to download/load (no network, disk space, etc.), the embedding
backend marks itself unavailable ONCE and every subsequent search()
silently falls back to TF-IDF-only — the exact v1 behavior, already
tested. This check happens once per process (cheap), not per-query.
"""

import os
import re
import json
import math
import logging
from typing import List, Dict, Any, Optional, Callable
from collections import Counter

import numpy as np

logger = logging.getLogger("math_problem_retrieval")

DEFAULT_INDEX_PATH = os.environ.get(
    "MATH_PROBLEM_INDEX_PATH",
    os.path.join(os.path.dirname(__file__), "data", "math_problems.jsonl"),
)
DEFAULT_EMBEDDING_MODEL = os.environ.get("MATH_EMBEDDING_MODEL", "AITeamVN/Vietnamese_Embedding")
EMBEDDING_QUERY_PREFIX = os.environ.get("MATH_EMBEDDING_QUERY_PREFIX", "")
EMBEDDING_PASSAGE_PREFIX = os.environ.get("MATH_EMBEDDING_PASSAGE_PREFIX", "")
RRF_K = 60  # standard RRF damping constant — well-established default

_STOPWORDS = {
    "là", "và", "của", "có", "cho", "một", "các", "trong", "với", "khi",
    "để", "được", "này", "đó", "tính", "hãy", "the", "a", "an", "of", "and",
    "to", "in", "is", "find", "let", "given",
}
_TOKEN_RE = re.compile(r"[0-9A-Za-zÀ-ỹà-ỹ]+", re.UNICODE)


def _tokenize(text: str) -> List[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text or "") if t.lower() not in _STOPWORDS and len(t) > 1]


# ── dense (embedding) backend ─────────────────────────────────────────────────

class EmbeddingBackend:
    """
    Thin wrapper around sentence-transformers, lazy-loaded (first real use,
    not import time) and self-disabling on any failure. `encode_fn` is an
    injection point for tests — pass a fake embedder to test the hybrid
    scoring/RRF logic without downloading a real model.
    """

    def __init__(self, model_name: str = DEFAULT_EMBEDDING_MODEL,
                 query_prefix: str = EMBEDDING_QUERY_PREFIX,
                 passage_prefix: str = EMBEDDING_PASSAGE_PREFIX,
                 encode_fn: Optional[Callable[[List[str]], np.ndarray]] = None):
        self.model_name = model_name
        self.query_prefix = query_prefix
        self.passage_prefix = passage_prefix
        self._model = None
        self._encode_fn = encode_fn  # test injection: bypasses sentence-transformers entirely
        self.available = True
        self._load_attempted = False

    def _ensure_loaded(self) -> bool:
        if self._encode_fn is not None:
            return True
        if self._model is not None:
            return True
        if self._load_attempted and not self.available:
            return False
        self._load_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
        except Exception as e:
            logger.warning(f"[EmbeddingBackend] Could not load '{self.model_name}' — "
                            f"falling back to TF-IDF-only retrieval. ({e})")
            self.available = False
        return self.available

    def _encode(self, texts: List[str]) -> Optional[np.ndarray]:
        if not self._ensure_loaded():
            return None
        try:
            if self._encode_fn is not None:
                vecs = self._encode_fn(texts)
            else:
                vecs = self._model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
            vecs = np.asarray(vecs, dtype=np.float32)
            norms = np.linalg.norm(vecs, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return vecs / norms  # ensure unit-normalized regardless of encoder guarantees
        except Exception as e:
            logger.warning(f"[EmbeddingBackend] Encoding failed, disabling for this process: {e}")
            self.available = False
            return None

    def encode_passages(self, texts: List[str]) -> Optional[np.ndarray]:
        return self._encode([f"{self.passage_prefix}{t}" for t in texts])

    def encode_query(self, text: str) -> Optional[np.ndarray]:
        result = self._encode([f"{self.query_prefix}{text}"])
        return result[0] if result is not None else None


def _reciprocal_rank_fusion(rankings: List[List[str]], k: int = RRF_K) -> Dict[str, float]:
    """
    rankings: one ranked list of doc ids per retrieval method (best first).
    A doc found by only ONE method still gets that method's full 1/(k+rank)
    contribution — it is not penalized for the other method not running.
    """
    scores: Dict[str, float] = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return scores


class ProblemIndex:
    """
    Hybrid TF-IDF + embedding index over a JSONL file of {id, topic, level,
    problem, solution, source} rows. Loads once at construction; call
    .reload() if the file changes (e.g. after prepare_math_datasets.py runs).
    """

    def __init__(self, jsonl_path: str = DEFAULT_INDEX_PATH,
                 embedding_backend: Optional[EmbeddingBackend] = None):
        self.jsonl_path = jsonl_path
        self.embedding_backend = embedding_backend or EmbeddingBackend()
        self.rows: List[Dict[str, Any]] = []
        self._doc_freq: Counter = Counter()
        self._doc_vectors: List[Dict[str, float]] = []
        self._vocab_idf: Dict[str, float] = {}
        self._doc_embeddings: Optional[np.ndarray] = None  # (N, D), unit-normalized rows
        self.reload()

    def reload(self) -> int:
        """(Re)loads rows from disk and rebuilds both the TF-IDF and (if
        available) embedding indexes. Returns row count."""
        self.rows = []
        if os.path.exists(self.jsonl_path):
            with open(self.jsonl_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        self.rows.append(json.loads(line))
                    except json.JSONDecodeError as e:
                        logger.warning(f"[ProblemIndex] Skipping malformed line: {e}")
        self._build_tfidf_index()
        self._build_embedding_index()
        logger.info(f"[ProblemIndex] Loaded {len(self.rows)} problems from {self.jsonl_path} "
                    f"(embeddings {'ON' if self._doc_embeddings is not None else 'OFF — TF-IDF only'})")
        return len(self.rows)

    # ---- sparse (TF-IDF) ----

    def _build_tfidf_index(self) -> None:
        self._doc_freq = Counter()
        term_counts_per_doc: List[Counter] = []
        for row in self.rows:
            tokens = _tokenize(row.get("problem", "") + " " + row.get("topic", ""))
            counts = Counter(tokens)
            term_counts_per_doc.append(counts)
            for term in counts:
                self._doc_freq[term] += 1

        n_docs = max(len(self.rows), 1)
        self._vocab_idf = {
            term: math.log((n_docs + 1) / (df + 1)) + 1.0
            for term, df in self._doc_freq.items()
        }
        self._doc_vectors = []
        for counts in term_counts_per_doc:
            total = sum(counts.values()) or 1
            vec = {term: (count / total) * self._vocab_idf.get(term, 0.0) for term, count in counts.items()}
            norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
            self._doc_vectors.append({k: v / norm for k, v in vec.items()})

    def _tfidf_query_vector(self, query: str) -> Dict[str, float]:
        counts = Counter(_tokenize(query))
        total = sum(counts.values()) or 1
        vec = {term: (count / total) * self._vocab_idf.get(term, 0.0) for term, count in counts.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {k: v / norm for k, v in vec.items()}

    @staticmethod
    def _cosine_sparse(a: Dict[str, float], b: Dict[str, float]) -> float:
        if len(b) < len(a):
            a, b = b, a
        return sum(v * b.get(k, 0.0) for k, v in a.items())

    def _tfidf_scores(self, query: str) -> Dict[int, float]:
        """Returns {row_index: cosine_score} for every row with a nonzero match."""
        qvec = self._tfidf_query_vector(query)
        if not qvec:
            return {}
        out = {}
        for i, dvec in enumerate(self._doc_vectors):
            s = self._cosine_sparse(qvec, dvec)
            if s > 0:
                out[i] = s
        return out

    # ---- dense (embedding) ----

    def _build_embedding_index(self) -> None:
        self._doc_embeddings = None
        if not self.rows:
            return
        texts = [row.get("problem", "") for row in self.rows]
        embeddings = self.embedding_backend.encode_passages(texts)
        if embeddings is not None and embeddings.shape[0] == len(self.rows):
            self._doc_embeddings = embeddings

    def _dense_scores(self, query: str) -> Dict[int, float]:
        if self._doc_embeddings is None:
            return {}
        qvec = self.embedding_backend.encode_query(query)
        if qvec is None:
            return {}
        sims = self._doc_embeddings @ qvec  # both unit-normalized -> cosine similarity
        return {i: float(s) for i, s in enumerate(sims) if s > 0}

    # ---- hybrid search ----

    def search(self, query: str, top_k: int = 3, topic_filter: Optional[str] = None,
               min_score: float = 0.05, top_n_per_method: int = 20) -> List[Dict[str, Any]]:
        """
        Combines TF-IDF and (if available) embedding rankings via RRF.
        `min_score` still gates on the RAW per-method score (not the RRF
        value, which isn't on an intuitive 0-1 scale) — a candidate is kept
        if EITHER method scored it above min_score, so a paraphrase caught
        only by embeddings (low/zero TF-IDF overlap) isn't dropped for
        failing the OTHER method's threshold.
        """
        if not self.rows:
            return []

        tfidf_scores = self._tfidf_scores(query)
        dense_scores = self._dense_scores(query)

        eligible = {i for i, s in tfidf_scores.items() if s >= min_score}
        eligible |= {i for i, s in dense_scores.items() if s >= min_score}
        if topic_filter:
            eligible = {i for i in eligible if self.rows[i].get("topic") == topic_filter}
        if not eligible:
            return []

        rankings = []
        if tfidf_scores:
            ranked = sorted(tfidf_scores.keys(), key=lambda i: tfidf_scores[i], reverse=True)[:top_n_per_method]
            rankings.append([str(i) for i in ranked])
        if dense_scores:
            ranked = sorted(dense_scores.keys(), key=lambda i: dense_scores[i], reverse=True)[:top_n_per_method]
            rankings.append([str(i) for i in ranked])

        fused = _reciprocal_rank_fusion(rankings)
        ordered = sorted(eligible, key=lambda i: fused.get(str(i), 0.0), reverse=True)[:top_k]

        results = []
        for i in ordered:
            r = dict(self.rows[i])
            r["_score"] = round(fused.get(str(i), 0.0), 5)
            r["_tfidf_score"] = round(tfidf_scores.get(i, 0.0), 4)
            r["_dense_score"] = round(dense_scores.get(i, 0.0), 4) if dense_scores else None
            results.append(r)
        return results


def format_as_few_shot(results: List[Dict[str, Any]], max_solution_chars: int = 600) -> str:
    """
    Renders retrieved problems as a Vietnamese few-shot block, ready to
    prepend to the system/user prompt sent to Gemini. Truncates long
    solutions (token budget) rather than omitting them outright.
    """
    if not results:
        return ""
    blocks = ["**Các bài toán tương tự đã giải (tham khảo cách tiếp cận, KHÔNG chép nguyên văn):**\n"]
    for i, r in enumerate(results, 1):
        sol = (r.get("solution") or "").strip()
        if len(sol) > max_solution_chars:
            sol = sol[:max_solution_chars].rstrip() + " [...]"
        blocks.append(
            f"Ví dụ {i} (nguồn: {r.get('source', '?')}):\n"
            f"Đề: {r.get('problem', '').strip()}\n"
            f"Hướng giải: {sol}\n"
        )
    return "\n".join(blocks)


_default_index: Optional[ProblemIndex] = None


def get_default_index() -> ProblemIndex:
    global _default_index
    if _default_index is None:
        _default_index = ProblemIndex()
    return _default_index


def retrieve_similar_problems(query: str, top_k: int = 3, topic_filter: Optional[str] = None) -> str:
    """
    Drop-in companion to main.py's existing retrieve_math_context(query):
    that returns concept DEFINITIONS; this returns worked EXAMPLES.
    """
    idx = get_default_index()
    results = idx.search(query, top_k=top_k, topic_filter=topic_filter)
    return format_as_few_shot(results)
