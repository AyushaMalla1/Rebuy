const express = require('express');
const router = express.Router();
const ChatbotHistory = require('../models/ChatbotHistory');

// Get chatbot history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await ChatbotHistory.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      count: history.length,
      history: history.reverse() // Chronological order
    });
  } catch (error) {
    console.error('Error fetching chatbot history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chatbot history'
    });
  }
});

// Get all chatbot conversations (Admin only)
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const history = await ChatbotHistory.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ChatbotHistory.countDocuments();
    
    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      history
    });
  } catch (error) {
    console.error('Error fetching all chatbot history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chatbot history'
    });
  }
});

// Get chatbot statistics (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const totalConversations = await ChatbotHistory.countDocuments();
    
    // Count by role
    const roleStats = await ChatbotHistory.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Count by intent
    const intentStats = await ChatbotHistory.aggregate([
      {
        $group: {
          _id: '$intent',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Conversations per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await ChatbotHistory.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        total: totalConversations,
        byRole: roleStats,
        byIntent: intentStats,
        last7Days: dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching chatbot stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chatbot statistics'
    });
  }
});

// Delete chatbot history for a user
router.delete('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await ChatbotHistory.deleteMany({ user_id: userId });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} conversations`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting chatbot history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chatbot history'
    });
  }
});

module.exports = router;
