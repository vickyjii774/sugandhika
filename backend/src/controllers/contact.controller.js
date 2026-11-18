import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/contact */
export async function getContactInfo(_req, res, next) {
  try {
    let info = await prisma.contactInformation.findUnique({ where: { id: 'main' } });
    if (!info) info = { id: 'main', phone: '+977-1-XXXXXXX', email: 'info@sugandhika.com' };
    return sendSuccess(res, info);
  } catch (err) { next(err); }
}

/** PUT /api/admin/contact */
export async function updateContactInfo(req, res, next) {
  try {
    const { phone, whatsapp, email, address, mapUrl, businessHours } = req.body;
    const info = await prisma.contactInformation.upsert({
      where: { id: 'main' },
      update: { phone, whatsapp, email, address, mapUrl, businessHours },
      create: { id: 'main', phone, whatsapp, email, address, mapUrl, businessHours },
    });
    return sendSuccess(res, info, 'Contact information updated');
  } catch (err) { next(err); }
}
