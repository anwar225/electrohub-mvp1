# ElectroHub MVP1 - PRODUCTION

## 🌐 URLs en Production
- **Frontend**: https://[vercel-url].vercel.app
- **Backend API**: https://[railway-url].railway.app

## 🔐 Compte de Test
```
Email: demo@electrohub.local
Password: password
```

## 📋 Fonctionnalités MVP1
- ✅ Login/Signup avec JWT
- ✅ Saisie manuelle factures
- ✅ Calculs HT/TVA/TTC
- ✅ Gestion stock basique
- ✅ Dashboard simple

## 🚀 Déploiement

### 1. Vercel (Frontend)
```bash
# 1. Connecter le repo GitHub à Vercel
# 2. Configuration du build:
Framework: Vite
Build Command: npm run build
Output Directory: dist

# 3. Variables d'environnement:
VITE_API_URL=https://[backend-url].railway.app
```

### 2. Railway (Backend)
```bash
# 1. Connecter le repo GitHub à Railway
# 2. Ajouter service PostgreSQL
# 3. Ajouter service Node.js:
Root Directory: backend/
Start Command: npm start

# 4. Variables d'environnement:
DATABASE_URL=[auto-généré par Railway]
JWT_SECRET=[clé 32+ caractères]
NODE_ENV=production
FRONTEND_URL=https://[frontend-url].vercel.app
```

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_URL=https://[backend-url].railway.app
```

### Backend (.env.production)
```env
DATABASE_URL=postgresql://[railway-auto]
JWT_SECRET=[votre-clé-secrète-32+chars]
NODE_ENV=production
FRONTEND_URL=https://[frontend-url].vercel.app
```

## 📊 Routes API

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Factures
- POST /api/factures
- GET /api/factures
- GET /api/factures/:id
- PUT /api/factures/:id
- DELETE /api/factures/:id

### Produits
- GET /api/produits
- POST /api/produits
- PUT /api/produits/:id
- DELETE /api/produits/:id

## 🗄️ Database Schema
- User (id, email, passwordHash, nom, role, createdAt)
- Facture (id, numero, date, type, fournisseurNom, clientNom, montantHT, montantTVA, montantTTC, status, userId, createdAt, updatedAt)
- FactureItem (id, factureId, produitId, designation, quantite, prixUnitaire, tauxTVA, montantHT, montantTVA, montantTTC, createdAt)
- Produit (id, nom, reference, categorie, prixAchat, prixVente, stockActuel, stockMin, createdAt, updatedAt)
- StockMovement (id, produitId, type, quantite, factureId, createdAt)

## 🧪 Tests Production

### Test 1 - Authentification
```bash
# Signup
curl -X POST https://[backend].railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","nom":"Test User","password":"password123"}'

# Login
curl -X POST https://[backend].railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test 2 - Health Check
```bash
curl https://[backend].railway.app/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Test 3 - API Endpoints
```bash
# List factures (with token)
curl https://[backend].railway.app/api/factures \
  -H "Authorization: Bearer [token]"

# List produits
curl https://[backend].railway.app/api/produits \
  -H "Authorization: Bearer [token]"
```

## 📱 Pages Frontend
- /login - Connexion
- /signup - Inscription
- /dashboard - Tableau de bord
- /factures - Gestion factures
- /stock - Gestion stock

## 🎯 Stack Technique
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js 18 + Express + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT tokens
- **Hosting**: Vercel (frontend) + Railway (backend)

## 🔍 Monitoring

### Vercel Dashboard
- Analytics de performance
- Logs de déploiement
- Error tracking

### Railway Dashboard
- Health checks
- Resource usage
- Database metrics
- Logs en temps réel

## 🐛 Résolution Problèmes

### CORS Errors
```env
# Vérifier que FRONTEND_URL dans backend correspond au domaine Vercel
FRONTEND_URL=https://[votre-app].vercel.app
```

### Database Connection
```bash
# Railway: Vérifier que DATABASE_URL est bien généré automatiquement
# Manuellement:postgresql://postgres:[password]@[host]:5432/railway
```

### Build Errors
```bash
# Frontend
npm run build
npm run typecheck

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

## 📈 Scalabilité

### Frontend (Vercel)
- Auto-scaling automatique
- CDN global
- Edge functions

### Backend (Railway)
- Scaling vertical
- Load balancing
- Database scaling

## 🔒 Sécurité

- JWT tokens avec expiration
- CORS configuré
- Variables d'environnement sécurisées
- Passwords hashés avec bcrypt
- HTTPS automatique (Vercel + Railway)

## 📞 Support

Pour les problèmes de déploiement:
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- GitHub Issues: [repository issues]

---

**Dernière mise à jour**: 2026-08-30
**Version**: MVP1.0.0
**Statut**: Production Ready ✅