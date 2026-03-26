const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedNotifications = async () => {
  try {
    // Get a seller ID from your database (replace with actual seller ID)
    const sellerId = process.argv[2];
    
    if (!sellerId) {
      console.log('Usage: node seedNotifications.js <sellerId>');
      process.exit(1);
    }

    // Clear existing notifications for this seller
    await Notification.deleteMany({ sellerId });

    // Create sample notifications
    const notifications = [
      {
        sellerId,
        type: 'order',
        title: 'New Order Received',
        message: 'You have received a new order #12345',
        severity: 'success',
        isRead: false
      },
      {
        sellerId,
        type: 'stock',
        title: 'Low Stock Alert',
        message: 'Vintage Denim Jacket has only 3 items left',
        severity: 'warning',
        isRead: false
      },
      {
        sellerId,
        type: 'stock',
        title: 'Out of Stock',
        message: 'Classic White Sneakers is now out of stock',
        severity: 'error',
        isRead: false
      },
      {
        sellerId,
        type: 'product',
        title: 'Product Approved',
        message: 'Your product "Summer Dress" has been approved',
        severity: 'success',
        isRead: true
      },
      {
        sellerId,
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from John Doe',
        severity: 'info',
        isRead: false
      },
      {
        sellerId,
        type: 'system',
        title: 'Welcome to Seller Dashboard',
        message: 'Your products are live and ready for customers',
        severity: 'success',
        isRead: true
      }
    ];

    await Notification.insertMany(notifications);
    
    console.log(`✅ Successfully created ${notifications.length} notifications for seller ${sellerId}`);
    console.log('Notifications:');
    notifications.forEach((n, i) => {
      console.log(`  ${i + 1}. [${n.severity.toUpperCase()}] ${n.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
