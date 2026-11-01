# BingMCB — Độ chính xác, Socratic contract và evidence cho rewards

Đây là phần bổ sung kỹ thuật cho yêu cầu nâng chất lượng tính năng, đồng thời là dependency của Eureka/XP/Mistake Vault. Đọc [master plan](IMPLEMENTATION_MASTER_PLAN.md), [CLIL](SPEC_CLIL_LEARNING.md), [gamification](SPEC_GAMIFICATION_MAP.md) và [handoff TutorWorkspace](HANDOFF_NEXT_PHASE.md).

Phân biệt bốn trạng thái: nội dung **đã sinh**, phép kiểm tra **đã chạy**, claim **đã được kiểm chứng trong phạm vi cụ thể**, và action **đủ điều kiện nhận thưởng**. Không suy ra trạng thái sau từ trạng thái trước bằng hiệu ứng UI.

## Q0. Audit nguồn và baseline

| File hiện có | Phát hiện / vai trò |
| --- | --- |
| `backend/math_solver.py` | Có deterministic checks, critic và repair. Nhánh `verify_and_repair(mode='off')` gán verified; nhánh không failed checks có thể coi là verified dù chưa chứng minh coverage |
| `backend/math_reader.py`, `backend/vision_agent.py`, `backend/vision_cache.py` | Đọc problem IR/OCR. Cần giữ source spans, constraint gốc và ambiguity; cache không được bỏ qua version/provider/parser |
| `backend/mathviz_contract.py`, `backend/geometry_construction_solver.py`, `backend/geometry_verification.py`, `backend/geometry_analytic_checks.py` | Contract hình và kiểm tra dựng hình có sẵn; kết quả đúng ở một scene không chứng minh toàn bộ lập luận đúng |
| `backend/retrieval_context.py`, `backend/retrieval_hybrid.py`, `backend/retrieval_dense.py`, `backend/math_problem_retrieval.py` | Retrieval có provenance cần giữ. Bài tương tự không phải đáp án của bài đang hỏi |
| `backend/main.py` | API orchestration/translation/quiz/rewards; translate đang tăng socratic_count; quiz client boolean chưa đủ làm reward evidence |
| `frontend/src/components/DuoMCB/DuoMCBPage.js` và `components/tutor/*` trên fetched main | Giữ request guards, action modes, active reply và một canvas như handoff trước; không đưa orchestration mới vào nhiều component riêng |
| `frontend/src/components/DuoMCB/VerificationStatusBadge.js` (local) | Reconcile component hiện có, tránh tạo badge thứ hai với semantic khác |
| `frontend/src/components/DuoMCB/SocraticHintCard.js` (local) | Hiển thị/chia đoạn không tự tạo được step rubric có thể chấm |
| `frontend/src/components/DuoMCB/SolveProgressBanner.js` (local) | Các stage suy ra từ elapsed time không chứng minh backend đang verification/drawing; cần chuyển sang lifecycle thực |
| `frontend/src/components/DuoMCB/SolutionFeedbackButton.js` (local) | Feedback người dùng hữu ích cho triage, không phải bằng chứng toán học |

### Các report trong repo, không phải kết quả đo mới

| Nguồn | Số liệu ghi trong file | Giới hạn diễn giải |
| --- | --- | --- |
| `backend/reports/hallucination_eval_summary.json` | 16/10/2026, 48 cases, 24 error +24 clean, report accuracy100% | Chỉ bộ detector này; không quảng bá chatbot đúng100% |
| `backend/reports/external_benchmark_summary.json` | 16/10/2026, 60 problems, raw55 passed, guarded57 passed, report95% | Sample nhỏ, cấu hình lịch sử; không phải SLA toàn bộ chat/OCR/geometry |
| `docs/r5_hybrid_rag_2026-10.json` | 48 queries, 59 bank rows, dense disabled; recall@3=.9756, controls FP=0; p95=.91ms | Benchmark retrieval cục bộ, không phải latency end-to-end. Không dùng baseline R0 cũ làm hiện trạng khi R5 đã có |

Antigravity phải chạy lại đúng fixture/config trước khi so sánh. Ghi commit, model/provider version, prompt version, verifier version, cache policy và ngày. Không so kết quả của hai tập câu khác nhau bằng một tỷ lệ tổng.

## Q1 — Verification có phạm vi và trạng thái trung thực

### Target Files

Sửa existing:

