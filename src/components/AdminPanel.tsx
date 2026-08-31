import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { OCRUpload } from "./OCRUpload";
import type { Profile } from "../types";

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<"users" | "ocr" | "settings">("ocr");
  const [newUserData, setNewUserData] = useState({
    username: "",
    vorname: "",
    password: "",
  });

  if (!profile?.is_admin) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Nur Administratoren können auf diese Seite zugreifen</p>
        <button
          onClick={onBack}
          className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
        >
          Zurück
        </button>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("User creation coming soon");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-600">Admin Panel</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Zurück
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("ocr")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              tab === "ocr"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📸 Vokabeln hochladen
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              tab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            👥 Profile verwalten
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              tab === "settings"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ⚙️ Einstellungen
          </button>
        </div>

        {/* OCR Tab */}
        {tab === "ocr" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Vokabeln aus Bildern extrahieren
            </h3>
            <p className="text-gray-600 mb-6">
              Fotografiere eine Vokabelseite und wir erkennen automatisch alle
              Deutsch-Französisch Paare mit Claude Vision AI.
            </p>
            <OCRUpload onUploadComplete={() => setTab("ocr")} />
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Neue Profile erstellen
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benutzername
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vorname
                </label>
                <input
                  type="text"
                  value={newUserData.vorname}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      vorname: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Profil erstellen
              </button>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="bg-white rounded-lg shadow p-6 max-w-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              App-Einstellungen
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wird für OCR-Verarbeitung verwendet
                </p>
              </div>
              <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Speichern
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
