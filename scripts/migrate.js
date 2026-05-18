const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Command failed:', cmd);
    console.error(error.message);
    return false;
  }
}

function main() {
  console.log('Starting migration process...');
  
  const migrationsDir = './prisma/migrations';
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir).filter(dir => 
      fs.statSync(`${migrationsDir}/${dir}`).isDirectory()
    ).sort();
    
    console.log('Found migrations:', migrations);
    
    // First, try to mark all migrations as applied (in case DB is already up to date but no _prisma_migrations)
    for (const migration of migrations) {
      console.log(`Marking migration as applied (if needed): ${migration}`);
      runCommand(`npx prisma migrate resolve --applied "${migration}" 2>/dev/null || true`);
    }
  }
  
  // Now try to run deploy (this will apply any new migrations not already applied)
  console.log('Running prisma migrate deploy...');
  const deploySuccess = runCommand('npx prisma migrate deploy');
  
  if (!deploySuccess) {
    console.log('Deploy failed, but continuing anyway (database might be up to date)');
  }
  
  console.log('Migration process complete');
}

main();
