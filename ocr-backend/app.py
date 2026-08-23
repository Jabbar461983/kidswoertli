from flask import Flask, request, jsonify
from flask_cors import CORS
import easyocr
from PIL import Image
import io
import base64
import logging

app = Flask(__name__)
CORS(app)

# Initalisiere EasyOCR mit Deutsch, Französisch, Englisch
print("Initializing EasyOCR with German, French, English...")
reader = easyocr.Reader(['de', 'fr', 'en'], gpu=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'EasyOCR'})

@app.route('/ocr', methods=['POST'])
def perform_ocr():
    """Perform OCR on uploaded image"""
    try:
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image_file = request.files['image']

        # Read image
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Perform OCR
        logger.info("Starting OCR recognition with EasyOCR...")
        results = reader.readtext(image, detail=1)

        # Extract text and confidence
        extracted_text = ""
        total_confidence = 0
        item_count = 0

        if results:
            for detection in results:
                text = detection[1]
                confidence = detection[2]
                extracted_text += text + "\n"
                total_confidence += confidence
                item_count += 1

        # Calculate average confidence
        avg_confidence = (total_confidence / item_count if item_count > 0 else 0)

        logger.info(f"OCR completed. Text length: {len(extracted_text)}, Confidence: {avg_confidence:.2%}")

        return jsonify({
            'text': extracted_text.strip(),
            'confidence': avg_confidence,
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
    """Perform OCR on base64 encoded image"""
    try:
        data = request.get_json()

        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Perform OCR
        logger.info("Starting OCR recognition (base64) with EasyOCR...")
        results = reader.readtext(image, detail=1)

        # Extract text and confidence
        extracted_text = ""
        total_confidence = 0
        item_count = 0

        if results:
            for detection in results:
                text = detection[1]
                confidence = detection[2]
                extracted_text += text + "\n"
                total_confidence += confidence
                item_count += 1

        # Calculate average confidence
        avg_confidence = (total_confidence / item_count if item_count > 0 else 0)

        logger.info(f"OCR completed. Text length: {len(extracted_text)}, Confidence: {avg_confidence:.2%}")

        return jsonify({
            'text': extracted_text.strip(),
            'confidence': avg_confidence,
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
