/**
 * Seeder: Seed Offices Table
 * Date: 2025-01-01
 * Description: Seeds the offices table with initial data
 */

module.exports = {
  /**
   * Run the seeder (insert data)
   */
  async up(db) {
    const offices = [
      {
        name: 'Head Office',
        parent_id: null,
        external_id: 'HO-001',
        opening_date: '2020-01-01',
        branch_capacity: 100,
        address: '123 Main Street, Lusaka',
        phone: '+260 123 456 789',
        email: 'headoffice@example.com',
        notes: 'Main headquarters',
        manager_id: null,
        active: 1,
        default_office: 1,
        province_id: null
      },
      {
        name: 'Branch Office A',
        parent_id: 1,
        external_id: 'BOA-001',
        opening_date: '2020-06-01',
        branch_capacity: 50,
        address: '456 Branch Road, Kitwe',
        phone: '+260 987 654 321',
        email: 'brancha@example.com',
        notes: 'First branch office',
        manager_id: null,
        active: 1,
        default_office: 0,
        province_id: null
      },
      {
        name: 'Branch Office B',
        parent_id: 1,
        external_id: 'BOB-001',
        opening_date: '2021-01-01',
        branch_capacity: 30,
        address: '789 Street Avenue, Ndola',
        phone: '+260 555 123 456',
        email: 'branchb@example.com',
        notes: 'Second branch office',
        manager_id: null,
        active: 1,
        default_office: 0,
        province_id: null
      }
    ];

    for (const office of offices) {
      const insertQuery = `
        INSERT INTO offices (
          name, parent_id, external_id, opening_date, branch_capacity,
          address, phone, email, notes, manager_id, active, default_office, province_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(insertQuery, [
        office.name,
        office.parent_id,
        office.external_id,
        office.opening_date,
        office.branch_capacity,
        office.address,
        office.phone,
        office.email,
        office.notes,
        office.manager_id,
        office.active,
        office.default_office,
        office.province_id
      ]);
    }

    console.log(`✓ Seeded ${offices.length} offices`);
  },

  /**
   * Reverse the seeder (delete data)
   */
  async down(db) {
    const deleteQuery = `DELETE FROM offices WHERE id <= 3`;
    await db.query(deleteQuery);
    console.log('✓ Removed seeded offices');
  }
};
