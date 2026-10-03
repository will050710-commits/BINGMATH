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
import os
import sys
import logging
from typing import Dict, Any, Iterable, List, Tuple, Optional

# Đợt 8 / 4I: the shared layer-kind vocabulary (see mathviz_contract.py).
try:
    import mathviz_contract
except ImportError:  # pragma: no cover — only when CWD is not backend/
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import mathviz_contract

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
    # Đợt 8 / 4I additions — each one is a construction the vocabulary allows but
    # nothing could resolve, so the point kept the model's raw guess:
    #   circle_circle_tangency → the touch point of two arcs/circles (the figure
    #     in the bug report: three mutually tangent arcs inside a right triangle,
    #     where the guess Q=(2.4, 1.8) should be exactly (1.6, 1.8));
    #   arc_midpoint          → "M là trung điểm cung BC";
    #   excenter              → "tâm đường tròn bàng tiếp".
    "circle_circle_tangency", "arc_midpoint", "excenter",
    # Mẫu mô hình toán 2D/3D additions:
    "homothety", "rotation", "inversion",
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


def _circle_circle_tangency(c1: Point2D, p1: Point2D, c2: Point2D, p2: Point2D) -> Optional[Point2D]:
    """The point where circle (c1, |c1p1|) touches circle (c2, |c2p2|).

    Đợt 8 / 4I — the missing primitive behind the classic figure this đợt was
    reported on: three arcs inscribed in a right triangle, each pair tangent.
    The solver had no way to express "the two arcs touch here", so the model's
    numeric guess (Q = 2.4, 1.8 in the report; the exact answer is 1.6, 1.8)
    was published unchanged and the arcs visibly missed each other.

    Both the externally tangent case (d = r1 + r2) and the internally tangent
    case (d = |r1 - r2|) put the contact point on the line of centres at
    distance r1 from c1, so one formula covers both.
    """
    r1 = math.dist(c1, p1)
    r2 = math.dist(c2, p2)
    d = math.dist(c1, c2)
    if d < 1e-9:
        return None
    # Only trust a tangency the radii actually support: an unrelated pair of
    # circles must not be silently "made" tangent, which would move the point
    # off both of them.
    error = min(abs(d - (r1 + r2)), abs(d - abs(r1 - r2)))
    if error > max(1e-6, 0.02 * max(r1, r2, 1.0)):
        logger.debug("[ConstructionSolver] circles are %.4f apart from being tangent "
                     "(r1=%.4f r2=%.4f d=%.4f) — leaving the raw coordinates alone.",
                     error, r1, r2, d)
        return None
    t = r1 / d
    return (round(c1[0] + t * (c2[0] - c1[0]), 4),
            round(c1[1] + t * (c2[1] - c1[1]), 4))


def _arc_midpoint(center: Point2D, p_start: Point2D, p_end: Point2D,
                  extra: Dict[str, Any]) -> Point2D:
    """Midpoint of the arc from p_start to p_end on the circle through them."""
    return _point_on_arc(center, p_start, p_end, {"arc": extra.get("arc", "minor"), "t": 0.5})


def _excenter(a: Point2D, b: Point2D, c: Point2D, vertex: str = "") -> Optional[Point2D]:
    """Centre of the excircle opposite the named vertex (A/B/C, default third)."""
    sides = {
        "A": math.dist(b, c),
        "B": math.dist(a, c),
        "C": math.dist(a, b),
    }
    pts = {"A": a, "B": b, "C": c}
    name = vertex if vertex in pts else "C"
    sa, sb, sc = sides["A"], sides["B"], sides["C"]
    sign = {"A": (-sa, sb, sc), "B": (sa, -sb, sc), "C": (sa, sb, -sc)}[name]
    denom = sign[0] + sign[1] + sign[2]
    if abs(denom) < 1e-9:
        return None
    return (round((sign[0] * a[0] + sign[1] * b[0] + sign[2] * c[0]) / denom, 4),
            round((sign[0] * a[1] + sign[1] * b[1] + sign[2] * c[1]) / denom, 4))


def _reflection(p: Point2D, l1: Point2D, l2: Point2D) -> Point2D:
    foot = _foot(p, l1, l2)
    return (round(2*foot[0] - p[0], 4), round(2*foot[1] - p[1], 4))


