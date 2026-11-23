# Deployment Guide — Sugandhika

## Architecture

| Service | Provider | Purpose |
|---|---|---|
| Frontend | Vercel | React + Vite SPA |
| Backend | Render | Node.js + Express API |
| Database | Neon PostgreSQL | Application data |
| Image storage | Cloudinary | Product, gallery and CMS images |
| Source control | GitHub | Repository |

## 1. PostgreSQL database

1. Create a PostgreSQL database with Neon or another PostgreSQL provider.
2. Copy its connection string.
3. Set it as `DATABASE_URL` in the backend environment.
4. Use a connection string with SSL enabled for hosted environments.

## 2. Cloudinary image storage

1. Create an account at [cloudinary.com](https://cloudinary.com/).
2. Open the Cloudinary dashboard.
3. Copy the Cloud name, API Key and API Secret.
4. Add these backend environment variables:

```
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

Keep the API Secret private. Do not put Cloudinary credentials in frontend variables or commit them to Git. The backend uploads images to Cloudinary and stores each secure image URL and public ID in PostgreSQL.

## 3. Backend deployment (Render)

1. Create a Web Service in [Render](https://render.com/) and connect this repository.
2. Set **Root Directory** to `backend`.
3. Set **Runtime** to Node.
4. Set **Build Command** to:

```bash
npm install && npx prisma generate --schema=src/prisma/schema.prisma
```

5. Set **Start Command** to `npm start`.
6. Add these environment variables:

```
NODE_ENV=production
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CORS_ORIGIN=https://your-frontend-domain.vercel.app
MAX_FILE_SIZE_MB=10
```

Render provides the service port through `PORT`; do not hardcode it.

After deployment, run Prisma migrations (or the project's approved database setup command) against the production database:

```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

If this repository is using `prisma db push` rather than committed migrations for the initial setup, run `npx prisma db push --schema=src/prisma/schema.prisma` once instead.

## 4. Frontend deployment (Vercel)

1. Import the GitHub repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Select Vite.
4. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add:

```
VITE_API_URL=https://your-render-service.onrender.com/api
```

6. Deploy and ensure the backend `CORS_ORIGIN` exactly matches the deployed frontend origin.

## 5. Local development

Copy `backend/.env.example` to `backend/.env`, then fill in the database, JWT and Cloudinary values. Configure `frontend/.env` using `frontend/.env.example`.

```bash
npm run install:all
npm run prisma:generate --prefix backend
npm run prisma:push
npm run dev
```

The frontend runs on port 3000 (or 3001 if 3000 is already occupied); the API runs on port 5000.

## 6. Health check

```
GET https://your-backend-domain/api/health
```

## 7. Security and operational notes

- Never commit `backend/.env` or expose database, JWT or Cloudinary secrets in frontend variables.
- Change any seeded/default admin password immediately.
- Use HTTPS for deployed frontend and backend.
- Confirm provider free-tier quotas and commercial-use terms before relying on them for a live business.
