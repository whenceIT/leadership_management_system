const db = require('../database/connection');

/**
 * Base Model Class
 * Provides common CRUD operations for all models
 */
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Get all records
   * @param {Object} options - Query options (where, orderBy, limit, offset)
   * @returns {Promise<Array>} Array of records
   */
  async findAll(options = {}) {
    let query = `SELECT * FROM ${this.tableName}`;
    const params = [];

    if (options.where) {
      const conditions = [];
      for (const [key, value] of Object.entries(options.where)) {
        if (Array.isArray(value)) {
          conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
          params.push(...value);
        } else if (value === null) {
          conditions.push(`${key} IS NULL`);
        } else {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
      if (options.order) {
        query += ` ${options.order}`;
      }
    }

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    return await db.query(query, params);
  }

  /**
   * Find a record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Record or null
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    return await db.queryFirst(query, [id]);
  }

  /**
   * Find a record by a specific field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {Promise<Object|null>} Record or null
   */
  async findBy(field, value) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = ?`;
    return await db.queryFirst(query, [value]);
  }

  /**
   * Find multiple records by a specific field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {Promise<Array>} Array of records
   */
  async findManyBy(field, value) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = ?`;
    return await db.query(query, [value]);
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<number>} Insert ID
   */
  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
    `;

    return await db.insert(query, values);
  }

  /**
   * Update a record by ID
   * @param {number} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of affected rows
   */
  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = ?
    `;

    return await db.update(query, [...values, id]);
  }

  /**
   * Update records by condition
   * @param {Object} where - Where conditions
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of affected rows
   */
  async updateWhere(where, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const conditions = [];
    for (const [key, value] of Object.entries(where)) {
      conditions.push(`${key} = ?`);
      values.push(value);
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE ${conditions.join(' AND ')}
    `;

    return await db.update(query, values);
  }

  /**
   * Delete a record by ID
   * @param {number} id - Record ID
   * @returns {Promise<number>} Number of affected rows
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return await db.remove(query, [id]);
  }

  /**
   * Count records
   * @param {Object} where - Where conditions
   * @returns {Promise<number>} Count of records
   */
  async count(where = {}) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];

    if (Object.keys(where).length > 0) {
      const conditions = [];
      for (const [key, value] of Object.entries(where)) {
        if (Array.isArray(value)) {
          conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
          params.push(...value);
        } else if (value === null) {
          conditions.push(`${key} IS NULL`);
        } else {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    const result = await db.queryFirst(query, params);
    return result ? result.count : 0;
  }

  /**
   * Check if a record exists
   * @param {Object} where - Where conditions
   * @returns {Promise<boolean>} True if exists
   */
  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }
}

module.exports = BaseModel;
