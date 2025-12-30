import { supabase } from '../supabase';
import { PersistableExpense } from '../types';

/**
 * Inserts a single expense row into Supabase.
 * Does NOT auto-generate ID. Uses the ID provided in input.
 * 
 * Rules:
 * - Must insert only AFTER successful image upload (image_path required).
 * - If extraction fails, fields are nullable, but row is still created.
 * - raw_extraction must NOT be null and must contain raw_text.
 * - DB Insert Failure: Logs error, does NOT throw, does NOT retry.
 */
export async function insertExpense(input: PersistableExpense): Promise<void> {
  // Enforce image_path requirement (Strict check before DB attempt)
  if (!input.image_path) {
    throw new Error('Cannot insert expense: image_path is missing. Image upload must succeed first.');
  }

  // Enforce R2 object path rule (No URLs)
  if (input.image_path.startsWith('http://') || input.image_path.startsWith('https://')) {
    throw new Error('Cannot insert expense: image_path must be an R2 object path, not a URL.');
  }

  // Enforce raw_extraction requirement
  if (!input.raw_extraction || typeof input.raw_extraction.raw_text !== 'string') {
    throw new Error('Cannot insert expense: raw_extraction is missing or invalid. Raw Gemini output must be stored.');
  }

  try {
    const { error } = await supabase
      .from('expenses')
      .insert({
        id: input.id,
        user_id: input.user_id,
        merchant: input.merchant,
        total_amount: input.total_amount,
        currency: input.currency || 'IDR', // Default per schema
        date: input.date,
        raw_extraction: input.raw_extraction,
        image_path: input.image_path,
      });

    if (error) {
      console.error('Error inserting expense (Partial Failure handled):', error);
      // Do NOT throw. Swallow error to prevent webhook crash.
      return;
    }
  } catch (err) {
    console.error('Unexpected error during expense insertion:', err);
    // Do NOT throw.
    return;
  }
}
