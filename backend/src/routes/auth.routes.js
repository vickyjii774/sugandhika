
import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/login', authLimiter, auth.login);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);
router.post('/change-password', authenticate, auth.changePassword);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

export default router;
