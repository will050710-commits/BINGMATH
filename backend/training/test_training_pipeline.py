# -*- coding: utf-8 -*-
"""
test_training_pipeline.py - Automated Verification Test Suite
"""

import os
import sys
import json
import unittest
from pathlib import Path

TRAINING_DIR = Path(__file__).resolve().parent

class TestTrainingPipeline(unittest.TestCase):
    def test_01_seed_dataset(self):
        from sample_olympiad_seed import SEED_PROBLEMS, save_seed_dataset
        self.assertGreater(len(SEED_PROBLEMS), 0)
        seed_file = TRAINING_DIR / "olympiad_seed_curated.jsonl"
        save_seed_dataset(seed_file)
        self.assertTrue(seed_file.exists())
        
        with open(seed_file, "r", encoding="utf-8") as f:
            items = [json.loads(l) for l in f if l.strip()]
        self.assertEqual(len(items), len(SEED_PROBLEMS))

    def test_02_prepare_data(self):
        from prepare_vertex_tuning_data import build_training_splits
        seed_file = TRAINING_DIR / "olympiad_seed_curated.jsonl"
        tuning_dir = TRAINING_DIR / "tuning_data"
        build_training_splits([seed_file], tuning_dir, eval_ratio=0.33)
        
        train_file = tuning_dir / "gemini_vertex_train.jsonl"
        eval_file = tuning_dir / "gemini_vertex_eval.jsonl"
        
        self.assertTrue(train_file.exists())
        self.assertTrue(eval_file.exists())

    def test_03_hf_mathviz_dataset(self):
        from generate_mathviz_sft_dataset import generate_full_sft_dataset
        tuning_dir = TRAINING_DIR / "tuning_data"
        generate_full_sft_dataset(tuning_dir, target_samples=20, eval_ratio=0.2)
        
        chatml_train = tuning_dir / "hf_mathviz_chatml_train.jsonl"
        chatml_val = tuning_dir / "hf_mathviz_chatml_val.jsonl"
        r1_train = tuning_dir / "hf_deepseek_r1_mathviz_train.jsonl"
        r1_val = tuning_dir / "hf_deepseek_r1_mathviz_val.jsonl"

        self.assertTrue(chatml_train.exists())
        self.assertTrue(chatml_val.exists())
        self.assertTrue(r1_train.exists())
        self.assertTrue(r1_val.exists())

        # Verify JSON syntax and ChatML structure
        with open(chatml_train, "r", encoding="utf-8") as f:
            for line in f:
                item = json.loads(line)
                self.assertIn("messages", item)
                self.assertEqual(len(item["messages"]), 3)

    def test_04_canvas_benchmark_pipeline(self):
        from benchmark_canvas_model import BENCHMARK_PROMPTS, evaluate_response
        from generate_mathviz_sft_dataset import build_geometry_2d_samples
        sample = build_geometry_2d_samples()[0]
        prompt_item = BENCHMARK_PROMPTS[0]
        res = evaluate_response(prompt_item, sample["assistant_text"])
        self.assertTrue(res["success"])
        self.assertEqual(res["widget_found"], "geometry_2d")

if __name__ == "__main__":
    unittest.main()

