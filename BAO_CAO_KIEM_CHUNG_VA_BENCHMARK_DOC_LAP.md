# BÁO CÁO THỰC NGHIỆM ĐỘC LẬP & KIỂM CHỨNG CHỐNG AI ĐƯA RA KIẾN THỨC SAI (DUOMATH / BINGMCB)

> **Mục tiêu tài liệu:** Giải trình trực tiếp và toàn diện hai yêu cầu cải tiến của Hội đồng Giám khảo bằng thực nghiệm định lượng, dữ liệu công khai độc lập và cơ chế kiểm chứng tất định (SymPy + TypeSafe AI Reflex Guard):
> 1. **Yêu cầu cải tiến 1:** *"Kết quả 30/30 (100%) trên bộ đề tự soạn chưa đủ tính khách quan, thuyết phục."*
> 2. **Yêu cầu cải tiến 2:** *"Cần thêm kiểm chứng trong việc AI đưa ra kiến thức sai."*

---

## 1. Giải quyết Yêu cầu 1: Benchmark Độc lập trên 3 Bộ Dữ liệu Quốc tế & Tiếng Việt (`N = 60`, `seed = 42`)

### 1.1. Phương pháp luận khách quan & khả năng tái lập (Reproducibility)
Để loại bỏ hoàn toàn thiên lệch "vừa đá bóng vừa thổi còi" của bộ 30 câu tự soạn tĩnh, hệ thống bổ sung kịch bản đánh giá độc lập [`backend/tests/eval_external_benchmark.py`](backend/tests/eval_external_benchmark.py) cùng thư viện chấm điểm tất định [`backend/tests/bench_common.py`](backend/tests/bench_common.py):

- **Nguồn dữ liệu độc lập 100% (không do nhóm tự soạn):**
  1. **Hendrycks MATH** ([`backend/training/raw_data/hendrycks_math.jsonl`](backend/training/raw_data/hendrycks_math.jsonl)): 20 bài toán phân tầng đều từ `Level 1` đến `Level 5` (Algebra, Counting & Probability).
  2. **Vi-MetaMath** ([`backend/training/raw_data/vi_metamath.jsonl`](backend/training/raw_data/vi_metamath.jsonl)): 20 bài toán tự luận Tiếng Việt thuộc 6 nhóm (`MATH_AnsAug`, `MATH_Rephrased`, `GSM_AnsAug`, `GSM_Rephrased`, `GSM_FOBAR`, `GSM_SV`).
  3. **Omni-MATH Olympiad** ([`backend/training/raw_data/omnimath.jsonl`](backend/training/raw_data/omnimath.jsonl)): 20 bài toán mức độ thi học sinh giỏi / Olympiad quốc tế (`Difficulty 3.0 – 5.0`), phân tầng đủ **7 chuyên ngành Toán học**: *Algebra, Applied Mathematics, Calculus, Discrete Mathematics, Geometry, Number Theory, Precalculus*.
- **Lấy mẫu ngẫu nhiên phân tầng cố định hạt giống (`seed = 42`):** Bất kỳ giám khảo nào chạy lại lệnh đều thu được chính xác cùng một danh sách 60 bài toán (`MATH-*`, `VIMATH-*`, `OMNI-*`).
- **Chấm điểm tất định bằng SymPy (`answers_equivalent`):** Tuyệt đối **không dùng LLM chấm điểm LLM**. Đáp án rút trích từ `\boxed{...}` được chuẩn hóa LaTeX và kiểm tra tương đương đại số/số học bằng `sympy.simplify(pred - gold) == 0` hoặc sai số tương đối $\le 10^{-6}$.
- **Báo cáo Khoảng tin cậy 95% Wilson (`wilson_ci`):** Mọi tỷ lệ chính xác đều đi kèm khoảng tin cậy thống kê 95% Wilson score interval.

### 1.2. Kết quả tổng hợp: Raw LLM Baseline vs. DuoMath Guarded Pipeline
Dữ liệu chi tiết từng câu được lưu tại [`backend/reports/external_benchmark_runs.jsonl`](backend/reports/external_benchmark_runs.jsonl) và tổng hợp tại [`backend/reports/external_benchmark_summary.json`](backend/reports/external_benchmark_summary.json):

