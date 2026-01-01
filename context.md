Project: ReceiptLog (MVP)

Stage:
Validation Ready.
The core MVP features are implemented and ready for deployment/testing.

Primary Goal:
Telegram receipt → structured expense → CSV export/Web View.

Current Status:
- Telegram Bot:
    - /start: Implemented.
    - /export: Implemented (Sends CSV).
    - /web: Implemented (Sends Magic Link).
    - Photo Handling: Implemented (Compress -> R2 -> Gemini -> DB).
- Web Dashboard:
    - Read-only list of expenses: Implemented.
    - Export CSV button: Implemented.
    - Empty states: Implemented.
- Backend:
    - Next.js 15+ Server Components.
    - Supabase (Postgres) for data.
    - Cloudflare R2 for storage.
    - Gemini 1.5 Flash for extraction.
    - Environment variables centralized and secured.

Deviations from Plan:
- Dashboard: Minimal implementation, relies on URL query param for user lookup.

Next Steps (Validation):
1. Deploy to Vercel.
2. Set up real Telegram Webhook.
3. Perform end-to-end test with real receipts.
4. Verify CSV output format.

Hard Rules:
- Follow BUILD_CONTRACT.md
- Optimize for shipping
- Free-tier friendly only (Vercel)

Definition of Success:
User can export a usable CSV within 2 minutes of sending a receipt.
