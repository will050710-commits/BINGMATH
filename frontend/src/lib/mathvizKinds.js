// frontend/src/lib/mathvizKinds.js
//
// Đợt 8 / 4I — the client half of the MathViz vocabulary contract.
//
// Mirror of `backend/mathviz_contract.py`. Two implementations of one contract
// is a drift risk, so it is not left to discipline:
// `frontend/scripts/check-mathviz-kinds.mjs` parses BOTH the Python module and
// this file and fails when they disagree — exactly the technique
// check-image-downscale.mjs already uses against backend/security_limits.py.
//
// Why the client needs it at all: the renderers have to answer "does a layer
// declare enough to be drawn, and which points does it reference?". Until now
// each engine answered that with its own hard-coded list of four kinds
// (polygon / circle / line / points), so an `arc`, `sector`, `region`, `angle`
// or `polyline` layer — and every point inside it — was simply ignored, and the
// figure came out truncated with nothing said about it.
//
// No imports, no DOM: the node guard imports this module directly.

/** Every kind the contract lets a payload use. */
export const LAYER_KINDS = [
  "angle", "arc", "circle", "ellipse", "label", "line", "points",
  "polygon", "polyline", "ray", "region", "sector", "segment", "triangle",
];

/** Near-miss spellings models actually emit, mapped onto a contract kind. */
export const KIND_ALIASES = {
  point: "points", pts: "points",
  seg: "line",
  poly: "polygon",
  circ: "circle", circumcircle: "circle", incircle: "circle",
  wedge: "sector", pie: "sector",
  shaded: "region", shaded_region: "region", filled_region: "region",
  area: "region", curvilinear_region: "region",
  curve: "arc", circular_arc: "arc", minor_arc: "arc",
  major_arc: "arc", arc_curve: "arc",
  text: "label", caption: "label", annotation: "label",
  angle_marker: "angle", angle_arc: "angle",
  path: "polyline",
  oval: "ellipse",
};

/** What each renderer draws. Kept identical to the Python table. */
export const ENGINE_SUPPORT = {
  svg: ["angle", "arc", "circle", "ellipse", "label", "line", "points",
    "polygon", "polyline", "ray", "region", "sector", "segment", "triangle"],
  jsxgraph: ["angle", "arc", "circle", "ellipse", "label", "line", "points",
    "polygon", "polyline", "ray", "region", "sector", "segment", "triangle"],
  konva: ["angle", "arc", "circle", "ellipse", "label", "line", "points",
    "polygon", "polyline", "ray", "region", "sector", "segment", "triangle"],
};

/** Preference order when we need the engine that can draw everything. */
export const ENGINE_PREFERENCE = ["jsxgraph", "svg", "konva"];

/** Keys that hold a point OBJECT ({id, x, y}). */
const SCALAR_POINT_KEYS = [
  "center", "centre", "from", "to", "at", "point", "vertex", "foot",
  "tangent_point", "tangency_point", "arc_midpoint", "mid", "origin",
];

/** Keys that hold a list of point objects and/or bare id strings. */
const LIST_POINT_KEYS = [
  "points", "data", "vertices", "of", "path", "via", "arcs", "segments",
  "through_3pts", "through_pts", "items", "parts", "objects", "endpoints",
];

const MAX_DEPTH = 6;

/** Map a raw kind onto a contract kind ('' when it is none). */
export function canonicalKind(kind) {
  if (typeof kind !== "string") return "";
  const key = kind.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (LAYER_KINDS.indexOf(key) > -1) return key;
  return KIND_ALIASES[key] || "";
}

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isPointObject(node) {
  return !!node && typeof node === "object" && isNum(node.x) && isNum(node.y);
}

/**
 * Every point a layer declares, wherever it keeps it: `circle.center`,
 * `line.from`/`to`, the items of `points.data`, `polygon.points`, an `arc`'s
 * three defining points, a `region`'s mixed `path`. Recursive so a new kind
 * needs no new entry here — that per-kind list is what went stale before.
 */
export function iterLayerPoints(layer) {
  const found = [];
  const walk = (node, depth) => {
    if (!node || depth > MAX_DEPTH) return;
    if (Array.isArray(node)) {
      node.forEach((item) => {
        if (isPointObject(item)) found.push(item);
        else walk(item, depth + 1);
      });
      return;
    }
    if (typeof node !== "object") return;
    Object.keys(node).forEach((key) => {
      const value = node[key];
      if (SCALAR_POINT_KEYS.indexOf(key) > -1 && isPointObject(value)) found.push(value);
      else if (value && typeof value === "object") walk(value, depth + 1);
    });
  };
  walk(layer, 0);
  return found;
}

/** Ids a layer refers to, from point objects and from bare id strings. */
export function layerReferenceIds(layer) {
  if (!layer || typeof layer !== "object") return [];
  const ids = [];
  iterLayerPoints(layer).forEach((pt) => {
    const id = pt.id || pt.name;
    if (typeof id === "string" && id.trim()) ids.push(id.trim());
  });
  LIST_POINT_KEYS.forEach((key) => {
    const value = layer[key];
    if (!Array.isArray(value)) return;
    value.forEach((item) => {
      if (typeof item === "string" && item.trim()) ids.push(item.trim());
    });
  });
  SCALAR_POINT_KEYS.forEach((key) => {
    const value = layer[key];
    if (typeof value === "string" && value.trim()) ids.push(value.trim());
  });
  return ids;
}

/** Flatten every point of every layer, de-duplicated by id (last one wins). */
export function collectLayerPoints(layers) {
  const byId = {};
  const anonymous = [];
  (Array.isArray(layers) ? layers : []).forEach((layer) => {
    iterLayerPoints(layer).forEach((pt) => {
      const id = pt.id || pt.name;
      if (typeof id === "string" && id.trim()) byId[id.trim()] = pt;
      else anonymous.push(pt);
    });
  });
  return [
    ...Object.keys(byId).map((id) => ({ ...byId[id], id })),
    ...anonymous,
  ];
}

/** Contract kinds present in a payload that NO engine can draw. */
export function unsupportedEverywhere(layers) {
  const out = [];
  (Array.isArray(layers) ? layers : []).forEach((layer) => {
    const kind = canonicalKind(layer && layer.kind);
    if (!kind) return;
    const drawable = ENGINE_PREFERENCE.some(
      (engine) => (ENGINE_SUPPORT[engine] || []).indexOf(kind) > -1);
    if (!drawable && out.indexOf(kind) === -1) out.push(kind);
  });
  return out;
}