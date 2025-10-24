import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { validateSignup, validateSignin } from '../middleware/validation.js';

const router = express.Router();

// Sign up
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email, passwordHash]
    );

    // Create initial user stats
    await pool.execute(
      'INSERT INTO user_stats (id, user_id) VALUES (?, ?)',
      [uuidv4(), userId]
    );

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      code: 'SIGNUP_ERROR'
    });
  }
});

// Sign in
router.post('/signin', validateSignin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      error: 'Failed to sign in',
      code: 'SIGNIN_ERROR'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      code: 'GET_USER_ERROR'
    });
  }
});

// Demo user endpoint (for testing)
router.post('/demo', async (req, res) => {
  try {
    // Create or get demo user
    const demoEmail = 'demo@bloom.com';
    let [users] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [demoEmail]
    );

    let userId;
    if (users.length === 0) {
      // Create demo user
      userId = uuidv4();
      const passwordHash = await bcrypt.hash('demo123', 12);
      
      await pool.execute(
        'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
        [userId, demoEmail, passwordHash]
      );

      // Create initial user stats
      await pool.execute(
        'INSERT INTO user_stats (id, user_id) VALUES (?, ?)',
        [uuidv4(), userId]
      );
    } else {
      userId = users[0].id;
    }

    // Generate token
    const token = generateToken(userId);

    res.json({
      message: 'Demo user authenticated',
      token,
      user: {
        id: userId,
        email: demoEmail
      }
    });
  } catch (error) {
    console.error('Demo auth error:', error);
    res.status(500).json({
      error: 'Failed to authenticate demo user',
      code: 'DEMO_AUTH_ERROR'
    });
  }
});

export default router;
