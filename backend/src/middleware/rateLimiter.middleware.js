import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Public website pages load several independent resources in parallel.
 * Rate-limit write operations, but do not throttle safe read requests used
 * to render the public website or authenticated admin screens.
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.isDev ? Math.max(config.rateLimit.max, 1000) : config.rateLimit.max,
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/** Stricter limiter for login endpoint */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isDev ? 150 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});
