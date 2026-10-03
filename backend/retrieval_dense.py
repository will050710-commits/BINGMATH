"""
retrieval_dense.py
==================
R3 of DUOMATH_HYBRIDRAG_PLAN.md — the dense (embedding) half of hybrid retrieval,
with NO new dependency.

Why remote instead of a local model
-----------------------------------
`requirements-retrieval.txt` exists because sentence-transformers brings torch
(~2 GB of wheels, ~1 GB RSS at inference), and its first search encoded the WHOLE
problem bank inside the request's event loop. That is the 2026-09-28 incident: the
single worker stopped answering, the platform replied 502 with its own HTML page,
and the browser reported it as a CORS failure. Running the same transformer again
on this instance is not a fix, it is a repeat.

So the encoder is remote and the only new client is `httpx` — already a production
dependency. Nothing is added to `requirements.txt`.

Whatever the ladder, the ladder measured — not assumed
-----------------------------------------------------
`backend/scripts/check_embed_catalog.py` probes the providers before any flag is
turned on, and that probe is why this file does not name the model the plan first
proposed:

    nvidia/nv-embedqa-e5-v5            -> HTTP 410, end-of-life 2026-08-25
    nvidia/nv-embedqa-mistral-7b-v2    -> HTTP 404 "not found for account"
    nvidia/llama-3.2-nv-embedqa-1b-v1  -> HTTP 404 not enabled for the account
    nvidia/embed-qa-4                  -> HTTP 404 not enabled for the account
    nvidia/nemotron-3-embed-1b         -> HTTP 200, dim 2048          <-- survives
    gemini-embedding-001               -> HTTP 200, dim 3072 (768 on request) <-- survives
    /v1/ranking, /v1/reranking         -> HTTP 404 "page not found"   <-- no reranker

Two consequences are baked in below. First, Gemini is the PRIMARY because it is the
endpoint verified to work with the key this repo already has, and it exposes
`taskType` (RETRIEVAL_QUERY / RETRIEVAL_DOCUMENT) — the asymmetry that the worked
examples need, where a question and a problem statement are not the same kind of
text. Second, there is NO rerank stage: NVIDIA exposes no rerank route, and using
an LLM as a reranker would spend the free quota the chat ladder needs, for a gain
RRF already covers. A stage that cannot be verified is not shipped.

Query/passage asymmetry
-----------------------
Gemini takes `taskType`; NVIDIA takes `input_type`. Both are carried through to the
cache key, because they change the vector: the same string embedded as a query and
as a passage are different points in the space, and mixing them silently degrades
recall instead of failing loudly.

Cache
-----
`VectorCache` is the same shape as `vision_cache.py` (SQLite, WAL): one row per
(provider, model, dim, input_type, text-hash). Two reasons it is not optional:
every /api/chat would otherwise re-embed the same bank, and — the real trap — two
models live in INCOMPATIBLE spaces. Gemini's own documentation says vectors from
`gemini-embedding-001` and `gemini-embedding-2` cannot be compared and that
switching models requires re-embedding everything. Keying on the model (and the
dimension) makes that structural: a model change cannot reuse a stale vector.

Sync client, off the event loop
-------------------------------
`httpx.Client`, not `AsyncClient`, and that is deliberate. The chat path already
calls retrieval through `asyncio.to_thread` (main.py), so the network wait happens
on a worker thread and the event loop stays free. Choosing sync here keeps
`retrieval_hybrid.search()` synchronous, which means the CI quality gate can test
the whole ranking path without an event loop. The failure this avoids — a blocking
call INSIDE the loop — is prevented by the call site, and `test_chat_budget.py`
already pins that call site.

Env
---
    MATH_RETRIEVAL_DENSE=off|gemini|nvidia|openrouter     (default off)
    MATH_DENSE_MODEL_GEMINI=gemini-embedding-001
    MATH_DENSE_MODEL_NVIDIA=nvidia/nemotron-3-embed-1b
    MATH_DENSE_MODEL_OPENROUTER=openai/text-embedding-3-small
    MATH_DENSE_DIM_GEMINI=768          (3072 native; 768 measured working)
    MATH_DENSE_DIM_NVIDIA=2048
    MATH_DENSE_DIM_OPENROUTER=1536
    MATH_DENSE_CACHE_PATH=<repo>/backend/data/retrieval_vectors.db
    MATH_DENSE_TIMEOUT_S=20

Stdlib + numpy + httpx only. Never imports main.py.
"""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import threading
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

