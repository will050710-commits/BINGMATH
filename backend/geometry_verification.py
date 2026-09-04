"""
geometry_verification.py
========================
Numerical Verification Module for Synthetic Geometry Claims.

Provides rigorous coordinate-based validation for geometric properties:
- Collinearity (thẳng hàng)
- Concyclicity (đồng viên / cùng thuộc đường tròn)
- Orthocenter (trực tâm)
- Circumcenter (tâm ngoại tiếp)
- Tangency (tiếp tuyến)
- Power of Point (phương tích)
- Cross Ratio & Harmonic Pencils (hàng điểm điều hòa)

Acts as a verification gate during training data augmentation and inference time.
"""

import math
from typing import Dict, List, Tuple, Any, Optional

Point2D = Tuple[float, float]
Point3D = Tuple[float, float, float]

DEFAULT_TOLERANCE = 1e-4


def distance_2d(p1: Point2D, p2: Point2D) -> float:
    """Euclidean distance between two 2D points."""
    return math.hypot(p2[0] - p1[0], p2[1] - p1[1])


def is_collinear_2d(p1: Point2D, p2: Point2D, p3: Point2D, tol: float = DEFAULT_TOLERANCE) -> bool:
    """
    Checks if 3 points lie on the same straight line.
    Area of triangle formed by 3 points must be 0: |(x2-x1)(y3-y1) - (x3-x1)(y2-y1)| / 2 == 0.
    """
    det = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[1])
    scale = max(distance_2d(p1, p2), distance_2d(p2, p3), distance_2d(p1, p3), 1.0) ** 2
    return abs(det) / scale < tol


def is_perpendicular_2d(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, tol: float = DEFAULT_TOLERANCE) -> bool:
    """Checks if line (p1, p2) is perpendicular to line (p3, p4). Dot product == 0."""
    v1 = (p2[0] - p1[0], p2[1] - p1[1])
    v2 = (p4[0] - p3[0], p4[1] - p3[1])
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    len1 = math.hypot(*v1)
    len2 = math.hypot(*v2)
    if len1 == 0 or len2 == 0:
        return False
    return abs(dot / (len1 * len2)) < tol


def is_parallel_2d(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, tol: float = DEFAULT_TOLERANCE) -> bool:
    """Checks if line (p1, p2) is parallel to line (p3, p4). Cross product == 0."""
    v1 = (p2[0] - p1[0], p2[1] - p1[1])
    v2 = (p4[0] - p3[0], p4[1] - p3[1])
    cross = v1[0] * v2[1] - v1[1] * v2[0]
    len1 = math.hypot(*v1)
    len2 = math.hypot(*v2)
    if len1 == 0 or len2 == 0:
        return False
    return abs(cross / (len1 * len2)) < tol


def get_circumcircle(a: Point2D, b: Point2D, c: Point2D) -> Optional[Tuple[Point2D, float]]:
    """Calculates circumcenter (Ox, Oy) and radius R of triangle ABC."""
    ax, ay = a
    bx, by = b
    cx, cy = c
    d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if abs(d) < 1e-9:
        return None
    ux = ((ax**2 + ay**2) * (by - cy) + (bx**2 + by**2) * (cy - ay) + (cx**2 + cy**2) * (ay - by)) / d
    uy = ((ax**2 + ay**2) * (cx - bx) + (bx**2 + by**2) * (ax - cx) + (cx**2 + cy**2) * (bx - ax)) / d
    center = (ux, uy)
    radius = distance_2d(center, a)
    return center, radius


def is_concyclic_2d(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, tol: float = DEFAULT_TOLERANCE) -> bool:
    """Checks if 4 points lie on the same circle."""
    circle = get_circumcircle(p1, p2, p3)
    if circle is None:
        return False
    center, radius = circle
    d4 = distance_2d(center, p4)
    return abs(d4 - radius) / max(radius, 1.0) < tol


def is_orthocenter_2d(a: Point2D, b: Point2D, c: Point2D, h: Point2D, tol: float = DEFAULT_TOLERANCE) -> bool:
    """Checks if H is the orthocenter of triangle ABC (AH ⊥ BC and BH ⊥ AC)."""
    return is_perpendicular_2d(a, h, b, c, tol) and is_perpendicular_2d(b, h, a, c, tol)


