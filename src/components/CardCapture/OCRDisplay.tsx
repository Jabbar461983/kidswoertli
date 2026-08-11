import { useState } from 'react'

interface OCRDisplayProps {
  imageUrl: string
  extractedText: string
  confidence: number
  isLoading: boolean
  onTextChange: (text: string) => void
  onRetry: () => void
}

export function OCRDisplay({
  imageUrl,
  extractedText,
  confidence,
  isLoading,
  onTextChange,
  onRetry,
}: OCRDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(extractedText)

  const handleSave = () => {
    onTextChange(editText)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Preview */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-longchamp-black dark:text-longchamp-ivory">
            📷 Foto
          </h3>
          <img
            src={imageUrl}
            alt="Fotografiertes Bild"
            className="w-full rounded-lg border-2 border-longchamp-gold"
          />
        </div>

        {/* Extracted Text */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-longchamp-black dark:text-longchamp-ivory">
              📝 Erkannter Text
            </h3>
            <span className="text-xs bg-longchamp-gold text-longchamp-black px-2 py-1 rounded">
              {(confidence * 100).toFixed(0)}% Genauigkeit
            </span>
          </div>

          {isLoading ? (
            <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">⚙️</div>
                <p className="text-gray-600 dark:text-gray-400">Text wird extrahiert...</p>
              </div>
            </div>
          ) : isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-40 px-4 py-3 border-2 border-longchamp-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-longchamp-gold dark:bg-longchamp-black dark:text-longchamp-ivory"
                placeholder="Text bearbeiten..."
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  ✓ Speichern
                </button>
                <button
                  onClick={() => {
                    setEditText(extractedText)
                    setIsEditing(false)
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  ✕ Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-40 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-y-auto">
                <p className="text-longchamp-black dark:text-longchamp-ivory whitespace-pre-wrap">
                  {extractedText || 'Kein Text erkannt'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                ✎ Bearbeiten
              </button>
            </div>
          )}
        </div>
      </div>

      {!isLoading && (
        <button
          onClick={onRetry}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          🔄 Neues Foto
        </button>
      )}
    </div>
  )
}
