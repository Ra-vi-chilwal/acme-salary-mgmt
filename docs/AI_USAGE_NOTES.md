# How AI tools were used

I used Claude as the agentic build tool for this exercise — planning
the structure, writing code, running it, and fixing what broke,
rather than hand-typing every file.

## Approach
1. Wrote the one-pager (`REQUIREMENTS.md`) first, including the
   "deliberately out of scope" section, before any code — so the scope
   decisions were made deliberately, not as a byproduct of running out
   of time.
2. Built backend-first, bottom-up: DB schema → model layer (plain
   functions over `better-sqlite3`, easy to unit test without spinning
   up HTTP) → routes → seed script → tests, committing after each
   working slice.
3. Ran the seed script against the real 10,000-row target early
   (not at the end) to catch scale issues before building the UI on
   top of it.
4. Wrote the salary-history logic so every salary write goes through
   one function that always inserts a history row inside a DB
   transaction — the point being it's structurally impossible to
   change a salary without leaving an audit trail, not just a
   convention I have to remember to follow in every call site.
5. Frontend last, wired directly against the real API (not mocked).

## Where AI output was corrected, not just accepted
- The salary-history test initially failed: two updates made in the
  same test run landed in the same SQLite `datetime('now')` second, so
  `ORDER BY changed_at DESC` didn't reliably return the most recent
  change first. Fixed by ordering on the autoincrement `id` instead,
  which is the actual insertion order — `changed_at` is kept for
  display, not for ordering.
- Dropped an initial instinct to convert everything to a single USD
  total on the dashboard — that requires FX rates and a real decision
  about which date's rate to use, which is exactly the kind of scope
  creep the requirements doc says to avoid. Analytics are grouped by
  currency instead.

## What I'd verify further with more time
- Load-test the `/api/employees` search endpoint past 10k rows (it's
  a `LIKE` scan today, no full-text index) if the org ever grows past
  ~50-100k employees.
- Add optimistic concurrency (e.g. a version column) to salary updates
  so two HR users editing the same employee at once don't silently
  clobber each other.
