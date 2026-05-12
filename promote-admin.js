const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'savagejetha777@gmail.com';
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  // Update user to admin
  await prisma.user.update({
    where: { email },
    data: {
      role: 'ADMIN',
      username: 'shourya'
    }
  });

  console.log('Successfully promoted to admin!');
  console.log('User:', user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
