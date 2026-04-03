const mongoose = require('mongoose');

// Generate a short human-readable order ID like "RB7K2A" (6 chars)
const generateShortOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excludes 0/O/1/I to avoid confusion
  let id = 'RB'; // "RB" prefix = Rebuy
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id; // e.g. "RB7K2A"
};

const orderSchema = new mongoose.Schema({
  // Short human-readable order ID shown to customers (e.g. RB7K2A)
  orderId: {
    type: String,
    unique: true,
    index: true
  },

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
    postalCode: String,
    state: String,
    district: String,
    municipality: String,
    landmark: String,
    label: String
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
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  paymentReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },

  // Order Totals
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  pointsRedeemed: {
    type: Number,
    default: 0
  },
  pointsDiscount: {
    type: Number,
    default: 0
  },
  platformCommissionRate: {
    type: Number,
    default: 5 // 5% commission
  },
  platformCommission: {
    type: Number,
    default: 0
  },
  sellerPayout: {
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
      type: String,
      enum: ['yes', 'no', 'partially', null],
      default: null
    },
    conditionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    customerFeedback: String,
    verificationImages: [String],
    disputeRaised: {
      type: Boolean,
      default: false
    },
    disputeReason: String,
    disputeEvidence: [String],
    disputeStatus: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: null
    },
    disputeResolution: String,
    resolvedAt: Date
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

// Auto-generate short orderId before saving new documents
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    let unique = false;
    let attempts = 0;
    while (!unique && attempts < 10) {
      const candidate = generateShortOrderId();
      const existing = await mongoose.model('Order').findOne({ orderId: candidate });
      if (!existing) {
        this.orderId = candidate;
        unique = true;
      }
      attempts++;
    }
  }
  next();
});

// Indexes for faster queries
orderSchema.index({ customer: 1, orderDate: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
