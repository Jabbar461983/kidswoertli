import { useNavigate } from 'react-router-dom'
import { Language } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { dbService } from '@/services/database'
import { useState, useEffect } from 'react'

interface Media {
  id: string
  title: string
  language: Language
}

export function LanguageSelector() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [frenchMedia, setFrenchMedia] = useState<Media[]>([])
  const [englishMedia, setEnglishMedia] = useState<Media[]>([])

  if (!user) {
    navigate('/login')
    return null
  }

  useEffect(() => {
    loadMedia()
  }, [user.id])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const media = await dbService.getUserMedia(user.id)
      setFrenchMedia(media.filter((m) => m.language === 'fr'))
      setEnglishMedia(media.filter((m) => m.language === 'en'))
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMedium = (mediumId: string, language: Language) => {
    navigate(`/learn/medium/${mediumId}/${language}`)
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            📚 Wähle eine Sprache und ein Lernmedium
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Lädt Lernmedien...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Französisch */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🇫🇷</div>
                <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
                  Französisch
                </h2>
              </div>

              {frenchMedia.length === 0 ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-600 dark:text-gray-400">
                  <p>Keine Französisch-Lernmedien vorhanden</p>
                  <p className="text-sm mt-2">Erstelle zuerst Karteikarten unter "Neue Karteikarten"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {frenchMedia.map((medium) => (
                    <button
                      key={medium.id}
                      onClick={() => handleSelectMedium(medium.id, 'fr')}
                      className="w-full bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-4 hover:shadow-lg transition duration-200 text-left"
                    >
                      <h3 className="font-bold text-longchamp-black dark:text-longchamp-ivory">
                        {medium.title}
                      </h3>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Englisch */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🇬🇧</div>
                <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
                  Englisch
                </h2>
              </div>

              {englishMedia.length === 0 ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-600 dark:text-gray-400">
                  <p>Keine Englisch-Lernmedien vorhanden</p>
                  <p className="text-sm mt-2">Erstelle zuerst Karteikarten unter "Neue Karteikarten"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {englishMedia.map((medium) => (
                    <button
                      key={medium.id}
                      onClick={() => handleSelectMedium(medium.id, 'en')}
                      className="w-full bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-4 hover:shadow-lg transition duration-200 text-left"
                    >
                      <h3 className="font-bold text-longchamp-black dark:text-longchamp-ivory">
                        {medium.title}
                      </h3>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            ← Zurück zum Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
