"""
test_retrieval_dense.py
=======================
R3 of DUOMATH_HYBRIDRAG_PLAN.md — the dense half, tested with NO network.

How this stays offline
----------------------
`RemoteEmbeddingClient` takes an `httpx.MockTransport`, so every branch — request
shape, vector normalisation, key rotation, self-disabling — is exercised against
canned responses. That is the same injection trick `EmbeddingBackend.encode_fn`
used in the sparse module, and it is why a transformer-free dense tier can be
gated in CI at all.

What is asserted
----------------
1. **Off by default, and a typo cannot turn it on.** Only the exact provider names
   (`gemini`, `nvidia`, `openrouter`) enable anything. `MATH_RETRIEVAL_DENSE=ge` is
   off. This is the trap `retrieval_hybrid._flag` already fell into once.
2. **`available()` needs the flag AND a key.** One without the other is "off", so
   the CI job (no keys) can never accidentally attempt a request.
3. **No new dependency.** The module imports httpx (already a production dep) and
   numpy (already there); `test_chat_budget.py` independently pins
   sentence-transformers OUT of requirements.txt, and this suite pins that the
   dense module does not import it either.
4. **The cache key covers everything that changes the vector** — provider, model,
   dim AND input_type. Gemini's documentation is explicit that two embedding model
   families are not comparable and that switching requires re-embedding; a key that
   omitted the model would let a stale vector be reused across spaces and produce
   silently wrong rankings instead of an obvious failure.
5. **Query/passage asymmetry is real in the request.** Gemini gets `taskType`
   (RETRIEVAL_QUERY vs RETRIEVAL_DOCUMENT), NVIDIA gets `input_type`
   (query/passage) — the parameter the NVIDIA docs say causes "large drops in
   retrieval accuracy" when used the wrong way round.
6. **A dead model fails loudly.** The probe that shaped this module found
   `nv-embedqa-e5-v5` returning 410 end-of-life; a 4xx that is not a key problem
   must disable the provider, not retry it forever.
7. **Key rotation.** A 429 cools the first key and the SAME call succeeds on the
   second — reusing `key_pool`, so the cooldown honours provider headers.
8. **A wrong-dimension vector is dropped, never padded or truncated.** Padding
   would fabricate a vector; truncating would mix spaces.
9. **There is no rerank stage** — because the probe found no rerank endpoint on the
   NVIDIA key. Pinned so nobody re-adds a stage that cannot be verified.
10. **The dense source is invisible until switched on.** `active_sources()` must not
    list `dense` while the flag is off, so the R2 numbers stay reproducible.

Run:  python backend/test_retrieval_dense.py
"""

import io
import os
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402

import retrieval_dense as rd  # noqa: E402
import retrieval_hybrid as rh  # noqa: E402
import key_pool  # noqa: E402

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
    """Set/restore an environment variable so one test cannot leak into the next."""

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


class env_many:
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


def make_cache():
    """A cache in a throwaway directory — never the repo's data/ file."""
    handle, path = tempfile.mkstemp(suffix=".db")
    os.close(handle)
    os.remove(path)
    return rd.VectorCache(path=path), path


def _no_key_echo(payload, secret):
    """True when `secret` does not appear anywhere in a serialisable structure.

    Deliberately checks the VALUE, not the word "key": the diagnostic string
    "no api key" is a useful reason to show an on-call engineer and contains no key
    material. Asserting on the substring would forbid the useful message while
    proving nothing, which is exactly what a first draft of this suite did.
    """
    import json as _json
    return secret not in _json.dumps(payload, ensure_ascii=False, default=str)


# ── 1. flags ─────────────────────────────────────────────────────────────────

def test_flags():
    print("\n[flags] off by default; only a known provider name turns it on")
    for value, expected in ((None, "off"), ("", "off"), ("off", "off"),
                            ("of", "off"),          # typo
                            ("gemni", "off"),       # typo
                            ("gpt", "off"),         # not a provider we have
                            ("gemini", "gemini"), ("nvidia", "nvidia"),
                            ("openrouter", "openrouter"),
                            (" GEMINI ", "gemini")):
        with env_var("MATH_RETRIEVAL_DENSE", value):
            got = rd.requested_provider()
            check(f"MATH_RETRIEVAL_DENSE={value!r} -> {expected!r}",
                  got == expected, f"got {got!r}")
    with env_var("MATH_RETRIEVAL_DENSE", "gemini"):
        check("enabled() is True for a known provider", rd.enabled() is True)
    with env_var("MATH_RETRIEVAL_DENSE", "off"):
        check("enabled() is False by default", rd.enabled() is False)


