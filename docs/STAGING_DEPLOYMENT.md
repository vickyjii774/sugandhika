# Sugandhika Django staging deployment

This guide prepares an **isolated staging backend**. It does not deploy or switch production traffic. The committed render.yaml Blueprint uses free-tier resources for a temporary smoke test only. Render free Postgres expires after 30 days and has no backups; use a paid staging database with backups before importing any real customer/order data or relying on staging for an extended period. Do not use production customer data until an approved, encrypted staging data-handling plan and access restrictions are in place.

## 1. Hosting resources

Create a separate staging web service and a separate managed PostgreSQL database in Render. Keep them separate from the current Next.js/Vercel production storefront and production database.

The Blueprint builds from the repository root using:

- Dockerfile path: backend/Dockerfile
- Health-check path: /api/health/
- Region: Singapore
- Branch: feat/django-backend-migration
- Auto-deploy: disabled until explicitly enabled
- Web service: sugandhika-django-staging
- Database: sugandhika-staging-db

The image installs dependencies, collects static assets, and runs Gunicorn as a non-root user. The startup command runs Django migrations against the staging database before starting Gunicorn. The Blueprint sets an empty database IP allow list. Do not expose the database publicly.

## 2. Staging-only environment variables

The Blueprint generates a unique DJANGO_SECRET_KEY and sets:

- DJANGO_DEBUG=false
- DJANGO_ALLOWED_HOSTS=sugandhika-django-staging.onrender.com
- DJANGO_SECURE_SSL_REDIRECT=true
- DATABASE_URL from the separate staging database
- CSRF_TRUSTED_ORIGINS to the staging backend HTTPS origin
- CORS_ALLOWED_ORIGINS to localhost until a separate staging storefront origin is available

For initial owner creation, Render prompts for these three secret inputs:

- DJANGO_OWNER_BOOTSTRAP_USERNAME
- DJANGO_OWNER_BOOTSTRAP_EMAIL
- DJANGO_OWNER_BOOTSTRAP_PASSWORD

Use a staging-only username/email and a unique password of at least 14 characters. The initial deploy hook runs bootstrap_owner; it refuses to elevate an existing non-superuser account. After confirming the owner can sign in, **remove all three bootstrap environment variables from the Render service immediately**. Never reuse production credentials or put secrets in Git, build arguments, or logs.

## 3. Create the Render Blueprint

1. Open the [Render Blueprint dashboard](https://dashboard.render.com/blueprints) and choose **New Blueprint Instance**.
2. Connect the GitHub repository vickyjii774/sugandhika, select branch feat/django-backend-migration, and use the repository-root render.yaml.
3. Review the resources and plans before confirming. The committed plan is free for temporary testing only; do not import real customer data into the free database.
4. Enter the three bootstrap values when prompted. These values are used only to create the initial staging owner.
5. Confirm the resources are exactly sugandhika-django-staging and sugandhika-staging-db. Do not modify or replace any production resources.
6. Wait for the deploy and bootstrap hook to finish. Verify /api/health/ returns HTTP 200, sign in at /owner/login/, and remove the three bootstrap variables.

The repository contains the Blueprint and startup configuration, but GitHub commits do not create Render resources. Provisioning must be confirmed through the connected Render account. No production environment variables or traffic are changed by this process.

## 4. Verify the deployment

Verify all of the following against the staging service:

1. Anonymous visitors can read active catalog data but cannot write products or access owner-only endpoints.
2. Normal customer accounts and staff-only accounts are denied access to owner pages and APIs.
3. The owner superuser can sign in, manage staging records, sign out, and view audit activity.
4. HTTPS redirects, CSRF protection, static assets, allowed hosts, and origins work correctly.
5. The staging database is separate from production and contains no unintended production data.

Run python manage.py check --deploy in an available secure environment configured with staging-like settings. The free web service can spin down after inactivity and has no shell access, so use CI or an appropriately secured paid staging service for tasks requiring a console.

## 5. Import a source snapshot safely

Follow [the data export/import steps](DJANGO_FRONTEND_CUTOVER.md#prepare-and-import-a-staging-data-snapshot). Export only from an authorized environment. The JSON contains customer contact details, addresses, and order history: encrypt it in transit and at rest, restrict access, delete temporary copies when reconciliation is complete, and never commit it to GitHub or upload it to a public build artifact.

Use synthetic data for the free-tier smoke test. Before importing real customer/order data, upgrade to a suitable paid staging database with backups and access restrictions. Run the import dry-run first, take a staging backup, then import and reconcile record counts, order totals, product stock, coupon validity, and payment states.

## 6. Blockers before frontend cutover

The existing Next.js storefront and checkout still use Prisma. A successful Django deploy is **not** permission to point the live storefront at it. Do not change production environment variables, DNS, traffic routing, or merge as a cutover until all of the following are implemented and tested end to end:

- canonical IDs and relationships across catalog, carts, orders, and order items;
- customer login and secure password reset;
- transactional checkout, server-side price/coupon validation, inventory locking/reservation and restoration;
- payment records and Fonepay verification/refund handling;
- durable media/object storage and image URL compatibility;
- customer profile/address, cart and wishlist behavior as required by the current storefront;
- reconciliation of existing data and successful staging checkout/order-history tests;
- a tested rollback plan and explicit owner approval.

## 7. Deployment status

This guide and render.yaml prepare a separate staging deployment. They do not create hosting resources, access Render credentials, run a real database migration, or alter production. Complete the Blueprint creation through the connected Render account and verify the service before proceeding.
