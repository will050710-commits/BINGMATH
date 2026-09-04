"""
Geometry Canvas Analytic Solver & Auto-Aligner
==============================================
Automatically repairs and refines LLM-generated coordinates in MathViz 2D Geometry
using exact analytic geometry & synthetic geometric constraints:
- Non-isosceles acute triangle alignment (AB < AC)
- Exact altitude feet (D = foot(A, BC), E = foot(B, AC), F = foot(C, AB))
- Exact orthocenter H = AD ∩ BE
- Exact circumcenter O and circumcircle radius R
- Exact circle (AEF) / circle diameter AH: center I = midpoint(AH), radius r = AH/2
- Exact collinear intersection P = EF ∩ BC
- Line segment endpoint snapping & circle parameter synchronization
"""

import math
import copy
from typing import Dict, Any, Optional, Tuple

Point2D = Tuple[float, float]

def dist(p1: Point2D, p2: Point2D) -> float:
    return math.hypot(p2[0] - p1[0], p2[1] - p1[1])

def foot_on_line(p: Point2D, l1: Point2D, l2: Point2D) -> Point2D:
    dx, dy = l2[0] - l1[0], l2[1] - l1[1]
    denom = dx * dx + dy * dy
    if denom < 1e-12:
        return l1
    t = ((p[0] - l1[0]) * dx + (p[1] - l1[1]) * dy) / denom
    return (round(l1[0] + t * dx, 3), round(l1[1] + t * dy, 3))

def line_intersection(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D) -> Optional[Point2D]:
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-9:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    return (round(x1 + t * (x2 - x1), 3), round(y1 + t * (y2 - y1), 3))

def circumcenter_2d(a: Point2D, b: Point2D, c: Point2D) -> Tuple[Point2D, float]:
    ax, ay = a; bx, by = b; cx, cy = c
    d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if abs(d) < 1e-9:
        return (0.0, 0.0), 3.0
    ux = ((ax**2 + ay**2) * (by - cy) + (bx**2 + by**2) * (cy - ay) + (cx**2 + cy**2) * (ay - by)) / d
    uy = ((ax**2 + ay**2) * (cx - bx) + (bx**2 + by**2) * (ax - cx) + (cx**2 + cy**2) * (bx - ax)) / d
    center = (round(ux, 3), round(uy, 3))
    radius = round(dist(center, a), 3)
    return center, radius


