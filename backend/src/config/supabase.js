import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.warn('⚠️  Supabase credentials not configured. Image uploads will fail.');
}

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseServiceRoleKey || 'placeholder-key'
);
