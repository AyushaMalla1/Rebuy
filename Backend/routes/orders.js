const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const Seller = require('../models/Seller');
const { logAudit } = require('../utils/auditLogger');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentConfirmation, sendLowStockAlert, sendOutOfStockAlert } = require('../utils/emailService');

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      pointsRedeemed,
      pointsDiscount,
      total,
      customerNotes
    } = req.body;

    // Validate required fields
    if (!customerId || !customerName || !customerEmail || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required order information' });
    }
    
    // Support both old and new address formats
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    // Check for new format (state, district, municipality, landmark)
    const hasNewFormat = shippingAddress.state && shippingAddress.district && 
                         shippingAddress.municipality && shippingAddress.landmark;
    
    // Check for old format (address, city)
    const hasOldFormat = shippingAddress.address && shippingAddress.city;
    
    if (!hasNewFormat && !hasOldFormat) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Validate stock availability
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productName} not found` });
      }
      if (product.status !== 'Approved') {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // Payment status: only COD stays Pending at order time; online methods
    // remain Pending until the gateway callback confirms payment.
    let paymentStatus = 'Pending';

    // Calculate platform commission (3%) and seller payout
    const platformCommissionRate = 3; // 3%
    const platformCommission = Math.round((subtotal * platformCommissionRate) / 100);
    const sellerPayout = subtotal - platformCommission;

    // Create order
    const order = new Order({
      customer: customerId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      subtotal,
      shippingCost,
      pointsRedeemed: pointsRedeemed || 0,
      pointsDiscount: pointsDiscount || 0,
      platformCommissionRate,
      platformCommission,
      sellerPayout,
      total,
      customerNotes: customerNotes || '',
      trackingNumber: `TRK${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    await order.save();
    console.log('✅ Order created successfully:', order._id, 'Payment Method:', paymentMethod);

    // Update product stock ONLY for COD orders
    // For online payments (esewa, khalti), stock will be deducted after payment verification
    if (paymentMethod === 'cod') {
      for (let item of items) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { stock: -item.quantity, sold: item.quantity }
          },
          { new: true }
        );
        
        // Check if product needs stock alert
        if (updatedProduct) {
          const seller = await Seller.findById(updatedProduct.seller).select('email fullName storeName');
          
          if (seller) {
            // Out of stock alert
            if (updatedProduct.stock === 0) {
              sendOutOfStockAlert(seller, [updatedProduct.toObject()]).catch(err =>
                console.error('Failed to send out of stock alert:', err)
              );
            }
            // Low stock alert (less than 5)
            else if (updatedProduct.stock > 0 && updatedProduct.stock < 5) {
              sendLowStockAlert(seller, [updatedProduct.toObject()]).catch(err =>
                console.error('Failed to send low stock alert:', err)
              );
            }
          }
        }
      }
    }

    // Handle loyalty points
    let loyaltyAccount = await LoyaltyPoints.findOne({ customer: customerId });
    
    if (!loyaltyAccount) {
      loyaltyAccount = new LoyaltyPoints({
        customer: customerId,
        totalPoints: 0,
        pointsHistory: []
      });
    }

    // Redeem points if any
    if (pointsRedeemed && pointsRedeemed > 0) {
      loyaltyAccount.totalPoints -= pointsRedeemed;
      loyaltyAccount.pointsHistory.push({
        points: pointsRedeemed,
        type: 'redeemed',
        reason: `Redeemed for Order ${order.orderId || order._id}`,
        order: order._id
      });
    }

    // Award loyalty points (1 point per Rs. 100 spent on final total)
    const pointsEarned = Math.floor(total / 100);
    if (pointsEarned > 0) {
      loyaltyAccount.totalPoints += pointsEarned;
      loyaltyAccount.pointsHistory.push({
        points: pointsEarned,
        type: 'earned',
        reason: `Purchase - Order ${order.orderId || order._id}`,
        order: order._id
      });
    }
    
    loyaltyAccount.updateTier();
    await loyaltyAccount.save();

    // Log audit
    await logAudit({
      action: 'Order Placed',
      actionType: 'order',
      performedBy: customerId,
      targetId: order._id,
      targetModel: 'Order',
      description: `New order ${order.trackingNumber || order._id} placed`,
      ipAddress: req.ip,
      metadata: { total, paymentMethod }
    }).catch(console.error);

    // Send order confirmation email only for COD orders
    // For online payments (esewa, khalti), email will be sent after payment verification
    if (paymentMethod === 'cod') {
      sendOrderConfirmation(order).catch(err => 
        console.error('Failed to send order confirmation email:', err)
      );
    }

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order,
      pointsEarned
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer orders
router.get('/customer/:customerId', async (req, res) => {
  try {
    const orders = await Order.find({ 
      customer: req.params.customerId,
      // Only exclude cancelled orders with failed payments
      $or: [
        { status: { $ne: 'Cancelled' } },
        { status: 'Cancelled', paymentStatus: { $nin: ['Failed'] } }
      ]
    })
      .sort({ orderDate: -1 })
      .populate('items.product', 'name images');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name images description')
      .populate('customer', 'fullName email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    
    // Update timestamps based on status
    if (status === 'Confirmed') order.confirmedAt = Date.now();
    if (status === 'Shipped') order.shippedAt = Date.now();
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      
      // For COD orders, mark payment as completed when delivered
      if (order.paymentMethod === 'cod' && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Paid';
      }
    }
    if (status === 'Cancelled') order.cancelledAt = Date.now();
    
    await order.save();
    
    // Log audit
    await logAudit({
      action: 'Order Status Updated',
      actionType: 'order',
      performedBy: req.query.sellerId || req.body.sellerId || req.user?.id || order.customer,
      targetId: order._id,
      targetModel: 'Order',
      description: `Order status changed to ${status}`,
      ipAddress: req.ip
    }).catch(console.error);

    // Send status update email
    sendOrderStatusUpdate(order, status).catch(err =>
      console.error('Failed to send status update email:', err)
    );

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post-purchase condition verification
router.post('/:orderId/verify-condition', async (req, res) => {
  try {
    const { matchesDescription, customerNotes, images, rating } = req.body;
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'fullName email')
      .populate('items.product', 'name images')
      .populate('items.seller', 'fullName email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only verify delivered orders' });
    }
    
    // Check if already verified
    if (order.conditionVerification && order.conditionVerification.verified) {
      return res.status(400).json({ message: 'Order already verified' });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating is required (1-5 stars)' });
    }
    
    // Validate images - MINIMUM 2, MAXIMUM 5
    if (!images || images.length < 2) {
      return res.status(400).json({ message: 'At least 2 product images are required for verification' });
    }
    
    if (images.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed' });
    }
    
    // Validate notes - REQUIRED
    if (!customerNotes || customerNotes.trim() === '') {
      return res.status(400).json({ message: 'Notes about product condition are required' });
    }
    
    // Convert boolean to string if needed for backward compatibility
    let matchesDescriptionValue = matchesDescription;
    if (typeof matchesDescription === 'boolean') {
      matchesDescriptionValue = matchesDescription ? 'yes' : 'no';
    }
    
    // Update order with verification status
    order.conditionVerification = {
      verified: true,
      verifiedAt: Date.now(),
      matchesDescription: matchesDescriptionValue,
      customerFeedback: customerNotes,
      verificationImages: images || []
    };
    
    await order.save();
    
    // Create ConditionVerification documents for each product in the order
    const ConditionVerification = require('../models/ConditionVerification');
    
    for (const item of order.items) {
      // Get product and seller IDs - handle both populated and non-populated cases
      const productId = item.product?._id || item.product;
      const sellerId = item.seller?._id || item.seller;
      
      // Log for debugging
      console.log('Processing verification for item:', {
        productId,
        sellerId,
        productName: item.productName,
        sellerName: item.sellerName
      });
      
      // Skip only if product is completely missing
      if (!productId) {
        console.log('Skipping item - missing product ID');
        continue;
      }

      const sellerName = item.sellerName || (item.seller?.fullName) || 'Unknown Seller';
      const productName = item.productName || (item.product?.name) || 'Unknown Product';
      const productImage = item.productImage || (item.product?.images?.[0]) || '';
      
      try {
        const verification = await ConditionVerification.create({
          order: order._id,
          orderId: order.orderId,
          product: productId,
          productName: productName,
          productImage: productImage,
          customer: order.customer._id || order.customer,
          customerName: (order.customer && order.customer.fullName) || order.customerName || 'Unknown Customer',
          customerEmail: (order.customer && order.customer.email) || order.customerEmail || '',
          seller: sellerId || null,
          sellerName: sellerName,
          matchesDescription: matchesDescriptionValue,
          rating: rating,
          customerNotes: customerNotes || '',
          verificationImages: images || [],
          disputeRaised: matchesDescriptionValue === 'no',
          // Admin approval system - prevents seller bias
          approvalStatus: 'pending',  // Starts as pending
          isPublic: false  // Not public until admin approves
        });
        
        console.log('✅ Condition verification created (pending admin approval) for product:', productName, 'ID:', verification._id);
      } catch (createError) {
        console.error('❌ Failed to create verification for product:', productName, 'Error:', createError.message);
        // Continue with other items even if one fails
      }
    }
    
    // Award bonus points for positive verification
    let bonusPoints = 0;
    if (matchesDescriptionValue === 'yes') {
      const loyaltyAccount = await LoyaltyPoints.findOne({ customer: order.customer._id || order.customer });
      if (loyaltyAccount) {
        bonusPoints = 50;
        loyaltyAccount.totalPoints += bonusPoints;
        loyaltyAccount.pointsHistory.push({
          points: bonusPoints,
          type: 'earned',
          reason: 'Condition verification bonus',
          date: Date.now(),
          order: order._id
        });
        loyaltyAccount.updateTier();
        await loyaltyAccount.save();
      }
    }
    
    // AUTO-CREATE RETURN REQUEST if condition is BAD
    let returnRequestId = null;
    const createdVerifications = [];
    
    if (matchesDescriptionValue === 'no') {
      try {
        const Return = require('../models/Return');
        
        // Create return request for each item in the order
        for (const item of order.items) {
          const productId = item.product?._id || item.product;
          const sellerId = item.seller?._id || item.seller;
          
          if (!productId || !sellerId) continue;
          
          const returnRequest = await Return.create({
            orderId: order._id,
            customer: order.customer._id || order.customer,
            product: productId,
            seller: sellerId,
            reason: 'Product does not match description',
            description: customerNotes || 'Customer reported product condition issue during verification',
            images: images || [],
            refundAmount: item.price * item.quantity,
            status: 'Pending',
            requestedAt: Date.now(),
            linkedVerification: true, // Flag to indicate this return is linked to verification
            verificationImages: images || []
          });
          
          returnRequestId = returnRequest._id;
          
          // Find the verification for this product and link it
          const ConditionVerification = require('../models/ConditionVerification');
          const verification = await ConditionVerification.findOne({
            order: order._id,
            product: productId
          }).sort({ createdAt: -1 });
          
          if (verification) {
            verification.linkedReturn = returnRequest._id;
            verification.returnCreated = true;
            await verification.save();
            createdVerifications.push(verification);
          }
          
          console.log('✅ Auto-created return request for bad condition:', returnRequest._id);
        }
      } catch (returnError) {
        console.error('❌ Failed to auto-create return request:', returnError.message);
        // Continue even if return creation fails
      }
    }
    
    // UPDATE SELLER RATING based on verification
    if (matchesDescriptionValue === 'no') {
      try {
        // Get unique sellers and update their ratings
        const sellers = [...new Set(order.items
          .filter(item => item.seller)
          .map(item => (item.seller._id || item.seller).toString())
          .filter(Boolean))];
        
        for (const sellerId of sellers) {
          const seller = await Seller.findById(sellerId);
          if (seller) {
            // Decrease seller rating for bad verification
            // Initialize rating if not exists
            if (!seller.rating) seller.rating = 5.0;
            if (!seller.totalVerifications) seller.totalVerifications = 0;
            if (!seller.badVerifications) seller.badVerifications = 0;
            
            seller.badVerifications += 1;
            seller.totalVerifications += 1;
            
            // Calculate new rating (weighted average)
            // Bad verification reduces rating by 0.5 points
            const goodVerifications = seller.totalVerifications - seller.badVerifications;
            seller.rating = ((goodVerifications * 5.0) + (seller.badVerifications * 2.0)) / seller.totalVerifications;
            
            // Ensure rating stays between 1.0 and 5.0
            seller.rating = Math.max(1.0, Math.min(5.0, seller.rating));
            
            await seller.save();
            console.log(`✅ Updated seller ${seller.fullName} rating to ${seller.rating.toFixed(2)} (${seller.badVerifications}/${seller.totalVerifications} bad)`);
          }
        }
      } catch (ratingError) {
        console.error('❌ Failed to update seller rating:', ratingError.message);
        // Continue even if rating update fails
      }
    } else if (matchesDescriptionValue === 'yes') {
      try {
        // Increase seller rating for good verification
        const sellers = [...new Set(order.items
          .filter(item => item.seller)
          .map(item => (item.seller._id || item.seller).toString())
          .filter(Boolean))];
        
        for (const sellerId of sellers) {
          const seller = await Seller.findById(sellerId);
          if (seller) {
            // Initialize rating if not exists
            if (!seller.rating) seller.rating = 5.0;
            if (!seller.totalVerifications) seller.totalVerifications = 0;
            if (!seller.badVerifications) seller.badVerifications = 0;
            
            seller.totalVerifications += 1;
            
            // Calculate new rating
            const goodVerifications = seller.totalVerifications - seller.badVerifications;
            seller.rating = ((goodVerifications * 5.0) + (seller.badVerifications * 2.0)) / seller.totalVerifications;
            
            seller.rating = Math.max(1.0, Math.min(5.0, seller.rating));
            
            await seller.save();
            console.log(`✅ Updated seller ${seller.fullName} rating to ${seller.rating.toFixed(2)} (${seller.badVerifications}/${seller.totalVerifications} bad)`);
          }
        }
      } catch (ratingError) {
        console.error('❌ Failed to update seller rating:', ratingError.message);
      }
    }
    
    // Send notifications to seller and admin
    const Notification = require('../models/Notification');
    
    // Get unique sellers from order items
    const sellers = [...new Set(order.items
      .filter(item => item.seller)
      .map(item => (item.seller._id || item.seller).toString())
      .filter(Boolean))];
    
    // Notification message
    const verificationStatus = matchesDescriptionValue === 'yes' ? 'matches the description' : 'does not match the description';
    const notificationTitle = matchesDescriptionValue === 'yes' 
      ? 'Positive Condition Verification' 
      : 'Condition Verification Issue';
    
    // Notify each seller (use sellerId field for sellers)
    for (const sellerId of sellers) {
      try {
        await Notification.create({
          sellerId: sellerId,  // Use sellerId for seller notifications
          type: 'order',
          title: notificationTitle,
          message: `Customer verified condition for Order ${order.orderId}: Product ${verificationStatus}`,
          severity: matchesDescriptionValue === 'yes' ? 'info' : 'warning',
          relatedOrder: order._id,
          metadata: {
            orderId: order.orderId,
            matchesDescription: matchesDescriptionValue,
            customerNotes: customerNotes
          }
        });
      } catch (notifError) {
        console.error('Error creating seller notification:', notifError);
      }
    }
    
    // Notify admin (find admin user)
    try {
      const User = require('../models/User');
      const admin = await User.findOne({ userType: 'admin' });
      if (admin) {
        await Notification.create({
          recipient: admin._id,
          recipientModel: 'User',
          type: 'order',
          title: notificationTitle,
          message: `Condition verification received for Order ${order.orderId}: ${verificationStatus}`,
          severity: matchesDescriptionValue === 'yes' ? 'info' : 'warning',
          relatedOrder: order._id,
          metadata: {
            orderId: order.orderId,
            customerId: order.customer._id || order.customer,
            customerName: (order.customer && order.customer.fullName) || order.customerName,
            matchesDescription: matchesDescriptionValue,
            customerNotes: customerNotes,
            hasImages: images && images.length > 0
          }
        });
      }
    } catch (adminNotifError) {
      console.error('Error creating admin notification:', adminNotifError);
    }
    
    res.json({ 
      message: 'Condition verification submitted successfully', 
      order,
      bonusPoints
    });
  } catch (error) {
    console.error('Condition verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'Processing' && order.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }
    
    order.status = 'Cancelled';
    order.cancelledAt = Date.now();
    await order.save();
    
    // Restore product stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }
    
    // Log audit
    await logAudit({
      action: 'Order Cancelled',
      actionType: 'order',
      performedBy: req.user?.id || order.customer,
      targetId: order._id,
      targetModel: 'Order',
      description: `Order cancelled`,
      ipAddress: req.ip
    }).catch(console.error);

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders for a specific seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // Find all orders that contain products from this seller
    const orders = await Order.find({
      'items.seller': sellerId
    })
    .populate('customer', 'fullName email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      orders: orders || [] 
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get condition verifications for a specific product (ONLY APPROVED/PUBLIC)
router.get('/product/:productId/verifications', async (req, res) => {
  try {
    const { productId } = req.params;
    const ConditionVerification = require('../models/ConditionVerification');
    
    // Find ONLY approved and public verifications for this product
    const verifications = await ConditionVerification.find({
      product: productId,
      approvalStatus: 'approved',  // Only approved by admin
      isPublic: true  // Only public verifications
    })
    .populate('customer', 'fullName')
    .sort({ verifiedAt: -1 });
    
    res.json({ 
      success: true, 
      verifications: verifications.map(v => ({
        _id: v._id,
        orderId: v.orderId,
        customerName: v.customerName,
        verifiedAt: v.verifiedAt,
        matchesDescription: v.matchesDescription,
        customerFeedback: v.customerNotes,
        verificationImages: v.verificationImages || [],
        approvedAt: v.approvedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching product verifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