def _ratio_point(p: Point2D, q: Point2D, t: float) -> Point2D:
    return (round(p[0] + t*(q[0]-p[0]), 4), round(p[1] + t*(q[1]-p[1]), 4))


def _homothety(p: Point2D, center: Point2D, k: float) -> Point2D:
    """Dilates point p from center by scale factor k: p' = center + k*(p - center)."""
    return (round(center[0] + k * (p[0] - center[0]), 4),
            round(center[1] + k * (p[1] - center[1]), 4))


def _rotation(p: Point2D, center: Point2D, angle_deg: float) -> Point2D:
    """Rotates point p around center by angle_deg degrees counter-clockwise."""
    rad = math.radians(angle_deg)
    cos_t, sin_t = math.cos(rad), math.sin(rad)
    dx, dy = p[0] - center[0], p[1] - center[1]
    return (round(center[0] + dx * cos_t - dy * sin_t, 4),
            round(center[1] + dx * sin_t + dy * cos_t, 4))


def _inversion(p: Point2D, center: Point2D, r: float) -> Optional[Point2D]:
    """Inversion of point p across circle (center, r): |CP| * |CP'| = r^2."""
    dx, dy = p[0] - center[0], p[1] - center[1]
    d2 = dx * dx + dy * dy
    if d2 < 1e-12:
        return None
    scale = (r * r) / d2
    return (round(center[0] + scale * dx, 4),
            round(center[1] + scale * dy, 4))


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
    """Every point object in the payload, keyed by id.

    Đợt 8 / 4I: driven by mathviz_contract's generic walk, not by a literal
    four-kind tuple. With the old tuple, the points of an `arc`, `sector`,
    `angle`, `polyline`, `ellipse` or `region` layer were invisible to this
    solver — so an `arc`'s endpoints kept the model's guess while the circles
    they should touch moved to their exact solved position.

    The FIRST declaration of an id wins. The same id is legitimately declared more
    than once (the prompt asks for a `points` layer AND every layer that references
    the point also inlines its coordinates), and the `points` layer — the one that
    carries the visible badge — is authoritative; preferring a later inline copy
    would leave the badge stale. `_write_solved_point` then updates every copy, so
    the choices here and there can never disagree.
    """
    refs: Dict[str, Dict[str, float]] = {}
    for lay in viz.get("layers", []) or []:
        for _, point in mathviz_contract.iter_point_dicts(lay):
            pid = point.get("id") or point.get("name")
            if isinstance(pid, str) and pid.strip():
                refs.setdefault(pid.strip(), point)
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
        if ctype in ("circle_circle_tangency", "tangency", "tangent_point") and len(of_coords) >= 4:
            return _circle_circle_tangency(of_coords[0], of_coords[1], of_coords[2], of_coords[3])
        if ctype == "arc_midpoint" and len(of_coords) >= 3:
            return _arc_midpoint(of_coords[0], of_coords[1], of_coords[2], extra)
        if ctype == "excenter" and len(of_coords) >= 3:
            return _excenter(of_coords[0], of_coords[1], of_coords[2],
                             str(extra.get("vertex") or "").strip().upper())
        if ctype in ("homothety", "dilation") and len(of_coords) >= 2:
            k_val = float(extra.get("k", extra.get("ratio", 1.0)))
            return _homothety(of_coords[0], of_coords[1], k_val)
        if ctype == "rotation" and len(of_coords) >= 2:
            angle_val = float(extra.get("angle", extra.get("deg", 0.0)))
            return _rotation(of_coords[0], of_coords[1], angle_val)
        if ctype == "inversion" and len(of_coords) >= 2:
            r_val = float(extra.get("r", extra.get("radius", 1.0)))
            return _inversion(of_coords[0], of_coords[1], r_val)
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


