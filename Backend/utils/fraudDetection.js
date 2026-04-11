const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const FraudAlert = require('../models/FraudAlert');

/**
 * Fraud Detection Service
 * Analyzes patterns and behaviors to identify suspicious activities
 * Saves alerts to database for tracking and review
 */

// Detect suspicious review patterns
async function detectSuspiciousReviews() {
  const alerts = [];
  
  try {
    // 1. Multiple reviews from same IP/device (simulated by checking same customer multiple reviews in short time)
    const recentReviews = await Review.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).populate('customer', 'fullName email').populate('product', 'name seller');
    
    // Group by customer
    const reviewsByCustomer = {};
    recentReviews.forEach(review => {
      const customerId = review.customer?._id?.toString();
      if (customerId) {
        if (!reviewsByCustomer[customerId]) {
          reviewsByCustomer[customerId] = [];
        }
        reviewsByCustomer[customerId].push(review);
      }
    });
    
    // Check for customers with multiple reviews in short time
    Object.entries(reviewsByCustomer).forEach(([customerId, reviews]) => {
      if (reviews.length >= 5) {
        alerts.push({
          type: 'suspicious_review_pattern',
          severity: 'high',
          title: 'Multiple Reviews in Short Time',
          description: `Customer ${reviews[0].customer?.fullName} posted ${reviews.length} reviews in 24 hours`,
          userId: customerId,
          userName: reviews[0].customer?.fullName,
          userEmail: reviews[0].customer?.email,
          details: `${reviews.length} reviews posted`,
          timestamp: new Date()
        });
      }
    });
    
    // 2. Detect fake positive reviews (all 5 stars from new accounts)
    const newAccounts = await User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    
    for (const user of newAccounts) {
      const userReviews = await Review.find({ customer: user._id });
      if (userReviews.length >= 3 && userReviews.every(r => r.rating === 5)) {
        alerts.push({
          type: 'fake_positive_reviews',
          severity: 'medium',
          title: 'Suspicious All 5-Star Reviews',
          description: `New user ${user.fullName} posted ${userReviews.length} reviews, all 5 stars`,
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          details: `${userReviews.length} reviews, all rated 5 stars`,
          timestamp: new Date()
        });
      }
    }
    
  } catch (error) {
    console.error('Error detecting suspicious reviews:', error);
  }
  
  return alerts;
}

// Detect unusual order patterns
async function detectUnusualOrders() {
  const alerts = [];
  
  try {
    // 1. Multiple high-value orders from same customer in short time
    const recentOrders = await Order.find({
      orderDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('customer', 'fullName email');
    
    const ordersByCustomer = {};
    recentOrders.forEach(order => {
      const customerId = order.customer?._id?.toString();
      if (customerId) {
        if (!ordersByCustomer[customerId]) {
          ordersByCustomer[customerId] = [];
        }
        ordersByCustomer[customerId].push(order);
      }
    });
    
    Object.entries(ordersByCustomer).forEach(([customerId, orders]) => {
      const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      if (orders.length >= 5 || totalValue >= 50000) {
        alerts.push({
          type: 'unusual_order_pattern',
          severity: orders.length >= 10 ? 'high' : 'medium',
          title: 'Unusual Order Activity',
          description: `Customer ${orders[0].customer?.fullName} placed ${orders.length} orders worth Rs. ${totalValue.toLocaleString()} in 24 hours`,
          userId: customerId,
          userName: orders[0].customer?.fullName,
          userEmail: orders[0].customer?.email,
          details: `${orders.length} orders, Total: Rs. ${totalValue.toLocaleString()}`,
          timestamp: new Date()
        });
      }
    });
    
    // 2. Orders with mismatched shipping addresses
    const ordersWithMultipleAddresses = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$customer',
          addresses: { $addToSet: '$shippingAddress.city' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          $expr: { $gte: [{ $size: '$addresses' }, 3] }
        }
      }
    ]);
    
    for (const item of ordersWithMultipleAddresses) {
      const user = await User.findById(item._id);
      if (user) {
        alerts.push({
          type: 'multiple_shipping_addresses',
          severity: 'medium',
          title: 'Multiple Shipping Addresses',
          description: `Customer ${user.fullName} used ${item.addresses.length} different shipping addresses`,
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          details: `${item.count} orders to ${item.addresses.length} different cities`,
          timestamp: new Date()
        });
      }
    }
    
  } catch (error) {
    console.error('Error detecting unusual orders:', error);
  }
  
  return alerts;
}

