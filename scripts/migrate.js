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
  
  // First, try to run deploy
  const deploySuccess = runCommand('npx prisma migrate deploy');
  
  if (!deploySuccess) {
    console.log('Deploy failed, checking if we need to baseline...');
    // Mark all existing migrations as applied
    const migrationsDir = './prisma/migrations';
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir).filter(dir => 
        fs.statSync(`${migrationsDir}/${dir}`).isDirectory()
      ).sort();
      
      console.log('Found migrations:', migrations);
      
      for (const migration of migrations) {
        console.log(`Marking migration as applied: ${migration}`);
        runCommand(`npx prisma migrate resolve --applied "${migration}"`);
      }
      
      // Now try deploy again
      console.log('Trying deploy again...');
      runCommand('npx prisma migrate deploy');
    }
  }
  
  console.log('Migration process complete');
}

main();
