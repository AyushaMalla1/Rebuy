const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['refund', 'fake_product', 'dispute', 'scam', 'delivery', 'account', 'payment', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved', 'closed'],
    default: 'open'
  },
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'createdBy.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['User', 'Seller']
    },
    name: String,
    email: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastReplyAt: {
    type: Date,
    default: Date.now
  },
  lastReplyBy: {
    type: String,
    enum: ['user', 'admin']
  },
  unreadByUser: {
    type: Boolean,
    default: false
  },
  unreadByAdmin: {
    type: Boolean,
    default: true
  },
  tags: [String],
  internalNotes: String,
  closedAt: Date,
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Generate unique ticket number
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TKT-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Index for faster queries
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ 'createdBy.userId': 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
