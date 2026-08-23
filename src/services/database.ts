import { supabase } from './supabase'
import { User, LearningMedium, Card, LearningSession, CardResult, ErrorRound, Language } from '@/types'

export const dbService = {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  },

  async createUser(userId: string, username: string, is_admin: boolean = false): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        username,
        is_admin,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Learning Media operations
  async createMedium(
    userId: string,
    title: string,
    language: Language
  ): Promise<LearningMedium> {
    const { data, error } = await supabase
      .from('learning_media')
      .insert({
        user_id: userId,
        title,
        language,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserMedia(userId: string): Promise<LearningMedium[]> {
    const { data } = await supabase
      .from('learning_media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return data || []
  },

  async getMedium(mediumId: string): Promise<LearningMedium | null> {
    const { data } = await supabase
      .from('learning_media')
      .select('*')
      .eq('id', mediumId)
      .single()

    return data
  },

  async deleteMedium(mediumId: string): Promise<void> {
    await supabase.from('learning_media').delete().eq('id', mediumId)
  },

  // Card operations
  async createCard(
    mediumId: string,
    page: number,
    chapter: string,
    german: string,
    foreign_text: string,
    language: Language
  ): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        medium_id: mediumId,
        page,
        chapter,
        german,
        foreign_text,
        language,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createCardBatch(
    cards: Array<{
      medium_id: string
      page: number
      chapter: string
      german: string
      foreign_text: string
      language: Language
    }>
  ): Promise<Card[]> {
    if (cards.length === 0) return []

    const { data, error } = await supabase
      .from('cards')
      .insert(cards)
      .select()

    if (error) throw error
    return data || []
  },

  async createCards(cards: Omit<Card, 'id' | 'created_at' | 'updated_at'>[]): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .insert(cards)
      .select()

    if (error) throw error
    return data || []
  },

  async getCardsByMedium(mediumId: string): Promise<Card[]> {
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('medium_id', mediumId)
      .order('page', { ascending: true })

    return data || []
  },

  async getCardsByPages(mediumId: string, pages: number[]): Promise<Card[]> {
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('medium_id', mediumId)
      .in('page', pages)
      .order('page', { ascending: true })

    return data || []
  },

  async updateCard(
    cardId: string,
    updates: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCard(cardId: string): Promise<void> {
    await supabase.from('cards').delete().eq('id', cardId)
  },

  // Learning Session operations
  async createSession(
    userId: string,
    mediumId: string,
    language: Language,
    selectedPages: number[],
    selectedChapters: string[]
  ): Promise<LearningSession> {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: userId,
        medium_id: mediumId,
        language,
        selected_pages: selectedPages,
        selected_chapters: selectedChapters,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSession(sessionId: string): Promise<LearningSession | null> {
    const { data } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    return data
  },

  // Card Result operations
  async recordCardResult(
    sessionId: string,
    cardId: string,
    isCorrect: boolean
  ): Promise<CardResult> {
    const { data, error } = await supabase
      .from('card_results')
      .insert({
        session_id: sessionId,
        card_id: cardId,
        is_correct: isCorrect,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSessionResults(sessionId: string): Promise<CardResult[]> {
    const { data } = await supabase
      .from('card_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    return data || []
  },

  // Error Round operations
  async createErrorRound(
    sessionId: string,
    roundNumber: number,
    cards: Card[],
    correctCount: number,
    errorCount: number
  ): Promise<ErrorRound> {
    const { data, error } = await supabase
      .from('error_rounds')
      .insert({
        session_id: sessionId,
        round_number: roundNumber,
        cards: cards,
        correct_count: correctCount,
        error_count: errorCount,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getErrorRounds(sessionId: string): Promise<ErrorRound[]> {
    const { data } = await supabase
      .from('error_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number', { ascending: true })

    return data || []
  },

  async deleteErrorRound(roundId: string): Promise<void> {
    await supabase.from('error_rounds').delete().eq('id', roundId)
  },
}
