# DUOMATH — Kế hoạch tích hợp HybridRAG (giữ nguyên vai trò model)

Trạng thái: **R0 hoàn tất** — baseline đã đo và ghi tại `docs/baseline_rag_2026-10.md`
(+ `docs/baseline_rag_2026-10.json`).

Tài liệu này thay thế phần RAG của `DUOMATH_PLAN_CHO_CLINE.md` (mục "Phase 7 — RAG"),
có tính đến những gì **đã kiểm chứng trực tiếp trong mã** thay vì mô tả trong tài liệu.

---

## 0. Kết luận audit (đã kiểm chứng, kèm `file:line`)

| Giả định phổ biến | Sự thật trong repo |
|---|---|
| "Repo dùng LightRAG" | `MATH_CONCEPT_GRAPH` (`main.py:980–1113`) là một dict **13 node / 10 cạnh** viết tay; `/api/health` chỉ *đặt tên* là `lightrag_nodes`/`lightrag_edges` |
| "HybridRAG đang chạy" | `retrieve_math_context()` (`main.py:2272–2334`, `@lru_cache(128)`) chỉ duyệt graph; `math_problem_retrieval.py` có TF-IDF + RRF `k=60` + nửa dense **bị tắt ở production** |
| "Cần pgvector/HNSW" | Vấn đề là **thiếu dữ liệu**: ngân hàng đề **6 dòng**, graph **13 node** |
| "Cần thêm hạ tầng" | Budget (`chat_budget.py`), tiering (`diagram_complexity.plan_for()`), cache (`lru_cache`), degrade-an-toàn (`EmbeddingBackend`) **đã có sẵn** |

**Kết luận:** đây là bài toán **dữ liệu + xếp hạng**, không phải bài toán hạ tầng.
Xây lại từ đầu sẽ tạo hệ song song và phá thứ đang chạy tốt.

---

## 1. Quyết định đã khoá

| Hạng mục | Chốt | Lý do |
|---|---|---|
| Kiến trúc | **HybridRAG in-repo**, tái dùng `_reciprocal_rank_fusion` có sẵn | RRF/sparse/dense-slot/graph đã tồn tại; không thêm hệ song song |
| Package `lightrag-hku` | **KHÔNG** đưa vào `requirements.txt` | Core cần `pandas`, `tiktoken`, `google-genai`, `pipmaster`, `pypinyin`, `xlsxwriter`; và ingestion gọi LLM **mỗi chunk** ⇒ không trả được với `OPENROUTER_DAILY_BUDGET=800` |
| Vai trò LightRAG | Chỉ dùng làm **builder offline** ở R6, export JSON cho production | Giữ 0 dependency mới lúc chạy |
| DENSE | `nvidia/nv-embedqa-e5-v5` → `gemini-embedding-001` → OpenRouter (tuỳ chọn) → `off` | Xem §2 |
| RERANK | `nvidia/nv-rerankqa-mistral-4b-v3`, **cùng khoá NVIDIA**, chỉ tier `extreme` | Không mượn vai trò `MATH_CRITIC_MODEL` |
| CEREBRAS | **Không** vào đường dense | Cerebras chỉ phục vụ LLM inference (không có endpoint embeddings) — `CEREBRAS_CHAT_MODELS` giữ nguyên |
| Mặc định | Mọi cờ mới = `off` | Tắt là hành vi hôm nay y hệt ⇒ rollback 1 dòng |
| Secret | **Không** ghi khoá vào file tracked | Xem §6 |

---

## 2. Nhà cung cấp cho nửa DENSE — vì sao NVIDIA đứng đầu

**Điểm kỹ thuật then chốt: model chat ≠ model embedding.** `GEMINI_MODEL`,
`CEREBRAS_CHAT_MODELS`, `NVIDIA_MATH_MODELS`, `GROQ_CHAT_MODELS` đều là model **sinh văn bản**
(`:generateContent` / `/chat/completions`) — chúng **không trả vector**. Embedding là
**endpoint khác**, model id khác, quota khác.

