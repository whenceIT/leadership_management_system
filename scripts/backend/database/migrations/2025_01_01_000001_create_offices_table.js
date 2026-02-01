/**
 * Migration: Create Offices Table
 * Date: 2025-01-01
 * Description: Creates the offices table for managing office locations
 */

module.exports = {
  /**
   * Run the migration (create table)
   */
  async up(db) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS offices (
        id INT(10) NOT NULL AUTO_INCREMENT,
        name VARCHAR(191) NULL,
        parent_id INT(11) NULL,
        external_id VARCHAR(191) NULL,
        opening_date DATE NULL,
        branch_capacity INT(11) NULL,
        address TEXT NULL,
        phone TEXT NULL,
        email TEXT NULL,
        notes TEXT NULL,
        manager_id INT(11) NULL,
        active TINYINT(4) DEFAULT 1,
        default_office TINYINT(4) DEFAULT 0,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        province_id INT(11) NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableQuery);
    console.log('✓ Created offices table');
  },

  /**
   * Reverse the migration (drop table)
   */
  async down(db) {
    const dropTableQuery = `DROP TABLE IF EXISTS offices`;
    await db.query(dropTableQuery);
    console.log('✓ Dropped offices table');
  }
};
