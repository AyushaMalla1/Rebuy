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
    required: false  // Changed to false to handle cases where seller data is missing
  },
  sellerName: String,

  // Verification Details
  matchesDescription: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
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

  // Admin Approval System (NEW - prevents seller bias)
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'  // All verifications start as pending
  },
  isPublic: {
    type: Boolean,
    default: false  // Only public after admin approval
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // Admin who approved
  },
  approvedAt: Date,
  rejectionReason: String,

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
  disputeResolvedAt: Date,

  // Link to Return Request (if bad condition triggers return)
  linkedReturn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Return',
    default: null
  },
  returnCreated: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// Indexes for faster queries
conditionVerificationSchema.index({ product: 1, verifiedAt: -1 });
conditionVerificationSchema.index({ customer: 1 });
conditionVerificationSchema.index({ seller: 1 });
conditionVerificationSchema.index({ order: 1 });

module.exports = mongoose.model('ConditionVerification', conditionVerificationSchema);
