"""
test_key_pool.py
================
P11 — offline suite for `key_pool.py`, the multi-key pool behind the free
provider tiers (Groq today; the NVIDIA keys join the same shape in P12).

What is asserted:
  * `parse_keys` survives the shapes real dashboards produce: comma lists,
    semicolons, newlines, stray spaces, duplicates, a missing variable;
  * `key_id` never leaks more than the last four characters;
  * `parse_reset_duration` reads what Groq/Cerebras actually send
    (`"1s"`, `"120ms"`, `"2m59.56s"`, `"1h"`) and refuses garbage;
  * `cooldown_seconds` prefers `retry-after`, then the longest
    `x-ratelimit-reset-*`, parks 401/403 for an hour, and clamps;
  * the pool itself (injected clock — no sleeping): a 429 moves the NEXT
    request to the other key and the key comes back when its cooldown
    expires; a 200 clears it again; `snapshot()` never contains a key;
  * main.py still WIRES it: Groq headers read the pool, every plain Groq
    POST goes through the rotation helper, the stream rotates keys before
    models, and the env var is declared for Render + `.env.example`;
  * no real key material sits in main.py (a gsk_/nvapi-/sk-or- literal).

Pure stdlib + source reads (no fastapi, no network), same discipline as the
other offline guards.

Run:  python backend/test_key_pool.py
"""

import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import key_pool as kp  # noqa: E402

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

# Comments quote old strings on purpose; the guards below test code, not prose
# (same approach as the frontend .mjs guards).
_COMMENT_RE = re.compile(r"/\*[\s\S]*?\*/|(?<![:'\"`])#[^\n]*")


def strip_comments(source: str) -> str:
    return _COMMENT_RE.sub("", source)


class FakeClock:
    """Injectable monotonic clock so cooldowns can be tested without sleeping."""

    def __init__(self, start: float = 1000.0):
        self.t = start

    def __call__(self) -> float:
        return self.t

    def tick(self, seconds: float) -> None:
        self.t += seconds


# ── 1. parsing the environment ──────────────────────────────────────────────

def test_parse_keys():
    print("\n[parse_keys]")
    check("a comma list splits in order", kp.parse_keys("a,b,c") == ["a", "b", "c"])
    check("spaces, semicolons and newlines all count",
          kp.parse_keys("a, b;;c\nd") == ["a", "b", "c", "d"])
    check("duplicates are dropped, order preserved", kp.parse_keys("a,a,b,a") == ["a", "b"])
    check("None, empty and blank values produce no keys",
          kp.parse_keys(None, "", "   ") == [])
    check("a missing secondary variable leaves the primary alone",
          kp.parse_keys("k1", None) == ["k1"])
    check("two variables merge, first one wins on duplicates",
          kp.parse_keys("k1", "k2,k1") == ["k1", "k2"])


def test_key_id():
    print("\n[key_id]")
    kid = kp.key_id("gsk_abcdefgh1234")
    check("only the last four characters are shown", kid == "…1234", kid)
    check("the secret body never appears", "abcdefgh" not in kid)
    check("short and empty values are marked, not echoed",
          kp.key_id("ab") == "(short)" and kp.key_id("") == "(short)")


# ── 2. provider reset headers → seconds ─────────────────────────────────────

def test_reset_duration():
    print("\n[reset_duration]")
    check('"1s" is one second', kp.parse_reset_duration("1s") == 1.0)
    check('"120ms" is 0.12 s', abs(kp.parse_reset_duration("120ms") - 0.12) < 1e-9)
    check('"2m59.56s" (a real Groq x-ratelimit-reset-tokens) is 179.56 s',
          abs((kp.parse_reset_duration("2m59.56s") or 0) - 179.56) < 0.01)
    check('"1h2m" sums its parts', kp.parse_reset_duration("1h2m") == 3720.0)
    check("garbage is refused, not guessed",
          kp.parse_reset_duration("soon") is None
          and kp.parse_reset_duration("") is None
          and kp.parse_reset_duration(None) is None)


