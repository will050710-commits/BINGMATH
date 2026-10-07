"""
mathviz_contract.py
===================
The MathViz geometry vocabulary as ONE enforced contract (đợt 8 / 4I).

Why this module exists
----------------------
Three different layers of the system each had their own idea of what a
geometry "layer kind" is, and nothing tied them together:

  * the system prompt taught the model exactly FOUR kinds
    (``circle``, ``polygon``, ``line``, ``points``) — main.py,
    ``_WIDGET_PROMPT_SNIPPETS["geometry_2d"]``;
  * the renderers already understood more: JSXGraph drew ``arc``, ``angle``,
    ``ray`` and ``polyline``, and it drew a ``triangle`` layer's vertices but
    never its outline (an earlier third engine, Konva, drew only
    ``polygon``/``circle``/``line`` and has since been REMOVED — two engines
    remain, SVG and JSXGraph, because a second full engine for the same kinds
    tripled the maintenance surface without drawing anything new);
  * every geometry SOLVER (snapping, construction resolver, implicit
    extractor, viewbox normalizer) collected points by matching literal
    ``kind`` strings against that same four-item tuple.

The failure mode that produced was invisible: a diagram with an arc, an angle
or a highlighted region reached the canvas with parts missing and NOTHING said
so — no error, no log, no badge — and any point belonging to those kinds was
left at the model's raw guess, so an arc no longer touched the circles it was
supposed to be tangent to. This module is the single source of truth that
turns that silence into a report.

What it guarantees
------------------
* ``LAYER_KINDS`` — every kind the contract lets the model emit.
* ``KIND_ALIASES`` — the near-miss spellings models actually produce
  (``wedge``/``pie`` → ``sector``, ``shaded``/``area`` → ``region`` …), so a
  correct intention expressed in the wrong word still renders.
* ``ENGINE_SUPPORT`` — what each of the two remaining renderers really draws.
  ``frontend/scripts/check-mathviz-kinds.mjs`` parses BOTH this file and the
  three renderers, so the claim here can never drift from the dispatch
  branches there (the same technique check-image-downscale.mjs already uses
  against security_limits.py).
* ``render_report`` / ``normalize_geometry_2d`` — a machine-readable
  ``skipped`` / ``unsupported`` / ``incomplete`` / ``dangling`` report that
  main.py stamps onto the payload as ``_render`` and the UI shows the student
  ("N phần chưa vẽ được"), instead of dropping the layer soundlessly.

Deliberately importable with the standard library alone (no numpy, no
fastapi): the CI quality gate installs only the light maths dependencies, so
this file and its test must not need more. main.py does the wiring.
"""
from __future__ import annotations

import copy
import json
import re
from typing import Any, Dict, Iterable, Iterator, List, Tuple

# ── 1. The vocabulary ────────────────────────────────────────────────────────
#
# Every kind the model may use. This is the UNION of what the renderers
# support, because a kind no renderer can draw is worse than no kind at all:
# it looks like a visual instruction and produces nothing.
LAYER_KINDS = frozenset({
    # shapes
    "circle", "polygon", "triangle", "ellipse", "arc", "sector", "region",
    # linear elements
    "line", "segment", "ray", "polyline",
    # annotation
    "angle", "label",
    # point clouds
    "points",
})

# Spellings models actually produce for a kind that IS in LAYER_KINDS. Kept
# small and unambiguous on purpose: an entry here cannot corrupt a correct
# payload, it can only rescue a mislabelled one.
KIND_ALIASES: Dict[str, str] = {
    "point": "points", "pts": "points",
    "seg": "line",
    "poly": "polygon",
    "circ": "circle", "circumcircle": "circle", "incircle": "circle",
    "wedge": "sector", "pie": "sector",
    "shaded": "region", "shaded_region": "region", "filled_region": "region",
    "area": "region", "curvilinear_region": "region",
    "curve": "arc", "circular_arc": "arc", "minor_arc": "arc",
    "major_arc": "arc", "arc_curve": "arc",
    "text": "label", "caption": "label", "annotation": "label",
    "angle_marker": "angle", "angle_arc": "angle",
    "path": "polyline",
    "oval": "ellipse",
}

