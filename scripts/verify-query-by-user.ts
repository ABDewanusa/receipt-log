import '../lib/env';
import { supabase } from '../lib/supabase';
import { insertExpense } from '../lib/db/insertExpense';
import { getOrCreateUser } from '../lib/users';
import { v4 as uuidv4 } from 'uuid';
import { PersistableExpense } from '../lib/types';

async function main() {
  const TEST_TELEGRAM_ID = 123456789;
  console.log(`\n🧪 Verifying Immediate Queryability for Telegram ID: ${TEST_TELEGRAM_ID}`);

  try {
    // 1. Get/Create User
    const userId = await getOrCreateUser(TEST_TELEGRAM_ID);
    console.log(`✅ User ID: ${userId}`);

    // 2. Prepare Expense
    const expenseId = uuidv4();
    const mockExpense: PersistableExpense = {
      id: expenseId,
      user_id: userId,
      merchant: 'Immediate Query Test',
      total_amount: 777000,
      currency: 'IDR',
      date: new Date().toISOString().split('T')[0],
      raw_extraction: {
        merchant: 'Immediate Query Test',
        total_amount: 777000,
        currency: 'IDR',
        date: '2025-01-01',
        missing_fields: [],
        status: 'complete',
        raw_text: '{"merchant": "Immediate Query Test", "total_amount": 777000}'
      },
      image_path: 'test/query/verification.jpg'
    };

    // 3. Insert Expense
    console.log(`\n📤 Inserting expense ID: ${expenseId}...`);
    const success = await insertExpense(mockExpense);
    if (!success) {
        throw new Error('Insertion failed unexpectedly.');
    }
    console.log('✅ Insertion successful.');

    // 4. Immediately Query by User ID
    console.log(`\n🔍 Querying expenses for user_id: ${userId} immediately...`);
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('id', expenseId); // Be specific to this test run

    if (error) {
      console.error('❌ Query Error:', error);
      process.exit(1);
    }

    if (expenses && expenses.length > 0) {
      console.log('✅ Expense found immediately!');
      console.log('Fetched Data:', expenses[0]);
    } else {
      console.error('❌ FAIL: Expense not found immediately after insertion.');
      process.exit(1);
    }

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('expenses').delete().eq('id', expenseId);
    console.log('✅ Cleanup complete.');

  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

main();
