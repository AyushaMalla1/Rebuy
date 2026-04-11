const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: ['user', 'product', 'order', 'seller', 'system', 'auth', 'payment'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  targetId: {
    type: String
  },
  targetModel: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
