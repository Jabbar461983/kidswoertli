import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

export const ocrService = {
  async extractText(imageSource: string | Blob): Promise<OCRResult> {
    const worker = await Tesseract.createWorker()

    try {
      const result = await worker.recognize(imageSource)
      const text = result.data.text.trim()
      const confidence = result.data.confidence

      return {
        text,
        confidence: confidence / 100,
      }
    } finally {
      await worker.terminate()
    }
  },

  async extractTextMultiLang(
    imageSource: string | Blob,
    languages: string[] = ['ger', 'fra', 'eng']
  ): Promise<OCRResult> {
    const worker = await Tesseract.createWorker()

    try {
      await worker.loadLanguage(languages)
      await worker.initialize(languages)

      const result = await worker.recognize(imageSource)
      const text = result.data.text.trim()
      const confidence = result.data.confidence

      return {
        text,
        confidence: confidence / 100,
      }
    } finally {
      await worker.terminate()
    }
  },
}
