# Baseline RAG — 2026-10 (R0 của kế hoạch HybridRAG)

> Sinh bằng script. **Không có số nào trong file này được điền tay.**
>
> Tái tạo:
> ```powershell
> python backend/tests/eval_rag.py --json docs/baseline_rag_2026-10.json
> ```
> Hoặc chạy không tham số: `python backend/tests/eval_rag.py`

**Commit đo:** `2a485fa` (trước khi commit khối Đợt 4I được dọn): số liệu dưới đây đo trên cây làm việc sau khi đã commit khối 4I + sửa cổng audit, tức trạng thái `f305bcb`.

---

## 1. Cấu hình được đo

| Thông số | Giá trị |
|---|---|
| Nguồn được chấm | **S2 — worked examples** (`backend/math_problem_retrieval.py`) |
| Ngân hàng đề | `backend/data/math_problems.jsonl` — **6 dòng** |
| Dense (embedding) | **OFF** — đúng cấu hình production (`render.yaml` `MATH_RETRIEVAL_EMBEDDINGS: "off"`) |
| Golden set | `backend/tests/rag_golden_set.json` — 15 truy vấn (7 exact, 6 paraphrase, 2 control) |
| top_k | 5 |

**S1 (concept graph) KHÔNG được chấm ở R0.** Nó vẫn nằm trong `main.py` dưới dạng dict 13 node, không import được từ script offline (import `main.py` kéo theo FastAPI). R1 sẽ tách sang `backend/math_concepts.py` và baseline này sẽ có thêm mục S1. Ghi lại khoảng trống đó **là một phần của baseline** — giống cách báo cáo tháng 10 ghi rõ "nửa embedding đang tắt".

---

## 2. Kết quả tổng hợp (số thật)

```
bank rows          : 6
dense (embeddings) : OFF (production config)
queries            : 15  (top_k=5)
```

| Chỉ số | Giá trị |
|---|---|
| Recall@1 | **0.846** |
| Recall@3 | **1.000** |
| Recall@5 | **1.000** |
| MRR | **0.910** |
| nDCG@5 | **0.933** |
| latency p50 | **0.1 ms** |
| latency p95 | **0.1 ms** |
| **False positive trên 2 control** | **2 / 2** |
| Theo loại — exact (n=7) | Recall@3 **1.000** |
| Theo loại — paraphrase (n=6) | Recall@3 **1.000** |

Chi tiết từng truy vấn: xem `docs/baseline_rag_2026-10.json` → `per_query[]`.

| id | kind | rank | top-3 | nDCG@5 |
|---|---|---|---|---|
| Q01 | exact | 1 | p1,p6,p2 | 1.000 |
| Q02 | exact | 1 | p1,p2,p6 | 1.000 |
| Q03 | exact | 1 | p2,p6,p3 | 1.000 |
| Q04 | exact | 1 | p3,p6,p1 | 1.000 |
| Q05 | exact | 1 | p4 | 1.000 |
| Q06 | exact | 1 | p5,p4,p2 | 1.000 |
| Q07 | exact | 1 | p6,p1,p3 | 1.000 |
| Q08 | paraphrase | 1 | p6,p1,p2 | 1.000 |
| Q09 | paraphrase | **3** | p3,p2,p1 | 0.500 |
| Q10 | paraphrase | 1 | p3,p6,p1 | 1.000 |
| Q11 | paraphrase | **2** | p4,p5 | 0.631 |
| Q12 | paraphrase | 1 | p2,p6,p4 | 1.000 |
| Q13 | paraphrase | 1 | p4,p2 | 1.000 |
| **Q14** | **control** | — | **p3** ⚠️ | — |
| **Q15** | **control** | — | **p4** ⚠️ | — |

---

## 3. Đọc số này thế nào (bắt buộc đọc trước khi khoe "1.000")

### 3.1 Recall@3 = 1.000 **KHÔNG** phải tín hiệu thành công

