#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tune_gemini_vertex.py - Launch Google Cloud Vertex AI Supervised Tuning Job
"""

import os
import sys
import argparse
from pathlib import Path

def run_vertex_tuning(project_id: str, location: str, gcs_bucket: str, source_model: str, epochs: int, display_name: str):
    try:
        from google.cloud import aiplatform
        from google.cloud import storage
    except ImportError:
        print("[ERROR] Install with: pip install google-cloud-aiplatform google-cloud-storage")
        sys.exit(1)

    print("================================================================")
    print("  Google Cloud Vertex AI - DuoMCB Math Supervised Tuning")
    print(f"  Project: {project_id}, Model: {source_model}, Bucket: {gcs_bucket}")
    print("================================================================")

    data_dir = Path(__file__).resolve().parent / "tuning_data"
    train_file = data_dir / "gemini_vertex_train.jsonl"
    eval_file = data_dir / "gemini_vertex_eval.jsonl"

    if not train_file.exists():
        print(f"[ERROR] Training file not found at {train_file}. Run prepare_vertex_tuning_data.py first!")
        sys.exit(1)

    bucket_clean = gcs_bucket.replace("gs://", "").rstrip("/")
    storage_client = storage.Client(project=project_id)
    bucket = storage_client.bucket(bucket_clean)

    train_blob = bucket.blob("duomcb_data/gemini_vertex_train.jsonl")
    train_blob.upload_from_filename(str(train_file))
    gcs_train_uri = f"gs://{bucket_clean}/duomcb_data/gemini_vertex_train.jsonl"
    print(f"[OK] Uploaded training data to: {gcs_train_uri}")

    gcs_eval_uri = None
    if eval_file.exists():
        eval_blob = bucket.blob("duomcb_data/gemini_vertex_eval.jsonl")
        eval_blob.upload_from_filename(str(eval_file))
        gcs_eval_uri = f"gs://{bucket_clean}/duomcb_data/gemini_vertex_eval.jsonl"
        print(f"[OK] Uploaded eval data to: {gcs_eval_uri}")

    aiplatform.init(project=project_id, location=location)
    print(f"\n[INFO] Submitting Supervised Tuning Job for '{display_name}'...")
    sft_job = aiplatform.SupervisedTuningJob(
        source_model=source_model,
        train_dataset_uri=gcs_train_uri,
        validation_dataset_uri=gcs_eval_uri,
        tuned_model_display_name=display_name,
        epochs=epochs
    )
    sft_job.run()
    print(f"\n[SUCCESS] Tuned Model Resource: {sft_job.resource_name}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune Gemini on Google Cloud Vertex AI")
    parser.add_argument("--project", type=str, default=os.environ.get("GOOGLE_CLOUD_PROJECT", ""))
    parser.add_argument("--location", type=str, default="us-central1")
    parser.add_argument("--bucket", type=str, default=os.environ.get("GCS_BUCKET", ""))
    parser.add_argument("--model", type=str, default="gemini-2.5-flash-002")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--display_name", type=str, default="duomcb-math-olympiad-v1")
    args = parser.parse_args()

    if not args.project or not args.bucket:
        print("[ERROR] Please provide --project <PROJECT_ID> and --bucket <gs://BUCKET_NAME>")
        sys.exit(1)

    run_vertex_tuning(args.project, args.location, args.bucket, args.model, args.epochs, args.display_name)
