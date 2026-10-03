# HANDOFF — HybridRAG R0–R4 (DuoMath)

**Purpose:** hand this repo to another agent. Read this file first, then
`DUOMATH_HYBRIDRAG_PLAN.md` (the plan) and `docs/baseline_rag_2026-10.md` (all
measured numbers, §1–§8).

**Written:** 2026-10, at commit `863b13b`.

---

## 0. TL;DR for the next agent

| | |
|---|---|
| Phases COMPLETE and committed | **R0, R1, R2, R3** (+ a security fix and a PDF cleanup) |
| Phase IN PROGRESS, **UNCOMMITTED** | **R4** — `backend/retrieval_context.py` exists and works, but has **no test, is not wired into `main.py`, is not in CI, is not committed** |
| Commits ahead of `origin/main` | **11**, **NOT pushed** |
| Offline suites | **36 / 36 PASS, 0 FAIL** (with dense **off**, which is the default) |
| Nothing in R0–R3 changes production behaviour | every new flag defaults to `off`; `main.py` was touched **only** by R1 (parity-proven) |

**The single most important sentence:** everything measured so far is on an
**offline harness**, not on the live chat path. `main.py`'s `chat()` still calls
only `retrieve_math_context` (the 13-node concept graph). R4 is the phase that
connects the new retrieval to students — and it is half done.

---

## 1. What exists now (R0–R3), with the numbers

Retrieval harness: `backend/tests/eval_rag.py` + `backend/tests/rag_golden_set.json`
(16 queries: 13 `must_find`, 2 `nothing` off-topic, 1 `no_examples`).

```powershell
python backend/tests/eval_rag.py --mode sparse   # R0: TF-IDF only
python backend/tests/eval_rag.py --mode hybrid   # R2 (+R3 if the dense flag is on)
python backend/tests/eval_rag.py --mode auto     # default: follows the flags
```

| Metric | R0 sparse | R2 hybrid | R3 + dense |
|---|---|---|---|
| Recall@1 | 0.846 | 0.846 | **1.000** |
| Recall@3 | 1.000 | 0.923 | **1.000** |
| MRR | 0.910 | 0.872 | **1.000** |
| nDCG@5 | 0.933 | 0.885 | **1.000** |
| false positives, off-topic | 1/2 | 0/2 | **0/2** |
| false positives, unrelated example | 1/1 | 0/1 | **0/1** |
| concept recall on the uncovered query | 0.000 | 1.000 | **1.000** |
| latency p50 | 0.1 ms | 0.2 ms | **818 ms** |

### Per-phase inventory (new files)

| Phase | Files | Verified by |
|---|---|---|
| **R1** concept graph out of `main.py` | `backend/math_concepts.py` (191), `backend/data/math_concepts.json`, `backend/test_math_concepts.py` (250), `backend/tests/math_concepts_golden.json` | 40/40 |
| **R2** multi-source fusion | `backend/retrieval_hybrid.py` (310), `backend/test_retrieval_hybrid.py` (299) | 51/51 |
| **R3** dense, torch-free | `backend/retrieval_dense.py` (496), `backend/test_retrieval_dense.py` (680), `backend/scripts/check_embed_catalog.py` (213) | 116/116 |
| **R4** role-shaped context | `backend/retrieval_context.py` (335) | **NONE — not committed** |
| harness | `backend/tests/eval_rag.py`, `backend/tests/rag_golden_set.json` | exit 0 |
| evidence | `docs/baseline_rag_2026-10.md` (+`.json`), `docs/r2_hybrid_rag_2026-10.json`, `docs/r3_dense_rag_2026-10.json`, `docs/embed_catalog_2026-10.json` | script-generated |

### Commit list (11 ahead of origin)

