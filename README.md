# 🌿 Sugandhika — Pure Eco Fragrance

> Natural, premium, and eco-friendly herbal fragrance products from the heart of Nepal.

---

## 📦 Project Structure

```
sugandhika/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + Prisma
├── docs/              # Documentation
├── _legacy/           # Archived legacy code (Next.js + Django)
└── package.json       # Root monorepo scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Neon PostgreSQL URL, Supabase keys, JWT secret

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your backend URL
```

### 3. Set Up Database
```bash
# Push schema to Neon PostgreSQL
npm run prisma:push

# Seed with initial data
npm run prisma:seed
```

### 4. Start Development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Admin: http://localhost:5173/admin

---

## 🔑 Default Admin Credentials

After seeding the database:
- **Email:** admin@sugandhika.com
- **Password:** Admin@1234

> ⚠️ **Change this password immediately after first login!**

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + React Router |
| Styling | Tailwind CSS + Lucide React |
| Backend | Node.js + Express.js |
| Database | Neon PostgreSQL + Prisma ORM |
| Image Storage | Supabase Storage |
| Auth | JWT + bcrypt |
| Frontend Hosting | Vercel Hobby |
| Backend Hosting | Render Free |

## 📂 Available Scripts

```bash
npm run install:all    # Install all dependencies
npm run dev            # Run frontend + backend together
npm run dev:frontend   # Frontend only (port 5173)
npm run dev:backend    # Backend only (port 5000)
npm run build          # Build frontend for production
npm run prisma:push    # Sync schema to database
npm run prisma:seed    # Seed database with initial data
npm run prisma:migrate # Run migrations in production
```

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Database Guide](docs/DATABASE.md)
- [Admin Guide](docs/ADMIN_GUIDE.md)

## 💰 Hosting Cost

**Target: NPR 0/month**

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | Free |
| Render | Free | Free |
| Neon PostgreSQL | Free | Free |
| Supabase Storage | Free | Free |
| GitHub | Free | Free |

---

Made with 💚 for Sugandhika, Nepal
