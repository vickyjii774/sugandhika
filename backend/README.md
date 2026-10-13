# Sugandhika Django API (migration in progress)

The Django API is being introduced alongside the current Next.js storefront. It is **not connected to the live storefront** and does not replace or migrate the production database. Keep production on the current application until the migration checklist is complete and tested.

## Requirements
- Python 3.11+
- PostgreSQL for production; SQLite is the local development default.

## Run locally
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations catalog
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Set a strong unique `DJANGO_SECRET_KEY` in the local environment. Create the owner with `createsuperuser`; owner endpoints only allow Django staff/superusers. Do not use demo credentials or commit secrets.

## Endpoints
Base URL: `http://127.0.0.1:8000/api/`

- `health/` — service health
- `auth/token/`, `auth/token/refresh/` — JWT login/refresh (Django username/password)
- `catalog/summary/` — public catalog counts
- `categories/`, `products/` — public active catalog read; authenticated owner/staff writes
- `banners/`, `faqs/`, `testimonials/` — public active content; owner/staff management
- `store-settings/` — public read; owner/staff updates
- `contact-messages/` — public submit; owner/staff list and mark read
- `newsletter-subscribers/` — public subscribe; owner/staff list/manage
- `owner/dashboard/` — owner-only operational metrics and recent orders
- `orders/` — owner-only order management and search
- `orders/{id}/update-status/` — owner-only fulfilment status change
- `orders/{id}/verify-payment/` — owner-only Fonepay verification/rejection/refund status action
- `customers/` — owner-only customer directory (limited profile fields and order counts)
- `coupons/` — owner-only promotions
- `audit-logs/` — owner-only audit history

For endpoints that use numeric IDs, use the ID returned by the API. Product details use the product slug.

## Current scope and limitations
This branch contains Django configuration, catalog models/API, order/payment metadata models, owner-only business APIs, content/settings endpoints, audit logging, and starter permission tests. It still needs local validation and additional work:
- Create and review generated migrations; run Django checks and automated tests.
- Add safe checkout/order creation with server-side price/stock validation and inventory transactions.
- Connect the existing storefront and owner dashboard to Django instead of Prisma/NextAuth.
- Complete media upload/storage, customer authentication/profile endpoints, order history, return workflow, email/notification handling, reporting charts, and Fonepay reconciliation.
- Import existing production data safely and verify record counts and relationships.
- Configure production secrets, database, CORS/CSRF, HTTPS, backups, monitoring, and deployment.
- Test the entire customer and owner workflows in staging before production cutover.

Do not deploy this API as the production source of truth yet. Once cut over, avoid running Prisma and Django as independent writers for orders or stock.
