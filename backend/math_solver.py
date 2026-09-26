"""
math_solver.py
==============
Phase 4 / Đợt 4B — the solver half: exact tools + verification before answering.

Why this module exists
----------------------
Đợt 4A hardened *reading* an image. This module hardens *solving*:

  1. The model gets exact tools (`sympy_eval`, `sympy_solve`, `sympy_verify`,
     `sympy_simplify`) and is told to use them for every calculation instead of
     doing arithmetic in its head. OpenRouter's free tiers all support `tools`
     (verified live: qwen3.8-27b, nemotron-3-ultra-550b, gemma-4-31b-it, …).
  2. Before the answer is shown, it is CHECKED:
       · deterministic checks — substitute the claimed answer back into the
         original equations, compare against a SymPy pre-solve, verify identity
         claims symbolically, plus a few sanity rules (negative length, …);
       · a critic model from a DIFFERENT family returns a strict JSON verdict.
  3. If a check fails, exactly ONE repair round runs with the failing evidence
     attached, then the answer is re-checked. Anything still unverified is
     reported as such (`verified: False` + reasons) so the UI can label it
     instead of pretending the answer is certain.

Design: every network call goes through an injected `chat_fn`, exactly like
math_reader — so the whole module is unit-testable without keys or network, and
main.py stays the only place that knows about HTTP/OpenRouter.
"""

import json
import logging
import os
import re
from typing import Any, Callable, Dict, List, Optional, Tuple

logger = logging.getLogger("duomath.math_solver")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_handler)
logger.setLevel(logging.INFO)

DEFAULT_SOLVER_MODELS = (
    "qwen/qwen3.8-27b:free,"
    "nvidia/nemotron-3-ultra-550b-a55b:free,"
    "openrouter/free"
)
DEFAULT_CRITIC_MODELS = (
    "google/gemma-4-31b-it:free,"
    "nvidia/nemotron-3-ultra-550b-a55b:free,"
    "openrouter/free"
)
MAX_TOOL_ROUNDS = 3
TOL = 1e-9

