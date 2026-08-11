import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { dbService } from '@/services/database'
import { LearningMedium, Card, Language } from '@/types'

export function CollectionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [media, setMedia] = useState<LearningMedium[]>([])
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [expandedMedium, setExpandedMedium] = useState<string | null>(null)
  const [mediumCards, setMediumCards] = useState<Record<string, Card[]>>({})

  if (!user) {
    navigate('/login')
    return null
  }

  useEffect(() => {
    loadCollections()
  }, [user.id])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const userMedia = await dbService.getUserMedia(user.id)
      setMedia(userMedia)

      // Load card counts
      const counts: Record<string, number> = {}
      for (const m of userMedia) {
        const cards = await dbService.getCardsByMedium(m.id)
        counts[m.id] = cards.length
      }
      setCardCounts(counts)
    } catch (error) {
      console.error('Error loading collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpandMedium = async (mediumId: string) => {
    if (expandedMedium === mediumId) {
      setExpandedMedium(null)
    } else {
      setExpandedMedium(mediumId)

      // Load cards if not already loaded
      if (!mediumCards[mediumId]) {
        try {
          const cards = await dbService.getCardsByMedium(mediumId)
          setMediumCards({ ...mediumCards, [mediumId]: cards })
        } catch (error) {
          console.error('Error loading cards:', error)
        }
      }
    }
  }

  const handleDeleteMedium = async (mediumId: string) => {
    if (window.confirm('Willst du dieses Lernmedium und alle Karteikarten wirklich löschen?')) {
      try {
        await dbService.deleteMedium(mediumId)
        setMedia(media.filter((m) => m.id !== mediumId))
        const newCards = { ...mediumCards }
        delete newCards[mediumId]
        setMediumCards(newCards)
      } catch (error) {
        console.error('Error deleting medium:', error)
        alert('Fehler beim Löschen')
      }
    }
  }

  const handleDeleteCard = async (cardId: string, mediumId: string) => {
    if (window.confirm('Karteikarte wirklich löschen?')) {
      try {
        await dbService.deleteCard(cardId)
        const updatedCards = mediumCards[mediumId].filter((c) => c.id !== cardId)
        setMediumCards({ ...mediumCards, [mediumId]: updatedCards })
        setCardCounts({ ...cardCounts, [mediumId]: updatedCards.length })
      } catch (error) {
        console.error('Error deleting card:', error)
        alert('Fehler beim Löschen')
      }
    }
  }

  const getLanguageFlag = (language: Language): string => {
    return language === 'fr' ? '🇫🇷' : '🇬🇧'
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
              📚 Meine Sammlungen
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Verwalte deine Lernmedien und Karteikarten
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            ← Zurück
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Lädt Sammlungen...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-2">
              Keine Lernmedien vorhanden
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Erstelle dein erstes Lernmedium durch die Erfassung von Karteikarten.
            </p>
            <button
              onClick={() => navigate('/capture')}
              className="bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-2 px-6 rounded-lg"
            >
              📷 Neue Karteikarten erfassen
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {media.map((medium) => (
              <div
                key={medium.id}
                className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg overflow-hidden"
              >
                {/* Medium Header */}
                <button
                  onClick={() => handleExpandMedium(medium.id)}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 transition duration-200"
                >
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getLanguageFlag(medium.language)}</span>
                      <h3 className="text-lg font-bold text-longchamp-black dark:text-longchamp-ivory">
                        {medium.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cardCounts[medium.id] || 0} Karteikarten
                    </p>
                  </div>
                  <div className="text-2xl">
                    {expandedMedium === medium.id ? '▼' : '▶'}
                  </div>
                </button>

                {/* Medium Details */}
                {expandedMedium === medium.id && (
                  <div className="border-t-2 border-longchamp-gold px-6 py-6 space-y-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/learn/medium/${medium.id}/${medium.language}`)}
                        className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-2 px-4 rounded-lg"
                      >
                        🎓 Lernen
                      </button>
                      <button
                        onClick={() => handleDeleteMedium(medium.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        🗑️ Löschen
                      </button>
                    </div>

                    {/* Cards List */}
                    {mediumCards[medium.id] && mediumCards[medium.id].length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-longchamp-black dark:text-longchamp-ivory mb-3">
                          Karteikarten:
                        </h4>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {mediumCards[medium.id].map((card) => (
                            <div
                              key={card.id}
                              className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex justify-between items-start"
                            >
                              <div className="flex-1 text-sm">
                                <p className="font-semibold text-longchamp-black dark:text-longchamp-ivory">
                                  {card.german}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  → {card.foreign}
                                </p>
                                {card.chapter && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {card.chapter} (S. {card.page})
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteCard(card.id, medium.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                                title="Karteikarte löschen"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
