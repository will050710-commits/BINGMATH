"""
test_vnhsge_bank.py
===================
Offline suite for the VNHSGE question bank (Phase 4 / guide item 2.8).

Runs with plain Python — no fastapi, no network, no `import main` — so it can
gate every push (same rule as the other offline suites). It covers the parsing
rules, the identity rule that makes imports idempotent, the licence guard, and a
full import through the real importer into a temporary database (never the
app's file).

Run:  python backend/test_vnhsge_bank.py
"""

import json
import os
import sqlite3
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import vnhsge_bank as bank  # noqa: E402
from scripts import import_vnhsge  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "vnhsge_sample.jsonl")

checks = 0
failures = []


def check(label, condition, detail=""):
    global checks
    checks += 1
    if condition:
        print(f"  ok   {label}")
    else:
        failures.append(label)
        print(f"  FAIL {label} {detail}")


def test_subject_detection():
    print("\n[subjects]")
    check("'Toán' → toan", bank.detect_subject("Toán") == "toan")
    check("'Vật lí' → ly", bank.detect_subject("Vật lí") == "ly")
    check("'vat_li' → ly", bank.detect_subject("vat_li") == "ly")
    check("'GDKTPL' → gdcd", bank.detect_subject("GDKTPL") == "gdcd")
    check("'môn: Lịch sử (2023)' → su", bank.detect_subject("môn: Lịch sử (2023)") == "su")
    check("unknown subject → None", bank.detect_subject("thể dục") is None)


def test_answer_resolution():
    print("\n[answer shapes]")
    record, why = bank.normalize_record(
        {"question": "Cho x + 1 = 2. Giá trị của x là bao nhiêu?", "subject": "toan",
         "choices": ["0", "1", "2", "3"], "answer": "B"}
    )
    check("letter answer 'B' → index 1", record and record["answer_index"] == 1, why)

    record, why = bank.normalize_record(
        {"question": "Tập nghiệm của x − 3 > 0 là gì?", "subject": "toan",
         "options": "[\"x > 3\", \"x < 3\", \"x ≥ 3\", \"x ≤ 3\"]", "correct_answer": "x > 3"}
    )
    check("full-text answer → index 0", record and record["answer_index"] == 0, why)

    record, why = bank.normalize_record(
        {"question": "Vật 2 kg chịu lực 6 N thì gia tốc bằng bao nhiêu?", "subject": "Vật lí",
         "A": "1 m/s²", "B": "2 m/s²", "C": "3 m/s²", "D": "6 m/s²", "answer": 3}
    )
    check("A/B/C/D columns + numeric 3 → index 2", record and record["answer_index"] == 2, why)
    check("column choices were de-lettered", record and record["choices"][2] == "3 m/s²")

    record, why = bank.normalize_record(
        {"question": "Chất nào là thành phần chính của muối ăn?", "subject": "hoa hoc",
         "choices": "NaCl | KCl | CaCO3 | Na2CO3", "answer": "NaCl"}
    )
    check("pipe-separated choices", record and record["answer_index"] == 0, why)

    record, why = bank.normalize_record(
        {"question": "Bào quan nào là nhà máy năng lượng của tế bào?", "subject": "Sinh học",
         "choices": ["Ti thể", "Lục lạp", "Ribosome", "Nhân"], "answer": "D"}
    )
    check("letter maps to the Nth choice", record and record["answer_index"] == 3, why)


def test_rejections():
    print("\n[rejections — a wrong answer key is worse than a missing question]")
    cases = [
        ("short question", {"question": "Sai", "subject": "toan", "choices": ["1", "2", "3", "4"], "answer": "A"}),
        ("unknown subject", {"question": "Một câu hỏi đủ dài ở đây?", "subject": "thể dục",
                             "choices": ["1", "2", "3", "4"], "answer": "A"}),
        ("unresolved answer", {"question": "Một câu hỏi đủ dài ở đây?", "subject": "toan",
                               "choices": ["1", "2", "3", "4"], "answer": "Z"}),
        ("three choices", {"question": "Một câu hỏi đủ dài ở đây?", "subject": "toan",
                           "choices": ["1", "2", "3"], "answer": "A"}),
        ("duplicate choices", {"question": "Một câu hỏi đủ dài ở đây?", "subject": "toan",
                               "choices": ["1", "1", "3", "4"], "answer": "A"}),
        ("missing question field", {"subject": "toan", "choices": ["1", "2", "3", "4"], "answer": "A"}),
    ]
    for label, raw in cases:
        record, reason = bank.normalize_record(raw)
        check(f"rejects {label} ({reason})", record is None and reason != "")


