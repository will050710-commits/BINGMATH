#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tune_gemini_aistudio.py - Fine-Tune Gemini directly via Google AI Studio API
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass

def run_aistudio_tuning(api_key: str, base_model: str, display_name: str, epochs: int, batch_size: int, learning_rate: float):
    try:
        import google.generativeai as genai
    except ImportError:
        print("[ERROR] 'google-generativeai' is required. Install with: pip install google-generativeai")
        sys.exit(1)

    genai.configure(api_key=api_key)
    
    data_dir = Path(__file__).resolve().parent / "tuning_data"
    train_file = data_dir / "gemini_vertex_train.jsonl"
    
    if not train_file.exists():
        print(f"[ERROR] Training data not found at {train_file}. Run prepare_vertex_tuning_data.py first!")
        sys.exit(1)

    training_data = []
    with open(train_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                training_data.append(json.loads(line))

    print("================================================================")
    print("  Google AI Studio - DuoMCB Direct Fine-Tuning")
    print(f"  Base Model: {base_model}, Display Name: {display_name}")
    print(f"  Training Examples: {len(training_data)}")
    print("================================================================")

    formatted_dataset = []
    for item in training_data:
        sys_inst = item.get("systemInstruction", {}).get("parts", [{}])[0].get("text", "")
        user_msg = item["contents"][0]["parts"][0]["text"]
        model_msg = item["contents"][1]["parts"][0]["text"]
        
        full_text_input = f"{sys_inst}\n\n[USER]: {user_msg}" if sys_inst else user_msg
        formatted_dataset.append({
            "text_input": full_text_input,
            "output": model_msg
        })

    try:
        operation = genai.create_tuned_model(
            source_model=base_model,
            training_data=formatted_dataset,
            id=display_name.lower().replace("_", "-"),
            display_name=display_name,
            epoch_count=epochs,
            batch_size=batch_size,
            learning_rate=learning_rate,
        )
        print(f"[OK] Tuning Job initiated: {operation.name}")
        print("[INFO] Waiting for fine-tuning to complete...")
        for status in operation.wait_bar():
            time.sleep(10)

        result = operation.result()
        print(f"[SUCCESS] Fine-Tuned Model Created: {result.name}")
        print(f"Update backend/.env with: GEMINI_MODEL={result.name}")
    except Exception as e:
        print(f"[ERROR] Failed to create tuned model: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Direct Google AI Studio Fine-Tuning")
    parser.add_argument("--api_key", type=str, default=os.environ.get("GEMINI_API_KEY", ""))
    parser.add_argument("--model", type=str, default="models/gemini-1.5-flash-001-tuning")
    parser.add_argument("--display_name", type=str, default="duomcb-olympiad-v1")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=0.001)
    args = parser.parse_args()

    if not args.api_key:
        print("[ERROR] GEMINI_API_KEY is required.")
        sys.exit(1)

    run_aistudio_tuning(args.api_key, args.model, args.display_name, args.epochs, args.batch_size, args.lr)
