import { supabase } from '../../lib/supabase';
import { getUserByTelegramId } from '../../lib/users';

export default async function WebPage(props: {
  searchParams: Promise<{ tid?: string }>;
}) {
  const searchParams = await props.searchParams;
  const tid = searchParams.tid;

  if (!tid) {
    return (
      <div className="p-8 font-sans text-center">
        <h1 className="text-xl font-bold mb-4">Whoops!</h1>
        <p>We need your Telegram ID to show your receipts. Please open this link from the Telegram bot.</p>
      </div>
    );
  }

  // Lookup user (do not create)
  const userId = await getUserByTelegramId(tid);

  if (!userId) {
    return (
      <div className="p-8 font-sans max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Hello there!</h1>
        <p className="text-lg text-gray-600 mb-6">
          We don't have any records for you yet. Send a receipt to the bot to get started.
        </p>
      </div>
    );
  }

  // Fetch Expenses
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return (
      <div className="p-8 font-sans">
        <h1 className="text-xl font-bold mb-4">Error</h1>
        <p>Failed to load expenses.</p>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Expenses</h1>
        <a 
          href={`/api/export?tid=${tid}`}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
        >
          Export CSV
        </a>
      </div>
      
      {expenses && expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xl font-medium text-gray-800 mb-2">All caught up!</p>
          <p className="text-gray-500">You haven't tracked any expenses yet. Send a receipt to the bot to add one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Merchant</th>
                <th className="py-2 px-4 border-b text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {expenses?.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {expense.date || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {expense.merchant || <span className="text-gray-400">Unknown</span>}
                  </td>
                  <td className="py-2 px-4 border-b text-right font-mono">
                    {expense.currency || ''} {expense.total_amount?.toLocaleString() ?? <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
