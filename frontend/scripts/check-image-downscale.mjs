#!/usr/bin/env node
// frontend/scripts/check-image-downscale.mjs
//
// Đợt 4H-2 guard for the production failure of 2026-09-28: POST /api/chat from
// the Vercel origin produced no response at all, and a 4-5 MB phone photo is the
// single biggest reason the pipeline's silent window outlived the proxy.
//
// Two jobs:
//   1. unit-test the pure maths of src/lib/imageDownscale.js under plain node
//      (no bundler, no DOM) — it is what decides the pixel budget we upload with;
//   2. pin the two cross-boundary invariants that would silently re-open the bug:
//      the JS cap must equal backend/security_limits.py's MAX_IMAGE_B64_CHARS,
//      and the DuoMCB upload path must actually route through the helper instead
//      of a bare `FileReader.readAsDataURL(file)`.
//
// Usage: node scripts/check-image-downscale.mjs     (exit 0 = clean, 1 = broken)

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FRONTEND_DIR = fileURLToPath(new URL("..", import.meta.url));
const REPO_DIR = join(FRONTEND_DIR, "..");
const MODULE_REL = "src/lib/imageDownscale.js";

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

const img = await import(pathToFileURL(join(FRONTEND_DIR, MODULE_REL)).href);

// ── 1. pixel budget ─────────────────────────────────────────────────────────
console.log("\n[targetSize]");
const landscape = img.targetSize(4032, 3024);
check("a 12 MP phone photo lands on a 1600 px longest edge",
  landscape.width === 1600 && landscape.height === 1200, JSON.stringify(landscape));
const portrait = img.targetSize(3000, 4000);
check("portrait is bounded on its long edge too",
  portrait.height === 1600 && portrait.width === 1200, JSON.stringify(portrait));
const small = img.targetSize(800, 600);
check("a small image is not touched (never upscaled)",
  small.width === 800 && small.height === 600, JSON.stringify(small));
const degenerate = img.targetSize(0, 0);
check("a zero size reports zero instead of dividing by it",
  degenerate.width === 0 && degenerate.height === 0, JSON.stringify(degenerate));
const wide = img.targetSize(4000, 500);
check("an extreme aspect ratio stays proportional (~1 px rounding)",
  Math.abs((wide.width / wide.height) - (4000 / 500)) < 0.02, JSON.stringify(wide));
check("the default edge is the documented 1600", img.MAX_IMAGE_EDGE === 1600);

// ── 2. size accounting against the server's cap ─────────────────────────────
console.log("\n[size accounting]");
check("a data: URL counts only its payload",
  img.base64PayloadChars("data:image/jpeg;base64,AAAA") === 4);
check("a raw base64 string counts as-is", img.base64PayloadChars("AAAA") === 4);
check("null/undefined count as zero",
  img.base64PayloadChars(null) === 0 && img.base64PayloadChars(undefined) === 0);
check("base64 length converts to bytes at 3/4", img.base64Bytes(8) === 6 && img.base64Bytes(0) === 0);
check("bytes below 1 KB print as B", img.formatBytes(512) === "512 B");
check("kilobytes print as KB", img.formatBytes(240 * 1024) === "240 KB");
check("megabytes keep one decimal", img.formatBytes(5.2 * 1024 * 1024) === "5.2 MB");

// ── 3. the message the student sees ─────────────────────────────────────────
console.log("\n[copy]");
check("a real saving produces a Vietnamese label",
  img.describeCompression(5_200_000, 240_000).includes("nén"), img.describeCompression(5_200_000, 240_000));
check("no saving (or a bigger result) produces no label",
  img.describeCompression(1000, 2000) === "" && img.describeCompression(0, 10) === "");
check("the too-large message is actionable Vietnamese copy",
  img.TOO_LARGE_MESSAGE.includes("quá lớn") && img.TOO_LARGE_MESSAGE.length > 40);
check("the JPEG quality is high enough for subscripts",
  img.JPEG_QUALITY >= 0.8 && img.JPEG_QUALITY <= 0.95);
check("prepareImageForUpload is exported for the UI to call",
  typeof img.prepareImageForUpload === "function");

// ── 4. cross-boundary invariants ────────────────────────────────────────────
console.log("\n[invariants]");
const limits = readFileSync(join(REPO_DIR, "backend", "security_limits.py"), "utf8");
const serverCap = Number((limits.match(/MAX_IMAGE_B64_CHARS\s*=\s*([\d_]+)/) || [])[1].replace(/_/g, ""));
check("the JS cap equals backend/security_limits.py::MAX_IMAGE_B64_CHARS",
  Number.isFinite(serverCap) && serverCap === img.MAX_IMAGE_B64_CHARS,
  `server=${serverCap} client=${img.MAX_IMAGE_B64_CHARS}`);
check("the client cap is not looser than the server's",
  img.MAX_IMAGE_B64_CHARS <= serverCap, `client=${img.MAX_IMAGE_B64_CHARS} server=${serverCap}`);

const page = readFileSync(join(FRONTEND_DIR, "src/components/DuoMCB/DuoMCBPage.js"), "utf8");
check("DuoMCBPage imports the downscale helper",
  /from\s+["']@\/lib\/imageDownscale["']/.test(page));
check("the drop/paste path routes images through prepareImageForUpload",
  /prepareImageForUpload\(\s*file/.test(page));
const rawReads = (page.match(/readAsDataURL\(file\)/g) || []).length;
check("no bare readAsDataURL(file) shortcut is left in the image path",
  rawReads === 0, `${rawReads} occurrence(s)`);

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
  console.log("FAILED: " + failures.join(", "));
  process.exit(1);
}
console.log("ALL_IMAGE_DOWNSCALE_CHECKS_PASSED");
