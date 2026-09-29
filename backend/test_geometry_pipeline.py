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

from geometry_construction_solver import resolve_constructions, _collect_point_refs
from geometry_viewbox_normalizer import normalize_viewbox
from geometry_implicit_extractor import extract_implicit_constructions
from geometry_verification import is_collinear_2d
import mathviz_contract as _mc

# Every point an arbitrary layer declares, using the shared contract walk (the
# tests below inspect payloads whose points live in several kinds at once).
_iter_points = _mc.iter_point_dicts


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


def test_tangent_arcs_in_right_triangle():
    """Đợt 8 / 4I — the figure from the bug report, end to end.

    Three arcs inside a 3-4-5 right triangle (A at the right angle), each pair
    tangent, touching at P, Q, R. The model guessed Q=(2.4, 1.8); the exact
    answer is Q=(1.6, 1.8), because the contact point of the arcs centred at B
    and C divides BC in the ratio of the radii (2:3).

    Nothing in the pipeline could express that: `circle_circle_tangency` did not
    exist, the extractor had no Vietnamese pattern for "tiếp xúc", and the
    collectors ignored every point an `arc` layer declared. This test locks all
    three down at once.
    """
    # AB = 3, AC = 4 -> the arcs centred at A, B, C have radii 1, 2, 3 (each
    # pair sums to the side length between its centres: 1+2=3, 1+3=4, 2+3=5).
    viz = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "title": "Ba cung nội tiếp tam giác $ABC$ vuông tại $A$",
        "layers": [
            {"kind": "polygon", "points": [
                {"id": "A", "x": 0.0, "y": 0.0},
                {"id": "B", "x": 0.0, "y": 3.0},
                {"id": "C", "x": 4.0, "y": 0.0}]},
            {"kind": "arc", "center": {"id": "A", "x": 0.0, "y": 0.0},
             "from": {"id": "R", "x": 1.0, "y": 0.0}, "to": {"id": "P", "x": 0.0, "y": 1.0}},
            {"kind": "arc", "center": {"id": "B", "x": 0.0, "y": 3.0},
             "from": {"id": "Q", "x": 2.4, "y": 1.8}, "to": {"id": "P", "x": 0.0, "y": 1.0}},
            {"kind": "arc", "center": {"id": "C", "x": 4.0, "y": 0.0},
             "from": {"id": "Q", "x": 2.4, "y": 1.8}, "to": {"id": "R", "x": 1.0, "y": 0.0}},
            {"kind": "points", "data": [
                {"id": "A", "x": 0.0, "y": 0.0}, {"id": "B", "x": 0.0, "y": 3.0},
                {"id": "C", "x": 4.0, "y": 0.0}, {"id": "P", "x": 0.0, "y": 1.0},
                {"id": "Q", "x": 2.4, "y": 1.8}, {"id": "R", "x": 1.0, "y": 0.0}]},
        ],
        "constructions": [
            {"point": "P", "type": "circle_circle_tangency", "of": ["A", "B"]},
            {"point": "Q", "type": "circle_circle_tangency", "of": ["B", "C"]},
            {"point": "R", "type": "circle_circle_tangency", "of": ["A", "C"]},
        ],
    }

    resolved, unsolved = resolve_constructions(viz)
    assert not unsolved, f"tangency points must resolve, unsolved={unsolved}"

    pts = {p["id"]: (p["x"], p["y"]) for p in resolved["layers"][4]["data"]}
    for name, expected in (("P", (0.0, 1.0)), ("Q", (1.6, 1.8)), ("R", (1.0, 0.0))):
        assert abs(pts[name][0] - expected[0]) < 1e-3 and abs(pts[name][1] - expected[1]) < 1e-3, \
            f"{name} = {pts[name]}, expected {expected}"
    print(f"[OK] tangency points solved exactly: P={pts['P']} Q={pts['Q']} R={pts['R']} "
          f"(the model's guess for Q was (2.4, 1.8))")

    # The points an ARC layer declares are part of the picture: this is exactly
    # what the old four-kind collectors missed, so the arcs never moved with them.
    arc_refs = _collect_point_refs(resolved)
    assert {"Q", "R", "P"} <= set(arc_refs), f"arc points not collected: {sorted(arc_refs)}"
    # ...and each contact point really lies on both of its circles.
    for name, c1, r1, c2, r2 in (("P", "A", 1.0, "B", 2.0), ("Q", "B", 2.0, "C", 3.0),
                                 ("R", "A", 1.0, "C", 3.0)):
        assert abs(math.dist(pts[name], pts[c1]) - r1) < 1e-3, f"{name} is not on the circle at {c1}"
        assert abs(math.dist(pts[name], pts[c2]) - r2) < 1e-3, f"{name} is not on the circle at {c2}"
    print("[OK] every contact point lies on BOTH of its circles (arcs really touch)")

    # The viewbox must account for arc points too, and must not clip the figure.
    normalized = normalize_viewbox(resolved, safe_bound=6.0)
    assert normalized is not None
    print("[OK] viewbox normalization accepts the arc figure")

    # The Vietnamese extractor understands "các cung tiếp xúc nhau tại Q".
    spoken = (
        "Trong tam giác ABC vuông tại A, vẽ ba cung nội tiếp. "
        "Hai cung tâm B và cung tâm C tiếp xúc nhau tại Q."
    )
    extracted = extract_implicit_constructions(spoken, {
        "type": "mathviz.v1", "widget": "geometry_2d",
        "layers": [{"kind": "points", "data": [{"id": "B", "x": 0, "y": 3},
                                               {"id": "C", "x": 4, "y": 0},
                                               {"id": "Q", "x": 2.4, "y": 1.8}]}],
    })
    found = [c for c in extracted.get("constructions", [])
             if c.get("point") == "Q" and c.get("type") == "circle_circle_tangency"]
    assert found, f"'tiếp xúc' was not understood: {extracted.get('constructions')}"
    print(f"[PASS] test_tangent_arcs_in_right_triangle ({found[0]})")