Ngân hàng có **6 dòng** mà `top_k = 5` → mỗi truy vấn trả về tối đa 5/6 tài liệu. Chỉ số **bão hoà**: gần như mọi truy vấn đều "tìm thấy" đáp án vì gần như tất cả tài liệu đều được trả về. Con số này **không** chứng minh bộ truy hồi tốt; nó chứng minh **ngân hàng quá nhỏ để đo được**.

⇒ Đây chính là bằng chứng đo được cho kết luận của kế hoạch: **nút cổ chai là DỮ LIỆU, không phải hạ tầng** (R5), và baseline chỉ trở nên có ý nghĩa khi ngân hàng lớn hơn ~50–130 bài.

### 3.2 **2/2 control bị false positive — đây là defect THẬT**

Cả hai truy vấn ngoài miền đều trả về kết quả:

- Q14 `"cách nấu phở bò ngon tại nhà"` → **p3** (bán kính đường tròn nội tiếp tam giác vuông)
- Q15 `"tính tích phân bất định của sin bình phương x"` → **p4** (phương trình bậc hai)

Nguyên nhân: `min_score = 0.05` quá thấp so với một ngân hàng 6 dòng — một token dùng chung duy nhất (ví dụ `"tại"` xuất hiện trong p3) là đủ vượt ngưỡng sau khi chuẩn hoá cosine. Hệ quả với người học: một câu hỏi ngoài miền vẫn **kèm** khối "bài toán tương tự đã giải" vào prompt ⇒ nhiễu, và có thể kéo câu trả lời lệch khỏi đề.

⇒ Việc cần làm (ghi vào R2): hiệu chỉnh ngưỡng theo kích thước ngân hàng, hoặc bắt buộc **≥2 token chung** trước khi nhận một tài liệu. Baseline này là mốc để chứng minh đã sửa.

### 3.3 RRF tạo **điểm đồng hạng** trên ngân hàng nhỏ

Với 6 dòng, RRF (`k=60`) sinh các giá trị trùng nhau (ví dụ `0.03252` cho hai tài liệu khác nhau — thấy trong output của `test_math_problem_retrieval.py`), nên **thứ tự trong nhóm đồng hạng là không ổn định**. Q10/Q12/Q13 minh hoạ: tài liệu đúng đứng đầu nhưng các vị trí sau là ngẫu nhiên theo thứ tự chèn. Đây là lý do R3 cần **tie-break tất định** trước khi so sánh trước/sau.

---

## 4. Baseline suite (cùng thời điểm)

| | |
|---|---|
| Suite backend offline | **31 / 31 XANH** |
| `test_chat_budget.py` | 154/154 (tài liệu kế hoạch ghi 105 — đã cũ) |
| `test_geogebra_export.py` | 91/91 |
| `tests/eval_math_regression.py` | 30/30 — **100 %** |
| `scripts/audit_bound_names.py` | **exit 0** (đã sửa dương tính giả `c@L5325`) |
| `scripts/audit_bound_names.py --selftest` | **exit 0** (guard vẫn bắt được mutant) |
| FE `check-*.mjs`, `tsc`, `pnpm build` | **CHƯA CHẠY** — cần `pnpm install` ở `frontend/` |

---

## 5. Chưa đo / giới hạn đã biết

1. **S1 (concept graph)** — chưa chấm; phụ thuộc R1 (`backend/math_concepts.py`).
2. **S3 nửa dense** — chưa có; cờ `MATH_RETRIEVAL_DENSE` mặc định `off`. R3 sẽ đo delta.
3. **Chất lượng đầu-cuối** — baseline này đo *truy hồi*, không đo *câu trả lời của model*. Việc "model trả lời tốt hơn nhờ ngữ cảnh" thuộc R4 và cần một bộ đánh giá riêng.
4. **7 cổng FE + build** — chưa chạy trong môi trường này.
5. **Không có số nào về token/chi phí** — R0 không gọi LLM.

---

## 6. Bổ sung sau R1 (concept graph tách khỏi `main.py`)

R1 chuyển graph sang `backend/math_concepts.py` + `backend/data/math_concepts.json`.
Parity đã được pin bằng `backend/test_math_concepts.py` — **40/40**, so với snapshot
chụp từ code **CŨ** bằng AST extraction (không `import main`).

