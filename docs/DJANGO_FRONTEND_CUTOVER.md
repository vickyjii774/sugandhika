# Django frontend cutover (staging only)

The Django API and owner dashboard are being introduced without changing live traffic. The Next.js storefront currently reads and writes Prisma data; do not point product reads at Django until the product IDs, cart, checkout, order creation, customer identity, coupons, and inventory reservation are migrated together. A partial catalog-only switch can make cart and checkout fail or reference different products.

## Owner dashboard handoff

After the Django backend is deployed to a staging host, configure the following **server-side Vercel environment variable** for a preview/staging deployment only:

```env
DJANGO_OWNER_DASHBOARD_URL=https://your-django-host.example/owner/login/
```

Use the actual HTTPS URL of the Django owner login page. This value is intentionally not prefixed with `NEXT_PUBLIC_`; it must not be exposed to browser code. When set, the Next.js `/admin` route redirects to the Django owner dashboard. When absent, the existing NextAuth/Prisma dashboard remains available for local development and rollback.

Before enabling the variable:
1. Deploy the Django branch to staging with PostgreSQL and a unique `DJANGO_SECRET_KEY`.
2. Set `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` to exact staging origins.
3. Create the owner account with `python manage.py createsuperuser`; do not use demo credentials.
4. Confirm `/api/health/` returns healthy and verify that a non-superuser is denied access to owner screens and APIs.
5. Test sign-in, sign-out, product/category management, payment decisions, and audit logs using staging data.

## Prepare and import a staging data snapshot

1. Take a provider-level backup of the source PostgreSQL database before doing anything else.
2. On a trusted machine with the source database credentials in environment variables, run the export script. It writes a new file only (refuses to overwrite an existing path) and excludes password hashes, sessions, carts, and wishlists.

   ```bash
   npx tsx scripts/export-prisma-migration.ts --out /secure/path/sugandhika-prisma-export.json
   ```

3. Transfer that export only to a private staging environment using an encrypted channel. It contains customer emails, order history, addresses, and other personal/business data. Never commit it, put it in a public artifact, or send it in chat.
4. In the Django backend environment, first run the non-writing reference validation:

   ```bash
   python manage.py import_prisma_export /secure/path/sugandhika-prisma-export.json --dry-run
   ```

5. If the dry run succeeds, take a fresh backup of the **staging** Django database and import within the atomic transaction:

   ```bash
   python manage.py import_prisma_export /secure/path/sugandhika-prisma-export.json
   ```

6. Reconcile counts and totals in the import output against the export's `counts`, and manually inspect products, images, coupon validity, historical orders, and payment statuses before testing the storefront.

The import is repeatable for categories, products, orders, coupons, and most content by natural key. It maps relationships through slugs/email/order numbers rather than reusing Prisma UUIDs. It imports historical orders and their line items, but does not import carts, wishlists, stored addresses as a separate address book, or the source payment row as a distinct model. The order's shipping-address snapshot and payment fields are preserved on the Django order. Customer password hashes are not exported: imported accounts receive unusable passwords until a secure password-reset flow is implemented. Source `ADMIN` roles are not elevated to Django superusers; provision the owner separately with `createsuperuser`.

## Still required before a storefront data cutover

- Export and reconcile existing PostgreSQL/Prisma records; map IDs and relationships without losing order history.
- Decide a single canonical ID strategy before migrating. Current Prisma IDs are strings/UUIDs while Django model primary keys are integers, so direct switching is not safe yet.
- Move product/category/banner/content reads and owner writes to Django only after the corresponding data is imported and verified.
- Port customer registration/login/profile/address functions to Django; test password migration or a secure password-reset flow.
- Implement transactional checkout with server-side prices, coupon validation, stock locking/reservation, order creation, payment record creation, and idempotency.
- Connect receipt/image upload to durable object storage; local filesystem media is not production storage.
- Test COD, Fonepay pending/verified/rejected/refunded states, cancellation/returns, shipping calculations, and inventory restoration.
- Run staging end-to-end tests and reconcile record counts/totals before changing production environment variables.

Do not merge this migration or enable the production dashboard handoff until staging checks pass and the owner explicitly approves cutover.
