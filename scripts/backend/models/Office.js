const BaseModel = require('./BaseModel');

/**
 * Office Model
 * Handles office-related database operations
 */
class Office extends BaseModel {
  constructor() {
    super('offices');
  }

  /**
   * Get all active offices
   * @returns {Promise<Array>} Array of offices
   */
  async getActiveOffices() {
    const db = require('../database/connection');
    const query = `
      SELECT id, name, parent_id, address, phone, email, active, default_office
      FROM ${this.tableName}
      WHERE active = 1 AND deleted_at IS NULL
      ORDER BY name ASC
    `;
    return await db.query(query);
  }

  /**
   * Get office by ID
   * @param {number} officeId - Office ID
   * @returns {Promise<Object|null>} Office or null
   */
  async findById(officeId) {
    const db = require('../database/connection');
    const query = `
      SELECT id, name, parent_id, address, phone, email, active, default_office
      FROM ${this.tableName}
      WHERE id = ? AND deleted_at IS NULL
    `;
    return await db.queryFirst(query, [officeId]);
  }
}

module.exports = Office;
