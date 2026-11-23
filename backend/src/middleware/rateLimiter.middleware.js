import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Local React development generates many parallel API requests while screens
 * load. Keep a higher development ceiling, but retain the configured limit
 * in production.
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.isDev ? Math.max(config.rateLimit.max, 1000) : config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/** Stricter limiter for auth endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
});