**Phát hiện quan trọng — một defect tất định đã được đo và sửa:**

| Đo | Kết quả |
|---|---|
| Truy vấn có khối lân cận ≥2 dòng | 9 / 20 |
| **Output KHÁC NHAU giữa 2 process** (2 `PYTHONHASHSEED`) | **9 / 20** |
| Khác biệt chỉ là hoán vị? | Có — nội dung y hệt |
| **Sau khi sửa** (dict giữ thứ tự chèn) | **0 / 20** |

`seen_neighbors` là `set`; set of `str` lặp theo thứ tự **ngẫu nhiên theo process**
(hash randomization). Nghĩa là: cùng một câu hỏi → **prompt khác nhau** ở các worker
khác nhau. Điều này làm nhiễu mọi phép đo A/B trước/sau (kể cả baseline R0 ở §2: một
phần chênh lệch nếu đo lại có thể đến từ đây, không phải từ logic), và làm golden test
byte-identical trở thành bất khả thi.

**Đã sửa:** dedup bằng dict giữ thứ tự chèn — giữ nguyên ngữ nghĩa set, thứ tự ổn định.
Test pin cả hai chiều: (a) nội dung khớp snapshot cũ sau khi canonicalise **chỉ** khối
lân cận; (b) 0/20 khác nhau giữa process.

### Hồi quy: không có

34 / 34 mục PASS (30 suite backend + `tests/eval_math_regression.py` +
`audit_bound_names.py` + `--selftest` + `tests/eval_rag.py`), gồm
`test_chat_budget.py` (154/154), `test_geogebra_export.py` (91/91),
`tests/eval_math_regression.py` (30/30, 100 %).

Kiểm tra tích hợp qua `main.py`: graph 13/10, `extract_graph_entities` trả `['dao_ham']`,
`retrieve_math_context` **identical** với `math_concepts.render_context`,
`GRAPHABLE_CONCEPT_IDS` không có id mồ côi, `detect_widget` vẫn
`function_plot` / `geometry_2d`.

---

## 7. R2 — Fusion nhiều nguồn + sửa false positive (số trước/sau)

Tái tạo (cùng bộ golden, chỉ khác chế độ chấm):
```powershell
python backend/tests/eval_rag.py --mode sparse   # R0: đường TF-IDF-only
python backend/tests/eval_rag.py --mode hybrid   # R2: concepts + examples qua RRF
```
`--mode auto` (mặc định) đi theo cờ `MATH_RETRIEVAL_HYBRID`, mà cờ này **mặc định off**
⇒ chạy không cấu hình gì sẽ tái lập đúng baseline R0, không âm thầm đổi số.

Golden set đã lên **v2.0**: 13 truy vấn `must_find`, 2 `nothing` (ngoài miền),
1 `no_examples` (Q15 — đúng chủ đề nhưng ngân hàng đề không có bài nào).
Việc tách Q15 khỏi nhóm `control` là **sửa cách chấm cho đúng bản chất**: Q15 hỏi tích phân
`sin²x`, graph khái niệm **có** phủ (Tích phân, Hàm số lượng giác) còn ngân hàng đề thì không.
v1 gọi đó là false positive; v2 gọi đúng tên: concept recall đúng, example recall bằng 0.
Số false-positive ở mức **ví dụ** (Q14→p3, Q15→p4) mà R2 loại bỏ **không đổi** vì lần phân loại lại này.

### 7.1 Bảng trước/sau (số thật do script sinh)

| Chỉ số | **R0 sparse** | **R2 hybrid** | Nhận xét |
|---|---|---|---|
| Recall@1 | 0.846 | **0.846** | bằng nhau |
| Recall@3 | 1.000 | 0.923 | ↓ do Q11 (xem 7.3) |
| Recall@5 | 1.000 | 0.923 | ↓ do Q11 |
| MRR | 0.910 | 0.872 | ↓ nhẹ do Q11 |
| nDCG@5 | 0.933 | 0.885 | ↓ nhẹ do Q11 |
| **FP ngoài miền** | **1/2** | **0/2** | ✅ sửa xong |
| **FP ví dụ lạc đề** | **1/1** | **0/1** | ✅ sửa xong |
| Concept recall (uncovered) | 0.000 | **1.000** | ✅ nguồn mới trả đúng |
| latency p50 / p95 | 0.1 / 0.1 ms | 0.2 / 0.3 ms | +0.2 ms, không đáng kể |

