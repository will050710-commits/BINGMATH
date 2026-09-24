"""Phase 0 security hardening — safe evaluation of math expressions.

Replaces the historical ``eval()`` calls in ``canvas_to_video.py`` (which were
reachable from the unauthenticated ``/api/video/generate`` endpoint and could
execute arbitrary Python). Only a small, explicit allowlist of syntax and
functions is accepted; everything else is rejected *before* any code object
is compiled, and the execution namespace has no ``__builtins__``.

Supported:  numbers, x, pi/e/tau, + - * / % ** (also ``^``), parentheses,
comparisons, and the whitelisted functions below written either bare
(``sin(x)``) or via a namespace (``np.sin(x)`` / ``Math.sin(x)``).
"""
from __future__ import annotations

import ast
import math
import re
from typing import Any, Callable, Dict

import numpy as np

MAX_EXPR_LEN = 200
MAX_AST_NODES = 120
MAX_CONSTANT_ABS = 1e6
MAX_POW_EXPONENT = 64

_ALLOWED_CHARS = re.compile(r"^[0-9A-Za-z_+\-*/%^().,\s]*$")

_FUNCS: Dict[str, Callable[..., Any]] = {
    "sin": np.sin, "cos": np.cos, "tan": np.tan,
    "asin": np.arcsin, "acos": np.arccos, "atan": np.arctan,
    "sinh": np.sinh, "cosh": np.cosh, "tanh": np.tanh,
    "exp": np.exp, "log": np.log, "log10": np.log10, "log2": np.log2,
    "sqrt": np.sqrt, "cbrt": np.cbrt, "abs": np.abs,
    "floor": np.floor, "ceil": np.ceil, "sign": np.sign, "round": np.round,
    "min": np.minimum, "max": np.maximum, "pow": np.power,
}

_CONSTANTS: Dict[str, Any] = {"pi": np.pi, "e": np.e, "tau": math.tau, "inf": np.inf}

_ALLOWED_NODES = (
    ast.Expression, ast.BinOp, ast.UnaryOp, ast.Call, ast.Name, ast.Load,
    ast.Constant, ast.Attribute, ast.Compare, ast.IfExp, ast.BoolOp,
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow, ast.Mod, ast.FloorDiv,
    ast.USub, ast.UAdd,
    ast.Lt, ast.Gt, ast.LtE, ast.GtE, ast.Eq, ast.NotEq,
    ast.And, ast.Or, ast.Not,
)


class UnsafeExpression(ValueError):
    """Raised when an expression uses syntax/names outside the allowlist."""


class _NamespaceView:
    """``np`` / ``Math`` replacement exposing only whitelisted members."""

    def __getattr__(self, name: str) -> Any:
        if name in _FUNCS:
            return _FUNCS[name]
        if name in _CONSTANTS:
            return _CONSTANTS[name]
        raise AttributeError(f"forbidden namespace member: {name}")


_NS_VIEW = _NamespaceView()


def _check_node(node: ast.AST) -> None:
    if isinstance(node, ast.Attribute):
        if not (isinstance(node.value, ast.Name) and node.value.id in {"np", "Math"}):
            raise UnsafeExpression(f"forbidden attribute access: .{node.attr}")
        if node.attr not in _FUNCS and node.attr not in _CONSTANTS:
            raise UnsafeExpression(f"forbidden namespace member: {node.attr}")
        return

    if isinstance(node, ast.Call):
        func = node.func
        if isinstance(func, ast.Name):
            if func.id not in _FUNCS:
                raise UnsafeExpression(f"forbidden function: {func.id}")
        elif isinstance(func, ast.Attribute):
            if func.attr not in _FUNCS:
                raise UnsafeExpression(f"forbidden function: {func.attr}")
        else:
            raise UnsafeExpression("forbidden call target")
        if node.keywords:
            raise UnsafeExpression("keyword arguments are not allowed")
        return

    if isinstance(node, ast.Name):
        if node.id not in _FUNCS and node.id not in _CONSTANTS and node.id not in {"x", "np", "Math"}:
            raise UnsafeExpression(f"forbidden name: {node.id}")
        return

    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)) and abs(node.value) > MAX_CONSTANT_ABS:
            raise UnsafeExpression("numeric constant out of allowed range")
        return

    if isinstance(node, ast.BinOp):
        # Guard against array-blowup DoS: x**1e6 would allocate huge arrays.
        if isinstance(node.op, ast.Pow) and isinstance(node.right, ast.Constant):
            if isinstance(node.right.value, (int, float)) and abs(node.right.value) > MAX_POW_EXPONENT:
                raise UnsafeExpression("exponent out of allowed range")
        return

    if not isinstance(node, _ALLOWED_NODES):
        raise UnsafeExpression(f"forbidden syntax: {type(node).__name__}")


def normalize_expr(expr: str) -> str:
    """Normalise Math.* → np.*, ``^`` → ``**`` and the time variable ``t`` → ``x``."""
    clean = str(expr).strip()
    clean = clean.replace("Math.", "np.")
    clean = re.sub(r"\bt\b", "x", clean)
    clean = clean.replace("^", "**")
    return clean


def compile_expr(expr: str) -> Callable[[Any], Any]:
    """Validate ``expr`` and return ``f(x)`` safe for scalars and numpy arrays."""
    if not isinstance(expr, str):
        raise UnsafeExpression("expression must be a string")

    clean = expr.strip()
    if not clean:
        raise UnsafeExpression("empty expression")
    if len(clean) > MAX_EXPR_LEN:
        raise UnsafeExpression("expression too long")
    if not clean.isascii() or not _ALLOWED_CHARS.match(clean):
        raise UnsafeExpression("illegal characters in expression")

    normalized = normalize_expr(clean)
    try:
        tree = ast.parse(normalized, mode="eval")
    except SyntaxError as exc:
        raise UnsafeExpression(f"syntax error: {exc.msg}") from exc

    if sum(1 for _ in ast.walk(tree)) > MAX_AST_NODES:
        raise UnsafeExpression("expression too complex")

    for node in ast.walk(tree):
        _check_node(node)

    code = compile(tree, "<safe-expr>", "eval")
    namespace: Dict[str, Any] = {"__builtins__": {}, "np": _NS_VIEW, "Math": _NS_VIEW}
    namespace.update(_FUNCS)
    namespace.update(_CONSTANTS)

    def _evaluate(x: Any) -> Any:
        return eval(code, namespace, {"x": x})  # noqa: S307 - allowlisted AST only

    return _evaluate


def safe_eval(expr: str, x: Any) -> Any:
    """Convenience helper: compile and evaluate in one call."""
    return compile_expr(expr)(x)
