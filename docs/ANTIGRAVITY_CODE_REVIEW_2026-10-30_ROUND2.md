# Antigravity implementation review — round 2

Reviewed the current working tree after the R1–R8 remediation described in `docs/implementation-reports/C1.md`. Git HEAD remains `f9081d8d6f0190e52cc910baae5b3d4e642e8917`; implementation changes are not committed. This report supplements the first review, rather than repeating findings whose original reproduction has been fixed.

**Result: six confirmed findings remain, including one P1 verification correctness issue. C1/Q1-min should remain open.** Application code was not changed during this review.

The semantic review covers the CLIL pilot, learner state, BingMCB verification, and the API/UI evidence contract. The syntax scan also covers other changed frontend/backend source files. Older mobile/admin/teacher changes were not reviewed end to end. No real student account, live AI provider, production database, production build, or full-site performance benchmark was exercised.

**Confirmed improvements since round 1**

- `/L6-C1-L1` loads successfully. Mode controls and glossary/option term triggers now work in the existing browser tests.
- The previous sanity-only area verification and unchecked-required-claim reproductions are covered by passing regressions.
- `_solver_summary` preserves the expanded evidence envelope.
- The provider now consumes AuthContext, and persisted-mode hydration passes the current regression. The browser test simulates scope changes with localStorage/events; it does not establish correct behavior for an actual Firebase login/logout cycle.
- Mobile vocabulary cards now trap Tab focus and make managed background content inert. Focus restoration still fails as described below.
- Playwright discovers and executes both CLIL pilot tests.

**R2-1 — [P1] Candidate validity is still promoted to complete-answer verification**

Locations: `backend/verification_contract.py:211` and `backend/math_solver.py:483`.

`check_against_presolve` confirms that each supplied candidate belongs to the solution set. It does not establish that all requested roots or variables were supplied. `check_substitution` likewise only checks substitutions it can evaluate. The coverage builder nevertheless marks the single required `answer:main` claim as passed when either check passes.

Direct reproduction, without an AI provider:

```python
await ms.verify_and_repair(
    {
        "transcription": "Solve x^2 - 5*x + 6 = 0. Find all real solutions.",
        "latex": ["x^2-5*x+6=0"],
    },
    "Answer: x = 3",
    chat_fn=None,
    mode="strict",
)
```

Observed: `verified=True`, `status="verified"`, `reason="complete"`, and required `answer:main` coverage is `pass`. SymPy returns roots `[2, 3]`; the answer omits 2. A second reproduction with equations `x=3`, `y=4`, a request for both variables, and reply `Answer: x = 3` produces the same complete verdict while omitting y.

The reported candidate-check scope is valid; the complete required-answer outcome is not. This permits incomplete tutoring responses to receive the same success state as complete answers.

Fix: separate evidence that a candidate is valid from evidence that the requested answer is complete. Model required outputs explicitly where supported, or retain incomplete/partial coverage when completeness cannot be determined. Do not require every root for a prompt explicitly asking for only one root.

Acceptance: add regressions for all-roots requests, multiple requested variables, a genuinely complete solution, and an explicitly requested single candidate. The two incomplete examples must never receive `verified=True`/`reason="complete"`.

**R2-2 — [P2] Failed repair returns original text with evidence for the discarded repair**

Location: `backend/math_solver.py:1087`, especially the `env_after["reply"] = reply` assignment at line 1093.

The repair branch evaluates `repaired_reply`, builds its checks and `responseVersion="v1-r1"`, then substitutes the original reply if the repair fails verification. The checks, coverage, critic result, version, and repaired flag continue to describe the discarded text.

Confirmed with a fake provider returning an initial wrong verdict, `Repaired answer: x = 4`, and a second wrong verdict for the problem `x=3`, with original reply `Answer: x = 5`:

```text
reply:           Answer: x = 5
responseVersion: v1-r1
repaired:        true
presolve detail: claimed=4, expected=[3]
substitution:    claim="x = 4"
```

The API/UI now preserves these evidence fields, so this mismatch can reach the student and downstream consumers. Matching request IDs does not establish that evidence belongs to the returned response version.

Fix: return a consistent response/evidence pair. If retaining the original answer, retain its original envelope/version and record the failed repair separately. If returning the repair, retain its text with its evidence. Keep repair-attempt metadata distinct from which answer was actually returned.

Acceptance: exercise successful repair, failed repair, and inconclusive repair with distinct original/repaired numeric values. Every returned check and version must describe the returned reply.

**R2-3 — [P2] Timeout fallback overwrites deterministic failures and invents partial verification**

Location: `backend/main.py:5704`, particularly lines 5705 and 5720–5724.

The timeout handler defines `_det_ok` as a nonempty check list without failed checks. A list containing only skipped checks satisfies that condition. After calling the central envelope evaluator, the handler unconditionally overwrites its status/reason with partial/incomplete or timeout/budget.

Executed the actual exception-handler AST in isolation, using real deterministic checks and the real envelope evaluator, without invoking the API or a provider:

| Input at critic timeout | Evaluator result with timeout | Route's overwritten result |
| --- | --- | --- |
| Problem `x=3`, reply `x=5`: presolve and substitution fail | `failed` | `timeout`, reason `budget` |
| Plain reply, all five checks skipped | `timeout` | `partial`, with note claiming arithmetic was checked |

