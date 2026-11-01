# Review implementation Antigravity — P0 / Q1-min / C1

Ngày review: 30/10/2026. Baseline hiện tại: `f9081d8d6f0190e52cc910baae5b3d4e642e8917` trên `main`; implementation vẫn ở working tree/untracked files. Đọc báo cáo `docs/implementation-reports/C1.md`, đối chiếu source và thực hiện các kiểm tra dưới đây. **Chưa sửa code ứng dụng trong lượt review này.**

**Kết luận: chưa đạt gate C1/Q1-min.** Có 2 lỗi P1 và 6 vấn đề P2. `/L6-C1-L1` hiện trả HTTP 500; verification còn có thể khẳng định đáp án đã kiểm chứng khi bằng chứng chỉ kiểm tra dấu của một số. Không nên chuyển sang XP/Eureka dựa trên implementation hiện tại.

Phạm vi semantic review tập trung vào phần Antigravity báo đã triển khai: CLIL pilot, verification, phần nối API/UI và learner state. Đã quét cú pháp các file Python/frontend thay đổi. Không coi các thay đổi mobile/admin/teacher đã có trước đó là được review hành vi đầy đủ; không gọi provider AI thật hoặc kiểm thử bằng tài khoản học sinh thật.

## R1 — [P1] Thiếu props làm toàn bộ pilot trả HTTP 500

**Vị trí:** `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js:664`; điểm phát lỗi `frontend/src/components/clil/LearningModeSwitch.tsx:43`.

Engine render:

```jsx
<LearningModeSwitch labelsLocale={lang === "en" ? "en" : "vi"} />
```

Trong khi switch yêu cầu `value`, `onChange`, `available`. Ngay render đầu, `available.includes(m)` truy cập undefined. Component không tự lấy các giá trị đó từ `LearningExperienceContext`. Chỉ thêm default `available` chưa đủ: click tiếp tục lỗi `onChange is not a function` và không có selected mode.

**Đã tái hiện trực tiếp:** chạy Next dev trên cổng3007, GET `/L6-C1-L1` → HTTP500. Log:

```text
TypeError: Cannot read properties of undefined (reading 'includes')
at LearningModeSwitch.tsx:43:59
GET /L6-C1-L1 500
```

**Sửa tối thiểu:** tạo connected wrapper nằm **bên trong** provider, lấy `state.mode` và `setMode`, truyền đủ available modes từ manifest coverage; hoặc cho switch đọc context theo contract rõ ràng. Không đọc context từ chính `PremiumLessonEngine` khi provider chỉ nằm trong JSX return của nó.

**Retest:** route trả200; cả click và arrow keys đổi đúng mode; radio selection chính xác; quiz draft/score giữ nguyên. Thêm smoke test render actual page để lỗi required props không lọt qua nữa.

## R2 — [P1] Verification vẫn nâng bằng chứng yếu thành “đáp án đúng”

**Vị trí:** `backend/verification_contract.py:144`, `:159`, `:281`, `:297`; caller `backend/math_solver.py:1014`.

`build_claim_coverage()` đánh dấu `answer:main` pass chỉ cần **bất kỳ** answer check nào pass. `sanity` kiểm tra area không âm cũng được tính như bằng chứng đủ cho đáp án. Ngoài ra, khi explicit coverage chỉ có required claim `not_checked`, nhưng có positive check khác, điều kiện `passed_claims and unchecked_claims` không bắt được; hàm rơi vào nhánh verified.

**Đã tái hiện với solver thật, không gọi model:**

```python
result = await math_solver.verify_and_repair(
    {"transcription": "Find the area of a rectangle of length 3 and width 2.",
     "latex": []},
    "Answer: S = 999",
    chat_fn=None,
    request_id="review-area",
)
```

Kết quả thực:

```text
verified=True
status=verified
reason=complete
scope=domain-positivity-bounds
coverage: answer:main = pass
checks: sanity=passed; presolve/substitution/identities/geometry=skipped
```

Giá trị đúng tính bằng SymPy từ dimensions trên là6. Positive area chỉ chứng minh một ràng buộc cần, không chứng minh diện tích999 là đúng.

Ca contract thứ hai cũng đã tái hiện: một identities check pass cho `step:1`, explicit coverage chỉ chứa required `answer:main=not_checked` → vẫn `verified=True, reason=complete`.

