import dotenv from 'dotenv';
import path from 'path';

// Ensure env vars are loaded from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
