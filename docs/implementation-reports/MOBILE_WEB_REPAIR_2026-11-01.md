# Mobile web repair — 2026-11-01

Resumed the interrupted implementation shown in the user's screenshots. Preserved its language-context typing, chat options contract, responsive styles, theme provider, and modal improvements, then completed the remaining defects and regression coverage.

This pass covers the eight defects in [the original review](../ANTIGRAVITY_MOBILE_WEB_REVIEW_2026-11-01.md) and the Quick Math work already present in the interrupted changes. It does not claim full APK feature parity.

**Completed behavior**

| Original finding | Result |
| --- | --- |
| TypeScript failures | Fixed the remaining session-promise initialization error. Strict TypeScript and production compilation succeed. |
| Duplicate tutor blocks Settings | The layout mounts the appropriate tutor for its viewport. Hidden variants no longer create sessions; dialogs unmount when changing layouts. |
| Solution sends Hint | The typed chat options pass the selected mode. Browser tests assert both request bodies. |
| Mobile controls on desktop | Verified at 768px and 1440px, including resizing with Settings open. |
| Disconnected theme controls | The mounted theme provider controls document tokens and shell palettes. System mode now resolves consistently in navigation and Settings; persisted preferences are not overwritten during initial hydration. |
| Reset leaks previous conversation | Both floating tutors invalidate pending requests and synchronously clear their session reference. Reset waits for a fresh session; stale session-creation results cannot replace it. |
| Landscape dialogs clip controls | Settings and guide use constrained, scrollable cards. The tutor sheet follows visual viewport height and offset when the keyboard pans the page. |
| Keyboard activation fails | Enter/Space, focus containment/restoration, Escape, pointer cancellation, and drag-versus-click behavior are covered. |

Quick Math now receives its learner scope from the actual authentication context instead of cached profile guesses. The shell resets when the account changes. Account progress is no longer copied into unscoped keys that a guest could inherit; old unscoped values remain untouched. Daily counts use local calendar rollover while lifetime bonus XP remains intact. Answered questions disable further submissions, and statistics refresh while Settings remains open.

Settings keeps focus when changing themes or language. Preference storage failures are handled by the provider rather than uncaught duplicate storage writes in buttons. The guide has English copy as well as Vietnamese, persists dismissal, and restarts at its first step on manual replay.

**Validation**

- Production `next build`: passed, including TypeScript and generation of 277 static pages.
- Focused ESLint, including the new test files, with `--max-warnings 0`: passed.
- Server-route JavaScript check (`tsc -p tsconfig.checkjs.json`): passed.
- Existing chat-error checks: 30/30 passed.
- Dedicated mobile suite: 15 checks passed against the production build, using local API mocks.
- Full configured suite: all 29 tests passed against the production build (lesson, mobile, progress, and tutor workspace checks). Result saved in [test report](../../work/mobile-resume/evidence/report.json).
- Reviewed the phone, landscape Settings, and desktop screenshots produced by the browser suite.

Screenshots: [phone](../../work/mobile-resume/evidence/phone-shell.png), [landscape Settings](../../work/mobile-resume/evidence/landscape-settings.png), [desktop](../../work/mobile-resume/evidence/desktop-shell.png).

The mobile checks cover 320 × 568, 390 × 844, 667 × 375, 768 × 1024, and 1440 × 900; no eager sessions; actual pointer access to Settings; delayed chat and session creation; reset and mode changes; keyboard/drag interactions; a simulated reduced visual viewport; theme/language persistence; guest progress; and lesson/full-tutor overlay exclusions.

The first local production browser attempt encountered the existing hostname-based development API selection: localhost selected `http://localhost:8000`, which the production CSP correctly blocked. The final production build explicitly uses the deployed API base. The tests intercept that address locally; no live tutor requests are sent, and CSP was not weakened. CI now builds with that API base and runs the mobile suite against `next start`, with diagnostic artifacts on failure.

To reproduce from `frontend/` in PowerShell:

```powershell
$env:NEXT_PUBLIC_API_URL = 'https://duomath.onrender.com'
pnpm build
$env:PLAYWRIGHT_USE_PRODUCTION = '1'
pnpm test:mobile
# Run all configured lesson, mobile, and tutor browser checks:
pnpm test:tutor
```

**Separate feature parity work**

- The intro video player and automatic first-run intro-to-tour flow are still not implemented. The requested-guide trigger and manual replay work.
- Quick Math is integrated in Settings; a full Home daily-quest system and server-side XP synchronization are not implemented.
- APK-specific guest onboarding, avatar selection, and grade/age profile flows remain separate from the existing web authentication/profile features.
- Downloadable offline lessons/tests remain unimplemented. The existing service worker provides an offline fallback page; this pass does not change its private-API caching policy.

Native APK compilation, real Android/iOS keyboard behavior, and live authenticated backend calls were not tested. Browser keyboard viewport behavior is simulated. Existing unrelated workspace changes were preserved; the starting versions of edited files are retained locally under `work/mobile-resume/before/`.
