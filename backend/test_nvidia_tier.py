"""
test_nvidia_tier.py
===================
P12 — offline suite for the NVIDIA NIM tier (math reasoning between Groq and
OpenRouter) and the coding helper behind the MathViz repair path.

What is asserted (source-level: main.py cannot be imported offline):
  * `NVIDIA_BASE` points at the documented NIM endpoint and the key pool is
    built from NVIDIA_API_KEY_PRIMARY + NVIDIA_API_KEY_SECONDARY;
  * `_nvidia_chat` keeps the P8 lessons: a 3072-token FLOOR for reasoning
    models, `.get("content")` so a 200-without-content falls through instead of
    raising KeyError, and a RuntimeError (never a silent empty reply) when
    every model failed;
  * the Tier 2.5 block sits BETWEEN Tier 2 (Groq) and Tier 3 (OpenRouter) in
    the source, and obeys the same three rules as every tier: gate at
    CHAT_TIER_MIN_S, clamp to (remaining - CHAT_LOCAL_FLOOR_S), skipped for a
    blind image;
  * the MathViz repair path asks the NVIDIA coder FIRST and only then requires
    OPENROUTER_API_KEY;
  * /api/health publishes the nvidia tier, and the env var is declared for
    Render + .env.example. No real key material sits in main.py.

Run:  python backend/test_nvidia_tier.py
"""

import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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


BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
with io.open(os.path.join(BACKEND_DIR, "main.py"), encoding="utf-8") as fh:
    MAIN = fh.read()

_COMMENT_RE = re.compile(r"/\*[\s\S]*?\*/|(?<![:'\"`])#[^\n]*")


def strip_comments(source: str) -> str:
    return _COMMENT_RE.sub("", source)


def segment(source: str, start_marker: str, end_marker: str) -> str:
    start = source.find(start_marker)
    end = source.find(end_marker, start + len(start_marker)) if start > -1 else -1
    return source[start:end] if start > -1 and end > start else ""


def test_constants_and_pool():
    print("\n[constants + pool]")
    clean = strip_comments(MAIN)
    check("the NIM endpoint is the documented one",
          'NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"' in MAIN)
    check("the pool reads BOTH NVIDIA key variables",
          "NVIDIA_KEY_POOL = key_pool.KeyPool(" in MAIN
          and 'os.environ.get("NVIDIA_API_KEY_PRIMARY", "")' in MAIN
          and 'os.environ.get("NVIDIA_API_KEY_SECONDARY", "")' in MAIN)
    check("every NVIDIA POST goes through the pool rotation helper",
          "async def _nvidia_post_with_key_rotation" in clean)
    start = clean.find("async def _nvidia_post_with_key_rotation")
    helper = clean[start:start + 2200]
    check("...it snapshots the pool order once per request",
          "NVIDIA_KEY_POOL.request_order() or" in helper)
    check("...it records every response against the key that sent it",
          "NVIDIA_KEY_POOL.note_response(_key, last.status_code, last.headers)" in helper)
    check("...and it stops after the LAST key",
          "or _i == len(keys) - 1" in helper and "retryable(last.status_code)" in helper)


def test_nvidia_chat_contract():
    print("\n[nvidia_chat contract]")
    clean = strip_comments(MAIN)
    start = clean.find("async def _nvidia_chat")
    check("the chat helper exists", start > -1)
    body = clean[start:start + 2200]
    check("reasoning models keep the 3072-token FLOOR (the P8 lesson)",
          "max(3072, int(max_tokens))" in body)
    check("a 200 without content falls through instead of raising KeyError",
          '.get("content")' in body and 'content rong' in body and "continue" in body)
    check("a network error moves to the next model, not out of the tier",
          "continue" in body and "loi mang" in body)
    check("exhausting every model raises (the caller moves tier)",
          "every configured NVIDIA model failed" in body)
    check("it returns (content, model_used)",
          "return content, model" in body)


