from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
from PIL import Image
import io
import base64
import logging
import os

app = Flask(__name__)
CORS(app)

# Initialize Anthropic client lazily (not at startup)
api_key = os.getenv('ANTHROPIC_API_KEY')
if not api_key:
    print("WARNING: ANTHROPIC_API_KEY environment variable not set!")
    print("Set it on Render in the Environment tab")
client = None

def get_client():
    global client
    if client is None:
        client = Anthropic(api_key=api_key)
    return client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    has_key = bool(os.getenv('ANTHROPIC_API_KEY'))
    return jsonify({
        'status': 'healthy',
        'model': 'Claude Vision API',
        'api_key_configured': has_key
    })

@app.route('/ocr', methods=['POST'])
def perform_ocr():
    """Perform OCR on uploaded image using Claude Vision"""
    try:
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image_file = request.files['image']
        image_bytes = image_file.read()

        # Convert image to base64
        image_base64 = base64.standard_b64encode(image_bytes).decode('utf-8')

        # Determine image type from file
        image = Image.open(io.BytesIO(image_bytes))
        image_format = image.format.lower() if image.format else 'jpeg'
        media_type = f'image/{image_format}'

        logger.info(f"Processing image: {image_format}, size: {len(image_bytes)} bytes")

        # Call Claude Vision API
        logger.info("Sending image to Claude Vision API...")
        message = get_client().messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": """Bitte erkenne den Text in diesem Bild sehr genau und präzise.

Gib den erkannten Text genau so aus, wie er im Bild steht, Zeile für Zeile.
Ignoriere keine Wörter und achte auf korrekte Rechtschreibung.

Antworte NUR mit dem erkannten Text, nichts anderes."""
                        }
                    ],
                }
            ],
        )

        # Extract text from response
        extracted_text = message.content[0].text.strip()
        confidence = 0.95  # Claude Vision is very accurate

        logger.info(f"OCR completed. Text length: {len(extracted_text)}")

        return jsonify({
            'text': extracted_text,
            'confidence': confidence,
            'success': True
        })

    except Exception as e:
        logger.error(f"OCR Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/ocr/base64', methods=['POST'])
def perform_ocr_base64():
    """Perform OCR on base64 encoded image using Claude Vision"""
    try:
        data = request.get_json()

        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            # Extract media type and data
            header, image_data = image_data.split(',', 1)
            media_type = header.split(':')[1].split(';')[0]
        else:
            media_type = 'image/jpeg'

        logger.info(f"Processing base64 image: {media_type}")

        # Call Claude Vision API
        logger.info("Sending image to Claude Vision API (base64)...")
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": """Bitte erkenne den Text in diesem Bild sehr genau und präzise.

Gib den erkannten Text genau so aus, wie er im Bild steht, Zeile für Zeile.
Ignoriere keine Wörter und achte auf korrekte Rechtschreibung.

Antworte NUR mit dem erkannten Text, nichts anderes."""
                        }
                    ],
                }
            ],
        )

        # Extract text from response
        extracted_text = message.content[0].text.strip()
        confidence = 0.95  # Claude Vision is very accurate

        logger.info(f"OCR completed (base64). Text length: {len(extracted_text)}")

        return jsonify({
            'text': extracted_text,
            'confidence': confidence,
            'success': True
        })

    except Exception as e:
        logger.error(f"OCR Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
