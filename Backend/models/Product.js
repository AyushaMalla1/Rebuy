const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ["Men's Collection", "Women's Collection", "Kid's Collection", "Sportswear", "Vintage", "Accessories"]
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Slightly Used', 'Vintage']
  },
  size: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: 'Unbranded'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  storeName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  story: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  
  // Payment Options
  paymentOptions: [{
    type: String,
    enum: ['cod', 'online', 'esewa', 'khalti', 'card'],
    required: true
  }],
  
  // Discount Configuration
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  
  // Admin Approval Fields
  adminNotes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Validation: Ensure at least 1 and at most 4 payment options
productSchema.path('paymentOptions').validate(function(value) {
  return value && value.length >= 1 && value.length <= 4;
}, 'Product must have at least 1 and at most 4 payment options');

// Validation: Ensure discount dates are valid if discount is active
productSchema.path('discount.startDate').validate(function(value) {
  if (this.discount && this.discount.active && this.discount.endDate) {
    return !value || value < this.discount.endDate;
  }
  return true;
}, 'Discount start date must be before end date');

// Auto-generate SKU before saving if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    // Generate SKU format: [Category Prefix]-[4-digit random]-[Brand Letter]
    const categoryPrefixes = {
      "Men's Collection": 'ME',
      "Women's Collection": 'WO',
      "Kid's Collection": 'KI',
      "Sportswear": 'SP',
      "Vintage": 'VI',
      "Accessories": 'AC'
    };
    
    const categoryPrefix = categoryPrefixes[this.category] || 'GE';
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const brandLetter = this.brand ? this.brand.charAt(0).toUpperCase() : 'X';
    
    this.sku = `${categoryPrefix}-${randomNum}-${brandLetter}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
