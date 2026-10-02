"""
fallback_policy.py
==================
Payload shaping for the GENERATION FALLBACK tiers (P2 of the canvas-libraries
follow-up).

Why this exists
---------------
The Groq free tier checks `input tokens + max_tokens` against a per-minute
token budget and rejects the whole request when it is crossed ("Request too
large for model … in organization …"). That is exactly what every image
request hit during the local olympiad tests once the vision text made the
prompt long: the primary tier had already failed, and the safety net refused
to take the fall.

The fallback tiers are not the showpiece — they are what answers when the
primary is down — so they trade answer length for a chance to answer at all:

  * `fallback_max_tokens` caps the answer budget;
  * `trim_for_tier` keeps the system prompt (the rules ARE the prompt in this
    project: MathViz vocabulary, honesty rules) plus only the most recent
    turns of the conversation;
  * `shrink_on_tpm` is the one retry worth making after a TPM rejection —
    the SAME model with half the answer budget, before moving on.

Pure functions, no imports beyond the standard library, so the offline suite
(backend/test_fallback_policy.py) can pin them without a network.
"""
from __future__ import annotations

from typing import Any, Dict, List

#: Never shrink below this — a 100-token answer is not an answer.
MIN_FALLBACK_TOKENS = 256


def fallback_max_tokens(max_tokens: Any, cap: int) -> int:
    """The answer budget a fallback tier is allowed: ``min(request, cap)``."""
    try:
        wanted = int(max_tokens)
    except (TypeError, ValueError):
        wanted = 0
    if wanted <= 0:
        wanted = int(cap)
    return max(MIN_FALLBACK_TOKENS, min(wanted, int(cap)))


def shrink_on_tpm(max_tokens: int) -> int:
    """One retry after a token-per-minute rejection: half the answer budget."""
    try:
        wanted = int(max_tokens)
    except (TypeError, ValueError):
        wanted = MIN_FALLBACK_TOKENS * 2
    return max(MIN_FALLBACK_TOKENS, wanted // 2)


def trim_for_tier(messages: List[Dict[str, Any]], keep_recent: int = 4) -> List[Dict[str, Any]]:
    """System prompt first, then only the last ``keep_recent`` turns.

    The system message is never dropped: in this project it carries the
    MathViz schema, the no-invented-kind rule and the honesty rules — a reply
    generated without it is worse than no reply. Non-system history is what
    grows with the conversation, so that is what gets trimmed.
    """
    items = [m for m in (messages or []) if isinstance(m, dict)]
    if not items:
        return []
    system = [m for m in items if m.get("role") == "system"]
    others = [m for m in items if m.get("role") != "system"]
    try:
        keep = max(1, int(keep_recent))
    except (TypeError, ValueError):
        keep = 4
    return system[:1] + others[-keep:]