// Detect seller fraud
async function detectSellerFraud() {
  const alerts = [];
  
  try {
    // 1. Sellers with abnormally high cancellation rates
    const sellers = await Seller.find({ approvalStatus: 'approved' });
    
    for (const seller of sellers) {
      const sellerOrders = await Order.find({ seller: seller._id });
      const cancelledOrders = sellerOrders.filter(o => o.status === 'Cancelled');
      
      if (sellerOrders.length >= 10) {
        const cancellationRate = (cancelledOrders.length / sellerOrders.length) * 100;
        
        if (cancellationRate >= 30) {
          alerts.push({
            type: 'high_cancellation_rate',
            severity: 'high',
            title: 'High Order Cancellation Rate',
            description: `Seller ${seller.storeName} has ${cancellationRate.toFixed(1)}% cancellation rate`,
            sellerId: seller._id,
            sellerName: seller.fullName,
            storeName: seller.storeName,
            details: `${cancelledOrders.length} of ${sellerOrders.length} orders cancelled`,
            timestamp: new Date()
          });
        }
      }
    }
    
    // 2. Sellers with fake stock (products always out of stock after order)
    const products = await Product.find({ status: 'Active' });
    
    for (const product of products) {
      const productOrders = await Order.find({
        'items.product': product._id,
        status: 'Cancelled',
        orderDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      
      if (productOrders.length >= 3) {
        const seller = await Seller.findById(product.seller);
        if (seller) {
          alerts.push({
            type: 'fake_stock',
            severity: 'medium',
            title: 'Potential Fake Stock Listing',
            description: `Product "${product.name}" has been cancelled ${productOrders.length} times`,
            sellerId: seller._id,
            sellerName: seller.fullName,
            storeName: seller.storeName,
            productId: product._id,
            productName: product.name,
            details: `${productOrders.length} cancelled orders in 30 days`,
            timestamp: new Date()
          });
        }
      }
    }
    
    // 3. Sellers with suspiciously low prices
    const avgPriceByCategory = await Product.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: '$category',
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    const categoryAvgMap = {};
    avgPriceByCategory.forEach(item => {
      categoryAvgMap[item._id] = item.avgPrice;
    });
    
    for (const product of products) {
      const avgPrice = categoryAvgMap[product.category];
      if (avgPrice && product.price < avgPrice * 0.3) { // 70% below average
        const seller = await Seller.findById(product.seller);
        if (seller) {
          alerts.push({
            type: 'suspiciously_low_price',
            severity: 'low',
            title: 'Suspiciously Low Price',
            description: `Product "${product.name}" priced at Rs. ${product.price} (70% below category average)`,
            sellerId: seller._id,
            sellerName: seller.fullName,
            storeName: seller.storeName,
            productId: product._id,
            productName: product.name,
            details: `Price: Rs. ${product.price}, Category avg: Rs. ${avgPrice.toFixed(0)}`,
            timestamp: new Date()
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error detecting seller fraud:', error);
  }
  
  return alerts;
}

// Detect payment fraud
async function detectPaymentFraud() {
  const alerts = [];
  
  try {
    // 1. Failed payment attempts
    const recentOrders = await Order.find({
      orderDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      paymentStatus: 'Failed'
    }).populate('customer', 'fullName email');
    
    const failedByCustomer = {};
    recentOrders.forEach(order => {
      const customerId = order.customer?._id?.toString();
      if (customerId) {
        if (!failedByCustomer[customerId]) {
          failedByCustomer[customerId] = [];
        }
        failedByCustomer[customerId].push(order);
      }
    });
    
    Object.entries(failedByCustomer).forEach(([customerId, orders]) => {
      if (orders.length >= 3) {
        alerts.push({
          type: 'multiple_failed_payments',
          severity: 'medium',
          title: 'Multiple Failed Payment Attempts',
          description: `Customer ${orders[0].customer?.fullName} had ${orders.length} failed payment attempts`,
          userId: customerId,
          userName: orders[0].customer?.fullName,
          userEmail: orders[0].customer?.email,
          details: `${orders.length} failed payments in 24 hours`,
          timestamp: new Date()
        });
      }
    });
    
    // 2. COD orders with high value from new accounts
    const newUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    for (const user of newUsers) {
      const codOrders = await Order.find({
        customer: user._id,
        paymentMethod: 'COD',
        total: { $gte: 10000 }
      });
      
      if (codOrders.length >= 2) {
        const totalValue = codOrders.reduce((sum, o) => sum + o.total, 0);
        alerts.push({
          type: 'high_value_cod_new_account',
          severity: 'high',
          title: 'High-Value COD from New Account',
          description: `New user ${user.fullName} placed ${codOrders.length} COD orders worth Rs. ${totalValue.toLocaleString()}`,
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          details: `${codOrders.length} COD orders, Total: Rs. ${totalValue.toLocaleString()}`,
          timestamp: new Date()
        });
      }
    }
    
  } catch (error) {
    console.error('Error detecting payment fraud:', error);
  }
  
  return alerts;
}

// Main fraud detection function
async function detectAllFraud() {
  try {
    const [reviewAlerts, orderAlerts, sellerAlerts, paymentAlerts] = await Promise.all([
      detectSuspiciousReviews(),
      detectUnusualOrders(),
      detectSellerFraud(),
      detectPaymentFraud()
    ]);
    
    const allAlerts = [
      ...reviewAlerts,
      ...orderAlerts,
      ...sellerAlerts,
      ...paymentAlerts
    ];
    
    // Sort by severity and timestamp
    allAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Save new alerts to database
    for (const alert of allAlerts) {
      try {
        // Check if similar alert already exists (within last 24 hours)
        const existingAlert = await FraudAlert.findOne({
          type: alert.type,
          userId: alert.userId,
          sellerId: alert.sellerId,
          status: { $in: ['pending', 'reviewed'] },
          detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        if (!existingAlert) {
          // Create new alert
          await FraudAlert.create({
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            details: alert.details,
            userId: alert.userId,
            userName: alert.userName,
            userEmail: alert.userEmail,
            sellerId: alert.sellerId,
            sellerName: alert.sellerName,
            storeName: alert.storeName,
            productId: alert.productId,
            productName: alert.productName,
            detectedAt: alert.timestamp,
            status: 'pending'
          });
        }
      } catch (saveError) {
        console.error('Error saving fraud alert:', saveError);
      }
    }
    
    return allAlerts;
  } catch (error) {
    console.error('Error in fraud detection:', error);
    return [];
  }
}

// Get fraud alerts from database
async function getFraudAlertsFromDB(filter = {}) {
  try {
    const query = {};
    
    if (filter.status) {
      query.status = filter.status;
    }
    
    if (filter.severity) {
      query.severity = filter.severity;
    }
    
    if (filter.type) {
      query.type = filter.type;
    }
    
    const alerts = await FraudAlert.find(query)
      .populate('userId', 'fullName email')
      .populate('sellerId', 'fullName storeName')
      .populate('productId', 'name')
      .sort({ detectedAt: -1 })
      .limit(100);
    
    return alerts;
  } catch (error) {
    console.error('Error fetching fraud alerts from DB:', error);
    return [];
  }
}

// Update fraud alert status
async function updateFraudAlert(alertId, updates) {
  try {
    const alert = await FraudAlert.findByIdAndUpdate(
      alertId,
      {
        ...updates,
        reviewedAt: updates.status === 'reviewed' ? new Date() : undefined,
        resolvedAt: updates.status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );
    
    return alert;
  } catch (error) {
    console.error('Error updating fraud alert:', error);
    return null;
  }
}

// Get fraud statistics
async function getFraudStats() {
  try {
    const [total, high, medium, low, pending, byType] = await Promise.all([
      FraudAlert.countDocuments({ status: 'pending' }),
      FraudAlert.countDocuments({ status: 'pending', severity: 'high' }),
      FraudAlert.countDocuments({ status: 'pending', severity: 'medium' }),
      FraudAlert.countDocuments({ status: 'pending', severity: 'low' }),
      FraudAlert.countDocuments({ status: 'pending' }),
      FraudAlert.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);
    
    const byTypeObj = {};
    byType.forEach(item => {
      byTypeObj[item._id] = item.count;
    });
    
    return {
      total,
      high,
      medium,
      low,
      pending,
      byType: byTypeObj
    };
  } catch (error) {
    console.error('Error getting fraud stats:', error);
    return { total: 0, high: 0, medium: 0, low: 0, pending: 0, byType: {} };
  }
}

module.exports = {
  detectAllFraud,
  detectSuspiciousReviews,
  detectUnusualOrders,
  detectSellerFraud,
  detectPaymentFraud,
  getFraudAlertsFromDB,
  updateFraudAlert,
  getFraudStats
};
