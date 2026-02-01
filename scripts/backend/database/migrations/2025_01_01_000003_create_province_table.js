/**
 * Migration: Create Province Table
 * Date: 2025-01-01
 * Description: Creates the province table for managing provinces
 */

module.exports = {
  /**
   * Run the migration (create table)
   */
  async up(db) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS province (
        id INT(10) NOT NULL AUTO_INCREMENT,
        name VARCHAR(191) NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableQuery);
    console.log('✓ Created province table');
  },

  /**
   * Reverse the migration (drop table)
   */
  async down(db) {
    const dropTableQuery = `DROP TABLE IF EXISTS province`;
    await db.query(dropTableQuery);
    console.log('✓ Dropped province table');
  }
};
