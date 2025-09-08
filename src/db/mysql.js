const mysql = require('mysql2/promise');
require('dotenv').config();

let connection;

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'college_collab_platform',
  port: process.env.DB_PORT || 3306,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

console.log("🔌 Database Configuration:", {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port
});

async function connect() {
  try {
    if (!connection || connection.connection._closing) {
      connection = await mysql.createConnection(config);
      console.log('✅ Connected to MySQL database!');
      
      // Test the connection
      await connection.ping();
      console.log('✅ Database connection is healthy');
    }
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function query(sql, params = []) {
  try {
    const conn = await connect();
    const [rows] = await conn.execute(sql, params);
    return [rows];
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (connection) {
    await connection.end();
    console.log('📴 Database connection closed.');
  }
  process.exit(0);
});

module.exports = {
  connect,
  query
};