```
863b13b feat(rag): R3 dense remote torch-free + probe catalog + nguong cosine do duoc (dot R3)
0b5ee0d feat(rag): R2 fusion nhieu nguon + guard false-positive + BM25 opt-in (dot R2)
263e1c7 chore(cleanup): xoa 4 PDF da sinh + 5 generator PDF rieng + 3 html report; go reportlab (dot 4I)
3fe8092 refactor(rag): R1 tach concept graph khoi main.py + sua render khong tat dinh (dot R1)
bd7dd72 docs(rag): R0 baseline + ke hoach HybridRAG (do truoc khi sua)
f305bcb docs(phase4): ghi lai dot 8/4I
9d12540 fix(phase4): tach extract MathViz + theme + token gauges (P15-fix/P10)
38c733f feat(phase4): tang guard/pool/meter + 9 cong offline noi vao CI (P2/P3/P5/P10/P11/P12)
4666fa3 fix(phase4): go engine Konva - hop dong tu vung mot nguon su that (dot 8/4I)
43398aa fix(phase4): ngan sach chat + sua duong tinh gia cong audit_bound_names (dot 8/4I)
664fd5b chore(security): chan file dump khoa .env.bak_keys khoi git (dot 4I)
```
(The last six are the pre-existing "Đợt 4I" working-tree work that was committed in
6 logical groups before R0 started — see §6.)

---

## 2. R4 — exactly what is done and what is missing

### 2.1 Done

`backend/retrieval_context.py` (335 lines, **untracked**) implements six role
slices, each returning `(text, meta)` where `meta` has
`role, tier, chars, cap, truncated, ids, sources, enabled`:

| role | function | what it deliberately contains / excludes |
|---|---|---|
| `reader` | `slice_for_reader(query, cv_hints, tier)` | concept NAMES + formula HEAD + CV hints, **`with_solutions=False`** — a transcriber that can see a worked solution may read numbers that are not in the photo |
| `solver` | `slice_for_solver(query, tier)` | formula cards + worked example + its approach |
| `critic` | `slice_for_critic(query, tier)` | a property **checklist** (`☐ …`) built from the node's `formulas`; no worked example |
| `repair` | `slice_for_repair(widget, tier)` | `mathviz_contract.repair_vocabulary()` — **not** a second copy of the vocabulary |
| `translate` | `slice_for_translate(query, tier)` | vi = en glossary from `name`/`english_name` |
| `chat` | `slice_for_chat(query, tier, widget, cv_hints)` | the fused block, **tier-capped** |

Also present: `enabled()` (allowlist on `MATH_RETRIEVAL_CONTEXT`, default **off**),
`cap_for(tier)` (1800/4200/7000, env-overridable, clamped to `[200, 20000]`),
`build(role, …)` (never raises; unknown role → empty slice + `unknown_role:<r>`),
`summary(meta)` (one log line, ids not text), `SLICES` registry.

**Manually smoke-tested** (two scratch scripts, not committed):
- `reader` on `"tính đạo hàm của hàm số f(x)"` → 137 chars, **does not contain the
  worked solution** ✓
- `critic` → the formula bullets as `☐` items ✓
- `translate` → `Đạo hàm = Derivative` ✓
- `chat` with `MATH_RETRIEVAL_MAX_CHARS_SIMPLE=300` → `truncated=True`, text ends
  with `TRUNCATION_MARK` ✓
- unknown role → empty + reason ✓
- `build("repair", widget="geometry_2d")` → 578 chars from the contract ✓

### 2.2 NOT done (the actual remaining work for R4)

1. **`backend/test_retrieval_context.py` does not exist.** Every other phase has a
   suite; this one has none. Use the `check(label, condition, detail)` harness
   pattern from `test_retrieval_hybrid.py` / `test_retrieval_dense.py`.
2. **Not wired into `main.py`.**
3. **Not in `.github/workflows/quality-gate.yml`.**
4. **Not committed.**

### 2.3 ⚠️ THE TRAP — `_cv_hints` is not always bound

`main.py:3850` binds `_cv_hints = {}` **inside `if image_data:` (8-space indent)**.
Its only other use, `main.py:4117`, is *also* inside that same `if`. So today a
**text-only** request never has `_cv_hints` — and that is fine, because nothing at
the outer level reads it.

**If you insert the R4 call at the 4-space level (where the retrieval block lives,
~line 4056–4075) and pass `_cv_hints`, every text-only request raises `NameError`.**

