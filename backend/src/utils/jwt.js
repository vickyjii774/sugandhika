import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate a signed JWT token.
 * @param {object} payload
 * @param {string} [expiresIn]
 * @returns {string}
 */
export const genToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {Error} if invalid or expired
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};
