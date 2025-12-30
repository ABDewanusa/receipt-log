/**
 * Formats a generic failure message.
 * 
 * Rules:
 * - Polite and concise.
 * - No technical details or error codes.
 * - No debugging instructions.
 */
export function formatFailureMessage(): string {
  return '❌ Sorry, I couldn’t save this receipt. Please try again.';
}
