"""
benchmark_qwen_vl.py - Đánh giá toàn diện mô hình Qwen2.5-VL hình học, tách theo nguồn
Dựa trên tài liệu đề xuất: D:\\qwen_vl_optimization_guide.pdf (Mục 5 & Mục 3)

Hỗ trợ:
- Chạy trên toàn bộ test.jsonl / val.jsonl.
- Tách riêng kết quả theo dataset_source (MathVista, MathVerse, Geo170k, geometry3k...).
- Tích hợp kỹ thuật Self-Consistency (vote đa số) tuỳ chọn (--self-consistency --n-samples 5).
- Tương thích cả khi chạy trên GPU Colab/RunPod với Unsloth / Hugging Face hoặc gọi qua model weights.
"""
import os
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict, Counter
from PIL import Image

try:
    from vision_geometry.qwen_vl_eval_utils import (
        SYSTEM_PROMPT,
        extract_final_answer,
        grade
    )
except ImportError:
    from qwen_vl_eval_utils import (
        SYSTEM_PROMPT,
        extract_final_answer,
        grade
    )


def load_jsonl(filepath):
    records = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def evaluate(
    model,
    tokenizer,
    data_path: str,
    images_dir: str,
    use_self_consistency: bool = False,
    n_samples: int = 5,
    temperature: float = 0.7,
    max_eval_samples: int = None
):
    print("=" * 70)
    print("  🚀 DuoMath Qwen2.5-VL Geometry Benchmark Evaluation")
    print(f"  Dataset:             {data_path}")
    print(f"  Images Directory:    {images_dir}")
    print(f"  Mode:                {'Self-Consistency (Vote ' + str(n_samples) + ')' if use_self_consistency else 'Standard Single Generation'}")
    print("=" * 70)

    data_raw = load_jsonl(data_path)
    if max_eval_samples and max_eval_samples < len(data_raw):
        print(f"[INFO] Giới hạn kiểm thử {max_eval_samples}/{len(data_raw)} mẫu ngẫu nhiên.")
        data_raw = data_raw[:max_eval_samples]

    img_dir_path = Path(images_dir)
    stats = defaultdict(lambda: [0, 0])  # nguon -> [dung, tong]
    results_detail = []

    for idx, r in enumerate(data_raw, 1):
        src = r.get("dataset_source", "unknown")
        q_id = r.get("id", f"sample_{idx}")
        gold_ans = str(r.get("answer", "")).strip()

        # Nạp hình ảnh
        img_filename = r.get("image")
        img_path = img_dir_path / img_filename if img_filename else None
        
        if not img_path or not img_path.exists():
            print(f"[WARNING] Bỏ qua mẫu {q_id}: Không tìm thấy ảnh tại {img_path}")
            continue

        try:
            img = Image.open(img_path).convert("RGB")
        except Exception as e:
            print(f"[ERROR] Không đọc được ảnh {img_path}: {e}")
            continue

        messages = [
            {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
            {"role": "user", "content": [{"type": "image"}, {"type": "text", "text": r["question"]}]},
        ]
        input_text = tokenizer.apply_chat_template(messages, add_generation_prompt=True)
        inputs = tokenizer(img, input_text, add_special_tokens=False, return_tensors="pt").to("cuda")

        if use_self_consistency:
            # Mục 3: Self-Consistency (Vote đa số lúc suy luận)
            votes = []
            for _ in range(n_samples):
                output_ids = model.generate(
                    **inputs,
                    max_new_tokens=512,
                    use_cache=True,
                    temperature=temperature,
                    min_p=0.1,
                    do_sample=True
                )
                text = tokenizer.decode(output_ids[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
                votes.append(extract_final_answer(text))
            
            # Lấy đáp án xuất hiện nhiều nhất
            best_answer, _ = Counter(votes).most_common(1)[0]
            output_text = f"Votes: {votes}\nFinal Selected: {best_answer}"
            is_correct = grade(best_answer, gold_ans)
        else:
            # Mục 5: Standard Inference (Greedy / Low Temp)
            output_ids = model.generate(
                **inputs,
                max_new_tokens=512,
                use_cache=True,
                temperature=0.2,
                min_p=0.1
            )
            output_text = tokenizer.decode(output_ids[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
            is_correct = grade(output_text, gold_ans)

        stats[src][1] += 1
        stats[src][0] += int(is_correct)

        results_detail.append({
            "id": q_id,
            "dataset_source": src,
            "gold": gold_ans,
            "pred": extract_final_answer(output_text),
            "is_correct": is_correct
        })

        if idx % 10 == 0 or idx == len(data_raw):
            print(f"Progress: [{idx}/{len(data_raw)}] - Đang đánh giá...")

    # ==============================================================================
    # IN BẢNG BÁO CÁO PHÂN TÁCH THEO NGUỒN (Mục 5)
    # ==============================================================================
    print("\n" + "=" * 50)
    print(f"{'Nguon':<16} {'Dung':>6} {'Tong':>6} {'Ty le':>10}")
    print("-" * 50)
    for src, (correct, total) in stats.items():
        rate = (correct / total * 100) if total > 0 else 0.0
        print(f"{src:<16} {correct:>6} {total:>6} {rate:>9.1f}%")
    
    overall_correct = sum(c for c, t in stats.values())
    overall_total = sum(t for c, t in stats.values())
    overall_rate = (overall_correct / overall_total * 100) if overall_total > 0 else 0.0
    print("-" * 50)
    print(f"{'TONG CONG':<16} {overall_correct:>6} {overall_total:>6} {overall_rate:>9.1f}%")
    print("=" * 50)

    return stats, results_detail


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark Qwen2.5-VL Geometry Model")
    parser.add_argument("--model-path", type=str, default="duomath_qwen_vl_lora", help="Đường dẫn weights LoRA hoặc Base model")
    parser.add_argument("--data-path", type=str, default="data/processed/test.jsonl", help="Đường dẫn file test.jsonl")
    parser.add_argument("--images-dir", type=str, default="data/images", help="Thư mục chứa ảnh")
    parser.add_argument("--self-consistency", action="store_true", help="Bật Self-Consistency (Vote đa số)")
    parser.add_argument("--n-samples", type=int, default=5, help="Số lần lấy mẫu cho Self-Consistency")
    parser.add_argument("--max-samples", type=int, default=None, help="Giới hạn số mẫu đánh giá nhanh")
    args = parser.parse_args()

    # Kiểm tra tồn tại file dữ liệu
    if not Path(args.data_path).exists():
        print(f"[ERROR] Không tìm thấy file dữ liệu tại: {args.data_path}")
        sys.exit(1)

    print(f"[INFO] Khởi tạo model từ {args.model_path}...")
    try:
        from unsloth import FastVisionModel
        model, tokenizer = FastVisionModel.from_pretrained(args.model_path, load_in_4bit=True)
        FastVisionModel.for_inference(model)
    except Exception as e:
        print(f"[ERROR] Không thể load model qua Unsloth: {e}")
        sys.exit(1)

    evaluate(
        model=model,
        tokenizer=tokenizer,
        data_path=args.data_path,
        images_dir=args.images_dir,
        use_self_consistency=args.self_consistency,
        n_samples=args.n_samples,
        max_eval_samples=args.max_samples
    )
