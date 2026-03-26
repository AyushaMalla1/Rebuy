const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Seller = require('../models/Seller');

// Get all notifications for a seller
router.get('/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { limit = 50, unreadOnly = false } = req.query;

    const query = { sellerId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      sellerId,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
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
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Mark all notifications as read for a seller
router.patch('/seller/:sellerId/read-all', async (req, res) => {
  try {
    const { sellerId } = req.params;

    await Notification.updateMany(
      { sellerId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Create a notification (for testing or internal use)
router.post('/', async (req, res) => {
  try {
    const { sellerId, type, title, message, severity, relatedId, relatedModel } = req.body;

    const notification = new Notification({
      sellerId,
      type,
      title,
      message,
      severity,
      relatedId,
      relatedModel
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

module.exports = router;
