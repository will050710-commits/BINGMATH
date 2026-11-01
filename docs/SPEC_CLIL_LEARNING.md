# Phần A — CLIL Anh–Việt: implementation spec

Đọc cùng [master plan](IMPLEMENTATION_MASTER_PLAN.md). Ngày audit 30/10/2026. Các file “mới” và API dưới đây là thiết kế đề xuất; chưa được triển khai. Visual presets V-* và motion presets M-* được định nghĩa trong master plan.

**Mục tiêu đầu tiên:** học viên hoàn thành bài `/L6-C1-L1` ở bất kỳ chế độ ngôn ngữ nào mà không mất câu trả lời, focus, vị trí học hoặc thay đổi tiêu chí đúng toán. Chỉ mở rộng sau khi pilot đạt gate. Hỗ trợ ngôn ngữ không bị tính là dùng hint toán.

## A0. Audit chính xác các điểm hiển thị song ngữ

| Vai trò | File hiện có | Cách đang hoạt động / giới hạn |
| --- | --- | --- |
| UI locale toàn app | `frontend/src/context/LanguageContext.js` | `lang`, `setLang`, `toggleLang`, `t(vi,en)`; localStorage `duomath_lang`. Không phải learning-mode store |
| Layout gắn translator | `frontend/src/components/LayoutClient.js` | Nhận diện lesson path và mount `DuoTranslate`; cần loại trừ vùng CLIL được quản lý, tránh hai cơ chế mở panel |
| Engine theory/quiz | `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js` | Local/controlled `lang`, `renderTheory({t,lang,...})`, MC/TF/fill, language pill `layoutId="langSlider"`; nhiều question đã resolve bằng `t()` trước renderer |
| Pilot thực | `frontend/src/components/thcs/Cacbaitoan6/L6_C1_L1.js`; `frontend/src/app/(thcs)/L6-C1-L1/page.js` | Title, objectives, theory `w/k1/k2/k3`, 2 MC + 1 TF + 1 fill và glossary Set/Element/Empty set; một option EN còn tiếng Việt |
| Theory THPT đối chiếu | `frontend/src/components/thpt/Cacbaitoan10/Lesson1_MenhDe.js`; `frontend/src/components/thpt/Cacbaitoan10/Lesson2_TapHop.js` | Cặp `t(vi,en)` trong JSX; các phần mở lời giải và công thức không đồng nhất; chưa migrate trong C1 |
| Đề bài kiểm tra | `frontend/src/components/bailam/thcs/UniversalTHCSTestEngine.js`; `frontend/src/data/thcsTestsData.js`; `frontend/src/data/grade12Tests.js` | Dữ liệu legacy `q.text/options`; không phải mọi bài kiểm tra là toán hoặc có EN/VI. Cần policy riêng khi rollout |
| Dịch, thuật ngữ, hội thoại | `frontend/src/components/DuoMCB/DuoTranslate.js`; `frontend/src/app/DuoTranslate/page.js` | Có selection translation, panel hai cột, `words`, TTS, theory EN/VI, MathGraphSVG; chưa phải term catalog đã duyệt, chưa có glossary theo phiên |
| Chat và input toán | `frontend/src/components/DuoMCB/DuoMCBPage.js`; `frontend/src/components/chat/StreamdownMessage.jsx`; `frontend/src/components/shared/MathInput.jsx` | Giữ Markdown/KaTeX và MathLive; không chèn tooltip bằng regex trên DOM đã render; composer có đời sống draft riêng |
| Mini illustration hiện có | `frontend/src/components/thpt/Cacbaitoan10/MathGraphSVG.js` | Một số preset SVG; chỉ tái sử dụng fixture phù hợp sau kiểm định, không mount MathViz nặng trong tooltip |

**Vấn đề nội dung phải giải quyết ở pilot:** cặp EN/VI phải cùng question version và cùng ý toán; option IDs không đổi theo bản dịch; alias đáp án điền trống được review riêng. Không dịch động rồi tự cập nhật answer key. Glossary hiện tại là danh sách tĩnh, không thể dùng làm dấu hiệu học viên đã tra cứu.

## A1. Data contract chung, không suy ra bản dịch từ DOM

### Target Files

Sửa existing:

- `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js`: thêm adapter opt-in cho CLIL; giữ đường legacy khi không có manifest.
- `frontend/src/components/thcs/Cacbaitoan6/L6_C1_L1.js`: chuyển nội dung pilot sang manifest, giữ mapping question và nav IDs.
- `frontend/src/components/LayoutClient.js`: đặt ranh giới dịch; không thêm hai provider cho một phiên.
- `frontend/src/app/globals.css`: chỉ thêm utilities scoped cần thiết; giữ token theme.

