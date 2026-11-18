# Database Guide — Sugandhika

## Overview

Sugandhika uses **Neon PostgreSQL** (free tier) with **Prisma ORM**.

- **Database:** Neon PostgreSQL (serverless, free tier)
- **ORM:** Prisma 5.x
- **Schema location:** `backend/src/prisma/schema.prisma`
- **Migrations:** `backend/src/prisma/migrations/`

---

## Initial Setup

### 1. Create Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create project: "sugandhika"
3. Create database: "sugandhika_prod"
4. Copy the **pooled connection string** (for `DATABASE_URL`)

### 2. Configure Environment

In `backend/.env`:
```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-XXXX.us-east-2.aws.neon.tech:5432/sugandhika_prod?sslmode=require
```

### 3. Push Schema to Database

```bash
# From backend/ directory:
npm run prisma:push

# Or from root:
npm run prisma:push
```

### 4. Seed Initial Data

```bash
npm run prisma:seed
```

This creates:
- 1 Super Admin user
- Default site settings
- 7 navigation items
- 6 categories
- 6 sample products
- Homepage sections
- FAQs, Gallery albums, Team members, etc.

---

## Database Models

### Content Models

| Model | Purpose |
|-------|---------|
| `SiteSetting` | Global website configuration |
| `NavigationItem` | Menu structure |
| `HomepageSection` | Homepage section order and visibility |
| `Banner` | Hero banner slides |
| `Feature` | "Why Choose Us" feature cards |
| `Page` | Static page content (About Us) |

### Product Models

| Model | Purpose |
|-------|---------|
| `Category` | Product categories |
| `Product` | Product catalog |
| `ProductImage` | Product gallery images |
| `ProductVariant` | Product variants (size, quantity) |

### Team & Gallery

| Model | Purpose |
|-------|---------|
| `TeamMember` | Team member profiles |
| `GalleryAlbum` | Photo album collections |
| `GalleryImage` | Individual gallery photos |

### Support Models

| Model | Purpose |
|-------|---------|
| `FAQ` | Frequently asked questions |
| `FAQCategory` | FAQ categories |
| `ContactInformation` | Contact details |
| `SEOSetting` | Per-page SEO metadata |

### Auth & Admin

| Model | Purpose |
|-------|---------|
| `User` | Admin user accounts |
| `AuditLog` | Record of admin actions |

---

## Migrations

For development (auto-migrate):
```bash
npm run prisma:push
```

For production (safe migration):
```bash
npm run prisma:migrate
```

### Creating a New Migration
```bash
cd backend
npx prisma migrate dev --name describe-your-change --schema=src/prisma/schema.prisma
```

---

## Prisma Studio (Database GUI)

```bash
npm run prisma:studio --prefix backend
```

Opens at http://localhost:5555

---

## Backup

Since Neon free tier doesn't include automated backups:
1. Use Neon's branch feature as a snapshot
2. Export critical data periodically via Prisma queries

---

## Free Tier Limits (Neon)

| Resource | Free Limit |
|----------|-----------|
| Storage | 512 MB |
| Branches | 10 |
| Compute hours | 191.9 hours/month |
| Connection pooling | Included |

**Manage storage:** Periodically clean `AuditLog` records older than 90 days.

---

## Common Commands

```bash
# View database in browser
npm run prisma:studio --prefix backend

# Reset and re-seed database (DESTRUCTIVE!)
# npx prisma db push --force-reset --schema=src/prisma/schema.prisma
# npm run prisma:seed --prefix backend

# Generate Prisma client after schema changes
npm run prisma:generate --prefix backend
```
