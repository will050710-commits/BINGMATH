"""
geometry_construction_solver.py
=================================
Root-cause fix for complex multi-point diagrams (17+ letters: A..Q) coming
out cramped/scattered in the rendered widget: the pipeline asks the LLM to
GUESS every point's (x, y) directly, then only patches a fixed, hand-named
subset via geometry_canvas_solver.py's template solver. Any letter/config
outside that template is never corrected and stays wherever the LLM's
one-shot numeric guess put it.

NOTE ON HISTORY: this module was built to run generally, for ANY diagram —
not hardcoded to one problem. A later edit to geometry_canvas_solver.py
went the opposite direction instead: it gated its whole solver behind a
literal title/point-name match for ONE specific Olympiad problem ("GLK" /
"CEVIAN" / "AML" / "EULER (9 ĐIỂM)", or the exact combination of points G,
L, K, P) and returns every OTHER geometry_2d diagram completely untouched.
That's why complex diagrams outside that one memorized case still render
poorly. This module is the general fix; keep BOTH — this one runs first
and handles anything the LLM declares via "constructions" (see the schema
teaching added to the geometry_2d system-prompt block), and the exact
template solver still runs after it for its one specific case.

Pipeline position (main.py chat(), BEFORE geometry_canvas_solver):

    from geometry_construction_solver import resolve_constructions
    from geometry_canvas_solver import auto_align_geometry_mathviz
    from geometry_snapping import snap_geometry_2d, verify_snap_safe

    _viz_block, _unsolved = resolve_constructions(_viz_block)
    _viz_block = auto_align_geometry_mathviz(_viz_block)   # still useful for its one template
    _snapped = snap_geometry_2d(_viz_block)
    _viz_block = _snapped if verify_snap_safe(_viz_block, _snapped) else _viz_block
"""

import math
import copy
import logging
from typing import Dict, Any, List, Tuple, Optional

Point2D = Tuple[float, float]
logger = logging.getLogger("geometry_construction_solver")

# Same vocabulary as geometry_engine.DIAGRAM_EXTRACTION_SCHEMA's "type" enum,
# plus a few common additions (centroid, reflection, ratio_point).
SUPPORTED_TYPES = {
    "midpoint", "foot", "intersection", "orthocenter", "circumcenter",
    "incenter", "centroid", "reflection", "ratio_point", "tangent_intersection",
}


# ── primitives (pure geometry, no state) ─────────────────────────────────────

def _midpoint(p: Point2D, q: Point2D) -> Point2D:
    return (round((p[0] + q[0]) / 2, 4), round((p[1] + q[1]) / 2, 4))


def _foot(p: Point2D, l1: Point2D, l2: Point2D) -> Point2D:
    dx, dy = l2[0] - l1[0], l2[1] - l1[1]
    denom = dx * dx + dy * dy
    if denom < 1e-12:
        return l1
    t = ((p[0] - l1[0]) * dx + (p[1] - l1[1]) * dy) / denom
    return (round(l1[0] + t * dx, 4), round(l1[1] + t * dy, 4))


def _line_intersection(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D) -> Optional[Point2D]:
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-9:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    return (round(x1 + t * (x2 - x1), 4), round(y1 + t * (y2 - y1), 4))


def _orthocenter(a: Point2D, b: Point2D, c: Point2D) -> Optional[Point2D]:
    foot_a = _foot(a, b, c)
    foot_b = _foot(b, a, c)
    return _line_intersection(a, foot_a, b, foot_b)


def _circumcenter(a: Point2D, b: Point2D, c: Point2D) -> Optional[Point2D]:
    ax, ay = a; bx, by = b; cx, cy = c
    d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if abs(d) < 1e-9:
        return None
    ux = ((ax**2+ay**2)*(by-cy) + (bx**2+by**2)*(cy-ay) + (cx**2+cy**2)*(ay-by)) / d
    uy = ((ax**2+ay**2)*(cx-bx) + (bx**2+by**2)*(ax-cx) + (cx**2+cy**2)*(bx-ax)) / d
    return (round(ux, 4), round(uy, 4))


def _incenter(a: Point2D, b: Point2D, c: Point2D) -> Point2D:
    la = math.dist(b, c)
    lb = math.dist(a, c)
    lc = math.dist(a, b)
    perim = la + lb + lc
    if perim < 1e-9:
        return a
    return (round((la*a[0] + lb*b[0] + lc*c[0]) / perim, 4),
            round((la*a[1] + lb*b[1] + lc*c[1]) / perim, 4))


