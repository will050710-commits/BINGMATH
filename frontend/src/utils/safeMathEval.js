// frontend/src/utils/safeMathEval.js
//
// Phase 0 security hardening (audit finding P1-7).
//
// The canvas renderer used to build functions from AI/LLM supplied strings:
//
//     const sanitized = expr.replace(/Math\./g, "")...;   // naive, bypassable
//     const fn = new Function("x", `return ${sanitized};`); // arbitrary JS
//
// A prompt-injected canvas instruction could therefore execute arbitrary
// JavaScript in the learner's browser. mathjs parses a *restricted expression
// grammar* and never calls eval/new Function, so this module replaces it.
"use client";

import { create, all } from "mathjs";

const math = create(all, {});

// Block the sandbox-escape entry points (mathjs security guide).
math.import(
  {
    import: () => {
      throw new Error("math.import is disabled");
    },
    createUnit: () => {
      throw new Error("math.createUnit is disabled");
    },
  },
  { override: true }
);

const MAX_EXPR_LEN = 200;
const BLOCKED_NODES = new Set([
  "AssignmentNode",
  "FunctionAssignmentNode",
  "BlockNode",
  "ObjectNode",
]);

/**
 * Compile a math expression string into a safe `(x) => number` function.
 * Throws on unsupported/unsafe input; callers should fall back to 0.
 */
export function compileSafeExpr(expr) {
  if (typeof expr !== "string") {
    throw new Error("Expression must be a string");
  }
  const source = expr.trim();
  if (!source || source.length > MAX_EXPR_LEN) {
    throw new Error("Expression is empty or too long");
  }

  const node = math.parse(source);

  let blocked = null;
  node.traverse((child) => {
    if (BLOCKED_NODES.has(child.type)) blocked = child.type;
  });
  if (blocked) {
    throw new Error(`Unsupported expression construct: ${blocked}`);
  }

  const compiled = node.compile();
  return (x) => {
    const value = compiled.evaluate({ x, pi: Math.PI, e: Math.E });
    const num = typeof value === "number" ? value : Number(value);
    return Number.isFinite(num) ? num : 0;
  };
}

/**
 * Memoised variant for render loops (the canvas evaluates ~100 points/frame).
 */
export function makeSafeEvaluator(maxCache = 200) {
  const cache = new Map();
  return (expr, x) => {
    try {
      let fn = cache.get(expr);
      if (!fn) {
        if (cache.size >= maxCache) cache.clear();
        fn = compileSafeExpr(expr);
        cache.set(expr, fn);
      }
      return fn(x);
    } catch {
      return 0;
    }
  };
}