Safe options, best first:
- pass `locals().get("_cv_hints")` (no change to existing code), **or**
- bind `_cv_hints = {}` near the top of `chat()` (one added line in existing code).

`python scripts/audit_bound_names.py` is the guard for exactly this class of bug and
**will** flag a name used in your inserted window that is not bound earlier. Run it.

### 2.4 Where to wire it (verified line numbers; `main.py` = 10 572 lines)

```
3748  async def chat(request: Request):
3850          _cv_hints = {}                     <- inside `if image_data:`
4056      _retrieval_budget = _plan["retrieval"] or chat_budget.CHAT_RETRIEVAL_BUDGET_S
4057-64      retrieved_kb       = await asyncio.wait_for(asyncio.to_thread(retrieve_math_context, user_message), timeout=_budget.clamp(_retrieval_budget))
4065-73      retrieved_examples = await asyncio.wait_for(asyncio.to_thread(retrieve_similar_problems, user_message, 2), timeout=_budget.clamp(_retrieval_budget))
4074-75      if retrieved_examples: retrieved_kb = f"{retrieved_kb}\n\n{retrieved_examples}"
4076-84      full_system_prompt = f"{system_prompt}\n\n## REFERENCE MATHEMATICAL KNOWLEDGE …{retrieved_kb}"
4240      _gen_left = _budget.clamp(_gen_budget)
4250      _partial_note = ""
```

**Recommended minimal change** (one call, inside `try/except`, no early `return`):
when `retrieval_context.enabled()`, produce the `chat` slice and prefer it over the
two legacy calls; when the flag is off, leave both legacy paths exactly as they are.
Keep the existing `_budget.clamp(_retrieval_budget)` wrapping on any new awaitable.

> **`test_chat_budget.py:332`** asserts a budget-sum invariant written as
> `plan["generate"] + 2 * plan["retrieval"]` — retrieval is counted **twice** today
> (KB + problem bank). **If R4 adds a third retrieval stage, update that test in the
> same commit.** `test_chat_budget.py:416–418` uses `MAIN.count(...) >= 2`, so a
> third occurrence is fine there.

---

## 3. R3 facts the next agent must not re-derive

### 3.1 The ladder was MEASURED, and the plan's original choice was wrong

`backend/scripts/check_embed_catalog.py` (committed; exit 0 when every provider that
has a key answers):

| model / endpoint | measured |
|---|---|
| `nvidia/nv-embedqa-e5-v5` — **the plan's proposed primary** | ❌ **HTTP 410, end-of-life 2026-08-25** |
| `nvidia/nv-embedqa-mistral-7b-v2` | ❌ 404 not enabled for the account |
| `nvidia/llama-3.2-nv-embedqa-1b-v1` | ❌ 404 not enabled |
| `nvidia/embed-qa-4` | ❌ 404 not enabled |
| `nvidia/nemotron-3-embed-1b` | ✅ 200, dim **2048** |
| `gemini-embedding-001` | ✅ 200, dim **3072** (`outputDimensionality=768` honoured) |
| `/v1/ranking`, `/v1/reranking` | ❌ **404 — no rerank endpoint exists** |

⇒ **Gemini primary, NVIDIA secondary, OpenRouter last; NO rerank stage.** Do not
re-add one without a working endpoint.

### 3.2 The cosine floor is 0.65, and the band is measured + pinned

```
on-topic query, correct document  : 0.719 .. 0.855   (weakest = Q09)
off-topic / uncovered, best wrong : 0.546 .. 0.596   (strongest = Q15)
```
Floor sweep: `[0.60, 0.70]` keeps 13/13 recall and 0 FP; 0.75 starts losing hits.
`test_retrieval_dense.py` pins those two constants (`MEASURED_ON_TOPIC_LOW`,
`MEASURED_OFF_TOPIC_HIGH`), so lowering the floor fails the suite first.

### 3.3 Reproducing the dense numbers (needs a key ⇒ NOT in CI)

