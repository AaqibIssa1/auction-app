# Interview Guide — Auctions Exercise

The exercise is 1–2 hours. Candidates have access to any resources they want, including AI. Task 0 is mandatory for everyone. From there, assign 1–2 tasks based on the candidate's background. The goal is to see what decisions they make and how they explain them in the follow-up code review.

---

## Sending the Project

Save the script below locally and run it from the repo root to generate the candidate zip:

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CANDIDATE_FOLDER_NAME="auction-app"
OUTPUT_ZIP="${1:-auction-app.zip}"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

rsync -a \
  --filter=':- .gitignore' \
  --exclude='.git' \
  --exclude='.devcontainer' \
  --exclude='tasks' \
  --exclude='.claude' \
  "$REPO_DIR/" "$WORK_DIR/$CANDIDATE_FOLDER_NAME/"

(cd "$WORK_DIR" && zip -r "$OLDPWD/$OUTPUT_ZIP" "$CANDIDATE_FOLDER_NAME")

echo "Created: $OUTPUT_ZIP"
```

This creates `auction-app.zip` with the project inside a folder named `auction-app`. Send the zip to the candidate before the session.

---

## Task 0 — Everyone

**0 — Fix the Bid Bug** *(~15 min)*
Watch how they approach an unfamiliar codebase — do they read broadly before touching anything, or jump straight to searching? The fix is trivial; how they find it is the signal.

---

## Recommended Paths

### Junior

Assign 1 task, or 2 if the session is closer to 2 hours. Success looks like clean, working code with sensible choices, even if straightforward.

**1 — Create a Listing** | Fullstack | *30–45 min*
- A basic form and endpoint are already scaffolded with just a title field — the candidate extends them.
- Which fields do they choose to add, and do they justify what they leave out?
- Do they know what the server should own vs. what the client sends (`id`, `currentBid`)?
- How do they reflect the new listing in the UI?
- *Pairs with task 2 in a 2-hour session — together they cover the full read/write cycle.*

**2 — Search and Filter** | Fullstack | *30–45 min*
- Do they filter on the server or on already-loaded client data? If the latter, do they know why it matters?
- How do they manage query state in the UI?
- *Pairs with task 1 — listings created in task 1 give them something concrete to search for.*

**3 — Bid History** | Backend | *20–35 min*
- How do they structure and relate bids to listings?
- Do they treat a listing with no bids differently from a listing that doesn't exist?
- *Good standalone task for a junior backend candidate.*

---

### Mid-Level

Assign 1–2 tasks. Look for thoughtful design decisions and awareness of edge cases.

**3 — Bid History** | Backend | *20–35 min*
- Do they anticipate query patterns or think about what happens under high bid volume?
- How do they model the relationship between bids and listings?
- *Short enough to pair with task 4 in a 2-hour session.*

**4 — Pagination** | Backend | *30–45 min*
- Do they notice the breaking change to the response shape and reason about its impact on existing consumers?
- Do they mention versioning or backward compatibility unprompted?
- *Works standalone or after task 3.*

**5 — Auction Countdown** | Fullstack | *35–50 min*
- Do they clean up timers on unmount, or will intervals accumulate?
- Do they rely solely on the client clock, or treat the server's `endsAt` as the source of truth?
- Do they adjust the format based on how much time is left?
- *Good standalone fullstack task for a mid-level session.*

**6 — Auction Expiry** | Backend | *40–60 min*
- Can they explain why their approach is non-blocking in the language they chose?
- Do they identify the race condition between expiry and an in-flight bid?
- *Best as the sole task for a mid-level backend candidate, or an entry point for a senior session.*

---

### Senior

Assign 1 task. Depth matters more than volume — a senior candidate should be able to fill the session on a single well-chosen task.

**6 — Auction Expiry** | Backend | *40–60 min*
- Do they identify the race condition unprompted and have an opinion on how to address it?
- Does their solution introduce unnecessary serialization, or do they scope it correctly?
- *Good entry point if you want something more concrete before the code review discussion.*

**7 — Leaderboard** | Backend | *45–60 min*
- How do they decide when to invalidate the cache — on every bid, on a timer, lazily?
- Can they articulate the tradeoffs of their approach?
- *Good standalone task with a lot of design surface to explore in review.*

**8 — Real-Time Bidding** | Fullstack | *60–90 min*
- Can they articulate why they chose their protocol (SSE vs. WebSockets)?
- Do they handle disconnections cleanly, or do connections leak?
- Where do they put the connection logic on the frontend, and why?
- What happens when an incoming update races with a bid the user is currently submitting?
- *Best suited for a 2-hour session. Assign on its own — it fills the time.*

**9 — Concurrency Safety** | Backend | *50–90 min*
- Do they recognize the problem class immediately or need to reason their way there?
- Is the fix scoped correctly, or does it serialize too broadly?
- Do they understand how the problem differs between Node.js and Python's async model?
- *Best suited for a 2-hour session. Assign on its own — the review alone warrants the full time.*

---

## By Track

If the role is **backend-focused**, lean toward tasks 3, 4, 6, 7, and 9.

If the role is **fullstack**, lean toward tasks 1, 2, 5, and 8.

---

## Code Review Notes

Things worth asking regardless of task:
- Why did you structure it this way?
- What would break first if this went to production?
- What would you do differently with more time?