- `backend/math_solver.py`, `backend/main.py`.
- `backend/mathviz_contract.py`, `backend/geometry_verification.py` khi nối evidence scene.
- `frontend/src/components/DuoMCB/VerificationStatusBadge.js`, `SolveProgressBanner.js`, `DuoMCBPage.js`.
- `frontend/src/components/tutor/useTutorWorkspace.ts` sau P0, chỉ nối request lifecycle, không tạo state controller song song.
- `backend/test_verify_states.py`, `backend/test_math_solver.py`, `backend/test_chat_budget.py`.

Tạo mới `backend/verification_contract.py`, `frontend/src/types/verification.ts`, `frontend/src/components/DuoMCB/VerificationEvidencePanel.tsx`, `backend/tests/test_verification_coverage.py`.

### Props & state schema

```ts
type VerificationStatus = 'verified' | 'partial' | 'failed' | 'timeout' | 'not_applicable';
type CheckOutcome = 'pass' | 'fail' | 'unknown' | 'timeout';
type VerificationCheck = {
  checkId: string; claimId: string;
  engine: 'sympy' | 'substitution' | 'geometry-analytic' | 'schema';
  outcome: CheckOutcome; scope: string;
  assumptions: string[]; reasonCode?: string;
};
type ClaimCoverage = {
  claimId: string; kind: 'answer' | 'step' | 'constraint' | 'scene';
  required: boolean; checkIds: string[];
  outcome: CheckOutcome | 'not_checked';
};
type VerificationEnvelope = {
  schemaVersion: 1; requestId: string; responseVersion: string;
  status: VerificationStatus; verified: boolean;
  reason: 'complete' | 'disabled' | 'unsupported' | 'no_evidence' | 'conflict' | 'budget' | 'incomplete';
  checks: VerificationCheck[]; coverage: ClaimCoverage[];
  verifierVersion: string;
};
type VerificationBadgeProps = {
  result: VerificationEnvelope | null;
  requestState: 'idle' | 'sending' | 'streaming' | 'complete' | 'error';
  onShowEvidence: () => void;
};
type RequestProgress = {
  requestId: string;
  stage: 'requesting' | 'generating' | 'verifying' | 'complete' | 'failed';
  source: 'transport' | 'server-event';
};
```

Backend sử dụng typed validation contract tương đương bằng cơ chế validation đang có trong repo. `schema pass` chỉ xác nhận cấu trúc, không được tính là proof của answer/step. Critic là tín hiệu phụ để phát hiện mâu thuẫn, không tự nâng unsupported thành verified. Định nghĩa `required` từ rubric/plan kiểm chứng độc lập, không để model tùy ý bỏ claim khó khỏi danh sách.

| Điều kiện | Kết quả trả về |
| --- | --- |
| Verification off | `verified=false`, `status=not_applicable`, `reason=disabled`; giữ enum cũ để tương thích, thêm reason |
| Không check áp dụng / không evidence | `verified=false`, not_applicable hoặc partial nếu có một phần đã kiểm; reason tương ứng |
| Có fail trên claim cần thiết | failed, verified=false; sửa lại tối đa theo budget rồi kiểm lại response version mới |
| Một phần đạt, còn claim quan trọng chưa kiểm | partial, verified=false; UI nêu phạm vi đã kiểm |
| Timeout khi còn claim bắt buộc chưa xác minh | timeout, verified=false; không đổi sang pass vì không thấy fail |
| Tất cả claim toán bắt buộc trong phạm vi declared có positive evidence phù hợp, không conflict | verified=true; UI vẫn nêu phạm vi, không suy ra theorem proof từ numeric sample |

Substitution trên một vài điểm chỉ chứng minh những điểm đã thử, không chứng minh đồng nhất thức phổ quát. Geometry coordinates thỏa constraints chỉ xác nhận scene đó; không dùng sai để chứng minh mọi cấu hình. Nếu verifier không đủ năng lực cho claim phổ quát, đánh dấu partial/unsupported. Repair phải giữ số/biến/giả thiết gốc; mọi thay đổi constraint cần người dùng xác nhận lại đề, không tự “sửa đề cho đúng”.

Progress UI: nếu API hiện không stream stage events thì chỉ dùng “Đang xử lý” và lifecycle network. Chỉ hiện “Đang kiểm chứng” khi có event backend thật; “Đang dựng hình” theo renderer lifecycle riêng. Không fake phần trăm hoặc đoán stage theo số giây. Cancel/late response theo requestId; evidence cũ không gắn vào reply mới.

