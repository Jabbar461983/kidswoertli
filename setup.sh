#!/bin/bash
set -e

echo "🚀 KidsWoertli Setup"
echo "===================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nicht installiert"
    echo "Bitte installiert Node.js 18+ von https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check environment
echo ""
echo "🔐 Environment Setup"
echo "---"
if [ ! -f .env.local ]; then
    echo "📋 Erstelle .env.local..."
    cp .env.local.example .env.local
    echo "⚠️  Bitte fülle folgende Werte in .env.local ein:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - ANTHROPIC_API_KEY"
    echo ""
else
    echo "✅ .env.local bereits vorhanden"
fi

echo ""
echo "📝 Build & Run Commands:"
echo "---"
echo "npm run dev       - Start development server"
echo "npm run build     - Production build"
echo "npm run preview   - Preview production build"
echo "npm run lint      - Run TypeScript checks"
echo ""

echo "✨ Setup abgeschlossen!"
echo ""
echo "Nächste Schritte:"
echo "1. Öffne .env.local und fülle die fehlenden Keys ein"
echo "2. Starte: npm run dev"
echo "3. Öffne: http://localhost:5173"
echo "4. Admin-Profil erstellen und Login testen"
echo ""
