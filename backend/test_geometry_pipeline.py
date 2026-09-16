"""
test_geometry_pipeline.py
=========================
Comprehensive test suite for the upgraded geometry visualization pipeline:
1. Cascade updates to line segments and circle centers
2. Advanced geometric primitives (circle-line intersection, circle-circle intersection,
   angle bisector foot, nine-point center)
3. Viewbox normalization (rescaling and centering to prevent canvas clipping)
4. Implicit construction extraction from natural language explanations
"""

import sys
import os
import math

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from geometry_construction_solver import resolve_constructions
from geometry_viewbox_normalizer import normalize_viewbox
from geometry_implicit_extractor import extract_implicit_constructions


def test_cascade_update_lines_and_circles():
    """Verify that resolving constructions updates line endpoints and circle centers."""
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 4.0},
                    {"id": "B", "x": -3.0, "y": 0.0},
                    {"id": "C", "x": 3.0, "y": 0.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "H", "x": 99.0, "y": 99.0},
                ],
            },
            {
                "kind": "line",
                "from": {"id": "A", "x": 0.0, "y": 4.0},
                "to": {"id": "H", "x": 99.0, "y": 99.0},
                "label": "AH",
            },
            {
                "kind": "circle",
                "center": {"id": "H", "x": 99.0, "y": 99.0},
                "r": 1.5,
                "label": "Circle at H",
            },
        ],
        "constructions": [
            {"point": "H", "type": "orthocenter", "of": ["A", "B", "C"]},
        ],
    }

    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved, f"Expected H to be resolved, got unsolved: {unsolved}"

    # Find line and circle layers
    line_layer = next(lay for lay in resolved["layers"] if lay.get("kind") == "line")
    circle_layer = next(lay for lay in resolved["layers"] if lay.get("kind") == "circle")

    # Verify line 'to' endpoint was updated to H's exact position (0.0, 2.25)
    assert line_layer["to"]["x"] == 0.0 and line_layer["to"]["y"] == 2.25, (
        f"Line 'to' endpoint not cascaded: {line_layer['to']}"
    )

    # Verify circle center was updated to (0.0, 2.25)
    assert circle_layer["center"]["x"] == 0.0 and circle_layer["center"]["y"] == 2.25, (
        f"Circle center not cascaded: {circle_layer['center']}"
    )
    print("[PASS] test_cascade_update_lines_and_circles")


def test_angle_bisector_primitive():
    """Verify angle_bisector_foot primitive calculation."""
    # Right triangle A(0, 3), B(0, 0), C(4, 0)
    # Angle bisector from A to BC
    # Ratio AB : AC = 3 : 5
    # Foot D on BC: D_x = 0 + (3/8)*4 = 1.5, D_y = 0
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 3.0},
                    {"id": "B", "x": 0.0, "y": 0.0},
                    {"id": "C", "x": 4.0, "y": 0.0},
                ],
            },
            {"kind": "points", "data": [{"id": "D", "x": 0.0, "y": 0.0}]},
        ],
        "constructions": [
            {"point": "D", "type": "angle_bisector_foot", "of": ["A", "B", "C"]},
        ],
    }
    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved
    pts = {p["id"]: (p["x"], p["y"]) for p in resolved["layers"][1]["data"]}
    assert math.isclose(pts["D"][0], 1.5, abs_tol=1e-3), f"Expected D_x=1.5, got {pts['D']}"
    assert math.isclose(pts["D"][1], 0.0, abs_tol=1e-3), f"Expected D_y=0.0, got {pts['D']}"
    print("[PASS] test_angle_bisector_primitive")


def test_nine_point_center_primitive():
    """Verify nine_point_center is midpoint of H and O."""
    # A(0, 4), B(-3, 0), C(3, 0)
    # H = (0.0, 2.25), O = (0.0, 0.875)
    # N = (0.0, (2.25 + 0.875)/2) = (0.0, 1.5625)
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 4.0},
                    {"id": "B", "x": -3.0, "y": 0.0},
                    {"id": "C", "x": 3.0, "y": 0.0},
                ],
            },
            {"kind": "points", "data": [{"id": "N", "x": 0.0, "y": 0.0}]},
        ],
        "constructions": [
            {"point": "N", "type": "nine_point_center", "of": ["A", "B", "C"]},
        ],
    }
    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved
    pts = {p["id"]: (p["x"], p["y"]) for p in resolved["layers"][1]["data"]}
    assert math.isclose(pts["N"][0], 0.0, abs_tol=1e-3)
    assert math.isclose(pts["N"][1], 1.5625, abs_tol=1e-3)
    print("[PASS] test_nine_point_center_primitive")


