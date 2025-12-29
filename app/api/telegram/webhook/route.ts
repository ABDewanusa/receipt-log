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

    // TODO: Pass 'body.message' to bot logic
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error parsing webhook body:', error);
    // Even on error, we often want to return 200 to Telegram to stop it from retrying
    // But for invalid JSON request itself, 400 is appropriate if it didn't come from Telegram
    return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
  }
}
