// duoServer.js — DuoMCB API client
// Place this file next to DuoMCBPage.js

const API = process.env.NEXT_PUBLIC_API_URL || "https://duomath-api.onrender.com";

/**
 * Create a new chat session.
 * @returns {Promise<string|null>} session_id or null on failure
 */
export async function createSession() {
  try {
    const res = await fetch(`${API}/api/session/new`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.session_id || null;
  } catch (err) {
    console.error("[duoServer] createSession failed:", err);
    return null;
  }
}

/**
 * Send a chat message (with optional image) to the backend.
 *
 * @param {string} sessionId        - UUID from createSession()
 * @param {string} message          - User's text message (required)
 * @param {object} [options]        - Optional extras
 * @param {string} [options.image]  - Full data URL: "data:image/png;base64,..."
 * @param {boolean} [options.stream]- Enable SSE streaming (default false)
 * @returns {Promise<{reply?: string, session_id?: string, error?: boolean}>}
 */
export async function chat(sessionId, message, options = {}) {
  const { image = null, stream = false } = options;

  const body = {
    session_id: sessionId,
    message,
    stream,
    // Only include image key when there is actually an image —
    // avoids sending null and triggering the image pipeline on text-only turns
    ...(image ? { image } : {}),
  };

  try {
    const res = await fetch(`${API}/api/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[duoServer] chat HTTP ${res.status}:`, errText);
      return { error: true, reply: `Server error ${res.status}` };
    }

    return await res.json();
  } catch (err) {
    console.error("[duoServer] chat failed:", err);
    return { error: true, reply: "Network error — check your connection." };
  }
}

/**
 * Reset the history of an existing session.
 * @param {string} sessionId
 */
export async function resetSession(sessionId) {
  try {
    await fetch(`${API}/api/session/${sessionId}/reset`, { method: "POST" });
  } catch (err) {
    console.error("[duoServer] resetSession failed:", err);
  }
}

/**
 * Translate English math text to Vietnamese.
 * @param {string} text - Max 500 characters
 * @returns {Promise<{translation: string, summary: string, words: Array}>}
 */
export async function translate(text) {
  try {
    const res = await fetch(`${API}/api/translate`, {
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
