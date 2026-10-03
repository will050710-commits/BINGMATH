"""
check_embed_catalog.py
======================
R3 of DUOMATH_HYBRIDRAG_PLAN.md — verify the embedding endpoints BEFORE believing
the plan.

Why this exists
---------------
The plan proposed `nvidia/nv-embedqa-e5-v5` as the primary embedding model and
`nvidia/nv-rerankqa-mistral-4b-v3` as a free reranker, both on the NVIDIA key the
repo already has. Running this script found out otherwise:

    nvidia/nv-embedqa-e5-v5            -> HTTP 410, end-of-life 2026-08-25
    nvidia/nv-embedqa-mistral-7b-v2    -> HTTP 404 "not found for account"
    nvidia/llama-3.2-nv-embedqa-1b-v1  -> HTTP 404 not enabled for the account
    nvidia/embed-qa-4                  -> HTTP 404 not enabled for the account
    nvidia/nemotron-3-embed-1b         -> HTTP 200, dim 2048
    gemini-embedding-001               -> HTTP 200, dim 3072 (768 on request)
    /v1/ranking, /v1/reranking         -> HTTP 404 "page not found" (no reranker)

That is why `retrieval_dense.py` ships Gemini first, NVIDIA second, and no rerank
stage: the ordered list is a measurement, not a preference. Run this again whenever
a provider changes its catalogue — a dead embedding model fails the way a dead chat
slug does, except silently (retrieval just gets worse).

Usage
-----
    python backend/scripts/check_embed_catalog.py
    python backend/scripts/check_embed_catalog.py --json docs/embed_catalog_2026-10.json

Exit: 0 when every provider that HAS a key answered, 1 when none did. A provider
with no key reports "skipped" rather than failing — the same convention as
`check_free_catalog.py`, so the script is honest about what it could not test.
"""

import argparse
import io
import json
import os
import sys
from typing import Dict, List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.dirname(HERE)
sys.path.insert(0, BACKEND)

NVIDIA_MODELS_URL = "https://integrate.api.nvidia.com/v1/models"
NVIDIA_EMBED_URL = "https://integrate.api.nvidia.com/v1/embeddings"
GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_EMBED_URL = ("https://generativelanguage.googleapis.com/v1beta/models/"
                    "{model}:embedContent")

#: Candidates worth trying, best-known first. Data, so a future edit is one line.
NVIDIA_CANDIDATES = (
    "nvidia/nemotron-3-embed-1b",
    "nvidia/nv-embedqa-e5-v5",
    "nvidia/nv-embedqa-mistral-7b-v2",
    "nvidia/llama-3.2-nv-embedqa-1b-v1",
    "nvidia/embed-qa-4",
)
GEMINI_CANDIDATES = ("gemini-embedding-001", "gemini-embedding-2")
RERANK_PATHS = ("https://integrate.api.nvidia.com/v1/ranking",
                "https://integrate.api.nvidia.com/v1/reranking")

PROBE_TEXT = "tam giác ABC nhọn, trực tâm H"