Tạo mới:

- `frontend/src/types/learning.ts` (shared type như master); `frontend/src/types/clil.ts`.
- `frontend/src/context/LearningExperienceContext.tsx`.
- `frontend/src/content/clil/lessons/L6-C1-L1.ts`.
- `frontend/src/content/clil/mathTerms.ts`.
- `frontend/src/components/clil/BilingualBlock.tsx`, `ClilInlineRenderer.tsx`.
- `frontend/src/lib/clil/validateContent.ts`, `frontend/src/lib/learningMotion.ts`.

### Props & state schema

```ts
type LearningMode = 'immersion' | 'assisted' | 'parallel';
type Locale = 'en' | 'vi';
type Review = { status: 'reviewed'; revision: string; reviewerRef: string };
type Leaf =
  | { kind: 'text'; text: string }
  | { kind: 'math'; latex: string; display?: boolean }
  | { kind: 'term'; termId: string; surface: string };
type InlinePart = Leaf | { kind: 'phrase'; phraseId: string; children: Leaf[] };
type BilingualSegment = {
  id: string; role: 'title' | 'objective' | 'theory' | 'prompt' | 'option' | 'feedback';
  en: InlinePart[]; vi: InlinePart[]; review: Review;
};
type IllustrationKey = 'set-elements' | 'membership' | 'empty-set';
type MathTerm = {
  id: string; version: string; en: string; vi: string;
  sense: string; domain: 'sets' | 'logic';
  aliases: { en: string[]; vi: string[] };
  definition: { en: string; vi: string };
  latex?: string; illustrationKey?: IllustrationKey;
  sourceRefs: string[]; review: Review;
};
type ClilQuestionView = {
  questionId: string; questionVersion: string;
  promptSegmentId: string;
  options?: { optionId: string; segmentId: string }[];
  feedbackSegmentIds?: string[]; // chỉ hiển thị khi assessment policy cho phép
};
type ClilLessonManifest = {
  lessonId: string; contentVersion: string;
  titleSegmentId: string; objectiveSegmentIds: string[];
  sections: { id: string; headingSegmentId: string; bodySegmentIds: string[] }[];
  segments: Record<string, BilingualSegment>;
  questions: ClilQuestionView[]; termIds: string[];
};
type LearningExperienceState = {
  lessonId: string; contentVersion: string; sessionId: string;
  mode: LearningMode; activeSegmentId: string | null;
  openTerm: { termId: string; triggerId: string } | null;
  xray: { active: boolean; source: 'keyboard' | 'pointer' | 'toggle' | null };
  glossaryOpen: boolean;
};
type BilingualBlockProps = {
  segment: BilingualSegment; mode: LearningMode;
  as?: 'p' | 'div' | 'h2' | 'h3';
  translateAllowed: boolean; // assessment policy, không chỉ UI flag
};
```

`phraseId` biểu thị cùng một ý giữa hai ngôn ngữ, không phải offset ký tự. Validation yêu cầu mỗi phrase xuất hiện đúng một lần mỗi ngôn ngữ trong segment; nếu không chia được tương ứng, dùng cả segment làm đơn vị dịch. Không tự căn từng từ hoặc ép thứ tự cú pháp tiếng Việt giống tiếng Anh.

Các rule build-time: IDs duy nhất, mọi reference tồn tại, term sense đúng bài, KaTeX parse được, không HTML tùy ý, không thiếu ngôn ngữ trong pilot. Review toán kiểm tra ý nghĩa/quantifier/ký hiệu, không chỉ parse LaTeX. Manifest mới chứa display data; không đưa thêm rubric bí mật vào frontend. C1 còn dùng cơ chế chấm legacy; ghi rõ giới hạn này và không thêm thưởng mới trước Q2/G1.

Storage: preference key versioned `bingmath:clil:v1:<learnerScope>`; glossary theo `learnerScope/lessonId/contentVersion/sessionId`. Locale UI vẫn ở LanguageContext. Logout hủy pending requests và clear scope in-memory. Phiên guest có ID riêng, không dùng email. Storage unavailable → hoạt động in-memory, có trạng thái chưa lưu; không làm lesson crash. Không ghi localStorage trên từng pointermove.

### Visual & animation

