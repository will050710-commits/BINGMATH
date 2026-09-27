#!/usr/bin/env node
// frontend/scripts/check-api-base.mjs
//
// CI guard for the 2026-09-27 production incident: five widgets shipped with
// `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`. NEXT_PUBLIC_*
// values are inlined at BUILD time, the variable was not set on Vercel, so the
// deployed bundle called http://localhost:8000 on a visitor's machine and the
// enforced CSP (connect-src 'self' https://duomath.onrender.com …) blocked it:
// the home page showed "Failed to fetch leaderboard".
//
// Rule: every frontend module resolves the backend through src/lib/apiBase.js.
// This script fails when a bare localhost API URL appears anywhere else.
//
// Usage: node scripts/check-api-base.mjs      (exit 0 = clean, 1 = offenders)

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = join(FRONTEND_DIR, "src");
const ALLOWED_REL = "src/lib/apiBase.js";
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs"]);
// Matches a quoted absolute URL to a local API port, e.g. "http://localhost:8000".
const FORBIDDEN = /["'`]https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):\d+/;

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

// Strips block and line comments so explanatory text never trips the guard.
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
}

const offenders = [];
for (const file of walk(SRC_DIR)) {
  const rel = relative(FRONTEND_DIR, file).split(sep).join("/");
  if (rel === ALLOWED_REL) continue;

  const lines = stripComments(readFileSync(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (FORBIDDEN.test(line)) offenders.push(`${rel}:${index + 1}: ${line.trim()}`);
  });
}

if (offenders.length > 0) {
  console.error("Hard-coded localhost API URL found outside src/lib/apiBase.js:\n");
  console.error(offenders.join("\n"));
  console.error("\nImport the resolver instead: import { resolveApiBase } from \"@/lib/apiBase\";");
  console.error("Reason: NEXT_PUBLIC_* is inlined at build time and a localhost");
  console.error("literal is blocked by the production CSP — see src/lib/apiBase.js.");
  process.exit(1);
}

console.log("OK — no hard-coded localhost API URLs outside src/lib/apiBase.js");
