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

if __name__ == "__main__":
    unittest.main()
