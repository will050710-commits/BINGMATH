# Phần B — Dashboard, Learning Map và gamification

Ngày audit 30/10/2026. Bản đặc tả đề xuất để Antigravity thực thi theo gate trong [master plan](IMPLEMENTATION_MASTER_PLAN.md). Phụ thuộc [CLIL](SPEC_CLIL_LEARNING.md) và [Socratic/verification](SPEC_BINGMCB_QUALITY.md). Chưa triển khai UI, API hay migration được mô tả ở đây.

**Thứ tự:** chuẩn hóa dữ liệu G1 → dashboard G2 → XP/streak/map/quests/leaderboard G3–G6 → Eureka G7 → Shield G8 → Vault/Boss G9. Có thể dựng component bằng fixture có nhãn trong development; không phát hành phần thưởng thật trước gate dữ liệu.

## B0. Audit hiện trạng

| Section | File hiện có | Kết luận từ source |
| --- | --- | --- |
| Home/dashboard | `frontend/src/components/trangchu/TrangChuForm.js`; `frontend/src/app/page.js`; `frontend/src/app/Trangchu/page.js`; `frontend/src/app/dashboard/page.js` | Ba route dùng chung TrangChuForm, đang trộn marketing/profile/stats/chest/leaderboard. Tách dashboard riêng, không sửa cả ba route thành cùng Bento |
| Stats | `frontend/src/app/stats/page.js` | Đã có topic mastery, weak topics, badges, daily quests. Có bảng XP_TO_NEXT riêng; không giữ thêm bảng level thứ tư |
| Streak/XP | `frontend/src/components/StreakBar.js`; `frontend/src/components/GamificationHUD.js`; `frontend/src/components/ui/XPBar.jsx`; `frontend/src/hooks/useGamification.js` | StreakBar có cache `dm_streak_bar`, freeze purchase; HUD gọi checkin khi mount. XPBar animate CSS width. Hook gửi client correctness/delta, chưa phải atomic reward receipt |
| Quests API | `frontend/src/lib/api.js`; `backend/main.py` | `/api/quests/today`, `/api/quests/{id}/progress`, `/api/quiz/attempt`, `/api/streak/checkin` đã có. Accuracy percent đang có nguy cơ bị xử lý như count delta |
| Map/catalog | `frontend/src/app/mathmap/[id]/page.js`; `frontend/src/components/mathmap/TopicList.jsx`; `MathMapHero.jsx`; `LearningObjectives.jsx`; `frontend/src/context/MathMapStore.js` | Catalog map phục vụ MRM; fallback topics có completed/current/locked mẫu. Chưa có authoritative prerequisite path hoặc SVG unlock drawing |
| Leaderboard | `frontend/src/components/trangchu/TrangChuForm.js`; `frontend/src/components/mrm/MRMLeaderboard.js`; `frontend/src/components/clans/ClanLeaderboard.jsx`; `frontend/src/components/events/TournamentLeaderboard.jsx` | Global learning, MRM, clan, tournament khác semantics; không cộng chung các số điểm |
| Mistake/relearn | `frontend/src/app/relearn/page.js`; `backend/fsrs_scheduler.py`; handlers relearn trong `backend/main.py` | Đã có due/upcoming/this_week, competency heatmap, FSRS self rating, daily recommendations và link chatbot. Không cần kho lỗi thứ hai |
| Backend reward sources | `backend/main.py`; `backend/routers/social_tournaments.py` (local) | `_get_user_xp` từ test_results, `_add_xp` ghi user_gamification, users.xp được dùng ở luồng khác; `_add_xp` commit nội bộ. Cần transaction rõ và migration có reconciliation |

Không coi streak check-in khi mở HUD là “đã học”; không coi phiên dịch là Socratic reasoning; không coi self rating FSRS là câu đúng có thể nhận Eureka. Sửa pipeline trước animation.

## G1 — Canonical learning events, ledger và summary

### Target Files

Sửa existing `backend/main.py`, `backend/db/connection.py`, `backend/routers/social_tournaments.py`, `frontend/src/lib/api.js`, `frontend/src/hooks/useGamification.js`, `frontend/src/components/GamificationHUD.js`. Phần `backend/db/` và routers hiện có local work cần bảo toàn khi P0.

Tạo mới:

- `backend/learning_contract.py`, `backend/services/learning_rewards.py`, `backend/services/learning_summary.py`, `backend/services/learning_events.py`.
- `backend/routers/learning_progress.py`, `backend/migrations/learning_events_v1.py`.
- `frontend/src/types/gamification.ts`, `frontend/src/hooks/useLearningSummary.ts`, `frontend/src/context/LearningProgressContext.tsx`.
- `backend/tests/test_learning_rewards.py`, `backend/tests/test_learning_migration.py`.

### Props & state schema

```ts
type LearningSummary = {
  schemaVersion: 1; summaryVersion: number; asOf: string; serverNow: string;
  learnerScope: string; timezone: string; policyVersion: string;
  xp: {
    lifetimeEarned: number; available: number;
    level: number; intoLevel: number; requiredForNext: number | null;
  };
  streak: {
    currentDays: number; bestDays: number; lastQualifiedDate: string | null;
    status: 'active' | 'at-risk' | 'recoverable' | 'inactive';
    shieldsAvailable: number; recoveryOfferId: string | null;
  };
  resume: { lessonId: string; pathId?: string; nodeId?: string; href: string } | null;
  dueReviewCount: number; quests: QuestView[];
};
type RewardReceipt = {
  receiptId: string; eventId: string; summaryVersion: number;
  policyVersion: string; awardedAt: string;
  baseXp: number; bonusXp: number; awardedXp: number;
  multiplierBasisPoints: number;
  eureka: boolean; comboCount: number;
  xpBefore: LearningSummary['xp']; xpAfter: LearningSummary['xp'];
  unlockedNodeIds: string[];
};
type LearningProgressState = {
  status: 'loading' | 'ready' | 'stale' | 'error';
  summary: LearningSummary | null;
  pendingActionIds: string[];
  seenReceiptIds: string[]; // bounded, per user/session; server vẫn là authority
};
```