# ── 2. What each renderer really draws ───────────────────────────────────────
#
# Names match the engine files:
#   svg      → frontend/src/components/DuoMCB/mathviz/MathVizGeometry2D.js
#   jsxgraph → .../MathVizJSXGraph.js
#
# A kind listed here MUST have a dispatch branch in that file — the node guard
# checks it, so this table is a verified claim rather than documentation.
ENGINE_SUPPORT: Dict[str, frozenset] = {
    "svg": frozenset({
        "circle", "polygon", "triangle", "line", "segment", "ray", "points",
        "ellipse", "arc", "sector", "region", "angle", "polyline", "label",
    }),
    "jsxgraph": frozenset({
        "circle", "polygon", "triangle", "line", "segment", "ray", "points",
        "ellipse", "arc", "sector", "region", "angle", "polyline", "label",
    }),
}

# Preference order when we must pick the engine that can draw everything.
# jsxgraph first: it is MathVizGeometry2D's default engine (the
# `useState('jsxgraph')` line) and the only interactive one. Konva was removed
# (it duplicated both engines for the same kinds); a stale name here would make
# `engine_min` pick an engine no file implements.
ENGINE_PREFERENCE: Tuple[str, ...] = ("jsxgraph", "svg")

# How many points a kind needs before it can be drawn at all. A layer whose own
# geometry is incomplete is reported too, instead of producing half a shape.
MIN_POINTS: Dict[str, int] = {
    "polygon": 3, "triangle": 3, "angle": 3, "polyline": 2,
    "line": 2, "segment": 2, "ray": 2, "arc": 3, "sector": 3,
    "region": 2, "circle": 1, "ellipse": 1, "points": 1, "label": 1,
}

# ── 3. Where a layer keeps its points ────────────────────────────────────────
#
# Walked generically instead of per-kind: a per-kind table is exactly what fell
# out of sync in the first place (a new kind then needed five edits — four
# solvers plus the contract — and got none).
#
# A value under a SCALAR key must be a point OBJECT ({id, x, y}).
_SCALAR_POINT_KEYS = frozenset({
    "center", "centre", "from", "to", "at", "point", "vertex", "foot",
    "tangent_point", "tangency_point", "arc_midpoint", "mid", "origin",
})
#
# A value under a LIST key may hold point objects AND plain id strings
# ("through_3pts": ["A", "E", "F"] is a documented part of the prompt).
_LIST_POINT_KEYS = frozenset({
    "points", "data", "vertices", "of", "path", "via", "arcs", "segments",
    "through_3pts", "through_pts", "items", "parts", "objects", "endpoints",
})

_MAX_DEPTH = 6


def _num(value: Any) -> bool:
    """True when value is a real number (a bool is not a coordinate)."""
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _is_point_object(node: Any) -> bool:
    return isinstance(node, dict) and _num(node.get("x")) and _num(node.get("y"))


def iter_point_dicts(layer: Any) -> Iterator[Tuple[str, Dict[str, Any]]]:
    """Yield ``(key, point_object)`` for every point a layer declares.

    Recursive on purpose: the same walk finds ``circle.center``,
    ``line.from``/``to``, the items of ``points.data`` and ``polygon.points``,
    an ``arc``'s three defining points and the mixed ``region.path`` items —
    with no per-kind table to keep in sync. The yielded dicts are the ACTUAL
    objects from the payload, so in-place edits by the solvers propagate back
    into it (the pattern geometry_snapping.py already relies on).
    """
    def walk(node: Any, depth: int) -> Iterator[Tuple[str, Dict[str, Any]]]:
        if depth > _MAX_DEPTH:
            return
        if isinstance(node, dict):
            for key, value in node.items():
                if key in _SCALAR_POINT_KEYS and _is_point_object(value):
                    yield key, value
                elif isinstance(value, (dict, list)):
                    yield from walk(value, depth + 1)
        elif isinstance(node, list):
            for item in node:
                if _is_point_object(item):
                    yield "[]", item
                elif isinstance(item, (dict, list)):
                    yield from walk(item, depth + 1)

    yield from walk(layer, 0)


