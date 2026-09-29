#!/usr/bin/env node
// frontend/scripts/check-chat-errors.mjs
//
// Đợt 4H-2 guard. The production failure of 2026-09-28 was reported as a CORS
// error while the request had actually been killed before it answered. Two
// things must stay true so that never happens silently again:
//
//   1. the mapping from a failure to Vietnamese advice (src/lib/chatErrors.js)
//      covers every case the browser can produce — including "no status at all";
//   2. the client's timeout stays ABOVE the server's own budget, so the server's
//      specific 504 explanation wins the race instead of the client giving up
//      first and inventing "check your connection".
//
// Usage: node scripts/check-chat-errors.mjs      (exit 0 = clean, 1 = broken)

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FRONTEND_DIR = fileURLToPath(new URL("..", import.meta.url));
const REPO_DIR = join(FRONTEND_DIR, "..");

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

const errors = await import(pathToFileURL(join(FRONTEND_DIR, "src/lib/chatErrors.js")).href);

// ── 1. status → kind ────────────────────────────────────────────────────────
console.log("\n[classification]");
check("413 is 'too_large' (the payload cap in security_limits.py)",
  errors.classifyChatFailure(413) === "too_large");
check("429 is 'rate_limited'", errors.classifyChatFailure(429) === "rate_limited");
check("504 (our own deadline middleware) is 'timeout'", errors.classifyChatFailure(504) === "timeout");
check("408 is 'timeout' too", errors.classifyChatFailure(408) === "timeout");
check("5xx is 'server'",
  [500, 502, 503, 505].every((code) => errors.classifyChatFailure(code) === "server"));
check("4xx is 'request'",
  [400, 401, 403, 404, 422].every((code) => errors.classifyChatFailure(code) === "request"));
check("no response at all is 'network'", errors.classifyChatFailure(0) === "network");
check("an undefined/absent status is treated as no response, not a crash",
  errors.classifyChatFailure(undefined) === "network"
  && errors.classifyChatFailure(null) === "network"
  && errors.classifyChatFailure("not-a-status") === "network");
check("an unexpected NON-error status is 'unknown'", errors.classifyChatFailure(200) === "unknown");

// ── 2. retry policy ─────────────────────────────────────────────────────────
console.log("\n[retry]");
check("exactly timeout/network/server are retryable",
  errors.RETRYABLE_KINDS.slice().sort().join(",") === "network,server,timeout",
  errors.RETRYABLE_KINDS.join(","));
check("isRetryableKind agrees with that list",
  errors.isRetryableKind("timeout") && errors.isRetryableKind("network")
  && errors.isRetryableKind("server") && !errors.isRetryableKind("too_large")
  && !errors.isRetryableKind("rate_limited") && !errors.isRetryableKind("request"));

// ── 3. the words the student reads ──────────────────────────────────────────
console.log("\n[copy]");
const kinds = ["too_large", "rate_limited", "timeout", "server", "request", "network"];
const unknownCopy = errors.chatFailureMessage("unknown");
check("each kind has its own (non-generic) Vietnamese message",
  kinds.every((kind) => {
    const message = errors.chatFailureMessage(kind);
    return typeof message === "string" && message.length > 25 && message !== unknownCopy;
  }));
check("the timeout copy says it is NOT a connection problem (the exact confusion of the incident)",
  /không phải lỗi kết nối/.test(errors.chatFailureMessage("timeout")));
check("the too-large copy tells the student what to do",
  /chụp|cắt|gõ lại/.test(errors.chatFailureMessage("too_large")));
check("an unknown kind falls back instead of returning undefined",
  errors.chatFailureMessage("nope") === unknownCopy);

// ── 4. cross-boundary invariant: client waits longer than the server ────────
console.log("\n[invariants]");
const budgetSource = readFileSync(join(REPO_DIR, "backend", "chat_budget.py"), "utf8");
const serverBudget = Number((budgetSource.match(/CHAT_REQUEST_TIMEOUT_S\s*=\s*env_budget\(\s*"[^"]+"\s*,\s*([\d.]+)/) || [])[1]);
check("the server budget is readable from chat_budget.py", Number.isFinite(serverBudget), String(serverBudget));
check("the client waits ABOVE the server budget, so the server's 504 is what the user sees",
  errors.CHAT_TIMEOUT_MS / 1000 > serverBudget,
  `client=${errors.CHAT_TIMEOUT_MS / 1000}s server=${serverBudget}s`);

const server = readFileSync(join(FRONTEND_DIR, "src/components/DuoMCB/duoServer.js"), "utf8");
check("duoServer classifies the status instead of printing a bare number",
  /classifyChatFailure\(res\.status\)/.test(server));
check("duoServer applies the one-retry policy", /isRetryableKind\(/.test(server));
check("duoServer does NOT retry an image request (the server already spent its budget)",
  /const hasImage = Boolean\(image\)/.test(server) && /if \(hasImage\)/.test(server));
check("the retry stays available for text requests",
  /await delay\(700\)/.test(server) && /result = await attempt\(\)/.test(server));
check("duoServer aborts its own request instead of hanging forever",
  /signal:\s*controller\.signal/.test(server) && /clearTimeout\(timer\)/.test(server));
check("duoServer keeps the non-streaming default (SSE drops the verification badges)",
  /stream = false/.test(server));
// Scoped to chat(): generateVideo() legitimately still uses its own short copy.
const chatFnSource = server.slice(server.indexOf("export async function chat("),
                                  server.indexOf("export async function resetSession"));
check("the old 'Server error <code>' / 'Network error' copy is gone from chat()",
  !/Server error \$\{res\.status\}/.test(chatFnSource)
  && !/Network error — check your connection/.test(chatFnSource));

const page = readFileSync(join(FRONTEND_DIR, "src/components/DuoMCB/DuoMCBPage.js"), "utf8");
check("the UI shows the classified message", /content:\s*data\.reply \|\|/.test(page));
check("no chat call site switches this UI onto the SSE path",
  !/stream:\s*true/.test(page));
check("the old one-size-fits-all failure line is gone",
  !page.includes("Không thể kết nối hoặc xử lý ảnh"));

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
  console.log("FAILED: " + failures.join(", "));
  process.exit(1);
}
console.log("ALL_CHAT_ERROR_CHECKS_PASSED");
