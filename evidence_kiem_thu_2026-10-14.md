# Biên bản kiểm thử & Thực nghiệm Độc lập — DuoMCB / BINGMATH

- **Ngày cập nhật:** 16/10/2026 · **Môi trường:** Python 3.12+, SymPy, TypeSafe AI Reflex Guard (Single-key mode)
- **Nguồn mã:** Kho GitHub chính thức `https://github.com/will050710-commits/BINGMATH.git` (nhánh `main`, commit `c76b4df`)
- **Cách tái lập:** `bash chay_kiem_thu_offline.sh` (Linux/macOS) hoặc `powershell -ExecutionPolicy Bypass -File .\chay_kiem_thu_offline.ps1` (Windows)
- **Lưu ý trung thực:** Toàn bộ số liệu dưới đây được trích xuất trực tiếp từ các tệp log kiểm chứng `backend/reports/external_benchmark_summary.json`, `backend/reports/hallucination_eval_summary.json` và 23 suite kiểm thử.

---

## 1. Các suite kiểm thử đơn vị & tích hợp backend (23/23 thoát mã 0 — PASS)

| Nhóm | Suite | Kết quả in ra |
|---|---|---|
| Hình học | `test_geometry_snapping` | ALL PASSED |
| Hình học | `test_geometry_verification` | ALL PASSED |
| Hình học | `test_geometry_analytic_checks` | 16/16 |
| Hình học | `test_geometry_construction_solver` | ALL PASSED |
| Hình học | `test_geometry_pipeline` | ALL PASSED |
| Hình học | `test_geometry3d_mesh` | 30/30 |
| MathViz | `test_mathviz` | 9/9 |
| MathViz | `test_mathviz_contract` | ALL PASSED |
| MathViz | `test_diagram_complexity` | ALL PASSED |
| MathViz | `test_geogebra_export` | 91/91 |
| Đọc & giải | `test_math_reader` | 36/36 |
| Đọc & giải | `test_math_solver` | 25/25 (ALL_MATH_SOLVER_TESTS_PASSED) |
| Đọc & giải | `test_typesafe_guard` | 5/5 (Single-key mode + SystemOne + SymPy Healing) |
| Dữ liệu | `test_vnhsge_bank` | 36/36 |
| Dữ liệu | `test_fsrs_scheduler` | 32/32 |
| Vận hành | `test_chat_budget` | 159/159 |
| Vận hành | `test_chat_routing` | 42/42 |
| Vận hành | `test_fallback_policy` | 15/15 |
| Vận hành | `test_key_pool` | 56/56 |
| Vận hành | `test_token_meter` | 40/40 |
| Truy hồi | `test_math_concepts` | 58/58 |
| Truy hồi | `test_retrieval_hybrid` | 51/51 |
| Truy hồi | `test_retrieval_dense` | 116/116 |

---

## 2. Đánh giá Thực nghiệm (Evaluation Benchmarks)

### 2.1. Benchmark Độc lập trên 3 Bộ Chuẩn Quốc tế & Tiếng Việt (`tests/eval_external_benchmark.py`, `N = 60`, `seed = 42`)
Giải quyết triệt để hạn chế "30/30 trên bộ đề tự soạn chưa đủ khách quan": lấy mẫu phân tầng cố định `seed=42` từ 3 bộ dữ liệu công khai độc lập, chấm hoàn toàn **tất định bằng SymPy** (`bench_common.answers_equivalent`) kèm **Khoảng tin cậy 95% Wilson** (`wilson_ci`):

| Bộ dữ liệu độc lập | Số câu ($N$) | Độ khó / Phân tầng | Raw LLM Baseline | 95% Wilson CI (Raw) | **DuoMath Guarded Pipeline** | **95% Wilson CI (DuoMath)** | Số bài tự sửa đúng (`[HEALED]`) |
|---|---:|---|---:|---:|---:|---:|---:|
| **Hendrycks MATH** (`hendrycks_math.jsonl`) | 20 | Level 1 – Level 5 | 20/20 (**100.0%**) | 83.9% – 100.0% | **20/20 (100.0%)** | **83.9% – 100.0%** | 0 |
| **Vi-MetaMath** (`vi_metamath.jsonl`) | 20 | GSM8K + MATH Tiếng Việt (6 nhóm) | 20/20 (**100.0%**) | 83.9% – 100.0% | **20/20 (100.0%)** | **83.9% – 100.0%** | 0 |
| **Omni-MATH Olympiad** (`omnimath.jsonl`) | 20 | Diff 3.0 – 5.0 (7 phân môn) | 15/20 (**75.0%**) | 53.1% – 88.8% | **17/20 (85.0%)** | **64.0% – 94.8%** | **+2 bài** (`OMNI-1129`, `OMNI-1354`) |
| **TỔNG HỢP TOÀN BỘ** | **60** | **9 phân môn / 3 bộ chuẩn** | **55/60 (91.67%)** | **81.9% – 96.4%** | **57/60 (95.00%)** | **86.3% – 98.3%** | **+2 bài (+3.33%)** |

