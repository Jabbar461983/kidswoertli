#!/usr/bin/env node

/**
 * OCR Testing Script für KidsWoertli
 * Testet 4 verschiedene Claude Vision Prompts
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node test-ocr-prompts.js <image-path>
 *
 * Beispiel:
 *   ANTHROPIC_API_KEY=sk-... node test-ocr-prompts.js ./test-image.jpg
 */

const fs = require('fs');
const path = require('path');

// Anthropic SDK
const Anthropic = require('@anthropic-ai/sdk').default;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Prompt-Varianten
const PROMPTS = {
  STRICT: `Du bist ein spezialisierter OCR-Extractor für Sprachlernseiten.

AUFGABE:
Extrahiere ALLE Wort- und Satzpaare aus dieser Vokabelseite.

AUSGABE-FORMAT (gültiges JSON):
{
  "pairs": [
    {"de": "Deutsch-Text", "fr": "Französisch-Text"},
    {"de": "...", "fr": "..."}
  ],
  "metadata": {
    "total_pairs": <number>,
    "confidence": "high/medium/low",
    "issues": "falls vorhanden"
  }
}

WICHTIG - AUSSCHLIESSEN:
- Keine Überschriften, Kapitelnamen, Seitenzahlen
- Keine Grammatik-Notizen oder Erklärungen
- Nur tatsächliche Vokabel-Paare

Antworte NUR mit validem JSON, keine weiteren Texte.`,

  RELAXED: `Extrahiere alle Vokabel-Paare aus dieser Sprachseite.

Sei nachsichtig mit:
- Leerzeichen-Unterschieden
- Kleineren Formatierungsvariationen
- Ähnlichen Schreibvarianten

JSON OUTPUT:
{
  "pairs": [
    {"de": "...", "fr": "..."},
    ...
  ],
  "total": <number>,
  "notes": "Alle erkannten Paare"
}

NUR JSON, kein Vorwort.`,

  STRUCTURED: `Extract vocabulary pairs. Return ONLY valid JSON:

{
  "pairs": [
    {
      "id": 1,
      "de": "German text",
      "fr": "French text",
      "confidence": 0.95
    }
  ],
  "metadata": {
    "total_extracted": <number>,
    "quality_score": 0.95,
    "method": "table|list|mixed"
  }
}`,

  MULTILINGUAL: `Du bist ein universeller Vokabel-Extractor.

Erkenne automatisch:
- Sprachen-Paare (hier: Deutsch-Französisch)
- Layout (Tabellen, Listen, Spalten)
- Ignoriere Seitenzahlen, Überschriften

JSON (ONLY):
{
  "pairs": [
    {"de": "...", "fr": "..."}
  ],
  "total": <number>,
  "detected_languages": ["Deutsch", "Französisch"]
}`
};

// Erwartete Ergebnisse (für Vergleich)
const EXPECTED_PAIRS = [
  { de: "Wie spät ist es?", fr: "Quelle heure est-il?" },
  { de: "Es ist 9 Uhr", fr: "Il est 9 heures" },
  { de: "Viertel nach neun", fr: "9 heures et quart" },
  { de: "Zwanzig nach neun", fr: "9 heures vingt" },
  { de: "Halb zehn", fr: "9 heures et demie" },
  { de: "Zwanzig vor zehn", fr: "10 heures moins vingt" },
  { de: "Viertel vor zehn", fr: "10 heures moins le quart" },
  { de: "der Mittag", fr: "le midi" },
  { de: "die Mitternacht", fr: "la minuit" },
  { de: "der Tag", fr: "le jour" },
  { de: "die Nacht", fr: "la nuit" },
  { de: "der Nachmittag", fr: "l'après-midi" },
  { de: "der Morgen", fr: "le matin" },
  { de: "der Abend", fr: "le soir" }
];

/**
 * Konvertiert Bild zu Base64
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Bestimmt Media Type basierend auf Dateiendung
 */
function getMediaType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Testet einen Prompt
 */
