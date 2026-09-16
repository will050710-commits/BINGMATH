"""
prepare_extended_datasets.py - Mở rộng & Đa dạng hoá dữ liệu huấn luyện hình học
Dựa trên tài liệu đề xuất: D:\\qwen_vl_optimization_guide.pdf (Mục 4)

Tải và chuẩn bị dữ liệu từ `lmms-lab/LLaVA-OneVision-Data`:
- geo170k(qa)
- geometry3k(mathv360k)
Tối đa MAX_PER_CONFIG mẫu mỗi nguồn, tự động resize ảnh và lưu vào cấu trúc chuẩn.
"""
import os
import sys
import json
import argparse
from pathlib import Path
from PIL import Image

try:
    from datasets import load_dataset
except ImportError:
    print("[ERROR] Cần cài đặt thư viện datasets: pip install datasets pillow")
    sys.exit(1)


def resize_max_side(img: Image.Image, max_side: int = 1024) -> Image.Image:
    """Resize ảnh giữ nguyên tỷ lệ sao cho cạnh dài nhất <= max_side"""
    w, h = img.size
    if max(w, h) <= max_side:
        return img
    if w > h:
        new_w = max_side
        new_h = int(h * (max_side / w))
    else:
        new_h = max_side
        new_w = int(w * (max_side / h))
    return img.resize((new_w, new_h), Image.Resampling.LANCZOS)


def prepare_datasets(
    output_dir: str = "data/processed",
    images_dir: str = "data/images",
    max_per_config: int = 3000,
    val_ratio: float = 0.05,
    seed: int = 42
):
    import random

    out_path = Path(output_dir)
    img_path = Path(images_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    img_path.mkdir(parents=True, exist_ok=True)

    GEO_CONFIGS = ["geo170k(qa)", "geometry3k(mathv360k)"]
    train_records = []

    print("=" * 70)
    print("  🚀 DuoMath Geometry Dataset Preparation (LLaVA-OneVision-Data)")
    print(f"  Configs:         {GEO_CONFIGS}")
    print(f"  Max per config:  {max_per_config}")
    print(f"  Output Dir:      {out_path}")
    print(f"  Images Dir:      {img_path}")
    print("=" * 70)

    for cfg in GEO_CONFIGS:
        print(f"\n[INFO] Đang tải {cfg} từ lmms-lab/LLaVA-OneVision-Data...")
        try:
            ds = load_dataset("lmms-lab/LLaVA-OneVision-Data", cfg, split=f"train[:{max_per_config}]")
            print(f"  -> Tải thành công {len(ds)} mẫu từ {cfg}")
        except Exception as e:
            print(f"  -> [WARNING] Không thể tải {cfg}: {e}")
            continue

        valid_count = 0
        for i, row in enumerate(ds):
            if row.get("image") is None:
                continue
            
            convs = row.get("conversations") or []
            human_turns = [c["value"] for c in convs if c.get("from") == "human"]
            gpt_turns = [c["value"] for c in convs if c.get("from") == "gpt"]
            if not human_turns or not gpt_turns:
                continue

            question = human_turns[0].replace("<image>", "").strip()
            answer_text = gpt_turns[-1].strip()
            if not question or not answer_text:
                continue

            # Tên file ảnh đích
            clean_cfg_prefix = cfg.split("(")[0].replace("/", "_")
            row_id = str(row.get("id", i)).replace("/", "_")
            dst_name = f"{clean_cfg_prefix}_{row_id}.png"
            target_img_file = img_path / dst_name

            if not target_img_file.exists():
                try:
                    raw_img = row["image"].convert("RGB")
                    resized_img = resize_max_side(raw_img, max_side=1024)
                    resized_img.save(target_img_file)
                except Exception as e:
                    print(f"  -> Bỏ qua ảnh {dst_name} do lỗi: {e}")
                    continue

            train_records.append({
                "id": f"{cfg}_{row_id}",
                "dataset_source": cfg,
                "image": dst_name,
                "question": question,
                "answer": answer_text
            })
            valid_count += 1

        print(f"  -> Đã xử lý {valid_count} mẫu hợp lệ từ {cfg}")

    print(f"\n[INFO] Tổng cộng thu được: {len(train_records)} mẫu từ {len(GEO_CONFIGS)} nguồn.")
    if not train_records:
        print("[ERROR] Không có mẫu nào được tạo!")
        return

    # Trộn ngẫu nhiên và chia train / val
    random.Random(seed).shuffle(train_records)
    n_val = max(1, int(len(train_records) * val_ratio))
    val_set = train_records[:n_val]
    train_set = train_records[n_val:]

    train_file = out_path / "train.jsonl"
    val_file = out_path / "val.jsonl"

    with open(train_file, "w", encoding="utf-8") as f:
        for r in train_set:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    with open(val_file, "w", encoding="utf-8") as f:
        for r in val_set:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"  -> Đã ghi: {train_file} ({len(train_set)} mẫu)")
    print(f"  -> Đã ghi: {val_file} ({len(val_set)} mẫu)")
    print("[DONE] Hoàn tất chuẩn bị dữ liệu mở rộng!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tải và mở rộng dữ liệu hình học LLaVA-OneVision")
    parser.add_argument("--output-dir", type=str, default="data/processed")
    parser.add_argument("--images-dir", type=str, default="data/images")
    parser.add_argument("--max-per-config", type=int, default=3000)
    parser.add_argument("--val-ratio", type=float, default=0.05)
    args = parser.parse_args()

    prepare_datasets(
        output_dir=args.output_dir,
        images_dir=args.images_dir,
        max_per_config=args.max_per_config,
        val_ratio=args.val_ratio
    )
