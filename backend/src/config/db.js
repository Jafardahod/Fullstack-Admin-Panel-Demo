// backend/src/config/db.js
import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  DB_SSL // 'true' or 'false'
} = process.env;

const ssl = DB_SSL === 'true'
  ? { rejectUnauthorized: false }  // this is fine for managed hosts like Railway
  : undefined;

const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'assignment_app',
  port: DB_PORT ? Number(DB_PORT) : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl
});

export default pool;
