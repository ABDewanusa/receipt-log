import { supabase } from '../supabase';
import { getUserByTelegramId } from '../users';

export interface Expense {
  date: string | null;
  merchant: string | null;
  total_amount: number | null;
  currency: string | null;
  created_at: string;
}

/**
 * Fetches all expenses for a user by their Telegram ID.
 * Ordered by created_at ASC.
 * 
 * @param telegramUserId The Telegram user ID
 * @returns Promise<Expense[]> List of expenses
 */
export async function getExpensesForUser(telegramUserId: string | number): Promise<Expense[]> {
  const userId = await getUserByTelegramId(telegramUserId);

  if (!userId) {
    return [];
  }

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('date, merchant, total_amount, currency, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching expenses:', error);
    // Return empty list on error as per requirements ("Do not throw if empty", 
    // though this is an error case, safe fallback is good)
    return [];
  }

  return expenses || [];
}
