"""
test_geogebra_export.py
=======================
Offline suite for the GeoGebra exporter (Roadmap Q4/2026 item 2).

Runs with plain Python — no fastapi, no network, no `import main` — so it can
gate every push, exactly like the other offline suites. It does not just check
"a file came out": it re-opens the .ggb, parses geogebra.xml and holds the
result against the GeoGebra manual, because a worksheet that silently loses an
object (or moves it) is worse than no export at all.

What is asserted:
  * the archive: one member, `geogebra.xml`, decodable, no CRC errors;
  * the document skeleton the manual requires (gui / euclidianView with its
    required children and two axes / kernel / construction);
  * every tag is one the manual documents for its parent, and every element
    `type` is a documented `elType` — the oracle that catches a typo such as
    `<objcolor>` before it reaches a student's file;
  * deterministic output (same figure -> identical bytes);
  * unsupported layers are reported, never dropped in silence;
  * labels are valid, unique, and keep the figure's own text as a caption;
  * scripting cannot run in the exported file.

Run:  python backend/test_geogebra_export.py
"""

import io
import os
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import geogebra_export as gx  # noqa: E402

checks = 0
failures = []


def check(label, condition, detail=""):
    global checks
    checks += 1
    if condition:
        print(f"  ok   {label}")
    else:
        failures.append(label)
        print(f"  FAIL {label} {detail}")


# ── the GeoGebra manual, transcribed ─────────────────────────────────────────
#
# Sources: "XML tags in geogebra.xml" and "Common XML tags and types"
# (geogebra.github.io/docs/reference). The suite treats these two lists as the
# contract: a tag or an element type outside them is a bug in the exporter, not
# a detail to be tolerated.

TOP_LEVEL = ("gui", "euclidianView", "kernel", "scripting", "construction")

ELEMENT_CHILDREN = {
    "absoluteScreenLocation", "allowReflexAngle", "animation", "arcSize", "auxiliary",
    "bgColor", "caption", "checkbox", "coefficients", "comboBox", "condition", "coords",
    "coordStyle", "decoration", "eigenvectors", "emphasizeRightAngle", "eqnStyle", "file",
    "fixed", "font", "forceReflexAngle", "ggbscript", "inBackground", "interpolate",
    "isLaTeX", "isShape", "javascript", "keepTypeOnTransform", "labelMode", "labelOffset",
    "layer", "levelOfDetail", "lineStyle", "linkedGeo", "listType", "matrix", "objColor",
    "outlyingIntersections", "pointSize", "pointStyle", "show", "startPoint", "value",
}

EUCLIDIAN_CHILDREN = {
    "viewNumber", "size", "coordSystem", "evSettings", "bgColor", "axesColor", "gridColor",
    "lineStyle", "axis", "grid",
}

ELTYPE_RE = re.compile(
    r"^(angle|line|plane|point|polygon|polyline|ray|segment|vector|"
    r"(curve|surface)cartesian|implicit(poly|surface))(3d)?$"
)
ELTYPE_ALTS = {
    "boolean", "button", "conic", "conic3d", "function", "image", "list", "locus", "numeric",
    "quadric", "text", "textfield", "turtle", "net", "polyhedron", "penstroke", "audio",
    "video", "embed",
}

TYPES = ("point", "segment", "line", "polygon", "conic")