`QuestView` được định nghĩa tại G5. Frontend không tính level bằng mảng riêng nữa; `requiredForNext=null` là level cap, không chia0. Numbers finite, nguyên không âm trừ ledger adjustment được kiểm soát; validate API ở boundary. `available` là số dư có thể dùng nếu policy XP-spending được giữ; `lifetimeEarned` dùng level. Đây là **semantics đề xuất**, phải ghi policy version và reconcile legacy trước bật; không tự đổi điểm/tiền game.

API mới đề xuất:

- `GET /api/learning/summary`: projection cùng version cho dashboard/streak/XP/quests.
- `GET /api/learning/receipts?after=<cursor>`: resume khi reconnect; cursor do server cấp.
- Các command quiz/Socratic/quest claim/Blitz trả receipt nếu có. Không có endpoint public cho client gửi tùy ý “award_xp” hoặc internal event trusted.
- Giữ wrappers legacy trong giai đoạn chuyển; adapter `_fetch` vẫn xử lý `{ok,status,data}`, không giả định response shape mới tự xuất hiện.

### Persistence, authority và migration

| Entity mới | Fields/index cốt lõi | Invariant |
| --- | --- | --- |
| `learning_events` | event_id, user_id, kind, source_id/version, action_id, occurred_at, policy_version, payload_version; unique(user_id, action_id, kind) | Chỉ server adapter sau grading/validated action tạo trusted events |
| `reward_ledger` | ledger_id, event_id, user_id, reason, base_xp, bonus_xp, policy_version, created_at; unique(event_id, reason) | Replay không sinh award thứ hai; corrections là entries audit được, không sửa lịch sử âm thầm |
| `learning_progress` | user_id, content/path_version, node_id, state, evidence_ref, revision | Completion theo policy/version và evidence; không từ page view |
| `daily_learning_state` | user_id, local_date, timezone_version, qualifying_event_id, rescue_id; unique(user_id, local_date) | Một ngày/khôi phục chỉ được ghi một lần |
| `reward_receipts` | receipt_id, event_id, summary_revision, serialized_result | Retry trả cùng kết quả, không recompute bằng policy mới |

Transaction: validate command + ownership/version → claim idempotency key → grade/consume evidence đã có → compute policy → append event/ledger → update progress/quest/streak → persist receipt → commit một lần. Model call/network không nằm trong SQLite write transaction kéo dài; persist pending assessment rồi finalize một lần có version check. Refactor `_add_xp`/badge helpers để caller quản transaction; không nested commit phá atomicity. Concurrency dùng unique constraints và transaction có retry bounded, không chỉ lock trong frontend.

Migration 3 bước: (1) read-only snapshot ba nguồn XP và phân loại sự khác biệt; (2) shadow projection theo policy, báo per-user mismatch; (3) chỉ import opening balance một lần với provenance và migration ID khi rule reconciliation rõ. Không cộng ba nguồn vì có thể trùng cùng thành tích. Không tự chọn số lớn nhất. Chưa reconcile được thì giữ display legacy có nhãn, tắt new competitive rewards cho scope đó; các CLIL functions vẫn hoạt động.

Legacy freeze cost phải từ catalog server, không body `cost`; quiz correctness phải từ question/rubric server, không body `is_correct`; quests không tin delta client. Nếu question legacy chưa có rubric trusted, không dùng nó để tạo Eureka hoặc leaderboard XP mới. Giữ thông báo rõ khi hoạt động chỉ practice. MRM coins/tournament points có namespace riêng và không nhập chung lifetime XP.

Timezone: profile IANA timezone, fallback cấu hình ứng dụng (bối cảnh hiện tại Asia/Bangkok), server tính ngày; không dùng `_date.today()` của host hoặc đồng hồ client. Đổi timezone có effective date/policy để không tạo hai phần thưởng cùng ngày. Không âm thầm thay timezone từ geolocation.

### Tailwind & animation

G1 là data layer, không có UI celebration. Sync status dùng V-Type `text-xs text-muted`; initial opacity0→1 .1s, exit .08s, no spring/layoutId. Pending action không hiển thị số XP như đã cấp. Summary lỗi giữ last confirmed snapshot kèm “Chưa cập nhật”, không thay thành0.

### Gate G1

Tests: retry/double-click/multi-tab/concurrent command, rollback giữa event và ledger, duplicate quest claim, stale summary revision, auth isolation, timezone midnight, invalid negative values, client forgery, old policy replay, migration rerun. Mọi read surface thống nhất cùng summaryVersion. Test DB tạm bắt buộc. Không mở G7–G9 chỉ vì G1 mock UI đã chạy.

## G2 — Learner Dashboard dạng Bento

### Target Files

Sửa `frontend/src/app/dashboard/page.js`, `frontend/src/components/trangchu/TrangChuForm.js` chỉ phần điều hướng/summary liên quan; `frontend/src/components/ui/GlassCard.jsx` nếu cần variant tương thích. Không đổi `/` và `/Trangchu` thành bản sao dashboard mới.

Tạo `frontend/src/components/dashboard/LearnerDashboard.tsx`, `ContinueLearningCard.tsx`, `TodayGoalCard.tsx`, `LearningStatsCard.tsx`, `ReviewDueCard.tsx`, `DashboardSkeleton.tsx`; dùng `DailyQuestsPanel` G5 và `LearningLeaderboardCard` G6.

### Props & state schema

