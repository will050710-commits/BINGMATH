// frontend/src/lib/mathvizExtract.js
//
// The ONE extractor for a mathviz block inside a reply (P15-fix).
//
// The classroom report (2026-10-01): the chat showed the mathviz JSON as raw
// text instead of a figure. Two gaps caused it, and this module closes both:
//   1. the old extractor only recognised the exact fence ```mathviz, so a
//      payload the model wrapped in ```json / ```javascript / a bare fence
//      leaked through as visible text;
//   2. an unparseable mathviz-looking payload was left on screen verbatim.
//
// Rules, in order:
//   * a canonical ```mathviz fence → parse, hand over the payload and strip
//     the block from the visible text;
//   * a truncated/unclosed ```mathviz → same result via the tolerant pass;
//   * ANY other fence whose payload IS a mathviz object (a `widget` key, with
//     `type` absent or `mathviz.v1`) → recovered, type defaulted;
//   * a fence that LOOKS like a mathviz payload but will not parse → hidden
//     (never leaked as raw JSON); unrelated code blocks are left untouched.
//
// Pure module: no React, no DOM — importable from plain node, so
// scripts/check-mathviz-extract.mjs can pin every branch (CI).

const CANONICAL_RE = /```mathviz\s*\n?([\s\S]*?)```/;
const ANY_FENCE_RE = /```[ \t]*([A-Za-z0-9_+-]*)[ \t]*\r?\n([\s\S]*?)```/g;

function stripBlock(content, start, end) {
  return (content.substring(0, start) + content.substring(end)).trim();
}

function isMathvizObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (!value.widget) return false;
  const type = value.type;
  return type === undefined || type === null || type === "" || type === "mathviz.v1";
}

export function extractMathvizBlock(content) {
  if (!content) return { text: "", vizData: null };

  const match = content.match(CANONICAL_RE);
  if (match) {
    const text = stripBlock(content, match.index, match.index + match[0].length);
    try {
      const vizData = JSON.parse(match[1].trim());
      if (vizData && vizData.type === "mathviz.v1") {
        return { text, vizData };
      }
    } catch (err) {
      console.warn("[MathViz] Failed to parse mathviz JSON:", err);
    }
  }

  // Robust fallback: if ```mathviz exists but the closing ``` was truncated
  // or omitted entirely.
  const startIdx = content.indexOf("```mathviz");
  if (startIdx !== -1) {
    const text = content.substring(0, startIdx).trim();
    let rawJson = content.substring(startIdx + "```mathviz".length).trim();
    rawJson = rawJson.replace(/```+$/, "").trim();
    try {
      const vizData = JSON.parse(rawJson);
      if (vizData && vizData.type === "mathviz.v1") {
        return { text, vizData };
      }
    } catch {
      // Incomplete/cut-off JSON: return clean text without leaking raw code.
      return { text, vizData: null };
    }
    return { text, vizData: null };
  }

  // P15-fix: any OTHER fence carrying a mathviz object — recover by VALUE, so
  // the JSON renders as a figure instead of leaking into the message.
  ANY_FENCE_RE.lastIndex = 0;
  let fence;
  while ((fence = ANY_FENCE_RE.exec(content)) !== null) {
    const lang = (fence[1] || "").toLowerCase();
    const payload = (fence[2] || "").trim();
    const text = stripBlock(content, fence.index, fence.index + fence[0].length);
    if (lang === "mathviz") {
      // A canonical lane the first pass could not parse (invalid JSON): hide
      // it rather than leaking the payload.
      if (payload.includes("mathviz.v1")) return { text, vizData: null };
      continue;
    }
    if (!payload.includes("mathviz") && !payload.includes('"widget"')) continue;
    try {
      const vizData = JSON.parse(payload);
      if (isMathvizObject(vizData)) {
        return { text, vizData: { type: "mathviz.v1", ...vizData } };
      }
    } catch {
      if (payload.includes("mathviz.v1")) return { text, vizData: null };
    }
  }

  return { text: content, vizData: null };
}
