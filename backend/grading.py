"""Phase 1 — server-side grading (audit finding P1-8).

The score used to be computed in the browser (frontend/src/utils/scoring.js)
from an ANSWER_KEY that ships inside the JS bundle, and the backend stored
whatever score the client sent — so anyone could (a) read the answers and
(b) forge a perfect result straight into the leaderboard.

This module owns the answer key (answer_key.json, generated from the old
frontend file) and grades submissions server-side. Numeric answers are
compared by *value* (1/2 == 0.5, 2x == 2*x) instead of by string equality,
using HuggingFace math-verify when available and a restricted SymPy parser
otherwise (guide item 2.3).
"""
from __future__ import annotations

import json
import os
import re
import unicodedata
from typing import Any, Dict, List, Optional

_KEY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "answer_key.json")
with open(_KEY_PATH, encoding="utf-8") as _fh:
    ANSWER_KEY: Dict[str, Dict[str, Dict[str, str]]] = json.load(_fh)

MAX_ANSWER_LEN = 300

# ── Optional: HuggingFace math-verify (https://github.com/huggingface/Math-Verify)
try:  # pragma: no cover - exercised when the package is installed
    from math_verify import parse as _mv_parse  # pyright: ignore[reportMissingImports]
    from math_verify import verify as _mv_verify  # pyright: ignore[reportMissingImports]

    MATH_VERIFY_AVAILABLE = True
except Exception:  # ImportError or a broken optional dependency
    _mv_parse = _mv_verify = None
    MATH_VERIFY_AVAILABLE = False

# ── Fallback: restricted SymPy parser (no eval of arbitrary code)
import sympy  # noqa: E402
from sympy.parsing.sympy_parser import (  # noqa: E402
    implicit_multiplication_application,
    parse_expr,
    rationalize,
    standard_transformations,
)

_TRANSFORMS = standard_transformations + (implicit_multiplication_application, rationalize)
_ALLOWED_SYMPY_GLOBALS = {
    "Symbol": sympy.Symbol,
    "Integer": sympy.Integer,
    "Float": sympy.Float,
    "Rational": sympy.Rational,
    "Abs": sympy.Abs,
    "sqrt": sympy.sqrt,
    "cbrt": sympy.cbrt,
    "sin": sympy.sin,
    "cos": sympy.cos,
    "tan": sympy.tan,
    "asin": sympy.asin,
    "acos": sympy.acos,
    "atan": sympy.atan,
    "log": sympy.log,
    "ln": sympy.log,
    "exp": sympy.exp,
    "pi": sympy.pi,
    "E": sympy.E,
    "oo": sympy.oo,
    "I": sympy.I,
}

# The parser itself needs the core SymPy classes (Mul, Add, Pow, ...) to build
# the AST. They are pure data classes: they cannot read files, import modules
# or execute code, so they are safe to expose to the restricted parser.
for _core_name in (
    "Add", "Mul", "Pow", "Mod", "Div", "NegativeOne", "One", "Half", "Zero",
    "NaN", "Tuple", "Function", "Wild", "Equality", "Unequality", "Number",
):
    _core_obj = getattr(sympy, _core_name, None)
    if _core_obj is not None:
        _ALLOWED_SYMPY_GLOBALS[_core_name] = _core_obj

# Rejected outright before the parser sees them (defence in depth; the parser
# cannot evaluate attribute access or call arbitrary callables anyway).
_FORBIDDEN_SNIPPETS = (
    "__", "import", "open", "exec", "eval", "lambda", "global", "class",
    "subprocess", "compile",
)


def _guard_expression(text: str) -> str:
    """Length + payload guard shared by every SymPy entry point."""
    clean = str(text or "").strip()
    if not clean or len(clean) > MAX_ANSWER_LEN:
        raise ValueError("expression is empty or too long")
    lowered = clean.lower()
    for snippet in _FORBIDDEN_SNIPPETS:
        if snippet in lowered:
            raise ValueError(f"forbidden token: {snippet}")
    return clean


