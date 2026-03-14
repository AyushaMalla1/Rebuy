const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const LoyaltyPoints = require('../models/LoyaltyPoints');

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
      total,
      customerNotes
    } = req.body;

    // Validate required fields
    if (!customerId || !customerName || !customerEmail || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required order information' });
    }
    
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
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

    // Determine payment status based on method
    let paymentStatus = 'Pending';
    if (paymentMethod === 'esewa' || paymentMethod === 'khalti' || paymentMethod === 'card') {
      paymentStatus = 'Paid';
    }

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
      total,
      customerNotes: customerNotes || '',
      trackingNumber: `TRK${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Award loyalty points (1 point per Rs. 100 spent)
    const pointsEarned = Math.floor(total / 100);
    let loyaltyAccount = await LoyaltyPoints.findOne({ customer: customerId });
    
    if (!loyaltyAccount) {
      loyaltyAccount = new LoyaltyPoints({
        customer: customerId,
        totalPoints: pointsEarned,
        pointsHistory: [{
          points: pointsEarned,
          type: 'earned',
          reason: `Purchase - Order ${order._id}`,
          order: order._id
        }]
      });
    } else {
      loyaltyAccount.totalPoints += pointsEarned;
      loyaltyAccount.pointsHistory.push({
        points: pointsEarned,
        type: 'earned',
        reason: `Purchase - Order ${order._id}`,
        order: order._id
      });
    }
    
    loyaltyAccount.updateTier();
    await loyaltyAccount.save();

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
    const orders = await Order.find({ customer: req.params.customerId })
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
    if (status === 'Delivered') order.deliveredAt = Date.now();
    if (status === 'Cancelled') order.cancelledAt = Date.now();
    
    await order.save();
    
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post-purchase condition verification
router.post('/:orderId/verify-condition', async (req, res) => {
  try {
    const { matchesDescription, customerNotes, images } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only verify delivered orders' });
    }
    
    order.conditionVerification = {
      verified: true,
      verifiedAt: Date.now(),
      matchesDescription,
      customerNotes,
      images: images || []
    };
    
    await order.save();
    
    // Award bonus points for verification
    if (matchesDescription) {
      const loyaltyAccount = await LoyaltyPoints.findOne({ customer: order.customer });
      if (loyaltyAccount) {
        loyaltyAccount.totalPoints += 50; // Bonus points for positive verification
        loyaltyAccount.pointsHistory.push({
          points: 50,
          type: 'earned',
          reason: 'Condition verification bonus',
          order: order._id
        });
        loyaltyAccount.updateTier();
        await loyaltyAccount.save();
      }
    }
    
    res.json({ 
      message: 'Condition verification submitted', 
      order,
      bonusPoints: matchesDescription ? 50 : 0
    });
  } catch (error) {
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
    
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
