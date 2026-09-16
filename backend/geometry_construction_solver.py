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

import re
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
    "circle_line_intersection", "circle_circle_intersection",
    "angle_bisector_foot", "nine_point_center",
    "point_on_circle", "point_on_arc",
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


def _circle_line_intersection(center: Point2D, r_pt: Point2D, l1: Point2D, l2: Point2D) -> Optional[Point2D]:
    """
    Finds intersection of line (l1, l2) with circle (center, r = dist(center, r_pt)).
    Returns the second intersection point (if l1 or l2 is already on the circle, returns the other point;
    otherwise returns the point further along vector l1->l2).
    """
    cx, cy = center
    r = math.dist(center, r_pt)
    if r < 1e-6:
        return None
    
    x1, y1 = l1
    x2, y2 = l2
    dx, dy = x2 - x1, y2 - y1
    dr2 = dx * dx + dy * dy
    if dr2 < 1e-12:
        return None

    # Line parametrization: P(t) = l1 + t * d
    # ||l1 + t*d - center||^2 = r^2
    # fx = x1 - cx, fy = y1 - cy
    fx = x1 - cx
    fy = y1 - cy
    
    a = dr2
    b = 2.0 * (fx * dx + fy * dy)
    c = fx * fx + fy * fy - r * r
    
    discriminant = b * b - 4.0 * a * c
    if discriminant < -1e-6:
        return None
    discriminant = max(0.0, discriminant)
    sqrt_d = math.sqrt(discriminant)
    
    t1 = (-b - sqrt_d) / (2.0 * a)
    t2 = (-b + sqrt_d) / (2.0 * a)
    
    p_t1 = (round(x1 + t1 * dx, 4), round(y1 + t1 * dy, 4))
    p_t2 = (round(x1 + t2 * dx, 4), round(y1 + t2 * dy, 4))
    
    # If l1 is near p_t1, return p_t2
    if math.dist(l1, p_t1) < 1e-3:
        return p_t2
    # If l1 is near p_t2, return p_t1
    if math.dist(l1, p_t2) < 1e-3:
        return p_t1
    
    # Otherwise return the point further along t (t2)
    return p_t2


def _circle_circle_intersection(c1: Point2D, r1_pt: Point2D, c2: Point2D, r2_pt: Point2D) -> Optional[Point2D]:
    """
    Finds an intersection point between circle 1 (c1, r1=dist(c1, r1_pt))
    and circle 2 (c2, r2=dist(c2, r2_pt)).
    Returns the upper/first intersection point.
    """
    r1 = math.dist(c1, r1_pt)
    r2 = math.dist(c2, r2_pt)
    d = math.dist(c1, c2)
    if d > r1 + r2 or d < abs(r1 - r2) or d < 1e-9:
        return None

    a = (r1 * r1 - r2 * r2 + d * d) / (2.0 * d)
    h_sq = r1 * r1 - a * a
    h = math.sqrt(max(0.0, h_sq))

    x0 = c1[0] + a * (c2[0] - c1[0]) / d
    y0 = c1[1] + a * (c2[1] - c1[1]) / d

    rx = -(c2[1] - c1[1]) * (h / d)
    ry = (c2[0] - c1[0]) * (h / d)

    q1 = (round(x0 + rx, 4), round(y0 + ry, 4))
    q2 = (round(x0 - rx, 4), round(y0 - ry, 4))

    # If r1_pt is one of the intersection points, return the other one
    if math.dist(r1_pt, q1) < 1e-3:
        return q2
    return q1


def _angle_bisector_foot(vertex: Point2D, p1: Point2D, p2: Point2D) -> Optional[Point2D]:
    """
    Calculates the foot of the interior angle bisector from vertex to opposite side (p1, p2).
    By the angle bisector theorem, foot divides p1-p2 in ratio |vertex - p1| : |vertex - p2|.
    """
    d1 = math.dist(vertex, p1)
    d2 = math.dist(vertex, p2)
    total = d1 + d2
    if total < 1e-9:
        return p1
    t = d1 / total
    return (round(p1[0] + t * (p2[0] - p1[0]), 4), round(p1[1] + t * (p2[1] - p1[1]), 4))


def _nine_point_center(a: Point2D, b: Point2D, c: Point2D) -> Optional[Point2D]:
    """
    Euler 9-point circle center is the midpoint of Orthocenter H and Circumcenter O.
    """
    h = _orthocenter(a, b, c)
    o = _circumcenter(a, b, c)
    if h is None or o is None:
        return None
    return _midpoint(h, o)


