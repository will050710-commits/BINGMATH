"""
test_mathviz_contract.py
========================
Unit tests for the MathViz vocabulary contract (đợt 8 / 4I).

The bug this suite locks down: the system prompt taught the model four layer
kinds while the renderers understood more, and NOTHING reconciled the two — a
diagram with an ``arc``, an ``angle`` or a shaded ``region`` reached the
canvas with parts missing, no error, no log and no badge. Every assertion
below is about turning that silence into a report.

Run:  python backend/test_mathviz_contract.py
"""

import copy
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import mathviz_contract as mc

FAILED = []


def check(label, condition, detail=""):
    if condition:
        print(f"  [OK] {label}")
    else:
        FAILED.append(label)
        print(f"  [FAIL] {label} {detail}")


# ── 1. Vocabulary ────────────────────────────────────────────────────────────

def test_vocabulary():
    print("\n[vocabulary]")
    union = set().union(*[set(v) for v in mc.ENGINE_SUPPORT.values()])
    check("the contract kinds are exactly what some renderer draws",
          mc.LAYER_KINDS == union, f"only in LAYER_KINDS: {sorted(mc.LAYER_KINDS - union)}")
    check("every alias points at a contract kind",
          all(target in mc.LAYER_KINDS for target in mc.KIND_ALIASES.values()),
          str([t for t in mc.KIND_ALIASES.values() if t not in mc.LAYER_KINDS]))
    check("every kind has a documented usage example",
          set(mc._KIND_USAGE) == set(mc.LAYER_KINDS),
          f"missing usage: {sorted(set(mc.LAYER_KINDS) - set(mc._KIND_USAGE))}")
    check("every kind has a minimum point count",
          set(mc.MIN_POINTS) >= set(mc.LAYER_KINDS),
          f"missing: {sorted(set(mc.LAYER_KINDS) - set(mc.MIN_POINTS))}")
    check("the engine preference order only names known engines",
          set(mc.ENGINE_PREFERENCE) == set(mc.ENGINE_SUPPORT), str(mc.ENGINE_PREFERENCE))

    check("canonical_kind accepts a contract kind as-is", mc.canonical_kind("arc") == "arc")
    check("canonical_kind ignores case, spaces and dashes",
          mc.canonical_kind("  Sector ") == "sector"
          and mc.canonical_kind("filled-region") == "region")
    check("canonical_kind maps the alias spellings",
          mc.canonical_kind("wedge") == "sector"
          and mc.canonical_kind("shaded_region") == "region"
          and mc.canonical_kind("circumcircle") == "circle"
          and mc.canonical_kind("point") == "points")
    check("canonical_kind rejects an invented kind",
          mc.canonical_kind("spiral") == "" and mc.canonical_kind(None) == "")
    check("the construction parameter 'arc':'minor' is not read as a kind",
          mc.canonical_kind("minor") == "")
