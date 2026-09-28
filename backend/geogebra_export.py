"""
geogebra_export.py
==================
Roadmap Q4/2026 item 2 (BAO_CAO_TIEN_DO_THANG_10_2026.md §4): export the
snapped MathViz geometry as a GeoGebra worksheet (.ggb) so a student can open
the exact figure DuoMath drew, drag its points and keep exploring.

Design rules (every one of them is enforced by test_geogebra_export.py):

1. A .ggb is a plain ZIP whose ``geogebra.xml`` holds the construction
   (GeoGebra manual -> Reference -> File Format). Built with the stdlib
   ``zipfile``: no new dependency, no network, no model call.
2. The construction is written as GeoGebra *input-bar commands*, one per
   object, through ``<expression label="A" exp="(-0.8, 3.5)"/>``. That is the
   app's own user syntax, so it parses by definition — unlike hand-writing the
   numeric cache GeoGebra keeps for dependent objects (``<coords>`` on a
   segment, ``<matrix>`` on a conic). A cache that disagrees with the
   definition is exactly how an exporter moves a figure without telling
   anyone, so dependent objects here carry *no* cached geometry at all.
3. ``<element ...>`` blocks are therefore emitted for STYLE ONLY (colour,
   stroke, caption, point size). Free points additionally carry ``<coords>``
   identical to their expression. A styling mistake can never corrupt the
   figure, and the element ``type`` values are always from the manual's own
   ``elType`` list (point|segment|line|polygon|conic).
4. Scripting is disabled inside the file — ``<scripting blocked="true"
   disabled="true"/>`` — so a downloaded worksheet can never run code.
5. Unsupported layer kinds are *reported* in the result, never dropped in
   silence: the same rule the rest of Phase 4 follows (no silent wrong
   answers). A student always learns which part is missing from the file.

Determinism: the same layer block always yields byte-identical output (fixed
ZIP timestamps, a UUIDv5 id derived from the command list), so the suite can
assert reproducibility and a caller can hash the file.

Run the offline suite:  python backend/test_geogebra_export.py
"""

from __future__ import annotations

import io
import math
import re
import unicodedata
import uuid
import xml.etree.ElementTree as ET
import zipfile
from typing import Any, Dict, List, Optional, Tuple

# ── GeoGebra file constants ───────────────────────────────────────────────────

GGB_MIME = "application/vnd.geogebra.file"
GGB_FILENAME = "duomath-hinh-hoc.ggb"
GGB_MEMBER = "geogebra.xml"
GGB_XSD = "http://www.geogebra.org/apps/xsd/ggb.xsd"
GGB_FORMAT = "5.0"
GGB_VERSION = "5.0.729.0"     # version string GeoGebra itself writes; ignored on load
GGB_APP = "geometry"          # 2D construction -> the Geometry app reads it directly

# View box: a plain 1200x800 euclidian view at 50 px/unit, so a student's
# GeoGebra view shows the figure at the same scale as the widget.
CANVAS_W, CANVAS_H = 1200, 800
VIEW_SCALE = 50.0

# Refuse oversized payloads instead of building a megabyte-sized worksheet.
MAX_LAYERS = 200
MAX_OBJECTS = 500

SUPPORTED_KINDS = ("polygon", "triangle", "circle", "line", "segment", "points")

# GeoGebra line types (manual, "Common XML tags": 0=full, 10=dashed short,
# 15=dashed long, 20=dotted, 30=dash-dotted).
LINE_TYPES = {
    "solid": 0,
    "dashed": 10,
    "dotted": 20,
    "dashdot": 30,
    "dash_dot": 30,
    "dash-dotted": 30,
}

DEFAULT_COLOR = (59, 130, 246)          # #3b82f6 — the app's geometry blue
POINT_SIZE = 5                          # doubleVal, matches the widget's dots

# Labels GeoGebra reserves for itself (axes and constants). A figure label that
# collides is renamed and its original text kept as the caption.
_RESERVED_LABELS = {"x", "y", "z", "e", "pi", "true", "false", "xAxis", "yAxis", "zAxis"}