def test_circle_line_intersection_primitive():
    """Verify circle_line_intersection returns the second intersection."""
    # Circle at (0, 0) with radius point (0, 5) -> r = 5
    # Line passing through (-5, 0) and (10, 0)
    # Point (-5, 0) is already on the circle, second intersection should be (5, 0)
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "points",
                "data": [
                    {"id": "O", "x": 0.0, "y": 0.0},
                    {"id": "R", "x": 0.0, "y": 5.0},
                    {"id": "P1", "x": -5.0, "y": 0.0},
                    {"id": "P2", "x": 10.0, "y": 0.0},
                    {"id": "S", "x": 0.0, "y": 0.0},
                ],
            }
        ],
        "constructions": [
            {"point": "S", "type": "circle_line_intersection", "of": ["O", "R", "P1", "P2"]},
        ],
    }
    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved
    pts = {p["id"]: (p["x"], p["y"]) for p in resolved["layers"][0]["data"]}
    assert math.isclose(pts["S"][0], 5.0, abs_tol=1e-3), f"Expected S_x=5.0, got {pts['S']}"
    assert math.isclose(pts["S"][1], 0.0, abs_tol=1e-3), f"Expected S_y=0.0, got {pts['S']}"
    print("[PASS] test_circle_line_intersection_primitive")


def test_circle_circle_intersection_primitive():
    """Verify circle_circle_intersection returns correct intersecting point."""
    # Circle 1 at (0, 0) with radius point (5, 0) -> r1 = 5
    # Circle 2 at (6, 0) with radius point (1, 0) -> r2 = 5
    # Intersections at (3.0, 4.0) and (3.0, -4.0)
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "points",
                "data": [
                    {"id": "C1", "x": 0.0, "y": 0.0},
                    {"id": "R1", "x": 5.0, "y": 0.0},
                    {"id": "C2", "x": 6.0, "y": 0.0},
                    {"id": "R2", "x": 1.0, "y": 0.0},
                    {"id": "T", "x": 0.0, "y": 0.0},
                ],
            }
        ],
        "constructions": [
            {"point": "T", "type": "circle_circle_intersection", "of": ["C1", "R1", "C2", "R2"]},
        ],
    }
    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved
    pts = {p["id"]: (p["x"], p["y"]) for p in resolved["layers"][0]["data"]}
    assert math.isclose(pts["T"][0], 3.0, abs_tol=1e-3), f"Expected T_x=3.0, got {pts['T']}"
    assert math.isclose(abs(pts["T"][1]), 4.0, abs_tol=1e-3), f"Expected |T_y|=4.0, got {pts['T']}"
    print("[PASS] test_circle_circle_intersection_primitive")


def test_viewbox_normalizer():
    """Verify that distant coordinates outside [-5.2, 5.2] are auto-scaled within safe bounds."""
    overflow_viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 12.0},
                    {"id": "B", "x": -15.0, "y": -8.0},
                    {"id": "C", "x": 15.0, "y": -8.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "P", "x": -18.0, "y": -10.0},
                ],
            },
            {
                "kind": "line",
                "from": {"id": "B", "x": -15.0, "y": -8.0},
                "to": {"id": "P", "x": -18.0, "y": -10.0},
            },
            {
                "kind": "circle",
                "center": {"x": 0.0, "y": 0.0},
                "r": 10.0,
            },
        ],
    }
    normalized = normalize_viewbox(overflow_viz, safe_bound=4.0)

    # All points must now lie within [-4.05, 4.05]
    all_coords = []
    for lay in normalized["layers"]:
        if lay.get("kind") == "polygon":
            for p in lay["points"]:
                all_coords.extend([p["x"], p["y"]])
        elif lay.get("kind") == "points":
            for p in lay["data"]:
                all_coords.extend([p["x"], p["y"]])
        elif lay.get("kind") == "line":
            all_coords.extend([lay["from"]["x"], lay["from"]["y"], lay["to"]["x"], lay["to"]["y"]])
        elif lay.get("kind") == "circle":
            c, r = lay["center"], lay["r"]
            all_coords.extend([c["x"] - r, c["x"] + r, c["y"] - r, c["y"] + r])

    max_val = max(abs(c) for c in all_coords)
    assert max_val <= 4.05, f"Expected all elements within 4.05, got max {max_val}"
    print("[PASS] test_viewbox_normalizer")


