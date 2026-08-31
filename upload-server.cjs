const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const UPLOAD_DIR = '/home/user/kidswoertli/test-images';

// Stelle sicher, dass das Upload-Verzeichnis existiert
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // HTML Upload-Formular
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>KidsWoertli OCR Test - Image Upload</title>
        <style>
          body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
          .container { border: 2px solid #4CAF50; padding: 30px; border-radius: 8px; }
          h1 { color: #333; }
          input { padding: 10px; width: 100%; box-sizing: border-box; }
          button { background: #4CAF50; color: white; padding: 12px 20px; border: none; cursor: pointer; margin-top: 10px; width: 100%; }
          button:hover { background: #45a049; }
          #status { margin-top: 20px; padding: 10px; }
          .success { color: green; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📸 KidsWoertli OCR Test Upload</h1>
          <p>Lade hier dein Vokabel-Testbild hoch:</p>
          <input type="file" id="imageInput" accept="image/*">
          <button onclick="uploadImage()">📤 Bild hochladen & Tests starten</button>
          <div id="status"></div>
        </div>
        <script>
          async function uploadImage() {
            const input = document.getElementById('imageInput');
            const file = input.files[0];
            if (!file) { alert('Bitte wähle ein Bild'); return; }
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
              document.getElementById('status').innerHTML = '⏳ Laden...';
              const res = await fetch('/upload', { method: 'POST', body: formData });
              const data = await res.json();
              
              if (res.ok) {
                document.getElementById('status').innerHTML = 
                  '<p class="success">✅ Bild gespeichert! Tests laufen...<br>' + 
                  '<code>' + data.message + '</code></p>';
              } else {
                document.getElementById('status').innerHTML = 
                  '<p class="error">❌ Fehler: ' + data.error + '</p>';
              }
            } catch(e) {
              document.getElementById('status').innerHTML = 
                '<p class="error">❌ Fehler: ' + e.message + '</p>';
            }
          }
        </script>
      </body>
      </html>
    `);
  }

  // Upload-Endpunkt
  else if (req.method === 'POST' && req.url === '/upload') {
    let body = Buffer.alloc(0);
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk]);
    });

    req.on('end', () => {
      try {
        const boundary = req.headers['content-type'].split('boundary=')[1];
        const parts = body.toString('binary').split('--' + boundary);
        
        let imageData = null;
        for (const part of parts) {
          if (part.includes('filename=')) {
            const match = part.match(/\r\n\r\n([\s\S]*?)\r\n/);
            if (match) {
              imageData = Buffer.from(match[1], 'binary');
              break;
            }
          }
        }

        if (!imageData) throw new Error('Kein Bild gefunden');

        const filename = path.join(UPLOAD_DIR, 'test-image.jpg');
        fs.writeFileSync(filename, imageData);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: '✅ Bild gespeichert unter ' + filename
        }));

        // Starte Tests nach kurzer Verzögerung
        setTimeout(() => {
          console.log('\n🚀 Starte OCR-Tests...\n');
          try {
            execSync(`ANTHROPIC_API_KEY="${process.env.ANTHROPIC_API_KEY}" node test-ocr-prompts.js "${filename}"`, 
              { cwd: '/home/user/kidswoertli', stdio: 'inherit' });
          } catch(e) {
            console.error('❌ Test-Fehler:', e.message);
          }
        }, 1000);

      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }

  else {
    res.writeHead(404);
    res.end('404');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Upload-Server läuft auf: http://localhost:${PORT}`);
  console.log('📸 Öffne die URL im Browser und lade dein Bild hoch!\n');
});