The first path hides a known mathematical conflict behind a timing message. The second claims a successful arithmetic check despite no successful check. `verification_note` turns these overwritten states into student-visible text.

Fix: preserve the evaluator's conflict/coverage precedence. A timeout describes an unfinished operation, not the removal of completed evidence. Require an applicable positive mathematical check for partial success, and derive explanatory text from the checks actually completed.

Acceptance: cover timeout after deterministic failure, all-skipped checks, sanity-only checks, and positive answer checks. Ensure status, reason, coverage, and displayed note remain consistent. Add a route-level timeout regression; current envelope-only timeout tests miss the override.

**R2-4 — [P2] Paper theme renders lesson text nearly black on a dark canvas**

Locations: `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js:614` and `frontend/src/components/clil/BilingualBlock.tsx:33` / `:54`.

The lesson engine fixes its background to a dark gradient, regardless of theme. The new bilingual renderer uses theme-dependent `text-ink`, which becomes `rgb(20, 20, 19)` in Paper theme. Consequently, titles, objectives, theory, and question text in Side-by-Side mode are nearly unreadable on the unchanged navy canvas.

Browser reproduction: open `/L6-C1-L1`, select Side-by-Side, apply the supported root `data-theme="paper"`. Computed paragraph text is `rgb(20, 20, 19)` over the engine's `#020c1b` / `#0a1628` / `#0c2340` gradient. Visual evidence: `work/review2/paper-parallel.png`.

Fix: make lesson surfaces and foregrounds use a coherent theme-aware token set, including nested cards. Check theme changes while the lesson is already mounted, as well as initial loads.

Acceptance: inspect all three modes under both themes at mobile and desktop widths. Verify paragraph, heading, option, and term contrast against their actual surfaces. The existing no-horizontal-overflow checks do not cover theme readability.

**R2-5 — [P2] Closing the mobile vocabulary modal loses keyboard focus**

Locations: `frontend/src/context/LearningExperienceContext.tsx:317` and `frontend/src/components/clil/MathTermPopover.tsx:78`.

`closePopover(true)` clears open state and immediately calls `.focus()` on the trigger. During that call, the trigger's managed ancestor is still inert; the popover effect removes inert only during subsequent cleanup. The browser ignores the focus attempt, and unmounting the focused modal leaves focus on BODY.

Confirmed in headless Chrome at 375×812: open the first term, press Escape, wait for the dialog to disappear. Before close, focus is a modal button and two background roots are inert. After close, inert roots are gone but `document.activeElement.tagName === "BODY"`, rather than the original trigger ID.

Fix: restore focus after background inert cleanup, with a connected/visible fallback when the trigger no longer exists. Coordinate this with exit animation/unmount so delayed cleanup does not undo the restored focus.

Acceptance: assert the original trigger is focused after Escape, the close button, and backdrop dismissal on mobile. Keep the existing Tab/Shift+Tab containment tests. The current browser test only asserts that Escape hides the dialog.

**R2-6 — [P2] Immersion mode leaves Vietnamese glossary definitions visible**

Location: `frontend/src/components/thcs/Cacbaitoan6/L6_C1_L1.js:181`.

The glossary directly renders `term.vi` and `term.definition.vi` unconditionally. Unlike the authored lesson blocks, these cards do not react to learning mode. After selecting English Immersion, `glossary-card-set` still contains “Tập hợp” and the full Vietnamese definition without an explicit term lookup.

This conflicts with the C1 English-only mode rule in `docs/SPEC_CLIL_LEARNING.md:128`. A mode switch changes the surrounding lesson but leaves this content in a fixed bilingual state.

Fix: render glossary definitions through a mode-aware component inside the provider, preserving the curated term catalog. In Immersion, reveal Vietnamese only through the specified explicit assistance interaction.

Acceptance: verify authored glossary text in all three modes, not just the mode button's selected attribute. Immersion must hide Vietnamese until the learner explicitly requests help; switching modes must retain quiz state.

**Validation completed in this round**

| Check | Result |
| --- | --- |
| Parse changed/untracked frontend JS/JSX/TS/TSX/MJS/CJS source with TypeScript | 49 files; no syntax errors |
| Parse changed/untracked backend Python source with `ast.parse` | 17 files; no syntax errors |
| `pnpm exec tsc --noEmit --incremental false` | Passed |
| `node scripts/check-clil-content.mjs` | 15/15 passed |
| `pnpm exec playwright test clil-pilot.spec.ts --reporter=line` | 2/2 passed |
| `python -B tests/test_verification_coverage.py` | 15/15 passed |
| `python -B test_math_solver.py` | 25/25 passed |
| `python -B test_verify_states.py` | 23/23 passed |
| Extra deterministic/fake-provider probes | Reproduced R2-1 and R2-2 |
| Isolated actual timeout-handler execution | Reproduced R2-3; not a full HTTP/provider timeout test |
| Additional anonymous Chrome checks | Reproduced R2-4, R2-5, R2-6; no page exceptions in that probe |

The passing suites do not assert the failing cases above. Prioritize R2-1, then preserve response/evidence consistency and timeout semantics before using verified status for XP/Eureka. Complete the C1 theme, focus, and mode behavior fixes before expanding the pilot. Broader authenticated, performance, and production-build gates remain unverified by this review.
