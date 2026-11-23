import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

/** GET /api/faq — public */
export async function getPublishedFAQs(_req, res, next) {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
    return sendSuccess(res, faqs);
  } catch (err) { next(err); }
}

/** GET /api/faq/featured */
export async function getFeaturedFAQs(_req, res, next) {
  try {
    const faqs = await prisma.fAQ.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { sortOrder: 'asc' }, take: 6 });
    return sendSuccess(res, faqs);
  } catch (err) { next(err); }
}

/** GET /api/faq/categories */
export async function getFAQCategories(_req, res, next) {
  try {
    const categories = await prisma.fAQCategory.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' }, include: { faqs: { where: { isPublished: true }, orderBy: { sortOrder: 'asc' } } } });
    return sendSuccess(res, categories);
  } catch (err) { next(err); }
}

/** GET /api/admin/faq */
export async function getAllFAQs(_req, res, next) {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' }, include: { category: true } });
    return sendSuccess(res, faqs);
  } catch (err) { next(err); }
}

/** POST /api/admin/faq */
export async function createFAQ(req, res, next) {
  try {
    const { question, answer, categoryId, sortOrder, isPublished, isFeatured } = req.body;
    if (!question || !answer) return sendError(res, 'question and answer required', 400);
    const faq = await prisma.fAQ.create({ data: { question, answer, categoryId: categoryId || null, sortOrder: parseInt(sortOrder) || 0, isPublished: isPublished !== false, isFeatured: Boolean(isFeatured) } });
    return sendSuccess(res, faq, 'FAQ created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/faq/:id */
export async function updateFAQ(req, res, next) {
  try {
    const { question, answer, categoryId, sortOrder, isPublished, isFeatured } = req.body;
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: { question, answer, categoryId: categoryId || null, sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined, isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined, isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined },
    });
    return sendSuccess(res, faq, 'FAQ updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/faq/:id */
export async function deleteFAQ(req, res, next) {
  try {
    await prisma.fAQ.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'FAQ deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/faq/reorder */
export async function reorderFAQs(req, res, next) {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, sortOrder }) => prisma.fAQ.update({ where: { id }, data: { sortOrder } })));
    return sendSuccess(res, null, 'FAQs reordered');
  } catch (err) { next(err); }
}

// ── FAQ Categories ────────────────────────────────────────────────────────────
export async function getAllFAQCategories(_req, res, next) {
  try {
    const cats = await prisma.fAQCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { faqs: true } } } });
    return sendSuccess(res, cats);
  } catch (err) { next(err); }
}
export async function createFAQCategory(req, res, next) {
  try {
    const { name, sortOrder } = req.body;
    if (!name) return sendError(res, 'name required', 400);
    const cat = await prisma.fAQCategory.create({ data: { name, sortOrder: parseInt(sortOrder) || 0 } });
    return sendSuccess(res, cat, 'Category created', 201);
  } catch (err) { next(err); }
}
export async function updateFAQCategory(req, res, next) {
  try {
    const { name, sortOrder, isPublished } = req.body;
    const cat = await prisma.fAQCategory.update({ where: { id: req.params.id }, data: { name, sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined, isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined } });
    return sendSuccess(res, cat, 'Category updated');
  } catch (err) { next(err); }
}
export async function deleteFAQCategory(req, res, next) {
  try {
    await prisma.fAQCategory.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Category deleted');
  } catch (err) { next(err); }
}


/** GET /api/admin/faq/:id */
export async function getFAQById(req, res, next) {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!faq) return sendError(res, 'FAQ not found', 404);
    return sendSuccess(res, faq);
  } catch (err) { next(err); }
}

/** PATCH /api/admin/faq/:id/featured */
export async function toggleFAQFeatured(req, res, next) {
  try {
    const existing = await prisma.fAQ.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'FAQ not found', 404);
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: { isFeatured: !existing.isFeatured },
    });
    return sendSuccess(res, faq, 'FAQ featured status updated');
  } catch (err) { next(err); }
}

/** PATCH /api/admin/faq/:id/publish */
export async function toggleFAQPublish(req, res, next) {
  try {
    const existing = await prisma.fAQ.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'FAQ not found', 404);
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: { isPublished: !existing.isPublished },
    });
    return sendSuccess(res, faq, 'FAQ publishing status updated');
  } catch (err) { next(err); }
}
