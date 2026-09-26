"""
fsrs_scheduler.py
=================
Phase 4 (integration-guide item 2.4) — spaced repetition for "relearn" items,
powered by the `fsrs` package (Free Spaced Repetition Scheduler).

Why this exists: the app already tells a student WHICH skills are weak (the
`/ketqua` feedback, `utils/mastery.js`, `test_results`), but it cannot say WHEN
to review them. FSRS turns each weak-skill item into a card whose due date
adapts to how well the student actually recalls it, so the relearn list stops
being a static suggestion and becomes a schedule.

Deliberately PURE — no DB, no HTTP, no `import main` — so the scheduling maths is
unit-testable offline (same split as math_reader / math_solver). Persistence
lives in main.py: the `relearn_cards` table + `/api/relearn/*` endpoints.
"""

import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

RATINGS = ("again", "hard", "good", "easy")
DEFAULT_RETENTION = 0.9
MAX_INTERVAL_DAYS = 365
MIN_RETENTION, MAX_RETENTION = 0.70, 0.97


def desired_retention() -> float:
    try:
        value = float(os.environ.get("FSRS_DESIRED_RETENTION", DEFAULT_RETENTION))
    except (TypeError, ValueError):
        value = DEFAULT_RETENTION
    return min(MAX_RETENTION, max(MIN_RETENTION, value))


def make_scheduler():
    """`fsrs.Scheduler` with our retention target; tolerant of API variants."""
    from fsrs import Scheduler
    try:
        return Scheduler(desired_retention=desired_retention(), maximum_interval=MAX_INTERVAL_DAYS)
    except TypeError:
        try:
            return Scheduler(desired_retention=desired_retention())
        except TypeError:
            return Scheduler()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── card lifecycle ───────────────────────────────────────────────────────────

def new_card(now: Optional[datetime] = None) -> Dict[str, Any]:
    """A fresh card, due immediately."""
    from fsrs import Card
    card = Card(due=now) if now is not None else Card()
    return card.to_dict()


def is_due(card: Dict[str, Any], now: Optional[datetime] = None) -> bool:
    due = parse_due(card.get("due"))
    if due is None:
        return True
    return due <= (now or now_utc())


def review(card: Dict[str, Any], rating: str, now: Optional[datetime] = None) -> Dict[str, Any]:
    """Apply one review. Returns {card, log, interval_days, rating_used}.

    `rating` is one of `RATINGS`; anything unknown degrades to "good" so a
    front-end typo can never crash the scheduler.
    """
    from fsrs import Card, Rating
    scheduler = make_scheduler()
    try:
        rating_enum = {
            "again": Rating.Again,
            "hard": Rating.Hard,
            "good": Rating.Good,
            "easy": Rating.Easy,
        }[(rating or "good").strip().lower()]
        rating_used = (rating or "good").strip().lower()
    except KeyError:
        rating_enum, rating_used = Rating.Good, "good"

    restored = card_from_storage(card)   # accepts Card | dict | JSON string
    if restored is None:
        restored = Card()
    if now is not None:
        try:
            restored.due = now          # deterministic tests: review "as of" now
        except Exception:
            pass

    reviewed, log = scheduler.review_card(restored, rating_enum)
    as_dict = reviewed.to_dict()
    return {
        "card": as_dict,
        "log": log.to_dict() if hasattr(log, "to_dict") else str(log),
        "interval_days": int(as_dict.get("scheduled_days") or 0),
        "rating_used": rating_used,
    }


# ── storage round-trip (SQLite stores TEXT) ──────────────────────────────────

def card_to_storage(card: Dict[str, Any]) -> str:
    """JSON-safe copy: datetimes become ISO strings."""
    safe = dict(card or {})
    for key in ("due", "last_review"):
        value = safe.get(key)
        if isinstance(value, datetime):
            safe[key] = value.astimezone(timezone.utc).isoformat()
    return json.dumps(safe, ensure_ascii=False)


def parse_due(value: Any) -> Optional[datetime]:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str) and value:
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
    return None


