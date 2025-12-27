import '../lib/env';
import fs from 'fs';
import path from 'path';
import { extractReceipt } from '../lib/gemini';

async function main() {
  const imgPath = path.resolve(process.cwd(), 'scripts', 'test-receipt.jpeg');
  const buffer = fs.readFileSync(imgPath);
  const { rawText, parsed } = await extractReceipt(buffer, 'image/jpeg');
  console.log('RAW:', rawText);
  console.log('PARSED:', parsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

