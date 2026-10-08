import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { dbService } from '@/services/database'
import { ttsService } from '@/services/tts'
import { Card } from '@/types'
import {
  CARD_GENUS,
  FIXPUNKT,
  GAPS,
  GENUS,
  Genus,
  PAECKLI_INFO,
  PAECKLI_MEDIUM_TITLE,
  withArticle,
} from '@/data/paeckli3'

type Tab = 'cards' | 'gaps' | 'genus' | 'list'
type Direction = 'fd' | 'df' | 'mix'
type Status = 'ok' | 'nok'

interface Stored {
  status: Record<string, Status>
  dir: Direction
}

// ---------- helpers ----------
const storageKey = (userId: string) => `kidswoertli-paeckli3-${userId}`

function loadStored(userId: string): Stored {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        status: parsed.status ?? {},
        dir: ['fd', 'df', 'mix'].includes(parsed.dir) ? parsed.dir : 'mix',
      }
    }
  } catch {
    // ignore
  }
  return { status: {}, dir: 'mix' }
}

function saveStored(userId: string, s: Stored) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(s))
  } catch {
    // ignore
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function say(text: string, lang: 'fr' | 'de') {
  const clean = text.replace(/…/g, '').replace(/\//g, lang === 'fr' ? ' ou ' : ' oder ')
  try {
    ttsService.stop()
    ttsService.speak(clean, lang).catch(() => undefined)
  } catch {
    // Vorlesen nicht unterstützt
  }
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[’']/g, "'")
const noAccents = (s: string) => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '')

function daysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((date.getTime() - today.getTime()) / 86400000)
}

const DIR_OPTIONS: { value: Direction; title: string; hint: string }[] = [
  { value: 'fd', title: 'Nur Französisch → Deutsch', hint: 'Du siehst Französisch und sagst Deutsch' },
  { value: 'df', title: 'Nur Deutsch → Französisch', hint: 'Du siehst Deutsch und sagst Französisch' },
  { value: 'mix', title: 'Gemischt', hint: 'Beide Richtungen zufällig' },
]

function SpeakButton({ text, lang }: { text: string; lang: 'fr' | 'de' }) {
  return (
    <button
      type="button"
      onClick={() => say(text, lang)}
      aria-label="Vorlesen"
      className="shrink-0 w-11 h-11 rounded-full border-2 border-longchamp-gold flex items-center justify-center hover:bg-longchamp-ivory dark:hover:bg-gray-800"
    >
      🔊
    </button>
  )
}

// ---------- page ----------
export function PaeckliPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Card[]>([])
  const [tab, setTab] = useState<Tab>('cards')
  const [stored, setStored] = useState<Stored>({ status: {}, dir: 'mix' })

  useEffect(() => {
    if (!user) return
    setStored(loadStored(user.id))
    ;(async () => {
      try {
        setLoading(true)
        const media = await dbService.getUserMedia(user.id)
        const medium = media.find((m) => m.title === PAECKLI_MEDIUM_TITLE && m.language === 'fr')
        if (medium) {
          const data = await dbService.getCardsByMedium(medium.id)
          data.sort(
            (a, b) =>
              (a.chapter || '').localeCompare(b.chapter || '') ||
              a.created_at.localeCompare(b.created_at)
          )
          setCards(data)
        }
      } catch (e) {
        console.error('Fehler beim Laden der Päckli:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  if (!user) return null

  const update = (next: Stored) => {
    setStored(next)
    saveStored(user.id, next)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'cards', label: 'Karten' },
    { id: 'gaps', label: 'Lücken' },
    { id: 'genus', label: 'm / f' },
    { id: 'list', label: 'Liste' },
  ]

  return (
    <div className="min-h-screen bg-longchamp-ivory dark:bg-longchamp-black pb-12">
      <header className="bg-white dark:bg-longchamp-black border-b-2 border-longchamp-gold shadow">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-longchamp-gold hover:text-longchamp-dark-gold mb-2"
          >
            ← Zurück
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Französisch · Klassenwortschatz
          </p>
          <h1 className="text-2xl font-bold text-longchamp-black dark:text-longchamp-ivory">
            Päckli 3A &amp; 3B
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Lädt Päckli…</p>
        ) : cards.length === 0 ? (
          <div className="bg-white dark:bg-longchamp-black border-2 border-dashed border-longchamp-gold rounded-lg p-6 text-center text-gray-600 dark:text-gray-400">
            <p className="font-semibold">Noch keine Päckli-Karten vorhanden.</p>
            <p className="text-sm mt-2">
              Die Karten werden mit dem SQL-Skript <code>supabase/scripts/paeckli3_reset.sql</code> in
              Supabase angelegt.
            </p>
          </div>
        ) : (
          <>
            <FixpunktPanel cards={cards} status={stored.status} />

            <nav
              role="tablist"
              className="grid grid-cols-4 gap-1 bg-white dark:bg-gray-900 border-2 border-longchamp-gold rounded-lg p-1 sticky top-0 z-10"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`py-2 rounded-md text-sm font-bold transition ${
                    tab === t.id
                      ? 'bg-longchamp-gold text-longchamp-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-longchamp-ivory dark:hover:bg-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {tab === 'cards' && <CardsTab cards={cards} stored={stored} update={update} />}
            {tab === 'gaps' && <GapsTab />}
            {tab === 'genus' && <GenusTab />}
            {tab === 'list' && <ListTab cards={cards} status={stored.status} />}
          </>
        )}

        <p className="text-center text-sm italic text-gray-500 dark:text-gray-400 pt-4">
          Jeder Schritt vorwärts zählt, egal wie klein er ist.
        </p>
      </main>
    </div>
  )
}

// ---------- Fixpunkt ----------
function FixpunktPanel({ cards, status }: { cards: Card[]; status: Record<string, Status> }) {
  const days = daysUntil(FIXPUNKT.date)
  const chapters = Array.from(new Set(cards.map((c) => c.chapter))).sort()
  const open = cards.filter((c) => status[c.id] !== 'ok').length
  const nok = cards.filter((c) => status[c.id] === 'nok').length

  let heading = `Tage bis ${FIXPUNKT.name}`
  if (days === 1) heading = `Tag bis ${FIXPUNKT.name}`
  if (days === 0) heading = `Heute ist ${FIXPUNKT.name}`
  if (days < 0) heading = `${FIXPUNKT.name} ist vorbei`

  let plan: string
  if (open === 0) {
    plan = 'Alle Karten sitzen. Bis zum Fixpunkt reicht eine kurze Runde alle zwei Tage zum Wiederholen.'
  } else if (days <= 0) {
    plan = `Noch ${open} Karten offen. Heute nochmals alle durchgehen.`
  } else {
    const perDay = Math.ceil(open / Math.max(1, days - 1))
    plan = `Noch ${open} Karten offen${nok ? `, davon ${nok} nicht gewusst` : ''}. Mit ${perDay} Karte${
      perDay > 1 ? 'n' : ''
    } pro Tag bist du einen Tag vor dem Fixpunkt fertig.`
  }

  const dateLabel = FIXPUNKT.date.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <section className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-5 space-y-4">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-5xl font-bold text-longchamp-dark-gold tabular-nums leading-none">
          {Math.max(0, days)}
        </span>
        <div>
          <h2 className="font-bold text-lg text-longchamp-black dark:text-longchamp-ivory">{heading}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{dateLabel}</p>
        </div>
      </div>

      <div className="space-y-2">
        {chapters.map((ch) => {
          const cs = cards.filter((c) => c.chapter === ch)
          const ok = cs.filter((c) => status[c.id] === 'ok').length
          const no = cs.filter((c) => status[c.id] === 'nok').length
          return (
            <div key={ch} className="grid grid-cols-[6.5rem_1fr_auto] gap-3 items-center text-sm">
              <span>
                <b>{ch.replace('Päckli ', '')}</b>{' '}
                <span className="text-gray-500 dark:text-gray-400">{PAECKLI_INFO[ch] ?? ''}</span>
              </span>
              <div
                className="flex h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
                role="img"
                aria-label={`${ok} gewusst, ${no} nicht gewusst von ${cs.length}`}
              >
                <div className="bg-green-500" style={{ width: `${(ok / cs.length) * 100}%` }} />
                <div className="bg-red-500" style={{ width: `${(no / cs.length) * 100}%` }} />
              </div>
              <span className="tabular-nums text-gray-500 dark:text-gray-400">
                {ok}/{cs.length}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-sm text-longchamp-black dark:text-longchamp-ivory">{plan}</p>
    </section>
  )
}

// ---------- Karten ----------
interface RoundItem {
  card: Card
  dir: 'fd' | 'df'
}

function CardsTab({
  cards,
  stored,
  update,
}: {
  cards: Card[]
  stored: Stored
  update: (s: Stored) => void
}) {
  const chapters = useMemo(() => Array.from(new Set(cards.map((c) => c.chapter))).sort(), [cards])
  const [selected, setSelected] = useState<Set<string>>(new Set(chapters))
  const [onlyNok, setOnlyNok] = useState(false)
  const [round, setRound] = useState<RoundItem[] | null>(null)
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(false)
  const [results, setResults] = useState<Record<string, Status>>({})
  const [finished, setFinished] = useState(false)

  const status = stored.status
  const pool = cards.filter(
    (c) => selected.has(c.chapter) && (!onlyNok || status[c.id] === 'nok')
  )
  const nokTotal = cards.filter((c) => status[c.id] === 'nok').length

  const toggleChapter = (ch: string) => {
    const next = new Set(selected)
    next.has(ch) ? next.delete(ch) : next.add(ch)
    setSelected(next)
  }

  const start = (onlyNokOverride?: boolean) => {
    const useOnlyNok = onlyNokOverride ?? onlyNok
    const source = cards.filter(
      (c) => selected.has(c.chapter) && (!useOnlyNok || status[c.id] === 'nok')
    )
    const deck: Card[] = []
    source.forEach((c) => {
      deck.push(c)
      // Nicht gewusste Karten kommen mit Faktor 1,5 öfter
      if (status[c.id] === 'nok' && Math.random() < 0.5) deck.push(c)
    })
    const mixed = shuffle(deck)
    for (let i = 1; i < mixed.length; i++) {
      if (mixed[i].id === mixed[i - 1].id) {
        const j = (i + 1) % mixed.length
        ;[mixed[i], mixed[j]] = [mixed[j], mixed[i]]
      }
    }
    setRound(
      mixed.map((card) => ({
        card,
        dir: stored.dir === 'mix' ? (Math.random() < 0.5 ? 'fd' : 'df') : stored.dir,
      }))
    )
    setIndex(0)
    setShown(false)
    setResults({})
    setFinished(false)
  }

  const answer = (r: Status) => {
    if (!round) return
    const card = round[index].card
    setResults({ ...results, [card.id]: r })
    update({ ...stored, status: { ...stored.status, [card.id]: r } })
    if (index + 1 >= round.length) {
      setFinished(true)
    } else {
      setIndex(index + 1)
      setShown(false)
    }
  }

  // ----- Zusammenfassung -----
  if (round && finished) {
    const ids = Object.keys(results)
    const ok = ids.filter((id) => results[id] === 'ok').length
    const no = ids.length - ok
    const missed = cards.filter((c) => results[c.id] === 'nok')
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-longchamp-black dark:text-longchamp-ivory">Runde fertig</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
            <b className="block text-3xl tabular-nums">{ok}</b>gewusst
          </div>
          <div className="rounded-lg p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
            <b className="block text-3xl tabular-nums">{no}</b>nicht gewusst
          </div>
        </div>
        {missed.length > 0 && (
          <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-4 space-y-1 text-sm">
            {missed.map((c) => (
              <div key={c.id}>
                <b>{c.foreign_text}</b> – {c.german}
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRound(null)}
            className="border-2 border-longchamp-gold rounded-lg py-3 font-bold text-longchamp-black dark:text-longchamp-ivory"
          >
            Zur Auswahl
          </button>
          <button
            disabled={no === 0}
            onClick={() => {
              setOnlyNok(true)
              start(true)
            }}
            className="bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold rounded-lg py-3"
          >
            Nicht gewusste üben
          </button>
        </div>
      </section>
    )
  }

  // ----- Karte -----
  if (round && round.length > 0) {
    const { card, dir } = round[index]
    const q = dir === 'fd' ? card.foreign_text : card.german
    const a = dir === 'fd' ? card.german : card.foreign_text
    const qLang = dir === 'fd' ? 'fr' : 'de'
    const aLang = dir === 'fd' ? 'de' : 'fr'
    const genus = CARD_GENUS[card.foreign_text]
    return (
      <section className="space-y-4">
        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-longchamp-gold transition-all"
            style={{ width: `${(index / round.length) * 100}%` }}
          />
        </div>
        <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-4 min-h-[16rem]">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {dir === 'fd' ? 'Französisch → Deutsch' : 'Deutsch → Französisch'}
            </span>
            <span className="text-xs font-bold px-2 py-1 rounded bg-longchamp-ivory dark:bg-gray-800 text-longchamp-dark-gold">
              {card.chapter.replace('Päckli ', '')}
              {status[card.id] === 'nok' ? ' · üben' : ''}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <p className="flex-1 min-w-0 text-3xl font-bold text-longchamp-black dark:text-longchamp-ivory break-words">
              {q}
              {genus && dir === 'fd' && (
                <span className="ml-2 text-sm text-longchamp-dark-gold">({genus})</span>
              )}
            </p>
            <SpeakButton text={q} lang={qLang} />
          </div>
          {shown && (
            <>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex items-start gap-3">
                <p className="flex-1 min-w-0 text-xl font-bold text-green-700 dark:text-green-400 break-words">
                  {a}
                  {genus && dir === 'df' && (
                    <span className="ml-2 text-sm text-longchamp-dark-gold">({genus})</span>
                  )}
                </p>
                <SpeakButton text={a} lang={aLang} />
              </div>
            </>
          )}
        </div>
        {shown ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => answer('nok')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg"
            >
              Nicht gewusst
            </button>
            <button
              onClick={() => answer('ok')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
            >
              Gewusst
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShown(true)}
            className="w-full bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-3 rounded-lg"
          >
            Lösung zeigen
          </button>
        )}
        <div className="flex justify-between items-center">
          <span className="tabular-nums text-sm text-gray-500 dark:text-gray-400">
            {index + 1} / {round.length}
          </span>
          <button
            onClick={() => setFinished(true)}
            className="text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300"
          >
            Runde beenden
          </button>
        </div>
      </section>
    )
  }

  // ----- Auswahl -----
  const dirLabel = DIR_OPTIONS.find((d) => d.value === stored.dir)?.title ?? ''
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Päckli
        </p>
        <div className="flex flex-wrap gap-2">
          {chapters.map((ch) => (
            <button
              key={ch}
              aria-pressed={selected.has(ch)}
              onClick={() => toggleChapter(ch)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-bold ${
                selected.has(ch)
                  ? 'border-longchamp-gold bg-longchamp-gold/20 text-longchamp-black dark:text-longchamp-ivory'
                  : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {ch} · {PAECKLI_INFO[ch] ?? ''}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Abfragerichtung
        </p>
        <div className="space-y-2" role="group" aria-label="Abfragerichtung">
          {DIR_OPTIONS.map((d) => {
            const active = stored.dir === d.value
            return (
              <button
                key={d.value}
                aria-pressed={active}
                onClick={() => update({ ...stored, dir: d.value })}
                className={`w-full text-left rounded-lg border-2 px-4 py-3 ${
                  active
                    ? 'border-longchamp-gold bg-longchamp-gold/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-longchamp-black'
                }`}
              >
                <b className="block text-longchamp-black dark:text-longchamp-ivory">{d.title}</b>
                <span className="text-sm text-gray-500 dark:text-gray-400">{d.hint}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button
        aria-pressed={onlyNok}
        onClick={() => setOnlyNok(!onlyNok)}
        className={`px-4 py-2 rounded-full border-2 text-sm font-bold ${
          onlyNok
            ? 'border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
        }`}
      >
        Nur nicht gewusste{nokTotal ? ` (${nokTotal})` : ''}
      </button>

      <button
        disabled={pool.length === 0}
        onClick={() => start()}
        className="w-full bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-3 rounded-lg"
      >
        Runde starten
      </button>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {pool.length === 0
          ? onlyNok
            ? 'Keine nicht gewussten Karten in dieser Auswahl. Super!'
            : 'Wähle mindestens ein Päckli.'
          : `${pool.length} Karten, ${dirLabel.toLowerCase()}. Nicht gewusste kommen etwa 1,5-mal so oft dran.`}
      </p>
    </section>
  )
}

// ---------- Lücken ----------
function GapsTab() {
  const [order] = useState(() => shuffle(GAPS.map((_, i) => i)))
  const [i, setI] = useState(0)
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<null | 'ok' | 'accent' | 'nok' | 'tip'>(null)
  const done = feedback === 'ok' || feedback === 'accent' || feedback === 'nok'
  const g = GAPS[order[i % GAPS.length]]
  const full = g.before + g.answer + g.after

  const check = () => {
    if (done) {
      setI(i + 1)
      setValue('')
      setFeedback(null)
      return
    }
    if (!value.trim()) return
    if (norm(value) === norm(g.answer)) setFeedback('ok')
    else if (noAccents(value) === noAccents(g.answer)) setFeedback('accent')
    else setFeedback('nok')
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Setze das fehlende Wort ein. Die deutsche Übersetzung hilft dir.
      </p>
      <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Lückentext
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded bg-longchamp-ivory dark:bg-gray-800 text-longchamp-dark-gold">
            {g.chapter.replace('Päckli ', '')}
          </span>
        </div>
        <p className="text-2xl font-bold leading-relaxed text-longchamp-black dark:text-longchamp-ivory break-words">
          {g.before}
          <input
            id="gap-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            disabled={done}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Fehlendes Wort"
            className="inline-block w-40 max-w-full px-2 py-1 text-xl border-b-4 border-longchamp-gold bg-longchamp-ivory dark:bg-gray-800 rounded-t focus:outline-none"
          />
          {g.after}
        </p>
        <p className="text-gray-600 dark:text-gray-400">{g.german}</p>

        {feedback === 'tip' && (
          <p className="rounded-lg p-3 font-bold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100">
            Es beginnt mit «{g.answer[0]}» und hat {g.answer.length} Buchstaben.
          </p>
        )}
        {feedback === 'ok' && (
          <p className="rounded-lg p-3 font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
            Richtig! {full}
          </p>
        )}
        {feedback === 'accent' && (
          <p className="rounded-lg p-3 font-bold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100">
            Fast! Achte auf die Akzente: {g.answer}
          </p>
        )}
        {feedback === 'nok' && (
          <p className="rounded-lg p-3 font-bold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
            Richtig wäre: {g.answer}
          </p>
        )}
        {done && (
          <div className="flex items-center gap-3">
            <p className="flex-1 text-gray-600 dark:text-gray-400">{full}</p>
            <SpeakButton text={full} lang="fr" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setFeedback('tip')}
          disabled={done}
          className="border-2 border-longchamp-gold rounded-lg py-3 font-bold text-longchamp-black dark:text-longchamp-ivory disabled:opacity-50"
        >
          Tipp
        </button>
        <button
          onClick={check}
          className="bg-longchamp-gold hover:bg-longchamp-dark-gold text-longchamp-black font-bold py-3 rounded-lg"
        >
          {done ? 'Weiter' : 'Prüfen'}
        </button>
      </div>
      <span className="tabular-nums text-sm text-gray-500 dark:text-gray-400">
        {(i % GAPS.length) + 1} / {GAPS.length}
      </span>
    </section>
  )
}

// ---------- Genus ----------
function GenusTab() {
  const [order] = useState(() => shuffle(GENUS.map((_, i) => i)))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Genus | null>(null)
  const x = GENUS[order[i % GENUS.length]]

  const choose = (g: Genus) => {
    if (picked) return
    setPicked(g)
    say(withArticle(x).split(' · ')[0].replace('/', ' ou '), 'fr')
  }

  const options: { g: Genus; label: string; hint: string }[] = [
    { g: 'm', label: 'männlich', hint: 'le / un' },
    { g: 'f', label: 'weiblich', hint: 'la / une' },
    { g: 'm/f', label: 'beides', hint: 'le/la' },
  ]

  return (
    <section className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Männlich oder weiblich? Auf dem Blatt stehen (m) und (f) bei einigen Wörtern, die übrigen Nomen
        stammen aus den Sätzen.
      </p>
      <div className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Genus
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded bg-longchamp-ivory dark:bg-gray-800 text-longchamp-dark-gold">
            {x.source}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-bold text-longchamp-black dark:text-longchamp-ivory">{x.word}</p>
            <p className="text-gray-600 dark:text-gray-400">{x.german}</p>
          </div>
          <SpeakButton text={x.word} lang="fr" />
        </div>
        {picked && (
          <p
            className={`rounded-lg p-3 font-bold ${
              picked === x.genus
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}
          >
            {picked === x.genus ? 'Richtig!' : 'Nicht ganz.'} {withArticle(x)}
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          let cls = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-longchamp-black'
          if (picked && o.g === x.genus) cls = 'border-green-500 bg-green-100 dark:bg-green-900'
          else if (picked === o.g) cls = 'border-red-500 bg-red-100 dark:bg-red-900'
          return (
            <button
              key={o.g}
              onClick={() => choose(o.g)}
              className={`rounded-lg border-2 py-3 px-1 flex flex-col items-center font-bold text-longchamp-black dark:text-longchamp-ivory ${cls}`}
            >
              {o.label}
              <small className="font-normal text-gray-500 dark:text-gray-400">{o.hint}</small>
            </button>
          )
        })}
      </div>
      <div className="flex justify-between items-center">
        <span className="tabular-nums text-sm text-gray-500 dark:text-gray-400">
          {(i % GENUS.length) + 1} / {GENUS.length}
        </span>
        <button
          disabled={!picked}
          onClick={() => {
            setI(i + 1)
            setPicked(null)
          }}
          className="bg-longchamp-gold hover:bg-longchamp-dark-gold disabled:opacity-50 text-longchamp-black font-bold py-2 px-5 rounded-lg"
        >
          Weiter
        </button>
      </div>
    </section>
  )
}

// ---------- Liste ----------
function ListTab({ cards, status }: { cards: Card[]; status: Record<string, Status> }) {
  const chapters = Array.from(new Set(cards.map((c) => c.chapter))).sort()
  return (
    <section className="space-y-4">
      {chapters.map((ch) => (
        <div
          key={ch}
          className="bg-white dark:bg-longchamp-black border-2 border-longchamp-gold rounded-lg overflow-hidden"
        >
          <div className="flex justify-between items-baseline px-4 py-2 bg-longchamp-ivory dark:bg-gray-900">
            <h3 className="font-bold text-longchamp-black dark:text-longchamp-ivory">{ch}</h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {PAECKLI_INFO[ch] ?? ''}
            </span>
          </div>
          {cards
            .filter((c) => c.chapter === ch)
            .map((c) => {
              const st = status[c.id]
              const genus = CARD_GENUS[c.foreign_text]
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-sm items-center"
                >
                  <span className="min-w-0 break-words text-longchamp-black dark:text-longchamp-ivory">
                    {c.foreign_text}
                    {genus && <span className="ml-1 text-xs text-longchamp-dark-gold">({genus})</span>}
                  </span>
                  <span className="min-w-0 break-words text-gray-600 dark:text-gray-400">{c.german}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      st === 'ok' ? 'bg-green-500' : st === 'nok' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={st === 'ok' ? 'gewusst' : st === 'nok' ? 'nicht gewusst' : 'noch nicht geübt'}
                  />
                </div>
              )
            })}
        </div>
      ))}
    </section>
  )
}