def _point_on_circle(center: Point2D, of_coords: List[Point2D], extra: Dict[str, Any]) -> Optional[Point2D]:
    """
    Places a point on circle with center = of_coords[0].
    Radius is determined by dist(center, of_coords[1]) if provided, or extra["r"] / extra["radius"].
    Position on circle is determined by:
    1. extra["angle"] (radians, or degrees if abs > 2*pi or extra["angle_deg"])
    2. or extra["chord_len"] / extra["dist"] distance constraint from of_coords[1]
    """
    cx, cy = center
    if len(of_coords) >= 2:
        r = math.dist(center, of_coords[1])
    else:
        r = float(extra.get("r") or extra.get("radius", 3.0))
    
    if r < 1e-6:
        return None

    # Check if chord length constraint is used: point on circle at distance chord_len from of_coords[1]
    if ("chord_len" in extra or "dist" in extra) and len(of_coords) >= 2:
        chord_d = float(extra.get("chord_len") or extra.get("dist"))
        ratio = max(-1.0, min(1.0, chord_d / (2.0 * r)))
        alpha = 2.0 * math.asin(ratio)
        base_pt = of_coords[1]
        base_angle = math.atan2(base_pt[1] - cy, base_pt[0] - cx)
        side = str(extra.get("side", "ccw")).lower()
        target_angle = base_angle + alpha if side == "ccw" else base_angle - alpha
        return (round(cx + r * math.cos(target_angle), 4), round(cy + r * math.sin(target_angle), 4))

    # Angle constraint
    if "angle_deg" in extra:
        theta = math.radians(float(extra["angle_deg"]))
    elif "angle" in extra:
        val = float(extra["angle"])
        theta = math.radians(val) if abs(val) > 2 * math.pi else val
    else:
        theta = 0.0

    return (round(cx + r * math.cos(theta), 4), round(cy + r * math.sin(theta), 4))