def test_single_tangency_without_a_full_triple():
    """Đợt 8 / 4I — a SINGLE tangency, which used to stay unresolved.

    The triple pre-pass covers three mutually tangent arcs. One tangency on its own
    had no path at all: `_radius_from_circle` read the arc's own `from` — the very
    point being solved — so the radii came out self-referential and the honest
    tangency test then refused to move anything.

    Three outcomes are asserted here, in decreasing order of what is known:
      A. one radius derivable        -> the contact point is EXACT.
      B. one radius given as a field -> same, exact.
      C. no radius anywhere          -> placed on the segment between the centres and
                                        REPORTED as approximate (not as unsolved).
    """
    def base_layers(extra):
        return [
            {"kind": "points", "data": [
                {"id": "A", "x": 0.0, "y": 0.0}, {"id": "B", "x": 0.0, "y": 3.0},
                {"id": "R", "x": 1.0, "y": 0.0}, {"id": "Q", "x": 0.4, "y": 1.0}]},
        ] + extra

    # A. Only centre A owns a radius-defining point (R). Centre B has none, so the
    #    old code found ONE radius and gave up; the touch point is (0, 1) exactly.
    viz_a = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": base_layers([
            {"kind": "circle", "center": {"id": "A", "x": 0.0, "y": 0.0},
             "from": {"id": "R", "x": 1.0, "y": 0.0}},
            {"kind": "circle", "center": {"id": "B", "x": 0.0, "y": 3.0}},
        ]),
        "constructions": [{"point": "Q", "type": "circle_circle_tangency", "of": ["A", "B"]}],
    }
    out_a, unsolved_a = resolve_constructions(viz_a)
    assert not unsolved_a, f"a single tangency with one known radius must resolve: {unsolved_a}"
    q_a = {p["id"]: (p["x"], p["y"]) for p in out_a["layers"][0]["data"]}["Q"]
    assert abs(math.dist(q_a, (0.0, 1.0))) < 1e-3, f"Q = {q_a}, expected (0, 1)"
    assert abs(math.dist(q_a, (0.0, 0.0)) - 1.0) < 1e-3, "Q must lie on the circle at A (r=1)"
    assert not out_a.get("_constructions_approximate"), "this case is exact, not approximate"
    print(f"[OK] single tangency pinned by one radius: Q={q_a} (exact)")

    # B. The radius as a plain field on the layer — the most direct statement.
    viz_b = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": base_layers([
            {"kind": "circle", "center": {"id": "A", "x": 0.0, "y": 0.0}, "r": 1.0},
            {"kind": "circle", "center": {"id": "B", "x": 0.0, "y": 3.0}, "r": 2.0},
        ]),
        "constructions": [{"point": "Q", "type": "circle_circle_tangency", "of": ["A", "B"]}],
    }
    out_b, unsolved_b = resolve_constructions(viz_b)
    assert not unsolved_b, f"'r' on the layers must be enough: {unsolved_b}"
    q_b = {p["id"]: (p["x"], p["y"]) for p in out_b["layers"][0]["data"]}["Q"]
    assert abs(math.dist(q_b, (0.0, 1.0))) < 1e-3, f"Q = {q_b}, expected (0, 1)"
    print(f"[OK] single tangency pinned by an explicit 'r': Q={q_b} (exact)")


