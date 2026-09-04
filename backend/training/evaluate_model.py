#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
evaluate_model.py - Automated Benchmark & Evaluation Suite for DuoMCB
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
import httpx

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
BASE_URL       = "https://generativelanguage.googleapis.com/v1beta/models"

def evaluate(model_name: str = "gemini-3.7-flash"):
    from sample_olympiad_seed import SEED_PROBLEMS
    print(f"Evaluating model '{model_name}' on {len(SEED_PROBLEMS)} benchmark problems...")
    
    results = []
    with httpx.Client() as client:
        for item in SEED_PROBLEMS:
            prob = item["problem"]
            prompt = f"Bạn là DuoMCB. Hãy giải bài toán sau theo từng bước chi tiết và áp dụng LaTeX chuẩn:\n{prob}"
            t0 = time.time()
            if not GEMINI_API_KEY:
                reply = f"[Mock Solution] **Bước 1:** Áp dụng bổ đề..."
                lat = 0.1
                st = "MOCK"
            else:
                url = f"{BASE_URL}/{model_name}:generateContent?key={GEMINI_API_KEY}"
                payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
                try:
                    resp = client.post(url, json=payload, timeout=20.0)
                    lat = time.time() - t0
                    st = f"HTTP_{resp.status_code}"
                    reply = resp.json()["candidates"][0]["content"]["parts"][0]["text"] if resp.status_code == 200 else resp.text
                except Exception as e:
                    lat = time.time() - t0
                    st = str(e)
                    reply = ""
            
            results.append({
                "id": item["id"],
                "category": item["category"],
                "latency_sec": round(lat, 2),
                "status": st,
                "has_latex": ("$" in reply),
                "has_steps": ("Bước 1" in reply or "Step 1" in reply or "1." in reply)
            })
            
    print("[DONE] Benchmark finished. Summary:")
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    m = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("GEMINI_MODEL", "gemini-3.7-flash")
    evaluate(m)
