"""
math_reader.py
==============
Phase 4 / Đợt 4A — "Verified MathReader": perception that cross-checks itself.

Why this module exists
----------------------
Before Đợt 4A the chat pipeline read an image exactly once, with one model, and
passed whatever came back straight into the solver. A single misread symbol
($x^5$ read as $x^3$) produced a fully self-consistent but WRONG solution, and
nothing in the system could notice: the math was checked, the reading was not.

What the reader does now
------------------------
  1. Asks one vision model for a *transcription-only* JSON payload (problem
     kind, LaTeX, text blocks, diagram, per-formula bbox, confidence).
  2. Decides whether a second, different-family reader is needed
     (`AI_DUAL_READ=auto` asks when the first read is unsure or ambiguous;
     `always` reads twice in parallel; `never` restores the old behaviour).
  3. Compares both transcriptions after LaTeX normalisation and reports
     `agree` / `merge` / `conflict`. On a conflict it can ask a third reader
     (default: Gemini's vision call, already wired in main.py) and, if still
     unconvinced, sets `needs_confirm` so the UI asks the student which reading
     is right — instead of silently solving the wrong problem.
  4. Runs every formula through the restricted SymPy parser from grading.py and
     re-reads just the offending bounding box (cropped + zoomed) once when a
     formula does not parse.
  5. Caches the whole JSON result through vision_cache (SHA-256 then dHash), so
     re-photographing the same page costs no quota.

Additive by design: `AI_DUAL_READ=never` plus the cache prefix means the module
can be switched off without touching any other file. Cache entries are stored
with the `MR1:` prefix so plain-text entries written by the older
GeometryVisionAgent are never mistaken for JSON.
"""

import asyncio
import base64
import difflib
import io
import json
import logging
import os
import re
import time
from typing import Any, Callable, Dict, List, Optional, Tuple

logger = logging.getLogger("duomath.math_reader")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_handler)
logger.setLevel(logging.INFO)

CACHE_PREFIX = "MR1:"
PROMPT_VERSION = 1

# Readers come from DIFFERENT families on purpose: two Qwen variants would share
# the same blind spots, while Qwen + Gemma disagree in a way that is informative.
DEFAULT_READERS = ("qwen/qwen3.8-27b:free", "google/gemma-4-31b-it:free")
DEFAULT_TIEBREAK_MODEL = "dots-studio/dots-3-note-preview:free"

CONFIDENCE_THRESHOLD = 0.75     # below this, the second reader / confirm step kicks in
AGREEMENT_THRESHOLD = 0.93      # normalised-LaTeX similarity that counts as "the same"

READER_PROMPT = """You are a mathematical transcription engine. You do NOT solve anything.

Look at the image and return ONLY a JSON object with this shape:

{
  "kind": "equation" | "inequality" | "system" | "integral" | "derivative" | "limit" | "matrix" | "vector" | "geometry" | "combinatorics" | "mixed",
  "latex": ["...every formula in the image, in LaTeX, in reading order..."],
  "text_blocks": ["...plain text: numbers, labels, instructions, Vietnamese/English words..."],
  "diagram": {
    "points":    ["A: top vertex of triangle ABC", "O: circumcentre"],
    "shapes":    ["Circle Omega with centre O", "Triangle ABC"],
    "relations": ["AB is tangent to Omega at T", "AD is perpendicular to BC"],
    "given_values": ["PT = 12", "PA = 8"]
  },
  "ambiguities": [
    {"where": "exponent of x in line 2", "candidates": ["x^2", "x^3"], "bbox": [0.1, 0.42, 0.3, 0.08], "confidence": 0.55}
  ],
  "confidence": 0.93
}

Rules:
- Transcribe symbols EXACTLY as printed. Never "fix" a formula or complete a step.
- `bbox` is [x, y, width, height] as 0..1 fractions of the image, for each ambiguous spot.
- Fill `diagram` when the image contains a geometric diagram, otherwise null.
- `confidence` is YOUR OWN certainty that the transcription is right, 0..1.
- No markdown fences, no commentary — the JSON object only.
"""

