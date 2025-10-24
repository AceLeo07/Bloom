import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateHabitAnswer } from '../middleware/validation.js';

const router = express.Router();

// Submit habit answer
router.post('/answer', authenticateToken, validateHabitAnswer, async (req, res) => {
  try {
    const { treeId, questionId, answer } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Verify tree belongs to user
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

    // Check if already answered today
    const [existingHabits] = await pool.execute(
      'SELECT * FROM daily_habits WHERE user_id = ? AND tree_id = ? AND date = ?',
      [req.user.id, treeId, today]
    );

    let habitRecord;
    if (existingHabits.length === 0) {
      // Create new habit record
      const habitId = uuidv4();
      await pool.execute(
        `INSERT INTO daily_habits 
         (id, user_id, tree_id, date, ${questionId}, total_positive) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [habitId, req.user.id, treeId, today, answer ? 'positive' : 'negative', answer ? 1 : 0]
      );

      habitRecord = { id: habitId, [questionId]: answer ? 'positive' : 'negative', total_positive: answer ? 1 : 0 };
    } else {
      habitRecord = existingHabits[0];

      // Check if this specific question was already answered
      if (habitRecord[questionId]) {
        return res.status(400).json({
          error: 'This question was already answered today',
          code: 'QUESTION_ALREADY_ANSWERED'
        });
      }

      // Count how many questions answered today
      let answeredCount = 0;
      if (habitRecord.mood) answeredCount++;
      if (habitRecord.food) answeredCount++;
      if (habitRecord.hydration) answeredCount++;
      if (habitRecord.sleep) answeredCount++;

      // Limit to 4 questions per day
      if (answeredCount >= 4) {
        return res.status(400).json({
          error: 'Daily questions limit reached',
          code: 'DAILY_LIMIT_REACHED'
        });
      }

      // Update existing record
      const newTotalPositive = habitRecord.total_positive + (answer ? 1 : 0);
      await pool.execute(
        `UPDATE daily_habits 
         SET ${questionId} = ?, total_positive = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [answer ? 'positive' : 'negative', newTotalPositive, habitRecord.id]
      );

      habitRecord[questionId] = answer ? 'positive' : 'negative';
      habitRecord.total_positive = newTotalPositive;
    }

    // Update tree health
    const healthChange = answer ? 5 : -5;
    const newHealth = Math.max(0, Math.min(100, currentTree.health + healthChange));
    
    // Calculate new stage based on health
    let newStage = 'seed';
    if (newHealth >= 75) newStage = 'bloom';
    else if (newHealth >= 50) newStage = 'sapling';
    else if (newHealth < 25) newStage = 'decay';

    // Calculate current day
    const daysSincePlanted = Math.floor(
      (Date.now() - new Date(currentTree.planted_at).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    await pool.execute(
      `UPDATE user_trees 
       SET health = ?, stage = ?, day = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newHealth, newStage, daysSincePlanted, treeId]
    );

    // Update user stats
    await pool.execute(
      `UPDATE user_stats 
       SET total_${answer ? 'positive' : 'negative'}_answers = total_${answer ? 'positive' : 'negative'}_answers + 1,
           last_activity_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [req.user.id]
    );

    // Get updated tree
    const [updatedTree] = await pool.execute(
      'SELECT * FROM user_trees WHERE id = ?',
      [treeId]
    );

    // Count remaining questions for today
    const remainingQuestions = 4 - (habitRecord.mood ? 1 : 0) - (habitRecord.food ? 1 : 0) - 
                              (habitRecord.hydration ? 1 : 0) - (habitRecord.sleep ? 1 : 0);

    res.json({
      message: 'Habit answer recorded successfully',
      tree: updatedTree[0],
      habitRecord,
      remainingQuestions,
      healthChange
    });
  } catch (error) {
    console.error('Submit habit answer error:', error);
    res.status(500).json({
      error: 'Failed to record habit answer',
      code: 'HABIT_ANSWER_ERROR'
    });
  }
});

// Get today's habits for current tree
router.get('/today/:treeId', authenticateToken, async (req, res) => {
  try {
    const { treeId } = req.params;
    const today = new Date().toISOString().split('T')[0];

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

    // Get today's habits
    const [habits] = await pool.execute(
      'SELECT * FROM daily_habits WHERE user_id = ? AND tree_id = ? AND date = ?',
      [req.user.id, treeId, today]
    );

    const habitRecord = habits.length > 0 ? habits[0] : null;

    // Count answered questions
    let answeredCount = 0;
    if (habitRecord) {
      if (habitRecord.mood) answeredCount++;
      if (habitRecord.food) answeredCount++;
      if (habitRecord.hydration) answeredCount++;
      if (habitRecord.sleep) answeredCount++;
    }

    res.json({
      habitRecord,
      answeredCount,
      remainingQuestions: 4 - answeredCount,
      isComplete: answeredCount >= 4
    });
  } catch (error) {
    console.error('Get today habits error:', error);
    res.status(500).json({
      error: 'Failed to get today\'s habits',
      code: 'GET_HABITS_ERROR'
    });
  }
});

// Get habit history for a tree
router.get('/history/:treeId', authenticateToken, async (req, res) => {
  try {
    const { treeId } = req.params;
    const { limit = 30, offset = 0 } = req.query;

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

    // Get habit history
    const [habits] = await pool.execute(
      `SELECT * FROM daily_habits 
       WHERE user_id = ? AND tree_id = ? 
       ORDER BY date DESC 
       LIMIT ? OFFSET ?`,
      [req.user.id, treeId, parseInt(limit), parseInt(offset)]
    );

    res.json({ habits });
  } catch (error) {
    console.error('Get habit history error:', error);
    res.status(500).json({
      error: 'Failed to get habit history',
      code: 'GET_HISTORY_ERROR'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [req.user.id]
    );

    if (stats.length === 0) {
      return res.status(404).json({
        error: 'User stats not found',
        code: 'STATS_NOT_FOUND'
      });
    }

    // Get additional stats
    const [treeStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_trees,
         AVG(health) as avg_health,
         MAX(health) as best_health,
         MIN(health) as worst_health
       FROM user_trees 
       WHERE user_id = ?`,
      [req.user.id]
    );

    const [habitStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_answers,
         SUM(total_positive) as total_positive,
         AVG(total_positive) as avg_daily_positive
       FROM daily_habits 
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      userStats: stats[0],
      treeStats: treeStats[0],
      habitStats: habitStats[0]
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      code: 'GET_STATS_ERROR'
    });
  }
});

export default router;
