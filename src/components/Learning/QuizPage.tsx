import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { Card, CardResult, Language } from '@/types'
import { dbService } from '@/services/database'
import { jokesService } from '@/services/jokes'
import { CardQuiz } from './CardQuiz'

export function QuizPage() {
  const { mediumId, language: langParam, mode: modeParam } = useParams<{
    mediumId: string
    language: Language
    mode: 'write' | 'speak' | 'read'
  }>()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Card[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])
  const [sessionId, setSessionId] = useState('')
  const [motivationalMessage, setMotivationalMessage] = useState('')

  if (!user || !mediumId || !langParam || !modeParam) {
    navigate('/learn')
    return null
  }

  const language = langParam as Language
  const mode = modeParam as 'write' | 'speak' | 'read'
  const selectedPages = state?.selectedPages || []
  const selectedChapters = state?.selectedChapters || []

  useEffect(() => {
    initializeSession()
  }, [mediumId])

  const initializeSession = async () => {
    try {
      setLoading(true)

      // Create session
      const session = await dbService.createSession(
        user.id,
        mediumId,
        language,
        selectedPages,
        selectedChapters
      )
      setSessionId(session.id)

      // Load cards
      let cardsData: Card[] = []
      if (selectedPages.length > 0) {
        cardsData = await dbService.getCardsByPages(mediumId, selectedPages)
      } else if (selectedChapters.length > 0) {
        const allCards = await dbService.getCardsByMedium(mediumId)
        cardsData = allCards.filter((c) => selectedChapters.includes(c.chapter))
      } else {
        cardsData = await dbService.getCardsByMedium(mediumId)
      }

      setCards(cardsData)
    } catch (error) {
      console.error('Error initializing session:', error)
      alert('Fehler beim Laden der Karteikarten')
      navigate('/learn')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (result: CardResult) => {
    const newResults = [...results, result]
    setResults(newResults)

    // Get motivational message
    const msg = await jokesService.getMotivationalMessage()
    setMotivationalMessage(msg)
  }

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setMotivationalMessage('')
    } else {
      // Quiz finished
      handleQuizComplete()
    }
  }

  const handleQuizComplete = async () => {
    // Calculate results
    const correctCount = results.filter((r) => r.is_correct).length
    const errorCount = results.filter((r) => !r.is_correct).length

    // Find error cards
    const errorCards = cards.filter((c) =>
      results.find((r) => r.card_id === c.id && !r.is_correct)
    )

    // Create error round if there are errors
    if (errorCount > 0) {
      try {
        await dbService.createErrorRound(
          sessionId,
          1,
          errorCards,
          correctCount,
          errorCount
        )
      } catch (error) {
        console.error('Error creating error round:', error)
      }
    }

    // Navigate to results page
    navigate(`/learn/results/${sessionId}`, {
      state: {
        correctCount,
        errorCount,
        totalCards: cards.length,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-longchamp-ivory dark:bg-longchamp-black">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Bereitet Lernrunde vor...
          </p>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-longchamp-ivory dark:bg-longchamp-black">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Keine Karteikarten gefunden
          </p>
          <button
            onClick={() => navigate('/learn')}
            className="bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-2 px-4 rounded-lg"
          >
            Zurück
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/learn')}
            className="text-longchamp-gold hover:text-longchamp-dark-gold mb-2"
          >
            ← Zurück
          </button>
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            {mode === 'write' && '✍️ Schriftlicher Test'}
            {mode === 'speak' && '🎤 Sprechtest'}
            {mode === 'read' && '👁️ Lesetest'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Motivational Message */}
        {motivationalMessage && (
          <div className="mb-8 bg-green-100 dark:bg-green-900 border-2 border-green-400 dark:border-green-700 rounded-lg p-6 text-center">
            <p className="text-lg font-bold text-green-800 dark:text-green-200">
              {motivationalMessage}
            </p>
          </div>
        )}

        {/* Quiz Card */}
        {cards[currentCardIndex] && (
          <CardQuiz
            card={cards[currentCardIndex]}
            mode={mode}
            sessionId={sessionId}
            onAnswer={handleAnswer}
            onNext={handleNext}
            cardIndex={currentCardIndex}
            totalCards={cards.length}
            language={language}
          />
        )}
      </main>
    </div>
  )
}
