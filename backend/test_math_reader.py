"""
test_math_reader.py
===================
Đợt 4A unit tests — chạy được cả bằng `python test_math_reader.py` (kiểu các
test_phase*.py sẵn có) và bằng pytest. KHÔNG cần mạng, KHÔNG cần API key:
mọi lượt "đọc" đều dùng chat_fn giả (đúng lý do math_reader nhận chat_fn qua
tham số thay vì tự gọi HTTP).
"""

import asyncio
import base64
import io
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import math_reader as mr  # noqa: E402

PASS = []


def check(name, condition, detail=""):
    PASS.append((name, bool(condition)))
    print(f"{'OK  ' if condition else 'FAIL'} {name} {detail if not condition else ''}")


def _tiny_png_b64():
    from PIL import Image

    img = Image.new("RGB", (240, 120), "white")
    if img.width < 12:
        raise AssertionError("bad fixture")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def make_reader(*payloads, failure=None):
    """Fake chat_fn returning one payload per call (last one repeats)."""

    calls = {"n": 0}

    async def _chat(prompt="", *, models=None, max_tokens=0, temperature=0.0, system=None, messages=None):
        idx = min(calls["n"], len(payloads) - 1)
        calls["n"] += 1
        if failure:
            raise RuntimeError(failure)
        payload = payloads[idx] if payloads else {}
        if isinstance(payload, str):
            return payload, (models or ["fake"])[0]
        return json.dumps(payload, ensure_ascii=False), (models or ["fake"])[0]

    return _chat, calls


def test_normalize():
    check("normalize collapse", mr._normalize_latex("x^{2} + \\left( 2 \\times y \\right)") == "x^2+(2*y)")
    check("normalize unicode", mr._normalize_latex("a ≤ 5−3") == "a<=5-3")
    check("normalize spacing", mr._normalize_latex("y = 2 x + 1") == "y=2x+1")


def test_formula_match():
    ok, only_a, only_b = mr._formula_match(["x^2+1", "y=2"], ["x^{2} + 1", "y = 2"])
    check("match formats", ok and not only_a and not only_b)
    ok, only_a, only_b = mr._formula_match(["x^2+1"], ["x^3+1"])
    check("conflict detected", not ok and only_a and only_b)
    ok, _, _ = mr._formula_match(["a", "b"], ["b", "a"])
    check("reordered still matches", ok)


def test_sympy_gate():
    check("gate equation ok", mr.sympy_gate(["x^2-5x+6=0"]) == [])
    check("gate fraction ok", mr.sympy_gate(["\\frac{x^2-1}{x+1}"]) == [])
    check("gate sqrt/ineq ok", mr.sympy_gate(["\\sqrt{x^2+1}", "2x+3y<5"]) == [])
    check("gate prose skipped", mr.sympy_gate(["Tính giá trị của biểu thức", "\\begin{cases}a\\end{cases}"]) == [])
    broken = mr.sympy_gate(["x^2 + 3x - = 0"])
    check("gate catches broken", broken == ["x^2 + 3x - = 0"], broken)


def test_contract_shape():
    text = mr.to_solver_contract({
        "diagram": {"points": ["A: đỉnh trên"], "shapes": ["Đường tròn (O)"], "relations": ["AB ⊥ AC"]},
        "latex": ["AB^2 + AC^2 = BC^2"],
        "text_blocks": ["Cho tam giác ABC"],
        "ambiguities": [{"where": "số mũ của x"}],
    })
    check("contract geometry tags", "LABELED POINTS" in text and "SPATIAL & GEOMETRIC RELATIONS" in text)
    check("contract latex+text", "TRANSCRIPTION" in text and "TEXT ON THE PAGE" in text)
    check("contract uncertainty", "UNCERTAIN SPOTS" in text)


async def test_consensus_agree():
    chat, _ = make_reader(
        {"kind": "equation", "latex": ["x^2-5x+6=0"], "confidence": 0.9},
        {"kind": "equation", "latex": ["x^{2} - 5x + 6 = 0"], "confidence": 0.88},
    )
    res = await mr.read_consensus(_tiny_png_b64(), "image/png", "giải giúp em",
                                  chat_fn=chat, mode="always")
    check("agree → consensus", res["consensus"] == "agree", res["consensus"])
    check("agree → ok/confidence", res["ok"] and res["confidence"] >= 0.8, res["confidence"])
    check("agree → contract latex", "TRANSCRIPTION" in res["contract"])
    check("agree → two readers", len(res["readers"]) == 2, res["readers"])
    check("agree → no confirm", res["needs_confirm"] is False)


