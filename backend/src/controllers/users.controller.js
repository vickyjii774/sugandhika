import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { sendSuccess, sendError } from '../utils/response.js';

/** GET /api/admin/users */
export async function getAllUsers(_req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, users);
  } catch (err) { next(err); }
}

/** POST /api/admin/users */
export async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return sendError(res, 'name, email, password required', 400);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return sendError(res, 'Email already in use', 409);
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || 'EDITOR' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return sendSuccess(res, user, 'User created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/users/:id */
export async function updateUser(req, res, next) {
  try {
    const { name, email, role, isActive, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (password) data.password = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    return sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/users/:id */
export async function deleteUser(req, res, next) {
  try {
    if (req.user.id === req.params.id) return sendError(res, 'Cannot delete yourself', 400);
    await prisma.user.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'User deleted');
  } catch (err) { next(err); }
}
