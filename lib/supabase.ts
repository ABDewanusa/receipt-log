import { createClient } from '@supabase/supabase-js';

// Ensure env vars are loaded before this file is imported, or checks here.
// But following the pattern, we assume process.env is populated.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for backend access
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export interface User {
  id: string;
  telegram_user_id: number;
  created_at: string;
}