- Nội dung dùng V-Type; `max-w-prose` cho một ngôn ngữ, công thức dài `overflow-x-auto` scoped, không làm toàn page overflow.
- `BilingualBlock` dùng M-Fade chỉ khi nội dung dịch xuất hiện; node chứa answer/input không thuộc subtree exit.
- `initial={false}` cho nội dung SSR đã có để tránh flash. `layoutId` none; không shared-element toàn đoạn văn.
- Không animate height nhiều paragraph cùng lúc. Khi đổi mode, giữ stable DOM key là segment ID, giữ anchor đang học trong viewport; dùng layout ổn định và bảo toàn focus trước khi cân nhắc scroll correction.

## C1.1 — Ba chế độ học, một quiz state

### Target Files

Sửa `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js`, `frontend/src/components/thcs/Cacbaitoan6/L6_C1_L1.js`, `frontend/src/components/LayoutClient.js`; với `frontend/src/context/LanguageContext.js` chỉ sửa nếu cần public read API, không đổi ý nghĩa locale.

Tạo `frontend/src/components/clil/LearningModeSwitch.tsx`, `LearningModeHelp.tsx`; dùng provider, manifest và BilingualBlock của A1.

### Behavior, props & state

```ts
type LearningModeSwitchProps = {
  value: LearningMode; onChange: (mode: LearningMode) => void;
  available: LearningMode[]; disabledReason?: string;
  labelsLocale: 'vi' | 'en';
};
// State cục bộ: helpOpen:boolean. Mode thuộc provider, không tạo bản sao trong engine.
```

| Mode | Nội dung mặc định | Cách nhận trợ giúp |
| --- | --- | --- |
| English Immersion | Chỉ EN, underline mảnh các term đã duyệt; không tự hiện VI khi rê chuột | Explicit click/Enter vào term hoặc X-Ray; đóng xong trở lại EN. Đây là trợ giúp chủ động, không tự thay mode |
| CLIL Assisted (default pilot) | EN; phrase có affordance nhẹ, term underline dotted | Hover có delay/keyboard/click mở dịch đúng phrase; touch dùng tap. Không bọc cả paragraph thành button có button con |
| Side-by-Side | Mỗi segment là một cặp EN/VI, labels rõ | Desktop hai cột; mobile xếp EN rồi VI theo từng cặp, không gom toàn EN phía trên toàn VI |

Control dùng radio group ba giá trị với label đầy đủ, arrow-key navigation, không tabs nếu không có tabpanel tương ứng. Hint “Đổi cách đọc, bài làm vẫn được giữ”. Available modes lấy coverage manifest; legacy page không hiển thị ba mode giả.

Thứ tự đổi mode: update provider synchronously → render text presentation → giữ `questionId`, option selection, draft, revealed answers, elapsed attempt time, content-hint history. Không gọi submit/checkin/logQuizAttempt khi đổi mode. Không reload video/graph. Khi page language khác learning language, control vẫn được đọc bằng UI locale.

### Tailwind & visual spec

- Toolbar `flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-2 p-1.5`; buttons V-Control, `relative z-10 flex-1 whitespace-nowrap`.
- Active pill `absolute inset-0 rounded-xl bg-surface border border-line-strong`; label `text-ink`, inactive `text-muted`; không dùng màu làm tín hiệu duy nhất.
- Theory/quiz layout thay fixed inline columns bằng `grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]`; quiz sticky chỉ khi đủ chiều rộng/chiều cao.
- Parallel block `grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5`; cột VI `border-l-2 border-line pl-4`, mobile border-top thay border-left. Label `text-xs font-semibold tracking-wide text-muted`.

### Animation spec

- Pill: M-Select, `layoutId={`clil-mode:${instanceId}`}`, spring `{type:'spring',stiffness:380,damping:32,mass:0.8}`; `initial={false}`.
- Translation appearance: variants `{hidden:{opacity:0},visible:{opacity:1},exit:{opacity:0}}`; `initial="hidden" animate="visible" exit="exit" transition={{duration:0.12}}`; layoutId none.
- Không transform toàn paragraph hoặc chạy stagger từng từ. Reduced-motion: pill jump trực tiếp, opacity duration0.

### Acceptance gate C1.1

Ba mode hoạt động ở dark/paper và 320/390/1440px. Thử đổi 20 lần giữa một câu đang nhập, đáp án đã chọn và video đang chạy: không mất state hoặc phát sinh attempt/reward. Đổi mode không network request. 100% pilot visible text được review EN/VI; thiếu bản dịch bị chặn ở validator, không silently dùng VI trong immersion.

## C1.2 — Interactive Math Term Popover và phrase assistance

### Target Files

Sửa `ClilInlineRenderer.tsx` mới ở A1; `frontend/src/components/thpt/Cacbaitoan10/MathGraphSVG.js` chỉ khi tái sử dụng preset cần sửa accessibility.

