# How to Start Backend and Frontend

## 1. Start Backend (Terminal 1)

```bash
cd /Users/danjorge/projects/personal/dropship-hub
pnpm run start:dev
```

Wait for the message: `Nest application successfully started`

## 2. Start Frontend (Terminal 2)

```bash
cd /Users/danjorge/projects/personal/dropship-hub/web
pnpm dev
```

Wait for the message showing the frontend is running on `http://localhost:3001`

## 3. Access the Application

Open your browser and go to: **http://localhost:3001**

---

## Troubleshooting

### Port Already in Use

If you get "EADDRINUSE" error:

```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000,3001 | xargs kill -9
```

Or use your helper script:
```bash
cd /Users/danjorge/projects/personal
sh Helper-kill-dropship-hub.sh
```

### 429 Too Many Requests

This means:
- Backend is not running on port 3000, OR
- Too many API requests in short time

**Solution**: Make sure backend is running first, then start frontend.

### Backend Not Starting

Check if Redis is required:
```bash
# If using Redis for jobs
redis-server
```

---

## Current Setup

- **Backend**: http://localhost:3000 (NestJS API)
- **Frontend**: http://localhost:3001 (React + Vite)
- **Proxy**: Frontend `/api/*` → Backend `http://localhost:3000/*`

The frontend automatically proxies all `/api` requests to the backend on port 3000.