| Bộ dữ liệu độc lập | Số câu ($N$) | Độ khó / Phân tầng | Raw LLM Baseline | 95% Wilson CI (Raw) | **DuoMath Guarded Pipeline** | **95% Wilson CI (DuoMath)** | Số bài tự sửa đúng (`[HEALED]`) |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **Hendrycks MATH** | 20 | Level 1 – Level 5 | 20/20 (**100.0%**) | 83.9% – 100.0% | **20/20 (100.0%)** | **83.9% – 100.0%** | 0 |
| **Vi-MetaMath (Tiếng Việt)** | 20 | GSM8K + MATH (6 nhóm) | 20/20 (**100.0%**) | 83.9% – 100.0% | **20/20 (100.0%)** | **83.9% – 100.0%** | 0 |
| **Omni-MATH (Olympiad)** | 20 | Diff 3.0 – 5.0 (7 phân môn) | 15/20 (**75.0%**) | 53.1% – 88.8% | **17/20 (85.0%)** | **64.0% – 94.8%** | **+2 bài** (`OMNI-1129`, `OMNI-1354`) |
| **TỔNG HỢP TOÀN BỘ** | **60** | **9 phân môn / 3 bộ chuẩn** | **55/60 (91.67%)** | **81.9% – 96.4%** | **57/60 (95.00%)** | **86.3% – 98.3%** | **+2 bài (+3.33%)** |

### 1.3. Phân tích chi tiết theo Chuyên ngành Toán học & Cấp độ khó
- **Theo chuyên ngành (`by_category` trong `external_benchmark_summary.json`):**
  - **Algebra (Đại số):** `13/13 = 100.0%` (95% CI: `77.2% – 100.0%`, tăng từ `92.31%` của Raw LLM nhờ tự phục hồi bài `OMNI-1354`).
  - **Counting & Probability (Tổ hợp & Xác suất):** `10/10 = 100.0%` (95% CI: `72.2% – 100.0%`).
  - **Discrete Mathematics (Toán rời rạc Olympiad):** `4/4 = 100.0%` (95% CI: `51.0% – 100.0%`, tăng từ `75.0%` của Raw LLM nhờ tự phục hồi bài `OMNI-1129`).
  - **Calculus (Giải tích Olympiad):** `3/3 = 100.0%` (95% CI: `43.8% – 100.0%`).
  - **Applied Mathematics (Toán ứng dụng Olympiad):** `3/3 = 100.0%` (95% CI: `43.8% – 100.0%`).
  - **Number Theory (Số học Olympiad):** `2/2 = 100.0%` (95% CI: `34.2% – 100.0%`).
  - **Vietnamese Math (`MATH_AnsAug`, `MATH_Rephrased`, `GSM_*`):** `20/20 = 100.0%` (95% CI: `83.9% – 100.0%`).
  - **Precalculus & Geometry (Olympiad nâng cao Diff 4.0–4.5):** Đạt `50.0%` (1/2) và `33.33%` (1/3) — phản ánh trung thực giới hạn tự nhiên của mô hình trên các bài Hình học phẳng / Lượng giác Olympiad cấp quốc tế thay vì con số 100% tuyệt đối trên bộ đề dễ.

---

## 2. Giải quyết Yêu cầu 2: Kiểm chứng Chống AI Đưa ra Kiến thức Sai (`eval_hallucination.py`)

### 2.1. Kiến trúc 3 tầng kiểm chứng kiến thức Toán học (3-Tier Verification Guard)
Hệ thống nâng cấp [`backend/typesafe_guard.py`](backend/typesafe_guard.py) (`JevStyleReflexEngine` + `TypeSafeAIGuard`) kết hợp [`backend/math_solver.py`](backend/math_solver.py) tạo thành hàng rào 3 lớp:

1. **Tầng 1 — Kiểm chứng Đại số & Phương trình tất định bằng SymPy (`math_solver.deterministic_checks`):**
   - `check_against_presolve` & `check_substitution`: Tự động giải phương trình độc lập bằng SymPy và **thế ngược nghiệm của AI vào phương trình gốc** để bắt lỗi tìm sai nghiệm hoặc nhận nghiệm ngoại lai làm mẫu số bằng $0$.
   - `check_identities`: Phân tích các biến đổi tương đương trong lời giải (ví dụ phân tích đa thức thành nhân tử, khai triển hằng đẳng thức) và kiểm tra `sympy.simplify(LHS - RHS) == 0`.
   - `check_sanity`: Kiểm tra miền giá trị vật lý/hình học (bán kính, độ dài, diện tích, thể tích không thể âm; xác suất không vượt quá $1$).
