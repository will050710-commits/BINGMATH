# Phase 1: Data preprocessing — setup & run order

## What I found when I actually opened your 4 zip files

- **MathVista-main.zip** and **MathVerse-main.zip**: the question/answer JSON
  is included in the repo, but the **images are not** — both projects host
  images separately on Hugging Face. The GitHub repo is code + annotations only.
- **MMMU-main.zip**: no data at all included — it's evaluation code that calls
  `datasets.load_dataset("MMMU/MMMU", ...)` to fetch everything at runtime.
- **GeoQA-main.zip**: same — it's training code for an older model
  (NGS-Auxiliary), and the actual benchmark data is a separate Google Drive
  download linked in its README. (This one is only needed later, for testing
  the fine-tuned model — not for this preprocessing step.)

This also means the field names in the original plan don't all match reality
— e.g. MathVista's real field is `metadata.task == "geometry problem solving"`
(not `geometry_diagram` / `visual_grounding`, which don't exist in the data),
and there's no `metadata.visual_subfield` field. The scripts below use the
verified real fields — I ran the MathVista and MathVerse scripts against your
actual uploaded files to confirm.

## 1. Folder layout to create

```
data/
  raw/
    mathvista/
      testmini.json          <- copy from MathVista-main/data/
      annot_testmini.json    <- copy from MathVista-main/data/
      images/                <- download separately, see below
    mathverse/
      testmini.json          <- copy from MathVerse-main/data/
      images_version_1-4/    <- download separately, see below
      images_version_5/
      images_version_6/
  processed/                  <- scripts write here
  images/                     <- scripts write unified, renamed images here
scripts/
  preprocess_mathvista.py
  preprocess_mathverse.py
  preprocess_mmmu.py
  merge_and_split.py
```

## 2. Download the images (required — not in the zips)

```bash
# MathVista
wget https://huggingface.co/datasets/AI4Math/MathVista/resolve/main/images.zip
unzip images.zip -d data/raw/mathvista/

# MathVerse
wget https://huggingface.co/datasets/AI4Math/MathVerse/resolve/main/images.zip
unzip images.zip -d data/raw/mathverse/
```

Do this on a machine with internet — Colab works fine for this too (just run
these as `!wget ...` / `!unzip ...` cells).

## 3. Run order

```bash
python scripts/preprocess_mathvista.py     # tested: 239 geometry samples found
python scripts/preprocess_mathverse.py     # tested: 1258 geometry samples found
python scripts/preprocess_mmmu.py          # needs internet — run in Colab, see file header
python scripts/merge_and_split.py          # combines everything into train.jsonl / val.jsonl
```

Real numbers from running the first two against your actual files (no images
yet, so those will resolve once you do step 2):

| Source | Samples | Have detailed solution already | Need teacher-model synthesis |
|---|---|---|---|
| MathVista | 239 | 63 | 176 |
| MathVerse | 1258 | 0 | 1258 |
| MMMU | ? (needs network) | ? | ? |

## 4. What `needs_synthesis: true` means

Most rows only have a final answer, not a step-by-step `<visual_cot>` +
TikZ/SVG diagram — that's expected, the raw datasets don't include that. This
flag marks which rows still need the **Phase 2 distillation step**
(`synthesize_tikz.py` from the original plan — not written yet): calling a
teacher model (GPT-4o / Claude / etc.) to generate the reasoning + diagram
code for each flagged row. That needs your own API key and has a real cost,
so it's a separate step — let me know when you want to build it.

Until then, `train.jsonl` / `val.jsonl` are already valid to fine-tune on —
just with shorter, answer-only assistant responses for the unsynthesized
rows, rather than the full Visual CoT + TikZ format from the plan.
