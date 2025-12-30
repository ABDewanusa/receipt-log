import { PersistableExpense } from './types';

/**
 * Formats a success message for a saved expense.
 * 
 * Rules:
 * - Include merchant if available.
 * - Include total_amount and currency if available.
 * - Do NOT include IDs or dates.
 * - Format: "Receipt saved: [Merchant] [Currency] [Amount]" or partials.
 */
export function formatSuccessMessage(
  expense: Pick<PersistableExpense, 'merchant' | 'total_amount' | 'currency'>
): string {
  const parts: string[] = [];

  if (expense.merchant) {
    parts.push(expense.merchant);
  }

  if (expense.total_amount !== null && expense.total_amount !== undefined) {
    const currency = expense.currency || 'IDR';
    // Format number with locale string for readability (e.g. 50.000)
    // Using 'id-ID' style for 1.000 separator.
    const formattedAmount = expense.total_amount.toLocaleString('id-ID'); 
    parts.push(`${currency} ${formattedAmount}`);
  }

  if (parts.length === 0) {
    return 'Receipt saved.';
  }

  return `Receipt saved: ${parts.join(' ')}`;
}

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

/**
 * Formats a generic failure message.
 * 
 * Rules:
 * - Polite and concise.
 * - No technical details or error codes.
 * - No debugging instructions.
 */
export function formatFailureMessage(): string {
  return '❌ Sorry, I couldn’t save this receipt. Please try again.';
}
