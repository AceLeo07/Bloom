import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTreeUpdate } from '../middleware/validation.js';

const router = express.Router();

// Get current tree for user
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const [trees] = await pool.execute(
      `SELECT * FROM user_trees 
       WHERE user_id = ? AND is_current = TRUE 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (trees.length === 0) {
      return res.status(404).json({
        error: 'No current tree found',
        code: 'NO_CURRENT_TREE'
      });
    }

    res.json({ tree: trees[0] });
  } catch (error) {
    console.error('Get current tree error:', error);
    res.status(500).json({
      error: 'Failed to get current tree',
      code: 'GET_TREE_ERROR'
    });
  }
});

// Get all trees for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [trees] = await pool.execute(
      `SELECT * FROM user_trees 
       WHERE user_id = ? 
       ORDER BY tree_number ASC`,
      [req.user.id]
    );

    res.json({ trees });
  } catch (error) {
    console.error('Get trees error:', error);
    res.status(500).json({
      error: 'Failed to get trees',
      code: 'GET_TREES_ERROR'
    });
  }
});

// Create new tree
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Get current tree count for user
    const [treeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_trees WHERE user_id = ?',
      [req.user.id]
    );

    const nextTreeNumber = treeCount[0].count + 1;

    // Calculate position for new tree (center initially)
    const position = calculateNextPosition(treeCount[0].count);

    // Create new tree
    const treeId = uuidv4();
    await pool.execute(
      `INSERT INTO user_trees 
       (id, user_id, tree_number, stage, health, day, planted_at, is_current, position_x, position_z) 
       VALUES (?, ?, ?, 'seed', 50, 1, CURRENT_TIMESTAMP, TRUE, ?, ?)`,
      [treeId, req.user.id, nextTreeNumber, position.x, position.z]
    );

    // Get the created tree
    const [newTree] = await pool.execute(
      'SELECT * FROM user_trees WHERE id = ?',
      [treeId]
    );

    res.status(201).json({
      message: 'Tree created successfully',
      tree: newTree[0]
    });
  } catch (error) {
    console.error('Create tree error:', error);
    res.status(500).json({
      error: 'Failed to create tree',
      code: 'CREATE_TREE_ERROR'
    });
  }
});

// Update tree
router.patch('/:treeId', authenticateToken, validateTreeUpdate, async (req, res) => {
  try {
    const { treeId } = req.params;
    const updates = req.body;

    // Verify tree belongs to user
    const [trees] = await pool.execute(
      'SELECT * FROM user_trees WHERE id = ? AND user_id = ?',
      [treeId, req.user.id]
    );

    if (trees.length === 0) {
      return res.status(404).json({
        error: 'Tree not found',
        code: 'TREE_NOT_FOUND'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    updateValues.push(treeId);

    await pool.execute(
      `UPDATE user_trees SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated tree
    const [updatedTree] = await pool.execute(
      'SELECT * FROM user_trees WHERE id = ?',
      [treeId]
    );

    res.json({
      message: 'Tree updated successfully',
      tree: updatedTree[0]
    });
  } catch (error) {
    console.error('Update tree error:', error);
    res.status(500).json({
      error: 'Failed to update tree',
      code: 'UPDATE_TREE_ERROR'
    });
  }
});

// Complete tree and start new one
router.post('/:treeId/complete', authenticateToken, async (req, res) => {
  try {
    const { treeId } = req.params;

    // Get current tree
    const [trees] = await pool.execute(
      'SELECT * FROM user_trees WHERE id = ? AND user_id = ? AND is_current = TRUE',
      [treeId, req.user.id]
    );

    if (trees.length === 0) {
      return res.status(404).json({
        error: 'Current tree not found',
        code: 'TREE_NOT_FOUND'
      });
    }

    const currentTree = trees[0];

    // Check if tree is ready to complete (day 7+)
    const daysSincePlanted = Math.floor(
      (Date.now() - new Date(currentTree.planted_at).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (daysSincePlanted < 7) {
      return res.status(400).json({
        error: 'Tree is not ready to complete yet',
        code: 'TREE_NOT_READY'
      });
    }

    // Move current tree to forest position
    const forestPosition = calculateNextPosition(currentTree.tree_number - 1);
    
    await pool.execute(
      `UPDATE user_trees 
       SET is_current = FALSE, completed_at = CURRENT_TIMESTAMP, 
           position_x = ?, position_z = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [forestPosition.x, forestPosition.z, treeId]
    );

    // Create new tree at center
    const [treeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_trees WHERE user_id = ?',
      [req.user.id]
    );

    const nextTreeNumber = treeCount[0].count + 1;
    const newTreeId = uuidv4();

    await pool.execute(
      `INSERT INTO user_trees 
       (id, user_id, tree_number, stage, health, day, planted_at, is_current, position_x, position_z) 
       VALUES (?, ?, ?, 'seed', 50, 1, CURRENT_TIMESTAMP, TRUE, 0, 0)`,
      [newTreeId, req.user.id, nextTreeNumber]
    );

    // Update user stats
    await pool.execute(
      `UPDATE user_stats 
       SET total_trees_completed = total_trees_completed + 1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [req.user.id]
    );

    // Get the new tree
    const [newTree] = await pool.execute(
      'SELECT * FROM user_trees WHERE id = ?',
      [newTreeId]
    );

    res.json({
      message: 'Tree completed and new tree planted',
      completedTree: currentTree,
      newTree: newTree[0]
    });
  } catch (error) {
    console.error('Complete tree error:', error);
    res.status(500).json({
      error: 'Failed to complete tree',
      code: 'COMPLETE_TREE_ERROR'
    });
  }
});

// Helper function to calculate tree positions
function calculateNextPosition(treeCount) {
  const radius = 8;
  const angle = (treeCount * 137.5) * (Math.PI / 180); // Golden angle for natural distribution
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius
  };
}

export default router;
