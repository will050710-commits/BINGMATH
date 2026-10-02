// frontend/scripts/check-mathviz-kinds.mjs
//
// Đợt 8 / 4I — one vocabulary, TWO implementations, one gate.
// (The Konva engine was removed: it duplicated SVG + JSXGraph for every kind
// and tripled the sync surface the gate below has to hold together.)
//
// The bug this guards: `backend/mathviz_contract.py` (the contract), the
// renderers' dispatch branches, and `src/lib/mathvizKinds.js` (the client
// mirror) are written in different languages and can drift apart silently. When
// they do, the symptom is a figure that quietly loses a part — the exact class
// of bug this đợt exists to remove.
//
// So this script reads the Python module with a regex (no Python needed in the
// node job — the same technique check-image-downscale.mjs uses on
// backend/security_limits.py) and fails if:
//   1. the two LAYER_KINDS sets differ, or the two alias maps differ;
//   2. an engine claims a kind in ENGINE_SUPPORT but has no `kind === '…'`
//      branch for it in its own file;
//   3. the "drawn kinds" list inside MathVizGeometry2D.js (which decides the
//      "N loại hình chưa vẽ được" chip) disagrees with the contract.
//
// Run:  node scripts/check-mathviz-kinds.mjs      (from frontend/)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  LAYER_KINDS,
  KIND_ALIASES,
  ENGINE_SUPPORT,
  ENGINE_PREFERENCE,
  canonicalKind,
  iterLayerPoints,
  layerReferenceIds,
  collectLayerPoints,
} from "../src/lib/mathvizKinds.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(HERE, "..");
const BACKEND = join(FRONTEND, "..", "backend");
const MATHVIZ_DIR = join(FRONTEND, "src", "components", "DuoMCB", "mathviz");

let checks = 0;
let failures = 0;

function check(label, ok, detail = "") {
  checks += 1;
  if (ok) {
    console.log(`  [OK] ${label}`);
  } else {
    failures += 1;
    console.log(`  [FAIL] ${label} ${detail}`);
  }
}

function read(path) {
  return readFileSync(path, "utf8");
}

