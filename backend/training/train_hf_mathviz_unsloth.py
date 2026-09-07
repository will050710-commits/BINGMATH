#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
train_hf_mathviz_unsloth.py - Fine-Tune Math & Canvas Models with Unsloth / QLoRA 4-bit

Optimized for:
- Base Models:
  1. deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (Default, King of Math & Reasoning)
  2. Qwen/Qwen2.5-Math-7B-Instruct
  3. Qwen/Qwen2.5-7B-Instruct
- Targets: Google Colab Free T4 (16GB VRAM), Kaggle (2x T4), RunPod (RTX 3090/4090/A10G).
- High Efficiency: 2x-5x faster, 70% VRAM reduction using Unsloth.
"""

import os
import sys
import argparse
from pathlib import Path

def train(
    base_model_name: str = "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    dataset_path: str = None,
    output_dir: str = "outputs_duomath_mathviz",
    max_seq_length: int = 4096,
    lora_r: int = 16,
    lora_alpha: int = 32,
    epochs: int = 3,
    batch_size: int = 2,
    grad_accum_steps: int = 4,
    learning_rate: float = 2e-4,
    hf_repo_id: str = None,
    hf_token: str = None,
    save_gguf: bool = False
):
    print("==================================================================")
    print("  🚀 DuoMath Canvas & MathViz SFT Training with Unsloth")
    print(f"  Base Model:      {base_model_name}")
    print(f"  Max Seq Length:  {max_seq_length}")
    print(f"  LoRA Rank (r):   {lora_r}, Alpha: {lora_alpha}")
    print(f"  Batch Size:      {batch_size} (Grad Accum: {grad_accum_steps})")
    print("==================================================================")

    # 1. Check Unsloth
    try:
        from unsloth import FastLanguageModel
        import torch
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from datasets import load_dataset
    except ImportError:
        print("[ERROR] Unsloth or required packages not found.")
        print("Install via: pip install 'unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git'")
        print("             pip install --no-deps trl peft accelerate bitsandbytes")
        sys.exit(1)

    # 2. Load Model in 4-bit
    print(f"\n[INFO] Loading {base_model_name} in 4-bit precision...")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=base_model_name,
        max_seq_length=max_seq_length,
        dtype=None,  # Auto detection: bfloat16 or float16
        load_in_4bit=True,
    )

    # 3. Apply LoRA Adapters
    print("\n[INFO] Injecting PEFT / LoRA target modules...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=lora_r,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
        lora_alpha=lora_alpha,
        lora_dropout=0,      # Unsloth supports 0 dropout for maximum speed
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
    )

    # 4. Load SFT Dataset
    if not dataset_path:
        default_data = Path(__file__).resolve().parent / "tuning_data" / "hf_mathviz_chatml_train.jsonl"
        dataset_path = str(default_data)

    print(f"\n[INFO] Loading dataset from: {dataset_path}")
    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset file not found at {dataset_path}!")
        print("Please run: python backend/training/generate_mathviz_sft_dataset.py first.")
        sys.exit(1)

    dataset = load_dataset("json", data_files=dataset_path, split="train")

    def format_prompts(batch):
        formatted_texts = []
        for msgs in batch["messages"]:
            text = tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)
            formatted_texts.append(text)
        return {"text": formatted_texts}

    dataset = dataset.map(format_prompts, batched=True)
    print(f"[INFO] Dataset ready with {len(dataset)} examples.")

    # 5. Setup Trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        dataset_num_proc=2,
        packing=False,
        args=TrainingArguments(
            per_device_train_batch_size=batch_size,
            gradient_accumulation_steps=grad_accum_steps,
            warmup_ratio=0.05,
            num_train_epochs=epochs,
            learning_rate=learning_rate,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=5,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="cosine",
            seed=42,
            output_dir=output_dir,
            save_strategy="epoch",
            report_to="none"
        ),
    )

    # 6. Train
    print("\n[INFO] Starting training...")
    trainer_stats = trainer.train()
    print(f"[SUCCESS] Training complete in {trainer_stats.metrics.get('train_runtime', 0):.2f}s!")

    # 7. Save Adapter & Merged Weights
    adapter_path = os.path.join(output_dir, "lora_adapter")
    print(f"\n[INFO] Saving LoRA adapter to: {adapter_path}")
    model.save_pretrained(adapter_path)
    tokenizer.save_pretrained(adapter_path)

    # Optional: Push to Hugging Face Hub
    if hf_repo_id and hf_token:
        print(f"\n[INFO] Pushing LoRA adapter to Hugging Face: {hf_repo_id}...")
        model.push_to_hub(hf_repo_id, token=hf_token)
        tokenizer.push_to_hub(hf_repo_id, token=hf_token)
        print(f"[SUCCESS] Model published: https://huggingface.co/{hf_repo_id}")

    # Optional: Export to GGUF for Ollama / vLLM
    if save_gguf:
        gguf_dir = os.path.join(output_dir, "gguf")
        print(f"\n[INFO] Exporting 4-bit GGUF for Ollama/vLLM to {gguf_dir}...")
        model.save_pretrained_gguf(gguf_dir, tokenizer, quantization_method="q4_k_m")
        print(f"[SUCCESS] GGUF exported to: {gguf_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-Tune Hugging Face Math & Canvas Model with Unsloth")
    parser.add_argument("--base-model", type=str, default="deepseek-ai/DeepSeek-R1-Distill-Qwen-7B")
    parser.add_argument("--dataset", type=str, default=None)
    parser.add_argument("--output-dir", type=str, default="duomath_mathviz_7b_output")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--grad-accum", type=int, default=4)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--hf-repo", type=str, default=None)
    parser.add_argument("--hf-token", type=str, default=None)
    parser.add_argument("--save-gguf", action="store_true")

    args = parser.parse_args()
    train(
        base_model_name=args.base_model,
        dataset_path=args.dataset,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        grad_accum_steps=args.grad_accum,
        learning_rate=args.lr,
        hf_repo_id=args.hf_repo,
        hf_token=args.hf_token,
        save_gguf=args.save_gguf
    )