```powershell
$env:MATH_RETRIEVAL_DENSE='gemini'
$env:GEMINI_API_KEY=<key>
python backend/scripts/check_embed_catalog.py --json docs/embed_catalog_2026-10.json
python backend/tests/eval_rag.py --mode hybrid --json docs/r3_dense_rag_2026-10.json
```
The first run needs network for the query embeddings; the document matrix lands in
`backend/data/retrieval_vectors.db` (gitignored) and later runs are faster.
**Known cost ≈ 818 ms per query** — inside the 10 s retrieval budget and it runs
under `asyncio.to_thread` (does not block the event loop), but it is ~4000× the R2
latency. If dense is enabled on Render, watch `chat_budgets_s` on `/api/health`.

### 3.4 No new dependency, by design

Encoder is **remote**; the client is `httpx` (already in `requirements.txt`).
`requirements.txt` was **not changed** for R0–R3. `test_retrieval_dense.py` asserts
the module does not import `torch`/`sentence_transformers`, and `test_chat_budget.py`
independently pins sentence-transformers out of the requirements file. Root cause:
the 2026-09-28 incident (torch froze the single worker → platform 502 → the browser
reported it as a CORS failure).

### 3.5 Cache key covers the whole vector identity

`sha256(provider + model + dim + input_type + text)`. `model` and `dim` are in the
key because Gemini's own docs say `gemini-embedding-001` and `gemini-embedding-2`
are **not comparable** and that switching models requires re-embedding everything —
a key missing the model would silently reuse a vector from another space.

---

## 4. Known limitations — do NOT paper over these

### 4.1 The concept graph has no geometry node (reader/critic/translate are empty for geometry)

Nodes: `biet_thuc_delta, cuc_tri, dao_ham, gioi_han, ham_so_luong_giac,
he_thuc_vi_et, hinh_hoc_khong_gian, phuong_trinh_bac_hai, so_phuc, tich_phan,
tiem_can, to_hop_chinh_hop, xac_suat` — algebra/calculus/probability only.
**A geometry query matches nothing**, so `slice_for_reader/critic/translate` return
`""` for exactly the queries most students send. That is a **DATA** gap (R5), not an
R4 bug. `slice_for_chat` still works for geometry because the worked-example and
dense sources do match. Do not "fix" it by loosening the matcher.

### 4.2 The matcher is diacritic-sensitive (pre-existing; pinned by R1)

`find_entities("Cho tam giac ABC nhon truc tam")` → `[]`; the accented form matches.
`test_math_concepts.py` pins this as the pre-move behaviour. Changing it is a
**routing** change (it feeds `GRAPHABLE_CONCEPT_IDS`) and needs its own evidence.

### 4.3 Q11's worked example is still absent in R2 — intentional and pinned

`test_retrieval_hybrid.py::test_the_lexical_ceiling_is_pinned` asserts the sparse path
*did* have a candidate for Q11 and that the guard *removed* it. Dense (R3) recovers
it. Do not loosen `MATH_RETRIEVAL_MIN_OVERLAP` to "fix" R2 — that re-admits the two
false positives the guard exists to remove.

### 4.4 MMR was deliberately deferred

The plan's R2 spec said "MMR + cap". Only cap + key dedup shipped: on the current bank
the results contain no near-duplicate group, so MMR would be unevidenced code.
Revisit in R5.

### 4.5 Not verified at all

- The **7 frontend guards** (`frontend/scripts/check-*.mjs`), `tsc`, `pnpm build` —
  they need `pnpm install` in `frontend/`, never run here.
- **R4 has no test at all** (§2.2).
- Nothing has been **pushed**, so CI has never run on these 11 commits.

---

## 5. Non-negotiable rules for any change here

These came from real incidents in this repo. Breaking one is how the project lost a
day before.

1. **Never `git add -A` / `git add .`** — always explicit paths. A file named
   `backend/.env.bak_keys` was once sitting untracked with **six live secrets** and
   matched no ignore rule; `git add -A` would have pushed them into history forever.
   `.env.bak_keys` + `*.bak_keys` are now ignored, and the file was **never**
   committed (verified), so no history rewrite was needed. Commit `664fd5b`.
