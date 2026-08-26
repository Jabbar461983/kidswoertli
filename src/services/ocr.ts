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

// Deskew image - detect and correct rotation
async function deskewImage(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Simple edge detection to find dominant angle
  let maxEdges = 0
  let bestAngle = 0

  // Test angles from -10 to 10 degrees
  for (let angle = -10; angle <= 10; angle += 0.5) {
    let edgeCount = 0

    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4
        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114

        const idx2 = (y * canvas.width + (x + 1)) * 4
        const gray2 = data[idx2] * 0.299 + data[idx2 + 1] * 0.587 + data[idx2 + 2] * 0.114

        if (Math.abs(gray - gray2) > 30) {
          edgeCount++
        }
      }
    }

    if (edgeCount > maxEdges) {
      maxEdges = edgeCount
      bestAngle = angle
    }
  }

  // Apply rotation if angle is significant
  if (Math.abs(bestAngle) > 0.5) {
    const rad = (bestAngle * Math.PI) / 180
    const newCanvas = document.createElement('canvas')
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    newCanvas.width = Math.abs(canvas.width * cos) + Math.abs(canvas.height * sin)
    newCanvas.height = Math.abs(canvas.width * sin) + Math.abs(canvas.height * cos)

    const newCtx = newCanvas.getContext('2d')!
    newCtx.translate(newCanvas.width / 2, newCanvas.height / 2)
    newCtx.rotate(rad)
    newCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)

    return newCanvas
  }

  return canvas
}

async function preprocessImage(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const img = new Image()
      img.onload = async () => {
        let canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        let ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        // Step 0: Deskew (begradigen)
        console.log('Deskewing image...')
        canvas = await deskewImage(canvas)
        ctx = canvas.getContext('2d')!

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

        // Step 2: Histogram Equalization
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
          gray[i] = Math.round((cdf[gray[i]] - cdfMin) * scale)
        }

        // Step 3: Otsu's Thresholding für optimale Binarization
        let sum = 0
        for (let i = 0; i < 256; i++) {
          sum += i * histogram[i]
        }

        let sumB = 0
        let wB = 0
        let wF
        let mB
        let mF
        let maxVar = 0
        let threshold = 0

        for (let t = 0; t < 256; t++) {
          wB += histogram[t]
          if (wB === 0) continue

          wF = gray.length - wB
          if (wF === 0) break

          sumB += t * histogram[t]
          mB = sumB / wB
          mF = (sum - sumB) / wF

          const varBetween = wB * wF * Math.pow(mB - mF, 2)

          if (varBetween > maxVar) {
            maxVar = varBetween
            threshold = t
          }
        }

        // Apply threshold
        for (let i = 0; i < gray.length; i++) {
          const binaryValue = gray[i] > threshold ? 255 : 0
          data[i * 4] = binaryValue
          data[i * 4 + 1] = binaryValue
          data[i * 4 + 2] = binaryValue
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(blob)
  })
}

// Convert Blob to base64 safely
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Result is in format "data:image/...;base64,..."
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const ocrService = {
  async extractTextViaBackend(imageBlob: Blob): Promise<OCRResult> {
    try {
      // Convert Blob to base64
      const imageBase64 = await blobToBase64(imageBlob)
      const mediaType = imageBlob.type || 'image/jpeg'

      // Call Netlify Function
      const response = await fetch('/.netlify/functions/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mediaType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('OCR function error:', errorData)
        throw new Error(`OCR failed: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'OCR failed')
      }

      return {
        text: result.text,
        confidence: result.confidence,
      }
    } catch (error) {
      console.error('Netlify OCR error:', error)
      console.log('Falling back to local Tesseract OCR...')
      return await ocrService.extractTextMultiLang(imageBlob)
    }
  },

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
