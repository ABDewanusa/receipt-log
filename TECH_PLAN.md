# ReceiptLog — MVP Tech Plan / Implementation Document

## Purpose

This document defines **how** the ReceiptLog MVP will be built.

It translates the PRD into concrete technical decisions, boundaries, and build steps. Unlike the PRD, this document **may change during development**.

Primary goal:

> Ship a working Telegram → receipt → structured data → CSV flow as fast and safely as possible, using free tiers.

---

## High-Level Architecture

```
Telegram User
   ↓ (photo / command)
Telegram Bot API (Webhooks)
   ↓
Next.js (Vercel Serverless Functions)
   ├─ POST /api/telegram-webhook (Bot Logic)
   │    ├─ Image compression
   │    ├─ AI extraction (Gemini)
   │    ├─ Parsing & validation
   │    └─ Database writes (Supabase)
   │
   └─ Web Frontend (Next.js App Router)
        ├─ GET /dashboard (Magic Link Auth)
        └─ GET /api/export (CSV Download)
   
   ↓
Supabase (Postgres) & Cloudflare R2 (Storage)
```

The backend is the **single source of truth**. No client talks directly to the database or storage except the Next.js backend.

---

## Tech Stack (Locked for MVP)

### Client

- **Telegram Bot** (Primary Input)
- **Web Dashboard** (Read-only View)

### Backend & Hosting

- **Next.js** (App Router)
- **Vercel** (Hosting & Serverless Functions)

### AI / Extraction

- Gemini Vision API
- Image + prompt → structured JSON

### Database

- Supabase (Postgres)

### Object Storage

- Cloudflare R2
- Compressed receipt images only

### Languages & Libraries

- TypeScript
- Node.js
- `node-telegram-bot-api` (Webhook mode)
- `sharp` (Image compression)
- `csv-stringify` (CSV generation)

---

## Environment Separation

### Environments

- **Local development** (using `ngrok` or similar for webhooks)
- **Production** (Vercel)

### Secrets (env vars)

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_URL` (Production URL)
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `JWT_SECRET` (for magic links)

Secrets are **never** committed.

---

## Data Model

### Table: users

Purpose: map Telegram users to internal IDs.

Fields:

- id (uuid, primary key, default gen_random_uuid())
- telegram_user_id (bigint, unique, not null)
- created_at (timestamp with time zone, default now())

---

### Table: expenses

Purpose: store structured receipt data.

Fields:

- id (uuid, primary key, default gen_random_uuid())
- user_id (uuid, foreign key → users.id, not null)
- merchant (text, nullable)
- total_amount (numeric, nullable)
- currency (text, default 'IDR')
- date (date, nullable)
- raw_extraction (jsonb, nullable)
- image_path (text, nullable)
- created_at (timestamp with time zone, default now())

Rules:

- Missing values are stored as NULL
- raw_extraction is stored when available
- Deleting a user does not cascade; dependent expenses must be handled explicitly

---

## Storage Design (Cloudflare R2)

### Bucket

- Name: receipts

### Object Path Format

```
receipts/{telegram_user_id}/{expense_id}.jpg
```

Rules:

- Images are compressed before upload
- Storage contains **no metadata**, only files
- Database stores the object path    

---

## Telegram Bot Design (Webhooks)

### Supported Commands

- `/start` - Onboarding
- `/export` - Get CSV
- `/web` - Get Magic Link to Dashboard

### Message Handling (Webhook)

#### /start

- Create user if not exists
- Send short instructions

#### Photo Message

- Validate message contains image
- Acknowledge receipt immediately (answerCallbackQuery or sendMessage)
- Process asynchronously (Vercel function execution)
  - *Note: Vercel functions have timeouts. For MVP, we attempt inline processing. If too slow, we may need a queue or "processing" state, but keeping it simple first.*

#### /web

- Generate a signed JWT containing `user_id`
- Send link: `https://[app-url]/dashboard?token=[jwt]`

#### /export

- Fetch all expenses for user
- Generate CSV
- Send CSV file via Telegram

---

## Web Dashboard Design

### /dashboard

- Middleware verifies `token` query param
- If valid:
  - Fetch expenses for `user_id` from Supabase
  - Render simple table: Date | Merchant | Amount
  - "Download CSV" button
- If invalid:
  - Show "Invalid Link" or "Go back to Telegram"

---

## Receipt Processing Pipeline

### Step-by-Step Flow

1. Receive Webhook from Telegram (POST /api/telegram-webhook)
2. Identify User & Image
3. Download image from Telegram servers
4. Compress image
5. Upload image to R2
6. Send image to Gemini API
7. Receive structured JSON
8. Validate extracted fields
9. Insert expense row into Supabase
10. Send Telegram message with result summary

Failures at any step must:

- Still store partial data where possible
- Notify user politely

---

## AI Extraction Contract (Critical)

### Input

- One receipt image
- Fixed prompt

### Expected Output (JSON)

```
{
  "merchant": string | null,
  "total_amount": number | null,
  "currency": string | null,
  "date": string | null
}
```

Rules:

- JSON only
- Missing fields must be null
- No extra commentary

The backend is responsible for:

- Normalizing currency
- Parsing dates
- Rejecting invalid totals

---

## Validation Rules

- total_amount:
    - Must be > 0
    - Must be numeric
- currency:
    - Default to configured base currency if null
- date:
    - Optional


If total_amount is null or invalid:
- Expense is stored
- User is informed extraction may be incomplete

---

## CSV Export

### Columns

```
date, merchant, total_amount, currency
```

### Behavior

- Export all expenses for user
- Ordered by created_at ASC
- Empty fields allowed

---

## Error Handling Philosophy

- Fail loudly in logs
- Fail gently to users
- Never crash the bot

User-facing errors should be:

- Short
- Non-technical
- Actionable if possible

---

## Rate Limiting & Cost Control (MVP)

- Limit receipts per user (configurable)
- Hard cap Gemini calls per day
- Reject excess with friendly message

This protects free tiers.

---

## Build Order (Do Not Skip)

1. **Initialize Next.js Project** (Migrate existing scripts to Next.js structure)
2. Configure Vercel Deployment
3. Set up Telegram Webhook Route
4. Implement `/start` & User Creation
5. Implement Image Processing Pipeline (in Webhook)
6. Implement Gemini Extraction
7. Implement `/web` Magic Link Logic
8. Build Simple Dashboard Page
9. Manual testing with real receipts
10. Final Deployment & Verification

---

## Definition of Done (Tech)

The MVP is technically complete when:

- A Telegram user can send a receipt photo
- An expense record is stored
- User can view expenses via Web Dashboard
- System runs entirely on free tiers (Vercel)

---

## Explicit Non-Responsibilities (MVP)

- No password auth (Magic links only)
- No complex state management
- No editing or correction flows
- No background job queues (unless absolutely necessary for timeout reasons)

---

## Notes for Future Phases

- Abstract message ingestion for WhatsApp
- Add user corrections loop
- Add dashboard UI with charts
- Add usage analytics

This document intentionally stops here.
