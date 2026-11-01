# BINGMATH — Implementation plan giao Antigravity

Ngày audit: **30/10/2026**. Vai trò: Lead UX Architect & Technical Planner. Phạm vi bàn giao này là **đặc tả**, chưa triển khai code ứng dụng, chưa xác nhận chất lượng bằng chạy thử giao diện.

## 1. Đọc và thực thi theo thứ tự

| Tài liệu | Nội dung và vai trò |
| --- | --- |
| [Tài liệu này](IMPLEMENTATION_MASTER_PLAN.md) | Audit toàn web, kiến trúc chung, thứ tự, performance gate và quy tắc thực thi |
| [SPEC_CLIL_LEARNING.md](SPEC_CLIL_LEARNING.md) | Phần A: bài học mẫu, ba chế độ, term popover, X-Ray, glossary, answer polisher |
| [SPEC_BINGMCB_QUALITY.md](SPEC_BINGMCB_QUALITY.md) | Tính đúng, kiểm chứng, Socratic grading, hợp đồng sự kiện làm điều kiện cho phần thưởng |
| [SPEC_GAMIFICATION_MAP.md](SPEC_GAMIFICATION_MAP.md) | Phần B: dữ liệu tiến độ, dashboard, learning map, quests, leaderboard, Eureka, Shield, Mistake Vault |
| [HANDOFF_NEXT_PHASE.md](HANDOFF_NEXT_PHASE.md) | Audit Phase A trước đó và thiết kế B1 liên kết điểm hình học; giữ làm tài liệu chi tiết cho TutorWorkspace |

**Lát cắt thực thi đầu tiên: P0 → Q1-min → C1 trên `/L6-C1-L1`.** Không chuyển hàng loạt các bài học, không xây toàn bộ dashboard và map cùng một lượt. B1 trong tài liệu cũ là point-reference linking, không phải Phần B Gamification; dùng mã C/G/Q bên dưới để tránh nhầm. B1 vẫn có giá trị nhưng không còn là việc mặc định cần làm đầu tiên trong yêu cầu mới.

Các số đo dưới đây là **ngưỡng nghiệm thu đề xuất**, không phải kết quả đã đo. Tham số XP, lịch học và nội dung song ngữ có nhãn `proposed` cho tới khi được chốt trong cấu hình có version. Có thể dựng preview với fixture ghi rõ “Dữ liệu minh họa”; không đưa fixture vào tài khoản thật.

## 2. Baseline và điều kiện tích hợp P0

- Repo thực nằm ở thư mục con `duosteam/`; mọi đường dẫn code trong bộ spec tính từ repo này.
- Local `main`: `1661cd0499bbed61868519d2a6597392f077c7da`; fetched `origin/main`: `f9081d8d6f0190e52cc910baae5b3d4e642e8917`. Phase A đã merge vào fetched main; checkout hiện tại vẫn có nhiều thay đổi chưa commit.
- Lần fast-forward trước bị chặn bởi thay đổi `DuoMCBPage.js`; không được giả định checkout đã có Phase A. Không reset, clean, ghi đè hoặc tự stash công việc của người dùng.
- Audit CLIL/gamification lần này đọc **working tree hiện có**, kể cả phần local chưa tracked; audit TutorWorkspace trước đó đọc **fetched main**. Đây là hai nguồn có trạng thái khác nhau.
- `frontend/src/components/tutor/TutorWorkspace.tsx`, `useTutorWorkspace.ts`, `MathCanvasHost.tsx` có trong fetched Phase A nhưng chưa hiện diện ở checkout đã audit. Các file mới trong spec phải được so với baseline sau tích hợp để tránh tạo trùng.
- Antigravity tạo branch/checkout làm việc riêng từ baseline đã xác định, lưu manifest các thay đổi cần giữ rồi hợp nhất có kiểm soát. Nếu không thể xác định cách giữ một thay đổi có ý nghĩa, báo xung đột cụ thể và tiếp tục phần độc lập; không coi merge thành công chỉ vì app khởi động được.
- Ghi `git status`, SHA, package lock, các lỗi build/lint sẵn có, kích thước bundle và ảnh chụp desktop/mobile trước khi sửa. Không sửa hàng loạt lỗi unrelated để “làm xanh” baseline.
- Backend test phải dùng SQLite tạm. `backend/db/connection.py` có hỗ trợ biến môi trường nhưng `main.get_db()` còn truyền `main.DB_PATH`; chỉ đặt `DUOMATH_DB_PATH` chưa chứng minh đã cách ly. Inject/override đường dẫn trước `init_db`, xác nhận mọi router dùng cùng test connection; không chạy suite ghi dữ liệu lên `backend/duomath.db`.