def test_cooldown_seconds():
    print("\n[cooldown_seconds]")
    check("retry-after wins when present",
          kp.cooldown_seconds(429, {"retry-after": "17"}) == 17.0)
    check("retry-after may be a duration string too",
          kp.cooldown_seconds(429, {"Retry-After": "1m30s"}) == 90.0)
    check("without retry-after, the LONGEST x-ratelimit-reset-* is the safe one",
          abs(kp.cooldown_seconds(429, {"x-ratelimit-reset-tokens": "2m59.56s",
                                        "x-ratelimit-reset-requests": "1s"}) - 179.56) < 0.01)
    check("no header at all falls back to the default minute",
          kp.cooldown_seconds(429, {}) == kp.DEFAULT_COOLDOWN_S
          and kp.cooldown_seconds(413, {}) == kp.DEFAULT_COOLDOWN_S)
    check("a revoked/forbidden key is parked for an hour",
          kp.cooldown_seconds(401, {"retry-after": "5"}) == kp.INVALID_KEY_COOLDOWN_S
          and kp.cooldown_seconds(403, {}) == kp.INVALID_KEY_COOLDOWN_S)
    check("absurd values are clamped high", 
          kp.cooldown_seconds(429, {"retry-after": "999999"}) == kp.MAX_COOLDOWN_S)
    check("a zero retry-after still waits a second",
          kp.cooldown_seconds(429, {"retry-after": "0"}) == 1.0)


# ── 3. pool behaviour (injected clock — no sleeping) ────────────────────────

def test_retryable_statuses():
    print("\n[retryable]")
    check("the retryable set is exactly the key-level failures",
          kp.RETRYABLE_STATUSES == (401, 403, 413, 429))
    check("key-level failures are retryable",
          all(kp.KeyPool.retryable(s) for s in (401, 403, 413, 429)))
    check("body errors and successes are NOT key problems",
          not any(kp.KeyPool.retryable(s) for s in (200, 400, 422, 500, 503)))


def test_pool_empty():
    print("\n[empty pool]")
    clock = FakeClock()
    pool = kp.KeyPool([], clock=clock)
    check("no keys means no active key", pool.active() == "" and not pool.has_keys())
    check("no keys means no rotation order", pool.request_order() == [])
    check("no keys means an empty snapshot", pool.snapshot() == [])
    check("bookkeeping on an empty pool is a no-op (never raises)",
          pool.note_response("", 429) is None
          and pool.note_response("x", 429, None) is None
          and pool.note_ok("x") is None)


def test_pool_rotation_and_recovery():
    print("\n[rotation + recovery]")
    clock = FakeClock()
    pool = kp.KeyPool(["K1", "K2"], clock=clock)
    check("a fresh pool starts on the first key", pool.active() == "K1")
    check("order is the configured order while both are live",
          pool.request_order() == ["K1", "K2"])

    pool.note_response("K1", 429, {"retry-after": "30"})
    check("a 429 cools the FIRST key; the next request moves to the second",
          pool.active() == "K2" and pool.request_order() == ["K2", "K1"])
    snap = pool.snapshot()
    check("the snapshot shows the cooling state and the remaining seconds",
          snap[0]["state"] == "cooling" and snap[0]["cooldown_left_s"] == 30.0
          and snap[1]["state"] == "live", snap)
    check("the snapshot never contains the key itself",
          all(item["id"] not in ("K1", "K2") for item in snap))
    check("the cooling key stays in the order (last, not dropped)",
          "K1" in pool.request_order() and pool.request_order()[-1] == "K1")

    clock.tick(31)
    check("once the cooldown expires the key comes back first",
          pool.active() == "K1" and pool.request_order() == ["K1", "K2"])

    pool.note_response("K2", 200)
    snap = pool.snapshot()
    check("a 200 keeps the key live with zero failures",
          snap[1]["state"] == "live" and snap[1]["failures"] == 0)


def test_pool_all_cooling_and_401():
    print("\n[all cooling / invalid keys]")
    clock = FakeClock()
    pool = kp.KeyPool(["K1", "K2"], clock=clock)
    pool.note_response("K1", 429, {"retry-after": "30"})
    pool.note_response("K2", 429, {"retry-after": "10"})
    check("with every key cooling, the soonest-recovering one is chosen",
          pool.active() == "K2" and pool.request_order() == ["K2", "K1"])
    check("failure counters accumulate per key",
          pool.snapshot()[0]["failures"] == 1 and pool.snapshot()[1]["failures"] == 1)

    pool2 = kp.KeyPool(["P1", "P2"], clock=clock)
    pool2.note_response("P1", 401)
    check("401 parks the key for a long time (not a one-minute nap)",
          pool2.active() == "P2"
          and pool2.snapshot()[0]["cooldown_left_s"] == kp.INVALID_KEY_COOLDOWN_S)
    pool2.note_ok("P1")
    check("a successful call clears the parked key completely",
          pool2.active() == "P1" and pool2.snapshot()[0]["state"] == "live")

    pool3 = kp.KeyPool(["N1", "N2"], clock=clock)
    pool3.note_response("N1", 500)
    check("a 500 is not treated as a key failure (no cooldown, same order)",
          pool3.active() == "N1" and pool3.request_order() == ["N1", "N2"])


