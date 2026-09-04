#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
translate_and_curate.py - LaTeX-Preserving Mathematical Translator & Curating Pipeline
Uses Gemini API to accurately translate international Olympiad problems (NuminaMath, Omni-MATH, MathNet)
into natural Vietnamese while preserving all mathematical LaTeX ($ ... $, $$ ... $$) and structure.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, Any
import httpx

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.environ.get("GEMINI_MODEL", "gemini-3.7-flash")
BASE_URL       = "https://generativelanguage.googleapis.com/v1beta/models"

TRANSLATE_SYSTEM_PROMPT = """Bạn là chuyên gia dịch thuật và biên khảo Toán học Olympiad song ngữ (Anh - Việt).
Nhiệm vụ: Dịch bài toán và lời giải từ tiếng Anh sang tiếng Việt với chuẩn mực học thuật cao:
1. Giữ nguyên 100% tất cả công thức LaTeX trong dấu $...$ hoặc $$...$$. Không tự ý sửa đổi ký hiệu toán học.
2. Dùng đúng thuật ngữ toán học THPT/Chuyên/Olympiad Việt Nam:
   - "harmonic bundle" -> "chùm điều hòa", "harmonic quadrilateral" -> "tứ giác điều hòa"
   - "radical axis" -> "trục đẳng phương", "power of a point" -> "phương tích"
   - "inversion" -> "phép nghịch đảo", "cross ratio" -> "tỉ số kép"
   - "complete quadrilateral" -> "tứ giác toàn phần", "symmedian" -> "đường đối trung"
   - "convex function" -> "hàm số lồi", "generating function" -> "hàm sinh"
3. Định dạng đầu ra: Trả về JSON object hợp lệ gồm {"problem_vi": "...", "solution_vi": "..."}.
"""

def translate_math_item(problem_en: str, solution_en: str, client: httpx.Client) -> Dict[str, str]:
    if not GEMINI_API_KEY:
        return {
            "problem_vi": f"[Dịch VI] {problem_en}",
            "solution_vi": f"[Lời giải VI] {solution_en}"
        }
    
    prompt = f"### BÀI TOÁN GỐC (EN):\n{problem_en}\n\n### LỜI GIẢI GỐC (EN):\n{solution_en}\n\nHãy dịch sang tiếng Việt và trả về JSON {{\"problem_vi\": \"...\", \"solution_vi\": \"...\"}}."
    url = f"{BASE_URL}/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "system_instruction": {"parts": [{"text": TRANSLATE_SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }
    
    for attempt in range(3):
        try:
            resp = client.post(url, json=payload, timeout=30.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            elif resp.status_code == 429:
                time.sleep(2 * (attempt + 1))
        except Exception as e:
            time.sleep(1)
            
    return {"problem_vi": problem_en, "solution_vi": solution_en}

def process_file(input_file: Path, output_file: Path, limit: int = 100):
    print(f"[INFO] Translating {input_file} -> {output_file} (max {limit} items)...")
    translated_count = 0
    with httpx.Client() as client:
        with open(input_file, "r", encoding="utf-8") as f_in, open(output_file, "w", encoding="utf-8") as f_out:
            for line in f_in:
                if not line.strip():
                    continue
                item = json.loads(line)
                prob = item.get("problem") or item.get("question") or item.get("content", "")
                sol = item.get("solution") or item.get("answer") or item.get("explanation", "")
                
                if not prob:
                    continue
                    
                trans = translate_math_item(prob, sol, client)
                curated_entry = {
                    "id": item.get("id", f"trans_{translated_count}"),
                    "language": "vi",
                    "category": item.get("category", "olympiad"),
                    "difficulty": item.get("difficulty", "olympiad"),
                    "problem": trans.get("problem_vi", prob),
                    "solution": trans.get("solution_vi", sol),
                    "problem_original_en": prob,
                    "solution_original_en": sol
                }
                f_out.write(json.dumps(curated_entry, ensure_ascii=False) + "\n")
                translated_count += 1
                if translated_count >= limit:
                    break
    print(f"[DONE] Saved {translated_count} curated items to {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Translate Olympiad datasets into Vietnamese")
    parser.add_argument("--input", type=str, default="raw_data/hendrycks_math.jsonl")
    parser.add_argument("--output", type=str, default="curated_translated.jsonl")
    parser.add_argument("--limit", type=int, default=50)
    args = parser.parse_args()

    curr_dir = Path(__file__).resolve().parent
    in_path = curr_dir / args.input if not Path(args.input).is_absolute() else Path(args.input)
    out_path = curr_dir / args.output if not Path(args.output).is_absolute() else Path(args.output)
    
    if in_path.exists():
        process_file(in_path, out_path, limit=args.limit)
    else:
        print(f"[WARN] Input file {in_path} not found.")
