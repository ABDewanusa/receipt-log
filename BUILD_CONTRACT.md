ReceiptLog MVP — Build Contract

Primary Goal:
Ship Telegram → receipt → CSV/Web flow.

Non-Negotiables:
- Telegram is the primary input
- Web dashboard is read-only
- No WhatsApp in MVP
- No complex dashboards (list view only)
- No editing or correction flows
- AI extraction must return JSON only
- Total amount is the only required field

Allowed Shortcuts:
- Hardcoded defaults (currency)
- Null fields are acceptable
- Minimal error messages
- Inline logic over abstractions
- Magic links for auth (no passwords)

Forbidden:
- Premature refactors
- Generalized pipelines
- Feature flags
- “Future-proof” abstractions

Ship Criteria:
A user can send a receipt and view it on the web or export CSV in under 2 minutes.