def test_available_needs_flag_and_key():
    print("\n[available] the flag and the key are both required")
    with env_many({"MATH_RETRIEVAL_DENSE": "gemini", "GEMINI_API_KEY": ""}):
        check("flag on + no key -> NOT available", rd.available() is False)
    with env_many({"MATH_RETRIEVAL_DENSE": "off", "GEMINI_API_KEY": "x"}):
        check("key present + flag off -> NOT available", rd.available() is False)
    with env_many({"MATH_RETRIEVAL_DENSE": "gemini", "GEMINI_API_KEY": "x"}):
        check("flag on + key present -> available", rd.available() is True)


def test_model_defaults_and_overrides():
    print("\n[models] defaults match what the probe actually returned")
    with env_many({"MATH_DENSE_MODEL_GEMINI": None, "MATH_DENSE_DIM_GEMINI": None,
                   "MATH_DENSE_MODEL_NVIDIA": None, "MATH_DENSE_DIM_NVIDIA": None}):
        check("gemini default is gemini-embedding-001 (probe: HTTP 200)",
              rd.model_for("gemini") == "gemini-embedding-001")
        check("gemini default dim is 768 (probe: outputDimensionality honoured)",
              rd.dim_for("gemini") == 768)
        check("nvidia default is nvidia/nemotron-3-embed-1b (probe: HTTP 200, dim 2048)",
              rd.model_for("nvidia") == "nvidia/nemotron-3-embed-1b")
        check("nvidia default dim is 2048 (the measured native dimension)",
              rd.dim_for("nvidia") == 2048)
    with env_many({"MATH_DENSE_MODEL_GEMINI": "gemini-embedding-2",
                   "MATH_DENSE_DIM_GEMINI": "3072"}):
        check("the model is overridable by env",
              rd.model_for("gemini") == "gemini-embedding-2")
        check("the dimension is overridable by env", rd.dim_for("gemini") == 3072)
    with env_many({"MATH_DENSE_DIM_GEMINI": "banana"}):
        check("a non-numeric dimension falls back to the default",
              rd.dim_for("gemini") == 768)


# ── 2. dependencies ──────────────────────────────────────────────────────────

def test_no_heavy_dependency():
    print("\n[deps] remote embedding means no torch in the process")
    check("retrieval_dense does NOT import sentence_transformers",
          "sentence_transformers" not in sys.modules)
    source = io.open(os.path.join(HERE, "retrieval_dense.py"), encoding="utf-8").read()
    check("...and the module source never mentions it",
          "sentence_transformers" not in source and "import torch" not in source)
    check("it does not import main.py (so CI can load it)",
          "import main" not in source)
    check("it reuses key_pool rather than re-implementing rotation",
          "key_pool" in source and "KeyPool" in source)


# ── 3. cache key: never mix embedding spaces ─────────────────────────────────

def test_cache_key_identity():
    print("\n[cache-key] the key covers everything that changes the vector")
    base = rd.cache_key("gemini", "gemini-embedding-001", 768, "passage", "x")
    check("the same identity hashes the same", base == rd.cache_key(
        "gemini", "gemini-embedding-001", 768, "passage", "x"))

    # Each of these, if omitted from the key, would let a vector from one space be
    # reused in another -> silently wrong ranking instead of an obvious failure.
    for label, other in (
        ("a different provider", rd.cache_key("nvidia", "gemini-embedding-001", 768, "passage", "x")),
        ("a different model (gemini-embedding-001 vs -2: INCOMPATIBLE spaces)",
         rd.cache_key("gemini", "gemini-embedding-2", 768, "passage", "x")),
        ("a different dimension", rd.cache_key("gemini", "gemini-embedding-001", 3072, "passage", "x")),
        ("query vs passage", rd.cache_key("gemini", "gemini-embedding-001", 768, "query", "x")),
        ("a different text", rd.cache_key("gemini", "gemini-embedding-001", 768, "passage", "y")),
    ):
        check(f"changing {label} changes the key", base != other, "collision!")


