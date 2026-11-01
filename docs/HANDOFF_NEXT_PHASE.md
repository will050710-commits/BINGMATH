# BINGMATH: next TutorWorkspace phase

Planning handoff for Antigravity. Reviewed on **2026-10-30** (Asia/Bangkok). This document is a proposal; it does not implement the features described below.

**Updated planning entry point:** the subsequent whole-web request is specified in [IMPLEMENTATION_MASTER_PLAN.md](IMPLEMENTATION_MASTER_PLAN.md), with detailed [CLIL](SPEC_CLIL_LEARNING.md), [BingMCB quality](SPEC_BINGMCB_QUALITY.md), and [gamification/map](SPEC_GAMIFICATION_MAP.md) specs. Follow that plan's P0 → Q1-min → C1 gates first. This document remains the Phase A baseline and detailed point-linking design; its B1 label is distinct from Part B gamification.

**Original TutorWorkspace recommendation: Phase B1 — explicit named-point linking between the active reply and its JSXGraph canvas.** Add a small bilingual point-reference row beside the reply's existing scene card. Hover/focus previews a point; click/tap pins the highlight. This is the smallest useful slice of candidate A supported by today's payload. General inline word/formula linking needs a reliable text-to-entity mapping first.

## 1. Synchronization and reviewed baseline

### Actual Git state