_ws_re = re.compile(r"\s+")


def _normalize_latex(value: str) -> str:
    """Make two readings of the same formula comparable.

    Free models spell one formula a dozen ways: ``x^{2}``, ``x^2``, ``x ^ 2``,
    ``\\left(x\\right)``, ``2 \\times 3`` vs ``2\\cdot 3``, Unicode minus signs…
    Normalising collapses those to one canonical string BEFORE comparing, so a
    formatting difference never looks like a math disagreement while a real
    symbol change still does.
    """
    text = (value or "").strip()
    text = text.replace("$", "")
    for token in ("\\left", "\\right", "\\,", "\\;", "\\!", "\\displaystyle", "\\dfrac", "\\tfrac"):
        text = text.replace(token, "")
    text = text.replace("\\div", "/").replace("÷", "/")
    text = text.replace("\\cdot", "*").replace("\\times", "*").replace("×", "*").replace("·", "*")
    text = text.replace("−", "-").replace("–", "-").replace("—", "-")
    text = text.replace("≤", "<=").replace("≥", ">=").replace("≠", "!=")
    text = text.replace("→", "->").replace("⇒", "=>")
    text = text.replace("π", "\\pi").replace("√", "\\sqrt")
    text = text.replace("\\leq", "<=").replace("\\geq", ">=").replace("\\neq", "!=")
    text = text.replace("\\le", "<=").replace("\\ge", ">=").replace("\\ne", "!=")
    text = text.replace("\\to", "->")
    # x^{2} -> x^2, a_{1} -> a_1 (single-token braces are pure noise)
    text = re.sub(r"\^\{([^{}]{1,12})\}", r"^\1", text)
    text = re.sub(r"_\{([^{}]{1,12})\}", r"_\1", text)
    text = _ws_re.sub(" ", text).strip()
    # Compare without whitespace at all: LaTeX spacing is meaningless here.
    return text.replace(" ", "")


def _similarity(a: str, b: str) -> float:
    """1.0 = identical after normalisation."""
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()



def _formula_match(list_a: List[str], list_b: List[str], threshold: float = AGREEMENT_THRESHOLD) -> Tuple[bool, List[str], List[str]]:
    """Greedy 1-1 matching of formula lists after normalisation.

    Returns (all_matched, only_in_a, only_in_b). Positions are respected first
    (reading order), then whatever is left is matched by best similarity — a
    reader that simply reorders two lines must not be flagged as disagreement.
    """
    norm_a = [_normalize_latex(x) for x in list_a]
    norm_b = [_normalize_latex(x) for x in list_b]
    if len(norm_a) != len(norm_b):
        return False, norm_a, norm_b

    matched_a: set = set()
    matched_b: set = set()
    for i, item in enumerate(norm_a):
        if item == norm_b[i] or _similarity(item, norm_b[i]) >= threshold:
            matched_a.add(i)
            matched_b.add(i)

    leftovers_a = [i for i in range(len(norm_a)) if i not in matched_a]
    leftovers_b = [i for i in range(len(norm_b)) if i not in matched_b]
    for i in leftovers_a:
        best_j, best_score = None, 0.0
        for j in leftovers_b:
            score = _similarity(norm_a[i], norm_b[j])
            if score > best_score:
                best_j, best_score = j, score
        if best_j is not None and best_score >= threshold:
            matched_a.add(i)
            matched_b.add(best_j)

    only_a = [norm_a[i] for i in range(len(norm_a)) if i not in matched_a]
    only_b = [norm_b[i] for i in range(len(norm_b)) if i not in matched_b]
    return (not only_a and not only_b), only_a, only_b