def test_tier_25_placement_and_rules():
    print("\n[Tier 2.5 placement + rules]")
    clean = strip_comments(MAIN)
    i_groq = MAIN.find("Tier 2 Fallback: Groq")
    i_nv = MAIN.find("Tier 2.5 Fallback: NVIDIA")
    i_or = MAIN.find("Tier 3 Fallback: OpenRouter")
    check("the NVIDIA tier runs after Groq and before OpenRouter",
          -1 < i_groq < i_nv < i_or, f"{i_groq} {i_nv} {i_or}")
    # Both bounds live in COMMENTS ("# ── Tier 2.5 …"), which strip_comments()
    # removes — so the segment must be cut from the raw source.
    _seg = MAIN.find("Tier 2.5: NVIDIA NIM")
    _end = MAIN.find("Tier 3 Fallback: OpenRouter", _seg)
    tier = MAIN[_seg:_end] if _seg > -1 and _end > _seg else ""
    check("it is gated like every tier (P1 rules)",
          "NVIDIA_KEY_POOL.has_keys() and not _blind_image" in tier
          and "and _budget.remaining() >= chat_budget.CHAT_TIER_MIN_S" in tier
          and "_budget.remaining() < chat_budget.CHAT_TIER_MIN_S" in tier)
    # P12-fix — the gate above reads `_blind_image`; for a TEXT-only request the
    # variable used to be unset until the image branch ran, so a text chat whose
    # Groq tier failed crashed with UnboundLocalError (500) instead of falling
    # through. It must be initialised before the first gate (found live).
    check("_blind_image is initialised for TEXT-only requests too (P12-fix)",
          "_blind_image = False" in clean
          and -1 < clean.find("_blind_image = False") < clean.find("not _blind_image"))
    check("it clamps its timeout and reserves the local floor",
          "_nv_timeout = max(5.0, min(chat_budget.CHAT_GEN_MODEL_TIMEOUT_S," in tier
          and "_budget.remaining() - chat_budget.CHAT_LOCAL_FLOOR_S" in tier)
    check("it trims the context and floors max_tokens for its reasoning models",
          "_nv_messages = fallback_policy.trim_for_tier(" in tier
          and "max(3072, fallback_policy.fallback_max_tokens(" in tier)
    check("it records the answering tier as nvidia",
          '_answered.update(provider="nvidia", model=_nv_used)' in tier)
    check("its math ladder is configurable and defaults to the two Nemotrons",
          '"NVIDIA_MATH_MODELS"' in tier
          and "nvidia/nemotron-3-super-120b-a12b,nvidia/nemotron-3-nano-omni-30b-a3b-reasoning" in MAIN)


def test_coder_and_repair_path():
    print("\n[coder + repair path]")
    clean = strip_comments(MAIN)
    start = clean.find("async def _nvidia_coder")
    check("the coder helper exists", start > -1)
    body = clean[start:start + 900]
    check("it refuses to run without keys (returns None, never raises)",
          "if not NVIDIA_KEY_POOL.has_keys():" in body and "return None" in body)
    check("its coding ladder is configurable with the verified defaults",
          '"NVIDIA_CODE_MODELS", "poolside/laguna-xs-2.1,openai/gpt-oss-20b"' in body)
    repair = segment(MAIN, "async def _repair_mathviz_with_free_openrouter",
                     "\n\n@lru_cache")
    check("the MathViz repair path asks the NVIDIA coder FIRST",
          "_nvidia_coder(prompt, max_tokens=1500, timeout=25.0)" in repair)
    check("...and a valid repaired payload short-circuits before OpenRouter",
          "fixed widget '{widget}'" in repair
          and repair.find("_nvidia_coder(prompt") < repair.find("if not openrouter_key"))
    check("...OpenRouter is only REQUIRED after the NVIDIA attempt",
          "if not openrouter_key:\n        return None" in repair)


def test_health_and_env():
    print("\n[health + env]")
    clean = strip_comments(MAIN)
    check("health publishes the nvidia tier when keys are set",
          "f\"nvidia:{os.environ.get('NVIDIA_MATH_MODELS'" in clean
          and "if NVIDIA_KEY_POOL.has_keys() else" in clean)
    with io.open(os.path.join(BACKEND_DIR, ".env.example"), encoding="utf-8") as fh:
        example = fh.read()
    check(".env.example declares both NVIDIA keys + ladders",
          "NVIDIA_API_KEY_PRIMARY" in example and "NVIDIA_API_KEY_SECONDARY" in example
          and "NVIDIA_MATH_MODELS" in example and "NVIDIA_CODE_MODELS" in example)
    with io.open(os.path.join(BACKEND_DIR, "render.yaml"), encoding="utf-8") as fh:
        render = fh.read()
    check("render.yaml declares the same (keys sync:false)",
          "NVIDIA_API_KEY_PRIMARY" in render and "sync: false" in render
          and "NVIDIA_MATH_MODELS" in render and "NVIDIA_CODE_MODELS" in render)
    check("no real key material is committed in main.py",
          re.search(r"nvapi-[A-Za-z0-9_\-]{12}", MAIN) is None)


def main():
    print("=== NVIDIA tier tests (offline) ===")
    test_constants_and_pool()
    test_nvidia_chat_contract()
    test_tier_25_placement_and_rules()
    test_coder_and_repair_path()
    test_health_and_env()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_NVIDIA_TIER_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
