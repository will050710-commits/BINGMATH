"""
preprocess_mathverse.py
------------------------------------------------------------------
Loc cac bai HINH HOC (Plane/Solid Geometry) tu MathVerse (split
'testmini' -- ban duy nhat co dap an cong khai) va chuyen ve schema
JSONL thong nhat.

Uu tien 2 problem_version 'Text Lite' va 'Vision Only' (gia tri that
trong data, khac chinh ta 'Text-Lite'/'Visual-Only' trong mot ban nhap
truoc) de buoc model phai doc hinh anh thay vi doan tu text mo ta --
dung dinh huong trong plan goc. Bo qua 'Text Dominant'/'Vision
Intensive'/'Vision Dominant' vi cac ban do de lo qua nhieu thong tin
hinh hoc trong text.

INPUT can co truoc khi chay:
  data/raw/mathverse/testmini.json
  data/raw/mathverse/images_version_1-4/, images_version_5/, images_version_6/
                                           (TAI RIENG -- anh KHONG nam
                                            trong repo Github)

      wget https://huggingface.co/datasets/AI4Math/MathVerse/resolve/main/images.zip
      unzip images.zip -d data/raw/mathverse/

OUTPUT:
  data/processed/mathverse_filtered.jsonl
  Anh duoc copy sang data/images/ voi ten mathverse_<basename>

MathVerse testmini KHONG co truong loi giai chi tiet (chi co dap an
cuoi cung), nen TOAN BO ban ghi duoc gan needs_synthesis=true.
"""
import json
import shutil
from pathlib import Path

RAW_DIR = Path("data/raw/mathverse")
IMG_OUT_DIR = Path("data/images")
OUT_PATH = Path("data/processed/mathverse_filtered.jsonl")

SYSTEM_PROMPT = (
    "You are a master mathematical geometer and visual canvas synthesizer. "
    "When solving visual math problems, first reconstruct the diagram "
    "coordinates and geometric primitives through Visual CoT, then render "
    "the exact Canvas code (TikZ/SVG), and finally compute the answer."
)

GEOMETRY_SUBJECTS = {"Plane Geometry", "Solid Geometry"}
KEEP_VERSIONS = {"Text Lite", "Vision Only"}


def is_target(entry):
    md = entry.get("metadata", {})
    return (
        md.get("subject") in GEOMETRY_SUBJECTS
        and entry.get("problem_version") in KEEP_VERSIONS
    )


def main():
    with open(RAW_DIR / "testmini.json", encoding="utf-8") as f:
        data = json.load(f)

    IMG_OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    n_written, n_missing_img = 0, 0
    with open(OUT_PATH, "w", encoding="utf-8") as out:
        for entry in data:
            if not is_target(entry):
                continue

            src_img = RAW_DIR / entry["image"]
            dst_name = f"mathverse_{entry['image'].replace('/', '_')}"
            if src_img.exists():
                shutil.copy(src_img, IMG_OUT_DIR / dst_name)
            else:
                n_missing_img += 1

            record = {
                "id": f"mathverse_{entry['sample_index']}",
                "dataset_source": "MathVerse",
                "images": [dst_name],
                "needs_synthesis": True,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"<image>\n{entry['question']}"},
                    {"role": "assistant", "content": f"**Đáp án:** {entry['answer']}"},
                ],
            }
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            n_written += 1

    print(f"[MathVerse] Da ghi {n_written} mau vao {OUT_PATH}")
    print("[MathVerse]   - TOAN BO can teacher model sinh Visual CoT+TikZ (chua co loi giai co san)")
    if n_missing_img:
        print(f"[MathVerse]   - CANH BAO: {n_missing_img} anh chua tim thay -- "
              f"nho tai images.zip vao {RAW_DIR}/ (xem docstring dau file)")


if __name__ == "__main__":
    main()