def card_from_storage(card: Any):
    """Back to an `fsrs.Card`, or None when the payload is unusable."""
    from fsrs import Card
    if isinstance(card, Card):
        return card
    if isinstance(card, str):
        try:
            card = json.loads(card)
        except Exception:
            return None
    if not isinstance(card, dict):
        return None
    payload = dict(card)
    due = parse_due(payload.get("due"))
    if due is not None:
        payload["due"] = due
    try:
        return Card.from_dict(payload)
    except Exception:
        try:
            fresh = Card()
            if due is not None:
                fresh.due = due
            return fresh
        except Exception:
            return None


# ── mapping the app's own signals onto FSRS ratings ──────────────────────────

def rating_from_accuracy(accuracy_pct: Optional[float], level: str = "") -> str:
    """Turn a mastery signal into a rating.

    A skill the student just scored well on is `good`/`easy`; one they failed is
    `again`, which is what makes the next due date short — the whole point of
    choosing FSRS over a fixed interval table.
    """
    level = (level or "").strip().lower()
    try:
        value = float(accuracy_pct) if accuracy_pct is not None else None
    except (TypeError, ValueError):
        value = None
    if value is not None:
        if value >= 85:
            return "easy"
        if value >= 65:
            return "good"
        if value >= 40:
            return "hard"
        return "again"
    return {"strong": "easy", "medium": "good", "weak": "again"}.get(level, "good")


def card_key(topic: str, skill: str) -> str:
    """Stable identifier so the same weak skill never creates two cards."""
    raw = f"{(topic or '').strip().lower()}|{(skill or '').strip().lower()}"
    raw = " ".join(raw.split())
    return raw[:120] or "unknown"


def entries_to_cards(entries: Iterable[Dict[str, Any]], now: Optional[datetime] = None) -> List[Dict[str, Any]]:
    """Build relearn seeds from the `/ketqua` payload the app already sends.

    Accepts `weakSkills`-shaped entries: {name, topic, accuracy, level, ...}.
    Returns [{card_key, topic, skill, reason, seed_rating}] — the caller decides
    whether to insert or refresh a row.
    """
    seeds: List[Dict[str, Any]] = []
    seen = set()
    for entry in entries or []:
        if not isinstance(entry, dict):
            continue
        skill = str(entry.get("name") or entry.get("skill") or "").strip()
        topic = str(entry.get("topic") or entry.get("chapter") or "").strip()
        if not skill and not topic:
            continue
        key = card_key(topic, skill)
        if key in seen:
            continue
        seen.add(key)
        accuracy = entry.get("accuracy")
        if accuracy is None and entry.get("total"):
            try:
                accuracy = 100.0 * float(entry.get("correct") or 0) / float(entry["total"])
            except (TypeError, ValueError, ZeroDivisionError):
                accuracy = None
        seeds.append({
            "card_key": key,
            "topic": topic,
            "skill": skill,
            "reason": f"đúng {entry.get('correct')}/{entry.get('total')}" if entry.get("total") else "kỹ năng yếu",
            "seed_rating": rating_from_accuracy(accuracy, str(entry.get("level") or "")),
        })
    return seeds


def summarise(card: Dict[str, Any], now: Optional[datetime] = None) -> Dict[str, Any]:
    """Human-facing view of a stored card (for the API and the UI)."""
    due = parse_due(card.get("due"))
    reference = now or now_utc()
    days_until = round((due - reference).total_seconds() / 86400, 2) if due else None
    return {
        "due_at": due.isoformat() if due else None,
        "days_until_due": days_until,
        "is_due": bool(days_until is not None and days_until <= 0),
        "state": str(card.get("state") or ""),
        "reps": int(card.get("reps") or 0),
        "lapses": int(card.get("lapses") or 0),
        "interval_days": int(card.get("scheduled_days") or 0),
        "stability": card.get("stability"),
        "difficulty": card.get("difficulty"),
        "last_review": card.get("last_review").isoformat()
        if isinstance(card.get("last_review"), datetime) else card.get("last_review"),
    }


def due_first(cards: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort stored cards so the most overdue come first (None due = due now)."""
    return sorted(cards, key=lambda c: (parse_due(c.get("due")) or datetime.min.replace(tzinfo=timezone.utc)))
