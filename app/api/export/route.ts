import { NextRequest } from 'next/server';
import { getExpensesForUser } from '../../../lib/export/fetchUserExpenses';
import { generateExpensesCSV } from '../../../lib/export/generateCsv';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tid = searchParams.get('tid');

  if (!tid) {
    return new Response('Missing telegram_user_id (tid)', { status: 400 });
  }

  // 1. Fetch expenses
  const expenses = await getExpensesForUser(tid);

  // 2. Generate CSV
  const csv = generateExpensesCSV(expenses);

  // 3. Return CSV response
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="expenses-${tid}.csv"`,
    },
  });
}
