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

        // Step 1: Convert to grayscale
        const gray = new Uint8Array(data.length / 4)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          gray[i / 4] = r * 0.299 + g * 0.587 + b * 0.114
        }

        // Step 2: Histogram Equalization für bessere Kontraste
        const histogram = new Uint32Array(256)
        for (let i = 0; i < gray.length; i++) {
          histogram[gray[i]]++
        }

        const cdf = new Uint32Array(256)
        cdf[0] = histogram[0]
        for (let i = 1; i < 256; i++) {
          cdf[i] = cdf[i - 1] + histogram[i]
        }

        const cdfMin = cdf[0]
        const scale = 255 / (gray.length - cdfMin)
        for (let i = 0; i < gray.length; i++) {
          gray[i] = Math.round(((cdf[gray[i]] - cdfMin) * scale))
        }

        // Step 3: Adaptive Thresholding für Binarization
        const blockSize = 25
        const offset = 10
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = y * canvas.width + x
            let sum = 0
            let count = 0

            for (let dy = -Math.floor(blockSize / 2); dy <= Math.floor(blockSize / 2); dy++) {
              for (let dx = -Math.floor(blockSize / 2); dx <= Math.floor(blockSize / 2); dx++) {
                const ny = Math.max(0, Math.min(canvas.height - 1, y + dy))
                const nx = Math.max(0, Math.min(canvas.width - 1, x + dx))
                sum += gray[ny * canvas.width + nx]
                count++
              }
            }

            const mean = sum / count
            const threshold = mean - offset
            const binaryValue = gray[idx] > threshold ? 255 : 0

            data[idx * 4] = binaryValue
            data[idx * 4 + 1] = binaryValue
            data[idx * 4 + 2] = binaryValue
          }
        }

        // Step 4: Contrast Stretching
        let minVal = 255
        let maxVal = 0
        for (let i = 0; i < data.length; i += 4) {
          minVal = Math.min(minVal, data[i])
          maxVal = Math.max(maxVal, data[i])
        }

        if (maxVal > minVal) {
          const range = maxVal - minVal
          for (let i = 0; i < data.length; i += 4) {
            const stretched = Math.round(((data[i] - minVal) / range) * 255)
            data[i] = stretched
            data[i + 1] = stretched
            data[i + 2] = stretched
          }
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

      // Set Tesseract config for better table recognition
      // PSM 6 = Uniform block of text (good for tables)
      await (worker as any).setParameters({
        tessedit_pageseg_mode: 6,
      })

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
