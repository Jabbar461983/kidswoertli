# Claude Vision OCR Testing - KidsWoertli

## Testbilddatei
- **Quelle**: Vokabelseite (Deutsch/Französisch)
- **Inhalt**: Tageszeiten-Vokabeln in Tabellen-Format
- **Sprachen**: Französisch ↔ Deutsch

---

## Claude Vision Prompt-Varianten zum Testen

### Variante 1: STRICT MODE
**Ziel**: Maximale Genauigkeit, nur klare Paare

```
Du bist ein spezialisierter OCR-Extractor für Sprachlernseiten.

AUFGABE:
Extrahiere ALLE Wort- und Satzpaare aus dieser Vokabelseite.

EINGABE-FORMAT: Bilder von Lehrbuch-Seiten mit Vokabel-Tabellen

AUSGABE-FORMAT (JSON):
{
  "pairs": [
    {"language_a": "Deutsch", "text_a": "...", "language_b": "Französisch", "text_b": "..."},
    ...
  ],
  "metadata": {
    "book": "Auto-detected if visible",
    "page": "Auto-detected if visible",
    "confidence": "high/medium/low",
    "notes": "Any issues or uncertainties"
  }
}

WICHTIG - AUSSCHLIESSEN:
- Keine Überschriften, Kapitelnamen, Seitenzahlen
- Keine Grammatik-Notizen oder Erklärungen
- Keine Bilder-Beschreibungen
- Nur tatsächliche Vokabel-Paare

ANLEITUNG:
1. Identifiziere die Spalten/Tabellen-Struktur
2. Lese exakt ab (keine Interpretationen)
3. Behalte die Formatierung bei (Plurale, Groß/Kleinschreibung)
4. Wenn unsicher: markiere in "notes"
5. Gib JSON zurück (gültig und gut formatiert)
```

---

### Variante 2: RELAXED MODE
**Ziel**: Höhere Abdeckung, auch Variationen akzeptieren

```
Du bist ein OCR-Assistant für Fremdsprachenlerner.

AUFGABE:
Extrahiere alle Vokabel-Paare aus dieser Seite.
Sei nachsichtig mit Formatierung und kleinen Variationen.

REGELN:
- Ignoriere Leerzeichen-Unterschiede
- Akzeptiere ähnliche Schreibvarianten
- Kombiniere verwandte Einträge wenn nötig
- Markiere Unsicherheiten

AUSGABE-FORMAT (JSON):
{
  "pairs": [
    {
      "de": "Deutsch-Text",
      "fr": "Französisch-Text",
      "confidence": 0.95
    },
    ...
  ],
  "detected_language_pair": ["Deutsch", "Französisch"],
  "total_pairs": <zahl>
}

Antworte SOFORT mit JSON, keine Vorwort-Texte.
```

---

### Variante 3: STRUCTURED MODE
**Ziel**: Konsistente, strukturierte Ausgabe mit Metadaten

```
Extract vocabulary pairs from this language learning page.

Return ONLY valid JSON (no markdown, no explanations):

{
  "extraction": {
    "source_languages": ["German", "French"],
    "pairs": [
      {
        "id": 1,
        "lang1": "de",
        "text1": "...",
        "lang2": "fr",
        "text2": "...",
        "type": "vocabulary|phrase|sentence",
        "confidence": 0.95,
        "position": "table|list|column",
        "notes": null
      }
    ],
    "metadata": {
      "total_extracted": <zahl>,
      "quality_score": 0.95,
      "issues": []
    }
  }
}
```

---

### Variante 4: MULTILINGUAL ROBUST MODE
**Ziel**: Robustheit gegenüber verschiedenen Layouts

```
Du bist ein universeller Vokabel-Extractor für Sprachbücher.

AUFGABE: Extrahiere Wort-Paare aus beliebigen Layouts (Tabellen, Listen, Spalten).

INTELLIGENTE ERKENNUNG:
1. Erkenne automatisch die Sprachen-Paare
2. Ignoriere Layout-Unterschiede
3. Handle Sonder-Formatierung (Fettdruck, Einrückung, etc.)
4. Korrigiere offensichtliche OCR-Fehler
5. Normalisiere Whitespace

JSON OUTPUT:
{
  "success": true,
  "detected_languages": ["Deutsch", "Französisch"],
  "vocabulary_pairs": [
    {"de": "...", "fr": "...", "validated": true}
  ],
  "extraction_stats": {
    "total_pairs": <zahl>,
    "accuracy_estimate": "90-95%"
  }
}

Antworte ausschließlich mit JSON.
```

---

## Erwartete Erkennungs-Ergebnisse

Basierend auf dem Testbild sollten wir diese Paare erkennen:

**Aus den sichtbaren Tabellen:**
1. "Quelle heure est-il?" ↔ "Wie spät ist es?"
2. "Il est 9 heures" ↔ "Es ist 9 Uhr"
3. "9 heures et quart" ↔ "Viertel nach neun"
4. "9 heures vingt" ↔ "Zwanzig nach neun"
5. "9 heures et demie" ↔ "Halb zehn"
6. "10 heures moins vingt" ↔ "Zwanzig vor zehn"
7. "10 heures moins le quart" ↔ "Viertel vor zehn"
8. "le midi" ↔ "der Mittag"
9. "la minuit" ↔ "die Mitternacht"
10. "le jour" ↔ "der Tag"
11. "la nuit" ↔ "die Nacht"
12. "l'après-midi" ↔ "der Nachmittag"
13. "le matin" ↔ "der Morgen"
14. "le soir" ↔ "der Abend"

**Gesamt erwartet: ~14-16 Paare**

---

## Test-Plan

1. **Prompt 1 (STRICT)**: Höchste Genauigkeit, niedrigere Abdeckung
2. **Prompt 2 (RELAXED)**: Balance zwischen Genauigkeit und Abdeckung
3. **Prompt 3 (STRUCTURED)**: Konsistente Formatierung
4. **Prompt 4 (MULTILINGUAL)**: Robustheit gegen Variationen

**Erfolgs-Kriterium**: >90% der erwarteten 14-16 Paare korrekt extrahiert

---

## Nächste Schritte

1. Testet Variante 1 mit Testbild
2. Vergleicht Erkennungsquoten
3. Wählt beste Variante
4. Integriert diese in Netlify Function
5. Beginnt mit Datenbank-Setup
