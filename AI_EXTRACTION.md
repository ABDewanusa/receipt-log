Input:
- Single receipt image

Output (JSON ONLY):
{
  "merchant": string | null,
  "total_amount": number | null,
  "currency": string | null,
  "date": string | null
}

Rules:
- No commentary
- No markdown
- Missing fields must be null
- total_amount must be numeric

Failure Mode:
Return nulls, not guesses.
