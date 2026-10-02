// frontend/scripts/check-mathviz-extract.mjs
//
// P15-fix — the reply extractor must turn EVERY mathviz payload into a figure
// and must NEVER leak raw JSON into the chat.
//
// The bug this guards (classroom report 2026-10-01): the chat displayed the
// mathviz JSON as raw text. The old extractor inside DuoMCBPage.js only knew
// the exact fence ```mathviz, so a payload the model wrapped in ```json (a
// very common slip) sailed through to the message verbatim. The logic now
// lives in src/lib/mathvizExtract.js — a pure module — so this node script can
// run real inputs through it instead of regex-reading the component.
//
// Run:  node scripts/check-mathviz-extract.mjs   (from frontend/)

import { extractMathvizBlock } from "../src/lib/mathvizExtract.js";

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

// 1. the canonical fence still works
let r = extractMathvizBlock('Giải ngắn.\n\n```mathviz\n{"type":"mathviz.v1","widget":"geometry_2d"}\n```');
check("a canonical ```mathviz fence renders and leaves clean text",
      r.vizData && r.vizData.widget === "geometry_2d" && r.text === "Giải ngắn.", JSON.stringify(r));

// 2. the classroom leak: a ```json-fenced payload
r = extractMathvizBlock('Giải ngắn.\n\n```json\n{"type":"mathviz.v1","widget":"geometry_2d","mode":"triangle"}\n```');
check("a ```json-fenced payload is recovered as a figure (the reported leak)",
      r.vizData && r.vizData.widget === "geometry_2d");
check("...and NO raw JSON or fence stays in the visible text",
      !r.text.includes("{") && !r.text.includes("```") && r.text === "Giải ngắn.");

// 3. a bare fence, with the type defaulted
r = extractMathvizBlock('Thử.\n```\n{"widget":"geometry_3d","solid":"triangular_pyramid"}\n```');
check("a bare fence is recovered and type defaults to mathviz.v1",
      r.vizData && r.vizData.type === "mathviz.v1" && r.vizData.widget === "geometry_3d");
check("...with the block stripped from the text", r.text === "Thử.");

// 4. a ```javascript fence
r = extractMathvizBlock('```javascript\n{"type":"mathviz.v1","widget":"function_plot","expr":"x^2"}\n```');
check("a ```javascript fence is recovered", !!(r.vizData && r.vizData.widget === "function_plot"));

// 5. an unparseable mathviz-looking payload is HIDDEN, never leaked
r = extractMathvizBlock('Xong.\n```json\n{"type":"mathviz.v1","widget":"geometry_2d",,,}\n```');
check("an unparseable mathviz payload is hidden, not leaked",
      r.vizData === null && r.text === "Xong.", JSON.stringify(r));

// 6. an unrelated JSON code block is left untouched
const unrelated = 'Đây là code:\n```json\n{"a": 1}\n```';
r = extractMathvizBlock(unrelated);
check("an unrelated JSON code block is left alone",
      r.vizData === null && r.text === unrelated);

// 7. a truncated canonical fence leaks nothing
r = extractMathvizBlock('Vẽ nhé.\n\n```mathviz\n{"type":"mathviz.v1","widget":"geometry_2d"');
check("a truncated canonical fence leaks nothing",
      r.vizData === null && r.text === "Vẽ nhé.", JSON.stringify(r));

// 8. plain text and empty input pass through safely
check("plain text passes through", extractMathvizBlock("Chào em!").text === "Chào em!");
check("empty input is safe",
      extractMathvizBlock("").vizData === null && extractMathvizBlock(null).text === "");

console.log(`\n${checks - failures}/${checks} MATHVIZ EXTRACT CHECKS PASSED`);
if (failures) {
  console.log(">>> MATHVIZ EXTRACT SUITE FAILED <<<");
  process.exit(1);
}