def reference_ids(layer: Any) -> List[str]:
    """Every point id a layer REFERS to (object ``id``/``name`` and bare ids)."""
    if not isinstance(layer, dict):
        return []
    ids: List[str] = []
    for _, obj in iter_point_dicts(layer):
        pid = obj.get("id") or obj.get("name")
        if isinstance(pid, str) and pid.strip():
            ids.append(pid.strip())
    # Bare id strings ("through_3pts": ["A","E","F"]) and scalar ids
    # ({"kind":"label","at":"A"}) — only under keys where an id string is
    # unambiguous, so {"arc": "minor"} can never be read as an id.
    for key in _LIST_POINT_KEYS:
        value = layer.get(key)
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item.strip():
                    ids.append(item.strip())
    for key in _SCALAR_POINT_KEYS:
        value = layer.get(key)
        if isinstance(value, str) and value.strip():
            ids.append(value.strip())
    return ids

# ── 4. Reading a payload ─────────────────────────────────────────────────────

def canonical_kind(kind: Any) -> str:
    """Map a raw ``kind`` onto a contract kind ('' when it is not one)."""
    if not isinstance(kind, str):
        return ""
    key = kind.strip().lower().replace(" ", "_").replace("-", "_")
    if key in LAYER_KINDS:
        return key
    return KIND_ALIASES.get(key, "")


def layers_of(viz: Any) -> List[Any]:
    """The layer list of a payload, or [] when it is not composite geometry."""
    if not isinstance(viz, dict):
        return []
    layers = viz.get("layers")
    return layers if isinstance(layers, list) else []


def _usable_points(points: Any) -> List[Dict[str, Any]]:
    """The point OBJECTS (with numeric x/y) out of a top-level ``points`` list."""
    out: List[Dict[str, Any]] = []
    for p in (points if isinstance(points, list) else []):
        if isinstance(p, dict) and _num(p.get("x")) and _num(p.get("y")):
            out.append(p)
    return out


def synthesize_layers(viz: Any) -> Any:
    """Give a LAYERLESS ``geometry_2d`` payload a drawable ``layers`` array.

    The model sometimes answers with the single-shape form (``mode`` + top-level
    ``points``), or drops ``layers`` altogether on a hard figure (live QA, the
    "ba cung nội tiếp" benchmark). ``layers_of()`` is then empty, which means:
    the render report says there is nothing to draw (a blank canvas), the whole
    construction/regularization block — guarded by ``"layers" in _viz_block`` —
    never runs, and the automatic tangent-triple inference never fires. This
    turns the payload the model DID send into the composite form the pipeline
    expects, so the figure is drawn and the solver can fix its coordinates.

    Returns a NEW dict with a synthesized ``layers`` ONLY when the payload has
    no drawable layer already AND declares at least two usable top-level points;
    otherwise the input is returned unchanged. A payload that already has a
    drawable layer is never rewritten.
    """
    if not isinstance(viz, dict) or viz.get("widget") != "geometry_2d":
        return viz
    for layer in layers_of(viz):
        if isinstance(layer, dict) and canonical_kind(layer.get("kind")):
            return viz  # already composite — leave it exactly as sent
    pts = _usable_points(viz.get("points"))
    if len(pts) < 2:
        return viz

    data = copy.deepcopy(viz)
    shape = _usable_points(data.get("points"))
    mode = data.get("mode") if isinstance(data.get("mode"), str) else ""
    mode = mode.strip().lower()
    if mode == "triangle" or (not mode and len(shape) == 3):
        kind = "triangle" if len(shape) == 3 else "polygon"
    elif mode in ("quadrilateral", "polygon"):
        kind = "polygon"
    elif len(shape) == 2:
        kind = "segment"
    else:
        kind = "polygon"
    existing = [l for l in layers_of(data)]
    data["layers"] = [
        {"kind": kind, "points": shape},
        {"kind": "points", "data": shape},
    ] + existing
    return data


def declared_point_ids(viz: Any) -> set:
    """Every point id the payload defines, across layers and constructions."""
    ids: set = set()
    if not isinstance(viz, dict):
        return ids
    for layer in layers_of(viz):
        for _, obj in iter_point_dicts(layer):
            pid = obj.get("id") or obj.get("name")
            if isinstance(pid, str) and pid.strip():
                ids.add(pid.strip())
    for point in viz.get("points") or []:
        if isinstance(point, dict):
            pid = point.get("id") or point.get("name")
            if isinstance(pid, str) and pid.strip():
                ids.add(pid.strip())
    for construction in viz.get("constructions") or []:
        if isinstance(construction, dict) and isinstance(construction.get("point"), str):
            ids.add(construction["point"].strip())
    return ids


