// frontend/src/lib/apiBase.js
//
// Single source of truth for "where is the FastAPI backend?".
//
// Why this file exists (2026-09-27 production incident): the home page called
// `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"` directly.
// NEXT_PUBLIC_* values are inlined at build time and the variable was not set
// on Vercel, so the deployed bundle kept the localhost literal and the
// enforced CSP (`connect-src 'self' https://duomath.onrender.com ...`) blocked
// every request — the UI showed "Failed to fetch leaderboard".
// Never write a bare `"http://localhost:8000"` fallback again:
// scripts/check-api-base.mjs fails CI if one reappears outside this file.
//
// Resolution order:
//   1. NEXT_PUBLIC_API_URL / NEXT_PUBLIC_BACKEND_URL (build-time env, Vercel)
//   2. hostname heuristic — local dev → http://localhost:8000,
//      every deployed host → https://duomath.onrender.com
//
// NOTE: call `resolveApiBase()` from effects / event handlers. Do not render
// its value: on the server it is always the production default, so printing it
// would diverge from a local dev browser and cause a hydration mismatch.

const PROD_API = "https://duomath.onrender.com";
const DEV_API = "http://localhost:8000";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** true for localhost / 127.0.0.1 / ::1 (used by the hostname heuristic) */
export function isLocalHostname(hostname) {
  return typeof hostname === "string" && LOCAL_HOSTNAMES.has(hostname.toLowerCase());
}

/** Resolve the backend base URL (no trailing slash) for the current runtime. */
export function resolveApiBase() {
  const fromEnv = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    ""
  ).trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) {
    return DEV_API;
  }
  return PROD_API;
}

/**
 * Convenience constant for modules that read the base at call time
 * (computed once per JS realm: browser tab or Node process).
 */
export const API_BASE = resolveApiBase();

/** Build an absolute URL for an API path: apiUrl("/api/stats") */
export function apiUrl(path) {
  return path?.startsWith("http") ? path : `${API_BASE}${path}`;
}
