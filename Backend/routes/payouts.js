const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const { sendEmail } = require('../utils/emailService');

// Get seller's payout summary
router.get('/seller/:sellerId/summary', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get all completed orders for this seller
    const completedOrders = await Order.find({
      'items.seller': req.params.sellerId,
      status: 'Delivered',
      paymentStatus: 'Paid'
    });

    // Calculate pending payout (orders delivered but not paid out yet)
    let pendingAmount = 0;
    const pendingOrders = [];

    for (const order of completedOrders) {
      // Check if this order has been paid out
      const existingPayout = await Payout.findOne({
        orders: order._id,
        status: { $in: ['pending', 'processing', 'completed'] }
      });

      if (!existingPayout) {
        // Calculate seller's share for this order
        const sellerItems = order.items.filter(item => 
          item.seller.toString() === req.params.sellerId
        );
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
        const commission = Math.round((sellerSubtotal * (order.platformCommissionRate || 3)) / 100);
        const sellerPayout = sellerSubtotal - commission;

        pendingAmount += sellerPayout;
        pendingOrders.push({
          _id: order._id,
          orderId: order.orderId,
          amount: sellerPayout,
          commission: commission,
          orderDate: order.orderDate || order.createdAt,
          deliveredAt: order.deliveredAt
        });
      }
    }

    // Get payout history
    const payoutHistory = await Payout.find({ seller: req.params.sellerId }).sort({ createdAt: -1 }).limit(10);

    const completedPayoutsResult = await Payout.aggregate([
      { $match: { seller: seller._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const completedPayoutsAmount = completedPayoutsResult.length > 0 ? completedPayoutsResult[0].total : 0;
    const totalEarnedAmount = completedPayoutsAmount + pendingAmount;

    res.json({
      seller: {
        name: seller.fullName,
        storeName: seller.storeName,
        payoutMethod: seller.payoutDetails?.preferredMethod || 'bank',
        bankAccount: seller.payoutDetails?.bankAccount || null,
        khaltiMobile: seller.payoutDetails?.khaltiMobile || '',
        esewaId: seller.payoutDetails?.esewaId || ''
      },
      earnings: {
        totalEarned: totalEarnedAmount,
        pendingPayout: pendingAmount,
        completedPayouts: completedPayoutsAmount,
        lastPayoutDate: seller.earnings?.lastPayoutDate
      },
      pendingOrders,
      payoutHistory
    });

  } catch (error) {
    console.error('Get payout summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request payout (seller initiates)
router.post('/seller/:sellerId/request', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Check if payout details are set
    const hasPayoutDetails = seller.payoutDetails?.bankAccount?.accountNumber || 
                            seller.payoutDetails?.khaltiMobile || 
                            seller.payoutDetails?.esewaId;
    
    if (!hasPayoutDetails) {
      return res.status(400).json({ 
        message: 'Please add your payout details (bank account, Khalti, or eSewa) in settings first' 
      });
    }

    // Get unpaid orders
    const completedOrders = await Order.find({
      'items.seller': req.params.sellerId,
      status: 'Delivered',
      paymentStatus: 'Paid'
    });

    let totalAmount = 0;
    let totalCommission = 0;
    const orderIds = [];

    for (const order of completedOrders) {
      const existingPayout = await Payout.findOne({
        orders: order._id,
        status: { $in: ['completed', 'processing', 'pending'] }
      });

      if (!existingPayout) {
        const sellerItems = order.items.filter(item => 
          item.seller.toString() === req.params.sellerId
        );
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
        const commission = Math.round((sellerSubtotal * (order.platformCommissionRate || 3)) / 100);
        const sellerPayout = sellerSubtotal - commission;

        totalAmount += sellerPayout;
        totalCommission += commission;
        orderIds.push(order._id);
      }
    }

    if (totalAmount === 0) {
      return res.status(400).json({ message: 'No pending amount to payout' });
    }

    // Minimum payout amount check (Rs. 500)
    if (totalAmount < 500) {
      return res.status(400).json({ 
        message: `Minimum payout amount is Rs. 500. Your current balance is Rs. ${totalAmount}` 
      });
    }

    // Create payout request
    const payout = new Payout({
      seller: req.params.sellerId,
      sellerName: seller.fullName,
      amount: totalAmount,
      platformCommission: totalCommission,
      orders: orderIds,
      payoutMethod: seller.payoutDetails?.preferredMethod || 'bank',
      khaltiMobile: seller.payoutDetails?.khaltiMobile || '',
      esewaId: seller.payoutDetails?.esewaId || '',
      bankDetails: seller.payoutDetails?.bankAccount || {},
      status: 'pending'
    });

    await payout.save();

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@rebuy.com',
        subject: 'New Payout Request',
        html: `
          <h2>New Payout Request</h2>
          <p><strong>Seller:</strong> ${seller.fullName} (${seller.storeName})</p>
          <p><strong>Amount:</strong> Rs. ${totalAmount.toLocaleString()}</p>
          <p><strong>Orders:</strong> ${orderIds.length}</p>
          <p><strong>Method:</strong> ${payout.payoutMethod}</p>
          <p>Please process this payout in the admin dashboard.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send payout notification email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payout request submitted successfully. Admin will process it within 2-3 business days.',
      payout: {
        id: payout._id,
        amount: totalAmount,
        status: 'pending',
        ordersCount: orderIds.length
      }
    });

  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark payout as completed (admin manually transfers and marks)
router.post('/:payoutId/complete', async (req, res) => {
  try {
    const { transactionReference, adminNotes } = req.body;

    if (!transactionReference || !transactionReference.trim()) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const payout = await Payout.findById(req.params.payoutId).populate('seller');
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (payout.status === 'completed') {
      return res.status(400).json({ message: 'Payout already completed' });
    }

    // If payout method is eSewa, verify the transaction via eSewa status API
    if (payout.payoutMethod === 'esewa') {
      try {
        const axios = require('axios');
        const crypto = require('crypto');

        const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
        const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
        const statusUrl = process.env.ESEWA_STATUS_URL || 'https://rc.esewa.com.np/mobile/transaction';

        // eSewa transaction status check
        const verifyResponse = await axios.get(statusUrl, {
          params: {
            txnRefId: transactionReference,
            merchantCode: merchantId
          },
          headers: {
            'merchantId': merchantId,
            'merchantSecret': secretKey
          },
          timeout: 8000
        });

        const txnData = verifyResponse.data;

        // Check if transaction is valid and completed
        if (!txnData || txnData.TransactionState !== 'COMPLETE') {
          return res.status(400).json({
            message: `eSewa transaction verification failed. Status: ${txnData?.TransactionState || 'Unknown'}. Please check the transaction ID.`
          });
        }

        console.log(`eSewa transaction ${transactionReference} verified: COMPLETE`);
      } catch (esewaError) {
        // If eSewa API is unreachable (network issue), log and allow manual override
        console.warn('eSewa verification API unreachable, proceeding with manual entry:', esewaError.message);
        // Don't block — allow admin to proceed if eSewa API is down
      }
    }

    // Update payout as completed
    payout.status = 'completed';
    payout.khaltiTransactionId = transactionReference.trim();
    payout.completedAt = new Date();
    payout.adminNotes = adminNotes || '';
    await payout.save();

    // Update seller earnings
    const seller = await Seller.findById(payout.seller);
    if (seller) {
      seller.earnings = seller.earnings || {};
      seller.earnings.totalEarned = (seller.earnings.totalEarned || 0) + payout.amount;
      seller.earnings.completedPayouts = (seller.earnings.completedPayouts || 0) + payout.amount;
      seller.earnings.pendingPayout = Math.max(0, (seller.earnings.pendingPayout || 0) - payout.amount);
      seller.earnings.lastPayoutDate = new Date();
      await seller.save();

      // Send email notification to seller
      try {
        await sendEmail({
          to: seller.email,
          subject: 'Payout Completed - Rebuy',
          html: `
            <h2>Payout Completed!</h2>
            <p>Dear ${seller.fullName},</p>
            <p>Your payout request has been processed successfully.</p>
            <p><strong>Amount:</strong> Rs. ${payout.amount.toLocaleString()}</p>
            <p><strong>Transaction Reference:</strong> ${payout.khaltiTransactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${adminNotes ? `<p><strong>Note:</strong> ${adminNotes}</p>` : ''}
            <p>Thank you for selling on Rebuy!</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send payout completion email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Payout marked as completed',
      payout: {
        id: payout._id,
        amount: payout.amount,
        status: 'completed',
        transactionReference: payout.khaltiTransactionId
      }
    });

  } catch (error) {
    console.error('Complete payout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel payout request
router.post('/:payoutId/cancel', async (req, res) => {
  try {
    const { reason } = req.body;

    const payout = await Payout.findById(req.params.payoutId);
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel payout with status: ${payout.status}` });
    }

    payout.status = 'cancelled';
    payout.failureReason = reason || 'Cancelled by admin';
    await payout.save();

    res.json({
      success: true,
      message: 'Payout cancelled',
      payout: {
        id: payout._id,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Cancel payout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all payouts (admin)
router.get('/admin/all', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    
    const payouts = await Payout.find(query)
      .populate('seller', 'fullName storeName email phone payoutDetails')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payout.countDocuments(query);

    // Calculate summary stats
    const pendingTotal = await Payout.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const completedTotal = await Payout.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      payouts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      summary: {
        pendingAmount: pendingTotal[0]?.total || 0,
        completedAmount: completedTotal[0]?.total || 0,
        pendingCount: await Payout.countDocuments({ status: 'pending' }),
        completedCount: await Payout.countDocuments({ status: 'completed' })
      }
    });

  } catch (error) {
    console.error('Get all payouts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify eSewa transaction ID (admin can check before completing payout)
router.post('/verify-esewa-transaction', async (req, res) => {
  try {
    const { transactionReference } = req.body;

    if (!transactionReference || !transactionReference.trim()) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const axios = require('axios');
    const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    const statusUrl = process.env.ESEWA_STATUS_URL || 'https://rc.esewa.com.np/mobile/transaction';

    try {
      const verifyResponse = await axios.get(statusUrl, {
        params: {
          txnRefId: transactionReference.trim(),
          merchantCode: merchantId
        },
        headers: {
          'merchantId': merchantId,
          'merchantSecret': secretKey
        },
        timeout: 8000
      });

      const txnData = verifyResponse.data;
      const isComplete = txnData?.TransactionState === 'COMPLETE';

      return res.json({
        success: isComplete,
        transactionState: txnData?.TransactionState || 'UNKNOWN',
        amount: txnData?.totalAmount,
        message: isComplete
          ? 'Transaction verified successfully'
          : `Transaction status: ${txnData?.TransactionState || 'Unknown'}`
      });
    } catch (apiError) {
      return res.json({
        success: false,
        transactionState: 'API_UNAVAILABLE',
        message: 'eSewa verification API is currently unavailable. You can still proceed manually.'
      });
    }
  } catch (error) {
    console.error('Verify eSewa transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Trigger weekly payout generation manually (admin only - for testing)
router.post('/admin/trigger-weekly', async (req, res) => {
  try {
    const { triggerManualPayout } = require('../utils/weeklyPayoutScheduler');
    
    const result = await triggerManualPayout();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Weekly payout generation completed',
        payoutsCreated: result.payoutsCreated,
        totalAmount: result.totalAmount,
        summary: result.summary
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Weekly payout generation failed',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Trigger weekly payout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update seller payout details
router.put('/seller/:sellerId/details', async (req, res) => {
  try {
    const { khaltiMobile, esewaId, bankAccount, preferredMethod } = req.body;

    const seller = await Seller.findById(req.params.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Validate mobile numbers if provided
    if (khaltiMobile && !/^98\d{8}$/.test(khaltiMobile)) {
      return res.status(400).json({ 
        message: 'Invalid Khalti mobile number. Must be 10 digits starting with 98' 
      });
    }

    if (esewaId && !/^98\d{8}$/.test(esewaId)) {
      return res.status(400).json({ 
        message: 'Invalid eSewa ID. Must be 10 digits starting with 98' 
      });
    }

    // Update payout details
    seller.payoutDetails = seller.payoutDetails || {};
    
    if (khaltiMobile !== undefined) {
      seller.payoutDetails.khaltiMobile = khaltiMobile;
    }
    
    if (esewaId !== undefined) {
      seller.payoutDetails.esewaId = esewaId;
    }
    
    if (bankAccount) {
      seller.payoutDetails.bankAccount = bankAccount;
    }
    
    if (preferredMethod) {
      seller.payoutDetails.preferredMethod = preferredMethod;
    }

    await seller.save();

    res.json({
      success: true,
      message: 'Payout details updated successfully',
      payoutDetails: seller.payoutDetails
    });

  } catch (error) {
    console.error('Update payout details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
