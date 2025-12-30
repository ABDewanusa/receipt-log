export type ExtractionResult = {
  merchant: string | null;
  total_amount: number | null;
  currency: string | null;
  date: string | null;
  missing_fields: string[];
  status: 'complete' | 'incomplete' | 'error';
  raw_text: string; // Always required
};

export interface PersistableExpense {
  id: string;
  user_id: string;
  merchant: string | null;
  total_amount: number | null;
  currency: string | null;
  date: string | null;
  raw_extraction: ExtractionResult; // Must not be null, must contain raw_text
  image_path: string | null;
}
