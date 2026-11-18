import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const supabaseUrl = config.supabase?.url || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = config.supabase?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Supabase credentials not configured. Image uploads will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
