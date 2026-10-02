"""
math_concepts.py
================
The mathematical knowledge graph as a MODULE, not a 137-line dict inside main.py
(R1 of DUOMATH_HYBRIDRAG_PLAN.md).

Why this moved
--------------
Three reasons, in order of how much they cost:

1. **It is now testable offline.** `main.py` binds DB tables, reads .env and
   builds provider clients at import time, so nothing that lived in it could be
   exercised by the CI quality gate - which installs only the light maths
   dependencies on purpose. A graph the plan wants to GROW (R5 adds Olympiad
   concepts) has to be testable by a plain script.
2. **R2 needs a second source.** Fusion of concepts + worked examples + templates
   requires addressing the graph through a function, not by reaching into a
   module global of a 9900-line file.
3. **main.py gets smaller** without touching `chat()`.

Behaviour change: exactly one, and it is a fix
---------------------------------------------
The neighbour block used a `set`, and a set of `str` iterates in a per-process
RANDOM order (hash randomisation). Measured on 20 golden queries with two
PYTHONHASHSEED values: **9 of 20 rendered a different reference block between
processes** - a permutation of the neighbour lines only, same content. Two
consequences that matter: the same question produced a different prompt on
different workers (so reproducibility and A/B measurement were both noisy), and
no byte-identical golden test was possible.

The dedup is now an insertion-ordered dict, which keeps the SET semantics (one
line per neighbour, first-seen position) and makes the order stable. The content
is unchanged - proven by `test_math_concepts.py`, which compares every golden
query against the pre-move output after canonicalising only that block.

Deliberately stdlib-only (chat_budget.py's rule): the CI quality gate must be
able to import this module and its test.

Data lives in `backend/data/math_concepts.json`; override the path with
`MATH_CONCEPTS_PATH`.
"""

from __future__ import annotations

import io
import json
import os
import re
from functools import lru_cache
from typing import Dict, List

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.environ.get(
    "MATH_CONCEPTS_PATH",
    os.path.join(HERE, "data", "math_concepts.json"),
)

#: The fields every node must carry. Pinned here so a data edit that drops one
#: is caught by the suite instead of surfacing as a KeyError inside a prompt.
NODE_KEYS = ("id", "name", "english_name", "keywords", "definition", "formulas", "examples")


@lru_cache(maxsize=4)
def _read(path: str) -> Dict[str, object]:
    with io.open(path, encoding="utf-8") as handle:
        return json.load(handle)


def load(path: str = None) -> Dict[str, object]:
    """The graph as `{"nodes": {...}, "edges": [...]}` (cached per path)."""
    return _read(os.path.abspath(path or DATA_PATH))


#: Loaded once. Kept as a module global because main.py exposes it as
#: `MATH_CONCEPT_GRAPH` (GRAPHABLE_CONCEPT_IDS and /api/health read it).
GRAPH: Dict[str, object] = load()


def nodes() -> Dict[str, dict]:
    return GRAPH["nodes"]


def edges() -> List[dict]:
    return GRAPH["edges"]


def find_entities(query: str) -> List[str]:
    """Node ids the query mentions — regex-guarded to avoid false matches.

    Copied verbatim from main.py's `extract_graph_entities` so the routing it
    feeds (`GRAPHABLE_CONCEPT_IDS`) cannot shift: full name and English name
    first, then keywords, with a word boundary required for SHORT ASCII keywords
    ("sin", "lim", "max") because a bare `in` test made those match inside longer
    words. Vietnamese keywords keep the plain `in` test (no reliable `\\b` for
    non-ASCII). Result is deduped, order preserved.
    """
    matched_ids: List[str] = []
    q = query.lower()
    for node_id, node_data in GRAPH["nodes"].items():
        # Khớp node_id hoặc tên đầy đủ (word-boundary safe)
        if node_data["name"].lower() in q or node_data["english_name"].lower() in q:
            matched_ids.append(node_id)
            continue
        # Khớp keywords — dùng \b chỉ cho từ ASCII, fallback `in` cho tiếng Việt
        hit = False
        for kw in node_data["keywords"]:
            kw_l = kw.lower()
            # Từ ASCII ngắn (≤4 ký tự, như 'sin', 'lim'): yêu cầu word boundary
            if kw_l.isascii() and len(kw_l) <= 4:
                if re.search(r"\b" + re.escape(kw_l) + r"\b", q):
                    hit = True
                    break
            else:
                if kw_l in q:
                    hit = True
                    break
        if hit:
            matched_ids.append(node_id)
    return list(dict.fromkeys(matched_ids))  # dedup preserve order


