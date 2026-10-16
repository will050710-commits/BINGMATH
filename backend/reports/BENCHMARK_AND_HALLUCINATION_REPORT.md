# BÁO CÁO THỰC NGHIỆM ĐỘC LẬP & KIỂM CHỨNG CHỐNG AI ĐƯA RA KIẾN THỨC SAI (DUOMATH / BINGMCB)

> **Mục tiêu tài liệu:** Giải trình trực tiếp và toàn diện hai yêu cầu cải tiến của Hội đồng Giám khảo bằng thực nghiệm định lượng, dữ liệu công khai độc lập và cơ chế kiểm chứng tất định (SymPy + TypeSafe AI Reflex Guard):
> 1. **Yêu cầu cải tiến 1:** *"Kết quả 30/30 (100%) trên bộ đề tự soạn chưa đủ tính khách quan, thuyết phục."*
> 2. **Yêu cầu cải tiến 2:** *"Cần thêm kiểm chứng trong việc AI đưa ra kiến thức sai."*

---

## 1. Giải quyết Yêu cầu 1: Benchmark Độc lập trên 3 Bộ Dữ liệu Quốc tế & Tiếng Việt (`N = 60`, `seed = 42`)

### 1.1. Kết quả tổng hợp: Raw LLM Baseline vs. DuoMath Guarded Pipeline
Dữ liệu chi tiết từng câu được lưu tại `external_benchmark_runs.jsonl` và `external_benchmark_summary.json`:

| Bộ dữ liệu độc lập | Số câu ($N$) | Độ khó / Phân tầng | Raw LLM Baseline | 95% Wilson CI (Raw) | **DuoMath Guarded Pipeline** | **95% Wilson CI (DuoMath)** | Số bài tự sửa đúng (`[HEALED]`) |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **Hendrycks MATH** | 20 | Level 1 – Level 5 | 20/20 (**100.0%**) | 83.9% – 100.0% | **20/20 (100.0%)** | **83.9% – 100.0%** | 0 |
| **Vi-MetaMath (Tiếng Việt)** | 20 | GSM8K + MATH (6 nhóm) | 20/20 (**100.0%**) | 83.9% – 100.0% | **20/20 (100.0%)** | **83.9% – 100.0%** | 0 |
| **Omni-MATH (Olympiad)** | 20 | Diff 3.0 – 5.0 (7 phân môn) | 15/20 (**75.0%**) | 53.1% – 88.8% | **17/20 (85.0%)** | **64.0% – 94.8%** | **+2 bài** (`OMNI-1129`, `OMNI-1354`) |
| **TỔNG HỢP TOÀN BỘ** | **60** | **9 phân môn / 3 bộ chuẩn** | **55/60 (91.67%)** | **81.9% – 96.4%** | **57/60 (95.00%)** | **86.3% – 98.3%** | **+2 bài (+3.33%)** |

---

## 2. Giải quyết Yêu cầu 2: Kiểm chứng Chống AI Đưa ra Kiến thức Sai (`eval_hallucination.py`)

Kết quả lưu tại `hallucination_eval.jsonl` và `hallucination_eval_summary.json`:

- **Confusion Matrix (`N = 48`):** `TP = 24`, `FP = 0`, `TN = 24`, `FN = 0`
- **Overall Accuracy:** **100.0%** (95% Wilson CI: `92.6% – 100.0%`)
- **Sensitivity / Recall:** **100.0%** (95% Wilson CI: `86.2% – 100.0%`)
- **Specificity / TNR:** **100.0%** (95% Wilson CI: `86.2% – 100.0%`)
- **Precision & F1-Score:** **100.0% / 100.0%**
- **Auto-Heal / Warn Rate:** **100.0% (24/24)**
- **Live LLM Adversarial Trap Probe:** **6/6 (100.0%) PASSED** (`LIVE-TRAP-01` .. `LIVE-TRAP-06`).
