import { useState, useEffect } from 'react'
import { Language, LearningMedium } from '@/types'
import { dbService } from '@/services/database'
import { DetectedPair } from '@/services/ocr'
import { CardData } from './CardCreationForm'

interface BatchCardFormProps {
  pairs: DetectedPair[]
  userId: string
  isProcessing?: boolean
  onBatchCreate: (cards: CardData[]) => void
  onCancel: () => void
}

export function BatchCardForm({
  pairs,
  userId,
  isProcessing = false,
  onBatchCreate,
  onCancel,
}: BatchCardFormProps) {
  const [media, setMedia] = useState<LearningMedium[]>([])
  const [loading, setLoading] = useState(false)
  const [newMediumTitle, setNewMediumTitle] = useState('')
  const [showNewMedium, setShowNewMedium] = useState(false)

  const [formData, setFormData] = useState({
    medium_id: '',
    page: 1,
    chapter: '',
    language: 'fr' as Language,
  })

  useEffect(() => {
    loadMedia()
  }, [userId])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const userMedia = await dbService.getUserMedia(userId)
      setMedia(userMedia)
    } catch (error) {
      console.error('Fehler beim Laden der Medien:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMedium = async () => {
    if (!newMediumTitle.trim()) return

    try {
      setLoading(true)
      const newMedium = await dbService.createMedium(
        userId,
        newMediumTitle,
        formData.language
      )
      setMedia([...media, newMedium])
      setFormData({ ...formData, medium_id: newMedium.id })
      setNewMediumTitle('')
      setShowNewMedium(false)
    } catch (error) {
      console.error('Fehler beim Erstellen des Mediums:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.medium_id) {
      alert('Bitte wähle ein Medium aus')
      return
    }

    // Erstelle CardData für alle Paare
    const cards: CardData[] = pairs.map((pair) => ({
      medium_id: formData.medium_id,
      page: formData.page,
      chapter: formData.chapter,
      german: pair.german,
      foreign_text: pair.foreign_text,
      language: formData.language,
    }))

    onBatchCreate(cards)
  }

  return (
    <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
        📚 Metadaten & Karteikarten erstellen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🌍 Sprache *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="fr"
                checked={formData.language === 'fr'}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value as Language })
                }
                className="mr-2"
              />
              <span>Französisch</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="en"
                checked={formData.language === 'en'}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value as Language })
                }
                className="mr-2"
              />
              <span>Englisch</span>
            </label>
          </div>
        </div>

        {/* Learning Medium */}
        <div>
          <label className="block text-sm font-medium mb-2">
            📖 Lernmedium *
          </label>
          {showNewMedium ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newMediumTitle}
                onChange={(e) => setNewMediumTitle(e.target.value)}
                placeholder="z.B. 'Lehrbuch Kapitel 1'"
                className="flex-1 px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleCreateMedium}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setShowNewMedium(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={formData.medium_id}
                onChange={(e) => setFormData({ ...formData, medium_id: e.target.value })}
                className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
                disabled={loading}
              >
                <option value="">-- Medium auswählen --</option>
                {media.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewMedium(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                + Neues Medium erstellen
              </button>
            </div>
          )}
        </div>

        {/* Page Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            📄 Seitennummer *
          </label>
          <input
            type="number"
            min="1"
            value={formData.page}
            onChange={(e) => setFormData({ ...formData, page: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
            disabled={loading || isProcessing}
          />
        </div>

        {/* Chapter */}
        <div>
          <label className="block text-sm font-medium mb-2">
            📖 Kapitel
          </label>
          <input
            type="text"
            value={formData.chapter}
            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
            placeholder="z.B. 'Verbes Irréguliers'"
            className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
            disabled={loading || isProcessing}
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">
            👁️ Vorschau ({pairs.length} Karteikarten)
          </label>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
            {pairs.map((pair, idx) => (
              <div
                key={pair.id}
                className="text-sm border-l-4 border-longchamp-gold pl-3 py-1"
              >
                <div className="font-medium text-longchamp-black dark:text-longchamp-ivory">
                  {idx + 1}. {pair.german}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  → {pair.foreign_text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || isProcessing}
            className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin">⚙️</div>
                Wird erstellt...
              </>
            ) : (
              `✓ ${pairs.length} Karteikarten erstellen`
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isProcessing}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
          >
            ✕ Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
