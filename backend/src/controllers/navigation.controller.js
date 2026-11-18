import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

/** GET /api/navigation — public, visible items only */
export async function getPublicNavigation(_req, res, next) {
  try {
    const items = await prisma.navigationItem.findMany({
      where: { isVisible: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    return sendSuccess(res, items);
  } catch (err) { next(err); }
}

/** GET /api/admin/navigation — all items */
export async function getAllNavigation(_req, res, next) {
  try {
    const items = await prisma.navigationItem.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: { children: { orderBy: { sortOrder: 'asc' } } },
    });
    return sendSuccess(res, items);
  } catch (err) { next(err); }
}

/** POST /api/admin/navigation */
export async function createNavItem(req, res, next) {
  try {
    const { label, url, sortOrder, isVisible, parentId } = req.body;
    if (!label || !url) return sendError(res, 'label and url are required', 400);
    const item = await prisma.navigationItem.create({
      data: { label, url, sortOrder: sortOrder ?? 0, isVisible: isVisible ?? true, parentId: parentId || null },
    });
    return sendSuccess(res, item, 'Navigation item created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/navigation/:id */
export async function updateNavItem(req, res, next) {
  try {
    const { id } = req.params;
    const { label, url, sortOrder, isVisible } = req.body;
    const item = await prisma.navigationItem.update({
      where: { id },
      data: { label, url, sortOrder, isVisible },
    });
    return sendSuccess(res, item, 'Navigation item updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/navigation/:id */
export async function deleteNavItem(req, res, next) {
  try {
    await prisma.navigationItem.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Navigation item deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/navigation/reorder — body: [{id, sortOrder}] */
export async function reorderNavItems(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return sendError(res, 'items array required', 400);
    await Promise.all(
      items.map(({ id, sortOrder }) =>
        prisma.navigationItem.update({ where: { id }, data: { sortOrder } })
      )
    );
    return sendSuccess(res, null, 'Navigation reordered');
  } catch (err) { next(err); }
}