```ts
type LearnerDashboardProps = {
  summary: LearningSummary | null;
  status: 'loading' | 'ready' | 'stale' | 'error' | 'guest';
  onRetry: () => void;
};
type ContinueLearningCardProps = {
  resume: LearningSummary['resume'];
  lessonTitle: { en: string; vi: string } | null;
  mode: 'immersion' | 'assisted' | 'parallel';
};
type TodayGoalCardProps = {
  completed: number; target: number; unit: 'verified-activities';
  editable: boolean; onEdit: () => void;
};
// UI state: goalEditorOpen, leaderboardPeriod; summary từ context, không copy XP vào mỗi card.
```

Thứ tự DOM và mobile: (1) Tiếp tục bài học; (2) Mục tiêu hôm nay; (3) XP/Streak; (4) Ôn lại; (5) Quests; (6) Progress map preview; (7) Leaderboard opt-in. Mục tiêu dùng số hoạt động thật theo policy; không suy “phút học” từ page open. Learning map preview chỉ là ảnh/SVG nhẹ từ graph, click mở map; không thêm renderer tương tác lớn trên dashboard.

New user: CTA chọn bài đầu, goal trống có hướng dẫn, review=0 thật khi API xác nhận; không bịa streak/rank. Guest: giới thiệu một lesson mẫu và nhãn progress local. Loading skeleton giữ kích thước; error có retry, cached stale có timestamp. Không vô hạn skeleton khi API lỗi. Không thêm lootbox/chest mới vào dashboard để thay motivation học tập.

### Tailwind & visual spec

- Page V-Grid, header `mb-6 flex flex-wrap items-end justify-between gap-3`.
- Bento `grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-12`; continue `md:col-span-4 xl:col-span-8`, goal `md:col-span-2 xl:col-span-4`; stats/review mỗi card `md:col-span-3 xl:col-span-4`; quests/map chia phần còn lại theo hàng, leaderboard full hoặc span4 khi đủ chỗ.
- Cards V-Card/V-Surface; hero `min-h-56 p-5 sm:p-7`, subtle top border `border-line-strong`, coral radial glow opacity.08 đặt pseudo-element pointer-events-none. Một card hero có glow, các card phụ nền surface.
- Typography: h1 V-Type display, card title `text-lg font-semibold`, số lớn `text-3xl tabular-nums`, caption `text-sm text-muted`. Icon 20–24px, touch44px.
- Giữ depth qua border/shadow, không layered backdrop-blur ở mọi card. Paper theme dùng solid surface/shadow nhẹ.

### Animation spec

- Card variants `{hidden:{opacity:0,y:8},show:{opacity:1,y:0},exit:{opacity:0,y:0}}`; enter spring320/30, opacity .15; staggerChildren .035, tối đa6 card visible, không stagger khi background refetch.
- `initial="hidden" animate="show"`, exit .1s; `layoutId` none. `whileHover={{y:-2}}` spring380/32 chỉ card click được; không hoverlift toàn bộ dashboard.
- Summary refresh cập nhật text, không re-enter cả grid; reduced no y/stagger. Skeleton không shimmer khi reduced hoặc tab hidden.

### Gate G2

Mobile DOM order đúng, không overflow 320px; dark/paper contrast đạt; navigation tới lesson thật; loading/empty/error/guest/stale đã chụp. Không fetch riêng cùng summary cho mỗi card. So baseline theo performance gate master, initial bundle không thêm chart library.

## G3 — XP Bar, Level và Streak thống nhất

### Target Files

Sửa `frontend/src/components/ui/XPBar.jsx`, `frontend/src/components/StreakBar.js`, `frontend/src/components/GamificationHUD.js`, `frontend/src/app/stats/page.js`, `frontend/src/hooks/useGamification.js`.

Tạo `frontend/src/components/gamification/LearningXPBar.tsx`, `StreakStatusCard.tsx`, `RewardToast.tsx`, `frontend/src/hooks/useRewardReceiptQueue.ts`.

### Props & state schema

```ts
type LearningXPBarProps = {
  xp: LearningSummary['xp']; receipt: RewardReceipt | null;
  compact?: boolean; onLevelDetails?: () => void;
};
type StreakStatusCardProps = {
  streak: LearningSummary['streak']; serverNow: string; timezone: string;
  onOpenRecovery: (offerId: string) => void;
};
type RewardAnimationState = {
  displayedLevel: number; displayedProgress: number;
  queue: RewardReceipt[]; activeReceiptId: string | null;
};
```

Thanh hiển thị xpIntoLevel/requiredForNext do server gửi. `aria-valuenow` là giá trị confirmed ngay, animation chỉ presentation. Level cap dùng “Đã đạt mốc hiện tại”, không đầy giả với mẫu số0. Nếu receipt qua nhiều level, animation tối đa một lần fill + chuyển tới cuối; không bắt học viên chờ mọi level. Queue gộp receipt liên tiếp nhưng giữ tổng đúng, không replay khi remount.

Xóa mutation `streakCheckin()` khỏi HUD mount; daily qualification do server accepted activity theo policy G1. Cache theo learnerScope/summaryVersion, clear logout. Freeze purchase hiện có chỉ tiếp tục sau khi cost/balance server được reconcile; không gửi giá từ prompt client làm authority. Streak summary hiển thị ngày theo profile timezone, recovery CTA chỉ nếu có offer.

### Tailwind & visual spec

- Track `h-2.5 overflow-hidden rounded-full bg-surface-2`, fill `bg-brand` (hoặc gradient brand→brand-strong nhẹ), wrapper có border-line; không mặc định gradient cyan-pink trên theme ấm.
- Label `flex justify-between gap-2 text-xs tabular-nums text-muted`; level `text-ink font-semibold`. Streak card V-Card icon + “N ngày”, trạng thái bằng chữ; shield là icon và count thực.
- Toast `fixed bottom-4 ...` có safe area và tránh composer; maxwidth22rem, nonmodal `role="status"`; không che submit/MathLive.

### Animation spec

