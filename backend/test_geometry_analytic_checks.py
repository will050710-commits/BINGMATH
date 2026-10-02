"""test_geometry_analytic_checks.py — the Shapely/SymPy gate, offline suite.
Needs sympy + shapely (both in requirements.txt; the CI job installs them).
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import geometry_analytic_checks as gac  # noqa: E402

checks = 0
failures = 0


def check(label, ok, detail=""):
    global checks, failures
    checks += 1
    if ok:
        print(f"  [OK] {label}")
    else:
        failures += 1
        print(f"  [FAIL] {label} {detail}")


def codes(conflicts):
    return [c["code"] for c in conflicts]


print("=== engines ===")
engines = gac.engines()
check("shapely is importable (requirements.txt ships it)", engines["shapely"], str(engines))
check("sympy is importable (requirements.txt ships it)", engines["sympy"], str(engines))

print("\n=== a clean figure stays quiet ===")
clean = {
    "widget": "geometry_2d",
    "layers": [
        {"kind": "points", "data": [
            {"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 4, "y": 0},
            {"id": "C", "x": 0, "y": 3}, {"id": "D", "x": 0, "y": 4},
            {"id": "P1", "x": 3, "y": 0}, {"id": "P2", "x": 0, "y": 3},
            {"id": "P3", "x": -3, "y": 0}]},
        {"kind": "polygon", "points": [
            {"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 4, "y": 0},
            {"id": "C", "x": 0, "y": 3}]},
        {"kind": "angle", "points": ["B", "A", "C"], "right_angle": True},
        {"kind": "arc", "center": {"id": "A", "x": 0, "y": 0},
         "from": {"id": "B", "x": 4, "y": 0}, "to": {"id": "D", "x": 0, "y": 4}},
        {"kind": "circle", "center": {"id": "O", "x": 0, "y": 0}, "r": 3,
         "through_3pts": ["P1", "P2", "P3"]},
    ],
}
clean_conflicts = gac.check_geometry_2d(clean)
check("right angle + round arc + centred circle produce NO conflict",
      clean_conflicts == [], str(codes(clean_conflicts)))

print("\n=== bow-tie polygon (Shapely) ===")
bowtie = {"widget": "geometry_2d", "layers": [
    {"kind": "polygon", "points": [
        {"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 2, "y": 2},
        {"id": "C", "x": 0, "y": 2}, {"id": "D", "x": 2, "y": 0}]}]}
bow_conflicts = gac.check_geometry_2d(bowtie)
check("a self-intersecting polygon is reported",
      "polygon_self_intersects" in codes(bow_conflicts), str(codes(bow_conflicts)))
check("...as an error, with a Vietnamese sentence for the UI",
      all(c["severity"] == "error" and c["message_vi"] for c in bow_conflicts),
      str(bow_conflicts))

print("\n=== arc that misses its own circle ===")
off_arc = {"widget": "geometry_2d", "layers": [
    {"kind": "arc", "center": {"id": "O", "x": 0, "y": 0},
     "from": {"id": "P", "x": 1, "y": 0}, "to": {"id": "Q", "x": 0, "y": 2}}]}
off_conflicts = gac.check_geometry_2d(off_arc)
check("r1≠r2 on an arc is reported",
      "arc_endpoints_off_circle" in codes(off_conflicts), str(codes(off_conflicts)))

print("\n=== the same point id declared twice ===")
dual = {"widget": "geometry_2d", "layers": [
    {"kind": "points", "data": [{"id": "M", "x": 1, "y": 1}]},
    {"kind": "line", "from": {"id": "M", "x": 5, "y": 5},
     "to": {"id": "N", "x": 0, "y": 0}}]}
dual_conflicts = gac.check_geometry_2d(dual)
check("point_id_conflict is reported (order-dependent figure!)",
      "point_id_conflict" in codes(dual_conflicts), str(codes(dual_conflicts)))

print("\n=== declared right angle that is not one ===")
wrong_angle = {"widget": "geometry_2d", "layers": [
    {"kind": "points", "data": [
        {"id": "E", "x": 1, "y": 0}, {"id": "V", "x": 0, "y": 0},
        {"id": "F", "x": 0.5, "y": 1}]},
    {"kind": "angle", "points": ["E", "V", "F"], "right_angle": True}]}
wrong_conflicts = gac.check_geometry_2d(wrong_angle)
check("right_angle_mismatch is reported",
      "right_angle_mismatch" in codes(wrong_conflicts), str(codes(wrong_conflicts)))

print("\n=== non-finite coordinates ===")
nan_fig = {"widget": "geometry_2d", "layers": [
    {"kind": "points", "data": [{"id": "Z", "x": float("nan"), "y": 0}]}]}
check("NaN survives isinstance and is still caught",
      "non_finite_coordinates" in codes(gac.check_geometry_2d(nan_fig)))

print("\n=== circle centre vs through_3pts ===")
bad_circle = {"widget": "geometry_2d", "layers": [
    {"kind": "points", "data": [
        {"id": "K1", "x": 1, "y": 0}, {"id": "K2", "x": 2, "y": 0},
        {"id": "K3", "x": 3, "y": 0}]},
    {"kind": "circle", "center": {"id": "O", "x": 0, "y": 0}, "r": 1,
     "through_3pts": ["K1", "K2", "K3"]}]}
check("circle_center_not_equidistant is reported",
      "circle_center_not_equidistant" in codes(gac.check_geometry_2d(bad_circle)))

print("\n=== sympy exact second opinion ===")
if engines["sympy"]:
    check("exact check agrees a true right angle is right",
          gac._exact_right_angle((1.0, 0.0), (0.0, 0.0), (0.0, 1.0)) is True)
    check("exact check agrees an 89° angle is not one",
          gac._exact_right_angle((1.0, 0.0), (0.0, 0.0), (0.0174524, 0.9998477)) is False)

print("\n=== never crashes on junk ===")
check("a non-geometry widget passes through", gac.check_geometry_2d({"widget": "function_plot"}) == [])
check("a non-dict layer is skipped",
      gac.check_geometry_2d({"widget": "geometry_2d", "layers": ["A,B,C"]}) == [])
check("an empty payload passes", gac.check_geometry_2d({"widget": "geometry_2d", "layers": []}) == [])
many = {"widget": "geometry_2d", "layers": (
    [{"kind": "points", "data": [{"id": f"P{i}", "x": i, "y": 0}]} for i in range(3)]
    + [{"kind": "points", "data": [{"id": f"P{i}", "x": i + 10, "y": 10}]} for i in range(15)])}
capped = gac.check_geometry_2d(many)
check("the conflict list is capped for the UI chip", 0 < len(capped) <= 12, str(len(capped)))

print(f"\n{checks - failures}/{checks} GEOMETRY ANALYTIC CHECKS PASSED")
if failures > 0:
    print(">>> ANALYTIC CHECKS SUITE FAILED — see the [FAIL] lines above <<<")
    sys.exit(1)