def unknown_kind_layers(viz: Any) -> List[Dict[str, Any]]:
    """Layers whose ``kind`` is neither a contract kind nor a known alias."""
    report: List[Dict[str, Any]] = []
    for index, layer in enumerate(layers_of(viz)):
        raw = layer.get("kind") if isinstance(layer, dict) else None
        if not canonical_kind(raw):
            report.append({"index": index,
                           "kind": raw if isinstance(raw, str) else str(raw),
                           "reason": "unknown_kind"})
    return report


def missing_point_refs(viz: Any) -> List[Dict[str, Any]]:
    """Layers pointing at a point id that nothing in the payload declares.

    A dangling reference is what makes a figure "almost right": the arc is
    drawn from a guessed coordinate that no longer coincides with the circle it
    was supposed to touch.
    """
    declared = declared_point_ids(viz)
    missing: List[Dict[str, Any]] = []
    for index, layer in enumerate(layers_of(viz)):
        if not isinstance(layer, dict):
            continue
        absent = [pid for pid in dict.fromkeys(reference_ids(layer)) if pid not in declared]
        if absent:
            missing.append({"index": index, "kind": canonical_kind(layer.get("kind")),
                            "ids": absent})
    return missing

def _point_ref_count(layer: Any) -> int:
    """Distinct point definitions a layer carries: referenced ids AND inline coords.

    ``reference_ids`` deliberately yields only ids (it feeds the dangling-ref
    report, where an anonymous ``{x, y}`` has nothing to check). Counting with it
    alone made ``_drawable`` treat a layer whose points are inline objects
    WITHOUT an id — the dashed axis line ``{"from":{"x":-1,"y":0},"to":{"x":9,"y":0}}``
    the model emits for a tangent-arc figure, a region outline built from raw
    coordinates — as ZERO references, so it was reported ``incomplete /
    not_enough_points`` and the UI showed a spurious "N phần chưa vẽ được" chip
    even though BOTH renderers draw it fine (they fall back to the inline x/y —
    ``MathVizJSXGraph.js`` builds a hidden point from ``layer.from.x`` when there
    is no id). Counting the anonymous inline objects too keeps the report honest.
    """
    if not isinstance(layer, dict):
        return 0
    referenced = set(reference_ids(layer))
    inline = 0
    for _, obj in iter_point_dicts(layer):
        pid = obj.get("id") or obj.get("name")
        if not (isinstance(pid, str) and pid.strip()):
            inline += 1
    return len(referenced) + inline


def _drawable(layer: Dict[str, Any], kind: str) -> bool:
    """Structural check: does this layer carry enough geometry to be drawn?

    Counts REFERENCES and inline coordinates, not only id-bearing references: an
    ``angle`` names its three vertices as bare ids (["B","A","C"]) and a ``line``
    may carry anonymous ``{x, y}`` endpoints — both are complete definitions as
    long as the renderers can place them, which they can.
    """
    needed = MIN_POINTS.get(kind, 0)
    if not needed:
        return True
    if bool(layer.get("r") or layer.get("radius")):
        return True
    if kind in ("circle", "ellipse", "label", "points"):
        return isinstance(layer.get("center"), (dict, str)) or needed <= 1
    return _point_ref_count(layer) >= needed


def engine_min(required: Iterable[str]) -> str:
    """The preferred engine that can draw every required kind ('' if none)."""
    needed = {k for k in required if k}
    for engine in ENGINE_PREFERENCE:
        if needed <= set(ENGINE_SUPPORT[engine]):
            return engine
    return ""