def reader_models() -> List[str]:
    """MATH_READER_MODELS env, default `DEFAULT_READERS` (max 2 readers)."""
    raw = os.environ.get("MATH_READER_MODELS", ",".join(DEFAULT_READERS))
    return [m.strip() for m in raw.split(",") if m.strip()][:2]


def dual_read_mode() -> str:
    """AI_DUAL_READ: auto (default) | always | never."""
    mode = os.environ.get("AI_DUAL_READ", "auto").strip().lower()
    return mode if mode in ("auto", "always", "never") else "auto"


def _parse_payload(raw: str) -> Optional[Dict[str, Any]]:
    """Deliberately independent from main.py (keeps this module unit-testable):
    strip markdown fences, drop trailing commas, then json.loads."""
    text = (raw or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text).strip()
    m = re.search(r"(\{[\s\S]*\})", text)
    for candidate in (text, m.group(1) if m else ""):
        if not candidate:
            continue
        try:
            obj = json.loads(candidate)
            if isinstance(obj, dict) and obj:
                return obj
        except Exception:
            pass
        cleaned = re.sub(r",\s*([}\]])", r"\1", candidate)
        try:
            obj = json.loads(cleaned)
            if isinstance(obj, dict) and obj:
                return obj
        except Exception:
            pass
    return None


async def _read_once(chat_fn: Callable, model: str, image_b64: str, media_type: str,
                     user_hint: str = "", max_tokens: int = 1600) -> Dict[str, Any]:
    """One transcription-only vision call. Returns a result dict, never raises.

    `chat_fn` is injected (main passes its `_openrouter_chat`), which keeps this
    module free of HTTP plumbing and makes the whole reader unit-testable with a
    fake function — no network, no keys.
    """
    started = time.time()
    hint = user_hint.strip()[:600]
    user_text = "Transcribe the mathematics in this image."
    if hint:
        user_text += f"\nStudent's own words about it (context only, may be empty): {hint}"

    messages = [
        {"role": "system", "content": READER_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": user_text},
                {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{image_b64}"}},
            ],
        },
    ]
    try:
        content, used = await chat_fn(models=[model], messages=messages,
                                      temperature=0.0, max_tokens=max_tokens)
    except Exception as exc:  # noqa: BLE001 — a dead reader must not kill the chain
        return {"model": model, "ok": False, "error": f"{type(exc).__name__}: {str(exc)[:160]}",
                "ms": int((time.time() - started) * 1000)}

    payload = _parse_payload(content)
    if not payload:
        return {"model": model, "ok": False, "error": "unparsable JSON",
                "ms": int((time.time() - started) * 1000)}

    return {
        "model": used or model,
        "requested_model": model,
        "ok": True,
        "ms": int((time.time() - started) * 1000),
        "kind": str(payload.get("kind") or "mixed").strip().lower(),
        "latex": [str(x).strip() for x in (payload.get("latex") or []) if str(x).strip()],
        "text_blocks": [str(x).strip() for x in (payload.get("text_blocks") or []) if str(x).strip()],
        "diagram": payload.get("diagram") or None,
        "ambiguities": [a for a in (payload.get("ambiguities") or []) if isinstance(a, dict)],
        "confidence": float(payload.get("confidence") or 0.0),
    }


# ── deterministic symbol gate ────────────────────────────────────────────────
_VI_TEXT_RE = re.compile(r"[àáảãạăâđêôơư]|\\text\{|\\begin\{", re.IGNORECASE)