# A realistic payload: the worked example the backend itself shows for
# geometry_2d (triangle, circumcircle / nine-point circle, altitudes, plus a
# free point set), with an unsupported layer appended on purpose.
DEMO = {
    "type": "mathviz.v1",
    "widget": "geometry_2d",
    "title": "Cấu trúc hình học phẳng $\\triangle ABC$ & trực tâm $H$",
    "mode": "composite",
    "layers": [
        {"kind": "polygon",
         "points": [{"id": "A", "x": -0.8, "y": 3.5}, {"id": "B", "x": -2.5, "y": -1.8},
                    {"id": "C", "x": 3.0, "y": -1.8}],
         "fill": "rgba(59, 130, 246, 0.05)", "color": "#ffffff", "strokeWidth": 2.0},
        {"kind": "circle", "center": {"x": 0.25, "y": 0.24}, "r": 3.42,
         "color": "#3b82f6", "label": "Đường tròn ngoại tiếp (O)", "style": "solid"},
        {"kind": "circle", "center": {"x": -0.8, "y": 1.46}, "r": 2.04,
         "color": "#ec4899", "label": "Đường tròn đường kính AH (I)", "style": "solid"},
        {"kind": "circle", "center": {"x": -0.28, "y": -0.17}, "r": 1.71,
         "color": "#10b981", "label": "Đường tròn Euler (9 điểm)", "style": "dashed"},
        {"kind": "line", "from": {"id": "A", "x": -0.8, "y": 3.5},
         "to": {"id": "D", "x": -0.8, "y": -1.8}, "color": "#f43f5e",
         "label": "Đường cao AD", "style": "solid"},
        {"kind": "line", "from": {"id": "B", "x": -2.5, "y": -1.8},
         "to": {"id": "E", "x": 1.13, "y": 0.81}, "color": "#f43f5e",
         "label": "Đường cao BE", "style": "solid"},
        {"kind": "points", "data": [{"id": "H", "x": -0.8, "y": 1.46},
                                    {"id": "O", "x": 0.25, "y": 0.24},
                                    {"id": "M'", "x": 0.62, "y": -0.2}]},
        {"kind": "arc", "center": {"x": 0.0, "y": 0.0}, "r": 1.0, "label": "cung thử"},
    ],
}


def open_ggb(data):
    """Return (zip, xml_text, root) for an exported .ggb."""
    archive = zipfile.ZipFile(io.BytesIO(data))
    xml_text = archive.read(gx.GGB_MEMBER).decode("utf-8")
    return archive, xml_text, ET.fromstring(xml_text)


def elements_of(root):
    construction = root.find("construction")
    return list(construction.findall("element"))


def expressions_of(root):
    construction = root.find("construction")
    return list(construction.findall("expression"))


def by_tag(root, tag):
    return root.iter(tag)


# ── 1. the archive ───────────────────────────────────────────────────────────

def test_archive_shape():
    print("\n[archive]")
    data, report = gx.build_ggb(DEMO)
    check("build_ggb returns bytes", isinstance(data, bytes) and len(data) > 0)
    archive, xml_text, root = open_ggb(data)
    check("archive holds exactly geogebra.xml", archive.namelist() == [gx.GGB_MEMBER], str(archive.namelist()))
    check("no CRC/decompression error", archive.testzip() is None)
    check("member is UTF-8 text", xml_text.startswith("<?xml version=\"1.0\" encoding=\"utf-8\"?>"))
    check("root element is <geogebra>", root.tag == "geogebra", root.tag)
    check("declares the 5.0 file format", root.get("format") == gx.GGB_FORMAT)
    check("declares an app", root.get("app") == gx.GGB_APP)
    check("carries the reported file id", root.get("id") == report["id"], str(root.get("id")))
    check("points at the published XSD",
          root.get("{http://www.w3.org/2001/XMLSchema-instance}noNamespaceSchemaLocation") == gx.GGB_XSD)


def test_scripting_is_disabled():
    print("\n[scripting]")
    _, _, root = open_ggb(gx.build_ggb(DEMO)[0])
    scripting = root.find("scripting")
    check("a <scripting> block exists", scripting is not None)
    check("scripting is blocked", scripting is not None and scripting.get("blocked") == "true")
    check("scripting is disabled", scripting is not None and scripting.get("disabled") == "true")
    check("no javascript/ggbscript in any element", not list(by_tag(root, "javascript"))
          and not list(by_tag(root, "ggbscript")))


# ── 2. the document skeleton the manual requires ─────────────────────────────

