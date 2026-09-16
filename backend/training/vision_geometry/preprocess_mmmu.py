"""
preprocess_mmmu.py
------------------------------------------------------------------
QUAN TRONG: repo MMMU-main ban upload la CODE, khong chua du lieu that --
cac script ben trong tu tai qua HuggingFace luc chay:
    datasets.load_dataset("MMMU/MMMU", subject, split=...)

=> Script nay CAN INTERNET, nen KHONG chay duoc trong sandbox nay (khong
co mang). Hay chay no o may/Colab co mang:

    pip install datasets pillow --quiet
    python preprocess_mmmu.py

Dung split 'validation' (co dap an cong khai). Split 'test' cua MMMU an
dap an nen khong dung de train duoc, giong nhu 'test' cua MathVista.

Danh sach subject dat theo dung ten trong plan goc (Math,
Mechanical_Engineering, Civil_Engineering, Physics) -- CHUA THE KIEM TRA
truc tiep vi khong co mang luc viet script nay. Neu load_dataset bao loi
"config not found", vao https://huggingface.co/datasets/MMMU/MMMU de xem
danh sach ten subject/config chinh xac cua phien ban dataset hien tai roi
sua TARGET_SUBJECTS ben duoi.

OUTPUT:
  data/processed/mmmu_filtered.jsonl
  Anh luu sang data/images/ voi ten mmmu_<subject>_<id>.png
"""
import json
from pathlib import Path

from datasets import load_dataset

IMG_OUT_DIR = Path("data/images")
OUT_PATH = Path("data/processed/mmmu_filtered.jsonl")

SYSTEM_PROMPT = (
    "You are a master mathematical geometer and visual canvas synthesizer. "
    "When solving visual math problems, first reconstruct the diagram "
    "coordinates and geometric primitives through Visual CoT, then render "
    "the exact Canvas code (TikZ/SVG), and finally compute the answer."
)

TARGET_SUBJECTS = ["Math", "Mechanical_Engineering", "Civil_Engineering", "Physics"]


def build_user_text(sample):
    q = sample["question"]
    if sample.get("question_type") == "multiple-choice" and sample.get("options"):
        opts = sample["options"]
        if isinstance(opts, str):
            try:
                opts = json.loads(opts.replace("'", '"'))
            except Exception:
                opts = [opts]
        opts_text = "\n".join(f"{chr(65+i)}. {o}" for i, o in enumerate(opts))
        q = f"{q}\n{opts_text}"
    # MMMU dung placeholder <image 1>, <image 2>... trong text cau hoi.
    # Pipeline nay chi dung 1 anh/mau nen chi giu <image 1> -> <image>,
    # cac placeholder anh khac (neu co) se bi bo qua.
    q = q.replace("<image 1>", "<image>")
    if "<image>" not in q:
        q = f"<image>\n{q}"
    return q


def main():
    IMG_OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    n_written = 0
    with open(OUT_PATH, "w", encoding="utf-8") as out:
        for subject in TARGET_SUBJECTS:
            print(f"Dang tai subject: {subject} ...")
            ds = load_dataset("MMMU/MMMU", subject, split="validation")
            for sample in ds:
                img = sample.get("image_1")
                if img is None:
                    continue  # bo qua cau khong co anh dau tien

                dst_name = f"mmmu_{subject}_{sample['id']}.png"
                img.convert("RGB").save(IMG_OUT_DIR / dst_name)

                record = {
                    "id": f"mmmu_{sample['id']}",
                    "dataset_source": "MMMU",
                    "images": [dst_name],
                    "needs_synthesis": True,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": build_user_text(sample)},
                        {"role": "assistant", "content": f"**Đáp án:** {sample['answer']}"},
                    ],
                }
                out.write(json.dumps(record, ensure_ascii=False) + "\n")
                n_written += 1

    print(f"[MMMU] Da ghi {n_written} mau vao {OUT_PATH}")


if __name__ == "__main__":
    main()
