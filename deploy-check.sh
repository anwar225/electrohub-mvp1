#!/bin/bash

# ElectroHub MVP1 - Deployment Verification Script
# Ce script vérifie que l'application est prête pour le déploiement

echo "🚀 ElectroHub MVP1 - Vérification de déploiement"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check frontend
echo "📦 Vérification Frontend..."
if [ -f "package.json" ]; then
    print_status 0 "package.json présent"
else
    print_status 1 "package.json manquant"
fi

if [ -f "vercel.json" ]; then
    print_status 0 "vercel.json présent"
else
    print_status 1 "vercel.json manquant"
fi

if [ -f ".env.example" ]; then
    print_status 0 ".env.example présent"
else
    print_status 1 ".env.example manquant"
fi

echo ""
echo "📦 Vérification Backend..."
if [ -f "backend/package.json" ]; then
    print_status 0 "backend/package.json présent"
else
    print_status 1 "backend/package.json manquant"
fi

if [ -f "backend/railway.json" ]; then
    print_status 0 "backend/railway.json présent"
else
    print_status 1 "backend/railway.json manquant"
fi

if [ -f "backend/.env.production" ]; then
    print_status 0 "backend/.env.production présent"
else
    print_status 1 "backend/.env.production manquant"
fi

if [ -f "backend/Dockerfile" ]; then
    print_status 0 "backend/Dockerfile présent"
else
    print_status 1 "backend/Dockerfile manquant"
fi

echo ""
echo "📚 Vérification Documentation..."
if [ -f "README-MVP1.md" ]; then
    print_status 0 "README-MVP1.md présent"
else
    print_status 1 "README-MVP1.md manquant"
fi

if [ -f "PRODUCTION-MVP1.md" ]; then
    print_status 0 "PRODUCTION-MVP1.md présent"
else
    print_status 1 "PRODUCTION-MVP1.md manquant"
fi

echo ""
echo "🔧 Vérification TypeScript..."
cd "C:\Users\hp\Downloads\elecrohup-main"
if npm run typecheck > /dev/null 2>&1; then
    print_status 0 "TypeScript: Pas d'erreurs"
else
    print_status 1 "TypeScript: Erreurs détectées"
fi

echo ""
echo "📂 Structure des fichiers essentiels..."
required_files=(
    "src/App.tsx"
    "src/pages/Auth.tsx"
    "src/pages/Dashboard.tsx"
    "src/pages/FacturesPage.tsx"
    "src/pages/StockPage.tsx"
    "backend/src/app.js"
    "backend/src/routes/auth.js"
    "backend/src/routes/factures.js"
    "backend/src/routes/produits.js"
    "backend/prisma/schema.prisma"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file"
    else
        print_status 1 "$file manquant"
    fi
done

echo ""
echo "=============================================="
echo "🎉 Vérification terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Pousser le code sur GitHub"
echo "2. Déployer sur Vercel (frontend)"
echo "3. Déployer sur Railway (backend)"
echo "4. Configurer les variables d'environnement"
echo "5. Tester en production"
echo ""
echo "📖 Voir PRODUCTION-MVP1.md pour les instructions détaillées"