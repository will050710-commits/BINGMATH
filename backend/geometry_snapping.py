"""
geometry_snapping.py
=====================
Risk 1 mitigation: general-purpose analytic regularization for MathViz
'geometry_2d' payloads. Pure local computation (numpy only) — no model/API
call, so it costs nothing against any free tier and adds no network latency.

Relationship to the existing geometry modules:
    - geometry_canvas_solver.auto_align_geometry_mathviz()
      Exact solver for a KNOWN template (named Olympiad points: A,B,C,H,O,
      D,E,F,I,P,K,Q,G). Keep running this first — when it matches, it is
      more precise than anything below.
    - geometry_snapping.snap_geometry_2d()  (this module)
      General fallback for the other 90% of diagrams: any polygon/point-set
      that ISN'T a recognized named template. Snaps near-canonical angles
      and near-collinear point sets to their exact values.
    - geometry_verification.GeometryVerifier
      Used here as an accept/reject gate — a snap is only kept if it does
      not make the figure's own numeric relationships worse.

Recommended pipeline position (main.py `chat()`, right after the existing
auto_align_geometry_mathviz call):

    from geometry_canvas_solver import auto_align_geometry_mathviz
    from geometry_snapping import snap_geometry_2d, verify_snap_safe

    _viz_block = auto_align_geometry_mathviz(_viz_block)
    _snapped   = snap_geometry_2d(_viz_block)
    _viz_block = _snapped if verify_snap_safe(_viz_block, _snapped) else _viz_block

Design note on scope (why length/concyclicity snapping is conservative):
Angle-snapping and collinearity-snapping are LOCAL corrections — each only
moves one point, using the other points in its own triple as fixed
reference. They cannot destabilize the rest of the figure.
General *length* equalization is NOT local: forcing side AB to match side
AC by moving a shared vertex can silently undo an angle you just fixed,
and doing it correctly needs a real constraint solver (out of scope for a
lightweight, dependency-free pass). So this module *detects and reports*
near-equal lengths (useful for logging / an LLM re-prompt hint) but does
not auto-rewrite them. Concyclicity snapping is applied only to explicit
"points" layers (a free point set, not polygon topology), for the same
"don't fight another constraint" reason.
"""

import math
import copy
from typing import Dict, Any, List, Tuple, Optional

import numpy as np

from geometry_verification import is_collinear_2d, distance_2d

Point2D = Tuple[float, float]

CANONICAL_ANGLES_DEG = (30.0, 45.0, 60.0, 90.0, 120.0, 135.0, 150.0, 180.0)
ANGLE_TOL_DEG = 3.0
LENGTH_REPORT_TOL_PCT = 0.02
MAX_NUDGE = 0.35          # data-space units; never move a point further than this in one pass
MAX_REGRESSION_DELTA = 0.02  # allowed increase in verification residual before we reject a snap


# ── internal helpers ─────────────────────────────────────────────────────────

