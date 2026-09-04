#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prepare_vertex_tuning_data.py - Prepare Google Vertex AI & Google AI Studio SFT Training JSONL

Supports two fine-tuning objectives aligned with DuoMCB:
1. "solution" mode: Step-by-step rigorous proof with LaTeX and practice problem.
2. "hint" mode: Socratic guidance with numbered hints (💡 Gợi ý 1, 💡 Gợi ý 2) and leading questions.
"""

import os
import sys
import json
import random
import argparse
from pathlib import Path
from typing import List, Dict, Any

DUOMCB_SYSTEM_PROMPT_SOLUTION = """Bạn là DuoMCB - Gia sư AI chuyên gia Toán học Olympiad và THPT Chuyên (song ngữ Anh - Việt).
Quy tắc phản hồi:
1. Phân tích kỹ giả thiết và kết luận của đề bài.
2. Trình bày lời giải HOÀN CHỈNH, CHẶT CHẼ theo từng bước logic rõ ràng (**Bước 1**, **Bước 2**...), nêu rõ căn cứ định lý, bổ đề, tính chất hình học/đại số.
3. Sử dụng công thức LaTeX chuẩn ($...$ cho inline, $$...$$ cho block riêng).
4. Kết thúc bằng 1 **Bài Tập Luyện Tập Ngay** tương tự để học sinh củng cố kiến thức.
"""

DUOMCB_SYSTEM_PROMPT_HINT = """Bạn là DuoMCB - Gia sư AI chuyên gia Toán học đồng hành theo phương pháp Socratic gợi mở (song ngữ Anh - Việt).
Quy tắc phản hồi:
1. Nhận diện trọng tâm và bản chất của bài toán.
2. Cung cấp 2-3 gợi ý sâu sắc từng bước (`💡 Gợi ý 1:`, `💡 Gợi ý 2:`) chỉ ra bổ đề hoặc hướng suy luận then chốt mà không giải hộ hoàn toàn.
3. Đặt câu hỏi dẫn dắt để học sinh tự thực hiện phép biến đổi/chứng minh tiếp theo.
4. Sử dụng công thức LaTeX chuẩn ($...$ cho inline, $$...$$ cho block riêng).
"""

def clean_latex(text: str) -> str:
    if not text:
        return ""
    text = text.replace(r"\(", "$").replace(r"\)", "$")
    text = text.replace(r"\[", "$$").replace(r"\]", "$$")
    return text.strip()

def format_gemini_sft_item(problem: str, solution: str, hints: str = None, mode: str = "solution") -> Dict[str, Any]:
    prob_clean = clean_latex(problem)
    sol_clean = clean_latex(solution)
    hint_clean = clean_latex(hints) if hints else None

    if mode == "hint" and hint_clean:
        system_text = DUOMCB_SYSTEM_PROMPT_HINT
        user_text = f"Em đang làm bài toán này, thầy/cô gợi ý giúp em hướng giải với ạ:\n{prob_clean}"
        assistant_text = hint_clean
    else:
        system_text = DUOMCB_SYSTEM_PROMPT_SOLUTION
        user_text = f"Xin hãy hướng dẫn em lời giải chi tiết và chặt chẽ cho bài toán sau:\n{prob_clean}"
        assistant_text = sol_clean

    return {
        "systemInstruction": {
            "parts": [{"text": system_text}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_text}]
            },
            {
                "role": "model",
                "parts": [{"text": assistant_text}]
            }
        ]
    }

def format_openai_sft_item(problem: str, solution: str, hints: str = None, mode: str = "solution") -> Dict[str, Any]:
    prob_clean = clean_latex(problem)
    sol_clean = clean_latex(solution)
    hint_clean = clean_latex(hints) if hints else None

    if mode == "hint" and hint_clean:
        system_text = DUOMCB_SYSTEM_PROMPT_HINT
        user_text = f"Em đang làm bài toán này, thầy/cô gợi ý giúp em hướng giải với ạ:\n{prob_clean}"
        assistant_text = hint_clean
    else:
        system_text = DUOMCB_SYSTEM_PROMPT_SOLUTION
        user_text = f"Xin hãy hướng dẫn em lời giải chi tiết và chặt chẽ cho bài toán sau:\n{prob_clean}"
        assistant_text = sol_clean

    return {
        "messages": [
            {"role": "system", "content": system_text},
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": assistant_text}
        ]
    }

def build_training_splits(source_files: List[Path], output_dir: Path, eval_ratio: float = 0.1, seed: int = 42):
    random.seed(seed)
    all_gemini_items = []
    all_openai_items = []

    for file_path in source_files:
        if not file_path.exists():
            continue
        print(f"[INFO] Reading {file_path}...")
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    prob = (
                        data.get("problem")
                        or data.get("question")
                        or data.get("query_vi")
                        or data.get("query")
                        or data.get("instruction")
                        or data.get("original_question_vi")
                        or data.get("content")
                        or data.get("problem_vi")
                    )
                    sol = (
                        data.get("solution")
                        or data.get("answer")
                        or data.get("response_vi")
                        or data.get("response")
                        or data.get("output")
                        or data.get("explanation")
                        or data.get("solution_vi")
                    )
                    hints = data.get("socratic_hints") or data.get("hints")

                    if not prob or not sol:
                        continue

                    # 1. Solution mode entry
                    g_sol = format_gemini_sft_item(prob, sol, mode="solution")
                    o_sol = format_openai_sft_item(prob, sol, mode="solution")
                    all_gemini_items.append(g_sol)
                    all_openai_items.append(o_sol)

                    # 2. Hint mode entry
                    if hints:
                        g_hint = format_gemini_sft_item(prob, sol, hints=hints, mode="hint")
                        o_hint = format_openai_sft_item(prob, sol, hints=hints, mode="hint")
                        all_gemini_items.append(g_hint)
                        all_openai_items.append(o_hint)
                except Exception:
                    continue

    print(f"[INFO] Total generated examples: {len(all_gemini_items)}")
    
    indices = list(range(len(all_gemini_items)))
    random.shuffle(indices)
    split_idx = int(len(indices) * (1.0 - eval_ratio))
    
    train_indices = indices[:split_idx] if split_idx > 0 else indices
    eval_indices = indices[split_idx:] if split_idx < len(indices) else indices[:1]

    output_dir.mkdir(parents=True, exist_ok=True)
    
    train_gemini_path = output_dir / "gemini_vertex_train.jsonl"
    eval_gemini_path = output_dir / "gemini_vertex_eval.jsonl"
    
    with open(train_gemini_path, "w", encoding="utf-8") as f:
        for idx in train_indices:
            f.write(json.dumps(all_gemini_items[idx], ensure_ascii=False) + "\n")

    with open(eval_gemini_path, "w", encoding="utf-8") as f:
        for idx in eval_indices:
            f.write(json.dumps(all_gemini_items[idx], ensure_ascii=False) + "\n")

    train_oai_path = output_dir / "duomcb_chat_train.jsonl"
    eval_oai_path = output_dir / "duomcb_chat_eval.jsonl"
    
    with open(train_oai_path, "w", encoding="utf-8") as f:
        for idx in train_indices:
            f.write(json.dumps(all_openai_items[idx], ensure_ascii=False) + "\n")

    with open(eval_oai_path, "w", encoding="utf-8") as f:
        for idx in eval_indices:
            f.write(json.dumps(all_openai_items[idx], ensure_ascii=False) + "\n")

    print(f"[SUCCESS] Prepared {len(train_indices)} train items and {len(eval_indices)} eval items in {output_dir}")

def main():
    parser = argparse.ArgumentParser(description="Prepare SFT Dataset for Gemini / Vertex AI")
    parser.add_argument("--eval_ratio", type=float, default=0.1, help="Validation set ratio")
    args = parser.parse_args()

    curr_dir = Path(__file__).resolve().parent
    source_files = [
        curr_dir / "olympiad_seed_curated.jsonl",
        curr_dir / "curated_translated.jsonl",
        curr_dir / "raw_data" / "vi_metamath.jsonl",
        curr_dir / "raw_data" / "hendrycks_math.jsonl",
        curr_dir / "raw_data" / "omnimath.jsonl"
    ]
    
    seed_file = curr_dir / "olympiad_seed_curated.jsonl"
    if not seed_file.exists():
        from sample_olympiad_seed import save_seed_dataset
        save_seed_dataset(seed_file)

    output_dir = curr_dir / "tuning_data"
    build_training_splits(source_files, output_dir, eval_ratio=args.eval_ratio)

if __name__ == "__main__":
    main()
