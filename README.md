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

## Projekt-Status

- [x] Phase 1: Projekt-Setup & Auth ✅
- [x] Phase 2: Karteikarten-Erfassung (OCR) ✅
- [x] Phase 3: Abfragefunktionen & Fehlercontainer ✅
- [x] Phase 4: UX & Polish ✅

## Quick Start

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Environment Setup
cp .env.example .env.local
# Füge deine Supabase Credentials in .env.local ein

# Dev-Server starten
npm run dev
```

Öffne `http://localhost:3000` im Browser.

### Supabase Setup

Siehe [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) für detaillierte Anleitung zur Datenbank-Konfiguration.

### Deployment

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für Netlify-Deployment-Anleitung.

## Features im MVP

✅ **Bilderfassung & OCR**
- Tesseract.js für automatische Texterkennung
- Upload von Fotos oder Kamera
- Manuelle Bearbeitung erkannter Texte

✅ **Karteikarten-Management**
- Erstelle Karteikarten mit Metadaten (Buch, Seite, Kapitel)
- Organisiere in Lernmedien
- Bearbeiten und Löschen

✅ **Drei Lernmodi**
- **Schriftlich**: Tippe die Übersetzung
- **Sprechen**: Sprich die Übersetzung (Speech Recognition)
- **Lesen**: Übersetze selbst, kontrolliere Antwort

✅ **Fehler-Management**
- Separate Fehler-Container pro Lernrunde
- Bis zu 5 Fehler-Durchgänge speichern
- Fehler-Karteikarten können gelöscht werden

✅ **Motivations-Features**
- Motivationsmeldungen nach jeder Frage
- Witze von JokeAPI nach Abschluss
- Erfolgsquoten mit Feedback

✅ **Multi-User**
- Benutzer-Authentifizierung via Supabase
- Benutzername + Passwort
- Admin-Panel für Passwort-Reset

✅ **PWA Features**
- Offline-Funktionalität (geplant)
- Installierbar auf Mobile/Desktop
- Manifest.json für App-Shortcuts
- Dark Mode Support

✅ **Longchamp Design**
- Elegant und modern
- Schwarz/Gold/Elfenbein Farbschema
- Responsive für Mobile (Mobile-First)

## Lizenz

Privat
