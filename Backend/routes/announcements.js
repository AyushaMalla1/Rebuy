const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Seller = require('../models/Seller');

// Get all announcements (admin)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email');
    
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get active announcements for users
router.get('/active', async (req, res) => {
  try {
    const { userType } = req.query; // 'customer' or 'seller'
    
    const query = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Filter by target audience
    if (userType === 'seller') {
      query.targetAudience = { $in: ['all', 'sellers'] };
    } else if (userType === 'customer') {
      query.targetAudience = { $in: ['all', 'customers'] };
    }

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);
    
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get active announcements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create announcement
router.post('/', async (req, res) => {
  try {
    const { title, message, type, targetAudience, priority, expiresAt, createdBy } = req.body;

    console.log('Creating announcement:', { title, message, type, targetAudience, priority, createdBy });

    const announcement = new Announcement({
      title,
      message,
      type: type || 'info',
      targetAudience: targetAudience || 'all',
      priority: priority || 'medium',
      expiresAt: expiresAt || null,
      createdBy,
      isActive: true
    });

    await announcement.save();
    console.log('Announcement saved:', announcement._id);

    // Create notifications for target users
    await createNotificationsForAnnouncement(announcement);

    res.json({ 
      success: true, 
      message: 'Announcement created and notifications sent',
      announcement 
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, announcement });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle announcement active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.json({ success: true, announcement });
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to create notifications
async function createNotificationsForAnnouncement(announcement) {
  try {
    const notifications = [];

    // Determine target users
    if (announcement.targetAudience === 'all' || announcement.targetAudience === 'customers') {
      // Get all customers from User collection where userType is 'customer'
      const customers = await User.find({ userType: 'customer' });
      
      for (const customer of customers) {
        notifications.push({
          recipient: customer._id,
          recipientModel: 'User',
          type: 'system',
          title: announcement.title,
          message: announcement.message,
          severity: announcement.type,
          isRead: false,
          metadata: {
            announcementId: announcement._id,
            priority: announcement.priority
          }
        });
      }
    }

    if (announcement.targetAudience === 'all' || announcement.targetAudience === 'sellers') {
      // Get all sellers from Seller collection
      const sellers = await Seller.find({ status: 'approved' });
      
      for (const seller of sellers) {
        notifications.push({
          sellerId: seller._id,
          recipient: seller._id,
          recipientModel: 'Seller',
          type: 'system',
          title: announcement.title,
          message: announcement.message,
          severity: announcement.type,
          isRead: false,
          metadata: {
            announcementId: announcement._id,
            priority: announcement.priority
          }
        });
      }
    }

    // Bulk insert notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for announcement`);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}

module.exports = router;
