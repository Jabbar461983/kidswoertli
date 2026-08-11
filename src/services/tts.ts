export type Language = 'de' | 'fr' | 'en'

export const ttsService = {
  speak(text: string, language: Language = 'de'): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)

      const languageMap: Record<Language, string> = {
        de: 'de-DE',
        fr: 'fr-FR',
        en: 'en-US',
      }

      utterance.lang = languageMap[language]
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(event.error))

      speechSynthesis.speak(utterance)
    })
  },

  stop() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
  },

  isSpeaking(): boolean {
    return speechSynthesis.speaking
  },
}

export const sttService = {
  startListening(language: Language = 'de'): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        reject(new Error('Speech Recognition not supported'))
        return
      }

      const recognition = new SpeechRecognition()

      const languageMap: Record<Language, string> = {
        de: 'de-DE',
        fr: 'fr-FR',
        en: 'en-US',
      }

      recognition.lang = languageMap[language]
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')

        resolve(transcript)
      }

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      recognition.start()
    })
  },

  stopListening() {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.abort()
    }
  },
}
