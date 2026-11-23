import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';
import { uploadFile } from '../services/storage.service.js';

const normaliseContent = (body = {}) => {
  if (body.content !== undefined) {
    return typeof body.content === 'string' ? JSON.parse(body.content) : body.content;
  }
  return {
    story: body.story ?? '',
    mission: body.mission ?? '',
    vision: body.vision ?? '',
    values: body.values ?? '',
    qualityCommitment: body.qualityCommitment ?? body.quality_commitment ?? '',
    imageUrl: body.imageUrl ?? body.image ?? '',
  };
};

/** GET /api/about */
export async function getAboutPage(_req, res, next) {
  try {
    let page = await prisma.page.findUnique({ where: { pageKey: 'about' } });
    if (!page) page = { pageKey: 'about', title: 'About Sugandhika', content: {} };
    return sendSuccess(res, { ...page, ...(page.content || {}) });
  } catch (err) { next(err); }
}

/** PUT /api/admin/about */
export async function updateAboutPage(req, res, next) {
  try {
    const existing = await prisma.page.findUnique({ where: { pageKey: 'about' } });
    const incoming = normaliseContent(req.body);
    const content = { ...(existing?.content || {}), ...incoming };
    const title = req.body.title || existing?.title || 'About Sugandhika';
    const page = await prisma.page.upsert({
      where: { pageKey: 'about' },
      update: { title, content },
      create: { pageKey: 'about', title, content },
    });
    return sendSuccess(res, { ...page, ...content }, 'About page updated');
  } catch (err) { next(err); }
}

/** POST /api/admin/about/image */
export async function uploadAboutImage(req, res, next) {
  try {
    if (!req.file) return sendSuccess(res, null, 'No file');
    const r = await uploadFile(req.file.buffer, req.file.mimetype, 'about', `about-${Date.now()}`);
    const existing = await prisma.page.findUnique({ where: { pageKey: 'about' } });
    const content = { ...(existing?.content || {}), imageUrl: r.url };
    await prisma.page.upsert({
      where: { pageKey: 'about' },
      update: { content },
      create: { pageKey: 'about', title: 'About Sugandhika', content },
    });
    return sendSuccess(res, { url: r.url, imageUrl: r.url, path: r.path }, 'Image uploaded', 201);
  } catch (err) { next(err); }
}