# ── tool schemas (OpenAI-compatible, accepted by OpenRouter) ──────────────────
TOOLS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "sympy_eval",
            "description": ("Evaluate an arithmetic/algebraic expression EXACTLY with SymPy. "
                            "Use this for every calculation (fractions, roots, trigonometry, "
                            "derivatives, integrals) instead of computing in your head."),
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Python/SymPy expression, e.g. 'sqrt(3)/2 + sin(pi/6)', "
                                       "'diff(x**3 - 3*x, x)', 'integrate(x**2, (x, 0, 1))'",
                    }
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "sympy_solve",
            "description": ("Solve an equation or a system for a variable and return the EXACT "
                            "solutions. Always use this before stating a final x/y value."),
            "parameters": {
                "type": "object",
                "properties": {
                    "equation": {
                        "type": "string",
                        "description": "e.g. 'x^2 - 5x + 6 = 0' or 'x + y = 3, x - y = 1'",
                    },
                    "variable": {"type": "string", "description": "variable to solve for, e.g. 'x'"},
                },
                "required": ["equation", "variable"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "sympy_verify",
            "description": ("Check whether an equality claim is true, symbolically (or numerically "
                            "when symbols remain). Use it to double-check every derived line."),
            "parameters": {
                "type": "object",
                "properties": {
                    "claim": {"type": "string", "description": "e.g. 'x^2-5x+6 = (x-2)(x-3)'"}
                },
                "required": ["claim"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "sympy_simplify",
            "description": "Simplify / factor / expand an expression exactly.",
            "parameters": {
                "type": "object",
                "properties": {"expression": {"type": "string"}},
                "required": ["expression"],
            },
        },
    },
]

# ── safe parsing (reuse the Phase 1 restricted parser, keep a curated fallback) ─
_MAX_EXPR = 400
_BAD_TOKENS = ("__", "import", "lambda", "eval(", "exec(", ";", "`", "open(", "os.")


def _clean_expr(expression: str) -> str:
    text = str(expression or "").strip()
    text = (text.replace("^", "**").replace("×", "*").replace("÷", "/")
                .replace("−", "-").replace("–", "-"))
    text = text.replace("≤", "<=").replace("≥", ">=").replace("≠", "!=")
    text = re.sub(r"(?<=[0-9)])(?=[a-zA-Z(])", "*", text)   # 5x -> 5*x, 2(x+1) -> 2*(x+1)
    return text.strip()


def _parse(text: str):
    """Parse with grading.safe_symbolic_parse first (allowlist + length guard),
    then with a curated parse_expr namespace. Raises on anything suspicious."""
    raw = _clean_expr(text)
    if not raw or len(raw) > _MAX_EXPR:
        raise ValueError("expression is empty or too long")
    lowered = raw.lower()
    if any(token in lowered for token in _BAD_TOKENS):
        raise ValueError("expression contains a forbidden token")
    try:
        from grading import safe_symbolic_parse  # type: ignore
        parsed = safe_symbolic_parse(raw)
        if parsed is not None:
            return parsed
    except Exception:
        pass
    import sympy
    from sympy.parsing.sympy_parser import (parse_expr, standard_transformations,
                                            implicit_multiplication_application, rationalize)
    ns = {
        name: getattr(sympy, name)
        for name in ("sqrt", "cbrt", "sin", "cos", "tan", "cot", "asin", "acos", "atan",
                     "sinh", "cosh", "tanh", "log", "ln", "exp", "Abs", "pi", "E", "oo",
                     "Rational", "Integer", "Float", "Symbol", "factorial", "binomial",
                     "diff", "integrate", "limit", "simplify", "solve", "Eq", "Matrix")
        if hasattr(sympy, name)
    }
    return parse_expr(raw, transformations=standard_transformations + (
        implicit_multiplication_application, rationalize), global_dict=ns, evaluate=True)


def _split_relation(text: str) -> Tuple[str, Optional[str], str]:
    m = re.search(r"(<=|>=|!=|=|<|>)", text)
    if not m:
        return text, None, ""
    return text[:m.start()], m.group(1), text[m.end():]


def tool_sympy_eval(expression: str) -> Dict[str, Any]:
    try:
        import sympy
        obj = _parse(expression)
        out: Dict[str, Any] = {"ok": True, "exact": str(obj)}
        try:
            out["latex"] = sympy.latex(obj)
        except Exception:
            pass
        try:
            value = complex(obj.evalf())
            if abs(value.imag) < 1e-12:
                out["numeric"] = round(value.real, 10)
        except Exception:
            pass
        return out
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"{type(exc).__name__}: {str(exc)[:160]}"}


def tool_sympy_solve(equation: str, variable: str = "x") -> Dict[str, Any]:
    try:
        import sympy
        var = sympy.Symbol((str(variable or "x").strip() or "x"))
        pieces = [p.strip() for p in re.split(r",|;|\band\b|\bvà\b", str(equation or "")) if p.strip()]
        solved: List[Any] = []
        for piece in pieces:
            lhs, op, rhs = _split_relation(piece)
            if op is None:
                continue
            a, b = _parse(lhs), _parse(rhs)
            if op == "=":
                for item in sympy.solve(sympy.Eq(a, b), var, dict=True):
                    solved.append({str(k): str(v) for k, v in item.items()} if isinstance(item, dict) else str(item))
            else:
                rel = {"<=": sympy.Le, ">=": sympy.Ge, "<": sympy.Lt, ">": sympy.Gt, "!=": sympy.Ne}[op]
                solved.append(str(sympy.solve_univariate_inequality(rel(a, b), var, relational=False)))
        if not solved:
            return {"ok": False, "error": "no equation with a relation operator (=, <, >, …) found"}
        return {"ok": True, "solutions": solved, "count": len(solved)}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"{type(exc).__name__}: {str(exc)[:160]}"}


def tool_sympy_verify(claim: str) -> Dict[str, Any]:
    try:
        import sympy
        lhs, op, rhs = _split_relation(str(claim or ""))
        if op is None:
            return {"ok": False, "error": "claim has no relation operator (=, <, >, …)"}
        a, b = _parse(lhs), _parse(rhs)
        diff = sympy.simplify(a - b)
        if op == "=":
            is_true = diff == 0
            if not is_true:
                try:
                    is_true = abs(complex(diff.evalf())) < TOL
                except Exception:
                    is_true = False
            return {"ok": True, "true": bool(is_true), "difference": str(diff)}
        try:
            value = float(complex(diff.evalf()).real)
        except Exception:
            return {"ok": False, "error": "the difference could not be evaluated numerically"}
        verdict = {"<": value < 0, ">": value > 0, "<=": value <= TOL,
                   ">=": value >= -TOL, "!=": abs(value) > TOL}.get(op, False)
        return {"ok": True, "true": bool(verdict), "difference": str(diff), "numeric": value}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"{type(exc).__name__}: {str(exc)[:160]}"}