def _point_on_arc(center: Point2D, p_start: Point2D, p_end: Point2D, extra: Dict[str, Any]) -> Optional[Point2D]:
    """
    Places a point on the circular arc between p_start and p_end on circle (center, r = dist(center, p_start)).
    extra["arc"]: "minor" (default) or "major"
    extra["t"]: parameter 0.0..1.0 (default 0.35, where 0 = p_start, 1 = p_end)
    """
    cx, cy = center
    r = math.dist(center, p_start)
    if r < 1e-6:
        return None

    a_start = math.atan2(p_start[1] - cy, p_start[0] - cx)
    a_end = math.atan2(p_end[1] - cy, p_end[0] - cx)

    # Angular difference counter-clockwise in [0, 2*pi)
    diff_ccw = (a_end - a_start) % (2.0 * math.pi)
    is_minor = str(extra.get("arc", "minor")).lower() != "major"

    if diff_ccw <= math.pi:
        sweep = diff_ccw if is_minor else -(2.0 * math.pi - diff_ccw)
    else:
        sweep = -(2.0 * math.pi - diff_ccw) if is_minor else diff_ccw

    t = float(extra.get("t", 0.35))
    target_angle = a_start + t * sweep
    return (round(cx + r * math.cos(target_angle), 4), round(cy + r * math.sin(target_angle), 4))


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
        if ctype == "circle_line_intersection" and len(of_coords) >= 4:
            return _circle_line_intersection(of_coords[0], of_coords[1], of_coords[2], of_coords[3])
        if ctype == "circle_circle_intersection" and len(of_coords) >= 4:
            return _circle_circle_intersection(of_coords[0], of_coords[1], of_coords[2], of_coords[3])
        if ctype == "angle_bisector_foot" and len(of_coords) >= 3:
            return _angle_bisector_foot(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "nine_point_center" and len(of_coords) >= 3:
            return _nine_point_center(of_coords[0], of_coords[1], of_coords[2])
        if ctype == "point_on_circle" and len(of_coords) >= 1:
            return _point_on_circle(of_coords[0], of_coords, extra)
        if ctype == "point_on_arc" and len(of_coords) >= 3:
            return _point_on_arc(of_coords[0], of_coords[1], of_coords[2], extra)
    except Exception as e:
        logger.debug(f"[ConstructionSolver] {ctype} failed on inputs {of_coords}: {e}")
    return None


def _cascade_update_layers(viz_data: Dict[str, Any], coords: Dict[str, Point2D]) -> None:
    """
    Cascade-updates all layer types (line, segment, circle) whose endpoints or
    centers reference resolved point IDs or are designated by clean labels.
    Ensures lines connect cleanly to exact analytic points and circles center precisely,
    without blind geometric threshold snapping.
    """
    for lay in viz_data.get("layers", []) or []:
        kind = lay.get("kind")
        
        # 1. Line and segment layers
        if kind in ("line", "segment"):
            f_pt = lay.get("from")
            t_pt = lay.get("to")
            
            # If label specifically names two endpoints (e.g. 'AD', 'BE', 'Đường cao AD', 'Trung tuyến AM')
            lbl = str(lay.get("label") or "")
            m_seg = re.search(r'\b([A-Z])([A-Z])\b', lbl)
            if m_seg:
                p1_name, p2_name = m_seg.group(1), m_seg.group(2)
                if p1_name in coords and p2_name in coords:
                    if not isinstance(f_pt, dict):
                        lay["from"] = {}
                        f_pt = lay["from"]
                    f_pt["id"] = p1_name
                    f_pt["x"] = coords[p1_name][0]
                    f_pt["y"] = coords[p1_name][1]

                    if not isinstance(t_pt, dict):
                        lay["to"] = {}
                        t_pt = lay["to"]
                    t_pt["id"] = p2_name
                    t_pt["x"] = coords[p2_name][0]
                    t_pt["y"] = coords[p2_name][1]

            # Update 'from' by explicit ID
            if isinstance(f_pt, dict):
                fid = f_pt.get("id")
                if fid and fid in coords:
                    f_pt["x"] = coords[fid][0]
                    f_pt["y"] = coords[fid][1]

            # Update 'to' by explicit ID
            if isinstance(t_pt, dict):
                tid = t_pt.get("id")
                if tid and tid in coords:
                    t_pt["x"] = coords[tid][0]
                    t_pt["y"] = coords[tid][1]

        # 2. Circle layers
        elif kind == "circle":
            center = lay.get("center")
            if isinstance(center, dict):
                cid = center.get("id")
                if not cid:
                    # Check if label explicitly specifies circle center: e.g. "(O)", "tâm I", "Circle O"
                    lbl = str(lay.get("label") or "")
                    m_center = re.search(r'\(([A-Z])\)|\b(?:tâm|center|circle)\s+([A-Z])\b', lbl, re.IGNORECASE)
                    if m_center:
                        c_candidate = (m_center.group(1) or m_center.group(2)).upper()
                        if c_candidate in coords:
                            cid = c_candidate
                            center["id"] = cid

                if cid and cid in coords:
                    center["x"] = coords[cid][0]
                    center["y"] = coords[cid][1]
            
            # If circle has a defined pass-through point or radius point
            pass_pt_id = lay.get("radius_point") or lay.get("through")
            if pass_pt_id and pass_pt_id in coords and isinstance(center, dict) and "x" in center and "y" in center:
                lay["r"] = round(math.dist((center["x"], center["y"]), coords[pass_pt_id]), 4)


def resolve_constructions(viz_block: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Resolves viz_block["constructions"] (schema: [{"point","type","of",...}],
    same shape as geometry_engine.DIAGRAM_EXTRACTION_SCHEMA) in dependency
    order and writes exact coordinates back into every layer that
    references that point id. Also cascades updates to lines and circles.
    Returns (updated_viz_block, unsolved_point_ids).
    """
    if not isinstance(viz_block, dict) or viz_block.get("widget") != "geometry_2d":
        return viz_block, []
    constructions = viz_block.get("constructions")
    if not isinstance(constructions, list) or not constructions:
        return viz_block, []

    data = copy.deepcopy(viz_block)
    refs = _collect_point_refs(data)
    coords: Dict[str, Point2D] = {pid: (float(p["x"]), float(p["y"])) for pid, p in refs.items()}

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
                else:
                    # Point not yet declared in polygon/points layer, add to a points layer
                    points_layer = None
                    for lay in data.get("layers", []):
                        if lay.get("kind") == "points":
                            points_layer = lay
                            break
                    if points_layer is None:
                        points_layer = {"kind": "points", "data": []}
                        data.setdefault("layers", []).append(points_layer)
                    new_pt = {"id": pid, "x": solved[0], "y": solved[1]}
                    points_layer.setdefault("data", []).append(new_pt)
                    refs[pid] = new_pt
                del pending[pid]
                progressed = True

    unsolved = list(pending.keys())
    if unsolved:
        logger.info(f"[ConstructionSolver] Could not resolve: {unsolved} "
                    f"(unknown dependency, cycle, or degenerate case) — left as originally given.")
    
    # Cascade updates to all line and circle layers
    _cascade_update_layers(data, coords)

    return data, unsolved