def render_report(viz: Any) -> Dict[str, Any]:
    """What the renderers will actually show, and what they will not.

    Keys:
      ``skipped``      — layers dropped by normalize_geometry_2d (unknown kind)
      ``unsupported``  — contract kinds no engine can draw at all
      ``incomplete``   — layers whose own geometry is not enough to draw
      ``dangling``     — layers referencing an undeclared point id
      ``approximate``  — constructions the solver could only place by a guaranteed
                         property (collinear between centres) rather than exactly
      ``engine_min``   — engine that draws every kind, '' when none does
    """
    unsupported: List[Dict[str, Any]] = []
    incomplete: List[Dict[str, Any]] = []
    kinds: List[str] = []
    for index, layer in enumerate(layers_of(viz)):
        if not isinstance(layer, dict):
            continue
        kind = canonical_kind(layer.get("kind"))
        if not kind:
            continue
        kinds.append(kind)
        if not _drawable(layer, kind):
            incomplete.append({"index": index, "kind": kind, "reason": "not_enough_points"})
        if not any(kind in ENGINE_SUPPORT[engine] for engine in ENGINE_PREFERENCE):
            unsupported.append({"index": index, "kind": kind})
    return {
        "skipped": unknown_kind_layers(viz),
        "unsupported": unsupported,
        "incomplete": incomplete,
        "dangling": missing_point_refs(viz),
        # Read from the payload: geometry_construction_solver writes it when a point
        # could only be placed by a property that IS guaranteed (collinear between
        # the two centres) instead of exactly. Reported so the figure never claims
        # more precision than it has.
        "approximate": list((viz.get("_constructions_approximate") or [])),
        "engine_min": engine_min(kinds),
    }


def normalize_geometry_2d(viz: Any) -> Tuple[Any, Dict[str, Any]]:
    """Rewrite alias kinds to contract kinds and DROP unknown ones — loudly.

    Returns ``(normalized_payload, report)``. The payload is deep-copied, so
    the caller decides what to keep, and the report is also stored ON the
    payload as ``_render`` so the UI and the telemetry read the same numbers.
    """
    empty = {"mapped": [], "skipped": [], "unsupported": [], "incomplete": [],
             "dangling": [], "approximate": [], "engine_min": ""}
    if not isinstance(viz, dict) or viz.get("widget") != "geometry_2d":
        return viz, dict(empty)

    data = copy.deepcopy(viz)
    mapped: List[Dict[str, Any]] = []
    skipped: List[Dict[str, Any]] = []
    kept: List[Any] = []
    for index, layer in enumerate(layers_of(data)):
        if not isinstance(layer, dict):
            skipped.append({"index": index, "kind": type(layer).__name__,
                            "reason": "layer_is_not_an_object"})
            continue
        raw = layer.get("kind")
        kind = canonical_kind(raw)
        if not kind:
            skipped.append({"index": index,
                            "kind": raw if isinstance(raw, str) else str(raw),
                            "reason": "unknown_kind"})
            continue
        if isinstance(raw, str) and raw != kind:
            mapped.append({"index": index, "from": raw, "to": kind})
            layer["kind"] = kind
        kept.append(layer)

    # Deduplicate redundant full circles that overlap an arc or sector with the same center
    arc_centers = set()
    for lay in kept:
        if isinstance(lay, dict) and lay.get("kind") in ("arc", "sector"):
            c = lay.get("center")
            cid = c if isinstance(c, str) else (c.get("id") or c.get("name") if isinstance(c, dict) else None)
            if cid:
                arc_centers.add(cid)

    if arc_centers:
        cleaned_kept = []
        for lay in kept:
            if isinstance(lay, dict) and lay.get("kind") == "circle":
                c = lay.get("center")
                cid = c if isinstance(c, str) else (c.get("id") or c.get("name") if isinstance(c, dict) else None)
                if cid and cid in arc_centers and not lay.get("label"):
                    skipped.append({"index": len(cleaned_kept), "kind": "circle",
                                    "reason": "redundant_auxiliary_circle_overlapping_arc"})
                    continue
            cleaned_kept.append(lay)
    # If a region has arc boundary path items but no corresponding arc layers exist,
    # synthesize arc boundary layers so the curves are clearly visible as crisp outlines.
    existing_arcs = [lay for lay in kept if isinstance(lay, dict) and lay.get("kind") == "arc"]
    if not existing_arcs:
        for lay in list(kept):
            if isinstance(lay, dict) and lay.get("kind") == "region":
                path_items = lay.get("path") or []
                for p_item in path_items:
                    if isinstance(p_item, dict) and p_item.get("type") in ("arc", "circle_arc"):
                        kept.append({
                            "kind": "arc",
                            "center": copy.deepcopy(p_item.get("center")),
                            "from": copy.deepcopy(p_item.get("from")),
                            "to": copy.deepcopy(p_item.get("to")),
                            "color": "#38bdf8",
                            "strokeWidth": 2
                        })

    if isinstance(data.get("layers"), list):
        data["layers"] = kept

    report = render_report(data)
    report["mapped"] = mapped
    # ``skipped`` here is authoritative: it also covers non-object layers.
    report["skipped"] = skipped
    # Stamped on the payload too: the UI reads the same numbers the telemetry
    # logs, so "the figure lost a part" is visible in both places at once.
    data["_render"] = report
    return data, report

