"""
geometry_viewbox_normalizer.py
==============================
Prevents geometry diagrams from clipping or overflowing beyond the visible MathViz 2D canvas.

In MathVizGeometry2D, the default visible area spans roughly [-5, 5] in both X and Y.
When complex construction diagrams have distant intersection points (e.g. Cevian/Euler
lines intersecting at x=-15, y=-10), points get cut off by the SVG boundary.

This module detects bounding box overflows and applies uniform scaling and centering
so that the entire geometric figure fits cleanly within [-4.2, 4.2] without distorting
proportions or angles.
"""

import copy
import math
import os
import sys
from typing import Dict, Any, List, Tuple, Optional

# Đợt 8 / 4I: the shared layer-kind vocabulary. Uses it for the generic point
# walk, so an arc/region/polyline/angle's own points are inside the viewbox too.
try:
    import mathviz_contract
except ImportError:  # pragma: no cover — only when CWD is not backend/
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import mathviz_contract

SAFE_BOUND = 4.0
TRIGGER_BOUND = 5.2
TRIGGER_SPAN = 9.5


def _collect_bounds(viz_data: Dict[str, Any]) -> Optional[Tuple[float, float, float, float]]:
    """
    Computes (min_x, max_x, min_y, max_y) enclosing all geometric elements:
    polygons, points, line endpoints, circle perimeters, and ellipses.

    Đợt 8 / 4I: point discovery goes through mathviz_contract's generic walk, so
    an `arc`'s center/from/to, a `region`'s path items, a `polyline`'s vertices,
    an `angle`'s named vertices and a `label`'s anchor are all inside the
    bounding box too. Previously they were not: a figure whose far element was an
    arc tip was judged "fits fine" and clipped at the canvas edge.
    """
    xs: List[float] = []
    ys: List[float] = []

    def add_point(node: Any) -> None:
        if isinstance(node, dict) and "x" in node and "y" in node:
            try:
                xs.append(float(node["x"]))
                ys.append(float(node["y"]))
            except (ValueError, TypeError):
                pass

    # Check root points
    for p in (viz_data.get("points") or []):
        add_point(p)

    # Check layers
    for lay in viz_data.get("layers", []) or []:
        kind = lay.get("kind")

        # Every declared point, whatever kind declared it.
        for _, point in mathviz_contract.iter_point_dicts(lay):
            add_point(point)

        if kind == "circle":
            center = lay.get("center")
            r = lay.get("r") if "r" in lay else lay.get("radius")
            if isinstance(center, dict) and "x" in center and "y" in center and r is not None:
                try:
                    cx, cy, cr = float(center["x"]), float(center["y"]), float(r)
                    xs.extend([cx - cr, cx + cr])
                    ys.extend([cy - cr, cy + cr])
                except (ValueError, TypeError):
                    pass
        elif kind == "ellipse":
            center = lay.get("center")
            a = lay.get("a", lay.get("rx", 4))
            b = lay.get("b", lay.get("ry", 2.5))
            if isinstance(center, dict) and "x" in center and "y" in center:
                try:
                    cx, cy, ea, eb = float(center["x"]), float(center["y"]), float(a), float(b)
                    xs.extend([cx - ea, cx + ea])
                    ys.extend([cy - eb, cy + eb])
                except (ValueError, TypeError):
                    pass

    if not xs or not ys:
        return None

    return min(xs), max(xs), min(ys), max(ys)


def normalize_viewbox(viz_data: Dict[str, Any], safe_bound: float = SAFE_BOUND) -> Dict[str, Any]:
    """
    If any geometric element exceeds TRIGGER_BOUND or total span exceeds TRIGGER_SPAN,
    uniformly rescales and centers all coordinates to fit inside [-safe_bound, safe_bound].
    """
    if not isinstance(viz_data, dict) or viz_data.get("widget") != "geometry_2d":
        return viz_data

    bounds = _collect_bounds(viz_data)
    if bounds is None:
        return viz_data

    min_x, max_x, min_y, max_y = bounds
    width = max_x - min_x
    height = max_y - min_y
    span = max(width, height)

    if span < 1e-6:
        return viz_data

    # Check if normalization is needed
    is_overflowing = (
        min_x < -TRIGGER_BOUND
        or max_x > TRIGGER_BOUND
        or min_y < -TRIGGER_BOUND
        or max_y > TRIGGER_BOUND
        or span > TRIGGER_SPAN
    )

    if not is_overflowing:
        return viz_data

    data = copy.deepcopy(viz_data)
    
    # Calculate scale factor so the full span fits in 2 * safe_bound
    target_span = 2.0 * safe_bound
    scale = target_span / span

    # Center of original bounding box
    mid_x = (min_x + max_x) / 2.0
    mid_y = (min_y + max_y) / 2.0

    def transform_coord(x: float, y: float) -> Tuple[float, float]:
        nx = round((x - mid_x) * scale, 3)
        ny = round((y - mid_y) * scale, 3)
        return nx, ny

    # 1. Transform root points if present
    if isinstance(data.get("points"), list):
        for p in data["points"]:
            if isinstance(p, dict) and "x" in p and "y" in p:
                p["x"], p["y"] = transform_coord(float(p["x"]), float(p["y"]))

    # 2. Transform layers
    for lay in data.get("layers", []) or []:
        kind = lay.get("kind")

        # Every declared point, whatever kind declared it (đợt 8 / 4I). The
        # per-kind branches below then only handle what is NOT a point: radii.
        for _, point in mathviz_contract.iter_point_dicts(lay):
            try:
                point["x"], point["y"] = transform_coord(float(point["x"]), float(point["y"]))
            except (ValueError, TypeError, KeyError):
                continue

        if kind == "circle":
            center = lay.get("center")
            r = lay.get("r") if "r" in lay else lay.get("radius")
            if isinstance(center, dict) and "x" in center and "y" in center:
                center["x"], center["y"] = transform_coord(float(center["x"]), float(center["y"]))
            if r is not None:
                new_r = round(float(r) * scale, 3)
                if "r" in lay:
                    lay["r"] = new_r
                if "radius" in lay:
                    lay["radius"] = new_r
        elif kind == "ellipse":
            center = lay.get("center")
            if isinstance(center, dict) and "x" in center and "y" in center:
                center["x"], center["y"] = transform_coord(float(center["x"]), float(center["y"]))
            for axis in ("a", "b", "rx", "ry"):
                if axis in lay:
                    lay[axis] = round(float(lay[axis]) * scale, 3)

    return data
