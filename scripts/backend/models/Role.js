const BaseModel = require('./BaseModel');

/**
 * Role Model
 * Handles role-related database operations
 */
class Role extends BaseModel {
  constructor() {
    super('roles');
  }

  /**
   * Get all roles with user count
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of roles
   */
  async getAllWithUserCount(options = {}) {
    const { limit = 50, offset = 0, search = '' } = options;

    let query = `
      SELECT 
        r.id,
        r.name,
        r.slug,
        r.time_limit,
        r.from_time,
        r.to_time,
        r.access_days,
        r.permissions,
        r.created_at,
        r.updated_at,
        COUNT(ru.user_id) as user_count
      FROM ${this.tableName} r
      LEFT JOIN role_users ru ON r.id = ru.role_id
    `;

    const params = [];

    if (search) {
      query += ` WHERE r.name LIKE ? OR r.slug LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    query += ` GROUP BY r.id ORDER BY r.name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const db = require('../database/connection');
    return await db.query(query, params);
  }

  /**
   * Get role by slug
   * @param {string} slug - Role slug
   * @returns {Promise<Object|null>} Role or null
   */
  async findBySlug(slug) {
    return await this.findBy('slug', slug);
  }

  /**
   * Get role with users
   * @param {number} roleId - Role ID
   * @returns {Promise<Object|null>} Role with users
   */
  async findByIdWithUsers(roleId) {
    const db = require('../database/connection');
    
    const role = await this.findById(roleId);
    if (!role) return null;

    // Get users with this role
    const usersQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.status
      FROM users u
      INNER JOIN role_users ru ON u.id = ru.user_id
      WHERE ru.role_id = ?
      ORDER BY u.first_name ASC
    `;
    const users = await db.query(usersQuery, [roleId]);

    return {
      ...role,
      users,
    };
  }

  /**
   * Count roles
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Count
   */
  async countRoles(filters = {}) {
    const { search = '' } = filters;

    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];

    if (search) {
      query += ` WHERE name LIKE ? OR slug LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const db = require('../database/connection');
    const result = await db.queryFirst(query, params);
    return result ? result.count : 0;
  }

  /**
   * Assign role to user
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<number>} Insert ID
   */
  async assignToUser(userId, roleId) {
    const db = require('../database/connection');
    
    // Check if assignment already exists
    const existing = await db.queryFirst(
      'SELECT id FROM role_users WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );

    if (existing) {
      return existing.id;
    }

    const query = `
      INSERT INTO role_users (user_id, role_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `;
    return await db.insert(query, [userId, roleId]);
  }

  /**
   * Remove role from user
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<number>} Affected rows
   */
  async removeFromUser(userId, roleId) {
    const db = require('../database/connection');
    const query = `DELETE FROM role_users WHERE user_id = ? AND role_id = ?`;
    return await db.remove(query, [userId, roleId]);
  }

  /**
   * Update role permissions
   * @param {number} roleId - Role ID
   * @param {string} permissions - JSON string of permissions
   * @returns {Promise<number>} Affected rows
   */
  async updatePermissions(roleId, permissions) {
    const db = require('../database/connection');
    const query = `
      UPDATE ${this.tableName}
      SET permissions = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    return await db.update(query, [permissions, roleId]);
  }

  /**
   * Get all permissions for a role
   * @param {number} roleId - Role ID
   * @returns {Promise<Array>} Array of permissions
   */
  async getPermissions(roleId) {
    const db = require('../database/connection');
    const query = `SELECT permissions FROM ${this.tableName} WHERE id = ?`;
    const result = await db.queryFirst(query, [roleId]);
    
    if (!result || !result.permissions) {
      return [];
    }

    try {
      return JSON.parse(result.permissions);
    } catch (error) {
      console.error('Error parsing permissions:', error);
      return [];
    }
  }
}

module.exports = Role;
