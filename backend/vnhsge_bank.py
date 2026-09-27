"""
vnhsge_bank.py
==============
Phase 4 (integration-guide item 2.8) — the VNHSGE question bank (ngân hàng đề THPT).

The plan refused to ship a question bank before the DATA SOURCE and the LICENCE
were settled, so this module is built around that decision instead of assuming
one:

* `normalize_record()` accepts whatever shape a dump arrives in — public VNHSGE
  exports use question/Question/content, answer/"B"/2/full-text, options as a
  list or as A/B/C/D columns — and REJECTS anything it cannot fully verify. A
  half-parsed question (wrong answer key) is worse than a missing question.
* `question_key()` makes imports idempotent, so re-running the importer never
  duplicates rows, and the same question coming from two dumps collapses.
* `TABLE_SQL` / `INDEX_SQL` are the single source of truth for the schema: both
  main.py (`/api/exam/vnhsge/*`) and scripts/import_vnhsge.py use them.
* `license_note()` renders the attribution line the bank must display — the
  importer refuses to write without one (see scripts/import_vnhsge.py).

Deliberately PURE — no DB, no HTTP, no `import main` — so the parsing rules are
unit-testable offline (same split as fsrs_scheduler / grading / math_reader).

The generated database is NEVER committed: the importer writes to the app's
SQLite file, which is git-ignored, and `backend/data/*.jsonl` fixtures are
original content written for this project.
"""

import hashlib
import re
from typing import Any, Dict, Iterable, List, Optional, Tuple

# ── subjects ────────────────────────────────────────────────────────────────
# The nine VNHSGE subjects, keyed by the slug we store. Vietnamese labels are
# what the UI shows; the aliases cover the spellings datasets actually use
# (with/without diacritics, English names, "vat_li", "GDKTPL"…).
SUBJECTS: Dict[str, str] = {
    "toan": "Toán",
    "ly": "Vật lí",
    "hoa": "Hoá học",
    "sinh": "Sinh học",
    "van": "Ngữ văn",
    "su": "Lịch sử",
    "dia": "Địa lí",
    "gdcd": "GDCD",
    "anh": "Tiếng Anh",
}

_SUBJECT_ALIASES: Dict[str, str] = {
    "toan": "toan", "toán": "toan", "math": "toan", "maths": "toan", "mathematics": "toan",
    "ly": "ly", "lí": "ly", "vat li": "ly", "vật lí": "ly", "vat_li": "ly", "vatli": "ly",
    "physics": "ly", "physic": "ly",
    "hoa": "hoa", "hóa": "hoa", "hoá": "hoa", "hoa hoc": "hoa", "hóa học": "hoa",
    "chemistry": "hoa", "chem": "hoa",
    "sinh": "sinh", "sinh hoc": "sinh", "sinh học": "sinh", "biology": "sinh", "bio": "sinh",
    "van": "van", "văn": "van", "ngu van": "van", "ngữ văn": "van", "literature": "van",
    "su": "su", "sử": "su", "lich su": "su", "lịch sử": "su", "history": "su", "hist": "su",
    "dia": "dia", "địa": "dia", "dia li": "dia", "địa lí": "dia", "geography": "dia", "geo": "dia",
    "gdcd": "gdcd", "giao duc cong dan": "gdcd", "giáo dục công dân": "gdcd",
    "gdktpl": "gdcd", "kinh te phap luat": "gdcd", "civic": "gdcd",
    "anh": "anh", "tieng anh": "anh", "tiếng anh": "anh", "english": "anh", "eng": "anh",
}

# VNHSGE is a 4-option multiple-choice exam; anything else is a different corpus
# and must not slip in silently.
REQUIRED_CHOICES = 4
MIN_QUESTION_CHARS = 12

TABLE_SQL = """CREATE TABLE IF NOT EXISTS vnhsge_questions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            question_key TEXT NOT NULL UNIQUE,
            subject      TEXT NOT NULL,
            grade        INTEGER NOT NULL DEFAULT 12,
            question     TEXT NOT NULL,
            choices_json TEXT NOT NULL,
            answer_index INTEGER NOT NULL,
            explanation  TEXT DEFAULT '',
            source       TEXT DEFAULT '',
            source_id    TEXT DEFAULT '',
            license      TEXT DEFAULT '',
            attribution  TEXT DEFAULT '',
            created_at   TEXT DEFAULT (datetime('now')),
            updated_at   TEXT DEFAULT (datetime('now'))
        )"""

INDEX_SQL = "CREATE INDEX IF NOT EXISTS idx_vnhsge_subject ON vnhsge_questions(subject, grade)"


def detect_subject(value: Any) -> Optional[str]:
    """Map a dataset's subject spelling onto one of `SUBJECTS`, or None."""
    if value is None:
        return None
    text = str(value).strip().lower()
    if not text:
        return None
    if text in SUBJECTS:
        return text
    if text in _SUBJECT_ALIASES:
        return _SUBJECT_ALIASES[text]
    # "Toán học", "môn: vật lí", "VAT LI (2023)" → try the longest alias inside.
    for alias in sorted(_SUBJECT_ALIASES, key=len, reverse=True):
        if alias in text:
            return _SUBJECT_ALIASES[alias]
    return None


def license_note(license_text: str, source: str, attribution: str = "") -> str:
    """The single line the UI must display next to bank content."""
    parts = [f"Nguồn: {source or 'không rõ'}"]
    parts.append(f"Giấy phép: {license_text or 'chưa xác định'}")
    if attribution:
        parts.append(attribution)
    return " · ".join(parts)


