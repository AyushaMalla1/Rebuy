const mongoose = require('mongoose');

const conditionVerificationSchema = new mongoose.Schema({
  // Order Reference
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderId: {
    type: String,
    required: true
  },

  // Product Reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  productImage: String,

  // Customer Reference
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: String,
  customerEmail: String,

  // Seller Reference
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: String,

  // Verification Details
  matchesDescription: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  customerNotes: {
    type: String,
    default: ''
  },
  verificationImages: [{
    type: String
  }],

  // Verification Status
  verified: {
    type: Boolean,
    default: true
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  },

  // Admin Review (for negative verifications)
  adminReviewed: {
    type: Boolean,
    default: false
  },
  adminNotes: String,
  adminReviewedAt: Date,
  adminReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Dispute Information (if doesn't match)
  disputeRaised: {
    type: Boolean,
    default: false
  },
  disputeStatus: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'rejected'],
    default: null
  },
  disputeResolution: String,
  disputeResolvedAt: Date

}, {
  timestamps: true
});

// Indexes for faster queries
conditionVerificationSchema.index({ product: 1, verifiedAt: -1 });
conditionVerificationSchema.index({ customer: 1 });
conditionVerificationSchema.index({ seller: 1 });
conditionVerificationSchema.index({ order: 1 });

module.exports = mongoose.model('ConditionVerification', conditionVerificationSchema);
