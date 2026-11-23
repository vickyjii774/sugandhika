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
/** Stricter limiter for login endpoint */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Development: 150 requests
  // Production: 10 requests
  max: config.isDev ? 150 : 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});
