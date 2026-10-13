# Sugandhika Django API (migration scaffold)

This backend is being introduced alongside the existing Next.js storefront. It is **not yet wired into the live storefront** and does not replace the current production database.

## Requirements
- Python 3.11+
- PostgreSQL for production; SQLite is configured as a local development default.

## Run locally
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Windows; on macOS/Linux use cp
python manage.py makemigrations catalog
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API base URL: `http://127.0.0.1:8000/api/`
- `health/` — service health
- `catalog/summary/` — public counts
- `categories/` — category list/detail
- `products/` — product list/detail by slug; supports search, ordering, category and featured filters

Public users can read active catalog entries. Only authenticated Django staff/superusers can create, update, or delete catalog records. Use a strong owner password and keep `DJANGO_SECRET_KEY` private.

## Migration status
This is the first migration slice: environment, Django/DRF setup, and catalog models/endpoints. Orders, customer auth, payments/Fonepay verification, coupons, website content, media storage, custom owner dashboard, data import, and production deployment are not implemented yet. Do not point the live storefront at this API until the remaining flows and data migration have been tested.
