import apiClient, { BASE_URL } from './client';

/**
 * Create a new chat session.
 */
export async function createSession() {
  const res = await apiClient.post('/api/session/new');
  return res.data.session_id;
}

/**
 * Send a chat message (non-streaming).
 * @param {string} sessionId
 * @param {string} message
 * @param {string|null} imageBase64 - base64 data URL (optional)
 * @param {'hint'|'solution'|'raw_solution'} mode
 */
export async function sendMessage(sessionId, message, imageBase64 = null, mode = 'hint') {
  const body = {
    session_id: sessionId,
    message,
    mode,
    stream: false,
  };
  if (imageBase64) body.image = imageBase64;

  const res = await apiClient.post('/api/chat', body);
  return res.data; // { reply, session_id, history_length }
}

/**
 * Get session history.
 */
export async function getSessionHistory(sessionId) {
  const res = await apiClient.get(`/api/session/${sessionId}/history`);
  return res.data.history;
}

/**
 * Reset session history.
 */
export async function resetSession(sessionId) {
  await apiClient.post(`/api/session/${sessionId}/reset`);
}

/**
 * Translate a math term.
 */
export async function translateTerm(text) {
  const res = await apiClient.post('/api/translate', { text });
  return res.data; // { translation, summary, words }
}
