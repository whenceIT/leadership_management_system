const fs = require('fs');
const path = require('path');
const db = require('./connection');

/**
 * Migration Runner
 * Handles database migrations similar to Laravel's migration system
 */
class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.seedsPath = path.join(__dirname, 'seeders');
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure migrations and seeders directories exist
   */
  ensureDirectoriesExist() {
    const dirs = [this.migrationsPath, this.seedsPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Get all migration files sorted by timestamp
   * @returns {Array} Array of migration files
   */
  getMigrations() {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    return files;
  }

  /**
   * Get all seeder files sorted by timestamp
   * @returns {Array} Array of seeder files
   */
  getSeeders() {
    if (!fs.existsSync(this.seedsPath)) {
      return [];
    }

    const files = fs.readdirSync(this.seedsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    return files;
  }

  /**
   * Create migrations table if it doesn't exist
   */
  async createMigrationsTable() {
    // Drop existing migrations table to ensure correct structure
    const dropQuery = `DROP TABLE IF EXISTS migrations`;
    await db.query(dropQuery);

    // Create migrations table with correct structure
    const query = `
      CREATE TABLE migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL,
        batch INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await db.query(query);
      console.log('✓ Migrations table created');
    } catch (error) {
      console.error('✗ Error creating migrations table:', error.message);
      throw error;
    }
  }

  /**
   * Get last migration batch number
   * @returns {Promise<number>} Last batch number
   */
  async getLastBatchNumber() {
    const query = 'SELECT MAX(batch) as last_batch FROM migrations';
    const result = await db.queryFirst(query);
    return result ? result.last_batch : 0;
  }

  /**
   * Get list of ran migrations
   * @returns {Promise<Array>} Array of migration names
   */
  async getRanMigrations() {
    const query = 'SELECT migration FROM migrations ORDER BY id ASC';
    const results = await db.query(query);
    return results.map(row => row.migration);
  }

  /**
   * Log migration to database
   * @param {string} migration - Migration file name
   * @param {number} batch - Batch number
   */
  async logMigration(migration, batch) {
    const query = `
      INSERT INTO migrations (migration, batch, created_at)
      VALUES (?, ?, NOW())
    `;
    await db.query(query, [migration, batch]);
    console.log(`✓ Migration logged: ${migration}`);
  }

  /**
   * Run a single migration file
   * @param {string} file - Migration file name
   */
  async runMigration(file) {
    const migrationPath = path.join(this.migrationsPath, file);
    const migration = require(migrationPath);

    console.log(`\nRunning migration: ${file}`);

    try {
      // Run the up migration
      if (typeof migration.up === 'function') {
        await migration.up(db);
      }

      // Log the migration
      await this.logMigration(file.replace('.js', ''), await this.getLastBatchNumber() + 1);

      console.log(`✓ Migration completed: ${file}`);
    } catch (error) {
      console.error(`✗ Migration failed: ${file}`, error.message);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate() {
    console.log('\n========================================');
    console.log('Starting Migration Process');
    console.log('========================================\n');

    try {
      // Ensure migrations table exists
      await this.createMigrationsTable();

      // Get all migration files
      const migrationFiles = this.getMigrations();
      const ranMigrations = await this.getRanMigrations();

      // Filter out migrations that have already run
      const pendingMigrations = migrationFiles.filter(file => {
        const migrationName = file.replace('.js', '');
        return !ranMigrations.includes(migrationName);
      });

      if (pendingMigrations.length === 0) {
        console.log('✓ No pending migrations to run');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migration(s):`);
      pendingMigrations.forEach(file => console.log(`  - ${file}`));

      // Get next batch number
      const batch = await this.getLastBatchNumber() + 1;

      // Run each pending migration
      for (const file of pendingMigrations) {
        await this.runMigration(file);
      }

      console.log('\n========================================');
      console.log('Migration Process Completed');
      console.log('========================================\n');
    } catch (error) {
      console.error('\n✗ Migration process failed:', error.message);
      throw error;
    }
  }

  /**
   * Run migrations fresh (drop all tables and re-run)
   */
  async migrateFresh() {
    console.log('\n========================================');
    console.log('Starting Fresh Migration Process');
    console.log('========================================\n');

    try {
      // Get all tables except migrations
      const tables = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'smart' 
        AND TABLE_NAME != 'migrations'
      `);

      // Drop all tables
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        await db.query(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`✓ Dropped table: ${tableName}`);
      }

      // Re-run migrations
      await this.migrate();
    } catch (error) {
      console.error('\n✗ Fresh migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Run a single seeder file
   * @param {string} file - Seeder file name
   */
  async runSeeder(file) {
    const seederPath = path.join(this.seedsPath, file);
    const seeder = require(seederPath);

    console.log(`\nRunning seeder: ${file}`);

    try {
      // Run the seeder
      if (typeof seeder === 'function') {
        await seeder(db);
      }

      console.log(`✓ Seeder completed: ${file}`);
    } catch (error) {
      console.error(`✗ Seeder failed: ${file}`, error.message);
      throw error;
    }
  }

  /**
   * Run all seeders
   */
  async seed() {
    console.log('\n========================================');
    console.log('Starting Seeding Process');
    console.log('========================================\n');

    try {
      // Get all seeder files
      const seederFiles = this.getSeeders();

      if (seederFiles.length === 0) {
        console.log('✓ No seeders to run');
        return;
      }

      console.log(`Found ${seederFiles.length} seeder(s):`);
      seederFiles.forEach(file => console.log(`  - ${file}`));

      // Run each seeder
      for (const file of seederFiles) {
        await this.runSeeder(file);
      }

      console.log('\n========================================');
      console.log('Seeding Process Completed');
      console.log('========================================\n');
    } catch (error) {
      console.error('\n✗ Seeding process failed:', error.message);
      throw error;
    }
  }

  /**
   * Reset database (drop all tables and re-run migrations with seed)
   */
  async reset() {
    console.log('\n========================================');
    console.log('Starting Database Reset Process');
    console.log('========================================\n');

    try {
      // Run fresh migration
      await this.migrateFresh();

      // Run seeders
      await this.seed();
    } catch (error) {
      console.error('\n✗ Database reset failed:', error.message);
      throw error;
    }
  }
}

module.exports = MigrationRunner;
