const BaseModel = require('./BaseModel');

/**
 * Client Model
 * Handles client-related database operations
 */
class Client extends BaseModel {
  constructor() {
    super('clients');
  }

  /**
   * Get all clients with user accounts
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of clients
   */
  async getClientsWithUsers(options = {}) {
    const { limit = 50, offset = 0, search = '', clientType = null, status = null, officeId = null } = options;

    let query = `
      SELECT 
        c.id,
        c.account_no,
        c.first_name,
        c.last_name,
        c.full_name,
        c.email,
        c.phone,
        c.mobile,
        c.gender,
        c.client_type,
        c.status,
        c.joined_date,
        c.office_id,
        o.name as office_name,
        c.user_id,
        u.email as user_email,
        u.status as user_status,
        c.created_at,
        c.updated_at
      FROM ${this.tableName} c
      LEFT JOIN offices o ON c.office_id = o.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.isclient = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.full_name LIKE ? OR c.account_no LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (clientType) {
      query += ` AND c.client_type = ?`;
      params.push(clientType);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (officeId) {
      query += ` AND c.office_id = ?`;
      params.push(officeId);
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const db = require('../database/connection');
    return await db.query(query, params);
  }

  /**
   * Get client by account number
   * @param {string} accountNo - Client account number
   * @returns {Promise<Object|null>} Client or null
   */
  async findByAccountNo(accountNo) {
    return await this.findBy('account_no', accountNo);
  }

  /**
   * Get client with user account
   * @param {number} clientId - Client ID
   * @returns {Promise<Object|null>} Client with user
   */
  async findByIdWithUser(clientId) {
    const db = require('../database/connection');
    
    const client = await this.findById(clientId);
    if (!client) return null;

    // Get user account linked to this client
    const userQuery = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.status
      FROM users u
      WHERE u.id = ?
    `;
    const user = client.user_id ? await db.queryFirst(userQuery, [client.user_id]) : null;

    return {
      ...client,
      user,
    };
  }

  /**
   * Count clients
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Count
   */
  async countClients(filters = {}) {
    const { search = '', clientType = null, status = null, officeId = null } = filters;

    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE isclient = 1`;
    const params = [];

    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR full_name LIKE ? OR account_no LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (clientType) {
      query += ` AND client_type = ?`;
      params.push(clientType);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
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
   * Link user to client
   * @param {number} clientId - Client ID
   * @param {number} userId - User ID
   * @param {number} createdBy - User ID creating the link
   * @returns {Promise<number>} Insert ID
   */
  async linkUser(clientId, userId, createdBy) {
    const db = require('../database/connection');
    
    // Check if link already exists
    const existing = await db.queryFirst(
      'SELECT id FROM client_users WHERE client_id = ? AND user_id = ?',
      [clientId, userId]
    );

    if (existing) {
      return existing.id;
    }

    const query = `
      INSERT INTO client_users (client_id, user_id, created_by_id, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    return await db.insert(query, [clientId, userId, createdBy]);
  }

  /**
   * Unlink user from client
   * @param {number} clientId - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<number>} Affected rows
   */
  async unlinkUser(clientId, userId) {
    const db = require('../database/connection');
    const query = `DELETE FROM client_users WHERE client_id = ? AND user_id = ?`;
    return await db.remove(query, [clientId, userId]);
  }

  /**
   * Get client users (clients with user accounts)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of client users
   */
  async getClientUsers(options = {}) {
    const { limit = 50, offset = 0, search = '', clientType = null, status = null } = options;

    let query = `
      SELECT 
        cu.id as client_user_id,
        cu.created_at as linked_at,
        c.id as client_id,
        c.account_no,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.full_name as client_full_name,
        c.client_type,
        c.status as client_status,
        c.office_id,
        o.name as office_name,
        u.id as user_id,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.status as user_status
      FROM client_users cu
      INNER JOIN clients c ON cu.client_id = c.id
      INNER JOIN users u ON cu.user_id = u.id
      LEFT JOIN offices o ON c.office_id = o.id
      WHERE c.isclient = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.full_name LIKE ? OR c.account_no LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (clientType) {
      query += ` AND c.client_type = ?`;
      params.push(clientType);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY cu.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const db = require('../database/connection');
    return await db.query(query, params);
  }

  /**
   * Count client users
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Count
   */
  async countClientUsers(filters = {}) {
    const { search = '', clientType = null, status = null } = filters;

    let query = `
      SELECT COUNT(*) as count 
      FROM client_users cu
      INNER JOIN clients c ON cu.client_id = c.id
      INNER JOIN users u ON cu.user_id = u.id
      WHERE c.isclient = 1
    `;
    const params = [];

    if (search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.full_name LIKE ? OR c.account_no LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (clientType) {
      query += ` AND c.client_type = ?`;
      params.push(clientType);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    const db = require('../database/connection');
    const result = await db.queryFirst(query, params);
    return result ? result.count : 0;
  }
}

module.exports = Client;