# ── 4. the wiring in main.py / env files ────────────────────────────────────

def test_main_wiring():
    print("\n[main.py wiring]")
    clean = strip_comments(MAIN)
    check("main.py imports the pool module", "import key_pool" in MAIN)
    check("the Groq pool is built from BOTH key variables",
          "GROQ_KEY_POOL = key_pool.KeyPool(" in MAIN
          and 'os.environ.get("GROQ_API_KEY", "")' in MAIN
          and 'os.environ.get("GROQ_API_KEY_SECONDARY", "")' in MAIN)
    check("groq_headers() reads the pool's active key (the cache-global is gone)",
          "return key_pool.headers_for(key or GROQ_KEY_POOL.active())" in clean
          and "_groq_headers_cache" not in clean)
    check("the rotation helper exists",
          "async def _groq_post_with_key_rotation" in clean)
    start = clean.find("async def _groq_post_with_key_rotation")
    helper = clean[start:start + 2200]
    check("...it snapshots the pool order once per request",
          "GROQ_KEY_POOL.request_order() or" in helper)
    check("...it records every response against the key that sent it",
          "GROQ_KEY_POOL.note_response(_key, last.status_code, last.headers)" in helper)
    check("...and it stops after the LAST key instead of looping forever",
          "or _i == len(keys) - 1" in helper and "retryable(last.status_code)" in helper)
    check("all four plain Groq POST sites go through the helper (def + 4 calls)",
          clean.count("_groq_post_with_key_rotation(") >= 5,
          str(clean.count("_groq_post_with_key_rotation(")))
    check("the stream rotates keys BEFORE models",
          "headers=key_pool.headers_for(_gs_key)" in clean
          and "GROQ_KEY_POOL.retryable(resp.status_code) and _gs_i < len(_gs_keys) - 1" in clean)
    check("the stream records responses against the key too",
          "GROQ_KEY_POOL.note_response(_gs_key, resp.status_code, resp.headers)" in clean)
    check("no provider call was left behind on the old cached header helper",
          "headers=groq_headers()" not in clean)
    # P11-fix — the .env loader used to write file values back over the real
    # environment, which silently swallowed every shell/Render/probe override
    # (it defeated the P12 live probe twice). The environment must win.
    check("the .env loader lets real environment variables win (P11-fix)",
          'if os.environ.get(_k) in (None, ""):' in clean
          and "os.environ[_k] = _v" in clean)


def test_env_declarations():
    print("\n[env declarations]")
    with io.open(os.path.join(BACKEND_DIR, ".env.example"), encoding="utf-8") as fh:
        example = fh.read()
    check(".env.example declares GROQ_API_KEY_SECONDARY",
          "GROQ_API_KEY_SECONDARY" in example)
    with io.open(os.path.join(BACKEND_DIR, "render.yaml"), encoding="utf-8") as fh:
        render = fh.read()
    check("render.yaml declares GROQ_API_KEY_SECONDARY (sync:false)",
          "GROQ_API_KEY_SECONDARY" in render)
    check("no real key material is committed in main.py",
          re.search(r"(gsk_[A-Za-z0-9]{12}|nvapi-[A-Za-z0-9_\-]{12}|sk-or-v1-[A-Za-z0-9]{12})", MAIN) is None)


def main():
    print("=== Key pool tests (offline) ===")
    test_parse_keys()
    test_key_id()
    test_reset_duration()
    test_cooldown_seconds()
    test_retryable_statuses()
    test_pool_empty()
    test_pool_rotation_and_recovery()
    test_pool_all_cooling_and_401()
    test_main_wiring()
    test_env_declarations()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_KEY_POOL_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
