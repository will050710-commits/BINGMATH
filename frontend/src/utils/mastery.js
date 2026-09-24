// frontend/src/utils/mastery.js
//
// Phase 2: builds the results object the /ketqua page renders from the *server*
// grading response. The answer key no longer exists in the client bundle — only
// the (non-secret) skill taxonomy is kept here.
import { QUESTION_SKILLS, SKILL_DEFS } from "./questionSkills";

export const SECTIONS = ["section1", "section2", "section3"];

/**
 * @param {{testId: string, timeSpent: number, answersBySection: object}} submission
 * @param {Array<{section: string, score: number, total: number, accuracy: number,
 *                questions?: Array}>} gradedSections response of /api/tests/grade
 */
export function buildResultFromGrading(submission, gradedSections) {
  const testId = submission?.testId || "reading-test-1";
  const questions = [];
  const skillAgg = {};
  let correct = 0;
  let skipped = 0;
  let total = 0;

  for (const graded of gradedSections || []) {
    const section = graded?.section;
    const sectionAnswers = submission?.answersBySection?.[section] || {};
    total += graded?.total || 0;
    correct += graded?.score || 0;

    // Per-question detail exists only for signed-in students.
    const detail = Array.isArray(graded?.questions) ? graded.questions : null;
    const rows = detail || Object.keys(sectionAnswers).map((key) => ({
      key,
      userAnswer: sectionAnswers[key],
      isCorrect: null,
      isSkipped: !String(sectionAnswers[key] ?? "").trim(),
    }));

    for (const row of rows) {
      const skillsForQuestion = (QUESTION_SKILLS[section] && QUESTION_SKILLS[section][row.key]) || [];
      const isSkipped = typeof row.isSkipped === "boolean"
        ? row.isSkipped
        : !String(row.userAnswer ?? "").trim();
      if (isSkipped) skipped += 1;

      questions.push({
        section,
        key: row.key,
        userAnswer: row.userAnswer ?? null,
        isCorrect: Boolean(row.isCorrect),
        isSkipped,
        skills: skillsForQuestion,
      });

      if (detail) {
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
          const bucket = skillAgg[skillId];
          bucket.total += 1;
          if (isSkipped) bucket.skipped += 1;
          else if (row.isCorrect) bucket.correct += 1;
          else bucket.wrong += 1;
        });
      }
    }
  }

  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const skills = Object.values(skillAgg).map((skill) => {
    const acc = skill.total ? Math.round((skill.correct / skill.total) * 100) : 0;
    let level = "weak";
    if (acc >= 80) level = "strong";
    else if (acc >= 50) level = "medium";
    return { ...skill, accuracy: acc, level };
  });

  return {
    testId,
    timeSpent: submission?.timeSpent ?? 0,
    correct,
    wrong: Math.max(0, total - correct - skipped),
    skipped,
    total,
    score: total ? Math.round((correct / total) * 9) : 0,
    accuracy,
    questions,
    skills,
    weakSkills: skills.filter((s) => s.level === "weak").sort((a, b) => a.accuracy - b.accuracy),
    gradedByServer: true,
    hasQuestionDetail: questions.some((q) => q.isCorrect !== null) || Object.keys(skillAgg).length > 0,
  };
}
