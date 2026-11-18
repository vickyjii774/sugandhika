import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

/** GET /api/settings */
export async function getSettings(_req, res, next) {
  try {
    let settings = await prisma.siteSetting.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: { id: 'main', siteName: 'Sugandhika', tagline: 'Pure Eco Fragrance' },
      });
    }
    return sendSuccess(res, settings);
  } catch (err) { next(err); }
}

/** PUT /api/admin/settings */
export async function updateSettings(req, res, next) {
  try {
    const {
      siteName, tagline, description, phone, whatsapp, email, address,
      facebookUrl, instagramUrl, youtubeUrl, twitterUrl, footerText, copyright,
    } = req.body;
    const settings = await prisma.siteSetting.upsert({
      where: { id: 'main' },
      update: { siteName, tagline, description, phone, whatsapp, email, address, facebookUrl, instagramUrl, youtubeUrl, twitterUrl, footerText, copyright },
      create: { id: 'main', siteName: siteName || 'Sugandhika', tagline, description, phone, whatsapp, email, address, facebookUrl, instagramUrl, youtubeUrl, twitterUrl, footerText, copyright },
    });
    return sendSuccess(res, settings, 'Settings updated');
  } catch (err) { next(err); }
}

/** POST /api/admin/settings/logo */
export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const current = await prisma.siteSetting.findUnique({ where: { id: 'main' } });
    if (current?.logoPath) await deleteFile(current.logoPath).catch(() => {});
    const { url, path } = await uploadFile(req.file.buffer, req.file.mimetype, 'logos', `logo-${Date.now()}`);
    const settings = await prisma.siteSetting.upsert({
      where: { id: 'main' },
      update: { logo: url, logoPath: path },
      create: { id: 'main', siteName: 'Sugandhika', logo: url, logoPath: path },
    });
    return sendSuccess(res, { logo: settings.logo }, 'Logo uploaded');
  } catch (err) { next(err); }
}

/** POST /api/admin/settings/favicon */
export async function uploadFavicon(req, res, next) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const current = await prisma.siteSetting.findUnique({ where: { id: 'main' } });
    if (current?.faviconPath) await deleteFile(current.faviconPath).catch(() => {});
    const { url, path } = await uploadFile(req.file.buffer, req.file.mimetype, 'favicons', `favicon-${Date.now()}`);
    const settings = await prisma.siteSetting.upsert({
      where: { id: 'main' },
      update: { favicon: url, faviconPath: path },
      create: { id: 'main', siteName: 'Sugandhika', favicon: url, faviconPath: path },
    });
    return sendSuccess(res, { favicon: settings.favicon }, 'Favicon uploaded');
  } catch (err) { next(err); }
}
