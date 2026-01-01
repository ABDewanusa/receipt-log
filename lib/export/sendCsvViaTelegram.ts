import { TELEGRAM_BOT_TOKEN } from '../env';

/**
 * Sends a CSV file to a Telegram user.
 * 
 * @param chatId The Telegram chat ID (usually same as user ID)
 * @param csvContent The CSV string content
 * @param filename The filename for the attachment
 */
export async function sendCsvViaTelegram(chatId: number | string, csvContent: string, filename: string = 'expenses.csv'): Promise<void> {
  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  
  // Create a Blob from the CSV string
  const blob = new Blob([csvContent], { type: 'text/csv' });
  formData.append('document', blob, filename);

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram sendDocument failed:', data);
      throw new Error(`Failed to send CSV: ${data.description}`);
    }
  } catch (error) {
    console.error('Error sending CSV via Telegram:', error);
    throw error;
  }
}