def _pick(raw: Dict[str, Any], *names: str) -> Any:
    """First non-empty value among `names` (case-insensitive keys)."""
    lowered = {str(k).strip().lower(): v for k, v in raw.items()}
    for name in names:
        value = lowered.get(name.lower())
        if value is None:
            continue
        if isinstance(value, str) and not value.strip():
            continue
        if isinstance(value, (list, tuple)) and len(value) == 0:
            continue
        return value
    return None


def _as_choices(value: Any, raw: Dict[str, Any]) -> List[str]:
    """Options as a list — from a list/tuple/JSON string, or A/B/C/D columns."""
    if isinstance(value, str):
        text = value.strip()
        if text.startswith("[") and text.endswith("]"):
            try:
                import json as _json

                value = _json.loads(text)
            except Exception:
                pass
        else:
            # "1 | 2 | 3 | 4" and "1;2;3;4" styles
            for sep in ("|", ";"):
                if text.count(sep) == REQUIRED_CHOICES - 1:
                    value = [part.strip() for part in text.split(sep)]
                    break
    if isinstance(value, (list, tuple)):
        return [re.sub(r"^\s*[A-Da-d][.)]\s*", "", str(item)).strip() for item in value]

    columns = [_pick(raw, letter) for letter in ("A", "B", "C", "D")]
    if all(column is not None for column in columns):
        return [str(column).strip() for column in columns]
    return []


def _answer_index(value: Any, choices: List[str]) -> Optional[int]:
    """Resolve the key: exact choice text → letter → 1-based number → 0-based."""
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None

    folded = text.casefold()
    for index, choice in enumerate(choices):
        if choice.strip().casefold() == folded:
            return index

    letter = re.fullmatch(r"[A-Da-d]", text)
    if letter:
        return ord(text.upper()) - ord("A")

    number = re.fullmatch(r"-?\d+", text)
    if number:
        as_int = int(text)
        if 1 <= as_int <= len(choices):
            return as_int - 1
        if 0 <= as_int < len(choices):
            return as_int
    return None


def normalize_record(
    raw: Dict[str, Any],
    *,
    source: str = "",
    license_text: str = "",
    attribution: str = "",
    default_grade: int = 12,
) -> Tuple[Optional[Dict[str, Any]], str]:
    """Turn one raw dataset row into a canonical record.

    Returns `(record, "")` on success or `(None, reason)` when the row cannot be
    verified. The importer reports the reason counts per dump, so a partial
    failure can never be mistaken for a clean import.
    """
    if not isinstance(raw, dict):
        return None, "row_not_an_object"

    question = _pick(raw, "question", "Question", "question_text", "content", "text", "prompt", "stem")
    if question is None:
        return None, "missing_question"
    question = re.sub(r"\s+", " ", str(question)).strip()
    if len(question) < MIN_QUESTION_CHARS:
        return None, "question_too_short"

    subject = detect_subject(_pick(raw, "subject", "Subject", "subject_name", "course", "mon", "môn"))
    if subject is None:
        return None, "unknown_subject"

    choices = [str(choice).strip() for choice in _as_choices(_pick(raw, "choices", "options", "answers", "choice"), raw)]
    if len(choices) != REQUIRED_CHOICES:
        return None, f"expected_{REQUIRED_CHOICES}_choices_got_{len(choices)}"
    if any(not choice for choice in choices):
        return None, "empty_choice"
    if len({choice.casefold() for choice in choices}) != REQUIRED_CHOICES:
        return None, "duplicate_choices"

    answer_index = _answer_index(
        _pick(raw, "answer", "Answer", "correct", "correct_answer", "answer_key", "key", "label", "ground_truth"),
        choices,
    )
    if answer_index is None:
        return None, "unresolved_answer"

    record: Dict[str, Any] = {
        "subject": subject,
        "grade": default_grade,
        "question": question,
        "choices": choices,
        "answer_index": answer_index,
        "explanation": re.sub(
            r"\s+",
            " ",
            str(_pick(raw, "explanation", "explain", "rationale", "solution", "hint") or ""),
        ).strip(),
        "source": source,
        "source_id": str(_pick(raw, "id", "qid", "question_id", "no", "index") or ""),
        "license": license_text,
        "attribution": attribution,
    }
    try:
        record["grade"] = int(_pick(raw, "grade", "Grade", "lop", "lớp") or default_grade)
    except (TypeError, ValueError):
        record["grade"] = default_grade
    record["question_key"] = question_key(record)
    return record, ""


def question_key(record: Dict[str, Any]) -> str:
    """Stable identity of a question: subject + normalised text + its choices.

    Independent of the dump it came from, so importing the same question twice
    (or from two different dumps) updates one row instead of duplicating it.
    """
    material = "|".join(
        [
            str(record.get("subject", "")).strip().lower(),
            re.sub(r"\s+", " ", str(record.get("question", ""))).strip().casefold(),
            " ".join(str(choice).strip().casefold() for choice in record.get("choices", [])),
        ]
    )
    return hashlib.sha1(material.encode("utf-8")).hexdigest()


def summarize(rows: Iterable[Any]) -> Dict[str, Any]:
    """Counts per subject + totals, for `/api/exam/vnhsge/meta`."""
    counts: Dict[str, int] = {slug: 0 for slug in SUBJECTS}
    total = 0
    for row in rows:
        slug = row["subject"] if isinstance(row, dict) else row[0]
        subject = detect_subject(slug)
        if subject is None:
            continue
        counts[subject] = counts.get(subject, 0) + 1
        total += 1
    return {
        "total": total,
        "subjects": [{"slug": slug, "label": SUBJECTS[slug], "count": counts.get(slug, 0)} for slug in SUBJECTS],
    }
