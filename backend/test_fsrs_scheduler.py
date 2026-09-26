"""
test_fsrs_scheduler.py
=====================
Phase 4 (guide item 2.4) tests for the spaced-repetition scheduler. Offline and
deterministic: every review is anchored to a fixed UTC timestamp, so the
assertions do not depend on the wall clock.

Run: python test_fsrs_scheduler.py   (or pytest)
"""

import sys
from datetime import datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import fsrs_scheduler as fs  # noqa: E402

PASS = []
NOW = datetime(2026, 9, 26, 12, 0, 0, tzinfo=timezone.utc)


def check(name, condition, detail=""):
    PASS.append((name, bool(condition)))
    print(f"{'OK  ' if condition else 'FAIL'} {name} {'' if condition else detail}")


def test_new_card():
    card = fs.new_card(NOW)
    check("new card is due now", fs.is_due(card, NOW), card.get("due"))
    check("new card has no reps", int(card.get("reps") or 0) == 0, card.get("reps"))
    info = fs.summarise(card, NOW)
    check("summarise marks it due", info["is_due"] is True, info)


def test_review_grows_interval():
    card = fs.new_card(NOW)
    first = fs.review(card, "good", now=NOW)
    check("good review schedules a future due date", not fs.is_due(first["card"], NOW), first["card"].get("due"))
    # NOTE: fsrs 6.x keeps `reps`/`lapses` in its ReviewLog, not in the Card — the
    # app tracks those counters itself in `relearn_cards`. What the library DOES
    # guarantee is a memory state (stability) and a recorded last_review.
    check("good review records a memory state",
          float(first["card"].get("stability") or 0) > 0, first["card"].get("stability"))
    check("good review stamps last_review", first["card"].get("last_review") is not None,
          first["card"].get("last_review"))

    later = NOW + timedelta(days=max(1, first["interval_days"] or 1))
    second = fs.review(first["card"], "good", now=later)
    check("second good review extends the interval",
          (second["interval_days"] or 0) >= (first["interval_days"] or 0),
          (first["interval_days"], second["interval_days"]))


def test_again_shortens_and_counts_lapse():
    card = fs.review(fs.review(fs.new_card(NOW), "good", now=NOW)["card"], "good",
                     now=NOW + timedelta(days=5))["card"]
    failed = fs.review(card, "again", now=NOW + timedelta(days=10))
    check("again review is reported as 'again'", failed["rating_used"] == "again", failed["rating_used"])
    check("again review schedules sooner than the previous interval",
          (failed["interval_days"] or 0) <= 1, failed["interval_days"])
    # The lapse counter lives in our own row and summarise() must surface it.
    info = fs.summarise({**failed["card"], "lapses": 1, "reps": 3}, NOW + timedelta(days=10))
    check("summarise surfaces our lapse/reps counters",
          info["lapses"] == 1 and info["reps"] == 3, info)


def test_unknown_rating_is_safe():
    out = fs.review(fs.new_card(NOW), "totally-not-a-rating", now=NOW)
    check("unknown rating degrades to good", out["rating_used"] == "good", out["rating_used"])
    check("unknown rating still returns a card", isinstance(out["card"], dict) and out["card"], out["card"])


def test_storage_round_trip():
    card = fs.review(fs.new_card(NOW), "hard", now=NOW)["card"]
    stored = fs.card_to_storage(card)
    check("storage is JSON text", isinstance(stored, str) and stored.startswith("{"), stored[:40])
    restored = fs.card_from_storage(stored)
    check("restored is a Card", restored is not None)
    check("restored keeps the due date", fs.parse_due(restored.to_dict().get("due")) == fs.parse_due(card.get("due")),
          restored.to_dict().get("due"))
    check("garbage storage is handled", fs.card_from_storage("{not json") is None)
    check("empty storage is handled", fs.card_from_storage("") is None)


def test_rating_from_accuracy():
    check("85%+ → easy", fs.rating_from_accuracy(92) == "easy")
    check("65-84% → good", fs.rating_from_accuracy(70) == "good")
    check("40-64% → hard", fs.rating_from_accuracy(50) == "hard")
    check("<40% → again", fs.rating_from_accuracy(20) == "again")
    check("level fallback", fs.rating_from_accuracy(None, "weak") == "again")
    check("unknown level → good", fs.rating_from_accuracy(None, "whatever") == "good")


def test_entries_to_cards():
    seeds = fs.entries_to_cards([
        {"name": "Hình học không gian", "topic": "cosine", "accuracy": 30, "correct": 2, "total": 5},
        {"name": "Hình học không gian", "topic": "cosine", "accuracy": 30},   # duplicate → deduped
        {"name": "Đạo hàm", "level": "medium"},
        {"skill": "Tích phân", "correct": 9, "total": 10},                    # computed accuracy → easy
        {},                                                                   # ignored
    ])
    check("seeds built", len(seeds) == 3, seeds)
    by_key = {s["card_key"]: s for s in seeds}
    check("weak accuracy → again", by_key["cosine|hình học không gian"]["seed_rating"] == "again", by_key)
    check("medium level → good", by_key["|đạo hàm"]["seed_rating"] == "good", by_key)
    check("9/10 computed → easy", by_key["|tích phân"]["seed_rating"] == "easy", by_key)
    check("empty input is safe", fs.entries_to_cards(None) == [])


def test_due_first_ordering():
    older = fs.new_card(NOW - timedelta(days=3))
    newer = fs.new_card(NOW + timedelta(days=2))
    ordered = fs.due_first([newer, older])
    check("overdue card comes first",
          fs.parse_due(ordered[0].get("due")) <= fs.parse_due(ordered[1].get("due")), ordered)


def test_desired_retention_bounds():
    import os
    os.environ["FSRS_DESIRED_RETENTION"] = "1.5"
    check("retention clamped down to 0.97", fs.desired_retention() <= 0.97, fs.desired_retention())
    os.environ["FSRS_DESIRED_RETENTION"] = "0.1"
    check("retention clamped up to 0.70", fs.desired_retention() >= 0.70, fs.desired_retention())
    os.environ["FSRS_DESIRED_RETENTION"] = "abc"
    check("bad value → default 0.9", abs(fs.desired_retention() - 0.9) < 1e-9, fs.desired_retention())
    del os.environ["FSRS_DESIRED_RETENTION"]


def main():
    test_new_card()
    test_review_grows_interval()
    test_again_shortens_and_counts_lapse()
    test_unknown_rating_is_safe()
    test_storage_round_trip()
    test_rating_from_accuracy()
    test_entries_to_cards()
    test_due_first_ordering()
    test_desired_retention_bounds()

    failed = [name for name, ok in PASS if not ok]
    print(f"\n{len(PASS) - len(failed)}/{len(PASS)} checks passed")
    if failed:
        print("FAILED:", failed)
        sys.exit(1)
    print("ALL_FSRS_TESTS_PASSED")


if __name__ == "__main__":
    main()
