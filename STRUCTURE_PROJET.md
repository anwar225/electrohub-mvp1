# 📁 Structure du Projet ElectroHub

## 🎯 Vue d'ensemble

```
electrohup-main/
├── 📁 Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Composants UI réutilisables
│   │   ├── pages/            # Pages de l'application
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── lib/              # Utilitaires et API
│   │   ├── store/            # State management
│   │   └── types/            # Types TypeScript
│   ├── package.json          # Dépendances frontend
│   ├── vite.config.ts        # Configuration Vite
│   ├── vercel.json           # Configuration Vercel
│   └── tailwind.config.js    # Configuration Tailwind
│
├── 📁 Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/           # Routes API
│   │   ├── services/         # Logique métier
│   │   ├── middleware/       # Middleware (auth, etc.)
│   │   ├── utils/            # Utilitaires
│   │   └── app.js            # Configuration Express
│   ├── prisma/
│   │   ├── schema.prisma     # Schéma de base de données
│   │   └── migrations/       # Migrations de base de données
│   ├── scripts/              # Scripts utilitaires
│   ├── uploads/              # Fichiers uploadés
│   ├── backups/              # Sauvegardes de base de données
│   ├── package.json          # Dépendances backend
│   ├── railway.json          # Configuration Railway
│   └── Dockerfile            # Configuration Docker
│
└── 📁 Configuration
    ├── .env.example         # Variables d'environnement exemple
    ├── .gitignore           # Fichiers ignorés par Git
    └── README.md             # Documentation du projet
```

---

## 📱 Frontend Structure

### **src/pages/** - Pages de l'application
```
pages/
├── Auth.tsx              # Page de connexion/inscription
├── Dashboard.tsx         # Tableau de bord avec KPIs
├── FournisseursPage.tsx  # Gestion des factures d'achat
├── VentesPage.tsx        # Gestion des factures de vente
└── StockPage.tsx         # Gestion de l'inventaire
```

### **src/components/** - Composants UI
```
components/
├── Layout.tsx            # Layout principal de l'application
├── Sidebar.tsx          # Barre de navigation
├── ErrorBoundary.tsx    # Gestion des erreurs
├── StatusBadge.tsx      # Badges de statut (facture, stock)
└── ui/                  # Composants UI réutilisables
    ├── button.tsx       # Boutons
    ├── card.tsx         # Cartes
    ├── dialog.tsx       # Modales
    ├── input.tsx        # Champs de saisie
    ├── label.tsx        # Labels
    ├── select.tsx       # Sélecteurs
    ├── skeleton.tsx     # Skeletons de chargement
    ├── table.tsx        # Tableaux
    ├── sonner.tsx       # Notifications
    └── toast.tsx        # Toasts
```

### **src/hooks/** - Hooks personnalisés
```
hooks/
├── useQueries.ts        # Hooks pour les requêtes API
└── use-toast.ts         # Hook pour les notifications
```

### **src/lib/** - Utilitaires
```
lib/
├── api.ts               # Client HTTP (Axios)
├── facture-calcul.ts    # Calculs de factures
├── formatting.ts        # Fonctions de formatage
├── mockData.ts          # Données de test
└── utils.ts             # Utilitaires généraux
```

### **src/store/** - State management
```
store/
├── authStore.ts         # Store d'authentification
└── uiStore.ts           # Store d'interface utilisateur
```

### **src/types/** - Types TypeScript
```
types/
└── index.ts             # Types de l'application
    ├── User
    ├── Facture
    ├── Produit
    └── enums
```

---

## 🔧 Backend Structure

### **src/routes/** - Routes API
```
routes/
├── auth.js              # Routes d'authentification
├── factures.js          # Routes des factures
└── produits.js          # Routes des produits
```

### **src/services/** - Logique métier
```
services/
├── facture.service.js   # Service de gestion des factures
├── facture-calcul.service.js  # Calculs de factures
├── llm.service.js        # Service LLM (OCR)
├── ocr.service.js        # Service OCR
└── regex-parser.service.js  # Parser regex
```

### **src/middleware/** - Middleware
```
middleware/
├── auth.js              # Middleware d'authentification
├── upload.js            # Middleware d'upload de fichiers
└── errorHandler.js     # Gestion des erreurs
```

### **src/utils/** - Utilitaires
```
utils/
├── prisma.js            # Client Prisma
├── jwt.js               # Gestion JWT
└── validators.js         # Validateurs de données
```

---

## 🗄️ Base de Données (Prisma)

### **Modèles de données**
```
User          # Utilisateurs de l'application
Facture       # Factures d'achat et de vente
FactureItem   # Items de facture
Produit       # Produits en stock
StockMovement # Mouvements de stock
```

### **Relations**
- User → Facture (1:N)
- User → Produit (1:N)
- Facture → FactureItem (1:N)
- Produit → FactureItem (1:N)
- Produit → StockMovement (1:N)

---

## 🚀 Configuration

### **Frontend**
- **Framework** : React 18 + Vite
- **UI** : Radix UI + TailwindCSS
- **Routing** : React Router v7
- **HTTP** : Axios
- **Notifications** : Sonner

### **Backend**
- **Framework** : Express.js
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : JWT
- **Upload** : Multer

### **Déploiement**
- **Frontend** : Vercel
- **Backend** : Railway
- **Base de données** : PostgreSQL (Railway)

---

## 📦 Scripts Importants

### **Frontend**
```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Preview du build
```

### **Backend**
```bash
npm start           # Démarrer le serveur
npm run migrate     # Créer une migration
npm run prisma      # Prisma Studio
```

### **Sauvegarde**
```bash
.\scripts\backup.bat          # Sauvegarder la base de données
.\scripts\restore.bat         # Restaurer une sauvegarde
```

---

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Isolation des données par utilisateur
- ✅ Validation des données
- ✅ Protection des routes API
- ✅ CORS configuré

---

## 📊 Fonctionnalités

1. **Authentification** : Inscription/connexion sécurisée
2. **Dashboard** : KPIs en temps réel
3. **Fournisseurs** : Gestion des factures d'achat
4. **Ventes** : Gestion des factures de vente
5. **Stock** : Gestion de l'inventaire
6. **Sauvegarde** : Scripts de backup automatique

---

## 🎨 Design

- **Responsive** : Mobile et desktop
- **Thème** : Clair avec palette professionnelle
- **Composants** : Radix UI pour UX moderne
- **Feedback** : Notifications toast
- **Navigation** : Sidebar avec 4 sections

---

Cette structure est optimisée pour le développement, la maintenance et l'évolutivité du projet.