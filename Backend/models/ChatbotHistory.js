const mongoose = require('mongoose');

const chatbotHistorySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['Customer', 'Seller', 'Admin', 'Guest'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  reply: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    enum: ['product_search', 'order_tracking', 'seller_insights', 'admin_analytics', 'general_chat'],
    default: 'general_chat'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatbotHistorySchema.index({ user_id: 1, timestamp: -1 });

// Auto-delete conversations older than 30 days (optional)
chatbotHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('ChatbotHistory', chatbotHistorySchema);