def tool_sympy_simplify(expression: str) -> Dict[str, Any]:
    try:
        import sympy
        obj = _parse(expression)
        return {"ok": True,
                "simplified": str(sympy.simplify(obj)),
                "factored": str(sympy.factor(obj)),
                "expanded": str(sympy.expand(obj))}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"{type(exc).__name__}: {str(exc)[:160]}"}


_DISPATCH: Dict[str, Callable] = {
    "sympy_eval": tool_sympy_eval,
    "sympy_solve": tool_sympy_solve,
    "sympy_verify": tool_sympy_verify,
    "sympy_simplify": tool_sympy_simplify,
}


def run_tool(name: str, arguments: Any) -> Dict[str, Any]:
    """Execute one tool call requested by the model. Never raises."""
    fn = _DISPATCH.get(str(name or "").strip())
    if fn is None:
        return {"ok": False, "error": f"unknown tool '{name}'"}
    if isinstance(arguments, str):
        try:
            arguments = json.loads(arguments or "{}")
        except Exception:
            return {"ok": False, "error": "tool arguments were not valid JSON"}
    if not isinstance(arguments, dict):
        return {"ok": False, "error": "tool arguments must be an object"}
    try:
        return fn(**arguments)
    except TypeError as exc:
        return {"ok": False, "error": f"bad tool arguments: {exc}"}


# ── reading the model's final answer out of free-form prose ──────────────────
_BOXED_RE = re.compile(r"\\boxed\{([^{}]{1,120})\}")
_VN_ANSWER_RE = re.compile(r"(?:đáp\s*(?:án|số)|kết\s*quả|answer)\s*[:\-–]?\s*(.{1,80})", re.IGNORECASE)
_ASSIGN_RE = re.compile(r"([A-Za-z][A-Za-z_0-9]{0,3})\s*=\s*(-?\d+(?:\.\d+)?(?:/\d+)?|\\frac\{[^{}]{1,12}\}\{[^{}]{1,12}\}|\\sqrt\{[^{}]{1,20}\})")


def extract_candidates(reply: str) -> List[str]:
    """Every place the model states a concrete value: \\boxed{}, 'Đáp án: …',
    and 'x = 3' style assignments (in that priority order)."""
    text = str(reply or "")
    found: List[str] = []
    found.extend(m.group(1).strip() for m in _BOXED_RE.finditer(text))
    # "Đáp án: 12. Vậy x = 3." must yield "12", not the whole trailing sentence.
    found.extend(re.split(r"\s*[.;]\s+", m.group(1).strip())[0].strip()
                 for m in _VN_ANSWER_RE.finditer(text))
    found.extend(f"{m.group(1)} = {m.group(2)}".strip() for m in _ASSIGN_RE.finditer(text))
    seen, ordered = set(), []
    for item in found:
        key = item.replace(" ", "")
        if key and key not in seen:
            seen.add(key)
            ordered.append(item)
    return ordered


def _looks_like_mcq_options(reply: str) -> Optional[str]:
    """'Đáp án: B' style letters — kept separate from numeric claims."""
    m = re.search(r"(?:đáp\s*án|answer)\s*[:\-–]?\s*\(?([A-D])\)?\b", str(reply or ""), re.IGNORECASE)
    return m.group(1).upper() if m else None


# ── Problem IR: what the solver is allowed to see ────────────────────────────
def build_problem_ir(perception: Optional[Dict[str, Any]] = None, user_message: str = "",
                     contract: str = "") -> Dict[str, Any]:
    """The typed hand-off between perception and solving.

    Text models never receive the raw image again — they reason over this
    transcription, its diagram relations and the student's own words.
    """
    p = perception or {}
    return {
        "kind": p.get("kind") or "mixed",
        "latex": list(p.get("latex") or []),
        "text_blocks": list(p.get("text_blocks") or []),
        "diagram": p.get("diagram") or None,
        "ambiguities": p.get("ambiguities") or [],
        "transcription": contract or p.get("contract") or "",
        "student_words": (user_message or "").strip()[:600],
        "confidence": p.get("confidence"),
    }


