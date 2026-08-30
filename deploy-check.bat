@echo off
REM ElectroHub MVP1 - Deployment Verification Script for Windows
REM Ce script vérifie que l'application est prête pour le déploiement

echo ==============================================
echo 🚀 ElectroHub MVP1 - Vérification de déploiement
echo ==============================================
echo.

cd /d "C:\Users\hp\Downloads\elecrohup-main"

echo 📦 Vérification Frontend...
if exist "package.json" (
    echo ✅ package.json présent
) else (
    echo ❌ package.json manquant
)

if exist "vercel.json" (
    echo ✅ vercel.json présent
) else (
    echo ❌ vercel.json manquant
)

if exist ".env.example" (
    echo ✅ .env.example présent
) else (
    echo ❌ .env.example manquant
)

echo.
echo 📦 Vérification Backend...
if exist "elecrohup-main\backend\package.json" (
    echo ✅ backend\package.json présent
) else (
    echo ❌ backend\package.json manquant
)

if exist "elecrohup-main\backend\railway.json" (
    echo ✅ backend\railway.json présent
) else (
    echo ❌ backend\railway.json manquant
)

if exist "elecrohup-main\backend\.env.production" (
    echo ✅ backend\.env.production présent
) else (
    echo ❌ backend\.env.production manquant
)

if exist "elecrohup-main\backend\Dockerfile" (
    echo ✅ backend\Dockerfile présent
) else (
    echo ❌ backend\Dockerfile manquant
)

echo.
echo 📚 Vérification Documentation...
if exist "README-MVP1.md" (
    echo ✅ README-MVP1.md présent
) else (
    echo ❌ README-MVP1.md manquant
)

if exist "PRODUCTION-MVP1.md" (
    echo ✅ PRODUCTION-MVP1.md présent
) else (
    echo ❌ PRODUCTION-MVP1.md manquant
)

echo.
echo 🔧 Vérification TypeScript...
call npm run typecheck
if %errorlevel% equ 0 (
    echo ✅ TypeScript: Pas d'erreurs
) else (
    echo ❌ TypeScript: Erreurs détectées
)

echo.
echo 📂 Structure des fichiers essentiels...
if exist "src\App.tsx" echo ✅ src\App.tsx
if exist "src\pages\Auth.tsx" echo ✅ src\pages\Auth.tsx
if exist "src\pages\Dashboard.tsx" echo ✅ src\pages\Dashboard.tsx
if exist "src\pages\FacturesPage.tsx" echo ✅ src\pages\FacturesPage.tsx
if exist "src\pages\StockPage.tsx" echo ✅ src\pages\StockPage.tsx
if exist "elecrohup-main\backend\src\app.js" echo ✅ backend\src\app.js
if exist "elecrohup-main\backend\src\routes\auth.js" echo ✅ backend\src\routes\auth.js
if exist "elecrohup-main\backend\src\routes\factures.js" echo ✅ backend\src\routes\factures.js
if exist "elecrohup-main\backend\src\routes\produits.js" echo ✅ backend\src\routes\produits.js
if exist "elecrohup-main\backend\prisma\schema.prisma" echo ✅ backend\prisma\schema.prisma

echo.
echo ==============================================
echo 🎉 Vérification terminée!
echo.
echo 📋 Prochaines étapes:
echo 1. Pousser le code sur GitHub
echo 2. Déployer sur Vercel (frontend)
echo 3. Déployer sur Railway (backend)
echo 4. Configurer les variables d'environnement
echo 5. Tester en production
echo.
echo 📖 Voir PRODUCTION-MVP1.md pour les instructions détaillées
pause