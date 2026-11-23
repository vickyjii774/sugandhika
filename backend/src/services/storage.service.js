import { createHash } from 'node:crypto';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

const cloudinaryConfig = () => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env.');
  }
  return { cloudName, apiKey, apiSecret };
};

const signParams = (params, apiSecret) => {
  const canonical = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');
};

/**
 * Upload an image buffer to Cloudinary and return its secure URL and public ID.
 * The public ID is stored in the existing storagePath database fields.
 */
export const uploadFile = async (buffer, mimetype, folder, filename) => {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const ext = (mimetype.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const baseName = (filename || uuidv4()).replace(/\\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const publicId = `${folder}/${baseName || uuidv4()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder, public_id: baseName, timestamp };
  const signature = signParams(params, apiSecret);

  const form = new FormData();
  form.set('file', new Blob([buffer], { type: mimetype }), `upload.${ext}`);
  form.set('api_key', apiKey);
  form.set('timestamp', String(timestamp));
  form.set('folder', folder);
  form.set('public_id', baseName);
  form.set('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const result = await response.json();
  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(`Cloudinary upload failed: ${result.error?.message || response.statusText}`);
  }
  return { url: result.secure_url, path: result.public_id };
};

/** Delete an image from Cloudinary using its stored public ID. */
export const deleteFile = async (publicId) => {
  if (!publicId) return;
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = signParams(params, apiSecret);
  const form = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const result = await response.json();
  if (!response.ok || !['ok', 'not found'].includes(result.result)) {
    throw new Error(`Cloudinary delete failed: ${result.error?.message || response.statusText}`);
  }
};

/** Build the default Cloudinary delivery URL for an existing public ID. */
export const getPublicUrl = (publicId) => {
  const { cloudName } = cloudinaryConfig();
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};