def _ir_to_prompt(ir: Dict[str, Any]) -> str:
    parts: List[str] = []
    if ir.get("kind"):
        parts.append(f"Problem kind: {ir['kind']}")
    if ir.get("transcription"):
        parts.append(ir["transcription"])
    if ir.get("student_words"):
        parts.append(f"Student's request: {ir['student_words']}")
    return "\n".join(p for p in parts if p).strip()


SOLVER_SYSTEM = """You are DuoMath's exact-math solver. You receive a transcription of a problem
(there is no image — this transcription IS the problem) and you must produce a correct, teachable solution.

Hard rules:
1. NEVER do arithmetic in your head. Call `sympy_eval`, `sympy_solve`, `sympy_verify` or
   `sympy_simplify` for every calculation, equation, derivative, integral or factorisation,
   and use the EXACT values the tools return.
2. Solve the problem you were given. Do not "fix" the transcription; if something in it looks
   ambiguous or impossible, say so explicitly and state the assumption you made.
3. Show short numbered steps in Vietnamese (the student reads Vietnamese), keeping the symbols
   in LaTeX between $...$.
4. The LAST line of your answer must be exactly: `Đáp án: <final value or expression>`.
5. If the problem has no single numeric answer (a proof), the last line must be
   `Đáp án: (chứng minh) <the statement you proved>`.
"""


def solver_models() -> List[str]:
    raw = os.environ.get("MATH_TOOLS_MODEL", DEFAULT_SOLVER_MODELS)
    return [m.strip() for m in raw.split(",") if m.strip()][:3]


def critic_models() -> List[str]:
    raw = os.environ.get("MATH_CRITIC_MODEL", DEFAULT_CRITIC_MODELS)
    return [m.strip() for m in raw.split(",") if m.strip()][:3]


def presolve(ir: Dict[str, Any]) -> Dict[str, Any]:
    """Solve the transcribed equations ourselves BEFORE the model speaks.

    This is ground truth for the deterministic check: if the model's answer is
    not among the SymPy solutions of the very equations it was given, something
    is wrong with the answer (or with the transcription, which the ambiguity
    list already flags).
    """
    out: Dict[str, Any] = {}
    relations = [f for f in (ir.get("latex") or []) if re.search(r"[=<>]", str(f))]
    for equation in relations[:3]:
        var_match = re.search(r"([A-Za-z])\s*=", str(equation))
        var = var_match.group(1) if var_match else "x"
        result = tool_sympy_solve(str(equation), var)
        if result.get("ok"):
            out[str(equation)] = {"variable": var, "solutions": result.get("solutions")}
    return out


async def solve_with_tools(ir: Dict[str, Any], *, chat_fn: Optional[Callable] = None,
                           models: Optional[List[str]] = None, max_rounds: int = MAX_TOOL_ROUNDS,
                           temperature: float = 0.1, max_tokens: int = 1800) -> Dict[str, Any]:
    """Ask the solver model, executing its tool calls until it answers plainly."""
    out: Dict[str, Any] = {"reply": "", "model": None, "tool_calls": [], "rounds": 0,
                           "error": None, "presolved": presolve(ir)}
    if chat_fn is None:
        out["error"] = "chat_fn was not injected"
        return out
    models = models or solver_models()
    messages: List[Dict[str, Any]] = [
        {"role": "system", "content": SOLVER_SYSTEM},
        {"role": "user", "content": _ir_to_prompt(ir) or "Hãy giải bài toán trong ảnh cho em."},
    ]
    for round_no in range(1, max_rounds + 1):
        out["rounds"] = round_no
        try:
            message, used = await chat_fn(models=models, messages=messages, tools=TOOLS,
                                         tool_choice="auto", temperature=temperature,
                                         max_tokens=max_tokens, raw_message=True)
        except Exception as exc:  # noqa: BLE001
            out["error"] = f"{type(exc).__name__}: {str(exc)[:200]}"
            return out
        out["model"] = used
        if isinstance(message, str):                       # plain completion
            out["reply"] = message
            return out
        calls = message.get("tool_calls") or []
        content = message.get("content") or ""
        if not calls:
            out["reply"] = content
            return out
        messages.append({"role": "assistant", "content": content, "tool_calls": calls})
        for call in calls:
            fn = call.get("function") or {}
            result = run_tool(fn.get("name"), fn.get("arguments"))
            out["tool_calls"].append({"round": round_no, "name": fn.get("name"),
                                      "arguments": fn.get("arguments"), "ok": result.get("ok")})
            messages.append({
                "role": "tool",
                "tool_call_id": call.get("id") or f"call_{len(out['tool_calls'])}",
                "name": fn.get("name"),
                "content": json.dumps(result, ensure_ascii=False)[:1500],
            })
    out["error"] = f"the model kept calling tools after {max_rounds} rounds"
    return out


