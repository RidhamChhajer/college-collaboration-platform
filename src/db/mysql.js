const mysql = require('mysql2/promise');
require('dotenv').config();

let connection;

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

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
