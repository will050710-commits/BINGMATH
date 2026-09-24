# duosteam/backend/test_phase0_security.py
#
# Phase 0 security hardening — regression tests.
#
# Run:  python test_phase0_security.py
#
# Covers:
#   1. safe_expr      — the AST allowlist that replaced the eval() calls in
#                       canvas_to_video.py (arbitrary-code-execution fix).
#   2. config_guard   — fail-closed JWT secret handling.
#   3. Source scan    — no bare eval() is left in the renderer or the API.
import ast
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import numpy as np

from safe_expr import UnsafeExpression, compile_expr, safe_eval
import config_guard
from config_guard import env_list, require_secret

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))


# ── 1. safe_expr ─────────────────────────────────────────────────────────────
def test_safe_expr_allows_math():
    print("\n[TEST 1] safe_expr — legitimate expressions still work")
    cases = {
        "x*x - 2*x": 3,          # 9 - 6 = 3
        "x^2": 9,
        "t^2": 9,                # time variable alias
        "x*abs(x)": 9,
        "e^0": 1,
        "min(x, 1)": 1,
        "x/2 + 1": 2.5,
    }
    for expr, expected in cases.items():
        fn = compile_expr(expr)
        assert float(fn(3)) == expected, f"{expr} -> {fn(3)}, expected {expected}"

    assert abs(float(compile_expr("Math.sin(x)")(0.0))) < 1e-9, "Math.sin(0) should be 0"
    assert abs(float(compile_expr("sin(pi/2)")(np.pi / 2)) - 1.0) < 1e-9, "sin(pi/2) should be 1"

    # Vectorised evaluation (the renderer plots numpy arrays).
    xs = np.linspace(-2, 2, 5)
    ys = compile_expr("x^2")(xs)
    assert list(np.round(ys, 6)) == [4.0, 1.0, 0.0, 1.0, 4.0], f"unexpected curve: {ys}"
    assert float(safe_eval("2*x + 1", 10)) == 21.0
    assert float(compile_expr("np.sqrt(abs(x))")(9)) == 3.0
    print("  ✓ arithmetic/algebra, namespaces, constants and arrays OK")


def test_safe_expr_blocks_code_execution():
    print("\n[TEST 2] safe_expr — code-execution payloads are rejected")
    payloads = [
        "__import__('os').system('echo hacked')",
        "().__class__.__bases__[0].__subclasses__()",
        "open('/etc/passwd').read()",
        "x.__class__",
        "lambda: 1",
        "[c for c in ()]",
        "globals()",
        "x**1000",
        "1e9",
        "x; import os",
        "exec('1')",
        "eval('1')",
        "getattr(x, '__class__')",
        "__builtins__",
    ]
    for payload in payloads:
        try:
            compile_expr(payload)
        except UnsafeExpression:
            continue
        raise AssertionError(f"payload was NOT rejected: {payload!r}")
    print(f"  ✓ {len(payloads)} attack payloads rejected")

    for bad in ["x" * 500, "x + 'a'", "x + `1`"]:
        try:
            compile_expr(bad)
        except UnsafeExpression:
            continue
        raise AssertionError(f"over-long/illegal expression accepted: {bad[:20]}...")
    print("  ✓ over-long and illegal-character expressions rejected")


# ── 2. config_guard ──────────────────────────────────────────────────────────
def test_config_guard():
    print("\n[TEST 3] config_guard — fail-closed secret handling")
    saved = {k: os.environ.get(k) for k in ("RENDER", "RENDER_SERVICE_ID", "DUOMATH_ENV")}
    try:
        for key in saved:
            os.environ.pop(key, None)

        os.environ["PHASE0_TEST_SECRET"] = "A" * 40
        value, warning = require_secret("PHASE0_TEST_SECRET")
        assert value == "A" * 40 and warning is None
        print("  ✓ strong secret is returned unchanged")

        os.environ.pop("PHASE0_TEST_SECRET")
        dev_value, dev_warning = require_secret("PHASE0_TEST_SECRET")
        assert len(dev_value) >= 32 and dev_warning, "dev secret must be generated with a warning"
        assert dev_value != "duomath-dev-secret-CHANGE-IN-PROD"
        print("  ✓ local dev generates an ephemeral secret (no hard-coded fallback)")

        os.environ["RENDER"] = "true"
        assert config_guard.is_production() is True
        try:
            require_secret("PHASE0_TEST_SECRET")
        except RuntimeError as exc:
            assert "PHASE0_TEST_SECRET" in str(exc)
            print("  ✓ production aborts when the secret is missing")
        else:
            raise AssertionError("production did NOT abort on a missing secret")

        os.environ["PHASE0_TEST_LIST"] = " https://a.example , https://b.example/ ,,"
        assert env_list("PHASE0_TEST_LIST") == ["https://a.example", "https://b.example"]
        print("  ✓ ALLOWED_ORIGINS-style lists parse correctly")
    finally:
        for key, original in saved.items():
            if original is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = original
        os.environ.pop("PHASE0_TEST_SECRET", None)
        os.environ.pop("PHASE0_TEST_LIST", None)


# ── 3. Source scan ───────────────────────────────────────────────────────────
def _eval_calls(path):
    with open(path, "r", encoding="utf-8") as fh:
        tree = ast.parse(fh.read())
    return [
        node.lineno
        for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "eval"
    ]


def test_no_bare_eval_left():
    print("\n[TEST 4] source scan — no unguarded eval() remains")
    for name in ("canvas_to_video.py", "main.py"):
        calls = _eval_calls(os.path.join(BACKEND_DIR, name))
        assert not calls, f"{name} still calls eval() at lines {calls}"
        print(f"  ✓ {name} contains 0 eval() calls")

    assert len(_eval_calls(os.path.join(BACKEND_DIR, "safe_expr.py"))) == 1
    print("  ✓ safe_expr.py has the single hardened eval()")


if __name__ == "__main__":
    print("=" * 62)
    print("  PHASE 0 SECURITY REGRESSION TESTS")
    print("=" * 62)
    test_safe_expr_allows_math()
    test_safe_expr_blocks_code_execution()
    test_config_guard()
    test_no_bare_eval_left()
    print("\n" + "=" * 62)
    print("  ALL PHASE 0 TESTS PASSED")
    print("=" * 62)