Tạo `frontend/src/components/clil/MathTermTrigger.tsx`, `MathTermPopover.tsx`, `MathTermIllustration.tsx`, `PhraseTranslationPopover.tsx`, `frontend/src/hooks/useClilPopover.ts`.

### Props & state schema

```ts
type TermTriggerProps = {
  termId: string; surface: string; segmentId: string;
  mode: LearningMode; assessmentAllowsLookup: boolean;
};
type TermPopoverProps = {
  term: MathTerm; open: boolean; triggerId: string;
  onClose: () => void;
  onLookup: (event: { termId: string; triggerId: string; source: 'click' | 'keyboard' | 'hover-dwell' }) => void;
};
type PopoverState = {
  openKey: string | null;
  openReason: 'pointer' | 'keyboard' | 'click' | null;
  pinned: boolean; anchorRect: DOMRect | null;
};
type PhraseTranslationProps = {
  segmentId: string; phraseId: string;
  en: Leaf[]; vi: Leaf[]; open: boolean; onClose: () => void;
};
```

Card gồm term EN, nghĩa VI, mô tả ngắn theo sense, KaTeX tùy chọn, mini SVG tùy chọn, nút “Đã hiểu” và nút đóng. Không hiển thị ví dụ làm lộ đáp án đang hỏi; catalog lookup có thể bị assessment policy hạn chế. Illustration là preset code đã review và có caption, không suy ra một hình chính xác từ model lúc hover.

Hover trong Assisted: mở sau 180ms, đóng sau 120ms khi pointer rời cả trigger và card. Tương tác/focus giữ card; Esc đóng và trả focus về trigger. Explicit click mở ngay, pin tới khi đóng. Immersion không tự mở VI do hover. Pointer coarse bỏ hover. Một portal/popover active cho mỗi learning surface; close khi route change. Nội dung có nút nên dùng nonmodal dialog/popover semantics, không gán `role="tooltip"` cho cả card tương tác. Mobile drawer có focus trap và background inert; desktop nonmodal không trap focus.

Term trigger inline là button có style text, `aria-haspopup="dialog"`, `aria-expanded`, unique controls ID. Trong interactive parent (option/button) không lồng button: render lookup affordance là sibling hoặc qua action ngoài option, không làm click tra từ chọn đáp án. Phrase assistance không tự bao quanh các button term; renderer tách leaf triggers hợp lệ. Math/KaTeX subtree không bị highlight bằng DOM traversal.

### Tailwind & visual spec

- Trigger `underline decoration-dotted decoration-brand/60 underline-offset-4`; keyboard outline theo V-Control, hit area bổ sung padding trong khoảng dòng nhưng không làm lệch baseline.
- Card V-Surface `w-[min(22rem,calc(100vw-2rem))] p-4 shadow-xl`; head `flex items-start gap-3`, definition `text-sm leading-6`, math `rounded-lg bg-surface-2 px-3 py-2`.
- SVG 112×76, `max-w-full`, stroke currentColor, label/caption thật; không trang trí sai topology/ký hiệu. Nếu không có illustration hợp lệ thì bỏ slot, không tạo placeholder ngụ ý có hình.
- Layer token: popover trên lesson toolbar, dưới global modal; viewport collision padding16px, flip/shift theo anchor. Mobile bottom sheet `max-h-[70dvh] overflow-y-auto rounded-t-2xl` với safe-area padding.

### Animation spec

- Desktop: M-Popover `{opacity:0,scale:.96,y:6} → {opacity:1,scale:1,y:0} → {opacity:0,scale:.98,y:2}`; spring320/30 mass.85, opacity .12s, exit .1s; transformOrigin theo anchor.
- `layoutId={`term-card:${surfaceId}`}` chỉ trên card shell; thay term crossfade nội dung .1s, không morph hai công thức.
- Mobile: M-Drawer y100%→0 spring300/34; backdrop opacity .15s; no shared layoutId giữa desktop/mobile.
- Mini SVG static. Không floating loop trong text. Reduced: fade ≤.1s, không scale/drawer slide.

### Acceptance gate C1.2

Term “set” và “element” resolve đúng sense; Esc, Enter, touch, pointer bridge đều hoạt động. Popover không tràn màn hình/che focused input không thể truy cập. Screen reader đọc tên term, trạng thái và nội dung một lần. Hover phrase không gửi API hoặc làm thay quiz answer. Gate theo [WCAG content on hover/focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus).

## C2.1 — X-Ray Translation

