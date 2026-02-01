const fs = require('fs');
const path = require('path');

console.log('Creating migration and seeder directories...');

// Create migrations directory
const migrationsDir = path.join(__dirname, 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log('✓ Created migrations directory');
} else {
  console.log('✓ Migrations directory already exists');
}

// Create seeders directory
const seedersDir = path.join(__dirname, 'seeders');
if (!fs.existsSync(seedersDir)) {
  fs.mkdirSync(seedersDir, { recursive: true });
  console.log('✓ Created seeders directory');
} else {
  console.log('✓ Seeders directory already exists');
}

console.log('✓ Migration and seeder directories created successfully!');
console.log('\nYou can now create migration and seeder files in the respective directories.');
console.log('Run migrations with: npm run migrate');
console.log('Run migrations with seed: npm run migrate:seed');
console.log('Reset database with: npm run db:reset');