- Track inner fill `transform-origin:left`; `initial={false}`, animate `scaleX` tới ratio clamped, tween `.55s ease:[.22,1,.36,1]`; không animate width layout. `layoutId` none.
- Number count presentation tối đa.55s, aria-live chỉ final summary một lần. Cross-level: fill1 trong.25s rồi reset0 và tới final trong.3s, tối đa hai đoạn.
- Toast variants initial `{opacity:0,y:12,scale:.98}`, animate `{opacity:1,y:0,scale:1}`, exit `{opacity:0,y:6}`; spring380/32, exit.12; layoutId `reward:${receiptId}` scoped queue.
- Reduced immediate ratio/value, toast fade.1s; no bounce. Timer dismiss không chạy khi toast có keyboard focus; không yêu cầu click để tiếp tục học.

### Gate G3

Level threshold chỉ từ server, không khác giữa stats/home/streak. Same receipt chỉ một animation; new summary older revision bị bỏ qua. Không XP checkin do mount/unmount. Screen reader không đọc hàng chục số trong counting animation.

## G4 — Learning Map có prerequisite và motion SVG

### Target Files

Sửa `frontend/src/app/mathmap/[id]/page.js`, `frontend/src/components/mathmap/TopicList.jsx`, `MathMapHero.jsx`, `LearningObjectives.jsx`; `frontend/src/context/MathMapStore.js` chỉ thêm mapping catalog→path nếu có, không dùng store local làm authoritative progress.

Tạo `frontend/src/app/learning-map/[pathId]/page.tsx`, `frontend/src/components/learning-map/LearningPathView.tsx`, `LearningPathSVG.tsx`, `LearningNode.tsx`, `NodeDetailsSheet.tsx`, `frontend/src/types/learningPath.ts`, `frontend/src/hooks/useLearningPath.ts`, `backend/services/learning_paths.py`.

### Props & state schema

```ts
type LearningNodeState = 'locked' | 'available' | 'current' | 'completed';
type LearningNodeView = {
  id: string; kind: 'lesson' | 'checkpoint' | 'boss';
  title: { en: string; vi: string }; lessonId?: string;
  href: string; prerequisites: string[];
  state: LearningNodeState; mastery: number | null;
  lockReason?: string; optional: boolean;
};
type LearningPath = {
  pathId: string; contentVersion: string; progressVersion: number;
  nodes: LearningNodeView[];
  edges: { id: string; from: string; to: string }[];
  currentNodeId: string | null;
};
type LearningPathViewProps = {
  path: LearningPath; justUnlockedNodeIds: string[];
  onSelectNode: (nodeId: string) => void;
};
type MapUIState = {
  selectedNodeId: string | null; detailsOpen: boolean;
  measuredCenters: Record<string, { x: number; y: number }>;
  consumedUnlockReceiptIds: string[];
};
```

API mới `GET /api/learning/paths/{pathId}`. Server graph version có prerequisites, stable IDs và lesson routes đã kiểm tra. Validate DAG/no cycle/no dangling edge; policy xác định ALL prerequisites hay explicit alternatives, không tự suy từ thứ tự array. Completion evidence từ Q2/G1 hoặc assessment hợp lệ; không đánh dấu complete chỉ vì node được mở. Lock tooltip nêu điều kiện thật; node locked vẫn focus được để đọc, không navigate học phần chưa mở nếu server cấm.

Giữ `/mathmap/[id]` là catalog MRM hiện có. Nếu record có `learningPathId` đã cấu hình, thêm CTA sang learning map hoặc embed view opt-in; không map topic index thành lesson bất kỳ. Unknown map/path trả not-found, không fallback mm001 như tiến độ thật. `TopicList` bỏ completed/current/locked mẫu trong production; preview fixture có label rõ.

Desktop đường đi có nhánh nhưng DOM vẫn là ordered list; SVG decorative aria-hidden. Mobile một trục dọc có edges và node button trong HTML để focus dễ. Đo centers bằng ResizeObserver sau layout, batch theo rAF; chưa đo thì show list trước, không vẽ đường sai. SVG viewBox theo container, edges cubic/orthogonal được tính từ centers, không fixed pixel canvas toàn màn hình.

### Tailwind & visual spec

- Container V-Grid, path surface `relative rounded-panel border border-line bg-surface p-4 sm:p-6 overflow-hidden`.
- Node outer `min-h-14 min-w-14 rounded-2xl border-2`; completed icon check + border olive, current ring brand, locked icon lock + muted text nhưng vẫn đủ contrast; labels dưới hoặc bên cạnh `text-sm font-semibold` maxwidth12rem.
- Path stroke line-strong width3, completed brand/olive theo legend; optional boss dashed path có nhãn “Ôn thử thách”, không ngụ ý bắt buộc.
- Details V-Surface desktop popover/mobile sheet, có lý do lock, mục tiêu, CTA rõ; không mastery percent khi API null.

### Animation spec

- **Unlock path:** `motion.path initial={{pathLength:0,opacity:.3}} animate={{pathLength:1,opacity:1}} transition={{pathLength:{duration:.65,ease:'easeInOut'},opacity:{duration:.2}}}`; exit opacity0 .1s. Chỉ edge trong receipt unlock mới; initial load completed edges pathLength1, không replay toàn map. `layoutId` none.
- **Current node:** outer button/focus ring đứng yên; chỉ icon inner `animate={{y:[0,-4,0]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut'}}`; dừng offscreen/hidden/focus và khi user tắt motion. Không floating nhiều nodes.
- **Node unlock:** variants locked `{opacity:.65,scale:.96}`, available `{opacity:1,scale:1}`; spring `{type:'spring',stiffness:260,damping:24,mass:1}`. Không low-opacity chữ locked gây fail contrast; chỉ áp vào decoration, label riêng.
- Details M-Popover spring320/30 desktop, M-Drawer spring300/34 mobile; `layoutId={`node-surface:${pathId}:${nodeId}`}` chỉ khi dùng shared shell không duplicate hiện cùng lúc; mặc định none nếu không cần morph.
- Reduced: path drawn ngay, icon static, node opacity không scale. Focus không bị kéo theo animation.

