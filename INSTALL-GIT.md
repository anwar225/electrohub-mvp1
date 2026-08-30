# Installer Git sur Windows

## Méthode 1: Via Winget (Windows Package Manager)
```powershell
winget install Git.Git
```

## Méthode 2: Téléchargement Manuel
1. Aller sur https://git-scm.com/download/win
2. Télécharger l'installeur Windows
3. Exécuter l'installeur avec les options par défaut
4. Redémarrer le terminal PowerShell

## Vérification
```powershell
git --version
# Expected: git version 2.x.x
```

## Après installation
```powershell
cd C:\Users\hp\Downloads\elecrohup-main
git init
git add .
git commit -m "MVP1: Core business - Manual invoices + Stock + Dashboard"
```