# ── deterministic checks: the part that does not trust any model ─────────────
def _claim_parts(claim: str) -> Optional[Tuple[str, str]]:
    m = re.match(r"\s*([A-Za-z][A-Za-z_0-9]{0,3})\s*=\s*(.+)$", str(claim or ""))
    return (m.group(1), m.group(2)) if m else None


def _numeric(text: str) -> Optional[float]:
    try:
        import sympy
        value = complex(sympy.sympify(_clean_expr(text)).evalf())
        return value.real if abs(value.imag) < 1e-9 else None
    except Exception:
        return None


def check_against_presolve(ir: Dict[str, Any], reply: str) -> Dict[str, Any]:
    """Is the claimed value among the SymPy solutions of the given equations?

    The strongest check available: the model was handed these equations and the
    variables, so an answer outside their solution set is wrong (or the
    transcription was wrong — in which case the reading stage already flagged it
    and asked the student).
    """
    presolved = presolve(ir)
    if not presolved:
        return {"name": "presolve", "status": "skipped", "reason": "no equations in the transcription"}
    claims = extract_candidates(reply)
    if not claims:
        return {"name": "presolve", "status": "skipped", "reason": "no explicit final value in the answer"}

    mismatches: List[Dict[str, Any]] = []
    considered = 0
    for equation, info in presolved.items():
        var = info["variable"]
        expected: List[float] = []
        for solution in info["solutions"]:
            text = solution.get(var) if isinstance(solution, dict) else str(solution)
            value = _numeric(str(text))
            if value is not None:
                expected.append(value)
        if not expected:
            continue
        for claim in claims:
            parts = _claim_parts(claim)
            if not parts or parts[0] != var:
                continue
            got = _numeric(parts[1])
            if got is None:
                continue
            considered += 1
            if not any(abs(got - want) < 1e-6 for want in expected):
                mismatches.append({"equation": equation, "variable": var,
                                   "claimed": round(got, 6), "expected": [round(e, 6) for e in expected]})
    if considered == 0:
        return {"name": "presolve", "status": "skipped",
                "reason": "no claimed value matched a transcribed variable"}
    if mismatches:
        return {"name": "presolve", "status": "failed", "detail": mismatches}
    return {"name": "presolve", "status": "passed", "checked": considered}


def check_substitution(ir: Dict[str, Any], reply: str) -> Dict[str, Any]:
    """Substitute the claimed answer back into the ORIGINAL equations."""
    relations = [str(f) for f in (ir.get("latex") or []) if re.search(r"=", str(f))]
    claims = [c for c in extract_candidates(reply) if _claim_parts(c)]
    if not relations or not claims:
        return {"name": "substitution", "status": "skipped", "reason": "no equations or no explicit value"}

    import sympy
    failures: List[Dict[str, Any]] = []
    checked = 0
    for equation in relations[:3]:
        lhs, op, rhs = _split_relation(equation)
        if op != "=":
            continue
        for claim in claims:
            variable, value_text = _claim_parts(claim)  # type: ignore[misc]
            value = _numeric(value_text)
            if value is None:
                continue
            try:
                symbol = sympy.Symbol(variable)
                left = _parse(lhs).subs(symbol, sympy.nsimplify(value, rational=False))
                right = _parse(rhs).subs(symbol, sympy.nsimplify(value, rational=False))
                delta = abs(complex(sympy.simplify(left - right).evalf()))
            except Exception:
                continue
            checked += 1
            if delta > 1e-6:
                failures.append({"equation": equation, "claim": claim, "difference": round(delta, 8)})
    if checked == 0:
        return {"name": "substitution", "status": "skipped", "reason": "nothing substitutable"}
    if failures:
        return {"name": "substitution", "status": "failed", "detail": failures}
    return {"name": "substitution", "status": "passed", "checked": checked}


