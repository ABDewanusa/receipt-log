import { NextResponse } from 'next/server';
import { processReceipt } from '../../../../lib/processReceipt';
import { handleStartCommand } from '../../../../lib/bot';
import { sendTelegramConfirmation } from '../../../../lib/feedback/sendTelegramConfirmation';
import { formatSuccessMessage } from '../../../../lib/feedback/formatSuccessMessage';
import { formatPartialMessage } from '../../../../lib/feedback/formatPartialMessage';
import { formatFailureMessage } from '../../../../lib/feedback/formatFailureMessage';
import { getExpensesForUser } from '../../../../lib/export/fetchUserExpenses';
import { generateExpensesCSV } from '../../../../lib/export/generateCsv';
import { sendCsvViaTelegram } from '../../../../lib/export/sendCsvViaTelegram';
import { APP_URL } from '../../../../lib/env';
import { signToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Minimal validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ status: 'ok', message: 'Ignored: Invalid payload' });
    }

    // Ignore updates without 'message'
    if (!('message' in body)) {
      return NextResponse.json({ status: 'ok', message: 'Ignored: Not a message update' });
    }

    const msg = body.message;
    const chatId = msg.chat.id;

    // Handle Text-Only Messages (Onboarding / Help / Export)
    if (msg.text && !msg.photo) {
      if (msg.text === '/export') {
        // Fetch expenses
        const expenses = await getExpensesForUser(msg.from.id);

        // Handle empty dataset
        if (expenses.length === 0) {
          await sendTelegramConfirmation(chatId, "You don't have any expenses recorded yet. Send me a receipt to get started!");
          return NextResponse.json({ status: 'ok' });
        }

        // Generate CSV
        const csv = generateExpensesCSV(expenses);

        // Send CSV via Telegram
        await sendCsvViaTelegram(chatId, csv, 'expenses.csv');
        return NextResponse.json({ status: 'ok' });
      }

      if (msg.text === '/web') {
        const token = signToken({ tid: msg.from.id });
        const url = `${APP_URL}/web?token=${token}`;
        await sendTelegramConfirmation(chatId, `Here is your dashboard link (valid for 1 hour):\n${url}`);
        return NextResponse.json({ status: 'ok' });
      }

      await handleStartCommand(msg);
      return NextResponse.json({ status: 'ok' });
    }

    // Check for photo
    if (msg.photo && msg.photo.length > 0) {
       // Optional: Send "Processing..." typing status or message?
       // For now, keeping it simple as per instructions.
       
       const result = await processReceipt(msg);

       if (result.success && result.expense) {
           const { expense } = result;
           // Determine User-Facing Outcome
           
           // Case 1: Success (Total amount present)
           if (expense.total_amount !== null && expense.total_amount !== undefined) {
               const text = formatSuccessMessage(expense);
               await sendTelegramConfirmation(chatId, text);
           } 
           // Case 2: Partial (Expense saved, but total_amount missing)
           else {
               const text = formatPartialMessage(expense, expense.raw_extraction.missing_fields);
               await sendTelegramConfirmation(chatId, text);
           }
       } else {
           // Case 3: Failure (Persistence failed)
           const text = formatFailureMessage();
           await sendTelegramConfirmation(chatId, text);
       }
    } else {
        // Handle non-photo messages? (e.g. /start)
        // Ignoring for now based on strict task scope, but usually good to handle /start.
        // User didn't ask for /start handling here, just the receipt flow.
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to Telegram to prevent retries of bad payloads
    return NextResponse.json({ status: 'ok' }); 
  }
}
