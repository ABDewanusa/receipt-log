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
Telegram Bot API
   ↓
Next.js API Routes (Vercel)
   ├─ Image compression
   ├─ AI extraction (Gemini)
   ├─ Parsing & validation
   ├─ Database writes (Supabase)
   └─ File storage (Cloudflare R2)
   ↓
Telegram File Response (CSV)
```

The backend is the **single source of truth**. No client talks directly to the database or storage.

---

## Tech Stack (Locked for MVP)

### Client

- Telegram Bot (no other clients in MVP)

### Backend

- Next.js (API routes only)
- Hosted on Vercel (free tier)

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
- Telegram Bot SDK
- Image processing library (for compression)
- CSV generation library

---

## Environment Separation

### Environments

- Local development    
- Production (Vercel)

### Secrets (env vars)

- TELEGRAM_BOT_TOKEN
- GEMINI_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME

Secrets are **never** committed.

---

## Data Model

### Table: users

Purpose: map Telegram users to internal IDs.

Fields:

- id (uuid, primary key)
- telegram_user_id (bigint, unique)
- created_at (timestamp)

---

### Table: expenses

Purpose: store structured receipt data.

Fields:

- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- merchant (text, nullable)
- total_amount (numeric, nullable)
- currency (text, default)
- date (date, nullable)
- raw_extraction (json/text)
- image_path (text)
- created_at (timestamp)

Rules:

- Missing values are stored as NULL
- raw_extraction is always stored

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

## Telegram Bot Design

### Supported Commands

- /start
- /export    

### Message Handling

#### /start

- Create user if not exists
- Send short instructions

#### Photo Message

- Validate message contains image
- Acknowledge receipt immediately
- Process asynchronously

#### /export

- Fetch all expenses for user
- Generate CSV
- Send CSV file via Telegram

---

## Receipt Processing Pipeline

### Step-by-Step Flow

1. Receive photo from Telegram
2. Download image
3. Compress image
4. Upload image to R2
5. Send image to Gemini API
6. Receive structured JSON
7. Validate extracted fields
8. Insert expense row into Supabase
9. Respond to user with result summary

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

1. Create Supabase project
2. Create tables
3. Create R2 bucket
4. Create Telegram bot
5. Implement /start
6. Implement image upload + storage
7. Implement Gemini extraction
8. Store expenses
9. Implement /export
10. Manual testing with real receipts

---

## Definition of Done (Tech)

The MVP is technically complete when:

- A Telegram user can send a receipt photo
- An expense record is stored
- A CSV can be exported successfully
- System runs entirely on free tiers

---

## Explicit Non-Responsibilities (MVP)

- No frontend auth
- No retries or corrections
- No multi-client support
- No background jobs
- No dashboards beyond minimal read-only views

---

## Notes for Future Phases

- Abstract message ingestion for WhatsApp
- Add user corrections loop
- Add dashboard UI
- Add usage analytics

This document intentionally stops here.