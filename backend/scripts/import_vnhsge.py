#!/usr/bin/env python3
"""
import_vnhsge.py
================
Phase 4 (integration-guide item 2.8) — load a VNHSGE question dump into the
DuoMath bank (`vnhsge_questions`, served by /api/exam/vnhsge/*).

The plan's rule for this item: the DATA SOURCE and the LICENCE must be a
deliberate decision, the import happens by script, and the generated database is
never committed. This script enforces all three:

* it refuses to write unless --acknowledge-license is passed, and then prints the
  attribution line stored with every row (the UI shows it back to the student,
  so the source can never be lost);
* it upserts on `question_key`, so re-running the same dump — or importing a
  second dump that overlaps it — updates rows instead of duplicating them;
* it writes to the app's SQLite file (`backend/duomath.db`, matched by `*.db` in
  .gitignore) and never into the repository's fixture directory;
* it reports every rejected row with a reason, so a partial import can never be
  mistaken for a clean one.

Usage
-----
# Dry run on the sample written for this project (safe, offline):
python backend/scripts/import_vnhsge.py --source jsonl \
    --path backend/data/vnhsge_sample.jsonl --dry-run

# A real dump (after checking the licence yourself):
python backend/scripts/import_vnhsge.py --source jsonl --path <dump>.jsonl \
    --source-name "VNHSGE <where you got it>" --license "CC-BY-4.0" \
    --attribution "Dữ liệu do <tác giả> công bố" --acknowledge-license

# Gated Hugging Face dataset (needs a token with access):
HF_TOKEN=hf_... python backend/scripts/import_vnhsge.py --source hf \
    --hf-repo <owner>/<dataset> --hf-file data/test.jsonl \
    --source-name "<owner>/<dataset>" --license "<licence>" --acknowledge-license
"""

import argparse
import csv
import json
import os
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import vnhsge_bank  # noqa: E402  (path set above so the script runs from anywhere)

# A Windows console defaults to cp1252, where printing Vietnamese raises
# UnicodeEncodeError; this script is meant to be run by hand on Windows, so make
# stdout/stderr UTF-8 (no-op on Linux/Render, which already are).
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

DEFAULT_DB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "duomath.db")

LICENCE_CHECKLIST = """Trước khi nhập dữ liệu thật, hãy tự xác nhận 4 điều sau:
  1. Nguồn dữ liệu cụ thể (URL/repo) và ngày tải.
  2. Giấy phép cho phép dùng lại (ví dụ CC-BY-4.0, MIT, public domain) — nếu là
     "chưa rõ giấy phép" thì KHÔNG nhập vào bản phát hành.
  3. Dòng ghi công sẽ hiển thị cho học sinh (--attribution).
  4. Không commit tệp .db sinh ra (đã có sẵn *.db trong .gitignore).
Sau khi xác nhận, chạy lại kèm --acknowledge-license.
"""

def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Import a VNHSGE dump into the DuoMath question bank.")
    parser.add_argument("--source", choices=("jsonl", "json", "csv", "hf"), required=True)
    parser.add_argument("--path", help="local file for jsonl/json/csv")
    parser.add_argument("--hf-repo", help="Hugging Face dataset id, e.g. owner/dataset")
    parser.add_argument("--hf-file", help="file inside the HF repo (default: the repo's data file)")
    parser.add_argument("--limit", type=int, default=0, help="stop after N accepted rows (0 = no limit)")
    parser.add_argument("--db", default=DEFAULT_DB, help="SQLite file to write (default: backend/duomath.db)")
    parser.add_argument("--source-name", default="", help="where the dump came from (stored per row)")
    parser.add_argument("--license", dest="license_text", default="", help="licence of the dump (stored per row)")
    parser.add_argument("--attribution", default="", help="credit line shown to students")
    parser.add_argument("--grade", type=int, default=12)
    parser.add_argument("--dry-run", action="store_true", help="parse and report, write nothing")
    parser.add_argument("--acknowledge-license", action="store_true", help="confirm the licence checklist")
    parser.add_argument("--show-rejects", type=int, default=3, help="print this many rejected rows")
    return parser.parse_args(argv)


def load_hf(args):
    """Download the dump from Hugging Face (a gated dataset needs HF_TOKEN)."""
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("Cần gói huggingface_hub cho --source hf:  pip install huggingface_hub")
        return None
    if not args.hf_repo:
        print("--source hf cần --hf-repo")
        return None
    token = os.environ.get("HF_TOKEN") or None
    kwargs = {"repo_id": args.hf_repo, "repo_type": "dataset", "token": token}
    if args.hf_file:
        kwargs["filename"] = args.hf_file
    try:
        path = hf_hub_download(**kwargs)
    except Exception as exc:  # noqa: BLE001 - shown to the operator verbatim
        print(f"Không tải được {args.hf_repo}: {exc}")
        if not token:
            print("Gợi ý: dataset có thể đang bị giới hạn — đặt HF_TOKEN rồi chạy lại.")
        return None
    print(f"Đã tải: {path}")
    return path


def iter_jsonl(path):
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as exc:
                yield {"__error__": f"jsonl: {exc}"}