def test_identity_rule():
    print("\n[identity — imports must be idempotent]")
    base = {"subject": "toan", "question": "Cho x + 1 = 2. Giá trị của x là bao nhiêu?",
            "choices": ["0", "1", "2", "3"], "answer": "B"}
    first, _ = bank.normalize_record(base)
    noisy, _ = bank.normalize_record(
        {**base, "question": "  Cho x  +  1 = 2.   Giá trị của x là bao nhiêu?  ", "id": "x9"}
    )
    other, _ = bank.normalize_record({**base, "choices": ["0", "1", "2", "4"]})
    check("whitespace does not change the key", first["question_key"] == noisy["question_key"])
    check("changed choices DO change the key", first["question_key"] != other["question_key"])
    check("key is 40 hex chars", len(first["question_key"]) == 40)


def test_importer_end_to_end():
    print("\n[import — twice into a temp DB]")
    if not os.path.exists(FIXTURE):
        check("fixture exists", False, FIXTURE)
        return

    with open(FIXTURE, "r", encoding="utf-8") as handle:
        rows = [json.loads(line) for line in handle if line.strip()]
    check("fixture is valid JSONL (9 rows)", len(rows) == 9)

    db_path = os.path.join(tempfile.mkdtemp(prefix="vnhsge-test-"), "bank.db")
    common = ["--source", "jsonl", "--path", FIXTURE, "--db", db_path,
              "--source-name", "duomath-original-sample", "--license", "CC-BY-4.0",
              "--attribution", "Nội dung mẫu do DuoMath tự soạn"]

    check("dry run exits 0", import_vnhsge.main([*common, "--dry-run"]) == 0)
    check("dry run wrote nothing", not os.path.exists(db_path))
    check("refuses to write without the licence acknowledgement",
          import_vnhsge.main(common) == 2)
    check("still nothing written", not os.path.exists(db_path))
    check("import with acknowledgement exits 0",
          import_vnhsge.main([*common, "--acknowledge-license"]) == 0)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    first_count = conn.execute("SELECT COUNT(*) FROM vnhsge_questions").fetchone()[0]
    row = conn.execute("SELECT * FROM vnhsge_questions WHERE subject='ly'").fetchone()
    check("7 valid rows stored (2 rejected)", first_count == 7, f"got {first_count}")
    check("physics row kept numeric answer as index 2", row and row["answer_index"] == 2)
    check("choices stored as JSON", row and json.loads(row["choices_json"])[2] == "3 m/s²")
    check("attribution stored per row", row and "DuoMath" in row["attribution"])
    check("licence stored per row", row and row["license"] == "CC-BY-4.0")

    check("second import exits 0",
          import_vnhsge.main([*common, "--acknowledge-license"]) == 0)
    second_count = conn.execute("SELECT COUNT(*) FROM vnhsge_questions").fetchone()[0]
    check("second import is idempotent", second_count == first_count, f"{first_count} → {second_count}")

    summary = bank.summarize(conn.execute("SELECT subject FROM vnhsge_questions").fetchall())
    labels = {item["slug"]: item["count"] for item in summary["subjects"]}
    check("summary total matches", summary["total"] == second_count)
    check("summary counts per subject", labels["toan"] == 2 and labels["ly"] == 1 and labels["anh"] == 1, str(labels))
    conn.close()


def main():
    print("═══ VNHSGE bank tests (offline) ═══")
    test_subject_detection()
    test_answer_resolution()
    test_rejections()
    test_identity_rule()
    test_importer_end_to_end()
    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED: " + ", ".join(failures))
        return 1
    print("ALL_VNHSGE_BANK_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
