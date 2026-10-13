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
