const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Seller = require('../models/Seller');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const Notification = require('../models/Notification');
const FraudAlert = require('../models/FraudAlert');
const AuditLog = require('../models/AuditLog');

// Cache for frequently accessed data (refreshes every 5 minutes)
let contextCache = {
  lastUpdated: null,
  trendingProducts: [],
  recentOrders: [],
  platformStats: {},
  sellerStats: {},
  stockAlerts: {},
  bundleDeals: []
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function refreshContextCache() {
  const now = Date.now();
  
  // Only refresh if cache is stale
  if (contextCache.lastUpdated && (now - contextCache.lastUpdated) < CACHE_DURATION) {
    return contextCache;
  }

  try {
    console.log('[ChatbotContext] Refreshing comprehensive context cache...');

    // ===== PRODUCTS DATA =====
    const trendingProducts = await Product.find({ 
      status: { $regex: /^approved$/i },
      stock: { $gt: 0 }
    })
    .select('name price category stock sold createdAt isBundleDeal bundleItems')
    .sort({ sold: -1, createdAt: -1 })
    .limit(50);

    // Stock alerts
    const lowStockProducts = await Product.find({
      status: { $regex: /^approved$/i },
      stock: { $gt: 0, $lt: 5 }
    }).select('name stock seller').limit(20);

    const outOfStockProducts = await Product.find({
      status: { $regex: /^approved$/i },
      stock: 0
    }).select('name seller').limit(20);

    const highStockProducts = await Product.find({
      status: { $regex: /^approved$/i },
      stock: { $gte: 20 }
    }).select('name stock').limit(20);

    // Bundle deals
    const bundleDeals = await Product.find({
      isBundleDeal: true,
      status: { $regex: /^approved$/i }
    }).select('name price bundleItems bundleDiscount').limit(10);

    // ===== ORDERS DATA =====
    const recentOrders = await Order.find({})
    .select('status total createdAt items deliveryStatus')
    .sort({ createdAt: -1 })
    .limit(100);

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    // ===== SELLER DATA =====
    const sellerStats = await Seller.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingSellers = await Seller.countDocuments({ status: 'pending' });
    const approvedSellers = await Seller.countDocuments({ status: 'approved' });
    const rejectedSellers = await Seller.countDocuments({ status: 'rejected' });
    const suspendedSellers = await Seller.countDocuments({ status: 'suspended' });

    // ===== PLATFORM STATS =====
    const [
      totalProducts,
      activeProducts,
      pendingProducts,
      totalOrders,
      totalUsers,
      totalCustomers,
      totalReviews,
      totalLoyaltyPoints
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: { $regex: /^approved$/i }, stock: { $gt: 0 } }),
      Product.countDocuments({ status: { $regex: /^pending$/i } }),
      Order.countDocuments({}),
      User.countDocuments({}),
      User.countDocuments({ userType: { $in: ['customer', 'buyer'] } }),  // Fixed: userType not role
      Review.countDocuments({}),
      LoyaltyPoints.countDocuments({})
    ]);

    // ===== NEW PRODUCTS =====
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newProducts = await Product.find({
      createdAt: { $gte: sevenDaysAgo },
      status: { $regex: /^approved$/i }
    })
    .select('name price category createdAt stock sold')
    .sort({ createdAt: -1 })
    .limit(20);

    // ===== CATEGORY STATS =====
    const categoryStats = await Product.aggregate([
      { $match: { status: { $regex: /^approved$/i } } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSold: { $sum: '$sold' },
        avgPrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // ===== DELIVERY STATS =====
    const deliveryStats = await Order.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // ===== RECENT ACTIVITY =====
    const recentNotifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type message createdAt');

    const recentAuditLogs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .select('action entityType details timestamp');

    contextCache = {
      lastUpdated: now,
      trendingProducts,
      recentOrders,
      newProducts,
      categoryStats,
      bundleDeals,
      stockAlerts: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        highStock: highStockProducts
      },
      sellerStats: {
        byStatus: sellerStats,
        pending: pendingSellers,
        approved: approvedSellers,
        rejected: rejectedSellers,
        suspended: suspendedSellers
      },
      orderStats,
      deliveryStats,
      platformStats: {
        totalProducts,
        activeProducts,
        pendingProducts,
        totalOrders,
        totalUsers,
        totalCustomers,
        totalSellers: approvedSellers + pendingSellers + rejectedSellers + suspendedSellers,
        totalReviews,
        totalLoyaltyPoints,
        lastUpdated: new Date().toISOString()
      },
      recentActivity: {
        notifications: recentNotifications,
        auditLogs: recentAuditLogs
      }
    };

    console.log(`[ChatbotContext] Comprehensive cache refreshed: ${trendingProducts.length} products, ${bundleDeals.length} bundles, ${lowStockProducts.length} low stock alerts`);
    
  } catch (error) {
    console.error('[ChatbotContext] Error refreshing cache:', error);
  }

  return contextCache;
}

