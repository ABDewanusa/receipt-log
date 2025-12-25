ReceiptLog MVP — Build Contract

Primary Goal:
Ship Telegram → receipt → CSV flow.

Non-Negotiables:
- Telegram-only client
- No WhatsApp in MVP
- No dashboards beyond minimal read-only
- No editing or correction flows
- AI extraction must return JSON only
- Total amount is the only required field

Allowed Shortcuts:
- Hardcoded defaults (currency)
- Null fields are acceptable
- Minimal error messages
- Inline logic over abstractions

Forbidden:
- Premature refactors
- Generalized pipelines
- Feature flags
- “Future-proof” abstractions

Ship Criteria:
A user can send a receipt and export CSV in under 2 minutes.