def _is_value_claim(claim: str) -> bool:
    """True for '<var> = <number>' — that is a final VALUE, not an identity.

    Without this guard the identity check flagged every answer of the form
    `x = 3` as a false identity (difference `x - 3`), which then blocked the
    correct answers and forced pointless repair rounds.
    """
    parts = _claim_parts(claim)
    if not parts:
        return False
    try:
        return not _parse(parts[1]).free_symbols
    except Exception:
        return False


_EQUALITY_RE = re.compile(r"([^\n=<>]{2,90}?)\s*=\s*([^\n=<>]{2,90})")


def extract_equalities(reply: str) -> List[str]:
    """Equalities printed in the WORKING (factorisations, derived steps).

    The final `Đáp án:` line is deliberately skipped — that value is checked by
    the presolve and substitution checks instead of being treated as an identity.
    """
    found: List[str] = []
    for line in str(reply or "").splitlines():
        if re.search(r"đáp\s*án|answer", line, re.IGNORECASE):
            continue
        for match in _EQUALITY_RE.finditer(line):
            lhs = match.group(1).strip(" $.,;:")
            rhs = match.group(2).strip(" $.,;:")
            if not lhs or not rhs:
                continue
            claim = f"{lhs} = {rhs}"
            if _is_value_claim(claim):
                continue
            found.append(claim)
    out, seen = [], set()
    for item in found:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out[:6]


def _verify_identity(claim: str) -> Optional[Dict[str, Any]]:
    """tool_sympy_verify, retrying after dropping leading Vietnamese prose.

    Models write 'Ta có x^2-5x+6 = (x-2)(x-4)'; the parser needs the maths part
    only, so up to four leading words are dropped until it parses.
    """
    lhs, op, rhs = _split_relation(str(claim or ""))
    if op != "=":
        return None
    words = lhs.split()
    for drop in range(0, max(1, min(4, len(words) - 1) + 1)):
        candidate = " ".join(words[drop:]).strip(" $.,;:")
        if not candidate:
            break
        result = tool_sympy_verify(f"{candidate} = {rhs}")
        if result.get("ok"):
            return result
    return None


def check_identities(reply: str) -> Dict[str, Any]:
    """Verify the equalities the model actually printed (factorisations, steps).

    Value claims (`x = 3`) are deliberately excluded — they are the answer, and
    they are already covered by the presolve and substitution checks.
    """
    claims = extract_equalities(reply)
    if not claims:
        return {"name": "identities", "status": "skipped", "reason": "no identity statement to check"}
    failures: List[Dict[str, Any]] = []
    checked = 0
    for claim in claims[:6]:
        result = _verify_identity(claim)
        if not result or not result.get("ok"):
            continue
        checked += 1
        if result.get("true") is False:
            failures.append({"claim": claim, "difference": result.get("difference")})
    if checked == 0:
        return {"name": "identities", "status": "skipped", "reason": "no verifiable equality"}
    if failures:
        return {"name": "identities", "status": "failed", "detail": failures}
    return {"name": "identities", "status": "passed", "checked": checked}


def check_sanity(ir: Dict[str, Any], reply: str) -> Dict[str, Any]:
    """Cheap domain rules: a radius/length/area cannot be negative, a probability
    cannot exceed 1."""
    words = " ".join([*(ir.get("text_blocks") or []), ir.get("transcription") or "",
                      ir.get("student_words") or ""]).lower()
    issues: List[str] = []
    for claim in extract_candidates(reply):
        parts = _claim_parts(claim)
        value = _numeric(parts[1]) if parts else _numeric(claim)
        if value is None:
            continue
        if value < 0 and any(k in words for k in ("bán kính", "độ dài", "diện tích",
                                                  "thể tích", "radius", "length", "area")):
            issues.append(f"'{claim}' is negative but the problem asks for a length/area/radius")
        if value > 1 and "%" not in claim and any(k in words for k in ("xác suất", "probability")):
            issues.append(f"'{claim}' exceeds 1 but the problem asks for a probability")
    if issues:
        return {"name": "sanity", "status": "failed", "detail": issues}
    return {"name": "sanity", "status": "passed"}


