import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let isConnected = false;

// In-memory fallback database for development when MySQL is offline
const inMemoryDb = {
  projects: new Map(),
  versions: new Map(), // key: project_id, value: array of versions
};

export async function initDb() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  try {
    // First connect without specifying DB name to create DB if needed
    const connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: Number(DB_PORT) || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'screenshot_to_code'}\`;`);
    await connection.end();

    // Now create connection pool to the database
    pool = mysql.createPool({
      host: DB_HOST || 'localhost',
      port: Number(DB_PORT) || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'screenshot_to_code',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create required tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        original_image LONGTEXT NOT NULL,
        framework ENUM('html-css', 'react-tailwind') NOT NULL DEFAULT 'react-tailwind',
        generated_code LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(36) NOT NULL,
        code LONGTEXT NOT NULL,
        version INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    isConnected = true;
    console.log('[DB] MySQL Connected successfully and tables verified.');
  } catch (error) {
    console.warn('[DB Warning] MySQL connection failed. Running in-memory fallback store:', error.message);
    isConnected = false;
  }
}

export function getDb() {
  if (isConnected && pool) {
    return {
      query: (sql, params) => pool.query(sql, params),
      execute: (sql, params) => pool.execute(sql, params),
      isFallback: false,
    };
  }

  // Return helper methods for in-memory fallback
  return {
    isFallback: true,
    inMemoryDb,
  };
}

export { isConnected };
