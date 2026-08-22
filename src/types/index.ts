export type Language = 'fr' | 'en'

export interface User {
  id: string
  username: string
  email?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface LearningMedium {
  id: string
  user_id: string
  title: string
  language: Language
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  medium_id: string
  page: number
  chapter: string
  german: string
  foreign_text: string
  language: Language
  created_at: string
  updated_at: string
}

export interface LearningSession {
  id: string
  user_id: string
  medium_id: string
  language: Language
  selected_pages: number[]
  selected_chapters: string[]
  created_at: string
  updated_at: string
}

export interface CardResult {
  id: string
  session_id: string
  card_id: string
  is_correct: boolean
  created_at: string
}

export interface ErrorRound {
  id: string
  session_id: string
  round_number: number
  cards: Card[]
  correct_count: number
  error_count: number
  created_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}
