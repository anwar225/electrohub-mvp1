# ElectroHub MVP1

## Fonctionnalités
- ✅ Login/Signup
- ✅ Saisie manuelle factures
- ✅ Calculs HT/TVA/TTC
- ✅ Gestion stock basique
- ✅ Dashboard simple

## Non inclus
- ❌ OCR
- ❌ Clients/Fournisseurs avancés
- ❌ Rapports
- ❌ Export PDF
- ❌ Routes stock avancées (alerts, adjust, movements)

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma

## Routes API Actives

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Factures
- POST /api/factures (créer)
- GET /api/factures (lister)
- GET /api/factures/:id (détail)
- PUT /api/factures/:id (modifier status)
- DELETE /api/factures/:id

### Produits
- GET /api/produits
- POST /api/produits (créer)
- PUT /api/produits/:id (modifier)
- DELETE /api/produits/:id

## Tables Database
- User (id, email, passwordHash, nom, role, createdAt)
- Facture (id, numero, date, type, fournisseurNom, clientNom, montantHT, montantTVA, montantTTC, status, userId, createdAt, updatedAt)
- FactureItem (id, factureId, produitId, designation, quantite, prixUnitaire, tauxTVA, montantHT, montantTVA, montantTTC, createdAt)
- Produit (id, nom, reference, categorie, prixAchat, prixVente, stockActuel, stockMin, createdAt, updatedAt)
- StockMovement (id, produitId, type, quantite, factureId, createdAt)

## Pages Frontend
- /login - Page de connexion
- /signup - Page d'inscription
- /dashboard - Tableau de bord simple
- /factures - Liste et création de factures
- /stock - Gestion de stock basique

## Déployer
1. Vercel pour frontend
2. Railway pour backend

## Scripts
- npm run dev - Démarrer le frontend
- npm run build - Builder le frontend
- npm run typecheck - Vérifier TypeScript

## Backend
- cd backend
- npm run dev - Démarrer le backend
- npm run migrate - Exécuter les migrations Prisma
