"""
bench_common.py
===============
Shared helpers for the EXTERNAL benchmarks (eval_external_benchmark.py and
eval_hallucination.py):

* `load_env()`            - read backend/.env without overriding real env vars;
* `chat()`                - one OpenAI-compatible chat call (Groq / Cerebras /
                            NVIDIA) with retry on 429/5xx, no third-party SDK;
* `extract_final_answer()`- last \\boxed{...} (brace-matched) or "Đáp án:" line;
* `answers_equivalent()`  - string normalisation first, then SymPy numeric /
                            symbolic equivalence of a small LaTeX subset;
* `wilson_ci()`           - 95% Wilson score interval for a pass rate.

Everything here is deterministic except `chat()`; the graders never call an LLM.
"""

import json
import math
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx
import sympy
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "training" / "raw_data"

PROVIDERS: Dict[str, Dict[str, str]] = {
    "cerebras": {"base": "https://api.cerebras.ai/v1", "key_env": "CEREBRAS_API_KEY"},
    "groq": {"base": "https://api.groq.com/openai/v1", "key_env": "GROQ_API_KEY"},
    "nvidia": {"base": "https://integrate.api.nvidia.com/v1", "key_env": "NVIDIA_API_KEY_PRIMARY"},
}


def load_env() -> None:
    env_path = BACKEND_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def chat(provider: str, model: str, messages: List[Dict[str, str]], *,
         max_tokens: int = 2048, temperature: float = 0.0, timeout: float = 120.0,
         retries: int = 5) -> Tuple[str, Dict[str, Any]]:
    """Returns (reply_text, meta). Raises RuntimeError after `retries` failures."""
    cfg = PROVIDERS[provider]
    key = os.environ.get(cfg["key_env"], "").strip()
    if not key:
        raise RuntimeError(f"{cfg['key_env']} is not set")
    body = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
    last_err = ""
    for attempt in range(retries):
        t0 = time.time()
        try:
            resp = httpx.post(f"{cfg['base']}/chat/completions", json=body, timeout=timeout,
                              headers={"Authorization": f"Bearer {key}"})
            if resp.status_code == 200:
                data = resp.json()
                text = (data["choices"][0]["message"].get("content") or "").strip()
                return text, {"latency_s": round(time.time() - t0, 2), "usage": data.get("usage", {})}
            last_err = f"HTTP {resp.status_code}: {resp.text[:200]}"
            if resp.status_code not in (408, 429, 500, 502, 503, 504):
                break
        except httpx.HTTPError as exc:
            last_err = f"{type(exc).__name__}: {exc}"
        time.sleep(min(60, 4 * (2 ** attempt)))
    raise RuntimeError(last_err)


# ── answer extraction ───────────────────────────────────────────────────────

def last_boxed(text: str) -> Optional[str]:
    """Content of the LAST \\boxed{...} / \\fbox{...}, with nested braces."""
    idx = max(text.rfind("\\boxed"), text.rfind("\\fbox"))
    if idx < 0:
        return None
    start = text.find("{", idx)
    if start < 0:
        return None
    depth = 0
    for pos in range(start, len(text)):
        if text[pos] == "{":
            depth += 1
        elif text[pos] == "}":
            depth -= 1
            if depth == 0:
                return text[start + 1:pos].strip()
    return None


def extract_final_answer(text: str) -> Optional[str]:
    boxed = last_boxed(text or "")
    if boxed is not None:
        return boxed
    m = re.findall(r"(?:Đáp án|Đáp số|Kết quả|The answer is|Final answer)\s*[:：]\s*\$?([^\n$]+)", text or "", re.I)
    return m[-1].strip().rstrip(".") if m else None


# ── answer normalisation + equivalence ──────────────────────────────────────

_TEXT_CMD = re.compile(r"\\(?:text|textbf|mathrm|mbox|operatorname)\{([^{}]*)\}")
_UNITS = re.compile(r"\b(?:units?|degrees?|cm|km|inches|inch|feet|foot|dollars?|cents?|đơn vị|độ)\b", re.I)


def normalize_answer(ans: Optional[str]) -> str:
    if ans is None:
        return ""
    s = str(ans).strip()
    s = s.replace("$", "").replace("\\!", "").replace("\\,", "").replace("\\;", "").replace("\\ ", "")
    s = s.replace("\\left", "").replace("\\right", "").replace("\\displaystyle", "")
    s = s.replace("\\dfrac", "\\frac").replace("\\tfrac", "\\frac")
    s = s.replace("^\\circ", "").replace("^{\\circ}", "").replace("°", "").replace("\\%", "").replace("%", "")
    s = _TEXT_CMD.sub(r"\1", s)
    s = _UNITS.sub("", s)
    s = re.sub(r"^[a-zA-Z]\s*=\s*", "", s)           # "x = 5" -> "5"
    s = re.sub(r"(\d),(\d{3})(?!\d)", r"\1\2", s)    # 1,000 -> 1000
    s = s.replace(" ", "").rstrip(".")
    return s


def _latex_to_sympy_str(s: str) -> str:
    out = s
    for _ in range(6):  # nested \frac / \sqrt
        out = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", out)
        out = re.sub(r"\\frac(\d)(\d)", r"((\1)/(\2))", out)
        out = re.sub(r"\\sqrt\[([^\]]*)\]\{([^{}]*)\}", r"((\2)**(1/(\1)))", out)
        out = re.sub(r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)", out)
        out = re.sub(r"\\sqrt(\d+)", r"sqrt(\1)", out)
    out = out.replace("\\pi", "pi").replace("\\cdot", "*").replace("\\times", "*").replace("\\div", "/")
    out = out.replace("\\infty", "oo").replace("{", "(").replace("}", ")").replace("\\", "")
    return out


_TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)


def _to_sympy(s: str):
    return parse_expr(_latex_to_sympy_str(s), transformations=_TRANSFORMS, evaluate=True)


def answers_equivalent(pred: Optional[str], gold: Optional[str]) -> bool:
    a, b = normalize_answer(pred), normalize_answer(gold)
    if not a or not b:
        return False
    if a == b:
        return True
    # tuples / intervals: same brackets, element-wise, order kept
    if ("," in a or "," in b) and a[:1] in "([{" and b[:1] in "([{":
        if a[0] != b[0] or a[-1:] != b[-1:]:
            return False
        pa, pb = a[1:-1].split(","), b[1:-1].split(",")
        return len(pa) == len(pb) and all(answers_equivalent(x, y) for x, y in zip(pa, pb))
    if "," in a and "," in b:  # unordered list of roots
        pa, pb = a.split(","), b.split(",")
        return len(pa) == len(pb) and all(any(answers_equivalent(x, y) for y in pb) for x in pa)
    try:
        ea, eb = _to_sympy(a), _to_sympy(b)
        if sympy.simplify(ea - eb) == 0:
            return True
        va, vb = complex(ea.evalf()), complex(eb.evalf())
        return abs(va - vb) <= 1e-6 * max(1.0, abs(vb))
    except Exception:
        return False


def wilson_ci(passed: int, total: int, z: float = 1.96) -> Tuple[float, float]:
    """95% Wilson score interval, in percent."""
    if total == 0:
        return (0.0, 0.0)
    p = passed / total
    denom = 1 + z * z / total
    centre = (p + z * z / (2 * total)) / denom
    half = z * math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denom
    return (round(100 * max(0.0, centre - half), 1), round(100 * min(1.0, centre + half), 1))


def append_jsonl(path: Path, record: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_jsonl(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    out: List[Dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if not s:
            continue
        try:
            out.append(json.loads(s))
        except Exception:
            continue
    return out
