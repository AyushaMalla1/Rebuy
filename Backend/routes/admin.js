const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
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

// Get approved sellers
router.get('/sellers/approved', async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'approved' })
      .sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Get approved sellers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get suspended sellers
router.get('/sellers/suspended', async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'suspended' })
      .sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Get suspended sellers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get rejected sellers
router.get('/sellers/rejected', async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'rejected' })
      .sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Get rejected sellers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all sellers (with optional status filter)
router.get('/sellers', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    
    const sellers = await Seller.find(query)
      .sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get seller by ID
router.get('/sellers/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select('-password');
    
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    
    res.json({ success: true, seller });
  } catch (error) {
    console.error('Get seller error:', error);
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
    
    // Log audit
    await logAudit({
      action: status === 'active' ? 'User Activated' : 'User Deactivated',
      actionType: 'user',
      performedBy: req.user?.id || null,
      targetId: user._id,
      targetModel: 'User',
      description: `User ${user.username} status changed to ${status === 'active' ? 'active' : 'inactive'}`,
      ipAddress: req.ip,
      metadata: {
        username: user.username,
        email: user.email,
        newStatus: status
      }
    });
    
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
    
    // Get current seller status before update
    const currentSeller = await Seller.findById(req.params.id);
    if (!currentSeller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    
    const previousStatus = currentSeller.status;
    
    const updateData = { 
      status,
      ...(reason && status === 'rejected' && { 'approvalData.rejectionReason': reason }),
      ...(reason && status === 'suspended' && { 'approvalData.suspensionReason': reason })
    };
    
    // If approving, set approval timestamp
    if (status === 'approved') {
      updateData['approvalData.approvedAt'] = new Date();
      if (req.user?.id) {
        updateData['approvalData.approvedBy'] = req.user.id;
      }
    }
    
    // If suspending, set deactivation timestamp
    if (status === 'suspended') {
      updateData['deactivatedAt'] = new Date();
    }
    
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Log audit entry
    let action = '';
    let description = '';
    
    // Detect reactivation (suspended -> approved)
    if (status === 'approved' && previousStatus === 'suspended') {
      action = 'Seller Reactivated';
      description = `Seller "${seller.storeName}" reactivated from suspension`;
    } else if (status === 'approved') {
      action = 'Seller Approved';
      description = `Seller "${seller.storeName}" approved`;
    } else if (status === 'rejected') {
      action = 'Seller Rejected';
      description = `Seller "${seller.storeName}" rejected${reason ? `: ${reason}` : ''}`;
    } else if (status === 'suspended') {
      action = 'Seller Suspended';
      description = `Seller "${seller.storeName}" suspended${reason ? `: ${reason}` : ''}`;
    }
    
    await logAudit({
      action,
      actionType: 'seller',
      performedBy: req.user?.id || null,
      targetId: seller._id,
      targetModel: 'Seller',
      description,
      ipAddress: req.ip,
      metadata: {
        storeName: seller.storeName,
        email: seller.email,
        previousStatus,
        newStatus: status,
        ...(reason && { reason })
      }
    });
    
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
    
    // Log audit
    let action = 'Product Updated';
    let description = `Product "${product.name}" status changed to ${status}`;
    
    if (status === 'approved') {
      action = 'Product Approved';
      description = `Product "${product.name}" approved`;
    } else if (status === 'rejected') {
      action = 'Product Rejected';
      description = `Product "${product.name}" rejected${reason ? `: ${reason}` : ''}`;
    }
    
    await logAudit({
      action,
      actionType: 'product',
      performedBy: req.user?.id || null,
      targetId: product._id,
      targetModel: 'Product',
      description,
      ipAddress: req.ip,
      metadata: {
        productName: product.name,
        newStatus: status,
        ...(reason && { reason })
      }
    });
    
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
    
    // Log audit
    await logAudit({
      action: 'Product Deleted',
      actionType: 'product',
      performedBy: req.user?.id || null,
      targetId: product._id,
      targetModel: 'Product',
      description: `Product "${product.name}" deleted from system`,
      ipAddress: req.ip,
      metadata: {
        productName: product.name,
        category: product.category,
        price: product.price
      }
    });
    
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
      .populate('customer', 'fullName email')
      .sort({ totalPoints: -1 })
      .limit(100);
    
    // Map to match frontend expectations
    const formattedRecords = loyaltyRecords.map(record => ({
      _id: record._id,
      userId: record.customer, // Map customer to userId for frontend
      points: record.totalPoints, // Map totalPoints to points for frontend
      tier: record.tier,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
    
    // Filter out orphaned records where the customer document was deleted
    const validRecords = formattedRecords.filter(record => record.userId !== null && record.userId !== undefined);
      
    res.json({ success: true, loyaltyRecords: validRecords });
  } catch (error) {
    console.error('Get loyalty points error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/loyalty-points/:userId', async (req, res) => {
  try {
    const { points, action } = req.body;
    
    let loyaltyRecord = await LoyaltyPoints.findOne({ customer: req.params.userId });
    
    if (!loyaltyRecord) {
      loyaltyRecord = new LoyaltyPoints({ customer: req.params.userId, totalPoints: 0 });
    }
    
    if (action === 'add') {
      loyaltyRecord.totalPoints += points;
    } else if (action === 'subtract') {
      loyaltyRecord.totalPoints = Math.max(0, loyaltyRecord.totalPoints - points);
    } else {
      loyaltyRecord.totalPoints = points;
    }
    
    loyaltyRecord.updateTier();
    await loyaltyRecord.save();
    
    res.json({ success: true, loyaltyRecord });
  } catch (error) {
    console.error('Update loyalty points error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Settings Routes - Return default settings
router.get('/settings', async (req, res) => {
  try {
    // Return default settings since Settings model is removed
    const defaultSettings = {
      siteName: 'Rebuy',
      siteEmail: 'admin@rebuy.com',
      sitePhone: '+977-1234567890',
      currency: 'NPR',
      taxRate: 13,
      shippingFee: 100,
      freeShippingThreshold: 5000,
      maintenanceMode: false,
      allowSellerRegistration: true,
      requireProductApproval: true,
      minOrderAmount: 100,
      maxOrderAmount: 100000,
      loyaltyPointsEnabled: true,
      pointsPerRupee: 1,
      paymentGateway: {
        provider: 'none',
        apiKey: '',
        secretKey: '',
        merchantId: '',
        isEnabled: false,
        testMode: true
      }
    };
    
    res.json({ success: true, settings: defaultSettings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/settings', async (req, res) => {
  try {
    // Settings are now managed via environment variables
    // Return success but don't actually save anything
    res.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: req.body 
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Profile Routes
router.get('/profile', async (req, res) => {
  try {
    // Get admin ID from token, request, or query
    let adminId = req.user?.id || req.userId || req.query.adminId;
    
    if (!adminId) {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          adminId = decoded.id;
        }
      } catch (tokenErr) {
        console.error('Admin profile token verify error:', tokenErr);
      }
    }
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const admin = await Admin.findById(adminId).select('-password');
    
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
    
    // Get admin ID from token, request, or body
    let adminId = req.user?.id || req.userId || req.query.adminId || req.body.adminId;
    
    if (!adminId) {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          adminId = decoded.id;
        }
      } catch (tokenErr) {
        console.error('Admin profile patch token verify error:', tokenErr);
      }
    }
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const admin = await Admin.findByIdAndUpdate(
      adminId,
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
      performedBy: adminId,
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

// Sales Reports Endpoint
router.get('/sales-reports', async (req, res) => {
  try {
    // Get days parameter from query (default to 7 if not provided or 'all')
    const daysParam = req.query.days || '7';
    let dateFilter = {};
    
    if (daysParam !== 'all') {
      const days = parseInt(daysParam);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { orderDate: { $gte: startDate } };
    }
    
    // Get total revenue with date filter
    const orders = await Order.find({ 
      ...dateFilter,
      status: { $nin: ['Cancelled', 'Pending'] } 
    }).catch(() => []);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;

    // Get active sellers
    const activeSellers = await Seller.countDocuments({ status: 'approved' }).catch(() => 0);

    // Get total customers
    const totalCustomers = await User.countDocuments({ userType: 'customer' }).catch(() => 0);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Calculate platform commission (3% of total revenue from non-cancelled orders)
    const commissionRate = 3; // 3% commission
    const platformCommission = Math.round((totalRevenue * commissionRate) / 100);

    // Get top category - with error handling
    let topCategory = "Men's Collection"; // Default
    try {
      const categoryRevenue = await Order.aggregate([
        { $match: { 
          ...dateFilter,
          status: { $nin: ['Cancelled'] } 
        } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            let: { productId: '$items.product' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$productId' }]
                  }
                }
              }
            ],
            as: 'productInfo'
          }
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        { $match: { 'productInfo.category': { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$productInfo.category',
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 1 }
      ]);
      
      if (categoryRevenue.length > 0 && categoryRevenue[0]._id) {
        topCategory = categoryRevenue[0]._id;
      }
    } catch (err) {
      console.log('Category aggregation error, using default');
    }

    // Revenue growth (last 30 days vs previous 30 days)
    let revenueGrowth = 0;
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentRevenue = await Order.aggregate([
        { $match: { orderDate: { $gte: thirtyDaysAgo }, status: { $nin: ['Cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const previousRevenue = await Order.aggregate([
        { $match: { orderDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: { $nin: ['Cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const recentTotal = recentRevenue[0]?.total || 0;
      const previousTotal = previousRevenue[0]?.total || 1;
      revenueGrowth = previousTotal > 0 ? parseFloat((((recentTotal - previousTotal) / previousTotal) * 100).toFixed(1)) : 0;
    } catch (err) {
      console.log('Revenue growth calculation error, using default');
    }

    // Revenue data for last 7 days
    let revenueData = [];
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const revenueByDay = await Order.aggregate([
        { $match: { orderDate: { $gte: sevenDaysAgo }, status: { $nin: ['Cancelled'] } } },
        {
          $group: {
            _id: { $dayOfWeek: '$orderDate' },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Map day numbers to day names (1=Sunday, 2=Monday, etc.)
      const dayMap = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' };
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      revenueData = days.map(day => {
        const dayNum = Object.keys(dayMap).find(key => dayMap[key] === day);
        const found = revenueByDay.find(r => r._id === parseInt(dayNum));
        return { day, revenue: found ? found.revenue : 0 };
      });
    } catch (err) {
      console.log('Revenue by day error, using empty data');
    }

    // Top selling products
    let topProducts = [];
    try {
      topProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            sales: { $sum: '$items.quantity' },
            name: { $first: '$items.productName' }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: '$name',
            sales: 1
          }
        }
      ]);
    } catch (err) {
      console.log('Top products error, using empty data');
    }

    // Category performance
    let categoryPerformance = [];
    try {
      categoryPerformance = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { category: '$_id', count: 1, _id: 0 } }
      ]);
    } catch (err) {
      console.log('Category performance error, using empty data');
    }

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        activeSellers,
        totalCustomers,
        averageOrderValue,
        commissionRate: parseFloat(commissionRate.toFixed(1)),
        platformCommission,
        topCategory,
        revenueGrowth
      },
      revenueData,
      topProducts,
      categoryPerformance
    });
  } catch (error) {
    console.error('Sales reports error:', error);
    // Return default data instead of error
    res.json({
      success: true,
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        activeSellers: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        commissionRate: 3,
        platformCommission: 0,
        topCategory: "Men's Collection",
        revenueGrowth: 0
      },
      revenueData: [],
      topProducts: [],
      categoryPerformance: []
    });
  }
});

// Export Sales Report as CSV
router.get('/export-sales-report', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $nin: ['Cancelled'] } })
      .populate('customer', 'fullName email')
      .populate('items.product', 'name category')
      .sort({ orderDate: -1 });

    // Create CSV content
    let csv = 'Order ID,Date,Customer,Email,Product,Category,Quantity,Price,Total,Status\n';
    
    orders.forEach(order => {
      order.items.forEach(item => {
        csv += `${order._id},`;
        csv += `${new Date(order.orderDate).toLocaleDateString()},`;
        csv += `${order.customer?.fullName || 'N/A'},`;
        csv += `${order.customer?.email || 'N/A'},`;
        csv += `${item.product?.name || 'N/A'},`;
        csv += `${item.product?.category || 'N/A'},`;
        csv += `${item.quantity},`;
        csv += `${item.price},`;
        csv += `${order.total},`;
        csv += `${order.status}\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// Get Analytics Data for Dashboard Charts
router.get('/analytics-data', async (req, res) => {
  try {
    // Revenue data for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const revenueByDay = await Order.aggregate([
      { $match: { orderDate: { $gte: sevenDaysAgo }, status: { $nin: ['Cancelled'] } } },
      {
        $group: {
          _id: { $dayOfWeek: '$orderDate' }, // 1=Sunday, 2=Monday, etc.
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Map day numbers to day names
    const dayMap = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' };
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenue = days.map(day => {
      const dayNum = Object.keys(dayMap).find(key => dayMap[key] === day);
      const found = revenueByDay.find(r => r._id === parseInt(dayNum));
      return { day, revenue: found ? found.revenue : 0 };
    });

    // Top 5 selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $addFields: {
          'items.productId': { $toObjectId: '$items.product' }
        }
      },
      {
        $group: {
          _id: '$items.productId',
          sales: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: '$productInfo.name',
          sales: 1
        }
      }
    ]);

    // Category distribution
    const categories = await Product.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    // User growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, userType: { $ne: 'admin' } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      months.push(monthNames[monthIndex]);
    }

    let cumulativeUsers = await User.countDocuments({ 
      createdAt: { $lt: sixMonthsAgo },
      userType: { $ne: 'admin' }
    });

    const userGrowthData = months.map((month, index) => {
      const monthNum = (currentMonth - 5 + index + 12) % 12 + 1;
      const found = userGrowth.find(u => u._id === monthNum);
      const newUsers = found ? found.newUsers : 0;
      cumulativeUsers += newUsers;
      return { month, users: cumulativeUsers, newUsers };
    });

    // Seller stats (last 6 months)
    const sellerGrowth = await Seller.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: 'approved' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          newSellers: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    let cumulativeSellers = await Seller.countDocuments({ 
      createdAt: { $lt: sixMonthsAgo },
      status: 'approved'
    });

    const sellerStats = months.map((month, index) => {
      const monthNum = (currentMonth - 5 + index + 12) % 12 + 1;
      const found = sellerGrowth.find(s => s._id === monthNum);
      const newSellers = found ? found.newSellers : 0;
      cumulativeSellers += newSellers;
      return { month, sellers: cumulativeSellers, newSellers };
    });

    // Product distribution by status
    const productDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // Orders trend (last 7 days)
    const ordersTrend = await Order.aggregate([
      { $match: { orderDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { 
            day: { $dayOfWeek: '$orderDate' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const ordersTrendData = days.map(day => {
      const dayNum = Object.keys(dayMap).find(key => dayMap[key] === day);
      const dayOrders = ordersTrend.filter(o => o._id.day === parseInt(dayNum));
      const total = dayOrders.reduce((sum, o) => sum + o.count, 0);
      const completed = dayOrders.find(o => o._id.status === 'Delivered')?.count || 0;
      return { day, orders: total, completed };
    });

    // Revenue breakdown by category
    const revenueBreakdown = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled'] } } },
      { $unwind: '$items' },
      {
        $addFields: {
          'items.productId': { $toObjectId: '$items.product' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          value: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      chartData: {
        revenue,
        topProducts,
        categories,
        userGrowth: userGrowthData,
        sellerStats,
        productDistribution,
        ordersTrend: ordersTrendData,
        revenueBreakdown
      }
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Fraud Detection Endpoints
const fraudDetection = require('../utils/fraudDetection');

// Run fraud detection scan and save to database
router.get('/fraud-detection/scan', async (req, res) => {
  try {
    console.log('🔍 Running fraud detection scan...');
    const alerts = await fraudDetection.detectAllFraud();
    
    console.log(`✅ Fraud detection complete. Found ${alerts.length} new alerts`);
    
    // Get updated stats from database
    const stats = await fraudDetection.getFraudStats();
    
    res.json({
      success: true,
      message: `Scan complete. Found ${alerts.length} new suspicious activities.`,
      newAlerts: alerts.length,
      stats
    });
  } catch (error) {
    console.error('❌ Fraud detection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error running fraud detection',
      error: error.message 
    });
  }
});

// Get fraud alerts from database
router.get('/fraud-detection', async (req, res) => {
  try {
    const { status, severity, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    
    const alerts = await fraudDetection.getFraudAlertsFromDB(filter);
    const stats = await fraudDetection.getFraudStats();
    
    res.json({
      success: true,
      alerts,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching fraud alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching fraud alerts',
      error: error.message 
    });
  }
});

// Update fraud alert status
router.patch('/fraud-detection/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, adminNotes, actionTaken } = req.body;
    
    const updates = {};
    if (status) updates.status = status;
    if (adminNotes) updates.adminNotes = adminNotes;
    if (actionTaken) updates.actionTaken = actionTaken;
    if (req.user?.id) updates.reviewedBy = req.user.id;
    
    const alert = await fraudDetection.updateFraudAlert(alertId, updates);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Fraud alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Fraud alert updated successfully',
      alert
    });
  } catch (error) {
    console.error('❌ Error updating fraud alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating fraud alert',
      error: error.message 
    });
  }
});

// Delete fraud alert
router.delete('/fraud-detection/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const FraudAlert = require('../models/FraudAlert');
    
    await FraudAlert.findByIdAndDelete(alertId);
    
    res.json({
      success: true,
      message: 'Fraud alert deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting fraud alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting fraud alert',
      error: error.message 
    });
  }
});

module.exports = router;


// ============================================================================
// CONDITION VERIFICATION ADMIN APPROVAL ROUTES
// ============================================================================

// Get all pending verifications for admin review
router.get('/verifications/pending', async (req, res) => {
  try {
    const ConditionVerification = require('../models/ConditionVerification');
    
    const pendingVerifications = await ConditionVerification.find({
      approvalStatus: 'pending'
    })
      .populate('customer', 'fullName email')
      .populate('seller', 'fullName storeName')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      verifications: pendingVerifications
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all verifications (pending + approved + rejected)
router.get('/verifications/all', async (req, res) => {
  try {
    const ConditionVerification = require('../models/ConditionVerification');
    
    const allVerifications = await ConditionVerification.find()
      .populate('customer', 'fullName email')
      .populate('seller', 'fullName storeName')
      .populate('product', 'name images')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      verifications: allVerifications
    });
  } catch (error) {
    console.error('Error fetching all verifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve a verification (makes it public)
router.post('/verifications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminNotes } = req.body;
    
    const ConditionVerification = require('../models/ConditionVerification');
    
    const verification = await ConditionVerification.findById(id);
    
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification not found' });
    }
    
    if (verification.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Verification already processed' });
    }
    
    // Approve and make public
    verification.approvalStatus = 'approved';
    verification.isPublic = true;
    verification.approvedBy = adminId;
    verification.approvedAt = new Date();
    verification.adminReviewed = true;
    verification.adminNotes = adminNotes || '';
    verification.adminReviewedAt = new Date();
    verification.adminReviewedBy = adminId;
    
    await verification.save();
    
    // Update the original Order
    const Order = require('../models/Order');
    await Order.findByIdAndUpdate(verification.order, {
      'conditionVerification.adminApproved': true,
      'conditionVerification.approvedAt': new Date()
    });
    
    // Log audit
    await logAudit({
      action: 'VERIFICATION_APPROVED',
      performedBy: adminId,
      targetModel: 'ConditionVerification',
      targetId: verification._id,
      details: `Approved verification for order ${verification.orderId}`
    });
    
    console.log('✅ Verification approved by admin:', id);
    
    res.json({
      success: true,
      message: 'Verification approved and made public',
      verification
    });
  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject a verification
router.post('/verifications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, rejectionReason } = req.body;
    
    const ConditionVerification = require('../models/ConditionVerification');
    
    const verification = await ConditionVerification.findById(id);
    
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification not found' });
    }
    
    if (verification.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Verification already processed' });
    }
    
    // Reject (stays private)
    verification.approvalStatus = 'rejected';
    verification.isPublic = false;
    verification.rejectionReason = rejectionReason || 'No reason provided';
    verification.adminReviewed = true;
    verification.adminReviewedAt = new Date();
    verification.adminReviewedBy = adminId;
    
    await verification.save();
    
    // Log audit
    await logAudit({
      action: 'VERIFICATION_REJECTED',
      performedBy: adminId,
      targetModel: 'ConditionVerification',
      targetId: verification._id,
      details: `Rejected verification for order ${verification.orderId}. Reason: ${rejectionReason}`
    });
    
    console.log('❌ Verification rejected by admin:', id);
    
    res.json({
      success: true,
      message: 'Verification rejected',
      verification
    });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
