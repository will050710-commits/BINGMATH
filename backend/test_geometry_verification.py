"""
test_geometry_verification.py
==============================
Unit tests for the numerical geometry verification gate.
"""

import sys, os
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

from geometry_verification import (
    is_collinear_2d,
    is_perpendicular_2d,
    is_parallel_2d,
    is_concyclic_2d,
    is_orthocenter_2d,
    is_tangent_to_circle_2d,
    is_harmonic_bundle,
    GeometryVerifier
)

def test_geometry():
    print("=== TESTING GEOMETRY VERIFICATION GATE ===")

    # 1. Collinearity
    assert is_collinear_2d((0, 0), (2, 2), (5, 5)) == True, "Collinear points failed"
    assert is_collinear_2d((0, 0), (2, 2), (2, 3)) == False, "Non-collinear passed"
    print("[OK] Collinearity tests passed.")

    # 2. Perpendicular & Parallel
    assert is_perpendicular_2d((0, 0), (0, 4), (0, 0), (4, 0)) == True, "Perpendicular failed"
    assert is_parallel_2d((0, 0), (2, 2), (0, 1), (2, 3)) == True, "Parallel failed"
    print("[OK] Perpendicular and Parallel tests passed.")

    # 3. Concyclic (4 points on a circle)
    # Points on unit circle: (1, 0), (0, 1), (-1, 0), (0, -1)
    assert is_concyclic_2d((1, 0), (0, 1), (-1, 0), (0, -1)) == True, "Concyclic failed"
    assert is_concyclic_2d((1, 0), (0, 1), (-1, 0), (0, 2)) == False, "Non-concyclic passed"
    print("[OK] Concyclicity tests passed.")

    # 4. Orthocenter of Triangle
    # Right triangle at origin: A(0, 3), B(4, 0), C(0, 0) -> Orthocenter is C(0, 0)
    assert is_orthocenter_2d((0, 3), (4, 0), (0, 0), (0, 0)) == True, "Orthocenter of right triangle failed"
    print("[OK] Orthocenter test passed.")

    # 5. Tangent to circle
    # Line y = 1 (p1=(-2, 1), p2=(2, 1)) is tangent to unit circle at (0, 1)
    assert is_tangent_to_circle_2d((-2, 1), (2, 1), (0, 0), 1.0) == True, "Tangency failed"
    print("[OK] Tangency test passed.")

    # 6. Harmonic bundle
    assert is_harmonic_bundle(0, 4, 2, -2) == False
    # Cross ratio for harmonic bundle (A, B, C, D) = -1
    # Example on line: A=0, B=6, C=3, D=infinity or points with CR=-1: (A=-1, B=1, C=0, D=infinity) -> ((0 - -1)/(0 - 1)) / ((inf - -1)/(inf - 1)) = -1 / 1 = -1
    # For finite points: A=0, B=4, C=2, D=6 -> (2/(-2)) / (6/2) = -1 / 3 != -1. If C=3, D=-3: (3/(-1)) / (-3/(-7)) = -3 / (3/7) = -7.
    # Harmonic conjugate of C=2 with respect to A=0, B=3: 2/(2-3) = -2 -> D satisfies (D-0)/(D-3) = 2 -> D = 2D - 6 -> D = 6.
    # Check: (2 - 0)/(2 - 3) = -2. (6 - 0)/(6 - 3) = 2. Cross ratio = -2 / 2 = -1.
    assert is_harmonic_bundle(0, 3, 2, 6) == True, "Harmonic bundle (0, 3; 2, 6) failed"
    print("[OK] Harmonic cross ratio test passed.")

    # 7. High level verifier
    points = {
        "A": (0.0, 3.0),
        "B": (4.0, 0.0),
        "C": (0.0, 0.0),
        "H": (0.0, 0.0),
        "D": (2.0, 1.5)
    }
    claims = [
        {"kind": "perpendicular", "points": ["A", "C", "B", "C"]},
        {"kind": "orthocenter", "points": ["A", "B", "C", "H"]},
        {"kind": "collinear", "points": ["A", "B", "D"]}
    ]
    res = GeometryVerifier.verify_claims(points, claims)
    assert res["all_passed"] == True, f"Verifier failed: {res}"
    print("[OK] High level GeometryVerifier test passed.")

    print("\n>>> ALL GEOMETRY VERIFICATION TESTS PASSED! <<<")

if __name__ == "__main__":
    test_geometry()
