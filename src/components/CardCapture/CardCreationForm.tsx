import { useState, useEffect } from 'react'
import { Language, LearningMedium } from '@/types'
import { dbService } from '@/services/database'

export interface CardData {
  medium_id: string
  page: number
  chapter: string
  german: string
  foreign: string
  language: Language
}

interface CardCreationFormProps {
  extractedText: string
  userId: string
  onCardCreate: (card: CardData) => void
  onCancel: () => void
}

export function CardCreationForm({
  extractedText,
  userId,
  onCardCreate,
  onCancel,
}: CardCreationFormProps) {
  const [media, setMedia] = useState<LearningMedium[]>([])
  const [loading, setLoading] = useState(false)
  const [newMediumTitle, setNewMediumTitle] = useState('')
  const [showNewMedium, setShowNewMedium] = useState(false)

  const [formData, setFormData] = useState<CardData>({
    medium_id: '',
    page: 1,
    chapter: '',
    german: '',
    foreign: extractedText,
    language: 'fr',
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
      console.error('Error loading media:', error)
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
      console.error('Error creating medium:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.medium_id || !formData.german || !formData.foreign) {
      alert('Bitte fülle alle erforderlichen Felder aus')
      return
    }

    onCardCreate(formData)
  }

  return (
    <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
        Karteikarte erstellen
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
                onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                className="mr-2"
              />
              <span>Französisch</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="en"
                checked={formData.language === 'en'}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                className="mr-2"
              />
              <span>Englisch</span>
            </label>
          </div>
        </div>

        {/* Learning Medium */}
        <div>
          <label className="block text-sm font-medium mb-2">
            📚 Lernmedium *
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        {/* German Text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🇩🇪 Deutsche Übersetzung *
          </label>
          <textarea
            value={formData.german}
            onChange={(e) => setFormData({ ...formData, german: e.target.value })}
            placeholder="Deutsche Übersetzung eingeben..."
            rows={3}
            className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
            disabled={loading}
          />
        </div>

        {/* Foreign Language Text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {formData.language === 'fr' ? '🇫🇷' : '🇺🇸'} {formData.language === 'fr' ? 'Französisch' : 'Englisch'} *
          </label>
          <textarea
            value={formData.foreign}
            onChange={(e) => setFormData({ ...formData, foreign: e.target.value })}
            placeholder="Text in Fremdsprache..."
            rows={3}
            className="w-full px-4 py-2 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 px-4 rounded-lg"
          >
            ✓ Karteikarte erstellen
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
          >
            ✕ Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