### Target Files

Sửa các file vừa tạo ở A1/C1: `frontend/src/context/LearningExperienceContext.tsx`, `frontend/src/components/clil/BilingualBlock.tsx`, `frontend/src/components/clil/LearningModeSwitch.tsx`. Chỉnh existing `frontend/src/components/LayoutClient.js`, `frontend/src/components/DuoMCB/DuoTranslate.js` để không nhận cùng gesture trong vùng `data-clil-managed`.

Tạo `frontend/src/components/clil/XRayTranslationLayer.tsx`, `XRayControl.tsx`, `frontend/src/hooks/useXRayTranslation.ts`.

### Props & state schema

```ts
type XRayControlProps = {
  available: boolean; active: boolean;
  onHoldStart: () => void; onHoldEnd: () => void;
  onToggle: () => void; shortcutLabel: string;
};
type XRayLayerProps = {
  active: boolean; segment: BilingualSegment | null;
  anchorRect: DOMRect | null; onClose: () => void;
};
type XRayState = {
  active: boolean; source: 'keyboard' | 'pointer' | 'toggle' | null;
  activeSegmentId: string | null; shortcutEnabled: boolean;
};
```

Default shortcut đề xuất `Alt+X`, có thể đổi/tắt vì browser/OS có thể chiếm tổ hợp. Nút bấm luôn là đường dùng đầy đủ. Chỉ xử lý khi focus/reading region nằm trong lesson; bỏ qua input, textarea, select, contenteditable, MathLive, IME composition và modal đang mở. Không bắt phím Alt đơn lẻ toàn trang.

Hold keyboard/pointer vào nút để soi segment đang focus/được chọn gần nhất; chưa có segment thì chọn block đầu tiên đang visible, không gửi toàn page đi dịch. Release/keyup/pointercancel/lostpointercapture/window blur/tab hidden → tắt. Escape tắt cả toggle mode. Nút riêng “Giữ bản dịch” cho người không thể nhấn giữ; `aria-pressed` diễn tả trạng thái. Hai nguồn hold không tranh nhau: release chỉ tắt nguồn đang active, blur luôn tắt.

Overlay hiển thị **một card VI đọc được**, nền Anh có thể giảm opacity cục bộ; không chồng hai lớp chữ cùng vị trí. Không bịa độ chính xác căn dòng vì VI dài hơn EN. Parallel mode đã có VI: X-Ray disabled với nhãn “Bản dịch đã hiển thị”, không mở thêm lớp trùng.

### Tailwind & visual spec

- Card overlay `absolute z-30 rounded-xl border border-line-strong p-4 text-ink shadow-lg`; `background:var(--surface-glass)`, `backdrop-blur-sm`; max width theo reading column, max height `min(45dvh,20rem)`, scroll khi cần.
- Cố định card theo anchor không làm page reflow, reposition khi resize/scroll bằng một scheduler; active English block opacity .35 chỉ khi text card VI phủ đủ vùng, không dim input đang dùng.
- Control V-Control, icon + “Soi bản dịch”; không chỉ icon mơ hồ. Overlay được pointer-accessible để đọc bản dài, hold button có pointer capture.
- Screen reader không đọc lớp visual duplicate: cung cấp vùng translation có label và nút truy cập; nếu bản VI đã tồn tại accessible thì overlay `aria-hidden`. Không vừa aria-live toàn đoạn vừa focus vào cùng nội dung.

### Animation spec

Variants `{hidden:{opacity:0},visible:{opacity:1},exit:{opacity:0}}`, `initial="hidden" animate="visible" exit="exit"`; duration .10 enter/.08 exit, ease `easeOut`; `layoutId` none. Không spring trên overlay đang theo scroll, không blur animation. Reduced duration0. Keydown không restart animation nếu event.repeat.

### Gate

Không bị kẹt overlay sau chuyển tab, đổi route, mở MathLive, pointercancel hoặc Esc. Không chiếm thao tác nhập dấu/IME. Không fetch dịch cho authored pilot. Hold/toggle/keyboard cho cùng nội dung; không thay question score, hint count hoặc glossary nếu chỉ soi cả đoạn.

## C2.2 — Auto-collected Math Glossary

### Target Files

Sửa các file vừa tạo: `frontend/src/context/LearningExperienceContext.tsx`, `frontend/src/components/clil/MathTermPopover.tsx`; existing `frontend/src/components/DuoMCB/DuoTranslate.js` chỉ đưa term AI vào luồng review/candidate, không giả làm catalog.