P0 đạt khi có baseline thống nhất, không mất local work, các route mẫu hoạt động, có số đo trước thay đổi, và mọi test ghi DB chứng minh đang dùng thư mục tạm. P0 không bắt buộc phải commit/push thay người dùng.

## 3. Audit toàn web: hiện trạng và tác động

Đây là audit source và cấu trúc route, không phải kiểm thử trực quan tất cả trang. “Có” nghĩa là tìm thấy implementation; không đồng nghĩa dữ liệu/runtime đã được xác minh.

| Section | Target Files hiện có | Hiện trạng / việc cần xử lý | Slice |
| --- | --- | --- | --- |
| Layout, ngôn ngữ, theme | `frontend/src/components/LayoutClient.js`; `frontend/src/context/LanguageContext.js`; `frontend/src/app/globals.css` | Ngôn ngữ UI toàn cục vi/en; lesson lại có state riêng; translator tự gắn vào lesson. Giữ UI locale tách learning mode, tránh overlay/shortcut tranh nhau | C1–C3 |
| Theory và câu hỏi lớp 6–12 | `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js`; `frontend/src/components/thcs/Cacbaitoan6/L6_C1_L1.js`; `frontend/src/components/thpt/Cacbaitoan10/Lesson1_MenhDe.js`; `Lesson2_TapHop.js` cùng thư mục | `t(vi,en)` thường resolve ngay khi tạo question; chưa có parallel segment model. Engine có state quiz, hint và local lang riêng. Không remount quiz khi đổi mode | C1 |
| Danh mục bài học | `frontend/src/components/Cacbaitoan/cacbaitoan.js`; `frontend/src/components/cacbailam/lessons.js`; `frontend/src/data/lessonsData.js` | Cần metadata CLIL coverage và đường tiếp tục học; không hiển thị nhãn “song ngữ đầy đủ” nếu thiếu bản EN | Sau C2 |
| Dịch và hội thoại song ngữ | `frontend/src/components/DuoMCB/DuoTranslate.js`; `frontend/src/app/DuoTranslate/page.js`; `frontend/src/components/chat/StreamdownMessage.jsx`; `frontend/src/lib/api.js` | Có dịch vùng chọn, panel hai ngôn ngữ, thuật ngữ, TTS và lý thuyết. Chưa có glossary theo phiên, chưa thấy guard chống response cũ ghi đè; selection listener ở document | C2–C4 |
| BingMCB / MathViz | `frontend/src/components/DuoMCB/DuoMCBPage.js`; bộ `components/tutor/*` trên fetched main; `backend/math_solver.py`; `backend/math_reader.py`; `backend/mathviz_contract.py` | Giữ workspace/canvas Phase A. Verification, OCR và minh chứng theo claim cần rõ; nội dung dịch không phải bằng chứng Socratic | Q1–Q3 |
| Home / Dashboard | `frontend/src/components/trangchu/TrangChuForm.js`; `frontend/src/app/page.js`; `frontend/src/app/Trangchu/page.js`; `frontend/src/app/dashboard/page.js` | Cả ba route cùng render TrangChuForm. Tách dashboard học viên ở `/dashboard`; homepage giữ chức năng giới thiệu và điều hướng | G2 |
| Stats, XP, Streak | `frontend/src/app/stats/page.js`; `frontend/src/components/StreakBar.js`; `frontend/src/components/GamificationHUD.js`; `frontend/src/hooks/useGamification.js`; `frontend/src/components/ui/XPBar.jsx` | Có nhiều bảng ngưỡng level khác nhau, cache streak chưa scope user, HUD check-in khi mount; chưa có receipt chống thưởng lặp | G1, G3 |
| Learning Map / nội dung map | `frontend/src/app/mathmap/[id]/page.js`; `frontend/src/components/mathmap/TopicList.jsx`; `MathMapHero.jsx`, `LearningObjectives.jsx` cùng thư mục; `frontend/src/context/MathMapStore.js` | Có catalog MRM, fallback tiến độ/unlock mẫu, chưa có graph prerequisite authoritative hoặc SVG unlock. Không dùng index topic/demo để suy ra mastery | G4 |
| Quests | `frontend/src/components/GamificationHUD.js`; `frontend/src/hooks/useGamification.js`; `backend/main.py` | Có API today/progress nhưng client gửi delta; accuracy percent và delta bị lẫn đơn vị. Phải chuyển sang event evaluation server | G1, G5 |
| Leaderboard | `frontend/src/components/trangchu/TrangChuForm.js`; `frontend/src/components/mrm/MRMLeaderboard.js`; `frontend/src/components/clans/ClanLeaderboard.jsx`; `frontend/src/components/events/TournamentLeaderboard.jsx` | Leaderboard học tập, game, clan và giải đấu có đơn vị/kỳ khác nhau. Không gom điểm thành một bảng xếp hạng | G6 |
| Ôn lỗi / FSRS | `frontend/src/app/relearn/page.js`; `backend/fsrs_scheduler.py`; các handler relearn trong `backend/main.py` | Đã có due cards, heatmap, self rating. Mở rộng thành Mistake Vault; chưa có event stuck theo bước Socratic | G9 |
| Kiểm tra và kết quả | `frontend/src/components/bailam/thcs/UniversalTHCSTestEngine.js`; `frontend/src/data/thcsTestsData.js`; `frontend/src/data/grade12Tests.js`; `frontend/src/components/result/pageketqua.js`; `frontend/src/app/baiflamform.js` | Một số dữ liệu là reading tiếng Anh, không phải toàn bộ toán song ngữ. Không tự động dịch answer key; giữ question/attempt ID khi đổi presentation | C5, Q2 |
| AI tạo/chấm đề, ngân hàng đề | `frontend/src/app/aithi/page.js`; `frontend/src/app/nganhangde/page.js`; `backend/retrieval_context.py`; `backend/math_problem_retrieval.py` | Cần provenance/version/rubric; lời giải sinh ra chưa mặc nhiên được kiểm chứng. Không dùng nội dung chưa duyệt cho Blitz có thưởng | Q1–Q3 |
| Khám phá và tài liệu | `frontend/src/app/khampha/page.js`; `frontend/src/app/tailieu/page.js` | Bảo toàn lazy loading của công cụ đồ thị, nguồn tài liệu và khả năng điều khiển bằng bàn phím; không mở canvas nặng trong term popover | C5 |
| MRM, clans, events | `frontend/src/components/mrm/`; `frontend/src/components/clans/`; `frontend/src/components/events/`; `backend/routers/social_tournaments.py` (local) | Giữ game coins riêng learning XP; kiểm tra nguồn điểm đầu vào ở router trước khi dùng chung rewards | G1, G6 |
| Teacher / lớp học | `frontend/src/components/teacher/TeacherDashboard.js`; `frontend/src/components/student/StudentClassroomsView.js`; `backend/routers/teacher_classes.py` (local) | Giữ local work và quyền teacher/student; chỉ đưa summary đã xác thực, không công khai transcript học sinh trong leaderboard | Sau G1 |
| Auth, admin, offline, privacy | Các route hiện hữu dưới `frontend/src/app/`; `LayoutClient.js`; API auth đang dùng | Clear cache theo user khi logout, guest local progress ghi rõ chưa đồng bộ; offline không tự mint reward; admin flags không thay thế auth server | Xuyên suốt |

