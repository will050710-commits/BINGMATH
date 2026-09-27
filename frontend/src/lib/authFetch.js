// frontend/src/lib/authFetch.js
//
// Phase 0 security hardening: the AI endpoints (chat, video, ai-test,
// geometry, typesafe, mathmap) now require a logged-in user, so every caller
// must attach the Firebase ID token. This helper mirrors the behaviour of
// authContext.apiFetch but can be used from non-React modules too.
"use client";

import { auth } from "@/lib/firebase";
import { resolveApiBase } from "@/lib/apiBase";

// Kept as an exported constant for backwards compatibility. The actual
// resolution lives in src/lib/apiBase.js (env → hostname → Render default).
export const DEFAULT_API_BASE = resolveApiBase();

/**
 * fetch() wrapper that injects `Authorization: Bearer <Firebase ID token>`.
 *
 * @param {string} path            e.g. "/api/chat" (or a full URL)
 * @param {object} [options]       standard fetch options + optional `base`
 * @param {string} [options.base]  API base override (defaults to DEFAULT_API_BASE)
 */
export async function authFetch(path, options = {}) {
  const { base, ...opts } = options;
  const url = path.startsWith("http") ? path : `${base || DEFAULT_API_BASE}${path}`;

  const headers = { ...(opts.headers || {}) };
  if (opts.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      headers["Authorization"] = `Bearer ${await currentUser.getIdToken()}`;
    } catch (err) {
      console.warn("[authFetch] could not obtain Firebase ID token:", err?.message);
    }
  }

  return fetch(url, { ...opts, headers });
}
