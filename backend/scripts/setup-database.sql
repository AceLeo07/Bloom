-- Bloom Forest Database Setup Script
-- Run this script to create the database and tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bloom_forest;
USE bloom_forest;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create user_trees table
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
);

-- Create daily_habits table
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
);

-- Create user_stats table for analytics
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
);

-- Insert demo user for testing
INSERT IGNORE INTO users (id, email, password_hash) VALUES 
('demo-user-id', 'demo@bloom.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K');

-- Insert demo user stats
INSERT IGNORE INTO user_stats (id, user_id) VALUES 
('demo-stats-id', 'demo-user-id');

-- Show tables created
SHOW TABLES;

-- Show demo user
SELECT id, email, created_at FROM users WHERE email = 'demo@bloom.com';