_IDENTIFIER_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")
_HEX_COLOR_RE = re.compile(r"#([0-9a-fA-F]{3,8})")
_NUMBER_RE = re.compile(r"-?\d*\.?\d+")


class GeoGebraExportError(ValueError):
    """Input we refuse to export (bad shape, too large). Never raised for a
    partially drawable figure — unsupported layers are reported instead."""


# ── helpers: numbers, colours, labels ────────────────────────────────────────

def _finite(value: Any) -> Optional[float]:
    """float(value) when it is a finite number, else None (NaN/inf/str/garbage)."""
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    return num if math.isfinite(num) else None


def fmt_num(value: float) -> str:
    """Locale-free decimal text: 3.5 -> "3.5", -0.0 -> "0", never an exponent.

    The file format is dot-decimal regardless of the viewer's locale, so the
    number text must not depend on the machine that exported it.
    """
    num = float(value)
    if abs(num) < 1e-12:
        num = 0.0
    text = f"{num:.6f}".rstrip("0").rstrip(".")
    return text or "0"


def parse_color(value: Any, default: Tuple[int, int, int] = DEFAULT_COLOR) -> Tuple[int, int, int]:
    """Accept the colours the MathViz IR uses: "#3b82f6", "#39F", "rgb(57,255,20)",
    "rgba(57,255,20,0.08)". Anything else falls back to the default blue."""
    if isinstance(value, str):
        text = value.strip()
        match = _HEX_COLOR_RE.match(text)
        if match:
            digits = match.group(1)
            if len(digits) == 3:
                digits = "".join(ch * 2 for ch in digits)
            if len(digits) >= 6:
                try:
                    return (int(digits[0:2], 16), int(digits[2:4], 16), int(digits[4:6], 16))
                except ValueError:
                    pass
        elif text.lower().startswith("rgb"):
            parts = _NUMBER_RE.findall(text)
            if len(parts) >= 3:
                channels = [_finite(p) for p in parts[:3]]
                if all(c is not None for c in channels):
                    return (
                        max(0, min(255, int(round(channels[0])))),
                        max(0, min(255, int(round(channels[1])))),
                        max(0, min(255, int(round(channels[2])))),
                    )
    return default


def parse_fill_alpha(value: Any, default: float = 0.0) -> float:
    """GeoGebra's <objColor alpha> is the *fill* opacity (0..1). MathViz keeps it
    in the `fill` string: "rgba(57, 255, 20, 0.08)" -> 0.08."""
    if isinstance(value, str) and value.strip().lower().startswith("rgba"):
        parts = _NUMBER_RE.findall(value)
        if len(parts) >= 4:
            alpha = _finite(parts[3])
            if alpha is not None:
                return max(0.0, min(1.0, alpha))
    return default


def parse_line_type(style: Any) -> int:
    return LINE_TYPES.get(str(style or "").strip().lower(), 0)


def parse_thickness(stroke_width: Any, default: int = 2) -> int:
    """<lineStyle thickness> is a non-negative integer; the IR uses 1.5-2.5."""
    num = _finite(stroke_width)
    if num is None:
        return default
    return max(1, min(13, int(round(num))))


def sanitize_label(raw: Any, used: set) -> Tuple[str, Optional[str]]:
    """Return (valid GeoGebra identifier, original text if it had to change).

    A GeoGebra label must start with a letter and contain only letters, digits
    or "_". Figure labels in the IR are free text — "M'", "(O)", "A1", even a
    whole Vietnamese phrase — so they are normalised; when the text changes it
    is kept verbatim as the object's caption, which is what the student then
    reads next to the object. Collisions get a numeric suffix.
    """
    original = str(raw or "").strip()
    ascii_text = unicodedata.normalize("NFKD", original).encode("ascii", "ignore").decode("ascii")
    cleaned = re.sub(r"[^0-9A-Za-z_]", "", ascii_text)
    if cleaned and not cleaned[0].isalpha():
        cleaned = "P" + cleaned
    candidate = cleaned or "P"
    if candidate in _RESERVED_LABELS or not _IDENTIFIER_RE.match(candidate):
        candidate = "P" + candidate.lstrip("_") or "P"

    unique, suffix = candidate, 1
    while unique in used:
        suffix += 1
        unique = f"{candidate}_{suffix}"
    used.add(unique)
    caption = original if original and original != unique else None
    if caption and len(caption) > 120:
        caption = caption[:117] + "..."
    return unique, caption


