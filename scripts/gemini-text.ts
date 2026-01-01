import { GEMINI_API_KEY } from '../lib/env';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

async function main() {
  const prompt = 'Say hello in one short sentence.';
  const res = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini request failed: ${res.status} ${res.statusText} - ${errText}`);
  }
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.output_text ??
    '';
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
