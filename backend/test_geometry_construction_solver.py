"""
Test Suite for geometry_construction_solver and geometry_canvas_solver Guard
"""
import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from geometry_construction_solver import resolve_constructions
from geometry_canvas_solver import auto_align_geometry_mathviz


def test_construction_solver_basic():
    sample_viz = {
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
                    {"id": "M", "x": 88.0, "y": 88.0},
                    {"id": "G", "x": 77.0, "y": 77.0},
                    {"id": "O", "x": 66.0, "y": 66.0},
                ],
            },
        ],
        "constructions": [
            {"point": "H", "type": "orthocenter", "of": ["A", "B", "C"]},
            {"point": "M", "type": "midpoint", "of": ["A", "H"]},
            {"point": "G", "type": "centroid", "of": ["A", "B", "C"]},
            {"point": "O", "type": "circumcenter", "of": ["A", "B", "C"]},
        ],
    }

    resolved, unsolved = resolve_constructions(sample_viz)
    assert not unsolved, f"Expected no unsolved points, got {unsolved}"

    coords = {}
    for lay in resolved["layers"]:
        if lay.get("kind") == "points":
            for pt in lay["data"]:
                coords[pt["id"]] = (pt["x"], pt["y"])

    assert coords["H"] == (0.0, 2.25), f"Expected H=(0.0, 2.25), got {coords['H']}"
    assert coords["M"] == (0.0, 3.125), f"Expected M=(0.0, 3.125), got {coords['M']}"
    assert coords["G"] == (0.0, 1.3333), f"Expected G=(0.0, 1.3333), got {coords['G']}"
    assert coords["O"] == (0.0, 0.875), f"Expected O=(0.0, 0.875), got {coords['O']}"
    print("[OK] test_construction_solver_basic passed.")


def test_geometry_canvas_solver_guard_with_constructions():
    custom_viz = {
        "widget": "geometry_2d",
        "title": "A General Olympiad Problem with Points G, L, K, P",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 10.0, "y": 20.0},
                    {"id": "B", "x": -10.0, "y": -5.0},
                    {"id": "C", "x": 15.0, "y": -5.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "G", "x": 5.0, "y": 3.33},
                    {"id": "L", "x": 2.0, "y": 8.0},
                    {"id": "K", "x": 1.0, "y": -5.0},
                    {"id": "P", "x": -15.0, "y": -10.0},
                ],
            },
        ],
        "constructions": [
            {"point": "G", "type": "centroid", "of": ["A", "B", "C"]},
        ],
    }

    result = auto_align_geometry_mathviz(custom_viz)
    poly = [lay for lay in result["layers"] if lay.get("kind") == "polygon"][0]
    pt_A = [p for p in poly["points"] if p["id"] == "A"][0]
    assert pt_A["x"] == 10.0 and pt_A["y"] == 20.0, "Guard failed: coordinates were overwritten!"
    print("[OK] test_geometry_canvas_solver_guard_with_constructions passed.")


def test_geometry_canvas_solver_guard_no_false_positive_letters():
    general_viz = {
        "widget": "geometry_2d",
        "title": "Tam Giác ABC và các điểm ngẫu nhiên",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 1.0, "y": 5.0},
                    {"id": "B", "x": -2.0, "y": 0.0},
                    {"id": "C", "x": 4.0, "y": 0.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "G", "x": 1.0, "y": 1.67},
                    {"id": "L", "x": 0.0, "y": 2.5},
                    {"id": "K", "x": 2.0, "y": 0.0},
                    {"id": "P", "x": -3.0, "y": -1.0},
                ],
            },
        ],
    }

    result = auto_align_geometry_mathviz(general_viz)
    poly = [lay for lay in result["layers"] if lay.get("kind") == "polygon"][0]
    pt_A = [p for p in poly["points"] if p["id"] == "A"][0]
    assert (pt_A["x"], pt_A["y"]) == (1.0, 5.0), f"Guard failed: point A was overwritten to {(pt_A['x'], pt_A['y'])}"
    print("[OK] test_geometry_canvas_solver_guard_no_false_positive_letters passed.")


def test_geometry_canvas_solver_legitimate_template_trigger():
    euler_viz = {
        "widget": "geometry_2d",
        "title": "BÀI TOÁN EULER (9 ĐIỂM) VÀ CEVIAN",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 3.0},
                    {"id": "B", "x": -2.0, "y": -1.0},
                    {"id": "C", "x": 3.0, "y": -1.0},
                ],
            },
            {
                "kind": "points",
                "data": [
                    {"id": "H", "x": 0.0, "y": 0.0},
                ],
            },
        ],
    }

    result = auto_align_geometry_mathviz(euler_viz)
    poly = [lay for lay in result["layers"] if lay.get("kind") == "polygon"][0]
    pt_A = [p for p in poly["points"] if p["id"] == "A"][0]
    assert (pt_A["x"], pt_A["y"]) == (-0.8, 3.5), f"Euler template failed to trigger: {pt_A}"
    print("[OK] test_geometry_canvas_solver_legitimate_template_trigger passed.")


if __name__ == "__main__":
    test_construction_solver_basic()
    test_geometry_canvas_solver_guard_with_constructions()
    test_geometry_canvas_solver_guard_no_false_positive_letters()
    test_geometry_canvas_solver_legitimate_template_trigger()
    print("\n>>> ALL CONSTRUCTION & CANVAS SOLVER TESTS PASSED! <<<")