# ── MathViz layers -> GeoGebra objects ───────────────────────────────────────
#
# One normalised object per drawing primitive. `label` is the GeoGebra
# identifier, `inputs` lists the labels an object is built from (exactly what
# the command text needs), and `style` mirrors the layer's visual intent.

def _new_figure() -> Dict[str, List[Dict[str, Any]]]:
    return {"points": [], "segments": [], "lines": [], "polygons": [], "circles": []}


def _adopt_figure_name(point: Dict[str, Any], raw_id: Any, by_label: Dict[str, Any], used: set) -> None:
    """A generated point (a circle centre we minted) that turns out to be a real
    figure point should carry the figure's own name — "H, the orthocenter" beats
    our "O2". Safe to do late because every command is rendered from the point
    objects, not from label strings copied at collection time."""
    if not point.get("generated") or not isinstance(raw_id, str) or not raw_id.strip():
        return
    used.discard(point["label"])
    label, caption = sanitize_label(raw_id, used)
    point["label"], point["caption"], point["generated"] = label, caption, False
    by_label.setdefault(raw_id.strip(), point)


def _ensure_point(
    figure: Dict[str, List[Dict[str, Any]]],
    by_label: Dict[str, Any],
    by_coord: Dict[Tuple[float, float], Dict[str, Any]],
    used: set,
    raw_id: Any,
    x: float,
    y: float,
    generated: bool = False,
) -> Dict[str, Any]:
    """Return the GeoGebra point object at (x, y), creating it only when needed.

    Reusing the point that is already there matters: two objects that share a
    vertex must reference the *same* GeoGebra point, otherwise dragging in
    GeoGebra pulls the figure apart. Points are matched on coordinates rounded
    to 1e-9, so an endpoint restated by a later layer snaps onto its own point.
    """
    key = (round(x, 9), round(y, 9))
    existing = by_coord.get(key)
    if existing is not None:
        _adopt_figure_name(existing, raw_id, by_label, used)
        return existing

    label, caption = sanitize_label(raw_id, used)
    point = {
        "type": "point",
        "label": label,
        "caption": caption,
        "inputs": [],
        "x": x,
        "y": y,
        "generated": generated,
        "style": {"color": DEFAULT_COLOR, "alpha": 0.0, "thickness": POINT_SIZE, "line_type": 0},
    }
    figure["points"].append(point)
    by_coord[key] = point
    if isinstance(raw_id, str) and raw_id.strip():
        by_label.setdefault(raw_id.strip(), point)
    return point


def _endpoint_spec(value: Any) -> Optional[Tuple[str, ...]]:
    """Describe an endpoint *before* anything is created: ("coord", x, y, id) when
    it carries coordinates, ("label", text) when it only names an object.

    Splitting "describe" from "create" is what keeps a layer that turns out to be
    unusable from leaving a stray point in the figure.
    """
    if isinstance(value, dict):
        x, y = _finite(value.get("x")), _finite(value.get("y"))
        if x is not None and y is not None:
            raw_id = value.get("id") or value.get("label") or ""
            return ("coord", fmt_num(x), fmt_num(y), str(raw_id).strip())
        text = str(value.get("id") or value.get("label") or "").strip()
    elif isinstance(value, str):
        text = value.strip()
    else:
        return None
    return ("label", text) if text else None