def _ascii_math(text: str) -> str:
    """Normalise typography (unicode minus, √, ×, ÷, superscripts) to ASCII math."""
    out = unicodedata.normalize("NFKC", str(text or "")).strip()
    out = (out.replace("−", "-").replace("–", "-").replace("×", "*")
              .replace("÷", "/").replace("π", "pi")
              .replace("≤", "<=").replace("≥", ">=").replace("≠", "!=")
              .replace("²", "^2").replace("³", "^3"))
    # √ needs its argument parenthesised: √3/2 -> sqrt(3)/2, 2√3 -> 2sqrt(3)
    out = out.replace("√(", "sqrt(")
    out = re.sub(r"√\s*([0-9]+(?:\.[0-9]+)?|[a-zA-Z])", r"sqrt(\1)", out)
    out = out.replace("√", "sqrt")
    return out


def _normalise_text(text: str) -> str:
    """Case/space/punctuation-insensitive form used for the final fallback."""
    out = _ascii_math(text).lower()
    out = re.sub(r"\s+", " ", out)
    out = out.replace(" ", "")
    out = out.strip(".;,")
    return out


# Extra helpers allowed when parsing *tool* expressions (Gemini tool-calling);
# still a restricted namespace — no imports, no attribute access, no eval().
_TOOL_SYMPY_GLOBALS = dict(_ALLOWED_SYMPY_GLOBALS)
_TOOL_SYMPY_GLOBALS.update({
    "integrate": sympy.integrate,
    "Integral": sympy.Integral,
    "diff": sympy.diff,
    "solve": sympy.solve,
    "Eq": sympy.Eq,
    "symbols": sympy.symbols,
    "factorial": sympy.factorial,
    "binomial": sympy.binomial,
    "Sum": sympy.Sum,
    "Product": sympy.Product,
    "limit": sympy.limit,
    "series": sympy.series,
    "simplify": sympy.simplify,
    "expand": sympy.expand,
    "factor": sympy.factor,
    "floor": sympy.floor,
    "ceiling": sympy.ceiling,
})


def safe_symbolic_parse(text: str):
    """Parse a user/LLM expression with a restricted namespace (Phase 1).

    Replaces `sympy.sympify`, which is documented as unsafe for untrusted
    input. Raises ValueError/SyntaxError on anything outside the allowlist.
    """
    clean = _guard_expression(_ascii_math(text))
    return parse_expr(clean, transformations=_TRANSFORMS,
                      global_dict=dict(_TOOL_SYMPY_GLOBALS), evaluate=True)


_MCQ_LETTER = re.compile(r"^[a-d]$")


def _mcq_match(norm_user: str, norm_correct: str) -> bool:
    """MCQ keys store a bare letter; students usually submit the full option."""
    if not _MCQ_LETTER.match(norm_correct):
        return False
    return norm_user == norm_correct or norm_user.startswith(norm_correct + ".")


def _sympy_equivalent(a: str, b: str) -> Optional[bool]:
    """Restricted SymPy comparison; None when either side is not parseable."""
    try:
        left_text = _guard_expression(a)
        right_text = _guard_expression(b)
    except ValueError:
        return None
    if len(left_text) > MAX_ANSWER_LEN or len(right_text) > MAX_ANSWER_LEN:
        return None
    try:
        left = parse_expr(left_text, transformations=_TRANSFORMS,
                          global_dict=dict(_ALLOWED_SYMPY_GLOBALS), evaluate=False)
        right = parse_expr(right_text, transformations=_TRANSFORMS,
                           global_dict=dict(_ALLOWED_SYMPY_GLOBALS), evaluate=False)
    except Exception:
        return None
    try:
        return sympy.simplify(sympy.together(left - right)) == 0
    except Exception:
        try:
            return bool(left.equals(right))
        except Exception:
            return None


def _split_equation(text: str) -> Optional[tuple]:
    if text.count("=") == 1:
        lhs, rhs = text.split("=", 1)
        return lhs.strip(), rhs.strip()
    return None


