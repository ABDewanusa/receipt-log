import TelegramBot from 'node-telegram-bot-api';
import { v4 as uuidv4 } from 'uuid';
import { compressImage } from './image';
import { uploadReceiptImage } from './r2';
import { extractReceipt } from './gemini';
import { insertExpense } from './db/insertExpense';
import { getOrCreateUser } from './users';
import { PersistableExpense } from './types';
import bot from './bot';

export interface ProcessReceiptResult {
  success: boolean;
  expense?: PersistableExpense;
  error?: any;
}

export async function processReceipt(msg: TelegramBot.Message): Promise<ProcessReceiptResult> {
  try {
    const telegramUserId = msg.from?.id;
    if (!telegramUserId) throw new Error('No user ID found in message');

    const photo = msg.photo?.[msg.photo.length - 1];
    if (!photo) throw new Error('No photo found in message');

    // 1. Get File Link & Download
    // Note: bot.getFileLink uses the token to query Telegram API
    const fileLink = await bot.getFileLink(photo.file_id);
    const response = await fetch(fileLink);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Compress
    const compressedBuffer = await compressImage(buffer);

    // 3. Upload to R2 (Using Telegram ID for path is fine/intended)
    const expenseId = uuidv4();
    await uploadReceiptImage(telegramUserId, expenseId, compressedBuffer);
    const imagePath = `receipts/${telegramUserId}/${expenseId}.jpg`;

    // 4. Resolve User ID (Telegram ID -> Internal UUID)
    // This looks up the user in the DB and returns their UUID
    const internalUserId = await getOrCreateUser(telegramUserId);

    // 5. Extract
    const { rawText, parsed } = await extractReceipt(compressedBuffer);

    // 6. Prepare Expense
    const expense: PersistableExpense = {
      id: expenseId,
      user_id: internalUserId, // Use the Internal UUID here
      merchant: parsed.merchant,
      total_amount: parsed.total_amount,
      currency: parsed.currency,
      date: parsed.date,
      raw_extraction: {
        raw_text: rawText,
        ...parsed
      },
      image_path: imagePath
    };

    // 7. Insert
    const dbSuccess = await insertExpense(expense);
    
    if (!dbSuccess) {
        return { success: false, expense, error: 'Database insertion failed' };
    }

    return { success: true, expense };

  } catch (error) {
    console.error('Error in processReceipt:', error);
    return { success: false, error };
  }
}
