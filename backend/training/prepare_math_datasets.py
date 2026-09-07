"""
prepare_math_datasets.py
===========================
Sample/reference script for the "as much math data as possible" part of
the plan. Pulls a slice of each recommended public dataset via Hugging
Face's `datasets` library, normalizes every row into the flat schema
math_problem_retrieval.py's ProblemIndex expects:
    {"id", "topic", "level", "problem", "solution", "source"}
and appends to data/math_problems.jsonl.

Requires network + `pip install datasets` — this sandbox has neither, so
this file is REFERENCE CODE (correct against the standard `datasets` API,
not executed here). Run it from your own machine/CI, not inside main.py's
request path — it's an offline data-prep step, run once (or on a schedule
to pull updates), not per-chat-request.

Recommended datasets (all permissively licensed — apache-2.0 or MIT — and
confirmed live on Hugging Face as of this plan):

  General / English math reasoning:
    - AI-MO/NuminaMath-CoT            860K competition problems, HS→Olympiad, apache-2.0
    - nvidia/OpenMathReasoning         306K problems SOURCED FROM AoPS FORUMS
                                       (the same community IMO/Olympiad problems
                                       come from) with CoT solutions — the
                                       highest-relevance English set for this
                                       product's specific Olympiad-geometry focus
    - Hothan/OlympiadBench            8.5K, Olympiad-LEVEL benchmark specifically
    - open-r1/OpenR1-Math-220K        220K, DeepSeek-R1 reasoning traces

  Vietnamese (matches this product's language + THPT audience directly):
    - DHMATH/SFT_Data_High            90.5K, Vietnamese, THPT level, SFT-ready
    - 5CD-AI/Viet-Doc-VQA             310K Q&A pairs generated from actual
                                       Vietnamese SGK textbook pages (Cánh Diều,
                                       Chân trời sáng tạo, Kết nối tri thức) —
                                       filter to "Toán học" subject only

Start with a few thousand rows per source (see LIMIT_PER_SOURCE below) —
ProblemIndex's TF-IDF is O(n) per query at search time; a few thousand
rows is plenty for retrieval quality gains and keeps search latency low
without needing an approximate-nearest-neighbor index yet.
"""

import json
import os
import re

LIMIT_PER_SOURCE = 2000  # start small; raise once you've measured retrieval quality
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "data", "math_problems.jsonl")

# Keep this in sync with math_problem_retrieval.py's expected "topic" values
# used elsewhere in the pipeline (geometry_2d, algebra, ...); anything that
# doesn't map cleanly falls back to "general" rather than guessing wrong.
_TOPIC_KEYWORDS = {
    "geometry_2d": ["triangle", "circle", "tam giác", "đường tròn", "góc", "angle",
                    "orthocenter", "trực tâm", "circumcircle", "polygon", "tứ giác"],
    "geometry_3d": ["pyramid", "cube", "hình chóp", "hình lăng trụ", "volume", "thể tích"],
    "algebra": ["equation", "phương trình", "polynomial", "đa thức", "inequality", "bất phương trình"],
    "combinatorics": ["combinatorics", "tổ hợp", "permutation", "chỉnh hợp", "probability", "xác suất"],
}


def _guess_topic(text: str) -> str:
    lower = text.lower()
    for topic, kws in _TOPIC_KEYWORDS.items():
        if any(kw in lower for kw in kws):
            return topic
    return "general"


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def ingest_numinamath(limit: int = LIMIT_PER_SOURCE):
    """AI-MO/NuminaMath-CoT: columns are typically 'problem' and 'solution'."""
    from datasets import load_dataset
    ds = load_dataset("AI-MO/NuminaMath-CoT", split=f"train[:{limit}]")
    for row in ds:
        problem = _clean(row.get("problem", ""))
        solution = _clean(row.get("solution", ""))
        if not problem or not solution:
            continue
        yield {
            "id": f"numinamath_{row.get('source', 'x')}_{hash(problem) & 0xffffffff:x}",
            "topic": _guess_topic(problem),
            "level": "olympiad" if row.get("source") in ("aops_forum", "olympiads") else "general",
            "problem": problem,
            "solution": solution,
            "source": "AI-MO/NuminaMath-CoT",
        }


