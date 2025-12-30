import { sendTelegramConfirmation } from '../lib/feedback/sendTelegramConfirmation';

async function testTelegram() {
  console.log('🧪 Testing sendTelegramConfirmation');

  // Case 1: Send message (Mocked environment or real if token exists)
  // Note: This test assumes TELEGRAM_BOT_TOKEN is in .env.local
  // If not, it will log the missing token error, which is expected behavior.
  
  // Using a dummy chat ID for safety if running in CI/CD, 
  // but for local dev, user might want to test with real ID.
  const TEST_CHAT_ID = '123456789'; 

  console.log(`Sending message to chat ID: ${TEST_CHAT_ID}`);
  await sendTelegramConfirmation(TEST_CHAT_ID, 'Hello from test script! 🧪');

  console.log('---');
  console.log('Test completed (check console for errors or success logs)');
}

testTelegram().catch(console.error);