def _centroid(pts: List[Point2D]) -> Point2D:
    n = len(pts)
    return (round(sum(p[0] for p in pts) / n, 4), round(sum(p[1] for p in pts) / n, 4))


def _reflection(p: Point2D, l1: Point2D, l2: Point2D) -> Point2D:
    foot = _foot(p, l1, l2)
    return (round(2*foot[0] - p[0], 4), round(2*foot[1] - p[1], 4))


def _ratio_point(p: Point2D, q: Point2D, t: float) -> Point2D:
    return (round(p[0] + t*(q[0]-p[0]), 4), round(p[1] + t*(q[1]-p[1]), 4))


# ── construction-graph resolution ────────────────────────────────────────────

def _collect_point_refs(viz: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
    refs: Dict[str, Dict[str, float]] = {}
    for lay in viz.get("layers", []) or []:
        kind = lay.get("kind")
        if kind in ("polygon", "triangle") and isinstance(lay.get("points"), list):
            for p in lay["points"]:
                if isinstance(p, dict) and "id" in p and "x" in p and "y" in p:
                    refs[p["id"]] = p
        elif kind == "points" and isinstance(lay.get("data"), list):
            for p in lay["data"]:
                if isinstance(p, dict) and "id" in p and "x" in p and "y" in p:
                    refs[p["id"]] = p
    return refs


def _solve_one(ctype: str, of_coords: List[Point2D], extra: Dict[str, Any]) -> Optional[Point2D]:
    try:
        if ctype == "midpoint" and len(of_coords) >= 2:
            return _midpoint(of_coords[0], of_coords[1])
        if ctype == "foot" and len(of_coords) >= 3:
            return _foot(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "intersection" and len(of_coords) >= 4:
            return _line_intersection(of_coords[0], of_coords[1], of_coords[2], of_coords[3])
        if ctype == "orthocenter" and len(of_coords) >= 3:
            return _orthocenter(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "circumcenter" and len(of_coords) >= 3:
            return _circumcenter(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "incenter" and len(of_coords) >= 3:
            return _incenter(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "centroid" and len(of_coords) >= 3:
            return _centroid(of_coords)
        if ctype == "reflection" and len(of_coords) >= 3:
            return _reflection(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "ratio_point" and len(of_coords) >= 2:
            return _ratio_point(of_coords[0], of_coords[1], float(extra.get("ratio", 0.5)))
    except Exception as e:
        logger.debug(f"[ConstructionSolver] {ctype} failed on inputs {of_coords}: {e}")
    return None  # includes "tangent_intersection": intentionally unsupported, not guessed


def resolve_constructions(viz_block: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Resolves viz_block["constructions"] (schema: [{"point","type","of",...}],
    same shape as geometry_engine.DIAGRAM_EXTRACTION_SCHEMA) in dependency
    order and writes exact coordinates back into every layer that
    references that point id. Returns (updated_viz_block, unsolved_point_ids).
    """
    if not isinstance(viz_block, dict) or viz_block.get("widget") != "geometry_2d":
        return viz_block, []
    constructions = viz_block.get("constructions")
    if not isinstance(constructions, list) or not constructions:
        return viz_block, []

    data = copy.deepcopy(viz_block)
    refs = _collect_point_refs(data)
    coords: Dict[str, Point2D] = {pid: (p["x"], p["y"]) for pid, p in refs.items()}

    pending = {c["point"]: c for c in data["constructions"]
               if isinstance(c, dict) and c.get("point") and c.get("type") in SUPPORTED_TYPES}

    progressed = True
    while pending and progressed:
        progressed = False
        for pid, c in list(pending.items()):
            of_ids = c.get("of", [])
            if not all(oid in coords for oid in of_ids):
                continue
            solved = _solve_one(c["type"], [coords[oid] for oid in of_ids], c)
            if solved is not None:
                coords[pid] = solved
                if pid in refs:
                    refs[pid]["x"], refs[pid]["y"] = solved
                del pending[pid]
                progressed = True

    unsolved = list(pending.keys())
    if unsolved:
        logger.info(f"[ConstructionSolver] Could not resolve: {unsolved} "
                    f"(unknown dependency, cycle, or degenerate case) — left as originally given.")
    return data, unsolved
