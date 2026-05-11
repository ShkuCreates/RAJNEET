const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'savagejetha777@gmail.com';
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'ADMIN' },
    });
    console.log(`SUCCESS: User ${user.name} (${user.email}) has been promoted to ADMIN.`);
  } catch (error) {
    console.error('ERROR: Could not find user with that email. Make sure you have logged in at least once.');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
