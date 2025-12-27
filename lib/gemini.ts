import './env';
import fs from 'fs';
import path from 'path';
import { ExtractionResult } from './types';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const prompt = fs.readFileSync(path.resolve(process.cwd(), 'AI_EXTRACTION_PROMPT.md'), 'utf8');
const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

export async function extractWithGemini(imageBuffer: Buffer, mimeType = 'image/jpeg'): Promise<string> {
  try {
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBuffer.toString('base64') } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return t;
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.output_text ??
      '';
    return text;
  } catch {
    return '';
  }
}

export function parseExtractionText(text: string): ExtractionResult {
  const fallback: ExtractionResult = {
    merchant: null,
    total_amount: null,
    currency: null,
    date: null,
  };
  try {
    const obj = JSON.parse(text);
    const valid =
      obj &&
      (typeof obj.merchant === 'string' || obj.merchant === null) &&
      (typeof obj.total_amount === 'number' || obj.total_amount === null) &&
      (typeof obj.currency === 'string' || obj.currency === null) &&
      (typeof obj.date === 'string' || obj.date === null);
    if (!valid) return fallback;
    return {
      merchant: obj.merchant ?? null,
      total_amount: obj.total_amount ?? null,
      currency: obj.currency ?? null,
      date: obj.date ?? null,
    };
  } catch {
    return fallback;
  }
}

export async function extractReceipt(
  imageBuffer: Buffer,
  mimeType = 'image/jpeg'
): Promise<{ rawText: string; parsed: ExtractionResult }> {
  const rawText = await extractWithGemini(imageBuffer, mimeType);
  const parsed = parseExtractionText(rawText);
  return { rawText, parsed };
}