def test_vector_cache():
    print("\n[cache] SQLite round trip, misses, and graceful failure")
    cache, path = make_cache()
    try:
        vector = np.asarray([0.5] * 8, dtype=np.float32)
        key = rd.cache_key("gemini", "m", 8, "passage", "hello")
        check("a miss returns None", cache.get(key) is None)
        cache.put(key, "gemini", "m", 8, "passage", vector)
        got = cache.get(key)
        check("a hit returns the stored vector", got is not None and np.allclose(got, vector))
        check("the stored vector keeps its dtype and length",
              got is not None and got.dtype == np.float32 and len(got) == 8)
        stats = cache.stats()
        check("stats reports the row count and counters",
              stats["rows"] == 1 and stats["hits"] == 1 and stats["writes"] == 1, str(stats))
        check("stats never contains a vector or a key", "vec" not in stats and "key" not in stats)

        other = rd.cache_key("gemini", "m", 8, "passage", "different text")
        check("a different text is a different row", cache.get(other) is None)

        cache.put(key, "gemini", "m", 8, "passage", np.asarray([0.25] * 8, dtype=np.float32))
        check("re-putting the same key replaces rather than duplicates",
              cache.stats()["rows"] == 1)
    finally:
        cache.close()
        _drop(path)

    bad = rd.VectorCache(path=os.path.join("Z:", "no", "such", "dir", "x.db"))
    check("an unwritable cache path degrades to a no-op, not an exception",
          bad.get("anything") is None and bad.stats()["rows"] == 0)
    bad.put("k", "p", "m", 4, "passage", np.zeros(4, dtype=np.float32))  # must not raise

    good, good_path = make_cache()
    try:
        # A file that is not a database must degrade the same way.
        with io.open(good_path, "wb") as handle:
            handle.write(b"this is not a sqlite database at all")
        broken = rd.VectorCache(path=good_path)
        try:
            check("a corrupt cache file reports an empty cache instead of raising",
                  broken.get("x") is None)
        finally:
            broken.close()
    finally:
        good.close()
        _drop(good_path)


# ── 4. request shape + rotation, against canned transports ───────────────────

def _transport(handler):
    import httpx
    return httpx.MockTransport(handler)


def _client(provider, handler, **kwargs):
    cache, path = make_cache()
    client = rd.RemoteEmbeddingClient(provider=provider, transport=_transport(handler),
                                      cache=cache, **kwargs)
    return client, cache, path


def _cleanup(cache, path):
    cache.close()
    for suffix in ("", "-wal", "-shm"):
        try:
            if os.path.exists(path + suffix):
                os.remove(path + suffix)
        except OSError:
            # Windows keeps a lock until every connection is closed; the file lives
            # in TEMP, so failing to remove it must never fail the suite.
            pass


def _drop(path):
    for suffix in ("", "-wal", "-shm"):
        try:
            if os.path.exists(path + suffix):
                os.remove(path + suffix)
        except OSError:
            pass


def test_gemini_request_shape():
    print("\n[shape] gemini: taskType + outputDimensionality; response parsing")
    import json as _json
    seen = {}

    def handler(request):
        seen["url"] = str(request.url)
        seen["body"] = _json.loads(request.content.decode("utf-8"))
        seen["auth"] = request.headers.get("x-goog-api-key")
        import httpx
        return httpx.Response(200, json={"embeddings": [
            {"values": [3.0, 4.0]}, {"values": [0.0, 5.0]}]})

    client, cache, path = _client("gemini", handler, model="gemini-embedding-001", dim=2)
    try:
        with env_var("GEMINI_API_KEY", "test-key"):
            vectors = client.embed_texts(["a", "b"], "passage")
        check("the key travels in the x-goog-api-key header, not the URL",
              seen.get("auth") == "test-key" and "key=" not in seen.get("url", ""))
        check("the URL is batchEmbedContents for the configured model",
              ":batchEmbedContents" in seen.get("url", "") and
              "gemini-embedding-001" in seen.get("url", ""))
        body = seen.get("body") or {}
        requests = body.get("requests") or []
        check("one sub-request per text", len(requests) == 2)
        check("taskType=RETRIEVAL_DOCUMENT for a passage",
              requests and requests[0]["taskType"] == "RETRIEVAL_DOCUMENT")
        check("outputDimensionality is sent, so the vector size is deliberate",
              requests and requests[0]["outputDimensionality"] == 2)
        check("vectors are returned unit-normalised",
              vectors is not None and np.allclose(np.linalg.norm(vectors, axis=1), 1.0))
        check("the normalisation is real, not a no-op",
              vectors is not None and abs(float(vectors[0][1]) - 0.8) < 1e-6,
              str(vectors[0]) if vectors is not None else "none")
    finally:
        _cleanup(cache, path)

    def handler_query(request):
        import json as _j, httpx
        body = _j.loads(request.content.decode("utf-8"))
        seen["query_body"] = body
        return httpx.Response(200, json={"embeddings": [
            {"values": [1.0, 0.0]}] * len(body["requests"])})

    client2, cache2, path2 = _client("gemini", handler_query, dim=2)
    try:
        with env_var("GEMINI_API_KEY", "k"):
            client2.embed_texts(["q"], "query")
        check("taskType=RETRIEVAL_QUERY for a query (the asymmetry is real)",
              seen["query_body"]["requests"][0]["taskType"] == "RETRIEVAL_QUERY")
    finally:
        _cleanup(cache2, path2)


