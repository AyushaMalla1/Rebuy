const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Seller = require('./models/Seller');
const Product = require('./models/Product');
const Order = require('./models/Order');
const AuditLog = require('./models/AuditLog');
const Announcement = require('./models/Announcement');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');
const Return = require('./models/Return');
const ConditionVerification = require('./models/ConditionVerification');
const LoyaltyPoints = require('./models/LoyaltyPoints');
const ChatbotHistory = require('./models/ChatbotHistory');

async function cleanupTestData() {
  try {
    // Connect to PRODUCTION database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database');

    // Delete all test data (emails containing 'test.com')
    const testEmailPattern = /@test\.com$/;

    console.log('\n🧹 Cleaning up test data...\n');

    // Get test user IDs BEFORE deleting
    const testUsers = await User.find({ 
      email: { $regex: testEmailPattern } 
    }).select('_id');
    const testUserIds = testUsers.map(u => u._id);

    const testSellers = await Seller.find({ 
      email: { $regex: testEmailPattern } 
    }).select('_id');
    const testSellerIds = testSellers.map(s => s._id);

    const testAdmins = await Admin.find({ 
      email: { $regex: testEmailPattern } 
    }).select('_id');
    const testAdminIds = testAdmins.map(a => a._id);

    const allTestIds = [...testUserIds, ...testSellerIds, ...testAdminIds];

    console.log(`Found ${testUserIds.length} test users, ${testSellerIds.length} test sellers, ${testAdminIds.length} test admins`);

    // Clean Notifications (including orphaned ones)
    const notificationsDeleted = await Notification.deleteMany({ 
      $or: [
        { userId: { $in: allTestIds } },
        { sellerId: { $in: testSellerIds } },
        { message: { $regex: /test/i } },
        { title: { $regex: /test/i } },
        { message: { $regex: /order.*#12345/i } }
      ]
    });
    console.log(`✅ Deleted ${notificationsDeleted.deletedCount} test notifications`);

    // Clean Products from test sellers
    const productsDeleted = await Product.deleteMany({ 
      $or: [
        { seller: { $in: testSellerIds } },
        { sellerName: { $regex: /test/i } }
      ]
    });
    console.log(`✅ Deleted ${productsDeleted.deletedCount} test products`);

    // Clean Orders
    const ordersDeleted = await Order.deleteMany({ 
      $or: [
        { customer: { $in: allTestIds } },
        { customerEmail: { $regex: testEmailPattern } }
      ]
    });
    console.log(`✅ Deleted ${ordersDeleted.deletedCount} test orders`);

    // Clean Audit Logs from test users
    const auditLogsDeleted = await AuditLog.deleteMany({ 
      performedBy: { $in: allTestIds }
    });
    console.log(`✅ Deleted ${auditLogsDeleted.deletedCount} test audit logs`);

    // Clean Announcements
    const announcementsDeleted = await Announcement.deleteMany({ 
      $or: [
        { title: { $regex: /test/i } },
        { createdBy: { $in: allTestIds } }
      ]
    });
    console.log(`✅ Deleted ${announcementsDeleted.deletedCount} test announcements`);

    // Clean Messages
    const messagesDeleted = await Message.deleteMany({ 
      $or: [
        { senderId: { $in: allTestIds } },
        { receiverId: { $in: allTestIds } }
      ]
    });
    console.log(`✅ Deleted ${messagesDeleted.deletedCount} test messages`);

    // Clean Reviews
    const reviewsDeleted = await Review.deleteMany({ 
      customerId: { $in: testUserIds }
    });
    console.log(`✅ Deleted ${reviewsDeleted.deletedCount} test reviews`);

    // Clean Wishlists
    const wishlistsDeleted = await Wishlist.deleteMany({ 
      customer: { $in: testUserIds }
    });
    console.log(`✅ Deleted ${wishlistsDeleted.deletedCount} test wishlists`);

    // Clean Returns
    const returnsDeleted = await Return.deleteMany({ 
      customerId: { $in: testUserIds }
    });
    console.log(`✅ Deleted ${returnsDeleted.deletedCount} test returns`);

    // Clean Condition Verifications
    const verificationsDeleted = await ConditionVerification.deleteMany({ 
      customerId: { $in: testUserIds }
    });
    console.log(`✅ Deleted ${verificationsDeleted.deletedCount} test condition verifications`);

    // Clean Loyalty Points
    const loyaltyDeleted = await LoyaltyPoints.deleteMany({ 
      customer: { $in: testUserIds }
    });
    console.log(`✅ Deleted ${loyaltyDeleted.deletedCount} test loyalty points`);

    // Clean Chatbot History
    const chatbotDeleted = await ChatbotHistory.deleteMany({ 
      user_id: { $in: testUserIds }
    });
    console.log(`✅ Deleted ${chatbotDeleted.deletedCount} test chatbot history`);

    // NOW delete the users themselves
    const adminsDeleted = await Admin.deleteMany({ 
      email: { $regex: testEmailPattern } 
    });
    console.log(`✅ Deleted ${adminsDeleted.deletedCount} test admins`);

    const usersDeleted = await User.deleteMany({ 
      email: { $regex: testEmailPattern } 
    });
    console.log(`✅ Deleted ${usersDeleted.deletedCount} test users`);

    const customersDeleted = await Customer.deleteMany({ 
      email: { $regex: testEmailPattern } 
    });
    console.log(`✅ Deleted ${customersDeleted.deletedCount} test customers`);

    const sellersDeleted = await Seller.deleteMany({ 
      email: { $regex: testEmailPattern } 
    });
    console.log(`✅ Deleted ${sellersDeleted.deletedCount} test sellers`);

    console.log('\n✅ Cleanup completed successfully!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanupTestData();
