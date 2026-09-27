// frontend/src/lib/penroseTrios.js
//
// Phase 4 (integration-guide item 1) — Penrose figures for geometry lessons.
//
// Why the trios live here and not on a server: Penrose compiles a *trio*
// (domain + style + substance) in the browser through @penrose/core and returns
// an SVG. Everything below is our own content (MIT-compatible: written for this
// project), so there is no image licence to track — unlike stock illustrations.
//
// Two rules learned from the installed build (verified with
// `node scripts/check-penrose-trios.mjs --vocab`):
//   1. @penrose/core ships NO domain files and no `.wasm`: the geometry library
//      (circumcenter, concyclic, …) is a separate package, so these trios use
//      only what core exposes — `equal`, `isConvex`, `onCanvas`, `vdist`, plus
//      plain vector arithmetic. Nothing here depends on an external import.
//   2. Point positions are free variables: the optimizer places them inside the
//      canvas, so every `variation` yields a different but always valid figure.
//      That is what the "đổi hình" button in the UI switches.
//
// Verified by: node scripts/check-penrose-trios.mjs (compile + optimize, no DOM)

// Shared visual language — light strokes, because the app renders on a dark page.
const INK = "rgba(0.93, 0.96, 1.0, 1.0)";
const SIDE = "rgba(0.72, 0.86, 1.0, 0.95)";
const FILL = "rgba(0.23, 0.51, 0.96, 0.12)";
const ACCENT = "rgba(1.0, 0.62, 0.24, 1.0)";
const RING = "rgba(0.29, 0.87, 0.86, 0.9)";
const CENTER_DOT = "rgba(1.0, 0.42, 0.35, 1.0)";

const BASE_STYLE = (figure) => `
canvas {
  width = 440.0
  height = 340.0
}

forall Point p {
  p.icon = Circle {
    center: (0.0, 0.0)
    r: 4.0
    fillColor: ${INK}
    strokeColor: ${INK}
    strokeWidth: 0.0
  }
  p.text = Text {
    string: p.label
    center: (0.0, 0.0)
    fontSize: "16px"
    fillColor: ${INK}
  }
  ensure onCanvas(p.icon, canvas.width, canvas.height)
  p.text.center = p.icon.center + (11.0, 9.0)
}

-- Keep vertices from collapsing onto each other. notTooClose is a smooth
-- objective, so the optimizer can actually act on it.
forall Point p, q
where Pair(p, q) {
  encourage notTooClose(p.icon, q.icon, 8.0)
}

forall Segment s; Point p, q
where SegmentEnds(s, p, q) {
  s.icon = Line {
    start: p.icon.center
    end: q.icon.center
    strokeColor: ${SIDE}
    strokeWidth: 1.8
  }
  ensure onCanvas(s.icon, canvas.width, canvas.height)
}

forall Polygon t; Point p, q, r
where Triangle(t, p, q, r) {
  t.icon = Polygon {
    points: [p.icon.center, q.icon.center, r.icon.center]
    fillColor: ${FILL}
    strokeColor: ${SIDE}
    strokeWidth: 1.8
  }
  -- isConvex looks like the natural fit, but it is an INDICATOR constraint:
  -- energy is exactly 0 or 1 with no gradient, so the optimizer cannot repair a
  -- bad start (measured: the residual stayed at 1.0 forever). nonDegenerateAngle
  -- is the smooth objective with the same intent — keep the vertices off one line.
  encourage nonDegenerateAngle(p.icon, q.icon, r.icon, 20.0, 10.0)
  ensure onCanvas(t.icon, canvas.width, canvas.height)
}
${figure}
`;

