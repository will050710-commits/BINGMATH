"""
test_math_solver.py
===================
Đợt 4B unit tests — chạy được bằng `python test_math_solver.py` (kiểu các
test_phase*.py sẵn có) hoặc pytest. KHÔNG cần mạng/khóa: mọi lượt gọi model
đều dùng chat_fn giả, đúng lý do math_solver nhận chat_fn qua tham số.
"""

import asyncio
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import math_solver as ms  # noqa: E402

PASS = []


def check(name, condition, detail=""):
    PASS.append((name, bool(condition)))
    print(f"{'OK  ' if condition else 'FAIL'} {name} {'' if condition else detail}")


def fake_chat(script):
    """Queue-driven chat_fn. Each entry is a dict (tool-call message), a string
    (plain completion) or an Exception instance to raise."""
    calls = {"n": 0, "seen": []}

    async def _chat(prompt="", *, models=None, messages=None, max_tokens=0, temperature=0.0,
                    tools=None, tool_choice=None, raw_message=False, system=None):
        idx = min(calls["n"], len(script) - 1)
        calls["n"] += 1
        calls["seen"].append({"tools": bool(tools), "raw": raw_message,
                              "model": (models or [None])[0]})
        item = script[idx]
        if isinstance(item, Exception):
            raise item
        return (item, (models or ["fake"])[0])

    return _chat, calls


def test_tools():
    check("eval exact", ms.tool_sympy_eval("sqrt(3)/2 + sin(pi/6)")["exact"] == "1/2 + sqrt(3)/2")
    solved = ms.tool_sympy_solve("x^2-5x+6=0", "x")
    check("solve roots", solved["ok"] and sorted(v["x"] for v in solved["solutions"]) == ["2", "3"], solved)
    check("verify true", ms.tool_sympy_verify("x^2-5x+6=(x-2)(x-3)")["true"] is True)
    check("verify false", ms.tool_sympy_verify("x^2-5x+6=(x-2)(x-4)")["true"] is False)
    check("guard blocks dunder", ms.tool_sympy_eval("__import__('os')").get("ok") is False)
    check("guard blocks long input", ms.tool_sympy_eval("1+" * 300 + "1").get("ok") is False)
    check("unknown tool", ms.run_tool("nope", {})["ok"] is False)


def test_extract():
    got = ms.extract_candidates("Ta có $x=2$ hoặc $x=3$.\nĐáp án: 12. Vậy x = 3.")
    check("extract keeps boxed/Đáp án clean", "12" in got and "x = 3" in got, got)
    check("mcq letter", ms._looks_like_mcq_options("Đáp án: B") == "B")


def test_checks():
    ir = ms.build_problem_ir(None, "giải phương trình", "")
    ir["latex"] = ["x^2-5x+6=0"]
    good = ms.deterministic_checks(ir, "Bước 1 ... \nĐáp án: x = 3")
    check("good answer passes presolve", not ms.failed_checks(good), ms.failed_checks(good))
    bad = ms.deterministic_checks(ir, "Bước 1 ... \nĐáp án: x = 5")
    names = [c["name"] for c in ms.failed_checks(bad)]
    check("wrong answer caught deterministically", "presolve" in names and "substitution" in names, names)
    sanity_ir = ms.build_problem_ir(None, "tính bán kính đường tròn", "")
    sanity = ms.deterministic_checks(sanity_ir, "Đáp án: R = -5")
    check("negative radius flagged", any(c["name"] == "sanity" for c in ms.failed_checks(sanity)), sanity)
    ident = ms.check_identities("Ta có x^2-5x+6 = (x-2)(x-4).\nĐáp án: x = 3")
    check("false identity flagged", ident["status"] == "failed", ident)


async def test_tool_loop():
    script = [
        {"role": "assistant", "content": "",
         "tool_calls": [{"id": "c1", "type": "function",
                         "function": {"name": "sympy_solve",
                                      "arguments": '{"equation": "x^2-5x+6=0", "variable": "x"}'}}]},
        "Đáp án: x = 3",
    ]
    chat, calls = fake_chat(script)
    ir = ms.build_problem_ir(None, "giải", "")
    ir["latex"] = ["x^2-5x+6=0"]
    out = await ms.solve_with_tools(ir, chat_fn=chat, models=["fake/one:free"])
    check("tool loop ran the tool", bool(out["tool_calls"]) and out["tool_calls"][0]["name"] == "sympy_solve", out["tool_calls"])
    check("tool loop finished with the answer", out["reply"].strip().startswith("Đáp án"), out["reply"])
    check("tool loop used 2 rounds", out["rounds"] == 2, out["rounds"])
    check("tools were declared to the model", calls["seen"][0]["tools"] is True, calls["seen"])


async def test_verify_pass_and_repair():
    ir = ms.build_problem_ir(None, "giải", "")
    ir["latex"] = ["x^2-5x+6=0"]

    # 1) everything fine: the critic agrees, no repair needed
    chat_good, calls_good = fake_chat(['{"verdict": "correct", "failed_steps": [], "corrected_final": ""}'])
    v1 = await ms.verify_and_repair(ir, "Đáp án: x = 3", chat_fn=chat_good)
    check("verified when critic agrees", v1["verified"] is True and v1["repaired"] is False, v1["notes"])
    check("no repair call needed", calls_good["n"] == 1, calls_good["n"])

    # 2) deterministic failure → the repair produces a correct answer → verified
    chat_fix, _calls = fake_chat([
        '{"verdict": "wrong", "failed_steps": ["thay sai nghiem"], "corrected_final": "x = 3"}',
        "Sửa lại: thay $x=3$ vào đề thấy thoả mãn.\nĐáp án: x = 3",
        '{"verdict": "correct", "failed_steps": [], "corrected_final": ""}',
    ])
    v2 = await ms.verify_and_repair(ir, "Đáp án: x = 5", chat_fn=chat_fix)
    check("repair round fixed the answer", v2["verified"] is True and v2["repaired"] is True, v2)
    check("reply was replaced by the repair", "x = 3" in v2["reply"], v2["reply"])
    check("badge absent when verified", ms.unverified_note(v2) == "")

    # 3) nothing can fix it → unverified + badge
    chat_bad, _calls = fake_chat([
        '{"verdict": "wrong", "failed_steps": ["sai"], "corrected_final": ""}',
        "Vẫn thế.\nĐáp án: x = 5",
        '{"verdict": "wrong", "failed_steps": ["vẫn sai"], "corrected_final": ""}',
    ])
    v3 = await ms.verify_and_repair(ir, "Đáp án: x = 5", chat_fn=chat_bad)
    check("still-unverified answer is flagged", v3["verified"] is False, v3)
    check("badge text mentions the failing check",
          "Chưa kiểm chứng" in ms.unverified_note(v3), ms.unverified_note(v3))

    # 4) off mode does not call anything
    chat_off, calls_off = fake_chat(["irrelevant"])
    v4 = await ms.verify_and_repair(ir, "Đáp án: x = 3", chat_fn=chat_off, mode="off")
    check("off mode skips verification", v4["verified"] is True and calls_off["n"] == 0, v4)


def main():
    test_tools()
    test_extract()
    test_checks()
    asyncio.run(test_tool_loop())
    asyncio.run(test_verify_pass_and_repair())

    failed = [name for name, ok in PASS if not ok]
    print(f"\n{len(PASS) - len(failed)}/{len(PASS)} checks passed")
    if failed:
        print("FAILED:", failed)
        sys.exit(1)
    print("ALL_MATH_SOLVER_TESTS_PASSED")


if __name__ == "__main__":
    main()
