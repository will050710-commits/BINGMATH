// duoServer.js — DuoMCB API client
// Place this file next to DuoMCBPage.js

const API = process.env.NEXT_PUBLIC_API_URL || "https://duomath.onrender.com";

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

export async function chat(sessionId, message, options = {}) {
  const { image = null, stream = false, mode = "hint" } = options;
  const body = {
    session_id: sessionId,
    message,
    stream,
    mode,
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

export async function resetSession(sessionId) {
  try {
    await fetch(`${API}/api/session/${sessionId}/reset`, { method: "POST" });
  } catch (err) {
    console.error("[duoServer] resetSession failed:", err);
  }
}

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

// Alias — DuoTranslate.js imports this name
export const translateText = translate;

export async function generateVideo(instructions) {
  try {
    const res = await fetch(`${API}/api/video/generate`, {
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
    const res = await fetch(`${API}/api/typesafe/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[duoServer] getTypeSafeStatus failed:", err);
    return null;
  }
}

export async function rotateTypeSafeKey(reason = "User requested rotation") {
  try {
    const res = await fetch(`${API}/api/typesafe/rotate`, {
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