### Gate G4

Progress fixture không xuất hiện trong production. Unknown ID, empty path, branch prerequisites, already completed, optional boss, API error đều có state. 50-node fixture đạt trace budget master; mobile keyboard đi đúng reading order. Mỗi edge mới chỉ animate một lần/receipt; refresh không giả lập unlock. Backend kiểm tra quyền/prerequisite, frontend lock không đủ.

## G5 — Daily Quests đúng đơn vị và nguồn sự kiện

### Target Files

Sửa `frontend/src/components/GamificationHUD.js`, `frontend/src/hooks/useGamification.js`, `frontend/src/app/stats/page.js`, `backend/main.py` quest handlers.

Tạo `frontend/src/components/gamification/DailyQuestsPanel.tsx`, `QuestCard.tsx`, `backend/services/learning_quests.py`.

### Props & state schema

```ts
type QuestMetric =
  | { kind: 'count'; current: number; target: number; unit: 'activities' | 'reviews' }
  | { kind: 'accuracy'; correct: number; attempts: number; targetBasisPoints: number; minAttempts: number };
type QuestView = {
  questId: string; policyVersion: string; title: { en: string; vi: string };
  metric: QuestMetric; state: 'active' | 'claimable' | 'claimed' | 'expired';
  rewardXp: number; endsAt: string; claimActionId?: string;
};
type DailyQuestsPanelProps = { quests: QuestView[]; serverNow: string; onClaim: (questId: string) => void };
// UI state: pendingClaimIds:Set<string>, inlineErrorById; confirmed state từ summary.
```

Quest engine consume trusted event IDs, de-duplicate theo quest/event. Count tăng khi action hợp lệ; accuracy tính từ correct/attempts trong scope và cần minAttempts, không `delta=1` cho target phần trăm. Language lookup quest nếu được tạo là engagement riêng, không math mastery; tránh khuyến khích spam mở term.

Proposed `POST /api/learning/quests/{id}/claim` với actionId; server owner/expiry/completion check và ledger transaction. Nếu giữ auto-award thay claim, chọn một policy theo quest version, không vừa auto vừa manual. V1 đề xuất manual claim cho reward quest; streak qualification vẫn tự cập nhật khi học thật. Expiry dùng server time, state không đảo thành active sau refetch cũ.

### Tailwind & visual spec

Panel V-Card, rows `space-y-3`, quest title `text-sm font-semibold`, metric caption rõ “câu đúng / số lần làm” hoặc “hoạt động”. Bar `h-1.5 bg-surface-2`, fill brand. CTA V-Control, claimed check icon + text, expired muted có thời gian. Không badge percent khi denominator0.

### Animation spec

Metric bar scaleX tween.45s easeOut; claimable icon scale .9→1 spring380/32; card M-Fade spring320/30 initial y6/opacity0, animate y0/opacity1, exit opacity0 .1. `layoutId={`quest:${questId}:${policyVersion}`}` trong panel instance có prefix unique. Claim reward toast dùng receipt G3, không animation riêng phát thêm XP. Reduced immediate.

### Gate G5

Client delta/duplicate event không tăng quest. Accuracy đúng unit/minAttempts; repeated claim không thêm ledger entry; expired/claimed server state thắng stale UI. Không auto check-in khi panel mount. Screen reader đọc metric bằng lời có nghĩa.

## G6 — Leaderboard có đơn vị, kỳ và consent rõ

### Target Files

Sửa leaderboard sections trong `TrangChuForm.js`, `frontend/src/components/mrm/MRMLeaderboard.js`, `frontend/src/components/clans/ClanLeaderboard.jsx`, `frontend/src/components/events/TournamentLeaderboard.jsx`; server leaderboard handlers `backend/main.py` và local tournament router khi đổi source.

Tạo `frontend/src/components/gamification/LearningLeaderboardCard.tsx`, `LeaderboardScopeControl.tsx`; learning read model trong `backend/services/learning_summary.py`.

### Props & state schema

```ts
type LeaderboardSnapshot = {
  metric: 'learning-xp' | 'mrm-score' | 'clan-score' | 'tournament-score';
  periodId: string; startsAt: string; endsAt: string; asOf: string;
  scope: 'class' | 'school' | 'global';
  rows: { rank: number; publicId: string; displayName: string; score: number; isSelf: boolean }[];
  selfRank: number | null; cursor: string | null;
};
type LearningLeaderboardCardProps = {
  snapshot: LeaderboardSnapshot | null;
  status: 'loading' | 'ready' | 'empty' | 'error';
  participating: boolean; onScopeChange: (scope: LeaderboardSnapshot['scope']) => void;
};
// UI state: scope, periodId, requestId; abort old request khi filter đổi.
```

Learning leaderboard lấy learning ledger trong kỳ, không lifetime total trộn vào weekly. Tie policy server stable và công bố rõ; rows không tự reorder theo locale. Scope class/school kiểm tra membership server. Hiển thị display name/alias theo setting hiện có, không đưa raw mistake/transcript lên bảng. Opt-out vẫn xem thành tích riêng; không ép chia sẻ để dùng CLIL.

### Tailwind & visual spec

V-Card, title có metric + kỳ + updatedAt; row `grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-3 border-b border-line`; self row `bg-brand-soft rounded-lg` có label “Bạn”. Rank0/unknown không giả làm cuối bảng; empty giải thích chưa đủ dữ liệu. Medal chỉ top positions thật, không fake avatars/peers trên production.

### Animation spec

Initial rows opacity0→1 .12s, stagger tối đa.02×5 rows; no layoutId. Không animate live reorder khi focus trong bảng; update qua nút “Có cập nhật” hoặc khi không tương tác, giữ focus bằng publicId. Score cập nhật trực tiếp, không jackpot counting. Filter pill M-Select spring380/32 ID scoped leaderboard instance. Reduced no stagger.

