import { PersistableExpense } from '../types';

/**
 * Formats a message for a receipt that was saved but has missing details.
 * 
 * Rules:
 * - Tone: Calm and reassuring.
 * - Specifically mention if total_amount is missing.
 * - Use general "some details may be missing" for other cases.
 */
export function formatPartialMessage(
  expense: Pick<PersistableExpense, 'total_amount'>,
  validationErrors: string[] = []
): string {
  // Check specifically for missing amount, as it's the most critical field.
  // Validation errors might include 'total_amount' or caller might just pass null expense.total_amount
  const isAmountMissing = expense.total_amount === null || 
                          expense.total_amount === undefined || 
                          validationErrors.includes('total_amount');

  if (isAmountMissing) {
    return '⚠️ Saved receipt, but I couldn’t find the total amount.';
  }

  if (validationErrors.length > 0) {
    return '⚠️ Saved receipt, but some details may be missing.';
  }

  // Fallback if called without errors but maybe just paranoid check
  return '⚠️ Saved receipt, but please check the details.';
}
