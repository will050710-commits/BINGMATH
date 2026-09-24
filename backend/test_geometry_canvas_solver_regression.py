"""
Regression tests for geometry_canvas_solver.auto_align_geometry_mathviz.

WHY THIS FILE EXISTS (the incident these tests lock down)
=========================================================
`auto_align_geometry_mathviz` does not "align" an arbitrary figure — it
REPLACES every coordinate with one hardcoded, memorized Olympiad template
(A=(-0.8,3.5), B=(-2.5,-1.8), C=(3.0,-1.8), ... through Q). That is only
correct for the single problem that template was derived from.

Two defects let it fire on unrelated diagrams and silently destroy the
real figure:

  1. TRIGGER TOO BROAD — it fired whenever the point ids H, D, E and F were
     all present, or when the title merely contained "EULER" / "9 DIEM".
     A three-altitude-foot triangle is an ordinary problem, and the
     nine-point circle is a standard Vietnamese geometry topic, so almost
     everything matched. Result: a 17-point (A..Q) diagram had all 17
     coordinates replaced by the template and every label collapsed into
     one tiny cluster on screen.

  2. MISSING `import re` — the circle-label branch called re.findall() in a
     module that never imported `re`, so any payload containing a circle
     layer raised NameError. main.py wraps this whole chain in
     `except Exception: logger.debug(...)`, so the error was swallowed:
     the "general angle/collinearity snapper" and the QA verification gate
     (both later in that same try block) never ran at all.

The companion test_geometry_construction_solver.py suite still passed while
both bugs were live, because its guard cases contain no circle layer and
never combine H+D+E+F. These tests cover those exact gaps.
"""

import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from geometry_canvas_solver import auto_align_geometry_mathviz

# The memorized template's exact coordinates — used to prove the solver did
# NOT fire (a real figure must never end up with these values).
TEMPLATE_A = (-0.8, 3.5)
TEMPLATE_B = (-2.5, -1.8)
TEMPLATE_C = (3.0, -1.8)


def _coords(viz):
    """Flatten every declared point id -> (x, y) from a payload."""
    out = {}
    for lay in viz.get("layers", []):
        if lay.get("kind") in ("polygon", "triangle"):
            for p in lay.get("points", []):
                out[p["id"]] = (p["x"], p["y"])
        elif lay.get("kind") == "points":
            for p in lay.get("data", []):
                out[p["id"]] = (p["x"], p["y"])
    return out


def _seventeen_point_payload(title, with_circle=True):
    """The A..Q diagram that rendered garbled — includes H, D, E and F."""
    layers = [
        {"kind": "polygon", "points": [
            {"id": "A", "x": 0.0, "y": 4.2},
            {"id": "B", "x": -3.1, "y": -0.4},
            {"id": "C", "x": 3.2, "y": -0.6},
        ]},
        {"kind": "points", "data": [
            {"id": i, "x": x, "y": y} for i, x, y in [
                ("D", 1.4, 2.4), ("E", 2.2, 1.1), ("F", -1.8, 1.9),
                ("G", 2.6, 3.4), ("H", -0.2, 1.5), ("I", 0.4, 2.6),
                ("J", -0.1, 1.9), ("K", 1.5, -0.5), ("L", 1.1, 1.2),
                ("M", 0.9, 1.4), ("N", 2.0, 0.3), ("O", 0.2, 1.0),
                ("P", -4.0, -1.2), ("Q", 2.9, 1.9),
            ]
        ]},
    ]
    if with_circle:
        # Verbose label: this is also the exact shape that used to crash with
        # "NameError: name 're' is not defined".
        layers.append({
            "kind": "circle", "label": "(O) ngoại tiếp",
            "center": {"id": "O", "x": 0.2, "y": 1.0}, "r": 3.4,
        })
    return {"type": "mathviz.v1", "widget": "geometry_2d", "title": title, "layers": layers}


def test_altitude_cluster_does_not_trigger_template():
    """H+D+E+F present is NOT a reason to overwrite the figure (defect 1)."""
    viz = _seventeen_point_payload("Hình học Olympiad tổng hợp")
    before = _coords(viz)
    result = auto_align_geometry_mathviz(viz)
    after = _coords(result)

    assert not result.get("_olympiad_aligned"), \
        "Template solver must NOT run for an ordinary altitude-foot figure"
    assert after == before, "Coordinates were modified for a non-template diagram"
    assert after["A"] != TEMPLATE_A, "Point A was overwritten with template coordinates"
    print("[OK] test_altitude_cluster_does_not_trigger_template passed.")


def test_nine_point_circle_keyword_does_not_trigger_template():
    """"Euler (9 điểm)" in a title must not select this one memorized problem."""
    viz = _seventeen_point_payload("Đường tròn Euler (9 điểm) của tam giác ABC")
    before = _coords(viz)
    result = auto_align_geometry_mathviz(viz)

    assert not result.get("_olympiad_aligned"), \
        "Nine-point-circle titles are ordinary problems, not this template"
    assert _coords(result) == before, "Coordinates were overwritten for a 9-point-circle title"
    print("[OK] test_nine_point_circle_keyword_does_not_trigger_template passed.")


