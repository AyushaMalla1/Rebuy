const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const {
  initiateEsewaPayment,
  initiateKhaltiPayment,
  verifyEsewaPayment,
  verifyKhaltiPayment
} = require('../utils/paymentService');

// Initiate payment
router.post('/initiate', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const settings = await Settings.findOne();
    if (!settings || !settings.paymentGateway?.isEnabled) {
      return res.status(400).json({ success: false, message: 'Payment gateway not configured' });
    }
    
    const orderData = {
      orderId: order._id.toString(),
      amount: order.total,
      productName: order.items?.[0]?.productName || 'Order',
      customerEmail: order.customer?.email || 'customer@example.com'
    };
    
    let result;
    
    switch (settings.paymentGateway.provider) {
      case 'esewa':
        result = await initiateEsewaPayment(orderData, settings);
        break;
      case 'khalti':
        result = await initiateKhaltiPayment(orderData, settings);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid payment provider' });
    }
    
    if (result.success) {
      try {
        // Create payment record in database
        const payment = new Payment({
          order: order._id,
          customer: order.customer._id || order.customer,
          transactionId: result.transactionUuid || `PENDING_${Date.now()}`,
          transactionUuid: result.transactionUuid,
          paymentMethod: settings.paymentGateway.provider,
          amount: order.total,
          status: 'pending',
          initiatedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
        
        await payment.save();
        
        // Update order with payment reference
        order.paymentStatus = 'pending';
        order.paymentReference = payment._id;
        await order.save();
      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Continue even if payment record creation fails
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { orderId, ...params } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(400).json({ success: false, message: 'Settings not found' });
    }
    
    let result;
    
    switch (settings.paymentGateway.provider) {
      case 'esewa':
        result = await verifyEsewaPayment(params, settings);
        break;
      case 'khalti':
        result = await verifyKhaltiPayment(params.pidx, settings);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid payment provider' });
    }
    
    if (result.success) {
      order.paymentStatus = 'completed';
      order.paymentMethod = settings.paymentGateway.provider;
      order.transactionId = result.transactionId;
      order.status = 'Processing';
      await order.save();
    }
    
    res.json(result);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Payment success callback
router.get('/success', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-status?status=success`);
});

// Payment failure callback
router.get('/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-status?status=failed`);
});

// eSewa Success Callback
router.get('/esewa/success', async (req, res) => {
  try {
    const { data, order_id } = req.query;
    
    if (!data) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?message=No payment data received`);
    }

    // Verify payment
    const settings = await Settings.findOne();
    const result = await verifyEsewaPayment({ data }, settings);

    if (!result.success) {
      // Update payment record as failed
      await Payment.findOneAndUpdate(
        { order: order_id, status: 'pending' },
        { 
          status: 'failed',
          failedAt: new Date(),
          notes: result.message
        }
      );
      
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?message=${result.message}`);
    }

    // Update order
    const order = await Order.findById(order_id);
    if (order) {
      order.paymentStatus = 'Paid';
      order.status = 'Confirmed';
      order.paymentMethod = 'esewa';
      order.transactionId = result.transactionId;
      order.paymentDetails = {
        transactionCode: result.transactionId,
        transactionUuid: result.transactionUuid,
        completedAt: new Date()
      };
      await order.save();
      
      // Update or create payment record
      let payment = await Payment.findOne({ 
        order: order_id, 
        transactionUuid: result.transactionUuid 
      });
      
      if (payment) {
        payment.status = 'completed';
        payment.transactionId = result.transactionId;
        payment.completedAt = new Date();
        payment.paymentGatewayResponse = result;
      } else {
        // Create new payment record if not found
        payment = new Payment({
          order: order._id,
          customer: order.customer,
          transactionId: result.transactionId,
          transactionUuid: result.transactionUuid,
          paymentMethod: 'esewa',
          amount: order.total,
          status: 'completed',
          completedAt: new Date(),
          paymentGatewayResponse: result,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
      
      await payment.save();
    }

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?order_id=${order_id}&transaction_code=${result.transactionId}`);
  } catch (error) {
    console.error('eSewa success callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?message=Error processing payment`);
  }
});

// eSewa Failure Callback
router.get('/esewa/failure', async (req, res) => {
  try {
    const { order_id } = req.query;
    
    console.log('eSewa Payment Failed for order:', order_id);

    // Update order status
    if (order_id) {
      const order = await Order.findById(order_id);
      if (order) {
        order.paymentStatus = 'Failed';
        order.paymentDetails = {
          failedAt: new Date()
        };
        await order.save();
        
        // Update payment record
        await Payment.findOneAndUpdate(
          { order: order_id, status: 'pending' },
          { 
            status: 'failed',
            failedAt: new Date(),
            notes: 'Payment cancelled by user or payment gateway'
          }
        );
      }
    }

    // Redirect to failure page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?order_id=${order_id}&message=Payment cancelled or failed`);
  } catch (error) {
    console.error('eSewa failure callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?message=Error processing payment failure`);
  }
});

// eSewa Frontend Verification — called by PaymentSuccess page after eSewa redirects with ?data=
router.post('/esewa/verify-frontend', async (req, res) => {
  try {
    const { data, order_id } = req.body;

    if (!data) {
      return res.json({ success: false, message: 'No payment data received from eSewa' });
    }

    const settings = await Settings.findOne();
    const result = await verifyEsewaPayment({ data }, settings);

    if (!result.success) {
      if (order_id) {
        await Payment.findOneAndUpdate(
          { order: order_id, status: 'pending' },
          { status: 'failed', failedAt: new Date(), notes: result.message }
        );
        const failedOrder = await Order.findById(order_id);
        if (failedOrder) {
          failedOrder.paymentStatus = 'Failed';
          await failedOrder.save();
        }
      }
      return res.json({ success: false, message: result.message });
    }

    // Mark order as paid
    const order = await Order.findById(order_id);
    if (order) {
      order.paymentStatus = 'Paid';
      order.status = 'Confirmed';
      order.paymentMethod = 'esewa';
      order.transactionId = result.transactionId;
      order.paymentDetails = {
        transactionCode: result.transactionId,
        transactionUuid: result.transactionUuid,
        completedAt: new Date()
      };
      await order.save();

      let payment = await Payment.findOne({ order: order_id, transactionUuid: result.transactionUuid });
      if (payment) {
        payment.status = 'completed';
        payment.transactionId = result.transactionId;
        payment.completedAt = new Date();
        payment.paymentGatewayResponse = result;
      } else {
        payment = new Payment({
          order: order._id,
          customer: order.customer,
          transactionId: result.transactionId,
          transactionUuid: result.transactionUuid,
          paymentMethod: 'esewa',
          amount: order.total,
          status: 'completed',
          completedAt: new Date(),
          paymentGatewayResponse: result,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
      await payment.save();
    }

    return res.json({ success: true, transactionId: result.transactionId, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('eSewa frontend verification error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// Get all payments for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.params.customerId })
      .populate('order', 'orderDate total status')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment by transaction ID
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.transactionId })
      .populate('order')
      .populate('customer', 'fullName email');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('customer', 'fullName email');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const stats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const methodStats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      stats: {
        byStatus: stats,
        byMethod: methodStats
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Refund payment
router.post('/:paymentId/refund', async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;
    
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only refund completed payments' });
    }
    
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundAmount = refundAmount || payment.amount;
    payment.refundReason = refundReason;
    
    await payment.save();
    
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'Refunded',
      status: 'Cancelled'
    });
    
    res.json({ success: true, message: 'Payment refunded successfully', payment });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
