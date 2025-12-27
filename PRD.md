# ReceiptLog — MVP — Updated Minimal PRD

## Problem

Receipts are shared as photos but never become structured expense data.  
Manual entry is slow, error-prone, and annoying—especially for solo operators.

---

## User

Solo users (freelancers, consultants, indie founders, field workers) who:

- Already use **Telegram**
- Need simple, reliable expense records
- Do not want to install another app or manage logins

**Assumption:**  
One Telegram account = one user. No separate authentication in MVP.

---

## Goal

Allow a user to send a receipt photo via Telegram and automatically receive a structured expense record that can be viewed on a web dashboard or exported as CSV.

Primary value:

> “Turn receipt photos into usable expense data with almost no effort.”

---

## Core Features (MVP)

### Telegram Bot

- `/start` – onboarding + usage instructions
- Accept receipt photos (JPG / PNG)
- `/export` – export all expenses as a CSV file
- `/web` – generate a magic link to view expenses on the web
    

### Receipt Processing

- Compress and store receipt images
- Extract structured data from receipt images using AI:
    - Merchant (best guess)
    - Total amount (**required to be considered successful**)
    - Currency (default if missing)
    - Date (optional)

### Data Storage

- Store extracted expense data
- Store raw AI output for debugging and reprocessing
- Store image reference (not inline binary)

### Web Dashboard (Minimal)

- **Authentication**: Magic link via Telegram (no passwords)
- **View**: Simple list of expenses (Date, Merchant, Amount)
- **Action**: Download CSV
- **Constraint**: Read-only (no editing in MVP)

### Export

- Generate and deliver CSV file via Telegram
- Download CSV via Web Dashboard
- Columns:
    `date, merchant, total_amount, currency`

---

## Non-Goals (Explicitly Out of Scope)

- Teams or shared accounts
- Expense categories or tagging
- Editing or correcting extracted data (Web is read-only)
- Analytics, summaries, or reports
- WhatsApp support (post-MVP)
- Manual receipt entry
- Approval workflows
- Multi-currency conversion
- Offline support

---

## Constraints (Intentional Decisions)

- **Telegram is the primary input method**
- **Web is for viewing only**
- No separate user accounts or passwords (auth via Telegram link)
- Backend-only access to the database
- Receipt extraction uses an **AI vision API**, not traditional OCR
- Receipt images are stored in compressed form
- MVP must run entirely on **free tiers** (Vercel, Supabase, Cloudflare R2)
- WhatsApp support is explicitly deferred until after validation

---

## Accuracy & Quality Bar

- Extraction priority:
    1. **Total amount**
    2. Merchant
    3. Date
- If a total cannot be confidently extracted:
    - Expense is still stored
    - User is notified that extraction may be incomplete

---

## Success Metric (MVP Validation)

A new user can:
- Send a receipt photo via Telegram
- Receive confirmation
- View expenses on the web or download a usable CSV

All within **under 2 minutes**, with:
- ≥ **70% of receipts producing a correct total amount**
- No manual data entry required

If users would be disappointed if the bot stopped working, the MVP succeeded.

---

## Open Questions (Post-MVP)

- Should users be able to correct extracted data?
- Is WhatsApp demand strong enough to justify integration cost?
- Do users want summaries (weekly/monthly) instead of raw CSV?

---

## MVP Exit Criteria

The MVP is considered complete when:
- Telegram → receipt → CSV flow works end-to-end
- Web dashboard displays user data correctly
- Data is persisted reliably
- At least a small group of real users successfully exports expenses