def _clean_for_sympy(latex: str) -> Optional[str]:
    """Turn one LaTeX formula into something SymPy can parse, or None when the
    line is clearly not a standalone expression (prose, tables, matrices)."""
    text = (latex or "").strip().strip("$").strip()
    if not text or _VI_TEXT_RE.search(text):
        return None
    text = re.sub(r"\\(?:mathrm|operatorname)\{([^{}]*)\}", r"\1", text)
    text = text.replace("\\left", "").replace("\\right", "")
    text = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", text)
    text = re.sub(r"\\sqrt\[(\d)\]\{([^{}]*)\}", r"((\2)**(1/\1))", text)
    text = re.sub(r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)", text)
    text = text.replace("\\cdot", "*").replace("\\times", "*").replace("\\div", "/")
    text = text.replace("\\pi", "pi").replace("\\infty", "oo")
    for fn in ("sin", "cos", "tan", "cot", "log", "ln", "exp", "abs", "max", "min"):
        text = text.replace("\\" + fn, fn)
    text = text.replace("\\", "")
    if "^" in text and "**" not in text:
        text = text.replace("^", "**")
    text = text.replace("{", "(").replace("}", ")")
    text = text.replace("−", "-").replace("×", "*").replace("÷", "/")
    text = re.sub(r"\s+", "", text)
    if len(text) > 400 or not re.search(r"[0-9a-zA-Z]", text):
        return None
    return text


def _parses_with_sympy(expression: str) -> bool:
    """Reuse the Phase 1 restricted parser when importable (allowlist + length
    guard), else a plain sympify. Never raises."""
    try:
        from grading import safe_symbolic_parse  # type: ignore
        return safe_symbolic_parse(expression) is not None
    except Exception:
        pass
    try:
        import sympy
        sympy.sympify(expression, evaluate=True)
        return True
    except Exception:
        return False


# Relational operators come first in the alternation so `<=` is never read as
# `<` followed by `=`.
_RELATIONAL_RE = re.compile(r"<=|>=|!=|=|<|>")


def _expression_parts(latex: str) -> Optional[List[str]]:
    """Split one line into the individual expressions SymPy can actually parse.

    `x^2 - 5x + 6 = 0` is an EQUATION, not an expression: SymPy refuses the `=`
    outright, and `5x` needs implicit multiplication. Both cases are perfectly
    good transcriptions, so flagging them as OCR failures would have produced a
    false "misread" signal on every Vietnamese textbook line.
    """
    text = _clean_for_sympy(latex)
    if text is None:
        return None
    parts = []
    for piece in _RELATIONAL_RE.split(text):
        # NOTE: never strip parentheses here — `.strip("()")` removes *matched*
        # brackets too and turns `((x**2-1)/(x+1))` into garbage. SymPy handles
        # surrounding brackets fine on its own.
        cleaned = piece.strip()
        if not cleaned or not re.search(r"[0-9a-zA-Z]", cleaned):
            continue
        parts.append(cleaned)
    return parts or None


def sympy_gate(latex_list: List[str]) -> List[str]:
    """Formulas that do NOT parse — a deterministic catch for OCR garbage such
    as `x^2 + 3* - 4` or a dropped exponent. Costs no AI quota."""
    failures: List[str] = []
    for formula in latex_list or []:
        parts = _expression_parts(formula)
        if parts is None:
            continue
        if any(not _parses_with_sympy(part) for part in parts):
            failures.append(formula)
    return failures


# ── zoomed re-read of one ambiguous region ───────────────────────────────────
def _crop_b64(image_b64: str, bbox: List[float]) -> Optional[Tuple[str, str]]:
    """Crop + upscale the region a reader flagged, so a confusing exponent can
    be re-read at 2-3x instead of being guessed again."""
    try:
        from PIL import Image

        data = base64.b64decode(image_b64.split(",", 1)[-1])
        img = Image.open(io.BytesIO(data)).convert("RGB")
        width, height = img.size
        x, y, box_w, box_h = (float(v) for v in bbox[:4])
        pad = 0.03
        left = max(0, int((x - pad) * width))
        top = max(0, int((y - pad) * height))
        right = min(width, int((x + box_w + pad) * width))
        bottom = min(height, int((y + box_h + pad) * height))
        if right - left < 12 or bottom - top < 12:
            return None
        crop = img.crop((left, top, right, bottom))
        scale = min(3.0, max(1.0, 700.0 / max(crop.size)))
        if scale > 1.05:
            crop = crop.resize((int(crop.width * scale), int(crop.height * scale)), Image.LANCZOS)
        buf = io.BytesIO()
        crop.save(buf, format="JPEG", quality=92)
        return base64.b64encode(buf.getvalue()).decode("ascii"), "image/jpeg"
    except Exception as exc:  # noqa: BLE001
        logger.debug("[MathReader] crop failed (%s)", exc)
        return None


