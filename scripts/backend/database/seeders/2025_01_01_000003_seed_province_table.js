/**
 * Seeder: Seed Province Table
 * Date: 2025-01-01
 * Description: Seeds the province table with Zambian provinces
 */

module.exports = {
  /**
   * Run the seeder (insert data)
   */
  async up(db) {
    const provinces = [
      { name: 'Central Province' },
      { name: 'Copperbelt Province' },
      { name: 'Eastern Province' },
      { name: 'Luapula Province' },
      { name: 'Lusaka Province' },
      { name: 'Muchinga Province' },
      { name: 'North-Western Province' },
      { name: 'Northern Province' },
      { name: 'Southern Province' },
      { name: 'Western Province' }
    ];

    for (const province of provinces) {
      const insertQuery = `
        INSERT INTO province (name) VALUES (?)
      `;

      await db.query(insertQuery, [province.name]);
    }

    console.log(`✓ Seeded ${provinces.length} provinces`);
  },

  /**
   * Reverse the seeder (delete data)
   */
  async down(db) {
    const deleteQuery = `DELETE FROM province WHERE id <= 10`;
    await db.query(deleteQuery);
    console.log('✓ Removed seeded provinces');
  }
};