import numpy as np

import key_pool

HERE = os.path.dirname(os.path.abspath(__file__))

DEFAULT_CACHE_PATH = os.environ.get(
    "MATH_DENSE_CACHE_PATH",
    os.path.join(HERE, "data", "retrieval_vectors.db"),
)

NVIDIA_EMBEDDINGS_URL = "https://integrate.api.nvidia.com/v1/embeddings"
GEMINI_EMBED_URL = ("https://generativelanguage.googleapis.com/v1beta/"
                    "models/{model}:batchEmbedContents")
OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings"

GEMINI_TASK_TYPES = {
    "query": "RETRIEVAL_QUERY",
    "passage": "RETRIEVAL_DOCUMENT",
}

#: Which env key holds the model id per provider, its default, and its dimension.
PROVIDERS: Dict[str, Dict[str, str]] = {
    "gemini": {"env": "MATH_DENSE_MODEL_GEMINI",
               "default": "gemini-embedding-001",
               "dim_env": "MATH_DENSE_DIM_GEMINI", "dim_default": "768"},
    "nvidia": {"env": "MATH_DENSE_MODEL_NVIDIA",
               "default": "nvidia/nemotron-3-embed-1b",
               "dim_env": "MATH_DENSE_DIM_NVIDIA", "dim_default": "2048"},
    "openrouter": {"env": "MATH_DENSE_MODEL_OPENROUTER",
                   "default": "openai/text-embedding-3-small",
                   "dim_env": "MATH_DENSE_DIM_OPENROUTER", "dim_default": "1536"},
}

_OFF = {"off", "false", "0", "no", "disable", "disabled", "none", ""}

#: Provider order when the ladder falls through: the verified primary first.
LADDER = ("gemini", "nvidia", "openrouter")


# ── configuration ────────────────────────────────────────────────────────────

def requested_provider() -> str:
    """`MATH_RETRIEVAL_DENSE` — off unless it names a provider it knows.

    Denylist here would have the same trap `retrieval_hybrid._flag` fell into: a
    typo enabling the feature. Only the exact provider names turn anything on.
    """
    raw = str(os.environ.get("MATH_RETRIEVAL_DENSE", "off")).strip().lower()
    return raw if raw in PROVIDERS else "off"


def enabled() -> bool:
    return requested_provider() != "off"


def _keys_for(provider: str) -> List[str]:
    """Key list for a provider, from the same env names main.py already uses."""
    if provider == "nvidia":
        return key_pool.parse_keys(os.environ.get("NVIDIA_API_KEY_PRIMARY", ""),
                                   os.environ.get("NVIDIA_API_KEY_SECONDARY", ""))
    if provider == "gemini":
        return key_pool.parse_keys(os.environ.get("GEMINI_API_KEY", ""))
    return key_pool.parse_keys(os.environ.get("OPENROUTER_API_KEY", ""))


def _key_pool_for(provider: str) -> key_pool.KeyPool:
    """The same rotation pool main.py builds, so a 429 cools one key, not the tier."""
    return key_pool.KeyPool(_keys_for(provider), name=f"dense:{provider}")


def _int_env(name: str, default: int, minimum: int = 1, maximum: int = 100000) -> int:
    raw = os.environ.get(name)
    if raw is None or not str(raw).strip():
        return default
    try:
        value = int(str(raw).strip())
    except (TypeError, ValueError):
        return default
    return max(minimum, min(maximum, value))