def neighbors(node_id: str) -> List[dict]:
    """Edges touching `node_id`, each tagged with direction.

    Added in R1 for R2's fusion/reranking layer (a concept's neighbours are how a
    query about one node can legitimately surface an adjacent one). Pure
    data-access — nothing in the rendering path depends on it, so it cannot
    change the reference block.
    """
    out: List[dict] = []
    for edge in GRAPH["edges"]:
        if edge["source"] == node_id:
            out.append({"direction": "out", "node": edge["target"], "relation": edge["relation"]})
        elif edge["target"] == node_id:
            out.append({"direction": "in", "node": edge["source"], "relation": edge["relation"]})
    return out


#: The block every reply carries, matched/concept-specific part excluded. Kept as
#: a constant so the wording is asserted by the suite rather than diffed by eye.
GLOBAL_CONTEXT = (
    "**Hướng dẫn hệ thống (Global Context):**\n"
    "- Giải thích bằng tiếng Việt, kèm thuật ngữ Anh trong ngoặc đơn.\n"
    "- Luôn dùng LaTeX: $inline$ và $$block$$ cho mọi công thức.\n"
    "- Áp dụng Socratic method: gợi ý từng bước, không giải thẳng trừ khi được yêu cầu.\n"
)


def render_context(query: str) -> str:
    """The reference block for a query: Local (node + edge graph) + Global.

    Body copied verbatim from main.py's `retrieve_math_context` (which now just
    caches a call to this), with the single documented change: `seen_neighbors` is
    an insertion-ordered dict instead of a `set`, so the neighbour block renders in
    a stable order. See the module docstring for the measurement behind that.
    """
    matched_ids = find_entities(query)
    local_contexts: List[str] = []
    seen_neighbors: Dict[str, None] = {}

    for node_id in matched_ids:
        node = GRAPH["nodes"][node_id]
        local_contexts.append(
            f"### 📚 {node['name']} ({node['english_name']})\n"
            f"**Định nghĩa:** {node['definition']}\n"
            f"**Công thức:**\n{node['formulas']}\n"
            f"**Ví dụ:** {node['examples']}\n"
        )
        relations: List[str] = []
        for edge in GRAPH["edges"]:
            if edge["source"] == node_id:
                t = GRAPH["nodes"].get(edge["target"])
                if t:
                    relations.append(f"  ↳ Liên kết tới **{t['name']}**: {edge['relation']}")
                    if edge["target"] not in matched_ids:
                        seen_neighbors.setdefault(edge["target"])
            elif edge["target"] == node_id:
                s = GRAPH["nodes"].get(edge["source"])
                if s:
                    relations.append(f"  ↳ Liên kết từ **{s['name']}**: {edge['relation']}")
                    if edge["source"] not in matched_ids:
                        seen_neighbors.setdefault(edge["source"])
        if relations:
            local_contexts.append("**Quan hệ trong Knowledge Graph:**\n" + "\n".join(relations) + "\n")

    if seen_neighbors:
        neighbor_lines = []
        for n_id in seen_neighbors:
            n = GRAPH["nodes"].get(n_id)
            if n:
                first_formula = n["formulas"].splitlines()[0] if n["formulas"] else ""
                neighbor_lines.append(f"  • **{n['name']}**: {n['definition']} — `{first_formula}`")
        local_contexts.append("**Khái niệm lân cận liên quan:**\n" + "\n".join(neighbor_lines) + "\n")

    global_ctx = GLOBAL_CONTEXT

    if matched_ids:
        return (
            "=== KNOWLEDGE GRAPH (Local Mode) ===\n"
            + "\n".join(local_contexts)
            + "\n=== GLOBAL CONTEXT ===\n"
            + global_ctx
            + "=" * 50 + "\n"
        )
    return (
        "=== GLOBAL CONTEXT ===\n"
        + global_ctx
        + "=" * 50 + "\n"
    )