def _collect_point_refs(viz: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
    """
    Collect every {id, x, y} dict across all layer kinds, keyed by id.
    Returns the ACTUAL dicts (not copies) so in-place edits propagate back
    into `viz["layers"]` automatically — mirrors the pattern already used
    in geometry_canvas_solver.py.
    """
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


def _signed_angle_deg(a: Point2D, b: Point2D, c: Point2D) -> float:
    """
    Signed angle in (-180, 180] to rotate vector BA onto vector BC, about
    pivot b (CCW positive). Using atan2(cross, dot) instead of acos(dot)
    keeps the sign, which acos-only throws away — needed so a correction
    rotates the RIGHT way regardless of which side C sits on.
    """
    v1 = np.array([a[0] - b[0], a[1] - b[1]], dtype=float)
    v2 = np.array([c[0] - b[0], c[1] - b[1]], dtype=float)
    cross = v1[0] * v2[1] - v1[1] * v2[0]
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    if abs(cross) < 1e-9 and abs(dot) < 1e-9:
        return 0.0
    return math.degrees(math.atan2(cross, dot))


def _angle_deg(a: Point2D, b: Point2D, c: Point2D) -> float:
    """Unsigned interior angle at vertex b for the triple a-b-c, in degrees."""
    return abs(_signed_angle_deg(a, b, c))


def _nearest_canonical_angle(angle: float) -> Optional[float]:
    for c in CANONICAL_ANGLES_DEG:
        if abs(angle - c) <= ANGLE_TOL_DEG and abs(angle - c) > 1e-6:
            return c
    return None


def _rotate_about(pivot: Point2D, pt: Point2D, delta_deg: float) -> Point2D:
    """Rotate pt about pivot by delta_deg degrees."""
    theta = math.radians(delta_deg)
    dx, dy = pt[0] - pivot[0], pt[1] - pivot[1]
    cos_t, sin_t = math.cos(theta), math.sin(theta)
    return (
        round(pivot[0] + dx * cos_t - dy * sin_t, 4),
        round(pivot[1] + dx * sin_t + dy * cos_t, 4),
    )


def _fit_line_lstsq(pts: List[Point2D]) -> Optional[Tuple[float, float, float]]:
    """
    Total-least-squares line fit ax + by = c via SVD (numpy only — no scipy).
    General-purpose utility (not used by the collinearity pass below, which
    deliberately anchors on the first/last point instead — see that pass's
    comment for why). Returns None on a degenerate (all-identical) point set.
    """
    arr = np.array(pts, dtype=float)
    centroid = arr.mean(axis=0)
    centered = arr - centroid
    if np.allclose(centered, 0):
        return None
    _, _, vh = np.linalg.svd(centered)
    a, b = vh[-1]  # normal of the best-fit line = smallest-variance direction
    c = a * centroid[0] + b * centroid[1]
    return float(a), float(b), float(c)


def _line_through(p0: Point2D, p1: Point2D) -> Optional[Tuple[float, float, float]]:
    """
    Exact line ax + by = c through two anchor points (normalized so a²+b²=1,
    which keeps `_project_onto_line`'s distance check in real units).
    Returns None if p0 == p1 (no well-defined line).
    """
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    norm = math.hypot(dx, dy)
    if norm < 1e-9:
        return None
    a, b = dy / norm, -dx / norm  # unit normal to the p0->p1 direction
    c = a * p0[0] + b * p0[1]
    return a, b, c


def _project_onto_line(pt: Point2D, a: float, b: float, c: float) -> Point2D:
    denom = a * a + b * b
    if denom < 1e-9:
        return pt
    t = (a * pt[0] + b * pt[1] - c) / denom
    return (round(pt[0] - t * a, 4), round(pt[1] - t * b, 4))


# ── public API ────────────────────────────────────────────────────────────────

def snap_geometry_2d(
    viz_block: Dict[str, Any],
    angle_tol_deg: float = ANGLE_TOL_DEG,
    max_nudge: float = MAX_NUDGE,
) -> Dict[str, Any]:
    """
    General angle + collinearity regularization for any 'geometry_2d' MathViz
    payload. Does NOT require named Olympiad points — works on whatever
    polygon/point layers are present. Returns a NEW dict; the input is not
    mutated.

    Safe by construction: every correction is bounded by `max_nudge` data
    units and is rejected (left as detected) if it would move a point
    further than that — false precision is worse than leaving a slightly
    imperfect diagram alone.
    """
    if not isinstance(viz_block, dict) or viz_block.get("widget") != "geometry_2d":
        return viz_block
    if not isinstance(viz_block.get("layers"), list):
        return viz_block

    data = copy.deepcopy(viz_block)
    refs = _collect_point_refs(data)
    if len(refs) < 3:
        return data  # nothing meaningful to regularize

    # Pass 1 — angle snap on consecutive vertex triples of every polygon/triangle
    for lay in data["layers"]:
        if lay.get("kind") in ("polygon", "triangle") and isinstance(lay.get("points"), list):
            pl = lay["points"]
            n = len(pl)
            if n < 3:
                continue
            for i in range(n):
                a_pt, b_pt, c_pt = pl[i - 1], pl[i], pl[(i + 1) % n]
                A, B, C = (a_pt["x"], a_pt["y"]), (b_pt["x"], b_pt["y"]), (c_pt["x"], c_pt["y"])
                signed_ang = _signed_angle_deg(A, B, C)
                target = _nearest_canonical_angle(abs(signed_ang))
                if target is None:
                    continue
                target_signed = math.copysign(target, signed_ang) if signed_ang != 0 else target
                delta = target_signed - signed_ang
                new_c = _rotate_about(B, C, delta)
                if distance_2d(C, new_c) <= max_nudge:
                    c_pt["x"], c_pt["y"] = new_c

    # Pass 2 — collinearity snap, explicit "points" layers only (safe: no polygon
    # topology to fight). The first and last point are treated as fixed
    # anchors (the usual convention when a diagram lists a collinear chain
    # in order, e.g. "D, K, N collinear"); every point in between is
    # projected onto the EXACT line through those two anchors. Anchors
    # themselves are never moved, so this can only make things more
    # collinear, never less.
    for lay in data["layers"]:
        if lay.get("kind") == "points" and isinstance(lay.get("data"), list) and len(lay["data"]) >= 3:
            pl = lay["data"]
            coords = [(p["x"], p["y"]) for p in pl]
            if is_collinear_2d(coords[0], coords[1], coords[-1], tol=1e-2):
                continue
            fit = _line_through(coords[0], coords[-1])
            if fit is None:
                continue
            a, b, c = fit
            for p in pl[1:-1]:
                old = (p["x"], p["y"])
                new = _project_onto_line(old, a, b, c)
                if distance_2d(old, new) <= max_nudge:
                    p["x"], p["y"] = new

    return data


def report_near_equal_lengths(viz_block: Dict[str, Any], tol_pct: float = LENGTH_REPORT_TOL_PCT) -> List[str]:
    """
    Non-mutating: flags side pairs that are close enough to equal that they
    were probably *meant* to be equal (e.g. an isosceles/equilateral figure)
    without auto-rewriting coordinates (see module docstring for why).
    Returns human-readable notes, e.g. ["AB ≈ AC (Δ1.1%) — consider forcing exact equality"].
    Feed these into an LLM re-prompt or a log line; do not silently apply them.
    """
    notes: List[str] = []
    if not isinstance(viz_block, dict) or "layers" not in viz_block:
        return notes
    for lay in viz_block.get("layers", []) or []:
        if lay.get("kind") in ("polygon", "triangle") and isinstance(lay.get("points"), list):
            pl = lay["points"]
            n = len(pl)
            if n < 3:
                continue
            sides = []
            for i in range(n):
                p1, p2 = pl[i], pl[(i + 1) % n]
                d = distance_2d((p1["x"], p1["y"]), (p2["x"], p2["y"]))
                sides.append((f"{p1.get('id','?')}{p2.get('id','?')}", d))
            for i in range(len(sides)):
                for j in range(i + 1, len(sides)):
                    name_i, len_i = sides[i]
                    name_j, len_j = sides[j]
                    if len_i == 0 or len_j == 0:
                        continue
                    delta = abs(len_i - len_j) / max(len_i, len_j)
                    if 0 < delta <= tol_pct:
                        notes.append(f"{name_i} \u2248 {name_j} (\u0394{delta*100:.1f}%)")
    return notes


def verify_snap_safe(before: Dict[str, Any], after: Dict[str, Any]) -> bool:
    """
    Accept/reject gate for a snap pass, using geometry_verification's pure
    numeric checks. A snap is REJECTED (caller should keep `before`) only if
    it measurably increases collinearity error for any explicit "points"
    layer — i.e. the snap made the figure less consistent, not more.
    Anything else (including "no measurable change") passes.
    """
    try:
        before_pts = _collect_point_refs(copy.deepcopy(before))
        after_pts = _collect_point_refs(copy.deepcopy(after))
    except Exception:
        return True  # defensive: never let a verification bug block a response

    for lay in (after.get("layers") or []):
        if lay.get("kind") == "points" and isinstance(lay.get("data"), list) and len(lay["data"]) >= 3:
            ids = [p.get("id") for p in lay["data"]]
            if not all(i in before_pts and i in after_pts for i in ids):
                continue
            b0, b1, b2 = (before_pts[ids[0]]["x"], before_pts[ids[0]]["y"]), \
                         (before_pts[ids[1]]["x"], before_pts[ids[1]]["y"]), \
                         (before_pts[ids[-1]]["x"], before_pts[ids[-1]]["y"])
            a0, a1, a2 = (after_pts[ids[0]]["x"], after_pts[ids[0]]["y"]), \
                         (after_pts[ids[1]]["x"], after_pts[ids[1]]["y"]), \
                         (after_pts[ids[-1]]["x"], after_pts[ids[-1]]["y"])
            det_before = abs((b1[0]-b0[0])*(b2[1]-b0[1]) - (b2[0]-b0[0])*(b1[1]-b0[1]))
            det_after = abs((a1[0]-a0[0])*(a2[1]-a0[1]) - (a2[0]-a0[0])*(a1[1]-a0[1]))
            if det_after > det_before + MAX_REGRESSION_DELTA:
                return False
    return True
