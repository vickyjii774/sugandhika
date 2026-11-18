import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/admin/audit-logs */
export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.auditLog.count(),
    ]);
    return sendSuccess(res, { logs, total, page: parseInt(page) });
  } catch (err) { next(err); }
}
