const MigrationRunner = require('./MigrationRunner');

// Get command from command line arguments
const command = process.argv[2];

// Create migration runner instance
const runner = new MigrationRunner();

// Execute command
(async () => {
  try {
    switch (command) {
      case 'migrate':
        await runner.migrate();
        break;
      case 'migrateFresh':
        await runner.migrateFresh();
        break;
      case 'seed':
        await runner.seed();
        break;
      case 'reset':
        await runner.reset();
        break;
      default:
        console.log('Usage: node migrate.js [command]');
        console.log('Commands:');
        console.log('  migrate      - Run all pending migrations');
        console.log('  migrateFresh - Drop all tables and re-run migrations');
        console.log('  seed         - Run all seeders');
        console.log('  reset        - Reset database (fresh + seed)');
        process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
