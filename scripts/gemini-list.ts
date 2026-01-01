import { GEMINI_API_KEY } from '../lib/env';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

async function main() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${t}`);
  }
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