| Item | Observed value |
| --- | --- |
| Repository root | `C:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam` — the enclosing VS Code workspace is not itself a Git repository |
| Remote | `origin = https://github.com/will050710-commits/BINGMATH.git` |
| Local branch, before and after attempted sync | `main` |
| Local HEAD, before and after attempted sync | `1661cd0499bbed61868519d2a6597392f077c7da` |
| **Primary reviewed ref** | **`origin/main`** (GitHub branch **`main`**) |
| **Full reviewed commit** | **`f9081d8d6f0190e52cc910baae5b3d4e642e8917`** |
| Phase A feature ref | `origin/feat/tutor-workspace-phase-a` |
| Phase A implementation commit | `bacea873322d25dd26f3d7df16cb945506e89d93` |
| PR state | [PR #1](https://github.com/will050710-commits/BINGMATH/pull/1) is merged; its merge commit is the reviewed `origin/main` tip |
| Other local branch | `copilot/worktree-2026-06-12T04-19-53`, tip `313cfdd` |
| Remote branches after fetch | `origin/main`, `origin/feat/tutor-workspace-phase-a`; `origin/HEAD -> origin/main` |

Fetched GitHub refs successfully. Inspected the merge parents: the previous main HEAD and the known Phase A implementation commit. There are no subsequent commits on fetched main, and `git diff origin/feat/tutor-workspace-phase-a origin/main` is empty. **Main is the appropriate development base.** Do not switch to the already merged feature branch just because the original request named it.

`git pull --ff-only origin main` was attempted and aborted safely:

```text
error: Your local changes to the following files would be overwritten by merge:
    frontend/src/components/DuoMCB/DuoMCBPage.js
Aborting
```

**Synchronization is partial: refs are current; the working checkout is not synchronized.** Review therefore used read-only `git show origin/main:<path>` and `git grep ... origin/main`, rather than claiming the dirty working tree was Phase A. The local branch remains behind the fetched merge. No conflict markers or unmerged index entries were created.

Existing local work includes backend/workflow/mobile changes, deleted THPT pages, a modified geometry renderer, and untracked Socratic/progress/feedback components. It was preserved. No stash, reset, clean, forced checkout, commit, push, or merge commit was performed. The fast-forward attempt did not change the tracked diff or pre-existing status listing; both were compared before and after. Git ownership was handled with a command-scoped `safe.directory` for this repository, not a global configuration change.

No applicable `AGENTS.md` was found in the workspace/ancestor search or the fetched repository tree.

### Required file verification

| Required path | In reviewed Git tree | In current working checkout |
| --- | --- | --- |
| `frontend/src/components/tutor/TutorWorkspace.tsx` | Yes | Absent |
| `frontend/src/components/tutor/useTutorWorkspace.ts` | Yes | Absent |
| `frontend/src/components/tutor/MathCanvasHost.tsx` | Yes | Absent |
| `docs/CHANGELOG_PERFORMANCE.md` | Yes | Absent |
| `docs/CHANGELOG_PERFORMANCE.pdf` | Yes; blob size 216,408 bytes | Absent |

The absent working files are a consequence of the aborted update. Their Git objects were fetched. The Markdown report was read; the PDF's presence was verified, not visually re-reviewed. This handoff is the only new project file written by this planning task.

**Implementation prerequisite:** reconcile the owner's local `DuoMCBPage.js` work with Phase A in a separately authorized integration task, or implement from a clean checkout of the reviewed main commit. Do not discard local work or treat this document as authorization to resolve it automatically. Once integrated, inspect the resulting source again before applying the file plan below.

## 2. Findings from the actual implementation

All “implemented” findings in this subsection refer to the reviewed Git commit, unless explicitly labeled local-only.

### Architecture and behavior already present

| Area / source | Implemented behavior and consequence for the next phase |
| --- | --- |
| `frontend/src/components/tutor/TutorWorkspace.tsx` | Fixed transcript, composer and canvas slots; one canvas position in the React tree. Split/collapsed/expanded modes alter layout. Do not add another renderer inside a message. |
| `frontend/src/components/tutor/useTutorWorkspace.ts`, `workspaceGeometry.ts`, `types.ts` | Layout state is separate from scene/composer state. Container widths select desktop at 1024+, tablet at 768–1023, mobile below 768. Default chat ratio is 0.4; bounds protect chat/canvas minimum widths. Divider uses pointer capture, rAF updates and commit-time storage. Keyboard arrows, Home/End, Enter and Escape handling exist. |
| `frontend/src/components/tutor/TutorWorkspace.module.css` | Mobile/tablet put canvas above transcript. Keyboard geometry can reduce preview to a header or hide it at a very short viewport. Composer has safe-area support and can scroll in minimal space. Hidden canvas stays mounted. |
| `frontend/src/components/tutor/useTutorScenes.ts`, `scene.types.ts` | Parses messages when messages/conversation change; picks a scene explicitly or falls back to the latest. Scene ID is `${conversationKey ?? "pending"}:${message.id}`; `source` is the immutable reply. An explicit selection increments a reveal key, including when selecting the same scene. |
| `frontend/src/components/tutor/MathCanvasHost.tsx` | Memoized host; dynamic dispatcher; supported-widget check; retryable canvas error boundary. Equality compares scene ID and source. Error-boundary key changes with scene/source. Renderer persistence is for the selected scene through layout changes. |
| `frontend/src/components/DuoMCB/DuoMCBPage.js` | Owns messages, draft, attachments, session/API/history and the composer slot. Assistant messages have an existing “view this step's figure” button. `canvasBusy` is the general loading boolean; it is not a distinct drawing-stage signal. |
| Conversation safety | `conversationEpoch`, pending request identity, AbortController and `historyLoadEpoch` prevent late replies/history races from writing to another conversation. `duoServer.js` avoids retrying an aborted conversation request. Preserve these guards. |
| Scroll | Near-bottom tracking uses a 96px threshold. New activity follows the bottom only when appropriate; readers above it get a new-response control. Content/viewport ResizeObservers handle resizing without forcing a reader back down. |
| Composer / `frontend/src/components/shared/MathInput.jsx` | Σ already opens MathLive. Plain text sends with Enter, Shift+Enter adds a line; formula mode supports Ctrl/Command+Enter. IME composition is guarded. The MathLive geometry event bridge and native VisualViewport handling already exist. |
| Persistence | Split-ratio preference uses localStorage; messages use IndexedDB. These are not a scene camera/parameter snapshot store. Reopening an older scene selects its payload, not its last manipulated engine state. |

All eight modules under `frontend/src/components/tutor/` were reviewed. The performance report's descriptions of the architecture match these boundaries. Its reported build/typecheck/browser successes are **prior evidence**, not checks rerun during this planning task.

### MathViz contract and linking feasibility

- `frontend/src/lib/mathvizExtract.js` extracts one MathViz object per reply and strips its block from visible text; it recovers several fence forms and hides malformed MathViz-looking payloads. There is no parsed text-anchor map.
- `MathVizData` requires `type: "mathviz.v1"` and a widget string, with other properties typed as unknown. It is an envelope, not proof that every widget has entity IDs.
- `frontend/src/components/DuoMCB/mathviz/MathVizRenderer.js` dispatches nine widgets using `data`. There is no common highlight command, entity callback, controlled parameter API or camera snapshot API.
- `MathVizGeometry2D.js` defaults to JSXGraph and offers a separate Simple Display/SVG engine. Its SVG point/line selection and user-drawn connecting lines are existing internal tools, not chat links or a general scratchpad.
- `MathVizJSXGraph.js` builds `pointsMap` and `jxgPtsRef` from explicit points, layers and constructions. Its claim cards already call `highlight()` / `noHighlight()` on referenced point IDs. This provides the concrete starting point for point linking; do not reimplement geometric claim verification.
- IDs may be reused across scenes, and some labels are generated by a renderer. A label is not globally unique. Explicit IDs and the actual rendered registry must both agree before offering a link.
- `frontend/src/lib/mathvizKinds.js` has `iterLayerPoints` and `collectLayerPoints`. The latter deduplicates with “last one wins”; use the raw iterator when checking conflicting definitions before deduplication.
- JSXGraph's board creation effect depends on `data`, `isClient`, `boardId` and `evaluateClaims`. Highlight state must not become a dependency or be injected into `data`. It must update existing point presentation.
- `MathVizFunctionPlot.js` already has local parameter sliders and uses their values in plotted samples. JSXGraph also displays parameter sliders, but the reviewed `paramValues` occurrences are initialization, displayed/control values and their setter; there is no general parameter-to-construction binding shown there. Do not claim all engines already share a working parameter contract.
- Three.js and JSXGraph use ResizeObserver/rAF resizing of existing instances. Three.js also manages drawing activity for visibility. Next-phase highlighting must preserve these mechanisms.
- Chat uses `parseMathAndText`, a custom Markdown renderer and KaTeX HTML. Wrapping arbitrary DOM text or replacing matches inside KaTeX HTML would be unreliable. The backend geometry contract contains points, constructions, claims and render/verification metadata, but the reviewed client path consumes no mapping from bilingual phrases/formula spans to those objects.

Useful immutable source anchors: [scene ownership](https://github.com/will050710-commits/BINGMATH/blob/f9081d8d6f0190e52cc910baae5b3d4e642e8917/frontend/src/components/tutor/useTutorScenes.ts), [host memoization](https://github.com/will050710-commits/BINGMATH/blob/f9081d8d6f0190e52cc910baae5b3d4e642e8917/frontend/src/components/tutor/MathCanvasHost.tsx), [JSXGraph registry and claim highlighting](https://github.com/will050710-commits/BINGMATH/blob/f9081d8d6f0190e52cc910baae5b3d4e642e8917/frontend/src/components/DuoMCB/mathviz/MathVizJSXGraph.js), [reply rendering/composer](https://github.com/will050710-commits/BINGMATH/blob/f9081d8d6f0190e52cc910baae5b3d4e642e8917/frontend/src/components/DuoMCB/DuoMCBPage.js), [performance report](https://github.com/will050710-commits/BINGMATH/blob/f9081d8d6f0190e52cc910baae5b3d4e642e8917/docs/CHANGELOG_PERFORMANCE.md).

### Local-only work to reconcile, not duplicate

The working `DuoMCBPage.js` imports and integrates untracked `SocraticHintCard.js`, `SolveProgressBanner.js` and `SolutionFeedbackButton.js`. These are absent from the reviewed remote tree.

`SocraticHintCard` currently slices a completed answer by paragraph; this is not an authored progressive-hint protocol and does not guarantee the answer is withheld. Its reveal state is initialized from `enabled`, so toggle behavior needs review when that work is integrated. `SolveProgressBanner` advances labels by elapsed-time thresholds; those labels do not establish actual server pipeline progress. The working integration passes `imageBase64` after the send flow clears attachment state, which also warrants checking for image-stage accuracy. Treat both as existing local experiments, not missing UI to rebuild or established backend capability.

### Verification coverage and limits

`frontend/tests/tutor-workspace.spec.ts` contains 12 scenarios using `frontend/tests/fixtures/tutor-api.ts`. They cover retained graph/parameter/draft across layout changes; responsive widths; reader scroll position; old-scene selection; keyboard/reduced motion; simulated native viewport shrink; actual MathLive keyboard; very short viewport; late reply and history-loading races; JSXGraph SVG identity; and Three.js canvas identity. API responses are mocked and the suite captures unhandled page errors.

`frontend/playwright.config.ts` currently matches only `tutor-workspace.spec.ts`, runs Chromium with one worker and can start Next dev. A new spec needs an explicit config update. `package.json` provides `typecheck:tutor`, `test:tutor` and `report:tutor`. The installed stack declarations match Next 16, React 19, Tailwind 4 and Framer Motion 12.

This turn performed source/Git checks only. It did not run an application build, install dependencies, run the browser suite against the stale working tree, benchmark FPS/bundles, or perform native-device QA.

## 3. Candidate assessment and recommended scope

| Candidate | Existing foundation / missing prerequisite | Decision |
| --- | --- | --- |
| A. Semantic chat–canvas highlighting | Point IDs and a live JSXGraph registry exist; generic renderer commands and text anchors do not. | **Choose a bounded first slice: explicit named-point references.** Establish the renderer adapter without inventing semantic spans. |
| B. Progressive Socratic hints and Thinking/Drawing states | Hint/solution tool modes and loading UI exist. Local-only reveal/progress components also exist. Authored hint steps and genuine server stage events are not established. | Defer; first reconcile local work and specify answer-disclosure behavior. “Thinking” can describe a pending request; “Drawing” needs an actual renderer/loading event, not an elapsed-time guess. |
| C. Contextual math keypad | MathLive keyboard and keyboard-aware composer are implemented. Context-specific palettes would need lesson/domain context and insertion behavior. | Defer; do not rebuild Σ or its geometry bridge. |
| D. Tiered hints with explicit XP policy | No reviewed progressive-hint/XP contract establishes tier costs, rewards or penalties. | Product decision required. Do not invent deductions or award XP for point selection. |
| E. Inline sliders shared with canvas | Function plot has local sliders; no shared controlled parameter store, and engine parameter behavior differs. | Defer until a per-widget parameter adapter and single state owner are defined. Avoid a second unsynchronized slider. |
| F. Quick scratchpad | Some SVG geometry editing tools exist; a persistent pen/eraser surface does not follow from them. | Defer: creates new input modes, touch conflicts and persistence requirements. |
| G. Historical scene-state restoration | Scene payload/history reopening exists; live camera/parameter snapshots do not. | Defer until engines expose versioned capture/restore contracts with eviction and migration behavior. |

### Learner problem and expected behavior

A learner reading a bilingual geometry explanation can see the named points in the figure but must repeatedly search for them. The next phase lets them locate one named object without adding another paragraph, revealing a solution, or changing the geometry.

For the active geometry reply, show a compact row such as `Điểm trên hình: [A] [B] [C]` or `Points in this figure: [A] [B] [C]`. The label names a point, not a verified mathematical relationship. A pointer hover or keyboard focus previews it. Activation pins it; selecting another point replaces it; activating the selected chip or Clear removes the selection. A short selected-point control also appears beside the board so it remains usable when the transcript is hidden in expanded mode.

An older message keeps its existing scene-opening button. The learner opens that scene first; its point row becomes available after the JSXGraph adapter is ready. Hovering an old message must never switch scenes. This deliberately avoids queued commands crossing scene loads in the first release.

### In scope

- Only `geometry_2d` displayed by JSXGraph inside TutorWorkspace.
- Explicitly named points that exist in the payload and in the live board registry, with finite current coordinates.
- One transient preview and one pinned point within the active scene; focus/hover preview temporarily overrides a pin and restores it on exit.
- Bilingual controls using the existing `LanguageContext` and current language; never display both language paragraphs by default.
- Safe cleanup, capability gating, focus management and preservation of all Phase A invariants.
- Focused automated regressions plus a short native keyboard/touch checklist.

### Excluded from B1

Arbitrary inline term/formula highlighting; inferred aliases/translations; canvas-to-prose matching; edges/angles/regions/curves/3D objects; automatic camera pan/zoom; hidden-layer reveal; SVG Simple Display support; automatic scene changes on hover; new hints, XP changes, keypad, sliders, scratchpad; backend/model prompt changes; state restoration across scenes/reload; broad transcript/composer refactoring.

**Prerequisite for later true inline linking:** an explicitly validated association between a rendered text/formula token and a scene-scoped entity. Define how it survives bilingual wording, Markdown/KaTeX normalization, content revisions and unsupported renderers. Source character offsets alone will not survive the current parser transformations. Agree and test that producer/consumer contract in a later phase. B1 does not pretend such fields already arrive from `/api/chat`.

## 4. Ordered implementation tasks and exact files

Paths below are relative to the repository root. “Add/change” describes Antigravity's future implementation; this planning task changed only this Markdown file.

| Order | Exact path and action | Responsibility / completion gate |
| --- | --- | --- |
| 0 | Integration prerequisite above; no automatic edits prescribed | Establish a clean Phase A base or reconcile local work without losing it. Verify actual branch/SHA and all five required files. |
| 1 | **Add** `frontend/src/components/tutor/sceneLink.types.ts` | Frontend-only point identity, registration, command and snapshot types. Keep point handles out of persisted state. |
| 1 | **Add** `frontend/src/components/tutor/scenePointLinks.ts` | Pure eligibility/duplicate validation using payload declarations and `iterLayerPoints`; no math solving or inferred labels. Test malformed/duplicate/unknown IDs before UI work. |
| 2 | **Add** `frontend/src/components/tutor/TutorSceneLinkProvider.tsx` | Own active scope, capability registration, focus/hover/pin state and action validation. Export optional consumer hooks and separate stable actions from changing snapshots. Own the single polite live region. Return a safe absent-provider result for MathViz used elsewhere. |
| 3 | **Add** `frontend/src/components/tutor/useJSXGraphPointLinks.ts` | Adapt the existing point registry to selection styling; retain engine handles in refs, register after initialization, detach on cleanup. Selection changes must not create/free the board. |
| 3 | **Change** `frontend/src/components/DuoMCB/mathviz/MathVizJSXGraph.js` | Call adapter hook unconditionally; attach it after `jxgPtsRef.current` is populated, detach before board disposal. Add selected-point status/Clear beside the board. Coordinate existing claim highlight timers and clean them up. Preserve resize dependencies and scene creation rules. |
| 4 | **Add** `frontend/src/components/tutor/TutorPointReferences.tsx` | Render a reference-row variant and compact canvas-selection variant. Consume the provider and existing language context. Manage disclosure focus and accessible selection announcements. |
| 4 | **Add** `frontend/src/components/tutor/TutorPointReferences.module.css` | Wrapping chips, status row, selected/focus styling, touch sizes and reduced-motion rules. No global canvas selectors. |
| 5 | **Change** `frontend/src/components/DuoMCB/DuoMCBPage.js` | Place one unkeyed provider around the existing workspace; pass the active scene's scope and a stable `onRevealActiveScene(scope)` callback that validates that scope before calling `selectScene(activeScene.id)`. Add the point row beside, not inside, the existing scene button for the active assistant message. Keep composer, parser, API and request guards intact. |
| 6 | **Change** `frontend/tests/fixtures/tutor-api.ts` | Add deterministic geometry replies/controls for explicit IDs, conflicting IDs, claims, unsupported scenes and scene switching. Preserve existing fixture defaults and held-reply behavior. |
| 6 | **Add** `frontend/tests/tutor-scene-links.spec.ts` | Contract cases and actual route tests listed below. Include page-error capture and renderer/point identity assertions. |
| 6 | **Change** `frontend/playwright.config.ts` | Match both `tutor-workspace.spec.ts` and `tutor-scene-links.spec.ts`; preserve one-worker/mocked-API setup. |
| 7 | **Update** `docs/HANDOFF_NEXT_PHASE.md` after implementation | Record actual resulting SHA, validation results and any intentional scope changes. Do not rewrite prior Phase A evidence as new results. |

No planned B1 changes to `backend/mathviz_contract.py`, `duoServer.js`, `MathVizRenderer.js`, `MathVizGeometry2D.js`, `MathCanvasHost.tsx`, `useTutorWorkspace.ts`, `useTutorScenes.ts`, `MathInput.jsx`, package dependencies or the Phase A PDF. Context provides a narrow optional bridge to the already mounted JSXGraph descendant; there is no need to thread state through every dispatcher or rewrite every engine.

## 5. Proposed data, events and state ownership

These are **new frontend design contracts**, not existing API fields. The `mathviz.v1` wire payload, stored messages and backend validation contract remain as reviewed.

```ts
type SceneLinkScope = Readonly<{
  conversationKey: string | null;
  sceneId: string;
  source: string; // exact immutable TutorScene.source; never sent as a new API field
}>;

type PointLinkTarget = Readonly<{ pointId: string; label: string }>;
type PointLinkAddress = Readonly<{ scope: SceneLinkScope; pointId: string }>;
type PreviewOwner = "pointer" | "focus";

type PointLinkAdapter = Readonly<{
  scope: SceneLinkScope;
  registrationId: number; // local monotonic instance token, not a backend ID
  targets: readonly PointLinkTarget[];
  apply: (pointId: string | null) => boolean; // false means unavailable; never throws to chat
}>;

type PointLinkSnapshot = Readonly<{
  scope: SceneLinkScope | null;
  available: boolean;
  targets: readonly PointLinkTarget[];
  pinnedId: string | null;
  previewId: string | null;
  effectiveId: string | null;
}>;
```

### Eligibility rules

1. Check the envelope and geometry widget at runtime; `MathVizData`'s index signature is not validation.
2. Collect explicit, non-empty string IDs from source point declarations in top-level points and layers, plus explicit `constructions[].point` declarations. `id`/`name` fallback may follow the existing renderer, but do not invent a name for an anonymous point. Require IDs to be trimmed already; keep case and Unicode spelling exact. Render labels as React text, not injected HTML.
3. Inspect raw declarations before “last one wins” deduplication. Repeated identical coordinate declarations for the same point are normal. Conflicting explicit coordinates or incompatible construction definitions make that ID ineligible for linking; leave the existing figure and notices alone. A coordinate declaration accompanying one construction can be its seed, not automatically a conflict.
4. Intersect eligible IDs with the actual `jxgPts` registry after construction. Require finite current coordinates and a visible point. Generated defaults, missing/unsolved handles and currently hidden points are not advertised. If visibility changes, refresh availability; do not reveal hidden groups for a link.
5. Use a `Map`, not untrusted object keys, for the new registry. No global ID-only lookup, substring match, translation inference, parsing of rendered label HTML, or dependence on coordinate coincidence.
6. Keep deterministic payload encounter order. Show four chips initially, then an explicit “More points” disclosure. Collapsing that disclosure must return focus to its toggle if it would hide the focused chip.

### Owners and events

| State/event | Owner and rule |
| --- | --- |
| Message content / scene selection / reveal key | Existing `DuoMCBPage` / `useTutorScenes`. Point actions never mutate messages or `scene.data`. |
| Layout, divider, keyboard and scroll | Existing `useTutorWorkspace`. Provider is not keyed by width, mode or selected point. |
| Active linking scope and UI selection | `TutorSceneLinkProvider`, in memory only. Match conversation, scene ID and exact source on every action. Clear on scope change; derive an empty snapshot immediately for mismatched old state, before any cleanup effect. |
| Board, points, camera, geometry parameters | Existing renderer. Adapter owns only reversible presentation changes and handles in refs. |
| `register(adapter)` | After board and target handles exist. Replace capability only for the current scope. Return cleanup tied to the registration ID so stale cleanup cannot remove a new adapter. |
| `preview(address, owner)` / `endPreview(address, owner)` | Only for a ready current adapter. Track focus and pointer ownership separately; focus wins over pointer, then pinned selection. An old pointer-leave/blur cannot clear a newer owner's preview. No scene selection or focus movement. |
| `togglePinned(address)` | Click, tap, Enter or Space. Pin exactly one eligible point; same point toggles off. Clear transient preview for that activation so toggling off is visibly off until a new preview event. |
| `clear(scope)` | Clear button or Escape while a link control owns focus. Clear pin/preview, restore presentation, keep focus. Only consume Escape when this action handled it; otherwise let workspace behavior continue. |
| `detach(registrationId)` | Restore styles before disposal, cancel frames/timers and remove capability. Clear pin/preview. Engine change, renderer error, scene change and genuine unmount cannot leave stale controls. |
| Adapter rejects a target | Clear that selection; update capability and announce unavailability only after an explicit activation. Do not call another scene, move a point or retry automatically. |

Only the active scene's reference row is interactive, and only after adapter registration. Before registration, the existing canvas loading/error UI owns feedback; no enabled dead chips or indefinite new spinner. A failed registration results in no point row. The normal scene button and conversation stay usable. No highlight command is queued during loading or across conversations. A successful explicit pin calls `onRevealActiveScene(scope)`; preview and clear never call it. The provider renders one localized, visually hidden polite live region outside the canvas/transcript inert regions; the two visible control variants must not add duplicate live announcements.

### Memoization and engine boundary

Use a provider whose state is internal, and stable action callbacks. The reference components and adapter consume its narrow contexts. Do not make the host or entire transcript consume changing highlight snapshots. Context updates reach the mounted adapter below `MathCanvasHost` without bypassing its scene equality rule or forwarding a newly parsed `data` object through it.

This matters because `useTutorScenes` can create fresh scene/data objects when another message arrives, while the current host comparator deliberately retains the previous renderer for an unchanged ID/source. Adding highlight props to that comparator without stabilizing data could accidentally rebuild JSXGraph. The proposed context bridge avoids that change.

The adapter should snapshot the presentation attributes it changes, apply a static cyan outline to the selected existing point, and restore the exact originals when clearing. Keep normal and hover highlight attributes consistent so native `highlight()` / `noHighlight()` and existing claim flashes do not erase a pin. The installed JSXGraph source/type declarations expose these methods and highlight stroke attributes; use its public APIs, not DOM replacement. Claim highlights remain temporary; their expiry restores the current semantic selection, and timers must be canceled before disposal. Do not recompute constructions or solve geometry to locate a point.

## 6. Interaction, layout and animation specification

### Layout and copy

Retain Phase A's container breakpoints and divider sizes. On desktop, place the point row immediately under the active reply's existing scene button, within the transcript column. The short selected-point/Clear row sits just above the board; it must not overlap drawing controls. On tablet/mobile, the same reference row wraps below its scene button while the existing canvas preview remains above chat. Use 8px gaps and controls at least 44px high/wide. No horizontal page scrolling or second canvas.

Show one interface language according to `LanguageContext`:

| Meaning | Vietnamese | English |
| --- | --- | --- |
| Row label | Điểm trên hình | Points in this figure |
| Accessible button name | Chọn điểm A trên hình | Select point A in the figure |
| Pin status | Đã chọn điểm A | Point A selected |
| Clear | Bỏ chọn | Clear selection |
| Disclosure | Thêm điểm / Thu gọn | More points / Fewer points |
| Explicit activation failed | Điểm này hiện chưa khả dụng trên hình. | This point is currently unavailable in the figure. |

“Selected” indicates an interface state, not mathematical correctness. Do not add success ticks implying verification, XP labels, copied answer text, or a second translation paragraph. Switching language updates control copy without clearing the selection or rebuilding the board.

When the canvas is collapsed, an explicit point activation may call the existing `selectScene(activeScene.id)` to reopen it, using the current reveal-key path. Pointer/focus preview never reveals it. Keep focus on the chip and preserve the transcript reading position. When a mobile keyboard forces compact/minimal preview, retain the selection and let the existing keyboard rules win; do not blur the composer or dismiss the keyboard programmatically. The highlight becomes visible again when space returns. Do not claim it is currently visible in the status copy.

### State behavior

| State | Visual and behavioral specification |
| --- | --- |
| Default | Ready point chips have neutral slate borders/backgrounds and literal point labels. No point is selected; no canvas selection status. Only current-scene targets appear. |
| Hover/focus | Outline the target point and chip. Keyboard focus also has a 2px visible focus outline. No pan, zoom, message scroll, layout change or announcement on every hover. Leaving/blur restores the pin or base style. |
| Selected | Chip uses cyan border/background plus an explicit selected marker; `aria-pressed=true`. Point gets a static 3px cyan outline, with its existing label retained. Show selected-point/Clear near the board. Selection persists through layout changes, composer typing and unrelated replies while the same scene stays selected. |
| Loading | Existing dynamic-renderer feedback remains. Do not expose point controls until registration succeeds. A later chat request may show the existing busy state while the current board's links remain usable. Loading is not a reason to discard that board's selection. |
| Success | Applying selection updates the chip and point together; one polite status announcement for explicit selection/clear. No toast, confetti, sound or delay before interaction. |
| Unavailable/error | Omit unsupported capability. If a ready target disappears during explicit activation, clear it and announce the short localized message once. Existing canvas error/retry UI remains authoritative for renderer failures. Retrying may re-register targets; it starts with no old pin. |

### Motion and input equivalence

| Element | Proposed motion |
| --- | --- |
| Chip color/background | 120ms ease-out, `cubic-bezier(0.2, 0, 0, 1)`; no movement or width animation |
| Point highlight | Immediate presentation update in the next scheduled frame; no coordinate interpolation, pulse or scale |
| Selected status / disclosure content | 100ms opacity fade; no height animation or stagger |
| New chip press | No new spring or scale. Immediate pressed state keeps touch targets stable. |
| Existing workspace shell | Preserve spring stiffness **300**, damping **32**, mass **1**, `layout="position"`; drag disables layout animation |
| Existing workspace toolbar press | Preserve spring **420 / 32 / 1**, scale **0.98** where already implemented |
| Existing new-response control | Preserve 160ms fade / 4px movement, and its existing reduced-motion behavior |
| Reduced motion | New transitions use **0ms**; no pulse, scale, movement or stagger. Same information and selection outcome. Existing workspace reduced-motion rules remain. |

Desktop pointer users get hover preview and click pin. Touch users tap once to pin and tap again/Clear to remove; no long press, tooltip or hover prerequisite. Keyboard users Tab through ordinary buttons, use Enter/Space to toggle, and Escape/Clear to remove. Avoid adding dozens of canvas DOM tab stops: the reference row is the keyboard equivalent of finding a point visually. Use a labeled group, `aria-pressed`, visible focus and one polite live region for selection changes. Keep controls outside KaTeX HTML and outside the existing scene button to avoid nested buttons.

## 7. Performance safeguards and acceptance criteria

### Safeguards

- One renderer, one board and one registry for the active scene. No cloned previews, per-message canvases or hidden background renderers.
- Register targets on scene/board initialization or relevant visibility changes, not every composer keystroke or pointer move. Cache eligibility for unchanged scene ID/source.
- Store engine handles and scheduled frames in refs. Dispatch on pointer enter/leave, focus/blur and activation; no mousemove stream. Coalesce presentation writes to at most one pending rAF and update only old/new highlighted points.
- Keep highlight snapshots out of `scene.data`, JSXGraph construction-effect dependencies, layout state, localStorage and IndexedDB. Do not serialize the board or append highlight events to chat.
- Do not add explicit full-board reconstruction or geometry verification for visual highlighting. Any existing update event invoked by a public style API must remain bounded to actual target changes, not an animation loop.
- Restore touched styles; cancel pending frames and claim timers; unregister only the matching instance. Optional context is inert when a shared renderer runs outside TutorWorkspace.
- No new runtime library, model request, translation request or global event bus. Preserve lazy renderer loading and MathLive's independent loading path.
- Record browser traces if interaction causes unexpected work; do not claim a numeric FPS/bundle improvement without measurement.

### Acceptance criteria

1. A mocked geometry reply with explicit A/B/C points displays the ready active-scene point row; inactive scene cards retain their original open-figure control. Unsupported widgets and Simple Display never show enabled unsupported links.
2. Hover/focus A visibly changes A only; exiting restores the previous pin or original style. Clicking/Enter/Space/tapping B pins B; toggling B off clears immediately despite the button retaining focus. Clear and Escape behave consistently.
3. Point geometry, coordinates and camera are unchanged by linking. Drag an existing free point, then highlight it: the highlight follows the live handle, not initial payload coordinates. Existing drag/zoom/claim tools still work.
4. Preserve the same JSXGraph SVG node and point handle/DOM identity through selection changes, typing, divider drag, collapse/expand, language switch and responsive width changes. Preserve a manually adjusted view and free-point position.
5. While the scene is explicitly selected, appending another text reply does not rebuild its board or clear its pin. If normal scene selection actually changes, old link state clears. This distinction matches `useTutorScenes` behavior.
6. Two conversations or scenes may both contain `A`; activation can only affect the current scene/source. Stale actions, registration cleanup, delayed reply and rapid scene switches cannot highlight a newer board incorrectly.
7. Duplicate conflicting IDs, anonymous/generated names, malformed point data, unavailable construction handles and missing/hidden points never become misleading links. Repeated identical declarations remain usable. A failed renderer or retry produces no stale controls or unhandled page error.
8. Switching to Simple Display clears adapter capability and selection; switching back registers a fresh instance. Existing SVG point selection is untouched. Claim-flash expiry cannot remove a semantic pin; no timer touches a freed board.
9. At desktop, tablet, 390px mobile and narrow mobile widths, the row wraps without page overflow. More/Fewer points is operable and does not hide keyboard focus. Expanded mode offers Clear alongside the board.
10. Native-viewport simulation and the actual MathLive keyboard still leave the composer usable. Pinning never dismisses the keyboard, loses the draft or defeats minimal-viewport layout. Touch selection works without hover.
11. New controls use the current language, meaningful accessible names, visible focus and pressed state. A screen reader announces explicit selection once; pointer movement produces no announcement flood. Reduced motion preserves behavior with no new animation.
12. Opening/reopening a scene or highlighting a point never forces the transcript to the bottom. Original reply text, KaTeX rendering, copy action, hint/solution requests and verification notices remain intact. No additional answer or XP change occurs.
13. The existing 12-scenario Phase A suite and the new focused spec pass without uncaught page errors. Report native-device checks separately from simulated keyboard coverage.

### Focused verification commands for the implementation

Run only after the Phase A checkout/integration prerequisite is satisfied. These are future commands, not claimed results from this planning session. From the repository root:

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
git diff --check
Set-Location frontend
pnpm typecheck:tutor
node scripts/check-mathviz-extract.mjs
node scripts/check-mathviz-kinds.mjs
node scripts/check-chat-errors.mjs
pnpm exec playwright test tests/tutor-scene-links.spec.ts --project=chromium
pnpm exec playwright test tests/tutor-workspace.spec.ts --project=chromium
```

Use the repo's pinned dependency installation if missing: `pnpm install --frozen-lockfile`, then `pnpm exec playwright install chromium`; the report specifies pnpm 10.26+ or 11. Do not upgrade packages for this phase. The Playwright config must include the new filename before its command can discover tests. Check that port 3000 belongs to the intended checkout, since the existing config may reuse a running dev server.

Scoped lint, in separate processes to respect the report's memory observations:

```powershell
$env:NODE_OPTIONS = '--max-old-space-size=4096'
pnpm exec eslint src/components/tutor
pnpm exec eslint src/components/DuoMCB/mathviz/MathVizJSXGraph.js
pnpm exec eslint src/components/DuoMCB/DuoMCBPage.js
pnpm exec eslint tests/tutor-scene-links.spec.ts tests/fixtures/tutor-api.ts playwright.config.ts
```

Restore any pre-existing `NODE_OPTIONS` value after the checks. Do not mistake a green TypeScript check for full checking of legacy JS; the reviewed configuration has `checkJs: false`. Browser assertions must exercise the changed JavaScript adapter. A full production build and PDF rebuild are not required merely to write or review this plan.

Manual focused checks: iOS Safari and Android Chrome with native text keyboard and MathLive; tap/clear a point; rotate the device; read an older reply while a new one arrives; run a screen reader through selected state and the More/Fewer control. Record devices and observations, not a generic “mobile passed.”

## 8. Risks and remaining product decisions

| Risk / decision | B1 default or follow-up |
| --- | --- |
| Dirty checkout blocks synchronization | Owner-directed integration is the prerequisite; do not overwrite the local Socratic/progress work. Recheck remote main at implementation time. |
| Chips are narrower than full semantic linking | Make the release scope explicit. They locate named points; they do not claim that every word/formula is understood. Expand only after a text-anchor contract exists. |
| Payload naming inconsistencies | Gate against explicit declarations and the live registry. Prefer omitting a link to pointing at a guessed object. Capture examples in fixtures before broadening eligibility. |
| Interaction with native hover/claim timers | One adapter owns semantic presentation restoration. Test hover, claim flash, pin and disposal together. Do not change claim truth values or verification copy as part of linking. |
| Context update accidentally causes reconstruction | Preserve host comparator/data ownership, stable adapter actions and board-effect dependencies; identity regression is a release gate. |
| Visual selection vs correctness | Use “selected” wording and outline/pressed cues, not correctness colors or proof claims. Existing verification warnings stay visible. |
| Localization coverage | Localize the new controls through `LanguageContext`; whole-app translation cleanup is separate. Choose concise labels rather than duplicated bilingual paragraphs. |
| Number of initial points | Proposed default: four, followed by explicit More. Confirm with representative dense geometry examples after testing. |
| Inactive-scene interaction | Proposed default: use existing scene button first, then point row. Single-action cross-scene linking is a later extension requiring scoped pending-command rules. |
| Progressive hints / disclosure | Decide authored hint levels, when a learner may reveal an answer, and how locally sliced answers will be replaced. None of this is established by the local hint card. |
| XP policy | No new XP effect in B1. Tier rewards/penalties, fairness, accessibility and retry rules remain unresolved for candidate D; require an explicit product policy before implementation. |
| Shared parameters / historical state | Later phases need per-engine controlled parameter and versioned snapshot contracts. Keeping one mounted renderer does not supply restoration across scene changes or reloads. |

The B1 defaults above are concrete recommendations and do not block starting work from a suitable base. The synchronization conflict is an actual integration prerequisite. Wider semantic, Socratic, XP and persistence decisions are outside B1 and should not be smuggled into it.

## 9. Concise implementation brief for Antigravity

Use reviewed main `f9081d8d6f0190e52cc910baae5b3d4e642e8917` as the planning baseline. The local checkout is still `main` at `1661cd0499bbed61868519d2a6597392f077c7da`: a fast-forward was blocked by local `frontend/src/components/DuoMCB/DuoMCBPage.js` edits. Preserve that work and establish the correct integration base first.

Implement **B1 named-point linking for the active JSXGraph geometry scene**. Add a frontend-only scoped provider/adapter and a bilingual point-reference row next to the existing scene button. Offer only explicitly declared, unambiguous IDs that resolve to live points. Hover/focus previews; click/tap/Enter/Space pins; Clear/Escape removes. Keep an accessible selected-point/Clear control beside the board. Use current language, four initial chips and explicit disclosure.

Keep the one-renderer architecture, existing host memoization, layout/composer separation, rAF resizing, keyboard handling, scroll behavior and conversation guards. Highlight presentation must never enter MathViz data or recreate the board. Use the existing registry and public point styling APIs; restore styles and clean up registrations/frames/timers. Gate unsupported widgets and SVG mode cleanly.

Do not add backend fields, guessed inline semantic mappings, answer-reveal behavior, XP rules, a second keypad/slider, scratchpad or historical state restoration. Add focused contract/browser tests, update Playwright's filename matcher, run the commands above, and report actual results and limitations. Follow this task's file order; document any departure before expanding the scope.