### 7.2 Cách sửa — và vì sao **không** phải chỉnh ngưỡng

Chẩn đoán trên toàn bộ golden set (`_r2_diagnostic`) cho thấy **không ngưỡng nào** tách được:

```
control Q14 -> p3   overlap 1 ("tại")    tfidf 0.4195
control Q15 -> p4   overlap 1 ("phương") tfidf 0.3871
hợp lệ  Q11 -> p5   overlap 1 ("tìm")    tfidf 0.1959   <- đáp án ĐÚNG
```
Hai false positive có TF-IDF **cao hơn** đáp án đúng, vì với 6 tài liệu IDF vô nghĩa —
một token có trong 1/6 văn bản nhận trọng số lớn dù chẳng có nghĩa gì.
Sweep `(min_overlap, min_tfidf)` từ `1..3 × 0.0..0.4` đều để lọt 2/2.

Nên bản sửa là **cấu trúc**, không phải ngưỡng:
1. **Từ chức năng tiếng Việt không phải nội dung** — chính chữ `"tại"` làm Q14 đâm vào
   một bài hình học tình cờ chứa chữ đó.
2. **Ví dụ phải chia sẻ ≥ 2 token nội dung** với truy vấn (`MATH_RETRIEVAL_MIN_OVERLAP`, mặc định 2).

### 7.3 Cái giá — ghi lại chứ không giấu

Q11 mất ví dụ đã giải. Đây là **trần của truy hồi từ vựng**, không phải lỗi cần "sửa" bằng cách
nới ngưỡng: bằng chứng từ vựng của Q11 là **tập con thực sự** của hai false positive, nên nới
ngưỡng để cứu Q11 là lấy lại đúng 2 lỗi vừa sửa. Q11 vẫn nhận `concept:cuc_tri` (từ khoá
"cực đại" khớp), nên khối tham chiếu vẫn có quy tắc cực trị.
`test_retrieval_hybrid.py` **pin cả hai vế**: (a) sparse path *có* ứng viên cho Q11;
(b) guard *loại* nó. Ai muốn nới guard sau này sẽ phải sửa test trước.

### 7.4 Tất định và tie-break (R0 cho thấy RRF sinh điểm đồng hạng)

RRF trên ngân hàng nhỏ thường cho **cùng điểm** cho hai ứng viên, nên thứ tự trong nhóm
đồng hạng phụ thuộc thứ tự chèn — không đo được trước/sau. Đã sửa bằng khoá tie-break
tường minh: điểm fused → **ưu tiên nguồn theo độ đặc hiệu bằng chứng** → key.
Đo được: Q05 `"Giải phương trình bậc hai x^2-5x+6=0"` — ưu tiên nguồn theo khai báo cho
`concept:phuong_trinh_bac_hai` đứng trên `ex:p4`, tức lý thuyết chung đứng trên
**chính phương trình đó**; đảo thứ tự tie-break ⇒ `ex:p4` lên đầu và Recall@1 từ 0.692 → 0.846.
Test pin: 16/16 truy vấn xếp hạng **giống hệt** ở process khác với `PYTHONHASHSEED` khác.

### 7.5 BM25 — có, đã test, nhưng **opt-in**

`ProblemIndex._bm25_scores` (`k1=1.5`, `b=0.75`, IDF dạng `log(1 + (N-df+0.5)/(df+0.5))`
để không âm khi một term có mặt ở quá nửa văn bản). Giữ **tách biệt** khỏi `_tfidf_scores`
thay vì thay thế, vì `search()` cũ đang được `test_math_problem_retrieval.py` pin và là
mốc R0. Bật bằng `MATH_RETRIEVAL_BM25=on`. Mặc định off: trên 6 dòng nó không đổi điều gì
có ý nghĩa (đo được), nên chuyển mặc định chỉ là thay đổi không có bằng chứng.

