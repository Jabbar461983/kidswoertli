import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

export interface DetectedPair {
  id: string
  german: string
  foreign_text: string
}

async function preprocessImage(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Increase contrast and brightness for better OCR
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Convert to grayscale
          const gray = r * 0.299 + g * 0.587 + b * 0.114

          // Increase contrast
          const contrast = 1.5
          const adjusted = Math.min(255, Math.max(0, (gray - 128) * contrast + 128))

          data[i] = adjusted
          data[i + 1] = adjusted
          data[i + 2] = adjusted
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(blob)
  })
}

export const ocrService = {
  detectPairs(text: string): DetectedPair[] {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)

    const pairs: DetectedPair[] = []

    // Paar-Erkennung: Alternierend - Zeile 1 = Deutsch, Zeile 2 = Fremdsprache
    for (let i = 0; i < lines.length - 1; i += 2) {
      pairs.push({
        id: `pair-${i}-${Date.now()}`,
        german: lines[i],
        foreign_text: lines[i + 1],
      })
    }

    // Wenn ungerade Anzahl: Letzte Zeile wird ignoriert
    return pairs
  },

  async extractTextMultiLang(
    imageSource: string | Blob,
    languages: string[] = ['ger', 'fra', 'eng']
  ): Promise<OCRResult> {
    const worker = await Tesseract.createWorker()

    try {
      const langString = languages.join('+')

      console.log(`Loading languages: ${langString}`)
      await (worker as any).loadLanguage(langString)
      await (worker as any).initialize(langString)

      // Preprocess image if it's a Blob
      let processedSource = imageSource
      if (imageSource instanceof Blob) {
        console.log('Preprocessing image for better OCR...')
        processedSource = await preprocessImage(imageSource)
      }

      const result = await worker.recognize(processedSource)
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
