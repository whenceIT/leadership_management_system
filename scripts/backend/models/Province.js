const BaseModel = require('./BaseModel');

/**
 * Province Model
 * Handles province-related database operations
 */
class Province extends BaseModel {
  constructor() {
    super('province');
  }

  /**
   * Get all provinces
   * @returns {Promise<Array>} Array of provinces
   */
  async getAll() {
    const db = require('../database/connection');
    const query = `
      SELECT id, name, created_at, updated_at
      FROM ${this.tableName}
      ORDER BY name ASC
    `;
    return await db.query(query);
  }

  /**
   * Get province by ID
   * @param {number} provinceId - Province ID
   * @returns {Promise<Object|null>} Province or null
   */
  async findById(provinceId) {
    const db = require('../database/connection');
    const query = `
      SELECT id, name, created_at, updated_at
      FROM ${this.tableName}
      WHERE id = ?
    `;
    return await db.queryFirst(query, [provinceId]);
  }
}

module.exports = Province;