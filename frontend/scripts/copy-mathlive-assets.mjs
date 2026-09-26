// frontend/scripts/copy-mathlive-assets.mjs
//
// Phase 4 — guide item 2.1. MathLive loads its virtual-keyboard fonts (and
// optional key sounds) from a public path; the guide's `cp -r` snippet is
// Unix-only, so this cross-platform script runs as a postinstall step on
// Windows (local dev), Linux (Vercel/Render builds) alike.
//
// Safe by design: if mathlive is not installed (or a fresh clone has not run
// `pnpm install` yet) the script simply exits 0.
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(here, "..");
const source = join(frontendRoot, "node_modules", "mathlive");
const publicDir = join(frontendRoot, "public");

if (!existsSync(source)) {
  console.log("[mathlive] package not installed — skipping asset copy.");
  process.exit(0);
}

function copyTree(fromDir, toDir) {
  if (!existsSync(fromDir)) return 0;
  mkdirSync(toDir, { recursive: true });

  let copied = 0;
  for (const entry of readdirSync(fromDir)) {
    const from = join(fromDir, entry);
    const to = join(toDir, entry);
    let stat;
    try {
      stat = statSync(from);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      copied += copyTree(from, to);
    } else {
      try {
        copyFileSync(from, to);
        copied += 1;
      } catch (error) {
        console.warn(`[mathlive] could not copy ${entry}: ${error?.message || error}`);
      }
    }
  }
  return copied;
}

try {
  const fonts = copyTree(join(source, "fonts"), join(publicDir, "mathlive-fonts"));
  const sounds = copyTree(join(source, "sounds"), join(publicDir, "mathlive-sounds"));
  console.log(`[mathlive] copied ${fonts} font file(s) and ${sounds} sound file(s) into public/`);
} catch (error) {
  console.warn("[mathlive] asset copy skipped:", error?.message || error);
}

process.exit(0);
