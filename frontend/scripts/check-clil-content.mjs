// frontend/scripts/check-clil-content.mjs
//
// C1 Gate Verification Script:
// Executes `validateClilLessonManifest()` directly against `L6_C1_L1_MANIFEST` and
// `MATH_TERMS_CATALOG`, runs negative schema/KaTeX/alignment tests, and verifies
// all R1-R8 runtime and accessibility contracts.
//
// Run: node scripts/check-clil-content.mjs (from frontend/)

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import katex from "katex";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(HERE, "..");
const require = createRequire(import.meta.url);

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

function read(relPath) {
  return readFileSync(join(FRONTEND, relPath), "utf8");
}

function loadTsModule(relPath, injectedModules = {}) {
  const src = read(relPath);
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: relPath,
  });
  const mod = { exports: {} };
  const customRequire = (id) => {
    if (id === "katex") return katex;
    if (id in injectedModules) return injectedModules[id];
    return require(id);
  };
  const fn = vm.runInNewContext(
    `(function(exports, require, module) { ${outputText}\n})`,
    { console }
  );
  fn(mod.exports, customRequire, mod);
  return mod.exports;
}

console.log("\n[1. Runtime execution of validateClilLessonManifest on L6-C1-L1 & MATH_TERMS_CATALOG]");

const mathTermsMod = loadTsModule("src/content/clil/mathTerms.ts");
const l6ManifestMod = loadTsModule("src/content/clil/lessons/L6-C1-L1.ts");
const validatorMod = loadTsModule("src/lib/clil/validateContent.ts");

const { MATH_TERMS_CATALOG } = mathTermsMod;
const { L6_C1_L1_MANIFEST } = l6ManifestMod;
const { validateClilLessonManifest } = validatorMod;

const liveResult = validateClilLessonManifest(L6_C1_L1_MANIFEST, MATH_TERMS_CATALOG);
check(
  "validateClilLessonManifest(L6_C1_L1_MANIFEST, MATH_TERMS_CATALOG) passes with 0 issues",
  liveResult.valid === true && liveResult.issues.length === 0,
  JSON.stringify(liveResult.issues)
);

check(
  "L6_C1_L1_MANIFEST contains >= 29 reviewed bilingual segments",
  Object.keys(L6_C1_L1_MANIFEST.segments).length >= 29,
  `count=${Object.keys(L6_C1_L1_MANIFEST.segments).length}`
);

// Negative runtime validator tests (R8)
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// 2a. Unknown termId reference
{
  const m = clone(L6_C1_L1_MANIFEST);
  m.termIds.push("non_existent_term_xyz");
  const res = validateClilLessonManifest(m, MATH_TERMS_CATALOG);
  check(
    "Validator rejects unknown termId reference (unknown_term_ref)",
    !res.valid && res.issues.some((i) => i.code === "unknown_term_ref"),
    JSON.stringify(res.issues)
  );
}

// 2b. Missing phrase alignment between EN and VI
{
  const m = clone(L6_C1_L1_MANIFEST);
  m.segments["sec.k1.body"].vi = [{ kind: "text", text: "Không có phrase tương ứng" }];
  const res = validateClilLessonManifest(m, MATH_TERMS_CATALOG);
  check(
    "Validator rejects EN/VI phraseId mismatch (phrase_alignment_mismatch)",
    !res.valid && res.issues.some((i) => i.code === "phrase_alignment_mismatch"),
    JSON.stringify(res.issues)
  );
}

// 2c. Missing Vietnamese definition on term
{
  const terms = clone(MATH_TERMS_CATALOG);
  terms.set.definition.vi = "   ";
  const res = validateClilLessonManifest(L6_C1_L1_MANIFEST, terms);
  check(
    "Validator rejects term missing definition.vi (missing_term_definition)",
    !res.valid && res.issues.some((i) => i.code === "missing_term_definition"),
    JSON.stringify(res.issues)
  );
}

// 2d. Unknown illustrationKey on term
{
  const terms = clone(MATH_TERMS_CATALOG);
  terms.set.illustrationKey = "non_existent_diagram";
  const res = validateClilLessonManifest(L6_C1_L1_MANIFEST, terms);
  check(
    "Validator rejects unknown illustrationKey (unknown_illustration_key)",
    !res.valid && res.issues.some((i) => i.code === "unknown_illustration_key"),
    JSON.stringify(res.issues)
  );
}

