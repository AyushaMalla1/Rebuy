const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'suspicious_review_pattern',
      'fake_positive_reviews',
      'unusual_order_pattern',
      'multiple_shipping_addresses',
      'high_cancellation_rate',
      'fake_stock',
      'suspiciously_low_price',
      'multiple_failed_payments',
      'high_value_cod_new_account'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  
  // User/Seller Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  userEmail: String,
  
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  sellerName: String,
  storeName: String,
  
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  
  // Alert Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  
  // Admin Actions
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  adminNotes: String,
  actionTaken: String, // e.g., "User blocked", "Seller suspended", "False positive"
  
  // Metadata
  detectedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
fraudAlertSchema.index({ status: 1, severity: 1 });
fraudAlertSchema.index({ type: 1 });
fraudAlertSchema.index({ userId: 1 });
fraudAlertSchema.index({ sellerId: 1 });
fraudAlertSchema.index({ detectedAt: -1 });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
