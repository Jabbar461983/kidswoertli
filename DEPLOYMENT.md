# 🚀 Deployment Guide - KidsWoertli

## Schritt 1: Supabase Setup

### 1.1 Neue Datenbank erstellen
```
https://supabase.com → New Project
- Name: kidswoertli
- Region: Nächste zu dir
```

### 1.2 SQL-Migration ausführen
```sql
-- Gehe zu SQL Editor in Supabase
-- Kopiere Inhalt von: supabase/migrations/001_init_schema.sql
-- Führe aus und verifiziere
```

### 1.3 Environment Keys kopieren
```
Supabase Dashboard → Settings → API
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

## Schritt 2: Anthropic API Key

```
https://console.anthropic.com → API Keys
- Neuen Key erstellen für Claude 3.5 Sonnet
- Key: sk-ant-...
```

## Schritt 3: Netlify Deployment

### 3.1 Konfigurieren
```bash
# Repository verbinden
netlify connect
# oder über Dashboard: Connect to Git
```

### 3.2 Build Settings
```
- Build command: npm run build
- Publish directory: dist
- Functions: netlify/functions
```

### 3.3 Environment Variables
Netlify Dashboard → Site settings → Build & deploy → Environment

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
ANTHROPIC_API_KEY=sk-ant-...
```

### 3.4 Deploy
```bash
npm run build
netlify deploy --prod
```

## Schritt 4: Datenbank Backup & Sicherheit

### Regelmäßige Backups
```
Supabase Dashboard → Database → Backups
- Automatische Backups aktivieren
- Recovery Window: 30 Tage
```

### Row Level Security (RLS) verifizieren
```sql
-- In Supabase SQL Editor:
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public';

-- Für jede Tabelle:
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'flashcards';
```

## Schritt 5: Monitoring & Maintenance

### Netlify Functions Logs
```
Dashboard → Functions → Logs
```

### Supabase Logs
```
Dashboard → Database → Query performance
```

### Error Tracking
```
Browser Console → Check for errors
Sentry Integration (optional)
```

## Schritt 6: Production Checkliste

- [ ] Supabase RLS aktiv
- [ ] API Key in Netlify (nicht im Code)
- [ ] HTTPS aktiviert
- [ ] Service Worker registriert
- [ ] Manifest.json valid
- [ ] Performance Test (Lighthouse)
- [ ] Mobile Test (Chrome DevTools)
- [ ] Backup-Strategie
- [ ] Monitoring aktiviert
- [ ] SSL/TLS aktiv

## Schritt 7: Custom Domain (Optional)

### Netlify Custom Domain
```
Dashboard → Domains → Add custom domain
- Domain: kidswoertli.com
- DNS settings anpassen
```

### SSL Certificate
```
Netlify aktiviert automatisch Let's Encrypt
```

## Häufige Probleme

### "Functions geben 500 Error"
1. Netlify Logs checken
2. Environment Variables gesetzt?
3. Anthropic API Key gültig?
4. Supabase Connection OK?

### "Datenbank-Queries zu langsam"
1. Indexes verifizieren
2. Supabase Logs → Query performance
3. RLS Policies optimieren

### "CORS Errors"
1. Netlify Function Headers überprüfen
2. Supabase CORS Settings
3. Browser Console für Details

## Performance Target

- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

## Skalierung (Wenn nötig)

### Supabase Upgrade
- Free: bis 500MB DB, 2GB Bandwidth
- Pro: $25/Monat, unbegrenzt

### Netlify Upgrade
- Free: 125k Funktions-Invocations/Monat
- Pro: $19+/Monat

---

**Deployed successfully? 🎉 Tell your students about KidsWoertli!**
