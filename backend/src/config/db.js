const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_SERVER || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pandea_db',
        port: Number(process.env.DB_PORT || 5432),
      }
);

pool.on('error', (err) => {
  console.error('PostgreSQL pool error', err);
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

module.exports = { pool, query };