Tạo `frontend/src/components/clil/SessionGlossaryDrawer.tsx`, `GlossaryReviewCard.tsx`, `GlossaryLauncher.tsx`, `frontend/src/lib/clil/sessionGlossary.ts`.

### Props & state schema

```ts
type GlossaryEntry = {
  termId: string; termVersion: string; lessonId: string;
  firstSeenAt: string; lastSeenAt: string; lookupCount: number;
  sourceSegmentIds: string[];
  review: 'unreviewed' | 'self-marked-known';
};
type SessionGlossary = {
  schemaVersion: 1; learnerScope: string; sessionId: string;
  lessonId: string; contentVersion: string;
  entries: Record<string, GlossaryEntry>; // key termId:termVersion
};
type SessionGlossaryDrawerProps = {
  open: boolean; entries: GlossaryEntry[];
  onClose: () => void;
  onMarkKnown: (termKey: string, known: boolean) => void;
  onRemove: (termKey: string) => void;
};
// Local UI: filter:'all'|'unreviewed', expandedKey:string|null, undoRemoval:GlossaryEntry|null.
```

Thu thập khi click/keyboard mở term, hoặc hover card đã visible liên tục ≥600ms. Một open session chỉ count một lần; di pointer trong card không tăng. Cancel dwell nếu tab hidden/term close. `sourceSegmentIds` unique, cap hợp lý trong storage (đề xuất20 sources/term); count không phải mastery/XP.

Drawer có số từ, tên EN/VI, symbol, “Mình đã nhớ”, “Xem lại trong bài”, remove/undo. Lúc kết thúc bài, hiển thị CTA “Ôn các từ đã tra” không ép modal. Không đánh giá vốn từ từ một hover hoặc tự chấm “đã thuộc”. Guest persistence local, logout đổi scope; xóa phiên có confirm inline vì mất danh sách, không ảnh hưởng tiến độ toán.

AI translation terms chỉ có thể thành candidate với nhãn “Bản dịch gợi ý”; pilot chỉ auto-collect curated term IDs. Không tự merge các sense khác nhau cùng từ tiếng Anh. Khi content version đổi giữ snapshot entry và gắn “Nội dung đã cập nhật”, resolve sang version mới chỉ qua migration rõ ràng.

### Tailwind & visual spec

- Launcher V-Control `inline-flex gap-2 border border-line bg-surface`, count badge `rounded-full bg-brand-soft px-2 text-xs`; placement trong lesson toolbar, không floating che nút submit.
- Drawer desktop `w-[24rem] max-w-[calc(100vw-1rem)]`, mobile full-width bottom sheet max85dvh; header sticky `bg-surface border-b border-line p-4`, body `space-y-3 overflow-y-auto p-4`.
- Entry V-Card, EN `font-semibold`, VI `text-sm text-muted`; count caption “Đã mở … lần”, không “đã thành thạo”. Empty state giải thích tra một term để bắt đầu; error lưu trữ có retry/reset scoped.

### Animation spec

- M-Drawer spring300/34; backdrop opacity .15s; focus lock/restore cho drawer modal. `layoutId` none cho drawer.
- Entry mới: variants `{initial:{opacity:0,y:6},animate:{opacity:1,y:0},exit:{opacity:0,y:-4}}`, spring320/30, exit .1; `layout="position"`, `layoutId={`glossary:${sessionId}:${termKey}`}` chỉ trong drawer instance.
- Launcher count scale1→1.08→1 trong .2s khi term unique mới, không mỗi lookup; reduced immediate. Không celebration/confetti cho lookup.

### Gate

Repeated hover/click không duplicate term; count có quy tắc xác định. Reload phục hồi đúng session; logout/login user khác không lộ glossary trước. Remove/undo và storage denied không crash. Kết thúc bài không gián đoạn submit; không tạo XP hoặc đánh dấu math mastery.

## C3 — CLIL Answer Polisher

### Target Files

Sửa `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js` ở vùng câu trả lời text phù hợp; `frontend/src/components/DuoMCB/DuoMCBPage.js` ở composer sau khi reconcile Phase A; dùng API hiện có của `frontend/src/components/shared/MathInput.jsx`, không sửa internal MathLive document bằng string replace.

Tạo `frontend/src/components/clil/AnswerPolisher.tsx`, `PolishSuggestionRow.tsx`, `frontend/src/hooks/useAnswerPolisher.ts`, `frontend/src/lib/clil/polishTerminology.ts`, `frontend/src/lib/clil/protectedMathSpans.ts`.

### Props & state schema