def _radius_from_circle(viz: Dict[str, Any], coords: Dict[str, Point2D],
                        center_id: str, exclude_ids: Iterable[str] = ()) -> Optional[float]:
    """Radius of the circle/arc centred at ``center_id``, from its own layers.

    Đợt 8 / 4I: a sentence like "hai cung tiếp xúc nhau tại Q" names the two
    CENTRES and the contact point, not the radii. The radii are usually already in
    the diagram (each arc declares a ``from`` point), so they are read back from
    there instead of being guessed.

    ``exclude_ids`` exists for the self-reference case: an arc whose only
    radius-defining point IS the tangency point being solved would otherwise imply
    a radius from its own guess (Q=(2.4, 1.8) implies r=2.683 for the arc at B),
    which is exactly the circular reasoning that used to make the honest tangency
    test refuse to move anything. Callers pass the still-pending point ids.
    """
    excluded = {str(x).strip() for x in exclude_ids}
    for lay in viz.get("layers", []) or []:
        if not isinstance(lay, dict):
            continue
        kind = mathviz_contract.canonical_kind(lay.get("kind"))
        if kind not in ("circle", "arc", "sector", "region", "ellipse"):
            continue
        center = lay.get("center")
        cid = center.get("id") if isinstance(center, dict) else center
        if not isinstance(cid, str) or cid.strip() != center_id:
            continue
        # 1. An explicit numeric radius is the most direct statement of all.
        for key in ("r", "radius"):
            value = lay.get(key)
            if isinstance(value, (int, float)) and not isinstance(value, bool) and value > 1e-9:
                return float(value)
        # 2. A point the circle passes through (arc endpoints are on the circle,
        #    so any non-excluded one gives the same, correct radius).
        for key in ("from", "radius_point", "through", "to"):
            ref = lay.get(key)
            rid = ref.get("id") if isinstance(ref, dict) else ref
            if isinstance(rid, str) and rid.strip() in coords and rid.strip() not in excluded:
                return math.dist(coords[center_id], coords[rid.strip()])
            if isinstance(ref, dict) and isinstance(ref.get("x"), (int, float)) \
                    and isinstance(ref.get("y"), (int, float)) and rid not in excluded:
                dist = math.dist(coords[center_id], (float(ref["x"]), float(ref["y"])))
                if dist > 1e-9:
                    return dist
        for key in ("through_3pts", "points", "path", "data"):
            items = lay.get(key)
            if not isinstance(items, list):
                continue
            for item in items:
                rid = item.get("id") if isinstance(item, dict) else item
                if not (isinstance(rid, str) and rid.strip() in coords):
                    continue
                if rid.strip() in excluded:
                    continue
                dist = math.dist(coords[center_id], coords[rid.strip()])
                if dist > 1e-9:
                    return dist
    return None


def _tangency_from_one_radius(known: Point2D, other: Point2D, radius: float) -> Optional[Point2D]:
    """Contact point of two tangent circles when ONE radius is known.

    Mathematically exact, and worth spelling out because it looked like a dead end:
    for externally tangent circles the touch point is r_A from centre A and r_B from
    centre B, along the line of centres; for internally tangent circles it is r_A
    from A and r_B from B as well (same line, same distance from A). So knowing
    EITHER radius pins the point down completely — no second radius needed.
    The other arc's radius then follows from the point (it is drawn through it),
    which is what makes the figure genuinely tangent instead of merely reported.
    """
    d = math.dist(known, other)
    if d < 1e-9 or radius <= 1e-9:
        return None
    t = radius / d
    return (round(known[0] + t * (other[0] - known[0]), 4),
            round(known[1] + t * (other[1] - known[1]), 4))


def _project_between(guess: Point2D, a: Point2D, b: Point2D) -> Point2D:
    """Closest point to ``guess`` on segment AB.

    The last resort for a tangency with NO derivable radius: it cannot be pinned
    down exactly (the figure is underdetermined), but the contact point of two
    tangent circles is always ON the line of centres, and it always lies between
    them. Enforcing both is still strictly better than publishing the model's
    unconstrained guess, and the caller records it as an approximation so the
    student is told which property is guaranteed and which is not.
    """
    dx, dy = b[0] - a[0], b[1] - a[1]
    denom = dx * dx + dy * dy
    if denom < 1e-12:
        return a
    t = ((guess[0] - a[0]) * dx + (guess[1] - a[1]) * dy) / denom
    t = min(1.0, max(0.0, t))
    return (round(a[0] + t * dx, 4), round(a[1] + t * dy, 4))


