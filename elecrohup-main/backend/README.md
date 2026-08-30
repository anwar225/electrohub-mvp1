# ElectroHub Backend

API Express + Prisma + PostgreSQL pour l'application React ElectroHub.

## Prérequis

- Node.js 18+
- PostgreSQL 13+
- Python 3.8+ (`pip install -r requirements.txt`) pour PaddleOCR
- Ollama en écoute sur `http://localhost:11434` (`ollama serve`, modèle `llama2`)

## Installation

```bash
cd backend
npm install
cp .env.example .env
# Éditer DATABASE_URL et JWT_SECRET dans .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

PostgreSQL via Docker :

```bash
docker compose up db -d
```

## Endpoints

| Méthode | Chemin | Auth |
|---------|--------|------|
| POST | `/api/auth/signup` | non |
| POST | `/api/auth/login` | non |
| GET | `/api/auth/me` | JWT |
| POST | `/api/factures/upload` | JWT + fichier `file` |
| GET/PUT/DELETE | `/api/factures` | JWT |
| CRUD | `/api/produits` | JWT |
| POST | `/api/stock/adjust` | JWT |
| GET | `/api/stock/movements/:produitId` | JWT |
| GET | `/api/stock/alerts` | JWT |
| CRUD | `/api/clients` | JWT |
| CRUD | `/api/fournisseurs` | JWT |
| GET | `/api/rapports/dashboard` | JWT |
| GET | `/health` | non |

Header : `Authorization: Bearer <token>`

Le frontend (Vite, port 5173) doit pointer vers `http://localhost:3000`.
