const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Rebuy'
  },
  siteEmail: {
    type: String
  },
  sitePhone: {
    type: String
  },
  currency: {
    type: String,
    default: 'NPR'
  },
  taxRate: {
    type: Number,
    default: 13
  },
  shippingFee: {
    type: Number,
    default: 100
  },
  freeShippingThreshold: {
    type: Number,
    default: 5000
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowSellerRegistration: {
    type: Boolean,
    default: true
  },
  requireProductApproval: {
    type: Boolean,
    default: true
  },
  minOrderAmount: {
    type: Number,
    default: 100
  },
  maxOrderAmount: {
    type: Number,
    default: 100000
  },
  commissionRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  returnWindow: {
    type: Number,
    default: 7,
    min: 0,
    max: 30
  },
  loyaltyPointsEnabled: {
    type: Boolean,
    default: true
  },
  pointsPerRupee: {
    type: Number,
    default: 1
  },
  paymentGateway: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'esewa', 'khalti', 'none'],
      default: 'none'
    },
    apiKey: {
      type: String
    },
    secretKey: {
      type: String
    },
    merchantId: {
      type: String
    },
    isEnabled: {
      type: Boolean,
      default: false
    },
    testMode: {
      type: Boolean,
      default: true
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
