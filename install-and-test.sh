#!/bin/bash
set -e

# Stelle sicher, dass Abhängigkeiten installiert sind
npm list @anthropic-ai/sdk >/dev/null 2>&1 || npm install @anthropic-ai/sdk

# Setze Pfad der Testbilder
mkdir -p test-images

echo "✅ Setup abgeschlossen"
echo "📸 Warte auf Testbild unter: ./test-images/test-image.jpg"
echo ""
echo "Sobald das Bild gespeichert ist, starten wir die Tests mit:"
echo "ANTHROPIC_API_KEY=\"${ANTHROPIC_API_KEY}\" node test-ocr-prompts.js ./test-images/test-image.jpg"
