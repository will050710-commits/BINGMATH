// lib/api.js — Centralized API wrappers cho Gamification + Adaptive Learning
// Tất cả hàm dùng Firebase ID token tự động (same pattern as authContext.js)

import { auth } from "@/lib/firebase";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:5000");

async function _fetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };
  const currentUser = auth?.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken(true);
      hdrs["Authorization"] = `Bearer ${token}`;
    } catch (_) {}
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Gamification ────────────────────────────────────────────────────────────
/** Gọi sau khi hoàn thành bài test / minigame để cập nhật streak + XP */
export async function streakCheckin() {
  return _fetch("/api/streak/checkin", { method: "POST" });
}

/** Lấy daily quests hôm nay (tự sinh nếu chưa có) */
export async function getDailyQuests() {
  return _fetch("/api/quests/today");
}

/** Cập nhật tiến độ quest: delta = số đơn vị cộng thêm */
export async function updateQuestProgress(questId, delta = 1) {
  return _fetch(`/api/quests/${questId}/progress`, {
    method: "POST",
    body: JSON.stringify({ delta }),
  });
}

/** Lấy toàn bộ badges (earned + chưa earned) */
export async function getBadges() {
  return _fetch("/api/badges");
}

// ── Adaptive Learning ────────────────────────────────────────────────────────
/**
 * Log một câu trả lời cho Adaptive Learning.
 * @param {string} questionId
 * @param {string} topic       — e.g. "dao_ham", "tich_phan"
 * @param {string} difficulty  — "NB" | "TH" | "VD" | "VDC"
 * @param {boolean} isCorrect
 * @param {number} timeTakenSec
 * @param {number} sessionAccuracy — 0-100, dùng để trao badge perfect_score
 */
export async function logQuizAttempt({
  questionId,
  topic,
  difficulty = "NB",
  isCorrect,
  timeTakenSec = 0,
  sessionAccuracy = 0,
}) {
  return _fetch("/api/quiz/attempt", {
    method: "POST",
    body: JSON.stringify({
      question_id: questionId,
      topic,
      difficulty,
      is_correct: isCorrect,
      time_taken_sec: timeTakenSec,
      session_accuracy: sessionAccuracy,
    }),
  });
}

/** Gợi ý độ khó tiếp theo cho một topic */
export async function getNextDifficulty(topic) {
  return _fetch(`/api/adaptive/next-difficulty?topic=${encodeURIComponent(topic)}`);
}

/** Danh sách chủ đề yếu cần ôn */
export async function getWeakTopics() {
  return _fetch("/api/adaptive/weak-topics");
}

// ── User Statistics ──────────────────────────────────────────────────────────
/** Trang Statistics — tổng hợp toàn bộ số liệu user */
export async function getUserStats() {
  return _fetch("/api/stats");
}