**Sửa tối thiểu:** map checks vào từng claim/scope có định nghĩa độc lập. Sanity/bounds là constraint evidence, không tự hoàn tất answer claim. Chỉ verified khi có required claims hợp lệ và tất cả được chứng minh bằng check phù hợp; còn claim chưa kiểm thì partial/unsupported. Không dùng “có ít nhất một pass” thay coverage.

**Retest:** thêm cả hai ca trên; thêm answer đúng một phần/thiếu nghiệm, scene-only và positive identity nhưng kết luận chưa kiểm. Không đưa pass của checker cấu trúc hoặc positivity vào correctness/reward eligibility.

## R3 — [P2] API làm rơi evidence envelope trước khi trả về frontend

**Vị trí:** `backend/main.py:927` (`_solver_summary`), dùng tại `:5762`; `frontend/src/components/DuoMCB/VerificationStatusBadge.js:77` và `:151`.

Solver mới trả `reason`, `scope`, `coverage`, `requestId`, `responseVersion`, `verifierVersion`, `checkId`, `outcome` và assumptions. Nhưng `_solver_summary()` vẫn trả shape cũ; mỗi check chỉ còn `{name,status}`. Đây là payload actual chat route trả về, nên các fields mới không đến UI. `VerificationEvidencePanel.tsx` được tạo nhưng chưa được import/render bởi badge hoặc chat.

**Đã xác minh bằng thực thi riêng projection từ AST của main.py** để không init DB: toàn bộ sáu fields envelope nêu trên bị loại. UI chỉ dùng label fallback; không hiển thị claim coverage hoặc scope thật. Guard `is_envelope_for_request` chỉ có definition/test, chưa tham gia luồng production; caller cũng chưa truyền request identity vào verifier.

Có thêm mismatch trong badge: fallback `c.status` là `passed/failed`, nhưng icon so sánh với `pass/fail`, nên các checks nhận từ API hiện ra dấu chấm thay vì trạng thái tương ứng.

**Sửa tối thiểu:** serialize envelope bằng contract có version, giữ đầy đủ public evidence fields và normalized outcomes; wire panel đang có; truyền/đối chiếu request/response identity tại boundary. Nếu phải giữ API cũ, thêm adapter có kiểm thử round-trip thay vì âm thầm bỏ dữ liệu.

**Retest:** một response chat fixture đi qua đúng serializer → client parser → badge/panel, assertions bao phủ scope/reason/coverage/check IDs/outcomes. Late response không gắn evidence vào reply khác. Không cần gọi model để kiểm thử transport contract.

## R4 — [P2] Glossary và nút tra từ cạnh đáp án truyền sai schema

**Vị trí:** `frontend/src/components/thcs/Cacbaitoan6/L6_C1_L1.js:148`, `:160`, `:169`; `frontend/src/components/thpt/Cacbaitoan10/PremiumLessonEngine.js:955`; component nhận ở `frontend/src/components/clil/MathTermTrigger.tsx:7`.

Hai call sites truyền `{term, displayText}`, trong khi component nhận `{termId, surface, segmentId, mode, assessmentAllowsLookup}`. `getMathTerm(undefined)` trả null, component fallback `<span>{surface}</span>` với surface cũng undefined. Kết quả là **span rỗng**, không có nút tra từ. Các term inline do `ClilInlineRenderer` truyền đúng props vẫn có thể hoạt động sau khi R1 được sửa, nên lỗi dễ bị bỏ sót nếu chỉ thử một term trong theory.

Trong glossary, catalog có `id` và `definition.en`, nhưng page đọc `term.termId` và `term.definitionEn`; key và định nghĩa EN cũng thiếu. `ipa` không có trong catalog hiện tại, nên phần đó không bao giờ xuất hiện.

**Đã tái hiện qua React server-render với provider thật:** actual call-site props render `<span></span>`; cùng component với đúng props render button.

**Sửa tối thiểu:** đổi caller sang props hiện hành, dùng `term.id`/`term.definition.en`; hoặc tạo adapter typed duy nhất và dùng đồng nhất. Không sửa component thành chấp nhận hai shape mơ hồ. Trong MC option, giữ trigger là sibling để click tra từ không chọn answer.

**Retest:** tên EN và định nghĩa có thật trong glossary, mỗi card mở đúng term; nút cạnh option mở đúng popup và không thay mcSelected/score. Kiểm tra cả ba modes.

## R5 — [P2] Learner scope không nối với auth thật

**Vị trí:** `frontend/src/context/LearningExperienceContext.tsx:79`, `:117`; auth thật ở `frontend/src/context/AuthContext.js:182`.