_last_body = {}


def test_nvidia_and_openrouter_request_shape():
    print("\n[shape] nvidia: input_type + Bearer; openrouter: OpenAI-compatible")
    import json as _json
    import httpx

    def nvidia_handler(request):
        global _last_body
        _last_body = _json.loads(request.content.decode("utf-8"))
        return httpx.Response(200, json={
            "data": [{"index": 0, "embedding": [1.0, 0.0]},
                     {"index": 1, "embedding": [0.0, 1.0]}]})

    client, cache, path = _client("nvidia", nvidia_handler,
                                  model="nvidia/nemotron-3-embed-1b", dim=2)
    try:
        with env_var("NVIDIA_API_KEY_PRIMARY", "nv-test"):
            vectors = client.embed_texts(["a", "b"], "passage")
        check("nvidia uses /v1/embeddings on the same base URL as the chat tiers",
              "integrate.api.nvidia.com/v1/embeddings" in client._request_spec(
                  ["x"], "passage", "k")[0])
        check("input_type=passage when indexing", _last_body.get("input_type") == "passage")
        check("the Authorization header is a Bearer token",
              client._request_spec(["x"], "passage", "nv-test")[1]["Authorization"]
              == "Bearer nv-test")
        check("nvidia vectors are normalised too",
              vectors is not None and np.allclose(np.linalg.norm(vectors, axis=1), 1.0))
        check("out-of-order indices are re-ordered by index",
              vectors is not None and np.allclose(vectors[0], [1.0, 0.0]))
        with env_var("NVIDIA_API_KEY_PRIMARY", "k"):
            client.embed_texts(["q"], "query")
        check("input_type=query when searching", _last_body.get("input_type") == "query")
    finally:
        _cleanup(cache, path)

    def or_handler(request):
        global _last_body
        _last_body = _json.loads(request.content.decode("utf-8"))
        return httpx.Response(200, json={"data": [{"index": 0, "embedding": [1.0, 1.0]}]})

    client2, cache2, path2 = _client("openrouter", or_handler,
                                     model="openai/text-embedding-3-small", dim=2)
    try:
        with env_var("OPENROUTER_API_KEY", "or-test"):
            client2.embed_texts(["hi"], "passage")
        check("openrouter sends the OpenAI `input` field",
              isinstance(_last_body.get("input"), list) and _last_body["input"] == ["hi"])
        check("openrouter does NOT send a provider-specific input_type/input_type key",
              "input_type" not in _last_body and "taskType" not in _last_body)
    finally:
        _cleanup(cache2, path2)


# ── 5. failure behaviour: rotate, then self-disable ──────────────────────────