def test_implicit_extractor():
    """Verify natural language extraction of constructions from Vietnamese explanation."""
    reply_text = (
        "Cho tam giác ABC nhọn. Gọi H là trực tâm tam giác ABC. "
        "M là trung điểm BC. D là chân đường cao hạ từ A xuống BC."
    )
    raw_viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 4.0},
                    {"id": "B", "x": -3.0, "y": 0.0},
                    {"id": "C", "x": 3.0, "y": 0.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "H", "x": 50.0, "y": 50.0},
                    {"id": "M", "x": 40.0, "y": 40.0},
                    {"id": "D", "x": 30.0, "y": 30.0},
                ],
            },
        ],
    }

    result = extract_implicit_constructions(reply_text, raw_viz)
    assert "constructions" in result, "Expected 'constructions' to be injected"
    c_map = {c["point"]: c["type"] for c in result["constructions"]}
    assert c_map.get("H") == "orthocenter", f"Expected H orthocenter, got {c_map}"
    assert c_map.get("M") == "midpoint", f"Expected M midpoint, got {c_map}"
    assert c_map.get("D") == "foot", f"Expected D foot, got {c_map}"

    # Verify H was solved to (0.0, 2.25)
    pts = {p["id"]: (p["x"], p["y"]) for p in result["layers"][1]["data"]}
    assert pts["H"] == (0.0, 2.25), f"Expected H solved to (0.0, 2.25), got {pts['H']}"
    assert pts["M"] == (0.0, 0.0), f"Expected M solved to (0.0, 0.0), got {pts['M']}"
    assert pts["D"] == (0.0, 0.0), f"Expected D solved to (0.0, 0.0), got {pts['D']}"
    print("[PASS] test_implicit_extractor")


def test_point_on_circle_and_arc():
    """
    Test problem from user's image:
    Circle (O) diameter AB (A(-3, 0), B(3, 0)).
    C on (O) with AC = R (central angle 120 deg = 2.094 rad).
    D on minor arc BC (t = 0.35).
    E = AC ∩ BD.
    H = foot(E, AB).
    """
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "circle",
                "center": {"id": "O", "x": 0.0, "y": 0.0},
                "r": 3.0,
            },
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": -3.0, "y": 0.0},
                    {"id": "B", "x": 3.0, "y": 0.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "O", "x": 0.0, "y": 0.0},
                    {"id": "C", "x": 0.0, "y": 0.0},
                    {"id": "D", "x": 0.0, "y": 0.0},
                    {"id": "E", "x": 0.0, "y": 0.0},
                    {"id": "H", "x": 0.0, "y": 0.0},
                ],
            },
            {
                "kind": "line",
                "from": {"id": "A"},
                "to": {"id": "C"},
                "label": "AC",
            },
            {
                "kind": "line",
                "from": {"id": "B"},
                "to": {"id": "D"},
                "label": "BD",
            },
            {
                "kind": "line",
                "from": {"id": "E"},
                "to": {"id": "H"},
                "label": "EH",
            },
        ],
        "constructions": [
            {"point": "C", "type": "point_on_circle", "of": ["O", "A"], "angle_deg": 120},
            {"point": "D", "type": "point_on_arc", "of": ["O", "B", "C"], "arc": "minor", "t": 0.35},
            {"point": "E", "type": "intersection", "of": ["A", "C", "B", "D"]},
            {"point": "H", "type": "foot", "of": ["E", "A", "B"]},
        ],
    }

    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved, f"Expected all resolved, got unsolved: {unsolved}"

    pts = {p["id"]: (p["x"], p["y"]) for p in resolved["layers"][2]["data"]}
    
    # C should be (-1.5, 2.5981)
    assert abs(pts["C"][0] - (-1.5)) < 0.05
    assert abs(pts["C"][1] - 2.5981) < 0.05
    
    # D should be in first quadrant (y > 0, x > 0) on arc BC
    assert pts["D"][0] > 0.0
    assert pts["D"][1] > 0.0
    # D must lie on circle of radius 3
    d_dist = math.hypot(pts["D"][0], pts["D"][1])
    assert abs(d_dist - 3.0) < 0.01

    # E is intersection of AC and BD
    assert pts["E"][1] > 2.0

    # H is foot of E on AB (y = 0)
    assert abs(pts["H"][1] - 0.0) < 0.001
    assert -3.0 < pts["H"][0] < 3.0

    # Verify line layers cascaded
    line_eh = next(lay for lay in resolved["layers"] if lay.get("label") == "EH")
    assert line_eh["from"]["id"] == "E" and line_eh["to"]["id"] == "H"
    assert abs(line_eh["to"]["y"] - 0.0) < 0.001

    print("[PASS] test_point_on_circle_and_arc")


if __name__ == "__main__":
    test_cascade_update_lines_and_circles()
    test_angle_bisector_primitive()
    test_nine_point_center_primitive()
    test_circle_line_intersection_primitive()
    test_circle_circle_intersection_primitive()
    test_viewbox_normalizer()
    test_implicit_extractor()
    test_point_on_circle_and_arc()
    print("\n>>> ALL GEOMETRY PIPELINE TESTS PASSED! <<<")
