const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const hasMigrationsTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `;
    
    const tableExists = hasMigrationsTable[0].exists;
    console.log('Migrations table exists:', tableExists);

    if (!tableExists) {
      console.log('Baselining database...');
      const migrations = require('fs').readdirSync('./prisma/migrations');
      const firstMigration = migrations.sort()[0];
      console.log('Using first migration for baseline:', firstMigration);
      execSync(`npx prisma migrate resolve --applied "${firstMigration}"`, { stdio: 'inherit' });
    }

    console.log('Running deploy...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    console.error('Migration error:', error);
    // Fallback: just try to run deploy directly
    try {
      console.log('Falling back to direct deploy...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      console.log('Skipping migration due to errors (database might already be up to date)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
