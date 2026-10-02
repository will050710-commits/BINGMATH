"""
geometry_analytic_checks.py
===========================
The analytic gate between "the model sent a figure" and "a student sees it".

The existing pipeline already snaps angles (geometry_snapping), resolves
constructions (geometry_construction_solver) and normalises the vocabulary
(mathviz_contract). None of them answers the question THIS module answers:
*do the layers agree with each other?*

    * a polygon whose edges cross themselves (a "bow-tie") draws fine and is
      wrong — the shaded area is nonsense;
    * an `arc`/`sector` whose `from`/`to` points do not lie on the circle
      through its own centre (the classic case: the model moves one point but
      not the other);
    * two layers declaring the SAME point id at two different coordinates —
      every renderer resolves that differently (last layer wins), so the figure
      depends on layer order;
    * an `angle` flagged ``right_angle: true`` whose three points are not a
      right angle at all;
    * a circle whose declared centre is not equidistant from its own
      ``through_3pts``;
    * coordinates that are not finite (NaN / Infinity survive JSON parsing).

Two libraries do the heavy lifting — Shapely (GEOS) for 2D topology and SymPy
for exact second opinions on float noise — but both are OPTIONAL at call time:
with neither installed the dependency-free checks (finite coordinates, point-id
disagreement, arc/right-angle arithmetic) still run, so the request never fails
because of this gate.

Output is a list of records shaped for the UI report:

    {"layer_index": int|None, "code": str, "severity": "error"|"warn",
     "message_vi": str}

main.py merges the list into the payload's ``_render`` report as ``conflicts``;
both geometry_2d engines (SVG + JSXGraph) already render every conflict as a
warning line, so a figure that disagrees with itself SAYS so instead of looking
plausible. Pure functions: the payload is never mutated (repair, if ever
wanted, belongs in a separate pass the caller opts into).
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

import mathviz_contract as mc

try:  # Shapely (GEOS) — 2D topology: validity, self-intersection.
    from shapely.geometry import Polygon as _ShapelyPolygon
    from shapely.validation import explain_validity as _explain_validity
    _HAS_SHAPELY = True
except Exception:  # pragma: no cover - exercised only without the wheel
    _ShapelyPolygon = None
    _explain_validity = None
    _HAS_SHAPELY = False

try:  # SymPy — exact (rational) second opinion so float noise never alarms.
    from sympy import Integer as _Integer, Rational as _Rational
    _HAS_SYMPY = True
except Exception:  # pragma: no cover - sympy is in requirements.txt
    _Integer = _Rational = None
    _HAS_SYMPY = False

_EPS = 1e-9
_COORD_TOL = 1e-6       # same id within this = one point
_REL_TOL = 1e-6         # relative tolerance for cos-style comparisons
_ARC_REL_TOL = 5e-3     # |r1-r2| / max(r) — 0.5 % of the radius
_MAX_CONFLICTS = 12     # the UI chip shows a handful, not a wall


def engines() -> Dict[str, bool]:
    """Which optional engines this process can use (for logging / health)."""
    return {"shapely": _HAS_SHAPELY, "sympy": _HAS_SYMPY}


def _c(index: Optional[int], code: str, severity: str, message_vi: str) -> Dict[str, Any]:
    return {"layer_index": index, "code": code, "severity": severity, "message_vi": message_vi}


def _finite(value: Any) -> bool:
    return (isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(float(value)))


def _pt(node: Any) -> Optional[Tuple[float, float]]:
    if isinstance(node, dict) and _finite(node.get("x")) and _finite(node.get("y")):
        return (float(node["x"]), float(node["y"]))
    return None


def _same(a: Tuple[float, float], b: Tuple[float, float]) -> bool:
    return abs(a[0] - b[0]) <= _COORD_TOL and abs(a[1] - b[1]) <= _COORD_TOL


# ── 1. The declared-point map ────────────────────────────────────────────────

def _collect_declared(viz: Dict[str, Any]):
    """``id -> [distinct coordinates]`` plus every non-finite coordinate found.

    The walk is mathviz_contract.iter_point_dicts — the SAME walk the solvers
    and the renderers use — so this module can never see a different set of
    points than the pipeline does.
    """
    by_id: Dict[str, List[Tuple[float, float]]] = {}
    bad: List[Tuple[int, str, Any, Any]] = []
    for index, layer in enumerate(mc.layers_of(viz)):
        if not isinstance(layer, dict):
            continue
        for _, obj in mc.iter_point_dicts(layer):
            pid = obj.get("id") or obj.get("name")
            if not isinstance(pid, str) or not pid.strip():
                continue
            pid = pid.strip()
            px, py = obj.get("x"), obj.get("y")
            if not (_finite(px) and _finite(py)):
                bad.append((index, pid, px, py))
                continue
            coords = by_id.setdefault(pid, [])
            candidate = (float(px), float(py))
            if not any(_same(candidate, seen) for seen in coords):
                coords.append(candidate)
    return by_id, bad


def _resolve(ref: Any, pointmap: Dict[str, Tuple[float, float]]) -> Optional[Tuple[float, float]]:
    """An inline {x, y}, a bare id, or a point object with an id → coordinates.

    Returns None when the reference cannot be resolved to exactly one point;
    "point not declared" and "id declared twice" are already reported by the
    contract report and by check_geometry_2d, so silence here is correct.
    """
    inline = _pt(ref)
    if inline:
        return inline
    pid = ref if isinstance(ref, str) else (ref.get("id") if isinstance(ref, dict) else None)
    if isinstance(pid, str) and pid.strip():
        return pointmap.get(pid.strip())
    return None


# ── 2. Per-kind checks ───────────────────────────────────────────────────────

def _polygon_points(layer: Dict[str, Any]) -> List[Tuple[float, float]]:
    raw = layer.get("points")
    points: List[Tuple[float, float]] = []
    if isinstance(raw, list):
        for item in raw:
            point = _pt(item)
            if point:
                points.append(point)
    return points


def _exact_area_is_zero(points: List[Tuple[float, float]]) -> Optional[bool]:
    """SymPy exact second opinion (None when sympy is unavailable)."""
    if not _HAS_SYMPY or len(points) < 3:
        return None
    try:
        total = _Integer(0)
        n = len(points)
        for i in range(n):
            x1, y1 = points[i]
            x2, y2 = points[(i + 1) % n]
            total += (_Rational(str(x1)) * _Rational(str(y2))
                      - _Rational(str(x2)) * _Rational(str(y1)))
        return total == 0
    except Exception:
        return None


def _check_polygon(index: int, layer: Dict[str, Any]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    points = _polygon_points(layer)
    if len(points) < 3:
        return out

    deduped: List[Tuple[float, float]] = []
    for point in points:
        if not deduped or not _same(point, deduped[-1]):
            deduped.append(point)
    if len(deduped) >= 3 and _same(deduped[0], deduped[-1]):
        deduped.pop()

    if len(deduped) < 3:
        out.append(_c(index, "polygon_degenerate", "warn",
                      f"Đa giác ở lớp {index} suy biến: các đỉnh trùng nhau, không tạo thành hình."))
        return out

    if _HAS_SHAPELY:
        try:
            shapely_poly = _ShapelyPolygon(deduped)
            if not shapely_poly.is_valid:
                reason = _explain_validity(shapely_poly)
                out.append(_c(index, "polygon_self_intersects", "error",
                              f"Đa giác ở lớp {index} tự cắt (GEOS: {reason}) — "
                              "diện tích tô màu sẽ sai."))
                return out
        except Exception:
            pass

    x_scale = max(abs(x) for x, _ in deduped) or 1.0
    y_scale = max(abs(y) for _, y in deduped) or 1.0
    area2 = abs(sum(
        deduped[i][0] * deduped[(i + 1) % len(deduped)][1]
        - deduped[(i + 1) % len(deduped)][0] * deduped[i][1]
        for i in range(len(deduped))
    ))
    if area2 / 2 <= _EPS * max(x_scale, y_scale) * 10:
        # A tiny float area may just be noise around a genuinely degenerate
        # shape — let exact arithmetic decide before alarming the student.
        exact_zero = _exact_area_is_zero(deduped)
        if exact_zero is not False:
            out.append(_c(index, "polygon_degenerate", "warn",
                          f"Đa giác ở lớp {index} gần như suy biến (diện tích ≈ 0) — "
                          "các đỉnh gần thẳng hàng."))
    return out


def _arc_radii(center: Tuple[float, float],
               start: Tuple[float, float],
               end: Tuple[float, float]) -> Tuple[float, float]:
    return (math.hypot(start[0] - center[0], start[1] - center[1]),
            math.hypot(end[0] - center[0], end[1] - center[1]))


def _arc_conflict(index: int, label: str,
                  center: Optional[Tuple[float, float]],
                  start: Optional[Tuple[float, float]],
                  end: Optional[Tuple[float, float]]) -> List[Dict[str, Any]]:
    if not (center and start and end):
        return []
    r1, r2 = _arc_radii(center, start, end)
    if r1 <= _EPS or r2 <= _EPS:
        return [_c(index, "arc_zero_radius", "warn",
                   f"{label} ở lớp {index} có bán kính ≈ 0 (một đầu trùng tâm).")]
    if abs(r1 - r2) > max(_ARC_REL_TOL * max(r1, r2), 1e-6):
        return [_c(index, "arc_endpoints_off_circle", "warn",
                   f"{label} ở lớp {index}: hai đầu không cùng nằm trên đường tròn tâm đã cho "
                   f"(r₁ ≈ {r1:.2f}, r₂ ≈ {r2:.2f}).")]
    return []


def _check_arc_like(index: int, layer: Dict[str, Any], kind: str,
                    pointmap: Dict[str, Tuple[float, float]]) -> List[Dict[str, Any]]:
    center = _resolve(layer.get("center") if "center" in layer else layer.get("centre"), pointmap)
    start = _resolve(layer.get("from"), pointmap)
    end = _resolve(layer.get("to"), pointmap)
    label = "Cung" if kind == "arc" else "Hình quạt"
    return _arc_conflict(index, label, center, start, end)


def _check_circle(index: int, layer: Dict[str, Any],
                  pointmap: Dict[str, Tuple[float, float]]) -> List[Dict[str, Any]]:
    center = _resolve(layer.get("center") if "center" in layer else layer.get("centre"), pointmap)
    if not center:
        return []
    refs = layer.get("through_3pts") or layer.get("through_pts")
    if not isinstance(refs, list):
        return []
    distances: List[float] = []
    for ref in refs[:3]:
        point = _resolve(ref, pointmap)
        if point:
            distances.append(math.hypot(point[0] - center[0], point[1] - center[1]))
    if len(distances) < 3:
        return []
    spread = max(distances) - min(distances)
    if spread > max(_ARC_REL_TOL * max(distances), 1e-6):
        shown = ", ".join(f"{d:.2f}" for d in distances)
        return [_c(index, "circle_center_not_equidistant", "warn",
                   f"Đường tròn ở lớp {index}: tâm không cách đều 3 điểm đã khai báo "
                   f"(khoảng cách ≈ {shown}).")]
    return []


def _exact_right_angle(A: Tuple[float, float], B: Tuple[float, float],
                       C: Tuple[float, float]) -> Optional[bool]:
    """SymPy exact verdict on A-B-C (None when sympy is unavailable)."""
    if not _HAS_SYMPY:
        return None
    try:
        ax, ay = _Rational(str(A[0])), _Rational(str(A[1]))
        bx, by = _Rational(str(B[0])), _Rational(str(B[1]))
        cx, cy = _Rational(str(C[0])), _Rational(str(C[1]))
        dot = (ax - bx) * (cx - bx) + (ay - by) * (cy - by)
        return dot == 0
    except Exception:
        return None


def _check_angle(index: int, layer: Dict[str, Any],
                 pointmap: Dict[str, Tuple[float, float]]) -> List[Dict[str, Any]]:
    if not layer.get("right_angle"):
        return []
    refs = layer.get("points")
    if not isinstance(refs, list) or len(refs) < 3:
        return []
    A = _resolve(refs[0], pointmap)
    B = _resolve(refs[1], pointmap)   # the vertex sits in the middle
    C = _resolve(refs[2], pointmap)
    if not (A and B and C):
        return []
    ux, uy = A[0] - B[0], A[1] - B[1]
    vx, vy = C[0] - B[0], C[1] - B[1]
    nu = math.hypot(ux, uy)
    nv = math.hypot(vx, vy)
    if nu <= _EPS or nv <= _EPS:
        return [_c(index, "angle_degenerate", "warn",
                   f"Góc ở lớp {index} suy biến: đỉnh trùng một trong hai điểm còn lại.")]
    cos_value = (ux * vx + uy * vy) / (nu * nv)
    if abs(cos_value) <= _REL_TOL:
        return []
    # Before alarming: is the mismatch real at exact (rational) precision?
    if _exact_right_angle(A, B, C) is True:
        return []
    names = [str(refs[0]), str(refs[1]), str(refs[2])]
    return [_c(index, "right_angle_mismatch", "warn",
               f"Góc ở lớp {index} được khai báo vuông nhưng ba điểm {names[0]}, {names[1]}, "
               f"{names[2]} không tạo góc vuông (cos ≈ {cos_value:.4f}).")]


def _check_region(index: int, layer: Dict[str, Any],
                  pointmap: Dict[str, Tuple[float, float]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    items = layer.get("path")
    if not isinstance(items, list):
        return out
    for item in items:
        if not isinstance(item, dict):
            continue
        item_kind = mc.canonical_kind(item.get("type") or item.get("kind"))
        if item_kind not in ("arc", "sector"):
            continue
        center = _resolve(item.get("center") if "center" in item else item.get("centre"), pointmap)
        start = _resolve(item.get("from"), pointmap)
        end = _resolve(item.get("to"), pointmap)
        out.extend(_arc_conflict(index, "Cung trong vùng", center, start, end))
    return out


# ── 3. Public entry ──────────────────────────────────────────────────────────

def check_geometry_2d(viz: Any) -> List[Dict[str, Any]]:
    """Every analytic conflict in a geometry_2d payload, UI-ready.

    Empty list = the layers agree with themselves. Never raises on malformed
    input: a layer that is not a dict, an unknown kind or an unresolvable
    reference simply produces no conflict here (the contract report already
    speaks about those).
    """
    if (not isinstance(viz, dict) or viz.get("widget") != "geometry_2d"
            or not isinstance(viz.get("layers"), list)):
        return []

    conflicts: List[Dict[str, Any]] = []
    by_id, bad = _collect_declared(viz)

    for index, pid, px, py in bad:
        conflicts.append(_c(index, "non_finite_coordinates", "error",
                            f"Toạ độ của điểm {pid} ở lớp {index} không hữu hạn "
                            f"(x={px!r}, y={py!r})."))

    for pid, coords in by_id.items():
        if len(coords) > 1:
            shown = " và ".join(f"({x:.2f}, {y:.2f})" for x, y in coords)
            conflicts.append(_c(None, "point_id_conflict", "error",
                                f"Điểm {pid} được khai báo ở {len(coords)} vị trí khác nhau "
                                f"{shown} — mỗi engine có thể vẽ một kiểu tuỳ thứ tự lớp."))

    pointmap = {pid: coords[0] for pid, coords in by_id.items() if len(coords) == 1}

    for index, layer in enumerate(mc.layers_of(viz)):
        if not isinstance(layer, dict):
            continue
        kind = mc.canonical_kind(layer.get("kind"))
        if kind in ("polygon", "triangle"):
            conflicts.extend(_check_polygon(index, layer))
        elif kind in ("arc", "sector"):
            conflicts.extend(_check_arc_like(index, layer, kind, pointmap))
        elif kind == "circle":
            conflicts.extend(_check_circle(index, layer, pointmap))
        elif kind == "angle":
            conflicts.extend(_check_angle(index, layer, pointmap))
        elif kind == "region":
            conflicts.extend(_check_region(index, layer, pointmap))

    return conflicts[:_MAX_CONFLICTS]