def model_for(provider: str) -> str:
    spec = PROVIDERS[provider]
    raw = os.environ.get(spec["env"])
    return str(raw).strip() if raw and str(raw).strip() else spec["default"]


def dim_for(provider: str) -> int:
    spec = PROVIDERS[provider]
    return _int_env(spec["dim_env"], int(spec["dim_default"]), 8, 8192)


def timeout_s() -> float:
    raw = os.environ.get("MATH_DENSE_TIMEOUT_S")
    try:
        value = float(str(raw).strip())
    except (TypeError, ValueError):
        return 20.0
    return max(2.0, min(120.0, value))


#: Cosine floor for the dense source. MEASURED, not guessed — the diagnostic over
#: the golden set (`docs/baseline_rag_2026-10.md` §8) found a clean gap:
#:
#:     on-topic queries, correct document : 0.719 .. 0.855
#:     off-topic / uncovered, best wrong  : 0.546 .. 0.596
#:
#: The floor sweep showed recall@3 stays 13/13 and BOTH false-positive counts stay
#: 0 for any floor in [0.60, 0.70]; 0.75 starts losing real hits. 0.65 is the
#: centre of the working band, leaving ~0.05 of margin on either side.
#:
#: Why a floor is needed at all: the dense source deliberately bypasses the lexical
#: overlap guard (that is what lifts the paraphrase case), and cosine similarity is
#: never zero for unrelated text — so without a floor every off-topic question
#: would drag in a worked example and R2's precision fix would be undone.
DEFAULT_MIN_SIMILARITY = 0.65


def min_similarity() -> float:
    raw = os.environ.get("MATH_DENSE_MIN_SIMILARITY")
    try:
        value = float(str(raw).strip())
    except (TypeError, ValueError):
        return DEFAULT_MIN_SIMILARITY
    return max(0.0, min(1.0, value))


def cache_key(provider: str, model: str, dim: int, input_type: str, text: str) -> str:
    """sha256 over everything that changes the VECTOR, not just the text.

    `dim` is in the key because truncating a 3072-d vector to 768 and embedding
    natively at 768 are not the same space; `input_type` is in it because Gemini's
    own documentation is explicit that the two vectors of one string differ.
    """
    payload = "\x00".join((provider, model, str(dim), input_type, text))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


# ── vector cache ─────────────────────────────────────────────────────────────

