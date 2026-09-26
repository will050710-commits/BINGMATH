"""
check_free_catalog.py
=====================
Phase 4 / Đợt 4C — catch the exact failure mode that silently broke production:
a `:free` model slug that OpenRouter removed while our config kept pointing at
it. OpenRouter does NOT fail over when a model id is invalid — it rejects the
whole request (HTTP 400), so a single dead slug takes a whole tier down.

Run:  python backend/scripts/check_free_catalog.py
Exit: 0 when every tracked slug still exists (or the network is unavailable),
      1 when at least one slug is gone (so CI fails before users do).

Scans CODE/CONFIG only (never the .md docs, which intentionally document the
slugs that already died as history).
"""

import json
import os
import re
import sys
from pathlib import Path

import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parents[2]          # …/duosteam
CATALOG_URL = "https://openrouter.ai/api/v1/models"
TRACK_PREFIX = "https://openrouter.ai/api/v1/models/"

# Code/config files whose slugs we actually call (docs are excluded on purpose).
SCAN_FILES = [
    "backend/render.yaml",
    "backend/main.py",
    "backend/vision_agent.py",
    "backend/math_reader.py",
    "backend/math_solver.py",
    "frontend/src/app/api/learning-feedback/route.js",
]

# `author/model:variant` or the two routers ("openrouter/free", "openrouter/auto").
SLUG_RE = re.compile(r"\b([a-z0-9][a-z0-9._-]{1,40}/[a-z0-9][a-z0-9._-]{1,60}(?::[a-z]{3,10})?)\b")
ROUTERS = {"openrouter/free", "openrouter/auto", "openrouter/auto-beta"}
VARIANTS = (":free", ":extended", ":thinking", ":nitro", ":online", ":floor", ":exacto")


def _strip_comments(text: str, suffix: str) -> str:
    """Drop comment bodies before scanning.

    Slugs are also mentioned in comments that DOCUMENT the ones that already
    died (so the next reader knows why they were replaced). Those mentions are
    not calls we make, and flagging them would make the gate cry wolf.
    """
    if suffix == ".js":
        text = re.sub(r"/\*[\s\S]*?\*/", "", text)
        return "\n".join(line.split("//", 1)[0] for line in text.splitlines())
    return "\n".join(line.split("#", 1)[0] for line in text.splitlines())


def tracked_slugs():
    """Every slug we should keep alive, with the files that mention it."""
    found = {}
    for rel in SCAN_FILES:
        path = REPO / rel
        if not path.exists():
            continue
        raw = path.read_text(encoding="utf-8", errors="replace")
        text = _strip_comments(raw, path.suffix)
        for slug in SLUG_RE.findall(text):
            if slug in ROUTERS or slug.endswith(VARIANTS):
                found.setdefault(slug, set()).add(rel)
    return found


def fetch_catalog_ids():
    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    response = httpx.get(CATALOG_URL, headers=headers, timeout=60)
    response.raise_for_status()
    return {m["id"] for m in response.json().get("data", [])}


def main() -> int:
    tracked = tracked_slugs()
    print(f"tracked slugs: {len(tracked)}")
    try:
        catalog = fetch_catalog_ids()
    except Exception as exc:  # noqa: BLE001
        print(f"[skip] could not fetch the OpenRouter catalog ({type(exc).__name__}: {exc})")
        return 0

    dead = {slug: files for slug, files in tracked.items() if slug not in catalog}
    for slug in sorted(tracked):
        mark = "OK  " if slug not in dead else "DEAD"
        print(f"  {mark} {slug}  ({', '.join(sorted(tracked[slug]))})")

    if dead:
        print(f"\n{len(dead)} dead slug(s) — update the code/config before deploying:")
        for slug, files in sorted(dead.items()):
            print(f"  - {slug}  in {', '.join(sorted(files))}")
        return 1
    print("\nall tracked free slugs still exist on OpenRouter")
    return 0


if __name__ == "__main__":
    sys.exit(main())
