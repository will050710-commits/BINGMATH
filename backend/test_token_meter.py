"""
test_token_meter.py
===================
P10 — offline suite for `token_meter.py` and its wiring in main.py.

What is asserted:
  * `normalize_openai_usage` reads the OpenAI-compatible `usage` shape from
    BOTH forms (full response / usage object itself), keeps
    `completion_tokens_details.reasoning_tokens` separate (the number P8's
    3072-token floor exists for), and never raises on garbage;
  * `normalize_gemini_usage` folds `thoughtsTokenCount` into output while still
    reporting it as reasoning, and computes a missing total;
  * `quota_snapshot` parses the header families Cerebras/Groq really send
    (`x-ratelimit-remaining-tokens-day`, `x-ratelimit-reset-tokens`,
    `retry-after`) and returns None when a provider sends nothing — the admin
    gauge must read "self-count", never a fabricated live number;
  * `pct_left` / `gauge_state` clamp and label honestly (unknown under 15 %
    critical, under 30 % low);
  * retention parsing follows chat_budget's fail-safe rule (typo -> default);
  * main.py still WIRES it: the DDL, `token_log` at every provider choke point,
    the admin-only endpoint, the key-pool snapshot in the payload, and the env
    var declared for Render + .env.example.

Run:  python backend/test_token_meter.py
"""

import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import token_meter as tm  # noqa: E402

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


def test_openai_usage():
    print("\n[normalize_openai_usage]")
    full = {"choices": [{"message": {"content": "hi"}}],
            "usage": {"prompt_tokens": 120, "completion_tokens": 800,
                      "total_tokens": 920,
                      "completion_tokens_details": {"reasoning_tokens": 700}}}
    u = tm.normalize_openai_usage(full)
    check("a full response is read from its usage block",
          (u["input_tokens"], u["output_tokens"], u["total_tokens"]) == (120, 800, 920), u)
    check("reasoning tokens stay separate (the number the 3072 floor exists for)",
          u["reasoning_tokens"] == 700)
    u2 = tm.normalize_openai_usage({"prompt_tokens": 5, "completion_tokens": 6, "total_tokens": 11})
    check("a bare usage object works too", u2["input_tokens"] == 5 and u2["total_tokens"] == 11)
    check("garbage never raises",
          tm.normalize_openai_usage(None)["total_tokens"] == 0
          and tm.normalize_openai_usage("nope")["input_tokens"] == 0
          and tm.normalize_openai_usage({"usage": "bad"})["output_tokens"] == 0)
    check("a missing details block is just zero reasoning",
          tm.normalize_openai_usage({"usage": {"total_tokens": 9}})["reasoning_tokens"] == 0)


def test_gemini_usage():
    print("\n[normalize_gemini_usage]")
    meta = {"usageMetadata": {"promptTokenCount": 120, "candidatesTokenCount": 300,
                              "thoughtsTokenCount": 250, "totalTokenCount": 670}}
    g = tm.normalize_gemini_usage(meta)
    check("prompt/candidates/thoughts are split correctly",
          (g["input_tokens"], g["output_tokens"], g["reasoning_tokens"]) == (120, 550, 250), g)
    check("thoughts count against the output total (they cost quota too)",
          g["output_tokens"] == 300 + 250 and g["total_tokens"] == 670)
    g2 = tm.normalize_gemini_usage({"usageMetadata": {"promptTokenCount": 10,
                                                      "candidatesTokenCount": 20}})
    check("a missing totalTokenCount is computed", g2["total_tokens"] == 30)
    check("no usageMetadata at all is all zeros, no raise",
          tm.normalize_gemini_usage({})["total_tokens"] == 0
          and tm.normalize_gemini_usage(None)["input_tokens"] == 0)


def test_quota_snapshot():
    print("\n[quota_snapshot]")
    cerebras = {"X-Ratelimit-Remaining-Tokens-Day": "987654",
                "x-ratelimit-limit-tokens-day": "1000000",
                "x-ratelimit-reset-tokens-day": "2h30m"}
    snap = tm.quota_snapshot("cerebras", cerebras)
    check("the Cerebras header family is parsed (case-insensitive)",
          snap and snap["remaining"]["tokens-day"] == "987654"
          and snap["limit"]["tokens-day"] == "1000000"
          and snap["reset"]["tokens-day"] == "2h30m", snap)
    groq = {"retry-after": "17", "x-ratelimit-remaining-requests": "42",
            "x-ratelimit-remaining-tokens": "1500"}
    snap2 = tm.quota_snapshot("groq", groq)
    check("the Groq headers including retry-after are kept",
          snap2["retry_after"] == "17"
          and snap2["remaining"]["requests"] == "42"
          and snap2["remaining"]["tokens"] == "1500", snap2)
    check("a provider with NO quota headers yields None (self-count, not a fake gauge)",
          tm.quota_snapshot("nvidia", {"content-type": "application/json"}) is None
          and tm.quota_snapshot("gemini", {}) is None
          and tm.quota_snapshot("cerebras", None) is None)
    check("blank header values are ignored, not stored as empty strings",
          tm.quota_snapshot("groq", {"x-ratelimit-remaining-tokens": "  "}) is None)


