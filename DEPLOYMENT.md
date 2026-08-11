# Deployment Guide - KidsWörtli

Diese Anleitung beschreibt, wie man KidsWörtli auf Netlify deployed.

## Voraussetzungen

- GitHub Account mit dem kidswoertli Repository
- Netlify Account ([netlify.com](https://netlify.com))
- Supabase Project (siehe SUPABASE_SETUP.md)

## Schritt 1: Netlify verbinden

1. Gehe zu [app.netlify.com](https://app.netlify.com)
2. Klicke auf **"New site from Git"**
3. Wähle **GitHub** als Git Provider
4. Autorisiere Netlify für dein GitHub Account
5. Wähle das Repository `kidswoertli`
6. Wähle den Branch `claude/language-learning-pwa-melh2w` (oder den Live-Branch)

## Schritt 2: Build-Konfiguration

Netlify sollte folgende Einstellungen automatisch erkennen:

- **Build command**: `npm run build`
- **Publish directory**: `dist`

Falls nicht, konfiguriere sie manuell unter **Site settings** → **Build & deploy** → **Build settings**.

## Schritt 3: Environment Variables setzen

1. Gehe zu **Site settings** → **Build & deploy** → **Environment**
2. Klicke auf **Edit variables**
3. Füge folgende Environment Variables hinzu:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_JOKE_API_URL=https://v2.jokeapi.dev
```

## Schritt 4: Supabase Redirect URLs aktualisieren

1. Gehe zu Supabase → **Authentication** → **URL Configuration**
2. Aktualisiere **Site URL** zu deiner Netlify Domain:
   - Format: `https://your-site-name.netlify.app`
3. Füge die Netlify Domain zu **Redirect URLs** hinzu:
   - `https://your-site-name.netlify.app/**`

## Schritt 5: Deploy

1. Committen und Push der Änderungen triggern automatisch einen Deploy
2. Gehe zu **Deployments** um den Status zu sehen
3. Die App ist verfügbar unter `https://your-site-name.netlify.app`

## PWA Installation

Die App funktioniert als PWA. Nutzer können sie so installieren:

### Android
1. App öffnen im Chrome Browser
2. Menü (⋮) → **"Zum Home-Bildschirm hinzufügen"**
3. App wird als natives Icon auf dem Home-Screen hinzugefügt

### iOS
1. App öffnen im Safari Browser
2. Teilen-Button → **"Zum Home-Bildschirm"**
3. App wird als Web Clip installiert

### Desktop
1. App in Chrome öffnen
2. Adressleiste → Installieren-Button
3. App wird wie eine native Desktop-App installiert

## Custom Domain

Um eine Custom Domain zu verwenden:

1. Gehe zu Netlify **Site settings** → **Domain management**
2. Klicke **"Add custom domain"**
3. Gib deine Domain ein
4. Folge den DNS-Konfigurationsschritten
5. Aktualisiere Supabase **URL Configuration** mit der neuen Domain

## CI/CD Pipeline

Netlify führt automatisch aus:

1. `npm run build` - Build der App
2. Deployment zur Netlify-CDN
3. Auto-Preview für Pull Requests

## Troubleshooting

### Build Error: "Missing Supabase environment variables"
- Überprüfe, dass `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` in Netlify gesetzt sind
- Stelle sicher, dass die Namen genau stimmen (case-sensitive)

### Error: "CORS policy"
- Überprüfe, dass die Netlify Domain in Supabase **URL Configuration** eingetragen ist
- Warte 5 Minuten nach der Änderung, bis die Änderungen propagiert sind

### App lädt nicht
- Öffne Browser DevTools (F12)
- Überprüfe die Console auf Fehler
- Überprüfe dass Supabase erreichbar ist

### Service Worker funktioniert nicht
- Das ist normal, wenn die App nicht unter HTTPS läuft
- Netlify stellt automatisch HTTPS bereit

## Monitoring

1. Gehe zu Netlify **Analytics** um Traffic zu sehen
2. Überprüfe Netlify **Logs** (unter **Deployments**) für Build-Fehler
3. Supabase **Logs** unter **Logs** → **API Requests** um Datenbankfehler zu sehen

## Sicherheit

- Alle Environment Variables sind in Netlify verschlüsselt
- Supabase Anon Key hat eingeschränkte Rechte (RLS Policies)
- API-Requests sind verschlüsselt (HTTPS)
- Service Worker cached nur kritische Assets

## Weitere Ressourcen

- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [PWA Docs](https://web.dev/progressive-web-apps/)
