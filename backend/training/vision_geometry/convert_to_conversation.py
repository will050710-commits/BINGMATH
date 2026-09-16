"""
convert_to_conversation.py
---------------------------------------------------------------
Chuyen math_canvas_train.jsonl / math_canvas_val.jsonl (dung schema
trong action plan goc: messages = [system, user, assistant], images
= list duong dan anh) sang dinh dang conversation ma notebook
Unsloth "Qwen3-VL (8B) - Vision" (SFT, free tren Colab T4) can.

Notebook goc:
https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_VL_(8B)-Vision.ipynb

Cach dung: dan ham convert_to_conversation() ben duoi vao dung cho
ham cung ten trong notebook (thay cho ham mau convert tu dataset
vi du cua Unsloth). Khi convert ca dataset, dung list comprehension
thay vi .map() -- Unsloth khuyen cao dieu nay cho schema nhieu anh /
long cau truc phuc tap:

    ds_converted = [convert_to_conversation(s) for s in raw_samples]
    # KHONG dung: ds.map(convert_to_conversation)
"""
import json
import re
from pathlib import Path
from PIL import Image

IMAGE_ROOT = Path("data/images")  # sua neu ban de anh o cho khac


def load_jsonl(path):
    samples = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                samples.append(json.loads(line))
    return samples


def convert_to_conversation(sample: dict) -> dict:
    """
    sample: 1 dict da parse tu 1 dong trong train.jsonl, dung schema
    trong action plan goc (messages[0]=system, [1]=user, [2]=assistant;
    images = list duong dan anh, lay anh dau tien).
    """
    system_msg = sample["messages"][0]["content"]
    user_raw = sample["messages"][1]["content"]
    assistant_msg = sample["messages"][2]["content"]

    # Bo placeholder "<image>\n" trong text -- Unsloth tu chen token anh
    # tu block {"type": "image", ...} rieng, khong can placeholder text.
    user_text = re.sub(r"^<image>\s*", "", user_raw).strip()

    # Cho phep images la duong dan tuong doi (theo cau truc data/images/
    # trong action plan) hoac tuyet doi.
    img_path = Path(sample["images"][0])
    if not img_path.is_absolute():
        img_path = IMAGE_ROOT / img_path.name
    image = Image.open(img_path).convert("RGB")

    conversation = [
        {"role": "system", "content": [{"type": "text", "text": system_msg}]},
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": user_text},
            ],
        },
        {"role": "assistant", "content": [{"type": "text", "text": assistant_msg}]},
    ]
    return {"messages": conversation}


if __name__ == "__main__":
    # Test nhanh truoc khi dan vao Colab
    raw = load_jsonl("data/processed/train.jsonl")
    print(f"Doc duoc {len(raw)} mau.")
    sample = convert_to_conversation(raw[0])
    print("system:     ", sample["messages"][0]["content"][0]["text"][:80], "...")
    print("user text:  ", sample["messages"][1]["content"][1]["text"][:80], "...")
    print("user image: ", sample["messages"][1]["content"][0]["image"])
    print("assistant:  ", sample["messages"][2]["content"][0]["text"][:80], "...")
