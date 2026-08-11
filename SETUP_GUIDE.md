# 🚀 Komplette Setup-Anleitung: Supabase + Netlify

Diese Anleitung führt dich Schritt-für-Schritt durch die Konfiguration.

---

## TEIL 1: SUPABASE SETUP

### Schritt 1.1: Supabase Projekt erstellen

1. Öffne [supabase.com](https://supabase.com)
2. Klicke oben rechts auf **"Sign In"**
3. Melde dich an oder erstelle einen neuen Account
4. Nach dem Login, klicke auf **"New Project"** (oder **"Create a new project"**)
5. Fülle das Formular aus:
   - **Project name**: `kidswoertli` (oder ein beliebiger Name)
   - **Database Password**: Wähle ein sicheres Passwort (merke es dir!)
   - **Region**: Wähle `Europe (eu-central-1)` (Frankfurt) - am nächsten zu Deutschland
   - **Pricing Plan**: `Free` (kostenlos)
6. Klicke **"Create new project"**
7. Warte 1-2 Minuten, bis das Projekt initialisiert ist

### Schritt 1.2: Supabase Credentials auslesen

Nach der Initialisierung:

1. Klicke links im Menü auf **"Settings"** (Zahnrad-Icon)
2. Klicke auf **"API"** im Menü
3. Du siehst zwei wichtige Werte:
   - **Project URL** (kopieren!)
   - **Anon Key** (kopieren!)

**Beispiel:**
```
Project URL: https://abcdefgh123456.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Speichere diese beiden Werte - brauchst du gleich!

### Schritt 1.3: Datenbank initialisieren

1. Klicke links auf **"SQL Editor"**
2. Klicke auf **"New Query"** (oben rechts)
3. Kopiere den kompletten Inhalt aus: `supabase/migrations/001_init_schema.sql`
4. Paste den Code in das Abfragefenster
5. Klicke **"Run"** (grüner Play-Button, oben rechts)
6. Warte, bis die Query abgeschlossen ist (sollte "Success" zeigen)

✅ **Datenbanktabellen sind jetzt erstellt!**

### Schritt 1.4: Storage Bucket erstellen

1. Klicke links auf **"Storage"**
2. Klicke auf **"New Bucket"**
3. Konfiguriere:
   - **Bucket name**: `card-images`
   - **Public bucket**: ☑️ AKTIVIEREN (Haken setzen!)
4. Klicke **"Create Bucket"**

✅ **Storage ist jetzt bereit!**

### Schritt 1.5: Authentifizierung konfigurieren

1. Klicke links auf **"Authentication"**
2. Klicke auf **"Providers"**
3. Überprüfe, dass **"Email"** aktiviert ist (sollte bereits aktiv sein)

Jetzt müssen wir die **Site URL und Redirect URLs** konfigurieren:

#### Für lokale Entwicklung (jetzt):
1. Klicke auf **"URL Configuration"**
2. Setze folgende Werte:
   - **Site URL**: `http://localhost:3000`
   - Klicke **"Save"**
3. Klicke auf **"Redirect URLs"** (unter Site URL)
4. Klicke **"Add URL"**
5. Gib ein: `http://localhost:3000/**`
6. Klicke **"Save"**

#### Für Netlify später (nach dem Deployment):
- Du wirst zurückkommen und die URLs auf deine Netlify Domain aktualisieren
- Format: `https://your-site-name.netlify.app`

✅ **Supabase ist jetzt bereit!**

---

## TEIL 2: LOKALE DEVELOPMENT UMGEBUNG

### Schritt 2.1: .env.local erstellen

1. Öffne den Projekt-Ordner `kidswoertli` in deinem Editor
2. Erstelle eine neue Datei: `.env.local` (im Root-Verzeichnis)
3. Kopiere diese Inhalte und ersetze die Werte mit deinen Supabase Credentials:

```
VITE_SUPABASE_URL=https://abcdefgh123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_JOKE_API_URL=https://v2.jokeapi.dev
```

**Beispiel .env.local:**
```
VITE_SUPABASE_URL=https://xyzabcdef123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZjEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk2NDU2Nzg5LCJleHAiOjE4NTQyMjI3ODl9.ABC123XYZ
VITE_JOKE_API_URL=https://v2.jokeapi.dev
```

### Schritt 2.2: Lokale Entwicklung testen

1. Öffne Terminal/Command Prompt im Projekt-Verzeichnis
2. Führe aus:
```bash
npm run dev
```

3. Die App öffnet sich automatisch unter `http://localhost:3000`
4. Du solltest die **Login-Seite** sehen

### Schritt 2.3: Test-Benutzer erstellen

Da noch keine Benutzer existieren, müssen wir einen manuell in Supabase erstellen:

1. Öffne [supabase.com](https://supabase.com)
2. Gehe zu deinem Projekt
3. Klicke links auf **"Authentication"**
4. Klicke auf **"Users"**
5. Klicke **"Invite"** (oben rechts)
6. Gib ein:
   - **Email**: `testuser@kidswoertli.local`
   - Klicke **"Send invite"**

Supabase sendet eine E-Mail (du musst sie nicht bestätigen).

Jetzt erstelle den Benutzer in der `users` Tabelle:

1. Gehe zu **"SQL Editor"**
2. Neue Query:
```sql
INSERT INTO public.users (id, username, email, is_admin)
SELECT 
  id,
  'testuser' as username,
  email,
  false as is_admin
FROM auth.users
WHERE email = 'testuser@kidswoertli.local'
LIMIT 1;
```
3. Führe die Query aus

Alternativ über den direkten Weg:
1. Gehe zu **"Table Editor"**
2. Öffne die `users` Tabelle
3. Klicke **"Insert row"**
4. Füll aus:
   - **id**: (leer lassen, wird auto-generiert)
   - **username**: `testuser`
   - **email**: `testuser@kidswoertli.local`
   - **is_admin**: `false`

### Schritt 2.4: Login testen

1. Gehe zu `http://localhost:3000`
2. Klicke auf **"Anmelden"**
3. Login-Daten:
   - **Benutzername**: `testuser`
   - **Passwort**: (beliebig, z.B. `password123`)
4. Klicke **"Anmelden"**

⚠️ **Falls Fehler**: "Benutzername oder Passwort falsch"
- Das ist normal beim ersten Mal
- Das Supabase Auth System muss den Benutzer noch authentifizieren
- Versuche, über die Supabase Console (Settings → Auth) den Benutzer direkt zu aktivieren

Einfacherer Workaround:
1. Gehe zu Supabase → **Authentication** → **Providers** → **Email**
2. Aktiviere **"Enable email confirmations"** → aus
3. Versuche erneut, dich anzumelden

### Schritt 2.5: App lokale testen

Wenn du angemeldet bist:

1. ✅ Du siehst das **Dashboard**
2. Klicke auf **"📷 Neue Karteikarten"** zum OCR-Testen
3. Klicke auf **"📚 Lernen"** (zeigt noch nichts, da keine Karten)
4. Klicke auf **"📖 Meine Sammlungen"** (zeigt noch nichts)

✅ **Lokale Entwicklung funktioniert!**

---

## TEIL 3: NETLIFY DEPLOYMENT

### Schritt 3.1: GitHub Branch pushen (falls noch nicht geschehen)

```bash
git push -u origin claude/language-learning-pwa-melh2w
```

### Schritt 3.2: Netlify Account erstellen

1. Öffne [netlify.com](https://netlify.com)
2. Klicke oben rechts auf **"Sign up"**
3. Wähle **"GitHub"** als Anmeldung
4. Autorisiere Netlify für dein GitHub Account
5. Bestätige deine E-Mail (Netlify sendet eine E-Mail)

### Schritt 3.3: Neue Netlify Site erstellen

1. Nach dem Login, gehe zu [app.netlify.com](https://app.netlify.com)
2. Klicke **"Add new site"** → **"Import an existing project"**
3. Wähle **"GitHub"**
4. Suche das Repository: `kidswoertli`
5. Klicke drauf
6. Wähle den Branch: `claude/language-learning-pwa-melh2w`
7. **Build settings** sollten auto-erkannt werden:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
8. **Falls nicht**, klicke **"Edit"** und setze diese Werte manuell
9. Klicke **"Deploy site"**

Netlify startet den ersten Build (dauert ~2-3 Minuten).

### Schritt 3.4: Environment Variables in Netlify setzen

Während der Build läuft, konfiguriere die Environment Variables:

1. Nach dem Deploy, gehe zu **"Site settings"** (in Netlify)
2. Klicke auf **"Build & deploy"** in der Sidebar
3. Klicke auf **"Environment"**
4. Klicke **"Edit variables"**
5. Füge folgende Variablen hinzu (mit deinen Werten):

```
VITE_SUPABASE_URL = https://xyzabcdef123.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_JOKE_API_URL = https://v2.jokeapi.dev
```

6. Klicke **"Save"**

### Schritt 3.5: Netlify Domain auslesen

Nach dem ersten Deploy:

1. Gehe zu **"Site overview"** (in Netlify)
2. Du siehst oben die Netlify Domain: `https://your-site-name.netlify.app`
3. Kopiere diese Domain (brauchst du gleich)

### Schritt 3.6: Supabase für Netlify aktualisieren

Jetzt musst du Supabase mit der Netlify Domain konfigurieren:

1. Öffne Supabase
2. Gehe zu **"Settings"** → **"Authentication"** → **"URL Configuration"**
3. **Site URL** ändern:
   - **Alter Wert**: `http://localhost:3000`
   - **Neuer Wert**: `https://your-site-name.netlify.app`
   - Klicke **"Save"**
4. **Redirect URLs** hinzufügen:
   - Klicke **"Add URL"**
   - Gib ein: `https://your-site-name.netlify.app/**`
   - Klicke **"Save"**

### Schritt 3.7: Netlify Build triggern

Die Environment Variables sind jetzt gesetzt. Wir brauchen einen neuen Build:

1. In Netlify, gehe zu **"Deployments"**
2. Klicke auf **"Trigger deploy"** (oben)
3. Wähle **"Deploy site"**
4. Warte, bis der Build abgeschlossen ist (grünes Häkchen)

### Schritt 3.8: App testen

1. Öffne deine Netlify Domain: `https://your-site-name.netlify.app`
2. Du solltest die **Login-Seite** sehen
3. Login mit Test-Benutzer:
   - **Benutzername**: `testuser`
   - **Passwort**: `password123` (oder was du gesetzt hast)

✅ **App läuft auf Netlify!**

---

## TROUBLESHOOTING

### Problem: "Missing Supabase environment variables"

**Lösung:**
1. Überprüfe in Netlify, dass die Environment Variables gesetzt sind
2. Kontrolliere die Namen (müssen exakt stimmen):
   - `VITE_SUPABASE_URL` ✅
   - `VITE_SUPABASE_ANON_KEY` ✅
3. Triggere einen neuen Build in Netlify

### Problem: "RLS policy violation" oder "403 Forbidden"

**Lösung:**
1. Überprüfe, dass der Benutzer in der `users` Tabelle existiert
2. Überprüfe, dass `is_admin` korrekt gesetzt ist
3. In Supabase, SQL Query ausführen:
```sql
SELECT * FROM public.users WHERE username = 'testuser';
```
4. Falls kein Ergebnis: Benutzer neu erstellen

### Problem: "CORS policy error"

**Lösung:**
1. Überprüfe, dass die Netlify Domain in Supabase eingetragen ist
2. Format muss sein: `https://your-site-name.netlify.app/**`
3. Warte 5 Minuten nach der Änderung
4. Browser-Cache löschen (Ctrl+Shift+Delete)

### Problem: "App lädt nicht" oder "Blank Page"

**Lösung:**
1. Öffne Browser DevTools (F12)
2. Gehe zum **"Console"** Tab
3. Suche nach Fehlermeldungen (rote Texte)
4. Überprüfe, dass Supabase erreichbar ist (URL korrekt)
5. Überprüfe, dass die Anon Key valid ist

### Problem: "OCR funktioniert nicht"

**Lösung:**
1. Tesseract.js braucht Internet für das Sprachpaket
2. Überprüfe deine Internet-Verbindung
3. Browser-Console für Fehler (F12 → Console)
4. Versuche mit Chrome/Firefox (nicht Safari)

---

## CHECKLISTE

### Supabase ✅
- [ ] Supabase Project erstellt
- [ ] Project URL & Anon Key kopiert
- [ ] Datenbanktabellen initialized (SQL Query ausgeführt)
- [ ] `card-images` Storage Bucket erstellt (Public!)
- [ ] Email Authentication konfiguriert
- [ ] URL Configuration für localhost gesetzt
- [ ] Test-Benutzer erstellt (`testuser`)
- [ ] Test-Benutzer in `users` Tabelle hinzugefügt

### Lokale Entwicklung ✅
- [ ] `.env.local` erstellt mit Supabase Credentials
- [ ] `npm install` ausgeführt
- [ ] `npm run dev` gestartet
- [ ] Login mit `testuser` funktioniert
- [ ] Dashboard lädt

### Netlify ✅
- [ ] Netlify Account erstellt
- [ ] Repository verbunden
- [ ] Build erfolgreich
- [ ] Environment Variables gesetzt
- [ ] Netlify Domain kopiert
- [ ] Supabase URL Configuration mit Netlify Domain aktualisiert
- [ ] Neuer Build getriggert
- [ ] Login auf Netlify Domain funktioniert

---

## 🎉 Fertig!

Wenn alle Häkchen gesetzt sind, läuft deine KidsWörtli App jetzt:
- ✅ Lokal auf `http://localhost:3000`
- ✅ Live auf `https://your-site-name.netlify.app`

Jetzt kannst du:
- 📷 Karteikarten erfassen
- 📚 Lernen mit den drei Modi
- 🔄 Fehler managen
- 👤 Neue Benutzer erstellen (über Supabase Auth)

**Nächste Schritte:**
1. Admin-Benutzer erstellen: `is_admin = true` setzen
2. Weitere Test-Benutzer hinzufügen
3. Die App mobil auf dem Handy testen (PWA installieren)
4. Feedback geben und neue Features wünschen! 😊
