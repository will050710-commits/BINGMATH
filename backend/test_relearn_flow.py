"""Đợt 4H — end-to-end proof of the FSRS loop through REAL HTTP with auth.

Runs the actual FastAPI app in-process (ASGI transport), signs a user up to get
a backend JWT, then walks the whole student journey:

    seed (weak skills from a test)  →  due list  →  review  →  due list again

This is the "thử thật" check that cannot be done from an unauthenticated probe:
the relearn endpoints deliberately answer 401 without a token, so only a
authenticated call proves the chain (seed → FSRS card → review → next due date).

Offline: no network, no Firebase — it uses the backend's own JWT signup/login.
"""

import asyncio
import os
import sys
import uuid

BACKEND = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\backend"
sys.path.insert(0, BACKEND)
os.chdir(BACKEND)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import httpx  # noqa: E402

import main  # noqa: E402

PASS = []


def check(name, condition, detail=""):
    PASS.append((name, bool(condition)))
    print(f"{'OK  ' if condition else 'FAIL'} {name} {'' if condition else detail}")


async def flow():
    main.init_db()
    transport = httpx.ASGITransport(app=main.app)
    email = f"fsrs-probe-{uuid.uuid4().hex[:8]}@example.test"
    password = "ProbePass123!"

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=60) as client:
        # 1) a real account (the relearn endpoints are per-user and 401 anonymously)
        signup = await client.post("/api/signup", json={"email": email, "password": password, "username": "FSRS Probe"})
        if signup.status_code not in (200, 201):
            print("   signup body:", signup.text[:200])
        check("signup works", signup.status_code in (200, 201), signup.status_code)

        login = await client.post("/api/login", json={"email": email, "password": password})
        check("login returns a token", login.status_code == 200 and bool(login.json().get("access_token")), login.status_code)
        token = (login.json() or {}).get("access_token") or ""
        auth = {"Authorization": f"Bearer {token}"}

        # 2) anonymous calls must stay locked
        anon = await client.get("/api/relearn/due")
        check("anonymous /due is 401", anon.status_code == 401, anon.status_code)

        # 3) seed the cards from a finished test's weak skills
        seed = await client.post("/api/relearn/seed", headers=auth, json={"weakSkills": [
            {"name": "Hình học không gian", "topic": "cosine", "accuracy": 30, "correct": 2, "total": 5},
            {"name": "Đạo hàm", "level": "medium"},
        ]})
        seed_body = seed.json() if seed.headers.get("content-type", "").startswith("application/json") else {}
        check("seed creates cards", seed.status_code == 200 and seed_body.get("created") == 2, seed_body)
        check("seed is idempotent", (await client.post("/api/relearn/seed", headers=auth, json={"weakSkills": [
            {"name": "Hình học không gian", "topic": "cosine", "accuracy": 30},
        ]})).json().get("refreshed") == 1)

        # 4) the cards are due immediately (brand-new FSRS cards)
        due = await client.get("/api/relearn/due", headers=auth)
        due_body = due.json()
        check("due list has both cards", due.status_code == 200 and due_body.get("due_count") == 2, due_body.get("due_count"))
        first = due_body["due"][0]
        check("due card carries FSRS fields", "days_until_due" in first and "interval_days" in first, list(first)[:8])

        # 5) rate it: the schedule must move
        review = await client.post("/api/relearn/review", headers=auth,
                                   json={"card_id": first["id"], "rating": "good"})
        review_body = review.json()
        check("review accepted", review.status_code == 200 and review_body.get("rating") == "good", review_body)
        check("review records a rep", review_body.get("reps") == 1, review_body.get("reps"))
        check("review returns the next due date", bool(review_body.get("next_due")), review_body)

        # 6) the reviewed card left the "due now" queue (FSRS learning step) …
        after = (await client.get("/api/relearn/due", headers=auth)).json()
        check("reviewed card leaves the due queue", after.get("due_count") == 1, after.get("due_count"))
        check("… and appears under upcoming", len(after.get("upcoming") or []) == 1, len(after.get("upcoming") or []))

        # 7) "again" must shorten the interval and count a lapse
        again = await client.post("/api/relearn/review", headers=auth,
                                  json={"card_id": after["due"][0]["id"], "rating": "again"})
        again_body = again.json()
        check("again counts a lapse", again_body.get("lapses") == 1, again_body)
        check("again reschedules soon", (again_body.get("interval_days") or 0) <= 1, again_body.get("interval_days"))

        # 8) bad input is rejected, foreign cards are not touchable
        bad = await client.post("/api/relearn/review", headers=auth, json={"rating": "good"})
        check("missing card_id → 400", bad.status_code == 400, bad.status_code)
        ghost = await client.post("/api/relearn/review", headers=auth, json={"card_id": 999999, "rating": "good"})
        check("unknown card → 404", ghost.status_code == 404, ghost.status_code)

    failed = [name for name, ok in PASS if not ok]
    print(f"\n{len(PASS) - len(failed)}/{len(PASS)} checks passed")
    if failed:
        print("FAILED:", failed)
        sys.exit(1)
    print("ALL_RELEARN_FLOW_TESTS_PASSED")


if __name__ == "__main__":
    asyncio.run(flow())
