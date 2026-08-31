import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFlashcards, updateProgress } from "../api/supabase";
import { getRandomQuote } from "../data/quotes";
import type { FlashCard, LearningProgress } from "../types";

interface LearningState {
  cardIndex: number;
  isFlipped: boolean;
  feedback: "correct" | "incorrect" | null;
  progress: Record<number, LearningProgress>;
}

export function LearningMode({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [state, setState] = useState<LearningState>({
    cardIndex: 0,
    isFlipped: false,
    feedback: null,
    progress: {},
  });
  const [quote, setQuote] = useState(getRandomQuote());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadFlashcards();
  }, [profile?.id]);

  const loadFlashcards = async () => {
    if (!profile) return;
    try {
      const cards = await getFlashcards(profile.id);
      setFlashcards(cards);
      setLoading(false);
    } catch (error) {
      console.error("Error loading flashcards:", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Lädt...</div>;
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Keine Vokabeln vorhanden</p>
        <button
          onClick={onBack}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg"
        >
          Zurück
        </button>
      </div>
    );
  }

  const currentCard = flashcards[state.cardIndex];
  const progress = state.progress[currentCard.id];
  const isMastered = progress?.mastered || false;

  const handleCorrect = async () => {
    if (!profile) return;
    try {
      const newProgress = await updateProgress(profile.id, currentCard.id, true);
      setState((prev) => ({
        ...prev,
        feedback: "correct",
        progress: { ...prev.progress, [currentCard.id]: newProgress },
      }));
      setQuote(getRandomQuote());
      setTimeout(() => nextCard(), 1500);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleIncorrect = async () => {
    if (!profile) return;
    try {
      const newProgress = await updateProgress(
        profile.id,
        currentCard.id,
        false
      );
      setState((prev) => ({
        ...prev,
        feedback: "incorrect",
        progress: { ...prev.progress, [currentCard.id]: newProgress },
      }));
      setTimeout(() => nextCard(), 1500);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const nextCard = () => {
    setState((prev) => ({
      ...prev,
      cardIndex: (prev.cardIndex + 1) % flashcards.length,
      isFlipped: false,
      feedback: null,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {/* Motivation Quote */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-6 text-white shadow-lg">
          <p className="text-center italic">{quote}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Karte {state.cardIndex + 1} von {flashcards.length}
          </p>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Flashcard */}
        <div
          className={`h-80 rounded-xl shadow-2xl cursor-pointer transition-all duration-300 transform ${
            state.isFlipped ? "scale-100" : "scale-100"
          } ${
            isMastered
              ? "bg-gradient-to-br from-green-200 to-green-100 border-4 border-green-500"
              : state.feedback === "correct"
                ? "bg-gradient-to-br from-green-200 to-green-100"
                : state.feedback === "incorrect"
                  ? "bg-gradient-to-br from-red-200 to-red-100"
                  : "bg-gradient-to-br from-purple-300 to-pink-300"
          }`}
          onClick={() => setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))}
        >
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                {state.isFlipped ? "Französisch" : "Deutsch"}
              </p>
              <p className="text-4xl font-bold text-white">
                {state.isFlipped ? currentCard.text_b : currentCard.text_a}
              </p>
              {isMastered && (
                <p className="text-lg mt-4 text-green-700">✓ Beherrscht!</p>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {state.feedback && (
          <div className="mt-6 text-center">
            <p
              className={`text-lg font-bold ${
                state.feedback === "correct"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {state.feedback === "correct" ? "✓ Richtig!" : "✗ Versuche nochmal"}
            </p>
          </div>
        )}

        {/* Controls */}
        {!state.feedback && (
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={handleIncorrect}
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition font-bold text-lg"
            >
              ✗ Nicht gewusst
            </button>
            <button
              onClick={handleCorrect}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-bold text-lg"
            >
              ✓ Gewusst
            </button>
          </div>
        )}

        {/* Card Stats */}
        {progress && (
          <div className="mt-8 bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Diese Karte</p>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {progress.correct_count}
                </p>
                <p className="text-xs text-gray-600">Richtig</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {progress.incorrect_count}
                </p>
                <p className="text-xs text-gray-600">Falsch</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