class VectorCache:
    """SQLite (WAL) store of embedding vectors, keyed by the full vector identity.

    Same shape as `vision_cache.py`. A cache failure is never a retrieval failure:
    every path here degrades to "no cached vector" rather than raising, because
    losing the optimisation must not lose the reference block.
    """

    def __init__(self, path: str = None, clock: Optional[Callable[[], float]] = None):
        self.path = path or DEFAULT_CACHE_PATH
        self._clock = clock
        self._lock = threading.Lock()
        self._conn: Optional[sqlite3.Connection] = None
        self.hits = 0
        self.writes = 0

    def _connect(self) -> Optional[sqlite3.Connection]:
        if self._conn is not None:
            return self._conn
        try:
            parent = os.path.dirname(self.path)
            if parent:
                os.makedirs(parent, exist_ok=True)
            conn = sqlite3.connect(self.path, timeout=5.0)
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("""CREATE TABLE IF NOT EXISTS vec_cache (
                                key      TEXT PRIMARY KEY,
                                provider TEXT NOT NULL,
                                model    TEXT NOT NULL,
                                dim      INTEGER NOT NULL,
                                input    TEXT NOT NULL,
                                vec      BLOB NOT NULL
                            )""")
            conn.commit()
            self._conn = conn
        except Exception:
            self._conn = None
        return self._conn

    def get(self, key: str) -> Optional[np.ndarray]:
        conn = self._connect()
        if conn is None:
            return None
        with self._lock:
            try:
                row = conn.execute("SELECT vec FROM vec_cache WHERE key = ?",
                                   (key,)).fetchone()
            except Exception:
                return None
        if not row:
            return None
        self.hits += 1
        return np.frombuffer(row[0], dtype=np.float32).copy()

    def put(self, key: str, provider: str, model: str, dim: int,
            input_type: str, vector: np.ndarray) -> None:
        conn = self._connect()
        if conn is None:
            return
        blob = np.asarray(vector, dtype=np.float32).tobytes()
        with self._lock:
            try:
                conn.execute(
                    "INSERT OR REPLACE INTO vec_cache "
                    "(key, provider, model, dim, input, vec) VALUES (?,?,?,?,?,?)",
                    (key, provider, model, int(dim), input_type, blob))
                conn.commit()
                self.writes += 1
            except Exception:
                pass

    def stats(self) -> Dict[str, Any]:
        conn = self._connect()
        rows = 0
        if conn is not None:
            with self._lock:
                try:
                    rows = conn.execute("SELECT COUNT(*) FROM vec_cache").fetchone()[0]
                except Exception:
                    rows = 0
        return {"path": self.path, "rows": rows, "hits": self.hits, "writes": self.writes}

    def close(self) -> None:
        if self._conn is not None:
            try:
                self._conn.close()
            except Exception:
                pass
            self._conn = None


# ── remote client ────────────────────────────────────────────────────────────

