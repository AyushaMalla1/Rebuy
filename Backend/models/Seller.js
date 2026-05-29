const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password not required if using Google OAuth
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters']
  },
  phone: {
    type: String,
    required: function() {
      // Phone not required initially for Google OAuth users
      return !this.googleId;
    }
  },
  storeName: {
    type: String,
    required: function() {
      // Store name not required initially for Google OAuth users
      return !this.googleId;
    },
    trim: true
  },
  storeDescription: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: 'https://i.pravatar.cc/100'
  },
  address: {
    type: String,
    required: function() {
      // Address not required initially for Google OAuth users
      return !this.googleId;
    }
  },
  city: {
    type: String,
    required: function() {
      // City not required initially for Google OAuth users
      return !this.googleId;
    }
  },
  country: {
    type: String,
    default: 'Nepal'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  // Payout Information
  payoutDetails: {
    khaltiMobile: {
      type: String,
      default: ''
    },
    esewaId: {
      type: String,
      default: ''
    },
    bankAccount: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      branchName: String
    },
    preferredMethod: {
      type: String,
      enum: ['khalti', 'esewa', 'bank'],
      default: 'bank'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Earnings tracking
  earnings: {
    totalEarned: {
      type: Number,
      default: 0
    },
    pendingPayout: {
      type: Number,
      default: 0
    },
    completedPayouts: {
      type: Number,
      default: 0
    },
    lastPayoutDate: Date
  },
  // Trust Score System
  trustScore: {
    score: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    totalVerifications: {
      type: Number,
      default: 0,
      min: 0
    },
    positiveVerifications: {
      type: Number,
      default: 0,
      min: 0
    },
    partialVerifications: {
      type: Number,
      default: 0,
      min: 0
    },
    negativeVerifications: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Verification Rating (separate from trust score)
  totalVerifications: {
    type: Number,
    default: 0
  },
  badVerifications: {
    type: Number,
    default: 0
  },
  // Admin Approval Data
  approvalData: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    suspensionReason: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: ''
  },
  backupCodes: [{
    type: String
  }],
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    location: String
  }],
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordOTPExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
sellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
sellerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Seller', sellerSchema);