### Gate G6

Metric/kỳ/scope nhất quán; older filter response không ghi đè; membership/auth checked; không client XP injection. Rows ít/empty/tie/self off-page/pagination đều xử lý. Không trộn coins hoặc tournament bonus vào learning XP.

## G7 — Eureka Combo Counter & XP growth

### Target Files

Sửa `frontend/src/components/DuoMCB/SocraticHintCard.js`, `DuoMCBPage.js`, `frontend/src/hooks/useGamification.js`; dùng grading Q2 và reward service G1.

Tạo `frontend/src/components/gamification/EurekaComboCounter.tsx`, `EurekaCelebration.tsx`, `frontend/src/lib/gamification/eurekaPolicy.ts` (display contract, không authoritative calculation); server policy trong `backend/services/learning_rewards.py`.

### Props & state schema

```ts
type EurekaComboView = {
  count: number; multiplierBasisPoints: number;
  policyVersion: string;
  state: 'inactive' | 'active';
};
type EurekaComboCounterProps = { combo: EurekaComboView; receipt: RewardReceipt | null };
type EurekaCelebrationProps = {
  receiptId: string; awardedXp: number; comboCount: number;
  onComplete: (receiptId: string) => void;
};
// State: activeReceiptId, queuedReceipts, seenReceiptIds. Counter không suy từ local correct boolean.
```

Eligibility theo Q2: first accepted submission correct với evidence đủ scope, chưa cấp content hint/solution. “Tự suy luận” ở đây là rule hoạt động quan sát được; không tuyên bố đo được suy nghĩ nội tâm. Lookup/translation/polisher không làm mất combo. Content hint hoặc incorrect assessed answer kết thúc run; không trừ XP đã kiếm, không thông báo gây xấu hổ. Indeterminate không bị coi là incorrect; giữ run pending tới resolution hoặc kết thúc phiên theo policy.

**Draft policy để implement/configure, chưa phải policy đang dùng:** qualifying run1=1×, run2=1.5×, run≥3=2× cap. Server dùng basis points10000/15000/20000 và floor integer XP; base XP từ activity catalog server, không hard-code ở client. Định nghĩa bonus là awarded minus base, expose receipt để UI diễn giải. Policy mặc định tắt multiplier ngoài pilot tới khi G1/Q2 gate đạt. Khi bật, cap/ngày hoặc reward opportunity chống lặp cùng câu do server; practice replay không nhận lại first-try bonus.

Eureka celebration là microfeedback cục bộ gần answer/XP: icon spark, “Eureka — tự giải ngay lần đầu”, `+N XP` từ receipt và counter. Không toàn màn hình, không autoplay âm thanh, không modal chặn bước tiếp theo. Một receipt chỉ phát một lần kể cả chuyển route/tabs; khi reload chỉ summary, không replay lịch sử hàng loạt.

### Tailwind & visual spec

- Counter `inline-flex items-center gap-2 rounded-full border border-line-strong bg-brand-soft px-3 py-1.5`; number `font-mono tabular-nums text-sm`, label rõ “Chuỗi tự giải”.
- Celebration region `relative max-w-sm rounded-xl border border-line bg-surface p-3`; decorative stars max8, pointer-events-none, không che nội dung toán; announcement text `role="status"` một lần.
- XP bar reuse G3; multiplier color brand kết hợp text, không đủ điều kiện thì hiển thị neutral message “Tiếp tục luyện tập”, không “Thất bại”.

### Animation spec

- Badge variants initial `{opacity:0,scale:.88,y:4}`, animate `{opacity:1,scale:1,y:0}`, exit `{opacity:0,scale:.98}`; spring `{type:'spring',stiffness:420,damping:24,mass:.7}`; exit.12.
- Counter digit keyed receiptId chỉ scale1→1.12→1 .24s easeOut; `layoutId={`eureka-counter:${surfaceId}`}` cho shell, không cùng ID giữa header và answer.
- Particles deterministic preset offsets, animate opacity `[0,1,0]`, x/y tới offset, duration.65–.85s; tạo sau receipt, không random trong render; cleanup after complete. `layoutId` none particles.
- Reduced: không particles/scale, static badge fade.1s và XP immediate. Tab hidden: không chạy celebration, chỉ update summary.

### Gate G7

Test first correct, second correct after wrong, content hint, language lookup, solution issued, unsupported proof, replay, new tab và concurrent hints. Chỉ eligible receipt có Eureka; displayed XP đúng integer server rule. Không mất combo do tra nghĩa từ. Animation không tạo task>50ms trong trace mẫu và không tạo canvas thứ hai.

## G8 — Streak Shield Quick Blitz: 3 câu CLIL / 60 giây

### Target Files

Sửa `frontend/src/components/StreakBar.js`, `frontend/src/components/GamificationHUD.js`, dashboard streak card; `backend/main.py` để route recovery về service canonical.

Tạo `frontend/src/components/gamification/StreakShieldBlitzModal.tsx`, `BlitzQuestion.tsx`, `BlitzResult.tsx`, `frontend/src/hooks/useStreakBlitz.ts`, `backend/services/streak_blitz.py`, `backend/routers/streak_blitz.py`, `backend/content/blitz_sets_v1.json`, `backend/tests/test_streak_blitz.py`.

### Props & state schema

