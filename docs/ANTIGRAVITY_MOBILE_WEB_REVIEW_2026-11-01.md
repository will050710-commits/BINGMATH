# Antigravity mobile web review — 2026-11-01

Follow-up: the interrupted repair has been resumed. See [implementation and validation status](implementation-reports/MOBILE_WEB_REPAIR_2026-11-01.md). The findings below preserve the original review evidence.

The new mobile web integration needs corrections before release. This review found eight actionable defects, including a failing TypeScript check, an obstructed Settings button, and a Solution mode that actually sends Hint mode.

Scope: the web port identified in `D:\apk_to_web_guide.md`: `frontend/src/mobile/`, its integration in `LayoutClient.js`, and the existing language, theme, chat, and offline code those changes depend on. The guide was treated as a description to verify, not as instructions to execute. The repository has mixed uncommitted work, so these findings refer to the inspected working tree rather than a particular Antigravity commit. The separate React Native projects and the APK binary were not independently audited.

Application source was left unchanged. Review artifacts are this report and `work/mobile-review/`.

**Evidence collected**

- `node node_modules/typescript/bin/tsc --noEmit --incremental false` from `frontend/`: failed with exactly two TS2349 errors in `QuickSettingsModal.tsx`, lines 149 and 168.
- `node node_modules/eslint/bin/eslint.js src/mobile` from `frontend/`: failed with one `react-hooks/set-state-in-effect` error in `MobileAppShell.tsx`, line 37.
- Headless Chrome exercised the real layout on `/offline` through a local Next development server, at 390 × 844, 667 × 375, and 1440 × 900. Backend responses were intercepted locally; external browser requests were blocked. These checks verify client behavior, not live AI answers or backend authentication.
- The browser probe completed and recorded the defects below with no uncaught page errors. A completed probe means evidence collection succeeded, not that the application passed acceptance tests.
- Evidence: [probe script](../work/mobile-review/probe.cjs), [recorded results](../work/mobile-review/results.json), [phone screenshot](../work/mobile-review/phone-shell.png), [landscape Settings screenshot](../work/mobile-review/landscape-settings.png), [desktop screenshot](../work/mobile-review/desktop-shell.png).
- A production build, real-device keyboard checks, and production service-worker/offline tests were not run.

**Findings, ordered by priority**

1. **P1 — The new Settings component fails TypeScript.**

   Locations: `frontend/src/mobile/components/QuickSettingsModal.tsx:149` and `:168`; dependency: `frontend/src/context/LanguageContext.js:5` and `:55`.

   Both `setLang(...)` calls produce `TS2349: This expression is not callable. Type 'never' has no call signatures.` The JavaScript context is initialized with `createContext(null)` without a declared value type. Its hook is now consumed by strict TypeScript code. The runtime provider does supply a setter, but the compiler has no usable context contract. This is a release blocker for the normal type-checked build, not a claim that the language buttons necessarily fail at runtime.

   Fix: explicitly type the context value and hook, using TypeScript or JSDoc, including `lang`, `setLang`, `toggleLang`, and `t`. Keep the missing-provider guard. Do not use `any`, suppress the errors, or disable build type checks. Resolve the separately reported mobile-shell lint failure while revising preference hydration.

   Acceptance: the frontend type check and focused mobile lint both exit successfully; language changes still propagate and survive a reload.

2. **P1 — The old tutor remains on phones and blocks Quick Settings.**

   Location: `frontend/src/components/LayoutClient.js:184`; dependency: `frontend/src/components/DuoMCB/DuoMCBSidebar.js:53` and `:129`.

   `GlobalSidebar` is placed inside `hidden md:block`, but its child uses `createPortal(..., document.body)`. The actual tutor DOM is outside that hidden wrapper. At 390 × 844, both tutors were visible and two session-creation requests occurred before opening chat. A real click on Quick Settings timed out because the legacy tutor button intercepted pointer events. Hit testing after scrolling the tab strip also identified the legacy button over Settings.

   Fix: select the appropriate tutor at the component level, or place responsive visibility on the actual portal content. Prefer mounting only the applicable tutor and creating its session on first use. Preserve the existing `/DuoMCB` route exclusion.

   Acceptance: exactly one tutor appears at each supported width; Settings opens with a real pointer click on a narrow phone; inactive tutors do not create sessions.

3. **P1 — Full Solution silently submits Hint mode.**

   Location: `frontend/src/mobile/components/BingSideBarMobile.tsx:78`; contract: `frontend/src/components/DuoMCB/duoServer.js:49`.

   The caller uses `chat(activeSid, text, mode)`, but the third argument must be an options object. The helper destructures `mode` from that object with a default of `"hint"`. Passing the string `"solution"` therefore keeps the default. The browser probe selected “Lời giải chi tiết” and captured a request body containing `"mode": "hint"`.

   Fix: call `chat(activeSid, text, { mode })`. Give the shared helper a precise options type so this mistake becomes a compile-time error. Include the cancellation signal when fixing finding 6.

   Acceptance: intercept outgoing requests and assert Hint sends `hint`, while Full Solution sends `solution`, including after switching modes within one conversation.

