# 🚀 Sổ tay thực thi tối ưu Qwen2.5-VL Hình học (Dành cho Google Colab / GPU Server)
> Tham chiếu trực tiếp tài liệu hướng dẫn: `D:\qwen_vl_optimization_guide.pdf`

---

## BƯỚC 1: Chuẩn hoá Định dạng Đáp án cuối (Thực thi ngay)
> **Mục đích:** Ép mô hình xuất câu trả lời theo đúng tag cố định ở dòng cuối cùng, làm nền tảng cho việc chấm điểm Benchmark và tính Reward cho GRPO RL.

Dán đoạn mã sau vào cell định nghĩa Prompt trong Colab:

```python
# ==============================================================================
# 1. CẬP NHẬT SYSTEM PROMPT & HÀM BÓC TÁCH ĐÁP ÁN (Mục 1 trong Guide)
# ==============================================================================
FINAL_ANSWER_TAG = "Dap an cuoi cung:"

SYSTEM_PROMPT = (
    "You are a careful geometry tutor. Reason step by step about the shapes, "
    "coordinates, and relationships shown in the diagram, then on the LAST line "
    "write exactly:\n"
    f"{FINAL_ANSWER_TAG} <answer>\n"
    "with nothing else after it."
)

def extract_final_answer(text: str) -> str:
    """Bóc tách đáp án theo thẻ chuẩn, fallback về các mẫu câu thông dụng nếu chưa có thẻ"""
    if not text:
        return ""
    if FINAL_ANSWER_TAG in text:
        return text.rsplit(FINAL_ANSWER_TAG, 1)[-1].strip().split("\n")[0].strip()
    return text[-150:].strip()

def format_training_answer(text: str, gold_answer: str) -> str:
    """Chỉ áp dụng khi nạp dữ liệu MỚI đã có gold_answer tách riêng"""
    text = text.rstrip()
    if FINAL_ANSWER_TAG not in text:
        text = f"{text}\n\n{FINAL_ANSWER_TAG} {gold_answer}"
    return text
```

---

## BƯỚC 2: Đánh giá Benchmark đầy đủ, phân tách theo nguồn (Mục 5 trong Guide)
> **Mục đích:** Thay thế cell test 10 mẫu ngẫu nhiên bằng cell đánh giá toàn diện trên toàn bộ `test.jsonl`. Tách riêng tỉ lệ đúng theo từng `dataset_source` để lấy điểm chuẩn (baseline).

```python
# ==============================================================================
# 2. CELL BENCHMARK TOÀN DIỆN TRÊN test.jsonl
# ==============================================================================
from collections import defaultdict
from PIL import Image

FastVisionModel.for_inference(model)

# Đường dẫn file dữ liệu kiểm thử
test_data_raw = load_jsonl(PROCESSED_DIR / "test.jsonl")
stats = defaultdict(lambda: [0, 0])  # nguon -> [dung, tong]

print(f"Bắt đầu đánh giá toàn diện trên {len(test_data_raw)} mẫu...")

for idx, r in enumerate(test_data_raw, 1):
    img_path = IMG_DIR / r["image"]
    if not img_path.exists():
        continue
    img = Image.open(img_path).convert("RGB")
    
    messages = [
        {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
        {"role": "user", "content": [{"type": "image"}, {"type": "text", "text": r["question"]}]},
    ]
    input_text = tokenizer.apply_chat_template(messages, add_generation_prompt=True)
    inputs = tokenizer(img, input_text, add_special_tokens=False, return_tensors="pt").to("cuda")
    
    output_ids = model.generate(
        **inputs,
        max_new_tokens=512,
        use_cache=True,
        temperature=0.2,
        min_p=0.1
    )
    output_text = tokenizer.decode(output_ids[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    
    is_correct = grade(output_text, str(r["answer"]))
    src = r.get("dataset_source", "chung")
    stats[src][1] += 1
    stats[src][0] += int(is_correct)
    
    if idx % 20 == 0 or idx == len(test_data_raw):
        print(f"Tiến độ: [{idx}/{len(test_data_raw)}]")

# Xuất bảng thống kê chi tiết
print("\n" + "=" * 45)
print(f"{'Nguon':<16} {'Dung':>6} {'Tong':>6} {'Ty le':>10}")
print("-" * 45)
for src, (correct, total) in stats.items():
    rate = (correct / total * 100) if total > 0 else 0.0
    print(f"{src:<16} {correct:>6} {total:>6} {rate:>9.1f}%")

overall_correct = sum(c for c, t in stats.values())
overall_total = sum(t for c, t in stats.values())
overall_rate = (overall_correct / overall_total * 100) if overall_total > 0 else 0.0
print("-" * 45)
print(f"{'TONG CONG':<16} {overall_correct:>6} {overall_total:>6} {overall_rate:>9.1f}%")
print("=" * 45)
```

