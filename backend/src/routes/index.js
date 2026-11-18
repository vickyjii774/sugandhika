import Router from 'express';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter.middleware.js';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// ── Health Check ──────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Sugandhika API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Mount Routes ──────────────────────────────────────────────────────────────
router.use('/auth', authLimiter, authRoutes);
router.use('/', generalLimiter, publicRoutes);
router.use('/admin', generalLimiter, adminRoutes);

export default router;