### 7.6 Defect do chính test mới bắt được

`_flag()` ban đầu dùng **denylist** ("không phải `off` thì là on"). Test
`a typo ('of') -> disabled` **fail**: gõ sai `MATH_RETRIEVAL_HYBRID=of` lại **BẬT** tính năng —
đúng cái ngược lại của "off mặc định, một dòng env để rollback". Đã đổi sang **allowlist**
(`on/true/1/yes/enable/enabled`). Đây là lý do cờ mới phải có test cho cả giá trị gõ sai.

### 7.7 Hồi quy: không có

35 / 35 mục PASS (31 suite backend + `tests/eval_math_regression.py` +
`audit_bound_names.py` + `--selftest` + `tests/eval_rag.py`), FAIL: 0.
`test_retrieval_hybrid.py` **51/51**. `test_math_problem_retrieval.py` vẫn xanh
(TF-IDF/RRF cũ không đổi).

---

## 8. R3 — Nửa dense, KHÔNG thêm dependency (số trước/sau cuối)

Tái tạo:
```powershell
$env:MATH_RETRIEVAL_DENSE='gemini'      # bật dense
python backend/tests/eval_rag.py --mode hybrid --json docs/r3_dense_rag_2026-10.json
python backend/scripts/check_embed_catalog.py --json docs/embed_catalog_2026-10.json
```
Mọi suite CI chạy với cờ **off**, nên 36/36 ở §7.7 vẫn là trạng thái mặc định.

### 8.1 Probe trước, tin sau — và probe đã bác bỏ kế hoạch ban đầu

| Model / endpoint | Kết quả ĐO |
|---|---|
| `nvidia/nv-embedqa-e5-v5` *(kế hoạch đề xuất primary)* | ❌ **HTTP 410 — end-of-life 2026-08-25** |
| `nvidia/nv-embedqa-mistral-7b-v2` | ❌ 404 "not found for account" |
| `nvidia/llama-3.2-nv-embedqa-1b-v1` | ❌ 404 chưa bật cho tài khoản |
| `nvidia/embed-qa-4` | ❌ 404 chưa bật cho tài khoản |
| `nvidia/nemotron-3-embed-1b` | ✅ **200, dim 2048** |
| `gemini-embedding-001` | ✅ **200, dim 3072** (`outputDimensionality=768` cũng chạy) |
| `nvidia/nv-rerankqa-mistral-4b-v3` (`/v1/ranking`, `/v1/reranking`) | ❌ **404 page not found — không có endpoint rerank** |

Hai hệ quả được đóng cứng vào code:
1. **Gemini là primary** (không phải NVIDIA như kế hoạch), vì đó là endpoint đã kiểm chứng
   chạy được bằng khoá repo đang có, và có `taskType` (`RETRIEVAL_QUERY`/`RETRIEVAL_DOCUMENT`)
   — đúng bất đối xứng query/passage mà bài toán cần.
2. **Không có tầng rerank.** NVIDIA không mở endpoint nào; dùng LLM làm reranker sẽ tiêu quota
   free mà tầng chat đang cần, cho một thứ RRF đã lo. Tầng không kiểm chứng được thì không ship.

Script probe được nộp kèm: `backend/scripts/check_embed_catalog.py` (exit 0 khi mọi provider
có khoá đều trả lời). Chạy lại bất cứ khi nào nhà cung cấp đổi catalog.

### 8.2 Bảng trước/sau — ba chế độ

| Chỉ số | R0 sparse | R2 hybrid | **R3 + dense** |
|---|---|---|---|
| Recall@1 | 0.846 | 0.846 | **1.000** |
| Recall@3 | 1.000 | 0.923 | **1.000** |
| Recall@5 | 1.000 | 0.923 | **1.000** |
| MRR | 0.910 | 0.872 | **1.000** |
| nDCG@5 | 0.933 | 0.885 | **1.000** |
| FP ngoài miền | 1/2 | 0/2 | **0/2** |
| FP ví dụ lạc đề | 1/1 | 0/1 | **0/1** |
| Concept recall (uncovered) | 0.000 | 1.000 | **1.000** |
| Nguồn dùng | examples | concepts+examples | concepts+**dense**+examples |
| latency p50 | 0.1 ms | 0.2 ms | **818 ms** |

