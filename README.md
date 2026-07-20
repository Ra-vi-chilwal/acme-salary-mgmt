# ACME Salary Management

So you're tired of managing 10,000 employee salaries in Excel, that's messy.

This is a web app where HR managers can actually *manage* employee salary data and quickly answer questions like:
- "What's our average salary by department?"
- "Who are our top-paid employees?"
- "How much are we paying in India vs the US?"

Instead of digging through endless spreadsheets, you get a clean dashboard with charts and a searchable employee directory.

## How to run it locally

Pretty straightforward:

```bash
# Terminal 1: Start the backend
cd backend
npm install
npm run seed        # creates 10,000 fake employees (takes ~5 seconds)
npm run dev         # runs the API on http://localhost:4000

# Terminal 2: Start the frontend
cd frontend
npm install
npm run dev         # runs the website on http://localhost:5173
```

Open your browser to **http://localhost:5173** and you're done. Search employees, click on one, update their salary, check out the dashboard charts.

## Run the tests

```bash
cd backend
npm test
```

18 tests, all should pass. Takes about a second.

## What's inside

**Backend:**
- Node.js + Express — simple HTTP API
- SQLite database — just a file, no separate database server to run
- Seed script — generates 10,000 realistic employees

**Frontend:**
- React + Vite — fast dev experience
- Tailwind CSS — styling (looks clean, nothing fancy)
- Recharts — charts for the analytics dashboard

**Tests:**
- Jest + Supertest — tests run against the real API with an in-memory database

## How the data is stored

This is the important part you asked about.

### NOT JSON — it's a relational database

We're using **SQLite**, which is a proper relational database (like MySQL or PostgreSQL, but file-based).

The entire database lives in **one file**: `backend/salary.sqlite`

### The two main tables

**employees table:**
