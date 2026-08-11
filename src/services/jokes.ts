import axios from 'axios'

export interface Joke {
  setup: string
  delivery: string
  type: 'twopart' | 'single'
  joke?: string
}

export const jokesService = {
  async getMotivationalMessage(): Promise<string> {
    const messages = [
      'Großartig gemacht! 🎉',
      'Du wirst immer besser! 💪',
      'Fantastisch! 🌟',
      'Weiter so! 🚀',
      'Du schaffst das! ✨',
      'Sehr gut! 👏',
      'Unglaublich! 🎯',
      'Du bist toll! 💎',
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  },

  async getJoke(): Promise<string> {
    try {
      const apiUrl = import.meta.env.VITE_JOKE_API_URL || 'https://v2.jokeapi.dev'

      const response = await axios.get(`${apiUrl}/joke/Any?lang=de&blacklistFlags=nsfw`, {
        timeout: 5000,
      })

      const data = response.data

      if (data.type === 'twopart') {
        return `${data.setup}\n${data.delivery}`
      } else {
        return data.joke || ''
      }
    } catch {
      return await jokesService.getMotivationalMessage()
    }
  },
}
