const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail } = require('../utils/emailService');

// Get all returns for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { seller: req.params.sellerId };
    if (status && status !== 'All') {
      query.status = status;
    }

    const returns = await Return.find(query)
      .populate('customer', 'fullName email phone')
      .populate('product', 'name images price')
      .populate('orderId', 'orderId orderDate customerName customerEmail customerPhone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      returns
    });
  } catch (error) {
    console.error('Get seller returns error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get return statistics for seller
router.get('/seller/:sellerId/stats', async (req, res) => {
  try {
    const totalReturns = await Return.countDocuments({ seller: req.params.sellerId });
    const pendingReturns = await Return.countDocuments({ seller: req.params.sellerId, status: 'Pending' });
    const approvedReturns = await Return.countDocuments({ seller: req.params.sellerId, status: 'Approved' });
    const completedReturns = await Return.countDocuments({ seller: req.params.sellerId, status: { $in: ['Completed', 'Refunded'] } });

    const totalRefundAmount = await Return.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(req.params.sellerId), status: { $in: ['Approved', 'Completed', 'Refunded'] } } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalReturns,
        pendingReturns,
        approvedReturns,
        completedReturns,
        totalRefundAmount: totalRefundAmount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get return stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer creates a return request
router.post('/create', async (req, res) => {
  try {
    const { orderId, productId, reason, description, images } = req.body;

    console.log('Creating return request:', { orderId, productId, reason });

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('Order found:', order._id);

    // Find the product in the order items
    let orderItem = null;
    let sellerId = null;

    if (order.items && Array.isArray(order.items)) {
      console.log('Searching for product in order items:', {
        productIdToFind: productId,
        orderItemsCount: order.items.length,
        orderItems: order.items.map(item => ({
          itemProduct: item.product,
          itemProductType: typeof item.product,
          itemProductString: item.product?.toString(),
          productName: item.productName
        }))
      });
      
      orderItem = order.items.find(item => {
        const itemProductId = item.product?._id || item.product;
        const itemProductIdString = itemProductId?.toString();
        const productIdString = productId?.toString();
        
        console.log('Comparing:', {
          itemProductIdString,
          productIdString,
          match: itemProductIdString === productIdString
        });
        
        return itemProductIdString === productIdString;
      });
      
      if (orderItem) {
        sellerId = orderItem.seller;
        console.log('Found matching order item:', {
          productName: orderItem.productName,
          sellerId: sellerId
        });
      }
    }

    if (!orderItem) {
      console.error('Product not found in order items:', productId);
      return res.status(404).json({ success: false, message: 'Product not found in order' });
    }

    console.log('Order item found, creating return request');

    // Calculate refund amount
    const refundAmount = (orderItem.price || 0) * (orderItem.quantity || 1);

    // Create return request
    const returnRequest = new Return({
      orderId: order._id,
      customer: order.customer,
      seller: sellerId,
      product: productId,
      reason,
      description,
      images: images || [],
      refundAmount,
      status: 'Pending'
    });

    await returnRequest.save();
    console.log('Return request created:', returnRequest._id);

    // Send email to seller (optional - will fail silently if email service is down)
    try {
      await sendEmail({
        to: 'seller@example.com',
        subject: 'New Return Request',
        html: `
          <h2>New Return Request</h2>
          <p>A customer has requested a return for an order</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Amount:</strong> Rs. ${refundAmount}</p>
          <p>Please review and respond to this request in your dashboard.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send return notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      return: returnRequest
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all returns for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { customer: req.params.customerId };
    if (status && status !== 'All') {
      query.status = status;
    }

    const returns = await Return.find(query)
      .populate('product', 'name images price')
      .populate('orderId', 'orderId orderDate')
      .populate('seller', 'storeName fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      returns
    });
  } catch (error) {
    console.error('Get customer returns error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Seller responds to return request
router.patch('/:returnId/respond', async (req, res) => {
  try {
    const { status, sellerResponse } = req.body;

    const returnRequest = await Return.findById(req.params.returnId)
      .populate('customer', 'email fullName')
      .populate('product', 'name');

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    returnRequest.status = status;
    returnRequest.sellerResponse = sellerResponse;
    returnRequest.respondedAt = new Date();

    await returnRequest.save();

    // Send email to customer
    try {
      await sendEmail({
        to: returnRequest.customer.email,
        subject: `Return Request ${status}`,
        html: `
          <h2>Return Request Update</h2>
          <p>Dear ${returnRequest.customer.fullName},</p>
          <p>Your return request for <strong>${returnRequest.product.name}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
          ${sellerResponse ? `<p><strong>Seller's Response:</strong> ${sellerResponse}</p>` : ''}
          ${status === 'Approved' ? '<p>Please ship the item back to the seller. You will receive a refund once the item is received.</p>' : ''}
          <p>Thank you for shopping with us!</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send return response email:', emailError);
    }

    res.json({
      success: true,
      message: `Return request ${status.toLowerCase()}`,
      return: returnRequest
    });
  } catch (error) {
    console.error('Respond to return error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark return as completed and process refund
router.patch('/:returnId/complete', async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.returnId)
      .populate('customer', 'email fullName')
      .populate('product', 'name');

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    returnRequest.status = 'Refunded';
    returnRequest.completedAt = new Date();

    await returnRequest.save();

    // Send refund confirmation email
    try {
      await sendEmail({
        to: returnRequest.customer.email,
        subject: 'Refund Processed',
        html: `
          <h2>Refund Processed</h2>
          <p>Dear ${returnRequest.customer.fullName},</p>
          <p>Your refund of <strong>Rs. ${returnRequest.refundAmount}</strong> for ${returnRequest.product.name} has been processed.</p>
          <p>The amount will be credited to your original payment method within 5-7 business days.</p>
          <p>Thank you for your patience!</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send refund email:', emailError);
    }

    res.json({
      success: true,
      message: 'Return completed and refund processed',
      return: returnRequest
    });
  } catch (error) {
    console.error('Complete return error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
