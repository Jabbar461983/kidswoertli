import { useRef, useState } from 'react'

interface ImageCaptureProps {
  onImageSelected: (blob: Blob) => void
  isProcessing: boolean
}

export function ImageCapture({ onImageSelected, isProcessing }: ImageCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [error, setError] = useState<string>()

  const startCamera = async () => {
    try {
      setError(undefined)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (err) {
      setError('Kamera konnte nicht geöffnet werden')
      console.error(err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onImageSelected(blob)
        stopCamera()
      }
    }, 'image/jpeg', 0.95)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelected(file)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!isCameraOpen ? (
        <div className="flex gap-4">
          <button
            onClick={startCamera}
            disabled={isProcessing}
            className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            📷 Kamera öffnen
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            📁 Bild hochladen
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              📸 Foto machen
            </button>

            <button
              onClick={stopCamera}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              ❌ Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