def test_document_skeleton():
    print("\n[document]")
    _, _, root = open_ggb(gx.build_ggb(DEMO)[0])
    check("top-level sections are the documented ones",
          tuple(child.tag for child in root) == TOP_LEVEL, str([c.tag for c in root]))

    gui = root.find("gui")
    check("<gui> has a window", gui.find("window") is not None)
    check("window carries width and height",
          bool(gui.find("window").get("width") and gui.find("window").get("height")))

    view = root.find("euclidianView")
    for required in ("coordSystem", "evSettings", "bgColor", "axesColor", "gridColor", "lineStyle"):
        check(f"<euclidianView> has the required <{required}>", view.find(required) is not None)
    axes = view.findall("axis")
    check("exactly two axes", len(axes) == 2, str(len(axes)))
    check("axis ids are 0 and 1", [a.get("id") for a in axes] == ["0", "1"])
    check("every euclidianView child is documented",
          all(child.tag in EUCLIDIAN_CHILDREN for child in view),
          str([c.tag for c in view if c.tag not in EUCLIDIAN_CHILDREN]))

    kernel = root.find("kernel")
    check("kernel sets the angle unit to degrees", kernel.find("angleUnit").get("val") == "degree")
    check("kernel has decimals + coordStyle",
          kernel.find("decimals") is not None and kernel.find("coordStyle") is not None)

    construction = root.find("construction")
    check("construction carries the widget title", construction.get("title") == DEMO["title"],
          str(construction.get("title")))


# ── 3. the schema oracle ─────────────────────────────────────────────────────

def test_element_tags_are_documented():
    print("\n[tags]")
    _, _, root = open_ggb(gx.build_ggb(DEMO)[0])
    elements = elements_of(root)

    bad_children = [(el.get("label"), child.tag) for el in elements for child in el
                    if child.tag not in ELEMENT_CHILDREN]
    check("every <element> child tag is documented", not bad_children, str(bad_children))

    bad_types = [el.get("type") for el in elements
                 if not (ELTYPE_RE.match(el.get("type") or "") or el.get("type") in ELTYPE_ALTS)]
    check("every element type is a documented elType", not bad_types, str(bad_types))
    check("only the four types we draw are used",
          {el.get("type") for el in elements} <= set(TYPES), str({el.get("type") for el in elements}))

    check("every element has a label", all(el.get("label") for el in elements))
    check("labels are unique", len({el.get("label") for el in elements}) == len(elements))

    # A caption is only meaningful together with labelMode = 3 (caption).
    captioned = [el for el in elements if el.find("caption") is not None]
    check("captions come with labelMode 3",
          all(el.find("labelMode").get("val") == "3" for el in captioned))
    check("labelMode is 0 or 3",
          {el.find("labelMode").get("val") for el in elements} <= {"0", "3"})

    bad_points = [el.get("label") for el in elements
                  if el.get("type") == "point"
                  and (el.find("coords") is None or el.find("pointSize") is None)]
    check("every point has coords + pointSize", not bad_points, str(bad_points))


