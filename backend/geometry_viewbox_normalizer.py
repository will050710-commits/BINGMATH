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
from typing import Dict, Any, List, Tuple, Optional

SAFE_BOUND = 4.0
TRIGGER_BOUND = 5.2
TRIGGER_SPAN = 9.5


def _collect_bounds(viz_data: Dict[str, Any]) -> Optional[Tuple[float, float, float, float]]:
    """
    Computes (min_x, max_x, min_y, max_y) enclosing all geometric elements:
    polygons, points, line endpoints, circle perimeters, and ellipses.
    """
    xs: List[float] = []
    ys: List[float] = []

    # Check root points
    if isinstance(viz_data.get("points"), list):
        for p in viz_data["points"]:
            if isinstance(p, dict) and "x" in p and "y" in p:
                try:
                    xs.append(float(p["x"]))
                    ys.append(float(p["y"]))
                except (ValueError, TypeError):
                    pass

    # Check layers
    for lay in viz_data.get("layers", []) or []:
        kind = lay.get("kind")
        if kind in ("polygon", "triangle") and isinstance(lay.get("points"), list):
            for p in lay["points"]:
                if isinstance(p, dict) and "x" in p and "y" in p:
                    try:
                        xs.append(float(p["x"]))
                        ys.append(float(p["y"]))
                    except (ValueError, TypeError):
                        pass
        elif kind == "points" and isinstance(lay.get("data"), list):
            for p in lay["data"]:
                if isinstance(p, dict) and "x" in p and "y" in p:
                    try:
                        xs.append(float(p["x"]))
                        ys.append(float(p["y"]))
                    except (ValueError, TypeError):
                        pass
        elif kind in ("line", "segment"):
            for endpoint in (lay.get("from"), lay.get("to")):
                if isinstance(endpoint, dict) and "x" in endpoint and "y" in endpoint:
                    try:
                        xs.append(float(endpoint["x"]))
                        ys.append(float(endpoint["y"]))
                    except (ValueError, TypeError):
                        pass
        elif kind == "circle":
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
            a = lay.get("a", 4)
            b = lay.get("b", 2.5)
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
        if kind in ("polygon", "triangle") and isinstance(lay.get("points"), list):
            for p in lay["points"]:
                if isinstance(p, dict) and "x" in p and "y" in p:
                    p["x"], p["y"] = transform_coord(float(p["x"]), float(p["y"]))
        elif kind == "points" and isinstance(lay.get("data"), list):
            for p in lay["data"]:
                if isinstance(p, dict) and "x" in p and "y" in p:
                    p["x"], p["y"] = transform_coord(float(p["x"]), float(p["y"]))
        elif kind in ("line", "segment"):
            f_pt = lay.get("from")
            t_pt = lay.get("to")
            if isinstance(f_pt, dict) and "x" in f_pt and "y" in f_pt:
                f_pt["x"], f_pt["y"] = transform_coord(float(f_pt["x"]), float(f_pt["y"]))
            if isinstance(t_pt, dict) and "x" in t_pt and "y" in t_pt:
                t_pt["x"], t_pt["y"] = transform_coord(float(t_pt["x"]), float(t_pt["y"]))
        elif kind == "circle":
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
            if "a" in lay:
                lay["a"] = round(float(lay["a"]) * scale, 3)
            if "b" in lay:
                lay["b"] = round(float(lay["b"]) * scale, 3)

    return data
