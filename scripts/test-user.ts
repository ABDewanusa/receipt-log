import '../lib/env'; // Load env vars
import { getOrCreateUser } from '../lib/users';
import { supabase } from '../lib/supabase';

async function testUserCreation() {
  const TEST_TELEGRAM_ID = 12345;

  console.log(`\n🧪 Testing getOrCreateUser with Telegram ID: ${TEST_TELEGRAM_ID}`);

  // Clean up any existing test user first to ensure fresh state
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('telegram_user_id', TEST_TELEGRAM_ID);
  
  if (deleteError) {
    console.error('⚠️ Failed to clean up existing test user:', deleteError);
  } else {
    console.log('🧹 Cleaned up any previous test user data.');
  }

  // 1. First Call - Should create user
  console.log('\n--- Round 1: Creating User ---');
  const userId1 = await getOrCreateUser(TEST_TELEGRAM_ID);
  console.log(`✅ Returned User ID 1: ${userId1}`);

  // Verify DB state
  const { data: user1, error: error1 } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_user_id', TEST_TELEGRAM_ID);
  
  if (error1 || !user1) {
    console.error('❌ Failed to fetch user for verification:', error1);
    process.exit(1);
  }
  console.log(`📊 DB Rows Found: ${user1.length}`);
  if (user1.length !== 1) {
    console.error('❌ ERROR: Expected exactly 1 row.');
    process.exit(1);
  }

  // 2. Second Call - Should return same user
  console.log('\n--- Round 2: Fetching Existing User ---');
  const userId2 = await getOrCreateUser(TEST_TELEGRAM_ID);
  console.log(`✅ Returned User ID 2: ${userId2}`);

  if (userId1 !== userId2) {
    console.error(`❌ ERROR: User IDs do not match! ${userId1} vs ${userId2}`);
    process.exit(1);
  } else {
    console.log('✅ Success: User IDs match.');
  }

  // Verify DB state again (ensure no duplicate rows)
  const { data: user2, error: error2 } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_user_id', TEST_TELEGRAM_ID);

  if (error2) {
    console.error('❌ Failed to fetch user for verification round 2:', error2);
    process.exit(1);
  }
  console.log(`📊 DB Rows Found: ${user2?.length}`);

  if (user2?.length === 1) {
    console.log('✅ TEST PASSED: Single row maintained, ID persisted.');
  } else {
    console.error(`❌ TEST FAILED: Found ${user2?.length} rows.`);
    process.exit(1);
  }
}

testUserCreation();
