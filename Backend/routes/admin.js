const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logAudit } = require('../utils/auditLogger');

// Middleware to verify admin access (add this if you have auth middleware)
// const { verifyToken, isAdmin } = require('../middleware/auth');
// router.use(verifyToken, isAdmin);

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ userType: { $ne: 'admin' } });
    const totalSellers = await Seller.countDocuments({ status: 'approved' });
    const totalProducts = await Product.countDocuments();
    const pendingProducts = await Product.countDocuments({ status: 'Pending' });
    
    // Revenue from non-cancelled orders
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        pendingProducts,
        totalOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recent activity (e.g. recent orders and pending products)
router.get('/recent-activity', async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate('customer', 'fullName email')
      .sort({ orderDate: -1 })
      .limit(10);
      
    const pendingProductsList = await Product.find({ status: 'Pending' })
      .populate('seller', 'fullName name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        recentOrders,
        pendingProducts: pendingProductsList
      }
    });
  } catch (error) {
    console.error('Admin recent activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, type } = req.query;
    
    let allUsers = [];
    
    // Fetch regular users (exclude admins)
    if (!type || type === 'all' || type === 'customer') {
      const userQuery = { userType: { $ne: 'admin' } }; // Exclude admin users
      if (search) {
        userQuery.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      const users = await User.find(userQuery)
        .select('-password')
        .sort({ createdAt: -1 });
      
      allUsers = users.map(u => ({
        ...u.toObject(),
        userType: u.userType || 'customer'
      }));
    }
    
    // Fetch sellers
    if (!type || type === 'all' || type === 'seller') {
      const sellerQuery = { status: { $ne: 'pending' } }; // Exclude pending sellers
      if (search) {
        sellerQuery.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { storeName: { $regex: search, $options: 'i' } }
        ];
      }
      
      const sellers = await Seller.find(sellerQuery)
        .select('-password')
        .sort({ createdAt: -1 });
      
      const mappedSellers = sellers.map(s => ({
        ...s.toObject(),
        userType: 'seller'
      }));
      
      allUsers = [...allUsers, ...mappedSellers];
    }
    
    // Sort by creation date
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = allUsers.slice(startIndex, endIndex);
    
    res.json({ 
      success: true, 
      users: paginatedUsers,
      totalPages: Math.ceil(allUsers.length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get pending sellers
router.get('/sellers/pending', async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Get pending sellers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all products with filtering
router.get('/products', async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const products = await Product.find(query)
      .populate('seller', 'fullName name')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all orders with filtering
router.get('/orders', async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'fullName email')
      .sort({ orderDate: -1 });
      
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const Seller = require('../models/Seller');
    
    // Try to find as User first
    let user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      // Try to find as Seller
      user = await Seller.findById(req.params.id).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: status === 'active' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/Reject seller
router.patch('/sellers/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(reason && { rejectionReason: reason })
      },
      { new: true }
    );
    
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Log audit entry (skip if no user context)
    if (req.user?.id) {
      await logAudit({
        action: status === 'approved' ? 'Seller Approved' : 'Seller Rejected',
        actionType: 'seller',
        performedBy: req.user.id,
        targetId: seller._id,
        targetModel: 'Seller',
        description: `Admin ${status} seller application for ${seller.fullName || seller.name}`,
        ipAddress: req.ip
      }).catch(err => console.error('Audit log failed:', err));
    }
    
    res.json({ success: true, seller });
  } catch (error) {
    console.error('Update seller status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/Reject product
router.patch('/products/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(reason && { rejectionReason: reason })
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get sales by category
    const salesByCategory = await Product.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', total: { $sum: '$sold' } } },
      { $sort: { total: -1 } }
    ]);
    
    // Get top sellers
    const topSellers = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, ...dateFilter } },
      { $group: { _id: '$seller', totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      analytics: {
        salesByCategory,
        topSellers
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

// Fraud Detection Routes
const FraudAlert = require('../models/FraudAlert');

router.get('/fraud-alerts', async (req, res) => {
  try {
    const { status, riskLevel } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    if (riskLevel && riskLevel !== 'all') {
      query.riskLevel = riskLevel;
    }
    
    const alerts = await FraudAlert.find(query)
      .populate('userId', 'fullName email')
      .populate('orderId')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/fraud-alerts/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const alert = await FraudAlert.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        notes,
        resolvedBy: req.user?.id,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    
    res.json({ success: true, alert });
  } catch (error) {
    console.error('Update fraud alert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Audit Log Routes
const AuditLog = require('../models/AuditLog');

router.get('/audit-logs', async (req, res) => {
  try {
    const { actionType, startDate, endDate } = req.query;
    const query = {};
    
    if (actionType && actionType !== 'all') {
      query.actionType = actionType;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/audit-logs', async (req, res) => {
  try {
    const log = new AuditLog(req.body);
    await log.save();
    res.json({ success: true, log });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Announcements Routes
const Announcement = require('../models/Announcement');

router.get('/announcements', async (req, res) => {
  try {
    const { isActive, targetAudience } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (targetAudience && targetAudience !== 'all') {
      query.targetAudience = { $in: [targetAudience, 'all'] };
    }
    
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'fullName')
      .sort({ priority: -1, createdAt: -1 });
      
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      createdBy: req.user?.id
    });
    await announcement.save();
    res.json({ success: true, announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
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

router.delete('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Loyalty Points Routes
const LoyaltyPoints = require('../models/LoyaltyPoints');

router.get('/loyalty-points', async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    
    const loyaltyRecords = await LoyaltyPoints.find(query)
      .populate('userId', 'fullName email')
      .sort({ points: -1 })
      .limit(100);
      
    res.json({ success: true, loyaltyRecords });
  } catch (error) {
    console.error('Get loyalty points error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/loyalty-points/:userId', async (req, res) => {
  try {
    const { points, action } = req.body;
    
    let loyaltyRecord = await LoyaltyPoints.findOne({ userId: req.params.userId });
    
    if (!loyaltyRecord) {
      loyaltyRecord = new LoyaltyPoints({ userId: req.params.userId, points: 0 });
    }
    
    if (action === 'add') {
      loyaltyRecord.points += points;
    } else if (action === 'subtract') {
      loyaltyRecord.points = Math.max(0, loyaltyRecord.points - points);
    } else {
      loyaltyRecord.points = points;
    }
    
    await loyaltyRecord.save();
    
    res.json({ success: true, loyaltyRecord });
  } catch (error) {
    console.error('Update loyalty points error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Settings Routes
const Settings = require('../models/Settings');

router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    settings.updatedBy = req.user?.id;
    await settings.save();
    
    // Log audit entry
    await logAudit({
      action: 'Settings Updated',
      actionType: 'system',
      performedBy: req.user?.id,
      targetId: settings._id,
      targetModel: 'Settings',
      description: 'Admin updated platform settings',
      ipAddress: req.ip,
      metadata: req.body
    });
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Profile Routes
router.get('/profile', async (req, res) => {
  try {
    const admin = await User.findById(req.user?.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({ success: true, admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/profile', async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    
    const admin = await User.findByIdAndUpdate(
      req.user?.id,
      { fullName, email, phone },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    // Log audit entry
    await logAudit({
      action: 'Profile Updated',
      actionType: 'user',
      performedBy: req.user?.id,
      targetId: admin._id,
      targetModel: 'User',
      description: 'Admin updated their profile',
      ipAddress: req.ip
    });
    
    res.json({ success: true, admin });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
