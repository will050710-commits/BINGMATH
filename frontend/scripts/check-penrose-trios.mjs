#!/usr/bin/env node
// frontend/scripts/check-penrose-trios.mjs
//
// Phase 4 (integration-guide item 1) — the verification pass the plan asked for
// before Penrose ships. Two jobs:
//
//   node scripts/check-penrose-trios.mjs --vocab
//       Print every constraint / function / objective name this build of
//       @penrose/core actually exposes. A Style program may only call these
//       (plus the ones it defines itself), so this is the vocabulary a trio
//       author works with.
//
//   node scripts/check-penrose-trios.mjs
//       Compile + optimize every trio in src/lib/penroseTrios.js and fail if one
//       of them does not converge. Runs in plain Node (no DOM, no browser), so it
//       can gate CI: a trio that would have blown up in the student's face is
//       caught here instead.
//
// Why no build check in this file: `toSVG`/`diagram` need a DOM, which is why
// the app renders through dynamic(..., { ssr: false }) and why the bundler side
// is covered by the `frontend-build` job in .github/workflows/quality-gate.yml.

const WANT_VOCAB = process.argv.includes("--vocab");
const WANT_DIAGNOSE = process.argv.includes("--diagnose");

const penrose = await import("@penrose/core");
const { compileTrio, optimize, showError } = penrose;

function names(dict) {
  return Object.keys(dict ?? {}).sort();
}

if (WANT_VOCAB) {
  const KEYS = /circle|line|point|seg|collinear|concyclic|parallel|perp|mid|dist|angle|length|on|through|equal|norm|dot|cross|rot|unit|add|sub|mul|div|sqrt|pow|sin|cos|tan|abs|min|max|mean|mod|tri|poly|intersect|ray|arc|tangent|norm/i;
  const skip = (name) => !KEYS.test(name) || name.startsWith("_");
  const show = (label, dict) => {
    const all = names(dict);
    console.log(`\n=== ${label}: ${all.length} names ===`);
    console.log(all.filter((n) => !skip(n)).join(" · "));
  };
  show("constraints (ensure/encourage)", penrose.constrDict);
  show("functions (Style expressions)", penrose.compDict);
  show("objectives (penalize)", penrose.objDict);
  console.log(`\nshape kinds: ${Object.keys(penrose.shapeTypes ?? {}).join(" · ")}`);
  process.exit(0);
}

let trios;
try {
  ({ PENROSE_TRIOS: trios } = await import("../src/lib/penroseTrios.js"));
} catch (err) {
  console.log(`No src/lib/penroseTrios.js yet (${err.message}) — nothing to verify.`);
  process.exit(0);
}

let failures = 0;
for (const trio of trios) {
  const label = `${trio.id} (${trio.title ?? "untitled"})`;
  let compiled;
  try {
    compiled = await compileTrio({
      domain: trio.domain,
      substance: trio.substance,
      style: trio.style,
      variation: trio.variation ?? "duomath-figure",
      excludeWarnings: trio.excludeWarnings ?? [],
    });
  } catch (err) {
    failures += 1;
    console.log(`FAIL  ${label} — compile threw: ${err?.message ?? err}`);
    continue;
  }

  if (compiled.isErr()) {
    failures += 1;
    console.log(`FAIL  ${label} — ${showError(compiled.error)}`);
    continue;
  }

  const optimized = optimize(compiled.value);
  if (optimized.isErr()) {
    failures += 1;
    console.log(`FAIL  ${label} — optimizer did not converge: ${showError(optimized.error)}`);
    continue;
  }

  const state = optimized.value;
  const before = penrose.evalEnergy(compiled.value);
  const energy = penrose.evalEnergy(state);

  if (WANT_DIAGNOSE) {
    const { constrEngs, objEngs } = penrose.evalFns(state);
    const worst = [...constrEngs].sort((a, b) => b - a).slice(0, 5);
    const violated = constrEngs.filter((e) => e > 1e-3).length;
    console.log(`\n--- ${trio.id} ---`);
    console.log(`energy before optimize : ${before.toExponential(3)}`);
    console.log(`energy after  optimize : ${energy.toExponential(3)}`);
    console.log(`constraints: ${constrEngs.length} total, ${violated} above 1e-3`);
    console.log(`objectives : ${objEngs.length}`);
    console.log(`worst 5    : ${worst.map((e) => e.toExponential(2)).join("  ")}`);
    console.log(`canvas     : ${state.canvas.width}x${state.canvas.height}, shapes ${state.shapes.length}`);
    continue;
  }

  // A figure is only trustworthy if the optimizer actually satisfied the
  // constraints it was given — converging to a big residual is not a pass.
  const { constrEngs } = penrose.evalFns(state);
  const worstConstraint = constrEngs.length ? Math.max(...constrEngs) : 0;
  if (worstConstraint > 1e-2) {
    failures += 1;
    console.log(
      `FAIL  ${label} — optimizer converged with an unsatisfied constraint ` +
        `(worst ${worstConstraint.toExponential(2)}). Run with --diagnose for the breakdown.`
    );
    continue;
  }

  console.log(
    `ok    ${label} — ${state.shapes.length} shapes · canvas ${state.canvas.width}x${state.canvas.height}` +
      ` · constraints ${constrEngs.length} (worst ${worstConstraint.toExponential(1)}) · stages ${state.optStages.length}`
  );
}

console.log(
  failures === 0
    ? `\nALL_PENROSE_TRIOS_OK (${trios.length} trio(s))`
    : `\n${failures} TRIO(S) FAILED`
);
process.exit(failures === 0 ? 0 : 1);