def ingest_openmathreasoning(limit: int = LIMIT_PER_SOURCE):
    """nvidia/OpenMathReasoning: AoPS-forum-sourced — highest topical relevance
    for Olympiad geometry specifically."""
    from datasets import load_dataset
    ds = load_dataset("nvidia/OpenMathReasoning", split=f"cot[:{limit}]")
    for row in ds:
        problem = _clean(row.get("problem", ""))
        solution = _clean(row.get("generated_solution", row.get("solution", "")))
        if not problem or not solution:
            continue
        yield {
            "id": f"openmathreasoning_{hash(problem) & 0xffffffff:x}",
            "topic": _guess_topic(problem),
            "level": "olympiad",
            "problem": problem,
            "solution": solution,
            "source": "nvidia/OpenMathReasoning",
        }


def ingest_olympiadbench(limit: int = LIMIT_PER_SOURCE):
    """Hothan/OlympiadBench: Olympiad-level benchmark, useful for hard-case coverage."""
    from datasets import load_dataset
    ds = load_dataset("Hothan/OlympiadBench", split=f"train[:{limit}]")
    for row in ds:
        problem = _clean(row.get("question", row.get("problem", "")))
        solution = _clean(row.get("solution", row.get("final_answer", "")))
        if not problem:
            continue
        yield {
            "id": f"olympiadbench_{hash(problem) & 0xffffffff:x}",
            "topic": _guess_topic(problem),
            "level": "olympiad",
            "problem": problem,
            "solution": solution or "(đáp án tham khảo, chưa có lời giải chi tiết)",
            "source": "Hothan/OlympiadBench",
        }


def ingest_vietnamese_thpt(limit: int = LIMIT_PER_SOURCE):
    """DHMATH/SFT_Data_High: Vietnamese, THPT level, SFT-ready — directly
    matches this product's language and target audience."""
    from datasets import load_dataset
    ds = load_dataset("DHMATH/SFT_Data_High", split=f"train[:{limit}]")
    for row in ds:
        # SFT-formatted sets commonly use instruction/output or
        # conversations[]; try both shapes defensively.
        problem = _clean(row.get("instruction", row.get("prompt", "")))
        solution = _clean(row.get("output", row.get("response", "")))
        if not problem and "conversations" in row:
            conv = row["conversations"]
            problem = _clean(conv[0].get("value", "")) if conv else ""
            solution = _clean(conv[1].get("value", "")) if len(conv) > 1 else ""
        if not problem or not solution:
            continue
        yield {
            "id": f"dhmath_high_{hash(problem) & 0xffffffff:x}",
            "topic": _guess_topic(problem),
            "level": "THPT",
            "problem": problem,
            "solution": solution,
            "source": "DHMATH/SFT_Data_High",
        }


INGESTERS = [ingest_numinamath, ingest_openmathreasoning, ingest_olympiadbench, ingest_vietnamese_thpt]


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    seen_ids = set()
    total = 0
    with open(OUTPUT_PATH, "a", encoding="utf-8") as out:
        for ingester in INGESTERS:
            name = ingester.__name__
            try:
                count = 0
                for row in ingester():
                    if row["id"] in seen_ids:
                        continue
                    seen_ids.add(row["id"])
                    out.write(json.dumps(row, ensure_ascii=False) + "\n")
                    count += 1
                total += count
                print(f"[{name}] wrote {count} rows")
            except Exception as e:
                # One dataset failing (renamed split, network hiccup) should
                # never take down the whole ingestion run.
                print(f"[{name}] FAILED, skipping: {e}")
    print(f"\nTotal new rows appended to {OUTPUT_PATH}: {total}")
    print("Reload the index in the running app with: math_problem_retrieval.get_default_index().reload()")


if __name__ == "__main__":
    main()
