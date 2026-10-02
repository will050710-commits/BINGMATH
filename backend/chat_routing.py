"""
chat_routing.py
===============
P5 — which of the two replies a picture earns.

The problem this solves (reported from the classroom): a student drops in a
FIGURE with no readable statement. The vision reader recognises the structure
("A, B, C, D, E; B-D-C-E collinear; …") but there are no numbers, so there is
nothing to solve. Before this module the whole reply was "Hãy gửi đề bài cụ
thể…" — next to a red "chưa kiểm chứng được đáp án" badge for a check that had
nothing to verify.

The rule now:

* a usable STATEMENT (transcription with numbers/maths, or a typed message)
  → the normal path: solve first, illustration last;
* a readable FIGURE without a statement → **figure-only**: build the mathviz
  illustration straight from what the vision reader saw, say so calmly
  (`FIGURE_ONLY_NOTE`), and invite the student to send the full statement;
* nothing readable at all → fall through (the existing "send a clearer photo"
  behaviour).

Pure functions and constants only — no I/O, no imports beyond the standard
library, so backend/test_chat_routing.py can pin every branch offline.
"""
from __future__ import annotations

from typing import Any, List

#: Messages the UI sends when the student attached a picture but typed little
#: or nothing; they are not problem statements and must never be solved as if
#: they were. The three current DuoMCB strings (hint/solution/threeD) are the
#: ones the page really sends — the older variants stay for compatibility.
PLACEHOLDER_MESSAGES = (
    "gợi ý bài toán từ ảnh",
    "gợi ý bài toán trong ảnh này.",
    "giải bài toán từ ảnh",
    "giải chi tiết bài toán trong ảnh này.",
    "giải bài toán trong ảnh này cho em.",
    "hãy giải bài toán trong ảnh này cho em.",
    "minh họa tương tác cho bài toán này.",
    "minh hoạ tương tác cho bài toán này.",
)

#: Appended (once) by main.py to a figure-only reply that DOES carry a mathviz
#: block. Kept as a constant so the offline suite can pin its wording.
FIGURE_ONLY_NOTE = (
    "\n\n> ℹ️ Mình chưa đọc được đề bài cụ thể nên **chưa giải** — đây là mô hình "
    "theo đúng hình vẽ. Em gửi đề đầy đủ để mình giải chi tiết nhé."
)
#: The same honesty for the rare case the reply carries no block either.
FIGURE_ONLY_NO_BLOCK_NOTE = (
    "\n\n> ℹ️ Mình chưa đọc được đề bài, và cấu trúc hình cũng chưa đủ chắc để dựng lại. "
    "Em thử chụp lại rõ hơn hoặc gõ đề bằng chữ giúp mình nhé."
)


def is_placeholder_message(message: Any) -> bool:
    """True for the UI's canned prompts (and for an empty message)."""
    text = " ".join(str(message or "").strip().lower().split())
    return (not text) or text in PLACEHOLDER_MESSAGES


def perception_text(perception: Any) -> str:
    """The problem text MathReader produced, whichever fields it used.

    MathReader returns ``latex`` (formulas, reading order) and ``text_blocks``
    (plain words and numbers on the page); a statement can live in either, so
    both are joined. ``transcription``/``text`` cover the agent-side callers.
    """
    if not isinstance(perception, dict):
        return ""
    parts: List[str] = []
    for key in ("transcription", "text", "problem"):
        value = perception.get(key)
        if isinstance(value, str) and value.strip():
            parts.append(value.strip())
    latex = perception.get("latex")
    if isinstance(latex, str) and latex.strip():
        parts.append(latex.strip())
    elif isinstance(latex, list):
        parts.extend(str(item).strip() for item in latex if str(item).strip())
    blocks = perception.get("text_blocks")
    if isinstance(blocks, list):
        parts.extend(str(item).strip() for item in blocks if str(item).strip())
    elif isinstance(blocks, str) and blocks.strip():
        parts.append(blocks.strip())
    return " ".join(parts).strip()


def has_usable_statement(perception: Any, user_message: Any) -> bool:
    """Is there a problem worth SOLVING?

    A transcription counts when it carries something mathematical (a digit, an
    '=' / '^' / LaTeX) and is long enough to be more than a label — or when it
    is long enough (30+ chars) to be a statement without symbols. A reader that
    produced LaTeX saw equations, so a LaTeX field with maths in it counts even
    when short. A typed message counts when it is not one of the canned prompts.
    """
    text = perception_text(perception)
    has_math = any(ch.isdigit() for ch in text) or "=" in text or "\\" in text or "^" in text
    if text and has_math and len(text) >= 10:
        return True
    if len(text) >= 30:
        return True
    latex = perception.get("latex") if isinstance(perception, dict) else None
    if isinstance(latex, list):
        latex = " ".join(str(item) for item in latex if item)
    if isinstance(latex, str) and latex.strip():
        stripped = latex.strip()
        if len(stripped) >= 12 or any(ch.isdigit() for ch in stripped) \
                or "=" in stripped or "^" in stripped or "\\" in stripped:
            return True
    message = str(user_message or "").strip()
    return (not is_placeholder_message(message)) and len(message) >= 12


def figure_structure_available(perception: Any, vision_description: Any) -> bool:
    """Did the vision side see enough of the DRAWING to rebuild it?"""
    description = str(vision_description or "").strip()
    if len(description) >= 40:
        return True
    if isinstance(perception, dict):
        if perception.get("diagram"):
            return True
        return len(perception_text(perception)) >= 20
    return False


def decide_reply_mode(*, image_data: Any, perception: Any = None,
                      vision_description: Any = None, user_message: Any = "",
                      enabled: bool = True) -> str:
    """``"solve"`` (the default everywhere) or ``"figure_only"``."""
    if not enabled or not image_data:
        return "solve"
    if has_usable_statement(perception, user_message):
        return "solve"
    if figure_structure_available(perception, vision_description):
        return "figure_only"
    return "solve"
