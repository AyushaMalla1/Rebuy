const express = require('express');
const router = express.Router();
const LoyaltyPoints = require('../models/LoyaltyPoints');

// Get customer loyalty points
router.get('/:customerId', async (req, res) => {
  try {
    let loyaltyAccount = await LoyaltyPoints.findOne({ customer: req.params.customerId });
    
    if (!loyaltyAccount) {
      // Create new account with welcome bonus
      loyaltyAccount = new LoyaltyPoints({
        customer: req.params.customerId,
        totalPoints: 500,
        pointsHistory: [{
          points: 500,
          type: 'earned',
          reason: 'Welcome bonus'
        }]
      });
      await loyaltyAccount.save();
    }
    
    res.json(loyaltyAccount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Redeem points
router.post('/:customerId/redeem', async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    const loyaltyAccount = await LoyaltyPoints.findOne({ customer: req.params.customerId });
    if (!loyaltyAccount) {
      return res.status(404).json({ message: 'Loyalty account not found' });
    }
    
    if (loyaltyAccount.totalPoints < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    
    loyaltyAccount.totalPoints -= points;
    loyaltyAccount.pointsHistory.push({
      points: -points,
      type: 'redeemed',
      reason: reason || 'Points redeemed'
    });
    
    loyaltyAccount.updateTier();
    await loyaltyAccount.save();
    
    res.json({ 
      message: 'Points redeemed successfully', 
      loyaltyAccount,
      discountAmount: points // 1 point = Rs. 1 discount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
