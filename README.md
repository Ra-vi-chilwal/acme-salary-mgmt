# ACME Salary Management

Web app for ACME's HR Manager to manage salary data for ~10,000
employees and answer questions about how the org pays people, instead
of doing it all in spreadsheets.

- `docs/REQUIREMENTS.md` — one-page requirements doc (read this first)
- `docs/AI_USAGE_NOTES.md` — how AI tools were used while building this
- `backend/` — Node.js + Express + SQLite API
- `frontend/` — React (Vite) UI

## Quick start

```bash
# backend
cd backend
npm install
npm run seed        # generates 10,000 employees into salary.sqlite
npm run dev          # starts API on http://localhost:4000

# frontend (separate terminal)
cd frontend
npm install
npm run dev          # starts UI on http://localhost:5173
```

## Tests

```bash
cd backend
npm test
```

## Stack

- Backend: Node.js, Express, better-sqlite3 (file-based relational DB,
  no external DB server needed — fine at 10k rows and keeps setup to
  zero infra).
- Frontend: React + Vite, Tailwind CSS, TanStack Table for the
  paginated employee grid, Recharts for the analytics charts.
- Tests: Jest + Supertest against the real Express app with an
  in-memory SQLite DB per test run.
