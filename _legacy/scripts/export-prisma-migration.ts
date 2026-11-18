import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const index = args.indexOf("--out");
  if (index < 0 || !args[index + 1]) {
    throw new Error("Usage: npx tsx scripts/export-prisma-migration.ts --out /secure/path/sugandhika-export.json");
  }
  return path.resolve(args[index + 1]);
}

async function main() {
  const outPath = parseArgs();
  const [
    users, categories, products, productImages, orders, coupons, reviews,
    faqs, banners, testimonials, contactMessages, newsletterSubscribers, websiteSettings,
  ] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, image: true, emailVerified: true, createdAt: true, updatedAt: true } }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({ include: { category: { select: { id: true, slug: true } }, images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "asc" } }),
    prisma.productImage.findMany(),
    prisma.order.findMany({ include: { user: { select: { id: true, name: true, email: true, phone: true } }, items: { include: { product: { select: { id: true, slug: true } } } }, payment: true }, orderBy: { createdAt: "asc" } }),
    prisma.coupon.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.review.findMany({ include: { user: { select: { name: true, email: true } }, product: { select: { id: true, slug: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.websiteSettings.findUnique({ where: { id: "default" } }),
  ]);

  // Password hashes, sessions, carts, and wishlist rows are deliberately not exported.
  // Customer accounts will require a secure password-reset flow before Django login.
  const payload = {
    format: "sugandhika-prisma-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    source: "Prisma/PostgreSQL",
    counts: {
      users: users.length, categories: categories.length, products: products.length,
      productImages: productImages.length, orders: orders.length, coupons: coupons.length,
      reviews: reviews.length, faqs: faqs.length, banners: banners.length,
      testimonials: testimonials.length, contactMessages: contactMessages.length,
      newsletterSubscribers: newsletterSubscribers.length, websiteSettings: websiteSettings ? 1 : 0,
    },
    users, categories, products, productImages, orders, coupons, reviews,
    faqs, banners, testimonials, contactMessages, newsletterSubscribers, websiteSettings,
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2), { encoding: "utf8", mode: 0o600, flag: "wx" });
  console.log(JSON.stringify({ output: outPath, counts: payload.counts, note: "Contains customer/order data. Store securely; do not commit or upload to a public repository." }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
