const BaseModel = require('./BaseModel');

/**
 * Permission Model
 * Handles permission-related database operations
 */
class Permission extends BaseModel {
  constructor() {
    super('permissions');
  }

  /**
   * Get all permissions
   * @returns {Promise<Array>} Array of permissions
   */
  async getAll() {
    const db = require('../database/connection');
    const query = `
      SELECT 
        id,
        parent_id,
        name,
        slug,
        description
      FROM ${this.tableName}
      ORDER BY id ASC
    `;
    return await db.query(query);
  }

  /**
   * Get permission by ID
   * @param {number} id - Permission ID
   * @returns {Promise<Object|null>} Permission or null
   */
  async findById(id) {
    return await this.findBy('id', id);
  }

  /**
   * Get permission by slug
   * @param {string} slug - Permission slug
   * @returns {Promise<Object|null>} Permission or null
   */
  async findBySlug(slug) {
    return await this.findBy('slug', slug);
  }

  /**
   * Get permissions grouped by category (based on slug prefix)
   * @returns {Promise<Object>} Object with categories as keys
   */
  async getAllGrouped() {
    const permissions = await this.getAll();
    const grouped = {};

    permissions.forEach(permission => {
      // Extract category from slug (e.g., "users.view" -> "users")
      const parts = permission.slug.split('.');
           const category = parts[0] || 'other';

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push({
        id: permission.id,
        name: permission.name,
        slug: permission.slug,
        description: permission.description,
      });
    });

    return grouped;
  }
}

module.exports = Permission;
