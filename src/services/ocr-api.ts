// Fallback zu kostenlosen OCR API Services wenn lokal zu schlecht

export interface APIResult {
  text: string
  confidence: number
  source: 'local' | 'api'
}

// Versuche PaddleOCR via kostenloser API
export async function tryCloudOCR(imageBlob: Blob, languages: string[] = ['ger', 'fra', 'eng']): Promise<APIResult | null> {
  try {
    // Konvertiere Blob zu Base64
    const base64 = await blobToBase64(imageBlob)
    const imageData = base64.split(',')[1]

    // Versuche mehrere kostenlose APIs

    // Option 1: Easy-OCR via Replicate (kostenlos, schnell)
    // Benötigt aber API-Token - skip für jetzt

    // Option 2: Nutze einen öffentlichen OCR Service
    // Hier könnte man einen benutzerdefinierten Backend-Service nutzen

    console.log('Cloud OCR nicht konfiguriert - nutze lokale Lösung')
    return null
  } catch (error) {
    console.error('Cloud OCR Fehler:', error)
    return null
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