Provider tìm `localStorage.duomath_user` hoặc `localStorage.user`. AuthContext thực tế lấy user từ Firebase `onAuthStateChanged` và không ghi các keys này. Search frontend chỉ tìm thấy provider mới đọc hai keys đó. Vì vậy tài khoản đăng nhập bình thường rơi về cùng `guest_local` trong một browser profile; preferences bị dùng chung giữa các tài khoản.

`learnerScope` còn được capture bằng useState một lần, không phản ứng khi auth ready/login/logout. Lookup records và open popovers cũng không reset theo user switch. Đây là lỗi scope của state; hiện chưa có sync glossary server nên không khẳng định có rò rỉ dữ liệu giữa thiết bị.

**Sửa tối thiểu:** lấy identity từ AuthContext, chờ trạng thái auth ready hoặc dùng scope tạm rõ ràng; re-scope/clear ephemeral state khi user đổi. Guest ID riêng có persistence thích hợp; không tự migrate guest state sang mọi user.

**Retest:** userA → logout → userB trong cùng browser không kế thừa preference/lookup state của A; auth hydrate muộn cũng chọn đúng scope; guest vẫn dùng được khi storage bị chặn.

## R6 — [P2] Persisted mode tạo server/client markup khác nhau khi hydrate

**Vị trí:** `frontend/src/context/LearningExperienceContext.tsx:121`.

Server initializer luôn trả `initialMode=assisted`; browser initializer đọc localStorage và có thể trả `parallel` ngay lần render đầu. `BilingualBlock` thay cả cấu trúc DOM giữa một cột và hai cột, nên saved parallel preference sẽ gây hydration mismatch sau khi R1 được sửa. Effect đọc preference sau mount đã tồn tại, nhưng bị initializer đọc trước làm mất tính nhất quán.

**Đã tái hiện isolated initial-render comparison:** cùng provider/Probe cho server output `<span>assisted</span>`, còn môi trường browser với saved preference cho output `<span>parallel</span>`. Đây là bằng chứng mismatch điều kiện khởi tạo; chưa thực hiện browser hydration end-to-end vì R1 chặn page.

**Sửa tối thiểu:** initial state deterministic cho server và client; hydrate preference trong effect sau auth scope ready, hoặc truyền server snapshot từ cookie có hợp đồng rõ. Không dùng suppressHydrationWarning để che thay đổi cấu trúc.

**Retest:** hard reload với mỗi persisted mode không có hydration warnings/recovery remount; giữ quiz inputs và focus, không đọc nhầm scope theo R5.

## R7 — [P2] Mobile term dialog không quản lý focus như modal

**Vị trí:** `frontend/src/components/clil/MathTermPopover.tsx:184`; `frontend/src/context/LearningExperienceContext.tsx:457`.

Mobile card khai báo `role=dialog`, `aria-modal=true`, nhưng không đưa focus vào dialog, không trap Tab, không làm background inert. Mở bằng keyboard giữ focus ở trigger phía sau; Tab tiếp tục vào nội dung lesson dù backdrop đang che. `aria-modal` không tự thực hiện focus management. Sticky lesson header z400 cũng cao hơn portal z50, nên một phần background vẫn nằm trên modal.

Ở desktop, hover-card chỉ giữ mở theo pointer/pinned; không có focus-within guard. Nếu card được mở bằng hover rồi người dùng Tab vào card và rời chuột, `leavePopoverCard` có thể đóng cả vùng đang chứa focus.

**Bằng chứng:** source review của dialog và event handlers; browser interaction bị chặn bởi R1 nên không ghi là đã pass/fail test bàn phím thực tế.

**Sửa tối thiểu:** dùng modal primitive/focus scope phù hợp cho mobile, layer cao hơn lesson header, initial focus và restore; desktop nonmodal vẫn giữ mở khi focus còn trong card. Đặt dismiss logic tập trung, cleanup khi route/unmount.

**Retest:** mobile keyboard/screen reader vào dialog, Tab/Shift+Tab không thoát, Esc/close trả focus; desktop focus không bị mất khi rời pointer; background không tương tác được trong mobile modal.

## R8 — [P2] Browser tests mới không được chạy, các guard không bắt integration lỗi

**Vị trí:** `frontend/playwright.config.ts:6`; `frontend/tests/clil-pilot.spec.ts:11`, `:29`; `frontend/tsconfig.json:6`; `frontend/scripts/check-clil-content.mjs:147`.