---

### 2.2. Kiểm chứng Chống AI Đưa ra Kiến thức Sai (`tests/eval_hallucination.py`, `N = 48` ca đối chứng + `6` bẫy Live LLM)
Kiểm định hàng rào `JevStyleReflexEngine` + `math_solver.deterministic_checks` trên **48 ca đối chứng** (24 ca chứa lỗi kiến thức tinh vi thuộc 8 nhóm + 24 ca lời giải chuẩn tương ứng) và **6 ca bẫy trực tiếp (Live LLM Adversarial Trap Probe)**:

| Nhóm lỗi kiến thức Toán học (`Category`) | Số ca lỗi (Positive) | Bắt đúng (`TP`) | Bỏ lọt (`FN`) | Số ca chuẩn (Negative) | Xác nhận chuẩn (`TN`) | Báo động giả (`FP`) | Độ chính xác |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1. Hằng đẳng thức & Nhân tử (`algebraic_identity`) | 4 | **4** | 0 | 4 | **4** | 0 | **100.0%** |
| 2. Định lý Viète & Tam thức bậc 2 (`viete_quadratic`) | 3 | **3** | 0 | 3 | **3** | 0 | **100.0%** |
| 3. Nghiệm sai & Nghiệm ngoại lai (`wrong_root_substitution`) | 3 | **3** | 0 | 3 | **3** | 0 | **100.0%** |
| 4. Đạo hàm & Lượng giác (`calculus_trig_formula`) | 4 | **4** | 0 | 4 | **4** | 0 | **100.0%** |
| 5. Căn thức & Logarit (`radical_log_misconception`) | 3 | **3** | 0 | 3 | **3** | 0 | **100.0%** |
| 6. Tập xác định & Miền giá trị (`domain_sanity_violation`) | 4 | **4** | 0 | 4 | **4** | 0 | **100.0%** |
| 7. Công thức Hình học & Tính nhẩm (`geometry_arithmetic_error`) | 2 | **2** | 0 | 2 | **2** | 0 | **100.0%** |
| 8. Ngụy tạo đáp án trắc nghiệm (`fabricated_mcq_contradiction`) | 1 | **1** | 0 | 1 | **1** | 0 | **100.0%** |
| **TỔNG CỘNG (`N = 48`)** | **24** | **24** | **0** | **24** | **24** | **0** | **100.0%** |

- **Confusion Matrix:** `TP = 24, FP = 0, TN = 24, FN = 0`
- **Accuracy / Sensitivity (Recall) / Specificity (TNR) / Precision / F1-Score:** **100.0%** (95% Wilson CI: Accuracy `92.6% – 100.0%`, Recall & Specificity `86.2% – 100.0%`)
- **Auto-Heal / Warn Rate:** **100.0% (24/24)**
- **Live LLM Adversarial Trap Probe (`LIVE-TRAP-01` .. `LIVE-TRAP-06`):** **6/6 (100.0%) PASSED** (độ trễ `1.17s – 2.52s`).

---

### 2.3. Kiểm thử Hồi quy Nội bộ (`tests/eval_math_regression.py`) & Truy hồi Ngữ cảnh (`tests/eval_rag.py`)
- **`tests/eval_math_regression.py`: 30/30 (100%).** Kiểm thử hồi quy có đáp án chuẩn bằng SymPy + kiểm hình học + bộ lọc chống ngụy tạo kết quả.
- **`tests/eval_rag.py`: ngân hàng 59 bài, 48 truy vấn, top_k = 5:**

| Chỉ số | Sparse (TF-IDF) | Hybrid (RRF + đồ thị khái niệm) |
|---|---:|---:|
| Recall@1 | 0.805 | 0.805 |
| Recall@3 | 0.927 | **0.976** |
| MRR | 0.858 | **0.874** |
| nDCG@5 | 0.875 | **0.900** |
| False positive, truy vấn ngoài chủ đề | 5/6 | **0/6** |
| Concept recall trên truy vấn chưa phủ | 0/1 | **1/1** |
