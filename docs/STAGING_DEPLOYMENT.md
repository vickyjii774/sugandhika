# Sugandhika Django staging deployment

This guide prepares an **isolated staging backend**. It does not deploy or switch production traffic. Do not use production customer data until an approved, encrypted staging data-handling plan and access restrictions are in place.

## 1. Hosting resources

Create a separate staging web service and a separate managed PostgreSQL database in your chosen hosting provider. Keep them separate from the current Next.js/Vercel production storefront and production database.

Build the service from the repository root using:

- Dockerfile path: `backend/Dockerfile`
- Health-check path: `/api/health/`
- Port: `8000` (or the platform-provided `PORT` if the platform requires it; configure the start command to bind to that port when necessary).

The image installs dependencies, collects static assets, and runs Gunicorn as a non-root user. Do not expose the database publicly; allow connections only from the staging application where the provider supports private networking.

## 2. Staging-only environment variables

Set these through the hosting provider's encrypted environment-variable UI, never in Git or chat:

- `DJANGO_SECRET_KEY`: a unique, randomly generated secret, different from development and production.
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS`: the exact staging backend hostname, without scheme or path.
- `DATABASE_URL`: the staging PostgreSQL connection string, not production.
- `CORS_ALLOWED_ORIGINS`: the exact staging storefront origin(s), including `https://`.
- `CSRF_TRUSTED_ORIGINS`: exact HTTPS origin(s) used for owner dashboard form posts.
- `DJANGO_SECURE_SSL_REDIRECT=true` only when the host correctly terminates HTTPS and forwards the original scheme; otherwise configure secure proxy handling with the host's documented setting first.

Do not copy production secrets into staging. Do not set `DJANGO_OWNER_DASHBOARD_URL` on the production Vercel project. Only consider that variable in a preview deployment after the Django owner dashboard is verified.

## 3. Build, migrate, and verify

Use the platform's one-off/release command feature, if available, to run the following against the **staging database only**:

```bash
python manage.py check --deploy
python manage.py migrate --noinput
python manage.py createsuperuser
```

Run `createsuperuser` interactively or through the provider's secure console; never put owner credentials in repository files, build arguments, or logs. If the host does not provide a secure interactive console, use its documented secure admin bootstrap process.

Configure the service health check to request `/api/health/`. Confirm it returns HTTP 200. Then verify:

1. Anonymous visitors can read active catalog data, but cannot write products or access owner-only endpoints.
2. A normal customer account and a staff-only account are both denied access to owner pages and APIs.
3. The owner superuser can sign in at `/owner/login/`, manage staging records, sign out, and see audit activity.
4. CSRF protection, HTTPS, static assets, and allowed-host/origin settings work correctly.
5. The staging database is not empty or mistaken for production; take a fresh staging backup before importing any snapshot.

## 4. Import a source snapshot safely

Follow [the data export/import steps](DJANGO_FRONTEND_CUTOVER.md#prepare-and-import-a-staging-data-snapshot). Export only from an authorized environment. The JSON contains customer contact details, addresses, and order history: encrypt it in transit and at rest, restrict access, delete temporary copies when reconciliation is complete, and never commit it to GitHub or upload it to a public build artifact.

Start with a synthetic dataset if possible. If a real snapshot is needed, use an access-restricted staging database and follow applicable privacy requirements. Run the import dry-run first, take a staging backup, then import and reconcile record counts, order totals, product stock, coupon validity, and payment states.

## 5. Blockers before frontend cutover

The existing Next.js storefront and checkout still use Prisma. A successful Django deploy is **not** permission to point the live storefront at it. Do not change production environment variables, DNS, traffic routing, or merge as a cutover until all of the following are implemented and tested end to end:

- canonical IDs and relationships across catalog, carts, orders, and order items;
- customer login and secure password reset;
- transactional checkout, server-side price/coupon validation, inventory locking/reservation and restoration;
- payment records and Fonepay verification/refund handling;
- durable media/object storage and image URL compatibility;
- customer profile/address, cart and wishlist behavior as required by the current storefront;
- reconciliation of existing data and successful staging checkout/order-history tests;
- a tested rollback plan and explicit owner approval.

## 6. Deployment status

This repository change only adds the container and instructions. It does not create hosting resources, access provider credentials, run a real database migration, or alter production. The actual staging deployment must be initiated in the hosting account and verified against its staging database.
