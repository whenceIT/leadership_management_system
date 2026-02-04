const db = require('../../database/connection');

/**
 * Seed permissions table with initial permissions
 */
async function seedPermissions() {
  try {
    console.log('Seeding permissions table...');

    const permissions = [
      // Users permissions
      { id: 1, parent_id: 0, name: "Users Management", slug: "users.manage", description: "Full access to user management" },
      { id: 2, parent_id: 0, name: "Users View", slug: "users.view", description: "View user information" },
      { id: 3, parent_id: 0, name: "Users Create", slug: "users.create", description: "Create new users" },
      { id: 4, parent_id: 0, name: "Users Edit", slug: "users.edit", description: "Edit user information" },
      { id: 5, parent_id: 0, name: "Users Delete", slug: "users.delete", description: "Delete users" },
      
      // Roles permissions
      { id: 6, parent_id: 0, name: "Roles Management", slug: "roles.manage", description: "Full access to role management" },
      { id: 7, parent_id: 0, name: "Roles View", slug: "roles.view", description: "View roles" },
      { id: 8, parent_id: 0, name: "Roles Create", slug: "roles.create", description: "Create new roles" },
      { id: 9, parent_id: 0, name: "Roles Edit", slug: "roles.edit", description: "Edit roles" },
      { id: 10, parent_id: 0, name: "Roles Delete", slug: "roles.delete", description: "Delete roles" },
      
      // Loans permissions
      { id: 11, parent_id: 0, name: "Loans Management", slug: "loans.manage", description: "Full access to loan management" },
      { id: 12, parent_id: 0, name: "Loans View", slug: "loans.view", description: "View loan information" },
      { id: 13, parent_id: 0, name: "Loans Create", slug: "loans.create", description: "Create new loans" },
      { id: 14, parent_id: 0, name: "Loans Edit", slug: "loans.edit", description: "Edit loan information" },
      { id: 15, parent_id: 0, name: "Loans Delete", slug: "loans.delete", description: "Delete loans" },
      { id: 16, parent_id: 0, name: "Loans Approve", slug: "loans.approve", description: "Approve loan applications" },
      
      // Savings permissions
      { id: 17, parent_id: 0, name: "Savings Management", slug: "savings.manage", description: "Full access to savings management" },
      { id: 18, parent_id: 0, name: "Savings View", slug: "savings.view", description: "View savings information" },
      { id: 19, parent_id: 0, name: "Savings Create", slug: "savings.create", description: "Create new savings accounts" },
      { id: 20, parent_id: 0, name: "Savings Edit", slug: "savings.edit", description: "Edit savings information" },
      { id: 21, parent_id: 0, name: "Savings Delete", slug: "savings.delete", description: "Delete savings accounts" },
      
      // Reports permissions
      { id: 22, parent_id: 0, name: "Reports Management", slug: "reports.manage", description: "Full access to reports" },
      { id: 23, parent_id: 0, name: "Reports View", slug: "reports.view", description: "View reports" },
      { id: 24, parent_id: 0, name: "Reports Export", slug: "reports.export", description: "Export reports" },
      
      // Settings permissions
      { id: 25, parent_id: 0, name: "Settings Management", slug: "settings.manage", description: "Full access to system settings" },
      { id: 26, parent_id: 0, name: "Settings View", slug: "settings.view", description: "View system settings" },
      { id: 27, parent_id: 0, name: "Settings Edit", slug: "settings.edit", description: "Edit system settings" },
      
      // Audit permissions
      { id: 28, parent_id: 0, name: "Audit Trail", slug: "audit.view", description: "View audit trail" },
      
      // Clients permissions
      { id: 29, parent_id: 0, name: "Clients Management", slug: "clients.manage", description: "Full access to client management" },
      { id: 30, parent_id: 0, name: "Clients View", slug: "clients.view", description: "View client information" },
      { id: 31, parent_id: 0, name: "Clients Create", slug: "clients.create", description: "Create new clients" },
      { id: 32, parent_id: 0, name: "Clients Edit", slug: "clients.edit", description: "Edit client information" },
      { id: 33, parent_id: 0, name: "Clients Delete", slug: "clients.delete", description: "Delete clients" },
      
      // Payroll permissions
      { id: 34, parent_id: 0, name: "Payroll Management", slug: "payroll.manage", description: "Full access to payroll" },
      { id: 35, parent_id: 0, name: "Payroll View", slug: "payroll.view", description: "View payroll information" },
      { id: 36, parent_id: 0, name: "Payroll Process", slug: "payroll.process", description: "Process payroll" },
      
      // Assets permissions
      { id: 37, parent_id: 0, name: "Assets Management", slug: "assets.manage", description: "Full access to assets" },
      { id: 38, parent_id: 0, name: "Assets View", slug: "assets.view", description: "View assets" },
      { id: 39, parent_id: 0, name: "Assets Create", slug: "assets.create", description: "Create new assets" },
      { id: 40, parent_id: 0, name: "Assets Edit", slug: "assets.edit", description: "Edit assets" },
      { id: 41, parent_id: 0, name: "Assets Delete", slug: "assets.delete", description: "Delete assets" },
      
      // Leave permissions
      { id: 42, parent_id: 0, name: "Leave Management", slug: "leave.manage", description: "Full access to leave management" },
      { id: 43, parent_id: 0, name: "Leave View", slug: "leave.view", description: "View leave requests" },
      { id: 44, parent_id: 0, name: "Leave Approve", slug: "leave.approve", description: "Approve leave requests" },
      
      // Advances permissions
      { id: 45, parent_id: 0, name: "Advances Management", slug: "advances.manage", description: "Full access to advances" },
      { id: 46, parent_id: 0, name: "Advances View", slug: "advances.view", description: "View advances" },
      { id: 47, parent_id: 0, name: "Advances Approve", slug: "advances.approve", description: "Approve advances" },
      
      // Communication permissions
      { id: 48, parent_id: 0, name: "Communication", slug: "communication.send", description: "Send communications" },
      
      // Policies permissions
      { id: 49, parent_id: 0, name: "Policies Management", slug: "policies.manage", description: "Full access to policies" },
      { id: 50, parent_id: 0, name: "Policies View", slug: "policies.view", description: "View policies" },
    ];

    // Check if permissions already exist
    const existingPermissions = await db.query('SELECT id FROM permissions');
    const existingIds = existingPermissions.map(p => p.id);

    // Insert only non-existing permissions
    for (const permission of permissions) {
      if (!existingIds.includes(permission.id)) {
        await db.insert(
          'INSERT INTO permissions (id, parent_id, name, slug, description) VALUES (?, ?, ?, ?, ?)',
          [permission.id, permission.parent_id, permission.name, permission.slug, permission.description]
        );
        console.log(`✓ Inserted permission: ${permission.name}`);
      } else {
        console.log(`- Permission already exists: ${permission.name}`);
      }
    }

    console.log(`✓ Permissions seeding completed!`);
  } catch (error) {
    console.error('✗ Error seeding permissions:', error);
    throw error;
  }
}

// Run seeder
seedPermissions()
  .then(() => {
    console.log('✓ Permissions seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Permissions seeder failed:', error);
    process.exit(1);
  });
