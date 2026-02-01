// Test database connection and create a test user
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

async function testConnection() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Database connected successfully!');

    // Test query
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Found ${users[0].count} users in database`);

    // Check if test user exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email, first_name, last_name FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('✓ Test user already exists:', existingUsers[0]);
    } else {
      console.log('Creating test user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Insert test user
      const [result] = await connection.execute(
        `INSERT INTO users (first_name, last_name, email, password, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 'Active', NOW(), NOW())`,
        ['Test', 'User', 'test@example.com', hashedPassword]
      );
      
      console.log(`✓ Test user created with ID: ${result.insertId}`);
      console.log('  Email: test@example.com');
      console.log('  Password: password123');
    }

    // Display users table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\nUsers table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });

  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPlease ensure MySQL is running on 127.0.0.1:3306');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nPlease check your database credentials');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase "smart" does not exist. Please create it first.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

testConnection();