def auto_align_geometry_mathviz(viz_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Scans the MathViz 'geometry_2d' payload. If Olympiad triangle features
    (altitudes, circumcircle, orthocenter, intersection P) are present,
    solves and snaps their coordinates using exact analytic geometry.
    """
    if not isinstance(viz_data, dict):
        return viz_data
    if viz_data.get("widget") != "geometry_2d" or "layers" not in viz_data:
        return viz_data

    data = copy.deepcopy(viz_data)
    layers = data.get("layers", [])

    # 1. Collect all declared points across all layers
    declared_points: Dict[str, Point2D] = {}
    for lay in layers:
        if lay.get("kind") in ("polygon", "triangle") and "points" in lay:
            for pt in lay["points"]:
                pid = pt.get("id")
                if pid and "x" in pt and "y" in pt:
                    declared_points[pid] = (float(pt["x"]), float(pt["y"]))
        elif lay.get("kind") == "points" and "data" in lay:
            for pt in lay["data"]:
                pid = pt.get("id")
                if pid and "x" in pt and "y" in pt:
                    declared_points[pid] = (float(pt["x"]), float(pt["y"]))

    # 2. Check if main triangle ABC is present
    has_abc = all(k in declared_points for k in ("A", "B", "C"))
    if not has_abc:
        return data

    A = declared_points["A"]
    B = declared_points["B"]
    C = declared_points["C"]

    # If A is artificially centered/symmetric (e.g. xA ~ 0 and xB ~ -xC),
    # adjust to an aesthetic non-isosceles acute triangle (AB < AC)
    # matching standard Olympiad diagrams (A=(-1.0, 3.5), B=(-2.5, -1.8), C=(3.0, -1.8))
    mid_bc_x = (B[0] + C[0]) / 2.0
    is_too_symmetric = abs(A[0] - mid_bc_x) < 0.35 or abs(abs(B[0]) - abs(C[0])) < 0.3
    has_olympiad_points = any(k in declared_points for k in ("H", "D", "E", "F", "P", "I", "O"))

    if is_too_symmetric and has_olympiad_points:
        # Standardize to natural skew acute triangle
        A = (-1.0, 3.5)
        B = (-2.5, -1.8)
        C = (3.0, -1.8)
    else:
        # Respect user/model base orientation but ensure BC is horizontal if nearly horizontal
        if abs(B[1] - C[1]) < 0.6:
            avg_y = (B[1] + C[1]) / 2.0
            B = (B[0], avg_y)
            C = (C[0], avg_y)

    aligned_points: Dict[str, Point2D] = {"A": A, "B": B, "C": C}

    # 3. Compute exact analytic coordinates for classic Olympiad points
    D = foot_on_line(A, B, C)
    E = foot_on_line(B, A, C)
    F = foot_on_line(C, A, B)
    H = line_intersection(A, D, B, E) or (-1.0, -0.67)
    O, R_circum = circumcenter_2d(A, B, C)
    I = (round((A[0] + H[0]) / 2.0, 3), round((A[1] + H[1]) / 2.0, 3))
    r_AEF = round(dist(I, A), 3)
    P = line_intersection(E, F, B, C) or (-5.8, B[1])

    # Assign aligned coordinates if point exists in diagram
    if "D" in declared_points: aligned_points["D"] = D
    if "E" in declared_points: aligned_points["E"] = E
    if "F" in declared_points: aligned_points["F"] = F
    if "H" in declared_points: aligned_points["H"] = H
    if "O" in declared_points: aligned_points["O"] = O
    if "I" in declared_points: aligned_points["I"] = I
    if "P" in declared_points: aligned_points["P"] = P

    # If K is present (typically foot of altitude or intersection on circumcircle)
    if "K" in declared_points:
        # If K is near D, place it as foot on BC
        k_old = declared_points["K"]
        if abs(k_old[1] - B[1]) < 1.0:
            aligned_points["K"] = (round(k_old[0], 2), B[1])

    # If Q is present on EF line extended
    if "Q" in declared_points:
        # Align Q onto line (P, E)
        dx_pe, dy_pe = E[0] - P[0], E[1] - P[1]
        t_q = 1.35  # extend past E
        aligned_points["Q"] = (round(P[0] + t_q * dx_pe, 2), round(P[1] + t_q * dy_pe, 2))

    # If G is on circumcircle (O)
    if "G" in declared_points:
        # Project G onto circumcircle if it is near (O)
        gx, gy = declared_points["G"]
        vx, vy = gx - O[0], gy - O[1]
        v_len = math.hypot(vx, vy)
        if v_len > 1e-4:
            aligned_points["G"] = (round(O[0] + vx / v_len * R_circum, 2), round(O[1] + vy / v_len * R_circum, 2))

    # 4. Synchronize all layers with the exact coordinates
    for lay in layers:
        # Circles
        if lay.get("kind") == "circle":
            lbl = (lay.get("label") or "").upper()
            if "(O)" in lbl or lbl == "O" or "NGOẠI TIẾP" in lbl or "CIRCUMCIRCLE" in lbl:
                lay["center"] = {"x": O[0], "y": O[1]}
                lay["r"] = R_circum
                lay["color"] = lay.get("color") or "#3b82f6"
            elif "AEF" in lbl or "(I)" in lbl or "AH" in lbl or "(AEF)" in lbl:
                lay["center"] = {"x": I[0], "y": I[1]}
                lay["r"] = r_AEF
                lay["color"] = lay.get("color") or "#ec4899"
            elif "BC" in lbl or "BCEF" in lbl:
                m_bc = ((B[0] + C[0]) / 2.0, (B[1] + C[1]) / 2.0)
                lay["center"] = {"x": round(m_bc[0], 2), "y": round(m_bc[1], 2)}
                lay["r"] = round(dist(B, C) / 2.0, 2)

        # Polygons
        elif lay.get("kind") in ("polygon", "triangle") and "points" in lay:
            for pt in lay["points"]:
                pid = pt.get("id")
                if pid in aligned_points:
                    pt["x"] = aligned_points[pid][0]
                    pt["y"] = aligned_points[pid][1]

        # Points
        elif lay.get("kind") == "points" and "data" in lay:
            for pt in lay["data"]:
                pid = pt.get("id")
                if pid in aligned_points:
                    pt["x"] = aligned_points[pid][0]
                    pt["y"] = aligned_points[pid][1]

        # Lines
        elif lay.get("kind") in ("line", "segment"):
            lbl = lay.get("label") or ""
            # Match endpoints by label or nearest known point
            from_pt = lay.get("from")
            to_pt = lay.get("to")
            for pid, (px, py) in aligned_points.items():
                if from_pt and math.hypot(from_pt.get("x", 0) - px, from_pt.get("y", 0) - py) < 0.65:
                    from_pt["x"] = px
                    from_pt["y"] = py
                if to_pt and math.hypot(to_pt.get("x", 0) - px, to_pt.get("y", 0) - py) < 0.65:
                    to_pt["x"] = px
                    to_pt["y"] = py

            # If label contains two points like "AH", "BC", "EF", "PE", "AD", snap directly
            clean_lbl = "".join(c for c in lbl if c.isupper())
            if len(clean_lbl) == 2:
                p1_name, p2_name = clean_lbl[0], clean_lbl[1]
                if p1_name in aligned_points and p2_name in aligned_points:
                    lay["from"] = {"x": aligned_points[p1_name][0], "y": aligned_points[p1_name][1]}
                    lay["to"] = {"x": aligned_points[p2_name][0], "y": aligned_points[p2_name][1]}

    return data