const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedUser() {
  console.log('Création d\'un utilisateur par défaut...');
  
  try {
    // Vérifier si un utilisateur existe déjà
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      console.log('✓ Utilisateur existe déjà:', existingUser.email);
      await prisma.$disconnect();
      return;
    }
    
    // Créer un utilisateur par défaut
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@electrohub.com',
        passwordHash,
        nom: 'Admin ElectroHub',
        role: 'admin',
      },
    });
    
    console.log('✓ Utilisateur créé avec succès !');
    console.log('Email:', user.email);
    console.log('Mot de passe: password123');
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUser();