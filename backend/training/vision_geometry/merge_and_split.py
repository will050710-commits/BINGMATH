"""
merge_and_split.py
------------------------------------------------------------------
Gop cac file *_filtered.jsonl (MathVista, MathVerse, MMMU -- chay
truoc bang 3 script preprocess_*.py) thanh 1 tap, xao ngau nhien, va
chia train/val theo ti le 95/5.

Chay sau khi da co IT NHAT 1 trong 3 file data/processed/*_filtered.jsonl.
"""
import json
import random
from pathlib import Path

PROCESSED_DIR = Path("data/processed")
VAL_RATIO = 0.05
SEED = 42

INPUT_FILES = [
    PROCESSED_DIR / "mathvista_filtered.jsonl",
    PROCESSED_DIR / "mathverse_filtered.jsonl",
    PROCESSED_DIR / "mmmu_filtered.jsonl",
]


def main():
    all_records = []
    for path in INPUT_FILES:
        if not path.exists():
            print(f"(bo qua, chua co) {path}")
            continue
        with open(path, encoding="utf-8") as f:
            recs = [json.loads(line) for line in f if line.strip()]
        print(f"{path.name}: {len(recs)} mau")
        all_records.extend(recs)

    if not all_records:
        print("Khong co du lieu nao de gop -- chay cac preprocess_*.py truoc.")
        return

    random.Random(SEED).shuffle(all_records)
    n_val = max(1, int(len(all_records) * VAL_RATIO))
    val_records = all_records[:n_val]
    train_records = all_records[n_val:]

    for name, recs in [("train.jsonl", train_records), ("val.jsonl", val_records)]:
        with open(PROCESSED_DIR / name, "w", encoding="utf-8") as f:
            for r in recs:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    n_needs_synth = sum(1 for r in all_records if r.get("needs_synthesis"))
    print(f"\nTong: {len(all_records)} mau -> train {len(train_records)}, val {len(val_records)}")
    print(f"Can Phase 2 (synthesize_tikz.py) sinh Visual CoT+TikZ cho: "
          f"{n_needs_synth}/{len(all_records)} mau")


if __name__ == "__main__":
    main()
