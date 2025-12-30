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
    missing_fields: ['merchant', 'total_amount', 'currency', 'date'],
    status: 'error',
    raw_text: text || '', // Ensure raw text is preserved even in fallback
  };

  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object') return fallback;

    // 1. Validate & Normalize fields
    let merchant = typeof obj.merchant === 'string' ? obj.merchant.trim() : null;
    if (merchant === '') merchant = null;

    let total_amount = typeof obj.total_amount === 'number' ? obj.total_amount : null;
    // Validate total_amount > 0
    if (total_amount !== null && total_amount <= 0) {
      total_amount = null;
    }

    let currency = typeof obj.currency === 'string' ? obj.currency.trim().toUpperCase() : null;
    // Basic currency validation (3 letters)
    if (currency && currency.length !== 3) {
      // If it's not 3 letters, maybe it's a symbol? For now, if strictly 3 chars is expected:
      // But let's just normalize case. If it's "Rp", we might want "IDR". 
      // For now, just uppercase.
    }

    let date = typeof obj.date === 'string' ? obj.date.trim() : null;
    // Parse date safely
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        date = null; // Invalid date string
      } else {
        // Optional: Standardize format (e.g. YYYY-MM-DD), but keeping original string if valid is safer for now
        // unless we want to force ISO. Let's keep it if valid.
      }
    }

    // 2. Identify missing values
    const missing_fields: string[] = [];
    if (!merchant) missing_fields.push('merchant');
    if (total_amount === null) missing_fields.push('total_amount');
    if (!currency) missing_fields.push('currency');
    if (!date) missing_fields.push('date');

    // 3. Determine status
    // If any field is missing, it's incomplete.
    // If all fields are missing/null, it might be 'error' or just very incomplete.
    // Let's use 'incomplete' if parsing succeeded but fields are null.
    const status = missing_fields.length === 0 ? 'complete' : 'incomplete';

    return {
      merchant,
      total_amount,
      currency,
      date,
      missing_fields,
      status,
      raw_text: text, // Store successful raw text
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