| Provider | Khoá đã có trong repo | Endpoint embeddings | Reranker | Vai trò |
|---|---|---|---|---|
| **NVIDIA NIM** | `NVIDIA_API_KEY_PRIMARY/SECONDARY` → `NVIDIA_KEY_POOL` (`main.py:767`) | ✅ `POST https://integrate.api.nvidia.com/v1/embeddings` — OpenAI-compatible, `input_type=passage\|query` | ✅ `nvidia/nv-rerankqa-mistral-4b-v3` **cùng khoá/base** | **PRIMARY** |
| **Gemini** | `GEMINI_API_KEY` (`render.yaml:42`) | ✅ `:embedContent` / `:batchEmbedContents`, `gemini-embedding-001` (`task_type`) | ✗ | **SECONDARY** |
| **Cerebras** | `CEREBRAS_API_KEY` | ✗ không có | ✗ | giữ vai trò chat |
| **OpenRouter** | `OPENROUTER_API_KEY` | ✅ `/api/v1/embeddings` (chưa rõ free tier; lỗi `402`) | ✗ | tuỳ chọn cuối |

**Vì sao NVIDIA primary:** (1) không thêm secret/vendor — `NVIDIA_KEY_POOL` đã có rotation 2 khoá;
(2) **cùng base URL** `https://integrate.api.nvidia.com/v1` như tầng math reasoning (`main.py:766`)
⇒ chỉ đổi path, tái dùng `key_pool.headers_for()`/`note_response()`;
(3) **reranker cùng khoá** ⇒ bỏ hẳn ý "mượn `MATH_CRITIC_MODEL` để rerank";
(4) `input_type=passage|query` đúng chuẩn — NVIDIA docs ghi rõ dùng sai thì "large drops in
retrieval accuracy".

**Cache key BẮT BUỘC gồm model id:** `sha256(provider + model + input_type + text)`.
Lý do cụ thể: tài liệu Gemini ghi rõ vector của `gemini-embedding-001` và `gemini-embedding-2`
**không tương thích** — trộn là hỏng âm thầm, không báo lỗi.

---

## 3. Bảo toàn vai trò model (ràng buộc bắt buộc)

Kế hoạch **không** đổi tên, đổi thứ tự hay thay slug nào. RAG chỉ cấp **ngữ cảnh khác nhau**
cho từng vai trò đã có.

| Vai trò (env) | Consumer hiện tại | RAG thêm gì | Tuyệt đối không |
|---|---|---|---|
| `MATH_READER_MODELS` (≤2) | `math_reader.reader_models()` `:173` | danh sách **gợi ý ký hiệu/định lý** khớp CV hints | không đưa lời giải vào mắt reader |
| `MATH_READER_TIEBREAK_MODEL` | `read_consensus()` `:552` | — | trọng tài không được thấy đáp án |
| `MATH_TOOLS_MODEL` (≤3) | `math_solver.solver_models()` `:366` | few-shot S2 + formula card S1 | không thay SymPy presolve |
| `MATH_CRITIC_MODEL` (≤3) | `math_solver.critic_models()` `:371` | **checklist định lý** từ `formulas` của node khớp | không hỏi model khác |
| `OPENROUTER_REPAIR_MODEL` | `main.py:2199` | 1–2 payload mẫu hợp lệ **cùng widget** | không nới `validate_mathviz` |
| `OPENROUTER_TRANSLATE_MODELS` | `main.py:5892, 6163` | glossary `name` ↔ `english_name` | không đổi `TRANSLATE_TIER_ORDER` |
| Chat ladder (`GROQ`/`GEMINI_MODEL`/`CEREBRAS_CHAT_MODELS`/`NVIDIA_MATH_MODELS`/`OPENROUTER_CHAT_MODELS`) | `main.py:4972–5142` | khối fused **cắt theo tier** | không thêm chặng LLM ngoài `plan_for()` |
| `NVIDIA_CODE_MODELS`, `OPENROUTER_VISION_MODEL(+FALLBACKS)` | MathViz repair / vision | không đụng | — |

**Reranker:** tái dùng khoá NVIDIA (`nv-rerankqa-…`), **không** thêm vai trò model mới.

---

## 4. "Cải thiện model" cụ thể = ngữ cảnh đúng cho từng chặng

Module mới `backend/retrieval_context.py`, mỗi hàm trả `(text, meta)` với
`meta = {source, chars, ids}` để ghi vào `ai_quality_log`:

| Hàm | Vai trò nhận | Nội dung |
|---|---|---|
| `slice_for_reader()` | `MATH_READER_MODELS` | **chỉ** gợi ý tên ký hiệu/định lý khớp CV hints — không có lời giải ⇒ reader không bị "mớm" đáp án nhưng vẫn biết cần để ý nhãn nào |
| `slice_for_solver()` | `MATH_TOOLS_MODEL` | formula card S1 + few-shot S2 |
| `slice_for_critic()` | `MATH_CRITIC_MODEL` | **checklist định lý** sinh từ `formulas`/thuộc tính của node khớp (vd trực tâm ⇒ `AH ⟂ BC`; `O,G,H` thẳng hàng; `AH = 2·OM`) |
| `slice_for_repair()` | `OPENROUTER_REPAIR_MODEL` | 1–2 payload hợp lệ cùng widget + alias list |
| `slice_for_translate()` | `OPENROUTER_TRANSLATE_MODELS` | glossary vi↔en |
| `slice_for_chat()` | chat ladder | khối fused, **cắt theo `simple/rich/extreme`** |

Cap ký tự theo tier (env, xem §5) là thứ bảo vệ bất biến **75 s** khi ngữ cảnh phình —
chứ không phải thêm một cơ chế mới.

---

## 5. Cờ môi trường (mọi cờ mặc định = hành vi hiện tại)

```
MATH_RETRIEVAL_HYBRID=off|on              # công tắc chủ
MATH_RETRIEVAL_SOURCES=concepts,examples,exam,templates
MATH_RETRIEVAL_DENSE=off|nvidia|gemini|openrouter
MATH_DENSE_MODEL_NVIDIA=nvidia/nv-embedqa-e5-v5
MATH_DENSE_MODEL_GEMINI=gemini-embedding-001
MATH_RERANK_MODEL=nvidia/nv-rerankqa-mistral-4b-v3
MATH_RETRIEVAL_RERANK=off|extreme
MATH_DENSE_CACHE_PATH=data/retrieval_vectors.db
MATH_RETRIEVAL_BM25=off|on
MATH_RETRIEVAL_MAX_CHARS_SIMPLE=1800
MATH_RETRIEVAL_MAX_CHARS_RICH=4200
MATH_RETRIEVAL_MAX_CHARS_EXTREME=7000
```

`render.yaml`: chỉ **thêm** dòng mới; `MATH_RETRIEVAL_EMBEDDINGS: "off"` (`render.yaml:138–139`)
giữ **nguyên byte** — `test_chat_budget.py:436–437` đang pin điều đó.
Không cờ nào là secret ⇒ có thể để `value:`; nhưng nếu muốn đổi từ dashboard thì dùng `sync: false`.

---

## 6. Xử lý secret (bài học đã trả giá)

**Đã xảy ra và đã sửa (commit `664fd5b`):** `backend/.env.bak_keys` nằm **untracked, không bị
gitignore**, chứa **6 nhóm khoá thật** (Groq, Gemini, OpenRouter, HuggingFace Space token, 2 khoá
TypeSafe). Cả `backend/*.bak` lẫn `backend/.env` đều **không** khớp tên `.env.bak_keys` ⇒ một
`git add -A` là đẩy vào history vĩnh viễn. Đã thêm `.env.bak_keys` + `*.bak_keys` vào **cả hai**
`.gitignore`. Kiểm chứng: file **chưa từng** vào git history ⇒ không cần rewrite.