def _materialise_endpoint(
    spec: Tuple[str, ...], state: Dict[str, Any], fallback_id: str, generated: bool = False
) -> Optional[Dict[str, Any]]:
    """Turn an endpoint spec into a point object (created only if it is new)."""
    if spec[0] == "coord":
        return _ensure_point(
            state["figure"], state["by_label"], state["by_coord"], state["used"],
            spec[3] or fallback_id, float(spec[1]), float(spec[2]), generated,
        )
    text = spec[1]
    known = state["by_label"].get(text)
    if known:
        return known
    return next((pt for other, pt in state["by_label"].items() if other.lower() == text.lower()), None)


def _point_list(layer: Dict[str, Any]) -> List[Any]:
    """A 'points' layer keeps its items in `data` (the renderer reads that key);
    some payloads use `points` instead, so accept either."""
    for key in ("data", "points"):
        items = layer.get(key)
        if isinstance(items, list):
            return items
    return []


def _caption_of(layer: Dict[str, Any]) -> Optional[str]:
    """The layer's `label` is human text ("Đường tròn ngoại tiếp (O)"), which is
    a caption in GeoGebra terms — not an identifier."""
    text = str(layer.get("label") or "").strip()
    if not text:
        return None
    return text[:117] + "..." if len(text) > 120 else text


def _generated_label(prefix: str, index: int, used: set) -> str:
    """Identifiers we invent (segments, polygons, circles) must not collide with
    a figure label either — GeoGebra allows one object per name."""
    return sanitize_label(f"{prefix}{index}", used)[0]


