import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/seo/:pageKey */
export async function getSEOByPage(req, res, next) {
  try {
    const seo = await prisma.sEOSetting.findUnique({ where: { pageKey: req.params.pageKey } });
    return sendSuccess(res, seo || {});
  } catch (err) { next(err); }
}

/** PUT /api/admin/seo/:pageKey */
export async function updateSEO(req, res, next) {
  try {
    const { title, description, ogImage, keywords } = req.body;
    const seo = await prisma.sEOSetting.upsert({
      where: { pageKey: req.params.pageKey },
      update: { title, description, ogImage, keywords },
      create: { pageKey: req.params.pageKey, title, description, ogImage, keywords },
    });
    return sendSuccess(res, seo, 'SEO settings updated');
  } catch (err) { next(err); }
}