---

## BƯỚC 3: Thử nghiệm Self-Consistency (Vote đa số lúc suy luận - Mục 3)
> **Mục đích:** Tăng ngay độ chính xác mà không cần tốn GPU huấn luyện lại. Dùng hàm này để test trên các bài hình học khó hoặc trắc nghiệm Olympic.

```python
# ==============================================================================
# 3. SELF-CONSISTENCY VOTE ĐA SỐ
# ==============================================================================
from collections import Counter

def self_consistency_answer(image, question: str, n_samples: int = 5, temperature: float = 0.7):
    messages = [
        {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
        {"role": "user", "content": [{"type": "image"}, {"type": "text", "text": question}]},
    ]
    input_text = tokenizer.apply_chat_template(messages, add_generation_prompt=True)
    inputs = tokenizer(image, input_text, add_special_tokens=False, return_tensors="pt").to("cuda")
    
    votes = []
    for _ in range(n_samples):
        output_ids = model.generate(
            **inputs,
            max_new_tokens=512,
            use_cache=True,
            temperature=temperature,
            min_p=0.1,
            do_sample=True
        )
        text = tokenizer.decode(output_ids[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        votes.append(extract_final_answer(text))
    
    best_answer, count = Counter(votes).most_common(1)[0]
    return best_answer, votes
```

---

## BƯỚC 4: Huấn luyện GRPO Reinforcement Learning (Mục 2)
> **Lưu ý an toàn:** Chạy thử nghiệm trước trên 20 mẫu để kiểm tra tương thích VRAM.

```python
# ==============================================================================
# 4. CHẠY GRPO REINFORCEMENT LEARNING SAU SFT
# ==============================================================================
from trl import GRPOConfig, GRPOTrainer

def to_grpo_prompt(sample: dict):
    img_path = IMG_DIR / sample["image"]
    if not img_path.exists():
        return None
    try:
        image = Image.open(img_path).convert("RGB")
    except Exception:
        return None
    return {
        "prompt": [
            {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
            {"role": "user", "content": [{"type": "image", "image": image}, {"type": "text", "text": sample["question"]}]},
        ],
        "answer": sample["answer"],
    }

grpo_train_raw = load_jsonl(PROCESSED_DIR / "train.jsonl")
# Chạy thử 20-50 mẫu trước để kiểm chứng VRAM:
grpo_dataset = [g for g in (to_grpo_prompt(s) for s in grpo_train_raw[:50]) if g is not None]

def accuracy_reward(completions, answer, **kwargs):
    rewards = []
    for completion, gold in zip(completions, answer):
        text = completion[0]["content"] if isinstance(completion, list) else completion
        rewards.append(1.0 if grade(text, str(gold)) else 0.0)
    return rewards

FastVisionModel.for_training(model)

grpo_config = GRPOConfig(
    output_dir="outputs_grpo",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    num_generations=4, # số câu trả lời sinh mỗi prompt để so sánh trong 1 group
    max_completion_length=512,
    learning_rate=1e-5,
    logging_steps=1,
    save_strategy="steps",
    save_steps=20,
    report_to="none",
)

grpo_trainer = GRPOTrainer(
    model=model, # tiếp tục train trên adapter LoRA vừa SFT
    reward_funcs=accuracy_reward,
    args=grpo_config,
    train_dataset=grpo_dataset,
)

grpo_trainer.train()
```

---

## BƯỚC 5: Gộp Adapter Tránh Bẫy Double Quantization (Mục 6)
> **Cực kỳ quan trọng:** Không nạp adapter LoRA lên base 4-bit để merge rồi xuất GGUF. Hãy nạp adapter lên bản gốc FP16/BF16 để bảo toàn chất lượng suy luận:

```python
# Nạp bản gốc FP16/BF16 đầy đủ (KHÔNG dùng load_in_4bit khi gộp xuất GGUF)
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
from peft import PeftModel
import torch

base_model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2.5-VL-7B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="cpu" # hoặc "auto" nếu đủ VRAM
)

model_merged = PeftModel.from_pretrained(base_model, "duomath_qwen_vl_lora")
model_merged = model_merged.merge_and_unload()

# Lưu model đã gộp sạch sẽ
model_merged.save_pretrained("duomath_merged_clean", safe_serialization=True)
processor = AutoProcessor.from_pretrained("Qwen/Qwen2.5-VL-7B-Instruct")
processor.save_pretrained("duomath_merged_clean")
```
