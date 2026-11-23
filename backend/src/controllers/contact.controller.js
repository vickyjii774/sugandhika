import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/contact */
export async function getContactInfo(_req, res, next) {
  try {
    const [info, settings] = await Promise.all([
      prisma.contactInformation.findUnique({ where: { id: 'main' } }),
      prisma.siteSetting.findUnique({ where: { id: 'main' } }),
    ]);
    return sendSuccess(res, {
      id: 'main',
      phone: info?.phone || settings?.phone || '',
      whatsapp: info?.whatsapp || settings?.whatsapp || settings?.phone || '',
      email: info?.email || settings?.email || '',
      address: info?.address || settings?.address || '',
      mapUrl: info?.mapUrl || '',
      businessHours: info?.businessHours || '',
    });
  } catch (err) { next(err); }
}

/** PUT /api/admin/contact — keep the contact table and site-wide settings in sync */
export async function updateContactInfo(req, res, next) {
  try {
    const { phone, whatsapp, email, address, mapUrl, businessHours } = req.body;
    const [info] = await prisma.$transaction([
      prisma.contactInformation.upsert({
        where: { id: 'main' },
        update: { phone, whatsapp, email, address, mapUrl, businessHours },
        create: { id: 'main', phone, whatsapp, email, address, mapUrl, businessHours },
      }),
      prisma.siteSetting.upsert({
        where: { id: 'main' },
        update: { phone, whatsapp, email, address },
        create: { id: 'main', siteName: 'Sugandhika', phone, whatsapp, email, address },
      }),
    ]);
    return sendSuccess(res, info, 'Contact information updated');
  } catch (err) { next(err); }
}
