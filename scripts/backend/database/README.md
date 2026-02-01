# Database Migration and Seeding System

A Laravel-like migration and seeding system for managing database schema changes and populating initial data.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Naming Conventions](#naming-conventions)
- [Available Commands](#available-commands)
- [Creating Migrations](#creating-migrations)
- [Creating Seeders](#creating-seeders)
- [Migration File Structure](#migration-file-structure)
- [Seeder File Structure](#seeder-file-structure)
- [Troubleshooting](#troubleshooting)

## Overview

This migration system provides:
- **Version Control**: Track database schema changes over time
- **Rollback Capability**: Revert migrations if needed
- **Batch Management**: Group migrations together
- **Seeding**: Populate tables with initial data
- **Cross-Platform**: Works on Windows, Linux, and macOS

## Directory Structure

```
scripts/backend/database/
├── migrations/           # Migration files
│   ├── 2025_01_01_000001_create_offices_table.js
│   ├── 2025_01_01_000002_create_roles_table.js
│   └── ...
├── seeders/             # Seeder files
│   ├── 2025_01_01_000001_seed_offices_table.js
│   ├── 2025_01_01_000002_seed_roles_table.js
│   └── ...
├── MigrationRunner.js    # Main migration runner
├── setup.js            # Directory setup script
└── README.md           # This file
```

## Naming Conventions

### Migration Files

Format: `YYYY_MM_DD_HHMMSS_description.js`

Example: `2025_01_01_000001_create_offices_table.js`

- **YYYY**: Year (4 digits)
- **MM**: Month (2 digits)
- **DD**: Day (2 digits)
- **HHMMSS**: Time (6 digits)
- **description**: Snake_case description of the migration

### Seeder Files

Format: `YYYY_MM_DD_HHMMSS_seed_table_name.js`

Example: `2025_01_01_000001_seed_offices_table.js`

## Available Commands

All commands should be run from the `scripts/backend` directory.

### Run Migrations

```bash
npm run migrate
```

Runs all pending migrations in order.

### Fresh Migration with Seed

```bash
npm run migrate:fresh --seed
```

Drops all tables, runs all migrations, and runs all seeders.

### Run Seeders

```bash
npm run db:seed
```

Runs all pending seeders.

### Reset Database

```bash
npm run db:reset
```

Rolls back all migrations and re-runs them.

### Setup Directories

```bash
node database/setup.js
```

Creates the migrations and seeders directories if they don't exist.

## Creating Migrations

### Manual Creation

1. Create a new file in the `migrations/` directory
2. Follow the naming convention: `YYYY_MM_DD_HHMMSS_description.js`
3. Export an object with `up()` and `down()` methods

### Example Migration

```javascript
/**
 * Migration: Create Users Table
 * Date: 2025-01-01
 * Description: Creates the users table for managing user accounts
 */

module.exports = {
  /**
   * Run the migration (create table)
   */
  async up(db) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT(10) NOT NULL AUTO_INCREMENT,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(191) NOT NULL,
        first_name VARCHAR(191) NULL,
        last_name VARCHAR(191) NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableQuery);
    console.log('✓ Created users table');
  },

  /**
   * Reverse the migration (drop table)
   */
  async down(db) {
    const dropTableQuery = `DROP TABLE IF EXISTS users`;
    await db.query(dropTableQuery);
    console.log('✓ Dropped users table');
  }
};
```

## Creating Seeders

### Manual Creation

1. Create a new file in the `seeders/` directory
2. Follow the naming convention: `YYYY_MM_DD_HHMMSS_seed_table_name.js`
3. Export an object with `up()` and `down()` methods

### Example Seeder

```javascript
/**
 * Seeder: Seed Users Table
 * Date: 2025-01-01
 * Description: Seeds the users table with initial data
 */

module.exports = {
  /**
   * Run the seeder (insert data)
   */
  async up(db) {
    const users = [
      {
        email: 'admin@example.com',
        password: '$2b$10$...', // Hashed password
        first_name: 'Admin',
        last_name: 'User',
        status: 'Active'
      },
      {
        email: 'user@example.com',
        password: '$2b$10$...', // Hashed password
        first_name: 'Regular',
        last_name: 'User',
        status: 'Active'
      }
    ];

    for (const user of users) {
      const insertQuery = `
        INSERT INTO users (email, password, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `;

      await db.query(insertQuery, [
        user.email,
        user.password,
        user.first_name,
        user.last_name,
        user.status
      ]);
    }

    console.log(`✓ Seeded ${users.length} users`);
  },

  /**
   * Reverse the seeder (delete data)
   */
  async down(db) {
    const deleteQuery = `DELETE FROM users WHERE id <= 2`;
    await db.query(deleteQuery);
    console.log('✓ Removed seeded users');
  }
};
```

## Migration File Structure

Each migration file must export an object with two methods:

### `up(db)`

- **Purpose**: Apply the migration (create/modify tables)
- **Parameters**: `db` - Database connection object
- **Returns**: Promise
- **Required**: Yes

### `down(db)`

- **Purpose**: Reverse the migration (drop/revert tables)
- **Parameters**: `db` - Database connection object
- **Returns**: Promise
- **Required**: Yes

## Seeder File Structure

Each seeder file must export an object with two methods:

### `up(db)`

- **Purpose**: Insert seed data into tables
- **Parameters**: `db` - Database connection object
- **Returns**: Promise
- **Required**: Yes

### `down(db)`

- **Purpose**: Remove seeded data from tables
- **Parameters**: `db` - Database connection object
- **Returns**: Promise
- **Required**: Yes

## Troubleshooting

### Migration Already Run

If you see "Migration already ran" message:
- The migration is already recorded in the `migrations` table
- To re-run, first rollback the migration or use `npm run db:reset`

### Database Connection Error

If you see database connection errors:
1. Check your `.env` file has correct database credentials
2. Ensure MySQL server is running
3. Verify database exists

### Permission Denied

If you see permission errors:
1. Ensure you have write permissions to the database
2. Check MySQL user has necessary privileges

### Migration Order

Migrations run in alphabetical order by filename. To control order:
- Use proper timestamp format in filenames
- Earlier timestamps run first

### Windows Path Issues

On Windows, if you encounter path issues:
1. Use forward slashes `/` instead of backslashes `\` in file paths
2. Run commands from the `scripts/backend` directory
3. Use `node database/setup.js` to create directories

## Best Practices

1. **Always create a down() method**: Ensure migrations can be rolled back
2. **Use descriptive names**: Make migration names clear and specific
3. **Test migrations**: Run migrations on a test database first
4. **Keep migrations small**: One logical change per migration
5. **Version control**: Commit migration files with your code
6. **Document changes**: Add comments explaining what the migration does
7. **Use transactions**: For complex migrations, consider using transactions

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js MySQL2](https://github.com/sidorares/node-mysql2)
- [Laravel Migrations](https://laravel.com/docs/migrations) (Inspiration)
