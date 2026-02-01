const BaseModel = require('./BaseModel');

/**
 * RoleUser Model
 * Manages user-role relationships
 */
class RoleUser extends BaseModel {
  constructor() {
    super('role_users');
  }

  /**
   * Get all role-user assignments
   * @returns {Promise<Array>} Array of role-user assignments
   */
  async getAll() {
    const db = require('../database/connection');
    const query = `
      SELECT ru.*, u.first_name, u.last_name, u.email, r.name as role_name
      FROM ${this.tableName} ru
      LEFT JOIN users u ON ru.user_id = u.id
      LEFT JOIN roles r ON ru.role_id = r.id
      ORDER BY ru.created_at DESC
    `;
    return await db.query(query);
  }

  /**
   * Get role-user assignment by ID
   * @param {number} id - RoleUser ID
   * @returns {Promise<Object|null>} RoleUser object or null
   */
  async findById(id) {
    const db = require('../database/connection');
    const query = `
      SELECT ru.*, u.first_name, u.last_name, u.email, r.name as role_name
      FROM ${this.tableName} ru
      LEFT JOIN users u ON ru.user_id = u.id
      LEFT JOIN roles r ON ru.role_id = r.id
      WHERE ru.id = ?
    `;
    const result = await db.queryFirst(query, [id]);
    return result;
  }

  /**
   * Get roles assigned to a specific user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of user's roles
   */
  async getRolesByUserId(userId) {
    const db = require('../database/connection');
    const query = `
      SELECT r.*, ru.id as role_user_id
      FROM ${this.tableName} ru
      INNER JOIN roles r ON ru.role_id = r.id
      WHERE ru.user_id = ?
      ORDER BY r.name ASC
    `;
    return await db.query(query, [userId]);
  }

  /**
   * Get users assigned to a specific role
   * @param {number} roleId - Role ID
   * @returns {Promise<Array>} Array of role's users
   */
  async getUsersByRoleId(roleId) {
    const db = require('../database/connection');
    const query = `
      SELECT u.*, ru.id as role_user_id
      FROM ${this.tableName} ru
      INNER JOIN users u ON ru.user_id = u.id
      WHERE ru.role_id = ?
      ORDER BY u.first_name ASC
    `;
    return await db.query(query, [roleId]);
  }

  /**
   * Create a new role-user assignment
   * @param {Object} data - RoleUser data
   * @returns {Promise<number>} Insert ID
   */
  async create(data) {
    const db = require('../database/connection');
    const query = `
      INSERT INTO ${this.tableName} (user_id, role_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `;
    const result = await db.insert(query, [data.user_id, data.role_id]);
    return result;
  }

  /**
   * Update a role-user assignment
   * @param {number} id - RoleUser ID
   * @param {Object} data - Updated data
   * @returns {Promise<number>} Number of affected rows
   */
  async update(id, data) {
    const db = require('../database/connection');
    const query = `
      UPDATE ${this.tableName}
      SET user_id = ?, role_id = ?, updated_at = NOW()
      WHERE id = ?
    `;
    return await db.update(query, [data.user_id, data.role_id, id]);
  }

  /**
   * Delete a role-user assignment
   * @param {number} id - RoleUser ID
   * @returns {Promise<number>} Number of affected rows
   */
  async delete(id) {
    const db = require('../database/connection');
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return await db.remove(query, [id]);
  }

  /**
   * Delete all role assignments for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Number of affected rows
   */
  async deleteByUserId(userId) {
    const db = require('../database/connection');
    const query = `DELETE FROM ${this.tableName} WHERE user_id = ?`;
    return await db.remove(query, [userId]);
  }

  /**
   * Delete all user assignments for a role
   * @param {number} roleId - Role ID
   * @returns {Promise<number>} Number of affected rows
   */
  async deleteByRoleId(roleId) {
    const db = require('../database/connection');
    const query = `DELETE FROM ${this.tableName} WHERE role_id = ?`;
    return await db.remove(query, [roleId]);
  }

  /**
   * Check if a user has a specific role
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<boolean>} True if user has role
   */
  async hasRole(userId, roleId) {
    const db = require('../database/connection');
    const query = `
      SELECT COUNT(*) as count
      FROM ${this.tableName}
      WHERE user_id = ? AND role_id = ?
    `;
    const result = await db.queryFirst(query, [userId, roleId]);
    return result && result.count > 0;
  }
}

module.exports = RoleUser;