4. **P2 — Mobile navigation and tutor appear on desktop.**

   Locations: `frontend/src/mobile/components/LiquidGlassTabBar.tsx:38` and `:45`; `frontend/src/mobile/components/BingSideBarMobile.tsx:156` and `:180`.

   Both elements combine `md:hidden` with inline `display: "flex"`. The inline display wins over the responsive utility. At 1440 × 900, the mobile tab bar and mobile tutor were visible alongside the existing desktop tutor. This is separate from the portal problem: fixing the old tutor's phone visibility will not fix these inline styles.

   Fix: move display behavior into responsive classes such as `flex md:hidden`, or use an outer responsive wrapper without an inline display override. Use the same breakpoint as the layout's tutor selection.

   Acceptance: mobile controls are absent or hidden on desktop; they return at phone widths; repeated resizing never leaves two visible tutors or an orphaned modal.

5. **P2 — Theme selection changes Settings but not the application.**

   Locations: `frontend/src/mobile/components/MobileAppShell.tsx:58` and `:67`; `frontend/src/mobile/components/QuickSettingsModal.tsx:226`; `frontend/src/mobile/components/LiquidGlassTabBar.tsx:25`.

   The selected mode is passed only to Quick Settings. The navigation always builds the Liquid Glass palette and the tutor uses hard-coded dark colors. No theme provider or document theme is updated. In the browser, selecting Light persisted `duomath_mobile_theme=light`, while `<html data-theme>` stayed `ink` and its computed background stayed identical. `ThemeContext.js` already exists but is not mounted by the current layout; merely calling its hook would not solve this.

   Fix: establish one mounted theme provider and a consistent mapping between the existing `paper`/`ink` system and the new Light/Dark/Liquid Glass settings. Apply the resolved theme to page tokens, navigation, tutor, and dialogs. Read and write preferences through that shared owner. Define how persisted `system` mode should work, since the exported type permits it but current hydration ignores it.

   Acceptance: switching each supported mode changes the page and shell coherently, persists through navigation/reload, and agrees with the pre-paint theme script. Opacity changes apply to the intended glass surfaces.

6. **P2 — Reset allows the previous conversation's reply into the new one.**

   Locations: `frontend/src/mobile/components/BingSideBarMobile.tsx:76` through `:102`, and `:269` through `:272`.

   Reset clears messages and starts session creation without cancelling or invalidating the pending chat. Its eventual response unconditionally appends to the current messages array. The probe held a response, clicked Reset, then released it; `STALE_RESPONSE_AFTER_RESET` appeared in the cleared conversation. Old failures and loading-state updates can similarly affect the replacement conversation.

   Fix: own an `AbortController` and conversation/request generation identifier. Cancel and invalidate pending work on reset/unmount, pass `signal` to `chat`, and guard every success/error/finally update against the active generation. Ensure sending waits for the selected session to be ready; session-creation responses also need a generation check.

   Acceptance: delayed successes, failures, and retries from the old conversation never change the replacement conversation. A new prompt after Reset uses the replacement session and has independent loading state.

7. **P2 — Landscape Settings clips essential controls outside the viewport.**

   Location: `frontend/src/mobile/components/QuickSettingsModal.tsx:51` through `:92`. The guide uses the same unconstrained centering pattern at `InterfaceGuideModal.tsx:35` through `:61`.

   The fixed overlay centers a tall card without a viewport-based maximum height or internal scrolling. At 667 × 375, the Settings card extended from y = -58.5 to y = 433.5 and the close button started at y = -31.75. The header/close control and lower content were clipped. The screenshot and measurements confirm this for Settings; the guide's equivalent layout needs its own acceptance check.

   Fix: constrain the dialog to the available dynamic viewport height, provide a scrollable content region, and keep close/navigation controls reachable. Include safe-area padding and avoid background page scrolling while a dialog is open. Check the tutor's `82vh` sheet with the real software keyboard as part of this work.

   Acceptance: every Settings and guide control remains reachable in portrait, landscape, and at enlarged text sizes. The tutor composer remains usable with the software keyboard open.

