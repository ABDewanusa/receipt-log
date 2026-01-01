import { Expense } from './fetchUserExpenses';

/**
 * Converts expenses into a CSV string.
 * Columns: date, merchant, total_amount, currency
 * 
 * @param expenses List of expenses
 * @returns string CSV content
 */
export function generateExpensesCSV(expenses: Expense[]): string {
  const header = 'date,merchant,total_amount,currency';
  
  const rows = expenses.map(expense => {
    const date = expense.date || '';
    // Escape quotes in merchant if necessary, though usually simple strings. 
    // For simple CSV, we'll just replace " with "" and wrap in quotes if it contains , or "
    const merchant = escapeCsvField(expense.merchant || '');
    const totalAmount = expense.total_amount !== null ? expense.total_amount.toString() : '';
    const currency = expense.currency || '';

    return `${date},${merchant},${totalAmount},${currency}`;
  });

  return [header, ...rows].join('\n');
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
