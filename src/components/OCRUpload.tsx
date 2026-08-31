import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addFlashcard } from "../api/supabase";
import type { OCRResult } from "../types";

export function OCRUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const { profile } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handleImageUpload = async () => {
    if (!imageFile || !profile) return;

    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(",")[1];
          const mediaType = imageFile.type as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp";

          const res = await fetch("/.netlify/functions/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64,
              mediaType,
              languagePair: "de-fr",
            }),
          });

          const data = await res.json();
          setOcrResult(data);
        } catch (error) {
          console.error("OCR Error:", error);
          alert("Fehler bei der Bildverarbeitung");
        } finally {
          setProcessing(false);
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error("Error:", error);
      setProcessing(false);
    }
  };

  const handleSaveCards = async () => {
    if (!ocrResult?.pairs || !profile) return;

    setSaving(true);
    let count = 0;
    try {
      for (const pair of ocrResult.pairs) {
        if (pair.de && pair.fr) {
          await addFlashcard(profile.id, pair.de, pair.fr, "fr");
          count++;
        }
      }
      setSavedCount(count);
      alert(`${count} Vokabeln wurden gespeichert!`);
      onUploadComplete();
    } catch (error) {
      console.error("Error saving cards:", error);
      alert("Fehler beim Speichern der Vokabeln");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vokabelseite fotografieren (JPG, PNG)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files?.[0] || null);
            setOcrResult(null);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <button
        onClick={handleImageUpload}
        disabled={!imageFile || processing}
        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
      >
        {processing ? "🔄 OCR läuft..." : "📸 Bild analysieren"}
      </button>

      {ocrResult && (
        <div className="bg-purple-50 rounded-lg p-6">
          <h4 className="font-bold text-purple-900 mb-4">
            ✅ {ocrResult.total} Vokabel-Paare erkannt:
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {ocrResult.pairs.map((pair, i) => (
              <div
                key={i}
                className="bg-white p-3 rounded border border-purple-200 text-sm"
              >
                <p className="font-medium text-gray-800">{pair.de}</p>
                <p className="text-gray-600">→ {pair.fr || pair.en}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Vertrauen: {ocrResult.confidence}
          </p>
          <button
            onClick={handleSaveCards}
            disabled={saving}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {saving ? "💾 Speichert..." : "💾 Vokabeln speichern"}
          </button>
        </div>
      )}
    </div>
  );
}