```ts
type TextSpan = { start: number; end: number }; // UTF-16 offsets, end-exclusive trên cùng snapshot
type PolishSuggestion = {
  id: string; draftVersion: number; span: TextSpan;
  original: string; replacement: string; termId: string;
  reason: 'preferred-math-term'; review: 'catalog-reviewed';
};
type AnswerPolisherProps = {
  draft: string; draftVersion: number; locale: 'vi' | 'en';
  protectedSpans: TextSpan[]; // math, code, URL và token không được sửa
  enabled: boolean; isComposing: boolean;
  onApply: (args: { suggestionId: string; expectedVersion: number; nextDraft: string }) => void;
};
type PolisherState = {
  phase: 'idle' | 'checking' | 'suggested' | 'stale' | 'unavailable';
  snapshot: { text: string; version: number } | null;
  suggestions: PolishSuggestion[];
  undo: { before: string; appliedVersion: number } | null;
};
```

V1 local deterministic catalog replacement, người học chủ động bấm “Chuẩn hóa thuật ngữ”. Có thể báo nhẹ có gợi ý sau pause500ms nhưng không API mỗi keystroke và không chạy khi IME composing. Hạn chế vào thuật ngữ đã duyệt; câu thuần Việt được đề xuất từ, không giả làm bản dịch hoàn chỉnh của lập luận.

Không sửa số, biến, dấu, quan hệ tập hợp, quantifier, đơn vị, code/LaTeX hoặc math-field. Nếu parser không xác định vùng bảo vệ đáng tin → không đưa suggestion ở vùng đó. Các từ đa nghĩa phụ thuộc context phải có catalog sense; không đủ chắc thì bỏ qua. Không thay “not”, “only if”, “at least” bằng style rewrite. Không đánh giá đúng/sai toán và không tự gửi câu trả lời.

Apply yêu cầu `expectedVersion === currentVersion`, substring tại span trùng original và span không giao vùng bảo vệ. Suggestion chồng nhau bị validator loại; áp dụng một suggestion rồi tính lại, hoặc batch theo offsets giảm dần sau kiểm tra toàn bộ snapshot. Sau user gõ thêm, suggestions stale; không áp offset cũ. Undo chỉ phục hồi snapshot nếu không có edit xen giữa; nếu có edit thì không ghi đè draft, cung cấp bản gốc để tham khảo.

Không offer polisher cho MC/TF, pure symbolic fill hoặc exam cấm trợ giúp. Nó là language assist, không content hint; không ảnh hưởng combo hay độ đúng. Nếu V2 dùng model, output vẫn là bounded edit proposals với protected-span validation, requestId/draftVersion/abort và nhãn gợi ý; không mở V2 trước gate V1.

### Tailwind & visual spec

- Panel dưới composer/answer input `rounded-xl border border-line bg-surface px-3 py-2 text-sm`; label “Gợi ý thuật ngữ tiếng Anh”. Không dùng badge xanh “Đúng”.
- Mỗi row `flex flex-wrap items-center gap-2`; original `text-muted`, proposed `text-ink font-medium`, reason có disclosure. Apply/ignore/undo V-Control.
- Không underline đỏ toàn câu, không gây cảm giác bị phạt vì tiếng Việt. Input không tự resize theo panel xuất hiện: reserve vùng summary một dòng, details expand theo explicit action.

### Animation spec

- Summary M-Fade y4 thay y6, spring320/30; suggestions opacity0→1 .12s, exit .08s; layoutId none.
- Apply feedback icon scale .95→1 spring380/32, không animate/morph text người học; aria-live polite một lần “Đã đổi thuật ngữ, có thể hoàn tác”.
- Reduced duration0, không shake khi stale/unavailable; luôn giữ focus/caret.

### Gate

Fixture gồm mixed VI/EN, dấu tiếng Việt, Unicode/surrogate, LaTeX inline/display, MathLive, negation, đa nghĩa, overlapping spans, IME, stale draft và undo sau edit. Mọi math span giữ nguyên byte/text, không thay answer/correctness/reward. Cùng input/version tạo suggestions xác định. Không gửi nội dung học sinh ra provider trong V1.

## C4 — Nâng cấp DuoTranslate và hội thoại song ngữ

### Target Files

Sửa `frontend/src/components/DuoMCB/DuoTranslate.js`, `frontend/src/lib/api.js`, `frontend/src/components/LayoutClient.js`, `backend/main.py` handler `/api/translate`; dùng `StreamdownMessage.jsx` hiện có cho output safe.

Tạo `frontend/src/lib/clil/translationContract.ts`, `frontend/src/hooks/useTranslationRequest.ts`. Chat segment integration chỉ thêm sau Q2: `frontend/src/components/clil/ChatLanguageAssist.tsx` (mới).

