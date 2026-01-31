export interface Contact {
  id: number;
  phone_number: string;
  created_at: string;
}

export interface Slot {
  id: number;
  generated_by: string;
  campaign_type: 'New' | 'Old' | 'Shuffled';
  created_at: string;
  total_count: number;
}

export interface ImportResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  failedNumbers: string[]; // For the downloadable report
}