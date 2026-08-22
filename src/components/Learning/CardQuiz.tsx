import { useState } from 'react'
import { Card, CardResult, Language } from '@/types'
import { ttsService, sttService } from '@/services/tts'
import { dbService } from '@/services/database'

interface CardQuizProps {
  card: Card
  mode: 'write' | 'speak' | 'read'
  sessionId: string
  onAnswer: (result: CardResult) => void
  onNext: () => void
  cardIndex: number
  totalCards: number
  language: Language
}

export function CardQuiz({
  card,
  mode,
  sessionId,
  onAnswer,
  onNext,
  cardIndex,
  totalCards,
  language,
}: CardQuizProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const languageMap: Record<Language, 'de' | 'fr' | 'en'> = {
    fr: 'fr',
    en: 'en',
  }

  const handleSpeak = async () => {
    try {
      setIsListening(true)
      await ttsService.speak(card.german, 'de')
    } catch (error) {
      console.error('TTS Error:', error)
    } finally {
      setIsListening(false)
    }
  }

  const handleStartListening = async () => {
    try {
      setIsRecording(true)
      const transcript = await sttService.startListening(languageMap[language])
      setUserAnswer(transcript)
    } catch (error) {
      console.error('STT Error:', error)
    } finally {
      setIsRecording(false)
    }
  }

  const checkAnswer = async (answer: string) => {
    const isCorrect = answer
      .toLowerCase()
      .trim()
      .includes(card.foreign_text.toLowerCase().trim()) ||
      card.foreign_text.toLowerCase().trim().includes(answer.toLowerCase().trim())

    const result: CardResult = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      card_id: card.id,
      is_correct: isCorrect,
      created_at: new Date().toISOString(),
    }

    await dbService.recordCardResult(sessionId, card.id, isCorrect)
    onAnswer(result)
    setIsAnswered(true)
  }

  const handleSubmitWrite = () => {
    if (userAnswer.trim()) {
      checkAnswer(userAnswer)
    }
  }

  const handleMarkCorrect = () => {
    checkAnswer(card.foreign_text)
  }

  const handleMarkIncorrect = () => {
    checkAnswer('')
  }

  return (
    <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-8 space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          Frage {cardIndex + 1} von {totalCards}
        </span>
        <div className="w-32 bg-gray-300 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-longchamp-gold h-2 rounded-full transition-all duration-300"
            style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-longchamp-ivory dark:bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory">
          Übersetze folgendes Wort/den Satz:
        </h2>

        <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            {card.german}
          </p>
        </div>

        {/* Metadata */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>📄 Seite: {card.page}</p>
          {card.chapter && <p>📖 Kapitel: {card.chapter}</p>}
        </div>
      </div>

      {/* Answer Section - varies by mode */}
      {mode === 'write' && (
        <div className="space-y-4">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Schreibe deine Antwort hier..."
            disabled={isAnswered}
            rows={3}
            className="w-full px-4 py-3 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory disabled:opacity-50"
          />
        </div>
      )}

      {mode === 'speak' && (
        <div className="space-y-4 text-center">
          <button
            onClick={handleSpeak}
            disabled={isListening || isAnswered}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
          >
            {isListening ? '🔊 Hört zu...' : '🔊 Wort anhören'}
          </button>

          <button
            onClick={handleStartListening}
            disabled={isRecording || isAnswered}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
          >
            {isRecording ? '🎤 Aufnahme läuft...' : '🎤 Deine Antwort sprechen'}
          </button>

          {userAnswer && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Erkannt:</p>
              <p className="font-semibold text-longchamp-black dark:text-longchamp-ivory">
                {userAnswer}
              </p>
            </div>
          )}
        </div>
      )}

      {mode === 'read' && (
        <div className="space-y-4">
          <button
            onClick={handleSpeak}
            disabled={isListening || isAnswered}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
          >
            {isListening ? '🔊 Spielt ab...' : '🔊 Wort anhören'}
          </button>

          {showAnswer ? (
            <div className="bg-longchamp-ivory dark:bg-gray-900 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lösung:</p>
              <p className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
                {card.foreign_text}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              disabled={isAnswered}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
            >
              👁️ Lösung anzeigen
            </button>
          )}
        </div>
      )}

      {/* Answer Feedback */}
      {isAnswered && (
        <div className="bg-longchamp-ivory dark:bg-gray-900 rounded-lg p-6 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Korrekte Antwort:</p>
          <p className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            {card.foreign_text}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {!isAnswered ? (
        <div className="flex gap-4">
          {mode === 'write' && (
            <button
              onClick={handleSubmitWrite}
              disabled={!userAnswer.trim()}
              className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 px-4 rounded-lg"
            >
              ✓ Antwort prüfen
            </button>
          )}

          {mode === 'read' && showAnswer && (
            <button
              onClick={() => checkAnswer(userAnswer || card.foreign_text)}
              className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-3 px-4 rounded-lg"
            >
              Weiter →
            </button>
          )}

          {mode === 'speak' && userAnswer && (
            <button
              onClick={() => checkAnswer(userAnswer)}
              className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-3 px-4 rounded-lg"
            >
              ✓ Antwort prüfen
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={onNext}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            Nächste Frage →
          </button>
        </div>
      )}

      {/* Manual Correction for Read Mode */}
      {mode === 'read' && showAnswer && !isAnswered && (
        <div className="border-t-2 border-longchamp-gold pt-4 space-y-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            War deine Antwort korrekt?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleMarkCorrect}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              ✓ Ja
            </button>
            <button
              onClick={handleMarkIncorrect}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              ✗ Nein
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