def test_geometry_lives_in_the_expressions():
    print("\n[expressions]")
    _, _, root = open_ggb(gx.build_ggb(DEMO)[0])
    construction = root.find("construction")
    children = {child.tag for child in construction}
    check("construction holds only element/expression",
          children <= {"element", "expression"}, str(children))

    expressions = expressions_of(root)
    elements = elements_of(root)
    check("one expression per element", len(expressions) == len(elements),
          f"{len(expressions)} vs {len(elements)}")
    check("every expression has label + exp",
          all(e.get("label") and e.get("exp") for e in expressions))

    # Dependent objects must NOT carry a cached <coords>/<matrix>: a cache that
    # disagrees with the definition is how an exporter moves a figure silently.
    dependent = [el for el in elements if el.get("type") != "point"]
    cached = [el.get("label") for el in dependent if el.find("coords") is not None]
    check("dependent objects carry no cached coords", not cached, str(cached))
    check("no <matrix> anywhere", not list(by_tag(root, "matrix")))
    check("dependent objects carry a <lineStyle>",
          all(el.find("lineStyle") is not None for el in dependent))

    syntax = {
        "point": re.compile(r"^\(-?[\d.]+, -?[\d.]+\)$"),
        "segment": re.compile(r"^Segment\([A-Za-z][A-Za-z0-9_]*, [A-Za-z][A-Za-z0-9_]*\)$"),
        "line": re.compile(r"^Line\([A-Za-z][A-Za-z0-9_]*, [A-Za-z][A-Za-z0-9_]*\)$"),
        "polygon": re.compile(r"^Polygon\(([A-Za-z][A-Za-z0-9_]*)(, [A-Za-z][A-Za-z0-9_]*)+\)$"),
        "conic": re.compile(r"^Circle\([A-Za-z][A-Za-z0-9_]*, [\d.]+\)$"),
    }
    bad = [(e.get("label"), e.get("exp")) for e in expressions
           if not syntax[e.get("type")].match(e.get("exp") or "")]
    check("every exp follows the GeoGebra command syntax", not bad, str(bad))

    # Dependency order: GeoGebra evaluates top to bottom, so a command may only
    # reference objects defined above it.
    defined = {"xAxis", "yAxis", "x", "y", "e", "pi"}
    undefined = []
    for expression in expressions:
        names = re.findall(r"[A-Za-z][A-Za-z0-9_]*", expression.get("exp") or "")
        for name in names[1:]:            # names[0] is the command itself
            if name not in defined:
                undefined.append((expression.get("label"), name))
        defined.add(expression.get("label"))
    check("no expression references an object defined later", not undefined, str(undefined))


# ── 4. fidelity: coordinates, names, and what could not be drawn ─────────────

def test_points_round_trip():
    print("\n[points]")
    _, report = gx.build_ggb(DEMO)
    _, _, root = open_ggb(gx.build_ggb(DEMO)[0])
    points = [el for el in elements_of(root) if el.get("type") == "point"]
    coords = {el.get("label"): (el.find("coords").get("x"), el.find("coords").get("y"))
              for el in points}

    expected = {"A": ("-0.8", "3.5"), "B": ("-2.5", "-1.8"), "C": ("3", "-1.8"),
                "D": ("-0.8", "-1.8"), "E": ("1.13", "0.81")}
    check("figure coordinates are preserved verbatim",
          all(coords.get(label) == value for label, value in expected.items()), str(coords))
    check("a point restated by a later layer is not duplicated", len(points) == 9, str(len(points)))
    check("every point is written in homogeneous form (z = 1)",
          all(el.find("coords").get("z") == "1.0" for el in points))

    # A figure point that sits on a circle centre we minted keeps the FIGURE's
    # name; the command referencing it has to follow the rename.
    check("the orthocenter keeps its own name (H, not O2)",
          "H" in coords and "O2" not in coords, str(sorted(coords)))
    check("the circumcentre keeps its own name (O, not O1)",
          "O" in coords and "O1" not in coords, str(sorted(coords)))
    expressions = {e.get("label"): e.get("exp") for e in expressions_of(root)}
    check("the circle follows the renamed centre",
          expressions.get("c2") == "Circle(H, 2.04)" and expressions.get("c1") == "Circle(O, 3.42)",
          str(expressions))
    check("radii are written as decimals, locale-free",
          expressions.get("c3") == "Circle(O3, 1.71)", str(expressions.get("c3")))