2. **Scan before every commit, and check the staged list by eye.** Known **false
   positives** to ignore: `backend/main.py:32` (a regex that *masks* keys) and
   `DUOMATH_HYBRIDRAG_PLAN.md:139` (the scan pattern written in prose).
3. **Secrets only via dashboards** — Render and Vercel environment variables,
   server-side. Never `NEXT_PUBLIC_` for a key. The Vercel route
   `frontend/src/app/api/learning-feedback/route.js` reads `OPENROUTER_API_KEY`,
   `GROQ_API_KEY`, `SELF_URL` and **`OPENROUTER_FEEDBACK_MODELS`** (that last one
   appears in no `.env.example`; it has a working default in code, so leaving it
   unset is correct).
4. **Do not add a heavy dependency.** No `torch`, no `sentence-transformers` in
   `requirements.txt` (`test_chat_budget.py` fails if you do).
5. **Anything CPU-bound goes through `asyncio.to_thread`** in the request path.
6. **A new vocab / kind needs one source of truth + a mirror + a parity gate.**
   Pattern to copy: `mathviz_contract.py` ↔ `lib/mathvizKinds.js` ↔
   `frontend/scripts/check-mathviz-kinds.mjs`.
7. **Every new test must be added to `.github/workflows/quality-gate.yml`** in the
   `offline-suites` job (currently **26 steps**).
8. **Do not rename or reorder models.** If a slug dies, run
   `python backend/scripts/check_free_catalog.py` and report it — do not substitute.
9. **No number in a report that a script did not produce.** If something was not run,
   say "not run".

---

## 6. Commands that actually work here

Windows, PowerShell. The venv is one level **above** the repo:

```
repo  : C:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam
python: C:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\.venv\Scripts\python.exe
```

```powershell
$py='C:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\.venv\Scripts\python.exe'
cd 'C:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\backend'
$env:PYTHONIOENCODING='utf-8'      # else Vietnamese output raises UnicodeEncodeError
& $py -B test_retrieval_dense.py   # -B so no __pycache__ is written
```

Gotchas hit repeatedly:
- **`PYTHONIOENCODING=utf-8` is required** for anything printing Vietnamese, or the
  console codec (`cp1252`) raises `UnicodeEncodeError`.
- **PowerShell treats `git`'s stderr (LF→CRLF warnings) as an error** and aborts the
  rest of a chained command. Add `2>&1 | Where-Object { $_ -notmatch 'warning:' }` or
  set `$ErrorActionPreference='Continue'`.
- **`Measure-Object -Line` under-counts** `main.py` (9641 vs the true `.Count` =
  **10572**, it skips blank lines). Use `(Get-Content f).Count`.
- To see only failures: `& $py -B <suite> 2>&1 | Select-String 'FAIL|checks passed'`.
- A runner exists that executes every suite and writes
  `%TEMP%\_r1_suite_summary.txt` (36 items today). **Add
  `test_retrieval_context.py` to its `SUITES` list** when that suite exists.

### Current suite status (dense OFF = the default)

**36 / 36 PASS, 0 FAIL** — 31 backend suites + `tests/eval_math_regression.py`
(30/30, 100 %) + `scripts/audit_bound_names.py` + `--selftest` + `tests/eval_rag.py`.
Highlights: `test_chat_budget.py` 154/154, `test_geogebra_export.py` 91/91,
`test_retrieval_dense.py` 116/116, `test_retrieval_hybrid.py` 51/51,
`test_math_concepts.py` 40/40.

---

## 7. Remaining work, in dependency order

### R4 — finish what is started (highest priority)
1. Write `backend/test_retrieval_context.py`. It must assert at least:
   - flag off ⇒ every slice is `""` and `meta["enabled"] is False` (pipeline unchanged)
   - flag on ⇒ `chat`/`solver` contain a worked solution and **`reader` never does**
     ← the whole reason the module exists
   - `critic` output is a checklist derived from `formulas`, carrying no solution
   - `cap_for` clamps, is env-overridable, falls back on a non-numeric value; forced
     truncation sets `truncated=True` and appends `TRUNCATION_MARK`
   - `build()` with an unknown role returns empty + a reason and does **not** raise
   - every role in `SLICES` is implemented and matches the documented table
   - the module does not import `main.py`
