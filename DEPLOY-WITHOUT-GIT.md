# Déployer ElectroHub MVP1 sans Git

## 📦 Préparer les fichiers pour déploiement

### Étape 1: Créer des archives ZIP

#### Frontend (pour Vercel)
```powershell
# Créer une archive ZIP du frontend
cd C:\Users\hp\Downloads\elecrohup-main
Compress-Archive -Path src,package.json,package-lock.json,tsconfig.json,vite.config.ts,tailwind.config.js,postcss.config.js,eslint.config.js,index.html,components.json,.env.example,vercel.json -DestinationPath electrohub-frontend.zip -Force
```

#### Backend (pour Railway)
```powershell
# Créer une archive ZIP du backend
cd C:\Users\hp\Downloads\elecrohup-main\elecrohup-main\backend
Compress-Archive -Path src,prisma,package.json,package-lock.json,Dockerfile,railway.json,.env.production -DestinationPath electrohub-backend.zip -Force
```

---

## 🚀 Déploiement sur Vercel (Frontend)

### Méthode 1: Via Interface Web (sans Git)

1. **Aller sur Vercel**
   - https://vercel.com
   - Créer un compte ou se connecter

2. **Créer un nouveau projet**
   - Cliquer sur "Add New" → "Project"
   - Choisir "Upload a folder or file"

3. **Uploader le frontend**
   - Sélectionner `electrohub-frontend.zip`
   - Vercel va extraire et analyser les fichiers

4. **Configuration**
   - **Framework**: Vite (détection automatique)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**
   - `VITE_API_URL`: Laisser vide pour le moment (à configurer après déploiement backend)

6. **Deploy**
   - Cliquer sur "Deploy"
   - Attendre le build (2-3 minutes)
   - Notez l'URL: `https://[votre-app].vercel.app`

---

## 🚀 Déploiement sur Railway (Backend)

### Méthode 1: Via Interface Web (sans Git)

1. **Aller sur Railway**
   - https://railway.app
   - Créer un compte ou se connecter

2. **Créer un nouveau projet**
   - Cliquer sur "New Project"
   - Choisir "Deploy from GitHub" → Puis "Deploy from Directory"

3. **Uploader le backend**
   - Glisser-déposer `electrohub-backend.zip`
   - Railway va extraire et analyser les fichiers

4. **Configuration PostgreSQL**
   - Railway va détecter automatiquement qu'il faut une base de données
   - Cliquer sur "Add PostgreSQL"
   - Notez le `DATABASE_URL` généré

5. **Configuration Node.js**
   - **Root Directory**: Laisser vide (fichiers à la racine)
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

6. **Environment Variables**
   - `DATABASE_URL`: (auto-généré par Railway, ne pas changer)
   - `JWT_SECRET`: Créer une clé de 32+ caractères (ex: `electrohub-production-secret-key-2024`)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: URL de votre frontend Vercel (ex: `https://electrohub.vercel.app`)

7. **Deploy**
   - Cliquer sur "Deploy"
   - Attendre le build (3-5 minutes)
   - Notez l'URL: `https://[votre-backend].railway.app`

---

## 🔗 Finaliser la configuration

### 1. Mettre à jour Vercel avec l'URL backend

1. Aller sur votre projet Vercel
2. Cliquer sur "Settings" → "Environment Variables"
3. Ajouter/Modifier:
   - `VITE_API_URL` = `https://[votre-backend].railway.app`
4. Redéployer le projet Vercel

### 2. Mettre à jour Railway avec l'URL frontend

1. Aller sur votre projet Railway
2. Cliquer sur votre service backend
3. Cliquer sur "Variables"
4. Ajouter/Modifier:
   - `FRONTEND_URL` = `https://[votre-frontend].vercel.app`
5. Redéployer le service Railway

---

## 🧪 Tester le déploiement

### Test Backend
```powershell
# Health check
curl https://[votre-backend].railway.app/health

# Expected: {"status":"ok","timestamp":"..."}
```

### Test Frontend
1. Ouvrir `https://[votre-frontend].vercel.app`
2. Tester avec les credentials de test (si disponibles)

---

## 📝 Alternative: GitHub Desktop (Interface graphique)

Si vous préférez une interface graphique:

1. **Installer GitHub Desktop**
   - https://desktop.github.com/
   - Installation simple et guidée

2. **Créer un repository sur GitHub**
   - Aller sur https://github.com
   - Créer un nouveau repository "electrohub-mvp1"

3. **Cloner et uploader**
   - Ouvrir GitHub Desktop
   - File → Clone Repository
   - Sélectionner "electrohub-mvp1"
   - Copier les fichiers du projet dans le dossier cloné
   - GitHub Desktop détectera les changements
   - Commit: "MVP1: Core business - Manual invoices + Stock + Dashboard"
   - Push sur GitHub

4. **Continuer avec déploiement standard**
   - Utiliser les instructions de PRODUCTION-MVP1.md

---

## 🎯 Résumé rapide

1. **Créer les archives ZIP** (frontend et backend)
2. **Déployer sur Vercel** (upload frontend.zip)
3. **Déployer sur Railway** (upload backend.zip + PostgreSQL)
4. **Configurer les URLs croisées** (frontend ↔ backend)
5. **Tester en production**

---

**Cette méthode permet de déployer sans Git mais est moins recommandée pour le développement continu. Pour un projet sérieux, installez Git (voir INSTALL-GIT.md).**