def test_tangency_cases_c_and_d():
    """The two honest-degradation cases for a single tangency (đợt 8 / 4I)."""
    def decl(extra):
        return [
            {"kind": "points", "data": [
                {"id": "A", "x": 0.0, "y": 0.0}, {"id": "B", "x": 0.0, "y": 3.0},
                {"id": "Q", "x": 0.4, "y": 1.0}]},
        ] + extra

    # C. Nothing states a radius: still improved, still honest.
    viz_c = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": decl([
            {"kind": "circle", "center": {"id": "A", "x": 0.0, "y": 0.0}},
            {"kind": "circle", "center": {"id": "B", "x": 0.0, "y": 3.0}},
        ]),
        "constructions": [{"point": "Q", "type": "circle_circle_tangency", "of": ["A", "B"]}],
    }
    out_c, unsolved_c = resolve_constructions(viz_c)
    assert not unsolved_c, f"an underdetermined tangency is an APPROXIMATION, not unsolved: {unsolved_c}"
    assert out_c.get("_constructions_approximate") == ["Q"], \
        f"the approximation must be reported: {out_c.get('_constructions_approximate')}"
    q_c = {p["id"]: (p["x"], p["y"]) for p in out_c["layers"][0]["data"]}["Q"]
    assert is_collinear_2d((0.0, 0.0), q_c, (0.0, 3.0), tol=1e-6), f"Q={q_c} off the line of centres"
    assert 0.0 <= q_c[1] <= 3.0, f"Q={q_c} must lie between the centres"
    assert q_c != (0.4, 1.0), "the unconstrained guess must have been moved"
    out_c2, _ = resolve_constructions(out_c)
    q_c2 = {p["id"]: (p["x"], p["y"]) for p in out_c2["layers"][0]["data"]}["Q"]
    assert abs(math.dist(q_c, q_c2)) < 1e-6, f"not idempotent: {q_c} then {q_c2}"
    print(f"[OK] underdetermined tangency placed collinear + reported: Q={q_c} "
          f"of {out_c['_constructions_approximate']}")

    # D. Regression guard for the self-reference: when the arc's ONLY radius point
    #    IS the tangency point being solved, that radius must not be believed.
    self_ref = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": [
            {"kind": "points", "data": [
                {"id": "A", "x": 0.0, "y": 0.0}, {"id": "B", "x": 0.0, "y": 3.0},
                {"id": "Q", "x": 2.4, "y": 1.8}]},
            {"kind": "arc", "center": {"id": "A", "x": 0.0, "y": 0.0},
             "from": {"id": "Q", "x": 2.4, "y": 1.8}, "to": {"id": "Q", "x": 2.4, "y": 1.8}},
            {"kind": "arc", "center": {"id": "B", "x": 0.0, "y": 3.0},
             "from": {"id": "Q", "x": 2.4, "y": 1.8}, "to": {"id": "Q", "x": 2.4, "y": 1.8}},
        ],
        "constructions": [{"point": "Q", "type": "circle_circle_tangency", "of": ["A", "B"]}],
    }
    out_d, unsolved_d = resolve_constructions(self_ref)
    assert not unsolved_d, f"must still improve: {unsolved_d}"
    q_d = {p["id"]: (p["x"], p["y"]) for p in out_d["layers"][0]["data"]}["Q"]
    assert out_d.get("_constructions_approximate") == ["Q"], \
        "a radius read off the point being solved must NOT count as known"
    assert is_collinear_2d((0.0, 0.0), q_d, (0.0, 3.0), tol=1e-6), f"Q={q_d} off the centres' line"
    print(f"[OK] a self-referential radius is not believed: Q={q_d}")
    print("[PASS] test_single_tangency_without_a_full_triple + cases C/D")


