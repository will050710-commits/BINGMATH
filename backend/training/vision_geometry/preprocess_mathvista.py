"""
preprocess_mathvista.py
------------------------------------------------------------------
Loc cac bai toan HINH HOC tu MathVista (split 'testmini' -- ban duy nhat
co dap an cong khai; split 'test' la blind test set, KHONG co ground
truth nen khong dung de train duoc) va chuyen ve schema JSONL thong nhat
cho pipeline fine-tune.

Da kiem tra truc tiep tren data that: metadata.task dung gia tri
'geometry problem solving' (khong phai 'geometry_problem_solving' hay
'geometry_diagram'/'visual_grounding' nhu mot ban nhap truoc gia dinh --
2 gia tri do khong ton tai trong dataset). Cung khong co truong
metadata.visual_subfield.

INPUT can co truoc khi chay:
  data/raw/mathvista/testmini.json          (copy tu MathVista-main/data/)
  data/raw/mathvista/annot_testmini.json    (copy tu MathVista-main/data/,
                                              chua truong 'solution' cho ~30%
                                              cac cau -- phan con lai se
                                              duoc danh dau needs_synthesis)
  data/raw/mathvista/images/                (TAI RIENG, xem lenh ben duoi --
                                              anh KHONG nam trong repo Github)

      wget https://huggingface.co/datasets/AI4Math/MathVista/resolve/main/images.zip
      unzip images.zip -d data/raw/mathvista/

OUTPUT:
  data/processed/mathvista_filtered.jsonl
  Anh duoc copy sang data/images/ voi ten mathvista_<basename>
"""
import json
import shutil
from pathlib import Path

RAW_DIR = Path("data/raw/mathvista")
IMG_OUT_DIR = Path("data/images")
OUT_PATH = Path("data/processed/mathvista_filtered.jsonl")

SYSTEM_PROMPT = (
    "You are a master mathematical geometer and visual canvas synthesizer. "
    "When solving visual math problems, first reconstruct the diagram "
    "coordinates and geometric primitives through Visual CoT, then render "
    "the exact Canvas code (TikZ/SVG), and finally compute the answer."
)

GEOMETRY_TASKS = {"geometry problem solving"}
GEOMETRY_SKILLS = {"geometry reasoning"}


def is_geometry(entry):
    md = entry.get("metadata", {})
    if md.get("task") in GEOMETRY_TASKS:
        return True
    if any(s in GEOMETRY_SKILLS for s in md.get("skills", [])):
        return True
    return False


def build_user_text(entry):
    q = entry["question"]
    if entry.get("choices"):
        opts = "\n".join(f"{chr(65+i)}. {c}" for i, c in enumerate(entry["choices"]))
        q = f"{q}\n{opts}"
    return f"<image>\n{q}"


def build_assistant_text(entry, solution):
    answer = entry["answer"]
    if solution:
        body = f"<visual_cot>\n{solution}\n</visual_cot>\n\n**Đáp án:** {answer}"
        return body, False
    # Chua co loi giai chi tiet -> can teacher model sinh Visual CoT + TikZ (Phase 2)
    return f"**Đáp án:** {answer}", True


def main():
    with open(RAW_DIR / "testmini.json", encoding="utf-8") as f:
        testmini = json.load(f)
    annot = {}
    annot_path = RAW_DIR / "annot_testmini.json"
    if annot_path.exists():
        with open(annot_path, encoding="utf-8") as f:
            annot = json.load(f)

    IMG_OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    n_written, n_needs_synth, n_missing_img = 0, 0, 0
    with open(OUT_PATH, "w", encoding="utf-8") as out:
        for pid, entry in testmini.items():
            if not is_geometry(entry):
                continue

            src_img = RAW_DIR / entry["image"]
            dst_name = f"mathvista_{src_img.name}"
            if src_img.exists():
                shutil.copy(src_img, IMG_OUT_DIR / dst_name)
            else:
                n_missing_img += 1  # se het bao loi sau khi tai images.zip

            sol = None
            a = annot.get(pid) or annot.get(str(pid))
            if a and a.get("solution") and a["solution"] != "None":
                sol = a["solution"]

            assistant_text, needs_synth = build_assistant_text(entry, sol)
            n_needs_synth += int(needs_synth)

            record = {
                "id": f"mathvista_{pid}",
                "dataset_source": "MathVista",
                "images": [dst_name],
                "needs_synthesis": needs_synth,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": build_user_text(entry)},
                    {"role": "assistant", "content": assistant_text},
                ],
            }
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            n_written += 1

    print(f"[MathVista] Da ghi {n_written} mau vao {OUT_PATH}")
    print(f"[MathVista]   - co san loi giai chi tiet: {n_written - n_needs_synth}")
    print(f"[MathVista]   - can teacher model sinh Visual CoT+TikZ: {n_needs_synth}")
    if n_missing_img:
        print(f"[MathVista]   - CANH BAO: {n_missing_img} anh chua tim thay -- "
              f"nho tai images.zip vao {RAW_DIR}/ (xem docstring dau file)")


if __name__ == "__main__":
    main()
