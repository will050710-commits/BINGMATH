// duoServer.js — DuoMCB API client
// Place this file next to DuoMCBPage.js

import { authFetch } from "@/lib/authFetch";
import { API_BASE as API } from "@/lib/apiBase";
import {
  CHAT_TIMEOUT_MS,
  classifyChatFailure,
  chatFailureMessage,
  isRetryableKind,
} from "@/lib/chatErrors";

export async function createSession() {
  try {
    const res = await authFetch("/api/session/new", { base: API, method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.session_id || null;
  } catch (err) {
    console.error("[duoServer] createSession failed:", err);
    return null;
  }
}

// ── Đợt 4H-2: why this function looks the way it does ───────────────────────
// Production (2026-09-28): POST /api/chat from the Vercel origin failed with
// ERR_FAILED + "No 'Access-Control-Allow-Origin' header is present", while the
// preflight from that origin answered 200 with the right ACAO header. A request
// the platform proxy kills before the headers arrive is indistinguishable from a
// CORS failure in DevTools, so this client translates instead of guessing:
// a status means the server answered, no status means the connection died (and
// a slow pipeline, not the network, is the likely reason).
//
// The server now answers 504 + JSON from inside its CORS middleware when the
// pipeline outlives its budget, and CHAT_TIMEOUT_MS waits a little longer than
// that budget so the server's specific explanation is what the student sees.
//
// Streaming is deliberately NOT used here. The SSE paths of /api/chat emit only
// {token}/{done} and return BEFORE MathViz validation, the TypeSafe guard, the
// verification pass and the perception badges (backend/main.py, the
// `if use_stream:` branch) — so switching the UI to SSE would drop features
// without fixing the silent window: with an image, the vision chain still runs
// before the first byte.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function chat(sessionId, message, options = {}) {
  const { image = null, stream = false, mode = "hint", signal = null } = options;
  const body = {
    session_id: sessionId,
    message,
    stream,
    mode,
    ...(image ? { image } : {}),
  };

  const attempt = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
    const forwardAbort = () => controller.abort();
    if (signal) signal.addEventListener("abort", forwardAbort, { once: true });
    try {
      const res = await authFetch("/api/chat", {
        base:    API,
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
        signal:  controller.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const kind = classifyChatFailure(res.status);
        console.error(`[duoServer] chat HTTP ${res.status} (${kind}):`, errText.slice(0, 300));
        // The server's own timeout reply is more useful than generic copy.
        let reply = "";
        try {
          const parsed = JSON.parse(errText);
          if (parsed && typeof parsed.reply === "string") reply = parsed.reply;
        } catch { /* not JSON — fall through to the mapped message */ }
        return { error: true, kind, status: res.status, reply: reply || chatFailureMessage(kind) };
      }
      return await res.json();
    } catch (err) {
      const kind = err?.name === "AbortError" ? "timeout" : "network";
      console.error(`[duoServer] chat ${kind}:`, err?.message || err);
      return { error: true, kind, status: 0, reply: chatFailureMessage(kind) };
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", forwardAbort);
    }
  };

  let result = await attempt();
  if (result.error && isRetryableKind(result.kind)) {
    // Đợt 8 / 4I: an IMAGE request does not get the automatic retry.
    //
    // A picture is the slow case by definition, and the server already spent its
    // budget on it: the reader transcribed the page, the plan decided what to
    // skip, and the soft deadline replied with whatever it had. Retrying sends
    // the whole 4 MB picture again and waits another 95 s, so a student who was
    // about to get a partial answer instead waits ~190 s for the same wall — and
    // the second attempt burns the vision quota again. A text request stays
    // cheap to retry, so it keeps the retry.
    const hasImage = Boolean(image);
    if (hasImage) {
      console.warn(`[duoServer] not retrying a ${result.kind} on an image request ` +
        "(the server already spent its budget on it)");
      return result;
    }
    // One quiet retry: these kinds are transient, and the reported case was a
    // request that died without an app-level response at all.
    console.warn(`[duoServer] retrying chat after ${result.kind}…`);
    await delay(700);
    result = await attempt();
  }
  return result;
}

export async function resetSession(sessionId) {
  try {
    await authFetch(`/api/session/${sessionId}/reset`, { base: API, method: "POST" });
  } catch (err) {
    console.error("[duoServer] resetSession failed:", err);
  }
}

export async function translate(text) {
  try {
    const res = await authFetch("/api/translate", {
      base:    API,
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text }),
    });
    return await res.json();
  } catch (err) {
    console.error("[duoServer] translate failed:", err);
    return { error: true };
  }
}

// Alias — DuoTranslate.js imports this name
export const translateText = translate;

export async function generateVideo(instructions) {
  try {
    const res = await authFetch("/api/video/generate", {
      base:    API,
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ instructions }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[duoServer] generateVideo HTTP ${res.status}:`, errText);
      return { error: true, message: `Server error ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    console.error("[duoServer] generateVideo failed:", err);
    return { error: true, message: "Network error" };
  }
}

export async function getTypeSafeStatus() {
  try {
    const res = await authFetch("/api/typesafe/status", { base: API });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[duoServer] getTypeSafeStatus failed:", err);
    return null;
  }
}

export async function rotateTypeSafeKey(reason = "User requested rotation") {
  try {
    const res = await authFetch("/api/typesafe/rotate", {
      base: API,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[duoServer] rotateTypeSafeKey failed:", err);
    return { success: false, error: err.message };
  }
}

