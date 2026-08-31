import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFlashcards, getProgress } from "../api/supabase";
import { getRandomQuote } from "../data/quotes";
import { LearningMode } from "./LearningMode";
import { AdminPanel } from "./AdminPanel";
import type { FlashCard, LearningProgress } from "../types";

export function Dashboard() {
  const { profile, logout } = useAuth();
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(getRandomQuote());
  const [view, setView] = useState<"dashboard" | "learning" | "admin">("dashboard");

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile) return;
    try {
      const [cards, prog] = await Promise.all([
        getFlashcards(profile.id),
        getProgress(profile.id),
      ]);
      setFlashcards(cards);
      setProgress(prog);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const masteredCount = progress.filter((p) => p.mastered).length;
  const totalCards = flashcards.length;
  const masteredPercentage =
    totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  if (view === "learning") {
    return <LearningMode onBack={() => setView("dashboard")} />;
  }

  if (view === "admin") {
    return <AdminPanel onBack={() => setView("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">KidsWoertli</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hallo, {profile?.vorname}! {profile?.is_admin && "👑"}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Motivation Quote */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-6 mb-8 text-white shadow-lg">
          <p className="text-lg italic text-center">{quote}</p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Vokabeln gelernt</p>
            <p className="text-3xl font-bold text-purple-600">{totalCards}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Beherrscht</p>
            <p className="text-3xl font-bold text-green-600">{masteredCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Erfolgsquote</p>
            <p className="text-3xl font-bold text-pink-600">{masteredPercentage}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Gesamtfortschritt
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${masteredPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {masteredCount} von {totalCards} Vokabeln beherrscht
            </p>
          </div>
        )}

        {/* Admin Section */}
        {profile?.is_admin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-blue-700 mb-4">Admin Panel</h2>
            <button
              onClick={() => setView("admin")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Admin Panel öffnen
            </button>
          </div>
        )}

        {/* Flashcards Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Deine Vokabeln ({totalCards})
            </h2>
            {totalCards > 0 && (
              <button
                onClick={() => setView("learning")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-medium"
              >
                🎯 Jetzt üben
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-gray-500">Laden...</p>
          ) : totalCards === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">Keine Vokabeln vorhanden</p>
              <p className="text-sm text-gray-500 mb-4">
                {profile?.is_admin
                  ? "Laden Sie Bilder über das Admin Panel hoch"
                  : "Fragen Sie einen Administrator"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((card) => {
                const cardProgress = progress.find(
                  (p) => p.flashcard_id === card.id
                );
                return (
                  <div
                    key={card.id}
                    className={`rounded-lg shadow p-4 cursor-pointer transition ${
                      cardProgress?.mastered
                        ? "bg-green-50 border-2 border-green-500"
                        : "bg-white hover:shadow-lg"
                    }`}
                  >
                    <p className="text-sm text-gray-500 mb-2">Deutsch</p>
                    <p className="font-bold text-lg text-gray-800 mb-4">
                      {card.text_a}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">Französisch</p>
                    <p className="font-bold text-lg text-purple-600">
                      {card.text_b}
                    </p>
                    {cardProgress && (
                      <div className="mt-4 text-xs text-gray-500">
                        ✓ {cardProgress.correct_count} | ✗{" "}
                        {cardProgress.incorrect_count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