```ts
type BlitzQuestionView = {
  questionId: string; questionVersion: string;
  prompt: { en: string; vi: string };
  options: { id: string; en: string; vi: string }[];
  skillId: string;
};
type BlitzSession = {
  sessionId: string; offerId: string; policyVersion: string;
  mode: 'timed' | 'untimed'; serverNow: string;
  startedAt: string | null; deadlineAt: string | null;
  questions: BlitzQuestionView[];
  acceptedAnswers: { questionId: string; optionId: string }[];
  status: 'prepared' | 'running' | 'completed' | 'expired';
};
type BlitzState = {
  phase: 'intro' | 'preparing' | 'ready' | 'running' | 'submitting' | 'result' | 'error';
  session: BlitzSession | null; activeQuestionIndex: number;
  selectedOptionId: string | null; result: { rescued: boolean; reasonCode: string; receiptId?: string } | null;
};
type StreakShieldBlitzModalProps = { offerId: string; open: boolean; onClose: () => void; onResolved: () => void };
```

API mới đề xuất: `POST /api/streak/blitz/prepare`, `/start`, `/answer`, `/finish`; mỗi command có session/offer ID, actionId, auth owner. Server content bank có answer key/rubric riêng, không gửi key ra view. Content file reviewed conceptual CLIL, không generate đáp án lúc timer đang chạy. 3 câu có skill phù hợp, không lặp cùng item để học thuộc vị trí đáp án.

**Draft recovery policy:** offer chỉ cho một ngày liền trước bị thiếu đủ điều kiện khôi phục, previous streak có thật, chưa dùng freeze/rescue cho ngày đó. Một rescue cho cùng user/local-date; unique constraint bảo vệ. Không revive khoảng thiếu nhiều ngày bằng một Blitz. Điều kiện cụ thể được version trong G1; flag `streakBlitz=false` trước khi nội dung/policy được duyệt.

Flow:

1. Intro giải thích 3 câu/60s, ngày đang khôi phục, điều kiện đạt và lựa chọn **Không giới hạn thời gian, cùng quyền khôi phục**. Không tự mở modal lúc học viên đang giải bài.
2. Prepare tải đủ3 câu trước timer; start explicit sau khi đã ready, server cấp startedAt/deadlineAt. Nếu mạng chậm thì chưa chạy ở màn hình tải. Không tin client timestamp.
3. Timed mode đếm remaining từ server clock offset + monotonic elapsed, re-sync khi visibility/reconnect; server quyết định deadline. Untimed không deadline và không cần khai báo khuyết tật.
4. Mỗi câu chọn rồi submit một lần, server chấm; trong timed run chỉ báo đã ghi nhận để không dùng feedback làm lộ đáp án cho lần thử lại. Hết3 câu/finish server tính kết quả; draft policy đạt khi cả3 đúng. Sai thì xem giải thích sau kết thúc, practice tiếp không tự tạo offer/reward mới.
5. Thành công ghi rescue + daily state + receipt trong một transaction; không cộng thêm XP cạnh tranh cho tốc độ. Existing freeze và Blitz rescue không cùng tiêu cho một ngày.
6. Mất mạng: giữ session và selection, retry cùng actionId; không âm thầm đánh dấu sai. Server đã nhận trước deadline vẫn được tính dù response tới muộn. Nếu chưa nhận do lỗi mạng, trả trạng thái minh bạch và cho đường recovery untimed cùng offer theo policy, không tự thưởng từ client. Session/offer unique bảo đảm không nhân đôi quyền.

Thoát/reload/resume trả cùng session và deadline, không reset60s; đổi timed→untimed không cấp offer mới và không tạo ranking advantage vì không có speed reward. Không “hạ giá” XP/shield của đường accessible. Timing choice theo [WCAG timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable).

### Tailwind & visual spec

- Dialog V-Surface `w-[min(36rem,calc(100vw-2rem))] max-h-[90dvh] overflow-y-auto p-5 sm:p-6`, mobile safe-area; focus trap, labelled title, return focus CTA.
- Header “Cứu chuỗi học” + progress “Câu1/3”; timer `font-mono text-lg tabular-nums`, dưới15s thêm icon/text, không chỉ đổi đỏ. Prompt EN + VI theo CLIL mode, hỗ trợ ngôn ngữ luôn có trước/ trong run theo policy công bố.
- Option V-Control full width, minheight48, textleft; submit pinned trong dialog footer không che keyboard. Result giải thích từng câu và ngày đã khôi phục, không confetti full-screen.

### Animation spec

- Modal initial `{opacity:0,scale:.96,y:12}`, animate `{opacity:1,scale:1,y:0}`, exit `{opacity:0,scale:.98,y:6}`, spring320/30; backdrop opacity .15; `layoutId` none.
- Question transition opacity0→1 .12s, no slide timer race; stable shell height, input keys question ID. Timer text static mỗi giây, không pulse/shake liên tục; aria-live chỉ mốc thời gian hữu ích, không đọc từng giây.
- Success shield scale.9→1 spring380/26, one-shot; `layoutId={`shield:${offerId}`}` nếu shared icon giữa result/card, mặc định none. Reduced fade.1, no scale.

### Gate G8

3 reviewed bilingual questions, correct answer không lộ qua payload; server deadline và timezone đúng; concurrent start/finish/replay không double rescue. Refresh không reset timer; request trước deadline được xử lý công bằng; untimed cùng outcome. Error không tự trừ shield/streak. Keyboard/screen reader hoàn thành toàn flow, no timer-dependent inaccessible route.

## G9 — Mistake Vault / Boss Node trên FSRS hiện có

### Target Files

Sửa `frontend/src/app/relearn/page.js`, `backend/fsrs_scheduler.py` nếu cần evidence-aware integration, relearn handlers trong `backend/main.py`, `frontend/src/components/mathmap/TopicList.jsx` hoặc LearningPathView G4 để link boss optional.

Tạo `frontend/src/components/relearn/MistakeVaultList.tsx`, `MistakeEvidenceCard.tsx`, `BossChallengePanel.tsx`, `frontend/src/types/mistakeVault.ts`, `backend/services/mistake_vault.py`, `backend/services/boss_challenges.py`, `backend/tests/test_mistake_vault.py`. Mở rộng `backend/test_relearn_flow.py`, không bỏ suite FSRS hiện có.