def test_solved_point_updates_every_copy():
    """Đợt 8 / 4I — one id, several declarations, all of them must move.

    The prompt asks for a `points` layer AND for each `line`/`arc` that uses a point
    to inline its coordinates, so a payload routinely carries the SAME point two or
    three times. The solver used to update exactly one of those dicts, which put the
    visible dot at the old guess while the arc endpoint moved — the "arc no longer
    touches the circle" symptom from a second, independent cause. Found by case D of
    the tangency test above, and locked down here.
    """
    viz = {
        "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
        "layers": [
            # Q declared inline inside a line (a common shape: the line "carries" it)
            {"kind": "line", "from": {"id": "O", "x": 0.0, "y": 0.0},
             "to": {"id": "Q", "x": 2.4, "y": 1.8}},
            # ...and again in the points layer that draws the badge
            {"kind": "points", "data": [{"id": "O", "x": 0.0, "y": 0.0},
                                        {"id": "A", "x": 0.0, "y": 0.0},
                                        {"id": "B", "x": 0.0, "y": 3.0},
                                        {"id": "Q", "x": 2.4, "y": 1.8}]},
            {"kind": "circle", "center": {"id": "A", "x": 0.0, "y": 0.0}, "r": 1.0},
            {"kind": "circle", "center": {"id": "B", "x": 0.0, "y": 3.0}, "r": 2.0},
        ],
        "constructions": [{"point": "Q", "type": "circle_circle_tangency", "of": ["A", "B"]}],
    }
    out, unsolved = resolve_constructions(viz)
    assert not unsolved, unsolved

    copies = []
    for layer in out["layers"]:
        for _, pt in _iter_points(layer):
            if pt.get("id") == "Q":
                copies.append((pt.get("x"), pt.get("y")))
    assert len(copies) == 2, f"expected both declarations of Q, got {copies}"
    assert all(abs(x - 0.0) < 1e-3 and abs(y - 1.0) < 1e-3 for x, y in copies), \
        f"every copy of Q must carry the solved value (0, 1): {copies}"
    print(f"[OK] both declarations of Q updated together: {copies} (was (2.4, 1.8) in each)")
    print("[PASS] test_solved_point_updates_every_copy")


if __name__ == "__main__":
    test_cascade_update_lines_and_circles()
    test_angle_bisector_primitive()
    test_nine_point_center_primitive()
    test_circle_line_intersection_primitive()
    test_circle_circle_intersection_primitive()
    test_viewbox_normalizer()
    test_implicit_extractor()
    test_point_on_circle_and_arc()
    test_tangent_arcs_in_right_triangle()
    test_single_tangency_without_a_full_triple()
    test_tangency_cases_c_and_d()
    test_solved_point_updates_every_copy()
    print("\n>>> ALL GEOMETRY PIPELINE TESTS PASSED! <<<")
