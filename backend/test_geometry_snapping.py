"""
test_geometry_snapping.py
==========================
Unit tests for the general-purpose geometric snapping module (Risk 1
mitigation — complements test_geometry_verification.py, which tests the
underlying numeric predicates this module calls).
"""

import sys, os, copy
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

from geometry_snapping import (
    snap_geometry_2d,
    report_near_equal_lengths,
    verify_snap_safe,
    _angle_deg,
)
from geometry_verification import is_collinear_2d


def test_geometry_snapping():
    print("=== TESTING GEOMETRIC SNAPPING (Risk 1) ===")

    # 1. Angle snap: a near-90 degree angle snaps to exactly 90, using a
    #    SIGNED correction so it moves the RIGHT way regardless of winding.
    viz = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "triangle",
        "layers": [{"kind": "triangle", "label": "ABC", "points": [
            {"id": "A", "x": 0.0, "y": 3.0},
            {"id": "B", "x": 0.0, "y": 0.0},
            {"id": "C", "x": 4.05, "y": -0.15},
        ]}],
    }
    before = _angle_deg((0.0, 3.0), (0.0, 0.0), (4.05, -0.15))
    out = snap_geometry_2d(viz)
    pts = {p["id"]: (p["x"], p["y"]) for p in out["layers"][0]["points"]}
    after = _angle_deg(pts["A"], pts["B"], pts["C"])
    assert abs(after - 90.0) < 1e-3, f"angle snap failed: {before:.3f} -> {after:.3f}"
    print(f"[OK] Angle snap: {before:.3f}\u00b0 -> {after:.3f}\u00b0 (target 90\u00b0)")

    # 2. Collinearity snap: anchors (first/last) never move; the middle
    #    point is projected exactly onto the anchor-to-anchor line.
    viz2 = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": [{"kind": "points", "data": [
            {"id": "P", "x": 0.0, "y": 0.0},
            {"id": "Q", "x": 2.0, "y": 2.2},
            {"id": "R", "x": 4.0, "y": 4.0},
        ]}],
    }
    out2 = snap_geometry_2d(viz2)
    p2 = {p["id"]: (p["x"], p["y"]) for p in out2["layers"][0]["data"]}
    assert p2["P"] == (0.0, 0.0) and p2["R"] == (4.0, 4.0), "anchors must never move"
    assert is_collinear_2d(p2["P"], p2["Q"], p2["R"], tol=1e-6), "collinearity snap failed"
    print(f"[OK] Collinearity snap: Q moved to {p2['Q']}, anchors P/R unchanged")

    # 3. Safety bound: a point far from any canonical relationship is left
    #    alone rather than forced into false precision.
    viz3 = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": [{"kind": "points", "data": [
            {"id": "P", "x": 0.0, "y": 0.0},
            {"id": "Q", "x": 2.0, "y": 3.0},   # ~0.7 units off-line: too far to trust
            {"id": "R", "x": 4.0, "y": 4.0},
        ]}],
    }
    out3 = snap_geometry_2d(viz3)
    p3 = {p["id"]: (p["x"], p["y"]) for p in out3["layers"][0]["data"]}
    assert p3["Q"] == (2.0, 3.0), "an out-of-tolerance point must be left untouched, not force-snapped"
    print("[OK] Safety bound: out-of-tolerance point left untouched (no false precision)")

    # 4. Near-equal-length reporting is read-only.
    viz4 = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "triangle",
        "layers": [{"kind": "triangle", "points": [
            {"id": "A", "x": 0.0, "y": 0.0},
            {"id": "B", "x": 5.0, "y": 0.0},
            {"id": "C", "x": 0.2, "y": 5.03},
        ]}],
    }
    before4 = copy.deepcopy(viz4)
    notes = report_near_equal_lengths(viz4)
    assert len(notes) >= 1, "expected at least one near-equal-length note"
    assert viz4 == before4, "report_near_equal_lengths must never mutate its input"
    print(f"[OK] Length report (non-mutating): {notes}")

    # 5. verify_snap_safe rejects a regression, accepts a neutral/good change.
    before5 = {"layers": [{"kind": "points", "data": [
        {"id": "X", "x": 0.0, "y": 0.0}, {"id": "Y", "x": 1.0, "y": 1.0}, {"id": "Z", "x": 2.0, "y": 2.0}]}]}
    good = copy.deepcopy(before5)
    bad = copy.deepcopy(before5)
    bad["layers"][0]["data"][1]["y"] = 5.0
    assert verify_snap_safe(before5, good) is True
    assert verify_snap_safe(before5, bad) is False
    print("[OK] verify_snap_safe: accepts neutral change, rejects a regression")

    # 6. Non-geometry_2d payloads pass through completely untouched.
    passthrough = {"type": "mathviz.v1", "widget": "function_plot", "expr": "x^2", "params": {}}
    assert snap_geometry_2d(passthrough) == passthrough
    print("[OK] Guard: non-geometry_2d widgets pass through untouched")

    print("\n>>> ALL GEOMETRIC SNAPPING TESTS PASSED! <<<")


if __name__ == "__main__":
    test_geometry_snapping()
