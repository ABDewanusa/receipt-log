import './env'; // Must be first
import TelegramBot from 'node-telegram-bot-api';
import { v4 as uuidv4 } from 'uuid';
import { uploadReceiptImage } from './r2';
import { compressImage } from './image';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Initialize bot with polling
const bot = new TelegramBot(token, { polling: true });

console.log('Bot started with polling...');

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
👋 Welcome to ReceiptLog!

Send me a photo of a receipt and I’ll turn it into an expense you can export as CSV.
  `.trim();

  bot.sendMessage(chatId, welcomeMessage);
});

// Handle photo messages
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!msg.photo || msg.photo.length === 0 || !userId) {
    return;
  }

  // Acknowledge receipt immediately
  const processingMsg = await bot.sendMessage(chatId, 'Receipt received! Processing...');
  
  const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
  console.log(`Received photo: ${photo.file_id} from User: ${userId}`);

  try {
    // Download photo as buffer
    const fileLink = await bot.getFileLink(photo.file_id);
    const arrayBuffer = await (await fetch(fileLink)).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate mime type
    // Dynamic import because file-type is ESM only
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(buffer);

    if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
      await bot.sendMessage(chatId, '❌ Invalid file format. Please send a JPG or PNG image.');
      return;
    }

    // Compress image
    const compressedBuffer = await compressImage(buffer);

    // Generate UUID and upload to R2
    const expenseId = uuidv4();
    await uploadReceiptImage(userId, expenseId, compressedBuffer);

    console.log(`Uploaded receipt: ${expenseId} for User: ${userId}`);
    await bot.sendMessage(chatId, `✅ Receipt saved! ID: ${expenseId}`);
  } catch (error) {
    console.error('Error processing photo:', error);
    await bot.sendMessage(chatId, '⚠️ I couldn’t save this image. Please try again.');
  }
});

// Export for potential future use (though strictly standalone for now)
export default bot;