def test_unsupported_layers_are_reported():
    print("\n[skipped]")
    _, report = gx.build_ggb(DEMO)
    check("the unsupported layer is reported", [s.get("kind") for s in report["skipped"]] == ["arc"],
          str(report["skipped"]))
    check("the report names the layer index",
          report["skipped"][0].get("layer") == len(DEMO["layers"]) - 1, str(report["skipped"][0]))
    check("a skip carries a reason", bool(report["skipped"][0].get("reason")))

    messy = {"layers": [
        {"kind": "polygon", "points": [{"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 1, "y": 0}]},
        {"kind": "circle", "center": {"x": 0, "y": 0}, "r": 0},
        {"kind": "circle", "center": {"x": "?", "y": 0}, "r": 1},
        {"kind": "segment", "from": {"id": "A", "x": 0, "y": 0}, "to": {"x": "nope", "y": 1}},
        {"kind": "points", "data": [{"id": "P", "x": None, "y": 1}, {"id": "Q", "x": 2, "y": 2}]},
        "not a layer",
        {"kind": "polygon",
         "points": [{"id": "A", "x": 0, "y": 0}, {"id": "B", "x": 1, "y": 0}, {"id": "C", "x": 0, "y": 1}]},
    ]}
    _, messy_report = gx.build_ggb(messy)
    reasons = " | ".join(s["reason"] for s in messy_report["skipped"])
    check("a polygon with too few vertices is reported", "at least 3" in reasons, reasons)
    check("a zero radius is reported", "radius > 0" in reasons, reasons)
    check("a centre without coordinates is reported", "finite coordinates" in reasons, reasons)
    check("an unusable endpoint is reported", "two distinct usable endpoints" in reasons, reasons)
    check("a point without coordinates is reported", "finite x/y" in reasons, reasons)
    check("a layer that is not an object is reported", "not an object" in reasons, reasons)
    check("the usable polygon still exports", messy_report["counts"]["polygons"] == 1,
          str(messy_report["counts"]))
    check("and nothing else leaked in",
          messy_report["counts"] == {"points": 4, "segments": 0, "lines": 0, "polygons": 1, "circles": 0},
          str(messy_report["counts"]))


def test_labels_and_captions():
    print("\n[labels]")
    messy_labels = {"layers": [{"kind": "points", "data": [
        {"id": "M'", "x": 0, "y": 0},
        {"id": "(O)", "x": 1, "y": 0},
        {"id": "A\u2081", "x": 2, "y": 0},       # A with a subscript digit
        {"id": "x", "x": 3, "y": 0},             # reserved by GeoGebra (the axis)
        {"id": "\u0110\u01b0\u1eddng", "x": 4, "y": 0},
        {"id": "", "x": 5, "y": 0},
        {"id": "A", "x": 6, "y": 0},
        {"id": "A", "x": 7, "y": 0},
    ]}]}
    _, report = gx.build_ggb(messy_labels)
    _, _, root = open_ggb(gx.build_ggb(messy_labels)[0])
    elements = elements_of(root)
    labels = [el.get("label") for el in elements]
    captions = {el.get("label"): el.find("caption").get("val")
                for el in elements if el.find("caption") is not None}

    identifier = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")
    check("every label is a valid GeoGebra identifier",
          all(identifier.match(label or "") for label in labels), str(labels))
    check("labels are unique", len(set(labels)) == len(labels), str(labels))
    check("all eight points exported", len(labels) == 8, str(labels))
    check("a reserved name is escaped, not used", "x" not in labels, str(labels))
    check("the escaped name keeps its text as a caption", captions.get("Px") == "x", str(captions))
    check("free text survives as a caption", captions.get("M") == "M'", str(captions))
    check("brackets survive as a caption", captions.get("O") == "(O)", str(captions))
    check("Vietnamese text survives as a caption",
          any(value == "\u0110\u01b0\u1eddng" for value in captions.values()), str(captions))
    check("a duplicate figure id gets a suffix",
          labels.count("A") + labels.count("A_2") == 2, str(labels))
    check("an empty id still produces a usable label", "P" in labels, str(labels))


# ── 5. escaping, determinism, limits ─────────────────────────────────────────

def test_escaping_and_unicode():
    print("\n[escaping]")
    payload = {
        "title": "G\u00f3c A & B < C > D \" E ' F",
        "layers": [
            {"kind": "points", "data": [{"id": "A&B<C>", "x": 0, "y": 0}]},
            {"kind": "circle", "center": {"x": 0, "y": 0}, "r": 1,
             "label": "cung & <g\u00f3c> \"nh\u1ecdn\" 60\u00b0"},
        ],
    }
    data, report = gx.build_ggb(payload)
    _, xml_text, root = open_ggb(data)
    check("special characters do not break the XML", root.tag == "geogebra")
    check("the title round-trips exactly",
          root.find("construction").get("title") == payload["title"],
          str(root.find("construction").get("title")))
    captions = [el.find("caption").get("val") for el in elements_of(root)
                if el.find("caption") is not None]
    check("a caption with & < > \" round-trips exactly",
          captions == [payload["layers"][0]["data"][0]["id"], payload["layers"][1]["label"]],
          str(captions))
    check("markup is escaped in the raw text", "&amp;" in xml_text and "<g\u00f3c>" not in xml_text)
    check("both objects exported", report["counts"]["points"] == 1 and report["counts"]["circles"] == 1,
          str(report["counts"]))


def test_determinism():
    print("\n[determinism]")
    first, first_report = gx.build_ggb(DEMO)
    second, second_report = gx.build_ggb(DEMO)
    check("the same figure exports byte-identical files", first == second,
          f"{len(first)} vs {len(second)} bytes")
    check("and reports the same file id", first_report["id"] == second_report["id"])
    check("the id is a UUID", bool(re.fullmatch(r"[0-9a-f-]{36}", first_report["id"])), first_report["id"])

    different = dict(DEMO)
    different["layers"] = DEMO["layers"][:1]
    _, other_report = gx.build_ggb(different)
    check("a different figure gets a different id", other_report["id"] != first_report["id"])

    commands, command_report = gx.build_commands(DEMO)
    check("build_commands returns the same list as the report",
          commands == command_report["commands"] == first_report["commands"], str(commands[:3]))
    check("every command is 'label = expression'",
          all(re.match(r"^[A-Za-z][A-Za-z0-9_]* = .+$", command) for command in commands), str(commands))


def test_limits_and_bad_input():
    print("\n[limits]")
    empty_xml, empty_report = gx.build_xml({"layers": []})
    check("an empty figure still produces a valid document", empty_xml.startswith("<?xml"))
    check("an empty figure has no objects", empty_report["objects"] == 0, str(empty_report["counts"]))
    check("missing layers behave like an empty figure", gx.build_xml({})[1]["objects"] == 0)
    check("a layers=None payload is accepted", gx.build_xml({"layers": None})[1]["objects"] == 0)

    for label, payload in (("a non-object payload", ["not", "a", "figure"]),
                           ("layers that are not a list", {"layers": "nope"})):
        try:
            gx.build_ggb(payload)
            check(f"{label} is refused", False, "no error raised")
        except gx.GeoGebraExportError:
            check(f"{label} is refused", True)

    try:
        gx.build_ggb({"layers": [{"kind": "points", "data": []}] * (gx.MAX_LAYERS + 1)})
        check("too many layers are refused", False, "no error raised")
    except gx.GeoGebraExportError as exc:
        check("too many layers are refused", "too many layers" in str(exc), str(exc))

    crowded = {"layers": [{"kind": "points",
                           "data": [{"id": f"P{i}", "x": i, "y": 0} for i in range(gx.MAX_OBJECTS + 5)]}]}
    try:
        gx.build_ggb(crowded)
        check("too many objects are refused", False, "no error raised")
    except gx.GeoGebraExportError as exc:
        check("too many objects are refused", "too many objects" in str(exc), str(exc))


def main():
    print("=== GeoGebra export tests (offline) ===")
    test_archive_shape()
    test_scripting_is_disabled()
    test_document_skeleton()
    test_element_tags_are_documented()
    test_geometry_lives_in_the_expressions()
    test_points_round_trip()
    test_unsupported_layers_are_reported()
    test_labels_and_captions()
    test_escaping_and_unicode()
    test_determinism()
    test_limits_and_bad_input()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_GEOGEBRA_EXPORT_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())



