#!/bin/bash
# Script de sauvegarde de la base de données PostgreSQL
# À exécuter avant toute modification importante du schéma

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DB_NAME="electrohub_db"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
echo "📦 Sauvegarde de la base de données..."
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Compresser la sauvegarde
gzip "$BACKUP_DIR/backup_$DATE.sql"

echo "✅ Sauvegarde terminée: $BACKUP_DIR/backup_$DATE.sql.gz"
echo "📊 Taille: $(du -h "$BACKUP_DIR/backup_$DATE.sql.gz" | cut -f1)"