async def test_tiebreak_resolves():
    chat, _ = make_reader(
        {"kind": "equation", "latex": ["x^2-1=0"], "confidence": 0.9},
        {"kind": "equation", "latex": ["x^2-1=0", "y=3x+1"], "confidence": 0.9},
        {"kind": "equation", "latex": ["x^2-1=0"], "confidence": 0.95},
    )
    res = await mr.read_consensus(_tiny_png_b64(), "image/png", mode="always", chat_fn=chat,
                                  tiebreak_model="fake/tiebreak:free")
    check("conflict → tiebreak resolves", res["consensus"] == "resolved", res["consensus"])
    check("resolved keeps agreeing reading", res["latex"] == ["x^2-1=0"], res["latex"])


async def test_tiebreak_unresolved_asks_student():
    chat, _ = make_reader(
        {"kind": "equation", "latex": ["x^2-1=0"], "confidence": 0.9},
        {"kind": "equation", "latex": ["x^2-1=0", "y=3x+1"], "confidence": 0.9},
        {"kind": "equation", "latex": ["z=9"], "confidence": 0.9},
    )
    res = await mr.read_consensus(_tiny_png_b64(), "image/png", mode="always", chat_fn=chat)
    check("unresolved → needs_confirm", res["needs_confirm"] is True)
    check("unresolved → candidates", len(res["candidates"]) == 2, res["candidates"])
    check("unresolved → confidence capped", res["confidence"] <= 0.5, res["confidence"])


async def test_single_mode():
    chat, calls = make_reader({"kind": "geometry", "latex": [], "diagram": {"points": ["A: đỉnh trên"]},
                               "confidence": 0.6})
    res = await mr.read_consensus(_tiny_png_b64(), "image/png", chat_fn=chat, mode="never")
    check("never → exactly one call", calls["n"] == 1, calls["n"])
    check("never → one reader logged", len(res["readers"]) == 1, res["readers"])
    check("geometry → legacy contract tags", "LABELED POINTS" in res["contract"], res["contract"][:80])


async def test_all_readers_fail():
    chat, _ = make_reader(failure="boom 429")
    res = await mr.read_consensus(_tiny_png_b64(), "image/png", chat_fn=chat, mode="never")
    check("all fail → ok=False", res["ok"] is False and bool(res["error"]), res["error"])
    check("all fail → reader error kept", "boom" in str(res["readers"]), res["readers"])


async def test_zoomed_reread():
    chat, calls = make_reader(
        {"kind": "equation", "latex": ["x^2 + 3x - = 0"], "confidence": 0.5,
         "ambiguities": [{"where": "dấu ở dòng 1", "bbox": [0.1, 0.1, 0.5, 0.2], "confidence": 0.4}]},
        {"kind": "equation", "latex": ["x^2 + 3x - 4 = 0"], "confidence": 0.9},
    )
    res = await mr.read_consensus(_tiny_png_b64(), "image/png", chat_fn=chat, mode="never")
    check("reread flagged", res["reread"] is True, res.get("readers"))
    check("reread repaired the formula",
          res["parse_failures"] == [] and any("4" in f for f in res["latex"]), res["latex"])
    check("reread used a second call", calls["n"] >= 2, calls["n"])


def test_env_plumbing():
    os.environ["MATH_READER_MODELS"] = "a/x:free,b/y:free,c/z:free"
    check("reader list capped at 2", mr.reader_models() == ["a/x:free", "b/y:free"], mr.reader_models())
    del os.environ["MATH_READER_MODELS"]
    os.environ["AI_DUAL_READ"] = "weird"
    check("unknown mode → auto", mr.dual_read_mode() == "auto")
    os.environ["AI_DUAL_READ"] = "never"
    check("mode never honoured", mr.dual_read_mode() == "never")
    del os.environ["AI_DUAL_READ"]
    check("cache without sha256 is a miss", mr._cache_get("", None) is None)


def main():
    test_normalize()
    test_formula_match()
    test_sympy_gate()
    test_contract_shape()
    test_env_plumbing()
    asyncio.run(test_consensus_agree())
    asyncio.run(test_tiebreak_resolves())
    asyncio.run(test_tiebreak_unresolved_asks_student())
    asyncio.run(test_single_mode())
    asyncio.run(test_all_readers_fail())
    asyncio.run(test_zoomed_reread())

    failed = [name for name, ok in PASS if not ok]
    print(f"\n{len(PASS) - len(failed)}/{len(PASS)} checks passed")
    if failed:
        print("FAILED:", failed)
        sys.exit(1)
    print("ALL_MATH_READER_TESTS_PASSED")


if __name__ == "__main__":
    main()
