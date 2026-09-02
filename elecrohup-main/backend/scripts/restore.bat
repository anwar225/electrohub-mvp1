@echo off
REM Script de restauration de la base de données PostgreSQL pour Windows
REM À utiliser en cas de problème après une modification

set BACKUP_FILE=%1

if "%BACKUP_FILE%"=="" (
    echo ❌ Usage: restore.bat fichier_de_sauvegarde.sql
    echo Exemple: restore.bat .\backups\backup_20240902_140000.sql
    exit /b 1
)

if not exist %BACKUP_FILE% (
    echo ❌ Fichier de sauvegarde introuvable: %BACKUP_FILE%
    exit /b 1
)

echo ⚠️  ATTENTION: Cette opération va remplacer toute la base de données actuelle
echo Fichier de sauvegarde: %BACKUP_FILE%
echo.
set /p CONFIRM=Continuer? (O/N)

if /i not "%CONFIRM%"=="O" (
    echo ❌ Opération annulée
    exit /b 0
)

echo 📦 Restauration de la base de données...
psql %BACKUP_FILE%

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la restauration
    exit /b 1
)

echo ✅ Restauration terminée avec succès
pause