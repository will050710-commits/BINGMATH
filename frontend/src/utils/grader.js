// frontend/src/utils/grader.js
//
// Phase 2: the client no longer grades anything (the answer key used to live in
// answerKey.js inside this bundle). gradeTest() now only *collects* what the
// candidate answered and parks it in localStorage; the /ketqua page submits it
// to POST /api/tests/grade, which owns the key.
import { getTimeSpent } from "./testTimer";
import { authFetch } from "@/lib/authFetch";
import { SECTIONS, buildResultFromGrading } from "./mastery";

export const SUBMISSION_KEY = "readingTest_submission";

/** Collect the answers for the current test (sync — call sites unchanged). */
export function gradeTest() {
  const testId = localStorage.getItem("currentTest") || "reading-test-1";
  const answersBySection = {};

  SECTIONS.forEach((section) => {
    const primaryKey = `${testId}_${section}`;
    const legacyKey = `readingTest_${section}`;
    const savedRaw =
      localStorage.getItem(primaryKey) || localStorage.getItem(legacyKey);
    try {
      answersBySection[section] = savedRaw ? JSON.parse(savedRaw) : {};
    } catch {
      answersBySection[section] = {};
    }
  });

  const timeSpent = getTimeSpent(testId);
  localStorage.setItem("timeSpent", String(timeSpent));
  localStorage.setItem(
    SUBMISSION_KEY,
    JSON.stringify({ testId, timeSpent, answersBySection, collectedAt: Date.now() })
  );

  return { pending: true, testId, timeSpent };
}

/**
 * Ask the backend to grade the parked submission.
 * Per-question flags are requested too; the API only returns them for signed-in
 * students (and never returns the correct answers themselves).
 */
export async function gradeSubmissionViaApi(submission, { includeQuestions = true } = {}) {
  if (!submission?.answersBySection) return null;

  const results = await Promise.all(
    SECTIONS.map(async (section) => {
      const answers = submission.answersBySection[section] || {};
      if (!Object.keys(answers).length) return null;
      try {
        const res = await authFetch("/api/tests/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_key: submission.testId,
            section,
            answers,
            include_questions: includeQuestions,
          }),
        });
        if (!res.ok) {
          console.warn(`[grader] /api/tests/grade ${section} -> HTTP ${res.status}`);
          return null;
        }
        return await res.json();
      } catch (err) {
        console.warn(`[grader] grading ${section} failed:`, err?.message || err);
        return null;
      }
    })
  );

  const graded = results.filter(Boolean);
  if (!graded.length) return null;
  return buildResultFromGrading(submission, graded);
}
