#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
download_datasets.py - Download and cache Olympiad & Bilingual Math Datasets

Supported Datasets:
- Tier 1 (Olympiad/Competition):
    - AI-MO/NuminaMath-CoT (860K CoT math competition problems)
    - RUC-AIBOX/OlymMATH (Olympiad-level math reasoning)
    - KbsdJames/Omni-MATH (4,428 Olympiad problems, 33 subdomains)
    - ShadenA/MathNet (30K+ international Olympiad problems)
    - hendrycks/competition_math (12.5K AMC/AIME problems)
- Tier 2 (Vietnamese Math & SFT):
    - 5CD-AI/Vietnamese-395k-meta-math-MetaMathQA-gg-translated (395K Vietnamese CoT)
    - 1TuanPham/Vietnamese-OpenO1-SFT (Vietnamese Open-O1 reasoning)
- Tier 3 (Foundations):
    - openai/gsm8k (8.5K grade-school word problems)
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, Any

try:
    from datasets import load_dataset
except ImportError:
    print("[ERROR] 'datasets' library is required. Install with: pip install datasets")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).resolve().parent / "raw_data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DATASET_CONFIGS = {
    "numinamath": {
        "repo_id": "AI-MO/NuminaMath-CoT",
        "split": "train",
        "desc": "NuminaMath CoT (860k competition problem-solution pairs)",
        "sample_size": 20000,
    },
    "omnimath": {
        "repo_id": "KbsdJames/Omni-MATH",
        "split": "test",
        "desc": "Omni-MATH (4,428 high-difficulty Olympiad problems)",
        "sample_size": None,
    },
    "olymmath": {
        "repo_id": "RUC-AIBOX/OlymMATH",
        "split": "train",
        "desc": "OlymMATH benchmark & reasoning trajectories",
        "sample_size": 5000,
    },
    "mathnet": {
        "repo_id": "ShadenA/MathNet",
        "split": "train",
        "desc": "MathNet MIT (30k+ competition problems from 47 countries)",
        "sample_size": 10000,
    },
    "hendrycks_math": {
        "repo_id": "qwedsacf/competition_math",
        "split": "train",
        "desc": "MATH dataset (AMC/AIME; public mirror of Hendrycks MATH)",
        "sample_size": None,
    },
    "vi_metamath": {
        "repo_id": "5CD-AI/Vietnamese-395k-meta-math-MetaMathQA-gg-translated",
        "split": "train",
        "desc": "Vietnamese MetaMathQA (395k translated math questions)",
        "sample_size": 30000,
    },
    "vi_openo1": {
        "repo_id": "1TuanPham/Vietnamese-OpenO1-SFT",
        "split": "train",
        "desc": "Vietnamese Open-O1 SFT reasoning dataset",
        "sample_size": 10000,
    },
    "gsm8k": {
        "repo_id": "openai/gsm8k",
        "subset": "main",
        "split": "train",
        "desc": "GSM8K foundational multi-step word problems",
        "sample_size": None,
    }
}

def download_dataset_to_json(name: str, config: Dict[str, Any], max_samples: int = None) -> Path:
    print(f"\n[INFO] Fetching '{name}': {config['desc']}")
    target_file = OUTPUT_DIR / f"{name}.jsonl"
    limit = max_samples or config.get("sample_size")
    subset = config.get("subset")
    split = config.get("split", "train")
    
    try:
        if subset:
            ds = load_dataset(config["repo_id"], subset, split=split, streaming=True)
        else:
            ds = load_dataset(config["repo_id"], split=split, streaming=True)
    except Exception as e:
        print(f"[WARN] Streaming load failed for '{name}' ({e}). Retrying standard load...")
        try:
            if subset:
                ds = load_dataset(config["repo_id"], subset, split=split)
            else:
                ds = load_dataset(config["repo_id"], split=split)
        except Exception as e2:
            print(f"[ERROR] Could not load '{name}': {e2}")
            return target_file

    count = 0
    with open(target_file, "w", encoding="utf-8") as f_out:
        for item in ds:
            f_out.write(json.dumps(dict(item), ensure_ascii=False) + "\n")
            count += 1
            if limit and count >= limit:
                break
            if count % 5000 == 0:
                print(f"  -> Processed {count} items for {name}...")

    print(f"[SUCCESS] Saved {count} samples of '{name}' to {target_file}")
    return target_file

def main():
    parser = argparse.ArgumentParser(description="Download math datasets for DuoMCB Fine-Tuning")
    parser.add_argument(
        "--datasets",
        nargs="+",
        default=["vi_metamath", "hendrycks_math", "omnimath", "gsm8k"],
        choices=list(DATASET_CONFIGS.keys()) + ["all", "tier1", "tier2"],
        help="Datasets to download",
    )
    parser.add_argument("--limit", type=int, default=None, help="Override sample limit per dataset")
    args = parser.parse_args()

    to_download = []
    if "all" in args.datasets:
        to_download = list(DATASET_CONFIGS.keys())
    elif "tier1" in args.datasets:
        to_download = ["numinamath", "omnimath", "olymmath", "mathnet", "hendrycks_math"]
    elif "tier2" in args.datasets:
        to_download = ["vi_metamath", "vi_openo1"]
    else:
        to_download = args.datasets

    print("================================================================")
    print("  DuoMCB Bilingual & Olympiad Math Dataset Downloader")
    print(f"  Target directory: {OUTPUT_DIR}")
    print(f"  Datasets: {', '.join(to_download)}")
    print("================================================================")

    for ds_name in to_download:
        if ds_name in DATASET_CONFIGS:
            download_dataset_to_json(ds_name, DATASET_CONFIGS[ds_name], max_samples=args.limit)

    print("\n[DONE] All requested datasets downloaded to:", OUTPUT_DIR)

if __name__ == "__main__":
    main()