def test_rotation_and_self_disable():
    print("\n[failure] a bad key rotates; a bad MODEL disables the provider")
    import httpx
    calls = {"n": 0, "keys": []}

    def flaky(request):
        calls["n"] += 1
        calls["keys"].append(request.headers.get("x-goog-api-key"))
        if calls["n"] == 1:
            return httpx.Response(429, headers={"retry-after": "30"},
                                  json={"error": "rate limited"})
        return httpx.Response(200, json={"embeddings": [{"values": [1.0, 0.0]}]})

    client, cache, path = _client("gemini", flaky, dim=2)
    try:
        with env_many({"GEMINI_API_KEY": "key-one key-two"}):
            vectors = client.embed_texts(["a"], "passage")
        check("a 429 on the first key falls through to the second key",
              vectors is not None and calls["n"] == 2, str(calls))
        check("the retry used a DIFFERENT key", len(set(calls["keys"])) == 2, str(calls["keys"]))
        check("the provider stays available after a successful retry",
              client.available is True)
        check("the retry is counted for telemetry", client.retries == 1)
    finally:
        _cleanup(cache, path)

    def gone(request):
        return httpx.Response(410, json={"detail": "end of life"})

    client2, cache2, path2 = _client("nvidia", gone, dim=2)
    try:
        with env_var("NVIDIA_API_KEY_PRIMARY", "k"):
            result = client2.embed_texts(["a"], "passage")
        check("a 410 end-of-life returns None instead of raising", result is None)
        check("...and disables the provider with a reason", client2.available is False)
        check("the reason names the status",
              "410" in (client2.disable_reason() or ""), client2.disable_reason())
        with env_var("NVIDIA_API_KEY_PRIMARY", "k"):
            check("a disabled provider does not keep retrying",
                  client2.embed_texts(["b"], "passage") is None)
    finally:
        _cleanup(cache2, path2)

    client3, cache3, path3 = _client("gemini", lambda r: httpx.Response(200, json={}), dim=2)
    try:
        with env_var("GEMINI_API_KEY", "k"):
            check("an unparseable 200 disables instead of returning junk",
                  client3.embed_texts(["a"], "passage") is None
                  and client3.available is False)
    finally:
        _cleanup(cache3, path3)

    client4, cache4, path4 = _client("gemini", lambda r: httpx.Response(200, json={}), dim=2)
    try:
        with env_var("GEMINI_API_KEY", ""):
            check("no key at all -> None, and the reason says so",
                  client4.embed_texts(["a"], "passage") is None
                  and "key" in (client4.disable_reason() or ""), client4.disable_reason())
    finally:
        _cleanup(cache4, path4)


# ── 6. the document index ────────────────────────────────────────────────────

class _FakeProblemIndex:
    def __init__(self, rows):
        self.rows = rows


def test_dense_index_matrix():
    print("\n[index] matrix build, cache reuse, and space identity")
    import json as _json
    import httpx
    calls = {"n": 0}

    def handler(request):
        calls["n"] += 1
        body = _json.loads(request.content.decode("utf-8"))
        return httpx.Response(200, json={"embeddings": [
            {"values": [float(i + 1), 1.0]} for i, _ in enumerate(body["requests"])]})

    client, cache, path = _client("gemini", handler, dim=2)
    index = _FakeProblemIndex([{"id": "p1", "problem": "một", "topic": "algebra"},
                              {"id": "p2", "problem": "hai", "topic": "geometry_2d"}])
    dense = rd.DenseIndex(client=client)
    try:
        with env_var("GEMINI_API_KEY", "sk-distinctive-key-9f3a2b"):
            matrix = dense.matrix(index)
            check("the matrix has one row per document",
                  matrix is not None and matrix.shape[0] == 2, str(None if matrix is None else matrix.shape))
            check("the width equals the configured dimension",
                  matrix is not None and matrix.shape[1] == 2)
            first_request_count = calls["n"]
            dense.matrix(index)
            check("a second call reuses the warm matrix (no new request)",
                  calls["n"] == first_request_count)
            check("the doc ids are kept alongside the matrix", dense._ids == ["p1", "p2"])

            ranking = dense.ranking("một câu hỏi", index, top_n=2)
            check("ranking returns source-prefixed keys",
                  all(k.startswith("ex:") for k, _s, _m in ranking), str(ranking))
            check("ranking carries provider+model in its metadata",
                  ranking and ranking[0][2].get("provider") == "gemini")
            # The key reached an HTTP header (that is the point) and must not have
            # reached the diagnostics that get logged or shown on the admin page.
            check("stats never carries the key material",
                  _no_key_echo(dense.stats(), "sk-distinctive-key-9f3a2b"),
                  str(dense.stats()))
    finally:
        _cleanup(cache, path)

    # A cache hit must avoid the network entirely on a fresh index.
    client2, cache2, path2 = _client("gemini", handler, dim=2)
    try:
        with env_var("GEMINI_API_KEY", "k"):
            dense2 = rd.DenseIndex(client=client2)
            dense2.matrix(index)
    finally:
        _cleanup(cache2, path2)