def _env_file() -> Dict[str, str]:
    """Read backend/.env without echoing anything from it."""
    out: Dict[str, str] = {}
    path = os.path.join(BACKEND, ".env")
    if not os.path.exists(path):
        return out
    for line in io.open(path, encoding="utf-8", errors="replace"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            out[key.strip()] = value.strip().strip('"').strip("'")
    return out


def _key(env: Dict[str, str], name: str) -> str:
    return (os.environ.get(name) or env.get(name) or "").strip()


# ── providers ────────────────────────────────────────────────────────────────

def probe_nvidia(key: str) -> Dict[str, object]:
    import httpx
    result: Dict[str, object] = {"provider": "nvidia", "skipped": not key,
                                 "catalog": None, "embedding": [], "rerank": []}
    if not key:
        return result
    with httpx.Client(timeout=45.0) as client:
        try:
            catalog = client.get(NVIDIA_MODELS_URL,
                                 headers={"Authorization": f"Bearer {key}"})
            if catalog.status_code == 200:
                ids = sorted(m.get("id", "") for m in catalog.json().get("data", []))
                result["catalog"] = {
                    "status": 200, "total": len(ids),
                    "embedding_models": [i for i in ids if "embed" in i.lower()],
                    "rerank_models": [i for i in ids if "rerank" in i.lower()],
                }
        except Exception as exc:
            result["catalog"] = {"status": None, "error": type(exc).__name__}

        for model in NVIDIA_CANDIDATES:
            entry: Dict[str, object] = {"model": model}
            try:
                response = client.post(
                    NVIDIA_EMBED_URL,
                    headers={"Authorization": f"Bearer {key}",
                             "Content-Type": "application/json"},
                    json={"model": model, "input": [PROBE_TEXT],
                          "input_type": "query", "encoding_format": "float"})
                entry["status"] = response.status_code
                if response.status_code == 200:
                    entry["dim"] = len(response.json()["data"][0]["embedding"])
                else:
                    try:
                        entry["detail"] = str(response.json().get("detail", ""))[:120]
                    except Exception:
                        entry["detail"] = response.text[:120]
            except Exception as exc:
                entry["status"] = None
                entry["error"] = type(exc).__name__
            result["embedding"].append(entry)

        for url in RERANK_PATHS:
            try:
                response = client.post(
                    url, headers={"Authorization": f"Bearer {key}",
                                  "Content-Type": "application/json"},
                    json={"model": "nvidia/nv-rerankqa-mistral-4b-v3",
                          "query": {"text": PROBE_TEXT},
                          "passages": [{"text": "tam giác"}, {"text": "phương trình"}]})
                result["rerank"].append({"path": url.rsplit("/", 1)[-1],
                                         "status": response.status_code})
            except Exception as exc:
                result["rerank"].append({"path": url.rsplit("/", 1)[-1],
                                         "status": None, "error": type(exc).__name__})
    return result


def probe_gemini(key: str) -> Dict[str, object]:
    import httpx
    result: Dict[str, object] = {"provider": "gemini", "skipped": not key,
                                 "catalog": None, "embedding": []}
    if not key:
        return result
    with httpx.Client(timeout=45.0) as client:
        try:
            catalog = client.get(GEMINI_MODELS_URL, headers={"x-goog-api-key": key})
            if catalog.status_code == 200:
                names = sorted(m.get("name", "").split("/")[-1]
                               for m in catalog.json().get("models", []))
                result["catalog"] = {
                    "status": 200, "total": len(names),
                    "embedding_models": [n for n in names if "embed" in n.lower()],
                }
        except Exception as exc:
            result["catalog"] = {"status": None, "error": type(exc).__name__}

        for model in GEMINI_CANDIDATES:
            entry: Dict[str, object] = {"model": model}
            try:
                response = client.post(
                    GEMINI_EMBED_URL.format(model=model),
                    headers={"x-goog-api-key": key, "Content-Type": "application/json"},
                    json={"model": f"models/{model}",
                          "content": {"parts": [{"text": PROBE_TEXT}]},
                          "taskType": "RETRIEVAL_QUERY"})
                entry["status"] = response.status_code
                if response.status_code == 200:
                    entry["dim"] = len(response.json()["embedding"]["values"])
                else:
                    entry["detail"] = response.text[:120]
            except Exception as exc:
                entry["status"] = None
                entry["error"] = type(exc).__name__
            result["embedding"].append(entry)
    return result


# ── report ───────────────────────────────────────────────────────────────────

def _verdict(provider_result: Dict[str, object]) -> str:
    if provider_result.get("skipped"):
        return "skipped (no key)"
    working = [e for e in provider_result.get("embedding", []) if e.get("status") == 200]
    return "OK" if working else "NO WORKING MODEL"


def report(providers: List[Dict[str, object]], emit_json: str = None) -> int:
    print("=" * 78)
    print("EMBEDDING CATALOG PROBE (R3) - measurement, not a model card")
    print("=" * 78)

    for entry in providers:
        print(f"\n[{entry.get('provider')}] {_verdict(entry)}")
        if entry.get("catalog"):
            print(f"    catalog: {entry['catalog']}")
        for model in entry.get("embedding", []):
            extra = (f"dim={model['dim']}" if model.get("dim")
                     else model.get("detail", model.get("error", "")))
            print(f"    {'OK  ' if model.get('status') == 200 else 'FAIL'} "
                  f"{model['model']:<46} {model.get('status')} {str(extra)[:70]}")
        for probe in entry.get("rerank", []) or []:
            print(f"    rerank /{probe['path']:<10} {probe.get('status')} "
                  f"{probe.get('error', '')}")

    tested = [p for p in providers if not p.get("skipped")]
    working = [p for p in tested if _verdict(p) == "OK"]
    print("\n" + "=" * 78)
    print(f"providers with a key: {len(tested)}   working: {len(working)}")
    for entry in providers:
        if not entry.get("skipped"):
            models = [e["model"] for e in entry.get("embedding", [])
                      if e.get("status") == 200]
            print(f"  {entry['provider']:<10} -> {models}")
    print("=" * 78)

    if emit_json:
        with io.open(emit_json, "w", encoding="utf-8", newline="\n") as handle:
            json.dump({"providers": providers}, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        print(f"[check_embed_catalog] wrote {emit_json}")

    return 0 if working else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Probe the embedding endpoints")
    parser.add_argument("--json", dest="emit_json", default=None)
    args = parser.parse_args()

    env = _env_file()
    providers = [
        probe_nvidia(_key(env, "NVIDIA_API_KEY_PRIMARY")),
        probe_gemini(_key(env, "GEMINI_API_KEY")),
    ]
    return report(providers, args.emit_json)


if __name__ == "__main__":
    sys.exit(main())