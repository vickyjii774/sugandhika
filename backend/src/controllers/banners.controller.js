import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

/** GET /api/banners — public, active only */
export async function getActiveBanners(_req, res, next) {
  try {
    const banners = await prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, banners);
  } catch (err) { next(err); }
}

/** GET /api/admin/banners — all */
export async function getAllBanners(_req, res, next) {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, banners);
  } catch (err) { next(err); }
}

/** POST /api/admin/banners */
export async function createBanner(req, res, next) {
  try {
    const { title, subtitle, description, buttonLabel, buttonUrl, secondButtonLabel, secondButtonUrl, isActive, sortOrder } = req.body;
    if (!title) return sendError(res, 'title is required', 400);
    let imageUrl, storagePath;
    if (req.file) {
      const result = await uploadFile(req.file.buffer, req.file.mimetype, 'banners', `banner-${Date.now()}`);
      imageUrl = result.url; storagePath = result.path;
    }
    const banner = await prisma.banner.create({
      data: { title, subtitle, description, imageUrl, storagePath, buttonLabel, buttonUrl, secondButtonLabel, secondButtonUrl, isActive: isActive !== false, sortOrder: parseInt(sortOrder) || 0 },
    });
    return sendSuccess(res, banner, 'Banner created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/banners/:id */
export async function updateBanner(req, res, next) {
  try {
    const { id } = req.params;
    const { title, subtitle, description, buttonLabel, buttonUrl, secondButtonLabel, secondButtonUrl, isActive, sortOrder } = req.body;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Banner not found', 404);
    let imageUrl = existing.imageUrl, storagePath = existing.storagePath;
    if (req.file) {
      if (storagePath) await deleteFile(storagePath).catch(() => {});
      const result = await uploadFile(req.file.buffer, req.file.mimetype, 'banners', `banner-${Date.now()}`);
      imageUrl = result.url; storagePath = result.path;
    }
    const banner = await prisma.banner.update({
      where: { id },
      data: { title, subtitle, description, imageUrl, storagePath, buttonLabel, buttonUrl, secondButtonLabel, secondButtonUrl, isActive: isActive !== undefined ? Boolean(isActive) : undefined, sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined },
    });
    return sendSuccess(res, banner, 'Banner updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/banners/:id */
export async function deleteBanner(req, res, next) {
  try {
    const banner = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!banner) return sendError(res, 'Banner not found', 404);
    if (banner.storagePath) await deleteFile(banner.storagePath).catch(() => {});
    await prisma.banner.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Banner deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/banners/reorder */
export async function reorderBanners(req, res, next) {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, sortOrder }) =>
      prisma.banner.update({ where: { id }, data: { sortOrder } })
    ));
    return sendSuccess(res, null, 'Banners reordered');
  } catch (err) { next(err); }
}