def test_gauges_and_retention():
    print("\n[gauges + retention]")
    check("pct_left is the honest ratio", tm.pct_left(50, 200) == 25.0)
    check("zero remaining is 0 %, clamped both ways",
          tm.pct_left(0, 100) == 0.0 and tm.pct_left(150, 100) == 100.0)
    check("no numbers means None, never a guess",
          tm.pct_left(None, 100) is None and tm.pct_left(5, 0) is None
          and tm.pct_left("x", "y") is None)
    check("below 15 % is critical, below 30 % is low, else ok",
          tm.gauge_state(10.0) == "critical" and tm.gauge_state(15.0) == "low"
          and tm.gauge_state(29.9) == "low" and tm.gauge_state(30.0) == "ok")
    check("no percentage is labelled unknown (Gemini/NVIDIA self-count)",
          tm.gauge_state(None) == "unknown")

    saved = os.environ.pop("TOKEN_USAGE_RETENTION_DAYS", None)
    try:
        check("the retention default is 30 days", tm.retention_days() == 30)
        os.environ["TOKEN_USAGE_RETENTION_DAYS"] = "7"
        check("a valid retention is honoured", tm.retention_days() == 7)
        os.environ["TOKEN_USAGE_RETENTION_DAYS"] = "0"
        check("0 means keep forever", tm.retention_days() == 0)
        os.environ["TOKEN_USAGE_RETENTION_DAYS"] = "soon"
        check("a typo falls back to the default (never disables retention)",
              tm.retention_days() == 30)
        os.environ["TOKEN_USAGE_RETENTION_DAYS"] = "99999"
        check("an absurd value is clamped", tm.retention_days() == 3650)
    finally:
        os.environ.pop("TOKEN_USAGE_RETENTION_DAYS", None)
        if saved is not None:
            os.environ["TOKEN_USAGE_RETENTION_DAYS"] = saved


def test_main_wiring():
    print("\n[main.py wiring]")
    clean = strip_comments(MAIN)
    check("main.py imports the meter module", "import token_meter" in MAIN)
    check("the token_usage_log table is created by the startup migrations",
          "CREATE TABLE IF NOT EXISTS token_usage_log (" in MAIN
          and "idx_tokens_created" in MAIN)
    check("token_log() is the single writer and never raises",
          "def token_log(" in clean and "[token-meter] log skipped" in MAIN)
    check("token_log stores the reasoning tokens separately",
          "reasoning_tokens" in MAIN and "reasoning_tokens INTEGER DEFAULT 0" in MAIN)
    providers = ['token_log("groq"', 'token_log("nvidia"', 'token_log("cerebras"',
                 'token_log("gemini"', 'token_log("openrouter"']
    check("every provider choke point records usage",
          all(p in clean for p in providers), str([p for p in providers if p not in clean]))
    check("Gemini is metered on BOTH of its success paths (tool + no-tools retry)",
          clean.count('token_log("gemini"') >= 2)
    check("only Cerebras/Groq attach a live quota snapshot",
          'quota=token_meter.quota_snapshot("cerebras"' in clean
          and 'quota=token_meter.quota_snapshot("groq"' in clean
          and 'normalize_openai_usage(cb_resp.json())' in clean)
    check("usage is normalized through token_meter at every call site",
          clean.count("token_meter.normalize_openai_usage(") >= 3
          and clean.count("token_meter.normalize_gemini_usage(") >= 2)
    check("the translate path is labelled as its own surface",
          'surface="translate"' in clean)
    check("the repair path is labelled as its own surface",
          'surface="repair"' in clean)


def test_endpoint_and_env():
    print("\n[endpoint + env]")
    clean = strip_comments(MAIN)
    check("the admin endpoint exists and is admin-only",
          '@app.get("/api/admin/token-usage")' in MAIN
          and "token_usage_summary(days=max(1, min(int(days), 90)))" in clean)
    idx = MAIN.find('@app.get("/api/admin/token-usage")')
    check("...and it verifies the admin BEFORE answering",
          "await verify_admin(request)" in MAIN[idx:idx + 700])
    check("the payload includes the key-pool snapshots (live/cooling per key)",
          '"keys": {"groq": GROQ_KEY_POOL.snapshot(), "nvidia": NVIDIA_KEY_POOL.snapshot()}' in clean)
    check("the source labels stay honest (gemini/nvidia = self-count)",
          '_token_meter_sources' in clean
          and '"gemini": "self-count"' in clean
          and '"nvidia": "self-count"' in clean
          and '"cerebras": "live+self-count"' in clean)
    check("the summary is defensive about a missing table (never a 500)",
          "meter table is not queryable yet" in MAIN)
    with io.open(os.path.join(BACKEND_DIR, ".env.example"), encoding="utf-8") as fh:
        example = fh.read()
    check(".env.example declares TOKEN_USAGE_RETENTION_DAYS",
          "TOKEN_USAGE_RETENTION_DAYS" in example)
    with io.open(os.path.join(BACKEND_DIR, "render.yaml"), encoding="utf-8") as fh:
        render = fh.read()
    check("render.yaml declares TOKEN_USAGE_RETENTION_DAYS", "TOKEN_USAGE_RETENTION_DAYS" in render)


def main():
    print("=== Token meter tests (offline) ===")
    test_openai_usage()
    test_gemini_usage()
    test_quota_snapshot()
    test_gauges_and_retention()
    test_main_wiring()
    test_endpoint_and_env()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_TOKEN_METER_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
