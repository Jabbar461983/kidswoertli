import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ImageCapture } from './ImageCapture'
import { OCRDisplay } from './OCRDisplay'
import { CardCreationForm, CardData } from './CardCreationForm'
import { ocrService } from '@/services/ocr'
import { dbService } from '@/services/database'
import { storageService } from '@/services/storage'

type Step = 'capture' | 'ocr' | 'form' | 'success'

export function CardCapturePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('capture')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [successCards, setSuccessCards] = useState<number>(0)

  if (!user) {
    navigate('/login')
    return null
  }

  const handleImageSelected = async (blob: Blob) => {
    setImageBlob(blob)
    setImageUrl(URL.createObjectURL(blob))
    setIsProcessing(true)
    setError(undefined)

    try {
      const result = await ocrService.extractText(blob)
      setExtractedText(result.text)
      setConfidence(result.confidence)
      setStep('ocr')
    } catch (err) {
      setError('OCR-Fehler: Text konnte nicht extrahiert werden')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextChange = (text: string) => {
    setExtractedText(text)
    setStep('form')
  }

  const handleCardCreate = async (cardData: CardData) => {
    if (!imageBlob) {
      setError('Fehler: Bild nicht gefunden')
      return
    }

    setIsProcessing(true)
    setError(undefined)

    try {
      // Upload image
      const timestamp = Date.now()
      const filename = `card-${timestamp}.jpg`
      await storageService.uploadImage(user.id, imageBlob, filename)

      // Create card in database
      await dbService.createCard(
        cardData.medium_id,
        cardData.page,
        cardData.chapter,
        cardData.german,
        cardData.foreign,
        cardData.language
      )

      // Delete image from storage (as per requirements)
      await storageService.deleteImage(user.id, filename)

      setSuccessCards(successCards + 1)
      setStep('success')
    } catch (err) {
      setError('Fehler beim Speichern der Karteikarte')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setImageBlob(null)
    setImageUrl('')
    setExtractedText('')
    setConfidence(0)
    setStep('capture')
    setError(undefined)
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black">
      {/* Header */}
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            📷 Neue Karteikarten erfassen
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fotografiere eine Buchseite und erstelle automatisch Karteikarten
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-12 flex justify-between items-center">
          {['capture', 'ocr', 'form', 'success'].map((s, idx) => (
            <div
              key={s}
              className={`flex items-center ${idx < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s
                    ? 'bg-longchamp-gold text-longchamp-black'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step === s || ['capture', 'ocr', 'form', 'success'].indexOf(step) > idx
                      ? 'bg-longchamp-gold'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Steps Content */}
        {step === 'capture' && (
          <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-8">
            <ImageCapture
              onImageSelected={handleImageSelected}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {step === 'ocr' && (
          <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-8">
            <OCRDisplay
              imageUrl={imageUrl}
              extractedText={extractedText}
              confidence={confidence}
              isLoading={isProcessing}
              onTextChange={handleTextChange}
              onRetry={handleReset}
            />
          </div>
        )}

        {step === 'form' && (
          <CardCreationForm
            extractedText={extractedText}
            userId={user.id}
            onCardCreate={handleCardCreate}
            onCancel={handleReset}
          />
        )}

        {step === 'success' && (
          <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-8 text-center space-y-6">
            <div className="text-6xl">✨</div>
            <h2 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
              Karteikarte erstellt!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Du hast bisher {successCards} Karteikarte{successCards !== 1 ? 'n' : ''} erstellt.
            </p>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleReset}
                className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-3 px-4 rounded-lg"
              >
                📷 Nächstes Foto
              </button>
              <button
                onClick={handleBackToDashboard}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
              >
                🏠 Zum Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