### Các rủi ro đã thấy trong source, phải có task riêng

1. `/api/translate` hiện tăng `daily_progress.socratic_count` cho người đăng nhập. Dịch không chứng minh đã tự giải một bước; bỏ side effect này và không dùng dữ liệu lịch sử đó để cộng Eureka.
2. `verify_and_repair()` trong `backend/math_solver.py` có nhánh `mode == "off"` trả `verified=True`. Đồng thời “không có check fail” chưa đủ chứng minh toàn bộ đáp án đúng. Q1 sửa trước khi quảng bá nhãn kiểm chứng.
3. XP có ít nhất nguồn tính từ `test_results`, `user_gamification.total_xp` và `users.xp`. `_add_xp()` commit nội bộ; khó bảo đảm atomic với quest/streak. Phải thống nhất read model và transaction boundary trước animation phần thưởng.
4. `/api/quiz/attempt` nhận `is_correct` từ client; quest nhận `delta`; buy-freeze nhận `cost`. Đó chưa phải nguồn đáng tin cho phần thưởng có tính cạnh tranh.
5. Lesson lớp 6 mẫu có lựa chọn còn tiếng Việt trong nhánh EN và câu điền chấp nhận alias rất rộng. Kiểm định nội dung/answer policy theo question version, không thay tính đúng toán học chỉ vì chuẩn hóa tiếng Anh.
6. Tiến độ fallback trong MathMap không phải tiến độ thực. Khi API chưa sẵn sàng, dùng empty/error state có nhãn, không dùng số mặc định như thành tích học viên.

