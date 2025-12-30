import { formatSuccessMessage } from '../lib/feedback/formatSuccessMessage';
import { formatPartialMessage } from '../lib/feedback/formatPartialMessage';
import { formatFailureMessage } from '../lib/feedback/formatFailureMessage';

console.log('🧪 Testing formatSuccessMessage\n');

// ... (Existing formatSuccessMessage tests) ...

// Test Case 5: Custom Currency
const expense5 = {
  merchant: 'Apple Store',
  total_amount: 999,
  currency: 'USD'
};
console.log(`Input: ${JSON.stringify(expense5)}`);
console.log(`Output: "${formatSuccessMessage(expense5)}"`);
console.log('---');

console.log('\n🧪 Testing formatPartialMessage\n');

// Test Case 6: Missing Amount
const partial1 = { total_amount: null };
console.log(`Input: ${JSON.stringify(partial1)}, errors: []`);
console.log(`Output: "${formatPartialMessage(partial1)}"`);
console.log('---');

// Test Case 7: Missing Amount (Explicit Error)
const partial2 = { total_amount: 50000 }; // Has amount but flagged as missing in errors? (Simulating inconsistent state or other fields missing)
const errors2 = ['total_amount'];
console.log(`Input: ${JSON.stringify(partial2)}, errors: ${JSON.stringify(errors2)}`);
console.log(`Output: "${formatPartialMessage(partial2, errors2)}"`);
console.log('---');

// Test Case 8: Missing Merchant (Amount OK)
const partial3 = { total_amount: 50000 };
const errors3 = ['merchant'];
console.log(`Input: ${JSON.stringify(partial3)}, errors: ${JSON.stringify(errors3)}`);
console.log(`Output: "${formatPartialMessage(partial3, errors3)}"`);
console.log('---');

// Test Case 9: Missing Date (Amount OK)
const partial4 = { total_amount: 50000 };
const errors4 = ['date'];
console.log(`Input: ${JSON.stringify(partial4)}, errors: ${JSON.stringify(errors4)}`);
console.log(`Output: "${formatPartialMessage(partial4, errors4)}"`);
console.log('---');

console.log('\n🧪 Testing formatFailureMessage\n');

// Test Case 10: Generic Failure
console.log('Calling formatFailureMessage()');
console.log(`Output: "${formatFailureMessage()}"`);
console.log('---');

