# Deployment Guide

## Quick local dev (Docker Compose)

```bash
docker-compose up
# Backend: http://localhost:4000/api
# Frontend: http://localhost:5173
```

Both services reload on file changes.

---

## Production deployment

### Option 1: Docker (AWS ECS, Render, Railway, etc.)

#### Backend
```bash
cd backend
docker build -t acme-salary-backend .
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  acme-salary-backend
```

The Dockerfile will auto-seed the DB on first boot if it doesn't exist.

#### Frontend
```bash
cd frontend
docker build -t acme-salary-frontend .
docker run -p 80:80 \
  -e VITE_API_URL=https://api.example.com \
  acme-salary-frontend
```

### Option 2: Backend on Railway / Render / Fly.io

1. Create a new project, connect your GitHub repo
2. Set root directory to `backend/`
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=4000
   ```
4. Deploy

The app will auto-seed 10,000 employees on first boot.

### Option 3: Frontend on Vercel

1. Fork this repo to your GitHub account
2. In Vercel dashboard: New Project → Import Git repo
3. Set root directory to `frontend/`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
5. Deploy

---

## Database persistence

The SQLite DB is stored at `backend/salary.sqlite` by default.

**For production, you should:**
- Mount a persistent volume to `/app` on the backend container
- Or back up salary.sqlite to cloud storage on a cron schedule
- Or migrate to PostgreSQL (10k rows is well within SQLite's comfort zone,
  but if you scale past that or want formal backups, it's worth the switch)

---

## Environment variables

### Backend
- `NODE_ENV` — 'development' or 'production'
- `PORT` — API listen port (default: 4000)
- `DB_PATH` — path to salary.sqlite (default: ./salary.sqlite)
- `SEED_COUNT` — rows to seed on first run (default: 10000)

### Frontend
- `VITE_API_URL` — backend API base URL (e.g. https://api.example.com/api)

---

## Health checks

Backend exposes `/api/health` for load balancers:
```bash
curl http://localhost:4000/api/health
# {"ok":true}
```

---

## Monitoring / Logging

- Backend logs go to stdout (format: plain text)
- Frontend errors appear in browser console
- On Render/Railway/Fly, logs are captured in their dashboards

For production, consider:
- Adding structured JSON logging to the backend (e.g. `pino`)
- Setting up Sentry for error tracking
- Using APM (e.g. New Relic) for request tracing