def collect_objects(viz: Any) -> Tuple[Dict[str, List[Dict[str, Any]]], List[Dict[str, Any]]]:
    """Normalise a MathViz geometry block into GeoGebra objects.

    Returns (figure, skipped). Every layer we cannot draw is listed in
    `skipped` with its index, kind and reason — the caller must be able to tell
    the student "this part is not in the file" instead of hiding it.
    """
    if not isinstance(viz, dict):
        raise GeoGebraExportError("geometry payload must be an object")

    layers = viz.get("layers")
    if layers is None:
        layers = []
    if not isinstance(layers, list):
        raise GeoGebraExportError("'layers' must be a list")
    if len(layers) > MAX_LAYERS:
        raise GeoGebraExportError(f"too many layers ({len(layers)} > {MAX_LAYERS})")

    figure = _new_figure()
    skipped: List[Dict[str, Any]] = []
    state: Dict[str, Any] = {
        "figure": figure,
        "used": set(),        # taken GeoGebra identifiers
        "by_label": {},       # figure id text -> GeoGebra label
        "by_coord": {},       # rounded (x, y) -> GeoGebra label
    }
    counters = {"segment": 0, "line": 0, "polygon": 0, "circle": 0, "center": 0}

    for index, layer in enumerate(layers):
        if not isinstance(layer, dict):
            skipped.append({"layer": index, "kind": None, "reason": "layer is not an object"})
            continue
        kind = layer.get("kind")
        if kind not in SUPPORTED_KINDS:
            skipped.append({"layer": index, "kind": str(kind), "reason": "unsupported layer kind"})
            continue

        # ── a free point set (e.g. the incenter, feet of altitudes, …) ───────
        if kind == "points":
            items = _point_list(layer)
            if not items:
                skipped.append({"layer": index, "kind": kind, "reason": "layer has no points"})
                continue
            for item_index, item in enumerate(items):
                point = item if isinstance(item, dict) else {}
                x, y = _finite(point.get("x")), _finite(point.get("y"))
                if x is None or y is None:
                    skipped.append({"layer": index, "kind": kind, "item": item_index,
                                    "reason": "point without finite x/y"})
                    continue
                _ensure_point(figure, state["by_label"], state["by_coord"], state["used"],
                              point.get("id") or point.get("label"), x, y)

        # ── a polygon / triangle: vertices, then one Polygon() command ───────
        elif kind in ("polygon", "triangle"):
            vertices = layer.get("points")
            if not isinstance(vertices, list) or len(vertices) < 3:
                skipped.append({"layer": index, "kind": kind, "reason": "polygon needs at least 3 points"})
                continue
            usable: List[Tuple[Any, float, float]] = []
            for item_index, vertex in enumerate(vertices):
                point = vertex if isinstance(vertex, dict) else {}
                x, y = _finite(point.get("x")), _finite(point.get("y"))
                if x is None or y is None:
                    skipped.append({"layer": index, "kind": kind, "item": item_index,
                                    "reason": "vertex without finite x/y"})
                    continue
                usable.append((point.get("id") or point.get("label"), x, y))
            if len(usable) < 3:
                skipped.append({"layer": index, "kind": kind,
                                "reason": "polygon needs at least 3 usable vertices"})
                continue
            labels = [_ensure_point(figure, state["by_label"], state["by_coord"], state["used"], rid, x, y)
                      for rid, x, y in usable]
            counters["polygon"] += 1
            figure["polygons"].append({
                "type": "polygon",
                "label": _generated_label("poly", counters["polygon"], state["used"]),
                "caption": _caption_of(layer),
                "inputs": labels,
                "style": {
                    "color": parse_color(layer.get("color"), DEFAULT_COLOR),
                    "alpha": parse_fill_alpha(layer.get("fill"), 0.15),
                    "thickness": parse_thickness(layer.get("strokeWidth")),
                    "line_type": parse_line_type(layer.get("style")),
                },
            })

        # ── a straight object: Segment(A, B) or Line(A, B) ──────────────────
        elif kind in ("line", "segment"):
            start_spec = _endpoint_spec(layer.get("from"))
            end_spec = _endpoint_spec(layer.get("to"))
            if not start_spec or not end_spec or start_spec == end_spec:
                skipped.append({"layer": index, "kind": kind,
                                "reason": "line needs two distinct usable endpoints"})
                continue
            start = _materialise_endpoint(start_spec, state, "P")
            end = _materialise_endpoint(end_spec, state, "Q")
            if not start or not end or start is end:
                skipped.append({"layer": index, "kind": kind,
                                "reason": "line needs two distinct usable endpoints"})
                continue
            counters[kind] += 1
            is_segment = kind == "segment"
            figure["segments" if is_segment else "lines"].append({
                "type": "segment" if is_segment else "line",
                "label": _generated_label("s" if is_segment else "l", counters[kind], state["used"]),
                "caption": _caption_of(layer),
                "inputs": [start, end],
                "style": {
                    "color": parse_color(layer.get("color"), DEFAULT_COLOR),
                    "alpha": parse_fill_alpha(layer.get("fill"), 0.0),
                    "thickness": parse_thickness(layer.get("strokeWidth"), 2),
                    "line_type": parse_line_type(layer.get("style")),
                },
            })

        # ── a circle: a centre point plus Circle(centre, radius) ────────────
        elif kind == "circle":
            radius = _finite(layer.get("r"))
            if radius is None or radius <= 0:
                skipped.append({"layer": index, "kind": kind, "reason": "circle needs a radius > 0"})
                continue
            center_spec = _endpoint_spec(layer.get("center"))
            if not center_spec:
                skipped.append({"layer": index, "kind": kind,
                                "reason": "circle centre has no finite coordinates"})
                continue
            counters["center"] += 1
            center_point = _materialise_endpoint(
                center_spec, state, f"O{counters['center']}", generated=True
            )
            if not center_point:
                skipped.append({"layer": index, "kind": kind,
                                "reason": "circle centre does not name a known point"})
                continue
            counters["circle"] += 1
            figure["circles"].append({
                "type": "conic",
                "label": _generated_label("c", counters["circle"], state["used"]),
                "caption": _caption_of(layer),
                "inputs": [center_point],
                "radius": radius,
                "style": {
                    "color": parse_color(layer.get("color"), DEFAULT_COLOR),
                    "alpha": parse_fill_alpha(layer.get("fill"), 0.0),
                    "thickness": parse_thickness(layer.get("strokeWidth"), 2),
                    "line_type": parse_line_type(layer.get("style")),
                },
            })

    total = sum(len(bucket) for bucket in figure.values())
    if total > MAX_OBJECTS:
        raise GeoGebraExportError(f"too many objects ({total} > {MAX_OBJECTS})")
    return figure, skipped