async function testPrompt(promptName, promptText, imageBase64, mediaType) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Teste: ${promptName}`);
  console.log('='.repeat(60));

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: promptText,
            },
          ],
        },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    console.log('\n📝 Response:');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));

    // Versuche JSON zu extrahieren
    try {
      // Finde JSON im Response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);

        // Extrahiere Pairs basierend auf Struktur
        let pairs = [];
        if (jsonData.pairs) {
          pairs = jsonData.pairs.map(p => ({
            de: p.de || p.text1 || p.german || '',
            fr: p.fr || p.text2 || p.french || p.text_b || ''
          }));
        } else if (jsonData.vocabulary_pairs) {
          pairs = jsonData.vocabulary_pairs;
        }

        // Berechne Erkennungsquote
        const recognizedCount = pairs.length;
        const accuracy = calculateAccuracy(pairs);

        console.log(`\n✅ JSON gültig`);
        console.log(`📊 Erkannte Paare: ${recognizedCount}/${EXPECTED_PAIRS.length}`);
        console.log(`🎯 Genauigkeit: ${accuracy}%`);
        console.log(`\n🔍 Erste 5 erkannte Paare:`);
        pairs.slice(0, 5).forEach((p, i) => {
          console.log(`  ${i+1}. DE: "${p.de}" → FR: "${p.fr}"`);
        });

        return {
          name: promptName,
          success: true,
          pairCount: recognizedCount,
          accuracy: accuracy,
          pairs: pairs,
          raw: jsonData
        };
      } else {
        throw new Error('Keine JSON gefunden');
      }
    } catch (parseError) {
      console.log(`\n⚠️  JSON Parse Fehler: ${parseError.message}`);
      console.log(`\n📌 Raw Response (first 300 chars):`);
      console.log(responseText.substring(0, 300));
      return {
        name: promptName,
        success: false,
        error: parseError.message,
        raw: responseText
      };
    }
  } catch (error) {
    console.error(`❌ API Error: ${error.message}`);
    return {
      name: promptName,
      success: false,
      error: error.message
    };
  }
}

/**
 * Berechnet Genauigkeit gegen erwartete Paare
 */
function calculateAccuracy(detected) {
  if (detected.length === 0) return 0;

  let matches = 0;
  detected.forEach(pair => {
    const found = EXPECTED_PAIRS.some(expected =>
      (pair.de?.toLowerCase().includes(expected.de.toLowerCase()) ||
       pair.fr?.toLowerCase().includes(expected.fr.toLowerCase()))
    );
    if (found) matches++;
  });

  return Math.round((matches / EXPECTED_PAIRS.length) * 100);
}

/**
 * Hauptfunktion
 */
async function main() {
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.error('❌ Fehler: Bildpfad erforderlich');
    console.error('Usage: ANTHROPIC_API_KEY=sk-... node test-ocr-prompts.js <image-path>');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Fehler: Datei nicht gefunden: ${imagePath}`);
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Fehler: ANTHROPIC_API_KEY Umgebungsvariable nicht gesetzt');
    process.exit(1);
  }

  console.log('🚀 KidsWoertli OCR Prompt Testing');
  console.log(`📸 Testbild: ${imagePath}`);
  console.log(`🤖 Model: claude-3-5-sonnet-20241022`);
  console.log(`📋 Erwartete Paare: ${EXPECTED_PAIRS.length}`);

  // Konvertiere Bild
  const imageBase64 = imageToBase64(imagePath);
  const mediaType = getMediaType(imagePath);

  // Teste alle Prompts
  const results = [];
  for (const [promptName, promptText] of Object.entries(PROMPTS)) {
    const result = await testPrompt(promptName, promptText, imageBase64, mediaType);
    results.push(result);

    // Kurze Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Zusammenfassung
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📊 ZUSAMMENFASSUNG');
  console.log('='.repeat(60));

  const successResults = results.filter(r => r.success);

  if (successResults.length > 0) {
    console.log('\n✅ Erfolgreiche Tests:');
    successResults.sort((a, b) => b.accuracy - a.accuracy);

    successResults.forEach((r, i) => {
      console.log(`${i+1}. ${r.name}`);
      console.log(`   Paare: ${r.pairCount}/${EXPECTED_PAIRS.length}`);
      console.log(`   Genauigkeit: ${r.accuracy}%`);
    });

    console.log(`\n🏆 BESTE VARIANTE: ${successResults[0].name}`);
    console.log(`   → Genauigkeit: ${successResults[0].accuracy}%`);

    if (successResults[0].accuracy >= 90) {
      console.log('\n✨ KRITERIUM ERFÜLLT (>= 90%)');
      console.log(`   Diese Prompt-Variante kann für Production verwendet werden!`);
    } else {
      console.log('\n⚠️  KRITERIUM NICHT ERFÜLLT');
      console.log(`   Genauigkeit ${successResults[0].accuracy}% < 90%`);
      console.log(`   Empfehlung: Prompts weiter optimieren`);
    }
  } else {
    console.log('\n❌ Keine erfolgreichen Tests');
  }

  // Exportiere beste Variante
  if (successResults.length > 0) {
    const bestResult = successResults[0];
    const exportPath = './best-prompt.json';
    fs.writeFileSync(exportPath, JSON.stringify({
      prompt_name: bestResult.name,
      prompt_text: PROMPTS[bestResult.name],
      accuracy: bestResult.accuracy,
      sample_pairs: bestResult.pairs.slice(0, 5),
      test_date: new Date().toISOString()
    }, null, 2));

    console.log(`\n💾 Beste Prompt exportiert: ${exportPath}`);
  }
}

main().catch(console.error);