### Props & state schema

```ts
type TranslationRequest = {
  requestId: string; text: string; source: 'en' | 'vi'; target: 'vi' | 'en';
  context: { lessonId?: string; contentVersion?: string; segmentId?: string };
};
type TranslationResult = {
  requestId: string; sourceText: string; translatedText: string;
  provenance: 'authored-reviewed' | 'model-generated' | 'fallback';
  termCandidates: { en: string; vi: string; catalogTermId?: string }[];
};
type TranslationState = {
  currentRequestId: string | null;
  phase: 'idle' | 'loading' | 'ready' | 'error';
  result: TranslationResult | null; errorCode?: string;
};
```

Adapter phải chuyển đúng payload hiện tại, gồm `_fallback` nếu backend trả, sang provenance; không claim backend đã hỗ trợ schema mới. Request mới abort request cũ; trước setState so requestId + source snapshot + user/session scope. Abort do navigation không hiển thị như lỗi người dùng. Selection listener bỏ qua `data-clil-managed`, inputs/contenteditable/MathLive/KaTeX/code và popover. Chỉ explicit action mới gửi selected text; không tự gọi provider vì một selection vô tình trong pilot.

Bỏ side effect translate tăng `socratic_count`; analytics `language_lookup` riêng, không reward. Giữ distinction “Dịch tham khảo” vs “Nội dung đã biên tập”; term AI không tự ghi vào curated dictionary. Câu chat chưa có bilingual segment contract chỉ cho dịch có yêu cầu theo message ID, không tự wrap toàn transcript bằng regex. Mỗi response chỉ nhận bản dịch đúng message/version; pending message edit hủy bản dịch cũ.

### Tailwind & animation

- Reuse V-Surface/V-Type và cách chia cặp paragraph như C1; lỗi `role="status"` + retry, không full-screen error.
- Panel M-Drawer spring300/34; result M-Fade spring320/30 với opacity .12; layoutId none. Loading spinner theo request thực, reduced thay bằng chữ tĩnh. Không countdown phần trăm suy diễn.

### Gate

Test request A chậm/B nhanh và đổi user giữa request: chỉ B đúng scope xuất hiện. Provider lỗi/fallback có nhãn đúng. Dịch không làm quest tiến hoặc sinh Socratic attempt. Không nested modal tranh focus với TutorWorkspace.

## C5. Thứ tự migration và kế hoạch kiểm thử

1. C1: manifest pilot + mode + term, giữ legacy adapter cho mọi lesson khác.
2. C2: X-Ray/glossary trên pilot, C4 request guards nếu translator đang chạm pilot.
3. C3: polisher local cho text phù hợp; không rollout cho tất cả exams.
4. Sau gates: thêm một bài lớp 6 cùng domain, rồi một bài THPT (`Lesson1_MenhDe.js`) để kiểm tra thuật ngữ đa nghĩa và công thức dài.
5. Catalog badge theo coverage thật. Exams chỉ opt-in nếu assessment policy cho phép; content author checklist EN/VI, term sense, notation, answer rubric và accessibility.

Tests mới có ý nghĩa: `frontend/tests/clil-content.test.ts` (references/coverage), `frontend/tests/clil-polisher.test.ts` (protected spans/stale edits), `frontend/e2e/clil-learning.spec.ts` (state/focus/keyboard/overlay). Antigravity chọn/configure test runner tương thích package hiện có trong P0; các đường dẫn này là proposed, chưa có lệnh chạy được xác nhận.

Content review checklist phải bao phủ title/objectives/theory/questions/options/hints/feedback/nav labels. Những phần không có EN phải ghi missing và không bật immersion cho bài đó. Test parse được LaTeX không thay thế review ý nghĩa toán học.

Gate tổng C1–C4 theo master: local feedback p95 ≤100ms tính từ click/keyboard action hoặc sau intentional hover delay; không tăng initial JS gzip quá30KB; không listener leak qua20 chu kỳ; 0 mất draft/focus/score; 0 term lookup gọi API khi dùng catalog; keyboard và touch hoàn thành cùng task. Số đo phải lưu trong `docs/implementation-reports/C1.md`, `C2.md`, `C3.md`, `C4.md` khi triển khai, không coi bảng spec này là test report.

Rollback: tắt `clilPilot`/`clilPolisher`, trả về renderer legacy; giữ glossary schema version và content manifest, không xóa dữ liệu người học. Không rollback bằng cách đưa lại side effect dịch tăng Socratic count.
