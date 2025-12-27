import sharp from 'sharp';

/**
 * Compresses an image buffer for storage.
 * - Resizes to max width 1200px (maintaining aspect ratio)
 * - Converts to JPEG with 80% quality
 * 
 * @param buffer The input image buffer
 * @returns The compressed image buffer
 */
export async function compressImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px, keep aspect ratio
    .jpeg({ quality: 80 }) // Convert to JPEG, quality 80
    .toBuffer();
}