def _write_solved_point(data: Dict[str, Any], refs: Dict[str, Dict[str, float]],
                        coords: Dict[str, Point2D], pid: str, solved: Point2D) -> None:
    """Write one solved point back into EVERY place that declares it.

    Đợt 8 / 4I: updating only one copy is a real defect, not a nitpick. A payload
    legitimately declares the same id twice — the `points` layer carries the visible
    badge, and each `line`/`arc`/`region` that uses the point inlines its
    coordinates as well. Writing one and leaving the other produced a figure whose
    dot sat at the old guess while the arc endpoint had moved: exactly the
    "arc no longer touches the circle" symptom, from a different cause.
    """
    coords[pid] = solved
    updated = False
    for lay in data.get("layers", []) or []:
        for _, point in mathviz_contract.iter_point_dicts(lay):
            point_id = point.get("id") or point.get("name")
            if isinstance(point_id, str) and point_id.strip() == pid:
                point["x"], point["y"] = solved
                updated = True
    if updated:
        # Keep the refs view in step with what was just written.
        if pid in refs:
            refs[pid]["x"], refs[pid]["y"] = solved
        return
    # Point not declared anywhere yet: give it a home in a "points" layer.
    points_layer = None
    for lay in data.get("layers", []):
        if isinstance(lay, dict) and lay.get("kind") == "points":
            points_layer = lay
            break
    if points_layer is None:
        points_layer = {"kind": "points", "data": []}
        data.setdefault("layers", []).append(points_layer)
    new_pt = {"id": pid, "x": solved[0], "y": solved[1]}
    points_layer.setdefault("data", []).append(new_pt)
    refs[pid] = new_pt


def _mutual_tangency_triple(pending_centres: Dict[str, Tuple[str, str]]) -> Optional[List[str]]:
    """The three centres, when the pending tangencies form a complete triple.

    A complete triple is three tangency declarations covering all three pairs of
    three distinct centres (A-B, A-C, B-C) — the "ba cung nội tiếp" figure. Only
    then does the side-length system below have a unique solution.
    """
    pairs = set()
    centres = set()
    for first, second in pending_centres.values():
        if not first or not second or first == second:
            return None
        pairs.add(frozenset((first, second)))
        centres.update((first, second))
    if len(pairs) != 3 or len(centres) != 3:
        return None
    return sorted(centres)


