require('dotenv').config();
const mysql = require('mysql2/promise');

// A small, reusable pool your app can share
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional: quick self‑test when this file is run directly
if (require.main === module) {
  (async () => {
    const [rows] = await pool.query('SELECT 1 AS ok');
    console.log('Pool OK:', rows[0]);
    process.exit(0);
  })().catch(err => {
    console.error('Pool ERROR:', err.message);
    process.exit(1);
  });
}

module.exports = { pool };
