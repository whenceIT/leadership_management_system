const BaseModel = require('./BaseModel');

/**
 * User Model
 * Handles user-related database operations
 */
class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Get all active users with office and role information
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users
   */
  async getActiveUsers(options = {}) {
    const { limit = 50, offset = 0, search = '', officeId = null } = options;

    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.gender,
        u.status,
        u.last_login,
        u.office_id,
        o.name as office_name,
        u.enable_google2fa,
        u.blocked,
        u.created_at,
        u.updated_at
      FROM ${this.tableName} u
      LEFT JOIN offices o ON u.office_id = o.id
      WHERE u.status = 'Active'
    `;

    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (officeId) {
      query += ` AND u.office_id = ?`;
      params.push(officeId);
    }

    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const db = require('../database/connection');
    return await db.query(query, params);
  }

  /**
   * Get all inactive users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of inactive users
   */
  async getInactiveUsers(options = {}) {
    const { limit = 50, offset = 0, search = '', officeId = null } = options;

    let query = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.gender,
        u.status,
        u.last_login,
        u.office_id,
        o.name as office_name,
        u.created_at,
        u.updated_at
      FROM ${this.tableName} u
      LEFT JOIN offices o ON u.office_id = o.id
      WHERE u.status = 'Inactive'
    `;

    const params = [];

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (officeId) {
      query += ` AND u.office_id = ?`;
      params.push(officeId);
    }

    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const db = require('../database/connection');
    return await db.query(query, params);
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email) {
    return await this.findBy('email', email);
  }

  /**
   * Get user with roles
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User with roles
   */
  async findByIdWithRoles(userId) {
    const db = require('../database/connection');
    
    const user = await this.findById(userId);
    if (!user) return null;

    // Get user roles
    const rolesQuery = `
      SELECT r.id, r.name, r.slug, r.permissions, r.time_limit, r.from_time, r.to_time, r.access_days
      FROM roles r
      INNER JOIN role_users ru ON r.id = ru.role_id
      WHERE ru.user_id = ?
    `;
    const roles = await db.query(rolesQuery, [userId]);

    return {
      ...user,
      roles,
    };
  }

  /**
   * Count active users
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Count
   */
  async countActive(filters = {}) {
    const { search = '', officeId = null } = filters;

    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE status = 'Active'`;
    const params = [];

    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (officeId) {
      query += ` AND office_id = ?`;
      params.push(officeId);
    }

    const db = require('../database/connection');
    const result = await db.queryFirst(query, params);
    return result ? result.count : 0;
  }

  /**
   * Count inactive users
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Count
   */
  async countInactive(filters = {}) {
    const { search = '', officeId = null } = filters;

    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE status = 'Inactive'`;
    const params = [];

    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (officeId) {
      query += ` AND office_id = ?`;
      params.push(officeId);
    }

    const db = require('../database/connection');
    const result = await db.queryFirst(query, params);
    return result ? result.count : 0;
  }

  /**
   * Deactivate a user
   * @param {number} userId - User ID
   * @param {string} reason - Deactivation reason
   * @param {number} deactivatedBy - User ID who deactivated
   * @returns {Promise<number>} Affected rows
   */
  async deactivate(userId, reason, deactivatedBy) {
    const db = require('../database/connection');
    const query = `
      UPDATE ${this.tableName}
      SET status = 'Inactive',
          updated_at = NOW()
      WHERE id = ?
    `;
    return await db.update(query, [userId]);
  }

  /**
   * Reactivate a user
   * @param {number} userId - User ID
   * @param {number} reactivatedBy - User ID who reactivated
   * @returns {Promise<number>} Affected rows
   */
  async reactivate(userId, reactivatedBy) {
    const db = require('../database/connection');
    const query = `
      UPDATE ${this.tableName}
      SET status = 'Active',
          updated_at = NOW()
      WHERE id = ?
    `;
    return await db.update(query, [userId]);
  }

  /**
   * Update last login
   * @param {number} userId - User ID
   * @returns {Promise<number>} Affected rows
   */
  async updateLastLogin(userId) {
    const db = require('../database/connection');
    const query = `
      UPDATE ${this.tableName}
      SET last_login = NOW(),
          updated_at = NOW()
      WHERE id = ?
    `;
    return await db.update(query, [userId]);
  }

  /**
   * Assign role to user
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<number>} Insert ID
   */
  async assignRole(userId, roleId) {
    const db = require('../database/connection');
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
  async removeRole(userId, roleId) {
    const db = require('../database/connection');
    const query = `DELETE FROM role_users WHERE user_id = ? AND role_id = ?`;
    return await db.remove(query, [userId, roleId]);
  }

  /**
   * Get all user roles
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of roles
   */
  async getUserRoles(userId) {
    const db = require('../database/connection');
    const query = `
      SELECT r.*
      FROM roles r
      INNER JOIN role_users ru ON r.id = ru.role_id
      WHERE ru.user_id = ?
    `;
    return await db.query(query, [userId]);
  }
}

module.exports = User;