# ── Fence recovery (P15-fix, classroom report 2026-10-01) ────────────────────
# A reply whose payload sat under a PLAIN fence (```json, ```javascript or a
# bare ```) sailed through the old extractor untouched, and the chat showed the
# raw JSON instead of a figure (the screenshot in the report). The payload is
# still a mathviz object — recover it by VALUE, not by the fence's language
# tag, and let the same validation/repair machinery take over.
_FENCE_RE = re.compile(r"```[ \t]*(?P<lang>[A-Za-z0-9_+-]*)[ \t]*\r?\n(?P<body>[\s\S]*?)```")


def recover_fenced_mathviz(raw: Any) -> Tuple[Any, Any]:
    """``(text_without_block, payload)`` when a NON-``mathviz`` fence carries a
    mathviz object, ``(None, None)`` otherwise.

    Only fences whose payload really parses to a dict with a ``widget`` key are
    claimed (and ``type`` must be absent or ``mathviz.v1``), so an unrelated
    JSON code block in the answer is never stolen. The canonical
    ```` ```mathviz ```` fence is deliberately SKIPPED here — main.py's
    ``_extract_mathviz_block`` owns it, including the json_repair passages.
    """
    if not isinstance(raw, str) or "```" not in raw:
        return None, None
    for match in _FENCE_RE.finditer(raw):
        if (match.group("lang") or "").strip().lower() == "mathviz":
            continue
        body = (match.group("body") or "").strip()
        if "mathviz" not in body and '"widget"' not in body:
            continue
        try:
            data = json.loads(body)
        except Exception:
            continue
        if not isinstance(data, dict) or not data.get("widget"):
            continue
        declared = data.get("type")
        if declared not in (None, "", "mathviz.v1"):
            continue
        if declared in (None, ""):
            data["type"] = "mathviz.v1"
        text = (raw[:match.start()] + raw[match.end():]).strip()
        return text, data
    return None, None