### Props & state schema

```ts
type MistakeEvidence = {
  evidenceId: string; assessmentId: string; stepId: string; skillId: string;
  kind: 'verified-incorrect' | 'learner-requested-review' | 'repeated-difficulty';
  misconceptionCode: string | null; observedAt: string;
};
type VaultItem = {
  cardId: string; skillId: string; title: { en: string; vi: string };
  evidence: MistakeEvidence[]; dueAt: string | null;
  reviewState: 'due' | 'scheduled' | 'needs-review';
  source: 'assessment' | 'socratic' | 'manual';
};
type BossChallengeView = {
  challengeId: string; contentVersion: string; skillIds: string[];
  questionIds: string[]; state: 'available' | 'in-progress' | 'completed';
  rewardOpportunityId: string | null; optional: true;
};
type MistakeVaultListProps = { items: VaultItem[]; filter: 'due' | 'upcoming' | 'all'; onReview: (cardId: string) => void };
type BossChallengePanelProps = { challenge: BossChallengeView; onStart: () => void; onSkip: () => void };
// UI state: selectedCardId, filter, activeChallengeId; progress từ server, không local mastery boolean.
```

Giữ `cardId` FSRS hiện có; join evidence table theo card/skill, không tạo bộ scheduler thứ hai. `incorrect` phải từ assessment đáng tin; `indeterminate` vào needs-review, không gắn sai cho học viên. Hint/translation đơn lẻ không phải lỗi. Draft `repeated-difficulty`: ít nhất2 assessed incorrect trên cùng skill ở các opportunity hợp lệ khác nhau, hoặc học viên chủ động yêu cầu ôn; threshold versioned, deduplicate retry. Không suy “yếu toán” từ dùng tiếng Việt hoặc thời gian đọc dài.

Boss là bài ôn tự nguyện tổng hợp1–3 skill thường khó, lấy reviewed bank với problem variant mới và đúng lớp. Nó không khóa bài tiếp theo hoặc tạo áp lực “đánh bại lỗi của bạn”. Trong UI dùng “Thử thách ôn tập”, giải thích “Tập trung vào các bước bạn muốn luyện thêm”. Nếu chưa đủ bank/rubric, không generate boss có thưởng theo ý model; show guided review.

API mới đề xuất `GET /api/relearn/vault`, `POST /api/relearn/boss/prepare`, `/attempts`; cùng action/evidence contracts Q2/G1. Existing `/api/relearn/due` và `/api/relearn/review` giữ compatibility. Self rating again/hard/good/easy vẫn là báo cáo độ khó của học viên, không tự convert thành objective correctness/mastery. Sau boss đúng, update evidence và schedule theo policy FSRS được version, tránh vừa submit vừa tự rating gây double review. Lịch sử lỗi không bị xóa; UI chuyển “Đã luyện lại” có ngày/evidence.

Reward chống farm: cùng logical opportunity chỉ được grant một lần, boss repetition chỉ practice hoặc spaced-review opportunity server mới cấp sau due. Không thêm sai cố ý rồi tạo boss để nhận vô hạn XP. Không replay raw transcript trong dashboard/teacher public summary; vault riêng của học viên theo quyền.

### Tailwind & visual spec

- Relearn page V-Grid; filters V-Control, cards V-Card `space-y-3`, skill label `text-sm font-semibold`, evidence caption “Cần luyện lại bước…” trung tính. Không màu đỏ phủ mọi card.
- Boss card `rounded-panel border border-line-strong bg-surface p-5`, accent olive/brand soft, icon riêng; optional label `text-xs text-muted`, primary “Luyện3 câu” theo số thật, secondary “Để sau”.
- Map boss node dashed border + optional caption, no skull/punitive lock. Due badge có ngày, unknown evidence có “Cần xem lại”, không misleading accuracy percent.

### Animation spec

- Vault cards M-Fade spring320/30 y6→0, exit opacity0 .1s; list `layout="position"` chỉ khi user filter, không reorder khi đang gõ; `layoutId={`vault:${scopeId}:${cardId}`}`.
- Boss ready icon scale.97→1 spring260/24 một lần khi available; không infinite glow. Panel M-Drawer spring300/34 nếu mobile, inline desktop opacity.12s; layoutId none cho panel.
- Completion check opacity0→1/scale.9→1 spring380/26; XP chỉ receipt G3. Reduced static/fade.1, no list movement.

### Gate G9

Existing FSRS due/review tests không regression; đúng card IDs và schedule; duplicate evidence không tạo nhiều card. Language assist không tạo mistake; indeterminate không thành incorrect. Boss optional, không chặn progression; reviewed content đúng skill; replay không farm rewards. Test self-rating và objective result tách biệt, migration giữ lịch sử.

## B10. Checklist thực thi và rollback

Mỗi G-slice có report riêng theo master: screenshots, fixture/version, API tests, auth/isolation, race/idempotency, metrics trước/sau và feature flag. Frontend tests proposed: `frontend/e2e/learning-dashboard.spec.ts`, `learning-map.spec.ts`, `streak-blitz.spec.ts`; runner/config phải được thêm có chủ đích vì package hiện tại chưa khai báo frontend test script.

Rollback UI qua flags và canonical read API; không xóa ledger hay lấy lại phần thưởng đã hợp lệ chỉ vì animation lỗi. Tắt reward writes cho policy bị lỗi, giữ receipt/audit để reconcile; server vẫn trả confirmed balances. Migration phải có dry-run và reconciliation report trước write. Không tự khôi phục client-authoritative correctness/cost/delta để “chạy nhanh”.

Chỉ sau khi G1/Q2 và gate của từng micro-feature đạt mới bật trong tài khoản pilot; sau đó mở cohort có giới hạn, theo dõi mismatch/duplicate/grading error và latency. Không dùng tỷ lệ engagement tăng để bỏ qua false grading hoặc mất dữ liệu học viên.