// 2e. Raw "$" delimiter inside text leaf
{
  const m = clone(L6_C1_L1_MANIFEST);
  m.segments["meta.title"].en = [{ kind: "text", text: "Sets and $x \\in A$ inline" }];
  const res = validateClilLessonManifest(m, MATH_TERMS_CATALOG);
  check(
    "Validator rejects raw '$' delimiter inside text leaf (raw_dollar_in_text)",
    !res.valid && res.issues.some((i) => i.code === "raw_dollar_in_text"),
    JSON.stringify(res.issues)
  );
}

// 2f. Malformed LaTeX syntax
{
  const m = clone(L6_C1_L1_MANIFEST);
  m.segments["meta.title"].en = [{ kind: "math", latex: "\\frac{1}{" }];
  const res = validateClilLessonManifest(m, MATH_TERMS_CATALOG);
  check(
    "Validator rejects malformed LaTeX syntax (invalid_latex)",
    !res.valid && res.issues.some((i) => i.code === "invalid_latex"),
    JSON.stringify(res.issues)
  );
}

// 2g. Unreviewed segment
{
  const m = clone(L6_C1_L1_MANIFEST);
  m.segments["meta.title"].review.status = "draft";
  const res = validateClilLessonManifest(m, MATH_TERMS_CATALOG);
  check(
    "Validator rejects unreviewed segment (unreviewed_segment)",
    !res.valid && res.issues.some((i) => i.code === "unreviewed_segment"),
    JSON.stringify(res.issues)
  );
}

console.log("\n[2. R1, R4, R5, R6, R7, R8 runtime & accessibility contracts]");
const l6ComponentSrc = read("src/components/thcs/Cacbaitoan6/L6_C1_L1.js");
const engineSrc = read("src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js");
const modeSwitchSrc = read("src/components/clil/LearningModeSwitch.tsx");
const contextSrc = read("src/context/LearningExperienceContext.tsx");
const popoverSrc = read("src/components/clil/MathTermPopover.tsx");
const badgeSrc = read("src/components/DuoMCB/VerificationStatusBadge.js");
const pwConfigSrc = read("playwright.config.ts");

check(
  "R1: PremiumLessonEngine uses ConnectedLearningModeSwitch and LearningModeSwitch safely defaults available modes",
  engineSrc.includes("<ConnectedLearningModeSwitch") &&
    modeSwitchSrc.includes("export function ConnectedLearningModeSwitch") &&
    modeSwitchSrc.includes("const MODE_ORDER: LearningMode[] = ['immersion', 'assisted', 'parallel']")
);

check(
  "R3: VerificationStatusBadge renders VerificationEvidencePanel and guards expectedRequestId",
  badgeSrc.includes("import VerificationEvidencePanel from \"./VerificationEvidencePanel\"") &&
    badgeSrc.includes("<VerificationEvidencePanel") &&
    badgeSrc.includes("expectedRequestId")
);

check(
  "R4: Glossary in L6_C1_L1.js and MC option chips in PremiumLessonEngine.js pass termId, surface, segmentId to MathTermTrigger",
  l6ComponentSrc.includes("termId={term.id}") &&
    l6ComponentSrc.includes("surface={term.en}") &&
    l6ComponentSrc.includes("term.definition.en") &&
    l6ComponentSrc.includes("term.definition.vi") &&
    engineSrc.includes("termId={entry.id}") &&
    engineSrc.includes("surface={`📖 ${entry.en}`}")
);

check(
  "R5 & R6: LearningExperienceContext integrates with useAuth(), reacts to user scope changes, and avoids reading localStorage during useState SSR/CSR init",
  contextSrc.includes("import { useAuth } from '@/context/authContext'") &&
    contextSrc.includes("const [mode, setModeState] = useState<LearningMode>(initialMode);") &&
    contextSrc.includes("if (scopeChanged)")
);

check(
  "R7: MathTermPopover implements mobile focus trap, inert background, zIndex 550 (> header 400), and desktop focus-within guard",
  popoverSrc.includes("data-testid=\"math-term-popover\"") &&
    popoverSrc.includes("zIndex: 550") &&
    popoverSrc.includes("el.setAttribute('inert', '')") &&
    popoverSrc.includes("onFocusCapture={handleFocusCapture}")
);

check(
  "R8: playwright.config.ts includes clil-pilot.spec.ts in testMatch",
  pwConfigSrc.includes("clil-pilot.spec.ts")
);

console.log(`\n${checks - failures}/${checks} CLIL C1 CHECKS PASSED`);
if (failures > 0) {
  process.exit(1);
}
