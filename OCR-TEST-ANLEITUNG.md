# 🎯 OCR Testing - Schritt-für-Schritt Anleitung

## Schritt 1: Testbilddatei speichern

Das Bild aus deiner Nachricht muss als lokale Datei gespeichert werden:

1. Öffne die Bilddatei vom Screenshot
2. Speichere sie als: `/home/user/kidswoertli/test-image.jpg`
   - **Oder**: Nutze einen anderen Pfad und passe die Commands an

```bash
# Überprüfe, ob die Datei existiert
ls -lh /home/user/kidswoertli/test-image.jpg
```

---

## Schritt 2: Anthropic API Key vorbereiten

Du brauchst einen **gültigen Anthropic API Key** mit Claude 3.5 Sonnet Zugriff:

```bash
# Export die Variable in deiner Shell oder .env
export ANTHROPIC_API_KEY="sk-ant-..."
```

⚠️ **Wichtig**: Der Key ist sensitiv - nicht in Git committen!

---

## Schritt 3: Test ausführen (Methode 1: Shell/cURL - EMPFOHLEN)

**Vorteile:** Keine Dependencies, sofort lauffähig

```bash
# Mache Skript ausführbar
chmod +x /home/user/kidswoertli/test-ocr.sh

# Starte Test
ANTHROPIC_API_KEY="sk-ant-..." ./test-ocr.sh /home/user/kidswoertli/test-image.jpg
```

**Output:**
```
📝 Response von Claude Vision:
---
{
  "pairs": [
    {"de": "Wie spät ist es?", "fr": "Quelle heure est-il?"},
    {"de": "Es ist 9 Uhr", "fr": "Il est 9 heures"},
    ...
  ],
  "metadata": {
    "total_pairs": 14,
    "confidence": "high"
  }
}
---
📊 Erkannte Paare: 14
```

---

## Schritt 4: Test ausführen (Methode 2: Node.js - Umfassend)

**Voraussetzungen:**
```bash
# Installiere Anthropic SDK
npm install @anthropic-ai/sdk
```

**Starte Test mit allen 4 Prompts:**
```bash
ANTHROPIC_API_KEY="sk-ant-..." node test-ocr-prompts.js /home/user/kidswoertli/test-image.jpg
```

**Output:**
```
🚀 KidsWoertli OCR Prompt Testing
📸 Testbild: /home/user/kidswoertli/test-image.jpg
🤖 Model: claude-3-5-sonnet-20241022
📋 Erwartete Paare: 14

============================================================
🧪 Teste: STRICT
============================================================
✅ JSON gültig
📊 Erkannte Paare: 13/14
🎯 Genauigkeit: 93%

============================================================
🧪 Teste: RELAXED
============================================================
✅ JSON gültig
📊 Erkannte Paare: 14/14
🎯 Genauigkeit: 100%

...

============================================================
📊 ZUSAMMENFASSUNG
============================================================
✅ Erfolgreiche Tests:
1. RELAXED
   Paare: 14/14
   Genauigkeit: 100%
2. MULTILINGUAL
   Paare: 13/14
   Genauigkeit: 93%
3. STRUCTURED
   Paare: 12/14
   Genauigkeit: 86%
4. STRICT
   Paare: 13/14
   Genauigkeit: 93%

🏆 BESTE VARIANTE: RELAXED
   → Genauigkeit: 100%

✨ KRITERIUM ERFÜLLT (>= 90%)
   Diese Prompt-Variante kann für Production verwendet werden!

💾 Beste Prompt exportiert: ./best-prompt.json
```

---

## Schritt 5: Ergebnisse interpretieren

| Metrik | Bedeutung |
|--------|-----------|
| **Erkannte Paare** | Wie viele Vokabel-Paare wurden korrekt extrahiert |
| **Genauigkeit** | Prozentsatz korrekt erkannter vs. erwarteter Paare |
| **Confidence** | Wie sicher ist Claude bei der Erkennung |

### ✅ Erfolgskriterium
- **Genauigkeit ≥ 90%** erfüllt die Anforderung
- **Beste Variante** wird für die Produktions-Integration verwendet

### ⚠️ Falls < 90%
1. Versuche die Testdatei zu optimieren (besseres Foto)
2. Passe einen der Prompts an
3. Teste erneut

---

## Schritt 6: Beste Prompt in Production integrieren

Sobald du die beste Prompt-Variante identifiziert hast:

```bash
# 1. Kopiere die Prompt in die Netlify Function
cat best-prompt.json

# 2. Integriere in: /netlify/functions/ocr.ts
# Siehe: ocr-testing.md für die beste Prompt-Variante
```

---

## 🔧 Troubleshooting

### Error: "API Key ungültig"
```bash
# Überprüfe API Key Format
echo $ANTHROPIC_API_KEY
# Sollte mit "sk-ant-" beginnen
```

### Error: "Bild nicht gefunden"
```bash
# Überprüfe Dateipfad
file /home/user/kidswoertli/test-image.jpg
# Output: "JPEG image data" oder ähnlich
```

### Error: "JSON Parse Error"
```bash
# Claude hat kein JSON zurückgegeben
# Lösung: Überprüfe die Prompt-Syntax in test-ocr-prompts.js
```

### Sehr niedrige Genauigkeit (< 60%)
- Testbild-Qualität zu niedrig?
- Andere Sprachen im Bild?
- Prompts zu streng?

**Lösungen:**
1. Besseres Foto machen
2. Prompt anpassen (z.B. "be more lenient")
3. Weniger Ausgabeformatierung fordern

---

## 📊 Erwartete Ergebnisse

Basierend auf deinem Testbild sollten diese ~14 Paare erkannt werden:

```
1. Quelle heure est-il? ↔ Wie spät ist es?
2. Il est 9 heures ↔ Es ist 9 Uhr
3. 9 heures et quart ↔ Viertel nach neun
4. 9 heures vingt ↔ Zwanzig nach neun
5. 9 heures et demie ↔ Halb zehn
6. 10 heures moins vingt ↔ Zwanzig vor zehn
7. 10 heures moins le quart ↔ Viertel vor zehn
8. le midi ↔ der Mittag
9. la minuit ↔ die Mitternacht
10. le jour ↔ der Tag
11. la nuit ↔ die Nacht
12. l'après-midi ↔ der Nachmittag
13. le matin ↔ der Morgen
14. le soir ↔ der Abend
```

**Ziel: ≥ 90% dieser Paare korrekt erkannt**

---

## 🚀 Nächste Schritte nach erfolgreichem Test

1. ✅ Beste Prompt-Variante identifiziert
2. → Integriere Prompt in Netlify Function (`/netlify/functions/ocr.ts`)
3. → Baue Datenbank-Schema
4. → Implementiere Auth-System
5. → Baue UI/Komponenten
6. → PWA-Setup

---

## 💡 Tipps

- **Lokal testen**: Führe Tests lokal aus, bevor du zu Netlify deployest
- **Iterativ verbessern**: Kleine Prompt-Anpassungen können großen Unterschied machen
- **Mehrere Bilder testen**: Teste mit verschiedenen Vokabelseiten für Robustheit
- **Budget im Auge behalten**: $2/Monat Budget = max 30 Tests mit 10MB Bildern

---

**Bereit? Los geht's! 🚀**

Speichere das Testbild und starte einen der Test-Skripte!
