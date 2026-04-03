const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sellerName: String,
  
  // Payout Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Related Orders
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Payment Method
  payoutMethod: {
    type: String,
    enum: ['khalti', 'bank', 'manual'],
    default: 'khalti'
  },
  
  // Khalti Details
  khaltiMobile: String,
  khaltiTransactionId: String,
  
  // Bank Details (backup)
  bankDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String,
    branchName: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  
  // Error handling
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  
  // Notes
  adminNotes: String,
  
  // Platform commission deducted
  platformCommission: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Indexes for faster queries
payoutSchema.index({ seller: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);
