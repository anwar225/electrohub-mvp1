require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const passwordHash = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, nom: 'Compte démo' },
    create: {
      email,
      passwordHash,
      nom: 'Compte démo',
      role: 'vendeur',
    },
  });

  console.log('✓ Utilisateur démo : test@example.com / password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
