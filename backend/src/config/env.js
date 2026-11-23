import 'dotenv/config';

const optional = (key, defaultValue = '') => process.env[key] || defaultValue;
const warn = (key) => {
  if (!process.env[key]) console.warn(`⚠️  Missing environment variable: ${key} (required for full functionality)`);
  return process.env[key] || '';
};

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',
  database: { url: warn('DATABASE_URL') },
  jwt: {
    secret: optional('JWT_SECRET', 'dev-fallback-secret-change-in-production'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
  },
  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME'),
    apiKey: optional('CLOUDINARY_API_KEY'),
    apiSecret: optional('CLOUDINARY_API_SECRET'),
  },
  cors: {
    origin: optional('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001'),
  },
  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  },
  upload: {
    maxFileSizeMb: parseInt(optional('MAX_FILE_SIZE_MB', '10'), 10),
  },
};

export default config;
