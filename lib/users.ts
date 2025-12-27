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
    throw new Error(`Failed to fetch user: ${findError.message}`);
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
