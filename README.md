# 🎓 KidsWoertli - Progressive Web App für Sprachenlernen

Eine moderne PWA für Kinder (ab 16 Jahren) zum Erlernen von Französisch und Englisch durch intelligente OCR-basierte Vokabelkartentraining.

## 🚀 Features

- **📸 Claude Vision OCR**: Fotografiere Vokabelseiten, KI erkennt automatisch Deutsch-Französisch/Englisch Paare
- **🎯 Kartentraining**: Interaktives Üben mit Feedback und Fortschrittstracking
- **💾 Offline-Funktionen**: Service Worker für Offline-Nutzung
- **📱 Responsive Design**: Perfekt auf Handy, Tablet und Desktop
- **🎉 Motivierende Sprüche**: 50+ deutsche Motivationssprüche für tägliche Motivation
- **👨‍💼 Admin Panel**: Profile verwalten, Bilder hochladen, OCR testen
- **⚡ PWA**: Installierbar als native App

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Netlify Functions (Node.js)
- **Database**: Supabase PostgreSQL mit Row Level Security (RLS)
- **AI/ML**: Claude 3.5 Sonnet für Vision OCR
- **Auth**: Bcrypt + JWT/Session-based
- **Storage**: Browser localStorage für Session

## 📋 Datenbank-Schema

### profiles
- id, username, vorname, password_hash, is_admin
- Speichert Nutzer- und Admin-Profile

### flashcards
- id, profile_id, language_a/b, text_a/b, confidence
- Speichert extrahierte Vokabel-Paare pro Nutzer

### learning_progress
- id, profile_id, flashcard_id, correct_count, incorrect_count, mastered
- Verfolgt Lernfortschritt (beherrscht nach 2x richtig)

### app_settings
- id, profile_id, anthropic_api_key, language_pair
- Admin-Konfiguration pro Profil

## 🔧 Setup & Installation

### Voraussetzungen
```bash
- Node.js 18+
- npm 9+
- Supabase Account (kostenlos)
- Netlify Account (kostenlos)
- Anthropic API Key (mit Claude Vision Zugriff)
```

### 1. Lokales Setup
```bash
# Clone & Dependencies
git clone <repo>
cd kidswoertli
npm install

# Environment Variables
cp .env.local.example .env.local
# Fülle folgende ein:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - ANTHROPIC_API_KEY
```

### 2. Datenbank Init
```bash
# Supabase SQL Migration ausführen:
# supabase/migrations/001_init_schema.sql
```

### 3. Local Dev
```bash
npm run dev
# http://localhost:5173 öffnet sich
```

### 4. Build & Deploy
```bash
npm run build
# netlify deploy --prod
```

## 🎯 Workflow

### Für Admins:
1. Login mit Admin-Account
2. Admin Panel → Vokabelseite fotografieren
3. Claude Vision erkennt automatisch Paare
4. Bestätigen und speichern → In Datenbank
5. Neue Profile erstellen für Schüler

### Für Lernende:
1. Login mit Schüler-Account
2. Dashboard zeigt Lernfortschritt
3. "Jetzt üben" → Learning Mode
4. Flashcards durchgehen (Deutsch sehen → Französisch erraten)
5. Feedback: ✓ Richtig / ✗ Versuche nochmal
6. Nach 2x richtig: Karte als "Beherrscht" markiert

## 📊 Lernfortschritt

- Automatisches Tracking nach jeder Antwort
- Beherrscht = 2x korrekt
- Dashboard zeigt:
  - Gesamte gelernte Vokabeln
  - Beherrschte Vokabeln
  - Erfolgsquote (%)
  - Lernfortschritts-Balken

## 🔐 Sicherheit

- Passwörter mit bcrypt gehashed
- Row Level Security auf allen Datenbank-Tabellen
- API Keys in Netlify Environment (nicht in Code)
- Keine sensiblen Daten in localStorage

## 🎨 Farbschema

- Primär: Lila (#a855f7) & Pink (#ec4899)
- Erfolg: Grün (#22c55e)
- Fehler: Rot (#ef4444)
- Neutral: Grau-Scale
- **Keine Emojis im Design** (nur in Texten)

## 📱 PWA Checkliste

- ✅ manifest.json (Icons, Name, Display)
- ✅ Service Worker (sw.js)
- ✅ Offline-Support
- ✅ Responsive Design
- ✅ Installierbar auf Homescreen

## 🐛 Troubleshooting

### "OCR gibt keine Ergebnisse"
- API Key überprüfen
- Bildqualität kontrollieren
- Prompt-Variante in OCR-Funktion anpassen

### "Login funktioniert nicht"
- Supabase URL & Key überprüfen
- Profil in DB vorhanden?
- Browser-Konsole auf Fehler prüfen

### "Offline-Funktionen nicht aktiv"
- Service Worker muss registriert sein
- In Browser DevTools → Application → Service Workers prüfen

## 📚 OCR-Prompts

KidsWoertli testet automatisch mehrere Claude Vision Prompts:
1. **STRICT**: Maximale Genauigkeit, weniger Abdeckung
2. **RELAXED**: Balance aus Genauigkeit & Abdeckung (empfohlen)
3. **STRUCTURED**: Konsistente JSON-Formatierung
4. **MULTILINGUAL**: Robustheit gegen verschiedene Layouts

Erfolgs-Kriterium: **≥90% Genauigkeit** auf erwartete Vokabeln

## 🚀 Performance Optimizations

- Code-Splitting mit React.lazy()
- Image-Lazy-Loading
- Service Worker Caching
- Minified Build
- CDN über Netlify

## 📞 Support

Bei Fragen oder Bugs:
1. GitHub Issues checken
2. Logs in Browser Console
3. Netlify Function Logs prüfen

---

**Made with ❤️ for young language learners**
