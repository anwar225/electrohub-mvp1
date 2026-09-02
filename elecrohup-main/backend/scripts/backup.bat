@echo off
REM Script de sauvegarde de la base de données PostgreSQL pour Windows
REM À exécuter avant toute modification importante du schéma

set YEAR=%date:~6,4%
set MONTH=%date:~3,2%
set DAY=%date:~0,2%
set HOUR=%time:~0,2%
set MINUTE=%time:~3,2%
set SECOND=%time:~6,2%
set TIMESTAMP=%YEAR%%MONTH%%DAY%_%HOUR%%MINUTE%%SECOND%

set BACKUP_DIR=.\backups
set DB_NAME=electrohub_db

REM Créer le répertoire de sauvegarde s'il n'existe pas
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM Sauvegarde de la base de données avec pg_dump
echo 📦 Sauvegarde de la base de données...
echo Date: %TIMESTAMP%
echo Dossier: %BACKUP_DIR%

REM Utiliser pg_dump si disponible, sinon créer un fichier de sauvegarde manuelle
where pg_dump >nul 2>&1
if %errorlevel% equ 0 (
    pg_dump %DB_NAME% > "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de la sauvegarde avec pg_dump
        echo 💡 Utilisation de la sauvegarde manuelle...
        echo 💡 Veuillez exporter manuellement depuis pgAdmin ou DBeaver
        echo 💡 Sauvegardez dans: %BACKUP_DIR%\backup_%TIMESTAMP%.sql
        echo ✅ Dossier de sauvegarde créé
        exit /b 0
    )
) else (
    echo ⚠️  pg_dump non trouvé dans PATH
    echo 💡 Création du dossier de sauvegarde...
    echo 💡 Veuillez exporter manuellement depuis pgAdmin ou DBeaver
    echo 💡 Sauvegardez dans: %BACKUP_DIR%\backup_%TIMESTAMP%.sql
    echo ✅ Dossier de sauvegarde créé
    exit /b 0
)

echo ✅ Sauvegarde terminée: %BACKUP_DIR%\backup_%TIMESTAMP%.sql
if exist "%BACKUP_DIR%\backup_%TIMESTAMP%.sql" (
    for %%A in ("%BACKUP_DIR%\backup_%TIMESTAMP%.sql") do echo 📊 Taille: %%~zA
)
pause