def iter_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    rows = data if isinstance(data, list) else (data.get("data") or data.get("questions") or [])
    yield from rows


def iter_csv(path):
    with open(path, "r", encoding="utf-8-sig", newline="") as handle:
        yield from csv.DictReader(handle)


def iter_rows(args):
    """Yield raw rows from whichever source was requested."""
    if args.source == "hf":
        path = load_hf(args)
        if path is None:
            return
        suffix = os.path.splitext(path)[1].lower()
        if suffix == ".csv":
            yield from iter_csv(path)
        elif suffix == ".json":
            yield from iter_json(path)
        else:
            yield from iter_jsonl(path)
        return

    if not args.path:
        print("--source jsonl|json|csv cần --path")
        return
    if not os.path.exists(args.path):
        print(f"Không thấy tệp: {args.path}")
        return

    suffix = os.path.splitext(args.path)[1].lower()
    if args.source == "csv" or suffix == ".csv":
        yield from iter_csv(args.path)
    elif args.source == "json" or suffix == ".json":
        yield from iter_json(args.path)
    else:
        yield from iter_jsonl(args.path)

UPSERT_SQL = """
INSERT INTO vnhsge_questions
    (question_key, subject, grade, question, choices_json, answer_index,
     explanation, source, source_id, license, attribution)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(question_key) DO UPDATE SET
    subject      = excluded.subject,
    grade        = excluded.grade,
    question     = excluded.question,
    choices_json = excluded.choices_json,
    answer_index = excluded.answer_index,
    explanation  = excluded.explanation,
    source       = excluded.source,
    source_id    = excluded.source_id,
    license      = excluded.license,
    attribution  = excluded.attribution,
    updated_at   = datetime('now')
"""


def open_db(path):
    directory = os.path.dirname(path)
    if directory and not os.path.isdir(directory):
        os.makedirs(directory, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute(vnhsge_bank.TABLE_SQL)
    conn.execute(vnhsge_bank.INDEX_SQL)
    conn.commit()
    return conn


def main(argv=None):
    args = parse_args(argv)

    if not args.dry_run and not args.acknowledge_license:
        print(LICENCE_CHECKLIST)
        return 2

    accepted = []
    rejects = {}
    rejected_samples = []

    for raw in iter_rows(args):
        if isinstance(raw, dict) and "__error__" in raw:
            rejects[raw["__error__"]] = rejects.get(raw["__error__"], 0) + 1
            continue
        record, reason = vnhsge_bank.normalize_record(
            raw,
            source=args.source_name,
            license_text=args.license_text,
            attribution=args.attribution,
            default_grade=args.grade,
        )
        if record is None:
            rejects[reason] = rejects.get(reason, 0) + 1
            if len(rejected_samples) < args.show_rejects:
                rejected_samples.append((reason, raw))
            continue
        accepted.append(record)
        if args.limit and len(accepted) >= args.limit:
            break

    # De-duplicate inside this run as well: two identical questions in one dump
    # would otherwise hit the same key twice.
    unique = {}
    for record in accepted:
        unique[record["question_key"]] = record
    duplicates_in_dump = len(accepted) - len(unique)

    summary = vnhsge_bank.summarize(list(unique.values()))
    print(f"\nĐọc được : {len(accepted)} dòng hợp lệ")
    print(f"Trùng trong cùng tệp: {duplicates_in_dump}")
    print(f"Loại bỏ   : {sum(rejects.values())}  {rejects if rejects else ''}")
    for reason, raw in rejected_samples:
        preview = json.dumps(raw, ensure_ascii=False)[:160]
        print(f"   · [{reason}] {preview}")
    by_subject = ", ".join(
        f"{item['label']}={item['count']}" for item in summary["subjects"] if item["count"]
    )
    print(f"Theo môn  : {by_subject}")

    if args.dry_run:
        print("\n--dry-run: không ghi gì vào cơ sở dữ liệu.")
        return 0 if unique else 1

    conn = open_db(args.db)
    try:
        rows = [
            (
                record["question_key"],
                record["subject"],
                record["grade"],
                record["question"],
                json.dumps(record["choices"], ensure_ascii=False),
                record["answer_index"],
                record["explanation"],
                record["source"],
                record["source_id"],
                record["license"],
                record["attribution"],
            )
            for record in unique.values()
        ]
        before = conn.execute("SELECT COUNT(*) FROM vnhsge_questions").fetchone()[0]
        conn.executemany(UPSERT_SQL, rows)
        conn.commit()
        after = conn.execute("SELECT COUNT(*) FROM vnhsge_questions").fetchone()[0]
    finally:
        conn.close()

    print(f"\nĐã ghi vào: {args.db}")
    print(f"Số câu trước/sau: {before} → {after} (thêm mới {after - before}, cập nhật {len(rows) - (after - before)})")
    print(f"Ghi công  : {vnhsge_bank.license_note(args.license_text, args.source_name, args.attribution)}")
    print("Nhắc lại  : tệp .db này KHÔNG được commit (đã có *.db trong .gitignore).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