2. Wire it into `main.py` per §2.4 — **handling the `_cv_hints` trap**.
3. Add the step to `quality-gate.yml`.
4. Run `audit_bound_names.py` (and `--selftest`) plus the full 36-suite runner.
5. Commit.

### R5 — expand the DATA (the real lever; §4.1 is why)
- Worked-example bank **6 → ~55 → 130** problems, written fresh, `source` recorded,
  never copied from a textbook.
- **Concept-graph nodes for geometry / Olympiad**: power of a point, radical axis,
  Euler line, nine-point circle, Simson, harmonic quadrilateral, inversion… each with
  a `viz_template`. **This is what makes `reader`/`critic`/`translate` non-empty for
  the queries students actually send.**
- Expect Recall@k to **fall** once the bank grows past `top_k` — that is the metric
  becoming meaningful, not a regression.
- Revisit MMR here (§4.4).
- Extend `ai_quality_log` with `retrieval_sources`, `context_chars`, `dense_hit`.

### R6 — LightRAG gate (only if R5's numbers demand it)
`lightrag-hku`'s core needs no torch, but it pulls `pandas`, `tiktoken`,
`google-genai`, `pipmaster`, `pypinyin`, `xlsxwriter`, and its ingestion calls an LLM
**per chunk** — unaffordable against `OPENROUTER_DAILY_BUDGET=800`. Use it as an
**offline builder** that writes `math_concepts.json`, never at runtime, and only after
measuring RSS / image size / LLM-calls-per-ingest on the real Render instance.

### Independent / not started
- **Push the 11 commits** and let CI run — nothing has been pushed.
- Run `pnpm install && pnpm build && npx tsc -p tsconfig.syntax.json` in `frontend/`
  to close the "7 FE guards unverified" gap.
- **Key rotation** was declined by the owner. One OpenRouter key was pasted into a chat
  transcript, and `OPENROUTER_DAILY_BUDGET` caps request count, not spend. Re-raise it
  once with that reasoning, then drop it.

---

## 8. Where the truth lives

| Question | File |
|---|---|
| Why this architecture, and what was rejected | `DUOMATH_HYBRIDRAG_PLAN.md` |
| Every measured number, per phase | `docs/baseline_rag_2026-10.md` (§1–§8) |
| Which embedding endpoint actually exists | `docs/embed_catalog_2026-10.json` |
| R2 / R3 machine-readable results | `docs/r2_hybrid_rag_2026-10.json`, `docs/r3_dense_rag_2026-10.json` |
| How R1 proved parity with the pre-move code | `backend/tests/math_concepts_golden.json` |
| The golden queries and what each expects | `backend/tests/rag_golden_set.json` |
| Repo conventions the tests enforce | `backend/test_chat_budget.py` (wiring pins), `backend/scripts/audit_bound_names.py` (bound-name guard) |

For the older, non-RAG context (the "Đợt 4I" work that preceded R0, the `mathviz.v1`
contract, the request-budget architecture), read `BAO_CAO_TIEN_DO_THANG_10_2026.md`,
`ARCHITECTURE_AND_INFRASTRUCTURE.md`, and the plan file that started all of this,
`DUOMATH_PLAN_CHO_CLINE.md`.

---

## 9. One-paragraph orientation

The original plan (`DUOMATH_PLAN_CHO_CLINE.md`) proposed rebuilding RAG around
LightRAG + pgvector + a local transformer and a reranker. An audit against the real
code found that most of the infrastructure already existed (RRF, a concept graph, a
budget/tiering system, a degrade-safe embedding slot) and that the actual defect was
**data** (6 worked examples, 13 concepts, no geometry node) plus **precision**
(sparse retrieval returned a worked example for off-topic questions). So this work
proceeded in measured steps — extract, fuse, add dense remotely, then shape context
per model role — with every claim produced by a script and every flag defaulting to
off. **The remaining 20 % is exactly R4's wiring plus R5's data**, and R5 is the part
that changes what students experience.