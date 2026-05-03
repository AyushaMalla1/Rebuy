const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Seller = require('../models/Seller');

/**
 * NOTIFICATION ROUTES
 * Unified notification system for all user types (customers, sellers, admins)
 * - Single endpoint /:userId works for all user types
 * - Supports both legacy sellerId and new recipient fields
 * - Consistent response format with success flags
 */

// Get all notifications for a user (seller, customer, or admin)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, unreadOnly = false } = req.query;

    const query = {
      $or: [
        { sellerId: userId }, // Legacy field for backward compatibility
        { recipient: userId }
      ]
    };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      $or: [
        { sellerId: userId, isRead: false },
        { recipient: userId, isRead: false }
      ]
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notifications',
      error: error.message 
    });
  }
});

// Get unread notification count for a user
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Notification.countDocuments({
      $or: [
        { sellerId: userId, isRead: false },
        { recipient: userId, isRead: false }
      ]
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching unread count',
      error: error.message 
    });
  }
});

// Mark all notifications as read for a user
router.patch('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      {
        $or: [
          { sellerId: userId, isRead: false },
          { recipient: userId, isRead: false }
        ]
      },
      { isRead: true }
    );

    res.json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notifications',
      error: error.message 
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notification',
      error: error.message 
    });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting notification',
      error: error.message 
    });
  }
});

// Create a notification (for testing or internal use)
router.post('/', async (req, res) => {
  try {
    const { recipient, recipientModel, type, title, message, severity, relatedId, relatedModel } = req.body;

    // Validate required fields
    if (!recipient || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipient, type, title, message'
      });
    }

    const notification = new Notification({
      recipient,
      recipientModel: recipientModel || 'User',
      type,
      title,
      message,
      severity: severity || 'info',
      relatedId,
      relatedModel
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating notification',
      error: error.message 
    });
  }
});

module.exports = router;
