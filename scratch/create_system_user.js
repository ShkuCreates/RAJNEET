const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const systemId = 'ADMIN_SYSTEM';
  try {
    const user = await prisma.user.upsert({
      where: { id: systemId },
      update: {},
      create: {
        id: systemId,
        name: 'RAJNEET System',
        email: 'system@rajneet.in',
        role: 'ADMIN',
        onboarding_complete: true,
        username: 'system'
      },
    });
    console.log(`SUCCESS: System User created/verified.`);
  } catch (error) {
    console.error('ERROR: Could not create system user.');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