def geometry_2d_errors(viz: Any) -> List[str]:
    """Vietnamese validation errors for a ``geometry_2d`` payload.

    Same shape main.py's ``validate_mathviz`` already returns, so the two
    existing repair tiers (a same-model Gemini retry, then the free-tier JSON
    repair) pick these up with no new plumbing — which is the whole point:
    before this check existed, an invented layer kind or a dangling point id
    validated clean and was never repaired.
    """
    errors: List[str] = []
    if not isinstance(viz, dict):
        return ["payload geometry_2d không phải là object"]

    layers = viz.get("layers")
    if isinstance(layers, list) and not layers:
        errors.append("'layers' rỗng — hình sẽ không có gì để vẽ")
    elif layers is not None and not isinstance(layers, list):
        errors.append(f"'layers' phải là mảng, không phải {type(layers).__name__}")
    elif layers is None and not any(
            key in viz for key in ("points", "circle", "ellipse", "polygon", "sides")):
        errors.append("'geometry_2d' không có dữ liệu hình để vẽ "
                      "(cần 'layers', hoặc 'mode' + 'points')")

    unknown = unknown_kind_layers(viz)
    if unknown:
        bad = ", ".join(f"#{item['index']}='{item['kind']}'" for item in unknown)
        errors.append(f"kind không hợp lệ trong 'layers': {bad}. "
                      f"Phải thuộc {sorted(LAYER_KINDS)}")

    dangling = missing_point_refs(viz)
    if dangling:
        bad = ", ".join(f"#{item['index']} ({item['kind']}) thiếu {item['ids']}"
                        for item in dangling)
        errors.append(f"điểm được nhắc tới nhưng chưa khai báo trong payload: {bad}")

    bad_types = unknown_construction_types(viz)
    if bad_types:
        bad = ", ".join(f"{item['point']}='{item['type']}'" for item in bad_types)
        errors.append(f"'constructions' dùng type chưa hỗ trợ: {bad}. "
                      f"Phải thuộc {sorted(construction_types())}")

    # Kiểm tra tính hợp lệ của claims (Quy tắc 11)
    claims = viz.get("claims")
    if isinstance(claims, list):
        supported_claims = {"collinear", "concyclic", "perpendicular", "parallel", "equal"}
        for ci, c in enumerate(claims):
            if not isinstance(c, dict):
                continue
            ctype = c.get("type")
            if ctype not in supported_claims:
                errors.append(f"claim #{ci} dùng type '{ctype}' chưa hỗ trợ. Phải thuộc {sorted(supported_claims)}")
            cof = c.get("of")
            if not isinstance(cof, list):
                errors.append(f"claim #{ci} thiếu mảng 'of'")
            elif ctype == "collinear" and len(cof) < 3:
                errors.append(f"claim #{ci} ('collinear') cần ít nhất 3 điểm trong 'of'")
            elif ctype in ("concyclic", "perpendicular", "parallel", "equal") and len(cof) != 4:
                errors.append(f"claim #{ci} ('{ctype}') cần đúng 4 điểm trong 'of'")

    # Giới hạn tài nguyên (Quy tắc 7: ≤ 8 tham số, ≤ 60 đối tượng)
    params = viz.get("params")
    if isinstance(params, dict) and len(params) > 8:
        errors.append(f"quá 8 tham số ({len(params)})")

    total_objects = len(layers or []) + len(viz.get("constructions") or []) + len(declared_point_ids(viz))
    if total_objects > 60:
        errors.append(f"quá 60 đối tượng hình học ({total_objects})")

    return errors


# ── 5. The construction vocabulary ───────────────────────────────────────────
#
# Kept next to the layer kinds because the two are taught in the same prompt
# block and repaired by the same call: a point the solver cannot resolve stays
# at the model's guess, which is how a tangency point drifts off both circles.
_CONSTRUCTION_FALLBACK = frozenset({
    "midpoint", "foot", "intersection", "orthocenter", "circumcenter",
    "incenter", "centroid", "reflection", "ratio_point", "tangent_intersection",
    "circle_line_intersection", "circle_circle_intersection",
    "angle_bisector_foot", "nine_point_center", "point_on_circle",
    "point_on_arc", "circle_circle_tangency", "arc_midpoint", "excenter",
    "homothety", "rotation", "inversion",
})


def construction_types() -> frozenset:
    """The construction types the analytic solver can resolve exactly.

    Imported lazily and defensively: this module must stay importable with the
    standard library alone (see the header), and the solver is the authority on
    its own vocabulary — duplicating the list here is how the two drifted apart
    before.
    """
    try:
        from geometry_construction_solver import SUPPORTED_TYPES  # type: ignore
        return frozenset(SUPPORTED_TYPES)
    except Exception:
        return _CONSTRUCTION_FALLBACK


def unknown_construction_types(viz: Any) -> List[Dict[str, Any]]:
    """Declared constructions the solver will leave at their raw coordinates."""
    known = construction_types()
    unknown: List[Dict[str, Any]] = []
    if not isinstance(viz, dict):
        return unknown
    for index, construction in enumerate(viz.get("constructions") or []):
        if not isinstance(construction, dict):
            continue
        ctype = construction.get("type")
        if isinstance(ctype, str) and ctype.strip() and ctype.strip() not in known:
            unknown.append({"index": index, "point": construction.get("point"),
                            "type": ctype.strip()})
    return unknown

# ── 6. Prompt fragments ──────────────────────────────────────────────────────
#
# One place produces the vocabulary the model is taught, so the system prompt
# and the two JSON-repair prompts can never disagree with the renderers again.

