import '../lib/env'; // Ensure env vars are loaded
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

async function main() {
  // Dynamic import to ensure env vars are loaded first
  const { uploadReceiptImage, getReceiptImage } = await import('../lib/r2');

  console.log('--- R2 Test Start (Real Image) ---');

  const telegramUserId = 123456789;
  const expenseId = randomUUID();
  
  // Read local test image
  const imagePath = path.resolve(__dirname, 'test-receipt.jpeg');
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  console.log(`Loaded image: ${imagePath} (${imageBuffer.length} bytes)`);

  console.log(`Testing with User: ${telegramUserId}, Expense: ${expenseId}`);

  try {
    // 1. Upload
    console.log('1. Uploading image...');
    await uploadReceiptImage(telegramUserId, expenseId, imageBuffer);
    console.log('✅ Upload successful');

    // 2. Download
    console.log('2. Fetching image...');
    const fetchedBuffer = await getReceiptImage(telegramUserId, expenseId);
    console.log(`✅ Fetch successful (${fetchedBuffer.length} bytes)`);

    // 3. Verify content
    if (fetchedBuffer.equals(imageBuffer)) {
      console.log('✅ Content matches exactly!');
    } else {
      console.error('❌ Content mismatch!');
      console.error('Expected bytes:', imageBuffer.length);
      console.error('Received bytes:', fetchedBuffer.length);
    }

  } catch (error) {
    console.error('❌ Error during R2 test:', error);
  } finally {
    console.log('--- R2 Test End ---');
  }
}

main();
