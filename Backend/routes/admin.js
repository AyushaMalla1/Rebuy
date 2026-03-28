const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ userType: { $ne: 'admin' } });
    const totalSellers = await Seller.countDocuments();
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
    const recentOrders = await Order.find().sort({ orderDate: -1 }).limit(10);
    const pendingProductsList = await Product.find({ status: 'Pending' })
      .populate('seller', 'name')
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

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get pending sellers
router.get('/sellers/pending', async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name').sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
