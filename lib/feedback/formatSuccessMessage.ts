import { PersistableExpense } from '../types';

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
