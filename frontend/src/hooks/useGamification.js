/**
 * useGamification.js
 * Hook tổng hợp để tích hợp Gamification vào bất kỳ trang kết quả nào.
 *
 * Usage (ví dụ trong trang kết quả minigame):
 *   const { showHUD, triggerGamification, closeHUD } = useGamification();
 *
 *   // Sau khi lưu điểm:
 *   await triggerGamification({ questions, timeTakenSec, topic });
 *
 *   // Render HUD:
 *   {showHUD && <GamificationHUD onClose={closeHUD} />}
 */
"use client";

import { useState, useCallback } from "react";
import { logQuizAttempt, updateQuestProgress, getDailyQuests } from "@/lib/api";

export function useGamification() {
  const [showHUD, setShowHUD] = useState(false);

  /**
   * triggerGamification
   * @param {Array}  questions     — mảng câu hỏi với { isCorrect, key, section?, difficulty? }
   * @param {number} timeTakenSec  — tổng thời gian (giây)
   * @param {string} topic         — chủ đề chính (e.g. "dao_ham", "tich_phan")
   * @param {number} sessionAccuracy — 0-100
   */
  const triggerGamification = useCallback(async ({
    questions = [],
    timeTakenSec = 0,
    topic = "general",
    sessionAccuracy = 0,
  }) => {
    const total = questions.length;
    const perQ  = total > 0 && timeTakenSec > 0 ? Math.round(timeTakenSec / total) : 0;

    // 1. Log tất cả quiz attempts (fire-and-forget, không block UI)
    if (total > 0) {
      Promise.allSettled(
        questions.map((q, idx) =>
          logQuizAttempt({
            questionId:      q.key || q.id || `q_${idx}`,
            topic:           q.section || topic,
            difficulty:      q.difficulty || "NB",
            isCorrect:       Boolean(q.isCorrect),
            timeTakenSec:    perQ,
            sessionAccuracy: sessionAccuracy,
          })
        )
      );
    }

    // 2. Tự động cập nhật quest "solve_questions" (+total câu)
    try {
      const questRes = await getDailyQuests();
      if (questRes.ok) {
        const quests = questRes.data.quests || [];
        const solveQuest = quests.find(
          (q) => q.quest_type === "solve_questions" && !q.is_completed
        );
        if (solveQuest && total > 0) {
          await updateQuestProgress(solveQuest.id, total);
        }
        // Tự động cập nhật quest "accuracy_target" nếu đủ điều kiện
        const accQuest = quests.find(
          (q) => q.quest_type === "accuracy_target" && !q.is_completed
        );
        if (accQuest && sessionAccuracy >= accQuest.target_value) {
          await updateQuestProgress(accQuest.id, 1);
        }
      }
    } catch (_) {}

    // 3. Hiển thị HUD (GamificationHUD tự gọi streak check-in nội bộ)
    setShowHUD(true);
  }, []);

  const closeHUD = useCallback(() => setShowHUD(false), []);

  return { showHUD, triggerGamification, closeHUD };
}