## 4. Hợp đồng xuyên section

### Nguồn dữ liệu và quyền sở hữu

| Dữ liệu | Chủ sở hữu | Quy tắc |
| --- | --- | --- |
| UI locale `vi/en` | `LanguageContext` hiện tại | Điều hướng, button, thông báo |
| CLIL mode và glossary phiên | `LearningExperienceProvider` mới | Bài học/chat được opt-in; không sửa locale toàn app |
| Bản dịch / term đã duyệt | Lesson content version + term catalog | Stable IDs, provenance, missing state; không ghép hai đoạn khác question version |
| Transcript / active reply / scene | Workspace controller Phase A | Một canvas; không parse lại toàn bộ transcript khi mở term |
| Grading | Server rubric + deterministic verifier khi hỗ trợ | UI không được tự tuyên bố câu trả lời đúng để nhận thưởng |
| XP / streak / quest / map progress | Server learning event + reward ledger | Receipt duy nhất theo action; read model có version, server time |
| MRM coins / tournament scores | Domain hiện có | Tách namespace, đơn vị và chính sách; không tự convert sang XP |

Proposed shared schema, thêm ở `frontend/src/types/learning.ts`, đồng bộ hợp đồng backend tương ứng:

```ts
type LearningMode = 'immersion' | 'assisted' | 'parallel';
type AsyncState<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; data: T; receivedAt: string }
  | { status: 'error'; code: string; retryable: boolean };
type LearningContext = {
  sessionId: string; lessonId: string; contentVersion: string;
  learnerScope: string; // user opaque ID hoặc guest ID, không email
};
type FeatureFlags = {
  clilPilot: boolean; clilPolisher: boolean;
  verifiedSocraticSteps: boolean; rewardLedger: boolean;
  learningPath: boolean; streakBlitz: boolean; bossChallenge: boolean;
};
```

Flags là deployment configuration được server kiểm tra cho action có thưởng. Tắt UI flag không được xóa dữ liệu đã lưu. API mới bên dưới là **đề xuất**, không phải endpoint đã tồn tại.

### Design tokens và Tailwind dùng chung

Giữ theme BINGMATH hiện có: tối ấm + paper. Không tạo hệ màu neon song song.

| Vai trò | Token hiện có / class | Giá trị theme tối / paper |
| --- | --- | --- |
| Nền | `bg-canvas` / `--bg` | `#141413` / `#f5f4ed` |
| Surface | `bg-surface`, `bg-surface-2` | `#1c1c1a`, `#30302e` / `#faf9f5`, `#e8e6dc` |
| Text | `text-ink`, `text-muted`, `text-subtle` | `#faf9f5`, `#b0aea5`, `#87867f` / text `#141413`, muted `#5e5d59` |
| Border | `border-line`, `border-line-strong` | `#3a3a37`, `#4d4c48` / `#e6e4da`, `#d1cfc5` |
| Brand | `bg-brand`, `text-brand`, `bg-brand-soft` | accent `#d97757` / `#c96442` |
| Tích cực / lỗi | `text-olive`, `text-danger` + icon/text | olive `#7f8f6f` / `#5f7355`; danger hiện có `#b53333` |
| Focus | outline `var(--focus)` | `#3898ec`; kiểm tra tương phản trên từng surface |

Màu token đang có không tự bảo đảm mọi cặp text/background đạt WCAG. Test text thường ≥4.5:1; large text/UI boundary ≥3:1; lỗi/xác nhận luôn có nhãn chữ. Không dùng màu brand trên brand-soft cho chữ nhỏ nếu chưa đo.

