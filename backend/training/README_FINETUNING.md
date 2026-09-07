# 🚀 DUOMCB OLYMPIAD & BILINGUAL MATH FINE-TUNING SUITE

Hướng dẫn toàn diện về quy trình thu thập dữ liệu Toán học song ngữ (Anh - Việt), tiền xử lý và Fine-Tune mô hình Google Gemini cho Chatbot DuoMCB.

---

## 📂 Danh Mục Công Cụ & Scripts (`backend/training/`)

| File / Script | Chức Năng |
|---|---|
| `generate_mathviz_sft_dataset.py` | Sinh tập dữ liệu SFT chuyên biệt cho 9 loại Canvas Widgets (Geometry 2D, 3D, Function Plot...) định dạng ChatML & DeepSeek-R1 CoT. |
| `train_hf_mathviz_unsloth.py` | Kịch bản Fine-Tune QLoRA 4-bit với Unsloth cho DeepSeek-R1-Distill-Qwen-7B hoặc Qwen2.5-Math-7B, tự động export GGUF và push Hub. |
| `DuoMath_MathViz_FineTuning_Colab.ipynb` | Jupyter Notebook 1-Click chạy huấn luyện hoàn toàn miễn phí trên GPU Google Colab T4. |
| `benchmark_canvas_model.py` | Bộ kiểm thử & đánh giá tỷ lệ sinh widget hợp lệ, độ chính xác hình học qua snapping gate và drop rate. |
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

### 1. Chuẩn bị tập dữ liệu Canvas & Math SFT
```bash
python training/generate_mathviz_sft_dataset.py --sample-size 200 --eval-ratio 0.1
```
Dữ liệu sẽ được xuất ra `backend/training/tuning_data/`:
- `hf_mathviz_chatml_train.jsonl` & `hf_mathviz_chatml_val.jsonl` (Chuẩn ChatML)
- `hf_deepseek_r1_mathviz_train.jsonl` & `hf_deepseek_r1_mathviz_val.jsonl` (Chuẩn DeepSeek-R1 CoT `<think>`)

### 2. Chạy Fine-Tuning Trên Cloud GPU (Google Colab / Kaggle)
Do laptop Latitude 7300 không có GPU rời, hãy mở file [DuoMath_MathViz_FineTuning_Colab.ipynb](file:///c:/Users/Latitude%207300/OneDrive/M%C3%A1y%20t%C3%ADnh/duosteam%20-%20Copy/duosteam/backend/training/DuoMath_MathViz_FineTuning_Colab.ipynb) trên Google Colab (chọn Runtime: T4 GPU miễn phí):
- Cài đặt Unsloth.
- Nạp base model `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` hoặc `Qwen/Qwen2.5-Math-7B-Instruct`.
- Huấn luyện trong ~15-25 phút.
- Tự động đẩy adapter lên Hugging Face Hub của bạn (`push_to_hub`) hoặc export file GGUF.

### 3. Đánh Giá & Benchmark Mô Hình
```bash
python training/benchmark_canvas_model.py
```
Kiểm tra cú pháp JSON, tỷ lệ vượt qua cổng kiểm định hình học `geometry_snapping.py` và đo tỷ lệ drop rate.

### 4. Cấu Hình Backend DuoMath
Sau khi có mô hình trên Hugging Face Hub (hoặc chạy qua vLLM / Ollama / OpenRouter), cập nhật file `backend/.env`:
```env
LLM_PROVIDER=openai_compatible  # hoặc "huggingface", "gemini"
HF_MODEL_NAME=your-username/duomath-r1-mathviz-7b
OPENAI_COMPATIBLE_BASE_URL=https://api-inference.huggingface.co/v1  # hoặc URL vLLM/Ollama
OPENAI_COMPATIBLE_API_KEY=your_api_token
```
Backend DuoMath sẽ tự động định tuyến toàn bộ yêu cầu giải toán và sinh Canvas Widget qua mô hình mới, đồng thời tự động kích hoạt bộ đệm phòng vệ snapping và verification gate!