async def _reread_failed(chat_fn: Callable, model: str, image_b64: str, media_type: str,
                         bbox: List[float], failed_formula: str) -> Optional[Dict[str, Any]]:
    """One extra read of the cropped region, asked narrowly about one formula."""
    cropped = _crop_b64(image_b64, bbox)
    if not cropped:
        return None
    crop_b64, crop_mime = cropped
    hint = (f"The formula `{failed_formula}` was unclear on the full page. "
            "This image is a zoom of just that region — transcribe it exactly.")
    return await _read_once(chat_fn, model, crop_b64, crop_mime, hint, max_tokens=800)


def _first_bbox(ambiguities: List[Dict[str, Any]]) -> Optional[List[float]]:
    for item in ambiguities or []:
        bbox = item.get("bbox")
        if isinstance(bbox, (list, tuple)) and len(bbox) >= 4:
            try:
                return [float(v) for v in bbox[:4]]
            except (TypeError, ValueError):
                continue
    return None


def to_solver_contract(result: Dict[str, Any]) -> str:
    """The text handed to the solver.

    Geometry keeps the legacy `LABELED POINTS / PRIMITIVES / RELATIONS` shape so
    widget detection and the MathViz pipeline keep working unchanged; everything
    else gets the LaTeX transcription plus the plain-text blocks. Free text
    models therefore never receive the raw image again — they reason over a
    typed transcription instead of re-reading pixels.
    """
    parts: List[str] = []
    diagram = result.get("diagram") or {}
    if diagram:
        points = diagram.get("points") or []
        if points:
            parts.append("LABELED POINTS: " + "; ".join(str(p) for p in points))
        if diagram.get("shapes"):
            parts.append("PRIMITIVES & SHAPES: " + "; ".join(str(s) for s in diagram["shapes"]))
        if diagram.get("relations"):
            parts.append("SPATIAL & GEOMETRIC RELATIONS: " + "; ".join(str(r) for r in diagram["relations"]))
        if diagram.get("given_values"):
            parts.append("GIVEN VALUES & TEXT: " + "; ".join(str(g) for g in diagram["given_values"]))
    if result.get("latex"):
        parts.append("TRANSCRIPTION (LaTeX, reading order): " + " | ".join(result["latex"]))
    if result.get("text_blocks"):
        parts.append("TEXT ON THE PAGE: " + " | ".join(result["text_blocks"][:12]))
    if result.get("ambiguities"):
        spots = [str(a.get("where") or "?") for a in result["ambiguities"][:5]]
        parts.append("UNCERTAIN SPOTS (state your assumption explicitly if they matter): " + "; ".join(spots))
    return "\n".join(p for p in parts if p).strip()


# ── cache (lazy import: unit tests must not create a sqlite file) ────────────
def _cache_get(sha256: str, phash: Optional[str]) -> Optional[Dict[str, Any]]:
    if not sha256:
        return None
    try:
        import vision_cache
        hit = vision_cache.get_cached(sha256, phash)
    except Exception as exc:  # noqa: BLE001
        logger.debug("[MathReader] cache read skipped (%s)", exc)
        return None
    if not hit:
        return None
    stored = hit.get("vision_text") or ""
    if not stored.startswith(CACHE_PREFIX):
        # Plain text written by the older GeometryVisionAgent — not our format.
        return None
    try:
        payload = json.loads(stored[len(CACHE_PREFIX):])
    except Exception:
        return None
    payload["cache"] = "phash" if hit.get("phash_distance") else "sha256"
    return payload


