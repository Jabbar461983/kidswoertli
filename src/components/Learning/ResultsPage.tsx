import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { dbService } from '@/services/database'
import { jokesService } from '@/services/jokes'
import { ErrorRound } from '@/types'

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [errorRounds, setErrorRounds] = useState<ErrorRound[]>([])
  const [joke, setJoke] = useState('')

  const correctCount = state?.correctCount || 0
  const errorCount = state?.errorCount || 0
  const totalCards = state?.totalCards || 0
  const percentage = Math.round((correctCount / totalCards) * 100)

  if (!user || !sessionId) {
    navigate('/learn')
    return null
  }

  useEffect(() => {
    loadResults()
    loadJoke()
  }, [sessionId])

  const loadResults = async () => {
    try {
      const rounds = await dbService.getErrorRounds(sessionId)
      setErrorRounds(rounds)
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }

  const loadJoke = async () => {
    try {
      const jokeText = await jokesService.getJoke()
      setJoke(jokeText)
    } catch (error) {
      console.error('Error loading joke:', error)
    }
  }

  const handleRetryErrors = (_roundId: string) => {
    alert('Fehler-Wiederholung wird noch implementiert')
  }

  const handleDeleteRound = async (roundId: string) => {
    if (window.confirm('Diesen Fehler-Durchgang wirklich löschen?')) {
      try {
        await dbService.deleteErrorRound(roundId)
        setErrorRounds(errorRounds.filter((r) => r.id !== roundId))
      } catch (error) {
        console.error('Error deleting round:', error)
        alert('Fehler beim Löschen')
      }
    }
  }

  const getGrade = (percent: number): string => {
    if (percent >= 90) return '🌟 Ausgezeichnet!'
    if (percent >= 80) return '⭐ Sehr gut!'
    if (percent >= 70) return '👍 Gut!'
    if (percent >= 60) return '📚 Befriedigend'
    return '💪 Verbesserungsbedürftig'
  }

  const getGradeColor = (percent: number): string => {
    if (percent >= 80) return 'bg-green-100 dark:bg-green-900 border-green-400'
    if (percent >= 60) return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400'
    return 'bg-orange-100 dark:bg-orange-900 border-orange-400'
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            📊 Ergebnisse
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Score Card */}
        <div
          className={`border-2 rounded-lg p-8 text-center space-y-6 ${getGradeColor(percentage)} border-longchamp-gold`}
        >
          <div className="text-6xl">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪'}
          </div>

          <div>
            <p className="text-4xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-2">
              {percentage}%
            </p>
            <p className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
              {getGrade(percentage)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-lg font-semibold">
            <div className="bg-white dark:bg-longchamp-black rounded p-4">
              <p className="text-gray-600 dark:text-gray-400">✓ Richtig</p>
              <p className="text-2xl text-green-600 dark:text-green-400">{correctCount}</p>
            </div>
            <div className="bg-white dark:bg-longchamp-black rounded p-4">
              <p className="text-gray-600 dark:text-gray-400">✗ Falsch</p>
              <p className="text-2xl text-red-600 dark:text-red-400">{errorCount}</p>
            </div>
          </div>

          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-longchamp-gold h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {totalCards} Fragen insgesamt
          </p>
        </div>

        {/* Joke Box */}
        {joke && (
          <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-3">
            <h2 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory">
              😄 Kleiner Witz zur Belohnung:
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {joke}
            </p>
          </div>
        )}

        {/* Error Rounds Section */}
        {errorRounds.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-4">
                🔄 Fehler-Durchgänge ({errorRounds.length}/5)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Du kannst deine Fehler separiert wiederholen. Maximal 5 Durchgänge werden
                gespeichert.
              </p>
            </div>

            {errorRounds.map((round, idx) => (
              <div
                key={round.id}
                className="bg-white dark:bg-longchamp-black border-2 border-red-400 rounded-lg p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-longchamp-black dark:text-longchamp-ivory">
                      Durchgang {idx + 1}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {round.error_count} Fehler aus {round.correct_count + round.error_count} Fragen
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRound(round.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 text-2xl"
                    title="Durchgang löschen"
                  >
                    🗑️
                  </button>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Fehler ({round.error_count}):
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Array.isArray(round.cards) &&
                      round.cards.map((card, cardIdx) => (
                        <div
                          key={`${round.id}-${cardIdx}`}
                          className="text-sm text-gray-700 dark:text-gray-300 pl-2"
                        >
                          • {card.german} → {card.foreign_text}
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRetryErrors(round.id)}
                  disabled
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
                  title="Wird noch implementiert"
                >
                  🔄 Fehler wiederholen
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={() => navigate('/learn')}
            className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-3 px-4 rounded-lg"
          >
            📚 Neuer Test
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            🏠 Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
