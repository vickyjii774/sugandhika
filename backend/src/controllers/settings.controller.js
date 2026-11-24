import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

/** GET /api/settings — merge site-wide settings and contact details */
export async function getSettings(_req, res, next) {
  try {
    let settings = await prisma.siteSetting.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: { id: 'main', siteName: 'Sugandhika', tagline: 'Pure Eco Fragrance' },
      });
    }
    const contact = await prisma.contactInformation.findUnique({ where: { id: 'main' } });
    return sendSuccess(res, {
      ...settings,
      phone: contact?.phone ?? settings.phone,
      whatsapp: contact?.whatsapp ?? settings.whatsapp,
      email: contact?.email ?? settings.email,
      address: contact?.address ?? settings.address,
      businessHours: contact?.businessHours ?? '',
    });
  } catch (err) { next(err); }
}

/** PUT /api/admin/settings */
export async function updateSettings(req, res, next) {
  try {
    const {
      siteName, tagline, description, phone, whatsapp, email, address,
      facebookUrl, instagramUrl, youtubeUrl, twitterUrl, tiktokUrl, linkedinUrl, footerText, copyright, logo, favicon,
    } = req.body;
    const settings = await prisma.siteSetting.upsert({
      where: { id: 'main' },
      update: { siteName, tagline, description, phone, whatsapp, email, address, facebookUrl, instagramUrl, youtubeUrl, twitterUrl, tiktokUrl, linkedinUrl, footerText, copyright, logo, favicon },
      create: { id: 'main', siteName: siteName || 'Sugandhika', tagline, description, phone, whatsapp, email, address, facebookUrl, instagramUrl, youtubeUrl, twitterUrl, footerText, copyright, logo, favicon },
    });
    return sendSuccess(res, settings, 'Settings updated');
  } catch (err) { next(err); }
}

export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const current = await prisma.siteSetting.findUnique({ where: { id: 'main' } });
    if (current?.logoPath) await deleteFile(current.logoPath).catch(() => {});
    const { url, path } = await uploadFile(req.file.buffer, req.file.mimetype, 'logos', `logo-${Date.now()}`);
    const settings = await prisma.siteSetting.upsert({
      where: { id: 'main' }, update: { logo: url, logoPath: path },
      create: { id: 'main', siteName: 'Sugandhika', logo: url, logoPath: path },
    });
    return sendSuccess(res, { logo: settings.logo, logoUrl: settings.logo }, 'Logo uploaded');
  } catch (err) { next(err); }
}

export async function uploadFavicon(req, res, next) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const current = await prisma.siteSetting.findUnique({ where: { id: 'main' } });
    if (current?.faviconPath) await deleteFile(current.faviconPath).catch(() => {});
    const { url, path } = await uploadFile(req.file.buffer, req.file.mimetype, 'favicons', `favicon-${Date.now()}`);
    const settings = await prisma.siteSetting.upsert({
      where: { id: 'main' }, update: { favicon: url, faviconPath: path },
      create: { id: 'main', siteName: 'Sugandhika', favicon: url, faviconPath: path },
    });
    return sendSuccess(res, { favicon: settings.favicon, faviconUrl: settings.favicon }, 'Favicon uploaded');
  } catch (err) { next(err); }
}
