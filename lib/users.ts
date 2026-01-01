import { supabase, User } from './supabase';

/**
 * Gets or creates a user by Telegram ID.
 * Returns the internal user ID (UUID).
 * 
 * @param telegramUserId The Telegram user ID (from.id)
 * @returns Promise<string> The internal user ID (UUID)
 */
export async function getOrCreateUser(telegramUserId: number | string): Promise<string> {
  // 1. Try to find existing user
  const existingUserId = await getUserByTelegramId(telegramUserId);

  if (existingUserId) {
    return existingUserId;
  }

  // 2. Create new user if not found
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{ telegram_user_id: telegramUserId }])
    .select('id')
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  return newUser.id;
}

/**
 * Gets a user by Telegram ID without creating one.
 * Returns the internal user ID (UUID) or null if not found.
 * 
 * @param telegramUserId The Telegram user ID (from.id)
 * @returns Promise<string | null> The internal user ID (UUID) or null
 */
export async function getUserByTelegramId(telegramUserId: number | string): Promise<string | null> {
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  if (findError && findError.code !== 'PGRST116') {
    console.error('Error fetching user:', findError);
    // Don't throw, just return null so caller can decide what to do
    return null; 
  }

  return null;
}
