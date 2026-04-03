const FraudAlert = require('../models/FraudAlert');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');

// Detect suspicious orders
async function detectSuspiciousOrders() {
  const alerts = [];
  const timeWindow = 10 * 60 * 1000; // 10 minutes
  const now = new Date();
  const recentTime = new Date(now - timeWindow);

  try {
    // Find orders in last 10 minutes grouped by user
    const recentOrders = await Order.find({
      createdAt: { $gte: recentTime }
    }).populate('userId');

    // Group by user
    const ordersByUser = {};
    recentOrders.forEach(order => {
      const userId = order.userId?._id?.toString();
      if (userId) {
        if (!ordersByUser[userId]) {
          ordersByUser[userId] = [];
        }
        ordersByUser[userId].push(order);
      }
    });

    // Check for multiple high-value orders
    for (const [userId, orders] of Object.entries(ordersByUser)) {
      if (orders.length >= 3) {
        const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        // Check if alert already exists
        const existingAlert = await FraudAlert.findOne({
          userId,
          type: 'suspicious_order',
          status: { $in: ['pending', 'investigating'] }
        });

        if (!existingAlert && totalAmount > 10000) {
          alerts.push({
            type: 'suspicious_order',
            riskLevel: totalAmount > 30000 ? 'high' : 'medium',
            userId,
            description: `${orders.length} orders placed within 10 minutes, total: Rs. ${totalAmount}`,
            amount: totalAmount,
            status: 'pending'
          });
        }
      }
    }

    // Check for same item in multiple separate orders within 10 minutes
    const ordersByUserProduct = {};
    recentOrders.forEach(order => {
      const userId = order.userId?._id?.toString();
      if (userId && order.items) {
        order.items.forEach(item => {
          const productId = item.productId?.toString();
          if (productId) {
            const key = `${userId}_${productId}`;
            if (!ordersByUserProduct[key]) {
              ordersByUserProduct[key] = {
                userId,
                productId,
                productName: item.name,
                orders: []
              };
            }
            ordersByUserProduct[key].orders.push({
              orderId: order._id,
              quantity: item.quantity,
              time: order.createdAt
            });
          }
        });
      }
    });

    // Alert if same product appears in 5+ separate orders
    for (const [key, data] of Object.entries(ordersByUserProduct)) {
      if (data.orders.length >= 5) {
        const existingAlert = await FraudAlert.findOne({
          userId: data.userId,
          type: 'suspicious_order',
          description: { $regex: `same item.*${data.orders.length}.*separate orders` },
          status: { $in: ['pending', 'investigating'] }
        });

        if (!existingAlert) {
          const totalQty = data.orders.reduce((sum, o) => sum + (o.quantity || 1), 0);
          alerts.push({
            type: 'suspicious_order',
            riskLevel: data.orders.length >= 8 ? 'high' : 'medium',
            userId: data.userId,
            description: `Customer placed ${data.orders.length} separate orders for same item "${data.productName}" within 10 minutes (total qty: ${totalQty})`,
            status: 'pending'
          });
        }
      }
    }

    // Check for orders with mismatched addresses
    const ordersWithAddresses = await Order.find({
      createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    for (const order of ordersWithAddresses) {
      if (order.shippingAddress && order.billingAddress) {
        const shippingCity = order.shippingAddress.city?.toLowerCase();
        const billingCity = order.billingAddress?.city?.toLowerCase();
        
        if (shippingCity && billingCity && shippingCity !== billingCity) {
          const existingAlert = await FraudAlert.findOne({
            orderId: order._id,
            type: 'suspicious_order'
          });

          if (!existingAlert) {
            alerts.push({
              type: 'suspicious_order',
              riskLevel: 'low',
              userId: order.userId,
              orderId: order._id,
              description: `Shipping city (${order.shippingAddress.city}) differs from billing city`,
              amount: order.total,
              status: 'pending'
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Error detecting suspicious orders:', error);
  }

  return alerts;
}

// Detect multiple accounts
async function detectMultipleAccounts() {
  const alerts = [];

  try {
    // Find users with same email domain (excluding common ones)
    const users = await User.find({ userType: { $ne: 'admin' } });
    
    // Group by phone number
    const phoneGroups = {};
    users.forEach(user => {
      if (user.phone) {
        if (!phoneGroups[user.phone]) {
          phoneGroups[user.phone] = [];
        }
        phoneGroups[user.phone].push(user);
      }
    });

    // Check for multiple accounts with same phone
    for (const [phone, userList] of Object.entries(phoneGroups)) {
      if (userList.length >= 3) {
        const existingAlert = await FraudAlert.findOne({
          description: { $regex: phone },
          type: 'multiple_accounts',
          status: { $in: ['pending', 'investigating'] }
        });

        if (!existingAlert) {
          alerts.push({
            type: 'multiple_accounts',
            riskLevel: userList.length >= 5 ? 'high' : 'medium',
            userId: userList[0]._id,
            description: `${userList.length} accounts detected with same phone number: ${phone}`,
            status: 'pending'
          });
        }
      }
    }

  } catch (error) {
    console.error('Error detecting multiple accounts:', error);
  }

  return alerts;
}

// Detect fake reviews
async function detectFakeReviews() {
  const alerts = [];
  const timeWindow = 30 * 60 * 1000; // 30 minutes

  try {
    const recentTime = new Date(Date.now() - timeWindow);
    const users = await User.find({ userType: { $ne: 'admin' } });

    for (const user of users) {
      const recentReviews = await Review.find({
        userId: user._id,
        createdAt: { $gte: recentTime }
      });

      // Check for too many reviews in short time
      if (recentReviews.length >= 5) {
        const existingAlert = await FraudAlert.findOne({
          userId: user._id,
          type: 'fake_review',
          status: { $in: ['pending', 'investigating'] }
        });

        if (!existingAlert) {
          alerts.push({
            type: 'fake_review',
            riskLevel: recentReviews.length >= 10 ? 'high' : 'medium',
            userId: user._id,
            description: `User posted ${recentReviews.length} reviews within 30 minutes`,
            status: 'pending'
          });
        }
      }

      // Check for all 5-star or all 1-star reviews
      const allReviews = await Review.find({ userId: user._id }).limit(20);
      if (allReviews.length >= 10) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        if (avgRating === 5 || avgRating === 1) {
          const existingAlert = await FraudAlert.findOne({
            userId: user._id,
            type: 'fake_review',
            description: { $regex: 'suspicious rating pattern' }
          });

          if (!existingAlert) {
            alerts.push({
              type: 'fake_review',
              riskLevel: 'medium',
              userId: user._id,
              description: `Suspicious rating pattern: All reviews are ${avgRating}-star (${allReviews.length} reviews)`,
              status: 'pending'
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Error detecting fake reviews:', error);
  }

  return alerts;
}

// Detect payment fraud
async function detectPaymentFraud() {
  const alerts = [];

  try {
    // Find failed payment orders
    const failedOrders = await Order.find({
      paymentStatus: 'failed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Group by user
    const failuresByUser = {};
    failedOrders.forEach(order => {
      const userId = order.userId?.toString();
      if (userId) {
        if (!failuresByUser[userId]) {
          failuresByUser[userId] = [];
        }
        failuresByUser[userId].push(order);
      }
    });

    // Check for multiple payment failures
    for (const [userId, orders] of Object.entries(failuresByUser)) {
      if (orders.length >= 3) {
        const existingAlert = await FraudAlert.findOne({
          userId,
          type: 'payment_fraud',
          status: { $in: ['pending', 'investigating'] }
        });

        if (!existingAlert) {
          const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
          alerts.push({
            type: 'payment_fraud',
            riskLevel: orders.length >= 5 ? 'high' : 'medium',
            userId,
            description: `${orders.length} failed payment attempts in 24 hours, possible stolen card`,
            amount: totalAmount,
            status: 'pending'
          });
        }
      }
    }

  } catch (error) {
    console.error('Error detecting payment fraud:', error);
  }

  return alerts;
}

// Main fraud detection function
async function runFraudDetection() {
  console.log('🔍 Running fraud detection...');
  
  const [
    suspiciousOrders,
    multipleAccounts,
    fakeReviews,
    paymentFraud
  ] = await Promise.all([
    detectSuspiciousOrders(),
    detectMultipleAccounts(),
    detectFakeReviews(),
    detectPaymentFraud()
  ]);

  const allAlerts = [
    ...suspiciousOrders,
    ...multipleAccounts,
    ...fakeReviews,
    ...paymentFraud
  ];

  if (allAlerts.length > 0) {
    await FraudAlert.insertMany(allAlerts);
    console.log(`✅ Created ${allAlerts.length} fraud alerts`);
  } else {
    console.log('✅ No suspicious activity detected');
  }

  return allAlerts;
}

module.exports = {
  runFraudDetection,
  detectSuspiciousOrders,
  detectMultipleAccounts,
  detectFakeReviews,
  detectPaymentFraud
};