2. **Tầng 2 — Kiểm chứng Phép tính & Quy tắc Kiến thức Toán học (`JevStyleReflexEngine`):**
   - `verify_arithmetic_statements`: Bắt và **tự động sửa tại chỗ (Auto-Heal)** mọi phép tính số học sai trong các bước trung gian (ví dụ viết `(12 * 5) / 2 = 35` được sửa thành `(12 * 5) / 2 = 30`).
   - `verify_mathematical_knowledge`: Phát hiện **8 nhóm lỗi kiến thức Toán học phổ biến** mà LLM thường mắc phải:
     1. *Sai hằng đẳng thức & phân tích nhân tử:* $(a+b)^2 = a^2 + b^2$, $(x-y)^2 = x^2 - y^2$, $x^3 - 8 = (x-2)(x^2 - 2x + 4)$.
     2. *Sai định lý Viète & công thức nghiệm bậc hai:* $x_1 + x_2 = \frac{b}{a}$, $x_1 x_2 = -\frac{c}{a}$, $\Delta = b^2 + 4ac$.
     3. *Sai nghiệm phương trình & quên loại nghiệm ngoại lai:* Giải $\frac{x^2-4}{x-2}=0$ kết luận nhận cả $x=2$.
     4. *Sai công thức Đạo hàm & Lượng giác:* $(\sin x)' = -\cos x$, $(\cos x)' = \sin x$, $\sin^2 x - \cos^2 x = 1$, giải $\sin x = 2$ trên $\mathbb{R}$.
     5. *Ngộ nhận Căn thức & Logarit:* $\sqrt{a+b} = \sqrt{a} + \sqrt{b}$, $\sqrt{x^2+y^2} = x+y$, $\ln(a+b) = \ln a + \ln b$.
     6. *Vi phạm Tập xác định & Miền giá trị:* Chia cho $0$, lấy $\ln(\le 0)$, lấy $\sqrt{<0}$ trên $\mathbb{R}$, bán kính $R < 0$, xác suất $P > 1$.
     7. *Sai công thức Hình học không gian & tính nhẩm:* Tính thể tích khối chóp/khối nón $V = S_{\text{đáy}} \cdot h$ (quên hệ số $\frac{1}{3}$).
     8. *Ngụy tạo đáp án trắc nghiệm (Forced MCQ Fabrication):* Tính ra $8.25$ nhưng tự bịa $\approx 8.79$ để ép chọn đáp án D.
3. **Tầng 3 — TypeSafe SystemOne Middleware (`call_systemone_middleware`):**
   - Sử dụng khóa đơn `TYPESAFE_API_KEY_PRIMARY` (không cần xoay vòng) để chấm điểm mức độ ảo giác ngữ nghĩa (`has_hallucination`, `hallucination_level`, `math_domain`).

### 2.2. Kết quả Thực nghiệm Định lượng trên Bộ Benchmark Kiến thức Sai (`N = 48` ca đối chứng + `6` ca Live Adversarial)
Kịch bản [`backend/tests/eval_hallucination.py`](backend/tests/eval_hallucination.py) đánh giá trên **48 ca đối chứng** (24 ca chứa lỗi kiến thức tinh vi + 24 ca lời giải chuẩn tương ứng để đo tỷ lệ báo động giả) và **6 ca bẫy trực tiếp (Live LLM Adversarial Trap Probe)**. Kết quả lưu tại [`backend/reports/hallucination_eval.jsonl`](backend/reports/hallucination_eval.jsonl) và [`backend/reports/hallucination_eval_summary.json`](backend/reports/hallucination_eval_summary.json):

