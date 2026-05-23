const express = require('express');
const router = express.Router();
const ConditionVerification = require('../models/ConditionVerification');

// Submit a condition verification (customer verifies product condition after delivery)
router.post('/', async (req, res) => {
  try {
    const { order, orderId, product, productName, customer, customerName, customerEmail, seller, sellerName, matchesDescription, rating, customerNotes } = req.body;

    if (!order || !orderId || !product || !customer || !matchesDescription || !rating) {
      return res.status(400).json({ success: false, message: 'Missing required fields: order, orderId, product, customer, matchesDescription, rating' });
    }

    // Check if already submitted for this order+product
    const existing = await ConditionVerification.findOne({ order, product });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Condition verification already submitted for this product in this order' });
    }

    const verification = new ConditionVerification({
      order, orderId, product, productName, customer, customerName, customerEmail,
      seller, sellerName, matchesDescription, rating,
      customerNotes: customerNotes || '',
      verified: true,
      approvalStatus: 'pending',
      isPublic: false
    });

    await verification.save();

    res.status(201).json({
      success: true,
      message: 'Condition verification submitted successfully',
      verification
    });
  } catch (error) {
    console.error('Submit condition verification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get verification by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const verifications = await ConditionVerification.find({
      product: req.params.productId,
      isPublic: true
    }).populate('customer', 'fullName').sort({ verifiedAt: -1 });

    res.json({ success: true, verifications });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get verification by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const verifications = await ConditionVerification.find({ order: req.params.orderId })
      .populate('product', 'name images').sort({ verifiedAt: -1 });

    res.json({ success: true, verifications });
  } catch (error) {
    console.error('Get order verifications error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all pending verifications (admin)
router.get('/admin/pending', async (req, res) => {
  try {
    const verifications = await ConditionVerification.find({ approvalStatus: 'pending' })
      .populate('product', 'name').populate('customer', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, verifications });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Approve or reject verification (admin)
router.patch('/:id/approve', async (req, res) => {
  try {
    const { approvalStatus, rejectionReason, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'approvalStatus must be approved or rejected' });
    }

    const verification = await ConditionVerification.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus,
        isPublic: approvalStatus === 'approved',
        rejectionReason: rejectionReason || '',
        adminNotes: adminNotes || '',
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification not found' });
    }

    res.json({ success: true, message: `Verification ${approvalStatus}`, verification });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