def _radii_from_triangle(coords: Dict[str, Point2D],
                         centres: List[str]) -> Optional[Dict[str, float]]:
    """Radii of three mutually tangent circles from the triangle's side lengths.

    Đợt 8 / 4I — why the side lengths, and not the declared `from` points: in the
    reported figure each arc declares its contact point as its own ``from``, and
    that is the very value being solved. Reading the radius off it is
    self-referential — the guessed Q=(2.4, 1.8) implies r=2.683, and the honest
    tangency test then refuses to move anything and the arcs keep missing.

    The triangle breaks the loop. For three mutually tangent circles centred at
    A, B, C:  r_A + r_B = AB, r_A + r_C = AC, r_B + r_C = BC, hence
    r_A = (AB + AC - BC)/2 and cyclically. For the 3-4-5 triangle that is
    r = 1, 2, 3, which puts Q exactly at (1.6, 1.8).
    """
    if len(centres) != 3 or not all(c in coords for c in centres):
        return None
    a, b, c = centres
    ab = math.dist(coords[a], coords[b])
    ac = math.dist(coords[a], coords[c])
    bc = math.dist(coords[b], coords[c])
    radii = {a: (ab + ac - bc) / 2.0, b: (ab + bc - ac) / 2.0, c: (ac + bc - ab) / 2.0}
    if any(r <= 1e-9 for r in radii.values()):
        return None
    return radii


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

    # ── Mutually tangent triple pre-pass (đợt 8 / 4I) ────────────────────────
    # Three arcs inside a triangle whose contact points are declared as
    # "circle_circle_tangency between {A,B}, {A,C}, {B,C}": each arc names its own
    # contact point as its `from`, so the radii cannot be read off the diagram —
    # that is the value being solved. The side-length system is solved FIRST and
    # the radii are then exact, so this pre-pass replaces the whole guess-and-test
    # loop for that figure (the classic "ba cung nội tiếp" problem).
    _tangency_types = ("circle_circle_tangency", "tangency", "tangent_point")
    _pending_tangencies = {
        pid: tuple(str(oid).strip() for oid in (c.get("of") or []))
        for pid, c in pending.items()
        if c.get("type") in _tangency_types and len(c.get("of") or []) == 2
    }
    _triple = _mutual_tangency_triple(_pending_tangencies)
    if _triple:
        _radii = _radii_from_triangle(coords, _triple)
        if _radii:
            for pid, pair in list(_pending_tangencies.items()):
                c1, c2 = pair
                if c1 not in _radii or c2 not in _radii:
                    continue
                solved = _circle_circle_tangency(
                    coords[c1], (coords[c1][0] + _radii[c1], coords[c1][1]),
                    coords[c2], (coords[c2][0] + _radii[c2], coords[c2][1]))
                if solved is not None:
                    _write_solved_point(data, refs, coords, pid, solved)
                    pending.pop(pid, None)
            if _triple:
                logger.info("[ConstructionSolver] mutually tangent triple %s solved from the "
                            "triangle's side lengths: radii=%s", _triple,
                            {k: round(v, 4) for k, v in _radii.items()})

    progressed = True
    approximate: List[str] = []
    while pending and progressed:
        progressed = False
        for pid, c in list(pending.items()):
            of_ids = c.get("of", [])
            solved = None

            # "hai cung tiếp xúc nhau tại Q" names only the two CENTRES (đợt
            # 8 / 4I). Radii are read from the diagram's own arcs/circles, so the
            # contact point lands exactly on both of them instead of at the
            # model's guess.
            if c.get("type") in ("circle_circle_tangency", "tangency", "tangent_point") \
                    and len(of_ids) == 2 \
                    and all(str(oid).strip() in coords for oid in of_ids):
                c1, c2 = (str(of_ids[0]).strip(), str(of_ids[1]).strip())
                # Points still queued are excluded from radius detection: using
                # one would derive the radius from the very guess being solved.
                _pending_ids = set(pending.keys())
                r1 = _radius_from_circle(data, coords, c1, exclude_ids=_pending_ids)
                r2 = _radius_from_circle(data, coords, c2, exclude_ids=_pending_ids)
                if r1 and r2:
                    solved = _circle_circle_tangency(
                        coords[c1], (coords[c1][0] + r1, coords[c1][1]),
                        coords[c2], (coords[c2][0] + r2, coords[c2][1]))
                elif r1 or r2:
                    # ONE radius is enough: the touch point sits r away from its own
                    # centre, on the line of centres, either way. This is the case a
                    # single tangency used to leave unsolved.
                    solved = (_tangency_from_one_radius(coords[c1], coords[c2], r1)
                              if r1 else _tangency_from_one_radius(coords[c2], coords[c1], r2))
                    if solved is not None:
                        logger.info("[ConstructionSolver] tangency %s pinned by the single "
                                    "known radius r=%s.", pid, round(r1 or r2, 4))
                if solved is None and coords.get(pid) is not None \
                        and c.get("type") in ("circle_circle_tangency", "tangency", "tangent_point"):
                    # Underdetermined: no radius anywhere. Keep it on the segment
                    # between the centres (a real property of tangency) and say so.
                    solved = _project_between(coords[pid], coords[c1], coords[c2])
                    approximate.append(pid)
                    logger.info("[ConstructionSolver] tangency %s has no derivable radius — "
                                "placed collinear between the centres (approximate).", pid)
                    # The generic solver has no primitive for this type, and its
                    # `return None` would overwrite the placement just made — an
                    # empty "unknown construction type" must not erase a real
                    # geometric property. Skip straight to writing the point.
                    _write_solved_point(data, refs, coords, pid, solved)
                    del pending[pid]
                    progressed = True
                    continue

            if solved is None:
                if not all(oid in coords for oid in of_ids):
                    continue
                solved = _solve_one(c["type"], [coords[oid] for oid in of_ids], c)
            if solved is not None:
                _write_solved_point(data, refs, coords, pid, solved)
                del pending[pid]
                progressed = True

    unsolved = list(pending.keys())
    if unsolved:
        logger.info(f"[ConstructionSolver] Could not resolve: {unsolved} "
                    f"(unknown dependency, cycle, or degenerate case) — left as originally given.")
    # Reported separately from `unsolved`: these points WERE improved (an exact
    # relation or at least the collinearity that tangency guarantees), they just
    # are not exactly determined. main.py copies this into `_render` so the UI can
    # say which one it was instead of implying the figure is exact.
    if approximate:
        data["_constructions_approximate"] = approximate
    
    # Cascade updates to all line and circle layers
    _cascade_update_layers(data, coords)

    return data, unsolved
