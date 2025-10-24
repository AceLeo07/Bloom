import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bloom_forest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create user_trees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_trees (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        tree_number INT NOT NULL,
        stage ENUM('seed', 'sapling', 'bloom', 'decay') DEFAULT 'seed',
        health INT DEFAULT 50 CHECK (health >= 0 AND health <= 100),
        day INT DEFAULT 1 CHECK (day >= 1 AND day <= 7),
        planted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        is_current BOOLEAN DEFAULT TRUE,
        position_x DECIMAL(10,2) DEFAULT 0,
        position_z DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_current (user_id, is_current),
        INDEX idx_user_trees (user_id, tree_number)
      )
    `);

    // Create daily_habits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_habits (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        tree_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        mood ENUM('positive', 'negative') NULL,
        food ENUM('positive', 'negative') NULL,
        hydration ENUM('positive', 'negative') NULL,
        sleep ENUM('positive', 'negative') NULL,
        total_positive INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tree_id) REFERENCES user_trees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_tree_date (user_id, tree_id, date),
        INDEX idx_user_date (user_id, date),
        INDEX idx_tree_date (tree_id, date)
      )
    `);

    // Create user_stats table for analytics
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_trees_completed INT DEFAULT 0,
        total_positive_answers INT DEFAULT 0,
        total_negative_answers INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_activity_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_stats (user_id)
      )
    `);

    connection.release();
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

export default pool;
