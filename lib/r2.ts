import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// R2 requires a specific endpoint, often https://<account_id>.r2.cloudflarestorage.com
// We use the 'auto' region as per Cloudflare docs.
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('Missing R2 environment variables');
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a receipt image buffer to R2.
 * Path: receipts/{telegram_user_id}/{expense_id}.jpg
 */
export async function uploadReceiptImage(
  telegramUserId: number | string,
  expenseId: string,
  imageBuffer: Buffer
): Promise<void> {
  const key = `receipts/${telegramUserId}/${expenseId}.jpg`;

  try {
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
    }));
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error(`Failed to upload receipt image to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches a receipt image buffer from R2.
 * Path: receipts/{telegram_user_id}/{expense_id}.jpg
 */
export async function getReceiptImage(
  telegramUserId: number | string,
  expenseId: string
): Promise<Buffer> {
  const key = `receipts/${telegramUserId}/${expenseId}.jpg`;

  const { Body } = await r2.send(new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  }));

  if (!Body) {
    throw new Error(`Image not found in R2: ${key}`);
  }

  // Transform the stream to a Buffer (available in AWS SDK v3)
  const byteArray = await Body.transformToByteArray();
  return Buffer.from(byteArray);
}
