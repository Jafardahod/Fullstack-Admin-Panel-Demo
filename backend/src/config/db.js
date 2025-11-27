// backend/src/config/db.js
import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  DB_SSL, // 'true' or 'false'
} = process.env;

console.log("🔌 MySQL Config:");
console.log("DB_HOST:", DB_HOST);
console.log("DB_PORT:", DB_PORT);
console.log("DB_USER:", DB_USER);
console.log("DB_NAME:", DB_NAME);
console.log("DB_SSL:", DB_SSL);

const ssl =
  DB_SSL === "true"
    ? { rejectUnauthorized: false } // Required for Railway
    : undefined;

const pool = mysql.createPool({
  host: DB_HOST || "localhost",
  user: DB_USER || "root",
  password: DB_PASSWORD || "",
  database: DB_NAME || "assignment_app",
  port: DB_PORT ? Number(DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl,
});

export default pool;