Config giới hạn `testMatch: "tutor-workspace.spec.ts"`, nên `clil-pilot.spec.ts` không được discover. Đã chạy:

```text
pnpm exec playwright test clil-pilot.spec.ts --list
Error: No tests found.
Total: 0 tests in 0 files
```

Ngoài ra, test mới dùng `learning-mode-option-*`, `learning-mode-switch`, `math-term-popover`, `[data-clil-term-trigger="true"]`, `[data-learning-mode=...]`; các attributes này không được render bởi các CLIL components tương ứng. Sửa testMatch thôi vẫn chưa đủ chạy thành công.

`typecheck:tutor` pass vì các caller sai props nằm trong `.js` không được check (`checkJs=false`). Script CLIL chủ yếu kiểm tra source strings bằng `.includes()`/regex; nó không render component, không thực thi `validateClilLessonManifest()` như integration validator và không kiểm chứng score persistence. Vì vậy “14/14 checks passed” không xác nhận C1 runtime hoạt động.

**Sửa tối thiểu:** include CLIL test trong Playwright config/project, dùng role/label selectors ổn định hoặc bổ sung test IDs thống nhất; kiểm thử actual route. Type-check các JS boundary đã sửa bằng scoped checkJs/JSDoc hoặc migrate caller nhỏ sang TSX. Content gate phải gọi validator thật với positive/negative fixtures; source-string guard chỉ được gọi là static guard.

**Retest:** `--list` thấy đúng CLIL cases; browser smoke phát hiện R1 trước sửa và pass sau sửa; glossary/state-persistence/focus tests thực sự tương tác với DOM; report ghi command, số test, trace/screenshots và limitations chính xác.

## Kiểm tra đã thực hiện trong review

| Check | Kết quả thực tế |
| --- | --- |
| AST parse Python modified/untracked | 17 files, không SyntaxError |
| JS/JSX/TS/TSX/MJS syntax parse của frontend modified/untracked bằng TypeScript parser | 47 files, không parse diagnostics |
| `pnpm typecheck:tutor` | Pass, không type errors trong phạm vi cấu hình hiện tại |
| `node scripts/check-clil-content.mjs` | 14/14 pass; giới hạn static source checks như R8 |
| `python -B test_verify_states.py` | 22/22 pass |
| `python -B test_math_solver.py` | 25/25 pass |
| `python -B tests/test_verification_coverage.py` | 12/12 pass |
| Next dev + GET actual `/L6-C1-L1` | **HTTP500**, lỗi includes như R1 |
| Playwright CLIL discovery | **0 tests**, config loại file mới |
| Solver actual numeric sanity repro | **False verified**, diện tích999 cho rectangle3×2 |
| Explicit required coverage repro | **False verified** khi required answer còn not_checked |
| Actual `_solver_summary` function executed in isolation | Bỏ reason/scope/coverage/requestId/responseVersion/verifierVersion |
| React server-render actual term props | Span rỗng; đúng props mới có button |
| Provider initial render server vs stored-browser preference | assisted khác parallel; R6 |

Không chạy full production build, live provider benchmark hoặc kiểm thử đầy đủ mọi route. Không chạy `test_relearn_flow.py` trong lượt này vì test hiện gọi `/api/translate` với provider path thật; không dùng kết quả report cũ như kết quả rerun. Các assertion isolation DB được đọc nhưng chưa chứng nhận toàn bộ router bằng runtime test mới.

## Thứ tự sửa giao lại Antigravity

1. **R1 + R8:** sửa context/props wiring, kích hoạt actual page/browser checks để có gate đáng tin.
2. **R2 + R3:** sửa semantics verification và kiểm thử toàn bộ solver→API→UI contract; không bật reward eligibility trên verified boolean hiện tại.
3. **R4:** sửa term catalog/trigger contract ở cả glossary và answer options.
4. **R5 + R6:** auth-scoped storage và SSR hydration, có tests user switch/reload.
5. **R7:** modal/focus/layer lifecycle, kiểm tra trên mobile và bàn phím.
6. Chạy lại C1 gates với dark/paper, viewport320/390/1440, reduced motion, mode switching và quiz state; ghi metrics/screenshots thực tế. Chỉ chuyển C2 hoặc Q2/G1 sau khi các lỗi ưu tiên và gate liên quan đã được xử lý.

Các phần gamification/Blitz/Boss chưa được report C1 tuyên bố triển khai, nên không liệt kê việc chưa có chúng là bug của slice này.
