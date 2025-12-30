import '../lib/env';
import { getOrCreateUser } from '../lib/users';
import { insertExpense } from '../lib/db/insertExpense';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { PersistableExpense } from '../lib/types';

async function main() {
  const TEST_TELEGRAM_ID = 999888;
  console.log(`\n🧪 Testing insertExpense with Telegram ID: ${TEST_TELEGRAM_ID}`);

  try {
    const userId = await getOrCreateUser(TEST_TELEGRAM_ID);
    console.log(`✅ User ID: ${userId}`);

    // Test 1: Successful Insertion (Normal Case)
    console.log('\n--- Test 1: Successful Insertion ---');
    const expenseId1 = uuidv4();
    const mockExpense1: PersistableExpense = {
      id: expenseId1,
      user_id: userId,
      merchant: 'Test Cafe',
      total_amount: 50000,
      currency: 'IDR',
      date: new Date().toISOString().split('T')[0],
      raw_extraction: {
        merchant: 'Test Cafe',
        total_amount: 50000,
        currency: 'IDR',
        date: '2025-01-01',
        missing_fields: [],
        status: 'complete',
        raw_text: '{"merchant": "Test Cafe", "total_amount": 50000, "currency": "IDR", "date": "2025-01-01"}'
      },
      image_path: 'test/path/image.jpg'
    };
    await insertExpense(mockExpense1);
    console.log('✅ Success: Normal expense inserted.');
    await supabase.from('expenses').delete().eq('id', expenseId1); // Cleanup

    // Test 2: Missing Image Path (Should Fail)
    console.log('\n--- Test 2: Missing Image Path (Should Fail) ---');
    const expenseId2 = uuidv4();
    const mockExpense2: PersistableExpense = {
      ...mockExpense1,
      id: expenseId2,
      image_path: null, // Simulate upload failure
    };
    try {
      await insertExpense(mockExpense2);
      console.error('❌ FAIL: Should have thrown error for missing image_path');
      process.exit(1);
    } catch (err: any) {
      if (err.message.includes('image_path is missing')) {
        console.log('✅ Success: Caught expected error for missing image_path.');
      } else {
        console.error('❌ FAIL: Caught unexpected error:', err);
        process.exit(1);
      }
    }

    // Test 3: Failed Extraction (Should Succeed with Nulls)
    console.log('\n--- Test 3: Failed Extraction (Should Succeed) ---');
    const expenseId3 = uuidv4();
    const mockExpense3: PersistableExpense = {
      id: expenseId3,
      user_id: userId,
      merchant: null,
      total_amount: null,
      currency: 'IDR',
      date: null,
      raw_extraction: {
        merchant: null,
        total_amount: null,
        currency: null,
        date: null,
        missing_fields: ['merchant', 'total_amount', 'date'],
        status: 'error',
        raw_text: 'INVALID JSON RESPONSE FROM GEMINI'
      },
      image_path: 'test/path/failed_extraction.jpg' // Image upload succeeded, extraction failed
    };
    await insertExpense(mockExpense3);
    console.log('✅ Success: Expense with failed extraction inserted.');
    
    // Verify Test 3 in DB
    const { data: fetchedExpense3 } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId3)
      .single();
      
    if (fetchedExpense3 && 
        fetchedExpense3.merchant === null && 
        fetchedExpense3.image_path &&
        fetchedExpense3.raw_extraction.raw_text === 'INVALID JSON RESPONSE FROM GEMINI') {
      console.log('✅ Verified: DB row exists with null fields, image_path, and preserved raw_text.');
    } else {
      console.error('❌ FAIL: DB verification for Test 3 failed.');
      console.error('Fetched Data:', fetchedExpense3);
      process.exit(1);
    }
    await supabase.from('expenses').delete().eq('id', expenseId3); // Cleanup

    // Test 4: Missing raw_text (Should Fail)
    console.log('\n--- Test 4: Missing raw_text (Should Fail) ---');
    const expenseId4 = uuidv4();
    const mockExpense4: PersistableExpense = {
        ...mockExpense1,
        id: expenseId4,
        // @ts-ignore - Forcing invalid type to test runtime check
        raw_extraction: {
            ...mockExpense1.raw_extraction,
            raw_text: undefined
        }
    };
    try {
        await insertExpense(mockExpense4);
        console.error('❌ FAIL: Should have thrown error for missing raw_text');
        process.exit(1);
    } catch (err: any) {
        if (err.message.includes('raw_extraction is missing or invalid')) {
            console.log('✅ Success: Caught expected error for missing raw_text.');
        } else {
            console.error('❌ FAIL: Caught unexpected error:', err);
            process.exit(1);
        }
    }

    // Test 5: URL in image_path (Should Fail)
    console.log('\n--- Test 5: URL in image_path (Should Fail) ---');
    const expenseId5 = uuidv4();
    const mockExpense5: PersistableExpense = {
        ...mockExpense1,
        id: expenseId5,
        image_path: 'https://r2.cloudflarestorage.com/bucket/image.jpg'
    };
    try {
        await insertExpense(mockExpense5);
        console.error('❌ FAIL: Should have thrown error for URL in image_path');
        process.exit(1);
    } catch (err: any) {
        if (err.message.includes('not a URL')) {
            console.log('✅ Success: Caught expected error for URL in image_path.');
        } else {
            console.error('❌ FAIL: Caught unexpected error:', err);
            process.exit(1);
        }
    }

    // Test 6: DB Constraint Violation (Should NOT Throw, Just Log)
    console.log('\n--- Test 6: DB Constraint Violation (Should NOT Throw) ---');
    const expenseId6 = uuidv4();
    const invalidUserId = uuidv4(); // Random UUID not in users table
    const mockExpense6: PersistableExpense = {
        ...mockExpense1,
        id: expenseId6,
        user_id: invalidUserId
    };
    try {
        await insertExpense(mockExpense6);
        console.log('✅ Success: insertExpense did not throw on DB error.');
    } catch (err) {
        console.error('❌ FAIL: insertExpense threw an error:', err);
        process.exit(1);
    }

    console.log('\n✅ All Tests Completed Successfully.');

  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

main();
