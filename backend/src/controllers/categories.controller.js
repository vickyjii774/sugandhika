import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { toSlug } from '../utils/slug.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

/** GET /api/categories — public */
export async function getPublishedCategories(_req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    });
    return sendSuccess(res, categories);
  } catch (err) { next(err); }
}

/** GET /api/categories/:slug — public */
export async function getCategoryBySlug(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug, isPublished: true },
    });
    if (!category) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, category);
  } catch (err) { next(err); }
}

/** GET /api/admin/categories — all */
export async function getAllCategories(_req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return sendSuccess(res, categories);
  } catch (err) { next(err); }
}

/** POST /api/admin/categories */
export async function createCategory(req, res, next) {
  try {
    const { name, description, isPublished, sortOrder, imageUrl: suppliedImageUrl } = req.body;
    if (!name) return sendError(res, 'name is required', 400);
    const slug = toSlug(name);
    let imageUrl = suppliedImageUrl || null, storagePath;
    if (req.file) {
      const result = await uploadFile(req.file.buffer, req.file.mimetype, 'categories', `cat-${Date.now()}`);
      imageUrl = result.url; storagePath = result.path;
    }
    const category = await prisma.category.create({
      data: { name, slug, description, imageUrl, storagePath, isPublished: isPublished !== false, sortOrder: parseInt(sortOrder) || 0 },
    });
    return sendSuccess(res, category, 'Category created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/categories/:id */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, isPublished, sortOrder, imageUrl: suppliedImageUrl } = req.body;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Category not found', 404);
    let imageUrl = suppliedImageUrl !== undefined ? suppliedImageUrl : existing.imageUrl, storagePath = existing.storagePath;
    if (req.file) {
      if (storagePath) await deleteFile(storagePath).catch(() => {});
      const result = await uploadFile(req.file.buffer, req.file.mimetype, 'categories', `cat-${Date.now()}`);
      imageUrl = result.url; storagePath = result.path;
    }
    const data = { description, imageUrl, storagePath };
    if (name) { data.name = name; data.slug = toSlug(name); }
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
    const category = await prisma.category.update({ where: { id }, data });
    return sendSuccess(res, category, 'Category updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/categories/:id */
export async function deleteCategory(req, res, next) {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return sendError(res, 'Category not found', 404);
    if (category.storagePath) await deleteFile(category.storagePath).catch(() => {});
    await prisma.category.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Category deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/categories/reorder */
export async function reorderCategories(req, res, next) {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, sortOrder }) =>
      prisma.category.update({ where: { id }, data: { sortOrder } })
    ));
    return sendSuccess(res, null, 'Categories reordered');
  } catch (err) { next(err); }
}
