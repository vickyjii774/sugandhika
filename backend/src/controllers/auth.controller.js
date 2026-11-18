import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { genToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

/** POST /api/auth/login */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = genToken({ id: user.id, email: user.email, role: user.role });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return sendSuccess(
      res,
      {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/logout */
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: req.user.id,
        },
      });
    }
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me */
export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/auth/change-password */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new passwords are required', 400);
    }
    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'CHANGE_PASSWORD',
        entityType: 'User',
        entityId: req.user.id,
      },
    });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/forgot-password */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // In production, send email here with the reset token
    console.log(`[RESET TOKEN for ${email}]: ${resetToken}`);

    return sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/reset-password */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required', 400);
    }
    if (newPassword.length < 8) {
      return sendError(res, 'Password must be at least 8 characters', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired reset token', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return sendSuccess(res, null, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};