class RemoteEmbeddingClient:
    """One client per provider; self-disables on the first unrecoverable failure.

    `transport` is the injection point tests use (an `httpx.MockTransport`), so the
    whole request/response/rotation path can be exercised with no network — the
    same trick `EmbeddingBackend.encode_fn` used in the sparse module.
    """

    def __init__(self, provider: str = None, model: str = None, dim: int = None,
                 pools: Optional[Dict[str, key_pool.KeyPool]] = None,
                 transport: Any = None, cache: Optional[VectorCache] = None,
                 timeout: Optional[float] = None):
        self.provider = provider or requested_provider()
        self.model = model or model_for(self.provider)
        self.dim = dim or dim_for(self.provider)
        self._pools = pools or {}
        self._transport = transport
        self.cache = cache if cache is not None else VectorCache()
        self.timeout = timeout or timeout_s()
        self.available = self.provider != "off"
        self._disable_reason: Optional[str] = None
        self.requests = 0
        self.retries = 0

    # ── key rotation ─────────────────────────────────────────────────────────
    def _pool(self) -> key_pool.KeyPool:
        if self.provider not in self._pools:
            self._pools[self.provider] = _key_pool_for(self.provider)
        return self._pools[self.provider]

    def disable_reason(self) -> Optional[str]:
        return self._disable_reason

    def _disable(self, reason: str) -> None:
        if self.available:
            self.available = False
            self._disable_reason = reason

    # ── request shapes ───────────────────────────────────────────────────────
    def _request_spec(self, texts: Sequence[str], input_type: str,
                      api_key: str) -> Tuple[str, Dict[str, str], Dict[str, Any]]:
        if self.provider == "gemini":
            body = {"requests": [
                {"model": f"models/{self.model}",
                 "content": {"parts": [{"text": text}]},
                 "taskType": GEMINI_TASK_TYPES.get(input_type, "RETRIEVAL_DOCUMENT"),
                 "outputDimensionality": self.dim}
                for text in texts]}
            return (GEMINI_EMBED_URL.format(model=self.model),
                    {"x-goog-api-key": api_key, "Content-Type": "application/json"},
                    body)
        url = (NVIDIA_EMBEDDINGS_URL if self.provider == "nvidia"
               else OPENROUTER_EMBEDDINGS_URL)
        body = {"model": self.model, "input": list(texts), "encoding_format": "float"}
        if self.provider == "nvidia":
            # NVIDIA names the asymmetry `input_type`, values exactly query/passage.
            # Sending the wrong one degrades recall quietly instead of failing.
            body["input_type"] = "query" if input_type == "query" else "passage"
        return url, key_pool.headers_for(api_key), body

    @staticmethod
    def _parse(provider: str, payload: Dict[str, Any]) -> Optional[List[List[float]]]:
        try:
            if provider == "gemini":
                return [item["values"] for item in payload["embeddings"]]
            items = sorted(payload["data"], key=lambda d: d.get("index", 0))
            return [item["embedding"] for item in items]
        except Exception:
            return None

    def _post(self, url: str, headers: Dict[str, str],
              body: Dict[str, Any]) -> Tuple[Optional[Any], str]:
        try:
            import httpx
            with httpx.Client(transport=self._transport, timeout=self.timeout) as client:
                return client.post(url, headers=headers, json=body), ""
        except Exception as exc:
            return None, f"{type(exc).__name__}: {exc}"

    def embed_texts(self, texts: Sequence[str],
                    input_type: str = "passage") -> Optional[np.ndarray]:
        """Unit-normalised vectors, or None. Never raises.

        Tries each key in the pool once on a KEY-level error (401/403/413/429 — the
        statuses key_pool knows about) and gives up on the provider only when the
        failure is not a key problem. On success the key's cooldown is cleared, which
        is what lets a key recover instead of being written off for the day.
        """
        texts = [t for t in texts if t and str(t).strip()]
        if not texts or not self.available:
            return None
        pool = self._pool()
        if not pool.has_keys():
            self._disable("no api key")
            return None

        for api_key in pool.request_order():
            url, headers, body = self._request_spec(texts, input_type, api_key)
            self.requests += 1
            response, err = self._post(url, headers, body)
            if response is None:
                self._disable(f"transport error ({err})")
                return None
            pool.note_response(api_key, response.status_code, response.headers)
            if response.status_code == 200:
                vectors = self._parse(self.provider, response.json())
                if not vectors:
                    self._disable("unparseable response")
                    return None
                array = np.asarray(vectors, dtype=np.float32)
                norms = np.linalg.norm(array, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                return array / norms
            if not key_pool.KeyPool.retryable(response.status_code):
                self._disable(f"http {response.status_code}")
                return None
            self.retries += 1
        self._disable("every key is cooling down")
        return None


# ── document index + ranking ─────────────────────────────────────────────────

class DenseIndex:
    """The bank's embedding matrix, and a query ranking over it.

    The matrix is rebuilt only when the IDENTITY changes (provider, model, dim) or
    the bank grows. That identity check is the safety rail the Gemini documentation
    implies: a matrix built with one model must never be multiplied against a query
    vector from another, because the two spaces are not comparable and the result
    is silently wrong rather than obviously broken.
    """

    def __init__(self, client: Optional[RemoteEmbeddingClient] = None):
        self.client = client or RemoteEmbeddingClient()
        self._matrix: Optional[np.ndarray] = None
        self._ids: List[str] = []
        self._identity: Optional[Tuple[str, str, int]] = None
        self.dropped = 0
        self.cache_hits = 0

    def identity(self) -> Tuple[str, str, int]:
        return (self.client.provider, self.client.model, self.client.dim)

    @staticmethod
    def _doc_text(index, row) -> str:
        """What gets embedded for a problem: the statement AND its topic.

        Topic is included because it is one of the few honest domain labels in the
        data (`geometry_2d`, `algebra`, `olympiad`) and it costs nothing.
        """
        return f"{row.get('problem', '')} {row.get('topic', '')}".strip()

    def matrix(self, index) -> Optional[np.ndarray]:
        if not self.client.available or not index.rows:
            return None
        identity = self.identity()
        if (self._matrix is not None and self._identity == identity
                and len(self._ids) == len(index.rows)):
            return self._matrix

        provider, model, dim = identity
        texts = [self._doc_text(index, row) for row in index.rows]
        ids = [str(row.get("id") or i) for i, row in enumerate(index.rows)]
        vectors: List[Optional[np.ndarray]] = []
        pending_texts: List[str] = []
        pending_slots: List[int] = []

        for i, (doc_id, text) in enumerate(zip(ids, texts)):
            cached = self.client.cache.get(cache_key(provider, model, dim, "passage", text))
            if cached is not None and cached.shape == (dim,):
                self.cache_hits += 1
                vectors.append(cached)
                continue
            vectors.append(None)
            pending_texts.append(text)
            pending_slots.append(i)

        self.dropped = 0
        if pending_texts:
            fresh = self.client.embed_texts(pending_texts, "passage")
            if fresh is None:
                # A partial matrix is worse than none: a row with no vector would
                # silently score 0 against every query, which reads as "irrelevant".
                return None
            if len(fresh) != len(pending_texts):
                self.client._disable("vector count mismatch")
                return None
            for slot, text, vector in zip(pending_slots, pending_texts, fresh):
                if np.asarray(vector).shape != (dim,):
                    # Different embedding space -> drop it, never pad or truncate.
                    self.dropped += 1
                    continue
                vectors[slot] = vector
                self.client.cache.put(cache_key(provider, model, dim, "passage", text),
                                      provider, model, dim, "passage", vector)

        kept_ids = [i for i, v in zip(ids, vectors) if v is not None]
        rows = [v for v in vectors if v is not None]
        if not rows:
            return None
        self._matrix = np.vstack(rows).astype(np.float32)
        self._ids = kept_ids
        self._identity = identity
        return self._matrix

    def ranking(self, query: str, index, top_n: int = 20
                ) -> List[Tuple[str, float, dict]]:
        """(key, cosine, meta) per document, best first. Empty when unavailable."""
        matrix = self.matrix(index)
        if matrix is None or not query or not str(query).strip():
            return []
        query_vector = self.client.embed_texts([query], "query")
        if query_vector is None or query_vector.shape[0] != 1:
            return []
        if query_vector.shape[1] != matrix.shape[1]:
            self.client._disable("query/document dimension mismatch")
            return []

        sims = matrix @ query_vector[0]
        order = np.argsort(-sims, kind="stable")
        floor = min_similarity()
        out: List[Tuple[str, float, dict]] = []
        for position in order[:top_n]:
            score = float(sims[position])
            if score < floor:
                # Below the measured floor: this is the "nothing is really about
                # this" case, and returning it would undo R2's precision fix.
                continue
            out.append((f"ex:{self._ids[position]}", score,
                        {"doc_id": self._ids[position], "source": "dense",
                         "provider": self.client.provider, "model": self.client.model,
                         "cosine": round(score, 4), "floor": floor}))
        return out

    def stats(self) -> Dict[str, Any]:
        return {"provider": self.client.provider, "model": self.client.model,
                "dim": self.client.dim, "available": self.client.available,
                "documents": len(self._ids), "dropped": self.dropped,
                "cache_hits": self.cache_hits, "requests": self.client.requests,
                "cache": self.client.cache.stats(),
                "disabled_because": self.client.disable_reason()}


#: One lazily-built index per process, so a warm matrix is reused across requests.
_DEFAULT: Optional[DenseIndex] = None


def get_default_index() -> DenseIndex:
    global _DEFAULT
    if _DEFAULT is None:
        _DEFAULT = DenseIndex()
    return _DEFAULT


def reset_default_index() -> None:
    """Test hook: drop the process-wide index (and its client's cached state)."""
    global _DEFAULT
    _DEFAULT = None


def available() -> bool:
    """True only when the flag names a provider AND a key for it exists."""
    provider = requested_provider()
    return bool(provider != "off" and _keys_for(provider))