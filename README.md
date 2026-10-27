# KidsWörtli

Lern-App für den Klassenwortschatz in zwei Fächern, oben umschaltbar:

- **Französisch:** Päckli 3A/3B (Fixpunkt 3, 20.10.2026) und 4A/4B (Fixpunkt 4, 03.11.2026). Standardmässig ist der nächste anstehende Fixpunkt aktiv.
- **Englisch:** Unit 1 – Getting together (Class vocabulary, 34 Wörter in 5 Teilen, mit Beispielsätzen). Die im Buch grün markierten Wörter lassen sich mit «Nur grün markierte» separat üben, auch im Schreib-Modus.

- **Karten:** Abfragerichtung nur Französisch → Deutsch, nur Deutsch → Französisch oder gemischt. Abfrageart «Aufdecken» (selbst bewerten mit «Gewusst / Nicht gewusst») oder «Schreiben» (ganze Wörter und Sätze eintippen, die App prüft; Gross/Klein und Satzzeichen zählen nicht, bei Akzentfehlern gibt es einen Hinweis). Nicht gewusste Karten lassen sich gezielt üben und kommen etwa 1,5-mal so oft dran.
- **Sprechen (Test):** Nur im Profil «Admin» sichtbar. Antwort laut sagen, die Spracherkennung des Browsers (Chrome auf Android, Safari auf dem iPhone) wandelt sie in Text um, die App prüft. Auf dem iPhone nimmt die App nach kurzer Stille den zuletzt gehörten Text, weil Safari oft kein Endergebnis liefert. Akzente zählen nicht; passt einer der Vorschläge der Erkennung, ist die Antwort richtig.
- **Lücken:** Lückentext mit Tipp und Akzent-Hinweis.
- **m / f:** Genus-Quiz (nur Französisch).
- **Blatt:** erkannte Wortpaare mit markierten Tippfehlern vom Blatt; wählbar, ob die Korrektur oder die Version vom Blatt geübt wird.
- Countdown zum Fixpunkt mit Tagesziel; Fortschritt für Karten, Lücken und m/f.
- Mehrere Profile pro Gerät; der Lernstand bleibt im Browser des Geräts gespeichert.
- Vorlesen über die Sprachausgabe des Geräts.
- Installierbar als App (Teilen → «Zum Home-Bildschirm»), funktioniert auch offline.

## Aufbau

Eine einzige Seite ohne Build-Schritt und ohne Datenbank:

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die ganze App (Wörter, Darstellung, Logik) |
| `manifest.webmanifest` | App-Name und Icons für die Installation |
| `sw.js` | Offline-Unterstützung |
| `icons/` | App-Icons |
| `netlify.toml` | Netlify-Einstellungen (kein Build, Ordner wird direkt veröffentlicht) |

## Neue Päckli eintragen

In `index.html` unter `FIXPUNKTE` einen Eintrag ergänzen, in `PACKS` die Kalenderwochen eintragen und in `CARDS`, `GAPS` und `GENUS` die neuen Einträge mit dem Päckli-Kürzel (z. B. `p:"5A"`) hinzufügen. Englische Karten tragen `m:1` für «grün markiert» und `ex` für den Beispielsatz. Danach in `sw.js` die `VERSION` erhöhen (z. B. `kidswoertli-v6`), damit installierte Apps die neue Version laden.