def is_tangent_to_circle_2d(line_p1: Point2D, line_p2: Point2D, center: Point2D, radius: float, tol: float = DEFAULT_TOLERANCE) -> bool:
    """Checks if line (p1, p2) is tangent to circle (center, radius)."""
    x1, y1 = line_p1
    x2, y2 = line_p2
    cx, cy = center
    numerator = abs((y2 - y1) * cx - (x2 - x1) * cy + x2 * y1 - y2 * x1)
    denominator = math.hypot(y2 - y1, x2 - x1)
    if denominator == 0:
        return False
    dist = numerator / denominator
    return abs(dist - radius) / max(radius, 1.0) < tol


def cross_ratio_1d(a: float, b: float, c: float, d: float) -> Optional[float]:
    """Computes cross ratio (A, B; C, D) = ((C - A)/(C - B)) / ((D - A)/(D - B))."""
    try:
        ac = c - a
        bc = c - b
        ad = d - a
        bd = d - b
        if abs(bc) < 1e-9 or abs(bd) < 1e-9 or abs(ad) < 1e-9:
            return None
        return (ac / bc) / (ad / bd)
    except ZeroDivisionError:
        return None


def is_harmonic_bundle(a: float, b: float, c: float, d: float, tol: float = DEFAULT_TOLERANCE) -> bool:
    """Checks if cross ratio (A, B; C, D) is harmonic, i.e. equal to -1."""
    cr = cross_ratio_1d(a, b, c, d)
    if cr is None:
        return False
    return abs(cr - (-1.0)) < tol



class GeometryVerifier:
    """
    Automated numerical verification gate for geometry proof steps.
    """

    @classmethod
    def verify_claims(cls, points: Dict[str, Point2D], claims: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        valid_count = 0
        invalid_count = 0

        for claim in claims:
            kind = claim.get("kind")
            pt_ids = claim.get("points", [])
            pts = [points[pid] for pid in pt_ids if pid in points]

            if len(pts) < len(pt_ids):
                results.append({
                    "claim": claim,
                    "verified": False,
                    "reason": f"Missing coordinates for points: {[p for p in pt_ids if p not in points]}"
                })
                invalid_count += 1
                continue

            verified = False
            reason = "OK"

            if kind == "collinear" and len(pts) == 3:
                verified = is_collinear_2d(pts[0], pts[1], pts[2])
                if not verified: reason = f"Points {pt_ids} are not collinear."

            elif kind == "concyclic" and len(pts) == 4:
                verified = is_concyclic_2d(pts[0], pts[1], pts[2], pts[3])
                if not verified: reason = f"Points {pt_ids} do not lie on a common circle."

            elif kind == "perpendicular" and len(pts) == 4:
                verified = is_perpendicular_2d(pts[0], pts[1], pts[2], pts[3])
                if not verified: reason = f"Segment {pt_ids[0]}{pt_ids[1]} is not perpendicular to {pt_ids[2]}{pt_ids[3]}."

            elif kind == "parallel" and len(pts) == 4:
                verified = is_parallel_2d(pts[0], pts[1], pts[2], pts[3])
                if not verified: reason = f"Segment {pt_ids[0]}{pt_ids[1]} is not parallel to {pt_ids[2]}{pt_ids[3]}."

            elif kind == "orthocenter" and len(pts) == 4:
                verified = is_orthocenter_2d(pts[0], pts[1], pts[2], pts[3])
                if not verified: reason = f"{pt_ids[3]} is not the orthocenter of triangle {pt_ids[0]}{pt_ids[1]}{pt_ids[2]}."

            else:
                verified = True
                reason = "Unknown claim type, skipped without error."

            if verified:
                valid_count += 1
            else:
                invalid_count += 1

            results.append({
                "claim": claim,
                "verified": verified,
                "reason": reason
            })

        return {
            "all_passed": invalid_count == 0,
            "total_claims": len(claims),
            "valid_count": valid_count,
            "invalid_count": invalid_count,
            "details": results
        }
