#!/bin/bash

# KidsWoertli OCR Testing - cURL Version
# Usage: ANTHROPIC_API_KEY=sk-... ./test-ocr.sh <image-path>

set -e

IMAGE_PATH="${1:-.}"
API_KEY="${ANTHROPIC_API_KEY}"
MODEL="claude-3-5-sonnet-20241022"

if [ -z "$API_KEY" ]; then
    echo "❌ Error: ANTHROPIC_API_KEY nicht gesetzt"
    echo "Usage: ANTHROPIC_API_KEY=sk-... ./test-ocr.sh <image-path>"
    exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
    echo "❌ Error: Bildatei nicht gefunden: $IMAGE_PATH"
    exit 1
fi

echo "🚀 KidsWoertli OCR Test"
echo "📸 Image: $IMAGE_PATH"
echo "🤖 Model: $MODEL"
echo ""

# Konvertiere Bild zu Base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_PATH")

# Bestimme Media Type
MEDIA_TYPE="image/jpeg"
if [[ "$IMAGE_PATH" == *.png ]]; then
    MEDIA_TYPE="image/png"
elif [[ "$IMAGE_PATH" == *.gif ]]; then
    MEDIA_TYPE="image/gif"
elif [[ "$IMAGE_PATH" == *.webp ]]; then
    MEDIA_TYPE="image/webp"
fi

echo "📋 Media Type: $MEDIA_TYPE"
echo ""

# Prompt für STRUCTURED Variante (beste Balance)
PROMPT='Extrahiere alle Vokabel-Paare aus dieser Seite.

Antworte NUR mit gültigem JSON (keine weiteren Texte):

{
  "pairs": [
    {"de": "Deutsch-Text", "fr": "Französisch-Text"},
    ...
  ],
  "metadata": {
    "total_pairs": <number>,
    "confidence": "high/medium/low"
  }
}'

echo "🧪 Sende Anfrage an Claude Vision API..."
echo ""

# API Request
RESPONSE=$(curl -s -X POST "https://api.anthropic.com/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d @- <<EOF
{
  "model": "$MODEL",
  "max_tokens": 2048,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "$MEDIA_TYPE",
            "data": "$IMAGE_BASE64"
          }
        },
        {
          "type": "text",
          "text": "$PROMPT"
        }
      ]
    }
  ]
}
EOF
)

echo "📝 Response von Claude Vision:"
echo "---"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo "---"

# Versuche die Pairs zu extrahieren
if echo "$RESPONSE" | grep -q '"content"'; then
    echo ""
    echo "✅ API Response erfolgreich"

    # Extrahiere Text-Content
    TEXT_CONTENT=$(echo "$RESPONSE" | jq -r '.content[0].text' 2>/dev/null)

    if [ -n "$TEXT_CONTENT" ]; then
        echo ""
        echo "🔍 Extrahierte Pairs:"
        echo "$TEXT_CONTENT" | jq '.pairs[] | "\(.de) → \(.fr)"' 2>/dev/null || echo "$TEXT_CONTENT"

        # Zähle Pairs
        PAIR_COUNT=$(echo "$TEXT_CONTENT" | jq '.pairs | length' 2>/dev/null || echo "0")
        echo ""
        echo "📊 Erkannte Paare: $PAIR_COUNT"
    fi
else
    echo ""
    echo "❌ API Error:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi
