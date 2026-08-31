export interface Profile {
  id: number;
  username: string;
  vorname: string;
  is_admin: boolean;
}

export interface FlashCard {
  id: number;
  profile_id: number;
  language_a: string;
  text_a: string;
  language_b: string;
  text_b: string;
  source_image_url?: string;
  confidence: number;
  created_at: string;
}

export interface LearningProgress {
  id: number;
  profile_id: number;
  flashcard_id: number;
  correct_count: number;
  incorrect_count: number;
  last_practiced?: string;
  mastered: boolean;
}

export interface AppSettings {
  id: number;
  profile_id: number;
  anthropic_api_key: string;
  language_pair: string;
}

export interface AuthState {
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface OCRResult {
  pairs: Array<{
    de: string;
    fr?: string;
    en?: string;
    confidence: number;
  }>;
  total: number;
  confidence: "high" | "medium" | "low";
}