| Nhóm lỗi kiến thức Toán học (`Category`) | Số ca lỗi (Positive) | Bắt đúng (`TP`) | Bỏ lọt (`FN`) | Số ca chuẩn (Negative) | Xác nhận chuẩn (`TN`) | Báo động giả (`FP`) | Độ chính xác |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Hằng đẳng thức & Nhân tử (`algebraic_identity`)** | 4 | **4** | 0 | 4 | **4** | 0 | **100.0%** |
| **2. Định lý Viète & Tam thức bậc 2 (`viete_quadratic`)** | 3 | **3** | 0 | 3 | **3** | 0 | **100.0%** |
| **3. Nghiệm sai & Nghiệm ngoại lai (`wrong_root_substitution`)** | 3 | **3** | 0 | 3 | **3** | 0 | **100.0%** |
| **4. Đạo hàm & Lượng giác (`calculus_trig_formula`)** | 4 | **4** | 0 | 4 | **4** | 0 | **100.0%** |
| **5. Căn thức & Logarit (`radical_log_misconception`)** | 3 | **3** | 0 | 3 | **3** | 0 | **100.0%** |
| **6. Tập xác định & Miền giá trị (`domain_sanity_violation`)** | 4 | **4** | 0 | 4 | **4** | 0 | **100.0%** |
| **7. Công thức Hình học & Tính nhẩm (`geometry_arithmetic_error`)** | 2 | **2** | 0 | 2 | **2** | 0 | **100.0%** |
| **8. Ngụy tạo đáp án trắc nghiệm (`fabricated_mcq_contradiction`)** | 1 | **1** | 0 | 1 | **1** | 0 | **100.0%** |
| **TỔNG CỘNG (`N = 48`)** | **24** | **24** | **0** | **24** | **24** | **0** | **100.0%** |

#### Các chỉ số thống kê tổng hợp (`hallucination_eval_summary.json`):
- **Confusion Matrix:** `TP = 24`, `FP = 0`, `TN = 24`, `FN = 0`
- **Overall Accuracy:** **100.0%** (95% Wilson CI: `92.6% – 100.0%`)
- **Sensitivity / Recall (Độ nhạy bắt lỗi kiến thức sai):** **100.0%** (95% Wilson CI: `86.2% – 100.0%`)
- **Specificity / TNR (Độ đặc hiệu không báo giả trên lời giải đúng):** **100.0%** (95% Wilson CI: `86.2% – 100.0%`)
- **Precision & F1-Score:** **Precision = 100.0%** | **F1-Score = 100.0%**
- **Tỷ lệ Tự sửa lỗi hoặc Gắn cảnh báo (`Auto-Heal / Warn Rate`):** **100.0% (24/24 ca lỗi)**
- **Live LLM Adversarial Trap Probe (6 bẫy trực tiếp qua Cerebras/Groq + TypeSafe Middleware):** **6/6 (100.0%) PASSED** (`LIVE-TRAP-01` đến `LIVE-TRAP-06`, độ trễ trung bình `1.17s – 2.52s`).

---

## 3. Hướng dẫn Giám khảo Tái lập Toàn bộ Kết quả (Reproducibility Commands)

Mọi kết quả trong báo cáo này đều có thể chạy kiểm chứng lại trực tiếp từ thư mục gốc dự án:

```powershell
# 1. Kiểm tra trạng thái API keys (bao gồm khóa đơn TYPESAFE_API_KEY_PRIMARY)
.\.venv\Scripts\python.exe duosteam\backend\scripts\check_api_keys.py

# 2. Chạy bộ kiểm thử đơn vị cho SymPy Solver & TypeSafe Guard (25/25 + 5/5 PASS)
.\.venv\Scripts\python.exe duosteam\backend\test_math_solver.py
.\.venv\Scripts\python.exe duosteam\backend\test_typesafe_guard.py

# 3. Chạy Benchmark Kiểm chứng Chống AI Đưa ra Kiến thức Sai (48 ca đối chứng + 6 ca Live Trap)
.\.venv\Scripts\python.exe duosteam\backend\tests\eval_hallucination.py

# 4. Chạy Benchmark Độc lập 60 bài toán (Hendrycks MATH + Vi-MetaMath + Omni-MATH, seed=42)
.\.venv\Scripts\python.exe duosteam\backend\tests\eval_external_benchmark.py --n-per-math-subject 10 --n-vi 20 --n-omni 20 --resume
```
