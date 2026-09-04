# 🚀 DUOMCB OLYMPIAD & BILINGUAL MATH FINE-TUNING SUITE

Hướng dẫn toàn diện về quy trình thu thập dữ liệu Toán học song ngữ (Anh - Việt), tiền xử lý và Fine-Tune mô hình Google Gemini cho Chatbot DuoMCB.

---

## 📂 Danh Mục Công Cụ & Scripts (`backend/training/`)

| File / Script | Chức Năng |
|---|---|
| `sample_olympiad_seed.py` | Bộ dữ liệu hạt giống (Gold-standard Seed) chuẩn Olympiad & THPT Chuyên (Hình học chùm điều hòa, BĐT Cauchy ngược dấu, Tích phân King's property). |
| `download_datasets.py` | Tải tự động 24+ datasets toán học song ngữ từ Hugging Face (NuminaMath, Omni-MATH, MathNet, MetaMathQA Tiếng Việt, GSM8K). |
| `translate_and_curate.py` | Biên dịch bài toán tiếng Anh/Trung sang thuật ngữ toán học chuẩn Việt Nam, bảo tồn 100% công thức LaTeX `$ ... $` và `$$ ... $$`. |
| `prepare_vertex_tuning_data.py` | Định dạng dữ liệu thành file `.jsonl` chuẩn Google Vertex AI / Google AI Studio với phân chia Train/Validation. |
| `tune_gemini_aistudio.py` | Khởi chạy Fine-Tuning trực tiếp trên Google AI Studio qua `GEMINI_API_KEY` (Đơn giản nhất, không cần setup GCP). |
| `tune_gemini_vertex.py` | Khởi chạy Supervised Fine-Tuning Job trên Google Cloud Vertex AI qua GCS bucket. |
| `evaluate_model.py` | Đánh giá & Benchmark chất lượng mô hình sau Fine-Tune so với Base Model. |
| `test_training_pipeline.py` | Bộ kiểm thử tự động xác thực toàn bộ quy trình. |

---

## 🛠️ Hướng Dẫn Thực Hiện Từng Bước (Quick Start)

### 1. Cài đặt môi trường
```bash
cd backend
pip install datasets google-generativeai google-cloud-aiplatform httpx
```

### 2. Chuẩn bị dữ liệu hạt giống & SFT JSONL
```bash
python training/sample_olympiad_seed.py
python training/prepare_vertex_tuning_data.py --eval_ratio 0.1
```

### 3. Tải thêm Dataset từ Hugging Face (Tùy chọn theo dung lượng)
```bash
python training/download_datasets.py --datasets vi_metamath hendrycks_math --limit 5000
```

### 4. Chạy Fine-Tuning
```bash
# Cách 1: Qua Google AI Studio (Nhanh nhất)
python training/tune_gemini_aistudio.py --display_name duomcb-olympiad-v1 --epochs 3

# Cách 2: Qua Google Cloud Vertex AI
python training/tune_gemini_vertex.py --project your-project-id --bucket gs://your-bucket-name
```

### 5. Cập nhật Model trong Backend DuoMCB
Cập nhật file `backend/.env`:
```env
GEMINI_MODEL=tunedModels/duomcb-olympiad-v1
```
Hệ thống chatbot DuoMCB sẽ tự động gọi model fine-tuned mới cho toàn bộ các request giải toán và gợi ý Socratic!
