#!/usr/bin/env node
// frontend/scripts/check-three-api.mjs
//
// Đợt 4H-2 guard: keep deprecated Three.js APIs out of the bundle.
//
// Production console (three@0.185.1) printed:
//     "Clock: This module has been deprecated. Please use THREE.Timer instead."
// The two APIs are not interchangeable — Clock's getDelta() mutates state as a
// side effect while Timer requires one `update()` per frame — so a half-migration
// (some files on Clock, one on Timer) is worse than either. This gate fails on
// the deprecation in src/ and pins the correct Timer usage in the one place that
// uses it, including the connect()/dispose() pair that makes the Page Visibility
// API work.
//
// Usage: node scripts/check-three-api.mjs       (exit 0 = clean, 1 = offenders)

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = join(FRONTEND_DIR, "src");
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs"]);

let checks = 0;
const failures = [];

function check(label, condition, detail = "") {
  checks += 1;
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL ${label} ${detail}`);
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      yield* walk(full);
    } else {
      const dot = entry.name.lastIndexOf(".");
      if (dot > -1 && CODE_EXTENSIONS.has(entry.name.slice(dot))) yield full;
    }
  }
}

// Comments explain the incident; they must not trip the guard.
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
}

const DEPRECATED = [
  { pattern: /new\s+THREE\.Clock\s*\(/, label: "new THREE.Clock()" },
  { pattern: /\.getElapsedTime\s*\(/, label: ".getElapsedTime() (Clock-only API)" },
];

console.log("\n[deprecated three APIs]");
const offenders = [];
for (const file of walk(SRC_DIR)) {
  const rel = relative(FRONTEND_DIR, file).split(sep).join("/");
  const lines = stripComments(readFileSync(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { pattern, label } of DEPRECATED) {
      if (pattern.test(line)) offenders.push(`${rel}:${index + 1}: ${label} — ${line.trim()}`);
    }
  });
}
check("no deprecated Clock API anywhere in src/", offenders.length === 0, "\n" + offenders.join("\n"));

console.log("\n[Timer usage]");
const cosmosRel = "src/components/trangchu/CosmosBackground.js";
const cosmos = readFileSync(join(FRONTEND_DIR, cosmosRel), "utf8");
check("CosmosBackground constructs a THREE.Timer", /new\s+THREE\.Timer\s*\(\)/.test(cosmos));
check("it connects the timer to the document (Page Visibility API)",
  /\.connect\s*\(\s*document\s*\)/.test(cosmos));
check("it calls update() once per frame before reading the timer",
  /timer\.update\(\)/.test(cosmos) && cosmos.indexOf("timer.update()") < cosmos.indexOf("timer.getElapsed()"));
check("it reads the Timer API name getElapsed(), not Clock's getElapsedTime()",
  /timer\.getElapsed\(\)/.test(cosmos));
check("it disposes the timer when the effect is torn down (listener included)",
  /timer\.dispose\(\)/.test(cosmos));

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
  console.log("FAILED: " + failures.join(", "));
  process.exit(1);
}
console.log("ALL_THREE_API_CHECKS_PASSED");