export const PENROSE_TRIOS = [
  {
    id: "trung-tuyen",
    title: "Ba đường trung tuyến đồng quy tại trọng tâm",
    hint: "Kéo thanh nào cũng được — trọng tâm luôn chia mỗi trung tuyến theo tỉ lệ 2:1 tính từ đỉnh.",
    variation: "duomath-trong-tam",
    domain: `
type Point
type Segment
type Polygon

predicate SegmentEnds(Segment s, Point p, Point q)
predicate Triangle(Polygon t, Point p, Point q, Point r)
predicate Centroid(Point a, Point b, Point c, Point g)
predicate Median(Segment s, Point vertex, Point p, Point q)
predicate Pair(Point p, Point q)
`,
    substance: `
Point A, B, C
Point G

Segment AB, BC, CA
Segment ma, mb, mc

Polygon T

SegmentEnds(AB, A, B)
SegmentEnds(BC, B, C)
SegmentEnds(CA, C, A)
Triangle(T, A, B, C)

Centroid(A, B, C, G)
Median(ma, A, B, C)
Median(mb, B, C, A)
Median(mc, C, A, B)

-- Pairwise list (Penrose has no "!=" in a where-clause, so distinctness is
-- expressed in the Substance instead).
Pair(A, B)
Pair(A, C)
Pair(B, C)
`,
    style: BASE_STYLE(`
-- G is the centroid: the average of the three vertices. Pure arithmetic, so no
-- optimizer freedom and no chance of a wrong figure.
forall Point a, b, c, g where Centroid(a, b, c, g) {
  g.icon.center = (a.icon.center + b.icon.center + c.icon.center) / 3.0
  g.icon.r = 5.0
  g.icon.fillColor = ${CENTER_DOT}
  g.icon.strokeColor = ${CENTER_DOT}
}

-- A median runs from a vertex to the midpoint of the opposite side, which is
-- exactly (p + q) / 2 — the same formula the /khampha parabola widget uses for
-- its vertex, so the student sees one consistent piece of mathematics.
forall Segment s; Point v, p, q
where Median(s, v, p, q) {
  s.icon = Line {
    start: v.icon.center
    end: (p.icon.center + q.icon.center) / 2.0
    strokeColor: ${ACCENT}
    strokeWidth: 1.6
    strokeDasharray: "7 5"
  }
  ensure onCanvas(s.icon, canvas.width, canvas.height)
}
`),
  },
  {
    id: "ngoai-tiep",
    title: "Đường tròn ngoại tiếp tam giác",
    hint: "Tâm đường tròn ngoại tiếp là điểm cách đều ba đỉnh — đúng ba đẳng thức mà hình này đang giải.",
    variation: "duomath-ngoai-tiep",
    domain: `
type Point
type Segment
type Polygon
type Circle

predicate SegmentEnds(Segment s, Point p, Point q)
predicate Triangle(Polygon t, Point p, Point q, Point r)
predicate Circumcircle(Circle c, Point p, Point q, Point r)
predicate Pair(Point p, Point q)
`,
    substance: `
Point A, B, C
Circle omega

Segment AB, BC, CA
Polygon T

SegmentEnds(AB, A, B)
SegmentEnds(BC, B, C)
SegmentEnds(CA, C, A)
Triangle(T, A, B, C)

Circumcircle(omega, A, B, C)

Pair(A, B)
Pair(A, C)
Pair(B, C)
`,
    style: BASE_STYLE(`
-- The circumcentre is DEFINED by "equidistant from the three vertices", so that
-- is written as three equations instead of a formula. The optimizer solves for
-- centre (x, y) and radius r — three unknowns, three equations, one answer.
forall Circle c; Point p, q, r
where Circumcircle(c, p, q, r) {
  c.icon = Circle {
    strokeColor: ${RING}
    strokeWidth: 1.8
    fillColor: rgba(0.0, 0.0, 0.0, 0.0)
  }
  ensure equal(vdist(c.icon.center, p.icon.center), vdist(c.icon.center, q.icon.center))
  ensure equal(vdist(c.icon.center, q.icon.center), vdist(c.icon.center, r.icon.center))
  ensure equal(c.icon.r, vdist(c.icon.center, p.icon.center))
  ensure onCanvas(c.icon, canvas.width, canvas.height)
}
`),
  },
];

/** The trio whose figure the UI shows first. */
export const DEFAULT_PENROSE_TRIO = PENROSE_TRIOS[0].id;
