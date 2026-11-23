import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

/** GET /api/features — public */
export async function getActiveFeatures(_req, res, next) {
  try {
    const features = await prisma.feature.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, features);
  } catch (err) { next(err); }
}

/** GET /api/admin/features — all */
export async function getAllFeatures(_req, res, next) {
  try {
    const features = await prisma.feature.findMany({ orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, features);
  } catch (err) { next(err); }
}

/** POST /api/admin/features */
export async function createFeature(req, res, next) {
  try {
    const { title, description, icon, imageUrl, isActive, sortOrder } = req.body;
    if (!title || !description) return sendError(res, 'title and description required', 400);
    const feature = await prisma.feature.create({ data: { title, description, icon, imageUrl, isActive: isActive !== false, sortOrder: parseInt(sortOrder) || 0 } });
    return sendSuccess(res, feature, 'Feature created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/features/:id */
export async function updateFeature(req, res, next) {
  try {
    const { title, description, icon, imageUrl, isActive, sortOrder } = req.body;
    const feature = await prisma.feature.update({
      where: { id: req.params.id },
      data: { title, description, icon, imageUrl, isActive: isActive !== undefined ? Boolean(isActive) : undefined, sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined },
    });
    return sendSuccess(res, feature, 'Feature updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/features/:id */
export async function deleteFeature(req, res, next) {
  try {
    await prisma.feature.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Feature deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/features/reorder */
export async function reorderFeatures(req, res, next) {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, sortOrder }) => prisma.feature.update({ where: { id }, data: { sortOrder } })));
    return sendSuccess(res, null, 'Features reordered');
  } catch (err) { next(err); }
}
