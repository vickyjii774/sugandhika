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

Install the frontend and backend dependencies:

```bash
npm run install:all
```

Configure the backend:

```bash
cp backend/.env.example backend/.env
```

Set at least `DATABASE_URL` and a strong `JWT_SECRET` in `backend/.env`. Configure the frontend API URL in `frontend/.env` using the provided `frontend/.env.example`.

Set up the database and seed the initial content:

```bash
npm run prisma:generate --prefix backend
npm run prisma:push
npm run prisma:seed
```

Start both applications:

```bash
npm run dev
```

- Frontend: http://localhost:3000
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
| Media | Current configured storage provider |
| Frontend hosting | Vercel or another static host |
| Backend hosting | Render or another Node.js host |

## Useful commands

```bash
npm run install:all
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run prisma:generate --prefix backend
npm run prisma:push
npm run prisma:seed
npm run prisma:migrate
```

See the `docs/` directory for the admin, database, and deployment guides.

---

Made with 💚 for Sugandhika, Nepal.
