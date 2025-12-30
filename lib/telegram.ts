import './env';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Sends a message via Telegram Bot API.
 * 
 * Rules:
 * - Do NOT throw if sending fails.
 * - Log errors only.
 * - Used for sending confirmation messages back to the user.
 */
export async function sendTelegramConfirmation(chatId: number | string, messageText: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is missing. Cannot send confirmation.');
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Failed to send Telegram message: ${response.status} ${response.statusText}`, errorData);
    } else {
      // Success case - silent or debug log
      // console.log(`✅ Telegram message sent to ${chatId}`);
    }
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error);
  }
}
