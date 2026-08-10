# Sugandhika - Pure Eco-Friendly Fragrance & Organic Mosquito Solutions

Sugandhika is a production-ready, full-stack e-commerce application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **SQLite**, and **Auth.js / NextAuth**.

## Key Features

### Storefront
- **Home Page**: Hero banner carousel, category grid, featured products, brand story, testimonials, and FAQ accordion.
- **Shop Catalog**: Full search, category filter, price range bounds, sorting, pagination, and active filter chips.
- **Product Details Page**: Multi-image preview, rating summary, quantity selector, stock availability, add to cart, wishlist toggle, customer reviews section, and related products carousel.
- **Cart & Wishlist**: LocalStorage sync, drawer view, cart page with subtotal and free shipping thresholds.
- **Checkout & Fonepay QR**: Supports Cash On Delivery (COD) and Fonepay QR payment scan with Transaction ID input & payment screenshot receipt upload.
- **Customer Dashboard**: Track order history, address book management, and user profile updates.

### Admin Dashboard (`/admin`)
- **Metrics Overview**: Real-time sales statistics, pending Fonepay payment counts, and Recharts monthly revenue chart.
- **Products CRUD**: Add/Edit product details, price, compare price, inventory stock, images, and category assignments.
- **Categories CRUD**: Manage store product lines.
- **Orders & Payments**: Verify Fonepay transaction ID & receipt screenshot, approve/reject payment verification, and update order fulfillment status.
- **Coupons Management**: Create percentage or fixed discount promo codes.
- **Store Settings**: Upload official Fonepay Merchant QR Code image, update store contact info, and set free shipping thresholds.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router with Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Eco Luxury Theme (`#7CB342`, `#2E7D32`)
- **Database**: SQLite with Prisma ORM (20 Models & Relations)
- **Authentication**: Auth.js / NextAuth credentials provider & JWT sessions
- **Charts**: Recharts
- **Notifications**: Sonner

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Check `.env` for database and NextAuth configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sugandhika-secret-key-production-ready-eco-luxury-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Migration & Seed
```bash
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Credentials
- **Admin**: `admin@sugandhika.com` / `admin123`
- **Customer**: `customer@sugandhika.com` / `user123`
