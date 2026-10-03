"""
retrieval_context.py
====================
R4 of DUOMATH_HYBRIDRAG_PLAN.md — the same retrieved knowledge, shaped for the
stage that is going to read it.

Why "one big reference block" was not good enough
-------------------------------------------------
Every stage of the pipeline was being handed the same text, and that is wrong in
two different ways at once:

1. **The reader must not see answers.** `MATH_READER_MODELS` transcribes a photo.
   Feeding it a worked solution risks it "reading" numbers that were never on the
   page — the failure mode is silent and looks like a good transcript. Its slice
   therefore carries only SYMBOL and THEOREM hints: enough to know which labels
   matter, never a solution.
2. **The critic is asked to check the wrong thing.** `MATH_CRITIC_MODEL` verifies
   an answer. What helps it is a CHECKLIST of properties the topic must satisfy
   (orthocentre -> AH ⟂ BC; O, G, H collinear; AH = 2·OM), derived from the graph's
   own `formulas` — not a second copy of the theory prose.

And one budget reason: a reference block is only safe because it is bounded. The
cap is per tier (simple/rich/extreme), which is the same signal
`diagram_complexity.plan_for()` already computes, so a dense figure cannot inflate
the prompt past the 75 s invariant while a simple one is starved of context.

The role table
--------------
    slice_for_reader()     MATH_READER_MODELS        symbols/theorems only, NO solutions
    slice_for_solver()     MATH_TOOLS_MODEL          formula cards + worked examples
    slice_for_critic()     MATH_CRITIC_MODEL         property checklist from `formulas`
    slice_for_repair()     OPENROUTER_REPAIR_MODEL   the MathViz vocabulary (contract-derived)
    slice_for_translate()  OPENROUTER_TRANSLATE_MODELS  vi<->en glossary
    slice_for_chat()       the chat ladder           the fused block, tier-capped

No model is added, renamed or reordered by this module: it only decides what each
existing role receives. That is the "improve the model" work in the plan, and it
is deliberately the cheapest kind — context, not a new call.

One vocabulary, not two
-----------------------
`slice_for_repair` calls `mathviz_contract.repair_vocabulary()` rather than keeping
its own copy of the layer kinds, aliases and solids. This repo has already paid
once for "one vocabulary, three copies" (a whole set of layers silently undrawn).

Env (default off, so the pipeline is byte-identical until switched on)
---------------------------------------------------------------------
    MATH_RETRIEVAL_CONTEXT=off|on            (default off)
    MATH_RETRIEVAL_MAX_CHARS_SIMPLE=1800
    MATH_RETRIEVAL_MAX_CHARS_RICH=4200
    MATH_RETRIEVAL_MAX_CHARS_EXTREME=7000

Stdlib + the local retrieval modules only. Never imports main.py, so the CI
quality gate can test every slice with no network, no key and no event loop.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple

import math_concepts
import retrieval_hybrid

#: Per-tier character caps. The tier comes from `diagram_complexity`, which already
#: decides how much work a figure is worth; reusing it here means the context budget
#: and the time budget move together instead of being two unrelated knobs.
TIER_CAPS = {"simple": 1800, "rich": 4200, "extreme": 7000}

#: What a slice reports back. `ids` is the evidence (which concepts / which worked
#: examples), so a caller can log it without logging the text itself.
META_KEYS = ("role", "tier", "chars", "cap", "truncated", "ids", "sources", "enabled")

_ON = {"on", "true", "1", "yes", "enable", "enabled"}

#: Appended when a slice had to be cut. Explicit on purpose: a silently shortened
#: reference block looks identical to a complete one, and the reader of the prompt
#: cannot tell the difference.
TRUNCATION_MARK = "\n… [ngữ cảnh tham chiếu đã được rút gọn theo hạn mức]"


def enabled() -> bool:
    """`MATH_RETRIEVAL_CONTEXT` — allowlist, so a typo cannot switch it on.

    Same lesson as `retrieval_hybrid._flag`: with a denylist, `=of` turned the
    feature ON.
    """
    raw = os.environ.get("MATH_RETRIEVAL_CONTEXT")
    if raw is None or not str(raw).strip():
        return False
    return str(raw).strip().lower() in _ON


def cap_for(tier: str) -> int:
    """Character cap for a tier, overridable per tier by env, clamped to sane bounds."""
    tier = str(tier or "simple").strip().lower()
    if tier not in TIER_CAPS:
        tier = "simple"
    default = TIER_CAPS[tier]
    raw = os.environ.get(f"MATH_RETRIEVAL_MAX_CHARS_{tier.upper()}")
    if raw is None or not str(raw).strip():
        return default
    try:
        value = int(str(raw).strip())
    except (TypeError, ValueError):
        return default
    # A zero or negative cap would silently blank every reference block, which is
    # worse than a wrong-but-visible one; 200 chars is the floor for "still useful".
    return max(200, min(20000, value))


# ── rendering helpers ────────────────────────────────────────────────────────

def _truncate(text: str, cap: int) -> Tuple[str, bool]:
    """Cut to `cap`, preferring a line boundary, and SAY it was cut."""
    text = text or ""
    if len(text) <= cap:
        return text, False
    room = max(0, cap - len(TRUNCATION_MARK))
    cut = text[:room]
    newline = cut.rfind("\n")
    if newline > room * 0.6:      # only snap back if it does not waste much
        cut = cut[:newline]
    return cut + TRUNCATION_MARK, True


def _meta(role: str, tier: str, text: str, cap: int, truncated: bool,
          ids: Optional[List[str]] = None,
          sources: Optional[List[str]] = None) -> Dict[str, Any]:
    return {
        "role": role,
        "tier": tier,
        "chars": len(text or ""),
        "cap": cap,
        "truncated": bool(truncated),
        "ids": list(ids or []),
        "sources": list(sources or []),
        "enabled": enabled(),
    }


def _concept_card(node: Dict[str, Any], with_example: bool) -> str:
    first_formula = (node.get("formulas") or "").splitlines()
    head = first_formula[0] if first_formula else ""
    card = (f"**{node['name']}** ({node['english_name']}): {node['definition']}\n"
            f"  · công thức: {head}")
    if with_example and node.get("examples"):
        card += f"\n  · ví dụ: {node['examples']}"
    return card


def _fusion(query: str) -> Tuple[List[dict], List[str]]:
    """One fused search, plus the source names that contributed."""
    try:
        results = retrieval_hybrid.search(query, top_k=5)
    except Exception:
        return [], []
    return results, [r.get("source") for r in results if r.get("source")]


def _bank_rows() -> Dict[str, dict]:
    """The worked-example bank indexed by id, built once per call.

    Was previously a linear scan inside a loop (O(n²)) and relied on
    `retrieval_hybrid.get_default_index()`, which wraps the same `lru`-style accessor
    the sparse retriever uses. Reading it through one dict keeps the render O(n) and
    makes a missing document an explicit `None` instead of a silent miss.
    """
    try:
        rows = retrieval_hybrid.get_default_index().rows
    except Exception:
        return {}
    return {str(row.get("id")): row for row in rows}


def _fused_block(query: str, with_solutions: bool,
                 bank: Optional[Dict[str, dict]] = None) -> Tuple[str, List[str], List[str]]:
    """Render the fused result as a compact block.

    `with_solutions` is the whole reason this is a parameter rather than a second
    function: the exclusion of worked solutions from the reader's slice is enforced
    in ONE place, so it cannot be forgotten in one branch and kept in another.
    """
    results, sources = _fusion(query)
    bank = _bank_rows() if bank is None else bank
    lines: List[str] = []
    ids: List[str] = []
    for row in results:
        ids.append(row.get("key") or "")
        meta = row.get("meta") or {}
        source = row.get("source")
        if source == "concepts":
            node = math_concepts.nodes().get(meta.get("node_id"))
            if node:
                lines.append(_concept_card(node, with_example=with_solutions))
        elif source in ("examples", "dense"):
            doc_id = str(meta.get("doc_id"))
            document = bank.get(doc_id)
            problem = str((document or {}).get("problem", "")).strip()
            if not problem:
                shared = meta.get("shared")
                if shared:
                    lines.append(f"**Ví dụ đã giải** (khớp: {', '.join(list(shared)[:5])})")
                continue
            line = f"**Ví dụ đã giải** ({meta.get('topic') or '?'}): {problem}"
            if with_solutions:
                solution = str((document or {}).get("solution", "")).strip()
                if solution:
                    line += f"\n  · hướng giải: {solution[:400]}"
            lines.append(line)
    return "\n".join(lines), ids, sources


# ── the six role slices ──────────────────────────────────────────────────────

def slice_for_chat(query: str, tier: str = "simple", widget: Any = None,
                   cv_hints: Optional[Dict[str, Any]] = None) -> Tuple[str, Dict[str, Any]]:
    """The reference block the answering model receives: fused, tier-capped.

    Solutions ARE included here — this is the stage that produces the explanation —
    under the same "do not copy the numbers" instruction the prompt already carries.
    """
    cap = cap_for(tier)
    if not enabled():
        return "", _meta("chat", tier, "", cap, False)
    body, ids, sources = _fused_block(query, with_solutions=True)
    text, truncated = _truncate(body, cap)
    return text, _meta("chat", tier, text, cap, truncated, ids, sources)


def slice_for_solver(query: str, tier: str = "simple") -> Tuple[str, Dict[str, Any]]:
    """`MATH_TOOLS_MODEL` — formula cards and worked approaches, solutions included.

    This is the stage that computes, and `math_solver.py` already forbids mental
    arithmetic and requires the SymPy tools, so seeing a similar worked solution is
    legitimate help rather than a way to skip the tools.
    """
    cap = cap_for(tier)
    if not enabled():
        return "", _meta("solver", tier, "", cap, False)
    body, ids, sources = _fused_block(query, with_solutions=True)
    text, truncated = _truncate(body, cap)
    return text, _meta("solver", tier, text, cap, truncated, ids, sources)


def slice_for_critic(query: str, tier: str = "simple") -> Tuple[str, Dict[str, Any]]:
    """`MATH_CRITIC_MODEL` — a property CHECKLIST built from the graph's `formulas`.

    Deliberately not the theory prose: a critic is asked "is this answer right", and
    what it can act on is a list of properties to test. `with_example=False` because a
    worked example would invite comparing the student's numbers to someone else's
    instead of checking the claim.
    """
    cap = cap_for(tier)
    if not enabled():
        return "", _meta("critic", tier, "", cap, False)

    matched = math_concepts.match_details(query)
    lines: List[str] = []
    ids: List[str] = []
    for detail in matched[:4]:
        node = math_concepts.nodes().get(detail["id"])
        if not node:
            continue
        ids.append(f"concept:{detail['id']}")
        bullets = [b.strip() for b in (node.get("formulas") or "").splitlines() if b.strip()]
        lines.append(f"**{node['name']}** — cần thoả:")
        for bullet in bullets[:4]:
            lines.append(f"  ☐ {bullet}")
    if not lines:
        return "", _meta("critic", tier, "", cap, False, ids)
    text, truncated = _truncate("\n".join(lines), cap)
    return text, _meta("critic", tier, text, cap, truncated, ids, ["concepts"])


def slice_for_reader(query: str, cv_hints: Optional[Dict[str, Any]] = None,
                     tier: str = "simple") -> Tuple[str, Dict[str, Any]]:
    """`MATH_READER_MODELS` — SYMBOL and THEOREM hints only. Never a solution.

    The rule this function exists to enforce: a reader that can see a worked solution
    may transcribe numbers that are not in the photo, and the result still looks like
    a confident, correct reading. So the answer-shaped parts are excluded here by
    construction — `with_solutions=False`, concept names and formula names only, plus
    the CV hints (line/circle counts) the reader is being asked to reconcile with.
    """
    cap = cap_for(tier)
    if not enabled():
        return "", _meta("reader", tier, "", cap, False)

    lines: List[str] = []
    ids: List[str] = []
    if cv_hints:
        try:
            line_count = int(cv_hints.get("line_count_estimate", 0) or 0)
            circle_count = int(cv_hints.get("circle_count_estimate", 0) or 0)
        except (TypeError, ValueError):
            line_count = circle_count = 0
        if line_count or circle_count:
            lines.append(f"Ước lượng trong ảnh: ~{line_count} đoạn thẳng, "
                         f"~{circle_count} đường tròn — hãy đối soát với hình.")

    for detail in math_concepts.match_details(query)[:5]:
        node = math_concepts.nodes().get(detail["id"])
        if not node:
            continue
        ids.append(f"concept:{detail['id']}")
        first_formula = (node.get("formulas") or "").splitlines()
        head = first_formula[0] if first_formula else ""
        # The NAME and the formula HEAD only. `definition` and `examples` are prose
        # about the result and are exactly what must not reach a transcriber.
        lines.append(f"Khái niệm có thể xuất hiện: **{node['name']}** "
                     f"({node['english_name']}) — ký hiệu: `{head}`")

    if not lines:
        return "", _meta("reader", tier, "", cap, False, ids)
    text, truncated = _truncate("\n".join(lines), cap)
    return text, _meta("reader", tier, text, cap, truncated, ids, ["concepts"])


def slice_for_repair(widget: Any = None, tier: str = "rich") -> Tuple[str, Dict[str, Any]]:
    """`OPENROUTER_REPAIR_MODEL` — the MathViz vocabulary it must repair against.

    Calls `mathviz_contract.repair_vocabulary()` rather than holding a second copy of
    the layer kinds, aliases and solids: "one vocabulary, three copies" is the failure
    this repo already paid for once (whole sets of layers silently undrawn, Đợt 8).
    """
    cap = cap_for(tier)
    if not enabled():
        return "", _meta("repair", tier, "", cap, False)
    try:
        import mathviz_contract
        body = f"Widget mục tiêu: {widget or '(không xác định)'}\n{mathviz_contract.repair_vocabulary()}"
    except Exception as exc:
        return "", _meta("repair", tier, "", cap, False, [f"unavailable:{type(exc).__name__}"])
    text, truncated = _truncate(body, cap)
    return text, _meta("repair", tier, text, cap, truncated, ["mathviz_contract"], ["contract"])


def slice_for_translate(query: str, tier: str = "rich") -> Tuple[str, Dict[str, Any]]:
    """`OPENROUTER_TRANSLATE_MODELS` — a vi<->en GLOSSARY for the matched concepts.

    The graph already carries both names for every node, so the glossary is derived
    from data that is maintained for routing. Nothing is invented, and no translation
    model call is needed to build it.
    """
    cap = cap_for(tier)
    if not enabled():
        return "", _meta("translate", tier, "", cap, False)
    lines: List[str] = []
    ids: List[str] = []
    for detail in math_concepts.match_details(query)[:6]:
        node = math_concepts.nodes().get(detail["id"])
        if not node:
            continue
        ids.append(f"concept:{detail['id']}")
        lines.append(f"  {node['name']} = {node['english_name']}")
    if not lines:
        return "", _meta("translate", tier, "", cap, False, ids)
    body = "Thuật ngữ (vi = en):\n" + "\n".join(lines)
    text, truncated = _truncate(body, cap)
    return text, _meta("translate", tier, text, cap, truncated, ids, ["concepts"])


#: Role -> builder. The registry exists so a test can assert that every role in the
#: table above is implemented (and so a future role cannot be added to the prompt
#: without also being added here).
SLICES = {
    "reader": slice_for_reader,
    "solver": slice_for_solver,
    "critic": slice_for_critic,
    "repair": slice_for_repair,
    "translate": slice_for_translate,
    "chat": slice_for_chat,
}


def build(role: str, query: str = "", tier: str = "simple", widget: Any = None,
          cv_hints: Optional[Dict[str, Any]] = None) -> Tuple[str, Dict[str, Any]]:
    """Call one slice by name, never raising.

    `chat` is the only slice the request path needs; the others are addressed by the
    stage that owns them. Unknown roles return an empty slice with the reason in
    `meta["ids"]`, because a caller that mistypes a role must not lose the answer.
    """
    builder = SLICES.get(str(role or "").strip().lower())
    if builder is None:
        return "", _meta(str(role), tier, "", cap_for(tier), False,
                         [f"unknown_role:{role}"])
    try:
        if role == "reader":
            return builder(query, cv_hints, tier)
        if role == "repair":
            return builder(widget, tier)
        if role in ("solver", "critic", "translate"):
            return builder(query, tier)
        return builder(query, tier, widget, cv_hints)
    except Exception as exc:
        return "", _meta(str(role), tier, "", cap_for(tier), False,
                         [f"error:{type(exc).__name__}"])


def summary(meta: Dict[str, Any]) -> str:
    """One log line for a slice — evidence ids, never the text itself."""
    return (f"role={meta.get('role')} tier={meta.get('tier')} "
            f"chars={meta.get('chars')}/{meta.get('cap')} "
            f"truncated={meta.get('truncated')} "
            f"sources={','.join(meta.get('sources') or []) or '-'} "
            f"ids={','.join((meta.get('ids') or [])[:4]) or '-'}")