def _cache_put(sha256: str, phash: Optional[str], result: Dict[str, Any], model_used: str) -> None:
    if not sha256 or result.get("needs_confirm"):
        return
    try:
        import vision_cache
        slim = {k: v for k, v in result.items() if k not in ("readers", "cache")}
        vision_cache.set_cached(
            sha256, phash or "",
            CACHE_PREFIX + json.dumps(slim, ensure_ascii=False),
            widget_hint=str(result.get("kind") or "")[:32],
            model_used=f"math-reader:v{PROMPT_VERSION}:{model_used}"[:120],
        )
    except Exception as exc:  # noqa: BLE001
        logger.debug("[MathReader] cache write skipped (%s)", exc)


def _summarise(reads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Small, log/telemetry-friendly view of each reader attempt."""
    keys = ("model", "requested_model", "ok", "ms", "confidence", "error")
    return [{k: r.get(k) for k in keys if r.get(k) is not None} for r in reads]


def _candidate(read: Dict[str, Any]) -> Dict[str, Any]:
    return {"model": read.get("model"), "kind": read.get("kind"), "latex": read.get("latex") or []}


async def read_consensus(image_b64: str, media_type: str = "image/jpeg", user_hint: str = "",
                         chat_fn: Optional[Callable] = None, sha256: str = "",
                         phash: Optional[str] = None, mode: Optional[str] = None,
                         tiebreak_model: Optional[str] = None) -> Dict[str, Any]:
    """Read one image with 1-2 different-family models and cross-check the result.

    Returns a dict with `contract` (text for the solver), `consensus`
    (single|agree|merge|conflict|resolved), `confidence`, `needs_confirm` +
    `candidates` when the readers genuinely disagree, and `parse_failures` for
    formulas SymPy could not read. Never raises: the caller decides what to do
    with a low-confidence result.
    """
    started = time.time()
    result: Dict[str, Any] = {
        "ok": False, "kind": "mixed", "latex": [], "text_blocks": [], "diagram": None,
        "ambiguities": [], "confidence": 0.0, "consensus": "single", "readers": [],
        "needs_confirm": False, "candidates": [], "parse_failures": [], "reread": False,
        "cache": "miss", "ms": 0, "contract": "",
    }
    if chat_fn is None:
        result["error"] = "chat_fn was not injected"
        return result

    cached = _cache_get(sha256, phash)
    if cached:
        cached.setdefault("readers", [])
        cached["contract"] = cached.get("contract") or to_solver_contract(cached)
        return cached

    mode = (mode or dual_read_mode()).lower()
    models = reader_models()
    primary = models[0]
    secondary = models[1] if len(models) > 1 else None

    if mode == "always" and secondary:
        reads = list(await asyncio.gather(
            _read_once(chat_fn, primary, image_b64, media_type, user_hint),
            _read_once(chat_fn, secondary, image_b64, media_type, user_hint),
        ))
    else:
        first = await _read_once(chat_fn, primary, image_b64, media_type, user_hint)
        reads = [first]
        # `auto` only pays for a second reader when the first one is unsure,
        # failed, or flagged an ambiguous spot — easy pages stay one call.
        if secondary and (mode == "always" or (mode == "auto" and (
                not first.get("ok")
                or float(first.get("confidence") or 0.0) < CONFIDENCE_THRESHOLD
                or bool(first.get("ambiguities"))))):
            reads.append(await _read_once(chat_fn, secondary, image_b64, media_type, user_hint))

    result["readers"] = _summarise(reads)
    good = [r for r in reads if r.get("ok")]
    if not good:
        result["error"] = "every reader failed"
        result["ms"] = int((time.time() - started) * 1000)
        logger.warning("[MathReader] all readers failed: %s", result["readers"])
        return result

    chosen = good[0]
    if len(good) >= 2:
        first_read, second_read = good[0], good[1]
        matched, only_a, only_b = _formula_match(first_read.get("latex") or [], second_read.get("latex") or [])
        if matched:
            result["consensus"] = "agree"
        elif len(only_a) <= 1 and len(only_b) <= 1:
            result["consensus"] = "merge"
            chosen = dict(first_read)
            chosen["latex"] = list(first_read.get("latex") or []) + list(only_b)
        else:
            result["consensus"] = "conflict"
            tb_model = tiebreak_model or os.environ.get("MATH_READER_TIEBREAK_MODEL", DEFAULT_TIEBREAK_MODEL)
            tb = await _read_once(chat_fn, tb_model, image_b64, media_type, user_hint, max_tokens=1200)
            if tb.get("ok"):
                result["readers"].append(_summarise([tb])[0])
                with_first, _, _ = _formula_match(tb.get("latex") or [], first_read.get("latex") or [])
                with_second, _, _ = _formula_match(tb.get("latex") or [], second_read.get("latex") or [])
                if with_first and not with_second:
                    chosen = first_read
                    result["consensus"] = "resolved"
                elif with_second and not with_first:
                    chosen = second_read
                    result["consensus"] = "resolved"
            if result["consensus"] == "conflict":
                # Genuine disagreement: ask the student instead of quietly
                # solving a problem nobody is sure we read correctly.
                result["needs_confirm"] = True
                result["candidates"] = [_candidate(first_read), _candidate(second_read)]

    # ── assemble the authoritative transcription ──────────────────────────────
    result["kind"] = chosen.get("kind") or "mixed"
    result["latex"] = list(chosen.get("latex") or [])
    result["text_blocks"] = list(chosen.get("text_blocks") or [])
    result["diagram"] = chosen.get("diagram")
    result["ambiguities"] = list(chosen.get("ambiguities") or [])

    confidence = sum(float(r.get("confidence") or 0.0) for r in good) / max(1, len(good))
    if result["consensus"] == "agree":
        confidence = min(0.99, confidence + 0.08)
    elif result["consensus"] == "merge":
        confidence = max(0.0, confidence - 0.10)

    # Deterministic symbol gate: a formula SymPy cannot read is very likely a
    # misread symbol, so spend ONE extra (zoomed) read on the flagged region.
    failures = sympy_gate(result["latex"])
    bbox = _first_bbox(result["ambiguities"])
    if failures and bbox:
        zoomed = await _reread_failed(chat_fn, primary, image_b64, media_type, bbox, failures[0])
        if zoomed and zoomed.get("ok"):
            result["reread"] = True
            result["readers"].append(_summarise([zoomed])[0])
            clean = [f for f in (zoomed.get("latex") or []) if not sympy_gate([f])]
            if clean:
                result["latex"] = [f for f in result["latex"] if f != failures[0]] + clean
                failures = sympy_gate(result["latex"])
    result["parse_failures"] = failures
    if failures:
        confidence = max(0.0, confidence - 0.15 * len(failures))

    result["confidence"] = round(min(0.99, max(0.0, confidence)), 3)
    if result["needs_confirm"]:
        result["confidence"] = min(result["confidence"], 0.5)
    result["ok"] = bool(result["latex"] or result["diagram"] or result["text_blocks"])
    result["contract"] = to_solver_contract(result)
    result["ms"] = int((time.time() - started) * 1000)
    _cache_put(sha256, phash, result, (result["readers"][0].get("model") if result["readers"] else primary))
    logger.info("[MathReader] consensus=%s conf=%.2f reread=%s parse_failures=%s readers=%s ms=%s",
                result["consensus"], result["confidence"], result["reread"],
                len(result["parse_failures"]), [r.get("model") for r in result["readers"]], result["ms"])
    return result