# ── object list -> GeoGebra input-bar commands ───────────────────────────────

# Points first: every other command references points by name, and GeoGebra
# evaluates the construction top to bottom.
_BUCKET_ORDER = ("points", "segments", "lines", "polygons", "circles")


def iter_objects(figure: Dict[str, List[Dict[str, Any]]]):
    for bucket in _BUCKET_ORDER:
        for obj in figure.get(bucket, []):
            yield obj


def command_of(obj: Dict[str, Any]) -> str:
    """The right-hand side of an object's GeoGebra input. Built from the input
    points' *current* labels: a point can be renamed (a generated circle centre
    adopting the figure's own "H"), and every command that references it has to
    follow — which is why labels are resolved here, not copied at collection."""
    labels = [point["label"] for point in obj.get("inputs") or []]
    kind = obj["type"]
    if kind == "point":
        return f"({fmt_num(obj['x'])}, {fmt_num(obj['y'])})"
    if kind == "segment":
        return f"Segment({', '.join(labels)})"
    if kind == "line":
        return f"Line({', '.join(labels)})"
    if kind == "polygon":
        return f"Polygon({', '.join(labels)})"
    if kind == "conic":
        return f"Circle({labels[0]}, {fmt_num(obj['radius'])})"
    raise GeoGebraExportError(f"no GeoGebra command for object type {kind!r}")


def figure_commands(figure: Dict[str, List[Dict[str, Any]]]) -> List[str]:
    """The figure as GeoGebra input-bar text — what a student could type by hand,
    and the definition the .ggb carries in its <expression> entries."""
    return [f"{obj['label']} = {command_of(obj)}" for obj in iter_objects(figure)]


# ── XML rendering ────────────────────────────────────────────────────────────
#
# Structure and tag names follow the GeoGebra manual (Reference → "XML tags in
# geogebra.xml" plus "Common XML tags and types"). Every tag written here is in
# the manual's documented child set for <element>, and the suite fails on any
# tag outside that set — a typo like <objcolor> must not reach a student's file.

_XSI = "http://www.w3.org/2001/XMLSchema-instance"
ET.register_namespace("xsi", _XSI)


def _sub(parent: ET.Element, tag: str, **attrs: Any) -> ET.Element:
    return ET.SubElement(parent, tag, {key: str(value) for key, value in attrs.items()})


def _style_element(parent: ET.Element, obj: Dict[str, Any]) -> ET.Element:
    """Style only — no <coords>/<matrix> for a dependent object, so the
    <expression> below stays the single source of truth for the geometry."""
    style = obj.get("style") or {}
    element = _sub(parent, "element", type=obj["type"], label=obj["label"])
    _sub(element, "show", object="true", label="true")
    red, green, blue = style.get("color", DEFAULT_COLOR)
    _sub(element, "objColor", r=red, g=green, b=blue, alpha=fmt_num(style.get("alpha", 0.0)))
    _sub(element, "layer", val=0)
    _sub(element, "labelMode", val=3 if obj.get("caption") else 0)
    if obj.get("caption"):
        _sub(element, "caption", val=obj["caption"])
    if obj["type"] == "point":
        _sub(element, "coords", x=fmt_num(obj["x"]), y=fmt_num(obj["y"]), z="1.0")
        _sub(element, "pointSize", val=style.get("thickness", POINT_SIZE))
        _sub(element, "pointStyle", val=0)
    else:
        _sub(element, "lineStyle", thickness=style.get("thickness", 2),
             type=style.get("line_type", 0), typeHidden=1)
    return element