**Q11 — trần từ vựng của R2 — giờ đạt `ex:p5` ở hạng 1.** Recall@1 từ 0.846 → 1.000.

### 8.3 Ngưỡng cosine: lại phải ĐO, không được đoán

Nguồn `dense` **cố ý** không chịu guard từ vựng (đó là cách nó giải Q11), mà cosine thì
không bao giờ bằng 0 với văn bản không liên quan — nên lần chạy đầu, FP **tăng** trở lại
(off-topic 2/2, ví dụ lạc đề 1/1) và xoá sạch thành quả precision của R2.

Chẩn đoán trên golden set cho một **khoảng tách sạch**:

```
truy vấn đúng chủ đề, tài liệu đúng : 0.719 .. 0.855   (thấp nhất Q09)
ngoài miền / không có bài, sai nhất : 0.546 .. 0.596   (cao nhất Q15)
```
Sweep: floor **0.60–0.70** giữ **13/13 recall và 0 FP**; 0.75 bắt đầu mất hit thật.
Chọn **0.65** (giữa dải, biên ~0.05 mỗi phía), và **pin hai con số đo được** vào
`test_retrieval_dense.py` — ai hạ ngưỡng sẽ phải đo lại và sửa test trước.

### 8.4 Không thêm dependency nào

Encoder là **remote**, client là `httpx` (đã có trong production). `requirements.txt`
**không đổi**. Test pin: module dense không import `sentence_transformers`, không `import torch`;
`test_chat_budget.py` độc lập pin sentence-transformers ra khỏi requirements. Đây là điều kiện
để không lặp lại sự cố 2026-09-28.

Cache: `VectorCache` SQLite WAL, khoá `sha256(provider + model + dim + input_type + text)`.
Có `dim` và `input_type` trong khoá vì đó là những thứ đổi **vector**: tài liệu Gemini ghi rõ
`gemini-embedding-001` và `gemini-embedding-2` **không tương thích**, và cùng một chuỗi ở
chế độ query khác passage. Ổ khoá model ⇒ đổi model không thể tái dùng vector cũ.

### 8.5 Bất đối xứng query/passage là thật trong request

Gemini nhận `taskType` (`RETRIEVAL_QUERY` vs `RETRIEVAL_DOCUMENT`), NVIDIA nhận `input_type`
(`query`/`passage`) — tham số mà tài liệu NVIDIA nói dùng sai sẽ gây "large drops in retrieval
accuracy". Test khẳng định cả hai đi đúng giá trị, và response của NVIDIA được **sắp lại theo
`index`** trước khi dùng.

### 8.6 Defect do test bắt được + điểm yếu còn lại

- Test bắt: hai assert đầu của tôi kiểm chuỗi `"key"` (sẽ cấm cả thông báo hữu ích
  `"no api key"` mà không chứng minh gì). Đã đổi thành kiểm **giá trị khoá** có lọt vào
  diagnostics không — và đặt khoá đặc trưng để phép kiểm có ý nghĩa thật.
- **Điểm yếu đã biết:** latency `dense` ~**818 ms/lần** (một HTTP call Gemini + đọc cache).
  Vẫn nằm trong budget `retrieval` (10 s mặc định), nhưng **đáng kể** so với 0.2 ms của R2,
  và theo thiết kế nó chạy trên `asyncio.to_thread` nên không chặn event loop.
  Nếu bật dense ở production, số này phải theo dõi qua `chat_budgets_s` trên `/api/health`.

### 8.7 Hồi quy: không có

36 / 36 mục PASS với cờ dense **off** (trạng thái mặc định), FAIL: 0.
`test_retrieval_dense.py` **116/116**. `test_retrieval_hybrid.py` 51/51 (không đổi
hành vi khi dense off — có test pin riêng điều đó).
