import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

/** GET /api/team — public */
export async function getPublishedTeam(_req, res, next) {
  try {
    const members = await prisma.teamMember.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, members);
  } catch (err) { next(err); }
}

/** GET /api/team/featured — public */
export async function getFeaturedTeam(_req, res, next) {
  try {
    const members = await prisma.teamMember.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, members);
  } catch (err) { next(err); }
}

/** GET /api/admin/team — all */
export async function getAllTeam(_req, res, next) {
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, members);
  } catch (err) { next(err); }
}

/** POST /api/admin/team */
export async function createMember(req, res, next) {
  try {
    const { name, designation, department, bio, socialLinks, email, phone, sortOrder, isPublished, isFeatured, imageUrl: suppliedImageUrl } = req.body;
    if (!name || !designation) return sendError(res, 'name and designation required', 400);
    let imageUrl = suppliedImageUrl || null, storagePath;
    if (req.file) {
      const r = await uploadFile(req.file.buffer, req.file.mimetype, 'team', `member-${Date.now()}`);
      imageUrl = r.url; storagePath = r.path;
    }
    const links = socialLinks ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) : {};
    if (email) links.email = email;
    if (phone) links.phone = phone;
    const member = await prisma.teamMember.create({
      data: { name, designation, department, bio, imageUrl, storagePath, socialLinks: links, sortOrder: parseInt(sortOrder) || 0, isPublished: isPublished !== false, isFeatured: Boolean(isFeatured) },
    });
    return sendSuccess(res, member, 'Team member created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/team/:id */
export async function updateMember(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Team member not found', 404);
    const { name, designation, department, bio, socialLinks, email, phone, sortOrder, isPublished, isFeatured, imageUrl: suppliedImageUrl } = req.body;
    let imageUrl = suppliedImageUrl !== undefined ? suppliedImageUrl : existing.imageUrl, storagePath = existing.storagePath;
    if (req.file) {
      if (storagePath) await deleteFile(storagePath).catch(() => {});
      const r = await uploadFile(req.file.buffer, req.file.mimetype, 'team', `member-${Date.now()}`);
      imageUrl = r.url; storagePath = r.path;
    }
    const links = socialLinks ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) : { ...(existing.socialLinks || {}) };
    if (email !== undefined) links.email = email;
    if (phone !== undefined) links.phone = phone;
    const member = await prisma.teamMember.update({
      where: { id },
      data: { name, designation, department, bio, imageUrl, storagePath, socialLinks: links, sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined, isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined, isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined },
    });
    return sendSuccess(res, member, 'Member updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/team/:id */
export async function deleteMember(req, res, next) {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!member) return sendError(res, 'Member not found', 404);
    if (member.storagePath) await deleteFile(member.storagePath).catch(() => {});
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Member deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/team/reorder */
export async function reorderTeam(req, res, next) {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, sortOrder }) =>
      prisma.teamMember.update({ where: { id }, data: { sortOrder } })
    ));
    return sendSuccess(res, null, 'Team reordered');
  } catch (err) { next(err); }
}


/** GET /api/admin/team/:id */
export async function getTeamMemberById(req, res, next) {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!member) return sendError(res, 'Team member not found', 404);
    return sendSuccess(res, member);
  } catch (err) { next(err); }
}

/** PATCH /api/admin/team/:id/featured */
export async function toggleTeamFeatured(req, res, next) {
  try {
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Team member not found', 404);
    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { isFeatured: !existing.isFeatured },
    });
    return sendSuccess(res, member, 'Team featured status updated');
  } catch (err) { next(err); }
}

/** PATCH /api/admin/team/:id/publish */
export async function toggleTeamPublish(req, res, next) {
  try {
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Team member not found', 404);
    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { isPublished: !existing.isPublished },
    });
    return sendSuccess(res, member, 'Team publishing status updated');
  } catch (err) { next(err); }
}
