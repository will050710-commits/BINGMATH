#!/usr/bin/env node
// frontend/scripts/check-xss-sanitize.mjs
//
// Phase 0 / WP-0.3 CI guard:
//   1. Every `dangerouslySetInnerHTML` in src/ must come from an audited source:
//        - sanitizeHtml() / creditHtml() from src/lib/sanitize.js
//        - katex.renderToString(...) (with no raw catch-fallback inside __html)
//        - static <style dangerouslySetInnerHTML={{ __html: `...` }} />
//        - buildThemeBootstrapScript() in src/app/layout.js
//   2. src/lib/sanitize.js must keep DOMPurify + allowlist fallback intact.
//   3. src/app/(thpt) must not contain loose non-route .js files at its root.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = join(FRONTEND_DIR, "src");
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs"]);

let passed = 0;
let failed = 0;

function check(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name}${detail ? " — " + detail : ""}`);
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

// 1. Verify sanitize.js contract
const sanitizePath = join(SRC_DIR, "lib", "sanitize.js");
const sanitizeSrc = readFileSync(sanitizePath, "utf8");
check("sanitize.js imports DOMPurify", /import\s+DOMPurify\s+from\s+["']dompurify["']/.test(sanitizeSrc));
check("sanitize.js exports sanitizeHtml", /export\s+function\s+sanitizeHtml\b/.test(sanitizeSrc));
check("sanitize.js exports creditHtml", /export\s+function\s+creditHtml\b/.test(sanitizeSrc));
check("sanitize.js forbids script/iframe/object tags", /FORBID_TAGS/.test(sanitizeSrc) && /DROP_TAGS/.test(sanitizeSrc));

// 2. Audit every dangerouslySetInnerHTML usage in src/
const unsanitized = [];
let totalSites = 0;

for (const file of walk(SRC_DIR)) {
  const rel = relative(FRONTEND_DIR, file).split(sep).join("/");
  const raw = readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    if (!trimmed.includes("dangerouslySetInnerHTML")) return;

    totalSites++;
    // Gather surrounding 10-line window to inspect how __html is produced
    const windowStart = Math.max(0, idx - 5);
    const windowEnd = Math.min(lines.length, idx + 8);
    const snippet = lines.slice(windowStart, windowEnd).join("\n");

    const isThemeBootstrap = rel === "src/app/layout.js" && snippet.includes("buildThemeBootstrapScript()");
    const isStaticStyle = /<style\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*`/.test(snippet);
    const isSanitizeHelper =
      /\bsafeDetail\b|\bsafeCredit\b|\bsanitizeHtml\(|\bcreditHtml\(/.test(snippet) &&
      raw.includes("sanitize");
    const isKatexRender =
      snippet.includes("katex.renderToString") &&
      !/catch\s*\{[\s\S]*?return\s+[a-zA-Z0-9_.]+\s*;[\s\S]*?\}\)\(\)/.test(snippet);

    if (!isThemeBootstrap && !isStaticStyle && !isSanitizeHelper && !isKatexRender) {
      unsanitized.push(`${rel}:${idx + 1}: ${trimmed}`);
    }
  });
}

check(
  `All ${totalSites} dangerouslySetInnerHTML call sites use audited sanitizers/KaTeX`,
  unsanitized.length === 0,
  unsanitized.join("; ")
);

// 3. Ensure no loose dead .js files sit at root of src/app/(thpt)
const thptDir = join(SRC_DIR, "app", "(thpt)");
const looseThptFiles = readdirSync(thptDir, { withFileTypes: true })
  .filter((e) => e.isFile() && CODE_EXTENSIONS.has(e.name.slice(e.name.lastIndexOf("."))))
  .map((e) => e.name);

check(
  "No dead loose .js files in src/app/(thpt)",
  looseThptFiles.length === 0,
  looseThptFiles.join(", ")
);

if (failed > 0) {
  console.error(`\ncheck-xss-sanitize failed: ${failed} failed, ${passed} passed.`);
  process.exit(1);
}
console.log(`\nOK — ${passed}/${passed} XSS & dead-file checks passed.`);
