import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    
    // Minimal validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ status: 'ok', message: 'Ignored: Invalid payload' });
    }

    // Ignore updates without 'message' (e.g., edited_message, channel_post, etc.)
    if (!('message' in body)) {
      return NextResponse.json({ status: 'ok', message: 'Ignored: Not a message update' });
    }

    // -------------------------------------------------------------------------
    // RULE: Ensure 200 OK Within Time Limit (Acknowledge first, process later)
    // -------------------------------------------------------------------------
    // We must return immediately to prevent Telegram timeouts.
    // Complex processing (Gemini, R2) should be handled asynchronously 
    // (e.g., via `after()`, queues, or background jobs) in future steps.
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error parsing webhook body:', error);
    // Even on error, we often want to return 200 to Telegram to stop it from retrying
    // But for invalid JSON request itself, 400 is appropriate if it didn't come from Telegram
    return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
  }
}