/** Pull the `"a", "b", …` items out of the first `{ … }`/`[ … ]` after anchor. */
function quotedItems(source, anchor, openChar, closeChar) {
  const at = source.indexOf(anchor);
  if (at === -1) return null;
  const open = source.indexOf(openChar, at);
  const close = source.indexOf(closeChar, open);
  if (open === -1 || close === -1) return null;
  // Single AND double quotes: the Python tables use ", the JS ones use '.
  const block = source.slice(open, close);
  return [...block.matchAll(/["']([a-z_]+)["']/g)].map((m) => m[1]);
}

/** Pull `"key": "value"` pairs out of the first `{ … }` block after anchor. */
function aliasPairsAfter(source, anchor) {
  const at = source.indexOf(anchor);
  if (at === -1) return null;
  const open = source.indexOf("{", at);
  const close = source.indexOf("}", open);
  if (open === -1 || close === -1) return null;
  const block = source.slice(open, close);
  const out = new Map();
  for (const match of block.matchAll(/["']([a-z_]+)["']\s*:\s*["']([a-z_]+)["']/g)) {
    out.set(match[1], match[2]);
  }
  return out;
}

function stringSetAfter(source, anchor) {
  const items = quotedItems(source, anchor, "{", "}");
  return items ? new Set(items) : null;
}

function stringListAfter(source, anchor) {
  return quotedItems(source, anchor, "[", "]");
}

function sortedJoined(values) {
  return [...values].sort().join();
}

// ── 1. contract ↔ mirror ────────────────────────────────────────────────────

console.log("\n[contract ↔ client mirror]");
const python = read(join(BACKEND, "mathviz_contract.py"));

const pyKinds = stringSetAfter(python, "LAYER_KINDS = frozenset(");
check("the Python contract's LAYER_KINDS was found", !!pyKinds && pyKinds.size > 5);
check("both sides declare exactly the same kinds",
  !!pyKinds && sortedJoined(pyKinds) === sortedJoined(LAYER_KINDS),
  `python=${pyKinds ? sortedJoined(pyKinds) : "?"} js=${sortedJoined(LAYER_KINDS)}`);

const pyAliases = aliasPairsAfter(python, "KIND_ALIASES: Dict[str, str] = ");
const jsAliases = new Map(Object.entries(KIND_ALIASES));
check("the Python alias map was found", !!pyAliases && pyAliases.size > 10);
check("both sides map the same aliases onto the same kinds",
  !!pyAliases && pyAliases.size === jsAliases.size
  && [...pyAliases].every(([from, to]) => jsAliases.get(from) === to),
  `python=${pyAliases ? pyAliases.size : "?"} js=${jsAliases.size}`);

const ENGINES = ["svg", "jsxgraph"];
const pyEngines = ENGINES.map((engine) => {
  const at = python.indexOf(`"${engine}": frozenset(`);
  if (at === -1) return null;
  const open = python.indexOf("{", at);
  const close = python.indexOf("}", open);
  const block = python.slice(open, close);
  return new Set([...block.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]));
});
check("every engine's support table was found in the contract",
  pyEngines.every((set) => !!set));
check("the engine support tables match the contract exactly",
  pyEngines.every((set, i) => !!set
    && sortedJoined(set) === sortedJoined(ENGINE_SUPPORT[ENGINES[i]])),
  `python=${pyEngines.map((s) => (s ? s.size : "?"))} js=${ENGINES.map((e) => ENGINE_SUPPORT[e].length)}`);
check("the preference order matches",
  ENGINE_PREFERENCE.join() === "jsxgraph,svg");

// ── 2. an engine's claim must be backed by a dispatch branch ────────────────

console.log("\n[engine claims ↔ renderer branches]");
const ENGINE_FILES = {
  svg: join(MATHVIZ_DIR, "MathVizGeometry2D.js"),
  jsxgraph: join(MATHVIZ_DIR, "MathVizJSXGraph.js"),
};

for (const engine of ENGINE_PREFERENCE) {
  const source = read(ENGINE_FILES[engine]);
  const missing = ENGINE_SUPPORT[engine].filter((kind) => {
    // `layer.kind === 'arc'` / `lay.kind === 'circle'`
    const branch = new RegExp(`kind\\s*===\\s*['"]${kind}['"]`);
    return !branch.test(source);
  });
  check(`${engine} really branches on every kind it claims`, missing.length === 0,
    `no branch for: ${missing.join(", ")}`);
}

// The SVG engine's own "what I draw" list drives the student-visible chip, so
// it has to BE the contract and not a second opinion.
const svgSource = read(ENGINE_FILES.svg);
const svgDrawn = stringListAfter(svgSource, "const drawnKinds = useMemo(() => new Set([");
check("the SVG engine's drawn-kinds list matches its ENGINE_SUPPORT",
  !!svgDrawn && sortedJoined(svgDrawn) === sortedJoined(ENGINE_SUPPORT.svg),
  `svg=${svgDrawn ? sortedJoined(svgDrawn) : "?"}`);

// ── 2b. the curve maths must stay in ONE place ──────────────────────────────
//
// Before đợt 8 / 4I the outline walk lived inside the JSXGraph component as a
// private function, so a second engine had no way to draw a `region`. Both
// engines now import src/lib/mathvizOutline.js, and this guard is what keeps a
// third copy from appearing the next time someone needs it.
console.log("\n[shared outline maths]");
const OUTLINE_LIB = "src/lib/mathvizOutline.js";
check("the outline library exists and exports the walk",
  read(join(FRONTEND, OUTLINE_LIB)).includes("export function sampleRegionOutline"));
for (const engine of ["jsxgraph", "svg"]) {
  const source = read(ENGINE_FILES[engine]);
  check(`${engine} imports the shared outline maths`,
    source.includes("@/lib/mathvizOutline"));
  check(`${engine} no longer defines its own copy of the walk`,
    !/function\s+sampleRegionOutline\s*\(/.test(source),
    "a private copy would drift from the shared one");
}
const svgEngine = read(ENGINE_FILES.svg);
check("the SVG engine imports the shared arc/region path builders",
  svgEngine.includes("@/lib/mathvizOutline") && svgEngine.includes("_regionPathData"));

// ── 3. the mirror's helpers on a real "kì dị" payload ───────────────────────

console.log("\n[point discovery on the tangent-arc figure]");
const TANGENT_ARCS = {
  layers: [
    { kind: "polygon", points: [
      { id: "A", x: 0, y: 0 }, { id: "B", x: 0, y: 3 }, { id: "C", x: 4, y: 0 }] },
    { kind: "arc", center: { id: "A", x: 0, y: 0 },
      from: { id: "R", x: 1, y: 0 }, to: { id: "P", x: 0, y: 1 } },
    { kind: "region", fill: "rgba(148, 163, 184, 0.3)", path: [
      { type: "point", id: "P", x: 0, y: 1 },
      { type: "arc", center: { id: "A", x: 0, y: 0 },
        from: { id: "P", x: 0, y: 1 }, to: { id: "Q", x: 1.6, y: 1.8 } },
      { type: "point", id: "Q", x: 1.6, y: 1.8 }] },
    { kind: "angle", points: ["B", "A", "C"], right_angle: true },
    { kind: "wedge", center: { id: "A", x: 0, y: 0 },
      from: { id: "R", x: 1, y: 0 }, to: { id: "P", x: 0, y: 1 } },
  ],
};

const ids = collectLayerPoints(TANGENT_ARCS.layers).map((pt) => pt.id).sort();
check("points inside arc/region are collected, not just polygon vertices",
  ["A", "B", "C", "P", "Q", "R"].every((id) => ids.indexOf(id) > -1), ids.join(","));
check("an angle's three bare ids are recognised as references",
  layerReferenceIds(TANGENT_ARCS.layers[3]).join() === "B,A,C");
check("the region's own fill string is not mistaken for a point id",
  layerReferenceIds(TANGENT_ARCS.layers[2]).indexOf("rgba(148, 163, 184, 0.3)") === -1);
check("a 'wedge' alias normalises to sector, an invented kind to ''",
  canonicalKind("wedge") === "sector" && canonicalKind("spiral") === "");
check("an arc keeps every defining point",
  iterLayerPoints(TANGENT_ARCS.layers[1]).length === 3);
check("collectLayerPoints de-duplicates by id",
  ids.length === new Set(ids).size);

console.log(`\n${checks - failures}/${checks} MATHVIZ KIND CHECKS PASSED`);
if (failures > 0) {
  console.log(">>> MATHVIZ KIND CONTRACT DRIFTED — see the failures above <<<");
  process.exit(1);
}