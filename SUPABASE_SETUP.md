# Supabase Setup Guide

Diese Anleitung beschreibt, wie man Supabase für die KidsWörtli PWA konfiguriert.

## 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Melde dich an oder erstelle ein neues Konto
3. Erstelle ein neues Projekt
4. Warte, bis das Projekt initialisiert ist

## 2. Environment Variables setzen

Nach der Erstellung des Projekts findest du die Anmeldeinformationen unter:
- **Settings** → **API** → **Project URL** und **Anon Key**

Kopiere diese in deine `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_JOKE_API_URL=https://v2.jokeapi.dev
```

## 3. Datenbank initialisieren

### Option A: SQL Editor (einfacher)

1. Gehe zu **SQL Editor**
2. Klicke auf **New Query**
3. Kopiere den Inhalt von `supabase/migrations/001_init_schema.sql`
4. Führe die Query aus (grüner Play-Button)

### Option B: Migrations (über CLI)

```bash
supabase db push
```

## 4. Storage Bucket erstellen

1. Gehe zu **Storage**
2. Klicke auf **New Bucket**
3. Benenne den Bucket: `card-images`
4. Setze den **Access** auf `Public`
5. Erstelle den Bucket

## 5. Authentifizierung konfigurieren

1. Gehe zu **Authentication** → **Providers**
2. Stelle sicher, dass **Email** aktiviert ist
3. Gehe zu **URL Configuration**
4. Setze folgende URLs:
   - **Site URL**: `http://localhost:3000` (für Entwicklung) oder deine Netlify Domain (für Production)
   - **Redirect URLs**: `http://localhost:3000/**` (für Entwicklung)

## 6. SMTP konfigurieren (Optional aber empfohlen)

Für Production: Konfiguriere einen Custom SMTP Server unter **Authentication** → **Email**

## Tabellen-Übersicht

| Tabelle | Beschreibung |
|---------|------------|
| `users` | Benutzerprofile (extends auth.users) |
| `learning_media` | Lernmedien (Bücher, etc.) |
| `cards` | Karteikarten |
| `learning_sessions` | Lernrunden |
| `card_results` | Ergebnisse einzelner Karteikarten |
| `error_rounds` | Fehler-Durchgänge |

## RLS (Row Level Security)

Alle Tabellen haben RLS-Policies aktiviert. Benutzer können:
- Nur ihre eigenen Daten sehen und bearbeiten
- Nur auf ihre Medien und Karteikarten zugreifen

## Testing

Nach der Konfiguration:

1. Starte die App: `npm run dev`
2. Versuche dich anzumelden
3. Teste die Karteikarten-Erfassung

## Troubleshooting

### Fehler: "Missing Supabase environment variables"
- Überprüfe, dass `.env.local` existiert
- Stelle sicher, dass `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` gesetzt sind

### Fehler: "RLS policy violation"
- Überprüfe, dass dein Benutzer in der `users` Tabelle existiert
- Stelle sicher, dass dein `auth.uid()` mit der `users.id` übereinstimmt

### Fehler: "Storage bucket not found"
- Überprüfe, dass der Bucket `card-images` existiert
- Stelle sicher, dass der Bucket auf `Public` gesetzt ist

## Admin Passwort-Reset

Um Admin-Funktionen zu aktivieren:

1. Melde dich in der Supabase Console an
2. Gehe zu **SQL Editor**
3. Führe folgende Query aus:

```sql
UPDATE public.users 
SET is_admin = true 
WHERE username = 'dein_benutzername';
```

Danach ersceine das Admin-Panel im Dashboard.
