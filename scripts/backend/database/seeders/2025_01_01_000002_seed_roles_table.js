/**
 * Seeder: Seed Roles Table
 * Date: 2025-01-01
 * Description: Seeds the roles table with initial data
 */

module.exports = {
  /**
   * Run the seeder (insert data)
   */
  async up(db) {
    const roles = [
      {
        slug: 'super-admin',
        name: 'Super Admin',
        time_limit: 0,
        from_time: null,
        to_time: null,
        access_days: null,
        permissions: JSON.stringify(['*'])
      },
      {
        slug: 'admin',
        name: 'Admin',
        time_limit: 0,
        from_time: null,
        to_time: null,
        access_days: null,
        permissions: JSON.stringify([
          'users.view',
          'users.create',
          'users.edit',
          'users.delete',
          'roles.view',
          'roles.create',
          'roles.edit',
          'roles.delete',
          'offices.view',
          'offices.create',
          'offices.edit',
          'offices.delete',
          'clients.view',
          'clients.create',
          'clients.edit',
          'clients.delete',
          'loans.view',
          'loans.create',
          'loans.edit',
          'loans.delete',
          'reports.view',
          'reports.create',
          'reports.delete'
        ])
      },
      {
        slug: 'manager',
        name: 'Manager',
        time_limit: 0,
        from_time: null,
        to_time: null,
        access_days: null,
        permissions: JSON.stringify([
          'users.view',
          'users.create',
          'users.edit',
          'clients.view',
          'clients.create',
          'clients.edit',
          'loans.view',
          'loans.create',
          'loans.edit',
          'reports.view'
        ])
      },
      {
        slug: 'loan-officer',
        name: 'Loan Officer',
        time_limit: 0,
        from_time: null,
        to_time: null,
        access_days: null,
        permissions: JSON.stringify([
          'clients.view',
          'clients.create',
          'clients.edit',
          'loans.view',
          'loans.create',
          'loans.edit',
          'reports.view'
        ])
      },
      {
        slug: 'staff',
        name: 'Staff',
        time_limit: 0,
        from_time: null,
        to_time: null,
        access_days: null,
        permissions: JSON.stringify([
          'clients.view',
          'loans.view',
          'reports.view'
        ])
      }
    ];

    for (const role of roles) {
      const insertQuery = `
        INSERT INTO roles (
          slug, name, time_limit, from_time, to_time, access_days, permissions
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(insertQuery, [
        role.slug,
        role.name,
        role.time_limit,
        role.from_time,
        role.to_time,
        role.access_days,
        role.permissions
      ]);
    }

    console.log(`✓ Seeded ${roles.length} roles`);
  },

  /**
   * Reverse the seeder (delete data)
   */
  async down(db) {
    const deleteQuery = `DELETE FROM roles WHERE id <= 5`;
    await db.query(deleteQuery);
    console.log('✓ Removed seeded roles');
  }
};
