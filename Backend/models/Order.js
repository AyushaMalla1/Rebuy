const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },

  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productImage: String,
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sellerName: String,
    storeName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],

  // Shipping Information
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cod', 'esewa', 'khalti', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: String,

  // Order Totals
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },

  // Order Status
  status: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  trackingNumber: String,
  estimatedDelivery: Date,

  // Condition Verification (Post-Purchase)
  conditionVerification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    matchesDescription: {
      type: Boolean,
      default: null
    },
    customerNotes: String,
    images: [String]
  },

  // Timestamps for tracking
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,

  // Notes
  customerNotes: String,
  adminNotes: String

}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ customer: 1, orderDate: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
