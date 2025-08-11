const { pool } = require('../src/db/pool');

(async () => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS db');
    console.log('DB OK:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR:', err.message);
    process.exit(1);
  }
})();
