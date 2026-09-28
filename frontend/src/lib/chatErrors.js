// frontend/src/lib/chatErrors.js
//
// Đợt 4H-2 — turn a chat failure into something a student can act on.
//
// The 2026-09-28 production failure was reported as "CORS / ERR_FAILED" while
// the request had actually been killed by the platform proxy before it produced
// any response: the browser cannot tell those apart, so the client has to. The
// rule this module encodes:
//
//   * a *status* means the server answered → read it and say what it means
//     (413 too big, 429 too fast, 504 our own pipeline budget ran out, 5xx the
//     server is busy);
//   * no status means the connection died → it is either the network or a
//     request that outlived the proxy, and both deserve the same honest advice
//     instead of "check your connection" for a 4 MB photo of a page.
//
// No imports and no DOM on purpose: scripts/check-chat-errors.mjs imports this
// file directly under plain node.

/**
 * How long the client waits before it gives up on POST /api/chat.
 *
 * Deliberately ABOVE the server's own budget (chat_budget.CHAT_REQUEST_TIMEOUT_S,
 * 75 s by default) so the server's 504 + JSON reply — which carries a specific
 * Vietnamese explanation — wins the race and is what the student sees.
 */
export const CHAT_TIMEOUT_MS = 95_000;

/** Kinds worth one silent retry: all three are transient by nature. */
export const RETRYABLE_KINDS = ["timeout", "network", "server"];

const MESSAGES = {
  too_large:
    "📷 Ảnh hoặc đề gửi lên vẫn quá lớn nên máy chủ không nhận được. " +
    "Em thử chụp gần hơn, cắt bớt phần thừa, hoặc gõ lại đề bằng chữ nhé.",
  rate_limited:
    "⏳ Em gửi hơi nhanh nên hệ thống tạm nghỉ một chút. Chờ vài giây rồi thử lại giúp mình nhé.",
  timeout:
    "⏳ Bài này cần nhiều thời gian hơn mức hệ thống cho phép nên mình chưa trả lời xong. " +
    "Em thử lại với ảnh rõ hơn (chỉ 1 bài mỗi ảnh), hoặc gõ lại đề ngắn gọn nhé. " +
    "Đây là lỗi thời gian xử lý, không phải lỗi kết nối của em.",
  server:
    "⚠️ Máy chủ đang bận xử lý. Em thử lại sau vài giây nhé.",
  request:
    "⚠️ Yêu cầu chưa hợp lệ hoặc phiên đăng nhập đã hết hạn. Em tải lại trang rồi thử lại nhé.",
  network:
    "🔌 Không kết nối được tới máy chủ DuoMath. Em kiểm tra mạng rồi thử lại nhé.",
  unknown:
    "⚠️ Không xử lý được yêu cầu này. Em thử lại nhé.",
};

/** Map an HTTP status (or 0 = no response) onto one of the kinds above. */
export function classifyChatFailure(status) {
  const code = Number(status) || 0;
  if (code === 413) return "too_large";
  if (code === 429) return "rate_limited";
  if (code === 408 || code === 504) return "timeout";
  if (code >= 500) return "server";
  if (code >= 400) return "request";
  if (code === 0) return "network";
  return "unknown";
}

/** The Vietnamese message for a kind (falls back to the generic one). */
export function chatFailureMessage(kind) {
  return MESSAGES[kind] || MESSAGES.unknown;
}

/** True when one automatic retry is worth it. */
export function isRetryableKind(kind) {
  return RETRYABLE_KINDS.indexOf(kind) > -1;
}