_KIND_USAGE: Dict[str, str] = {
    "circle": '{"kind":"circle","center":{"id":"O","x":0,"y":0},"r":3.5} hoặc "through_3pts":["A","E","F"]',
    "polygon": '{"kind":"polygon","points":[{"id":"A","x":0,"y":0},...]}',
    "triangle": '{"kind":"triangle","points":[{"id":"A","x":0,"y":0},...]}',
    "ellipse": '{"kind":"ellipse","center":{"x":0,"y":0},"a":4,"b":2.5}',
    "arc": '{"kind":"arc","center":{...},"from":{...},"to":{...},"style":"solid|dashed"} — cung tròn',
    "sector": '{"kind":"sector","center":{...},"from":{...},"to":{...}} — hình quạt',
    "region": '{"kind":"region","path":[{"type":"point",...},{"type":"arc","center":{...},"from":{...},"to":{...}}],"fill":"rgba(...)"} — miền tô (đoạn và cung trộn lẫn)',
    "line": '{"kind":"line","from":{...},"to":{...}}',
    "segment": '{"kind":"segment","from":{...},"to":{...}}',
    "ray": '{"kind":"ray","from":{...},"to":{...}} — tia',
    "polyline": '{"kind":"polyline","points":[{...},{...},...]} — đường gấp khúc',
    "angle": '{"kind":"angle","points":["A","B","C"],"right_angle":true|false} — dấu góc (đỉnh là điểm thứ 2)',
    "label": '{"kind":"label","at":{...},"text":"$x$"}',
    "points": '{"kind":"points","data":[{"id":"A","x":0,"y":0}]}',
}


def prompt_vocabulary() -> str:
    """The layer-kind table injected into the geometry_2d system prompt."""
    lines = [
        "## BẢNG KIND HỢP LỆ CỦA \"layers\" (dùng ĐÚNG các từ khóa này, KHÔNG bịa kind mới):",
    ]
    for kind in sorted(LAYER_KINDS):
        lines.append(f"- {kind}: {_KIND_USAGE.get(kind, '')}")
    lines.append(
        "Mọi điểm mà một layer nhắc tới (center/from/to/points/path/through_3pts)"
        " BẮT BUỘC phải được khai báo trong cùng payload."
    )
    lines.append(
        "Nếu hình có chi tiết mà bảng trên KHÔNG diễn tả được (ví dụ dải cong do hai cung "
        "tiếp xúc cắt nhau): hãy xấp xỉ bằng \"polyline\" + \"points\" và nói rõ trong lời "
        "giải rằng hình vẽ chỉ mô phỏng gần đúng. TUYỆT ĐỐI không tự thêm kind lạ."
    )
    unsupported = sorted(_CONSTRUCTION_FALLBACK - construction_types())
    if unsupported:
        lines.append("Các kiểu dựng hình chưa được hỗ trợ (đừng dùng): "
                     + ", ".join(unsupported) + ".")
    return "\n".join(lines)


def repair_vocabulary() -> str:
    """Compact vocabulary for the JSON-repair prompts (Tier 1 and Tier 2)."""
    return (
        "Danh sách kind hợp lệ cho \"layers\": " + ", ".join(sorted(LAYER_KINDS)) + ". "
        "Danh sách \"type\" hợp lệ cho \"constructions\": "
        + ", ".join(sorted(construction_types())) + ". "
        "Mọi điểm được nhắc tới phải được khai báo trong chính payload. "
        # P16-fix (2026-10-06): the model drifted to a foreign schema on the
        # tangent-arc benchmark — top-level "points" with no "layers", a
        # construction list keyed by id/type:{radius,circle,intersection,arc},
        # "claims" of type "tangent" and a "groups" array. Naming the forbidden
        # keys here is what turns the repair call into a targeted fix instead of
        # another guess.
        "BẮT BUỘC: mọi payload \"geometry_2d\" PHẢI có khóa \"layers\" (mảng). "
        "KHÔNG dùng các khóa/kiểu sau (không thuộc MathViz, sẽ bị loại): "
        "\"radius\", \"objects\", \"groups\"; construction phải có khóa \"point\" "
        "(KHÔNG phải \"id\") với \"type\" thuộc danh sách trên; \"claims\" chỉ "
        "thuộc {collinear, concyclic, perpendicular, parallel, equal} và phải có mảng \"of\"."
    )