def _equation_equivalent(user: str, correct: str) -> Optional[bool]:
    """Handle 'x = 1/2' vs '1/2' and equation-vs-equation cases."""
    user_eq = _split_equation(user)
    correct_eq = _split_equation(correct)
    if user_eq is None and correct_eq is None:
        return None
    if user_eq is not None and correct_eq is None:
        return any(side and answers_equivalent(side, correct) for side in user_eq)
    if user_eq is None and correct_eq is not None:
        return any(side and answers_equivalent(user, side) for side in correct_eq)
    # both equations: compare algebraically (everything moved to the left side)
    return _sympy_equivalent(f"({user_eq[0]})-({user_eq[1]})", f"({correct_eq[0]})-({correct_eq[1]})")


def answers_equivalent(submitted: Any, correct: Any) -> bool:
    """True when a student answer is mathematically equal to the key answer."""
    if submitted is None:
        return False
    user_raw, key_raw = str(submitted), str(correct)
    if not user_raw.strip() or not key_raw.strip():
        return False
    if len(user_raw) > MAX_ANSWER_LEN:
        user_raw = user_raw[:MAX_ANSWER_LEN]

    user_norm, key_norm = _normalise_text(user_raw), _normalise_text(key_raw)
    if not user_norm:
        return False
    if user_norm == key_norm or _mcq_match(user_norm, key_norm):
        return True

    user_math, key_math = _ascii_math(user_raw), _ascii_math(key_raw)

    eq = _equation_equivalent(user_math, key_math)
    if eq:
        return True

    # SymPy first: it understands the plain ASCII maths this answer key uses
    # ("1/2", "2x", "sqrt(3)/2"). math-verify is LaTeX-oriented — it returns an
    # empty parse for bare ASCII numbers — so it only gets a chance on
    # LaTeX-looking input, where it is the stronger checker.
    sym = _sympy_equivalent(user_math, key_math)
    if sym:
        return True

    if MATH_VERIFY_AVAILABLE and ("\\" in user_math + key_math or "{" in user_math + key_math):
        try:
            if _mv_verify(_mv_parse(key_math), _mv_parse(user_math)):
                return True
        except Exception:
            pass

    if sym is False:
        return False

    # Last resort: ignore separators only (NOT digits/letters).
    squeeze = lambda s: re.sub(r"[^0-9a-z+\-*/^=().]", "", s)  # noqa: E731
    return squeeze(user_norm) == squeeze(key_norm)


def grade_section(test_key: str, section: str, answers: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Grade one section server-side. None when test_key/section is unknown.

    The result includes the per-question detail with the correct answers; that
    detail is for internal use — API handlers must not return `questions`
    (otherwise the endpoint would become an answer-key oracle).
    """
    exam = ANSWER_KEY.get(str(test_key or "").strip())
    if not isinstance(exam, dict):
        return None
    key_section = exam.get(str(section or "").strip())
    if not isinstance(key_section, dict):
        return None

    answers = answers if isinstance(answers, dict) else {}
    questions: List[Dict[str, Any]] = []
    correct_count = 0
    answered = 0

    for q_key, correct_answer in key_section.items():
        raw = answers.get(q_key)
        user_answer = None if raw is None else str(raw)
        if user_answer and user_answer.strip():
            answered += 1
        ok = answers_equivalent(user_answer, correct_answer)
        if ok:
            correct_count += 1
        questions.append({
            "key": q_key,
            "correctAnswer": str(correct_answer),
            "userAnswer": user_answer,
            "isCorrect": ok,
        })

    total = len(key_section)
    accuracy = round((correct_count / total * 100) if total else 0.0, 1)
    return {
        "test_key": test_key,
        "section": section,
        "score": correct_count,
        "total": total,
        "accuracy": accuracy,
        "answered": answered,
        "questions": questions,
    }


def known_test(test_key: str) -> bool:
    return isinstance(ANSWER_KEY.get(str(test_key or "").strip()), dict)


def answer_key_stats() -> Dict[str, int]:
    exams = len(ANSWER_KEY)
    questions = sum(len(sec) for exam in ANSWER_KEY.values() for sec in exam.values())
    return {"exams": exams, "questions": questions}

