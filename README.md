# KidsWörtli

Lern-App für den Französisch-Klassenwortschatz (aktuell Päckli 3A, KW 37, und 3B, KW 38).

- **Karten:** Abfragerichtung nur Französisch → Deutsch, nur Deutsch → Französisch oder gemischt. Bewertung mit «Gewusst / Nicht gewusst». Nicht gewusste Karten lassen sich gezielt üben und kommen etwa 1,5-mal so oft dran.
- **Lücken:** Lückentext mit Tipp und Akzent-Hinweis.
- **m / f:** Genus-Quiz.
- **Blatt:** erkannte Wortpaare mit markierten Tippfehlern vom Blatt; wählbar, ob die Korrektur oder die Version vom Blatt geübt wird.
- Countdown zum Fixpunkt mit Tagesziel.
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

In `index.html` die Listen `PACKS`, `CARDS`, `GAPS`, `GENUS` und das Datum `FIXPUNKT` anpassen. Danach in `sw.js` die `VERSION` erhöhen (z. B. `kidswoertli-v2`), damit installierte Apps die neue Version laden.