Các preset visual (mỗi spec tham chiếu rồi bổ sung khác biệt):

- **V-Surface:** `rounded-panel border border-line bg-surface p-4 sm:p-6`; desktop có thể `background: var(--surface-glass); backdrop-filter: blur(12px)`, fallback solid `bg-surface`. Chỉ một lớp blur ở popover/drawer, không blur cả viewport khi đang học.
- **V-Card:** dùng `GlassCard.jsx` hiện có; `rounded-card border border-line p-4`; glow `0 0 28px rgba(217,119,87,.08)` cho card chính, không tất cả card; paper shadow `0 6px 24px rgba(20,20,19,.05)`.
- **V-Type:** `font-ui text-base leading-7 text-ink`, caption `text-xs leading-5 text-muted`, label `text-sm font-semibold`; title `font-display text-2xl sm:text-3xl`. Công thức dùng KaTeX có MathML, không ép font-ui lên subtree toán.
- **V-Control:** `min-h-11 min-w-11 rounded-xl px-3 py-2 text-sm`; `focus-visible:outline-2 focus-visible:outline-offset-2` màu focus; disabled có `aria-disabled` và lý do. Button chính text/background phải được đo tương phản.
- **V-Grid:** container `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`; `grid gap-4 lg:gap-6`; nội dung `min-w-0`. Không fixed width 420px trên màn hình hẹp.

### Motion cụ thể, tái sử dụng

Tạo `frontend/src/lib/learningMotion.ts`; import từ `framer-motion` đang cài, không thêm animation library. Đây là thông số đề xuất:

```ts
export const springControl = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 } as const;
export const springSurface = { type: 'spring', stiffness: 320, damping: 30, mass: 0.85 } as const;
export const springDrawer = { type: 'spring', stiffness: 300, damping: 34, mass: 1 } as const;
export const fadeBlock = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -3 },
};
export const popover = {
  initial: { opacity: 0, scale: 0.96, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 2 },
};
```

- **M-Fade:** `variants={fadeBlock} initial="initial" animate="animate" exit="exit"`; enter springSurface, opacity tween .12s, exit tween .1s. `layoutId` không dùng nếu không có shared element thực.
- **M-Popover:** preset popover, springSurface; exit .1s. `layoutId` chỉ nền popover `term-card:${useId()}`; không gán một ID chung cho tất cả term triggers.
- **M-Select:** shared pill `layoutId={`mode-pill:${useId()}`}`, `layout` position, springControl; panel text opacity .12s. Không key/remount cả bài theo mode.
- **M-Drawer:** desktop x `"100%"→0→"100%"`; mobile y `"100%"→0→"100%"`; springDrawer; backdrop opacity `0→1→0`, tween .15s; layoutId none.
- **M-Reduced:** `useReducedMotion()` + preference trong app. Bỏ translate/scale/path drawing/floating/confetti, tween opacity ≤.1s hoặc duration0; không animate layout/XP counting. Hủy loop khi tab hidden/offscreen. Ghi rõ `layoutId` vẫn scoped nhưng `layout` disabled trong reduced mode.

Không animate `filter`/blur/box-shadow theo frame. Không `Math.random()` trong render để tạo particles. Dùng `AnimatePresence` chỉ nơi có exit thật; không wait toàn trang khiến mất focus hoặc reset câu trả lời.

## 5. Roadmap có gate, không làm dàn trải

