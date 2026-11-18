import supabase from '../config/supabase.js';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = config.supabase.storageBucket;

/**
 * Upload a file buffer to Supabase Storage.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - e.g. 'image/jpeg'
 * @param {string} folder - Storage folder (e.g. 'banners', 'products')
 * @param {string} [filename] - Optional custom filename
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadFile = async (buffer, mimetype, folder, filename) => {
  const ext = mimetype.split('/')[1] || 'jpg';
  const name = filename || `${uuidv4()}.${ext}`;
  const storagePath = `${folder}/${name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const url = getPublicUrl(storagePath);
  return { url, path: storagePath };
};

/**
 * Delete a file from Supabase Storage by its path.
 * @param {string} storagePath
 * @returns {Promise<void>}
 */
export const deleteFile = async (storagePath) => {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    console.error(`Storage delete warning: ${error.message}`);
  }
};

/**
 * Get the public URL for a stored file path.
 * @param {string} storagePath
 * @returns {string}
 */
export const getPublicUrl = (storagePath) => {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
};
