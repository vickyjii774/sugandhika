# 🌿 Sugandhika — Pure Eco Fragrance

> Natural, premium, and eco-friendly herbal fragrance products from Nepal.

## Project structure

```
sugandhika/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + Prisma
├── docs/              # Project and deployment documentation
├── _legacy/           # Archived legacy application files
└── package.json       # Root monorepo scripts
```

## Requirements

- Node.js 20 or newer
- npm 9 or newer
- PostgreSQL database

## Quick start

Install frontend and backend dependencies:

```bash
npm run install:all
```

Configure the backend and frontend:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set a real PostgreSQL `DATABASE_URL`, a strong `JWT_SECRET`, and your Cloudinary credentials in `backend/.env`. Never commit that file. Cloudinary is used for product, gallery, banner, team and page image uploads; image URLs and public IDs are stored in PostgreSQL.

Then run:

```bash
npm run prisma:generate --prefix backend
npm run prisma:push
npm run prisma:seed
npm run dev
```

- Frontend: http://localhost:3000 (Vite may use 3001 if 3000 is occupied)
- Backend API: http://localhost:5000/api
- Admin dashboard: http://localhost:3000/admin

## Technology

| Layer | Technology |
|---|---|
| Frontend | React + Vite + React Router |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Authentication | JWT + bcrypt |
| Image storage | Cloudinary |
| Frontend hosting | Vercel or another static host |
| Backend hosting | Render or another Node.js host |

See `docs/DEPLOYMENT.md` for deployment instructions.
