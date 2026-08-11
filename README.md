# KidsWörtli - PWA für Sprachenlernen

Eine Progressive Web App für Kinder ab 15 Jahren zum Erlernen von Fremdsprachen (Französisch, Englisch) durch Karteikarten, OCR und interaktive Abfragemodi.

## Features (MVP)

- 📷 **OCR-Bilderfassung**: Fotografiere Buchseiten und extrahiere Wörter/Sätze automatisch
- 📚 **Karteikarten-Management**: Erstelle, bearbeite und organisiere Karteikarten
- 🎓 **Flexible Abfragemodi**:
  - Schriftlich (eigene Antwort eingeben)
  - Vorlesen (TTS - Text-to-Speech)
  - Optisch (selbst übersetzen, dann vergleichen)
- 📊 **Fehlercontainer**: Verwalte fehlerhafte Karteikarten in separaten Durchgängen
- 👤 **Multi-User Accounts**: Benutzer-spezifische Daten und Authentifizierung
- 🏆 **Motivations-API**: Witze und Aufmunterungen nach Lernrunden
- 🎨 **Longchamp-Design**: Elegant und modisch gestaltet

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **OCR**: Tesseract.js
- **TTS/STT**: Web Speech API
- **Backend**: Supabase (Auth, Database, Storage)
- **Hosting**: Netlify

## Setup

### Voraussetzungen
- Node.js 16+
- npm/yarn
- Supabase Account

### Installation

```bash
npm install
```

### Environment Setup

Erstelle `.env.local` Datei im Root-Verzeichnis:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_JOKE_API_URL=https://v2.jokeapi.dev
```

### Entwicklung

```bash
npm run dev
```

Die App lädt unter `http://localhost:3000`

### Build

```bash
npm run build
```

## Projekt-Struktur

```
src/
├── components/
│   ├── Auth/           # Login-Komponenten
│   ├── Dashboard/      # Haupt-Dashboard
│   ├── CardCapture/    # OCR & Karteikarten-Erfassung
│   ├── Learning/       # Lernmodi
│   └── Admin/          # Admin-Panel
├── context/            # Auth Context
├── services/
│   ├── supabase.ts     # Supabase Integration
│   ├── ocr.ts          # Tesseract.js Service
│   ├── tts.ts          # Text-to-Speech & STT
│   └── jokes.ts        # Witze-API Service
├── types/              # TypeScript Interfaces
└── App.tsx
```

## Datenbankschema

Die Supabase-Migration wird in Phase 2 erstellt.

### Haupt-Tabellen:
- `users` - Benutzeraccounts (Benutzername, Passwort, Admin-Status)
- `learning_media` - Lernmedien (Bücher, Titel, Sprache)
- `cards` - Karteikarten (Wort/Satz, Sprache, Buch, Seite, Kapitel)
- `learning_sessions` - Lernrunden (Benutzer, Medium, ausgewählte Seiten)
- `card_results` - Ergebnisse (Richtig/Falsch)
- `error_rounds` - Fehler-Durchgänge (bis zu 5 pro Session)

## Nächste Schritte

- [ ] Phase 1: Projekt-Setup & Auth ✅
- [ ] Phase 2: Karteikarten-Erfassung (OCR)
- [ ] Phase 3: Abfragefunktionen & Fehlercontainer
- [ ] Phase 4: UX & Polish

## Lizenz

Privat
