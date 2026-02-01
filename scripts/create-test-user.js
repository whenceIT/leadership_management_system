// Create specific test user for login testing
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'smart',
  waitForConnections: true,
  connectionLimit: 10,
};

async function createTestUser() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Database connected successfully!');

    const testUser = {
      first_name: 'Fejane',
      last_name: 'F',
      email: 'fejanef@mailinator.com',
      password: 'Pa$$w0rd!'
    };

    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email, first_name, last_name FROM users WHERE email = ?',
      [testUser.email]
    );

    if (existingUsers.length > 0) {
      console.log('✓ User already exists:', existingUsers[0]);
      
      // Update password
      console.log('Updating password...');
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await connection.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
        [hashedPassword, testUser.email]
      );
      console.log('✓ Password updated successfully');
    } else {
      console.log('Creating new user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      // Insert user
      const [result] = await connection.execute(
        `INSERT INTO users (first_name, last_name, email, password, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 'Active', NOW(), NOW())`,
        [testUser.first_name, testUser.last_name, testUser.email, hashedPassword]
      );
      
      console.log(`✓ User created successfully with ID: ${result.insertId}`);
    }

    // Verify user can login
    console.log('\nVerifying login credentials...');
    const [users] = await connection.execute(
      'SELECT id, email, password, first_name, last_name, status FROM users WHERE email = ?',
      [testUser.email]
    );

    if (users.length > 0) {
      const user = users[0];
      const isMatch = await bcrypt.compare(testUser.password, user.password);
      
      if (isMatch) {
        console.log('✓ Login credentials verified successfully!');
        console.log('\nUser Details:');
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.first_name} ${user.last_name}`);
        console.log(`  Status: ${user.status}`);
      } else {
        console.log('✗ Password verification failed!');
      }
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

createTestUser();
