Extract data from this receipt image following these strict rules:

1. Format: Return JSON ONLY.
2. Structure:
{
  "merchant": string | null,
  "total_amount": number | null,
  "currency": string | null,
  "date": string | null
}
3. Rules:
- No markdown formatting (no ```json blocks).
- No commentary or explanations.
- "total_amount" must be a raw number, not a string.
- If a field is missing or unreadable, return null. Do not guess.

Input: One receipt image.
Output: Valid JSON object only.