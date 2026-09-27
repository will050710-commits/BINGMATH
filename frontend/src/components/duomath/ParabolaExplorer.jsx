"use client";

// Phase 4 (integration guide item 2.5) — Mafs interactive widget.
//
// Why Mafs and not Penrose: Mafs is a plain React SVG library (~no WASM), so it
// works with Turbopack and with the existing client components, while Penrose
// ships a WASM core that would need its own bundler/asset verification pass.
// This is the prototype the guide asks for: an interactive parabola whose
// coefficients the student drags, with the vertex and the discriminant shown
// live — the same numbers the solver pipeline computes with SymPy.
//
// `mafs/core.css` is imported here so the component is self-contained; the page
// that renders it must load the component with `ssr: false` (Mafs measures the
// DOM), which is why it is wrapped in next/dynamic.

import { useMemo, useState } from "react";
import { Coordinates, Mafs, Plot, Point, Text, Theme } from "mafs";

// `mafs/core.css` is imported ONCE in src/app/layout.js: the App Router only
// allows global stylesheet imports in the root layout, so a component-level
// `import "mafs/core.css"` here would break the production build.

const SLIDERS = [
  { key: "a", label: "a", min: -2, max: 2, step: 0.1 },
  { key: "b", label: "b", min: -6, max: 6, step: 0.5 },
  { key: "c", label: "c", min: -5, max: 5, step: 0.5 },
];

export default function ParabolaExplorer({ height = 380 }) {
  const [coefficients, setCoefficients] = useState({ a: 1, b: -2, c: -3 });
  const { a, b, c } = coefficients;

  const maths = useMemo(() => {
    const discriminant = b * b - 4 * a * c;
    if (a === 0) {
      return { degenerate: true, discriminant, roots: [], vertex: null };
    }
    const vertex = { x: -b / (2 * a), y: c - (b * b) / (4 * a) };
    let roots = [];
    if (discriminant > 0) {
      const root = Math.sqrt(discriminant);
      roots = [(-b - root) / (2 * a), (-b + root) / (2 * a)].sort((m, n) => m - n);
    } else if (discriminant === 0) {
      roots = [-b / (2 * a)];
    }
    return { degenerate: false, discriminant, roots, vertex };
  }, [a, b, c]);

  const format = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(2));

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(34,211,238,0.22)", borderRadius: 14, padding: 14 }}>
      <Mafs viewBox={{ x: [-7, 7], y: [-6, 10] }} height={height} preserveAspectRatio={false}>
        <Coordinates.Cartesian subdivisions={2} />
        {!maths.degenerate && (
          <Plot.OfX y={(x) => a * x * x + b * x + c} color={Theme.blue} weight={3} />
        )}
        {maths.vertex && (
          <>
            <Point x={maths.vertex.x} y={maths.vertex.y} color={Theme.red} />
            <Text x={maths.vertex.x} y={maths.vertex.y} attach="n" size={15} color={Theme.red}>
              đỉnh ({format(maths.vertex.x)}, {format(maths.vertex.y)})
            </Text>
          </>
        )}
        {maths.roots.map((root) => (
          <Point key={root} x={root} y={0} color={Theme.green} />
        ))}
      </Mafs>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {SLIDERS.map(({ key, label, min, max, step }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <span style={{ width: 74, fontWeight: 700, color: "#67e8f9" }}>
              {label} = {format(coefficients[key])}
            </span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={coefficients[key]}
              onChange={(event) =>
                setCoefficients((prev) => ({ ...prev, [key]: Number(event.target.value) }))
              }
              style={{ flex: 1, accentColor: "#22d3ee" }}
            />
          </label>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.78)" }}>
        <div>
          Phương trình: <b>y = {format(a)}x² {b >= 0 ? "+" : "−"} {format(Math.abs(b))}x{" "}
          {c >= 0 ? "+" : "−"} {format(Math.abs(c))}</b>
        </div>
        {maths.degenerate ? (
          <div style={{ color: "#fbbf24" }}>
            a = 0 nên đây không còn là parabol — đồ thị suy biến thành đường thẳng y = {format(b)}x{" "}
            {c >= 0 ? "+" : "−"} {format(Math.abs(c))}.
          </div>
        ) : (
          <>
            <div>
              Δ = b² − 4ac = <b>{format(maths.discriminant)}</b>{" "}
              {maths.discriminant > 0
                ? "> 0 ⇒ hai nghiệm phân biệt"
                : maths.discriminant === 0
                  ? "= 0 ⇒ nghiệm kép"
                  : "< 0 ⇒ vô nghiệm thực"}
            </div>
            {maths.roots.length > 0 && (
              <div>
                Nghiệm: <b>{maths.roots.map((root) => `x = ${format(root)}`).join(", ")}</b>
              </div>
            )}
            <div>
              Trục đối xứng: <b>x = {format(maths.vertex.x)}</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