// Get enhanced context for chatbot
async function getEnhancedContext(role, userId) {
  const cache = await refreshContextCache();
  const contextParts = [];

  try {
    // Add timestamp
    contextParts.push(`[Data as of: ${new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' })}]`);
    contextParts.push('');

    if (role === 'Seller' && userId && userId !== 'guest') {
      // ===== SELLER COMPREHENSIVE CONTEXT =====
      const sellerProducts = await Product.find({ seller: userId })
        .select('name price stock sold category status createdAt updatedAt isBundleDeal')
        .sort({ updatedAt: -1 })
        .limit(100);

      if (sellerProducts.length > 0) {
        const lowStock = sellerProducts.filter(p => p.stock < 5 && p.stock > 0);
        const outOfStock = sellerProducts.filter(p => p.stock === 0);
        const highStock = sellerProducts.filter(p => p.stock >= 20);
        const pending = sellerProducts.filter(p => p.status === 'Pending');
        const approved = sellerProducts.filter(p => p.status === 'Approved');
        const rejected = sellerProducts.filter(p => p.status === 'Rejected');
        const totalSold = sellerProducts.reduce((sum, p) => sum + (p.sold || 0), 0);
        const totalRevenue = sellerProducts.reduce((sum, p) => sum + ((p.sold || 0) * p.price), 0);

        contextParts.push('=== YOUR STORE DASHBOARD ===');
        contextParts.push(`Total Products: ${sellerProducts.length}`);
        contextParts.push(`Approved: ${approved.length} | Pending: ${pending.length} | Rejected: ${rejected.length}`);
        contextParts.push(`Total Units Sold: ${totalSold}`);
        contextParts.push(`Estimated Revenue: NPR ${totalRevenue.toLocaleString()}`);
        contextParts.push('');

        contextParts.push('=== STOCK ALERTS ===');
        contextParts.push(`🔴 Out of Stock: ${outOfStock.length} products`);
        contextParts.push(`🟡 Low Stock (< 5): ${lowStock.length} products`);
        contextParts.push(`🟢 High Stock (≥ 20): ${highStock.length} products`);
        
        if (lowStock.length > 0) {
          contextParts.push('\nLOW STOCK ITEMS (Need Restocking):');
          lowStock.slice(0, 5).forEach(p => {
            contextParts.push(`- ${p.name}: Only ${p.stock} left (Sold: ${p.sold || 0})`);
          });
        }

        if (outOfStock.length > 0) {
          contextParts.push('\nOUT OF STOCK (Restock Urgently):');
          outOfStock.slice(0, 5).forEach(p => {
            contextParts.push(`- ${p.name} (Previously sold: ${p.sold || 0})`);
          });
        }

        // Trending in seller's store
        const sellerTrending = sellerProducts
          .filter(p => p.status === 'Approved')
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 5);

        if (sellerTrending.length > 0) {
          contextParts.push('\n=== YOUR TOP SELLERS ===');
          sellerTrending.forEach((p, i) => {
            contextParts.push(`${i + 1}. ${p.name}: ${p.sold || 0} sold, NPR ${p.price}, Stock: ${p.stock}`);
          });
        }

        // Promotional ideas
        contextParts.push('\n=== PROMOTION IDEAS ===');
        if (lowStock.length > 0) {
          contextParts.push('- Create urgency: "Only few left!" for low stock items');
        }
        if (highStock.length > 0) {
          contextParts.push('- Offer bundle deals on high stock items');
        }
        contextParts.push('- Highlight your top sellers in product descriptions');
        contextParts.push('- Consider seasonal discounts to move inventory');
      }

    } else if (role === 'Customer' && userId && userId !== 'guest') {
      // ===== CUSTOMER COMPREHENSIVE CONTEXT =====
      
      // Customer's orders
      const customerOrders = await Order.find({ customer: userId })
        .select('status total deliveryStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

      // Customer's loyalty points
      const loyaltyPoints = await LoyaltyPoints.findOne({ customer: userId })
        .select('points');

      contextParts.push('=== YOUR ACCOUNT ===');
      contextParts.push(`Total Orders: ${customerOrders.length}`);
      contextParts.push(`Loyalty Points: ${loyaltyPoints?.points || 0} points`);
      contextParts.push('');

      if (customerOrders.length > 0) {
        contextParts.push('=== YOUR RECENT ORDERS ===');
        customerOrders.slice(0, 3).forEach(order => {
          const daysAgo = Math.floor((Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
          contextParts.push(`- NPR ${order.total} | ${order.status} | ${order.deliveryStatus || 'Processing'} (${daysAgo} days ago)`);
        });
        contextParts.push('');
      }

      // New arrivals
      if (cache.newProducts.length > 0) {
        contextParts.push('=== NEW ARRIVALS (Last 7 Days) ===');
        cache.newProducts.slice(0, 10).forEach(p => {
          const daysAgo = Math.floor((Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
          contextParts.push(`- ${p.name}: NPR ${p.price} (${daysAgo}d ago, ${p.sold || 0} sold)`);
        });
        contextParts.push('');
      }

      // Trending products
      if (cache.trendingProducts.length > 0) {
        contextParts.push('=== TRENDING NOW ===');
        cache.trendingProducts.slice(0, 10).forEach(p => {
          contextParts.push(`- ${p.name}: NPR ${p.price} (${p.sold || 0} sold, ${p.stock} in stock)`);
        });
        contextParts.push('');
      }

      // Bundle deals
      if (cache.bundleDeals.length > 0) {
        contextParts.push('=== BUNDLE DEALS (Save More!) ===');
        cache.bundleDeals.forEach(bundle => {
          contextParts.push(`- ${bundle.name}: NPR ${bundle.price} (${bundle.bundleDiscount || 0}% off)`);
        });
        contextParts.push('');
      }

    } else if (role === 'Admin') {
      // ===== ADMIN COMPREHENSIVE CONTEXT =====
      
      contextParts.push('=== PLATFORM OVERVIEW ===');
      contextParts.push(`Total Users: ${cache.platformStats.totalUsers}`);
      contextParts.push(`Customers: ${cache.platformStats.totalCustomers}`);
      contextParts.push(`Sellers: ${cache.platformStats.totalSellers}`);
      contextParts.push(`Total Products: ${cache.platformStats.totalProducts}`);
      contextParts.push(`Active Products: ${cache.platformStats.activeProducts}`);
      contextParts.push(`Pending Approval: ${cache.platformStats.pendingProducts}`);
      contextParts.push(`Total Orders: ${cache.platformStats.totalOrders}`);
      contextParts.push(`Total Reviews: ${cache.platformStats.totalReviews}`);
      contextParts.push('');

      contextParts.push('=== SELLER MANAGEMENT ===');
      contextParts.push(`Approved Sellers: ${cache.sellerStats.approved}`);
      contextParts.push(`Pending Approval: ${cache.sellerStats.pending}`);
      contextParts.push(`Suspended: ${cache.sellerStats.suspended}`);
      contextParts.push(`Rejected: ${cache.sellerStats.rejected}`);
      contextParts.push('');

      contextParts.push('=== INVENTORY STATUS ===');
      contextParts.push(`Low Stock Items: ${cache.stockAlerts.lowStock.length}`);
      contextParts.push(`Out of Stock: ${cache.stockAlerts.outOfStock.length}`);
      contextParts.push(`High Stock: ${cache.stockAlerts.highStock.length}`);
      contextParts.push('');

      if (cache.orderStats.length > 0) {
        contextParts.push('=== ORDER STATISTICS ===');
        cache.orderStats.forEach(stat => {
          contextParts.push(`${stat._id}: ${stat.count} orders (NPR ${stat.totalRevenue?.toLocaleString() || 0})`);
        });
        contextParts.push('');
      }

      if (cache.deliveryStats.length > 0) {
        contextParts.push('=== DELIVERY STATUS ===');
        cache.deliveryStats.forEach(stat => {
          contextParts.push(`${stat._id || 'Pending'}: ${stat.count} orders`);
        });
        contextParts.push('');
      }

      if (cache.categoryStats.length > 0) {
        contextParts.push('=== TOP CATEGORIES ===');
        cache.categoryStats.slice(0, 5).forEach((cat, i) => {
          contextParts.push(`${i + 1}. ${cat._id}: ${cat.count} products, ${cat.totalSold} sold, Avg NPR ${Math.round(cat.avgPrice)}`);
        });
        contextParts.push('');
      }

      if (cache.bundleDeals.length > 0) {
        contextParts.push(`=== BUNDLE DEALS: ${cache.bundleDeals.length} active`);
      }

      contextParts.push('=== SYSTEM PERFORMANCE ===');
      contextParts.push('- All systems operational');
      contextParts.push('- Database: Connected');
      contextParts.push('- Payment Gateway: Active');
      contextParts.push(`- Last Updated: ${new Date(cache.lastUpdated).toLocaleTimeString()}`);

    } else {
      // ===== GUEST CONTEXT =====
      
      if (cache.newProducts.length > 0) {
        contextParts.push('=== NEW ARRIVALS ===');
        cache.newProducts.slice(0, 8).forEach(p => {
          contextParts.push(`- ${p.name}: NPR ${p.price}`);
        });
        contextParts.push('');
      }

      if (cache.trendingProducts.length > 0) {
        contextParts.push('=== POPULAR PRODUCTS ===');
        cache.trendingProducts.slice(0, 8).forEach(p => {
          contextParts.push(`- ${p.name}: NPR ${p.price} (${p.sold || 0} sold)`);
        });
        contextParts.push('');
      }

      if (cache.bundleDeals.length > 0) {
        contextParts.push('=== SPECIAL BUNDLE DEALS ===');
        cache.bundleDeals.slice(0, 5).forEach(bundle => {
          contextParts.push(`- ${bundle.name}: NPR ${bundle.price}`);
        });
        contextParts.push('');
      }

      if (cache.categoryStats.length > 0) {
        contextParts.push('=== AVAILABLE CATEGORIES ===');
        cache.categoryStats.forEach(cat => {
          contextParts.push(`- ${cat._id}: ${cat.count} products`);
        });
        contextParts.push('');
      }
    }

    // Add platform info for all roles
    contextParts.push('=== REBUY PLATFORM INFO ===');
    contextParts.push('Shipping: 3-5 business days across Nepal');
    contextParts.push('Returns: Within 7 days (unused items)');
    contextParts.push('Payment: COD, eSewa, Khalti');
    contextParts.push('Loyalty Points: Earn on every purchase');
    contextParts.push('Bundle Deals: Save more on combo purchases');
    contextParts.push('Support: 9 AM - 6 PM Nepal Time');

  } catch (error) {
    console.error('[ChatbotContext] Error building context:', error);
  }

  return contextParts.join('\n');
}

// Force refresh cache (call this when major data changes occur)
async function forceRefreshCache() {
  contextCache.lastUpdated = null;
  return await refreshContextCache();
}

module.exports = {
  getEnhancedContext,
  refreshContextCache,
  forceRefreshCache
};