Quy tắc từ đây:
1. **Không bao giờ** `git add -A` / `git add .` — luôn `git add <đường-dẫn-cụ-thể>`.
2. Trước mỗi commit, quét staged cho `sk-or-v1-|apikey_<hex>|AIza|gsk_|nvapi-|hf_`.
3. Khoá thật **chỉ** đi qua dashboard Render / Vercel (biến server-side, **không** `NEXT_PUBLIC_`).
4. Ghi chú Vercel: route `frontend/src/app/api/learning-feedback/route.js` đọc
   `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `SELF_URL` **và `OPENROUTER_FEEDBACK_MODELS`**
   (biến cuối **không** có trong `render.yaml`/`.env.example`) ⇒ phải set cả nó.
5. Dense chạy ở **backend** ⇒ **không** phải sửa CSP `connect-src` (`next.config.mjs:65`).

---

## 7. Lộ trình

### R0 — Baseline ✅ HOÀN TẤT
- `backend/tests/rag_golden_set.json` (15 truy vấn: 7 exact / 6 paraphrase / 2 control)
- `backend/tests/eval_rag.py` (offline, Recall@1/3/5, MRR, nDCG@5, chars, latency p50/p95)
- `docs/baseline_rag_2026-10.md` + `.json`
- **Phát hiện:** Recall@3 `1.000` **bão hoà** vì ngân hàng 6 dòng; **2/2 control bị false positive**
  (`min_score=0.05` quá thấp); RRF sinh điểm **đồng hạng** ⇒ thứ tự không ổn định.

### R1 — Tách dữ liệu graph ✅ HOÀN TẤT
- `backend/data/math_concepts.json` (13 node / 10 cạnh) + `backend/math_concepts.py`
  (`GRAPH`, `nodes()`, `edges()`, `find_entities()`, `neighbors()`, `render_context()`)
- `main.py`: `MATH_CONCEPT_GRAPH = math_concepts.GRAPH`,
  `extract_graph_entities = math_concepts.find_entities`,
  `retrieve_math_context` giữ `@lru_cache(maxsize=128)` + delegate.
  Graph dict 137 dòng + `_re_rag` **đã rời khỏi** `main.py`.
- Test: `backend/test_math_concepts.py` — **40/40**, đã thêm vào job `offline-suites`
  (step "Retrieval — concept graph moved out of main.py (parity + determinism)")
- **Parity:** 20 truy vấn golden, so với snapshot chụp từ code CŨ bằng **AST extraction**
  (không `import main`) → khớp 100 %; `find_entities` khớp y hệt;
  `/api/health` vẫn 13/10; `detect_widget` vẫn `function_plot`/`geometry_2d`.

**Phát hiện + sửa trong R1 (đo được, không phải phỏng đoán):**
`retrieve_math_context` **KHÔNG tất định**. `seen_neighbors` là `set`, mà set of `str`
lặp theo thứ tự **ngẫu nhiên theo process** (hash randomization, `PYTHONHASHSEED`).
Đo trên 20 truy vấn golden với 2 giá trị seed: **9/20 render block khác nhau** giữa
hai process (chỉ là **hoán vị** các dòng lân cận — nội dung y hệt).

Hệ quả thật: cùng một câu hỏi → **prompt khác nhau** ở các worker khác nhau ⇒
reproducibility và đo A/B đều nhiễu; và **không thể** có golden test byte-identical.

Đã sửa: dedup bằng **dict giữ thứ tự chèn** (giữ nguyên ngữ nghĩa set, thứ tự ổn định).
`test_math_concepts.py` pin: **0/20 khác nhau giữa process** (child process với
`PYTHONHASHSEED=12345`).

### R2 — Fusion nhiều nguồn + BM25 + sửa false positive
- `backend/retrieval_hybrid.py`: adapter S1/S2/S4/S5 → RRF → **tie-break tất định** → MMR → cap
- `math_problem_retrieval.py`: thêm BM25 (`k1=1.5`, `b=0.75`), opt-in `MATH_RETRIEVAL_BM25`; giữ `_tfidf_scores` nguyên vẹn
- **Sửa defect 3.2:** ngưỡng theo kích thước ngân hàng hoặc bắt buộc ≥2 token chung
- Nguồn `templates` **feature-detect** (không có registry ⇒ bỏ nguồn, không lỗi)
- Test: `backend/test_retrieval_hybrid.py`; kỳ vọng `false_positive_controls == 0`

### R3 — Dense remote (torch-free)
- `backend/retrieval_dense.py`: `RemoteEmbeddingClient` (NVIDIA/Gemini/OpenRouter, **1 code path OpenAI-compatible** + adapter Gemini) + `VectorCache` SQLite WAL
- `MATH_RETRIEVAL_DENSE=off` ⇒ không tạo client ⇒ **CI xanh như hôm nay**
- Warm-up cả bank ở `lifespan` (background, có cap) — **không bao giờ** encode cả bank trong event loop
- Test: `backend/test_retrieval_dense.py` — phải chứng minh: (a) tắt hết ⇒ y hệt; (b) đổi model ⇒ cache key đổi; (c) `input_type` đúng; (d) 429 ⇒ cooldown rồi thử khoá kế

### R4 — Lắp ngữ cảnh theo vai trò + tier
- `backend/retrieval_context.py` (§4)
- Nếu thêm chặng rerank: **phải** cập nhật `diagram_complexity.plan_for()` **và** `test_chat_budget.py:332` (`plan["generate"] + 2 * plan["retrieval"]`)
- Test: `backend/test_retrieval_context.py` (cap ký tự, đủ 6 slice, reader không nhận lời giải)

### R5 — Mở rộng dữ liệu (đòn bẩy lớn nhất)
- Ngân hàng 6 → ~55 → 130 bài (tự diễn đạt, ghi `source`)
- Node khái niệm Olympiad: phương tích, trục đẳng phương, Euler, chín điểm, Simson, tứ giác điều hoà, nghịch đảo… mỗi node có `viz_template`
- `ai_quality_log` + `retrieval_sources`, `context_chars`, `dense_hit`
- Kỳ vọng: Recall@k **giảm** khi ngân hàng lớn (không còn bão hoà) — đó là dấu hiệu **đo được**, không phải hồi quy

### R6 — Cổng LightRAG (chỉ mở nếu số đo đòi)
Offline builder trên máy trạm → export `math_concepts.json`. Cổng: số LLM call/lần ingest, RSS đỉnh, kích thước image, đo trên đúng instance Render.

---

## 8. Pin CI không được phá

| Pin | Vị trí | Hệ quả |
|---|---|---|
| `"chat_budget.CHAT_RETRIEVAL_BUDGET_S)" not in strip_comments(MAIN)` | `test_chat_budget.py:248–250` | mọi lời gọi retrieval phải qua `_budget.clamp(_retrieval_budget)` |
| `MAIN.count("timeout=_budget.clamp(_retrieval_budget)") >= 2` | `:416–418` | **`>=`** ⇒ thêm nguồn vẫn xanh |
| `plan["generate"] + 2 * plan["retrieval"]` | `:332` | ⚠️ retrieval đếm **2 lần** — R4 thêm chặng thì **phải** sửa |
| `MATH_RETRIEVAL_EMBEDDINGS\s*\n\s*value:\s*"off"` | `:436–437` | `render.yaml:138–139` giữ nguyên byte |
| `idx.embedding_backend.available is False` | `test_math_problem_retrieval.py:32` | cờ dense **mới**, không tái dùng cờ cũ |
| `"sentence-transformers" not in strip_comments(reqs)` | `:431–432` | không thêm lại torch |

## 9. Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Phình `main.py`/`chat()` | module mới + **1** lời gọi nối; `scripts/audit_bound_names.py` (đã xanh lại) |
| Vượt 75 s | mọi chặng qua `plan_for()`; cap ký tự theo tier; cờ tắt |
| Hai nguồn sự thật cho từ vựng | JSON sinh từ một nguồn + cổng parity (mẫu `check-mathviz-kinds.mjs`) |
| Dependency nặng làm sập Render | dense **remote**, không torch; `requirements.txt` không đổi |
| Trộn vector khác không gian | cache key gồm `provider+model+input_type` |
| Secret lọt vào history | §6 (đã có commit `664fd5b` + luật `git add` cụ thể) |

## 10. Chưa xác minh (không đoán)

- `nv-embedqa-e5-v5` / `nv-rerankqa-mistral-4b-v3` có trong catalog NVIDIA của tài khoản bạn → probe live ở R3 **trước khi** bật cờ (`scripts/check_embed_catalog.py`).
- Free-tier quota NVIDIA/Gemini cho `/embeddings` (NIM **không** gửi header quota ⇒ self-count như `token_meter`).
- OpenRouter embeddings có free tier hay không (docs chỉ nêu `402 Insufficient credits`).
- 7 cổng FE + `tsc` + `pnpm build`: **chưa chạy** ở môi trường này.