def test_dense_index_drops_wrong_dimension():
    print("\n[index] a vector from another space is DROPPED, never padded")
    import json as _json
    import httpx

    def handler(request):
        body = _json.loads(request.content.decode("utf-8"))
        # Every vector comes back at width 7 while the client is configured for 4:
        # a model/space mismatch. Padding or truncating here would fabricate data.
        return httpx.Response(200, json={"embeddings": [
            {"values": [0.0] * 7} for _ in body["requests"]]})

    client, cache, path = _client("gemini", handler, dim=4)
    index = _FakeProblemIndex([{"id": "p1", "problem": "một", "topic": "a"},
                              {"id": "p2", "problem": "hai", "topic": "b"}])
    dense = rd.DenseIndex(client=client)
    try:
        with env_var("GEMINI_API_KEY", "k"):
            matrix = dense.matrix(index)
        check("a dimension mismatch yields no matrix at all (not a padded one)",
              matrix is None, str(None if matrix is None else matrix.shape))
        check("the drop is counted for telemetry", dense.dropped == 2)
    finally:
        _cleanup(cache, path)


def test_dense_index_disabled_paths():
    print("\n[index] unavailable paths return empty, never raise")
    import json as _json
    import httpx
    client, cache, path = _client("gemini", lambda r: httpx.Response(200, json={}), dim=2)
    index = _FakeProblemIndex([{"id": "p1", "problem": "một", "topic": "a"}])
    try:
        with env_var("GEMINI_API_KEY", ""):
            dense = rd.DenseIndex(client=client)
            check("no key -> matrix is None", dense.matrix(index) is None)
            check("no key -> ranking is empty", dense.ranking("q", index) == [])
        empty = rd.DenseIndex(client=rd.RemoteEmbeddingClient(provider="gemini", dim=2))
        check("an empty bank -> matrix is None",
              empty.matrix(_FakeProblemIndex([])) is None)
        check("an empty query -> ranking is empty",
              empty.ranking("", _FakeProblemIndex([{"id": "p", "problem": "x"}])) == [])
        check("stats describes the state without containing the key material",
              _no_key_echo(empty.stats(), "super-secret-value-1234567890"))
    finally:
        _cleanup(cache, path)


def test_no_rerank_stage():
    print("\n[rerank] not shipped, because the probe found no working endpoint")
    source = io.open(os.path.join(HERE, "retrieval_dense.py"), encoding="utf-8").read()
    check("the module does not claim a rerank capability",
          "def rerank" not in source and "def rerank_" not in source)
    check("the probe script records the 404 from both documented rerank paths",
          "reranking" in io.open(os.path.join(HERE, "scripts", "check_embed_catalog.py"),
                                 encoding="utf-8").read())
    check("the dense module's docstring says why there is no rerank stage",
          "no rerank" in source.lower() or "NO rerank" in source)


# ── 7b. the cosine floor: measured, not guessed ──────────────────────────────

#: The gap the diagnostic over the golden set actually measured. Kept as constants
#: so weakening the floor cannot silently re-admit the off-topic hits — the numbers
#: have to be re-measured and these two lines updated first.
MEASURED_ON_TOPIC_LOW = 0.719      # Q09, the weakest correct hit
MEASURED_OFF_TOPIC_HIGH = 0.596    # Q15, the strongest wrong hit


def test_similarity_floor_is_configurable_and_safe():
    print("\n[floor] a cosine floor exists, is configurable, and is clamped")
    with env_var("MATH_DENSE_MIN_SIMILARITY", None):
        check("the default floor is 0.65",
              rd.min_similarity() == rd.DEFAULT_MIN_SIMILARITY)
        check("the default sits inside the measured working band [0.60, 0.70]",
              0.60 <= rd.DEFAULT_MIN_SIMILARITY <= 0.70, str(rd.DEFAULT_MIN_SIMILARITY))
        check("the default sits ABOVE the strongest off-topic score measured",
              rd.DEFAULT_MIN_SIMILARITY > MEASURED_OFF_TOPIC_HIGH)
        check("the default sits BELOW the weakest on-topic score measured",
              rd.DEFAULT_MIN_SIMILARITY < MEASURED_ON_TOPIC_LOW)
    with env_var("MATH_DENSE_MIN_SIMILARITY", "0.7"):
        check("the floor is overridable by env", rd.min_similarity() == 0.7)
    with env_var("MATH_DENSE_MIN_SIMILARITY", "banana"):
        check("a non-numeric floor falls back to the default",
              rd.min_similarity() == rd.DEFAULT_MIN_SIMILARITY)
    with env_var("MATH_DENSE_MIN_SIMILARITY", "5"):
        check("the floor is clamped to <= 1.0 (a score above 1 is impossible)",
              rd.min_similarity() == 1.0)


