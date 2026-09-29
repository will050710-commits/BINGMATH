// frontend/src/lib/mathvizOutline.js
//
// Đợt 8 / 4I — outline sampling for the shapes that are not a polygon.
//
// Both curved engines need the same three things, and they used to exist only
// inside the JSXGraph component (or not at all, which is why the Konva engine had
// to report `region` as unsupported):
//
//   * a data-curve approximation of an `arc`  (JSXGraph has no bare path element);
//   * a data-curve approximation of an `ellipse`;
//   * a walk over a `region`'s MIXED outline — straight edges and arcs in one closed
//     path — which is what a shaded curvilinear area actually is (the area between
//     two tangent arcs is the classic case).
//
// Kept here rather than duplicated so the two engines can never disagree about
// where a curve goes, and so the vocabulary guard can treat the capability as real
// for both. Pure functions: no React, no DOM, importable from plain node.
//
// Every `lookup` argument takes a point reference — an inline {x, y} or an id
// string / point object — and returns MATH coordinates ([x, y]) or null.

/** Samples of the arc from `from` to `to` on the circle centred at `c`. */
export function sampleArcPoints(center, from, to, largeArc, steps = 28) {
  const [cx, cy] = center;
  const r = Math.hypot(from[0] - cx, from[1] - cy);
  if (!(r > 0)) return [];
  const a1 = Math.atan2(from[1] - cy, from[0] - cx);
  const a2 = Math.atan2(to[1] - cy, to[0] - cx);
  let sweep = a2 - a1;
  // Normalise to the MINOR arc first (-π, π], then invert it when the callers asked
  // for the reflex side.
  while (sweep <= -Math.PI) sweep += Math.PI * 2;
  while (sweep > Math.PI) sweep -= Math.PI * 2;
  if (largeArc) sweep -= Math.sign(sweep) * Math.PI * 2;
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = a1 + (sweep * i) / steps;
    out.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return out;
}

/** Samples of a full ellipse (JSXGraph's own Ellipse needs two foci and a point). */
export function sampleEllipse(center, a, b, steps = 72) {
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (Math.PI * 2 * i) / steps;
    out.push([center[0] + a * Math.cos(angle), center[1] + b * Math.sin(angle)]);
  }
  return out;
}

/** A sector's outline: the two radii plus the arc between them. */
export function sampleSectorOutline(center, from, to, largeArc, steps = 28) {
  const arc = sampleArcPoints(center, from, to, largeArc, steps);
  if (arc.length < 2) return [];
  return [center, ...arc, center];
}

/**
 * Walks a `region`'s outline in order: `{type: 'point'}` items are vertices,
 * `{type: 'arc'}` items are curved edges (a straight chord is used when the item
 * is an edge and not a curve — `{type: 'segment'}` / `{type: 'line'}`).
 */
export function sampleRegionOutline(items, lookup) {
  const path = [];
  const usable = (p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]);
  (Array.isArray(items) ? items : []).forEach((item) => {
    const kind = String((item && (item.type || item.kind)) || '').toLowerCase();
    if (kind === 'arc' || kind === 'circle_arc' || kind === 'sector') {
      const c = lookup(item.center);
      const f = lookup(item.from);
      const t = lookup(item.to);
      if (!c || !f || !t) return;
      sampleArcPoints(c, f, t, item.large_arc === true).forEach((pt) => path.push(pt));
      return;
    }
    const p = lookup(item);
    if (usable(p)) path.push([p[0], p[1]]);
  });
  return path;
}

/** [x, y] pairs → the [x, y, x, y, …] flat array Konva's Line/Shape expect. */
export function pointsToFlat(path) {
  const flat = [];
  (Array.isArray(path) ? path : []).forEach(([x, y]) => {
    if (Number.isFinite(x) && Number.isFinite(y)) flat.push(x, y);
  });
  return flat;
}

/** [x, y] pairs → the two parallel arrays JSXGraph's `curve` expects. */
export function curveXY(path) {
  return [path.map((pt) => pt[0]), path.map((pt) => pt[1])];
}

/**
 * Which of the two possible SVG arcs matches the centre we were given.
 * SVG's y axis points down, so a positive cross product in screen pixels is the
 * clockwise-on-screen direction — i.e. sweep-flag 1.
 */
export function arcSweepFlag(c, f, t) {
  const cross = (f[0] - c[0]) * (t[1] - c[1]) - (f[1] - c[1]) * (t[0] - c[0]);
  return cross > 0 ? 1 : 0;
}

/** The `d` attribute for an arc (optionally closed through its centre). */
export function arcPathData(c, f, t, largeArc, closeWithCenter) {
  const r = Math.max(0.5, Math.hypot(f[0] - c[0], f[1] - c[1]));
  const d = `M${f[0]},${f[1]} A${r},${r} 0 ${largeArc ? 1 : 0},${arcSweepFlag(c, f, t)} ${t[0]},${t[1]}`;
  return closeWithCenter ? `${d} L${c[0]},${c[1]} Z` : d;
}

/** The `d` attribute for a mixed point/arc outline (used by the SVG engine). */
export function regionPathData(items, lookup) {
  const parts = [];
  (Array.isArray(items) ? items : []).forEach((item) => {
    const kind = String((item && (item.type || item.kind)) || '').toLowerCase();
    if (kind === 'arc' || kind === 'circle_arc' || kind === 'sector') {
      const c = lookup(item.center);
      const f = lookup(item.from);
      const t = lookup(item.to);
      if (!c || !f || !t) return;
      const r = Math.max(0.5, Math.hypot(f[0] - c[0], f[1] - c[1]));
      parts.push(`${parts.length ? 'L' : 'M'}${f[0]},${f[1]}`);
      parts.push(`A${r},${r} 0 ${item.large_arc ? 1 : 0},${arcSweepFlag(c, f, t)} ${t[0]},${t[1]}`);
      return;
    }
    const p = lookup(item);
    if (Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])) {
      parts.push(`${parts.length ? 'L' : 'M'}${p[0]},${p[1]}`);
    }
  });
  return parts.length > 1 ? `${parts.join(' ')} Z` : null;
}