import { ANSWER_KEY } from "./answerKey";
import { QUESTION_SKILLS, SKILL_DEFS } from "./questionSkills";

/**
 * Pure scoring + mastery engine.
 * It does NOT touch localStorage – callers must pass in all answers.
 *
 * @param {{ [section: string]: Record<string, unknown> }} answersBySection
 */
export function computeScoreAndMastery(answersBySection = {}) {
  let total = 0;
  let correct = 0;
  let skipped = 0;

  /** @type {Array<{
   *  section: string;
   *  key: string;
   *  correctAnswer: string;
   *  userAnswer: string | null;
   *  isCorrect: boolean;
   *  isSkipped: boolean;
   *  skills: string[];
   * }>} */
  const questions = [];

  /** @type {Record<string, {
   *   id: string;
   *   name: string;
   *   topic: string | null;
   *   description: string;
   *   total: number;
   *   correct: number;
   *   wrong: number;
   *   skipped: number;
   * }>} */
  const skillAgg = {};

 const examId = localStorage.getItem("currentTest") || "reading-test-1";
const examKey = ANSWER_KEY[examId] || {};

 Object.keys(examKey).forEach((section) => {
    const keySet = examKey[section] || {};
    const answersForSection = answersBySection[section] || {};

    Object.keys(keySet).forEach((qKey) => {
      total++;

      const correctAnswer = String(keySet[qKey] ?? "").trim();
      const rawUser = answersForSection[qKey];
      const userAnswer =
        rawUser === undefined || rawUser === null ? null : String(rawUser);

      const normalizedUser = (userAnswer || "").trim().toLowerCase();
      const normalizedCorrect = correctAnswer.trim().toLowerCase();

      const isSkipped = !normalizedUser;
      const isCorrect = !isSkipped && normalizedUser === normalizedCorrect;

      if (isSkipped) skipped++;
      else if (isCorrect) correct++;

      const skillsForQuestion =
        (QUESTION_SKILLS[section] &&
          QUESTION_SKILLS[section][qKey]) ||
        [];

      questions.push({
        section,
        key: qKey,
        correctAnswer,
        userAnswer,
        isCorrect,
        isSkipped,
        skills: skillsForQuestion,
      });

      skillsForQuestion.forEach((skillId) => {
        if (!skillAgg[skillId]) {
          const meta = SKILL_DEFS[skillId] || {};
          skillAgg[skillId] = {
            id: skillId,
            name: meta.name || skillId,
            topic: meta.topic || null,
            description: meta.description || "",
            total: 0,
            correct: 0,
            wrong: 0,
            skipped: 0,
          };
        }

        const s = skillAgg[skillId];
        s.total += 1;
        if (isSkipped) s.skipped += 1;
        else if (isCorrect) s.correct += 1;
        else s.wrong += 1;
      });
    });
  });

  const wrong = total - correct - skipped;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  const skills = Object.values(skillAgg).map((s) => {
    const acc = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    let level = "weak";
    if (acc >= 80) level = "strong";
    else if (acc >= 50) level = "medium";

    return {
      ...s,
      accuracy: acc,
      level,
    };
  });

  const weakSkills = skills
    .filter((s) => s.level === "weak")
    .sort((a, b) => a.accuracy - b.accuracy);

  const result = {
    correct,
    wrong,
    skipped,
    total,
    score: total ? Math.round((correct / total) * 9) : 0,
    accuracy,
    questions,
    skills,
    weakSkills,
  };

  return result;
}

