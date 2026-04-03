const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['suspicious_order', 'multiple_accounts', 'payment_fraud', 'fake_review'],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number
  },
  ipAddress: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'blocked'],
    default: 'pending'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