### Tailwind & visual spec

- Badge `inline-flex items-center gap-1.5 rounded-lg border border-line px-2 py-1 text-xs`; icon + label. Verified “Đã kiểm chứng: [phạm vi]”; partial “Đã kiểm tra một phần”; disabled “Chưa kiểm chứng”.
- Panel V-Surface/V-Type, checks dạng list có outcome và assumptions đọc được; raw debug payload ẩn khỏi luồng học bình thường.
- Không tô toàn đáp án xanh chỉ vì schema hợp lệ. Color success dùng text token đạt tương phản; failed dùng icon/text, không flashing đỏ.

### Animation spec

- Badge state crossfade opacity0→1 .12s, exit .08s; `initial={false}` cho state đã có; `layoutId` none, không morph icon thành dấu check trước receipt.
- Evidence panel M-Popover spring320/30 hoặc disclosure M-Fade; `layoutId={`verification:${requestId}`}` chỉ nếu shell được dùng như shared element thực, mặc định none.
- Spinner chỉ lúc request/verification active; reduced-motion dùng chữ tĩnh. Không spring bounce cho kết luận đúng/sai.

### Gate Q1

Regression cases bắt buộc: off, empty, no applicable check, schema-only, critic unavailable, mixed pass/fail, partially covered, timeout, repaired-and-rechecked, stale request, scene pass/answer unknown. **Không false verified** trong tập này. Backward-compatible clients không hiển thị off là verified. Dịch không làm tăng socratic_count nữa. Q1-min có thể ship riêng trước UI CLIL.

## Q2 — Socratic step có thể chấm và sự kiện học đáng tin

### Target Files

Sửa `backend/main.py`, `backend/math_solver.py`, `frontend/src/components/DuoMCB/SocraticHintCard.js`, `DuoMCBPage.js`, `frontend/src/lib/api.js` và controller Phase A sau P0. Giữ hint/solution/visualizer/video actions hiện có; không suy ra bước bằng chia paragraph.

Tạo `backend/socratic_contract.py`, `backend/services/socratic_grading.py`, `backend/routers/socratic_steps.py`, `frontend/src/types/socratic.ts`, `frontend/src/components/DuoMCB/SocraticStepAnswer.tsx`, `backend/tests/test_socratic_grading.py`.

### Props & state schema

```ts
type SocraticStepView = {
  stepId: string; stepVersion: string; problemId: string;
  prompt: { en: string; vi: string };
  skillIds: string[];
  answerMode: 'choice' | 'short-symbolic' | 'short-text' | 'open-proof';
  gradingPolicy: 'reviewed-rubric' | 'deterministic' | 'feedback-only';
  hintAvailability: 'available' | 'unavailable';
};
type SubmitStepCommand = {
  clientActionId: string; stepId: string; stepVersion: string;
  answer: { kind: SocraticStepView['answerMode']; value: string };
  // Không có isCorrect, XP, attemptIndex hay hintCount do client tự khai.
};
type StepAssessment = {
  assessmentId: string; actionId: string; stepId: string;
  decision: 'correct' | 'incorrect' | 'indeterminate';
  reasonCode: string; feedback: { en: string; vi: string };
  evidenceRefs: string[]; rubricVersion: string;
  attemptOrdinal: number; // server accepted submissions, retry cùng action không tăng
  contentHintIssuedBeforeSubmission: boolean;
  solutionIssuedBeforeSubmission: boolean;
  eligibleForEureka: boolean; // server policy, chưa đồng nghĩa đã cấp XP
};
type SocraticStepAnswerProps = {
  step: SocraticStepView; assessment: StepAssessment | null;
  pending: boolean; onSubmit: (value: string) => void;
  onRequestHint: () => void; onRevealSolution: () => void;
};
type StepUIState = {
  draft: string; draftVersion: number;
  phase: 'answering' | 'submitting' | 'feedback' | 'retryable-error';
  activeActionId: string | null;
};
```

API **đề xuất**: `POST /api/socratic/steps/{id}/attempts`, `POST /api/socratic/steps/{id}/hints`, `POST /api/socratic/steps/{id}/solution`. Server kiểm tra owner/session, step version, rate limit, allowed answer kind và payload size. Hints/solution release ghi event server trước khi gửi nội dung; client không được báo `hintCount=0` để phủ nhận lần đã cấp. Các endpoint legacy trả lời giải cũng phải ghi cùng step/problem context khi liên quan, nếu không eligibility mặc định false.