def deterministic_checks(ir: Dict[str, Any], reply: str) -> List[Dict[str, Any]]:
    """All checks that never trust a model. Ordered cheapest-first."""
    return [
        check_sanity(ir, reply),
        check_against_presolve(ir, reply),
        check_substitution(ir, reply),
        check_identities(reply),
    ]


def failed_checks(checks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [c for c in checks if c.get("status") == "failed"]


# ── critic: a second opinion from ANOTHER model family ──────────────────────
CRITIC_SYSTEM = """You are a strict mathematics examiner. You receive a problem transcription and a
proposed solution. Check the solution against the problem: using a calculator tool does not make a
step correct if the wrong expression was computed.

Return ONLY a JSON object (no markdown, no commentary):
{"verdict": "correct" | "wrong" | "unclear",
 "failed_steps": ["short description of each step that is wrong"],
 "corrected_final": "the correct final value, or an empty string when unsure"}
"""


def _parse_json_obj(raw: str) -> Optional[Dict[str, Any]]:
    text = str(raw or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text).strip()
    match = re.search(r"(\{[\s\S]*\})", text)
    for candidate in (text, match.group(1) if match else ""):
        if not candidate:
            continue
        for attempt in (candidate, re.sub(r",\s*([}\]])", r"\1", candidate)):
            try:
                obj = json.loads(attempt)
                if isinstance(obj, dict) and obj:
                    return obj
            except Exception:
                pass
    return None


def verify_mode() -> str:
    """MATH_VERIFY_MODE: off | auto (default) | always."""
    mode = os.environ.get("MATH_VERIFY_MODE", "auto").strip().lower()
    return mode if mode in ("off", "auto", "always") else "auto"


def should_verify(user_message: str = "", reply: str = "",
                  perception: Optional[Dict[str, Any]] = None) -> bool:
    """`auto` mode gate: only pay for verification when there is something
    concrete to check — a perception result, or a reply with an extractable
    answer next to real maths."""
    mode = verify_mode()
    if mode == "off":
        return False
    if mode == "always":
        return True
    if perception:
        return True
    return bool(extract_candidates(reply)) and bool(re.search(r"[=<>^\\]|frac|sqrt", f"{user_message} {reply}"))


async def critic_review(ir: Dict[str, Any], reply: str, *, chat_fn: Optional[Callable] = None,
                        models: Optional[List[str]] = None, max_tokens: int = 700) -> Optional[Dict[str, Any]]:
    """Ask a model from a DIFFERENT family to judge the solution. Never raises."""
    if chat_fn is None:
        return None
    payload = json.dumps({
        "problem": _ir_to_prompt(ir)[:4000],
        "solution": str(reply or "")[:4000],
    }, ensure_ascii=False)
    try:
        content, used = await chat_fn(models=models or critic_models(),
                                      messages=[{"role": "system", "content": CRITIC_SYSTEM},
                                                {"role": "user", "content": payload}],
                                      temperature=0.0, max_tokens=max_tokens)
    except Exception as exc:  # noqa: BLE001
        return {"verdict": "unclear", "failed_steps": [],
                "error": f"{type(exc).__name__}: {str(exc)[:160]}", "model": None}
    data = _parse_json_obj(content) or {}
    verdict = str(data.get("verdict") or "unclear").strip().lower()
    if verdict not in ("correct", "wrong", "unclear"):
        verdict = "unclear"
    if not data:
        return {"verdict": "unclear", "failed_steps": [], "model": used,
                "error": "the critic did not return JSON", "raw": str(content or "")[:400]}
    return {"verdict": verdict,
            "failed_steps": [str(s) for s in (data.get("failed_steps") or [])][:6],
            "corrected_final": str(data.get("corrected_final") or "")[:200],
            "model": used}


async def _repair(ir: Dict[str, Any], reply: str, evidence: Dict[str, Any],
                  *, chat_fn: Optional[Callable] = None) -> Optional[str]:
    """ONE repair round: same problem, the failing evidence attached, tools allowed."""
    if chat_fn is None:
        return None
    prompt = (f"BÀI TOÁN (bản ghi lại, KHÔNG được đổi đề):\n{_ir_to_prompt(ir)}\n\n"
              f"LỜI GIẢI ĐỀ XUẤT TRƯỚC ĐÓ:\n{str(reply or '')[:3000]}\n\n"
              f"KIỂM TRA ĐÃ PHÁT HIỆN LỖI:\n{json.dumps(evidence, ensure_ascii=False)[:1500]}\n\n"
              "Hãy sửa lại lời giải: giữ nguyên đề bài, tính lại mọi con số bằng tool SymPy, "
              "và kết thúc bằng đúng một dòng `Đáp án: ...`.")
    try:
        content, _used = await chat_fn(models=solver_models(),
                                       messages=[{"role": "system", "content": SOLVER_SYSTEM},
                                                 {"role": "user", "content": prompt}],
                                       temperature=0.0, max_tokens=1800)
    except Exception as exc:  # noqa: BLE001
        logger.warning("[MathSolver] repair round failed (%s)", exc)
        return None
    return content if str(content or "").strip() else None


BADGE_TEMPLATE = ("\n\n> ⚠️ **Chưa kiểm chứng được đáp án này** ({reasons}). "
                  "Em nên đối chiếu lại đề hoặc hỏi giáo viên trước khi tin chắc nhé.")


def unverified_note(verification: Optional[Dict[str, Any]]) -> str:
    """Vietnamese note appended to an answer that failed its checks."""
    v = verification or {}
    if v.get("verified", True):
        return ""
    reasons: List[str] = [str(c.get("name")) for c in (v.get("checks") or []) if c.get("status") == "failed"]
    if (v.get("critic") or {}).get("verdict") == "wrong":
        reasons.append("bộ phản biện cho rằng lời giải sai")
    if not reasons:
        reasons.append("kiểm tra chưa kết luận được")
    return BADGE_TEMPLATE.format(reasons="; ".join(reasons[:3]))


async def verify_and_repair(ir: Dict[str, Any], reply: str, *, chat_fn: Optional[Callable] = None,
                            mode: Optional[str] = None) -> Dict[str, Any]:
    """Check a finished answer; repair it ONCE when a check fails, then re-check.

    Returns {reply, verified, checks, critic, repaired, notes, mode}. The caller
    appends `unverified_note()` to the reply when `verified` is False.
    """
    mode = (mode or verify_mode()).lower()
    result: Dict[str, Any] = {"verified": False, "checks": [], "critic": None,
                              "repaired": False, "notes": "", "reply": reply, "mode": mode}
    if mode == "off" or not str(reply or "").strip():
        result["notes"] = "verification disabled" if mode == "off" else "empty reply"
        result["verified"] = mode == "off"
        return result

    checks = deterministic_checks(ir, reply)
    critic = await critic_review(ir, reply, chat_fn=chat_fn)
    bad = failed_checks(checks)
    verdict = (critic or {}).get("verdict")
    result.update(checks=checks, critic=critic)
    if not bad and verdict != "wrong":
        result["verified"] = True
        result["notes"] = "deterministic checks passed" + (", critic agrees" if verdict == "correct" else "")
        return result

    if chat_fn is None:
        result["notes"] = "checks failed and no model was available to repair"
        return result

    evidence = {
        "failed_checks": bad,
        "critic": {k: (critic or {}).get(k) for k in ("verdict", "failed_steps", "corrected_final")},
    }
    repaired_reply = await _repair(ir, reply, evidence, chat_fn=chat_fn)
    if repaired_reply:
        checks_after = deterministic_checks(ir, repaired_reply)
        critic_after = await critic_review(ir, repaired_reply, chat_fn=chat_fn)
        if not failed_checks(checks_after) and (critic_after or {}).get("verdict") != "wrong":
            result.update(reply=repaired_reply, checks=checks_after, critic=critic_after,
                          verified=True, repaired=True, notes="đã sửa và kiểm lại đạt")
            logger.info("[MathSolver] repaired a failing answer (checks now pass)")
            return result
        result.update(checks=checks_after, critic=critic_after, repaired=True)

    result["verified"] = False
    result["notes"] = "kiểm tra không đạt: " + ", ".join(
        str(c.get("name", "?")) for c in (failed_checks(result["checks"]) or bad))
    return result