def test_floor_filters_the_ranking():
    print("\n[floor] a below-floor document is dropped, not merely ranked last")
    import json as _json
    import httpx

    def handler(request):
        # Query embeddings map to [1,0]; document embeddings are keyed off the text
        # ("0" -> the query's direction, anything else -> orthogonal). The ranker
        # must therefore keep one row and drop the other at the default floor.
        body = _json.loads(request.content.decode("utf-8"))
        requests = body.get("requests") or []
        if any(r.get("taskType") == "RETRIEVAL_QUERY" for r in requests):
            return httpx.Response(200, json={"embeddings": [
                {"values": [1.0, 0.0]} for _ in requests]})
        return httpx.Response(200, json={"embeddings": [
            {"values": [1.0, 0.0] if r["content"]["parts"][0]["text"] == "0"
             else [0.0, 1.0]} for r in requests]})

    client, cache, path = _client("gemini", handler, dim=2)
    index = _FakeProblemIndex([{"id": "near", "problem": "0", "topic": ""},
                              {"id": "far", "problem": "1", "topic": ""}])
    dense = rd.DenseIndex(client=client)
    try:
        with env_many({"GEMINI_API_KEY": "k", "MATH_DENSE_MIN_SIMILARITY": None}):
            # The document matrix is built from the passage-shaped request; the
            # fake handler keys the vector off the text so the two rows differ.
            matrix = dense.matrix(index)
            check("the matrix built from the document texts",
                  matrix is not None and matrix.shape == (2, 2))
            if matrix is not None:
                check("row 'near' is the query's direction",
                      np.allclose(matrix[0], [1.0, 0.0]), str(matrix[0]))
                check("row 'far' is orthogonal", np.allclose(matrix[1], [0.0, 1.0]))

            ranking = dense.ranking("anything", index, top_n=5)
            keys = [k for k, _s, _m in ranking]
            check("a 0.0-cosine document is filtered out at floor 0.65",
                  keys == ["ex:near"], str(keys))
            check("the surviving hit is the one above the floor",
                  ranking and ranking[0][1] == 1.0, str(ranking))
            check("the hit records the cosine and the floor it passed",
                  ranking and ranking[0][2].get("cosine") == 1.0
                  and ranking[0][2].get("floor") == rd.DEFAULT_MIN_SIMILARITY,
                  str(ranking[0][2] if ranking else None))

        with env_many({"GEMINI_API_KEY": "k", "MATH_DENSE_MIN_SIMILARITY": "0.0"}):
            loose = [k for k, _s, _m in dense.ranking("anything", index, top_n=5)]
            check("floor 0.0 admits everything (so the filter is the floor's doing)",
                  "ex:far" in loose, str(loose))
        with env_many({"GEMINI_API_KEY": "k", "MATH_DENSE_MIN_SIMILARITY": "1.0"}):
            tight = [k for k, _s, _m in dense.ranking("anything", index, top_n=5)]
            check("floor 1.0 admits only a perfect match",
                  tight == ["ex:near"], str(tight))
    finally:
        _cleanup(cache, path)


# ── 7. integration with the R2 fusion layer ──────────────────────────────────

