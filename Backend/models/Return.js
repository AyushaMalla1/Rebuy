const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Defective/Damaged',
      'Wrong Item',
      'Not as Described',
      'Product does not match description',
      'Size Issue',
      'Changed Mind',
      'Quality Issue',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  // Link to verification system
  linkedVerification: {
    type: Boolean,
    default: false
  },
  verificationImages: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Refunded'],
    default: 'Pending'
  },
  refundAmount: {
    type: Number,
    required: true
  },
  refundMethod: {
    type: String,
    enum: ['Original Payment', 'Store Credit', 'Bank Transfer'],
    default: 'Original Payment'
  },
  sellerResponse: {
    type: String
  },
  adminNotes: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Return', returnSchema);
