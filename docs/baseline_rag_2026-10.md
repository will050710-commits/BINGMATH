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