Attempt semantics: lần submit toán được server chấp nhận đầu tiên là ordinal1. Retry cùng actionId trả cùng assessment; lỗi transport retry cùng ID không tăng ordinal. Indeterminate không bị gắn là sai và không nhận Eureka; nếu cần adjudication thì update cùng assessment theo version, không tạo một “first attempt” mới. Đổi câu hỏi/step version không xóa lịch sử để farm; reward scope theo logical step/skill opportunity do server cấp.

Hỗ trợ ngôn ngữ (`language_lookup`, `xray_view`, `polish_applied`) không phải content hint. Tuy vậy assessment có thể cấm term định nghĩa trùng đáp án; policy phải đặt từ đầu, không âm thầm phạt sau khi học viên tra từ. Một bài proof mở chỉ feedback-only cho tới khi có rubric/check đủ phạm vi; model tự nói “đúng” không sinh reward evidence.

`eligibleForEureka=true` chỉ khi first accepted submission correct, policy không phải feedback-only, evidence đủ scope, chưa cấp hint toán/solution trước submit và opportunity còn hợp lệ. Reward service G1 kiểm tra lại policy/uniqueness rồi cấp receipt. Token/UI state không phải authority.

Socratic teaching flow: hỏi một bước phù hợp misconception hiện tại, đợi câu trả lời, trả phản hồi ngắn và gợi ý tăng dần theo yêu cầu. Không trả toàn lời giải trong trường `feedback` của một câu sai. Không yêu cầu lưu chain-of-thought nội bộ; chỉ lưu prompt/bước sư phạm, đáp án và evidence cần cho audit.

### Tailwind & animation

- Step card V-Card, prompt V-Type, answer input border-line-strong min-h11; assistance toolbar tách “Tra thuật ngữ” khỏi “Gợi ý toán”.
- Pending submit giữ draft, disable nút duplicate nhưng vẫn cho đọc/tra từ; error có retry, không reset quiz.
- Step enter M-Fade spring320/30, initial y6/opacity0, animate y0/opacity1, exit opacity0 .1s; key stepId+version, `layoutId` none. Không exit/remount input khi chỉ assessment đổi.
- Hint disclosure opacity .12s, no height spring lớn; correct indicator scale .96→1 spring380/32. Eureka animation thuộc G7, không tự phát ở card trước reward receipt.

### Gate Q2

Không thể nhận đúng/XP bằng sửa client payload. Hint request và submit đồng thời có thứ tự quyết định bằng transaction/server sequence; test cả hai thứ tự. Duplicate/double click/reconnect trả cùng assessment, không hai attempt. Unsupported proof có phản hồi trung thực, không false incorrect. Case EN/VI tương đương nhận cùng rubric outcome; protected math invariants từ C3 được giữ.

## Q3 — Accuracy theo chức năng: OCR, retrieval, toán và scene

### Target Files

Sửa có phạm vi `backend/math_reader.py`, `backend/vision_agent.py`, `backend/vision_cache.py`, `backend/retrieval_context.py`, `backend/retrieval_hybrid.py`, `backend/math_problem_retrieval.py`, `backend/mathviz_contract.py`, `backend/geometry_analytic_checks.py`; UI `DuoMCBPage.js`, `StreamdownMessage.jsx`, `SolutionFeedbackButton.js` và scene adapters đã có.

Tạo `backend/quality_trace.py`, `frontend/src/components/DuoMCB/ProblemReadback.tsx`, `SourceEvidenceList.tsx`, `frontend/src/types/problemEvidence.ts`. Không refactor toàn backend cùng lượt: Q3a input, Q3b retrieval, Q3c scene là ba PR/slice độc lập với gate riêng.

### Props & state schema

```ts
type ProblemReadback = {
  problemId: string; version: string;
  extractedText: string;
  ambiguities: { id: string; sourceSpan: string; candidates: string[]; resolvedValue?: string }[];
  constraints: { id: string; text: string; source: 'user' | 'ocr-confirmed' }[];
  needsConfirmation: boolean;
};
type RetrievalEvidence = {
  sourceId: string; sourceVersion: string; title: string;
  relevance: 'exact-problem' | 'similar-example' | 'concept';
  locator?: string; // nội bộ hoặc URL đã validate, không URL model bịa
};
type ProblemReadbackProps = {
  value: ProblemReadback;
  onConfirm: (version: string, resolutions: Record<string, string>) => void;
};
type SourceEvidenceProps = { items: RetrievalEvidence[]; open: boolean; onToggle: () => void };
// UI state: editingAmbiguityId, draftResolution, confirmationPending, requestVersion.
```

