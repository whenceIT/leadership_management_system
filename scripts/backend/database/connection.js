const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

// Connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Execute a query with parameters
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return the first result
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} First result or null
 */
async function queryFirst(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute an INSERT query and return the insert ID
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Insert ID
 */
async function insert(query, params = []) {
  try {
    const [result] = await pool.execute(query, params);
    return result.insertId;
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
}

/**
 * Execute an UPDATE query and return affected rows
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Number of affected rows
 */
async function update(query, params = []) {
  try {
    const [result] = await pool.execute(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

/**
 * Execute a DELETE query and return affected rows
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Number of affected rows
 */
async function remove(query, params = []) {
  try {
    const [result] = await pool.execute(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database delete error:', error);
    throw error;
  }
}

/**
 * Begin a transaction
 * @returns {Promise<Object>} Connection object
 */
async function beginTransaction() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Commit a transaction
 * @param {Object} connection - Connection object
 */
async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

/**
 * Rollback a transaction
 * @param {Object} connection - Connection object
 */
async function rollbackTransaction(connection) {
  await connection.rollback();
  connection.release();
}

/**
 * Close all connections in the pool
 */
async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  queryFirst,
  insert,
  update,
  remove,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  closePool,
};