def _render_document(figure: Dict[str, List[Dict[str, Any]]], title: Any, file_id: str) -> str:
    root = ET.Element("geogebra", {
        "format": GGB_FORMAT,
        "version": GGB_VERSION,
        "id": file_id,
        "app": GGB_APP,
        "platform": "w",
        f"{{{_XSI}}}noNamespaceSchemaLocation": GGB_XSD,
    })

    gui = _sub(root, "gui")
    _sub(gui, "window", width=CANVAS_W, height=CANVAS_H)
    _sub(gui, "settings", ignoreDocument="false", showTitleBar="true")

    view = _sub(root, "euclidianView")
    _sub(view, "size", width=CANVAS_W, height=CANVAS_H)
    _sub(view, "coordSystem", xZero=CANVAS_W / 2, yZero=CANVAS_H / 2,
         scale=VIEW_SCALE, yscale=VIEW_SCALE)
    _sub(view, "evSettings", axes="true", grid="false", gridIsBold="false",
         pointCapturing=3, rightAngleStyle=1, checkboxSize=13, gridType=3)
    _sub(view, "bgColor", r=255, g=255, b=255)
    _sub(view, "axesColor", r=0, g=0, b=0)
    _sub(view, "gridColor", r=192, g=192, b=192)
    _sub(view, "lineStyle", axes=1, grid=0)
    _sub(view, "axis", id=0, show="true", tickStyle=1, showNumbers="true")
    _sub(view, "axis", id=1, show="true", tickStyle=1, showNumbers="true")

    kernel = _sub(root, "kernel")
    _sub(kernel, "continuous", val="false")
    _sub(kernel, "decimals", val=2)
    _sub(kernel, "angleUnit", val="degree")
    _sub(kernel, "coordStyle", val=0)

    # A worksheet a student downloads from us must never be able to run code.
    _sub(root, "scripting", blocked="true", disabled="true")

    construction = _sub(root, "construction", title=str(title or "")[:200])
    for obj in iter_objects(figure):
        _style_element(construction, obj)
        _sub(construction, "expression", label=obj["label"], exp=command_of(obj), type=obj["type"])

    ET.indent(root, space="  ")
    return '<?xml version="1.0" encoding="utf-8"?>\n' + ET.tostring(root, encoding="unicode") + "\n"


def _zip_bytes(xml_text: str) -> bytes:
    """Deterministic archive: fixed timestamp, one member, deflated."""
    buffer = io.BytesIO()
    info = zipfile.ZipInfo(GGB_MEMBER, date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr(info, xml_text.encode("utf-8"))
    return buffer.getvalue()


# ── public API ───────────────────────────────────────────────────────────────

def file_identity(commands: List[str]) -> str:
    """UUIDv5 over the command list: the same figure always exports the same
    file id, so two exports of one diagram stay comparable."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "duomath.ggb\n" + "\n".join(commands)))


def _report(figure, skipped, commands, file_id) -> Dict[str, Any]:
    counts = {bucket: len(items) for bucket, items in figure.items()}
    return {
        "id": file_id,
        "objects": sum(counts.values()),
        "counts": counts,
        "skipped": skipped,
        "commands": commands,
    }


def build_commands(viz: Any) -> Tuple[List[str], Dict[str, Any]]:
    """The GeoGebra command list — the UI's "copy commands" action, and the same
    text the .ggb stores per object."""
    figure, skipped = collect_objects(viz)
    commands = figure_commands(figure)
    return commands, _report(figure, skipped, commands, file_identity(commands))


def build_xml(viz: Any) -> Tuple[str, Dict[str, Any]]:
    figure, skipped = collect_objects(viz)
    commands = figure_commands(figure)
    file_id = file_identity(commands)
    title = viz.get("title") if isinstance(viz, dict) else None
    return _render_document(figure, title, file_id), _report(figure, skipped, commands, file_id)


def build_ggb(viz: Any) -> Tuple[bytes, Dict[str, Any]]:
    """The .ggb itself: a ZIP holding geogebra.xml (GeoGebra manual, File Format)."""
    xml_text, report = build_xml(viz)
    return _zip_bytes(xml_text), report