# ── 2. Point discovery ───────────────────────────────────────────────────────
#
# The exact figure from the reported problem: three arcs inside a 3-4-5 right
# triangle, each pair tangent, touching at P, Q, R — the "kì dị" shape the
# taught-four-kinds prompt could not express.
TANGENT_ARCS = {
    "type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite",
    "title": "Ba cung nội tiếp tam giác vuông $ABC$",
    "layers": [
        {"kind": "polygon", "points": [
            {"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 0, "y": 3},
            {"id": "C", "x": 4, "y": 0}]},
        {"kind": "arc", "center": {"id": "A", "x": 0, "y": 0},
         "from": {"id": "R", "x": 1, "y": 0}, "to": {"id": "P", "x": 0, "y": 1}},
        {"kind": "arc", "center": {"id": "B", "x": 0, "y": 3},
         "from": {"id": "Q", "x": 1.2, "y": 1.8}, "to": {"id": "P", "x": 0, "y": 1}},
        {"kind": "sector", "center": {"id": "C", "x": 4, "y": 0},
         "from": {"id": "Q", "x": 1.2, "y": 1.8}, "to": {"id": "R", "x": 1, "y": 0}},
        {"kind": "region", "fill": "rgba(148, 163, 184, 0.25)", "path": [
            {"type": "point", "id": "P", "x": 0, "y": 1},
            {"type": "arc", "center": {"id": "A", "x": 0, "y": 0},
             "from": {"id": "P", "x": 0, "y": 1}, "to": {"id": "Q", "x": 1.2, "y": 1.8}}]},
        {"kind": "angle", "points": ["B", "A", "C"], "right_angle": True},
        {"kind": "points", "data": [{"id": "A", "x": 0, "y": 0}, {"id": "P", "x": 0, "y": 1}]},
        {"kind": "label", "at": {"id": "Q", "x": 1.2, "y": 1.8}, "text": "$Q$"},
    ],
}


def test_point_discovery():
    print("\n[point discovery]")
    ids = {obj["id"] for layer in mc.layers_of(TANGENT_ARCS)
           for _, obj in mc.iter_point_dicts(layer) if "id" in obj}
    check("points nested in arc/sector/region/label are found",
          {"A", "B", "C", "P", "Q", "R"} <= ids, str(sorted(ids)))

    arc = TANGENT_ARCS["layers"][1]
    found = {key: obj.get("id") for key, obj in mc.iter_point_dicts(arc)}
    check("an arc's center/from/to are all collected",
          set(found) == {"center", "from", "to"} and set(found.values()) == {"A", "R", "P"},
          str(found))

    region = TANGENT_ARCS["layers"][4]
    refs = mc.reference_ids(region)
    check("a mixed region path contributes every id, point and arc alike",
          set(refs) == {"P", "A", "Q"}, str(refs))
    check("the region's own fill string is NOT mistaken for a point id",
          "rgba(148, 163, 184, 0.25)" not in refs)

    angle = TANGENT_ARCS["layers"][5]
    check("bare id strings in an angle are recognised as references",
          mc.reference_ids(angle) == ["B", "A", "C"], str(mc.reference_ids(angle)))

    circumcircle = {"kind": "circle", "through_3pts": ["A", "E", "F"], "r": 0}
    check("through_3pts ids are recognised (the prompt promises that feature)",
          mc.reference_ids(circumcircle) == ["A", "E", "F"],
          str(mc.reference_ids(circumcircle)))

    check("declared ids include constructions-only points",
          "H" in mc.declared_point_ids(
              {"layers": [],
               "constructions": [{"point": "H", "type": "orthocenter", "of": ["A", "B", "C"]}]}))
    check("iter_point_dicts yields the payload's OWN dicts (solvers edit in place)",
          next(iter(mc.iter_point_dicts(TANGENT_ARCS["layers"][2])))[1]
          is TANGENT_ARCS["layers"][2]["center"])
# ── 3. Reports ───────────────────────────────────────────────────────────────

def test_reports():
    print("\n[reports]")
    report = mc.render_report(TANGENT_ARCS)
    check("a fully declared arc/sector/region figure skips nothing",
          report["skipped"] == [], str(report["skipped"]))
    check("nothing in it is dangling", report["dangling"] == [], str(report["dangling"]))
    check("nothing in it is incomplete", report["incomplete"] == [], str(report["incomplete"]))
    check("jsxgraph is reported as the engine that can draw it all",
          report["engine_min"] == "jsxgraph", report["engine_min"])

    a_circle = {"kind": "circle", "center": {"id": "O", "x": 0, "y": 0},
                "r": 1.5, "through_3pts": ["A"]}
    dangling = mc.render_report({"layers": [a_circle]})
    check("a circle through an undeclared point is reported as dangling",
          dangling["dangling"] and dangling["dangling"][0]["ids"] == ["A"],
          str(dangling["dangling"]))
    check("...while 'r' still makes it drawable, so it is not also incomplete",
          dangling["incomplete"] == [], str(dangling["incomplete"]))

    thin = {"kind": "arc", "center": {"id": "O", "x": 0, "y": 0},
            "from": {"id": "A", "x": 1, "y": 0}}
    check("an arc missing its third point is reported incomplete",
          any(item["kind"] == "arc" for item in mc.render_report({"layers": [thin]})["incomplete"]))

    check("the reported engine really can draw every kind in the figure",
          "region" in mc.ENGINE_SUPPORT["jsxgraph"]
          and mc.render_report({
              "layers": [{"kind": "region", "path": [
                  {"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 1, "y": 0}]}]})["unsupported"] == [],
          "a region must be drawable, not reported as unsupported")
    # The Konva engine was REMOVED (it duplicated SVG/JSXGraph for every kind and
    # tripled the sync surface). The tables must not claim it again: a stale name
    # here would make `engine_min` pick an engine that no file implements.
    check("the removed Konva engine is not claimed anywhere",
          "konva" not in mc.ENGINE_SUPPORT and "konva" not in mc.ENGINE_PREFERENCE)
    check("no kind is left without an engine",
          all(any(kind in mc.ENGINE_SUPPORT[e] for e in mc.ENGINE_PREFERENCE)
              for kind in mc.LAYER_KINDS))

    # A point placed by a guaranteed property instead of exactly must be REPORTED,
    # and kept apart from the "unsolved" category.
    approx = mc.render_report({
        "layers": [{"kind": "points", "data": [{"id": "Q", "x": 0, "y": 1}]}],
        "_constructions_approximate": ["Q"],
    })
    check("an approximate construction is carried into the render report",
          approx["approximate"] == ["Q"], str(approx["approximate"]))
    check("a payload without approximations reports an empty list, not None",
          mc.render_report({"layers": []})["approximate"] == [])
# ── 4. normalize_geometry_2d ─────────────────────────────────────────────────

def test_normalize():
    print("\n[normalize_geometry_2d]")
    payload = copy.deepcopy(TANGENT_ARCS)
    payload["layers"].append({"kind": "spiral_of_archimedes", "turns": 4})
    payload["layers"].append({"kind": "wedge", "center": {"id": "A", "x": 0, "y": 0},
                              "from": {"id": "R", "x": 1, "y": 0},
                              "to": {"id": "P", "x": 0, "y": 1}})
    before = copy.deepcopy(payload)

    out, report = mc.normalize_geometry_2d(payload)

    check("the input payload is never mutated", payload == before)
    check("the invented kind is dropped, not silently kept",
          all(layer.get("kind") != "spiral_of_archimedes" for layer in out["layers"]))
    check("the dropped layer is named with its index and a reason",
          report["skipped"] == [{"index": 8, "kind": "spiral_of_archimedes",
                                 "reason": "unknown_kind"}], str(report["skipped"]))
    check("the alias 'wedge' is rewritten to 'sector', with an audit trail",
          out["layers"][8]["kind"] == "sector"
          and report["mapped"] == [{"index": 9, "from": "wedge", "to": "sector"}],
          str(report["mapped"]))
    check("the report is stamped on the payload for the UI to read",
          out["_render"]["engine_min"] == "jsxgraph"
          and out["_render"]["skipped"] == report["skipped"])
    check("a non-geometry widget passes through untouched",
          mc.normalize_geometry_2d({"widget": "function_plot", "expr": "x^2"})[1]["engine_min"] == "")
    check("a layer that is not an object is reported instead of crashing",
          mc.normalize_geometry_2d(
              {"widget": "geometry_2d", "layers": ["A,B,C"]})[1]["skipped"][0]["index"] == 0)


# ── 5. Construction vocabulary ───────────────────────────────────────────────

def test_constructions():
    print("\n[construction vocabulary]")
    known = mc.construction_types()
    check("the analytic solver's own vocabulary is the authority",
          "orthocenter" in known and "point_on_arc" in known)
    check("an implemented construction is not flagged",
          mc.unknown_construction_types(
              {"constructions": [{"point": "H", "type": "orthocenter",
                                  "of": ["A", "B", "C"]}]}) == [])
    unknown = mc.unknown_construction_types({
        "constructions": [
            {"point": "Q", "type": "tangency", "of": ["B", "C"]},
            {"point": "H", "type": "orthocenter", "of": ["A", "B", "C"]}]})
    check("a construction the solver cannot resolve is reported with its point",
          unknown == [{"index": 0, "point": "Q", "type": "tangency"}], str(unknown))

    prompt = mc.prompt_vocabulary()
    check("the prompt table teaches every contract kind",
          all(k in prompt for k in mc.LAYER_KINDS))
    check("the prompt table forbids inventing a kind",
          "KHÔNG bịa kind mới" in prompt and "polyline" in prompt)
    check("the repair prompt carries both vocabularies",
          "layers" in mc.repair_vocabulary() and "constructions" in mc.repair_vocabulary())


# ── 5. Plain-fence recovery (P15-fix) ───────────────────────────────────────

def test_fence_recovery():
    print("\n[fence recovery]")
    payload = '{"type":"mathviz.v1","widget":"geometry_2d","mode":"triangle"}'
    text, data = mc.recover_fenced_mathviz(f"Lời giải ngắn.\n\n```json\n{payload}\n```")
    check("a ```json-fenced mathviz payload is recovered",
          isinstance(data, dict) and data.get("widget") == "geometry_2d")
    check("...and the block is removed from the visible text",
          text == "Lời giải ngắn." and "```" not in text)
    t2, d2 = mc.recover_fenced_mathviz(f"Thử lại.\n```\n{payload}\n```")
    check("a BARE fence is recovered too",
          isinstance(d2, dict) and t2 == "Thử lại.")
    _t3, d3 = mc.recover_fenced_mathviz(f"```javascript\n{payload}\n```")
    check("a ```javascript fence is recovered", isinstance(d3, dict))
    check("the canonical ```mathviz fence is left to main.py (skipped here)",
          mc.recover_fenced_mathviz("```mathviz\n" + payload + "\n```") == (None, None))
    check("an unrelated JSON code block is NOT stolen",
          mc.recover_fenced_mathviz('```json\n{"a": 1}\n```') == (None, None))
    check("an unparseable payload returns nothing (never a guess)",
          mc.recover_fenced_mathviz("```json\n{broken,,,\n```") == (None, None))
    check("a wrong declared type is not claimed",
          mc.recover_fenced_mathviz('```json\n{"type":"other.v1","widget":"geometry_2d"}\n```') == (None, None))
    _t4, d4 = mc.recover_fenced_mathviz('```json\n{"widget":"geometry_2d","layers":[]}\n```')
    check("a missing type is defaulted to mathviz.v1",
          isinstance(d4, dict) and d4.get("type") == "mathviz.v1")
    check("non-string input is refused",
          mc.recover_fenced_mathviz(None) == (None, None))


if __name__ == "__main__":
    test_vocabulary()
    test_point_discovery()
    test_reports()
    test_normalize()
    test_constructions()
    test_fence_recovery()
    if FAILED:
        print(f"\n>>> {len(FAILED)} MATHVIZ CONTRACT CHECKS FAILED: {FAILED} <<<")
        sys.exit(1)
    print("\n>>> ALL MATHVIZ CONTRACT TESTS PASSED! <<<")