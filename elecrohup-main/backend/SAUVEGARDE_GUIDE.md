# Guide de Sauvegarde des Données ElectroHub

## 🎯 Pourquoi sauvegarder ?

Avant toute modification importante du schéma de base de données, des migrations ou des changements de structure, il est essentiel de sauvegarder les données utilisateur pour éviter toute perte.

## 📦 Scripts de Sauvegarde

### Backup (Sauvegarde)

**Windows :**
```bash
.\scripts\backup.bat
```

**Linux/Mac :**
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

Les sauvegardes sont stockées dans le dossier `./backups/` avec le format :
- `backup_YYYYMMDD_HHMMSS.sql` (fichier SQL)
- `backup_YYYYMMDD_HHMMSS.sql.gz` (fichier compressé sur Linux)

### Restore (Restauration)

**Windows :**
```bash
.\scripts\restore.bat .\backups\backup_20240902_140000.sql
```

## 🔄 Processus de Sécurité Recommandé

### Avant toute modification importante :

1. **Faire une sauvegarde**
   ```bash
   .\scripts\backup.bat
   ```

2. **Vérifier la sauvegarde**
   - Vérifier que le fichier existe dans `./backups/`
   - Vérifier la taille du fichier (doit être > 0)

3. **Tester les modifications en local**
   - Utiliser la base de données locale
   - Vérifier que tout fonctionne

4. **Appliquer les modifications**
   - Exécuter les migrations
   - Tester l'application

5. **Si problème : Restaurer**
   ```bash
   .\scripts\restore.bat .\backups\backup_[DATE].sql
   ```

## 🗂️ Emplacements des Sauvegardes

- **Dossier local** : `./backups/`
- **Format** : SQL (compatible avec pg_restore et psql)
- **Compression** : `.gz` sur Linux/Mac, `.sql` sur Windows

## ⚠️ Bonnes Pratiques

### 1. Sauvegardes automatiques
Configurer des sauvegardes automatiques sur Railway (production) :
- Activer les backups automatiques dans les paramètres Railway
- Programmer des sauvegardes quotidiennes si possible

### 2. Sauvegardes avant migrations
Toujours faire une sauvegarde manuelle avant :
- `npx prisma migrate dev`
- `npx prisma db push`
- Modifications directes du schéma

### 3. Sauvegardes de production
Pour sauvegarder la base de données Railway :
```bash
# Récupérer les identifiants depuis Railway
# Connecter à la base de données PostgreSQL
pg_dump -h hostname -U username -d database > backup.sql
```

### 4. Sauvegardes locales
Conserver plusieurs sauvegardes :
- Garder les 3-5 dernières sauvegardes
- Supprimer les anciennes pour économiser l'espace

## 🚨 En cas de problème

### Erreur pendant une migration
1. Arrêter le processus immédiatement
2. Restaurer la dernière sauvegarde
3. Vérifier le schéma
4. Corriger la migration
5. Réessayer

### Données corrompues
1. Restaurer la sauvegarde la plus récente fonctionnelle
2. Vérifier l'intégrité des données
3. Recréer les données manquantes si nécessaire

## 📝 Checklist Avant Modification

- [ ] Sauvegarde effectuée
- [ ] Fichier de sauvegarde vérifié
- [ ] Modifications testées en local
- [ ] Script de restauration testé
- [ ] Plan de rollback en place

## 🔧 Configuration Avancée

### Variable d'environnement pour backups
Ajouter à `.env` :
```
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=7
```

### Automatisation (Windows)
Créer une tâche planifiée Windows pour exécuter `backup.bat` quotidiennement.

### Automatisation (Linux/Mac)
Ajouter au crontab :
```
0 2 * * * cd /path/to/backend && ./scripts/backup.sh
```

## 📞 Support

En cas de problème de données :
1. Arrêter immédiatement toute modification
2. Restaurer la sauvegarde
3. Contacter le support technique si nécessaire

---

**Règle d'or : Mieux vaut une sauvegarde de trop que pas assez !**