| Thứ tự | Deliverable độc lập | Gate bắt buộc trước khi tiếp tục |
| --- | --- | --- |
| **P0** | Baseline Phase A/local work được thống nhất; flags, measurements, DB test isolation | Không mất diff; app route mẫu ổn định; baseline report có SHA |
| **Q1-min** | Sửa trạng thái verification khi off/không có bằng chứng; bỏ translate→socratic side effect | Tests chứng minh không có false verified trong các ca off/empty/no evidence; dịch không làm quest/Eureka tăng |
| **C1** | CLIL schema + ba mode + term popover trong một bài `/L6-C1-L1` | 100% nội dung visible của pilot có cặp EN/VI được review; quiz state giữ nguyên; keyboard/mobile; không lỗi toán mới |
| **C2 + C4 core** | X-Ray + glossary trên cùng pilot; translator guard | Hoạt động hold/release/blur, glossary không duplicate, request cũ không thay result mới; không network khi lookup term đã duyệt. Chat integration của C4 đợi Q2 |
| **C3** | Answer Polisher ở pilot và composer opt-in | Không thay math spans/correctness; apply/undo/stale draft/IME đạt; feedback chỉ về ngôn ngữ |
| **Q2–Q3** | Typed Socratic grading/events + OCR/retrieval/geometry quality gates | Có server evidence first attempt/no content hint; replay/race tests đạt; benchmark đúng scope |
| **G1–G2** | Ledger + summary API + dashboard Bento | Server totals thống nhất, retry không thưởng đôi; dashboard empty/error/guest và layout đạt |
| **G3–G6** | XP/streak, map path, quest và leaderboard projection | Không tiến độ giả; prerequisite version/cycle tests; metrics theo đúng đơn vị/kỳ |
| **G7** | Eureka Combo | Chỉ receipt đủ điều kiện gây animation/XP; lookup ngôn ngữ không làm mất combo |
| **G8** | Streak Shield Blitz | Server clock, attempt limits, atomic rescue, lựa chọn thời gian tiếp cận được; không mất streak do lỗi mạng |
| **G9** | Mistake Vault/Boss mở rộng FSRS | Phân biệt sai toán/chưa đủ bằng chứng/hỗ trợ ngôn ngữ; không tạo vòng lặp farm XP |
| **C5 / rollout** | Mở rộng lớp 6 rồi thêm một bài THPT; các section còn lại | Từng content batch pass gates, không bật toàn trường chỉ bằng feature flag |

Nếu một gate fail, sửa và đo lại **slice đó**. Không che failure bằng animation/loading giả hoặc chuyển qua feature dễ hơn. Không đòi “độ chính xác toàn chatbot 100%”; gate dựa trên tập ca có version, coverage và mức độ nghiêm trọng.

### Performance và accessibility gate chung

Đo cùng commit/content/account fixture, cold/warm cache tách biệt, viewport 390×844 và 1440×900; thêm 320px để kiểm tra overflow. Dùng cấu hình CPU/network cố định ghi trong báo cáo, tối thiểu 5 lab runs; RUM p75 cần đủ mẫu thật, không suy ra từ 5 runs.

