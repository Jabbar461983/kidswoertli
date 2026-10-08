// Klassenwortschatz Französisch, Päckli 3 (KW 37 + 38)
// Die Karteikarten selbst liegen in Supabase (siehe supabase/scripts/paeckli3_reset.sql).
// Hier stehen nur die Zusatzinhalte für Lückentext, Genus und Fixpunkt.

export const PAECKLI_MEDIUM_TITLE = 'Klassenwortschatz Französisch'

export const FIXPUNKT = {
  name: 'Fixpunkt 3',
  // 20.10.2026 (Monat ist 0-basiert)
  date: new Date(2026, 9, 20),
}

export const PAECKLI_INFO: Record<string, string> = {
  'Päckli 3A': 'KW 37',
  'Päckli 3B': 'KW 38',
}

export interface GapExercise {
  chapter: string
  before: string
  answer: string
  after: string
  german: string
}

export const GAPS: GapExercise[] = [
  { chapter: 'Päckli 3A', before: 'Ça ', answer: 'dure', after: ' quelques minutes.', german: 'Es dauert einige Minuten.' },
  { chapter: 'Päckli 3A', before: 'Il ', answer: 'y', after: ' a beaucoup de personnes.', german: 'Es hat viele Leute.' },
  { chapter: 'Päckli 3A', before: 'Il y a beaucoup ', answer: 'de', after: ' chevaux.', german: 'Es hat viele Pferde.' },
  { chapter: 'Päckli 3A', before: 'Il y a beaucoup de ', answer: 'chevaux', after: '.', german: 'Es hat viele Pferde.' },
  { chapter: 'Päckli 3B', before: 'On ', answer: 'peut', after: ' voir un spectacle.', german: 'Man kann eine Vorstellung sehen.' },
  { chapter: 'Päckli 3B', before: 'On peut voir un ', answer: 'spectacle', after: '.', german: 'Man kann eine Vorstellung sehen.' },
  { chapter: 'Päckli 3B', before: 'Je ', answer: 'trouve', after: ' ça magnifique.', german: 'Ich finde das wunderschön.' },
  { chapter: 'Päckli 3B', before: 'Je trouve ça ', answer: 'impressionnant', after: '.', german: 'Ich finde das beeindruckend.' },
]

export type Genus = 'm' | 'f' | 'm/f'

export interface GenusExercise {
  word: string
  german: string
  genus: Genus
  source: 'Blatt' | 'aus den Sätzen'
}

export const GENUS: GenusExercise[] = [
  { word: 'garçon', german: 'Junge', genus: 'm', source: 'Blatt' },
  { word: 'fille', german: 'Mädchen', genus: 'f', source: 'Blatt' },
  { word: 'enfant', german: 'Kind', genus: 'm/f', source: 'Blatt' },
  { word: 'personne', german: 'Person', genus: 'f', source: 'aus den Sätzen' },
  { word: 'cheval', german: 'Pferd', genus: 'm', source: 'aus den Sätzen' },
  { word: 'spectacle', german: 'Vorstellung', genus: 'm', source: 'aus den Sätzen' },
  { word: 'minute', german: 'Minute', genus: 'f', source: 'aus den Sätzen' },
  { word: 'seconde', german: 'Sekunde', genus: 'f', source: 'aus den Sätzen' },
]

// Genus-Angaben, die auf dem Blatt direkt bei einer Karte stehen
export const CARD_GENUS: Record<string, Genus> = {
  'des garçons': 'm',
  'des filles': 'f',
  'des enfants': 'm/f',
}

export function withArticle(x: GenusExercise): string {
  const vowel = /^[aeiouh]/i.test(x.word)
  if (x.genus === 'm/f') return `${vowel ? "l'" : 'le/la '}${x.word} · un/une ${x.word}`
  if (x.genus === 'm') return `${vowel ? "l'" : 'le '}${x.word} · un ${x.word}`
  return `${vowel ? "l'" : 'la '}${x.word} · une ${x.word}`
}
