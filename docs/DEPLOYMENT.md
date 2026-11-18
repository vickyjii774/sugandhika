# Deployment Guide — Sugandhika

## Overview

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | Vercel Hobby | React + Vite SPA |
| Backend | Render Free | Node.js + Express API |
| Database | Neon PostgreSQL | Data storage |
| Media | Supabase Storage | Image files |
| Repo | GitHub | Version control |

---

## 1. Neon PostgreSQL Setup (Free Tier)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project: "sugandhika"
3. Create database: "sugandhika_prod"
4. Copy the connection string (pooled) for `DATABASE_URL`
5. Copy the direct connection string for migrations

> **Free tier:** 512MB storage, 1 database, 1 branch

---

## 2. Supabase Storage Setup (Free Tier)

1. Sign up at [supabase.com](https://supabase.com)
2. Create project: "sugandhika"
3. Go to Storage → Create bucket: `sugandhika-media`
4. Set bucket to **Public** (so images are publicly accessible)
5. Go to Settings → API → Copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep private!)

> **Free tier:** 1GB storage, 2GB transfer/month

---

## 3. Backend Deployment (Render Free)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name:** sugandhika-backend
   - **Root directory:** `backend`
   - **Runtime:** Node
   - **Build command:** `npm install && npx prisma generate --schema=src/prisma/schema.prisma`
   - **Start command:** `npm start`
   - **Plan:** Free
4. Add environment variables:
   ```
   PORT=10000
   NODE_ENV=production
   DATABASE_URL=<your-neon-pooled-url>
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   JWT_SECRET=<strong-random-secret>
   JWT_EXPIRES_IN=7d
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   SUPABASE_STORAGE_BUCKET=sugandhika-media
   ```
5. Deploy

> **Note:** Render free services sleep after 15 min of inactivity. First request after sleep takes ~30 seconds.

### Run Database Migrations (after first deploy)
In Render Shell or locally:
```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
node src/prisma/seed.js
```

---

## 4. Frontend Deployment (Vercel)

1. Go to your existing Vercel project
2. Update settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework Preset:** Vite
3. Add environment variables:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com/api
   ```
4. Add `frontend/public/_redirects` or Vercel rewrites for SPA routing:
   - Vercel automatically handles SPA routing via `vercel.json`
5. Redeploy

---

## 5. First-Time Admin Setup

After deployment, create the first super admin:
```bash
# In backend directory, with correct DATABASE_URL set:
node src/prisma/seed.js
```

Default credentials:
- Email: `admin@sugandhika.com`
- Password: `Admin@1234`

**Change this password immediately after first login!**

---

## 6. Vercel SPA Routing

Create `frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 7. Health Check

Backend health check endpoint:
```
GET https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Sugandhika API is running",
  "timestamp": "...",
  "environment": "production"
}
```

---

## 8. Free Tier Limits

| Service | Limit | Action if exceeded |
|---------|-------|-------------------|
| Neon | 512MB DB | Archive old audit logs |
| Supabase | 1GB Storage | Compress images before upload |
| Render | 750 hrs/month | Stays within free if single service |
| Vercel | 100GB bandwidth | Well within limits for small business |
