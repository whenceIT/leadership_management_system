/**
 * Migration: Create Roles Table
 * Date: 2025-01-01
 * Description: Creates the roles table for managing user roles and permissions
 */

module.exports = {
  /**
   * Run the migration (create table)
   */
  async up(db) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS roles (
        id INT(10) NOT NULL AUTO_INCREMENT,
        slug VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        time_limit TINYINT(4) DEFAULT 0,
        from_time VARCHAR(191) NULL,
        to_time VARCHAR(191) NULL,
        access_days TEXT NULL,
        permissions TEXT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableQuery);
    console.log('✓ Created roles table');
  },

  /**
   * Reverse the migration (drop table)
   */
  async down(db) {
    const dropTableQuery = `DROP TABLE IF EXISTS roles`;
    await db.query(dropTableQuery);
    console.log('✓ Dropped roles table');
  }
};
