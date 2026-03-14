const mongoose = require('mongoose');

const loyaltyPointsSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsHistory: [{
    points: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired'],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  }
}, {
  timestamps: true
});

// Calculate tier based on total points
loyaltyPointsSchema.methods.updateTier = function() {
  if (this.totalPoints >= 5000) {
    this.tier = 'Platinum';
  } else if (this.totalPoints >= 3000) {
    this.tier = 'Gold';
  } else if (this.totalPoints >= 1000) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }
};

module.exports = mongoose.model('LoyaltyPoints', loyaltyPointsSchema);
