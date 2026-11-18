import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/homepage — returns all enabled sections + banners + features */
export async function getHomepageData(_req, res, next) {
  try {
    const [sections, banners, features] = await Promise.all([
      prisma.homepageSection.findMany({ where: { isEnabled: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.feature.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    ]);
    return sendSuccess(res, { sections, banners, features });
  } catch (err) { next(err); }
}

/** PUT /api/admin/homepage/sections/:key */
export async function updateSection(req, res, next) {
  try {
    const { key } = req.params;
    const { title, subtitle, isEnabled, sortOrder, settings } = req.body;
    const section = await prisma.homepageSection.upsert({
      where: { sectionKey: key },
      update: { title, subtitle, isEnabled, sortOrder, settings },
      create: { sectionKey: key, title, subtitle, isEnabled: isEnabled ?? true, sortOrder: sortOrder ?? 0, settings },
    });
    return sendSuccess(res, section, 'Section updated');
  } catch (err) { next(err); }
}

/** PUT /api/admin/homepage/sections/reorder — body: [{key, sortOrder}] */
export async function reorderSections(req, res, next) {
  try {
    const { sections } = req.body;
    await Promise.all(
      sections.map(({ key, sortOrder }) =>
        prisma.homepageSection.updateMany({ where: { sectionKey: key }, data: { sortOrder } })
      )
    );
    return sendSuccess(res, null, 'Sections reordered');
  } catch (err) { next(err); }
}
