import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';
import { uploadFile } from '../services/storage.service.js';

/** GET /api/about */
export async function getAboutPage(_req, res, next) {
  try {
    let page = await prisma.page.findUnique({ where: { pageKey: 'about' } });
    if (!page) page = { pageKey: 'about', title: 'About Sugandhika', content: {} };
    return sendSuccess(res, page);
  } catch (err) { next(err); }
}

/** PUT /api/admin/about */
export async function updateAboutPage(req, res, next) {
  try {
    const { title, content, seoTitle, seoDescription } = req.body;
    const page = await prisma.page.upsert({
      where: { pageKey: 'about' },
      update: { title, content: typeof content === 'string' ? JSON.parse(content) : content, seoTitle, seoDescription },
      create: { pageKey: 'about', title: title || 'About Sugandhika', content: typeof content === 'string' ? JSON.parse(content) : content || {}, seoTitle, seoDescription },
    });
    return sendSuccess(res, page, 'About page updated');
  } catch (err) { next(err); }
}

/** POST /api/admin/about/image */
export async function uploadAboutImage(req, res, next) {
  try {
    if (!req.file) return sendSuccess(res, null, 'No file');
    const r = await uploadFile(req.file.buffer, req.file.mimetype, 'about', `about-${Date.now()}`);
    return sendSuccess(res, { url: r.url, path: r.path }, 'Image uploaded', 201);
  } catch (err) { next(err); }
}
