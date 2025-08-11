require('dotenv').config();
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PASS_present: typeof process.env.DB_PASS === 'string' && process.env.DB_PASS.length > 0
});
