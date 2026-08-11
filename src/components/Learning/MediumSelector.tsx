import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { dbService } from '@/services/database'
import { useEffect, useState } from 'react'
import { Language, Card } from '@/types'

export function MediumSelector() {
  const { mediumId, language: langParam } = useParams<{
    mediumId: string
    language: Language
  }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set())
  const [mediumTitle, setMediumTitle] = useState('')

  if (!user || !mediumId || !langParam) {
    navigate('/learn')
    return null
  }

  const language = langParam as Language

  useEffect(() => {
    loadCards()
  }, [mediumId])

  const loadCards = async () => {
    try {
      setLoading(true)
      const medium = await dbService.getMedium(mediumId)
      if (medium) {
        setMediumTitle(medium.title)
      }

      const cardsData = await dbService.getCardsByMedium(mediumId)
      setCards(cardsData)

      // Pre-select all pages and chapters
      const pages = new Set(cardsData.map((c) => c.page))
      const chapters = new Set(cardsData.map((c) => c.chapter).filter(Boolean))
      setSelectedPages(pages)
      setSelectedChapters(chapters)
    } catch (error) {
      console.error('Error loading cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const uniquePages = Array.from(new Set(cards.map((c) => c.page))).sort(
    (a, b) => a - b
  )
  const uniqueChapters = Array.from(
    new Set(cards.map((c) => c.chapter).filter(Boolean))
  ).sort()

  const handleTogglePage = (page: number) => {
    const newPages = new Set(selectedPages)
    if (newPages.has(page)) {
      newPages.delete(page)
    } else {
      newPages.add(page)
    }
    setSelectedPages(newPages)
  }

  const handleToggleChapter = (chapter: string) => {
    const newChapters = new Set(selectedChapters)
    if (newChapters.has(chapter)) {
      newChapters.delete(chapter)
    } else {
      newChapters.add(chapter)
    }
    setSelectedChapters(newChapters)
  }

  const handleSelectAll = () => {
    setSelectedPages(new Set(uniquePages))
    setSelectedChapters(new Set(uniqueChapters))
  }

  const handleDeselectAll = () => {
    setSelectedPages(new Set())
    setSelectedChapters(new Set())
  }

  const handleStartLearning = (mode: 'write' | 'speak' | 'read') => {
    if (selectedPages.size === 0 && selectedChapters.size === 0) {
      alert('Bitte wähle mindestens eine Seite oder ein Kapitel aus')
      return
    }

    navigate(`/learn/quiz/${mediumId}/${language}/${mode}`, {
      state: {
        selectedPages: Array.from(selectedPages),
        selectedChapters: Array.from(selectedChapters),
      },
    })
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/learn')}
            className="text-longchamp-gold hover:text-longchamp-dark-gold mb-2"
          >
            ← Zurück
          </button>
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            {language === 'fr' ? '🇫🇷' : '🇬🇧'} {mediumTitle}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Lädt Karteikarten...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Selection Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory">
                  📄 Auswahl
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded"
                  >
                    Alle
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold py-2 px-3 rounded"
                  >
                    Keine
                  </button>
                </div>

                {/* Pages */}
                {uniquePages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Seiten</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {uniquePages.map((page) => (
                        <label key={page} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPages.has(page)}
                            onChange={() => handleTogglePage(page)}
                            className="mr-2"
                          />
                          <span className="text-sm">Seite {page}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapters */}
                {uniqueChapters.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Kapitel</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {uniqueChapters.map((chapter) => (
                        <label key={chapter} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedChapters.has(chapter)}
                            onChange={() => handleToggleChapter(chapter)}
                            className="mr-2"
                          />
                          <span className="text-sm">{chapter}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Modes */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory">
                Wähle einen Lernmodus
              </h2>

              {/* Write Mode */}
              <div
                onClick={() => handleStartLearning('write')}
                className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✍️</div>
                  <div>
                    <h3 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-2">
                      Schriftlich
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Du liest das deutsche Wort und schreibst die Übersetzung in der
                      Fremdsprache auf.
                    </p>
                  </div>
                </div>
              </div>

              {/* Speak Mode */}
              <div
                onClick={() => handleStartLearning('speak')}
                className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎤</div>
                  <div>
                    <h3 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-2">
                      Akustisch (Sprechen)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Die App liest das deutsche Wort vor, du sprichst die Übersetzung.
                    </p>
                  </div>
                </div>
              </div>

              {/* Read Mode */}
              <div
                onClick={() => handleStartLearning('read')}
                className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">👁️</div>
                  <div>
                    <h3 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory mb-2">
                      Optisch (Lesen)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Du liest die Vokabel, übersetzt sie selbst und kontrollierst deine Antwort.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  <strong>Hinweis:</strong> Du hast{' '}
                  <strong>{selectedPages.size + selectedChapters.size}</strong>{' '}
                  {selectedPages.size + selectedChapters.size === 1
                    ? 'Auswahl'
                    : 'Auswahlkriterium'}{' '}
                  ausgewählt.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
