"""
train_grpo_rl.py - Huấn luyện GRPO (Group Relative Policy Optimization) cho Qwen2.5-VL
Dựa trên tài liệu đề xuất: D:\\qwen_vl_optimization_guide.pdf (Mục 2)

Tiếp tục huấn luyện trên checkpoint LoRA vừa SFT xong, thưởng trực tiếp bằng accuracy_reward().
"""
import os
import sys
import json
import argparse
from pathlib import Path
from PIL import Image

try:
    from vision_geometry.qwen_vl_eval_utils import SYSTEM_PROMPT, accuracy_reward
except ImportError:
    from qwen_vl_eval_utils import SYSTEM_PROMPT, accuracy_reward


def load_jsonl(filepath):
    records = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def to_grpo_prompt(sample: dict, img_dir: Path):
    img_name = sample.get("image")
    if not img_name:
        return None
    img_path = img_dir / img_name
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
        "answer": sample.get("answer", ""),
    }


def run_grpo_training(
    model_path: str = "duomath_qwen_vl_lora",
    train_data_path: str = "data/processed/train.jsonl",
    images_dir: str = "data/images",
    output_dir: str = "outputs_grpo",
    num_generations: int = 4,
    learning_rate: float = 1e-5,
    max_samples: int = None
):
    print("=" * 70)
    print("  🚀 DuoMath Qwen2.5-VL Post-SFT RL via GRPO")
    print(f"  Base/LoRA Model:    {model_path}")
    print(f"  Train Data:         {train_data_path}")
    print(f"  Generations/group:  {num_generations}")
    print(f"  Learning Rate:      {learning_rate}")
    print("=" * 70)

    try:
        from unsloth import FastVisionModel
        from trl import GRPOConfig, GRPOTrainer
    except ImportError as e:
        print(f"[ERROR] Thiếu thư viện yêu cầu: {e}")
        print("Cài đặt: pip install trl peft bitsandbytes accelerate")
        sys.exit(1)

    img_dir = Path(images_dir)
    raw_records = load_jsonl(train_data_path)
    if max_samples and max_samples < len(raw_records):
        print(f"[INFO] Giới hạn {max_samples} mẫu cho bước thử nghiệm GRPO.")
        raw_records = raw_records[:max_samples]

    print("[INFO] Đang nạp và tiền xử lý prompts cho GRPO...")
    grpo_dataset = [g for g in (to_grpo_prompt(s, img_dir) for s in raw_records) if g is not None]
    print(f"[INFO] Dataset GRPO sẵn sàng với {len(grpo_dataset)} mẫu.")

    print(f"[INFO] Nạp model từ {model_path}...")
    model, tokenizer = FastVisionModel.from_pretrained(
        model_name=model_path,
        load_in_4bit=True,
    )
    FastVisionModel.for_training(model)

    grpo_config = GRPOConfig(
        output_dir=output_dir,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        num_generations=num_generations,
        max_completion_length=512,
        learning_rate=learning_rate,
        logging_steps=1,
        save_strategy="steps",
        save_steps=20,
        report_to="tensorboard",
    )

    print("[INFO] Khởi tạo GRPOTrainer...")
    grpo_trainer = GRPOTrainer(
        model=model,
        reward_funcs=accuracy_reward,
        args=grpo_config,
        train_dataset=grpo_dataset,
    )

    print("[INFO] Bắt đầu GRPO Training...")
    grpo_trainer.train()
    print(f"[DONE] Hoàn tất GRPO Training! Checkpoints lưu tại: {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GRPO Reinforcement Learning cho Qwen2.5-VL")
    parser.add_argument("--model-path", type=str, default="duomath_qwen_vl_lora")
    parser.add_argument("--train-data", type=str, default="data/processed/train.jsonl")
    parser.add_argument("--images-dir", type=str, default="data/images")
    parser.add_argument("--output-dir", type=str, default="outputs_grpo")
    parser.add_argument("--num-gens", type=int, default=4)
    parser.add_argument("--lr", type=float, default=1e-5)
    parser.add_argument("--max-samples", type=int, default=None)
    args = parser.parse_args()

    run_grpo_training(
        model_path=args.model_path,
        train_data_path=args.train_data,
        images_dir=args.images_dir,
        output_dir=args.output_dir,
        num_generations=args.num_gens,
        learning_rate=args.lr,
        max_samples=args.max_samples
    )