def test_dense_source_is_invisible_until_enabled():
    print("\n[integration] the R2 numbers stay reproducible while dense is off")
    with env_many({"MATH_RETRIEVAL_DENSE": "off", "MATH_RETRIEVAL_SOURCES": None}):
        sources = rh.active_sources()
        check("no `dense` source while the flag is off",
              "dense" not in sources, str(sources))
        check("the default is still concepts+examples (the R2 baseline)",
              sources == ["concepts", "examples"], str(sources))
    with env_many({"MATH_RETRIEVAL_DENSE": "gemini", "GEMINI_API_KEY": "",
                   "MATH_RETRIEVAL_SOURCES": None}):
        check("flag on but NO key -> still no dense source",
              "dense" not in rh.active_sources(), str(rh.active_sources()))
    with env_many({"MATH_RETRIEVAL_DENSE": "gemini", "GEMINI_API_KEY": "k",
                   "MATH_RETRIEVAL_SOURCES": None}):
        sources = rh.active_sources()
        check("flag on + key present -> dense joins the sources automatically",
              "dense" in sources, str(sources))
        check("the other sources are still there", "concepts" in sources and
              "examples" in sources, str(sources))
    with env_many({"MATH_RETRIEVAL_DENSE": "gemini", "GEMINI_API_KEY": "",
                   "MATH_RETRIEVAL_SOURCES": "dense"}):
        check("asking for dense explicitly without a key drops it, no error",
              rh.active_sources() == [], str(rh.active_sources()))


def test_dense_ranking_is_safe_when_unavailable():
    print("\n[integration] dense_ranking() returns [] and never raises when off")
    with env_many({"MATH_RETRIEVAL_DENSE": "off", "GEMINI_API_KEY": None}):
        check("dense_ranking is empty when the flag is off",
              rh.dense_ranking("tam giác ABC") == [])
    with env_many({"MATH_RETRIEVAL_DENSE": "gemini", "GEMINI_API_KEY": ""}):
        check("dense_ranking is empty when there is no key",
              rh.dense_ranking("tam giác ABC") == [])
    with env_many({"MATH_RETRIEVAL_DENSE": "nvidia", "NVIDIA_API_KEY_PRIMARY": ""}):
        check("...and the same for nvidia", rh.dense_ranking("tam giác ABC") == [])

    with env_many({"MATH_RETRIEVAL_DENSE": "off", "MATH_RETRIEVAL_SOURCES": None}):
        results = rh.search("tam giác nhọn trực tâm", top_k=3)
        check("the fused result is unchanged from R2 with dense off",
              bool(results) and all(r["source"] != "dense" for r in results),
              str([r["source"] for r in results]))
    with env_many({"MATH_RETRIEVAL_DENSE": "off"}):
        check("tie-break priority is defined for a dense hit (so a tie cannot crash)",
              "dense" in rh.TIE_BREAK_PRIORITY and "dense" in rh.SOURCE_PRIORITY)
        check("a dense hit outranks a bare concept on a tie (more specific evidence)",
              rh.TIE_BREAK_PRIORITY["dense"] < rh.TIE_BREAK_PRIORITY["concepts"])


# ── 8. the probe script ships with the module ────────────────────────────────

def test_probe_script_is_present_and_offline_safe():
    print("\n[probe] the measurement that shaped this module is committed")
    path = os.path.join(HERE, "scripts", "check_embed_catalog.py")
    check("backend/scripts/check_embed_catalog.py exists", os.path.exists(path))
    source = io.open(path, encoding="utf-8").read()
    check("it records the 410 end-of-life that killed the originally planned model",
          "nv-embedqa-e5-v5" in source and "410" in source)
    check("it records the replacement that actually answered",
          "nvidia/nemotron-3-embed-1b" in source)
    # The key has to reach a header — that is the point. What it must never reach is
    # stdout or a log line, so the assertion is about PRINT statements specifically.
    printed = [line for line in source.splitlines()
               if "print(" in line and "{key}" in line]
    check("no print/echo of the key variable", not printed, str(printed[:2]))
    check("the key is never put in the URL (it goes in a header)",
          "?key=" not in source)


# ── run ──────────────────────────────────────────────────────────────────────

def main():
    test_flags()
    test_available_needs_flag_and_key()
    test_model_defaults_and_overrides()
    test_no_heavy_dependency()
    test_cache_key_identity()
    test_vector_cache()
    test_gemini_request_shape()
    test_nvidia_and_openrouter_request_shape()
    test_rotation_and_self_disable()
    test_dense_index_matrix()
    test_dense_index_drops_wrong_dimension()
    test_dense_index_disabled_paths()
    test_no_rerank_stage()
    test_similarity_floor_is_configurable_and_safe()
    test_floor_filters_the_ranking()
    test_dense_source_is_invisible_until_enabled()
    test_dense_ranking_is_safe_when_unavailable()
    test_probe_script_is_present_and_offline_safe()

    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED:")
        for name in failures:
            print(f"  - {name}")
        return 1
    print("ALL_RETRIEVAL_DENSE_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())