8. **P2 — The new tutor button cannot be activated by keyboard.**

   Location: `frontend/src/mobile/components/BingSideBarMobile.tsx:154` through `:160`.

   Activation exists only in pointer-up handling. The native button has no click handler. Focusing it and pressing Enter twice did not untuck/open the tutor. Keyboard and assistive activation generate click events, so a focusable button alone is insufficient.

   Fix: handle activation in `onClick`, suppressing only the click that follows a real drag. Keep drag state separate, handle pointer cancellation, and expose expanded state. Add dialog focus entry/trapping/restoration, Escape handling, and accessible names for icon-only actions.

   Acceptance: pointer taps and Enter/Space both support the two-stage interaction; dragging does not open chat; keyboard focus stays in an open modal and returns to its trigger when closed.

**Feature parity gaps to track separately**

The guide describes nine APK improvements. Ported constants and exported helpers do not demonstrate that each feature is available to web users:

- `generateQuickMathQuestion` and `recordQuickMathSolve` have no frontend consumers outside the new mobile module. Before connecting the daily quest UI, fix the existing helper's date handling: `quickMath.ts:85` through `:115` stores a lifetime `solvedToday` counter with no date or rollover. Also define account/guest isolation for local progress.
- The first-run guide reads `TRIGGER_V1_GUIDE` in `MobileAppShell.tsx:45`, but the frontend has no writer that sets the trigger. `intro.mp4` was copied to public assets, but no frontend player/first-run flow references it. Manual tour launch exists; automatic post-intro onboarding does not.
- The new guest-mode key, avatar presets, and grade/age helper are not connected to the existing web authentication/profile flows. Classify these as extracted resources until the corresponding user flows are implemented and tested.
- The APK's offline lesson/test engine was not ported into `frontend/src/mobile`. Existing `public/sw.js` explicitly avoids caching lesson HTML and RSC navigation responses, with `/offline` as its navigation fallback. It does not establish full offline curriculum parity. Keep private API calls network-only when implementing a deliberate offline curriculum package.

Update the guide with explicit statuses: extracted, implemented, integrated, and verified. If full APK parity is intended, give the missing flows their own implementation tasks and acceptance checks rather than marking the entire port complete.

**Suggested implementation order for Antigravity**

1. **Restore the checks.** Type the language context and shared chat options; correct the mode call; resolve the mobile-shell hydration lint error with an SSR-safe preference implementation. Run the TypeScript check and focused lint, then the normal production build.
2. **Correct responsive ownership.** Fix the portal integration and inline-display overrides together. Mount one tutor per viewport, create sessions on demand, and verify Settings using actual pointer clicks at phone widths.
3. **Make conversation lifecycle reliable.** Implement cancellation and generation guards around session creation, sending, reset, and unmount. Preserve meaningful authentication/rate-limit/server error messages from the shared helper instead of collapsing every failure into a connection error.
4. **Connect themes.** Mount and use the shared provider, map old/new theme values, and apply tokens throughout the page and mobile surfaces. Recheck reload and pre-paint behavior.
5. **Fix dialogs and input.** Add viewport constraints, scrolling, safe-area handling, keyboard activation, focus management, and Escape support. Verify the drag-to-click distinction and orientation changes.
6. **Close the agreed parity gaps.** Integrate the first-run flow, Quick Math/daily progress, profile/guest behavior, and offline curriculum only with explicit end-to-end checks. Correct the guide's completion claims to match delivered behavior.
7. **Add a dedicated mobile regression suite.** Convert the useful cases in `work/mobile-review/probe.cjs` into assertions in `frontend/tests/mobile-shell.spec.ts`. Update `playwright.config.ts:6`: its current `testMatch` only selects tutor-workspace and CLIL tests, so a new filename alone will not run. Add the suite to CI alongside the existing build check.

**Acceptance matrix for the fix**

| Area | Required checks |
| --- | --- |
| Viewports | 320 × 568, 390 × 844, 667 × 375, 768 × 1024, and 1440 × 900; rotate/resize with a dialog open |
| Routes | `/Trangchu`, `/Cacbaitoan`, `/tailieu`, a lesson such as `/L6-C1-L1`, and `/DuoMCB`; preserve route-specific exclusions |
| Tutor | Correct request mode, one active tutor, slow session creation, Reset during an outstanding request, route unmount, and an error response |
| Settings | Real pointer reachability, VI/EN propagation, global theme changes, persistence, landscape scrolling, keyboard focus, and Escape |
| First run/progress | Fresh storage, completed intro/tour, repeat visits, day rollover, and account/guest separation for any newly integrated progress |
| Offline | Production service worker, explicitly downloaded curriculum, reload without network, and no replay of private API responses |
| Devices | Chrome automation plus a real Android Chrome and iOS Safari pass for keyboard, touch dragging, safe areas, and viewport resizing |

To reproduce the current browser evidence, start the frontend development server on `127.0.0.1:3000`, then run `node work/mobile-review/probe.cjs` from the repository root. The probe uses local API mocks. It deliberately activates Settings programmatically only after recording that a real pointer click is blocked, allowing the independent theme and landscape checks to proceed.
