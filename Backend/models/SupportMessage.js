const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
    required: true
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['User', 'Seller', 'Admin']
    },
    name: String,
    email: String
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isInternal: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
supportMessageSchema.index({ ticket: 1, createdAt: 1 });
supportMessageSchema.index({ 'sender.userId': 1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