def test_circle_layer_does_not_raise_missing_import():
    """Defect 2: a circle layer used to raise NameError on re.findall()."""
    viz = _seventeen_point_payload("Hình học Olympiad tổng hợp", with_circle=True)
    try:
        auto_align_geometry_mathviz(viz)
    except NameError as e:
        raise AssertionError(f"missing import still present: {e}")

    # A payload that DOES trip the template must also survive a circle layer.
    template_viz = {
        "widget": "geometry_2d",
        "title": "BÀI TOÁN CEVIAN VỚI ĐƯỜNG TRÒN NGOẠI TIẾP",
        "layers": [
            {"kind": "polygon", "points": [
                {"id": "A", "x": 0.0, "y": 4.0},
                {"id": "B", "x": -3.0, "y": 0.0},
                {"id": "C", "x": 3.0, "y": 0.0},
            ]},
            {"kind": "points", "data": [
                {"id": "D", "x": 1.0, "y": 1.0},
                {"id": "E", "x": 2.0, "y": 1.0},
                {"id": "F", "x": -1.0, "y": 1.0},
                {"id": "H", "x": 0.0, "y": 1.0},
            ]},
            {"kind": "circle", "label": "(O) ngoại tiếp",
             "center": {"id": "O", "x": 0.0, "y": 0.0}, "r": 3.0},
        ],
    }
    result = auto_align_geometry_mathviz(template_viz)
    circles = [l for l in result["layers"] if l.get("kind") == "circle"]
    assert circles, "All circle layers were dropped"
    # The circumcircle must be re-centred on the exact O with the exact
    # circumradius — i.e. the branch ran instead of crashing. (A second,
    # auto-inserted Euler circle is expected here; that is intended behaviour
    # of this template, so match on through_3pts rather than on a count.)
    circ = [l for l in circles if l.get("through_3pts") == ["A", "B", "C"]]
    assert len(circ) == 1, "The circumcircle was not re-centred on the exact O"
    assert circ[0]["center"]["id"] == "O"
    assert circ[0]["r"] > 0
    print("[OK] test_circle_layer_does_not_raise_missing_import passed.")


def test_verbose_circle_label_is_not_mistaken_for_aef_circle():
    """A verbose label containing the letters A, F, E is not the (AEF) circle."""
    viz = {
        "widget": "geometry_2d",
        "title": "BÀI TOÁN CEVIAN",
        "layers": [
            {"kind": "polygon", "points": [
                {"id": "A", "x": 0.0, "y": 4.0},
                {"id": "B", "x": -3.0, "y": 0.0},
                {"id": "C", "x": 3.0, "y": 0.0},
            ]},
            {"kind": "points", "data": [{"id": "H", "x": 0.0, "y": 1.0}]},
            {"kind": "circle", "label": "CIRCUMCIRCLE OF ABC",
             "center": {"id": "O", "x": 0.0, "y": 0.0}, "r": 3.0},
            {"kind": "circle", "label": "(AEF)",
             "center": {"id": "I", "x": 0.0, "y": 0.0}, "r": 1.0},
        ],
    }
    result = auto_align_geometry_mathviz(viz)

    # (AEF) is the real match: re-centred on I, marked solid, through A/E/F.
    aef = [l for l in result["layers"]
           if l.get("kind") == "circle" and l.get("through_3pts") == ["A", "E", "F"]]
    assert len(aef) == 1, "The (AEF) circle was not recognised"
    assert aef[0]["style"] == "solid"

    # The verbose circumcircle label must keep the circumcircle treatment.
    circ = [l for l in result["layers"]
            if l.get("kind") == "circle" and l.get("through_3pts") == ["A", "B", "C"]]
    assert len(circ) == 1, "'CIRCUMCIRCLE OF ABC' was misclassified as the (AEF) circle"
    print("[OK] test_verbose_circle_label_is_not_mistaken_for_aef_circle passed.")


def test_real_template_still_works():
    """The one memorized problem must keep working (no over-correction)."""
    euler_viz = {
        "widget": "geometry_2d",
        "title": "BÀI TOÁN EULER (9 ĐIỂM) VÀ CEVIAN",
        "layers": [
            {"kind": "polygon", "points": [
                {"id": "A", "x": 0.0, "y": 3.0},
                {"id": "B", "x": -2.0, "y": -1.0},
                {"id": "C", "x": 3.0, "y": -1.0},
            ]},
            {"kind": "points", "data": [{"id": "H", "x": 0.0, "y": 0.0}]},
        ],
    }
    result = auto_align_geometry_mathviz(euler_viz)
    coords = _coords(result)
    assert result.get("_olympiad_aligned") is True, "Template should fire for a CEVIAN problem"
    assert coords["A"] == TEMPLATE_A, f"Expected A={TEMPLATE_A}, got {coords['A']}"
    assert coords["B"] == TEMPLATE_B, f"Expected B={TEMPLATE_B}, got {coords['B']}"
    assert coords["C"] == TEMPLATE_C, f"Expected C={TEMPLATE_C}, got {coords['C']}"
    print("[OK] test_real_template_still_works passed.")


if __name__ == "__main__":
    test_altitude_cluster_does_not_trigger_template()
    test_nine_point_circle_keyword_does_not_trigger_template()
    test_circle_layer_does_not_raise_missing_import()
    test_verbose_circle_label_is_not_mistaken_for_aef_circle()
    test_real_template_still_works()
    print("\n>>> ALL CANVAS-SOLVER OVERWRITE REGRESSION TESTS PASSED! <<<")