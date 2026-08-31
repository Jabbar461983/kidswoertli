import { createClient } from "@supabase/supabase-js";
import type { FlashCard, LearningProgress, AppSettings } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// FLASHCARDS
export async function getFlashcards(profileId: number): Promise<FlashCard[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("profile_id", profileId);

  if (error) throw error;
  return data || [];
}

export async function addFlashcard(
  profileId: number,
  textA: string,
  textB: string,
  languageB: string = "fr"
): Promise<FlashCard> {
  const { data, error } = await supabase
    .from("flashcards")
    .insert([
      {
        profile_id: profileId,
        language_a: "de",
        text_a: textA,
        language_b: languageB,
        text_b: textB,
        confidence: 0.95,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFlashcard(cardId: number): Promise<void> {
  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", cardId);

  if (error) throw error;
}

// LEARNING PROGRESS
export async function getProgress(
  profileId: number
): Promise<LearningProgress[]> {
  const { data, error } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("profile_id", profileId);

  if (error) throw error;
  return data || [];
}

export async function updateProgress(
  profileId: number,
  flashcardId: number,
  isCorrect: boolean
): Promise<LearningProgress> {
  // Upsert progress
  const { data: existing } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("profile_id", profileId)
    .eq("flashcard_id", flashcardId)
    .single();

  const updates = existing
    ? {
        correct_count: isCorrect
          ? existing.correct_count + 1
          : existing.correct_count,
        incorrect_count: !isCorrect
          ? existing.incorrect_count + 1
          : existing.incorrect_count,
        last_practiced: new Date().toISOString(),
        mastered:
          (isCorrect
            ? existing.correct_count + 1
            : existing.correct_count) >= 2,
      }
    : {
        profile_id: profileId,
        flashcard_id: flashcardId,
        correct_count: isCorrect ? 1 : 0,
        incorrect_count: !isCorrect ? 1 : 0,
        last_practiced: new Date().toISOString(),
        mastered: false,
      };

  const { data, error } = existing
    ? await supabase
        .from("learning_progress")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single()
    : await supabase
        .from("learning_progress")
        .insert([updates])
        .select()
        .single();

  if (error) throw error;
  return data;
}

export async function resetProgress(profileId: number): Promise<void> {
  const { error } = await supabase
    .from("learning_progress")
    .delete()
    .eq("profile_id", profileId);

  if (error) throw error;
}

// APP SETTINGS
export async function getSettings(profileId: number): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function updateSettings(
  profileId: number,
  languagePair: string
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({
      profile_id: profileId,
      language_pair: languagePair,
      anthropic_api_key: "", // Not stored client-side
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
