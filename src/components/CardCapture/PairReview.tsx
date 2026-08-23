import { useState } from 'react'
import { DetectedPair } from '@/services/ocr'

interface PairReviewProps {
  pairs: DetectedPair[]
  confidence: number
  onConfirm: (selectedPairs: DetectedPair[]) => void
  onRetry: () => void
}

export function PairReview({
  pairs,
  confidence,
  onConfirm,
  onRetry,
}: PairReviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [localPairs, setLocalPairs] = useState<DetectedPair[]>(pairs)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(pairs.map(p => p.id))
  )

  const handleEditStart = (id: string) => {
    setEditingId(id)
  }

  const handleEditSave = (id: string, german: string, foreign_text: string) => {
    setLocalPairs(
      localPairs.map(p =>
        p.id === id ? { ...p, german, foreign_text } : p
      )
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setLocalPairs(localPairs.filter(p => p.id !== id))
    selectedIds.delete(id)
    setSelectedIds(new Set(selectedIds))
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === localPairs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(localPairs.map(p => p.id)))
    }
  }

  const selectedPairs = localPairs.filter(p => selectedIds.has(p.id))

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-longchamp-black dark:text-longchamp-ivory">
            📋 Erkannte Wortpaare
          </h3>
          <span className="text-xs bg-longchamp-gold text-longchamp-black px-2 py-1 rounded">
            {(confidence * 100).toFixed(0)}% Genauigkeit
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {localPairs.length} Paare erkannt • {selectedPairs.length} ausgewählt
        </p>
      </div>

      {localPairs.length === 0 ? (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg">
          Keine Paare erkannt. Bitte versuche es nochmal oder bearbeite den Text manuell.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <label className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === localPairs.length && localPairs.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4"
            />
            <span className="font-medium">
              {selectedIds.size === localPairs.length && localPairs.length > 0
                ? 'Alle abwählen'
                : 'Alle auswählen'}
            </span>
          </label>

          {/* Pairs List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {localPairs.map((pair) => (
              <div
                key={pair.id}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(pair.id)}
                    onChange={() => handleToggleSelect(pair.id)}
                    className="w-4 h-4 mt-1"
                  />

                  {editingId === pair.id ? (
                    <div className="flex-1 space-y-2">
                      <textarea
                        defaultValue={pair.german}
                        onBlur={(e) =>
                          handleEditSave(pair.id, e.target.value, pair.foreign_text)
                        }
                        autoFocus
                        className="w-full px-3 py-2 border border-longchamp-gold rounded-lg text-sm dark:bg-longchamp-black dark:text-longchamp-ivory"
                        rows={1}
                      />
                      <textarea
                        defaultValue={pair.foreign_text}
                        onBlur={(e) =>
                          handleEditSave(pair.id, pair.german, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-longchamp-gold rounded-lg text-sm dark:bg-longchamp-black dark:text-longchamp-ivory"
                        rows={1}
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      >
                        ✓ Speichern
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium text-longchamp-black dark:text-longchamp-ivory">
                          🇩🇪 {pair.german}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🇫🇷 {pair.foreign_text}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingId !== pair.id && (
                      <>
                        <button
                          onClick={() => handleEditStart(pair.id)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(pair.id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onConfirm(selectedPairs)}
          disabled={selectedPairs.length === 0}
          className="flex-1 bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 px-4 rounded-lg"
        >
          ✓ Weiter ({selectedPairs.length} Paare)
        </button>
        <button
          onClick={onRetry}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
        >
          🔄 Zurück
        </button>
      </div>
    </div>
  )
}