| Luồng | Cải tiến cụ thể | Gate riêng |
| --- | --- | --- |
| Q3a OCR/input | Đánh dấu ambiguous symbols/relations; khi ambiguity ảnh hưởng đáp án, hiện readback để xác nhận trước giải. Không suy dấu góc/song song từ hình không đánh dấu. Cache key gồm input hash, extraction version và scope phù hợp | Fixture ảnh mờ, dấu âm, phân số, ∈/∉ và hình thiếu dữ kiện; không silently đổi constraint; confirm version cũ bị từ chối |
| Q3b Retrieval | Giữ source IDs, phân biệt exact/similar/concept; query có grade/domain/language filters khi có metadata; abstain nếu ngoài coverage. Nội dung retrieved là dữ liệu, không instruction thay policy | R5 fixture và holdout tách biệt; controls FP không tăng; không copy đáp án bài tương tự có số khác; citations trỏ record thật |
| Q3c Solver/geometry | Chạy checks đúng domain, nêu assumptions; scene schema, finite coordinates, nondegeneracy, constraint residual và viewport checks. Chỉ render scene đạt structural/geometry gate hoặc fallback giải thích | Scene stale không thay canvas mới; không duplicate renderer; unsupported geometry không được vẽ như đã chính xác |
| Q3d Feedback triage | Feedback gắn responseVersion, verifierVersion, user-provided correction; phân loại OCR/math/translation/scene. Không tự đưa sửa của user vào gold set | Reproducible issue, có review trước thay rubric/content; không dùng rating tích cực làm proof |

### Visual & motion

- Readback V-Surface; ambiguous spans underline + label “Cần xác nhận”, input V-Control; không chỉ highlight bằng màu. Source list `text-sm leading-6`, tên nguồn rõ và scope “Ví dụ tương tự”.
- Readback M-Fade spring320/30; confirm result opacity .12s; `layoutId` none. Sources disclosure M-Fade opacity-only .12s, no shared element. Scene giữ animation/lifecycle hiện có theo handoff B1, không tái dựng canvas khi mở sources/readback.

### Evaluation gate và lệnh dự kiến

Các lệnh sau là hướng dẫn cho lúc triển khai, **chưa được chạy trong lượt lập kế hoạch**. Kiểm tra `--help`/entrypoint trước chạy; giữ working directory backend phù hợp.

- Offline state/budget: `python test_verify_states.py`, `python test_chat_budget.py`.
- Detector fixture: `python tests/eval_hallucination.py --offline-only`.
- RAG: `python tests/eval_rag.py --json <report-path>` với config cùng baseline R5; report mới không ghi đè historical baseline.
- Các test math/reader/geometry/translation/relearn hiện hữu: đọc runner và dependency trước chạy; nhóm import main bắt buộc DB tạm như P0.
- `tests/eval_external_benchmark.py` gọi provider; không có flag `--offline-only` được xác nhận. Chỉ chạy theo ngân sách/provider đã cấu hình và đúng các options script hỗ trợ; không giả định chạy offline miễn phí.

Gate chất lượng theo mức nghiêm trọng: 0 false-verified ở các regression bắt buộc, 0 thay constraint âm thầm, 0 client-authoritative reward, không regression gold fixtures. Với tập lớn hơn ghi confusion matrix, coverage/abstention và latency cùng accuracy; không tăng accuracy bằng loại bỏ ca khó khỏi denominator. Không đặt SLA 95% toàn sản phẩm từ snapshot60 câu.

Latency budget lấy baseline đo thực trong P0; tối đa một repair retry theo policy hiện có, timeout có trạng thái thật. Không tăng số vòng gọi model không giới hạn để đạt demo. Telemetry chỉ lưu event/evidence tối thiểu cần debug, không đưa raw transcript học sinh vào leaderboard hoặc log công khai.

Rollback: có thể tắt model-assisted features và giữ deterministic/core flow; không rollback fix `off→not verified`, provenance hoặc request isolation. Tắt reward eligibility nếu grading service chưa đạt gate; không hiển thị XP pending thành XP đã nhận.