| Chỉ tiêu | Ngưỡng đề xuất |
| --- | --- |
| Core Web Vitals | Field p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; lab chỉ là proxy. Đây là mốc của [Web Vitals](https://web.dev/articles/vitals), không phải kết quả BINGMATH |
| Phản hồi CLIL local | p95 từ click đến frame phản hồi đầu ≤100ms trong 30 lần chuyển; không chờ API; transition text hoàn tất ≤200ms |
| Bundle pilot | Initial route JS gzip tăng ≤30KB so baseline; lazy drawer/polisher, không thêm canvas/chart library cho term |
| Reward UX | Nhận receipt → feedback đầu ≤100ms; animation không trì hoãn cập nhật aria/value. Latency server đo riêng, không bịa progress |
| Map | Benchmark fixture 50 nodes; không render/tạo animation toàn bộ offscreen; không task >50ms do thao tác unlock trong trace mẫu |
| Memory/lifecycle | 20 lần mode switch + open/close không tăng listener/timer/subscription sống; tutor chỉ một renderer scene theo invariant Phase A |
| Accessibility | Keyboard-only hoàn tất lesson/Blitz; focus restore; reduced motion; screen reader đọc một ngôn ngữ chính không lặp; không lỗi serious/critical trong kiểm tra tự động và manual flows |
| Toán và scoring | 0 regression nghiêm trọng trong pilot; lookup/polish không thay answer value, attempts, hint count hoặc score |

Với popover, phải đóng được, rê chuột vào được và giữ khi đang tương tác theo [WCAG hover/focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus). Timer có lựa chọn phù hợp theo [WCAG timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable); chi tiết G8.

## 6. Rà soát các section ngoài pilot

Mỗi dòng là contract cho đợt sau, không yêu cầu rewrite ngay. Paths ở bảng audit là existing; file mới dưới đây là proposed. Motion kế thừa preset đã định nghĩa, nên không cần một animation engine riêng cho mỗi route.

| Section / Target mới | Props & state tối thiểu | Visual & motion | Gate riêng |
| --- | --- | --- | --- |
| Catalog; `components/learning/LessonCoverageBadge.tsx` | `{lessonId, coverage:'reviewed'|'partial'|'legacy', resumeUrl?}`; no local score | V-Card/V-Type; badge static (`initial=false`, `animate={}`, no exit/layoutId); hover card y:-2 springControl, reduced0 | Nhãn coverage lấy manifest, không suy từ tên file |
| Exams/results; `components/learning/AssessmentLanguageControl.tsx` | `{assessmentId, policy:'fixed'|'clil', mode, onModeChange, locked}`; question IDs invariant | V-Control, M-Select; no shared IDs với lesson | Assessment policy server quyết định có được dịch/hint; không lộ answer key |
| AI bank/aithi; `components/learning/ContentProvenance.tsx` | `{sourceLabel, contentVersion, reviewState, verificationState}`; disclosureOpen | V-Surface; M-Fade .12s; layoutId none | “Nguồn truy xuất” và “đúng toán” tách nhãn, dẫn nguồn thực |
| Explore/tailieu; `components/learning/ResourceLearningLinks.tsx` | `{resourceId, relatedLessonIds, glossaryTermIds}`; activeLink | V-Card; M-Fade, no shared layout | Không mount thêm graph chỉ để preview liên kết |
| Teacher/student; `components/learning/ClassLearningSummary.tsx` | `{classId, asOf, aggregates, permission}`; loading/error | V-Grid/V-Card; static counts, M-Fade once | API kiểm tra quyền; không raw transcript hay lỗi cá nhân trong public view |
| Auth/offline/global nav; `components/learning/LearningSyncStatus.tsx` | `{mode:'guest'|'online'|'offline', pendingCount, lastSyncedAt?}` | V-Type caption; aria-live polite chỉ lúc trạng thái đổi; opacity .1s, no layoutId | Logout clear scope; offline completion ghi pending, chưa hiện XP như đã cấp |
| MRM/clans/events | Existing components, thêm `{metricId, period, unit, snapshotVersion}` theo API | V-Card/M-Fade; không dùng M-XP cho coin/điểm giải | Giữ đơn vị và consent leaderboard, không đổi ranking bằng frontend |

## 7. Definition of done và báo cáo bắt buộc

Tạo `docs/implementation-reports/<slice-id>.md` khi Antigravity thực thi. Báo cáo gồm:

1. SHA/baseline, slice, files thay đổi, migration/flag state.
2. Acceptance cases: pass/fail/blocked, cách tái hiện; baseline failure tách khỏi regression.
3. Screenshots dark/paper, mobile/desktop; keyboard, screen reader, reduced-motion evidence.
4. Performance trước/sau cùng fixture, raw traces hoặc đường dẫn artifacts; ghi rõ lab hay field.
5. Contract/server tests liên quan, DB isolation, reward replay/concurrency nếu có.
6. Hạn chế còn lại, cách rollback UI/API/data và điều kiện được chuyển slice.

Repo hiện có `npm run build`, `npm run lint`; chưa thấy frontend test script trong package.json. Khi thêm interaction harness, định nghĩa script và dependency rõ trong slice cần test; không viết lệnh `npm test` rồi tuyên bố đã pass. Không thêm tests snapshot chỉ để mirror JSX. Kiểm thử hành vi state persistence, event idempotency và maths correctness có ý nghĩa.

## 8. Prompt khởi động cho Antigravity

> Đọc IMPLEMENTATION_MASTER_PLAN.md, SPEC_CLIL_LEARNING.md và baseline trong HANDOFF_NEXT_PHASE.md. Đây là task triển khai tuần tự. Bảo toàn mọi local changes, xác lập baseline Phase A trước. Thực hiện P0 và Q1-min, sau đó chỉ triển khai C1 cho `/L6-C1-L1`: structured bilingual content, ba mode và accessible term popover, giữ nguyên quiz state và rule tính đúng. Dùng theme tokens, GlassCard và framer-motion đã có. Không thay toàn bộ lesson engine consumers một lượt. Ghi bằng chứng gate vào docs/implementation-reports/C1.md. Nếu gate fail thì sửa C1; chỉ chuyển C2 khi tất cả tiêu chí đạt. Dữ liệu reward do server quyết định; không dùng fixture hay client boolean làm thành tích thật. Không commit/push/deploy trừ khi đã có chỉ dẫn riêng.
