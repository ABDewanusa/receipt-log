import 'server-only';
import dotenv from 'dotenv';
import path from 'path';

// Only load .env.local if variables are missing (e.g. running scripts locally)
// In Next.js (dev/prod), these are usually pre-loaded.
if (!process.env.TELEGRAM_BOT_TOKEN) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const R2_ENDPOINT = process.env.R2_ENDPOINT;
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const APP_URL = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://receipt-log.vercel.app' : 'http://localhost:3000');
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';

